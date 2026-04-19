import { useState, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { ChevronLeft, FileText, CheckCircle2, Download, Eye, X, Loader2, Edit3, Wand2 } from 'lucide-react';
import { tailorResumeWithAI } from '../lib/resumeTailor';
import type { TailoredResume } from '../lib/resumeTailor';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type TemplateId = 'executive' | 'modern' | 'clean';
type Step = 'jd' | 'generating' | 'templates' | 'preview' | 'edit';

const TEMPLATES = [
  { id: 'executive' as TemplateId, name: 'Executive', desc: 'Navy header · gold accents · bordered', accent: '#1e3a5f' },
  { id: 'modern'    as TemplateId, name: 'Modern',    desc: 'Two-column sidebar · skill bars',       accent: '#2563eb' },
  { id: 'clean'     as TemplateId, name: 'Clean',     desc: 'Single-column · serif · max ATS score', accent: '#111827' },
];

const sc = (n: number, s: number) => n * s * 1.4; // 40% larger fonts

// ── Executive Template ───────────────────────────────────────────────────────
function ExecutiveTemplate({ r, s = 1 }: { r: TailoredResume; s?: number }) {
  const navy = '#1e3a5f', gold = '#b8972a';
  const ST = ({ t }: { t: string }) => (
    <div style={{ fontSize: sc(8, s), fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: sc(1.2, s), color: navy, borderBottom: `${sc(1.5, s)}px solid ${navy}`, paddingBottom: sc(3, s), marginTop: sc(10, s), marginBottom: sc(6, s) }}>{t}</div>
  );
  return (
    <div id="resume-render" style={{ fontFamily: 'Arial,Helvetica,sans-serif', background: '#fff', width: '100%', boxSizing: 'border-box' as const, lineHeight: 1.4 }}>
      <div style={{ background: `linear-gradient(135deg, ${navy} 0%, #2c4a6f 100%)`, padding: `${sc(28, s)}px ${sc(36, s)}px`, color: '#fff' }}>
        <div style={{ fontSize: sc(24, s), fontWeight: 700, letterSpacing: sc(0.5, s), textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{r.name || 'Your Name'}</div>
        <div style={{ fontSize: sc(12, s), color: gold, fontWeight: 600, marginTop: sc(6, s), textTransform: 'uppercase' as const, letterSpacing: sc(1.5, s) }}>{r.targetRole}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: sc(14, s), marginTop: sc(12, s), fontSize: sc(9, s), color: 'rgba(255,255,255,0.95)' }}>
          {r.email && <span>✉ {r.email}</span>}
          {r.phone && <span>✆ {r.phone}</span>}
          {r.location && <span>📍 {r.location}</span>}
          {r.linkedin && <span>💼 {r.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//,'')}</span>}
          {r.website && <span>🌐 {r.website}</span>}
        </div>
      </div>
      <div style={{ padding: `${sc(8, s)}px ${sc(32, s)}px ${sc(16, s)}px` }}>
        {r.matchKeywords.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: sc(4, s), padding: `${sc(6, s)}px 0 ${sc(10, s)}px`, borderBottom: `${sc(1, s)}px solid #e5e7eb`, marginBottom: sc(6, s) }}>
            {r.matchKeywords.map((kw, i) => <span key={i} style={{ padding: `${sc(2, s)}px ${sc(6, s)}px`, background: '#fffbeb', border: `${sc(1, s)}px solid ${gold}`, borderRadius: sc(3, s), fontSize: sc(7.5, s), color: navy, fontWeight: 600 }}>{kw}</span>)}
          </div>
        )}
        {r.summary && (<><ST t="Professional Summary" /><div style={{ fontSize: sc(9, s), color: '#333', lineHeight: 1.6, textAlign: 'justify' as const }}>{r.summary}</div></>)}
        {r.skills.length > 0 && (<><ST t="Core Competencies" /><div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: sc(5, s) }}>{r.skills.map((sk, i) => <span key={i} style={{ padding: `${sc(3, s)}px ${sc(10, s)}px`, background: `linear-gradient(135deg, ${navy} 0%, #2c4a6f 100%)`, borderRadius: sc(4, s), fontSize: sc(9, s), color: '#fff', fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{sk}</span>)}</div></>)}
        {r.experience.length > 0 && (<><ST t="Professional Experience" />{r.experience.map((e, i) => (<div key={i} style={{ marginBottom: sc(10, s), paddingLeft: sc(10, s), borderLeft: `${sc(2.5, s)}px solid ${gold}` }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: sc(2, s) }}><div style={{ flex: 1 }}><span style={{ fontWeight: 700, fontSize: sc(9.5, s), color: '#111' }}>{e.title}</span><span style={{ fontSize: sc(9, s), color: navy, fontWeight: 600 }}> · {e.company}</span>{e.location && <span style={{ fontSize: sc(8, s), color: '#666' }}> · {e.location}</span>}</div><span style={{ fontSize: sc(8, s), color: '#555', whiteSpace: 'nowrap' as const, marginLeft: sc(8, s) }}>{e.duration}</span></div><ul style={{ margin: `${sc(4, s)}px 0 0`, paddingLeft: sc(14, s) }}>{e.bullets.filter(b => b.trim()).map((b, j) => <li key={j} style={{ fontSize: sc(8.5, s), color: '#333', marginBottom: sc(3, s), lineHeight: 1.5 }}>{b}</li>)}</ul></div>))}</>)}
        <div style={{ display: 'flex', gap: sc(20, s), alignItems: 'flex-start' }}>
          {r.education.length > 0 && (<div style={{ flex: '1 1 50%' }}><ST t="Education" />{r.education.map((e, i) => (<div key={i} style={{ marginBottom: sc(6, s) }}><div style={{ fontWeight: 700, fontSize: sc(9, s), color: '#111' }}>{e.degree}</div><div style={{ fontSize: sc(8.5, s), color: '#555' }}>{e.school}{e.year ? ` · ${e.year}` : ''}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</div></div>))}</div>)}
          {r.certifications.length > 0 && (<div style={{ flex: '1 1 50%' }}><ST t="Certifications" />{r.certifications.map((c, i) => <div key={i} style={{ fontSize: sc(8.5, s), color: '#333', marginBottom: sc(3, s), lineHeight: 1.4 }}>• {c}</div>)}</div>)}
        </div>
        {r.projects.length > 0 && (<><ST t="Key Projects" /><div style={{ display: 'flex', flexDirection: 'column' as const, gap: sc(4, s) }}>{r.projects.map((p, i) => (<div key={i} style={{ marginBottom: sc(4, s) }}><span style={{ fontWeight: 700, fontSize: sc(8.5, s), color: navy }}>{p.name}</span><span style={{ fontSize: sc(8.5, s), color: '#444' }}> — {p.description} <span style={{ color: '#666' }}>({p.tech})</span></span></div>))}</div></>)}
      </div>
    </div>
  );
}

// ── Modern Template ──────────────────────────────────────────────────────────
function ModernTemplate({ r, s = 1 }: { r: TailoredResume; s?: number }) {
  const accent = '#000';
  const SH = ({ t }: { t: string }) => <div style={{ fontSize: sc(10, s), fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: sc(2, s), color: accent, borderBottom: `${sc(2, s)}px solid ${accent}`, paddingBottom: sc(6, s), marginBottom: sc(12, s), marginTop: sc(16, s), fontFamily: 'Georgia, serif' }}>{t}</div>;
  return (
    <div id="resume-render" style={{ fontFamily: 'Arial,Helvetica,sans-serif', display: 'flex', background: '#fff', width: '100%', boxSizing: 'border-box' as const, minHeight: '100%' }}>
      <div style={{ width: sc(190, s), background: '#1e293b', color: '#fff', padding: `${sc(24, s)}px ${sc(16, s)}px`, flexShrink: 0, display: 'flex', flexDirection: 'column' as const, gap: sc(12, s) }}>
        <div><div style={{ fontSize: sc(15, s), fontWeight: 800, lineHeight: 1.2 }}>{r.name || 'Your Name'}</div><div style={{ fontSize: sc(9, s), color: '#93c5fd', fontWeight: 600, marginTop: sc(3, s) }}>{r.targetRole}</div></div>
        <div style={{ fontSize: sc(8.5, s), lineHeight: 1.8, color: '#cbd5e1' }}>
          {r.email && <div style={{ marginBottom: sc(5, s), wordBreak: 'break-all' as const }}>📧 {r.email}</div>}
          {r.phone && <div style={{ marginBottom: sc(5, s) }}>📱 {r.phone}</div>}
          {r.location && <div style={{ marginBottom: sc(5, s) }}>📍 {r.location}</div>}
          {r.linkedin && <div style={{ marginBottom: sc(5, s), wordBreak: 'break-all' as const }}>💼 {r.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//,'')}</div>}
          {r.website && <div style={{ wordBreak: 'break-all' as const }}>🌐 {r.website}</div>}
        </div>
        {r.skills.length > 0 && (<div><div style={{ fontSize: sc(7.5, s), fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: sc(1, s), color: '#93c5fd', marginBottom: sc(7, s) }}>Skills</div>{r.skills.map((sk, i) => (<div key={i} style={{ marginBottom: sc(5, s) }}><div style={{ fontSize: sc(8, s), color: '#e2e8f0', marginBottom: sc(2, s) }}>{sk}</div><div style={{ height: sc(3, s), background: '#334155', borderRadius: sc(2, s), overflow: 'hidden' as const }}><div style={{ height: '100%', width: `${65 + (i % 5) * 7}%`, background: 'linear-gradient(90deg,#3b82f6,#93c5fd)', borderRadius: sc(2, s) }} /></div></div>))}</div>)}
        {r.certifications.length > 0 && (<div><div style={{ fontSize: sc(7.5, s), fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: sc(1, s), color: '#93c5fd', marginBottom: sc(5, s) }}>Certifications</div>{r.certifications.map((c, i) => <div key={i} style={{ fontSize: sc(7.5, s), color: '#cbd5e1', marginBottom: sc(4, s), lineHeight: 1.4 }}>• {c}</div>)}</div>)}
        {r.matchKeywords.length > 0 && (<div><div style={{ fontSize: sc(7.5, s), fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: sc(1, s), color: '#93c5fd', marginBottom: sc(5, s) }}>ATS Keywords</div><div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: sc(3, s) }}>{r.matchKeywords.map((kw, i) => <span key={i} style={{ fontSize: sc(7, s), background: 'rgba(147,197,253,0.15)', color: '#bfdbfe', padding: `${sc(2, s)}px ${sc(5, s)}px`, borderRadius: sc(3, s) }}>{kw}</span>)}</div></div>)}
      </div>
      <div style={{ flex: 1, padding: `${sc(28, s)}px ${sc(24, s)}px ${sc(24, s)}px`, minWidth: 0, maxWidth: `calc(100% - ${sc(190, s)}px)` }}>
        {r.summary && (<><SH t="Profile" /><div style={{ fontSize: sc(10, s), color: '#333', lineHeight: 1.7, marginBottom: sc(4, s), fontFamily: 'Georgia, serif' }}>{r.summary}</div></>)}
        {r.experience.length > 0 && (<><SH t="Experience" />{r.experience.map((e, i) => (<div key={i} style={{ marginBottom: sc(16, s), pageBreakInside: 'avoid' as const }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: sc(4, s), flexWrap: 'wrap' as const, gap: sc(4, s) }}><div style={{ flex: '1 1 70%', minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: sc(11, s), color: '#000', lineHeight: 1.3, wordBreak: 'break-word' as const, fontFamily: 'Georgia, serif' }}>{e.title}</div><div style={{ fontSize: sc(10, s), color: '#555', fontWeight: 500, marginTop: sc(3, s) }}>{e.company}</div></div><div style={{ fontSize: sc(9, s), color: '#888', whiteSpace: 'nowrap' as const, textAlign: 'right' as const, fontStyle: 'italic' }}>{e.duration}</div></div>{e.location && <div style={{ fontSize: sc(9, s), color: '#777', marginBottom: sc(6, s), fontStyle: 'italic' }}>{e.location}</div>}<ul style={{ margin: `${sc(6, s)}px 0 0`, paddingLeft: sc(20, s) }}>{e.bullets.filter(b => b.trim()).map((b, j) => <li key={j} style={{ fontSize: sc(10, s), color: '#444', marginBottom: sc(5, s), lineHeight: 1.6, wordBreak: 'break-word' as const }}>{b}</li>)}</ul></div>))}</>)}
        {r.education.length > 0 && (<><SH t="Education" />{r.education.map((e, i) => (<div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: sc(8, s), alignItems: 'flex-start' }}><div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: sc(10, s), color: '#000', fontFamily: 'Georgia, serif' }}>{e.degree}</div><div style={{ fontSize: sc(9, s), color: '#666', marginTop: sc(2, s) }}>{e.school}{e.gpa ? ` · GPA ${e.gpa}` : ''}</div></div><span style={{ fontSize: sc(9, s), color: '#888', whiteSpace: 'nowrap' }}>{e.year}</span></div>))}</>)}
        {r.projects.length > 0 && (<><SH t="Projects" />{r.projects.map((p, i) => (<div key={i} style={{ marginBottom: sc(10, s) }}><div style={{ fontWeight: 700, fontSize: sc(10, s), color: '#000', fontFamily: 'Georgia, serif', marginBottom: sc(3, s) }}>{p.name} <span style={{ fontWeight: 400, color: '#666' }}>· {p.tech}</span></div><div style={{ fontSize: sc(10, s), color: '#555', lineHeight: 1.5 }}>{p.description}</div></div>))}</>)}
      </div>
    </div>
  );
}

// ── Clean Template ───────────────────────────────────────────────────────────
function CleanTemplate({ r, s = 1 }: { r: TailoredResume; s?: number }) {
  const ST = ({ t }: { t: string }) => <div style={{ fontSize: sc(10, s), fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: sc(2, s), color: '#000', borderBottom: `${sc(2, s)}px solid #000`, paddingBottom: sc(6, s), marginTop: sc(14, s), marginBottom: sc(10, s), fontFamily: 'Georgia, serif' }}>{t}</div>;
  return (
    <div id="resume-render" style={{ fontFamily: 'Arial,Helvetica,sans-serif', fontSize: sc(10.5, s), color: '#111', background: '#fff', padding: `${sc(48, s)}px ${sc(56, s)}px ${sc(40, s)}px`, width: '100%', boxSizing: 'border-box' as const, minHeight: '100%', lineHeight: 1.6 }}>
      <div style={{ textAlign: 'center' as const, marginBottom: sc(20, s) }}>
        <div style={{ fontSize: sc(28, s), fontWeight: 700, letterSpacing: sc(3, s), textTransform: 'uppercase' as const, fontFamily: 'Georgia, serif', color: '#000' }}>{r.name || 'Your Name'}</div>
        <div style={{ fontSize: sc(13, s), color: '#444', marginTop: sc(8, s), fontWeight: 500, fontStyle: 'italic' }}>{r.targetRole}</div>
        <div style={{ height: sc(2, s), background: '#000', margin: `${sc(14, s)}px 0 ${sc(12, s)}px`, maxWidth: sc(360, s), marginLeft: 'auto', marginRight: 'auto' }} />
        <div style={{ fontSize: sc(10, s), color: '#555', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' as const, gap: sc(24, s) }}>
          {r.email && <span>📧 {r.email}</span>}
          {r.phone && <span>📱 {r.phone}</span>}
          {r.location && <span>📍 {r.location}</span>}
          {r.linkedin && <span>💼 {r.linkedin}</span>}
          {r.website && <span>🌐 {r.website}</span>}
        </div>
      </div>
      {r.summary && (<><ST t="Summary" /><div style={{ fontSize: sc(10.5, s), color: '#333', lineHeight: 1.8, fontFamily: 'Georgia, serif' }}>{r.summary}</div></>)}
      {r.skills.length > 0 && (<><ST t="Skills" /><div style={{ fontSize: sc(10.5, s), color: '#333', lineHeight: 1.9 }}>{r.skills.join(' · ')}</div></>)}
      {r.experience.length > 0 && (<><ST t="Experience" />{r.experience.map((e, i) => (<div key={i} style={{ marginBottom: sc(16, s), pageBreakInside: 'avoid' as const }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: sc(4, s), flexWrap: 'wrap' as const, gap: sc(6, s) }}><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: sc(11, s), color: '#000', fontFamily: 'Georgia, serif', lineHeight: 1.3 }}>{e.title}</div><div style={{ fontSize: sc(10, s), color: '#555', marginTop: sc(2, s) }}>{e.company}</div></div><div style={{ fontSize: sc(9, s), color: '#888', whiteSpace: 'nowrap' as const, fontStyle: 'italic' }}>{e.duration}</div></div>{e.location && <div style={{ fontSize: sc(9, s), color: '#777', marginBottom: sc(5, s), fontStyle: 'italic' }}>{e.location}</div>}<ul style={{ margin: `${sc(5, s)}px 0 0`, paddingLeft: sc(22, s) }}>{e.bullets.filter(b => b.trim()).map((b, j) => <li key={j} style={{ fontSize: sc(10, s), color: '#444', marginBottom: sc(5, s), lineHeight: 1.6, wordBreak: 'break-word' as const }}>{b}</li>)}</ul></div>))}</>)}
      <div style={{ display: 'flex', gap: sc(32, s), alignItems: 'flex-start' }}>
        {r.education.length > 0 && (<div style={{ flex: '1 1 50%' }}><ST t="Education" />{r.education.map((e, i) => (<div key={i} style={{ marginBottom: sc(10, s) }}><div style={{ fontWeight: 700, fontSize: sc(10.5, s), color: '#000', fontFamily: 'Georgia, serif' }}>{e.degree}</div><div style={{ fontSize: sc(9.5, s), color: '#555', marginTop: sc(3, s) }}>{e.school}{e.year ? ` · ${e.year}` : ''}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</div></div>))}</div>)}
        {(r.certifications.length > 0 || r.projects.length > 0) && (
          <div style={{ flex: '1 1 50%' }}>
            {r.certifications.length > 0 && (<><ST t="Certifications" />{r.certifications.map((c, i) => <div key={i} style={{ fontSize: sc(10, s), marginBottom: sc(6, s), lineHeight: 1.5, color: '#444' }}>• {c}</div>)}</>)}
            {r.projects.length > 0 && (<><ST t="Projects" />{r.projects.map((p, i) => <div key={i} style={{ fontSize: sc(10, s), marginBottom: sc(8, s), lineHeight: 1.5, color: '#444' }}><strong style={{ color: '#000', fontFamily: 'Georgia, serif' }}>{p.name}</strong> <span style={{ color: '#666' }}>({p.tech})</span> — {p.description}</div>)}</>)}
          </div>
        )}
      </div>
    </div>
  );
}

function ResumeTemplate({ resume, templateId, s = 1 }: { resume: TailoredResume; templateId: TemplateId; s?: number }) {
  if (templateId === 'executive') return <ExecutiveTemplate r={resume} s={s} />;
  if (templateId === 'modern')    return <ModernTemplate r={resume} s={s} />;
  return <CleanTemplate r={resume} s={s} />;
}

// ── PDF download ─────────────────────────────────────────────────────────────
async function downloadPDF(resume: TailoredResume, templateId: TemplateId, name: string, setDl: (v: boolean) => void) {
  setDl(true);
  try {
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas')]);
    
    // Create hidden container with A4 dimensions (794px at 96dpi)
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;min-height:1123px;background:#fff;z-index:-9999;overflow:hidden;';
    document.body.appendChild(wrap);
    
    const root = createRoot(wrap);
    root.render(createElement(ResumeTemplate, { resume, templateId, s: 1 }));
    await new Promise(r => setTimeout(r, 1200)); // Longer wait for fonts
    
    // High-quality rendering with scale 3 for sharper text
    const canvas = await html2canvas(wrap, { 
      scale: 3, // Higher scale for sharper fonts
      useCORS: true, 
      backgroundColor: '#fff',
      logging: false,
      allowTaint: true,
      letterRendering: true, // Better font rendering
      font: 'Arial', // Ensure web-safe font
      onclone: (clonedDoc) => {
        // Force fonts to be loaded in cloned document
        clonedDoc.fonts.ready;
      }
    });
    
    root.unmount();
    document.body.removeChild(wrap);
    
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = pdf.internal.pageSize.getWidth();
    const H = pdf.internal.pageSize.getHeight();
    const ratio = W / canvas.width;
    const imgH = canvas.height * ratio;
    
    // Use JPEG with high quality for smaller file size, good quality
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    if (imgH <= H) {
      pdf.addImage(imgData, 'JPEG', 0, 0, W, imgH);
    } else {
      // Multi-page handling
      let y = 0;
      const pageHeightPx = H / ratio;
      while (y < canvas.height) {
        const sliceHeight = Math.min(pageHeightPx, canvas.height - y);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeight;
        const ctx = sliceCanvas.getContext('2d')!;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(canvas, 0, y, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
        if (y > 0) pdf.addPage();
        pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, W, sliceHeight * ratio);
        y += sliceHeight;
      }
    }
    
    pdf.save(`${name.replace(/\s+/g, '_')}_${templateId}_resume.pdf`);
  } finally {
    setDl(false);
  }
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ResumeBuilderPage({ resumeText, onClose }: { resumeText: string; onClose: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('jd');
  const [jdText, setJdText] = useState('');
  const [tailored, setTailored] = useState<TailoredResume | null>(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<TemplateId>('executive');
  const [preview, setPreview] = useState<TemplateId | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [editData, setEditData] = useState<TailoredResume | null>(null);

  const generate = async () => {
    if (jdText.length < 50) return;
    setStep('generating'); setError('');
    try {
      const result = await tailorResumeWithAI(resumeText, jdText);
      setTailored(result);
      setEditData(JSON.parse(JSON.stringify(result)));
      if (user) {
        const { data } = await supabase.from('tailored_resumes').insert({ user_id: user.id, resume_text: resumeText, jd_text: jdText, tailored_data: result, target_role: result.targetRole, template_id: selected }).select('id').single();
        if (data?.id) setSavedId(data.id);
      }
      setStep('templates');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg); setStep('jd');
    }
  };

  const pickTemplate = async (id: TemplateId) => {
    setSelected(id);
    if (savedId) await supabase.from('tailored_resumes').update({ template_id: id }).eq('id', savedId);
  };

  const saveEdits = async () => {
    if (!editData) return;
    setTailored(editData);
    if (savedId) await supabase.from('tailored_resumes').update({ tailored_data: editData }).eq('id', savedId);
    setStep('templates');
  };

  const dl = (t: TemplateId) => downloadPDF(tailored!, t, tailored?.name || 'Resume', setDownloading);

  // ── JD input ──
  if (step === 'jd') return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 8px' }}>
      <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', marginBottom: 24, padding: 0 }}>
        <ChevronLeft size={16} /> Back to Dashboard
      </button>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', background: '#fff' }}>
          <FileText size={28} color="#000" strokeWidth={1.5} />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#000', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Resume Builder</h1>
        <p style={{ color: '#666', fontSize: 14, margin: 0, fontWeight: 400 }}>Paste a job description — AI tailors your resume with JD keywords</p>
      </div>
      {error && <div style={{ padding: '12px 16px', borderRadius: 8, background: '#fff', border: '1px solid #000', color: '#000', fontSize: 13, marginBottom: 16, display: 'flex', gap: 10 }}><X size={16} style={{ flexShrink: 0, marginTop: 1 }} />{error}</div>}
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e5e5', padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 12 }}>
        <CheckCircle2 size={18} color="#000" style={{ flexShrink: 0, marginTop: 1 }} />
        <div><div style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>Resume loaded</div><div style={{ fontSize: 12, color: '#666', marginTop: 3, lineHeight: 1.4 }}>{resumeText.slice(0, 120).trim()}...</div></div>
      </div>
      <label style={{ fontSize: 14, fontWeight: 600, color: '#000', display: 'block', marginBottom: 10 }}>Paste the Job Description</label>
      <textarea
        placeholder={"Paste the full job description here...\n\nExample:\nWe are looking for a Senior Product Manager with 5+ years experience..."}
        value={jdText} onChange={e => setJdText(e.target.value)}
        style={{ width: '100%', height: 240, padding: 16, borderRadius: 8, border: '2px solid #e5e5e5', fontSize: 14, color: '#000', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' as const, background: '#fafafa' }}
        onFocus={e => (e.currentTarget.style.borderColor = '#000')}
        onBlur={e => (e.currentTarget.style.borderColor = '#e5e5e5')}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, marginBottom: 18 }}>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>{jdText.length} chars {jdText.length > 0 && jdText.length < 50 ? '(paste more text)' : ''}</span>
        {jdText && <button onClick={() => setJdText('')} style={{ fontSize: 11, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>}
      </div>
      <button onClick={generate} disabled={jdText.length < 50}
        style={{ width: '100%', padding: 16, borderRadius: 8, background: jdText.length >= 50 ? '#000' : '#f0f0f0', border: '2px solid ' + (jdText.length >= 50 ? '#000' : '#e5e5e5'), color: jdText.length >= 50 ? '#fff' : '#999', fontSize: 15, fontWeight: 600, cursor: jdText.length >= 50 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s' }}>
        <Wand2 size={18} /> Generate Tailored Resume
      </button>
      <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center' }}>
        {TEMPLATES.map(t => <span key={t.id} style={{ padding: '3px 10px', borderRadius: 100, background: t.accent + '12', color: t.accent, border: '1px solid ' + t.accent + '30', fontSize: 11, fontWeight: 600 }}>{t.name}</span>)}
      </div>
    </div>
  );

  // ── Generating ──
  if (step === 'generating') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ position: 'relative', width: 72, height: 72, marginBottom: 24 }}>
        <div style={{ position: 'absolute', inset: 0, border: '2px solid #e5e5e5', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ position: 'absolute', inset: '50%', transform: 'translate(-50%,-50%)', width: 36, height: 36, background: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Wand2 size={16} color="#fff" />
        </div>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: '#000', margin: '0 0 8px' }}>Tailoring Your Resume…</h2>
      <p style={{ color: '#666', fontSize: 14, maxWidth: 400, margin: '0 0 24px', lineHeight: 1.6 }}>AI is reading the job description, matching your experience, rewriting bullets with JD keywords, and optimising for ATS.</p>
      {['Extracting JD requirements & keywords', 'Mapping your skills to job requirements', 'Rewriting summary and experience bullets', 'Optimising ATS score and layout'].map((msg, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fff', borderRadius: 8, border: '1px solid #e5e5e5', marginBottom: 6, width: '100%', maxWidth: 400 }}>
          <Loader2 size={14} color="#000" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#333' }}>{msg}</span>
        </div>
      ))}
    </div>
  );

  // ── Template selection ──
  if (step === 'templates' && tailored) return (
    <div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap' as const, gap: 10 }}>
        <div>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: '#6b7280', fontSize: 12, cursor: 'pointer', padding: '0 0 6px' }}>
            <ChevronLeft size={14} /> Back to Dashboard
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>Your Tailored Resumes</h1>
          <p style={{ color: '#6b7280', fontSize: 12, margin: '3px 0 0' }}>Tailored for: <strong style={{ color: '#111827' }}>{tailored.targetRole}</strong></p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5 }}>
          {tailored.matchKeywords.slice(0, 8).map((kw, i) => <span key={i} style={{ padding: '3px 9px', borderRadius: 100, background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 600 }}>{kw}</span>)}
        </div>
      </div>

      {/* 3 template cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18, marginBottom: 100 }}>
        {TEMPLATES.map(t => (
          <div key={t.id} onClick={() => pickTemplate(t.id)}
            style={{ borderRadius: 14, border: `2px solid ${selected === t.id ? t.accent : '#e5e7eb'}`, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', boxShadow: selected === t.id ? `0 4px 20px ${t.accent}28` : '0 1px 4px rgba(0,0,0,0.06)' }}>
            {/* Live mini preview */}
            <div style={{ height: 230, overflow: 'hidden', background: '#f9fafb', position: 'relative', pointerEvents: 'none' }}>
              <div style={{ transform: 'scale(0.37)', transformOrigin: 'top left', width: '270%', height: '270%' }}>
                <ResumeTemplate resume={tailored} templateId={t.id} s={1} />
              </div>
              {selected === t.id && (
                <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={13} color="#fff" />
                </div>
              )}
            </div>
            <div style={{ padding: '11px 14px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{t.desc}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={e => { e.stopPropagation(); setPreview(t.id); }}
                  style={{ padding: '6px 10px', borderRadius: 7, background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#374151' }}>
                  <Eye size={11} /> View
                </button>
                <button onClick={e => { e.stopPropagation(); dl(t.id); }} disabled={downloading}
                  style={{ padding: '6px 10px', borderRadius: 7, background: t.accent, border: 'none', cursor: downloading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#fff', opacity: downloading ? 0.6 : 1 }}>
                  <Download size={11} /> PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky bottom bar */}
      <div style={{ position: 'sticky', bottom: 16, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 10, flexWrap: 'wrap' as const, gap: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: TEMPLATES.find(t => t.id === selected)?.accent, display: 'inline-block' }} />
            {TEMPLATES.find(t => t.id === selected)?.name} selected
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>ATS-optimised · 1 page · Tailored for {tailored.targetRole}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setEditData(JSON.parse(JSON.stringify(tailored))); setStep('edit'); }}
            style={{ padding: '10px 16px', borderRadius: 10, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Edit3 size={13} /> Edit
          </button>
          <button onClick={() => dl(selected)} disabled={downloading}
            style={{ padding: '10px 20px', borderRadius: 10, background: downloading ? '#9ca3af' : '#111827', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {downloading ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</> : <><Download size={13} /> Download PDF</>}
          </button>
        </div>
      </div>

      {/* Full preview modal */}
      {preview && (
        <div onClick={() => setPreview(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 2000, padding: '32px 16px', overflowY: 'auto' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, maxWidth: 794, width: '100%', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', position: 'sticky', top: 0, zIndex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{TEMPLATES.find(t => t.id === preview)?.name} Preview</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => dl(preview)} disabled={downloading}
                  style={{ padding: '7px 14px', borderRadius: 8, background: '#111827', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Download size={12} /> Download PDF
                </button>
                <button onClick={() => setPreview(null)} style={{ padding: 7, borderRadius: 8, background: '#f3f4f6', border: 'none', cursor: 'pointer' }}>
                  <X size={15} color="#6b7280" />
                </button>
              </div>
            </div>
            <ResumeTemplate resume={tailored} templateId={preview} s={1} />
          </div>
        </div>
      )}
    </div>
  );

  // ── Edit ──
  if (step === 'edit' && editData) return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap' as const, gap: 10 }}>
        <div>
          <button onClick={() => setStep('templates')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: '#6b7280', fontSize: 12, cursor: 'pointer', padding: '0 0 6px' }}>
            <ChevronLeft size={14} /> Back to Templates
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>Edit Resume</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setStep('templates')} style={{ padding: '9px 14px', borderRadius: 9, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={saveEdits} style={{ padding: '9px 18px', borderRadius: 9, background: '#111827', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={13} /> Save Changes
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
        {/* Basic info */}
        <div style={{ padding: 18, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 12 }}>Basic Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {(['name','email','phone','location','linkedin','website','targetRole'] as const).map(f => (
              <div key={f} style={f === 'targetRole' ? { gridColumn: '1/-1' } : {}}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4, textTransform: 'capitalize' as const }}>{f === 'targetRole' ? 'Target Role' : f}</label>
                <input value={(editData as Record<string, unknown>)[f] as string || ''} onChange={e => setEditData({ ...editData, [f]: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, color: '#111827', outline: 'none', boxSizing: 'border-box' as const }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#111827')} onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')} />
              </div>
            ))}
          </div>
        </div>
        {/* Summary */}
        <div style={{ padding: 18, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 10 }}>Professional Summary</div>
          <textarea value={editData.summary} onChange={e => setEditData({ ...editData, summary: e.target.value })}
            style={{ width: '100%', height: 90, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, color: '#111827', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' as const }}
            onFocus={e => (e.currentTarget.style.borderColor = '#111827')} onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')} />
        </div>
        {/* Skills */}
        <div style={{ padding: 18, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 10 }}>Skills <span style={{ fontWeight: 400, textTransform: 'none' as const }}>(comma-separated)</span></div>
          <input value={editData.skills.join(', ')} onChange={e => setEditData({ ...editData, skills: e.target.value.split(',').map(x => x.trim()).filter(Boolean) })}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, color: '#111827', outline: 'none', boxSizing: 'border-box' as const }}
            onFocus={e => (e.currentTarget.style.borderColor = '#111827')} onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')} />
        </div>
        {/* Experience */}
        <div style={{ padding: 18, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 12 }}>Work Experience</div>
          {editData.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < editData.experience.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                {(['title','company','duration'] as const).map(f => (
                  <div key={f}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 3, textTransform: 'capitalize' as const }}>{f}</label>
                    <input value={exp[f]} onChange={e => { const ex = [...editData.experience]; ex[i] = { ...ex[i], [f]: e.target.value }; setEditData({ ...editData, experience: ex }); }}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 7, border: '1px solid #e5e7eb', fontSize: 11, outline: 'none', boxSizing: 'border-box' as const }} />
                  </div>
                ))}
              </div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 3 }}>Bullet Points (one per line)</label>
              <textarea value={exp.bullets.join('\n')} onChange={e => { const ex = [...editData.experience]; ex[i] = { ...ex[i], bullets: e.target.value.split('\n') }; setEditData({ ...editData, experience: ex }); }}
                style={{ width: '100%', height: 75, padding: '6px 8px', borderRadius: 7, border: '1px solid #e5e7eb', fontSize: 11, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' as const }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 32 }} />
    </div>
  );

  return null;
}
