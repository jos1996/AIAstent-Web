import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { PlanId, UsageAction } from '../lib/plans';
import { PLANS, formatMinutes } from '../lib/plans';

// ── Credit-Based Plan Limits ─────────────────────────────────────────────────
// Tracks remaining minutes instead of daily action counts.
// Credits are stored in Supabase `billing` table:
//   - credits_total_minutes: total purchased minutes
//   - credits_used_minutes: minutes consumed
//   - free_minutes_used: free trial minutes consumed (max 15)

interface PlanState {
  plan: PlanId;
  totalMinutes: number;       // Total minutes available (purchased + free)
  usedMinutes: number;        // Minutes consumed
  remainingMinutes: number;   // Minutes left
  isExpired: boolean;         // No credits left
  isFreeUser: boolean;        // Using free trial
}

export function usePlanLimits() {
  const [planState, setPlanState] = useState<PlanState>({
    plan: 'free',
    totalMinutes: 15,
    usedMinutes: 0,
    remainingMinutes: 15,
    isExpired: false,
    isFreeUser: true,
  });
  const [loaded, setLoaded] = useState(false);

  const loadPlan = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setLoaded(true); return; }

    let { data } = await supabase
      .from('billing')
      .select('plan, credits_total_minutes, credits_used_minutes, free_minutes_used, billing_email, trial_start_date')
      .eq('user_id', session.user.id)
      .single();

    // Auto-create billing row if it doesn't exist (new user → 15 min free)
    if (!data) {
      const now = new Date().toISOString();
      const { data: newRow } = await supabase
        .from('billing')
        .insert({
          user_id: session.user.id,
          plan: 'free',
          billing_cycle: 'one_time',
          trial_start_date: now,
          billing_email: session.user.email || '',
          credits_total_minutes: 0,
          credits_used_minutes: 0,
          free_minutes_used: 0,
        })
        .select('plan, credits_total_minutes, credits_used_minutes, free_minutes_used, billing_email, trial_start_date')
        .single();
      data = newRow;
    }

    if (data) {
      const planId = (data.plan || 'free') as PlanId;
      const creditTotal = data.credits_total_minutes || 0;
      const creditUsed = data.credits_used_minutes || 0;
      const freeUsed = data.free_minutes_used || 0;

      // Total available = purchased credits + remaining free minutes
      const freeRemaining = Math.max(0, 15 - freeUsed);
      const creditRemaining = Math.max(0, creditTotal - creditUsed);
      const totalAvailable = creditTotal + 15; // purchased + free grant
      const totalUsed = creditUsed + freeUsed;
      const remaining = freeRemaining + creditRemaining;

      setPlanState({
        plan: planId,
        totalMinutes: totalAvailable,
        usedMinutes: totalUsed,
        remainingMinutes: remaining,
        isExpired: remaining <= 0,
        isFreeUser: creditTotal === 0,
      });
    }
    setLoaded(true);
  }, []);

  // Initial load + periodic refresh every 60 seconds to reflect credit changes
  useEffect(() => {
    loadPlan();
    const interval = setInterval(loadPlan, 60 * 1000);
    return () => clearInterval(interval);
  }, [loadPlan]);

  // Check if user can perform any action (has remaining minutes)
  const canPerformAction = useCallback((_action: UsageAction): { allowed: boolean; reason: string } => {
    if (planState.isExpired) {
      if (planState.isFreeUser) {
        return {
          allowed: false,
          reason: 'Your 15-minute free trial has been used. Purchase credits to continue using HelplyAI.',
        };
      }
      return {
        allowed: false,
        reason: `You've used all your credits (${formatMinutes(planState.totalMinutes)}). Purchase more credits to continue.`,
      };
    }
    return { allowed: true, reason: '' };
  }, [planState]);

  // Record usage — in credit system this is a no-op (time tracking handles deduction)
  const recordUsage = useCallback((_action: UsageAction) => {
    // Credits are deducted by time, not by action count.
    // The chatbot session timer handles deduction via Supabase.
  }, []);

  // Update plan after credit purchase
  const updatePlan = useCallback(async (newPlan: PlanId): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return { success: false, error: 'Not logged in' };

      const planConfig = PLANS[newPlan];
      if (!planConfig) return { success: false, error: 'Invalid plan' };

      const now = new Date().toISOString();

      // Add credits (minutes) to existing balance
      const { data: current } = await supabase
        .from('billing')
        .select('credits_total_minutes')
        .eq('user_id', session.user.id)
        .single();

      const existingMinutes = current?.credits_total_minutes || 0;
      const newTotalMinutes = existingMinutes + planConfig.limits.totalMinutes;

      const { error } = await supabase
        .from('billing')
        .update({
          plan: newPlan,
          billing_cycle: 'one_time',
          credits_total_minutes: newTotalMinutes,
          updated_at: now,
        })
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Refresh plan state
      await loadPlan();
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update plan' };
    }
  }, [loadPlan]);

  // Get remaining minutes (not action-based anymore)
  const getRemaining = useCallback((_action: UsageAction): number | null => {
    return planState.remainingMinutes;
  }, [planState]);

  return {
    planState,
    usage: {} as Record<string, number>,
    loaded,
    canPerformAction,
    recordUsage,
    updatePlan,
    getRemaining,
    refreshPlan: loadPlan,
    currentPlan: PLANS[planState.plan as PlanId] || PLANS.free,
  };
}
