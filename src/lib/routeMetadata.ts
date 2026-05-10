/**
 * Single source of truth for SEO metadata per route.
 *
 * Used by:
 *   - `scripts/prerender-ssr.mjs` (build-time) to stamp the correct head and
 *     JSON-LD into each prerendered HTML file.
 *   - `SEOHead` component (runtime) for client-side navigations.
 *
 * Keep titles ≤ 60 chars and descriptions 140-160 chars for best SERP
 * snippet behavior.
 */

export interface RouteMeta {
  /** Path including leading slash. `/` means home. */
  path: string;
  /** <title> — keep ≤ 60 chars when possible. */
  title: string;
  /** <meta name="description"> — 140-160 chars sweet spot. */
  description: string;
  /** Comma-separated keyword list for the legacy meta keywords tag. */
  keywords?: string;
  /** Breadcrumb labels (the last item is the current page). */
  breadcrumbs?: { name: string; url: string }[];
  /** og:type — defaults to "website". */
  ogType?: 'website' | 'article' | 'product';
  /** og:image override — defaults to the global brand image. */
  ogImage?: string;
  /**
   * Whether to mark `noindex`. Use sparingly (settings/auth/util pages only).
   */
  noindex?: boolean;
  /** Optional extra JSON-LD payloads (FAQ schema is built from `faqs`). */
  faqs?: { q: string; a: string }[];
}

const ORIGIN = 'https://www.helplyai.co';

export const ROUTE_META: RouteMeta[] = [
  {
    path: '/',
    title: 'HelplyAI — #1 AI Interview Copilot | Real-Time Answers, Stealth Mode',
    description:
      'HelplyAI is the best AI interview copilot in 2026. Beat Final Round AI, LockedIn AI & Sensei AI. Real-time AI answers during Zoom, Google Meet & Teams — undetectable stealth mode. Try free.',
    keywords:
      'AI interview helper, real time interview helper, online interview helper, AI interview assistant, zoom AI interview helper, google meet interview helper, ai interview copilot, best AI interview tool 2026, ai interview helper free, crack interview with AI, real-time interview assistant, coding interview AI, FAANG interview prep, behavioral interview AI, technical interview AI, interview answer generator, HelplyAI, helply ai, Final Round AI alternative, LockedIn AI alternative',
  },
  /* ─── HEAD / HUB SEO PAGES (highest priority) ─── */
  {
    path: '/ai-interview-helper',
    title: 'AI Interview Helper — Crack Any Job Interview with Real-Time AI | HelplyAI',
    description:
      'HelplyAI is the #1 AI interview helper of 2026. Get real-time AI assistance during live interviews, practice mock interviews, and crack technical, HR, and behavioral interviews. Best alternative to Final Round AI & LockedIn AI.',
    keywords:
      'AI interview helper, real-time interview assistant, AI mock interview, best AI interview tool 2026, FAANG interview prep, Final Round AI alternative, LockedIn AI alternative',
    breadcrumbs: [
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'AI Interview Helper', url: `${ORIGIN}/ai-interview-helper` },
    ],
  },
  {
    path: '/online-interview-helper',
    title: 'Online Interview Helper — Real-Time AI for Remote Interviews 2026 | HelplyAI',
    description:
      'HelplyAI is the #1 online interview helper of 2026. Real-time AI answers, transcription, and stealth coaching for Zoom, Google Meet, Microsoft Teams, and 10+ remote interview platforms. Free plan · Mac & Windows.',
    keywords:
      'online interview helper, real time interview helper, online interview ai, remote interview helper, virtual interview helper, online interview assistant, online interview tool',
    breadcrumbs: [
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'Online Interview Helper', url: `${ORIGIN}/online-interview-helper` },
    ],
  },
  {
    path: '/mock-interview-ai',
    title: 'Mock Interview AI — Free AI Mock Interviewer for 2026 | HelplyAI',
    description:
      'Practice unlimited AI mock interviews with HelplyAI. Realistic technical, behavioral, and HR rounds with instant feedback, scoring, and STAR-method coaching. Free to start.',
    keywords:
      'mock interview ai, ai mock interview, free mock interview, mock interviewer ai, online mock interview, mock interview practice, behavioral mock interview',
    breadcrumbs: [
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'Mock Interview AI', url: `${ORIGIN}/mock-interview-ai` },
    ],
  },
  {
    path: '/ai-resume-builder',
    title: 'AI Resume Builder — Free Resume Maker That Beats ATS in 2026 | HelplyAI',
    description:
      'HelplyAI is the #1 free AI resume builder of 2026. Upload a job description, generate an ATS-optimized resume in 30 seconds, pick from executive / modern / clean templates, and download as PDF.',
    keywords:
      'ai resume builder, free resume builder, resume maker, ats resume builder, ai resume generator, free resume maker, online resume builder, ai resume writer',
    breadcrumbs: [
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'AI Resume Builder', url: `${ORIGIN}/ai-resume-builder` },
    ],
  },
  {
    path: '/ai-job-search',
    title: 'AI Job Search — Find Roles, Tailor Resumes, Auto-Apply | HelplyAI',
    description:
      'HelplyAI is the smartest AI job search tool of 2026. Search 1M+ jobs, instant resume tailoring, AI cover letters, salary signals, and one-click apply on Indeed, LinkedIn, and Greenhouse. Free to start.',
    keywords:
      'ai job search, ai job board, job search ai, ai job matching, ai job apply, auto apply jobs, ai cover letter, ai resume tailoring, ai job recommendations',
    breadcrumbs: [
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'AI Job Search', url: `${ORIGIN}/ai-job-search` },
    ],
  },
  {
    path: '/free-ai-interview-helper',
    title: 'Free AI Interview Helper — Real-Time AI Answers, No Credit Card | HelplyAI',
    description:
      'HelplyAI is the only truly free AI interview helper of 2026. Real-time AI answers during Zoom, Google Meet, and Teams interviews. Free plan with stealth mode, mock interviews, and resume builder — no credit card required.',
    keywords:
      'free ai interview helper, free interview copilot, free real time interview helper, free ai interview assistant, free ai mock interview, free for students',
    breadcrumbs: [
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'Free AI Interview Helper', url: `${ORIGIN}/free-ai-interview-helper` },
    ],
  },
  {
    path: '/google-meet-ai-interview-helper',
    title: 'Google Meet AI Interview Helper — Real-Time AI Answers in Meet | HelplyAI',
    description:
      'HelplyAI is the #1 Google Meet AI interview helper of 2026. Real-time AI answers, transcription, and stealth-mode coaching during Google Meet interviews. Free plan · Mac & Windows.',
    keywords:
      'google meet ai interview helper, google meet interview helper, ai for google meet, google meet copilot, real time interview google meet',
    breadcrumbs: [
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'Google Meet AI Helper', url: `${ORIGIN}/google-meet-ai-interview-helper` },
    ],
  },
  {
    path: '/microsoft-teams-ai-interview-helper',
    title: 'Microsoft Teams AI Interview Helper — Real-Time AI Answers in Teams | HelplyAI',
    description:
      'HelplyAI is the #1 Microsoft Teams AI interview helper of 2026. Real-time AI answers and stealth coaching during Teams interviews. Works on Microsoft Teams Free, Business, and Enterprise.',
    keywords:
      'microsoft teams ai interview helper, ms teams ai interview helper, teams ai interview, ms teams copilot interview, ai for ms teams',
    breadcrumbs: [
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'Microsoft Teams AI Helper', url: `${ORIGIN}/microsoft-teams-ai-interview-helper` },
    ],
  },
  {
    path: '/ai-interview-answer-generator',
    title: 'AI Interview Answer Generator — Instant STAR-Style Answers | HelplyAI',
    description:
      'HelplyAI is the most accurate AI interview answer generator of 2026. Paste any interview question and get a structured, STAR-method, recruiter-grade answer in seconds. Free, supports all interview types.',
    keywords:
      'ai interview answer generator, interview answer generator, behavioral interview answer ai, free interview answer ai, star method generator',
    breadcrumbs: [
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'AI Interview Answer Generator', url: `${ORIGIN}/ai-interview-answer-generator` },
    ],
  },

  /* ─── PROGRAMMATIC: COMPANY × ROLE ─── */
  {
    path: '/google-interview-ai-helper',
    title: 'Google Interview AI Helper — Crack Google Coding & Behavioral 2026 | HelplyAI',
    description:
      'Crack the Google interview loop with HelplyAI: real-time AI for coding rounds, system design, and Googleyness behavioral. Tuned for L4-L6 SWE, PM, and Data Science roles. Free to start.',
    keywords:
      'google interview ai helper, google interview prep, google coding interview ai, google system design ai, googleyness interview, l4 interview, l5 interview, l6 interview',
    breadcrumbs: [
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'Google Interview AI', url: `${ORIGIN}/google-interview-ai-helper` },
    ],
  },
  {
    path: '/amazon-interview-ai-helper',
    title: 'Amazon Interview AI Helper — Crack Leadership Principles in 2026 | HelplyAI',
    description:
      'Crack the Amazon interview loop with HelplyAI: real-time AI calibrated for Amazon Leadership Principles, system design depth, bar-raiser rounds, and SDE/PM behavioral. Free plan available.',
    keywords:
      'amazon interview ai helper, amazon leadership principles ai, amazon interview prep, bar raiser interview, sde amazon interview, amazon pm interview',
    breadcrumbs: [
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'Amazon Interview AI', url: `${ORIGIN}/amazon-interview-ai-helper` },
    ],
  },
  {
    path: '/meta-interview-ai-helper',
    title: 'Meta Interview AI Helper — Crack Meta Coding & Product Sense 2026 | HelplyAI',
    description:
      'Real-time AI for Meta interview loops: coding rounds, system design, product execution, leadership behavioral. Tuned for E4-E6 SWE, PM, and Data Engineer roles. Free plan available.',
    keywords:
      'meta interview ai helper, facebook interview ai, meta coding interview, meta system design, meta pm interview, e4 e5 e6 interview',
    breadcrumbs: [
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'Meta Interview AI', url: `${ORIGIN}/meta-interview-ai-helper` },
    ],
  },
  {
    path: '/microsoft-interview-ai-helper',
    title: 'Microsoft Interview AI Helper — Crack Microsoft SDE/PM Loop 2026 | HelplyAI',
    description:
      'HelplyAI is calibrated for Microsoft interview loops: coding, system design, growth mindset, customer obsession. Real-time AI in Microsoft Teams interviews. Free plan available.',
    keywords:
      'microsoft interview ai helper, microsoft sde interview, microsoft pm interview, microsoft growth mindset interview, microsoft system design',
    breadcrumbs: [
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'Microsoft Interview AI', url: `${ORIGIN}/microsoft-interview-ai-helper` },
    ],
  },
  {
    path: '/mckinsey-case-interview-ai',
    title: 'McKinsey Case Interview AI — Real-Time AI for Case Rounds 2026 | HelplyAI',
    description:
      'Crack McKinsey, BCG, and Bain case interviews with HelplyAI. Real-time AI structuring, hypothesis generation, math, and recommendation coaching. Free plan available.',
    keywords:
      'mckinsey case interview ai, bcg case interview ai, bain case interview ai, consulting case interview ai, mbb interview prep ai',
    breadcrumbs: [
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'McKinsey Case Interview AI', url: `${ORIGIN}/mckinsey-case-interview-ai` },
    ],
  },
  {
    path: '/goldman-sachs-interview-ai',
    title: 'Goldman Sachs Interview AI Helper — Finance Technicals + Behavioral 2026 | HelplyAI',
    description:
      'HelplyAI for Goldman Sachs, Morgan Stanley, JP Morgan & boutique finance interviews: real-time AI for DCF, M&A, comps, brain teasers, and the fit interview. Free plan available.',
    keywords:
      'goldman sachs interview ai, investment banking interview ai, finance interview prep ai, dcf interview, m&a interview, fit interview ai',
    breadcrumbs: [
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'Goldman Sachs Interview AI', url: `${ORIGIN}/goldman-sachs-interview-ai` },
    ],
  },
  {
    path: '/faang-interview-ai-helper',
    title: 'FAANG Interview AI Helper — Real-Time AI for Google, Meta, Apple, Amazon, Netflix | HelplyAI',
    description:
      'HelplyAI is the #1 AI interview helper for FAANG / MAANG companies. Tuned rubrics for Google, Meta, Apple, Amazon, Netflix interviews — coding, system design, behavioral. Free plan available.',
    keywords:
      'faang interview ai helper, maang interview prep, google amazon meta apple netflix interview, faang coding ai, faang system design ai',
    breadcrumbs: [
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'FAANG Interview AI', url: `${ORIGIN}/faang-interview-ai-helper` },
    ],
  },
  {
    path: '/coding-interview-ai-helper',
    title: 'Coding Interview AI Helper — Live Code Analysis & Hints 2026 | HelplyAI',
    description:
      "HelplyAI's coding interview helper reads your screen during live coding rounds, gives optimization hints, complexity feedback, and bug fixes in real time. Works on HackerRank, CoderPad, LeetCode, Karat. Free.",
    keywords:
      'coding interview ai helper, leetcode ai helper, hackerrank ai helper, coderpad ai helper, karat interview ai, live coding interview ai',
    breadcrumbs: [
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'Coding Interview AI', url: `${ORIGIN}/coding-interview-ai-helper` },
    ],
  },
  {
    path: '/system-design-interview-ai',
    title: 'System Design Interview AI — Real-Time AI for L5/L6/Staff Designs | HelplyAI',
    description:
      'Crack system design interviews with HelplyAI: real-time AI for requirements, capacity, API, deep dives, and trade-offs. Tuned for senior, staff, and principal-level loops. Free to start.',
    keywords:
      'system design interview ai, staff system design ai, l5 system design, l6 system design, senior staff principal interview ai',
    breadcrumbs: [
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'System Design Interview AI', url: `${ORIGIN}/system-design-interview-ai` },
    ],
  },
  {
    path: '/behavioral-interview-ai-helper',
    title: 'Behavioral Interview AI Helper — STAR Method on Demand | HelplyAI',
    description:
      'HelplyAI generates and live-coaches behavioral interview answers in perfect STAR-method form. Calibrated for FAANG, consulting, banking, and Fortune 500 behavioral rounds. Free.',
    keywords:
      'behavioral interview ai, star method ai, behavioral interview generator, behavioral interview ai helper, behavioral question ai',
    breadcrumbs: [
      { name: 'Home', url: `${ORIGIN}/` },
      { name: 'Behavioral Interview AI', url: `${ORIGIN}/behavioral-interview-ai-helper` },
    ],
  },
];

export const ROUTE_META_BY_PATH: Record<string, RouteMeta> = Object.fromEntries(
  ROUTE_META.map((m) => [m.path, m]),
);

export function canonicalUrl(path: string): string {
  const cleaned = path.startsWith('/') ? path : `/${path}`;
  return cleaned === '/' ? `${ORIGIN}/` : `${ORIGIN}${cleaned}`;
}
