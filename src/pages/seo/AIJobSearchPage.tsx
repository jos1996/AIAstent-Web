import SEOLandingTemplate from '../../components/SEOLandingTemplate';

export default function AIJobSearchPage() {
  return (
    <SEOLandingTemplate
      canonical="https://www.helplyai.co/ai-job-search"
      breadcrumbs={[
        { name: 'Home', url: '/' },
        { name: 'AI Job Search', url: '/ai-job-search' },
      ]}
      seo={{
        title: 'AI Job Search — Find Roles, Tailor Resumes, Auto-Apply | HelplyAI',
        description:
          'HelplyAI is the smartest AI job search tool of 2026. Search 1M+ jobs, get instant resume tailoring, AI cover letters, salary signals, and one-click apply on Indeed, LinkedIn, and Greenhouse. Free to start.',
        keywords:
          'ai job search, ai job search engine, job search ai, ai for finding jobs, ai job board, ai job matching, ai job aggregator, ai job application tool, auto apply jobs, ai job apply, job search engine ai, ai job tracker, ai cover letter, ai job recommendation, helplyai job search',
      }}
      keywordCloud={[
        'AI job search',
        'AI job board',
        'AI job matching',
        'Auto apply jobs',
        'AI cover letter',
        'AI resume tailoring',
        'Job aggregator AI',
        'Job tracker AI',
        'AI job recommendations',
      ]}
      hero={{
        eyebrow: '1M+ live jobs · Indeed, LinkedIn, Greenhouse, Lever',
        h1: 'Find your next job 10x faster —',
        h1Highlight: 'with AI that ranks, tailors, and applies',
        subtitle:
          'HelplyAI surfaces the highest-fit jobs across 1M+ roles, tailors your resume and cover letter to each one, and applies in one click. Search smarter — not harder.',
        primaryCTA: { label: 'Search jobs free', href: '/settings/job-search' },
        secondaryCTA: { label: 'See how matching works', href: '#how-it-works' },
        note: 'Free · No card · Pulls from Indeed, LinkedIn, Glassdoor, ZipRecruiter, Greenhouse, Lever, and 100+ ATS feeds',
      }}
      intro={
        <>
          <p>
            <strong>AI job search</strong> means using AI to find, rank, tailor, and apply to roles
            instead of cold-scrolling job boards. A modern <strong>AI job search engine</strong>{' '}
            understands the nuance of your resume — the actual technologies, levels, and outcomes
            in your background — and matches that against thousands of openings every hour to
            surface only the roles where you have a real shot. HelplyAI ships the highest-precision{' '}
            <strong>AI job board</strong> of 2026: it ingests live feeds from Indeed, LinkedIn,
            Glassdoor, ZipRecruiter, Greenhouse, Lever, Workday, Ashby, and 100+ company career
            sites and ranks every match for fit, salary, location, and time-to-hire.
          </p>
          <p>
            Once you find a role you like, the AI tailors your resume to the JD,{' '}
            generates a compelling cover letter, and — for supported employers — submits the
            application in one click. Behind the scenes the same engine syncs with the{' '}
            <a href="/ai-interview-helper">AI interview helper</a> and{' '}
            <a href="/mock-interview-ai">mock interview AI</a>, so the moment you land a screen,
            you&apos;re already prepped on the company, the role, and the most likely questions.
          </p>
          <p>
            Use the <a href="/ai-resume-builder">AI resume builder</a> to keep a base resume up to
            date, and the <a href="/ai-interview-answer-generator">AI interview answer generator</a>{' '}
            to draft strong answers to the screening questions in the application. The full HelplyAI
            stack is the closest thing to having a personal recruiter on call 24/7.
          </p>
        </>
      }
      features={[
        { icon: '🔍', title: '1M+ jobs ranked daily', desc: 'Indeed, LinkedIn, Glassdoor, ZipRecruiter, Greenhouse, Lever, Workday, Ashby, and 100+ company career feeds — refreshed every few hours.' },
        { icon: '🎯', title: 'AI fit score', desc: 'Each role gets a 0-100 fit score: skills overlap, seniority match, salary signal, location, and visa support. Stop applying to long-shots.' },
        { icon: '✍️', title: 'Auto resume tailoring', desc: 'One click rewrites your resume to match the JD&apos;s keywords. ATS-clean PDF in seconds.' },
        { icon: '✉️', title: 'AI cover letters', desc: 'Cover letters that read like you — and reference the actual job description, not a template.' },
        { icon: '⚡', title: 'One-click apply', desc: 'For supported employers, the AI fills out the entire application — work history, screening questions, and cover letter.' },
        { icon: '📊', title: 'Application tracker', desc: 'Track applied / screened / rejected / offered. Hooks into Gmail to detect responses automatically.' },
      ]}
      steps={[
        { title: 'Tell HelplyAI what you want', desc: 'Role, location, salary band, remote / hybrid, visa status. Or just paste your dream job.' },
        { title: 'Get ranked matches', desc: 'AI surfaces the top roles ranked by fit — not by how recent the posting is.' },
        { title: 'Tailor & apply', desc: 'One click tailors your resume + cover letter to each JD and submits where supported.' },
        { title: 'Track responses', desc: 'See screening invites land in your tracker as soon as they hit your inbox.' },
      ]}
      benefits={[
        { title: 'Stop spraying applications', desc: 'AI ranking drops your low-fit applies by 80% — you apply less and get more screens.' },
        { title: 'Always-fresh feeds', desc: 'Most aggregators stale within hours. HelplyAI re-pulls every employer that publishes through Greenhouse / Lever / Workday APIs in near-real-time.' },
        { title: 'Tailored beats generic', desc: 'Resumes tailored by the AI hit recruiter screens 2.4x more often than generic resumes (HelplyAI A/B test, n=20K).' },
        { title: 'One-stack, end-to-end', desc: 'Search → tailor → apply → mock interview → live AI interview helper. Same login, same context, no copy-pasting between apps.' },
      ]}
      faqs={[
        { q: 'Is the AI job search free?', a: 'Yes. Search, fit scoring, and resume tailoring are free. Premium unlocks unlimited auto-applies, advanced filters, and salary intelligence.' },
        { q: 'Where do the jobs come from?', a: 'Live feeds from Indeed, LinkedIn, Glassdoor, ZipRecruiter, Greenhouse, Lever, Workday, Ashby, plus 100+ direct company career sites. We re-pull frequently so listings are fresh.' },
        { q: 'How does fit scoring work?', a: 'The AI compares the JD against your resume embeddings, weighs seniority, location/visa fit, salary band, tech stack, and recency. Each role gets a 0-100 score so you can prioritize the top 10 instead of scrolling 500.' },
        { q: 'Does the auto-apply work on every site?', a: 'For employers using Greenhouse, Lever, Workday, Ashby, and similar standardized ATSes — yes. For sites that require a custom flow, the AI fills as much as it can and hands off to you for the last step.' },
        { q: 'Will recruiters know I used AI?', a: 'No. The output (resume + cover letter) reads like polished human writing. The AI personalizes details to the JD instead of using stock phrases — which is what good candidates do anyway.' },
        { q: 'Can I track all my applications in one place?', a: 'Yes. The tracker dedupes across boards, syncs replies from Gmail (with permission), and shows pipeline conversion (screen rate, onsite rate, offer rate) so you know where your funnel leaks.' },
        { q: 'Is this better than Indeed or LinkedIn alone?', a: 'It pulls from Indeed and LinkedIn, plus 100+ other feeds, AND ranks them with AI fit scoring AND tailors your resume to each. Native job boards do none of that.' },
      ]}
      finalCTA={{
        headline: 'Search smarter. Apply faster. Land more screens.',
        sub: 'Free job search across 1M+ roles · AI tailoring + tracking included.',
        button: { label: 'Start your AI job search free', href: '/settings/job-search' },
      }}
    />
  );
}
