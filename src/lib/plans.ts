// ── Dual Pricing System ──────────────────────────────────────────────────────
// Interview Mode: Credit-based (1 credit = 1 hour, time-tracked in minutes)
// General Mode: Monthly subscription (₹1,999/mo) with daily limits

export type InterviewPlanId = 'free' | 'credit_1hr' | 'credit_3hr' | 'credit_10hr';
export type GeneralPlanId = 'general_free' | 'general_monthly';
export type PlanId = InterviewPlanId | GeneralPlanId;
export type BillingCycle = 'one_time' | 'monthly';

export interface PlanLimits {
  totalMinutes: number;
  freeMinutes: number;
}

export interface GeneralPlanLimits {
  accessDaysPerMonth: number;      // Days user can access within subscription
  screenAnalysisPerDay: number;    // Max screen analyses per day (5)
  rewritesPerDay: number;          // Max content rewrites per day (5)
  remindersPerDay: number;         // -1 = unlimited
  chatMessagesPerDay: number;      // -1 = unlimited
}

export interface PlanConfig {
  id: PlanId;
  name: string;
  tagline: string;
  priceLabel: string;
  priceSuffix: string;
  savingsNote: string;
  priceInPaise: number;
  limits: PlanLimits;
  features: string[];
  highlighted: boolean;
}

export interface GeneralPlanConfig {
  id: GeneralPlanId;
  name: string;
  tagline: string;
  priceLabel: string;
  priceSuffix: string;
  priceInPaise: number;
  priceUSD: string;
  limits: GeneralPlanLimits;
  features: string[];
  highlighted: boolean;
}

export const PLANS: Record<InterviewPlanId, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free Trial',
    tagline: '15 minutes free to try all features.',
    priceLabel: 'Free',
    priceSuffix: '15 min',
    savingsNote: '',
    priceInPaise: 0,
    limits: { totalMinutes: 15, freeMinutes: 15 },
    features: [
      '15 minutes free usage',
      'Full AI chat access',
      'Interview mode included',
      'Screen analysis included',
      'Generate answers included',
      'No credit card required',
    ],
    highlighted: false,
  },
  credit_1hr: {
    id: 'credit_1hr',
    name: '1 Credit',
    tagline: '1 hour of full access.',
    priceLabel: '₹299',
    priceSuffix: '/ hour',
    savingsNote: '',
    priceInPaise: 29900,
    limits: { totalMinutes: 60, freeMinutes: 0 },
    features: [
      '1 hour of usage',
      'Unlimited AI responses',
      'Unlimited interview mode',
      'Unlimited screen analysis',
      'Unlimited generate answers',
      'All features unlocked',
    ],
    highlighted: false,
  },
  credit_3hr: {
    id: 'credit_3hr',
    name: '3 Credits',
    tagline: '3 hours — best for interview prep.',
    priceLabel: '₹599',
    priceSuffix: '/ 3 hours',
    savingsNote: '₹200/hr — Save 33%',
    priceInPaise: 59900,
    limits: { totalMinutes: 180, freeMinutes: 0 },
    features: [
      '3 hours of usage',
      'Unlimited AI responses',
      'Unlimited interview mode',
      'Unlimited screen analysis',
      'Unlimited generate answers',
      'All features unlocked',
      'Best for interview prep',
    ],
    highlighted: true,
  },
  credit_10hr: {
    id: 'credit_10hr',
    name: '10 Credits',
    tagline: '10 hours — maximum value.',
    priceLabel: '₹1,999',
    priceSuffix: '/ 10 hours',
    savingsNote: '₹200/hr — Save 33%',
    priceInPaise: 199900,
    limits: { totalMinutes: 600, freeMinutes: 0 },
    features: [
      '10 hours of usage',
      'Unlimited AI responses',
      'Unlimited interview mode',
      'Unlimited screen analysis',
      'Unlimited generate answers',
      'All features unlocked',
      'Maximum value pack',
      'Priority support',
    ],
    highlighted: false,
  },
};

export const PLAN_ORDER: InterviewPlanId[] = ['free', 'credit_1hr', 'credit_3hr', 'credit_10hr'];

// ── General Mode Plans (subscription-based) ─────────────────────────────────
export const GENERAL_PLANS: Record<GeneralPlanId, GeneralPlanConfig> = {
  general_free: {
    id: 'general_free',
    name: 'General Free',
    tagline: 'Limited general assistant access.',
    priceLabel: 'Free',
    priceSuffix: '',
    priceInPaise: 0,
    priceUSD: '$0',
    limits: {
      accessDaysPerMonth: 0,
      screenAnalysisPerDay: 0,
      rewritesPerDay: 0,
      remindersPerDay: 3,
      chatMessagesPerDay: 5,
    },
    features: [
      'Basic chat (5 messages/day)',
      '3 reminders/day',
      'No screen analysis',
      'No content rewriting',
    ],
    highlighted: false,
  },
  general_monthly: {
    id: 'general_monthly',
    name: 'General Pro',
    tagline: 'Full general assistant — monthly subscription.',
    priceLabel: '₹1,999',
    priceSuffix: '/ month',
    priceInPaise: 199900,
    priceUSD: '$20',
    limits: {
      accessDaysPerMonth: 2,
      screenAnalysisPerDay: 5,
      rewritesPerDay: 5,
      remindersPerDay: -1,
      chatMessagesPerDay: -1,
    },
    features: [
      '2 days of access per month',
      'Up to 5 screen analyses per day',
      'Up to 5 content rewrites per day',
      'Unlimited reminders',
      'Unlimited chat messages',
      'No Listen or What to Say',
    ],
    highlighted: true,
  },
};

export const GENERAL_PLAN_ORDER: GeneralPlanId[] = ['general_free', 'general_monthly'];

// ── Usage Action Types ──────────────────────────────────────────────────────

export type UsageAction =
  | 'interview_question'
  | 'screen_analysis'
  | 'chat_message'
  | 'reminder'
  | 'generate_answer'
  | 'rewrite';

// ── Helper: format minutes to human-readable ─────────────────────────────────

export function formatMinutes(mins: number): string {
  if (mins <= 0) return '0 min';
  const hours = Math.floor(mins / 60);
  const remaining = Math.round(mins % 60);
  if (hours === 0) return `${remaining} min`;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

// ── Helper: get today's date key for localStorage usage tracking ─────────────

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
