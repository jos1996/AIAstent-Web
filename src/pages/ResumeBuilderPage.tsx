import { useState, useRef } from 'react';
import { X, Download, ChevronLeft, Sparkles, CheckCircle2, Edit3, Eye } from 'lucide-react';
import { tailorResumeWithAI } from '../lib/resumeTailor';
import type { TailoredResume } from '../lib/resumeTailor';

// ── Template IDs ──────────────────────────────────────────────────────────────
type TemplateId = 'minimal' | 'modern' | 'professional' | 'compact' | 'creative';

const TEMPLATES: { id: TemplateId; name: string; desc: string; accent: string }[] = [
  { id: 'minimal',      name: 'Minimal',      desc: 'Clean, whitespace-heavy, ATS-safe',     accent: '#111827' },
  { id: 'modern',       name: 'Modern',       desc: 'Two-column with sidebar skills',         accent: '#1d4ed8' },
  { id: 'professional', name: 'Professional', desc: 'Classic single-column, corporate style', accent: '#1e3a5f' },
  { id: 'compact',      name: 'Compact',      desc: 'Dense layout, fits more on one page',    accent: '#374151' },
  { id: 'creative',     name: 'Creative',     desc: 'Bold header, subtle color accents',      accent: '#7c3aed' },
];

// ── Resume Templates ──────────────────────────────────────────────────────────

function MinimalTemplate({ r, scale = 1 }: { r: TailoredResume; scale?: number }) {
  return (
    <div style={{ fontFamily: 'Georgia, serif', fontSize: 11 * scale, color: '#111', lineHeight: 1.5, padding: 40 * scale, background: '#fff', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 * scale, borderBottom: '2px solid #111', paddingBottom: 14 * scale }}>
        <div style={{ fontSize: 22 * scale, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>{r.name}</div>
        <div style={{ fontSize: 10 * scale, color: '#555', marginTop: 6 * scale, display: 'flex', gap: 14 * scale, justifyContent: 'center', flexWrap: 'wrap' }}>
          {r.email && <span>{r.email}</span>}
          {r.phone && <span>{r.phone}</span>}
          {r.location && <span>{r.location}</span>}
          {r.linkedin && <span>{r.linkedin}</span>}
        </div>
      </div>
      {r.summary && (
        <div style={{ marginBottom: 16 * scale }}>
          <div style={{ fontSize: 11 * scale, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: '1px solid #ccc', paddingBottom: 4 * scale, marginBottom: 8 * scale }}>Summary</div>
          <div style={{ fontSize: 10.5 * scale, color: '#333' }}>{r.summary}</div>
        </div>
      )}
      {r.skills.length > 0 && (
        <div style={{ marginBottom: 16 * scale }}>
          <div style={{ fontSize: 11 * scale, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: '1px solid #ccc', paddingBottom: 4 * scale, marginBottom: 8 * scale }}>Skills</div>
          <div style={{ fontSize: 10.5 * scale, color: '#333' }}>{r.skills.join(' • ')}</div>
        </div>
      )}
      {r.experience.length > 0 && (
        <div style={{ marginBottom: 16 * scale }}>
          <div style={{ fontSize: 11 * scale, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: '1px solid #ccc', paddingBottom: 4 * scale, marginBottom: 8 * scale }}>Experience</div>
          {r.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 * scale }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 11 * scale }}>{e.title}</span>
                <span style={{ fontSize: 10 * scale, color: '#555' }}>{e.duration}</span>
              </div>
              <div style={{ fontSize: 10.5 * scale, color: '#444', fontStyle: 'italic', marginBottom: 4 * scale }}>{e.company}</div>
              <ul style={{ margin: 0, paddingLeft: 16 * scale }}>
                {e.bullets.map((b, j) => <li key={j} style={{ fontSize: 10.5 * scale, color: '#333', marginBottom: 2 * scale }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
      {r.education.length > 0 && (
        <div style={{ marginBottom: 16 * scale }}>
          <div style={{ fontSize: 11 * scale, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: '1px solid #ccc', paddingBottom: 4 * scale, marginBottom: 8 * scale }}>Education</div>
          {r.education.map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 * scale }}>
              <div><span style={{ fontWeight: 700 }}>{e.degree}</span><span style={{ color: '#555' }}> — {e.school}</span></div>
              <span style={{ fontSize: 10 * scale, color: '#555' }}>{e.year}</span>
            </div>
          ))}
        </div>
      )}
      {r.projects.length > 0 && (
        <div style={{ marginBottom: 16 * scale }}>
          <div style={{ fontSize: 11 * scale, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: '1px solid #ccc', paddingBottom: 4 * scale, marginBottom: 8 * scale }}>Projects</div>
          {r.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 8 * scale }}>
              <span style={{ fontWeight: 700 }}>{p.name}</span>
              <span style={{ color: '#555', fontSize: 10 * scale }}> — {p.tech}</span>
              <div style={{ fontSize: 10.5 * scale, color: '#333' }}>{p.description}</div>
            </div>
          ))}
        </div>
      )}
      {r.certifications.length > 0 && (
        <div>
          <div style={{ fontSize: 11 * scale, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: '1px solid #ccc', paddingBottom: 4 * scale, marginBottom: 8 * scale }}>Certifications</div>
          <div style={{ fontSize: 10.5 * scale, color: '#333' }}>{r.certifications.join(' • ')}</div>
        </div>
      )}
    </div>
  );
}

function ModernTemplate({ r, scale = 1 }: { r: TailoredResume; scale?: number }) {
  const accent = '#1d4ed8';
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11 * scale, color: '#111', display: 'flex', background: '#fff', width: '100%' }}>
      {/* Sidebar */}
      <div style={{ width: '30%', background: '#1e3a5f', color: '#fff', padding: 24 * scale, flexShrink: 0 }}>
        <div style={{ fontSize: 16 * scale, fontWeight: 700, marginBottom: 4 * scale, lineHeight: 1.3 }}>{r.name}</div>
        <div style={{ fontSize: 10 * scale, color: '#93c5fd', marginBottom: 20 * scale, fontWeight: 600 }}>{r.targetRole}</div>
        <div style={{ fontSize: 9 * scale, color: '#bfdbfe', lineHeight: 2, marginBottom: 20 * scale }}>
          {r.email && <div>{r.email}</div>}
          {r.phone && <div>{r.phone}</div>}
          {r.location && <div>{r.location}</div>}
          {r.linkedin && <div>{r.linkedin}</div>}
        </div>
        {r.skills.length > 0 && (
          <div style={{ marginBottom: 20 * scale }}>
            <div style={{ fontSize: 10 * scale, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#93c5fd', marginBottom: 10 * scale }}>Skills</div>
            {r.skills.map((s, i) => (
              <div key={i} style={{ fontSize: 9.5 * scale, color: '#e2e8f0', marginBottom: 5 * scale, display: 'flex', alignItems: 'center', gap: 6 * scale }}>
                <div style={{ width: 6 * scale, height: 6 * scale, borderRadius: '50%', background: accent, flexShrink: 0 }} />
                {s}
              </div>
            ))}
          </div>
        )}
        {r.certifications.length > 0 && (
          <div>
            <div style={{ fontSize: 10 * scale, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#93c5fd', marginBottom: 8 * scale }}>Certifications</div>
            {r.certifications.map((c, i) => <div key={i} style={{ fontSize: 9.5 * scale, color: '#e2e8f0', marginBottom: 4 * scale }}>{c}</div>)}
          </div>
        )}
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: 24 * scale }}>
        {r.summary && (
          <div style={{ marginBottom: 16 * scale }}>
            <div style={{ fontSize: 11 * scale, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: accent, borderBottom: '2px solid ' + accent, paddingBottom: 4 * scale, marginBottom: 8 * scale }}>Profile</div>
            <div style={{ fontSize: 10.5 * scale, color: '#374151', lineHeight: 1.6 }}>{r.summary}</div>
          </div>
        )}
        {r.experience.length > 0 && (
          <div style={{ marginBottom: 16 * scale }}>
            <div style={{ fontSize: 11 * scale, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: accent, borderBottom: '2px solid ' + accent, paddingBottom: 4 * scale, marginBottom: 10 * scale }}>Experience</div>
            {r.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: 12 * scale }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: 11 * scale }}>{e.title}</span>
                  <span style={{ fontSize: 9.5 * scale, color: '#6b7280', background: '#f3f4f6', padding: '1px 6px', borderRadius: 4 * scale }}>{e.duration}</span>
                </div>
                <div style={{ fontSize: 10 * scale, color: accent, fontWeight: 600, marginBottom: 4 * scale }}>{e.company}</div>
                <ul style={{ margin: 0, paddingLeft: 14 * scale }}>
                  {e.bullets.map((b, j) => <li key={j} style={{ fontSize: 10 * scale, color: '#374151', marginBottom: 2 * scale }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
        {r.education.length > 0 && (
          <div style={{ marginBottom: 16 * scale }}>
            <div style={{ fontSize: 11 * scale, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: accent, borderBottom: '2px solid ' + accent, paddingBottom: 4 * scale, marginBottom: 8 * scale }}>Education</div>
            {r.education.map((e, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 * scale }}>
                <div><span style={{ fontWeight: 700 }}>{e.degree}</span> — <span style={{ color: '#6b7280' }}>{e.school}</span></div>
                <span style={{ fontSize: 9.5 * scale, color: '#6b7280' }}>{e.year}</span>
              </div>
            ))}
          </div>
        )}
        {r.projects.length > 0 && (
          <div>
            <div style={{ fontSize: 11 * scale, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: accent, borderBottom: '2px solid ' + accent, paddingBottom: 4 * scale, marginBottom: 8 * scale }}>Projects</div>
            {r.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 8 * scale }}>
                <span style={{ fontWeight: 700 }}>{p.name}</span> <span style={{ color: accent, fontSize: 9.5 * scale }}>| {p.tech}</span>
                <div style={{ fontSize: 10 * scale, color: '#374151' }}>{p.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfessionalTemplate({ r, scale = 1 }: { r: TailoredResume; scale?: number }) {
  const accent = '#1e3a5f';
  return (
    <div style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: 11 * scale, color: '#111', background: '#fff', width: '100%', padding: 40 * scale }}>
      <div style={{ textAlign: 'center', marginBottom: 18 * scale }}>
        <div style={{ fontSize: 24 * scale, fontWeight: 700, color: accent, letterSpacing: 1 }}>{r.name}</div>
        <div style={{ fontSize: 12 * scale, fontWeight: 600, color: '#555', marginTop: 2 * scale }}>{r.targetRole}</div>
        <div style={{ fontSize: 9.5 * scale, color: '#666', marginTop: 6 * scale, display: 'flex', gap: 16 * scale, justifyContent: 'center', flexWrap: 'wrap' }}>
          {r.email && <span>✉ {r.email}</span>}
          {r.phone && <span>📞 {r.phone}</span>}
          {r.location && <span>📍 {r.location}</span>}
          {r.linkedin && <span>🔗 {r.linkedin}</span>}
        </div>
        <div style={{ height: 2, background: accent, margin: `${14 * scale}px 0` }} />
      </div>
      {r.summary && (
        <div style={{ marginBottom: 16 * scale }}>
          <div style={{ fontSize: 12 * scale, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 * scale }}>Professional Summary</div>
          <div style={{ fontSize: 10.5 * scale, color: '#333', lineHeight: 1.7 }}>{r.summary}</div>
        </div>
      )}
      {r.skills.length > 0 && (
        <div style={{ marginBottom: 16 * scale }}>
          <div style={{ fontSize: 12 * scale, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 * scale }}>Core Competencies</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 * scale }}>
            {r.skills.map((s, i) => <span key={i} style={{ padding: `${3 * scale}px ${8 * scale}px`, border: `1px solid ${accent}`, borderRadius: 3 * scale, fontSize: 9.5 * scale, color: accent }}>{s}</span>)}
          </div>
        </div>
      )}
      {r.experience.length > 0 && (
        <div style={{ marginBottom: 16 * scale }}>
          <div style={{ fontSize: 12 * scale, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 * scale }}>Professional Experience</div>
          {r.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 14 * scale }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderLeft: `3px solid ${accent}`, paddingLeft: 8 * scale }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 11.5 * scale }}>{e.title}</div>
                  <div style={{ fontSize: 10.5 * scale, color: '#555', fontStyle: 'italic' }}>{e.company}</div>
                </div>
                <div style={{ fontSize: 10 * scale, color: '#666', textAlign: 'right' }}>{e.duration}</div>
              </div>
              <ul style={{ margin: `${6 * scale}px 0 0`, paddingLeft: 22 * scale }}>
                {e.bullets.map((b, j) => <li key={j} style={{ fontSize: 10.5 * scale, color: '#333', marginBottom: 3 * scale }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
      {r.education.length > 0 && (
        <div style={{ marginBottom: 16 * scale }}>
          <div style={{ fontSize: 12 * scale, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 * scale }}>Education</div>
          {r.education.map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 * scale }}>
              <div><span style={{ fontWeight: 700 }}>{e.degree}</span> — {e.school}</div>
              <span style={{ fontSize: 10 * scale, color: '#666' }}>{e.year}</span>
            </div>
          ))}
        </div>
      )}
      {r.projects.length > 0 && (
        <div>
          <div style={{ fontSize: 12 * scale, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 * scale }}>Key Projects</div>
          {r.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 8 * scale }}>
              <span style={{ fontWeight: 700 }}>{p.name}</span> <span style={{ color: '#666', fontSize: 10 * scale }}>({p.tech})</span>
              <div style={{ fontSize: 10.5 * scale, color: '#333' }}>{p.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompactTemplate({ r, scale = 1 }: { r: TailoredResume; scale?: number }) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10 * scale, color: '#111', background: '#fff', width: '100%', padding: 28 * scale }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 * scale, borderBottom: '2px solid #374151', paddingBottom: 8 * scale }}>
        <div>
          <div style={{ fontSize: 18 * scale, fontWeight: 800, color: '#111' }}>{r.name}</div>
          <div style={{ fontSize: 10 * scale, fontWeight: 600, color: '#374151' }}>{r.targetRole}</div>
        </div>
        <div style={{ fontSize: 8.5 * scale, color: '#555', textAlign: 'right', lineHeight: 1.8 }}>
          {r.email && <div>{r.email}</div>}
          {r.phone && <div>{r.phone}</div>}
          {r.location && <div>{r.location}</div>}
          {r.linkedin && <div>{r.linkedin}</div>}
        </div>
      </div>
      {r.summary && <div style={{ fontSize: 9.5 * scale, color: '#333', lineHeight: 1.5, marginBottom: 10 * scale }}>{r.summary}</div>}
      {r.skills.length > 0 && (
        <div style={{ marginBottom: 10 * scale }}>
          <span style={{ fontSize: 9 * scale, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#374151' }}>Skills: </span>
          <span style={{ fontSize: 9.5 * scale, color: '#333' }}>{r.skills.join(' · ')}</span>
        </div>
      )}
      {r.experience.length > 0 && (
        <div style={{ marginBottom: 10 * scale }}>
          <div style={{ fontSize: 9 * scale, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#374151', marginBottom: 6 * scale }}>Experience</div>
          {r.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 * scale }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 10 * scale }}>{e.title} — {e.company}</span>
                <span style={{ fontSize: 8.5 * scale, color: '#666' }}>{e.duration}</span>
              </div>
              <ul style={{ margin: `${3 * scale}px 0 0`, paddingLeft: 14 * scale }}>
                {e.bullets.slice(0, 2).map((b, j) => <li key={j} style={{ fontSize: 9.5 * scale, color: '#333', marginBottom: 1 * scale }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 20 * scale }}>
        {r.education.length > 0 && (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9 * scale, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#374151', marginBottom: 4 * scale }}>Education</div>
            {r.education.map((e, i) => (
              <div key={i} style={{ fontSize: 9.5 * scale, marginBottom: 3 * scale }}>
                <span style={{ fontWeight: 700 }}>{e.degree}</span> — {e.school} <span style={{ color: '#666' }}>({e.year})</span>
              </div>
            ))}
          </div>
        )}
        {r.certifications.length > 0 && (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9 * scale, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#374151', marginBottom: 4 * scale }}>Certifications</div>
            {r.certifications.map((c, i) => <div key={i} style={{ fontSize: 9.5 * scale, color: '#333', marginBottom: 2 * scale }}>{c}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}

function CreativeTemplate({ r, scale = 1 }: { r: TailoredResume; scale?: number }) {
  const accent = '#7c3aed';
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11 * scale, color: '#111', background: '#fff', width: '100%' }}>
      <div style={{ background: accent, color: '#fff', padding: `${28 * scale}px ${36 * scale}px` }}>
        <div style={{ fontSize: 26 * scale, fontWeight: 800, letterSpacing: -0.5 }}>{r.name}</div>
        <div style={{ fontSize: 13 * scale, color: '#ddd6fe', fontWeight: 500, marginTop: 4 * scale }}>{r.targetRole}</div>
        <div style={{ fontSize: 9.5 * scale, color: '#c4b5fd', marginTop: 10 * scale, display: 'flex', gap: 16 * scale, flexWrap: 'wrap' }}>
          {r.email && <span>{r.email}</span>}
          {r.phone && <span>{r.phone}</span>}
          {r.location && <span>{r.location}</span>}
          {r.linkedin && <span>{r.linkedin}</span>}
        </div>
      </div>
      <div style={{ padding: `${24 * scale}px ${36 * scale}px` }}>
        {r.summary && (
          <div style={{ marginBottom: 16 * scale }}>
            <div style={{ fontSize: 11 * scale, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: accent, marginBottom: 6 * scale }}>About Me</div>
            <div style={{ fontSize: 10.5 * scale, color: '#374151', lineHeight: 1.65 }}>{r.summary}</div>
          </div>
        )}
        {r.skills.length > 0 && (
          <div style={{ marginBottom: 16 * scale }}>
            <div style={{ fontSize: 11 * scale, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: accent, marginBottom: 8 * scale }}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 * scale }}>
              {r.skills.map((s, i) => <span key={i} style={{ padding: `${4 * scale}px ${10 * scale}px`, background: '#f3e8ff', color: accent, borderRadius: 100 * scale, fontSize: 9.5 * scale, fontWeight: 600 }}>{s}</span>)}
            </div>
          </div>
        )}
        {r.experience.length > 0 && (
          <div style={{ marginBottom: 16 * scale }}>
            <div style={{ fontSize: 11 * scale, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: accent, marginBottom: 8 * scale }}>Experience</div>
            {r.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: 12 * scale, paddingLeft: 12 * scale, borderLeft: `3px solid ${accent}` }}>
                <div style={{ fontWeight: 700, fontSize: 11 * scale }}>{e.title}</div>
                <div style={{ fontSize: 10 * scale, color: accent, marginBottom: 4 * scale }}>{e.company} · {e.duration}</div>
                <ul style={{ margin: 0, paddingLeft: 14 * scale }}>
                  {e.bullets.map((b, j) => <li key={j} style={{ fontSize: 10 * scale, color: '#374151', marginBottom: 2 * scale }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 24 * scale }}>
          {r.education.length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11 * scale, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: accent, marginBottom: 8 * scale }}>Education</div>
              {r.education.map((e, i) => (
                <div key={i} style={{ marginBottom: 6 * scale }}>
                  <div style={{ fontWeight: 700, fontSize: 10.5 * scale }}>{e.degree}</div>
                  <div style={{ fontSize: 10 * scale, color: '#6b7280' }}>{e.school} · {e.year}</div>
                </div>
              ))}
            </div>
          )}
          {r.projects.length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11 * scale, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: accent, marginBottom: 8 * scale }}>Projects</div>
              {r.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 6 * scale }}>
                  <div style={{ fontWeight: 700, fontSize: 10.5 * scale }}>{p.name}</div>
                  <div style={{ fontSize: 10 * scale, color: '#6b7280' }}>{p.tech}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResumePreview({ resume, templateId, scale = 1 }: { resume: TailoredResume; templateId: TemplateId; scale?: number }) {
  switch (templateId) {
    case 'minimal':      return <MinimalTemplate r={resume} scale={scale} />;
    case 'modern':       return <ModernTemplate r={resume} scale={scale} />;
    case 'professional': return <ProfessionalTemplate r={resume} scale={scale} />;
    case 'compact':      return <CompactTemplate r={resume} scale={scale} />;
    case 'creative':     return <CreativeTemplate r={resume} scale={scale} />;
  }
}

// ── Main Component ────────────────────────────────────────────────────────────
interface Props {
  resumeText: string;
  onBack: () => void;
}

export default function ResumeBuilderPage({ resumeText, onBack }: Props) {
  const [step, setStep] = useState<'jd' | 'generating' | 'templates' | 'preview' | 'edit'>('jd');
  const [jdText, setJdText] = useState('');
  const [tailored, setTailored] = useState<TailoredResume | null>(null);
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateId | null>(null);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!jdText.trim()) return;
    setStep('generating');
    setError('');
    try {
      const result = await tailorResumeWithAI(resumeText, jdText);
      setTailored(result);
      setStep('templates');
    } catch (e: any) {
      setError(e.message || 'Failed to generate resume. Please try again.');
      setStep('jd');
    }
  };

  const handleDownloadPDF = async (tid: TemplateId) => {
    if (!tailored) return;
    setDownloading(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      // Render a full-size hidden preview
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;background:#fff;z-index:-1';
      document.body.appendChild(container);

      const { createRoot } = await import('react-dom/client');
      const { createElement } = await import('react');
      const root = createRoot(container);
      root.render(createElement(ResumePreview, { resume: tailored, templateId: tid, scale: 1 }));

      await new Promise(r => setTimeout(r, 600));

      const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#fff', logging: false });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = pdfW / imgW;
      const finalH = imgH * ratio;

      if (finalH <= pdfH) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfW, finalH);
      } else {
        // Multi-page
        let y = 0;
        while (y < imgH) {
          const sliceH = Math.min(pdfH / ratio, imgH - y);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = imgW;
          sliceCanvas.height = sliceH;
          const ctx = sliceCanvas.getContext('2d')!;
          ctx.drawImage(canvas, 0, y, imgW, sliceH, 0, 0, imgW, sliceH);
          const sliceData = sliceCanvas.toDataURL('image/png');
          if (y > 0) pdf.addPage();
          pdf.addImage(sliceData, 'PNG', 0, 0, pdfW, sliceH * ratio);
          y += sliceH;
        }
      }

      root.unmount();
      document.body.removeChild(container);

      const fileName = `${(tailored.name || 'Resume').replace(/\s+/g, '_')}_${tid}.pdf`;
      pdf.save(fileName);
    } catch (e) {
      console.error('PDF error:', e);
      alert('PDF generation failed. Please try again.');
    }
    setDownloading(false);
  };

  const updateField = (field: keyof TailoredResume, value: any) => {
    if (!tailored) return;
    setTailored({ ...tailored, [field]: value });
  };

  // ── Step: Paste JD ──
  if (step === 'jd') return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0', background: 'none', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', marginBottom: 20 }}>
        <ChevronLeft size={16} /> Back to Job Search
      </button>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <Sparkles size={26} color="#fff" />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>AI Resume Tailor</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Paste a Job Description and we'll rewrite your resume to match it perfectly</p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <X size={15} /> {error}
        </div>
      )}

      <div style={{ background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Your Resume (loaded)</div>
        <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, maxHeight: 80, overflow: 'hidden', position: 'relative' }}>
          {resumeText.slice(0, 300)}...
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 30, background: 'linear-gradient(transparent, #f9fafb)' }} />
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#111827', display: 'block', marginBottom: 8 }}>
          Paste the Job Description
        </label>
        <textarea
          placeholder="Paste the full job description here...&#10;&#10;Example:&#10;We are looking for a Senior Product Manager to join our team...&#10;Requirements:&#10;- 5+ years of product management experience&#10;- Strong analytical skills..."
          value={jdText}
          onChange={e => setJdText(e.target.value)}
          style={{ width: '100%', height: 220, padding: 14, borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 13, color: '#111827', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
          onFocus={e => e.currentTarget.style.borderColor = '#111827'}
          onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
        />
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>{jdText.length} characters</div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!jdText.trim() || jdText.length < 50}
        style={{ width: '100%', padding: '14px', borderRadius: 12, background: jdText.trim() && jdText.length >= 50 ? '#111827' : '#e5e7eb', border: 'none', color: jdText.trim() && jdText.length >= 50 ? '#fff' : '#9ca3af', fontSize: 15, fontWeight: 700, cursor: jdText.trim() && jdText.length >= 50 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        <Sparkles size={18} /> Generate Tailored Resume
      </button>
    </div>
  );

  // ── Step: Generating ──
  if (step === 'generating') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 24 }}>
        <div style={{ position: 'absolute', inset: 0, border: '4px solid #e5e7eb', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, border: '4px solid #111827', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ position: 'absolute', inset: '50%', transform: 'translate(-50%,-50%)', width: 40, height: 40, background: '#111827', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={20} color="#fff" />
        </div>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>Tailoring Your Resume...</h2>
      <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 20px', maxWidth: 400 }}>AI is analyzing the JD, matching your experience, and rewriting your resume for maximum ATS score.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 380 }}>
        {['Parsing job description & extracting keywords...', 'Mapping your experience to JD requirements...', 'Rewriting summary and bullet points...', 'Optimizing for ATS compatibility...'].map((msg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#111827', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: `${i * 0.2}s`, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#374151' }}>{msg}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}`}</style>
    </div>
  );

  // ── Step: Template Selection ──
  if (step === 'templates' && tailored) return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 0 8px', background: 'none', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer' }}>
            <ChevronLeft size={16} /> Back
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>Choose a Template</h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Your resume has been tailored for: <strong>{tailored.targetRole}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 320 }}>
          {tailored.matchKeywords.slice(0, 5).map((kw, i) => (
            <span key={i} style={{ padding: '3px 10px', borderRadius: 100, background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 600 }}>
              <CheckCircle2 size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />{kw}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
        {TEMPLATES.map(t => (
          <div key={t.id} style={{ borderRadius: 14, border: `2px solid ${selectedTemplate === t.id ? '#111827' : '#e5e7eb'}`, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', boxShadow: selectedTemplate === t.id ? '0 4px 16px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.04)' }}
            onClick={() => setSelectedTemplate(t.id)}>
            {/* Mini preview */}
            <div style={{ height: 200, overflow: 'hidden', background: '#f9fafb', position: 'relative', pointerEvents: 'none' }}>
              <div style={{ transform: 'scale(0.42)', transformOrigin: 'top left', width: '238%', height: '238%' }}>
                <ResumePreview resume={tailored} templateId={t.id} scale={1} />
              </div>
              {selectedTemplate === t.id && (
                <div style={{ position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderRadius: '50%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={14} color="#fff" />
                </div>
              )}
            </div>
            <div style={{ padding: '12px 16px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{t.desc}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={e => { e.stopPropagation(); setPreviewTemplate(t.id); }} style={{ padding: '6px 10px', borderRadius: 8, background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#374151', fontWeight: 600 }}>
                  <Eye size={12} /> Preview
                </button>
                <button onClick={e => { e.stopPropagation(); setSelectedTemplate(t.id); handleDownloadPDF(t.id); }} style={{ padding: '6px 10px', borderRadius: 8, background: '#111827', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#fff', fontWeight: 600 }}>
                  <Download size={12} /> PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit + Download bar */}
      <div style={{ position: 'sticky', bottom: 16, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Selected: {TEMPLATES.find(t => t.id === selectedTemplate)?.name}</div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>ATS-optimized · Tailored for {tailored.targetRole}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setStep('edit')} style={{ padding: '10px 20px', borderRadius: 10, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Edit3 size={14} /> Edit
          </button>
          <button
            onClick={() => handleDownloadPDF(selectedTemplate)}
            disabled={downloading}
            style={{ padding: '10px 24px', borderRadius: 10, background: downloading ? '#9ca3af' : '#111827', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} /> {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Full preview modal */}
      {previewTemplate && (
        <div onClick={() => setPreviewTemplate(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '40px 20px', overflowY: 'auto' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, maxWidth: 794, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Preview — {TEMPLATES.find(t => t.id === previewTemplate)?.name}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setSelectedTemplate(previewTemplate); handleDownloadPDF(previewTemplate); }} style={{ padding: '8px 16px', borderRadius: 8, background: '#111827', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Download size={13} /> Download PDF
                </button>
                <button onClick={() => setPreviewTemplate(null)} style={{ padding: 8, borderRadius: 8, background: '#f3f4f6', border: 'none', cursor: 'pointer' }}>
                  <X size={16} color="#6b7280" />
                </button>
              </div>
            </div>
            <div ref={previewRef} style={{ width: '100%' }}>
              <ResumePreview resume={tailored} templateId={previewTemplate} scale={1} />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Step: Edit ──
  if (step === 'edit' && tailored) return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <button onClick={() => setStep('templates')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 0 8px', background: 'none', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer' }}>
            <ChevronLeft size={16} /> Back to Templates
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Edit Resume</h1>
        </div>
        <button onClick={() => handleDownloadPDF(selectedTemplate)} disabled={downloading} style={{ padding: '10px 20px', borderRadius: 10, background: downloading ? '#9ca3af' : '#111827', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Download size={14} /> {downloading ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Basic info */}
        <div style={{ padding: 20, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Basic Info</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {(['name', 'email', 'phone', 'location', 'linkedin'] as const).map(f => (
              <div key={f}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4, textTransform: 'capitalize' }}>{f}</label>
                <input value={tailored[f]} onChange={e => updateField(f, e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#111827'} onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'} />
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div style={{ padding: 20, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Summary</div>
          <textarea value={tailored.summary} onChange={e => updateField('summary', e.target.value)}
            style={{ width: '100%', height: 90, padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, color: '#111827', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
            onFocus={e => e.currentTarget.style.borderColor = '#111827'} onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'} />
        </div>

        {/* Skills */}
        <div style={{ padding: 20, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Skills (comma-separated)</div>
          <input value={tailored.skills.join(', ')} onChange={e => updateField('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.currentTarget.style.borderColor = '#111827'} onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'} />
        </div>

        {/* Experience */}
        <div style={{ padding: 20, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Experience</div>
          {tailored.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < tailored.experience.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Title</label>
                  <input value={exp.title} onChange={e => { const ex = [...tailored.experience]; ex[i] = { ...ex[i], title: e.target.value }; updateField('experience', ex); }}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #e5e7eb', fontSize: 12, color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Company</label>
                  <input value={exp.company} onChange={e => { const ex = [...tailored.experience]; ex[i] = { ...ex[i], company: e.target.value }; updateField('experience', ex); }}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #e5e7eb', fontSize: 12, color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Duration</label>
                  <input value={exp.duration} onChange={e => { const ex = [...tailored.experience]; ex[i] = { ...ex[i], duration: e.target.value }; updateField('experience', ex); }}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #e5e7eb', fontSize: 12, color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Bullets (one per line)</label>
              <textarea value={exp.bullets.join('\n')} onChange={e => { const ex = [...tailored.experience]; ex[i] = { ...ex[i], bullets: e.target.value.split('\n').filter(Boolean) }; updateField('experience', ex); }}
                style={{ width: '100%', height: 80, padding: '7px 10px', borderRadius: 7, border: '1px solid #e5e7eb', fontSize: 12, color: '#111827', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <button onClick={() => setStep('templates')} style={{ flex: 1, padding: '12px', borderRadius: 10, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Back to Templates
        </button>
        <button onClick={() => handleDownloadPDF(selectedTemplate)} disabled={downloading} style={{ flex: 1, padding: '12px', borderRadius: 10, background: downloading ? '#9ca3af' : '#111827', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Download size={16} /> {downloading ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>
    </div>
  );

  return null;
}
