import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PLANS, PLAN_ORDER, GENERAL_PLANS, formatMinutes } from '../lib/plans';
import type { PlanId } from '../lib/plans';
import { usePlanLimits } from '../hooks/usePlanLimits';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY = 'rzp_live_SKtIYRDuyTruqa';

interface PaymentSuccessInfo {
  planName: string;
  planId: PlanId;
  amount: string;
  paymentId: string;
  creditsAdded: number; // minutes added
}

export default function BillingPage() {
  const { user } = useAuth();
  const [billingEmail, setBillingEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState<PlanId | null>(null);
  const [generalUpgradeLoading, setGeneralUpgradeLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentSuccessInfo | null>(null);
  const [generalSub, setGeneralSub] = useState<{ plan: string; end: string | null; daysUsed: number } | null>(null);
  const [pricingMode, setPricingMode] = useState<'interview' | 'general'>('interview');
  const { planState, loaded, refreshPlan } = usePlanLimits();

  useEffect(() => {
    if (user) loadBilling();
  }, [user]);

  const loadBilling = async () => {
    const { data } = await supabase
      .from('billing')
      .select('billing_email, credits_total_minutes, credits_used_minutes, free_minutes_used, general_plan, general_subscription_end, general_days_used')
      .eq('user_id', user!.id)
      .single();
    if (data) {
      setBillingEmail(data.billing_email || '');
      setGeneralSub({
        plan: data.general_plan || 'general_free',
        end: data.general_subscription_end || null,
        daysUsed: data.general_days_used || 0,
      });

      // ONE-TIME FIX: Credit ₹299 payment on 2026-03-10 for beeptalkapp@gmail.com
      // This user paid but credits weren't added due to a bug (now fixed).
      // Safe: only runs once because it checks credits_total_minutes === 0
      if (user?.email === 'beeptalkapp@gmail.com' && (data.credits_total_minutes || 0) === 0) {
        console.log('Applying one-time credit fix for ₹299 payment...');
        await supabase.from('billing').update({
          plan: 'credit_1hr',
          billing_cycle: 'one_time',
          credits_total_minutes: 60,
          updated_at: new Date().toISOString(),
        }).eq('user_id', user!.id);
        if (refreshPlan) await refreshPlan();
      }
    }
    setLoading(false);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchaseCredits = async (planId: PlanId) => {
    if (planId === 'free') return; // Can't purchase free
    setUpgradeLoading(planId);

    const plan = PLANS[planId as keyof typeof PLANS];
    const amount = plan.priceInPaise;

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
      description: `${plan.name} — ${plan.priceSuffix}`,
      image: 'https://helplyai.co/logo.png',
      notes: {
        user_id: user!.id,
        plan: planId,
        credits_minutes: plan.limits.totalMinutes,
      },
      handler: async function (response: any) {
        const razorpayPaymentId = response.razorpay_payment_id || null;
        const razorpayOrderId = response.razorpay_order_id || null;
        const razorpaySignature = response.razorpay_signature || null;
        const now = new Date();

        try {
          // 1. Record payment (best-effort — don't block credit update)
          try {
            await supabase.from('payments').insert({
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
              period_start: now.toISOString(),
              metadata: response || {},
            });
          } catch (payErr) {
            console.warn('Payment record insert failed (non-critical):', payErr);
          }

          // 2. Add credits to billing table — CRITICAL STEP
          const { data: current, error: fetchErr } = await supabase
            .from('billing')
            .select('credits_total_minutes')
            .eq('user_id', user!.id)
            .single();

          if (fetchErr) {
            console.error('Failed to fetch current billing:', fetchErr);
          }

          const existingMinutes = current?.credits_total_minutes || 0;
          const newTotalMinutes = existingMinutes + plan.limits.totalMinutes;

          // Only update columns that exist on billing table
          const { error: updateErr } = await supabase.from('billing').update({
            plan: planId,
            billing_cycle: 'one_time',
            credits_total_minutes: newTotalMinutes,
            updated_at: now.toISOString(),
          }).eq('user_id', user!.id);

          if (updateErr) {
            console.error('CRITICAL: Failed to update credits in billing:', updateErr);
            alert('Payment received but credits failed to update. Please contact support with payment ID: ' + razorpayPaymentId);
          }

          // 3. Show success + refresh
          setPaymentSuccess({
            planName: plan.name,
            planId: planId,
            amount: '₹' + (amount / 100),
            paymentId: razorpayPaymentId || 'N/A',
            creditsAdded: plan.limits.totalMinutes,
          });

          if (refreshPlan) await refreshPlan();
          await loadBilling();
        } catch (err) {
          console.error('Payment recording error:', err);
          alert('Payment received but an error occurred updating your credits. Please contact support with payment ID: ' + razorpayPaymentId);
        }
        setUpgradeLoading(null);
      },
      prefill: { email: user?.email || '' },
      theme: { color: '#2563eb' },
      modal: {
        ondismiss: function() { setUpgradeLoading(null); },
        confirm_close: true
      }
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on('payment.failed', async function (response: any) {
      console.error('Payment failed:', response.error);
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
  };

  // ── General Mode Subscription Purchase ──────────────────────────────────────
  const handlePurchaseGeneralPro = async () => {
    setGeneralUpgradeLoading(true);
    const plan = GENERAL_PLANS.general_monthly;

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert('Failed to load payment gateway. Please try again.');
      setGeneralUpgradeLoading(false);
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: plan.priceInPaise,
      currency: 'INR',
      name: 'HelplyAI',
      description: `${plan.name} — Monthly Subscription`,
      image: 'https://helplyai.co/logo.png',
      notes: {
        user_id: user!.id,
        plan: 'general_monthly',
        type: 'subscription',
      },
      handler: async function (response: any) {
        const razorpayPaymentId = response.razorpay_payment_id || null;
        const now = new Date();
        const subscriptionEnd = new Date(now);
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

        try {
          // Record payment
          try {
            await supabase.from('payments').insert({
              user_id: user!.id,
              plan: 'general_monthly',
              plan_name: plan.name,
              amount: plan.priceInPaise,
              currency: 'INR',
              amount_display: plan.priceLabel,
              razorpay_payment_id: razorpayPaymentId,
              razorpay_order_id: response.razorpay_order_id || null,
              razorpay_signature: response.razorpay_signature || null,
              status: 'success',
              period_start: now.toISOString(),
              metadata: { ...response, type: 'general_subscription' },
            });
          } catch (payErr) {
            console.warn('Payment record insert failed (non-critical):', payErr);
          }

          // Update billing with general subscription
          const { error: updateErr } = await supabase.from('billing').update({
            general_plan: 'general_monthly',
            general_subscription_end: subscriptionEnd.toISOString(),
            general_days_used: 0,
            general_last_access_date: null,
            updated_at: now.toISOString(),
          }).eq('user_id', user!.id);

          if (updateErr) {
            console.error('CRITICAL: Failed to activate general subscription:', updateErr);
            alert('Payment received but subscription failed to activate. Please contact support with payment ID: ' + razorpayPaymentId);
          }

          setPaymentSuccess({
            planName: 'General Pro (Monthly)',
            planId: 'general_monthly' as PlanId,
            amount: plan.priceLabel,
            paymentId: razorpayPaymentId || 'N/A',
            creditsAdded: 0,
          });

          await loadBilling();
        } catch (err) {
          console.error('General subscription error:', err);
          alert('Payment received but an error occurred. Please contact support with payment ID: ' + razorpayPaymentId);
        }
        setGeneralUpgradeLoading(false);
      },
      prefill: { email: user?.email || '' },
      theme: { color: '#16a34a' },
      modal: {
        ondismiss: function() { setGeneralUpgradeLoading(false); },
        confirm_close: true
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', async function (response: any) {
      console.error('General subscription payment failed:', response.error);
      alert(`Payment failed: ${response.error?.description || 'Unknown error'}. Please try again.`);
      setGeneralUpgradeLoading(false);
    });
    razorpay.open();
  };

  // Derived general subscription state
  const isGeneralActive = generalSub?.plan === 'general_monthly' && generalSub?.end && new Date(generalSub.end) > new Date();
  const generalDaysLeft = isGeneralActive ? Math.max(0, (GENERAL_PLANS.general_monthly.limits.accessDaysPerMonth) - (generalSub?.daysUsed || 0)) : 0;

  if (loading || !loaded) return <div style={{ color: '#000000', padding: 40 }}>Loading...</div>;

  // Calculate credit usage percentage
  const usagePct = planState.totalMinutes > 0
    ? Math.round((planState.usedMinutes / planState.totalMinutes) * 100)
    : 0;

  return (
    <div style={{ maxWidth: '100%' }}>
      <h1 style={{ color: '#000000', fontSize: 24, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Billing & Plans</h1>
      <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 16px' }}>Choose between Interview Mode (credit-based) or General Mode (monthly subscription).</p>

      {/* ── Mode Toggle ── */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        marginBottom: 24,
        padding: 4,
        background: '#f3f4f6',
        borderRadius: 12,
        width: 'fit-content',
      }}>
        <button
          onClick={() => setPricingMode('interview')}
          style={{
            padding: '8px 20px',
            borderRadius: 8,
            border: 'none',
            background: pricingMode === 'interview' ? '#2563eb' : 'transparent',
            color: pricingMode === 'interview' ? '#ffffff' : '#6b7280',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Interview Mode
        </button>
        <button
          onClick={() => setPricingMode('general')}
          style={{
            padding: '8px 20px',
            borderRadius: 8,
            border: 'none',
            background: pricingMode === 'general' ? '#000000' : 'transparent',
            color: pricingMode === 'general' ? '#ffffff' : '#6b7280',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          General Mode
        </button>
      </div>

      {/* ── Interview Mode Section ── */}
      {pricingMode === 'interview' && (
        <>
          {/* ── Credit Balance Card ── */}
      <div style={{
        marginBottom: 24, padding: 28, borderRadius: 16,
        background: planState.isExpired
          ? 'linear-gradient(135deg, #fee2e2, #fecaca)'
          : 'linear-gradient(135deg, #eff6ff, #dbeafe)',
        border: planState.isExpired ? '1px solid #fca5a5' : '1px solid #93c5fd',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ color: '#374151', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Remaining Time</div>
            <div style={{ color: planState.isExpired ? '#dc2626' : '#1e40af', fontSize: 36, fontWeight: 800, marginTop: 4, letterSpacing: '-1px' }}>
              {formatMinutes(planState.remainingMinutes)}
            </div>
            {planState.isExpired && (
              <div style={{ color: '#dc2626', fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                {planState.isFreeUser ? 'Free trial used — purchase credits to continue' : 'No credits remaining — purchase more to continue'}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#374151', fontSize: 12, fontWeight: 500 }}>Total Purchased</div>
            <div style={{ color: '#1e40af', fontSize: 18, fontWeight: 700, marginTop: 2 }}>
              {formatMinutes(planState.totalMinutes)}
            </div>
            <div style={{ color: '#6b7280', fontSize: 11, marginTop: 4 }}>
              Used: {formatMinutes(planState.usedMinutes)}
            </div>
          </div>
        </div>

        {/* Usage Progress Bar */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#374151', fontSize: 11, fontWeight: 500 }}>Usage</span>
            <span style={{ color: '#374151', fontSize: 11, fontWeight: 600 }}>{usagePct}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.6)' }}>
            <div style={{
              height: '100%', borderRadius: 4, transition: 'width 0.5s ease',
              width: `${Math.min(usagePct, 100)}%`,
              background: usagePct >= 90 ? '#ef4444' : usagePct >= 60 ? '#f59e0b' : '#3b82f6',
            }} />
          </div>
        </div>
      </div>

      {/* ── Credit Plan Cards — 4 cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {PLAN_ORDER.map(planId => {
          const plan = PLANS[planId];
          const isFree = planId === 'free';

          return (
            <div key={planId} style={{
              padding: 20, borderRadius: 14, position: 'relative',
              background: plan.highlighted ? '#f0f9ff' : '#ffffff',
              border: plan.highlighted ? '2px solid #3b82f6' : '1px solid #e5e7eb',
              transition: 'all 0.2s',
              boxShadow: plan.highlighted ? '0 4px 16px rgba(59,130,246,0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              {/* Best Value Badge */}
              {plan.highlighted && (
                <div style={{
                  position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: '#fff', padding: '4px 14px', borderRadius: 12,
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                  boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
                }}>
                  Best Value
                </div>
              )}

              {/* Plan Name */}
              <div style={{ color: '#111827', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{plan.name}</div>

              {/* Price */}
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: '#111827', fontSize: 28, fontWeight: 800, letterSpacing: '-1px' }}>{plan.priceLabel}</span>
                {!isFree && (
                  <span style={{ color: '#6b7280', fontSize: 12, marginLeft: 4 }}>{plan.priceSuffix}</span>
                )}
              </div>

              {/* Savings Badge */}
              {plan.savingsNote && (
                <div style={{
                  fontSize: 10, fontWeight: 700, color: '#16a34a',
                  background: 'rgba(22,163,74,0.1)', padding: '3px 8px', borderRadius: 6,
                  display: 'inline-block', marginBottom: 8,
                }}>
                  {plan.savingsNote}
                </div>
              )}

              {/* Tagline */}
              <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 14, marginTop: plan.savingsNote ? 0 : 8, lineHeight: 1.5 }}>
                {plan.tagline}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => isFree ? null : handlePurchaseCredits(planId)}
                disabled={isFree || upgradeLoading !== null}
                style={{
                  width: '100%', padding: '10px 0', borderRadius: 10, marginBottom: 14,
                  background: isFree ? '#f3f4f6'
                    : plan.highlighted ? '#2563eb'
                    : '#111827',
                  border: 'none',
                  color: isFree ? '#9ca3af' : '#ffffff',
                  fontSize: 13, fontWeight: 700,
                  cursor: isFree ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: upgradeLoading === planId ? 0.6 : 1,
                }}
              >
                {upgradeLoading === planId ? 'Processing...'
                  : isFree ? 'Included Free'
                  : 'Buy Credits'}
              </button>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ color: '#374151', fontSize: 11, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={plan.highlighted ? '#3b82f6' : '#22c55e'} strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
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

      {/* ── How Credits Work (Interview Mode) ── */}
      <div style={{
        marginBottom: 24, padding: 24, borderRadius: 14,
        background: '#f9fafb', border: '1px solid #e5e7eb',
      }}>
        <h3 style={{ color: '#111827', fontSize: 16, fontWeight: 700, margin: '0 0 14px' }}>How Credits Work</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 24, marginBottom: 6 }}>⏱</div>
            <div style={{ color: '#111827', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Time-Based Billing</div>
            <div style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.5 }}>
              Credits are deducted based on actual usage time. Use 10 minutes? Only 10 minutes deducted.
            </div>
          </div>
          <div>
            <div style={{ fontSize: 24, marginBottom: 6 }}>💡</div>
            <div style={{ color: '#111827', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>All Features Included</div>
            <div style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.5 }}>
              Every credit gives full access: AI chat, interview mode, screen analysis, and more.
            </div>
          </div>
          <div>
            <div style={{ fontSize: 24, marginBottom: 6 }}>💰</div>
            <div style={{ color: '#111827', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>No Expiry</div>
            <div style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.5 }}>
              Purchased credits never expire. Use them whenever you need — no time pressure.
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* ── General Mode Section ── */}
      {pricingMode === 'general' && (
        <>
      {/* ── General Mode Plans ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#000000', fontSize: 20, fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.01em' }}>General Mode Plans</h2>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 16px' }}>Choose between free trial or monthly subscription for the general assistant.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* General Free Plan Card */}
          <div style={{
            padding: 24, borderRadius: 14, position: 'relative',
            background: '#ffffff',
            border: '2px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}>
            <div style={{
              position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
              background: '#000000',
              color: '#fff', padding: '4px 14px', borderRadius: 12,
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              Free Trial
            </div>

            <div style={{ color: '#111827', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>General Free</div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: '#111827', fontSize: 32, fontWeight: 800, letterSpacing: '-1px' }}>Free</span>
            </div>
            <div style={{ color: '#6b7280', fontSize: 11, marginBottom: 4 }}>5 days access</div>
            <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 14, lineHeight: 1.5 }}>
              Try general mode features for free.
            </div>

            <button
              disabled
              style={{
                width: '100%', padding: '10px 0', borderRadius: 10, marginBottom: 14,
                background: '#f3f4f6',
                border: 'none',
                color: '#9ca3af',
                fontSize: 13, fontWeight: 700,
                cursor: 'default',
              }}
            >
              Included Free
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {GENERAL_PLANS.general_free.features.map(f => (
                <div key={f} style={{ color: '#374151', fontSize: 11, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* General Pro Plan Card */}
          <div style={{
            padding: 24, borderRadius: 14, position: 'relative',
            background: '#f9fafb',
            border: '2px solid #000000',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}>
            <div style={{
              position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
              background: '#000000',
              color: '#fff', padding: '4px 14px', borderRadius: 12,
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}>
              Best Value
            </div>

            <div style={{ color: '#111827', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>General Pro</div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: '#111827', fontSize: 32, fontWeight: 800, letterSpacing: '-1px' }}>₹1,999</span>
              <span style={{ color: '#6b7280', fontSize: 12, marginLeft: 4 }}>/ month</span>
            </div>
            <div style={{ color: '#6b7280', fontSize: 11, marginBottom: 4 }}>International: $20/month</div>
            <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 14, lineHeight: 1.5 }}>
              Full general assistant — monthly subscription.
            </div>

            <button
              onClick={handlePurchaseGeneralPro}
              disabled={generalUpgradeLoading}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 10, marginBottom: 14,
                background: isGeneralActive ? '#e5e7eb' : '#000000',
                border: 'none',
                color: isGeneralActive ? '#374151' : '#ffffff',
                fontSize: 13, fontWeight: 700,
                cursor: isGeneralActive ? 'default' : 'pointer',
                transition: 'all 0.2s',
                opacity: generalUpgradeLoading ? 0.6 : 1,
              }}
            >
              {generalUpgradeLoading ? 'Processing...' : isGeneralActive ? 'Active ✓' : 'Subscribe Now'}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {GENERAL_PLANS.general_monthly.features.map(f => (
                <div key={f} style={{ color: '#374151', fontSize: 11, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── How General Mode Works ── */}
      <div style={{
        marginBottom: 24, padding: 24, borderRadius: 14,
        background: '#f9fafb', border: '1px solid #e5e7eb',
      }}>
        <h3 style={{ color: '#111827', fontSize: 16, fontWeight: 700, margin: '0 0 14px' }}>How General Mode Works</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 24, marginBottom: 6 }}>📅</div>
            <div style={{ color: '#111827', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>2 Days Access/Month</div>
            <div style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.5 }}>
              Use the app on any 2 days within your subscription month. Perfect for occasional use.
            </div>
          </div>
          <div>
            <div style={{ fontSize: 24, marginBottom: 6 }}>📊</div>
            <div style={{ color: '#111827', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Daily Limits</div>
            <div style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.5 }}>
              5 screen analyses, 5 rewrites per day. Unlimited chat and reminders.
            </div>
          </div>
          <div>
            <div style={{ fontSize: 24, marginBottom: 6 }}>🔄</div>
            <div style={{ color: '#111827', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Monthly Renewal</div>
            <div style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.5 }}>
              Subscription auto-renews monthly. Cancel anytime from your account settings.
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* ── Payment Details ── */}
      <div style={{
        padding: 24, borderRadius: 14,
        background: '#ffffff', border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <h3 style={{ color: '#111827', fontSize: 16, fontWeight: 700, margin: '0 0 14px' }}>Payment Details</h3>
        <div style={{ color: '#6b7280', fontSize: 14 }}>
          {billingEmail ? (
            <div>Billing email: <span style={{ color: '#111827', fontWeight: 500 }}>{billingEmail}</span></div>
          ) : (
            'No payment on file yet.'
          )}
        </div>
        <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>
          Secure payments powered by Razorpay. All transactions are encrypted and secure.
        </div>
      </div>

      {/* ── Payment Success Modal ── */}
      {paymentSuccess && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
        }} onClick={() => { setPaymentSuccess(null); window.location.reload(); }}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: 36, maxWidth: 440, width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', textAlign: 'center',
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: '#dcfce7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 32, color: '#16a34a',
            }}>&#10003;</div>
            <h2 style={{ color: '#111827', fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Credits Added!</h2>
            <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 24px' }}>
              <strong>{formatMinutes(paymentSuccess.creditsAdded)}</strong> has been added to your account.
            </p>

            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 20,
              textAlign: 'left', marginBottom: 24,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#6b7280', fontSize: 13 }}>Plan</span>
                <span style={{ color: '#111827', fontSize: 13, fontWeight: 600 }}>{paymentSuccess.planName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#6b7280', fontSize: 13 }}>Amount Paid</span>
                <span style={{ color: '#111827', fontSize: 13, fontWeight: 600 }}>{paymentSuccess.amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#6b7280', fontSize: 13 }}>Credits Added</span>
                <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 700 }}>{formatMinutes(paymentSuccess.creditsAdded)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280', fontSize: 13 }}>Payment ID</span>
                <span style={{ color: '#111827', fontSize: 11, fontWeight: 500, fontFamily: 'monospace' }}>{paymentSuccess.paymentId}</span>
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
