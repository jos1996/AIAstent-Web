import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getJobProfile, saveJobProfile, uploadResumeFile, getSavedResumeText, saveResumeTextToContext,
  extractResumeText, parseResumeToProfile, markResumeProcessed,
  EMPTY_JOB_PROFILE, type JobProfile,
  type EducationEntry, type ExperienceEntry, type LanguageEntry, type CertificationEntry,
} from '../lib/jobProfile';

// ── Job Profile — structured data the desktop Job Apply mode uses to fill ───
// application forms. Resume is parsed ONCE per upload (or from the resume
// already saved on the Dashboard) → user reviews → saved to job_profiles.

export default function JobProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<JobProfile>(structuredClone(EMPTY_JOB_PROFILE));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [savedResumeLen, setSavedResumeLen] = useState(0);
  const [savedModal, setSavedModal] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const dirtyRef = useRef(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const fileRef = useRef<HTMLInputElement>(null);
  const savedResumeRef = useRef('');

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 5000);
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [p, resumeText] = await Promise.all([
          getJobProfile(user.id),
          getSavedResumeText(user.id),
        ]);
        // Seed basics from auth when the profile is brand new
        if (!p.personal.email && user.email) p.personal.email = user.email;
        const fullName = (user.user_metadata?.full_name || '') as string;
        if (!p.personal.firstName && fullName) {
          const parts = fullName.trim().split(/\s+/);
          p.personal.firstName = parts[0] || '';
          p.personal.lastName = parts.slice(1).join(' ');
        }
        setProfile(p);
        savedResumeRef.current = resumeText;
        setSavedResumeLen(resumeText.trim().length);
      } catch (e) {
        showMessage(e instanceof Error ? e.message : 'Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Auto-save — every edit persists to job_profiles after 1.5s idle (spec: DB is
  // source of truth; the desktop overlay reads it on next Analyze Screen)
  useEffect(() => {
    if (!user || loading || !dirtyRef.current) return;
    const t = setTimeout(async () => {
      try {
        await saveJobProfile(user.id, profile);
        dirtyRef.current = false;
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 3000);
      } catch (e) {
        console.error('Auto-save failed:', e);
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [profile, user, loading]);

  const set = (fn: (p: JobProfile) => JobProfile) => { dirtyRef.current = true; setProfile(p => fn(structuredClone(p))); };
  const setPersonal = (k: keyof JobProfile['personal'], v: string) =>
    set(p => { p.personal[k] = v; return p; });
  const setPref = <K extends keyof JobProfile['preferences']>(k: K, v: JobProfile['preferences'][K]) =>
    set(p => { p.preferences[k] = v; return p; });
  const setWA = <K extends keyof JobProfile['workAuthorization']>(k: K, v: JobProfile['workAuthorization'][K]) =>
    set(p => { p.workAuthorization[k] = v; return p; });

  const updateList = <K extends 'education' | 'experience' | 'languages' | 'certifications'>(
    key: K, idx: number, field: string, value: string
  ) => set(p => { (p[key][idx] as unknown as Record<string, string>)[field] = value; return p; });

  const addListItem = <K extends 'education' | 'experience' | 'languages' | 'certifications'>(
    key: K, item: JobProfile[K][number]
  ) => set(p => { (p[key] as JobProfile[K][number][]).push(item); return p; });

  const removeListItem = (key: 'education' | 'experience' | 'languages' | 'certifications', idx: number) =>
    set(p => { p[key].splice(idx, 1); return p; });

  const hasProfileData = (p: JobProfile) =>
    !!(p.personal.firstName || p.experience.length || p.education.length || p.skills.length);

  // Merge parsed resume data into the form. If the profile already has data,
  // ask whether to overwrite — otherwise only empty fields get filled.
  const mergeParsed = (parsed: Partial<JobProfile>, resumePath?: string) => {
    dirtyRef.current = true; // parsed data auto-saves too
    setProfile(p => {
      const overwrite = !hasProfileData(p) ||
        window.confirm('Your profile already has data. Replace existing fields with the newly parsed resume data?\n\nOK = replace all · Cancel = only fill empty fields');
      const merged = { ...p, ...parsed } as JobProfile;
      merged.documents = { ...p.documents, ...(resumePath ? { resumePath } : {}) };
      merged.personal = overwrite
        ? { ...EMPTY_JOB_PROFILE.personal, ...(parsed.personal || {}) }
        : { ...parsed.personal, ...Object.fromEntries(
            Object.entries(p.personal).filter(([, v]) => v !== '')
          ) } as JobProfile['personal'];
      if (!overwrite) {
        if (p.education.length) merged.education = p.education;
        if (p.experience.length) merged.experience = p.experience;
        if (p.skills.length) merged.skills = p.skills;
        if (p.languages.length) merged.languages = p.languages;
        if (p.certifications.length) merged.certifications = p.certifications;
      }
      return merged;
    });
  };

  // Parse the resume already saved on the Dashboard (interview_context.resume)
  const handleParseSavedResume = async () => {
    if (!user || !savedResumeRef.current) return;
    setParsing(true);
    try {
      const parsed = await parseResumeToProfile(savedResumeRef.current);
      mergeParsed(parsed);
      showMessage('Resume parsed — review the extracted fields below, then click Save.', 'success');
    } catch (e) {
      showMessage(e instanceof Error ? e.message : 'Resume parsing failed.', 'error');
    } finally {
      setParsing(false);
    }
  };

  // File upload → extract text → parse → review → save (spec §4)
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    e.target.value = '';
    setParsing(true);
    try {
      const path = await uploadResumeFile(user.id, file);
      const text = await extractResumeText(file);
      if (!text || text.length < 40) throw new Error('Could not extract text from this file. Fill the form manually.');
      const parsed = await parseResumeToProfile(text);
      await markResumeProcessed(user.id, path);
      await saveResumeTextToContext(user.id, text); // Dashboard Resume/CV stays in sync
      mergeParsed(parsed, path);
      showMessage('Resume parsed — review the extracted fields below, then click Save.', 'success');
    } catch (err) {
      console.error('Resume processing failed:', err);
      showMessage(err instanceof Error ? err.message : 'Resume processing failed.', 'error');
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveJobProfile(user.id, profile);
      setSavedModal(true);
    } catch (e) {
      console.error('Job profile save failed:', e);
      showMessage(e instanceof Error ? e.message : 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: '#6b7280', padding: 24 }}>Loading job profile…</div>;

  return (
    <div>
      <h1 style={{ color: '#000', fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>Job Profile</h1>
      <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 24px' }}>
        Used by <b>Job Apply Mode</b> in the HelplyAI desktop overlay to fill application forms.
        Parse your resume once, review the fields, and save.
      </p>

      {msg && (
        <div style={{
          padding: '10px 16px', borderRadius: 10, marginBottom: 20,
          background: msgType === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${msgType === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: msgType === 'success' ? '#15803d' : '#b91c1c', fontSize: 13,
        }}>{msg}</div>
      )}

      {/* Resume source */}
      <Card title="📄 Resume" subtitle="Parsed once — the extracted fields below stay editable until you save.">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {savedResumeLen > 0 && (
            <button onClick={handleParseSavedResume} disabled={parsing} style={btnPrimary}>
              {parsing ? '⏳ Parsing resume — usually 15–30s…' : `Parse Saved Resume (${savedResumeLen} chars)`}
            </button>
          )}
          <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.rtf" style={{ display: 'none' }} onChange={handleResumeUpload} />
          <button onClick={() => fileRef.current?.click()} disabled={parsing} style={btnOutline}>
            {parsing ? '⏳ Parsing resume — usually 15–30s…' : profile.documents.resumePath ? 'Replace Resume File' : 'Upload Resume File'}
          </button>
          {profile.documents.resumePath && <span style={{ color: '#15803d', fontSize: 12 }}>✓ Resume file on file</span>}
          {savedResumeLen === 0 && !profile.documents.resumePath && (
            <span style={{ color: '#9ca3af', fontSize: 12 }}>
              Tip: your resume text is saved on the Dashboard — or upload a file here.
            </span>
          )}
        </div>
      </Card>

      {/* Personal */}
      <Card title="Personal Information">
        <Grid>
          <Field label="First name" value={profile.personal.firstName} onChange={v => setPersonal('firstName', v)} />
          <Field label="Middle name" value={profile.personal.middleName} onChange={v => setPersonal('middleName', v)} />
          <Field label="Last name" value={profile.personal.lastName} onChange={v => setPersonal('lastName', v)} />
          <Field label="Preferred name" value={profile.personal.preferredName} onChange={v => setPersonal('preferredName', v)} />
          <Field label="Email" value={profile.personal.email} onChange={v => setPersonal('email', v)} />
          <Field label="Phone" value={profile.personal.phone} onChange={v => setPersonal('phone', v)} />
          <Field label="Alternate phone" value={profile.personal.alternatePhone} onChange={v => setPersonal('alternatePhone', v)} />
          <Field label="Date of birth" type="date" value={profile.personal.dateOfBirth} onChange={v => setPersonal('dateOfBirth', v)} />
          <Select label="Gender" value={profile.personal.gender} onChange={v => setPersonal('gender', v)}
            options={['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say']} />
          <Field label="Address" value={profile.personal.address} onChange={v => setPersonal('address', v)} />
          <Field label="City" value={profile.personal.city} onChange={v => setPersonal('city', v)} />
          <Field label="State" value={profile.personal.state} onChange={v => setPersonal('state', v)} />
          <Field label="Country" value={profile.personal.country} onChange={v => setPersonal('country', v)} />
          <Field label="Postal code" value={profile.personal.postalCode} onChange={v => setPersonal('postalCode', v)} />
          <Field label="LinkedIn URL" value={profile.personal.linkedin} onChange={v => setPersonal('linkedin', v)} />
          <Field label="Portfolio URL" value={profile.personal.portfolio} onChange={v => setPersonal('portfolio', v)} />
          <Field label="GitHub URL" value={profile.personal.github} onChange={v => setPersonal('github', v)} />
        </Grid>
      </Card>

      {/* Education */}
      <Card title="Education">
        {profile.education.map((ed, i) => (
          <div key={i} style={innerCard}>
            <Grid>
              <Field label="Degree" value={ed.degree} onChange={v => updateList('education', i, 'degree', v)} />
              <Field label="Specialization" value={ed.specialization} onChange={v => updateList('education', i, 'specialization', v)} />
              <Field label="University / College" value={ed.institution} onChange={v => updateList('education', i, 'institution', v)} />
              <Field label="Location" value={ed.location} onChange={v => updateList('education', i, 'location', v)} />
              <MonthField label="Start date" value={ed.startDate} onChange={v => updateList('education', i, 'startDate', v)} />
              <MonthField label="End date" value={ed.endDate} onChange={v => updateList('education', i, 'endDate', v)} allowPresent />
              <Field label="Graduation year" type="number" value={ed.graduationYear} onChange={v => updateList('education', i, 'graduationYear', v)} placeholder="2019" />
              <Field label="GPA / %" value={ed.gpa} onChange={v => updateList('education', i, 'gpa', v)} />
            </Grid>
            <button onClick={() => removeListItem('education', i)} style={btnDanger}>Remove</button>
          </div>
        ))}
        <button onClick={() => addListItem('education', { degree: '', specialization: '', institution: '', location: '', startDate: '', endDate: '', graduationYear: '', gpa: '' } as EducationEntry)} style={btnGhost}>
          + Add education
        </button>
      </Card>

      {/* Experience */}
      <Card title="Work Experience">
        {profile.experience.map((ex, i) => (
          <div key={i} style={innerCard}>
            <Grid>
              <Field label="Company" value={ex.company} onChange={v => updateList('experience', i, 'company', v)} />
              <Field label="Job title" value={ex.title} onChange={v => updateList('experience', i, 'title', v)} />
              <Field label="Location" value={ex.location} onChange={v => updateList('experience', i, 'location', v)} />
              <MonthField label="Start date" value={ex.startDate} onChange={v => updateList('experience', i, 'startDate', v)} />
              <MonthField label="End date" value={ex.endDate} onChange={v => updateList('experience', i, 'endDate', v)} allowPresent />
            </Grid>
            <Area label="Responsibilities" value={ex.responsibilities} onChange={v => updateList('experience', i, 'responsibilities', v)} />
            <Area label="Achievements" value={ex.achievements} onChange={v => updateList('experience', i, 'achievements', v)} />
            <button onClick={() => removeListItem('experience', i)} style={btnDanger}>Remove</button>
          </div>
        ))}
        <button onClick={() => addListItem('experience', { company: '', title: '', location: '', startDate: '', endDate: '', responsibilities: '', achievements: '' } as ExperienceEntry)} style={btnGhost}>
          + Add experience
        </button>
      </Card>

      {/* Skills */}
      <Card title="Skills" subtitle="Comma-separated.">
        <Area
          label="Skills"
          value={profile.skills.join(', ')}
          onChange={v => set(p => { p.skills = v.split(',').map(s => s.trim()).filter(Boolean); return p; })}
        />
        <Field label="Total experience (e.g. 5 years)" value={profile.extras.totalExperience || ''} onChange={v => set(p => { p.extras.totalExperience = v; return p; })} />
      </Card>

      {/* Languages */}
      <Card title="Languages">
        {profile.languages.map((l, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <Field label="Language" value={l.language} onChange={v => updateList('languages', i, 'language', v)} />
            <Select label="Proficiency" value={l.proficiency} onChange={v => updateList('languages', i, 'proficiency', v)}
              options={['Native', 'Fluent', 'Professional', 'Intermediate', 'Basic']} />
            <button onClick={() => removeListItem('languages', i)} style={btnDanger}>✕</button>
          </div>
        ))}
        <button onClick={() => addListItem('languages', { language: '', proficiency: '' } as LanguageEntry)} style={btnGhost}>+ Add language</button>
      </Card>

      {/* Certifications */}
      <Card title="Certifications">
        {profile.certifications.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <Field label="Certification" value={c.name} onChange={v => updateList('certifications', i, 'name', v)} />
            <Field label="Issuer" value={c.issuer} onChange={v => updateList('certifications', i, 'issuer', v)} />
            <MonthField label="Date" value={c.date} onChange={v => updateList('certifications', i, 'date', v)} />
            <button onClick={() => removeListItem('certifications', i)} style={btnDanger}>✕</button>
          </div>
        ))}
        <button onClick={() => addListItem('certifications', { name: '', issuer: '', date: '' } as CertificationEntry)} style={btnGhost}>+ Add certification</button>
      </Card>

      {/* Preferences */}
      <Card title="Career Preferences">
        <Grid>
          <Field label="Preferred locations" value={profile.preferences.locations.join(', ')} onChange={v => setPref('locations', v.split(',').map(s => s.trim()).filter(Boolean))} placeholder="e.g. Remote, New York" />
          <MultiSelect label="Work model (select all that apply)" values={profile.preferences.workModel} onChange={v => setPref('workModel', v)}
            options={['Remote', 'Hybrid', 'Onsite']} />
          <MultiSelect label="Employment type (select all that apply)" values={profile.preferences.employmentType} onChange={v => setPref('employmentType', v)}
            options={['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']} />
          <Select label="Notice period" value={profile.preferences.noticePeriod} onChange={v => setPref('noticePeriod', v)}
            options={['Immediate', '1 week', '2 weeks', '1 month', '2 months', '3+ months']} />
          <Field label="Expected salary" value={profile.preferences.expectedSalary} onChange={v => setPref('expectedSalary', v)} />
          <Field label="Current salary" value={profile.preferences.currentSalary} onChange={v => setPref('currentSalary', v)} />
          <Field label="Variable pay / bonus" value={profile.preferences.variablePay} onChange={v => setPref('variablePay', v)} placeholder="e.g. 10% bonus" />
        </Grid>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#374151', fontSize: 13, marginTop: 8 }}>
          <input
            type="checkbox"
            checked={profile.preferences.willingToRelocate === true}
            onChange={e => setPref('willingToRelocate', e.target.checked)}
            style={{ width: 16, height: 16, accentColor: '#000' }}
          />
          Willing to relocate
        </label>
      </Card>

      {/* Work authorization — sensitive, never auto-filled */}
      <Card title="Work Authorization" subtitle="Sensitive — HelplyAI will always ask before answering these on a form.">
        <Grid>
          <Field label="Work authorization status" value={profile.workAuthorization.visaStatus} onChange={v => setWA('visaStatus', v)} placeholder="e.g. Citizen, H-1B, GC" />
          <Field label="Notes" value={profile.workAuthorization.notes} onChange={v => setWA('notes', v)} />
        </Grid>
        <div style={{ display: 'flex', gap: 20, marginTop: 8, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#374151', fontSize: 13 }}>
            <input type="checkbox" checked={profile.workAuthorization.authorized === true}
              onChange={e => setWA('authorized', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#000' }} />
            Legally authorized to work
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#374151', fontSize: 13 }}>
            <input type="checkbox" checked={profile.workAuthorization.requiresSponsorship === true}
              onChange={e => setWA('requiresSponsorship', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#000' }} />
            Requires sponsorship
          </label>
        </div>
      </Card>

      {/* Summary & cover letter */}
      <Card title="Summary & Cover Letter">
        <Area label="Professional summary" value={profile.professionalSummary} onChange={v => set(p => { p.professionalSummary = v; return p; })} rows={4} />
        <Area label="Default cover letter" value={profile.coverLetter} onChange={v => set(p => { p.coverLetter = v; return p; })} rows={6} />
      </Card>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, padding: '12px 28px', fontSize: 14 }}>
          {saving ? 'Saving…' : 'Save Job Profile'}
        </button>
        {autoSaved && <span style={{ color: '#15803d', fontSize: 13 }}>✓ Auto-saved to your account</span>}
        {!autoSaved && (
          <span style={{ color: '#9ca3af', fontSize: 12 }}>
            Changes auto-save as you type — this button confirms and shows the next step.
          </span>
        )}
      </div>

      {/* Save success modal */}
      {savedModal && (
        <div
          onClick={() => setSavedModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.45)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 16, padding: '36px 40px',
              maxWidth: 440, width: '100%', textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 18px',
              background: '#f0fdf4', border: '2px solid #22c55e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#000', margin: '0 0 8px' }}>Job Profile Saved!</h2>
            <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
              Your details have been saved. Open the HelplyAI chatbot, switch to <b>Job Apply</b> mode,
              and click <b>Analyze Screen</b> on any job application — it will fill your information automatically.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  // Dev: the overlay is a local page — open it directly.
                  // Prod: the desktop app registers the helplyai:// protocol.
                  if (import.meta.env.DEV) {
                    window.open('http://localhost:5173', '_blank');
                  } else {
                    window.location.href = 'helplyai://open';
                  }
                  setSavedModal(false);
                }}
                style={btnPrimary}
              >
                Open Chatbot & Apply
              </button>
              <button onClick={() => setSavedModal(false)} style={btnOutline}>
                Edit Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared styles (match DashboardPage light theme) ──────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1px solid #d1d5db', fontSize: 14, color: '#111827',
  background: '#fff', boxSizing: 'border-box', outline: 'none',
};

const btnPrimary: React.CSSProperties = {
  padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
  background: '#000', border: 'none', color: '#fff', cursor: 'pointer',
};

const btnOutline: React.CSSProperties = {
  padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
  background: '#fff', border: '2px solid #000', color: '#000', cursor: 'pointer',
};

const btnGhost: React.CSSProperties = {
  padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500,
  background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151', cursor: 'pointer',
};

const btnDanger: React.CSSProperties = {
  padding: '6px 12px', borderRadius: 6, marginTop: 8,
  background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
  fontSize: 12, cursor: 'pointer',
};

const innerCard: React.CSSProperties = {
  padding: 16, borderRadius: 10, marginBottom: 12,
  background: '#f9fafb', border: '1px solid #e5e7eb',
};

function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>{children}</div>;
}

function Field({ label, value, onChange, placeholder, type = 'text', disabled }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <div style={{ flex: 1, minWidth: 160 }}>
      <div style={{ color: '#374151', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        disabled={disabled} style={{ ...inputStyle, opacity: disabled ? 0.5 : 1 }} />
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  const known = options.includes(value);
  return (
    <div style={{ flex: 1, minWidth: 160 }}>
      <div style={{ color: '#374151', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
        <option value="">Select…</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
        {!known && value && <option value={value}>{value}</option>}
      </select>
    </div>
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = Array.from({ length: new Date().getFullYear() - 1959 + 5 }, (_, i) => new Date().getFullYear() + 5 - i);

// Year + Month dropdowns — easier than the native month picker for jumping years
function MonthField({ label, value, onChange, allowPresent }: {
  label: string; value: string; onChange: (v: string) => void; allowPresent?: boolean;
}) {
  const isPresent = value === 'Present';
  const match = /^(\d{4})(?:-(\d{2}))?$/.exec(value);
  // Month picked before year → hold it locally until a year completes the date
  const [pendingM, setPendingM] = useState('');
  const y = match?.[1] || '';
  const m = match?.[2] || pendingM;
  const emit = (ny: string, nm: string) => {
    if (!ny) { setPendingM(nm); return; }
    setPendingM('');
    onChange(nm ? `${ny}-${nm}` : ny);
  };
  return (
    <div style={{ flex: 1, minWidth: 160 }}>
      <div style={{ color: '#374151', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6 }}>
        <select value={m} disabled={isPresent} onChange={e => emit(y, e.target.value)}
          style={{ ...inputStyle, opacity: isPresent ? 0.5 : 1 }}>
          <option value="">Month</option>
          {MONTHS.map((mo, i) => <option key={mo} value={String(i + 1).padStart(2, '0')}>{mo}</option>)}
        </select>
        <select value={y} disabled={isPresent} onChange={e => emit(e.target.value, m)}
          style={{ ...inputStyle, opacity: isPresent ? 0.5 : 1 }}>
          <option value="">Year</option>
          {YEARS.map(yr => <option key={yr} value={yr}>{yr}</option>)}
        </select>
      </div>
      {allowPresent && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 12, color: '#6b7280', cursor: 'pointer' }}>
          <input type="checkbox" checked={isPresent} onChange={e => onChange(e.target.checked ? 'Present' : '')} style={{ accentColor: '#000' }} />
          Present / Ongoing
        </label>
      )}
    </div>
  );
}

// Multi-select chips — for fields where several options apply at once
function MultiSelect({ label, values, onChange, options }: {
  label: string; values: string[]; onChange: (v: string[]) => void; options: string[];
}) {
  const toggle = (o: string) =>
    onChange(values.includes(o) ? values.filter(v => v !== o) : [...values, o]);
  return (
    <div style={{ flex: 1, minWidth: 160 }}>
      <div style={{ color: '#374151', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map(o => {
          const on = values.includes(o);
          return (
            <button
              key={o} type="button" onClick={() => toggle(o)}
              style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: on ? '1.5px solid #000' : '1px solid #d1d5db',
                background: on ? '#000' : '#fff', color: on ? '#fff' : '#374151',
                transition: 'all 0.12s',
              }}
            >{o}</button>
          );
        })}
      </div>
    </div>
  );
}

function Area({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ color: '#374151', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, fontFamily: 'inherit', background: '#fafafa' }} />
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{
      marginBottom: 24, padding: 24, borderRadius: 16,
      background: '#fff', border: '1px solid #e5e7eb',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{ color: '#000', fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</div>
      {subtitle && <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>{subtitle}</p>}
      <div style={{ marginTop: 16 }}>{children}</div>
    </div>
  );
}
