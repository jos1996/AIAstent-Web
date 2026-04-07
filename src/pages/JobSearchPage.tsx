import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlanLimits } from '../hooks/usePlanLimits';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, MapPin, Briefcase, Building2, DollarSign, Clock, Globe, Bookmark, CheckCircle2, X, ExternalLink, Eye, Filter, TrendingUp, Copy } from 'lucide-react';

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

interface LocationSuggestion { city: string; country: string; displayName: string; }

const RAPIDAPI_KEY = '915924306emsh0fd69b0f30a10b5p111217jsn7e8c5ccd8052';
const FREE_RESULT_LIMIT = 5;
const PREMIUM_RESULT_LIMIT = 12;
const POPULAR_ROLES = ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'DevOps Engineer', 'Full Stack Developer', 'Backend Developer', 'Frontend Developer', 'Mobile Developer', 'QA Engineer', 'Business Analyst', 'Project Manager'];
const EMPLOYMENT_TYPES: Record<string, string> = { FULLTIME: 'Full-time', PARTTIME: 'Part-time', CONTRACTOR: 'Contract', INTERN: 'Internship' };

const INDIAN_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Guwahati', 'Solapur', 'Hubli-Dharwad', 'Mysore', 'Tiruchirappalli', 'Bareilly', 'Aligarh', 'Tiruppur', 'Moradabad', 'Jalandhar', 'Bhubaneswar', 'Salem', 'Warangal', 'Guntur', 'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Bikaner', 'Amravati', 'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack', 'Firozabad', 'Kochi', 'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela', 'Nanded', 'Kolhapur', 'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar', 'Jammu', 'Sangli-Miraj & Kupwad', 'Mangalore', 'Erode', 'Belgaum', 'Ambattur', 'Tirunelveli', 'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur', 'Maheshtala'];
const GLOBAL_CITIES = ['New York', 'London', 'Singapore', 'Dubai', 'San Francisco', 'Toronto', 'Sydney', 'Berlin', 'Paris', 'Tokyo', 'Hong Kong', 'Amsterdam', 'Seattle', 'Boston', 'Austin', 'Los Angeles', 'Chicago', 'Vancouver', 'Melbourne', 'Dublin'];

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

function formatSalary(min: number | null, max: number | null, currency: string | null, period: string | null): string {
  if (!min && !max) return '';
  const curr = currency || 'USD';
  const per = period === 'YEAR' ? '/year' : period === 'MONTH' ? '/month' : period === 'HOUR' ? '/hr' : '';
  
  const formatNum = (n: number) => {
    if (curr === 'INR') {
      if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
      if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
      return `₹${(n / 1000).toFixed(0)}K`;
    }
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
  };
  
  if (min && max) return `${formatNum(min)} - ${formatNum(max)}${per}`;
  if (min) return `${formatNum(min)}+${per}`;
  if (max) return `Up to ${formatNum(max)}${per}`;
  return '';
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
  const [allJobs, setAllJobs] = useState<JobResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [modalJob, setModalJob] = useState<JobResult | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const searchCacheRef = useRef<{ query: string; results: JobResult[]; timestamp: number } | null>(null);
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

  const searchLoc = useCallback((txt: string) => {
    if (txt.length < 2) { setLocSuggestions([]); return; }
    const searchTerm = txt.toLowerCase();
    const allCities = [...INDIAN_CITIES, ...GLOBAL_CITIES];
    const matches = allCities
      .filter(city => city.toLowerCase().includes(searchTerm))
      .slice(0, 8)
      .map(city => {
        const isIndian = INDIAN_CITIES.includes(city);
        return { city, country: isIndian ? 'India' : 'International', displayName: `${city}, ${isIndian ? 'India' : 'International'}` };
      });
    setLocSuggestions(matches);
  }, []);

  const onLocChange = (v: string) => { 
    setLocation(v); 
    setShowLocDropdown(true); 
    if (locDebounce.current) clearTimeout(locDebounce.current); 
    locDebounce.current = setTimeout(() => searchLoc(v), 150); 
  };
  
  const selectLoc = (s: LocationSuggestion) => { setLocation(s.city); setShowLocDropdown(false); setLocSuggestions([]); };

  const updateStatus = (job: JobResult, status: 'saved'|'applied'|'ignored') => {
    setSavedJobs(prev => {
      const next = new Map(prev);
      const ex = next.get(job.job_id);
      if (ex && ex.status === status) next.delete(job.job_id);
      else next.set(job.job_id, { ...job, savedAt: Date.now(), status, matchScore: userResume ? calcMatch(job.job_description, userResume) : undefined });
      return next;
    });
  };

  const search = useCallback(async (p = 1, forceRefresh = false) => {
    if (!query.trim()) return;
    
    const searchKey = `${query.trim()}_${location.trim()}_${datePosted}_${remoteOnly}_${empType}`;
    const now = Date.now();
    
    // Check cache (valid for 5 minutes)
    if (!forceRefresh && searchCacheRef.current && searchCacheRef.current.query === searchKey && (now - searchCacheRef.current.timestamp) < 300000) {
      const cached = searchCacheRef.current.results;
      setAllJobs(cached);
      setTotal(cached.length);
      const start = (p - 1) * limit;
      setJobs(cached.slice(start, start + limit));
      setPage(p);
      setSearched(true);
      return;
    }
    
    setLoading(true); setError(''); setSearched(true); setPage(p);
    try {
      // Fetch 3 pages at once for better pagination performance
      const params = new URLSearchParams({ 
        query: `${query.trim()}${location.trim() ? ` in ${location.trim()}` : ''}`, 
        page: '1', 
        num_pages: '3', 
        date_posted: datePosted, 
        remote_jobs_only: remoteOnly ? 'true' : 'false' 
      });
      if (empType) params.set('employment_types', empType);
      
      const r = await fetch(`https://jsearch.p.rapidapi.com/search?${params}`, { 
        headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'jsearch.p.rapidapi.com' } 
      });
      
      if (!r.ok) throw new Error(r.status === 429 ? 'Rate limit. Wait and retry.' : `Error ${r.status}`);
      
      const d = await r.json();
      const res: JobResult[] = d.data || [];
      
      // Cache results
      searchCacheRef.current = { query: searchKey, results: res, timestamp: now };
      
      setAllJobs(res);
      setTotal(res.length);
      const start = (p - 1) * limit;
      setJobs(res.slice(start, start + limit));
      setModalJob(null);
    } catch (e: any) { 
      setError(e.message); 
      setJobs([]); 
      setAllJobs([]);
    } finally { 
      setLoading(false); 
    }
  }, [query, location, remoteOnly, datePosted, empType, limit]);

  const changePage = useCallback((newPage: number) => {
    if (allJobs.length > 0) {
      const start = (newPage - 1) * limit;
      setJobs(allJobs.slice(start, start + limit));
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      search(newPage);
    }
  }, [allJobs, limit, search]);

  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); search(1); };

  const savedCount = [...savedJobs.values()].filter(j => j.status === 'saved').length;
  const appliedCount = [...savedJobs.values()].filter(j => j.status === 'applied').length;
  const ignoredCount = [...savedJobs.values()].filter(j => j.status === 'ignored').length;
  const filteredSaved = [...savedJobs.values()].filter(j => savedFilter === 'all' || j.status === savedFilter).sort((a, b) => b.savedAt - a.savedAt);

  const JobCard = ({ job, locked = false }: { job: JobResult | SavedJob; locked?: boolean }) => {
    const saved = savedJobs.get(job.job_id);
    const match = userResume ? ('matchScore' in job && job.matchScore) || calcMatch(job.job_description, userResume) : null;
    const salary = formatSalary(job.job_min_salary, job.job_max_salary, job.job_salary_currency, job.job_salary_period);

    return (
      <div style={{ padding: 20, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', position: 'relative', transition: 'all 0.2s', height: '100%', display: 'flex', flexDirection: 'column' }}
        onMouseEnter={e => !locked && (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)', e.currentTarget.style.borderColor = '#d1d5db')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none', e.currentTarget.style.borderColor = '#e5e7eb')}>
        {locked && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Briefcase size={24} color="#fff" />
              </div>
              <p style={{ color: '#111827', fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>Premium Only</p>
              <button onClick={(e) => { e.stopPropagation(); navigate('/settings/billing'); }} style={{ padding: '8px 20px', borderRadius: 8, background: '#111827', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Upgrade Now</button>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 10, background: '#f9fafb', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {job.employer_logo ? <img src={job.employer_logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => (e.target as HTMLImageElement).style.display = 'none'} /> : <Building2 size={24} color="#9ca3af" />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.job_title}</h3>
            <p style={{ color: '#6b7280', fontSize: 13, fontWeight: 500, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.employer_name}</p>
          </div>
        </div>
        
        {salary && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 12 }}>
            <DollarSign size={18} color="#111827" />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{salary}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {(job.job_city || job.job_country) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, fontSize: 11, background: '#f3f4f6', color: '#6b7280' }}>
              <MapPin size={12} color="#6b7280" />
              <span>{[job.job_city, job.job_state].filter(Boolean).join(', ')}</span>
            </div>
          )}
          {job.job_is_remote && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, fontSize: 11, background: '#f3f4f6', color: '#6b7280', fontWeight: 600 }}>
              <Globe size={12} color="#6b7280" />
              <span>Remote</span>
            </div>
          )}
          {job.job_employment_type && (
            <div style={{ padding: '4px 8px', borderRadius: 6, fontSize: 11, background: '#f3f4f6', color: '#6b7280', fontWeight: 500 }}>
              {EMPLOYMENT_TYPES[job.job_employment_type] || job.job_employment_type}
            </div>
          )}
          {job.job_posted_at_datetime_utc && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, fontSize: 11, background: '#f3f4f6', color: '#6b7280' }}>
              <Clock size={12} color="#6b7280" />
              <span>{timeAgo(job.job_posted_at_datetime_utc)}</span>
            </div>
          )}
        </div>

        <p style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.5, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{job.job_description}</p>

        {match !== null && match > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 12 }}>
            <TrendingUp size={16} color="#6b7280" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>Resume Match</div>
              <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${match}%`, height: '100%', background: '#111827', transition: 'width 0.3s' }} />
              </div>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{match}%</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
          <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.stopPropagation(); updateStatus(job, 'applied'); }} style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#111827', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
            Apply Now
            <ExternalLink size={14} />
          </a>
          <button onClick={(e) => { e.stopPropagation(); setModalJob(job); }} style={{ padding: '10px 16px', borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Eye size={14} />
            View
          </button>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button onClick={(e) => { e.stopPropagation(); updateStatus(job, 'saved'); }} style={{ flex: 1, padding: '8px', borderRadius: 8, background: saved?.status === 'saved' ? '#111827' : '#f9fafb', border: `1px solid ${saved?.status === 'saved' ? '#111827' : '#e5e7eb'}`, color: saved?.status === 'saved' ? '#fff' : '#6b7280', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Bookmark size={14} fill={saved?.status === 'saved' ? '#fff' : 'none'} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); updateStatus(job, 'applied'); }} style={{ flex: 1, padding: '8px', borderRadius: 8, background: saved?.status === 'applied' ? '#111827' : '#f9fafb', border: `1px solid ${saved?.status === 'applied' ? '#111827' : '#e5e7eb'}`, color: saved?.status === 'applied' ? '#fff' : '#6b7280', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <CheckCircle2 size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); updateStatus(job, 'ignored'); }} style={{ flex: 1, padding: '8px', borderRadius: 8, background: saved?.status === 'ignored' ? '#111827' : '#f9fafb', border: `1px solid ${saved?.status === 'ignored' ? '#111827' : '#e5e7eb'}`, color: saved?.status === 'ignored' ? '#fff' : '#9ca3af', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <X size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ color: '#111827', fontSize: 28, fontWeight: 700, margin: 0 }}>Job Search</h1>
            <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Find jobs from LinkedIn, Indeed, Glassdoor & more</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16, padding: '10px 16px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Bookmark size={16} color="#6b7280" />
              <span style={{ fontSize: 14, color: '#111827', fontWeight: 600 }}>{savedCount}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={16} color="#6b7280" />
              <span style={{ fontSize: 14, color: '#111827', fontWeight: 600 }}>{appliedCount}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <X size={16} color="#6b7280" />
              <span style={{ fontSize: 14, color: '#111827', fontWeight: 600 }}>{ignoredCount}</span>
            </div>
          </div>
          <button onClick={() => setShowSaved(!showSaved)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e5e7eb', background: showSaved ? '#111827' : '#fff', color: showSaved ? '#fff' : '#111827', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bookmark size={16} />
            {showSaved ? 'Back to Search' : 'Saved Jobs'}
          </button>
        </div>
      </div>

      {!isPremium && !showSaved && (
        <div style={{ marginBottom: 20, padding: '14px 20px', borderRadius: 12, background: '#f9fafb', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#111827', fontSize: 14, fontWeight: 500 }}>Free plan: <strong>{FREE_RESULT_LIMIT} results</strong>. Upgrade for unlimited access with {PREMIUM_RESULT_LIMIT} jobs per page.</span>
          <button onClick={() => navigate('/settings/billing')} style={{ padding: '8px 20px', borderRadius: 8, background: '#111827', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Upgrade</button>
        </div>
      )}

      {showSaved ? (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {(['all', 'saved', 'applied', 'ignored'] as const).map(f => (
              <button key={f} onClick={() => setSavedFilter(f)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e5e7eb', background: savedFilter === f ? '#111827' : '#fff', color: savedFilter === f ? '#fff' : '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                {f} ({f === 'all' ? savedJobs.size : f === 'saved' ? savedCount : f === 'applied' ? appliedCount : ignoredCount})
              </button>
            ))}
          </div>
          {filteredSaved.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 64, background: '#f9fafb', borderRadius: 16, border: '1px solid #e5e7eb' }}>
              <Bookmark size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#6b7280', fontSize: 16 }}>No {savedFilter === 'all' ? 'saved' : savedFilter} jobs yet</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
              {filteredSaved.map(job => <JobCard key={job.job_id} job={job} />)}
            </div>
          )}
        </div>
      ) : (
        <>
          <form onSubmit={onSubmit} style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 2, position: 'relative' }}>
                <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="text" placeholder="Job title, role, or keyword..." value={query} onChange={e => setQuery(e.target.value)}
                  style={{ width: '100%', padding: '14px 16px 14px 46px', borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 14, color: '#111827', outline: 'none', background: '#fff', fontWeight: 500 }}
                  onFocus={e => e.currentTarget.style.borderColor = '#111827'} onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'} />
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <MapPin size={18} color="#9ca3af" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="text" placeholder="Location..." value={location} onChange={e => onLocChange(e.target.value)} 
                  onFocus={e => { setShowLocDropdown(true); e.currentTarget.style.borderColor = '#111827'; }} 
                  onBlur={e => { setTimeout(() => setShowLocDropdown(false), 200); e.currentTarget.style.borderColor = '#e5e7eb'; }}
                  style={{ width: '100%', padding: '14px 16px 14px 46px', borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 14, color: '#111827', outline: 'none', background: '#fff', fontWeight: 500 }} />
                {showLocDropdown && locSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, marginTop: 6, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden', maxHeight: 300, overflowY: 'auto' }}>
                    {locSuggestions.map((s, i) => (
                      <div key={i} onClick={() => selectLoc(s)} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 10, borderBottom: i < locSuggestions.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                        <MapPin size={14} color="#9ca3af" />
                        {s.displayName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" disabled={loading || !query.trim()} style={{ padding: '14px 32px', borderRadius: 12, background: loading || !query.trim() ? '#d1d5db' : '#111827', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading || !query.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Search size={18} />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <Filter size={16} color="#6b7280" />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, background: remoteOnly ? '#111827' : '#f9fafb', border: `1px solid ${remoteOnly ? '#111827' : '#e5e7eb'}`, cursor: 'pointer', fontSize: 13, color: remoteOnly ? '#fff' : '#6b7280', fontWeight: 600 }}>
                <input type="checkbox" checked={remoteOnly} onChange={e => setRemoteOnly(e.target.checked)} style={{ accentColor: '#111827' }} />
                <Globe size={14} />
                Remote Only
              </label>
              <select value={datePosted} onChange={e => setDatePosted(e.target.value)} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13, color: '#111827', cursor: 'pointer', fontWeight: 500 }}>
                <option value="all">Any time</option><option value="today">Today</option><option value="3days">Last 3 days</option><option value="week">This week</option><option value="month">This month</option>
              </select>
              <select value={empType} onChange={e => setEmpType(e.target.value)} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13, color: '#111827', cursor: 'pointer', fontWeight: 500 }}>
                <option value="">All types</option><option value="FULLTIME">Full-time</option><option value="PARTTIME">Part-time</option><option value="CONTRACTOR">Contract</option><option value="INTERN">Internship</option>
              </select>
            </div>
          </form>

          {!searched && (
            <div style={{ marginBottom: 32 }}>
              <p style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Popular Roles</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {POPULAR_ROLES.map(r => (
                  <button key={r} onClick={() => { setQuery(r); setTimeout(() => search(1), 0); }}
                    style={{ padding: '10px 18px', borderRadius: 20, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#111827', e.currentTarget.style.color = '#fff')} 
                    onMouseLeave={e => (e.currentTarget.style.background = '#f9fafb', e.currentTarget.style.color = '#111827')}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: 18, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 14, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <X size={18} />
              {error}
            </div>
          )}

          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                <div key={i} style={{ padding: 20, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', animation: 'pulse 1.5s infinite' }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: '#f3f4f6' }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ width: '70%', height: 16, background: '#f3f4f6', borderRadius: 6, marginBottom: 8 }}/>
                      <div style={{ width: '50%', height: 14, background: '#f3f4f6', borderRadius: 6 }}/>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: 60, background: '#f3f4f6', borderRadius: 8 }}/>
                </div>
              ))}
            </div>
          )}

          {searched && !loading && (
            <>
              <p style={{ color: '#6b7280', fontSize: 14, fontWeight: 500, marginBottom: 20 }}>
                {jobs.length > 0 ? (
                  <>Showing <strong style={{ color: '#111827' }}>{jobs.length}</strong> of {total} results {!isPremium && total > FREE_RESULT_LIMIT && <span style={{ color: '#111827', fontWeight: 600 }}>— Upgrade for all</span>}</>
                ) : 'No jobs found.'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16, marginBottom: 24 }}>
                {jobs.map((job, i) => <JobCard key={job.job_id} job={job} locked={!isPremium && i >= FREE_RESULT_LIMIT} />)}
              </div>
              
              {isPremium && total > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 32 }}>
                  <button onClick={() => changePage(page - 1)} disabled={page <= 1} style={{ padding: '12px 24px', borderRadius: 10, background: page <= 1 ? '#f3f4f6' : '#fff', border: '1px solid #e5e7eb', color: page <= 1 ? '#d1d5db' : '#111827', fontSize: 14, fontWeight: 600, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}>← Previous</button>
                  <span style={{ padding: '12px 20px', color: '#6b7280', fontSize: 14, fontWeight: 600 }}>Page {page} of {Math.ceil(total / limit)}</span>
                  <button onClick={() => changePage(page + 1)} disabled={page >= Math.ceil(total / limit)} style={{ padding: '12px 24px', borderRadius: 10, background: page >= Math.ceil(total / limit) ? '#f3f4f6' : '#fff', border: '1px solid #e5e7eb', color: page >= Math.ceil(total / limit) ? '#d1d5db' : '#111827', fontSize: 14, fontWeight: 600, cursor: page >= Math.ceil(total / limit) ? 'not-allowed' : 'pointer' }}>Next →</button>
                </div>
              )}
              
              {!isPremium && total > FREE_RESULT_LIMIT && (
                <div style={{ marginTop: 32, padding: 40, borderRadius: 16, background: '#f9fafb', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Briefcase size={32} color="#fff" />
                  </div>
                  <h3 style={{ color: '#111827', fontSize: 22, fontWeight: 700, margin: '0 0 10px' }}>Unlock All {total} Jobs</h3>
                  <p style={{ color: '#6b7280', fontSize: 15, marginBottom: 20, maxWidth: 500, margin: '0 auto 20px' }}>Get unlimited job results with {PREMIUM_RESULT_LIMIT} jobs per page, save jobs, track applications, and see resume match scores.</p>
                  <button onClick={() => navigate('/settings/billing')} style={{ padding: '14px 40px', borderRadius: 12, background: '#111827', border: 'none', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Upgrade to Premium</button>
                </div>
              )}
            </>
          )}

          {!searched && !loading && (
            <div style={{ textAlign: 'center', padding: 80, background: '#f9fafb', borderRadius: 16, border: '1px solid #e5e7eb' }}>
              <Search size={56} color="#d1d5db" style={{ margin: '0 auto 20px' }} />
              <h3 style={{ color: '#111827', fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>Search Millions of Jobs</h3>
              <p style={{ color: '#6b7280', fontSize: 15 }}>Enter a job title to search across LinkedIn, Indeed, Glassdoor, and more.</p>
            </div>
          )}
        </>
      )}

      {modalJob && (
        <div onClick={() => setModalJob(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, maxWidth: 800, width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: 24, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{modalJob.job_title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  {modalJob.employer_logo && <img src={modalJob.employer_logo} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'contain' }} />}
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#6b7280' }}>{modalJob.employer_name}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {formatSalary(modalJob.job_min_salary, modalJob.job_max_salary, modalJob.job_salary_currency, modalJob.job_salary_period) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                      <DollarSign size={16} color="#111827" />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{formatSalary(modalJob.job_min_salary, modalJob.job_max_salary, modalJob.job_salary_currency, modalJob.job_salary_period)}</span>
                    </div>
                  )}
                  {(modalJob.job_city || modalJob.job_country) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f3f4f6', borderRadius: 8 }}>
                      <MapPin size={14} color="#6b7280" />
                      <span style={{ fontSize: 13, color: '#6b7280' }}>{[modalJob.job_city, modalJob.job_state, modalJob.job_country].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  {modalJob.job_is_remote && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f3f4f6', borderRadius: 8 }}>
                      <Globe size={14} color="#6b7280" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>Remote</span>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => setModalJob(null)} style={{ padding: 8, borderRadius: 8, background: '#f3f4f6', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#6b7280" />
              </button>
            </div>
            
            <div style={{ padding: 24 }}>
              <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.7, marginBottom: 24, whiteSpace: 'pre-wrap' }}>{modalJob.job_description}</p>
              
              {modalJob.job_highlights && (
                <div style={{ marginBottom: 24 }}>
                  {modalJob.job_highlights.Qualifications && (
                    <div style={{ marginBottom: 16 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Qualifications</h4>
                      <ul style={{ margin: 0, paddingLeft: 20, color: '#6b7280', fontSize: 13, lineHeight: 1.6 }}>
                        {modalJob.job_highlights.Qualifications.map((q, i) => <li key={i}>{q}</li>)}
                      </ul>
                    </div>
                  )}
                  {modalJob.job_highlights.Responsibilities && (
                    <div style={{ marginBottom: 16 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Responsibilities</h4>
                      <ul style={{ margin: 0, paddingLeft: 20, color: '#6b7280', fontSize: 13, lineHeight: 1.6 }}>
                        {modalJob.job_highlights.Responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                  {modalJob.job_highlights.Benefits && (
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Benefits</h4>
                      <ul style={{ margin: 0, paddingLeft: 20, color: '#6b7280', fontSize: 13, lineHeight: 1.6 }}>
                        {modalJob.job_highlights.Benefits.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {(() => { const contacts = extractContacts(modalJob.job_description); return (contacts.emails.length > 0 || contacts.phones.length > 0 || contacts.linkedins.length > 0) && (
                <div style={{ marginBottom: 24, padding: 16, background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Contact Information</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {contacts.emails.map((e, i) => <a key={i} href={`mailto:${e}`} style={{ padding: '6px 12px', borderRadius: 8, background: '#fff', border: '1px solid #e5e7eb', color: '#111827', fontSize: 12, textDecoration: 'none', fontWeight: 500 }}>{e}</a>)}
                    {contacts.phones.map((p, i) => <a key={i} href={`tel:${p}`} style={{ padding: '6px 12px', borderRadius: 8, background: '#fff', border: '1px solid #e5e7eb', color: '#111827', fontSize: 12, textDecoration: 'none', fontWeight: 500 }}>{p}</a>)}
                    {contacts.linkedins.map((l, i) => <a key={i} href={`https://${l}`} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 12px', borderRadius: 8, background: '#fff', border: '1px solid #e5e7eb', color: '#111827', fontSize: 12, textDecoration: 'none', fontWeight: 500 }}>LinkedIn Profile</a>)}
                  </div>
                </div>
              ); })()}

              <div style={{ display: 'flex', gap: 12 }}>
                <a href={modalJob.job_apply_link} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '14px', borderRadius: 10, background: '#111827', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  Apply Now
                  <ExternalLink size={16} />
                </a>
                {modalJob.job_google_link && (
                  <a href={modalJob.job_google_link} target="_blank" rel="noopener noreferrer" style={{ padding: '14px 20px', borderRadius: 10, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827', fontSize: 14, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                    View on Google
                    <ExternalLink size={16} />
                  </a>
                )}
                <button onClick={() => navigator.clipboard.writeText(modalJob.job_apply_link)} style={{ padding: '14px 20px', borderRadius: 10, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#6b7280', cursor: 'pointer' }}>
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}
