import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PLANS, PLAN_ORDER } from '../lib/plans';
import type { PlanId } from '../lib/plans';
import { usePlanLimits } from '../hooks/usePlanLimits';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY = 'rzp_live_SKtIYRDuyTruqa';

// Price mapping in INR (₹)
const PLAN_PRICES: Record<PlanId, number> = {
  free: 0,
  test: 2,          // ₹2 for testing
  day: 450,         // ~$5 USD
  weekly: 1710,     // ~$19 USD
  pro: 3150,        // ~$35 USD
  pro_plus: 35910,  // ~$399 USD
};

// Calculate plan end date based on plan type
function calculatePlanEndDate(planId: PlanId): Date {
  const now = new Date();
  if (planId === 'test') return new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour
  if (planId === 'day') return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
  if (planId === 'weekly') return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  if (planId === 'pro') { const d = new Date(now); d.setMonth(d.getMonth() + 1); return d; } // 1 month
  if (planId === 'pro_plus') { const d = new Date(now); d.setFullYear(d.getFullYear() + 1); return d; } // 1 year
  return now;
}

function getBillingCycle(planId: PlanId): string {
  if (planId === 'test') return 'hourly';
  if (planId === 'day') return 'daily';
  if (planId === 'weekly') return 'weekly';
  if (planId === 'pro') return 'monthly';
  if (planId === 'pro_plus') return 'annually';
  return 'monthly';
}

interface PaymentSuccessInfo {
  planName: string;
  planId: PlanId;
  amount: string;
  paymentId: string;
  startDate: Date;
  endDate: Date;
}

export default function BillingPage() {
  const { user } = useAuth();
  const [billingEmail, setBillingEmail] = useState('');
  const [, setNextBillingDate] = useState<string | null>(null);
  const [planStartDate, setPlanStartDate] = useState<string | null>(null);
  const [planEndDate, setPlanEndDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState<PlanId | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentSuccessInfo | null>(null);
  const { planState, updatePlan, usage, getRemaining, loaded } = usePlanLimits();

  useEffect(() => {
    if (user) loadBilling();
  }, [user]);

  const loadBilling = async () => {
    const { data } = await supabase
      .from('billing')
      .select('*')
      .eq('user_id', user!.id)
      .single();
    if (data) {
      setBillingEmail(data.billing_email || '');
      setNextBillingDate(data.next_billing_date || null);
      
      // Use plan_start_date if available (after payment), otherwise fall back to trial_start_date or created_at
      setPlanStartDate(data.plan_start_date || data.trial_start_date || data.created_at || null);
      
      // Use plan_end_date if available (after payment), otherwise calculate based on plan type
      if (data.plan_end_date) {
        setPlanEndDate(data.plan_end_date);
      } else if (data.trial_end_date) {
        setPlanEndDate(data.trial_end_date);
      } else if (data.plan === 'free' && data.trial_start_date) {
        // For free plan, end date is trial_start + 2 days
        const end = new Date(new Date(data.trial_start_date).getTime() + 2 * 24 * 60 * 60 * 1000);
        setPlanEndDate(end.toISOString());
      } else {
        setPlanEndDate(null);
      }
    }
    setLoading(false);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSelectPlan = async (planId: PlanId) => {
    if (planId === planState.plan) return;
    setUpgradeLoading(planId);

    if (planId !== 'free') {
      const plan = PLANS[planId];
      const amount = PLAN_PRICES[planId] * 100; // Convert to paise

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load payment gateway. Please try again.');
        setUpgradeLoading(null);
        return;
      }

      const options = {
        key: RAZORPAY_KEY,
        amount: amount,
        currency: 'INR',
        name: 'HelplyAI',
        description: `${plan.name} Plan`,
        image: 'https://helplyai.co/logo.png',
        notes: {
          user_id: user!.id,
          plan: planId,
        },
        handler: async function (response: any) {
          // Payment successful - record in database
          const startDate = new Date();
          const endDate = calculatePlanEndDate(planId);
          const razorpayPaymentId = response.razorpay_payment_id || null;
          const razorpayOrderId = response.razorpay_order_id || null;
          const razorpaySignature = response.razorpay_signature || null;
          
          try {
            // Try RPC first
            const { error: rpcError } = await supabase.rpc('record_payment', {
              p_user_id: user!.id,
              p_plan: planId,
              p_amount: amount,
              p_currency: 'INR',
              p_razorpay_payment_id: razorpayPaymentId,
              p_razorpay_order_id: razorpayOrderId,
              p_razorpay_signature: razorpaySignature,
              p_payment_method: null,
              p_metadata: response || {}
            });
            
            if (rpcError) {
              console.warn('RPC record_payment failed, falling back to direct updates:', rpcError);
              
              // Fallback: directly insert into payments table
              const { error: paymentInsertError } = await supabase.from('payments').insert({
                user_id: user!.id,
                plan: planId,
                plan_name: plan.name,
                amount: amount,
                currency: 'INR',
                amount_display: '₹' + (amount / 100),
                razorpay_payment_id: razorpayPaymentId,
                razorpay_order_id: razorpayOrderId,
                razorpay_signature: razorpaySignature,
                status: 'success',
                period_start: startDate.toISOString(),
                period_end: endDate.toISOString(),
                metadata: response || {},
              });
              if (paymentInsertError) console.error('Payment insert error:', paymentInsertError);
              
              // Fallback: directly update billing table
              const { error: billingUpdateError } = await supabase.from('billing').update({
                plan: planId,
                billing_cycle: getBillingCycle(planId),
                next_billing_date: endDate.toISOString(),
                plan_start_date: startDate.toISOString(),
                plan_end_date: endDate.toISOString(),
                trial_end_date: endDate.toISOString(),
                razorpay_payment_id: razorpayPaymentId,
                razorpay_order_id: razorpayOrderId,
                last_payment_amount: amount,
                last_payment_currency: 'INR',
                last_payment_status: 'success',
                last_payment_date: startDate.toISOString(),
                updated_at: startDate.toISOString(),
              }).eq('user_id', user!.id);
              if (billingUpdateError) console.error('Billing update error:', billingUpdateError);
            }
            
            // Show success popup
            setPaymentSuccess({
              planName: plan.name,
              planId: planId,
              amount: '₹' + (amount / 100),
              paymentId: razorpayPaymentId || 'N/A',
              startDate: startDate,
              endDate: endDate,
            });
            
            // Refresh billing data
            await loadBilling();
            
          } catch (err) {
            console.error('Payment recording error:', err);
            // Even if recording fails, still show success since Razorpay confirmed payment
            setPaymentSuccess({
              planName: plan.name,
              planId: planId,
              amount: '₹' + (amount / 100),
              paymentId: razorpayPaymentId || 'N/A',
              startDate: startDate,
              endDate: endDate,
            });
          }
          setUpgradeLoading(null);
        },
        prefill: {
          email: user?.email || '',
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: function() {
            setUpgradeLoading(null);
          },
          confirm_close: true
        }
      };

      const razorpay = new window.Razorpay(options);
      
      // Handle payment failures
      razorpay.on('payment.failed', async function (response: any) {
        console.error('Payment failed:', response.error);
        
        // Record failed payment in database
        try {
          await supabase.rpc('record_failed_payment', {
            p_user_id: user!.id,
            p_plan: planId,
            p_amount: amount,
            p_currency: 'INR',
            p_razorpay_payment_id: response.error?.metadata?.payment_id || null,
            p_failure_reason: response.error?.description || 'Payment failed',
            p_failure_code: response.error?.code || null,
            p_metadata: response.error || {}
          });
        } catch (err) {
          console.error('Failed to record payment failure:', err);
        }
        
        alert(`Payment failed: ${response.error?.description || 'Unknown error'}. Please try again.`);
        setUpgradeLoading(null);
      });
      
      razorpay.open();
    } else {
      // Free plan - no payment needed
      const result = await updatePlan(planId);
      if (!result.success) {
        alert(result.error || 'Failed to update plan');
      }
      await loadBilling();
      setUpgradeLoading(null);
    }
  };

  if (loading || !loaded) return <div style={{ color: '#000000', padding: 40 }}>Loading...</div>;

  // Trial info
  const daysLeft = (() => {
    if (planState.plan !== 'free' || !planState.trialStart) return 0;
    const start = new Date(planState.trialStart);
    const end = new Date(start.getTime() + 2 * 24 * 60 * 60 * 1000);
    const diff = end.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  return (
    <div style={{ maxWidth: '100%' }}>
      <h1 style={{ color: '#000000', fontSize: 24, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Billing & Plans</h1>
      <p style={{ color: '#000000', fontSize: 14, margin: '0 0 24px' }}>Choose the plan that works best for you</p>

      {/* Current Plan Status */}
      <div style={{
        marginBottom: 24, padding: 28, borderRadius: 12,
        background: planState.isExpired ? '#fee2e2' : '#eff6ff',
        border: planState.isExpired ? '1px solid #fca5a5' : '1px solid #93c5fd',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#000000', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Current Plan</div>
            <div style={{ color: '#000000', fontSize: 20, fontWeight: 700, marginTop: 4 }}>
              {PLANS[planState.plan]?.name || 'Free'}
              {planState.plan === 'free' && !planState.isExpired && (
                <span style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', marginLeft: 8 }}>
                  {daysLeft} day{daysLeft !== 1 ? 's' : ''} left in trial
                </span>
              )}
              {planState.isExpired && (
                <span style={{ fontSize: 12, fontWeight: 600, color: '#dc2626', marginLeft: 8 }}>
                  Trial expired — upgrade to continue
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            {planStartDate && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#000000', fontSize: 12 }}>Start Date</div>
                <div style={{ color: '#000000', fontSize: 13, marginTop: 2, fontWeight: 500 }}>
                  {new Date(planStartDate).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>
              </div>
            )}
            {planEndDate && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#000000', fontSize: 12 }}>
                  {planState.plan === 'free' ? 'Trial Ends' : planState.plan === 'test' ? 'Pass Expires' : planState.plan === 'day' ? 'Pass Expires' : 'Plan Expires'}
                </div>
                <div style={{ color: planState.isExpired ? '#dc2626' : '#000000', fontSize: 13, marginTop: 2, fontWeight: 500 }}>
                  {new Date(planEndDate).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Usage (Free and Weekly plans) */}
      {(planState.plan === 'free' || planState.plan === 'weekly') && !planState.isExpired && (
        <div style={{
          marginBottom: 24, padding: 28, borderRadius: 12,
          background: '#ffffff', border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ color: '#000000', fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Today's Usage</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {([
              { label: 'Chat', action: 'chat_message' as const, limit: planState.plan === 'weekly' ? 25 : 3 },
              { label: 'Interview', action: 'interview_question' as const, limit: planState.plan === 'weekly' ? 25 : 3 },
              { label: 'Screen Analysis', action: 'screen_analysis' as const, limit: planState.plan === 'weekly' ? 20 : 2 },
              { label: 'Generate', action: 'generate_answer' as const, limit: planState.plan === 'weekly' ? 30 : 3 },
              { label: 'Reminders', action: 'reminder' as const, limit: planState.plan === 'weekly' ? -1 : 5 },
            ]).map(item => {
              const remaining = getRemaining(item.action);
              const used = usage[item.action] || 0;
              const pct = remaining !== null ? Math.round((used / item.limit) * 100) : 0;
              return (
                <div key={item.action} style={{
                  padding: '10px 12px', borderRadius: 10,
                  background: '#f9fafb', border: '1px solid #e5e7eb',
                }}>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: remaining === 0 ? '#dc2626' : '#000000' }}>
                    {item.limit === -1 ? `${used} / ∞` : `${used}/${item.limit}`}
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: '#e5e7eb', marginTop: 6 }}>
                    <div style={{
                      height: '100%', borderRadius: 2, transition: 'width 0.3s',
                      width: `${Math.min(pct, 100)}%`,
                      background: pct >= 100 ? '#ef4444' : pct >= 60 ? '#d97706' : '#3b82f6',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Plan Cards — 5 cards in one line */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}>
        {PLAN_ORDER.map(planId => {
          const plan = PLANS[planId];
          const isCurrent = planState.plan === planId;
          const isDowngrade = PLAN_ORDER.indexOf(planId) < PLAN_ORDER.indexOf(planState.plan);

          return (
            <div key={planId} style={{
              padding: 14, borderRadius: 10, position: 'relative',
              background: isCurrent ? '#eff6ff' 
                : plan.highlighted ? '#f0f9ff'
                : '#ffffff',
              border: isCurrent ? '2px solid #2563eb' 
                : plan.highlighted ? '2px solid #3b82f6'
                : '1px solid #e5e7eb',
              transition: 'all 0.2s',
              boxShadow: plan.highlighted ? '0 4px 12px rgba(59,130,246,0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              {/* Most Popular Badge */}
              {plan.highlighted && (
                <div style={{
                  position: 'absolute',
                  top: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: '#fff',
                  padding: '3px 12px',
                  borderRadius: 10,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
                }}>
                  Most Popular
                </div>
              )}
              {/* Plan Name */}
              <div style={{ color: '#000000', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{plan.name}</div>

              {/* Price */}
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: '#000000', fontSize: 24, fontWeight: 800, letterSpacing: '-1px' }}>{plan.priceLabel}</span>
                {planId !== 'free' && (
                  <span style={{ color: '#000000', fontSize: 11 }}> {plan.priceSuffix}</span>
                )}
              </div>

              {/* Savings badge for Pro Plus */}
              {plan.savingsNote && (
                <div style={{
                  fontSize: 10, fontWeight: 700, color: '#22c55e',
                  background: 'rgba(34,197,94,0.12)', padding: '2px 6px', borderRadius: 4,
                  display: 'inline-block', marginBottom: 10,
                }}>
                  {plan.savingsNote}
                </div>
              )}

              {/* Tagline */}
              <div style={{ 
                color: '#000000', 
                fontSize: 11, 
                marginBottom: 12, 
                marginTop: plan.savingsNote ? 0 : 8,
                fontWeight: 400,
                lineHeight: 1.4,
              }}>{plan.tagline}</div>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(planId)}
                disabled={isCurrent || upgradeLoading !== null}
                style={{
                  width: '100%', padding: '8px 0', borderRadius: 8, marginBottom: 12,
                  background: isCurrent ? 'transparent'
                    : plan.highlighted ? '#2563eb'
                    : planId === 'pro_plus' ? '#2563eb'
                    : '#f3f4f6',
                  border: isCurrent ? '2px solid #2563eb' : 'none',
                  color: isCurrent ? '#2563eb'
                    : plan.highlighted || planId === 'pro_plus' ? '#ffffff'
                    : '#000000',
                  fontSize: 12, fontWeight: 700,
                  cursor: isCurrent ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: upgradeLoading === planId ? 0.6 : 1,
                }}
              >
                {upgradeLoading === planId ? 'Processing...'
                  : isCurrent ? 'Current Plan'
                  : planId === 'free' ? 'Get Free'
                  : isDowngrade ? 'Downgrade'
                  : 'Subscribe'}
              </button>

              {/* Intro text for non-free */}
              {planId !== 'free' && (
                <div style={{ color: '#000000', fontSize: 10, fontWeight: 600, marginBottom: 6 }}>
                  {planId === 'weekly' ? 'Everything in Free, plus...' 
                   : planId === 'pro' ? 'Everything in Weekly, plus...' 
                   : 'Everything in Pro, plus...'}
                </div>
              )}

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ color: '#000000', fontSize: 10, display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Details */}
      <div style={{
        padding: 28, borderRadius: 12,
        background: '#ffffff', border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <h3 style={{ color: '#000000', fontSize: 16, fontWeight: 700, margin: '0 0 14px' }}>Payment Details</h3>
        <div style={{ color: '#6b7280', fontSize: 14 }}>
          {billingEmail ? (
            <div>Billing email: <span style={{ color: '#000000', fontWeight: 500 }}>{billingEmail}</span></div>
          ) : (
            'No payment method on file. Payment gateway integration coming soon.'
          )}
        </div>
        <div style={{ color: '#4b5563', fontSize: 12, marginTop: 8 }}>
          Secure payments powered by Razorpay. All transactions are encrypted and secure.
        </div>
      </div>

      {/* Payment Success Modal */}
      {paymentSuccess && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
        }} onClick={() => { setPaymentSuccess(null); window.location.reload(); }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32, maxWidth: 420, width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', textAlign: 'center',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
            <h2 style={{ color: '#000', fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Payment Successful!</h2>
            <p style={{ color: '#4b5563', fontSize: 14, margin: '0 0 24px' }}>
              You have subscribed to the <strong>{paymentSuccess.planName}</strong> plan.
            </p>

            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 20,
              textAlign: 'left', marginBottom: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#6b7280', fontSize: 13 }}>Plan</span>
                <span style={{ color: '#000', fontSize: 13, fontWeight: 600 }}>{paymentSuccess.planName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#6b7280', fontSize: 13 }}>Amount Paid</span>
                <span style={{ color: '#000', fontSize: 13, fontWeight: 600 }}>{paymentSuccess.amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#6b7280', fontSize: 13 }}>Payment ID</span>
                <span style={{ color: '#000', fontSize: 11, fontWeight: 500, fontFamily: 'monospace' }}>{paymentSuccess.paymentId}</span>
              </div>
              <div style={{ borderTop: '1px solid #bbf7d0', paddingTop: 12, marginTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#6b7280', fontSize: 13 }}>Valid From</span>
                  <span style={{ color: '#000', fontSize: 13, fontWeight: 600 }}>
                    {paymentSuccess.startDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: 13 }}>Valid Until</span>
                  <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 700 }}>
                    {paymentSuccess.endDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setPaymentSuccess(null); window.location.reload(); }}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
                background: '#2563eb', color: '#fff', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1d4ed8')}
              onMouseLeave={e => (e.currentTarget.style.background = '#2563eb')}
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
