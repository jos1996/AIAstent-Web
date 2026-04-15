import { useState, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { X, Download, ChevronLeft, Sparkles, CheckCircle2, Edit3, Eye, Loader2 } from 'lucide-react';
import { tailorResumeWithAI } from '../lib/resumeTailor';
import type { TailoredResume } from '../lib/resumeTailor';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type TemplateId = 'modern' | 'professional' | 'minimal' | 'compact' | 'creative';
type Step = 'jd' | 'generating' | 'templates' | 'edit';

const TEMPLATES: { id: TemplateId; name: string; desc: string; color: string }[] = [
  { id: 'modern',       name: 'Modern',       desc: 'Two-column sidebar layout',       color: '#1d4ed8' },
  { id: 'professional', name: 'Professional', desc: 'Classic corporate style',          color: '#1e3a5f' },
  { id: 'minimal',      name: 'Minimal',      desc: 'Clean whitespace, ATS-safe',       color: '#111827' },
  { id: 'compact',      name: 'Compact',      desc: 'Dense, fits more in one page',     color: '#374151' },
  { id: 'creative',     name: 'Creative',     desc: 'Bold header with colour accents',  color: '#7c3aed' },
];

// ── Shared section heading ────────────────────────────────────────────────────
function Sec({ title, accent = '#111', children, s }: { title: string; accent?: string; children: React.ReactNode; s: (n: number) => number }) {
  return (
    <div style={{ marginBottom: s(14) }}>
      <div style={{ fontSize: s(9.5), fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: s(1.5), color: accent, borderBottom: `${s(1.5)}px solid ${accent}22`, paddingBottom: s(3), marginBottom: s(8) }}>{title}</div>
      {children}
    </div>
  );
}

// ── TEMPLATE 1: Modern (two-column) ──────────────────────────────────────────
function ModernTemplate({ r, scale = 1 }: { r: TailoredResume; scale?: number }) {
  const s = (n: number) => n * scale;
  const accent = '#1d4ed8';
  return (
    <div style={{ fontFamily: 'Arial,sans-serif', display: 'flex', background: '#fff', width: '100%', minHeight: s(842) }}>
      <div style={{ width: '32%', background: '#1e3a5f', color: '#fff', padding: `${s(28)}px ${s(20)}px`, flexShrink: 0 }}>
        <div style={{ fontSize: s(16), fontWeight: 800, lineHeight: 1.2, marginBottom: s(4) }}>{r.name || 'Your Name'}</div>
        <div style={{ fontSize: s(10), color: '#93c5fd', fontWeight: 600, marginBottom: s(18) }}>{r.targetRole}</div>
        <div style={{ fontSize: s(8.5), color: '#bfdbfe', lineHeight: 2, marginBottom: s(20) }}>
          {r.email && <div>{r.email}</div>}
          {r.phone && <div>{r.phone}</div>}
          {r.location && <div>{r.location}</div>}
          {r.linkedin && <div>{r.linkedin}</div>}
        </div>
        {r.skills.length > 0 && (
          <div style={{ marginBottom: s(20) }}>
            <div style={{ fontSize: s(9), fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: s(1.5), color: '#93c5fd', marginBottom: s(10) }}>Skills</div>
            {r.skills.map((sk, i) => (
              <div key={i} style={{ fontSize: s(9), color: '#e2e8f0', marginBottom: s(5), display: 'flex', alignItems: 'center', gap: s(6) }}>
                <div style={{ width: s(5), height: s(5), borderRadius: '50%', background: accent, flexShrink: 0 }} />{sk}
              </div>
            ))}
          </div>
        )}
        {r.certifications.length > 0 && (
          <div>
            <div style={{ fontSize: s(9), fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: s(1.5), color: '#93c5fd', marginBottom: s(8) }}>Certifications</div>
            {r.certifications.map((c, i) => <div key={i} style={{ fontSize: s(8.5), color: '#e2e8f0', marginBottom: s(4) }}>{c}</div>)}
          </div>
        )}
      </div>
      <div style={{ flex: 1, padding: `${s(28)}px ${s(24)}px` }}>
        {r.summary && <Sec title="Profile" accent={accent} s={s}><div style={{ fontSize: s(10), color: '#374151', lineHeight: 1.65 }}>{r.summary}</div></Sec>}
        {r.experience.length > 0 && (
          <Sec title="Experience" accent={accent} s={s}>
            {r.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: s(12) }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: s(10.5) }}>{e.title}</span>
                  <span style={{ fontSize: s(9), color: '#6b7280', background: '#f3f4f6', padding: `${s(1)}px ${s(6)}px`, borderRadius: s(4) }}>{e.duration}</span>
                </div>
                <div style={{ fontSize: s(9.5), color: accent, fontWeight: 600, marginBottom: s(4) }}>{e.company}</div>
                <ul style={{ margin: 0, paddingLeft: s(14) }}>
                  {e.bullets.map((b, j) => <li key={j} style={{ fontSize: s(9.5), color: '#374151', marginBottom: s(2) }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </Sec>
        )}
        {r.education.length > 0 && (
          <Sec title="Education" accent={accent} s={s}>
            {r.education.map((e, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: s(5) }}>
                <div><strong>{e.degree}</strong> — <span style={{ color: '#6b7280' }}>{e.school}</span></div>
                <span style={{ fontSize: s(9.5), color: '#6b7280' }}>{e.year}</span>
              </div>
            ))}
          </Sec>
        )}
        {r.projects.length > 0 && (
          <Sec title="Projects" accent={accent} s={s}>
            {r.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: s(8) }}>
                <span style={{ fontWeight: 700, fontSize: s(10) }}>{p.name}</span>
                <span style={{ fontSize: s(9), color: accent }}> · {p.tech}</span>
                <div style={{ fontSize: s(9.5), color: '#374151' }}>{p.description}</div>
              </div>
            ))}
          </Sec>
        )}
      </div>
    </div>
  );
}

// ── TEMPLATE 2: Professional ──────────────────────────────────────────────────
function ProfessionalTemplate({ r, scale = 1 }: { r: TailoredResume; scale?: number }) {
  const s = (n: number) => n * scale;
  const accent = '#1e3a5f';
  return (
    <div style={{ fontFamily: '"Times New Roman",Times,serif', fontSize: s(10.5), color: '#111', background: '#fff', padding: `${s(40)}px ${s(44)}px`, width: '100%', boxSizing: 'border-box' }}>
      <div style={{ textAlign: 'center', marginBottom: s(18) }}>
        <div style={{ fontSize: s(24), fontWeight: 700, color: accent, letterSpacing: s(0.5) }}>{r.name || 'Your Name'}</div>
        <div style={{ fontSize: s(11.5), fontWeight: 600, color: '#555', marginTop: s(3) }}>{r.targetRole}</div>
        <div style={{ height: s(2), background: accent, margin: `${s(12)}px 0` }} />
        <div style={{ fontSize: s(9.5), color: '#666', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' as const, gap: s(18) }}>
          {r.email && <span>✉ {r.email}</span>}
          {r.phone && <span>☎ {r.phone}</span>}
          {r.location && <span>⊛ {r.location}</span>}
          {r.linkedin && <span>⊞ {r.linkedin}</span>}
        </div>
      </div>
      {r.summary && <Sec title="Professional Summary" accent={accent} s={s}><div style={{ fontSize: s(10.5), color: '#333', lineHeight: 1.7 }}>{r.summary}</div></Sec>}
      {r.skills.length > 0 && (
        <Sec title="Core Competencies" accent={accent} s={s}>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: s(6) }}>
            {r.skills.map((sk, i) => <span key={i} style={{ padding: `${s(3)}px ${s(10)}px`, border: `${s(1)}px solid ${accent}`, borderRadius: s(3), fontSize: s(9.5), color: accent }}>{sk}</span>)}
          </div>
        </Sec>
      )}
      {r.experience.length > 0 && (
        <Sec title="Professional Experience" accent={accent} s={s}>
          {r.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: s(14), paddingLeft: s(10), borderLeft: `${s(3)}px solid ${accent}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: s(11) }}>{e.title}</div>
                  <div style={{ fontSize: s(10), color: '#555', fontStyle: 'italic' }}>{e.company}</div>
                </div>
                <div style={{ fontSize: s(9.5), color: '#666', textAlign: 'right' as const }}>{e.duration}</div>
              </div>
              <ul style={{ margin: `${s(5)}px 0 0`, paddingLeft: s(18) }}>
                {e.bullets.map((b, j) => <li key={j} style={{ fontSize: s(10.5), color: '#333', marginBottom: s(2) }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </Sec>
      )}
      {r.education.length > 0 && (
        <Sec title="Education" accent={accent} s={s}>
          {r.education.map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: s(5) }}>
              <div><strong>{e.degree}</strong> — {e.school}</div>
              <span style={{ fontSize: s(10), color: '#666' }}>{e.year}</span>
            </div>
          ))}
        </Sec>
      )}
      {r.projects.length > 0 && (
        <Sec title="Key Projects" accent={accent} s={s}>
          {r.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: s(8) }}>
              <strong>{p.name}</strong> <span style={{ fontSize: s(10), color: '#666' }}>({p.tech})</span>
              <div style={{ fontSize: s(10.5), color: '#333' }}>{p.description}</div>
            </div>
          ))}
        </Sec>
      )}
    </div>
  );
}

// ── TEMPLATE 3: Minimal ───────────────────────────────────────────────────────
function MinimalTemplate({ r, scale = 1 }: { r: TailoredResume; scale?: number }) {
  const s = (n: number) => n * scale;
  return (
    <div style={{ fontFamily: 'Georgia,serif', fontSize: s(10.5), color: '#111', lineHeight: 1.55, padding: `${s(36)}px ${s(40)}px`, background: '#fff', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ textAlign: 'center', borderBottom: `${s(2)}px solid #111`, paddingBottom: s(12), marginBottom: s(16) }}>
        <div style={{ fontSize: s(22), fontWeight: 800, letterSpacing: s(2), textTransform: 'uppercase' as const }}>{r.name || 'Your Name'}</div>
        {r.targetRole && <div style={{ fontSize: s(11), color: '#555', marginTop: s(3), fontStyle: 'italic' }}>{r.targetRole}</div>}
        <div style={{ fontSize: s(9.5), color: '#666', marginTop: s(6), display: 'flex', justifyContent: 'center', flexWrap: 'wrap' as const, gap: s(14) }}>
          {r.email && <span>{r.email}</span>}
          {r.phone && <span>{r.phone}</span>}
          {r.location && <span>{r.location}</span>}
          {r.linkedin && <span>{r.linkedin}</span>}
        </div>
      </div>
      {r.summary && <Sec title="Summary" s={s}><div style={{ fontSize: s(10), color: '#333' }}>{r.summary}</div></Sec>}
      {r.skills.length > 0 && <Sec title="Skills" s={s}><div style={{ fontSize: s(10), color: '#333' }}>{r.skills.join('  ·  ')}</div></Sec>}
      {r.experience.length > 0 && (
        <Sec title="Experience" s={s}>
          {r.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: s(10) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: s(10.5) }}>{e.title}</span>
                <span style={{ fontSize: s(9.5), color: '#666' }}>{e.duration}</span>
              </div>
              <div style={{ fontSize: s(10), color: '#555', fontStyle: 'italic', marginBottom: s(3) }}>{e.company}</div>
              <ul style={{ margin: 0, paddingLeft: s(16) }}>
                {e.bullets.map((b, j) => <li key={j} style={{ fontSize: s(10), color: '#333', marginBottom: s(2) }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </Sec>
      )}
      {r.education.length > 0 && (
        <Sec title="Education" s={s}>
          {r.education.map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: s(4) }}>
              <span><strong>{e.degree}</strong> — {e.school}</span>
              <span style={{ fontSize: s(9.5), color: '#666' }}>{e.year}</span>
            </div>
          ))}
        </Sec>
      )}
      {r.projects.length > 0 && (
        <Sec title="Projects" s={s}>
          {r.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: s(7) }}>
              <strong>{p.name}</strong> <span style={{ color: '#666', fontSize: s(9.5) }}>— {p.tech}</span>
              <div style={{ fontSize: s(10), color: '#333' }}>{p.description}</div>
            </div>
          ))}
        </Sec>
      )}
    </div>
  );
}

// ── TEMPLATE 4: Compact ───────────────────────────────────────────────────────
function CompactTemplate({ r, scale = 1 }: { r: TailoredResume; scale?: number }) {
  const s = (n: number) => n * scale;
  return (
    <div style={{ fontFamily: 'Arial,sans-serif', fontSize: s(9.5), color: '#111', background: '#fff', padding: `${s(26)}px ${s(30)}px`, width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: s(10), paddingBottom: s(8), borderBottom: `${s(2)}px solid #374151` }}>
        <div>
          <div style={{ fontSize: s(18), fontWeight: 800 }}>{r.name || 'Your Name'}</div>
          <div style={{ fontSize: s(10), fontWeight: 600, color: '#374151' }}>{r.targetRole}</div>
        </div>
        <div style={{ fontSize: s(8.5), color: '#555', textAlign: 'right' as const, lineHeight: 1.9 }}>
          {r.email && <div>{r.email}</div>}
          {r.phone && <div>{r.phone}</div>}
          {r.location && <div>{r.location}</div>}
          {r.linkedin && <div>{r.linkedin}</div>}
        </div>
      </div>
      {r.summary && <div style={{ fontSize: s(9.5), color: '#333', lineHeight: 1.5, marginBottom: s(9) }}>{r.summary}</div>}
      {r.skills.length > 0 && (
        <div style={{ marginBottom: s(9) }}>
          <span style={{ fontSize: s(8.5), fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: s(1), color: '#374151' }}>Skills: </span>
          <span style={{ fontSize: s(9.5), color: '#333' }}>{r.skills.join(' · ')}</span>
        </div>
      )}
      {r.experience.length > 0 && (
        <div style={{ marginBottom: s(9) }}>
          <div style={{ fontSize: s(8.5), fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: s(1), color: '#374151', marginBottom: s(5) }}>Experience</div>
          {r.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: s(7) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: s(9.5) }}>{e.title} — {e.company}</span>
                <span style={{ fontSize: s(8.5), color: '#666' }}>{e.duration}</span>
              </div>
              <ul style={{ margin: `${s(3)}px 0 0`, paddingLeft: s(13) }}>
                {e.bullets.slice(0, 3).map((b, j) => <li key={j} style={{ fontSize: s(9), color: '#333', marginBottom: s(1) }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: s(20) }}>
        {r.education.length > 0 && (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: s(8.5), fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: s(1), color: '#374151', marginBottom: s(4) }}>Education</div>
            {r.education.map((e, i) => <div key={i} style={{ fontSize: s(9), marginBottom: s(3) }}><strong>{e.degree}</strong> — {e.school} <span style={{ color: '#666' }}>({e.year})</span></div>)}
          </div>
        )}
        {r.certifications.length > 0 && (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: s(8.5), fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: s(1), color: '#374151', marginBottom: s(4) }}>Certifications</div>
            {r.certifications.map((c, i) => <div key={i} style={{ fontSize: s(9), marginBottom: s(2) }}>{c}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TEMPLATE 5: Creative ──────────────────────────────────────────────────────
function CreativeTemplate({ r, scale = 1 }: { r: TailoredResume; scale?: number }) {
  const s = (n: number) => n * scale;
  const accent = '#7c3aed';
  return (
    <div style={{ fontFamily: 'Arial,sans-serif', fontSize: s(10.5), color: '#111', background: '#fff', width: '100%' }}>
      <div style={{ background: `linear-gradient(135deg, ${accent}, #4f46e5)`, color: '#fff', padding: `${s(28)}px ${s(36)}px` }}>
        <div style={{ fontSize: s(26), fontWeight: 800, letterSpacing: s(-0.5) }}>{r.name || 'Your Name'}</div>
        <div style={{ fontSize: s(12), color: '#ddd6fe', fontWeight: 500, marginTop: s(4) }}>{r.targetRole}</div>
        <div style={{ fontSize: s(9.5), color: '#c4b5fd', marginTop: s(10), display: 'flex', flexWrap: 'wrap' as const, gap: s(16) }}>
          {r.email && <span>{r.email}</span>}
          {r.phone && <span>{r.phone}</span>}
          {r.location && <span>{r.location}</span>}
          {r.linkedin && <span>{r.linkedin}</span>}
        </div>
      </div>
      <div style={{ padding: `${s(24)}px ${s(36)}px` }}>
        {r.summary && <Sec title="About Me" accent={accent} s={s}><div style={{ fontSize: s(10.5), color: '#374151', lineHeight: 1.65 }}>{r.summary}</div></Sec>}
        {r.skills.length > 0 && (
          <Sec title="Skills" accent={accent} s={s}>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: s(5) }}>
              {r.skills.map((sk, i) => <span key={i} style={{ padding: `${s(4)}px ${s(10)}px`, background: '#f3e8ff', color: accent, borderRadius: s(100), fontSize: s(9.5), fontWeight: 600 }}>{sk}</span>)}
            </div>
          </Sec>
        )}
        {r.experience.length > 0 && (
          <Sec title="Experience" accent={accent} s={s}>
            {r.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: s(12), paddingLeft: s(12), borderLeft: `${s(3)}px solid ${accent}` }}>
                <div style={{ fontWeight: 700, fontSize: s(11) }}>{e.title}</div>
                <div style={{ fontSize: s(10), color: accent, marginBottom: s(4) }}>{e.company} · {e.duration}</div>
                <ul style={{ margin: 0, paddingLeft: s(14) }}>
                  {e.bullets.map((b, j) => <li key={j} style={{ fontSize: s(10), color: '#374151', marginBottom: s(2) }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </Sec>
        )}
        <div style={{ display: 'flex', gap: s(24) }}>
          {r.education.length > 0 && (
            <div style={{ flex: 1 }}>
              <Sec title="Education" accent={accent} s={s}>
                {r.education.map((e, i) => (
                  <div key={i} style={{ marginBottom: s(6) }}>
                    <div style={{ fontWeight: 700, fontSize: s(10.5) }}>{e.degree}</div>
                    <div style={{ fontSize: s(10), color: '#6b7280' }}>{e.school} · {e.year}</div>
                  </div>
                ))}
              </Sec>
            </div>
          )}
          {r.projects.length > 0 && (
            <div style={{ flex: 1 }}>
              <Sec title="Projects" accent={accent} s={s}>
                {r.projects.map((p, i) => (
                  <div key={i} style={{ marginBottom: s(6) }}>
                    <div style={{ fontWeight: 700, fontSize: s(10.5) }}>{p.name}</div>
                    <div style={{ fontSize: s(10), color: '#6b7280' }}>{p.tech}</div>
                  </div>
                ))}
              </Sec>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResumeTemplate({ resume, templateId, scale = 1 }: { resume: TailoredResume; templateId: TemplateId; scale?: number }) {
  switch (templateId) {
    case 'modern':       return <ModernTemplate r={resume} scale={scale} />;
    case 'professional': return <ProfessionalTemplate r={resume} scale={scale} />;
    case 'minimal':      return <MinimalTemplate r={resume} scale={scale} />;
    case 'compact':      return <CompactTemplate r={resume} scale={scale} />;
    case 'creative':     return <CreativeTemplate r={resume} scale={scale} />;
  }
}

// ── PDF Download ──────────────────────────────────────────────────────────────
async function downloadPDF(resume: TailoredResume, templateId: TemplateId, setStatus: (s: string) => void) {
  setStatus('rendering');
  try {
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import('jspdf'),
      import('html2canvas'),
    ]);

    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;background:#fff;z-index:-999;';
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(createElement(ResumeTemplate, { resume, templateId, scale: 1 }));
    await new Promise(r => setTimeout(r, 800));

    const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#fff', logging: false });
    root.unmount();
    document.body.removeChild(container);

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    const ratio = pdfW / canvas.width;
    const imgH = canvas.height * ratio;

    if (imgH <= pdfH) {
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfW, imgH);
    } else {
      let y = 0;
      while (y < canvas.height) {
        const sliceH = Math.min(pdfH / ratio, canvas.height - y);
        const sc = document.createElement('canvas');
        sc.width = canvas.width; sc.height = sliceH;
        sc.getContext('2d')!.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        if (y > 0) pdf.addPage();
        pdf.addImage(sc.toDataURL('image/png'), 'PNG', 0, 0, pdfW, sliceH * ratio);
        y += sliceH;
      }
    }

    const fileName = `${(resume.name || 'Resume').replace(/\s+/g, '_')}_${templateId}.pdf`;
    pdf.save(fileName);
  } finally {
    setStatus('idle');
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  resumeText: string;
  onClose: () => void;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ResumeBuilderPage({ resumeText, onClose }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('jd');
  const [jdText, setJdText] = useState('');
  const [tailored, setTailored] = useState<TailoredResume | null>(null);
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateId | null>(null);
  const [pdfStatus, setPdfStatus] = useState('idle');
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [editData, setEditData] = useState<TailoredResume | null>(null);

  const handleGenerate = async () => {
    if (!jdText.trim() || jdText.length < 50) return;
    setStep('generating');
    setError('');
    try {
      const result = await tailorResumeWithAI(resumeText, jdText);
      setTailored(result);
      setEditData(JSON.parse(JSON.stringify(result)));

      // Save to Supabase
      if (user) {
        setSaving(true);
        try {
          const { data } = await supabase.from('tailored_resumes').insert({
            user_id: user.id,
            resume_text: resumeText,
            jd_text: jdText,
            tailored_data: result,
            target_role: result.targetRole,
            template_id: selectedTemplate,
          }).select('id').single();
          if (data?.id) setSavedId(data.id);
        } catch (e) {
          console.warn('Save to DB failed (non-critical):', e);
        }
        setSaving(false);
      }

      setStep('templates');
    } catch (e: any) {
      setError(e.message || 'Failed to generate. Please try again.');
      setStep('jd');
    }
  };

  const updateSavedTemplate = async (tid: TemplateId) => {
    setSelectedTemplate(tid);
    if (savedId) {
      await supabase.from('tailored_resumes').update({ template_id: tid }).eq('id', savedId);
    }
  };

  const saveEdits = async () => {
    if (!editData) return;
    setTailored(editData);
    if (savedId) {
      await supabase.from('tailored_resumes').update({ tailored_data: editData }).eq('id', savedId);
    }
    setStep('templates');
  };

  // ── Step: Paste JD ──
  if (step === 'jd') return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', marginBottom: 24, padding: 0 }}>
        <ChevronLeft size={16} /> Back to Job Search
      </button>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Sparkles size={28} color="#fff" />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>AI Resume Builder</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Paste a Job Description — AI rewrites your resume to match it and generates beautiful PDF templates</p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <X size={15} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      <div style={{ background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>Resume loaded</div>
          <div style={{ fontSize: 11, color: '#15803d', marginTop: 2 }}>{resumeText.slice(0, 90).trim()}...</div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 14, fontWeight: 700, color: '#111827', display: 'block', marginBottom: 10 }}>Paste the Job Description</label>
        <textarea
          placeholder="Paste the full job description here...&#10;&#10;Example:&#10;We are looking for a Senior Product Manager...&#10;Requirements: 5+ years experience, strong data skills..."
          value={jdText}
          onChange={e => setJdText(e.target.value)}
          style={{ width: '100%', height: 240, padding: 14, borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 13, color: '#111827', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
          onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
          onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>{jdText.length} characters {jdText.length < 50 && jdText.length > 0 ? '(paste more text)' : ''}</span>
          {jdText && <button onClick={() => setJdText('')} style={{ fontSize: 11, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!jdText.trim() || jdText.length < 50}
        style={{ width: '100%', padding: '14px', borderRadius: 12, background: jdText.length >= 50 ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : '#e5e7eb', border: 'none', color: jdText.length >= 50 ? '#fff' : '#9ca3af', fontSize: 15, fontWeight: 700, cursor: jdText.length >= 50 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        <Sparkles size={18} /> Generate Tailored Resume
      </button>

      <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' as const }}>
        {TEMPLATES.map(t => (
          <span key={t.id} style={{ padding: '3px 10px', borderRadius: 100, background: t.color + '12', color: t.color, border: '1px solid ' + t.color + '30', fontSize: 11, fontWeight: 600 }}>{t.name}</span>
        ))}
      </div>
    </div>
  );

  // ── Step: Generating ──
  if (step === 'generating') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 28 }}>
        <div style={{ position: 'absolute', inset: 0, border: '4px solid #e5e7eb', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, border: '4px solid #7c3aed', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ position: 'absolute', inset: '50%', transform: 'translate(-50%,-50%)', width: 42, height: 42, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={20} color="#fff" />
        </div>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 10px' }}>Tailoring Your Resume...</h2>
      <p style={{ color: '#6b7280', fontSize: 14, maxWidth: 420, margin: '0 0 28px' }}>AI is reading the job description, matching your experience, and rewriting your resume for maximum ATS score.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 400 }}>
        {['Analysing job description & extracting keywords', 'Mapping your skills to JD requirements', 'Rewriting summary, bullets & skill order', 'Optimising for ATS compatibility'].map((msg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
            <Loader2 size={14} color="#7c3aed" style={{ animation: 'spin 1s linear infinite', flexShrink: 0, animationDelay: `${i * 0.3}s` }} />
            <span style={{ fontSize: 12, color: '#374151' }}>{msg}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Step: Template Selection ──
  if (step === 'templates' && tailored) return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap' as const, gap: 12 }}>
        <div>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', padding: '0 0 8px', marginLeft: -2 }}>
            <ChevronLeft size={16} /> Back to Job Search
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>Choose a Template</h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>
            Tailored for: <strong style={{ color: '#111827' }}>{tailored.targetRole}</strong>
            {saving && <span style={{ marginLeft: 8, fontSize: 11, color: '#9ca3af' }}>saving...</span>}
            {savedId && !saving && <span style={{ marginLeft: 8, fontSize: 11, color: '#16a34a' }}>✓ Saved</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
          {tailored.matchKeywords.slice(0, 6).map((kw, i) => (
            <span key={i} style={{ padding: '3px 10px', borderRadius: 100, background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 600 }}>{kw}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 100 }}>
        {TEMPLATES.map(t => (
          <div key={t.id}
            onClick={() => updateSavedTemplate(t.id)}
            style={{ borderRadius: 14, border: `2px solid ${selectedTemplate === t.id ? t.color : '#e5e7eb'}`, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', boxShadow: selectedTemplate === t.id ? `0 4px 20px ${t.color}30` : '0 1px 3px rgba(0,0,0,0.05)' }}>
            {/* Live mini preview */}
            <div style={{ height: 210, overflow: 'hidden', background: '#f9fafb', position: 'relative', pointerEvents: 'none' }}>
              <div style={{ transform: 'scale(0.38)', transformOrigin: 'top left', width: '263%', height: '263%' }}>
                <ResumeTemplate resume={tailored} templateId={t.id} scale={1} />
              </div>
              {selectedTemplate === t.id && (
                <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={13} color="#fff" />
                </div>
              )}
            </div>
            <div style={{ padding: '12px 14px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{t.desc}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={e => { e.stopPropagation(); setPreviewTemplate(t.id); }}
                  style={{ padding: '6px 10px', borderRadius: 7, background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#374151', fontWeight: 600 }}>
                  <Eye size={11} /> View
                </button>
                <button onClick={e => { e.stopPropagation(); downloadPDF(tailored, t.id, setPdfStatus); }}
                  disabled={pdfStatus === 'rendering'}
                  style={{ padding: '6px 10px', borderRadius: 7, background: t.color, border: 'none', cursor: pdfStatus === 'rendering' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#fff', fontWeight: 600, opacity: pdfStatus === 'rendering' ? 0.6 : 1 }}>
                  <Download size={11} /> PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky action bar */}
      <div style={{ position: 'sticky', bottom: 16, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', zIndex: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: TEMPLATES.find(t => t.id === selectedTemplate)?.color, display: 'inline-block', marginRight: 8 }} />
            {TEMPLATES.find(t => t.id === selectedTemplate)?.name} selected
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>ATS-optimised · Tailored for {tailored.targetRole}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { setEditData(JSON.parse(JSON.stringify(tailored))); setStep('edit'); }}
            style={{ padding: '10px 18px', borderRadius: 10, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Edit3 size={14} /> Edit
          </button>
          <button onClick={() => downloadPDF(tailored, selectedTemplate, setPdfStatus)} disabled={pdfStatus === 'rendering'}
            style={{ padding: '10px 22px', borderRadius: 10, background: pdfStatus === 'rendering' ? '#9ca3af' : '#111827', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: pdfStatus === 'rendering' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {pdfStatus === 'rendering' ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : <><Download size={14} /> Download PDF</>}
          </button>
        </div>
      </div>

      {/* Full preview modal */}
      {previewTemplate && (
        <div onClick={() => setPreviewTemplate(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '40px 20px', overflowY: 'auto' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, maxWidth: 794, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', position: 'sticky', top: 0, zIndex: 1 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Preview — {TEMPLATES.find(t => t.id === previewTemplate)?.name}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => downloadPDF(tailored, previewTemplate, setPdfStatus)} disabled={pdfStatus === 'rendering'}
                  style={{ padding: '8px 16px', borderRadius: 8, background: '#111827', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Download size={12} /> Download PDF
                </button>
                <button onClick={() => setPreviewTemplate(null)} style={{ padding: 8, borderRadius: 8, background: '#f3f4f6', border: 'none', cursor: 'pointer' }}>
                  <X size={16} color="#6b7280" />
                </button>
              </div>
            </div>
            <ResumeTemplate resume={tailored} templateId={previewTemplate} scale={1} />
          </div>
        </div>
      )}
    </div>
  );

  // ── Step: Edit ──
  if (step === 'edit' && editData) return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <button onClick={() => setStep('templates')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', padding: '0 0 8px' }}>
            <ChevronLeft size={16} /> Back to Templates
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Edit Resume</h1>
          <p style={{ color: '#6b7280', fontSize: 12, margin: '4px 0 0' }}>Changes auto-apply to all templates</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setStep('templates')} style={{ padding: '10px 16px', borderRadius: 10, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={saveEdits} style={{ padding: '10px 20px', borderRadius: 10, background: '#111827', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} /> Save & Continue
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Basic */}
        <div style={{ padding: 20, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 14 }}>Basic Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {(['name', 'email', 'phone', 'location', 'linkedin', 'targetRole'] as const).map(f => (
              <div key={f}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4, textTransform: 'capitalize' as const }}>{f === 'targetRole' ? 'Target Role' : f}</label>
                <input value={editData[f] as string} onChange={e => setEditData({ ...editData, [f]: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box' as const }}
                  onFocus={e => e.currentTarget.style.borderColor = '#111827'} onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'} />
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div style={{ padding: 20, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 14 }}>Professional Summary</div>
          <textarea value={editData.summary} onChange={e => setEditData({ ...editData, summary: e.target.value })}
            style={{ width: '100%', height: 90, padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, color: '#111827', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' as const }}
            onFocus={e => e.currentTarget.style.borderColor = '#111827'} onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'} />
        </div>

        {/* Skills */}
        <div style={{ padding: 20, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 14 }}>Skills <span style={{ fontWeight: 400, textTransform: 'none' as const }}>(comma-separated)</span></div>
          <input value={editData.skills.join(', ')} onChange={e => setEditData({ ...editData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box' as const }}
            onFocus={e => e.currentTarget.style.borderColor = '#111827'} onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'} />
        </div>

        {/* Experience */}
        <div style={{ padding: 20, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 14 }}>Work Experience</div>
          {editData.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < editData.experience.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                {(['title', 'company', 'duration'] as const).map(f => (
                  <div key={f}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 3, textTransform: 'capitalize' as const }}>{f}</label>
                    <input value={exp[f]} onChange={e => { const ex = [...editData.experience]; ex[i] = { ...ex[i], [f]: e.target.value }; setEditData({ ...editData, experience: ex }); }}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #e5e7eb', fontSize: 12, outline: 'none', boxSizing: 'border-box' as const }} />
                  </div>
                ))}
              </div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 3 }}>Bullet points (one per line)</label>
              <textarea value={exp.bullets.join('\n')} onChange={e => { const ex = [...editData.experience]; ex[i] = { ...ex[i], bullets: e.target.value.split('\n') }; setEditData({ ...editData, experience: ex }); }}
                style={{ width: '100%', height: 80, padding: '7px 10px', borderRadius: 7, border: '1px solid #e5e7eb', fontSize: 12, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' as const }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 40 }} />
    </div>
  );

  return null;
}
