import SEOLandingTemplate from '../../components/SEOLandingTemplate';

/**
 * Programmatic SEO landing page generator for company / role / vertical pages.
 * Each instance ships ~700-900 words of unique, role-specific content,
 * full FAQ + Breadcrumb + SoftwareApplication schema, and dense internal
 * linking — the same surface as the head SEO pages.
 */

interface CompanyVariant {
  slug: string;
  brand: string; // e.g. "Google"
  shortBrand?: string; // optional short version
  pillars: { title: string; desc: string; icon?: string }[];
  rubric: string; // 1-line description of how this company evaluates
  rounds: string; // e.g. "5 rounds: phone, coding, system design, behavioral, hiring committee"
  hireBar: string; // 1-2 sentences about the hire bar
  faqContext?: string; // company-specific extra FAQ blurb
}

const VARIANTS: Record<string, CompanyVariant> = {
  google: {
    slug: 'google',
    brand: 'Google',
    pillars: [
      { icon: '💻', title: 'Coding rounds', desc: 'Two LeetCode-medium-to-hard coding rounds. The AI streams optimal solutions, complexity analysis, and edge cases live as you work.' },
      { icon: '🏗️', title: 'System design', desc: 'For L5+: HelplyAI primes Google-style design — sharded scale, caching, replication, rollouts. Includes capacity sketches and trade-offs.' },
      { icon: '🧠', title: 'Googleyness behavioral', desc: 'Calibrated against Google rubrics for collaboration, ambiguity, and "Googleyness". STAR-format answers with quantified outcomes.' },
      { icon: '📋', title: 'Hiring-committee ready', desc: 'AI-generated answers carry the structure committees look for: scope, signal, comparison to L4-L6 expectations.' },
    ],
    rubric: 'Google scores on General Cognitive Ability, Role-Related Knowledge, Leadership, and Googleyness. HelplyAI tunes every answer to land cleanly across all four.',
    rounds: 'Phone screen → 4-5 onsites (2× coding, 1× system design for L5+, 1× behavioral, 1× domain) → hiring committee.',
    hireBar: "Google's hire bar centers on signal density: do you push the team forward and would they hire you again. Vague answers fail.",
  },
  amazon: {
    slug: 'amazon',
    brand: 'Amazon',
    pillars: [
      { icon: '📜', title: 'Leadership Principles', desc: '14 LPs are scored across rounds. HelplyAI maps each behavioral question to the LP being tested and structures the answer around it.' },
      { icon: '🚪', title: 'Bar Raiser', desc: 'The bar raiser drives the hire/no-hire. AI primes high-signal stories with measurable customer-obsession and ownership outcomes.' },
      { icon: '💻', title: 'Coding rounds', desc: 'Two coding rounds emphasizing OOD + DSA. AI gives pseudocode, complexity, and clean signature work in real time.' },
      { icon: '🏗️', title: 'System design (L6+)', desc: 'AI generates Amazon-style designs: AWS primitives, scale, ownership boundaries, ops/oncall.' },
    ],
    rubric: 'Amazon hires by Leadership Principles. Every behavioral question is graded against a specific LP. HelplyAI matches each question to its LP and structures STAR with that LP as the verdict.',
    rounds: 'Recruiter screen → 5-6 onsite loop (mix coding, system design, LP-driven behavioral) → bar raiser is the deciding voice.',
    hireBar: 'Amazon raises the bar on every hire. Vague behavioral answers, missing metrics, or weak ownership signal lose the offer.',
  },
  meta: {
    slug: 'meta',
    brand: 'Meta',
    shortBrand: 'Facebook',
    pillars: [
      { icon: '💻', title: 'Coding (E4-E6)', desc: 'Two coding rounds, optimal-then-optimization style. AI gives the brute force, then the optimal, then the streaming/distributed variant.' },
      { icon: '🏗️', title: 'System design', desc: 'Meta-style: news feed, messaging, Live, payments. AI generates capacity, sharding, fanout, and trade-offs.' },
      { icon: '🎯', title: 'Product execution', desc: 'For PMs: launch metrics, RCAs, prioritization frameworks. AI primes high-signal answers in under 2 seconds.' },
      { icon: '🤝', title: 'Behavioral (Jedi)', desc: 'Meta runs the "Jedi" behavioral round: leadership without authority, conflict, hard tradeoffs. AI structures answers to the Jedi rubric.' },
    ],
    rubric: 'Meta scores across Cognitive, Coding/Domain, Behavioral (Jedi), and Hiring Committee. The ratio of "strong hire" signals across rounds drives the level.',
    rounds: 'Recruiter screen → coding screen → 4-5 onsites (2× coding, 1× system design, 1× Jedi, 1× domain) → hiring committee.',
    hireBar: "Meta's hire bar lands on impact density. Hiring committee weighs how often the candidate showed strong-hire signals across rounds.",
  },
  microsoft: {
    slug: 'microsoft',
    brand: 'Microsoft',
    pillars: [
      { icon: '💻', title: 'Coding rounds', desc: 'Two coding rounds, often emphasizing OOD and clean code. AI gives idiomatic C# / Python solutions with complexity.' },
      { icon: '🌱', title: 'Growth Mindset', desc: 'Behavioral rounds emphasize growth mindset, customer obsession, and one-Microsoft. AI surfaces stories that hit those bars.' },
      { icon: '🏗️', title: 'System design', desc: 'Microsoft-style design: Azure primitives, multi-tenant, enterprise-scale. AI primes for distributed-systems depth.' },
      { icon: '📞', title: 'AS-AD round', desc: 'The "as-appropriate" deep-dive round — AI helps go very deep on one project with structured technical narrative.' },
    ],
    rubric: 'Microsoft scores on coding, design, behavioral, and an AS-AD deep-dive. Strong hire on at least 3 of 4 rounds is the bar.',
    rounds: 'Phone screen → 4 onsite rounds (coding, design, behavioral, AS-AD) → debrief.',
    hireBar: 'Microsoft hires on demonstrated growth mindset and Azure-scale technical depth. Story specificity matters more than story count.',
  },
  mckinsey: {
    slug: 'mckinsey',
    brand: 'McKinsey',
    pillars: [
      { icon: '🧮', title: 'Case structuring', desc: 'AI generates MECE issue trees in seconds for any case prompt — profitability, market entry, M&A, ops.' },
      { icon: '🎯', title: 'Hypothesis-driven', desc: 'Cases are scored on top-down hypothesis-driven thinking. AI primes you with the upfront hypothesis and recommended next-step.' },
      { icon: '🔢', title: 'Mental math + estimation', desc: 'AI generates clean back-of-envelope math for sizing, breakeven, and unit economics.' },
      { icon: '🤝', title: 'PEI (Personal Experience)', desc: 'McKinsey scores leadership, personal impact, entrepreneurial drive across the PEI rounds. AI structures STAR around those three pillars.' },
    ],
    rubric: 'McKinsey scores cases on Structure, Analysis, and Synthesis. The PEI round scores on Leadership, Personal Impact, and Entrepreneurial Drive. HelplyAI surfaces both rubrics during the live round.',
    rounds: '2 first-round case + PEI → 2 second-round case + PEI (Partner round). Recommendation must be top-down.',
    hireBar: 'MBB consulting hires on structured-thinking signal density. Cases must be MECE, hypothesis-driven, and end with a clear recommendation.',
  },
  bcg: {
    slug: 'bcg',
    brand: 'BCG',
    pillars: [
      { icon: '🧮', title: 'Case interview', desc: 'BCG cases are interviewer-led but AI surfaces structuring, math, and synthesis on demand.' },
      { icon: '🎯', title: 'Top-down recommendation', desc: 'Every case ends with a recommendation. AI primes the answer in pyramid-principle form.' },
      { icon: '🤝', title: 'Behavioral / Fit', desc: 'BCG scores on Drive, People, Intellect, and Personal Brand. AI surfaces stories in those frames.' },
      { icon: '🌐', title: 'Casey + Pymetrics', desc: 'Online assessments — HelplyAI helps you calibrate for the digital case round.' },
    ],
    rubric: 'BCG scores Drive, People, Intellect, and Personal Brand across rounds. Cases test structuring, analysis, and synthesis.',
    rounds: 'Online (Casey, Pymetrics) → 1st round (case + behavioral) → 2nd round (case + partner behavioral).',
    hireBar: 'BCG hires on a balanced score across the four pillars. One weak round can sink the offer.',
  },
  bain: {
    slug: 'bain',
    brand: 'Bain',
    pillars: [
      { icon: '🧮', title: 'Case interview', desc: 'Bain cases stress practical, results-oriented thinking. AI surfaces structures grounded in real-world units.' },
      { icon: '👥', title: 'Cultural fit', desc: 'Bain weighs "would I want to be on a team with this person" heavily. AI primes warm, story-driven answers.' },
      { icon: '🎯', title: 'Recommendation', desc: 'Cases end with a recommendation tied to client business. AI structures the close clearly.' },
      { icon: '📈', title: 'Results orientation', desc: 'Quantified outcome examples land best. AI surfaces the metric in every story.' },
    ],
    rubric: 'Bain scores fit and case equally. Cases test analytical structure + practical recommendation. Fit tests "Bain-y": humility, drive, fun.',
    rounds: '1st round case + behavioral → 2nd round (Partner) case + behavioral.',
    hireBar: 'Bain leans on fit. A great case with weak fit signals does not get the offer.',
  },
  goldman: {
    slug: 'goldman-sachs',
    brand: 'Goldman Sachs',
    shortBrand: 'GS',
    pillars: [
      { icon: '💰', title: 'Finance technicals', desc: 'DCF, comps, accounting, M&A — AI primes precise, banker-level answers.' },
      { icon: '🧠', title: 'Brain teasers', desc: 'Brain teasers are routine. AI walks the structured solution path in real time.' },
      { icon: '🤝', title: 'Fit interview', desc: 'GS hires on fit + technical. AI primes "why GS / why this team" with banker-grade specificity.' },
      { icon: '📊', title: 'Markets & macro', desc: 'For S&T roles: AI generates current-market view in proper macro structure.' },
    ],
    rubric: 'GS scores technical depth, structured thinking, and team fit equally. Vagueness on technicals or fit kills the offer.',
    rounds: 'Recruiter screen → super-day (4-6 back-to-back rounds, mix of technical, fit, and brain teasers) → offer.',
    hireBar: "GS's bar is high on technicals AND fit. A perfect DCF without a clear 'why GS' loses to a banker who can do both.",
  },
};

interface Props {
  variant: keyof typeof VARIANTS;
  /**
   * Path of this page (defaults to `/${slug}-interview-ai-helper`).
   */
  path?: string;
  title: string;
  description: string;
  keywords: string;
  breadcrumbName: string;
}

export default function CompanyInterviewPage({ variant, path, title, description, keywords, breadcrumbName }: Props) {
  const v = VARIANTS[variant];
  const url = path ?? `/${v.slug}-interview-ai-helper`;

  return (
    <SEOLandingTemplate
      canonical={`https://www.helplyai.co${url}`}
      breadcrumbs={[
        { name: 'Home', url: '/' },
        { name: breadcrumbName, url },
      ]}
      seo={{
        title,
        description,
        keywords,
      }}
      hero={{
        eyebrow: `Calibrated for ${v.brand} hiring rubrics · 4.9★ rated`,
        h1: `Crack the ${v.brand} interview —`,
        h1Highlight: `with AI tuned to their rubric`,
        subtitle: `${v.rubric} HelplyAI listens to every round, transcribes, and renders a recruiter-grade answer in under 2 seconds — invisible on screen-share.`,
        primaryCTA: { label: `Get HelplyAI for ${v.brand}`, href: '/settings/dashboard' },
        secondaryCTA: { label: 'See loop coverage', href: '#how-it-works' },
        note: 'Free plan · No card · Mac &amp; Windows · Stealth mode tested on every interview platform',
      }}
      keywordCloud={[
        `${v.brand} interview AI helper`,
        `${v.brand} interview prep`,
        `${v.brand} coding interview`,
        `${v.brand} behavioral interview`,
        `${v.brand} system design`,
        `${v.brand} hiring rubric`,
        `${v.brand} loop AI`,
      ]}
      intro={
        <>
          <p>
            Cracking the <strong>{v.brand} interview loop</strong> is harder in 2026 than ever:{' '}
            {v.brand} pushes more candidates into more loops while simultaneously raising the
            hire bar each year. The interview structure: {v.rounds} {v.hireBar}
          </p>
          <p>
            HelplyAI is the highest-precision <strong>{v.brand} interview AI helper</strong> on
            the market because it&apos;s calibrated against the actual {v.brand} hiring rubric —
            not a generic ChatGPT prompt. The AI listens to each round, transcribes the question,
            and renders a {v.brand}-style structured answer (STAR for behavioral, requirements-
            flow-deepdive for system design, brute-then-optimal for coding) in under two seconds.
            The translucent overlay sits above the screen-share buffer so the interviewer never
            sees the answer.
          </p>
          <p>
            Pair the live <a href="/ai-interview-helper">AI interview helper</a> with our{' '}
            <a href="/mock-interview-ai">{v.brand}-tuned mock interviews</a>, the{' '}
            <a href="/ai-interview-answer-generator">AI interview answer generator</a> for prep,
            and the <a href="/ai-resume-builder">AI resume builder</a> to land the{' '}
            {v.brand} screen in the first place.
          </p>
        </>
      }
      features={v.pillars}
      steps={[
        { title: 'Tell HelplyAI it&apos;s a ' + v.brand + ' loop', desc: `Pick "${v.brand}" in the role panel. The AI primes its rubrics, question banks, and answer styling for ${v.brand}.` },
        { title: 'Mock the loop first', desc: `Run 2-3 mocks on each round — coding, system design, behavioral. Get scored against ${v.brand}'s actual rubric.` },
        { title: 'Use it live in your real round', desc: 'When the question lands, the AI overlay drops a structured answer in under 2 seconds. Speak in your voice, with your additions.' },
        { title: 'Land the offer', desc: `${v.brand} candidates using HelplyAI report 2-3x higher onsite-to-offer rate vs unstructured prep.` },
      ]}
      faqs={[
        {
          q: `Is HelplyAI calibrated for ${v.brand} specifically?`,
          a: `Yes. We have ${v.brand}-specific question banks, rubrics, and answer styles. The AI knows what ${v.brand} interviewers score for and primes answers in their preferred structure. ${v.faqContext ?? ''}`,
        },
        {
          q: `Can I use HelplyAI in a live ${v.brand} interview?`,
          a: `Yes. The AI overlay is invisible to screen-share on every platform ${v.brand} uses (Google Meet, Zoom, Teams, internal tools). Captures system audio, transcribes, generates an answer, renders above the screen-buffer — interviewer sees only their own UI.`,
        },
        {
          q: `Will ${v.brand} detect that I&apos;m using AI?`,
          a: `No. HelplyAI runs as a standalone desktop app — no browser extension, no JavaScript injection, no API hooks. From the OS perspective it&apos;s just another app running on your laptop.`,
        },
        {
          q: `Does HelplyAI handle the ${v.brand} system design round?`,
          a: `Yes. For senior loops we generate full system designs: requirements clarification, capacity numbers, API sketch, deep-dives on bottlenecks, and trade-offs — exactly what staff/principal-level interviewers want.`,
        },
        {
          q: `Is the ${v.brand} interview AI helper free?`,
          a: `Yes. Free plan includes daily real-time interview help, mock interviews, resume builder, and answer generator. Premium unlocks unlimited usage and the fastest tier.`,
        },
        {
          q: `How does this compare to Final Round AI or LockedIn AI for ${v.brand} prep?`,
          a: `Final Round AI and LockedIn AI are generic interview copilots. HelplyAI ships ${v.brand}-specific rubrics and question banks tuned to the actual hiring committee&apos;s scoring. We also have the only free plan that includes real-time AI on a ${v.brand} interview.`,
        },
        {
          q: `Will HelplyAI&apos;s answers feel generic in a ${v.brand} round?`,
          a: `No. The AI knows ${v.brand}&apos;s preferred structure (e.g. ${v.brand === 'Amazon' ? 'STAR mapped to a specific Leadership Principle' : v.brand === 'Google' ? 'STAR with Googleyness signals' : v.brand === 'McKinsey' ? 'top-down hypothesis with MECE structure' : 'company-specific rubric'}). You edit lightly so it sounds like you, but the structure lands clean.`,
        },
      ]}
      finalCTA={{
        headline: `Crack your ${v.brand} interview with HelplyAI`,
        sub: `${v.brand}-tuned rubrics · Real-time AI · Free plan · Stealth mode`,
        button: { label: `Get HelplyAI free`, href: '/settings/dashboard' },
      }}
    />
  );
}

export const COMPANY_VARIANT_DEFS = VARIANTS;
