export type PlanId = 'free' | 'day' | 'weekly' | 'pro' | 'pro_plus';
export type BillingCycle = 'monthly' | 'annually';

export interface PlanLimits {
  interviewQuestionsPerDay: number;
  screenAnalysisPerDay: number;
  chatMessagesPerDay: number;
  remindersPerDay: number;
  generateAnswerPerDay: number;
  trialDays: number;
}

export interface PlanConfig {
  id: PlanId;
  name: string;
  tagline: string;
  priceLabel: string;
  priceSuffix: string;
  savingsNote: string;
  limits: PlanLimits;
  features: string[];
  highlighted: boolean;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: 'free', name: 'Free Trial', tagline: 'Try it free for 2 days.',
    priceLabel: 'Free', priceSuffix: '2 days', savingsNote: '',
    limits: { interviewQuestionsPerDay: 3, screenAnalysisPerDay: 2, chatMessagesPerDay: 3, remindersPerDay: 5, generateAnswerPerDay: 3, trialDays: 2 },
    features: ['AI responses (3/day)', 'Interview mode (3 questions/day)', 'Screen analysis (2/day)', 'Generate answers (3/day)', 'Setup reminders (5/day)', '2-day free trial'],
    highlighted: false,
  },
  day: {
    id: 'day', name: 'Day Pass', tagline: 'Unlimited access for 24 hours.',
    priceLabel: '$10', priceSuffix: '/ day', savingsNote: '',
    limits: { interviewQuestionsPerDay: -1, screenAnalysisPerDay: -1, chatMessagesPerDay: -1, remindersPerDay: -1, generateAnswerPerDay: -1, trialDays: 0 },
    features: ['Unlimited AI responses', 'Unlimited interview mode', 'Unlimited screen analysis', 'Unlimited generate answers', 'Unlimited reminders', 'Valid for 24 hours', 'Perfect for interview prep'],
    highlighted: false,
  },
  weekly: {
    id: 'weekly', name: 'Weekly', tagline: 'Great for short-term projects & interviews.',
    priceLabel: '$25', priceSuffix: '/ week', savingsNote: '',
    limits: { interviewQuestionsPerDay: 25, screenAnalysisPerDay: 20, chatMessagesPerDay: 25, remindersPerDay: -1, generateAnswerPerDay: 30, trialDays: 0 },
    features: ['25 AI responses/day', 'Interview mode (25 questions/day)', 'Screen analysis (20/day)', 'Generate answers (30/day)', 'Unlimited reminders', 'Access to latest AI models', 'Priority support'],
    highlighted: false,
  },
  pro: {
    id: 'pro', name: 'Pro', tagline: 'Unlimited access — best for professionals.',
    priceLabel: '$35', priceSuffix: '/ month', savingsNote: '🌟 Most Popular',
    limits: { interviewQuestionsPerDay: -1, screenAnalysisPerDay: -1, chatMessagesPerDay: -1, remindersPerDay: -1, generateAnswerPerDay: -1, trialDays: 0 },
    features: ['Unlimited AI responses', 'Unlimited interview mode', 'Unlimited screen analysis', 'Unlimited generate answers', 'Unlimited reminders', 'Access to latest AI models', 'Priority support'],
    highlighted: true,
  },
  pro_plus: {
    id: 'pro_plus', name: 'Pro (Yearly)', tagline: 'Best value — save big with annual billing.',
    priceLabel: '$399', priceSuffix: '/ year', savingsNote: 'Save $21/year vs monthly',
    limits: { interviewQuestionsPerDay: -1, screenAnalysisPerDay: -1, chatMessagesPerDay: -1, remindersPerDay: -1, generateAnswerPerDay: -1, trialDays: 0 },
    features: ['Everything in Pro', 'Unlimited AI responses', 'Unlimited interview mode', 'Unlimited screen analysis', 'Unlimited generate answers', 'Unlimited reminders', 'Priority support', 'Best price — billed annually'],
    highlighted: false,
  },
};

export const PLAN_ORDER: PlanId[] = ['free', 'day', 'weekly', 'pro', 'pro_plus'];

export type UsageAction = 'interview_question' | 'screen_analysis' | 'chat_message' | 'reminder' | 'generate_answer';

export const ACTION_TO_LIMIT_KEY: Record<UsageAction, keyof PlanLimits> = {
  interview_question: 'interviewQuestionsPerDay',
  screen_analysis: 'screenAnalysisPerDay',
  chat_message: 'chatMessagesPerDay',
  reminder: 'remindersPerDay',
  generate_answer: 'generateAnswerPerDay',
};

export function isTrialExpired(trialStartDate: string | null, trialDays: number): boolean {
  if (!trialStartDate || trialDays <= 0) return false;
  const start = new Date(trialStartDate);
  const now = new Date();
  const diffDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > trialDays;
}

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
