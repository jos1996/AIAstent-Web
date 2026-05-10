import CompanyInterviewPage from './CompanyInterviewPage';

/**
 * Thin wrappers around `CompanyInterviewPage` — one per variant. Keeping
 * them as named exports makes routing in `App.tsx` clean and lets each page
 * component live behind its own React.lazy() boundary.
 */

export function GoogleInterviewAIPage() {
  return (
    <CompanyInterviewPage
      variant="google"
      title="Google Interview AI Helper — Crack Google Coding & Behavioral 2026 | HelplyAI"
      description="Crack the Google interview loop with HelplyAI: real-time AI for coding rounds, system design, and Googleyness behavioral. Tuned for L4-L6 SWE, PM, and Data Science roles. Free to start."
      keywords="google interview ai helper, google interview prep, google coding interview ai, google system design ai, googleyness interview, l4 interview, l5 interview, l6 interview"
      breadcrumbName="Google Interview AI"
    />
  );
}

export function AmazonInterviewAIPage() {
  return (
    <CompanyInterviewPage
      variant="amazon"
      title="Amazon Interview AI Helper — Crack Leadership Principles in 2026 | HelplyAI"
      description="Crack the Amazon interview loop with HelplyAI: real-time AI calibrated for Amazon Leadership Principles, system design depth, bar-raiser rounds, and SDE/PM behavioral. Free plan available."
      keywords="amazon interview ai helper, amazon leadership principles ai, amazon interview prep, bar raiser interview, sde amazon interview, amazon pm interview"
      breadcrumbName="Amazon Interview AI"
    />
  );
}

export function MetaInterviewAIPage() {
  return (
    <CompanyInterviewPage
      variant="meta"
      title="Meta Interview AI Helper — Crack Meta Coding & Product Sense 2026 | HelplyAI"
      description="Real-time AI for Meta interview loops: coding rounds, system design, product execution, leadership behavioral. Tuned for E4-E6 SWE, PM, and Data Engineer roles. Free plan available."
      keywords="meta interview ai helper, facebook interview ai, meta coding interview, meta system design, meta pm interview, e4 e5 e6 interview"
      breadcrumbName="Meta Interview AI"
    />
  );
}

export function MicrosoftInterviewAIPage() {
  return (
    <CompanyInterviewPage
      variant="microsoft"
      title="Microsoft Interview AI Helper — Crack Microsoft SDE/PM Loop 2026 | HelplyAI"
      description="HelplyAI is calibrated for Microsoft interview loops: coding, system design, growth mindset, customer obsession. Real-time AI in Microsoft Teams interviews. Free plan available."
      keywords="microsoft interview ai helper, microsoft sde interview, microsoft pm interview, microsoft growth mindset interview, microsoft system design"
      breadcrumbName="Microsoft Interview AI"
    />
  );
}

export function McKinseyInterviewAIPage() {
  return (
    <CompanyInterviewPage
      variant="mckinsey"
      path="/mckinsey-case-interview-ai"
      title="McKinsey Case Interview AI — Real-Time AI for Case Rounds 2026 | HelplyAI"
      description="Crack McKinsey, BCG, and Bain case interviews with HelplyAI. Real-time AI structuring, hypothesis generation, math, and recommendation coaching. Free plan available."
      keywords="mckinsey case interview ai, bcg case interview ai, bain case interview ai, consulting case interview ai, mbb interview prep ai"
      breadcrumbName="McKinsey Case Interview AI"
    />
  );
}

export function GoldmanSachsInterviewAIPage() {
  return (
    <CompanyInterviewPage
      variant="goldman"
      path="/goldman-sachs-interview-ai"
      title="Goldman Sachs Interview AI Helper — Finance Technicals + Behavioral 2026 | HelplyAI"
      description="HelplyAI for Goldman Sachs, Morgan Stanley, JP Morgan & boutique finance interviews: real-time AI for DCF, M&A, comps, brain teasers, and the fit interview. Free plan available."
      keywords="goldman sachs interview ai, investment banking interview ai, finance interview prep ai, dcf interview, m&a interview, fit interview ai"
      breadcrumbName="Goldman Sachs Interview AI"
    />
  );
}
