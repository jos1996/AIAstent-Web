import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlanLimits } from '../hooks/usePlanLimits';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface JobResult {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  employer_website: string | null;
  job_publisher: string;
  job_employment_type: string;
  job_description: string;
  job_apply_link: string;
  job_city: string;
  job_state: string;
  job_country: string;
  job_posted_at_datetime_utc: string;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_salary_period: string | null;
  job_is_remote: boolean;
  job_highlights?: { Qualifications?: string[]; Responsibilities?: string[]; Benefits?: string[]; };
  job_google_link?: string;
  apply_options?: { publisher: string; apply_link: string; is_direct: boolean; }[];
}

interface SavedJob extends JobResult {
  savedAt: number;
  status: 'saved' | 'applied' | 'ignored';
  matchScore?: number;
}

interface LocationSuggestion { city: string; region: string; country: string; displayName: string; }

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY || '915924306emsh0fd69b0f30a10b5p111217jsn7e8c5ccd8052';
const FREE_RESULT_LIMIT = 5;
const PREMIUM_RESULT_LIMIT = 30;
const POPULAR_ROLES = ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'DevOps Engineer', 'Full Stack Developer'];
const EMPLOYMENT_TYPES: Record<string, string> = { FULLTIME: 'Full-time', PARTTIME: 'Part-time', CONTRACTOR: 'Contract', INTERN: 'Internship' };

function timeAgo(d: string): string {
  if (!d) return '';
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const dy = Math.floor(h / 24);
  if (dy < 7) return dy + 'd ago';
  return Math.floor(dy / 7) + 'w ago';
}

function extractContacts(desc: string) {
  const emails = desc.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  const phones = desc.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
  const linkedins = desc.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/gi) || [];
  return { emails: [...new Set(emails)], phones: [...new Set(phones)], linkedins: [...new Set(linkedins)] };
}

function calcMatch(jobDesc: string, resume: string): number {
  if (!resume || !jobDesc) return 0;
  const rWords = new Set(resume.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
  const jWords = jobDesc.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const matches = jWords.filter(w => rWords.has(w)).length;
  return Math.min(99, Math.round((matches / Math.max(jWords.length, 1)) * 100 * 2.5));
}

export default function JobSearchPage() {
  const { user } = useAuth();
  const { planState } = usePlanLimits();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [locSuggestions, setLocSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocDropdown, setShowLocDropdown] = useState(false);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [datePosted, setDatePosted] = useState('all');
  const [empType, setEmpType] = useState('');
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [savedJobs, setSavedJobs] = useState<Map<string, SavedJob>>(() => {
    try { const s = localStorage.getItem('helplyai_jobs_v2'); return s ? new Map(JSON.parse(s)) : new Map(); }
    catch { return new Map(); }
  });
  const [showSaved, setShowSaved] = useState(false);
  const [savedFilter, setSavedFilter] = useState<'all'|'saved'|'applied'|'ignored'>('all');
  const [userResume, setUserResume] = useState('');
  const locDebounce = useRef<NodeJS.Timeout | undefined>(undefined);

  const isPremium = !planState.isFreeUser && !planState.isExpired;
  const limit = isPremium ? PREMIUM_RESULT_LIMIT : FREE_RESULT_LIMIT;

  useEffect(() => {
    if (user) supabase.from('interview_context').select('resume').eq('user_id', user.id).single().then(({ data }) => { if (data?.resume) setUserResume(data.resume); });
  }, [user]);

  useEffect(() => { localStorage.setItem('helplyai_jobs_v2', JSON.stringify([...savedJobs])); }, [savedJobs]);

  const searchLoc = useCallback(async (txt: string) => {
    if (txt.length < 2) { setLocSuggestions([]); return; }
    try {
      const r = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(txt)}&limit=5&sort=-population`,
        { headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com' } });
      if (r.ok) { const d = await r.json(); setLocSuggestions((d.data || []).map((c: any) => ({ city: c.city, region: c.region, country: c.country, displayName: `${c.city}, ${c.region || c.country}` }))); }
    } catch {}
  }, []);

  const onLocChange = (v: string) => { setLocation(v); setShowLocDropdown(true); if (locDebounce.current) clearTimeout(locDebounce.current); locDebounce.current = setTimeout(() => searchLoc(v), 300); };
  const selectLoc = (s: LocationSuggestion) => { setLocation(s.displayName); setShowLocDropdown(false); setLocSuggestions([]); };

  const updateStatus = (job: JobResult, status: 'saved'|'applied'|'ignored') => {
    setSavedJobs(prev => {
      const next = new Map(prev);
      const ex = next.get(job.job_id);
      if (ex && ex.status === status) next.delete(job.job_id);
      else next.set(job.job_id, { ...job, savedAt: Date.now(), status, matchScore: userResume ? calcMatch(job.job_description, userResume) : undefined });
      return next;
    });
  };

  const search = useCallback(async (p = 1) => {
    if (!query.trim()) return;
    setLoading(true); setError(''); setSearched(true); setPage(p);
    try {
      const params = new URLSearchParams({ query: `${query.trim()}${location.trim() ? ` in ${location.trim()}` : ''}`, page: String(p), num_pages: '1', date_posted: datePosted, remote_jobs_only: remoteOnly ? 'true' : 'false' });
      if (empType) params.set('employment_types', empType);
      const r = await fetch(`https://jsearch.p.rapidapi.com/search?${params}`, { headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'jsearch.p.rapidapi.com' } });
      if (!r.ok) throw new Error(r.status === 429 ? 'Rate limit. Wait and retry.' : `Error ${r.status}`);
      const d = await r.json();
      const res: JobResult[] = d.data || [];
      setJobs(res.slice(0, limit)); setTotal(res.length); setExpandedId(null);
    } catch (e: any) { setError(e.message); setJobs([]); }
    finally { setLoading(false); }
  }, [query, location, remoteOnly, datePosted, empType, limit]);

  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); search(1); };

  const savedCount = [...savedJobs.values()].filter(j => j.status === 'saved').length;
  const appliedCount = [...savedJobs.values()].filter(j => j.status === 'applied').length;
  const ignoredCount = [...savedJobs.values()].filter(j => j.status === 'ignored').length;
  const filteredSaved = [...savedJobs.values()].filter(j => savedFilter === 'all' || j.status === savedFilter).sort((a, b) => b.savedAt - a.savedAt);

  const JobCard = ({ job, locked = false }: { job: JobResult | SavedJob; locked?: boolean }) => {
    const saved = savedJobs.get(job.job_id);
    const expanded = expandedId === job.job_id;
    const contacts = extractContacts(job.job_description);
    const match = userResume ? ('matchScore' in job && job.matchScore) || calcMatch(job.job_description, userResume) : null;

    return (
      <div style={{ padding: 20, borderRadius: 14, border: `1px solid ${expanded ? '#93c5fd' : '#e5e7eb'}`, background: '#fff', position: 'relative' }}>
        {locked && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 24 }}>🔒</span>
              <p style={{ color: '#4b5563', fontSize: 14, fontWeight: 600, margin: '8px 0' }}>Premium Only</p>
              <button onClick={() => navigate('/settings/billing')} style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Upgrade</button>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f3f4f6', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {job.employer_logo ? <img src={job.employer_logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => (e.target as HTMLImageElement).style.display = 'none'} /> : <span style={{ fontSize: 16, fontWeight: 700, color: '#9ca3af' }}>{job.employer_name?.charAt(0)}</span>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#000', margin: 0 }}>{job.job_title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{ color: '#4b5563', fontSize: 13, fontWeight: 600 }}>{job.employer_name}</span>
                  {job.employer_website && <a href={job.employer_website} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: 11 }}>↗</a>}
                </div>
              </div>
              {match !== null && match > 0 && (
                <div style={{ padding: '4px 10px', borderRadius: 6, background: match >= 70 ? '#ecfdf5' : match >= 40 ? '#fffbeb' : '#f3f4f6', color: match >= 70 ? '#059669' : match >= 40 ? '#d97706' : '#6b7280', fontSize: 12, fontWeight: 700 }}>{match}% Match</div>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
              {(job.job_city || job.job_country) && <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, background: '#f3f4f6', color: '#4b5563' }}>📍 {[job.job_city, job.job_state, job.job_country].filter(Boolean).join(', ')}</span>}
              {job.job_is_remote && <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, background: '#ecfdf5', color: '#059669', fontWeight: 600 }}>🌍 Remote</span>}
              {job.job_employment_type && <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, background: '#eff6ff', color: '#2563eb' }}>{EMPLOYMENT_TYPES[job.job_employment_type] || job.job_employment_type}</span>}
              {job.job_posted_at_datetime_utc && <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, background: '#f9fafb', color: '#9ca3af' }}>{timeAgo(job.job_posted_at_datetime_utc)}</span>}
              <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, background: '#f5f3ff', color: '#7c3aed' }}>via {job.job_publisher}</span>
            </div>
            <p style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.5, margin: '10px 0 0', display: '-webkit-box', WebkitLineClamp: expanded ? 999 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{job.job_description}</p>
            {expanded && (contacts.emails.length > 0 || contacts.phones.length > 0 || contacts.linkedins.length > 0) && (
              <div style={{ marginTop: 12, padding: 12, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#000', margin: '0 0 8px' }}>📧 Contact Info</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {contacts.emails.map((e, i) => <a key={i} href={`mailto:${e}`} style={{ padding: '4px 10px', borderRadius: 6, background: '#eff6ff', color: '#2563eb', fontSize: 11, textDecoration: 'none' }}>✉️ {e}</a>)}
                  {contacts.phones.map((p, i) => <a key={i} href={`tel:${p}`} style={{ padding: '4px 10px', borderRadius: 6, background: '#ecfdf5', color: '#059669', fontSize: 11, textDecoration: 'none' }}>📞 {p}</a>)}
                  {contacts.linkedins.map((l, i) => <a key={i} href={`https://${l}`} target="_blank" rel="noopener noreferrer" style={{ padding: '4px 10px', borderRadius: 6, background: '#eff6ff', color: '#0077b5', fontSize: 11, textDecoration: 'none' }}>💼 LinkedIn</a>)}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>Apply Now ↗</a>
              {job.job_google_link && <a href={job.job_google_link} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 14px', borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#4b5563', fontSize: 12, fontWeight: 500, textDecoration: 'none' }}>View on Google</a>}
              <button onClick={() => setExpandedId(expanded ? null : job.job_id)} style={{ padding: '8px 14px', borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#4b5563', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>{expanded ? 'Show Less' : 'View Details'}</button>
              <button onClick={() => navigator.clipboard.writeText(job.job_apply_link)} style={{ padding: '8px 10px', borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#6b7280', fontSize: 12, cursor: 'pointer' }} title="Copy link">📋</button>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <button onClick={() => updateStatus(job, 'saved')} style={{ padding: '6px 12px', borderRadius: 6, background: saved?.status === 'saved' ? '#fef3c7' : '#f9fafb', border: `1px solid ${saved?.status === 'saved' ? '#fcd34d' : '#e5e7eb'}`, color: saved?.status === 'saved' ? '#d97706' : '#6b7280', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>📌 {saved?.status === 'saved' ? 'Saved' : 'Save'}</button>
                <button onClick={() => updateStatus(job, 'applied')} style={{ padding: '6px 12px', borderRadius: 6, background: saved?.status === 'applied' ? '#ecfdf5' : '#f9fafb', border: `1px solid ${saved?.status === 'applied' ? '#a7f3d0' : '#e5e7eb'}`, color: saved?.status === 'applied' ? '#059669' : '#6b7280', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>✅ {saved?.status === 'applied' ? 'Applied' : 'Applied'}</button>
                <button onClick={() => updateStatus(job, 'ignored')} style={{ padding: '6px 12px', borderRadius: 6, background: saved?.status === 'ignored' ? '#f3f4f6' : '#f9fafb', border: `1px solid ${saved?.status === 'ignored' ? '#d1d5db' : '#e5e7eb'}`, color: '#9ca3af', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>⏭️ Skip</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
          </div>
          <div>
            <h1 style={{ color: '#000', fontSize: 24, fontWeight: 700, margin: 0 }}>Job Search</h1>
            <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Find jobs from LinkedIn, Indeed, Glassdoor & more</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12, padding: '8px 16px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>📌 <strong style={{ color: '#000' }}>{savedCount}</strong></span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>✅ <strong style={{ color: '#059669' }}>{appliedCount}</strong></span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>⏭️ <strong style={{ color: '#9ca3af' }}>{ignoredCount}</strong></span>
          </div>
          <button onClick={() => setShowSaved(!showSaved)} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #e5e7eb', background: showSaved ? '#2563eb' : '#fff', color: showSaved ? '#fff' : '#4b5563', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {showSaved ? '← Back' : '📁 Saved Jobs'}
          </button>
        </div>
      </div>

      {!isPremium && !showSaved && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#4b5563', fontSize: 13 }}>🔒 Free: <strong>{FREE_RESULT_LIMIT} results</strong>. Upgrade for unlimited.</span>
          <button onClick={() => navigate('/settings/billing')} style={{ padding: '8px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Upgrade</button>
        </div>
      )}

      {showSaved ? (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {(['all', 'saved', 'applied', 'ignored'] as const).map(f => (
              <button key={f} onClick={() => setSavedFilter(f)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: savedFilter === f ? '#2563eb' : '#fff', color: savedFilter === f ? '#fff' : '#6b7280', fontSize: 13, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize' }}>
                {f} ({f === 'all' ? savedJobs.size : f === 'saved' ? savedCount : f === 'applied' ? appliedCount : ignoredCount})
              </button>
            ))}
          </div>
          {filteredSaved.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}><span style={{ fontSize: 48 }}>📋</span><p style={{ marginTop: 16 }}>No {savedFilter === 'all' ? 'saved' : savedFilter} jobs yet</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{filteredSaved.map(job => <JobCard key={job.job_id} job={job} />)}</div>
          )}
        </div>
      ) : (
        <>
          <form onSubmit={onSubmit} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 2, position: 'relative' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Job title, role, keyword..." value={query} onChange={e => setQuery(e.target.value)} style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: 10, border: '2px solid #e5e7eb', fontSize: 14, color: '#000', outline: 'none', background: '#fff' }} onFocus={e => e.currentTarget.style.borderColor = '#2563eb'} onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'} />
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <input type="text" placeholder="Location..." value={location} onChange={e => onLocChange(e.target.value)} onFocus={() => setShowLocDropdown(true)} onBlur={() => setTimeout(() => setShowLocDropdown(false), 200)} style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: 10, border: '2px solid #e5e7eb', fontSize: 14, color: '#000', outline: 'none', background: '#fff' }} />
                {showLocDropdown && locSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden' }}>
                    {locSuggestions.map((s, i) => <div key={i} onClick={() => selectLoc(s)} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, color: '#374151' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>📍 {s.displayName}</div>)}
                  </div>
                )}
              </div>
              <button type="submit" disabled={loading || !query.trim()} style={{ padding: '14px 28px', borderRadius: 10, background: loading || !query.trim() ? '#d1d5db' : 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading || !query.trim() ? 'not-allowed' : 'pointer' }}>{loading ? '⏳ Searching...' : '🔍 Search'}</button>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: remoteOnly ? '#eff6ff' : '#f9fafb', border: `1px solid ${remoteOnly ? '#93c5fd' : '#e5e7eb'}`, cursor: 'pointer', fontSize: 13, color: remoteOnly ? '#2563eb' : '#6b7280', fontWeight: remoteOnly ? 600 : 500 }}><input type="checkbox" checked={remoteOnly} onChange={e => setRemoteOnly(e.target.checked)} style={{ accentColor: '#2563eb' }} /> Remote Only</label>
              <select value={datePosted} onChange={e => setDatePosted(e.target.value)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13, color: '#4b5563', cursor: 'pointer' }}><option value="all">Any time</option><option value="today">Today</option><option value="3days">Last 3 days</option><option value="week">This week</option><option value="month">This month</option></select>
              <select value={empType} onChange={e => setEmpType(e.target.value)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13, color: '#4b5563', cursor: 'pointer' }}><option value="">All types</option><option value="FULLTIME">Full-time</option><option value="PARTTIME">Part-time</option><option value="CONTRACTOR">Contract</option><option value="INTERN">Internship</option></select>
            </div>
          </form>

          {!searched && <div style={{ marginBottom: 28 }}><p style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', marginBottom: 12 }}>Popular Searches</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{POPULAR_ROLES.map(r => <button key={r} onClick={() => { setQuery(r); setTimeout(() => search(1), 0); }} style={{ padding: '8px 16px', borderRadius: 20, background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#4b5563', fontSize: 13, cursor: 'pointer' }}>{r}</button>)}</div></div>}

          {error && <div style={{ padding: 16, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 14, marginBottom: 20 }}>❌ {error}</div>}

          {loading && <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <div key={i} style={{ padding: 24, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', animation: 'pulse 1.5s infinite' }}><div style={{ display: 'flex', gap: 16 }}><div style={{ width: 48, height: 48, borderRadius: 10, background: '#f3f4f6' }}/><div style={{ flex: 1 }}><div style={{ width: '60%', height: 18, background: '#f3f4f6', borderRadius: 6, marginBottom: 8 }}/><div style={{ width: '40%', height: 14, background: '#f3f4f6', borderRadius: 6 }}/></div></div></div>)}</div>}

          {searched && !loading && (
            <>
              <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>{jobs.length > 0 ? <>Showing <strong>{jobs.length}</strong> of {total} results {!isPremium && total > FREE_RESULT_LIMIT && <span style={{ color: '#7c3aed', fontWeight: 600 }}>— Upgrade for all</span>}</> : 'No jobs found.'}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{jobs.map((job, i) => <JobCard key={job.job_id} job={job} locked={!isPremium && i >= FREE_RESULT_LIMIT} />)}</div>
              {isPremium && total > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 24 }}>
                  <button onClick={() => search(page - 1)} disabled={page <= 1} style={{ padding: '10px 20px', borderRadius: 10, background: page <= 1 ? '#f3f4f6' : '#fff', border: '1px solid #e5e7eb', color: page <= 1 ? '#d1d5db' : '#4b5563', fontSize: 13, fontWeight: 600, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}>← Previous</button>
                  <span style={{ padding: '10px 16px', color: '#6b7280', fontSize: 13, fontWeight: 600 }}>Page {page}</span>
                  <button onClick={() => search(page + 1)} style={{ padding: '10px 20px', borderRadius: 10, background: '#fff', border: '1px solid #e5e7eb', color: '#4b5563', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Next →</button>
                </div>
              )}
              {!isPremium && total > FREE_RESULT_LIMIT && (
                <div style={{ marginTop: 24, padding: 32, borderRadius: 14, background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)', border: '1px solid #dbeafe', textAlign: 'center' }}>
                  <span style={{ fontSize: 32 }}>🔓</span>
                  <h3 style={{ color: '#000', fontSize: 18, fontWeight: 700, margin: '12px 0 8px' }}>Unlock All {total} Jobs</h3>
                  <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>Get unlimited results, save jobs, and see resume match scores.</p>
                  <button onClick={() => navigate('/settings/billing')} style={{ padding: '12px 32px', borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Upgrade to Premium</button>
                </div>
              )}
            </>
          )}

          {!searched && !loading && (
            <div style={{ textAlign: 'center', padding: 48, background: '#f9fafb', borderRadius: 14, border: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: 48 }}>🌐</span>
              <h3 style={{ color: '#000', fontSize: 18, fontWeight: 700, margin: '16px 0 8px' }}>Search Millions of Jobs</h3>
              <p style={{ color: '#6b7280', fontSize: 14 }}>Enter a job title to search across LinkedIn, Indeed, Glassdoor, and more.</p>
            </div>
          )}
        </>
      )}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}
