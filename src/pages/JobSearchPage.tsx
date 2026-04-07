import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlanLimits } from '../hooks/usePlanLimits';
import { useNavigate } from 'react-router-dom';

// ── Types ────────────────────────────────────────────────────────────────────

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
  job_highlights?: {
    Qualifications?: string[];
    Responsibilities?: string[];
    Benefits?: string[];
  };
  job_required_experience?: {
    no_experience_required?: boolean;
    required_experience_in_months?: number;
    experience_mentioned?: boolean;
  };
  employer_company_type?: string;
  job_google_link?: string;
  apply_options?: {
    publisher: string;
    apply_link: string;
    is_direct: boolean;
  }[];
}

// ── RapidAPI Key ─────────────────────────────────────────────────────────────

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY || '915924306emsh0fd69b0f30a10b5p111217jsn7e8c5ccd8052';

// ── Constants ────────────────────────────────────────────────────────────────

const FREE_RESULT_LIMIT = 5;
const PREMIUM_RESULT_LIMIT = 30;

const POPULAR_ROLES = [
  'Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer',
  'DevOps Engineer', 'Marketing Manager', 'Sales Executive', 'Business Analyst',
  'Full Stack Developer', 'Machine Learning Engineer', 'Project Manager', 'Cloud Architect',
];

const EMPLOYMENT_TYPES: Record<string, string> = {
  FULLTIME: 'Full-time',
  PARTTIME: 'Part-time',
  CONTRACTOR: 'Contract',
  INTERN: 'Internship',
  TEMPORARY: 'Temporary',
};

// ── Helper: Time Ago ─────────────────────────────────────────────────────────

function timeAgo(dateString: string): string {
  if (!dateString) return '';
  const now = new Date();
  const posted = new Date(dateString);
  const diffMs = now.getTime() - posted.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function JobSearchPage() {
  const { user: _user } = useAuth();
  const { planState } = usePlanLimits();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [datePosted, setDatePosted] = useState<string>('all');
  const [employmentType, setEmploymentType] = useState<string>('');
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('helplyai_saved_jobs');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const isPremium = !planState.isFreeUser && !planState.isExpired;
  const resultLimit = isPremium ? PREMIUM_RESULT_LIMIT : FREE_RESULT_LIMIT;

  // Persist saved jobs
  useEffect(() => {
    localStorage.setItem('helplyai_saved_jobs', JSON.stringify([...savedJobs]));
  }, [savedJobs]);

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  const searchJobs = useCallback(async (page = 1) => {
    if (!query.trim()) return;

    if (!RAPIDAPI_KEY) {
      setError('Job Search API key not configured. Please add VITE_RAPIDAPI_KEY to your environment variables. Get a free key at rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);
    setCurrentPage(page);

    try {
      const params = new URLSearchParams({
        query: `${query.trim()}${location.trim() ? ` in ${location.trim()}` : ''}`,
        page: String(page),
        num_pages: '1',
        date_posted: datePosted,
        remote_jobs_only: remoteOnly ? 'true' : 'false',
      });

      if (employmentType) {
        params.set('employment_types', employmentType);
      }

      const response = await fetch(`https://jsearch.p.rapidapi.com/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'jsearch.p.rapidapi.com',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        if (response.status === 403) {
          throw new Error('Invalid API key. Please check your VITE_RAPIDAPI_KEY.');
        }
        throw new Error(`Search failed (${response.status}). Please try again.`);
      }

      const data = await response.json();
      const results: JobResult[] = data.data || [];

      // Apply result limit based on plan
      const limitedResults = results.slice(0, resultLimit);
      setJobs(limitedResults);
      setTotalResults(results.length);
      setExpandedJobId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to search jobs. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [query, location, remoteOnly, datePosted, employmentType, resultLimit]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchJobs(1);
  };

  const handleQuickSearch = (role: string) => {
    setQuery(role);
    // Trigger search after state update
    setTimeout(() => {
      const form = document.getElementById('job-search-form') as HTMLFormElement;
      if (form) form.requestSubmit();
    }, 0);
  };

  const formatSalary = (job: JobResult): string | null => {
    if (!job.job_min_salary && !job.job_max_salary) return null;
    const currency = job.job_salary_currency || 'USD';
    const period = job.job_salary_period ? `/${job.job_salary_period.toLowerCase()}` : '';
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 });
    if (job.job_min_salary && job.job_max_salary) {
      return `${formatter.format(job.job_min_salary)} - ${formatter.format(job.job_max_salary)}${period}`;
    }
    return `${formatter.format(job.job_min_salary || job.job_max_salary || 0)}${period}`;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
            </svg>
          </div>
          <div>
            <h1 style={{ color: '#000000', fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Job Search</h1>
            <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
              Find jobs across the internet from LinkedIn, Indeed, Glassdoor & more
            </p>
          </div>
        </div>
        {!isPremium && (
          <div style={{
            marginTop: 12, padding: '12px 16px', borderRadius: 10,
            background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
            border: '1px solid #dbeafe',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🔒</span>
              <span style={{ color: '#4b5563', fontSize: 13 }}>
                Free users can view up to <strong>{FREE_RESULT_LIMIT} results</strong> per search. Upgrade to see up to {PREMIUM_RESULT_LIMIT} results.
              </span>
            </div>
            <button
              onClick={() => navigate('/settings/billing')}
              style={{
                padding: '8px 16px', borderRadius: 8,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                border: 'none', color: '#fff', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Upgrade Now
            </button>
          </div>
        )}
      </div>

      {/* Search Form */}
      <form id="job-search-form" onSubmit={handleSearch} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 2, position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Job title, role, or keyword..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                width: '100%', padding: '14px 14px 14px 40px', borderRadius: 10,
                border: '2px solid #e5e7eb', fontSize: 14, color: '#000',
                outline: 'none', transition: 'border-color 0.2s',
                background: '#fff',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            <input
              type="text"
              placeholder="Location (city, country)..."
              value={location}
              onChange={e => setLocation(e.target.value)}
              style={{
                width: '100%', padding: '14px 14px 14px 40px', borderRadius: 10,
                border: '2px solid #e5e7eb', fontSize: 14, color: '#000',
                outline: 'none', transition: 'border-color 0.2s',
                background: '#fff',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            style={{
              padding: '14px 28px', borderRadius: 10,
              background: loading || !query.trim()
                ? '#d1d5db'
                : 'linear-gradient(135deg, #2563eb, #7c3aed)',
              border: 'none', color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              whiteSpace: 'nowrap', transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            )}
            {loading ? 'Searching...' : 'Search Jobs'}
          </button>
        </div>

        {/* Filters Row */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8,
            background: remoteOnly ? '#eff6ff' : '#f9fafb',
            border: `1px solid ${remoteOnly ? '#93c5fd' : '#e5e7eb'}`,
            cursor: 'pointer', fontSize: 13, color: remoteOnly ? '#2563eb' : '#6b7280',
            fontWeight: remoteOnly ? 600 : 500, transition: 'all 0.2s',
          }}>
            <input type="checkbox" checked={remoteOnly} onChange={e => setRemoteOnly(e.target.checked)}
              style={{ accentColor: '#2563eb' }} />
            Remote Only
          </label>

          <select
            value={datePosted}
            onChange={e => setDatePosted(e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: 8,
              border: '1px solid #e5e7eb', background: '#f9fafb',
              fontSize: 13, color: '#4b5563', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="all">Any time</option>
            <option value="today">Today</option>
            <option value="3days">Last 3 days</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
          </select>

          <select
            value={employmentType}
            onChange={e => setEmploymentType(e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: 8,
              border: '1px solid #e5e7eb', background: '#f9fafb',
              fontSize: 13, color: '#4b5563', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">All types</option>
            <option value="FULLTIME">Full-time</option>
            <option value="PARTTIME">Part-time</option>
            <option value="CONTRACTOR">Contract</option>
            <option value="INTERN">Internship</option>
          </select>
        </div>
      </form>

      {/* Quick Search Tags */}
      {!searched && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Popular Searches
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {POPULAR_ROLES.map(role => (
              <button
                key={role}
                onClick={() => handleQuickSearch(role)}
                style={{
                  padding: '8px 16px', borderRadius: 20,
                  background: '#f3f4f6', border: '1px solid #e5e7eb',
                  color: '#4b5563', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.color = '#2563eb'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#4b5563'; }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '16px 20px', borderRadius: 12,
          background: '#fef2f2', border: '1px solid #fecaca',
          color: '#dc2626', fontSize: 14, marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              padding: 24, borderRadius: 12, border: '1px solid #e5e7eb',
              background: '#fff', animation: 'pulse 1.5s ease-in-out infinite',
            }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: '#f3f4f6' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ width: '60%', height: 18, background: '#f3f4f6', borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ width: '40%', height: 14, background: '#f3f4f6', borderRadius: 6, marginBottom: 12 }} />
                  <div style={{ width: '80%', height: 12, background: '#f3f4f6', borderRadius: 6, marginBottom: 6 }} />
                  <div style={{ width: '65%', height: 12, background: '#f3f4f6', borderRadius: 6 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Header */}
      {searched && !loading && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            {jobs.length > 0 ? (
              <>
                Showing <strong style={{ color: '#000' }}>{jobs.length}</strong> of {totalResults} results
                {!isPremium && totalResults > FREE_RESULT_LIMIT && (
                  <span style={{ color: '#7c3aed', fontWeight: 600 }}>
                    {' '} — Upgrade to see all {totalResults} results
                  </span>
                )}
              </>
            ) : (
              'No jobs found. Try a different search.'
            )}
          </p>
        </div>
      )}

      {/* Job Results */}
      {!loading && jobs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {jobs.map((job, index) => {
            const isExpanded = expandedJobId === job.job_id;
            const isSaved = savedJobs.has(job.job_id);
            const salary = formatSalary(job);
            const applyOptions = job.apply_options || [];

            return (
              <div
                key={job.job_id}
                style={{
                  padding: 24, borderRadius: 14,
                  border: `1px solid ${isExpanded ? '#93c5fd' : '#e5e7eb'}`,
                  background: '#ffffff',
                  transition: 'all 0.2s',
                  boxShadow: isExpanded ? '0 4px 12px rgba(37, 99, 235, 0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                  position: 'relative',
                }}
                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.borderColor = '#d1d5db'; }}
                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.borderColor = '#e5e7eb'; }}
              >
                {/* Premium lock overlay for results beyond free limit */}
                {!isPremium && index >= FREE_RESULT_LIMIT && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 14,
                    background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 10,
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 24 }}>🔒</span>
                      <p style={{ color: '#4b5563', fontSize: 14, fontWeight: 600, margin: '8px 0' }}>Premium Only</p>
                      <button onClick={() => navigate('/settings/billing')} style={{
                        padding: '8px 20px', borderRadius: 8,
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}>
                        Upgrade
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {/* Company Logo */}
                  <div style={{
                    width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                    background: '#f3f4f6', border: '1px solid #e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {job.employer_logo ? (
                      <img src={job.employer_logo} alt={job.employer_name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#9ca3af' }}>
                        {job.employer_name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>

                  {/* Job Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{
                          fontSize: 16, fontWeight: 700, color: '#000', margin: 0,
                          letterSpacing: '-0.01em', lineHeight: 1.3,
                        }}>
                          {job.job_title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                          <span style={{ color: '#4b5563', fontSize: 14, fontWeight: 600 }}>{job.employer_name}</span>
                          {job.employer_website && (
                            <a href={job.employer_website} target="_blank" rel="noopener noreferrer"
                              style={{ color: '#2563eb', fontSize: 12, textDecoration: 'none' }}
                              onClick={e => e.stopPropagation()}>
                              Website ↗
                            </a>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button
                          onClick={() => toggleSaveJob(job.job_id)}
                          title={isSaved ? 'Remove from saved' : 'Save job'}
                          style={{
                            width: 36, height: 36, borderRadius: 8,
                            background: isSaved ? '#fef3c7' : '#f9fafb',
                            border: `1px solid ${isSaved ? '#fcd34d' : '#e5e7eb'}`,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s',
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24"
                            fill={isSaved ? '#f59e0b' : 'none'}
                            stroke={isSaved ? '#f59e0b' : '#9ca3af'} strokeWidth="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Tags Row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      {(job.job_city || job.job_state || job.job_country) && (
                        <span style={{
                          padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                          background: '#f3f4f6', color: '#4b5563',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                          </svg>
                          {[job.job_city, job.job_state, job.job_country].filter(Boolean).join(', ')}
                        </span>
                      )}
                      {job.job_is_remote && (
                        <span style={{
                          padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                          background: '#ecfdf5', color: '#059669',
                        }}>
                          🌍 Remote
                        </span>
                      )}
                      {job.job_employment_type && (
                        <span style={{
                          padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                          background: '#eff6ff', color: '#2563eb',
                        }}>
                          {EMPLOYMENT_TYPES[job.job_employment_type] || job.job_employment_type}
                        </span>
                      )}
                      {salary && (
                        <span style={{
                          padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                          background: '#f0fdf4', color: '#16a34a',
                        }}>
                          💰 {salary}
                        </span>
                      )}
                      {job.job_posted_at_datetime_utc && (
                        <span style={{
                          padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                          background: '#f9fafb', color: '#9ca3af',
                        }}>
                          {timeAgo(job.job_posted_at_datetime_utc)}
                        </span>
                      )}
                      <span style={{
                        padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                        background: '#f5f3ff', color: '#7c3aed',
                      }}>
                        via {job.job_publisher}
                      </span>
                    </div>

                    {/* Description preview */}
                    <p style={{
                      color: '#6b7280', fontSize: 13, lineHeight: 1.6, margin: '12px 0 0',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: isExpanded ? 999 : 3,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {job.job_description}
                    </p>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div style={{ marginTop: 16 }}>
                        {/* Qualifications */}
                        {job.job_highlights?.Qualifications && job.job_highlights.Qualifications.length > 0 && (
                          <div style={{ marginBottom: 14 }}>
                            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#000', margin: '0 0 8px' }}>Qualifications</h4>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                              {job.job_highlights.Qualifications.slice(0, 8).map((q, i) => (
                                <li key={i} style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, marginBottom: 2 }}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Responsibilities */}
                        {job.job_highlights?.Responsibilities && job.job_highlights.Responsibilities.length > 0 && (
                          <div style={{ marginBottom: 14 }}>
                            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#000', margin: '0 0 8px' }}>Responsibilities</h4>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                              {job.job_highlights.Responsibilities.slice(0, 8).map((r, i) => (
                                <li key={i} style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, marginBottom: 2 }}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Benefits */}
                        {job.job_highlights?.Benefits && job.job_highlights.Benefits.length > 0 && (
                          <div style={{ marginBottom: 14 }}>
                            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#000', margin: '0 0 8px' }}>Benefits</h4>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                              {job.job_highlights.Benefits.slice(0, 6).map((b, i) => (
                                <li key={i} style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, marginBottom: 2 }}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Apply Options */}
                        {applyOptions.length > 1 && (
                          <div style={{ marginBottom: 14 }}>
                            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#000', margin: '0 0 8px' }}>Apply on Multiple Platforms</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {applyOptions.map((opt, i) => (
                                <a
                                  key={i}
                                  href={opt.apply_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    padding: '6px 14px', borderRadius: 8,
                                    background: opt.is_direct ? '#ecfdf5' : '#f9fafb',
                                    border: `1px solid ${opt.is_direct ? '#a7f3d0' : '#e5e7eb'}`,
                                    color: opt.is_direct ? '#059669' : '#4b5563',
                                    fontSize: 12, fontWeight: 600, textDecoration: 'none',
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    transition: 'all 0.2s',
                                  }}
                                >
                                  {opt.publisher}
                                  {opt.is_direct && <span style={{ fontSize: 10 }}>✓ Direct</span>}
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                                    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                                  </svg>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Experience Required */}
                        {job.job_required_experience?.experience_mentioned && (
                          <div style={{
                            padding: '10px 14px', borderRadius: 8,
                            background: '#f9fafb', border: '1px solid #e5e7eb',
                            marginBottom: 14,
                          }}>
                            <span style={{ fontSize: 13, color: '#4b5563' }}>
                              Experience: {job.job_required_experience.no_experience_required
                                ? 'No experience required'
                                : job.job_required_experience.required_experience_in_months
                                  ? `${Math.round(job.job_required_experience.required_experience_in_months / 12)}+ years`
                                  : 'Experience preferred'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
                      <a
                        href={job.job_apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '10px 24px', borderRadius: 10,
                          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                          color: '#fff', fontSize: 13, fontWeight: 600,
                          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        Apply Now
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                          <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>

                      {job.job_google_link && (
                        <a
                          href={job.job_google_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '10px 18px', borderRadius: 10,
                            background: '#f3f4f6', border: '1px solid #e5e7eb',
                            color: '#4b5563', fontSize: 13, fontWeight: 600,
                            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
                            transition: 'all 0.2s',
                          }}
                        >
                          View on Google
                        </a>
                      )}

                      <button
                        onClick={() => setExpandedJobId(isExpanded ? null : job.job_id)}
                        style={{
                          padding: '10px 18px', borderRadius: 10,
                          background: 'transparent', border: '1px solid #e5e7eb',
                          color: '#6b7280', fontSize: 13, fontWeight: 500,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        {isExpanded ? 'Show Less' : 'View Details'}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>

                      {/* Copy job link */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(job.job_apply_link);
                        }}
                        title="Copy apply link"
                        style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: '#f9fafb', border: '1px solid #e5e7eb',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#9ca3af', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#2563eb'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Load More / Premium Upsell */}
          {!isPremium && totalResults > FREE_RESULT_LIMIT && (
            <div style={{
              padding: '32px 24px', borderRadius: 14,
              background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
              border: '1px solid #dbeafe',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: 32 }}>🔓</span>
              <h3 style={{ color: '#000', fontSize: 18, fontWeight: 700, margin: '12px 0 8px' }}>
                Unlock All {totalResults} Job Results
              </h3>
              <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>
                Upgrade to a premium plan to see all available jobs, save unlimited listings, and get priority access.
              </p>
              <button
                onClick={() => navigate('/settings/billing')}
                style={{
                  padding: '12px 32px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  border: 'none', color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Upgrade to Premium
              </button>
            </div>
          )}

          {/* Pagination for premium */}
          {isPremium && totalResults > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 8 }}>
              <button
                onClick={() => searchJobs(currentPage - 1)}
                disabled={currentPage <= 1}
                style={{
                  padding: '10px 20px', borderRadius: 10,
                  background: currentPage <= 1 ? '#f3f4f6' : '#fff',
                  border: '1px solid #e5e7eb',
                  color: currentPage <= 1 ? '#d1d5db' : '#4b5563',
                  fontSize: 13, fontWeight: 600,
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                ← Previous
              </button>
              <span style={{ padding: '10px 16px', color: '#6b7280', fontSize: 13, fontWeight: 600 }}>
                Page {currentPage}
              </span>
              <button
                onClick={() => searchJobs(currentPage + 1)}
                style={{
                  padding: '10px 20px', borderRadius: 10,
                  background: '#fff', border: '1px solid #e5e7eb',
                  color: '#4b5563', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {searched && !loading && jobs.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <span style={{ fontSize: 48 }}>🔍</span>
          <h3 style={{ color: '#000', fontSize: 18, fontWeight: 700, margin: '16px 0 8px' }}>No Jobs Found</h3>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Try adjusting your search terms, location, or filters.
          </p>
        </div>
      )}

      {/* Initial State */}
      {!searched && !loading && (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          background: '#f9fafb', borderRadius: 14, border: '1px solid #e5e7eb',
        }}>
          <span style={{ fontSize: 48 }}>🌐</span>
          <h3 style={{ color: '#000', fontSize: 18, fontWeight: 700, margin: '16px 0 8px' }}>
            Search Millions of Jobs
          </h3>
          <p style={{ color: '#6b7280', fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
            Enter a job title or keyword above to search across LinkedIn, Indeed, Glassdoor, and hundreds of other job platforms.
            Click "Apply Now" to go directly to the application page.
          </p>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
