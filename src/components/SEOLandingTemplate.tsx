import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import SEOHead, {
  faqSchema,
  breadcrumbSchema,
  softwareAppSchema,
  type SEOHeadProps,
} from './SEOHead';

type Crumb = { name: string; url: string };

export interface SEOLandingProps {
  /** Full canonical URL of this page */
  canonical: string;
  /** SEO meta */
  seo: Pick<SEOHeadProps, 'title' | 'description' | 'keywords'> & {
    ogType?: SEOHeadProps['ogType'];
    extraSchema?: SEOHeadProps['jsonLd'];
  };
  breadcrumbs: Crumb[];
  hero: {
    eyebrow?: string;
    h1: ReactNode;
    h1Highlight?: string;
    subtitle: ReactNode;
    primaryCTA?: { label: string; href: string };
    secondaryCTA?: { label: string; href: string };
    note?: string;
  };
  /** A long-form intro paragraph (renders right after the hero, ~150-250 words). */
  intro: ReactNode;
  /** Optional keyword pill cloud above features */
  keywordCloud?: string[];
  features: { title: string; desc: string; icon?: string }[];
  steps?: { title: string; desc: string }[];
  benefits?: { title: string; desc: string }[];
  /** Optional comparison table */
  comparison?: {
    headers: string[];
    rows: (string | boolean)[][];
  };
  faqs: { q: string; a: string }[];
  finalCTA?: { headline: string; sub?: string; button: { label: string; href: string } };
}

const colors = {
  bg: '#fff',
  text: '#0a0a0a',
  muted: '#555',
  accent: '#2563eb',
  accent2: '#7c3aed',
  surface: '#f8f9fa',
  border: '#eee',
};

const container: React.CSSProperties = { maxWidth: 1180, margin: '0 auto', padding: '0 24px' };

function Nav() {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 80,
        height: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
        <img src="/favicon.png" alt="HelplyAI logo" width={36} height={36} style={{ borderRadius: 8 }} />
        <span style={{ fontSize: 19, fontWeight: 800, color: colors.text }}>Helply AI</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <Link to="/ai-interview-helper" style={navLink}>Interview Helper</Link>
        <Link to="/mock-interview-ai" style={navLink}>Mock Interview</Link>
        <Link to="/ai-resume-builder" style={navLink}>Resume Builder</Link>
        <Link to="/ai-job-search" style={navLink}>Job Search</Link>
        <Link to="/blog/best-ai-interview-helper-tools" style={navLink}>Blog</Link>
        <Link
          to="/settings/dashboard"
          style={{
            padding: '8px 18px',
            borderRadius: 100,
            background: '#000',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Get Started Free
        </Link>
      </div>
    </nav>
  );
}

const navLink: React.CSSProperties = {
  color: '#444',
  fontSize: 13,
  fontWeight: 500,
  textDecoration: 'none',
};

function SiteFooter() {
  const cols: { heading: string; links: { label: string; href: string }[] }[] = [
    {
      heading: 'AI Tools',
      links: [
        { label: 'AI Interview Helper', href: '/ai-interview-helper' },
        { label: 'Mock Interview AI', href: '/mock-interview-ai' },
        { label: 'AI Resume Builder', href: '/ai-resume-builder' },
        { label: 'AI Job Search', href: '/ai-job-search' },
        { label: 'Interview Answer Generator', href: '/ai-interview-answer-generator' },
        { label: 'Free AI Interview Helper', href: '/free-ai-interview-helper' },
      ],
    },
    {
      heading: 'Platforms',
      links: [
        { label: 'Online Interview Helper', href: '/online-interview-helper' },
        { label: 'Zoom Interview Helper', href: '/blog/zoom-ai-interview-helper' },
        { label: 'Google Meet Interview Helper', href: '/google-meet-ai-interview-helper' },
        { label: 'Microsoft Teams Interview Helper', href: '/microsoft-teams-ai-interview-helper' },
      ],
    },
    {
      heading: 'Compare',
      links: [
        { label: 'vs Final Round AI', href: '/compare/final-round-ai-vs-helplyai' },
        { label: 'vs LockedIn AI', href: '/compare/lockedin-ai-vs-helplyai' },
        { label: 'vs Sensei AI', href: '/compare/sensei-ai-vs-helplyai' },
        { label: 'vs Parakeet AI', href: '/compare/parakeet-ai-vs-helplyai' },
        { label: 'All Alternatives', href: '/alternatives' },
      ],
    },
    {
      heading: 'Interview Prep',
      links: [
        { label: 'Software Engineer', href: '/interview-prep/software-engineer' },
        { label: 'Product Manager', href: '/interview-prep/product-manager' },
        { label: 'Data Science', href: '/interview-prep/data-science' },
        { label: 'Finance', href: '/interview-prep/finance' },
        { label: 'Marketing', href: '/interview-prep/marketing' },
        { label: 'Consulting', href: '/interview-prep/consulting' },
      ],
    },
    {
      heading: 'Resources',
      links: [
        { label: 'How to Crack Interview', href: '/blog/how-to-crack-interview' },
        { label: 'STAR Method Guide', href: '/blog/star-method-guide' },
        { label: 'AI Interview Tips 2026', href: '/blog/ai-interview-tips' },
        { label: 'Best AI Interview Tools', href: '/blog/best-ai-interview-helper-tools' },
        { label: 'Real-Time AI Interview Helper', href: '/blog/real-time-ai-interview-helper' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Privacy', href: '/privacy' },
        { label: 'Refund Policy', href: '/refund' },
      ],
    },
  ];

  return (
    <footer style={{ background: '#0a0a0a', color: '#cfcfcf', padding: '64px 0 32px', marginTop: 80 }}>
      <div style={{ ...container, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32 }}>
        {cols.map((col) => (
          <div key={col.heading}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
              {col.heading}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col.links.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  style={{ color: '#bbb', fontSize: 13, textDecoration: 'none' }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          ...container,
          marginTop: 48,
          paddingTop: 24,
          borderTop: '1px solid #222',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: 12,
          color: '#888',
        }}
      >
        <span>© {new Date().getFullYear()} HelplyAI. The #1 AI Interview Copilot for online & live interviews.</span>
        <span>Real-time AI · Stealth mode · Mac &amp; Windows</span>
      </div>
    </footer>
  );
}

export default function SEOLandingTemplate(props: SEOLandingProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const productSchema = softwareAppSchema({
    name: 'HelplyAI',
    description: props.seo.description,
    url: props.canonical,
  });
  const allSchema = [
    breadcrumbSchema(
      props.breadcrumbs.map((c) => ({
        name: c.name,
        url: c.url.startsWith('http') ? c.url : `https://www.helplyai.co${c.url}`,
      })),
    ),
    productSchema,
    faqSchema(props.faqs),
    ...(Array.isArray(props.seo.extraSchema)
      ? props.seo.extraSchema
      : props.seo.extraSchema
        ? [props.seo.extraSchema]
        : []),
  ];

  return (
    <div style={{ background: colors.bg, color: colors.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <SEOHead
        title={props.seo.title}
        description={props.seo.description}
        keywords={props.seo.keywords}
        canonical={props.canonical}
        ogType={props.seo.ogType ?? 'website'}
        jsonLd={allSchema}
      />

      <Nav />

      {/* Breadcrumb */}
      <div style={{ ...container, paddingTop: 24, fontSize: 13, color: '#888' }}>
        {props.breadcrumbs.map((c, i) => (
          <span key={c.url}>
            {i > 0 && ' › '}
            {i < props.breadcrumbs.length - 1 ? (
              <Link to={c.url} style={{ color: '#888', textDecoration: 'none' }}>
                {c.name}
              </Link>
            ) : (
              <span style={{ color: '#444', fontWeight: 600 }}>{c.name}</span>
            )}
          </span>
        ))}
      </div>

      {/* Hero */}
      <header style={{ padding: '32px 0 56px', textAlign: 'center' }}>
        <div style={container}>
          {props.hero.eyebrow && (
            <div
              style={{
                display: 'inline-block',
                padding: '6px 16px',
                borderRadius: 100,
                background: '#f0f0f0',
                fontSize: 13,
                fontWeight: 600,
                color: '#333',
                marginBottom: 18,
              }}
            >
              {props.hero.eyebrow}
            </div>
          )}
          <h1
            style={{
              fontSize: 'clamp(34px, 5vw, 56px)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              margin: '0 auto 22px',
              maxWidth: 920,
            }}
          >
            {props.hero.h1}{' '}
            {props.hero.h1Highlight && (
              <span
                style={{
                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {props.hero.h1Highlight}
              </span>
            )}
          </h1>
          <p
            style={{
              fontSize: 19,
              color: colors.muted,
              maxWidth: 760,
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            {props.hero.subtitle}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {props.hero.primaryCTA && (
              <a
                href={props.hero.primaryCTA.href}
                style={{
                  padding: '13px 28px',
                  borderRadius: 12,
                  background: '#000',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
              >
                {props.hero.primaryCTA.label}
              </a>
            )}
            {props.hero.secondaryCTA && (
              <a
                href={props.hero.secondaryCTA.href}
                style={{
                  padding: '13px 28px',
                  borderRadius: 12,
                  background: '#fff',
                  color: '#000',
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: 'none',
                  border: '2px solid #000',
                }}
              >
                {props.hero.secondaryCTA.label}
              </a>
            )}
          </div>
          {props.hero.note && (
            <p style={{ marginTop: 16, fontSize: 13, color: '#888' }}>{props.hero.note}</p>
          )}
        </div>
      </header>

      {/* Keyword pill cloud (helps semantic relevance for related-keyword variants) */}
      {props.keywordCloud && props.keywordCloud.length > 0 && (
        <section style={{ padding: '28px 0', background: colors.surface, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ ...container, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {props.keywordCloud.map((kw) => (
              <span
                key={kw}
                style={{
                  padding: '6px 14px',
                  borderRadius: 100,
                  background: '#fff',
                  border: `1px solid ${colors.border}`,
                  fontSize: 12,
                  color: '#555',
                  fontWeight: 500,
                }}
              >
                {kw}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Intro long-form */}
      <section style={{ padding: '64px 0' }}>
        <div style={{ ...container, maxWidth: 860 }}>
          <div
            style={{
              fontSize: 17,
              color: '#333',
              lineHeight: 1.85,
            }}
          >
            {props.intro}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '64px 0', background: colors.surface }}>
        <div style={container}>
          <h2 style={h2Style}>Features that make HelplyAI the strongest choice</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 22,
              marginTop: 36,
            }}
          >
            {props.features.map((f, i) => (
              <article
                key={i}
                style={{
                  padding: 28,
                  borderRadius: 16,
                  background: '#fff',
                  border: `1px solid ${colors.border}`,
                }}
              >
                {f.icon && <div style={{ fontSize: 30, marginBottom: 14 }}>{f.icon}</div>}
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 14.5, color: '#555', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      {props.steps && props.steps.length > 0 && (
        <section style={{ padding: '64px 0' }}>
          <div style={container}>
            <h2 style={h2Style}>How it works</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 22,
                marginTop: 32,
              }}
            >
              {props.steps.map((s, i) => (
                <div key={i} style={{ padding: 24, textAlign: 'center' }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: '#000',
                      color: '#fff',
                      fontSize: 22,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 14px',
                    }}
                  >
                    {i + 1}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 6px' }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits / why-helplyai */}
      {props.benefits && props.benefits.length > 0 && (
        <section style={{ padding: '64px 0', background: colors.surface }}>
          <div style={container}>
            <h2 style={h2Style}>Why HelplyAI wins</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 22,
                marginTop: 32,
              }}
            >
              {props.benefits.map((b, i) => (
                <div
                  key={i}
                  style={{
                    padding: 26,
                    borderRadius: 14,
                    background: '#fff',
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, color: colors.accent, marginBottom: 8, textTransform: 'uppercase' }}>
                    Reason #{i + 1}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>{b.title}</h3>
                  <p style={{ fontSize: 14.5, color: '#555', lineHeight: 1.7, margin: 0 }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Comparison table */}
      {props.comparison && (
        <section style={{ padding: '64px 0' }}>
          <div style={container}>
            <h2 style={h2Style}>How HelplyAI compares</h2>
            <div style={{ overflowX: 'auto', marginTop: 28 }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  background: '#fff',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  border: `1px solid ${colors.border}`,
                }}
              >
                <thead>
                  <tr style={{ background: '#000', color: '#fff' }}>
                    {props.comparison.headers.map((h, i) => (
                      <th key={i} style={{ padding: '12px 16px', textAlign: i === 0 ? 'left' : 'center', fontSize: 14 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {props.comparison.rows.map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          style={{
                            padding: '12px 16px',
                            textAlign: ci === 0 ? 'left' : 'center',
                            fontSize: 14,
                            color: typeof cell === 'boolean' ? (cell ? '#22c55e' : '#ef4444') : '#333',
                            fontWeight: ci === 0 ? 600 : 400,
                          }}
                        >
                          {typeof cell === 'boolean' ? (cell ? '✓' : '—') : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      <section style={{ padding: '64px 0', background: colors.surface }}>
        <div style={{ ...container, maxWidth: 820 }}>
          <h2 style={h2Style}>Frequently asked questions</h2>
          <div style={{ marginTop: 28 }}>
            {props.faqs.map((f, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 10,
                  borderRadius: 12,
                  background: '#fff',
                  border: `1px solid ${colors.border}`,
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    padding: '16px 22px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left',
                  }}
                >
                  <h3 style={{ fontSize: 15.5, fontWeight: 600, margin: 0 }}>{f.q}</h3>
                  <span
                    style={{
                      fontSize: 22,
                      color: '#888',
                      transform: openFaq === i ? 'rotate(45deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 22px 16px' }}>
                    <p style={{ fontSize: 14.5, color: '#555', lineHeight: 1.75, margin: 0 }}>{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      {props.finalCTA && (
        <section style={{ padding: '72px 0', textAlign: 'center' }}>
          <div style={container}>
            <h2 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 14px' }}>{props.finalCTA.headline}</h2>
            {props.finalCTA.sub && (
              <p style={{ fontSize: 16, color: colors.muted, maxWidth: 620, margin: '0 auto 26px' }}>{props.finalCTA.sub}</p>
            )}
            <a
              href={props.finalCTA.button.href}
              style={{
                padding: '15px 36px',
                borderRadius: 12,
                background: '#000',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-block',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              {props.finalCTA.button.label}
            </a>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}

const h2Style: React.CSSProperties = {
  fontSize: 'clamp(28px, 3.5vw, 38px)',
  fontWeight: 800,
  textAlign: 'center',
  margin: 0,
  letterSpacing: '-0.02em',
};
