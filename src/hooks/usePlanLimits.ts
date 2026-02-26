import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { PlanId, UsageAction } from '../lib/plans';
import { PLANS, ACTION_TO_LIMIT_KEY, isTrialExpired, getTodayKey } from '../lib/plans';

const USAGE_STORAGE_KEY = 'aiassist_daily_usage';

interface DailyUsage {
  date: string;
  interview_question: number;
  screen_analysis: number;
  chat_message: number;
  reminder: number;
  generate_answer: number;
}

interface PlanState {
  plan: PlanId;
  billingCycle: 'monthly' | 'annually';
  trialStart: string | null;
  isTrialActive: boolean;
  isExpired: boolean;
}

function getEmptyUsage(): DailyUsage {
  return { date: getTodayKey(), interview_question: 0, screen_analysis: 0, chat_message: 0, reminder: 0, generate_answer: 0 };
}

function loadDailyUsage(): DailyUsage {
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    if (!raw) return getEmptyUsage();
    const parsed: DailyUsage = JSON.parse(raw);
    if (parsed.date !== getTodayKey()) return getEmptyUsage();
    return parsed;
  } catch { return getEmptyUsage(); }
}

function saveDailyUsage(usage: DailyUsage) {
  try { localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage)); } catch { /* ignore */ }
}

export function usePlanLimits() {
  const [planState, setPlanState] = useState<PlanState>({ plan: 'free', billingCycle: 'monthly', trialStart: null, isTrialActive: false, isExpired: false });
  const [usage, setUsage] = useState<DailyUsage>(loadDailyUsage());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadPlan = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoaded(true); return; }
      let { data } = await supabase.from('billing').select('plan, billing_cycle, trial_start_date, next_billing_date').eq('user_id', session.user.id).single();
      // Auto-create billing row if it doesn't exist
      if (!data) {
        const now = new Date().toISOString();
        const { data: newRow } = await supabase.from('billing').insert({
          user_id: session.user.id, plan: 'free', billing_cycle: 'monthly',
          trial_start_date: now, billing_email: session.user.email || '',
        }).select('plan, billing_cycle, trial_start_date, next_billing_date').single();
        data = newRow;
      }
      if (data) {
        const planId = (data.plan || 'free') as PlanId;
        const planConfig = PLANS[planId] || PLANS.free;
        const trialStart = data.trial_start_date || session.user.created_at || null;
        const trialExpired = planId === 'free' && isTrialExpired(trialStart, planConfig.limits.trialDays);
        
        // Check if day plan has expired (24 hours from next_billing_date or created_at)
        let dayPlanExpired = false;
        if (planId === 'day' && data.next_billing_date) {
          const expiryTime = new Date(data.next_billing_date).getTime();
          dayPlanExpired = Date.now() > expiryTime;
        }
        
        // Check if test plan has expired (1 hour from next_billing_date)
        let testPlanExpired = false;
        if (planId === 'test' && data.next_billing_date) {
          const expiryTime = new Date(data.next_billing_date).getTime();
          testPlanExpired = Date.now() > expiryTime;
        }
        
        setPlanState({ plan: planId, billingCycle: (data.billing_cycle || 'monthly') as 'monthly' | 'annually', trialStart, isTrialActive: planId === 'free' && !trialExpired, isExpired: trialExpired || dayPlanExpired || testPlanExpired });
      }
      setLoaded(true);
    };
    loadPlan();
  }, []);

  const canPerformAction = useCallback((action: UsageAction): { allowed: boolean; reason: string } => {
    const planConfig = PLANS[planState.plan] || PLANS.free;
    const limitKey = ACTION_TO_LIMIT_KEY[action];
    const limit = planConfig.limits[limitKey] as number;
    if (planState.isExpired) {
      if (planState.plan === 'day') {
        return { allowed: false, reason: 'Your 24-hour Day Pass has expired. Purchase a new pass or upgrade to continue.' };
      }
      if (planState.plan === 'test') {
        return { allowed: false, reason: 'Your 1-hour Test Pass has expired. Purchase a new pass or upgrade to continue.' };
      }
      return { allowed: false, reason: 'Your 2-day free trial has expired. Subscribe to a plan to continue using all features.' };
    }
    if (limit === -1) return { allowed: true, reason: '' };
    const currentCount = usage[action] || 0;
    if (currentCount >= limit) return { allowed: false, reason: `Daily limit reached (${limit}). Upgrade to Pro for unlimited access.` };
    return { allowed: true, reason: '' };
  }, [planState, usage]);

  const recordUsage = useCallback((action: UsageAction) => {
    setUsage(prev => {
      const today = getTodayKey();
      const updated = prev.date === today ? { ...prev } : getEmptyUsage();
      updated[action] = (updated[action] || 0) + 1;
      saveDailyUsage(updated);
      return updated;
    });
  }, []);

  const updatePlan = useCallback(async (newPlan: PlanId): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return { success: false, error: 'Not logged in' };
      const cycle: 'monthly' | 'annually' = newPlan === 'pro_plus' ? 'annually' : 'monthly';
      const now = new Date();
      const nextBilling = new Date(now);
      if (newPlan === 'test') nextBilling.setHours(nextBilling.getHours() + 1);
      else if (newPlan === 'day') nextBilling.setHours(nextBilling.getHours() + 24);
      else if (newPlan === 'weekly') nextBilling.setDate(nextBilling.getDate() + 7);
      else if (newPlan === 'pro') nextBilling.setMonth(nextBilling.getMonth() + 1);
      else if (newPlan === 'pro_plus') nextBilling.setFullYear(nextBilling.getFullYear() + 1);
      const { error } = await supabase.from('billing').update({ plan: newPlan, billing_cycle: cycle, next_billing_date: newPlan === 'free' ? null : nextBilling.toISOString(), updated_at: now.toISOString() }).eq('user_id', session.user.id);
      if (error) throw error;
      setPlanState(prev => ({ ...prev, plan: newPlan, billingCycle: cycle, isTrialActive: newPlan === 'free' && prev.isTrialActive, isExpired: false }));
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update plan' };
    }
  }, []);

  const getRemaining = useCallback((action: UsageAction): number | null => {
    const planConfig = PLANS[planState.plan] || PLANS.free;
    const limitKey = ACTION_TO_LIMIT_KEY[action];
    const limit = planConfig.limits[limitKey] as number;
    if (limit === -1) return null;
    return Math.max(0, limit - (usage[action] || 0));
  }, [planState, usage]);

  return { planState, usage, loaded, canPerformAction, recordUsage, updatePlan, getRemaining, currentPlan: PLANS[planState.plan] || PLANS.free };
}
