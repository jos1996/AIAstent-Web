import { useState } from 'react';
import SEOHead from '../components/SEOHead';

interface ComparisonPageProps {
  competitor: {
    name: string;
    slug: string;
    tagline: string;
    description: string;
    weaknesses: string[];
    helplyAdvantages: string[];
    competitorFeatures: { feature: string; helply: boolean | string; competitor: boolean | string }[];
    keywords: string;
    faq: { q: string; a: string }[];
  };
}

export default function ComparisonPage({ competitor }: ComparisonPageProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const containerStyle: React.CSSProperties = { maxWidth: 900, margin: '0 auto', padding: '0 24px' };

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <SEOHead
        title={`HelplyAI vs ${competitor.name} – Best AI Interview Helper Comparison | HelplyAI`}
        description={`Compare HelplyAI vs ${competitor.name}. See why HelplyAI is the best ${competitor.name} alternative for AI interview assistance, mock interviews, and real-time interview coaching. ${competitor.tagline}`}
        keywords={`${competitor.name} alternative, HelplyAI vs ${competitor.name}, best AI interview tool, ${competitor.keywords}`}
        canonical={`https://www.helplyai.co/vs/${competitor.slug}`}
      />

      {/* Navigation */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 40px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <img src="/favicon.png" alt="HelplyAI" style={{ width: 36, height: 36, borderRadius: 8 }} />
          <span style={{ fontSize: 19, fontWeight: 800, color: '#000' }}>Helply AI</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="/ai-interview-helper" style={{ color: '#555', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>AI Interview Helper</a>
          <a href="/settings/dashboard" style={{ padding: '8px 20px', borderRadius: 100, fontSize: 14, fontWeight: 600, background: '#000', color: '#fff', textDecoration: 'none' }}>Try Free</a>
        </div>
      </nav>

      {/* Hero */}
      <header style={{ paddingTop: 130, paddingBottom: 60, textAlign: 'center', background: 'linear-gradient(180deg, #f8f9fa 0%, #fff 100%)' }}>
        <div style={containerStyle}>
          <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 100, background: '#fee2e2', fontSize: 13, fontWeight: 600, color: '#991b1b', marginBottom: 20 }}>
            Comparison
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 800, color: '#000', lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.03em' }}>
            HelplyAI vs {competitor.name}
          </h1>
          <h2 style={{ fontSize: 18, fontWeight: 400, color: '#555', maxWidth: 650, margin: '0 auto 32px', lineHeight: 1.6 }}>
            {competitor.description}
          </h2>
          <a href="/settings/dashboard" style={{ padding: '14px 32px', borderRadius: 12, fontSize: 16, fontWeight: 700, background: '#000', color: '#fff', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            Try HelplyAI Free — No Credit Card Required
          </a>
        </div>
      </header>

      {/* Feature Comparison Table */}
      <section style={{ padding: '60px 0' }}>
        <div style={containerStyle}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#000', textAlign: 'center', marginBottom: 32 }}>
            Feature-by-Feature Comparison
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #eee' }}>
              <thead>
                <tr style={{ background: '#000', color: '#fff' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 14 }}>Feature</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: 14 }}>HelplyAI</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: 14 }}>{competitor.name}</th>
                </tr>
              </thead>
              <tbody>
                {competitor.competitorFeatures.map((f, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#333' }}>{f.feature}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: 14, color: typeof f.helply === 'boolean' ? (f.helply ? '#16a34a' : '#dc2626') : '#333' }}>
                      {typeof f.helply === 'boolean' ? (f.helply ? '✅ Yes' : '❌ No') : f.helply}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: 14, color: typeof f.competitor === 'boolean' ? (f.competitor ? '#16a34a' : '#dc2626') : '#333' }}>
                      {typeof f.competitor === 'boolean' ? (f.competitor ? '✅ Yes' : '❌ No') : f.competitor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why Switch */}
      <section style={{ padding: '60px 0', background: '#f8f9fa' }}>
        <div style={containerStyle}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#000', textAlign: 'center', marginBottom: 32 }}>
            Why Switch from {competitor.name} to HelplyAI?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {competitor.helplyAdvantages.map((adv, i) => (
              <div key={i} style={{ padding: 24, borderRadius: 12, background: '#fff', border: '1px solid #eee' }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>✅</div>
                <p style={{ fontSize: 15, color: '#333', lineHeight: 1.6, margin: 0 }}>{adv}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitor Weaknesses */}
      <section style={{ padding: '60px 0' }}>
        <div style={containerStyle}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#000', textAlign: 'center', marginBottom: 32 }}>
            Common Issues Users Report with {competitor.name}
          </h2>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            {competitor.weaknesses.map((w, i) => (
              <div key={i} style={{ padding: '16px 0', borderBottom: '1px solid #eee', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: '#dc2626', fontSize: 18 }}>⚠️</span>
                <p style={{ fontSize: 15, color: '#444', lineHeight: 1.6, margin: 0 }}>{w}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '60px 0', background: '#f8f9fa' }}>
        <div style={{ ...containerStyle, maxWidth: 750 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#000', textAlign: 'center', marginBottom: 32 }}>
            Frequently Asked Questions
          </h2>
          {competitor.faq.map((faq, i) => (
            <div key={i} style={{ marginBottom: 10, borderRadius: 10, background: '#fff', border: '1px solid #eee', overflow: 'hidden' }}>
              <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#000', margin: 0 }}>{faq.q}</h3>
                <span style={{ fontSize: 18, color: '#555', transform: expandedFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
              </button>
              {expandedFaq === i && (
                <div style={{ padding: '0 20px 16px' }}>
                  <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, margin: 0 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={containerStyle}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#000', marginBottom: 16 }}>
            Ready to Switch to HelplyAI?
          </h2>
          <p style={{ fontSize: 17, color: '#555', marginBottom: 28 }}>
            Join thousands who switched from {competitor.name} to HelplyAI for a better interview experience.
          </p>
          <a href="/settings/dashboard" style={{ padding: '14px 36px', borderRadius: 12, fontSize: 16, fontWeight: 700, background: '#000', color: '#fff', textDecoration: 'none', display: 'inline-block' }}>
            Get Started Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 0', borderTop: '1px solid #eee', background: '#fafafa', textAlign: 'center' }}>
        <div style={containerStyle}>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            <a href="/ai-interview-helper" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>AI Interview Helper</a>
            <a href="/vs/final-round-ai" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>vs Final Round AI</a>
            <a href="/vs/lockedin-ai" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>vs LockedIn AI</a>
            <a href="/vs/hirin-ai" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>vs Hirin AI</a>
            <a href="/vs/parakeet-ai" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>vs Parakeet AI</a>
            <a href="/blog/how-to-crack-interview" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>Blog</a>
          </div>
          <p style={{ fontSize: 12, color: '#999' }}>© 2025 HelplyAI. The #1 AI Interview Helper.</p>
        </div>
      </footer>
    </div>
  );
}
