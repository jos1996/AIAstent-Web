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

const RAZORPAY_KEY = 'rzp_live_RXT3VUdM3gaV4e';

// Price mapping in INR (₹)
const PLAN_PRICES: Record<PlanId, number> = {
  free: 0,
  weekly: 540,      // ~$6 USD
  pro: 1710,        // ~$19 USD
  pro_plus: 7200,   // ~$80 USD
};

export default function BillingPage() {
  const { user } = useAuth();
  const [billingEmail, setBillingEmail] = useState('');
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);
  const [planStartDate, setPlanStartDate] = useState<string | null>(null);
  const [planEndDate, setPlanEndDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState<PlanId | null>(null);
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
      setPlanStartDate(data.trial_start_date || data.created_at || null);
      // For free plan, end date is trial_start + 7 days
      if (data.plan === 'free' && data.trial_start_date) {
        const end = new Date(new Date(data.trial_start_date).getTime() + 7 * 24 * 60 * 60 * 1000);
        setPlanEndDate(end.toISOString());
      } else if (data.trial_end_date) {
        setPlanEndDate(data.trial_end_date);
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
        handler: async function () {
          // Payment successful
          const result = await updatePlan(planId);
          if (!result.success) {
            alert(result.error || 'Failed to update plan');
          } else {
            alert('Payment successful! Your plan has been upgraded.');
            await loadBilling();
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
          }
        }
      };

      const razorpay = new window.Razorpay(options);
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

  if (loading || !loaded) return <div style={{ color: '#6b7280', padding: 40 }}>Loading...</div>;

  // Trial info
  const daysLeft = (() => {
    if (planState.plan !== 'free' || !planState.trialStart) return 0;
    const start = new Date(planState.trialStart);
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    const diff = end.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  return (
    <div style={{ maxWidth: '100%' }}>
      <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.5px' }}>Billing & Plans</h1>
      <p style={{ color: '#9ca3af', fontSize: 15, margin: '0 0 32px' }}>Choose the plan that works best for you</p>

      {/* Current Plan Status */}
      <div style={{
        marginBottom: 32, padding: 28, borderRadius: 16,
        background: planState.isExpired ? 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.06) 100%)' : 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(147,51,234,0.08) 100%)',
        border: planState.isExpired ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(59,130,246,0.25)',
        boxShadow: planState.isExpired ? '0 4px 20px rgba(239,68,68,0.15)' : '0 4px 20px rgba(59,130,246,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#9ca3af', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Current Plan</div>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginTop: 4 }}>
              {PLANS[planState.plan]?.name || 'Free'}
              {planState.plan === 'free' && !planState.isExpired && (
                <span style={{ fontSize: 12, fontWeight: 500, color: '#60a5fa', marginLeft: 8 }}>
                  {daysLeft} day{daysLeft !== 1 ? 's' : ''} left in trial
                </span>
              )}
              {planState.isExpired && (
                <span style={{ fontSize: 12, fontWeight: 500, color: '#ef4444', marginLeft: 8 }}>
                  Trial expired — upgrade to continue
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            {planStartDate && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#9ca3af', fontSize: 12 }}>Start Date</div>
                <div style={{ color: '#e5e7eb', fontSize: 13, marginTop: 2 }}>
                  {new Date(planStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            )}
            {planEndDate && planState.plan === 'free' && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#9ca3af', fontSize: 12 }}>Trial Ends</div>
                <div style={{ color: planState.isExpired ? '#ef4444' : '#e5e7eb', fontSize: 13, marginTop: 2 }}>
                  {new Date(planEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            )}
            {nextBillingDate && planState.plan !== 'free' && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#9ca3af', fontSize: 12 }}>Next Billing</div>
                <div style={{ color: '#e5e7eb', fontSize: 13, marginTop: 2 }}>
                  {new Date(nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Usage (Free plan only) */}
      {planState.plan === 'free' && !planState.isExpired && (
        <div style={{
          marginBottom: 32, padding: 28, borderRadius: 16,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}>
          <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Today's Usage</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {([
              { label: 'Chat', action: 'chat_message' as const, limit: 5 },
              { label: 'Interview', action: 'interview_question' as const, limit: 3 },
              { label: 'Screen Analysis', action: 'screen_analysis' as const, limit: 2 },
              { label: 'Generate', action: 'generate_answer' as const, limit: 3 },
              { label: 'Reminders', action: 'reminder' as const, limit: 5 },
            ]).map(item => {
              const remaining = getRemaining(item.action);
              const used = usage[item.action] || 0;
              const pct = remaining !== null ? Math.round((used / item.limit) * 100) : 0;
              return (
                <div key={item.action} style={{
                  padding: '10px 12px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: remaining === 0 ? '#ef4444' : '#e5e7eb' }}>
                    {used}/{item.limit}
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', marginTop: 6 }}>
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

      {/* Plan Cards — 4 cards including new weekly plan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {PLAN_ORDER.map(planId => {
          const plan = PLANS[planId];
          const isCurrent = planState.plan === planId;
          const isDowngrade = PLAN_ORDER.indexOf(planId) < PLAN_ORDER.indexOf(planState.plan);

          return (
            <div key={planId} style={{
              padding: 20, borderRadius: 16, position: 'relative',
              background: isCurrent ? 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(37,99,235,0.08) 100%)' 
                : plan.highlighted ? 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(147,51,234,0.1) 100%)'
                : 'rgba(255,255,255,0.03)',
              border: isCurrent ? '2px solid rgba(37,99,235,0.5)' 
                : plan.highlighted ? '2px solid rgba(59,130,246,0.6)'
                : '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.3s',
              boxShadow: plan.highlighted ? '0 12px 40px rgba(59,130,246,0.2)' : isCurrent ? '0 8px 24px rgba(37,99,235,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
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
                  padding: '4px 16px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
                }}>
                  Most Popular
                </div>
              )}
              {/* Plan Name */}
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{plan.name}</div>

              {/* Price */}
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: '#fff', fontSize: 32, fontWeight: 800, letterSpacing: '-1px' }}>{plan.priceLabel}</span>
                {planId !== 'free' && (
                  <span style={{ color: '#6b7280', fontSize: 13 }}> {plan.priceSuffix}</span>
                )}
              </div>

              {/* Savings badge for Pro Plus */}
              {plan.savingsNote && (
                <div style={{
                  fontSize: 11, fontWeight: 700, color: '#22c55e',
                  background: 'rgba(34,197,94,0.12)', padding: '3px 8px', borderRadius: 4,
                  display: 'inline-block', marginBottom: 12,
                }}>
                  {plan.savingsNote}
                </div>
              )}

              {/* Tagline */}
              <div style={{ 
                color: plan.highlighted ? '#d1d5db' : '#9ca3af', 
                fontSize: 13, 
                marginBottom: 18, 
                marginTop: plan.savingsNote ? 0 : 10,
                fontWeight: plan.highlighted ? 500 : 400,
                lineHeight: 1.5,
              }}>{plan.tagline}</div>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(planId)}
                disabled={isCurrent || upgradeLoading !== null}
                style={{
                  width: '100%', padding: '11px 0', borderRadius: 10, marginBottom: 18,
                  background: isCurrent ? 'transparent'
                    : plan.highlighted ? '#fff'
                    : planId === 'pro_plus' ? '#fff'
                    : 'rgba(255,255,255,0.06)',
                  border: isCurrent ? '1px solid rgba(37,99,235,0.3)' : 'none',
                  color: isCurrent ? '#60a5fa'
                    : plan.highlighted || planId === 'pro_plus' ? '#000'
                    : '#fff',
                  fontSize: 14, fontWeight: 700,
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
                <div style={{ color: '#9ca3af', fontSize: 11, fontWeight: 600, marginBottom: 8 }}>
                  {planId === 'weekly' ? 'Everything in Free, plus...' 
                   : planId === 'pro' ? 'Everything in Free, plus...' 
                   : 'Everything in Pro, plus...'}
                </div>
              )}

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ color: '#d1d5db', fontSize: 12, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}>
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
        padding: 28, borderRadius: 16,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      }}>
        <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: '0 0 14px' }}>Payment Details</h3>
        <div style={{ color: '#6b7280', fontSize: 14 }}>
          {billingEmail ? (
            <div>Billing email: <span style={{ color: '#e5e7eb' }}>{billingEmail}</span></div>
          ) : (
            'No payment method on file. Payment gateway integration coming soon.'
          )}
        </div>
        <div style={{ color: '#4b5563', fontSize: 12, marginTop: 8 }}>
          Secure payments powered by Razorpay. All transactions are encrypted and secure.
        </div>
      </div>
    </div>
  );
}
