// ── Credit-Based Plan System ─────────────────────────────────────────────────
// 1 credit = 1 hour of usage. Time tracked in minutes.

export type PlanId = 'free' | 'credit_1hr' | 'credit_3hr' | 'credit_10hr';
export type BillingCycle = 'one_time';

export interface PlanLimits {
  totalMinutes: number;       // Total minutes included in plan (15 for free, 60/180/600 for credits)
  freeMinutes: number;        // Free minutes for new users (15 min)
}

export interface PlanConfig {
  id: PlanId;
  name: string;
  tagline: string;
  priceLabel: string;
  priceSuffix: string;
  savingsNote: string;
  priceInPaise: number;       // Price in paise (INR × 100) for Razorpay
  limits: PlanLimits;
  features: string[];
  highlighted: boolean;
}

export const PLANS: Record<PlanId, PlanConfig> = {
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

export const PLAN_ORDER: PlanId[] = ['free', 'credit_1hr', 'credit_3hr', 'credit_10hr'];

// ── Usage Action Types (kept for backward compat but no daily limits) ────────
export type UsageAction = 'interview_question' | 'screen_analysis' | 'chat_message' | 'reminder' | 'generate_answer';

// ── Helper: format minutes to human-readable ─────────────────────────────────
export function formatMinutes(mins: number): string {
  if (mins <= 0) return '0 min';
  const hours = Math.floor(mins / 60);
  const remaining = Math.round(mins % 60);
  if (hours === 0) return `${remaining} min`;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
