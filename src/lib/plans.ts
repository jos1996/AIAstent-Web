export type PlanId = 'free' | 'weekly' | 'pro' | 'pro_plus';
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
    id: 'free', name: 'Free', tagline: 'Try it free for 7 days.',
    priceLabel: 'Free', priceSuffix: '7 days', savingsNote: '',
    limits: { interviewQuestionsPerDay: 3, screenAnalysisPerDay: 2, chatMessagesPerDay: 5, remindersPerDay: 5, generateAnswerPerDay: 3, trialDays: 7 },
    features: ['Limited AI responses (5/day)', 'Interview mode (3 questions/day)', 'Screen analysis (2/day)', 'Generate answers (3/day)', 'Setup reminders (5/day)', '7-day free trial'],
    highlighted: false,
  },
  weekly: {
    id: 'weekly', name: 'Weekly', tagline: 'Perfect for short-term projects.',
    priceLabel: '$6', priceSuffix: '/ week', savingsNote: '',
    limits: { interviewQuestionsPerDay: -1, screenAnalysisPerDay: -1, chatMessagesPerDay: -1, remindersPerDay: -1, generateAnswerPerDay: -1, trialDays: 0 },
    features: ['Unlimited AI responses', 'Unlimited interview mode', 'Unlimited screen analysis', 'Unlimited reminders', 'Unlimited access to latest AI models', 'Priority support'],
    highlighted: false,
  },
  pro: {
    id: 'pro', name: 'Pro', tagline: 'Most recommended — unlimited access.',
    priceLabel: '$19', priceSuffix: '/ month', savingsNote: '🌟 Most Popular',
    limits: { interviewQuestionsPerDay: -1, screenAnalysisPerDay: -1, chatMessagesPerDay: -1, remindersPerDay: -1, generateAnswerPerDay: -1, trialDays: 0 },
    features: ['Unlimited AI responses', 'Unlimited interview mode', 'Unlimited screen analysis', 'Unlimited reminders', 'Unlimited access to latest AI models', 'Priority support'],
    highlighted: true,
  },
  pro_plus: {
    id: 'pro_plus', name: 'Pro Plus', tagline: 'Best value, billed annually.',
    priceLabel: '$80', priceSuffix: '/ year', savingsNote: 'Save $148/year vs monthly',
    limits: { interviewQuestionsPerDay: -1, screenAnalysisPerDay: -1, chatMessagesPerDay: -1, remindersPerDay: -1, generateAnswerPerDay: -1, trialDays: 0 },
    features: ['Everything in Pro', 'Unlimited AI responses', 'Unlimited interview mode', 'Unlimited screen analysis', 'Unlimited reminders', 'Priority support', 'Best price — save 65%'],
    highlighted: false,
  },
};

export const PLAN_ORDER: PlanId[] = ['free', 'weekly', 'pro', 'pro_plus'];

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
