import { useEffect, useMemo, useState } from 'react';
import {
  analyzeResumeLocal,
  analyzeWithAI,
  mergeWithAi,
  type AtsAnalysis,
  type SectionScore,
} from '../lib/atsAnalyzer';

interface Props {
  resumeText: string;
  initialJd?: string;
  onClose: () => void;
}

const COLORS = {
  good: '#10b981',
  warn: '#f59e0b',
  bad: '#ef4444',
  bg: '#fafafa',
  border: '#e5e7eb',
  text: '#111',
  mute: '#6b7280',
};

function statusColor(s: SectionScore['status']) {
  return s === 'good' ? COLORS.good : s === 'warn' ? COLORS.warn : COLORS.bad;
}
function scoreColor(score: number) {
  if (score >= 80) return COLORS.good;
  if (score >= 55) return COLORS.warn;
  return COLORS.bad;
}

// ── Circular score gauge ─────────────────────────────────────────────────────
function ScoreGauge({ score, label, size = 200 }: { score: number; label: string; size?: number }) {
  const stroke = 14;
  const r = size / 2 - stroke;
  const C = 2 * Math.PI * r;
  const offset = C - (score / 100) * C;
  const color = scoreColor(score);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#f3f4f6" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={C}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.7s ease-out, stroke 0.4s' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: Math.round(size * 0.28), fontWeight: 800, color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 12, color: COLORS.mute, marginTop: 4 }}>out of 100</div>
        <div style={{ fontSize: 13, color: COLORS.text, fontWeight: 700, marginTop: 6 }}>{label}</div>
      </div>
    </div>
  );
}

// ── Section row ──────────────────────────────────────────────────────────────
function SectionRow({ label, section }: { label: string; section: SectionScore }) {
  const color = statusColor(section.status);
  return (
    <div style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: color,
              display: 'inline-block',
            }}
          />
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{label}</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color }}>{section.score}/100</div>
      </div>
      <div
        style={{
          height: 6,
          background: '#f3f4f6',
          borderRadius: 3,
          overflow: 'hidden',
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: `${section.score}%`,
            height: '100%',
            background: color,
            transition: 'width 0.6s',
          }}
        />
      </div>
      <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.5 }}>{section.message}</div>
      {section.detail && (
        <div style={{ fontSize: 12, color: COLORS.mute, marginTop: 4, lineHeight: 1.5 }}>{section.detail}</div>
      )}
    </div>
  );
}

// ── Chips ────────────────────────────────────────────────────────────────────
function Chip({ children, kind }: { children: React.ReactNode; kind: 'matched' | 'missing' | 'neutral' }) {
  const styles =
    kind === 'matched'
      ? { bg: '#ecfdf5', border: '#a7f3d0', color: '#047857' }
      : kind === 'missing'
        ? { bg: '#fef3c7', border: '#fcd34d', color: '#92400e' }
        : { bg: '#f3f4f6', border: '#e5e7eb', color: '#374151' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
        marginRight: 6,
        marginBottom: 6,
        lineHeight: 1.3,
      }}
    >
      {children}
    </span>
  );
}

// ── Stat tile ────────────────────────────────────────────────────────────────
function StatTile({ value, label, accent }: { value: string | number; label: string; accent?: string }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 120,
        padding: 14,
        borderRadius: 10,
        background: '#fff',
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 800, color: accent || COLORS.text, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: COLORS.mute, marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AtsCheckPage({ resumeText, initialJd = '', onClose }: Props) {
  const [jdText, setJdText] = useState(initialJd);
  const [activeJd, setActiveJd] = useState(initialJd);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<Awaited<ReturnType<typeof analyzeWithAI>>>(null);
  const [autoRanOnMount, setAutoRanOnMount] = useState(false);

  // Always-fresh local analysis. Cheap, runs synchronously.
  const local: AtsAnalysis = useMemo(
    () => analyzeResumeLocal(resumeText, activeJd),
    [resumeText, activeJd],
  );

  // Merged view: local + AI if AI returned something.
  const analysis: AtsAnalysis = useMemo(
    () => mergeWithAi(local, aiResult),
    [local, aiResult],
  );

  // If a JD was already attached when the page opened, kick off AI scoring once.
  useEffect(() => {
    if (autoRanOnMount) return;
    if (initialJd && initialJd.trim().length >= 60 && resumeText.trim().length > 0) {
      setAutoRanOnMount(true);
      void runAiCheck(initialJd);
    } else {
      setAutoRanOnMount(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAiCheck(jd: string) {
    setAiError(null);
    setAiLoading(true);
    setAiResult(null);
    setActiveJd(jd);
    try {
      const res = await analyzeWithAI(resumeText, jd);
      if (!res) {
        setAiError(
          'Couldn\u2019t reach the AI scorer. Your local ATS report below is still accurate — try the AI scorer again in a moment.',
        );
      } else {
        setAiResult(res);
      }
    } catch (err) {
      console.error(err);
      setAiError(`AI check failed: ${String(err)}`);
    } finally {
      setAiLoading(false);
    }
  }

  const hasJd = activeJd.trim().length >= 60;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 64px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <button
            onClick={onClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              color: COLORS.mute,
              cursor: 'pointer',
              padding: 0,
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Dashboard
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: COLORS.text }}>ATS Resume Check</h1>
          <div style={{ fontSize: 14, color: COLORS.mute, marginTop: 4 }}>
            Scored against the same heuristics real ATS pipelines apply, plus an AI semantic match
            against your job description.
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            border: `1px solid ${COLORS.border}`,
            background: '#fff',
            color: COLORS.text,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>

      {/* JD input */}
      <div
        style={{
          padding: 18,
          borderRadius: 12,
          background: '#fff',
          border: `1px solid ${COLORS.border}`,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>
            Job Description <span style={{ color: COLORS.mute, fontWeight: 400 }}>(optional — paste to score JD match)</span>
          </div>
          {hasJd && (
            <div style={{ fontSize: 12, color: COLORS.good, fontWeight: 600 }}>
              ✓ {jdText.split(/\s+/).filter(Boolean).length} words
            </div>
          )}
        </div>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the job description here to unlock semantic keyword matching, missing-skills detection, and AI-powered rewrite hints…"
          style={{
            width: '100%',
            minHeight: 110,
            padding: '12px 14px',
            borderRadius: 8,
            border: `1px solid ${COLORS.border}`,
            fontSize: 14,
            lineHeight: 1.5,
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            background: COLORS.bg,
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: COLORS.mute }}>
            Without a JD we score format, structure, contact info, impact and length only.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { setJdText(''); setActiveJd(''); setAiResult(null); setAiError(null); }}
              style={{
                padding: '9px 16px',
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                background: '#fff',
                color: COLORS.text,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Clear JD
            </button>
            <button
              onClick={() => runAiCheck(jdText)}
              disabled={aiLoading || jdText.trim().length < 60 || resumeText.trim().length === 0}
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                border: 'none',
                background: aiLoading || jdText.trim().length < 60 ? '#9ca3af' : '#000',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: aiLoading || jdText.trim().length < 60 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {aiLoading ? (
                <>
                  <SpinnerIcon /> Scoring…
                </>
              ) : (
                <>
                  <SparkIcon /> Run AI ATS Match
                </>
              )}
            </button>
          </div>
        </div>
        {aiError && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 12px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              fontSize: 12,
              color: '#991b1b',
            }}
          >
            {aiError}
          </div>
        )}
      </div>

      {/* Headline cards: gauge + match + stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div
          style={{
            padding: 24,
            borderRadius: 12,
            background: '#fff',
            border: `1px solid ${COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <ScoreGauge score={analysis.overallScore} label={analysis.scoreLabel} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: COLORS.mute, marginBottom: 4 }}>Overall ATS Score</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, lineHeight: 1.4 }}>
              {analysis.scoreLabel === 'Excellent' && 'Your resume is ATS-strong.'}
              {analysis.scoreLabel === 'Good' && 'Solid resume — a few tweaks will push it higher.'}
              {analysis.scoreLabel === 'Needs Work' && 'Workable, but missing key signals ATS systems look for.'}
              {analysis.scoreLabel === 'Poor' && 'Major gaps — fix the items below before applying.'}
            </div>
            <div style={{ fontSize: 12, color: COLORS.mute, marginTop: 8, lineHeight: 1.5 }}>
              Weighted blend of contact, structure, keywords, impact, length, and formatting.
              {hasJd && ' Keyword section blends literal match with AI semantic match.'}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: 24,
            borderRadius: 12,
            background: '#fff',
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div style={{ fontSize: 13, color: COLORS.mute, marginBottom: 14 }}>Resume Stats</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <StatTile value={analysis.stats.wordCount} label="words" />
            <StatTile value={analysis.stats.bulletCount} label="bullets" />
            <StatTile
              value={`${analysis.stats.quantifiedBullets}/${analysis.stats.bulletCount || 0}`}
              label="quantified"
              accent={
                analysis.stats.bulletCount > 0 &&
                analysis.stats.quantifiedBullets / analysis.stats.bulletCount >= 0.5
                  ? COLORS.good
                  : COLORS.warn
              }
            />
            <StatTile
              value={analysis.stats.sectionsFound.length}
              label="sections"
              accent={analysis.stats.sectionsFound.length >= 3 ? COLORS.good : COLORS.warn}
            />
          </div>
        </div>
      </div>

      {/* JD match panel — only when JD provided */}
      {analysis.jdMatch && (
        <div
          style={{
            padding: 24,
            borderRadius: 12,
            background: '#fff',
            border: `1px solid ${COLORS.border}`,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>JD Match Analysis</div>
              <div style={{ fontSize: 12, color: COLORS.mute, marginTop: 2 }}>
                {aiResult ? 'Local literal match + AI semantic match.' : 'Literal keyword match. Run AI ATS Match for semantic scoring.'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 12, color: COLORS.mute }}>Match</div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: scoreColor(analysis.jdMatch.matchScore),
                }}
              >
                {analysis.jdMatch.matchScore}%
              </div>
            </div>
          </div>

          {analysis.jdMatch.matchedKeywords.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>
                ✓ Matched ({analysis.jdMatch.matchedKeywords.length})
              </div>
              <div>
                {analysis.jdMatch.matchedKeywords.slice(0, 30).map((kw) => (
                  <Chip key={kw} kind="matched">
                    {kw}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {analysis.jdMatch.missingKeywords.length > 0 && (
            <div style={{ marginBottom: aiResult?.rewriteHints.length ? 14 : 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>
                ⚠ Missing from your resume ({analysis.jdMatch.missingKeywords.length})
              </div>
              <div>
                {analysis.jdMatch.missingKeywords.slice(0, 24).map((kw) => (
                  <Chip key={kw} kind="missing">
                    {kw}
                  </Chip>
                ))}
              </div>
              <div style={{ fontSize: 12, color: COLORS.mute, marginTop: 6, lineHeight: 1.5 }}>
                Add these terms <em>where they&rsquo;re truly applicable to your experience</em> &mdash; never fabricate skills.
              </div>
            </div>
          )}

          {aiResult && aiResult.rewriteHints.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>
                ✎ AI Rewrite Hints
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {aiResult.rewriteHints.slice(0, 6).map((hint, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px 14px',
                      background: '#f9fafb',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 8,
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: COLORS.text,
                    }}
                  >
                    {hint}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Two columns: section breakdown + analysis prose */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
        {/* Section breakdown */}
        <div
          style={{
            background: '#fff',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>Score Breakdown</div>
            <div style={{ fontSize: 12, color: COLORS.mute, marginTop: 2 }}>
              Per-section scores from deterministic ATS rules.
            </div>
          </div>
          <SectionRow label="Contact Info" section={analysis.sections.contactInfo} />
          <SectionRow label="Structure" section={analysis.sections.structure} />
          <SectionRow label="Keywords / JD Match" section={analysis.sections.keywords} />
          <SectionRow label="Impact (verbs + metrics)" section={analysis.sections.impact} />
          <SectionRow label="Length" section={analysis.sections.length} />
          <div style={{ borderBottom: 'none' }}>
            <SectionRow label="Formatting" section={analysis.sections.formatting} />
          </div>
        </div>

        {/* Analysis prose */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Strengths */}
          <div
            style={{
              background: '#fff',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <CheckIcon color={COLORS.good} />
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>What&rsquo;s working</div>
            </div>
            {analysis.strengths.length === 0 ? (
              <div style={{ fontSize: 13, color: COLORS.mute }}>—</div>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {analysis.strengths.map((s, i) => (
                  <li key={i} style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.6, marginBottom: 6 }}>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Weaknesses */}
          <div
            style={{
              background: '#fff',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <WarnIcon color={COLORS.warn} />
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>What needs work</div>
            </div>
            {analysis.weaknesses.length === 0 ? (
              <div style={{ fontSize: 13, color: COLORS.mute }}>No major gaps detected.</div>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {analysis.weaknesses.map((w, i) => (
                  <li key={i} style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.6, marginBottom: 6 }}>
                    {w}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Suggestions */}
          <div
            style={{
              background: '#fff',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <BulbIcon color="#0ea5e9" />
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>How to improve</div>
            </div>
            {analysis.suggestions.length === 0 ? (
              <div style={{ fontSize: 13, color: COLORS.mute }}>—</div>
            ) : (
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                {analysis.suggestions.map((s, i) => (
                  <li key={i} style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.6, marginBottom: 6 }}>
                    {s}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      {/* Footer / disclaimer */}
      <div
        style={{
          padding: 14,
          borderRadius: 10,
          background: COLORS.bg,
          border: `1px solid ${COLORS.border}`,
          fontSize: 12,
          color: COLORS.mute,
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: COLORS.text }}>How this works:</strong> deterministic rules score your
        resume&rsquo;s structure, contact info, action verbs, quantified impact, length and formatting locally.
        When you paste a job description, we extract its top keywords and check overlap, then optionally
        run a GPT-class semantic match for synonym-aware scoring and rewrite hints. We never store your
        resume or JD beyond this request.
      </div>
    </div>
  );
}

// ── Inline icons (no extra deps) ─────────────────────────────────────────────
function SparkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </svg>
  );
}
function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'ats-spin 0.9s linear infinite' }}>
      <style>{`@keyframes ats-spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function WarnIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function BulbIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.74V18h8v-3.26A7 7 0 0 0 12 2z" />
    </svg>
  );
}
