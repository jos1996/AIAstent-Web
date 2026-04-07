import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlanLimits } from '../hooks/usePlanLimits';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, MapPin, Briefcase, Building2, DollarSign, Clock, Globe, Bookmark, CheckCircle2, X, ExternalLink, Eye, Filter, TrendingUp, Copy, Layers, FileText, User, Sparkles } from 'lucide-react';

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
  source_platform?: string;
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

const INDIAN_CITIES = ['Mumbai','Delhi','Bangalore','Bengaluru','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad','Jaipur','Surat','Lucknow','Kanpur','Nagpur','Indore','Thane','Bhopal','Visakhapatnam','Patna','Vadodara','Ghaziabad','Ludhiana','Agra','Nashik','Faridabad','Meerut','Rajkot','Varanasi','Srinagar','Aurangabad','Dhanbad','Amritsar','Navi Mumbai','Allahabad','Ranchi','Howrah','Coimbatore','Jabalpur','Gwalior','Vijayawada','Jodhpur','Madurai','Raipur','Kota','Chandigarh','Guwahati','Mysore','Noida','Jamshedpur','Kochi','Dehradun','Mangalore','Bhubaneswar','Trivandrum','Thiruvananthapuram','Gurugram','Gurgaon'];
const GLOBAL_CITIES = ['New York','London','Singapore','Dubai','San Francisco','Toronto','Sydney','Berlin','Paris','Tokyo','Hong Kong','Amsterdam','Seattle','Boston','Austin','Los Angeles','Chicago','Vancouver','Melbourne','Dublin','Remote'];

const PLATFORM_COLORS: Record<string, string> = {
  'LinkedIn': '#0A66C2',
  'Indeed': '#2557a7',
  'Glassdoor': '#0caa41',
  'Naukri': '#4a90d9',
  'ZipRecruiter': '#00a900',
  'Monster': '#6e45a5',
  'Dice': '#eb1c26',
  'CareerBuilder': '#0071ce',
  'SimplyHired': '#5c2d91',
  'Remotive': '#00b4d8',
  'Arbeitnow': '#ff6b35',
  'Jobicy': '#7c3aed',
  'Google': '#4285f4',
};

function detectPlatform(publisher: string, applyLink: string, applyOptions?: { publisher: string; apply_link: string; is_direct: boolean; }[]): string {
  const pub = (publisher || '').toLowerCase();
  const link = (applyLink || '').toLowerCase();
  const allLinks = [link, ...(applyOptions || []).map(o => (o.apply_link || '').toLowerCase())];
  const allPubs = [pub, ...(applyOptions || []).map(o => (o.publisher || '').toLowerCase())];
  const check = (keyword: string) => allPubs.some(p => p.includes(keyword)) || allLinks.some(l => l.includes(keyword));
  if (check('linkedin')) return 'LinkedIn';
  if (check('indeed')) return 'Indeed';
  if (check('glassdoor')) return 'Glassdoor';
  if (check('naukri')) return 'Naukri';
  if (check('ziprecruiter')) return 'ZipRecruiter';
  if (check('monster')) return 'Monster';
  if (check('dice')) return 'Dice';
  if (check('careerbuilder')) return 'CareerBuilder';
  if (check('simplyhired')) return 'SimplyHired';
  if (check('remotive')) return 'Remotive';
  if (check('arbeitnow')) return 'Arbeitnow';
  if (check('google')) return 'Google';
  return publisher || 'Job Board';
}

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

function calcMatch(jobDesc: string, resume: string): number {
  if (!resume || !jobDesc) return 0;
  const rWords = new Set(resume.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
  const jWords = jobDesc.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const matches = jWords.filter(w => rWords.has(w)).length;
  return Math.min(99, Math.round((matches / Math.max(jWords.length, 1)) * 100 * 2.5));
}

interface ResumeProfile {
  suggestedRole: string;
  skills: string[];
  experienceYears: number;
  experienceLevel: 'fresher' | 'junior' | 'mid' | 'senior' | 'lead';
}

function parseResume(resume: string): ResumeProfile {
  const text = resume.toLowerCase();
  
  // Extract years of experience
  const expMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/i) 
    || text.match(/experience[:\s]*(\d+)\+?\s*(?:years?|yrs?)/i);
  const years = expMatch ? parseInt(expMatch[1]) : 0;
  
  // Determine experience level
  let level: ResumeProfile['experienceLevel'] = 'fresher';
  if (years >= 10) level = 'lead';
  else if (years >= 6) level = 'senior';
  else if (years >= 3) level = 'mid';
  else if (years >= 1) level = 'junior';
  
  // Extract skills
  const techSkills = ['python', 'java', 'javascript', 'typescript', 'react', 'angular', 'vue', 'node', 'nodejs', 'sql', 'mongodb', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'machine learning', 'ml', 'ai', 'data science', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'spark', 'hadoop', 'tableau', 'power bi', 'excel', 'git', 'agile', 'scrum', 'jira', 'figma', 'sketch', 'photoshop', 'html', 'css', 'sass', 'tailwind', 'bootstrap', 'django', 'flask', 'fastapi', 'spring', 'springboot', '.net', 'c#', 'c++', 'go', 'golang', 'rust', 'swift', 'kotlin', 'flutter', 'react native', 'ios', 'android', 'devops', 'ci/cd', 'jenkins', 'terraform', 'ansible', 'linux', 'unix', 'shell', 'bash', 'api', 'rest', 'graphql', 'microservices', 'redis', 'elasticsearch', 'kafka', 'rabbitmq', 'postgresql', 'mysql', 'oracle', 'salesforce', 'sap', 'servicenow'];
  const foundSkills = techSkills.filter(skill => text.includes(skill));
  
  // Detect role from common titles
  const roles = [
    { keywords: ['data scientist', 'data science', 'machine learning', 'ml engineer'], role: 'Data Scientist' },
    { keywords: ['software engineer', 'software developer', 'sde', 'swe'], role: 'Software Engineer' },
    { keywords: ['frontend', 'front-end', 'front end', 'react developer', 'ui developer'], role: 'Frontend Developer' },
    { keywords: ['backend', 'back-end', 'back end', 'server side'], role: 'Backend Developer' },
    { keywords: ['full stack', 'fullstack', 'full-stack'], role: 'Full Stack Developer' },
    { keywords: ['devops', 'site reliability', 'sre', 'platform engineer'], role: 'DevOps Engineer' },
    { keywords: ['product manager', 'product management', 'pm'], role: 'Product Manager' },
    { keywords: ['ux designer', 'ui/ux', 'user experience', 'product designer'], role: 'UX Designer' },
    { keywords: ['data analyst', 'business analyst', 'analytics'], role: 'Data Analyst' },
    { keywords: ['qa', 'quality assurance', 'test engineer', 'sdet', 'automation'], role: 'QA Engineer' },
    { keywords: ['mobile developer', 'ios developer', 'android developer', 'flutter', 'react native'], role: 'Mobile Developer' },
    { keywords: ['project manager', 'scrum master', 'agile coach'], role: 'Project Manager' },
    { keywords: ['cloud engineer', 'aws', 'azure', 'gcp', 'cloud architect'], role: 'Cloud Engineer' },
  ];
  
  let suggestedRole = '';
  for (const r of roles) {
    if (r.keywords.some(k => text.includes(k))) {
      suggestedRole = r.role;
      break;
    }
  }
  
  // If no role found, try to infer from skills
  if (!suggestedRole) {
    if (foundSkills.some(s => ['python', 'machine learning', 'ml', 'tensorflow', 'pytorch', 'pandas'].includes(s))) suggestedRole = 'Data Scientist';
    else if (foundSkills.some(s => ['react', 'angular', 'vue', 'html', 'css'].includes(s))) suggestedRole = 'Frontend Developer';
    else if (foundSkills.some(s => ['node', 'django', 'flask', 'spring', 'java'].includes(s))) suggestedRole = 'Backend Developer';
    else if (foundSkills.some(s => ['docker', 'kubernetes', 'terraform', 'jenkins'].includes(s))) suggestedRole = 'DevOps Engineer';
    else suggestedRole = 'Software Engineer';
  }
  
  return { suggestedRole, skills: foundSkills.slice(0, 10), experienceYears: years, experienceLevel: level };
}

function formatSalary(min: number | null, max: number | null, currency: string | null, period: string | null): string {
  if (!min && !max) return '';
  const curr = currency || 'USD';
  const per = period === 'YEAR' ? '/yr' : period === 'MONTH' ? '/mo' : period === 'HOUR' ? '/hr' : '';
  const formatNum = (n: number) => {
    if (curr === 'INR') {
      if (n >= 10000000) return '\u20B9' + (n / 10000000).toFixed(1) + 'Cr';
      if (n >= 100000) return '\u20B9' + (n / 100000).toFixed(1) + 'L';
      return '\u20B9' + (n / 1000).toFixed(0) + 'K';
    }
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
    return '$' + n;
  };
  if (min && max) return formatNum(min) + ' - ' + formatNum(max) + per;
  if (min) return formatNum(min) + '+' + per;
  if (max) return 'Up to ' + formatNum(max) + per;
  return '';
}

function buildDirectLinks(query: string, location: string) {
  const q = encodeURIComponent(query);
  const loc = encodeURIComponent(location || 'India');
  return [
    { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=' + q + '&location=' + loc, color: '#0A66C2' },
    { name: 'Naukri', url: 'https://www.naukri.com/' + query.toLowerCase().replace(/\s+/g, '-') + '-jobs' + (location ? '-in-' + location.toLowerCase().replace(/\s+/g, '-') : ''), color: '#4a90d9' },
    { name: 'Indeed', url: 'https://www.indeed.com/jobs?q=' + q + '&l=' + loc, color: '#2557a7' },
    { name: 'Glassdoor', url: 'https://www.glassdoor.com/Job/jobs.htm?sc.keyword=' + q + '&locT=C&locKeyword=' + loc, color: '#0caa41' },
    { name: 'Hirist', url: 'https://www.hirist.tech/search/' + q, color: '#f97316' },
    { name: 'Instahyre', url: 'https://www.instahyre.com/search-jobs/?search=' + q + '&location=' + loc, color: '#6366f1' },
  ];
}

async function fetchJSearchJobs(query: string, location: string, datePosted: string, remoteOnly: boolean, empType: string): Promise<JobResult[]> {
  try {
    const isIndianCity = INDIAN_CITIES.map(c => c.toLowerCase()).includes(location.trim().toLowerCase());
    const locationSuffix = location.trim() ? ' in ' + location.trim() + (isIndianCity ? ', India' : '') : '';
    const params = new URLSearchParams({
      query: query.trim() + locationSuffix,
      page: '1',
      num_pages: '2',
      date_posted: datePosted,
      remote_jobs_only: remoteOnly ? 'true' : 'false'
    });
    if (empType) params.set('employment_types', empType);
    const r = await fetch('https://jsearch.p.rapidapi.com/search?' + params, {
      headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'jsearch.p.rapidapi.com' }
    });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.data || []).map((j: any) => ({
      ...j,
      source_platform: detectPlatform(j.job_publisher, j.job_apply_link, j.apply_options)
    }));
  } catch { return []; }
}

async function fetchLinkedInJobs(query: string, location: string): Promise<JobResult[]> {
  const fetchPage = async (pageNum: string): Promise<any[]> => {
    try {
      const r = await fetch('https://linkedin-jobs-search.p.rapidapi.com/', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'linkedin-jobs-search.p.rapidapi.com'
        },
        body: JSON.stringify({
          search_terms: query.trim(),
          location: location.trim() || 'India',
          page: pageNum
        })
      });
      if (!r.ok) return [];
      const data = await r.json();
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  };

  try {
    const [p1, p2] = await Promise.all([fetchPage('1'), fetchPage('2')]);
    const all = [...p1, ...p2].slice(0, 20); // Limit to 20 results
    if (all.length === 0) return [];

    return all.map((j: any) => {
      const jobUrl = j.linkedin_job_url_cleaned || j.job_url || '';
      const idMatch = jobUrl.match(/view\/[^/]+-(\d+)/);
      return {
        job_id: 'linkedin_' + (idMatch ? idMatch[1] : Math.random().toString(36).slice(2)),
        job_title: j.job_title || '',
        employer_name: j.company_name || j.normalized_company_name || '',
        employer_logo: null,
        employer_website: j.linkedin_company_url_cleaned || j.company_url || null,
        job_publisher: 'LinkedIn',
        job_employment_type: '',
        job_description: j.full_text || 'View full description on LinkedIn',
        job_apply_link: jobUrl,
        job_city: j.job_location || '',
        job_state: '',
        job_country: j.job_location ? (j.job_location.includes('India') ? 'India' : '') : '',
        job_posted_at_datetime_utc: j.posted_date || '',
        job_min_salary: null,
        job_max_salary: null,
        job_salary_currency: null,
        job_salary_period: null,
        job_is_remote: (j.job_location || '').toLowerCase().includes('remote'),
        job_highlights: undefined,
        job_google_link: undefined,
        apply_options: undefined,
        source_platform: 'LinkedIn'
      };
    });
  } catch { return []; }
}

async function fetchIndeedJobs(query: string, location: string): Promise<JobResult[]> {
  try {
    const params = new URLSearchParams({
      query: query.trim(),
      location: location.trim() || 'India',
      page_id: '1'
    });
    const r = await fetch('https://indeed12.p.rapidapi.com/jobs/search?' + params, {
      headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'indeed12.p.rapidapi.com' }
    });
    if (!r.ok) return [];
    const data = await r.json();
    if (data.message) return []; // API error
    const hits = (data.hits || []).slice(0, 15); // Limit to 15 to save API calls
    return hits.map((j: any) => ({
      job_id: 'indeed_' + j.id,
      job_title: j.title || '',
      employer_name: j.company_name || '',
      employer_logo: null,
      employer_website: null,
      job_publisher: 'Indeed',
      job_employment_type: '',
      job_description: `${j.title} at ${j.company_name} - ${j.location}. Posted ${j.formatted_relative_time || 'recently'}.`,
      job_apply_link: j.link ? 'https://www.indeed.com' + j.link : 'https://www.indeed.com/viewjob?jk=' + j.id,
      job_city: j.location || '',
      job_state: '',
      job_country: j.locality === 'in' ? 'India' : j.locality === 'us' ? 'USA' : '',
      job_posted_at_datetime_utc: j.pub_date_ts_milli ? new Date(j.pub_date_ts_milli).toISOString() : '',
      job_min_salary: j.salary?.min || null,
      job_max_salary: j.salary?.max || null,
      job_salary_currency: j.locality === 'in' ? 'INR' : 'USD',
      job_salary_period: j.salary?.type === 'YEARLY' ? 'YEAR' : j.salary?.type === 'MONTHLY' ? 'MONTH' : null,
      job_is_remote: (j.location || '').toLowerCase().includes('remote'),
      job_highlights: undefined,
      job_google_link: undefined,
      apply_options: undefined,
      source_platform: 'Indeed'
    }));
  } catch { return []; }
}

async function fetchJobicyJobs(query: string): Promise<JobResult[]> {
  try {
    const r = await fetch('https://jobicy.com/api/v2/remote-jobs?count=20&tag=' + encodeURIComponent(query.trim().toLowerCase()));
    if (!r.ok) return [];
    const d = await r.json();
    return (d.jobs || []).map((j: any) => ({
      job_id: 'jobicy_' + (j.id || Math.random().toString(36).slice(2)),
      job_title: j.jobTitle || '',
      employer_name: j.companyName || '',
      employer_logo: j.companyLogo || null,
      employer_website: null,
      job_publisher: 'Jobicy',
      job_employment_type: (j.jobType || '').includes('full') ? 'FULLTIME' : (j.jobType || '').includes('contract') ? 'CONTRACTOR' : '',
      job_description: j.jobExcerpt || j.jobDescription || '',
      job_apply_link: j.url || '',
      job_city: j.jobGeo || '',
      job_state: '',
      job_country: j.jobGeo || '',
      job_posted_at_datetime_utc: j.pubDate || '',
      job_min_salary: j.annualSalaryMin ? parseInt(j.annualSalaryMin) : null,
      job_max_salary: j.annualSalaryMax ? parseInt(j.annualSalaryMax) : null,
      job_salary_currency: j.salaryCurrency || 'USD',
      job_salary_period: 'YEAR',
      job_is_remote: true,
      job_highlights: undefined,
      job_google_link: undefined,
      apply_options: undefined,
      source_platform: 'Jobicy'
    }));
  } catch { return []; }
}

async function fetchRemotiveJobs(query: string): Promise<JobResult[]> {
  try {
    const r = await fetch('https://remotive.com/api/remote-jobs?search=' + encodeURIComponent(query) + '&limit=20');
    if (!r.ok) return [];
    const d = await r.json();
    return (d.jobs || []).map((j: any) => ({
      job_id: 'remotive_' + j.id,
      job_title: j.title || '',
      employer_name: j.company_name || '',
      employer_logo: j.company_logo || null,
      employer_website: j.url || null,
      job_publisher: 'Remotive',
      job_employment_type: j.job_type === 'full_time' ? 'FULLTIME' : j.job_type === 'contract' ? 'CONTRACTOR' : j.job_type === 'part_time' ? 'PARTTIME' : j.job_type === 'internship' ? 'INTERN' : '',
      job_description: j.description ? j.description.replace(/<[^>]*>/g, '') : '',
      job_apply_link: j.url || '',
      job_city: '',
      job_state: '',
      job_country: j.candidate_required_location || 'Remote',
      job_posted_at_datetime_utc: j.publication_date || '',
      job_min_salary: j.salary ? parseInt(j.salary.replace(/[^0-9]/g, '')) || null : null,
      job_max_salary: null,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_is_remote: true,
      job_highlights: undefined,
      job_google_link: undefined,
      apply_options: undefined,
      source_platform: 'Remotive'
    }));
  } catch { return []; }
}

async function fetchArbeitnowJobs(query: string): Promise<JobResult[]> {
  try {
    const r = await fetch('https://www.arbeitnow.com/api/job-board-api?search=' + encodeURIComponent(query) + '&per_page=20');
    if (!r.ok) return [];
    const d = await r.json();
    return (d.data || []).map((j: any) => ({
      job_id: 'arbeitnow_' + j.slug,
      job_title: j.title || '',
      employer_name: j.company_name || '',
      employer_logo: null,
      employer_website: j.url || null,
      job_publisher: 'Arbeitnow',
      job_employment_type: '',
      job_description: j.description ? j.description.replace(/<[^>]*>/g, '') : '',
      job_apply_link: j.url || '',
      job_city: j.location || '',
      job_state: '',
      job_country: '',
      job_posted_at_datetime_utc: j.created_at ? new Date(j.created_at * 1000).toISOString() : '',
      job_min_salary: null,
      job_max_salary: null,
      job_salary_currency: null,
      job_salary_period: null,
      job_is_remote: j.remote || false,
      job_highlights: undefined,
      job_google_link: undefined,
      apply_options: undefined,
      source_platform: 'Arbeitnow'
    }));
  } catch { return []; }
}

function deduplicateJobs(jobs: JobResult[]): JobResult[] {
  const seen = new Map<string, JobResult>();
  for (const j of jobs) {
    const key = (j.job_title + '_' + j.employer_name).toLowerCase().replace(/\s+/g, '');
    if (!seen.has(key)) seen.set(key, j);
  }
  return [...seen.values()];
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
  const [sourceStats, setSourceStats] = useState<Record<string, number>>({});
  const searchCacheRef = useRef<{ query: string; results: JobResult[]; timestamp: number } | null>(null);
  const [savedJobs, setSavedJobs] = useState<Map<string, SavedJob>>(() => {
    try { const s = localStorage.getItem('helplyai_jobs_v2'); return s ? new Map(JSON.parse(s)) : new Map(); }
    catch { return new Map(); }
  });
  const [showSaved, setShowSaved] = useState(false);
  const [savedFilter, setSavedFilter] = useState<'all'|'saved'|'applied'|'ignored'>('all');
  const [userResume, setUserResume] = useState('');
  const [resumeProfile, setResumeProfile] = useState<ResumeProfile | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [apiStatus, setApiStatus] = useState<Record<string, 'ok' | 'fail' | 'pending'>>({});
  const locDebounce = useRef<NodeJS.Timeout | undefined>(undefined);
  const loadingMsgRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const isPremium = !planState.isFreeUser && !planState.isExpired;
  const limit = isPremium ? PREMIUM_RESULT_LIMIT : FREE_RESULT_LIMIT;

  useEffect(() => {
    if (user) supabase.from('interview_context').select('resume').eq('user_id', user.id).single().then(({ data }) => { 
      if (data?.resume) {
        setUserResume(data.resume);
        const profile = parseResume(data.resume);
        setResumeProfile(profile);
        if (!query && profile.suggestedRole) setQuery(profile.suggestedRole);
      }
    });
  }, [user]);

  useEffect(() => { localStorage.setItem('helplyai_jobs_v2', JSON.stringify([...savedJobs])); }, [savedJobs]);

  const searchLoc = useCallback((txt: string) => {
    if (txt.length < 1) { setLocSuggestions([]); return; }
    const t = txt.toLowerCase();
    const all = [...INDIAN_CITIES, ...GLOBAL_CITIES];
    const starts = all.filter(c => c.toLowerCase().startsWith(t));
    const contains = all.filter(c => c.toLowerCase().includes(t) && !c.toLowerCase().startsWith(t));
    const matches = [...starts, ...contains].slice(0, 10).map(city => {
      const isIndian = INDIAN_CITIES.map(c => c.toLowerCase()).includes(city.toLowerCase());
      return { city, country: isIndian ? 'India' : 'Global', displayName: city + ', ' + (isIndian ? 'India' : 'Global') };
    });
    setLocSuggestions(matches);
  }, []);

  const onLocChange = (v: string) => {
    setLocation(v);
    setShowLocDropdown(true);
    if (locDebounce.current) clearTimeout(locDebounce.current);
    locDebounce.current = setTimeout(() => searchLoc(v), 100);
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
    const searchKey = query.trim() + '_' + location.trim() + '_' + datePosted + '_' + remoteOnly + '_' + empType;
    const now = Date.now();

    if (!forceRefresh && searchCacheRef.current && searchCacheRef.current.query === searchKey && (now - searchCacheRef.current.timestamp) < 300000) {
      const cached = searchCacheRef.current.results;
      setAllJobs(cached);
      setTotal(cached.length);
      const start = (p - 1) * limit;
      setJobs(cached.slice(start, start + limit));
      setPage(p);
      setSearched(true);
      const stats: Record<string, number> = {};
      cached.forEach(j => { const s = j.source_platform || 'Other'; stats[s] = (stats[s] || 0) + 1; });
      setSourceStats(stats);
      return;
    }

    setLoading(true); setError(''); setSearched(true); setPage(p);

    const messages = [
      'Searching LinkedIn, Indeed & Glassdoor...',
      'Scanning Naukri, ZipRecruiter & Monster...',
      'Finding jobs from Remotive & Arbeitnow...',
      'Analyzing thousands of job listings...',
      'Matching the best opportunities for you...',
      'Curating results from 10+ platforms...',
      'Almost there, gathering final results...'
    ];
    let mi = 0;
    setLoadingMessage(messages[0]);
    loadingMsgRef.current = setInterval(() => { mi = (mi + 1) % messages.length; setLoadingMessage(messages[mi]); }, 2000);

    try {
      setApiStatus({ JSearch: 'pending', LinkedIn: 'pending', Indeed: 'pending', Jobicy: 'pending', Remotive: 'pending', Arbeitnow: 'pending' });

      const [jsearchResults, linkedinResults, indeedResults, jobicyResults, remotiveResults, arbeitnowResults] = await Promise.allSettled([
        fetchJSearchJobs(query, location, datePosted, remoteOnly, empType),
        fetchLinkedInJobs(query, location),
        fetchIndeedJobs(query, location),
        fetchJobicyJobs(query),
        fetchRemotiveJobs(query),
        fetchArbeitnowJobs(query)
      ]);

      let combined: JobResult[] = [];
      const status: Record<string, 'ok' | 'fail'> = {};

      const addResults = (name: string, result: PromiseSettledResult<JobResult[]>, condition = true) => {
        if (result.status === 'fulfilled' && result.value.length > 0 && condition) {
          combined.push(...result.value);
          status[name] = 'ok';
        } else {
          status[name] = result.status === 'fulfilled' && result.value.length === 0 ? 'ok' : 'fail';
        }
      };

      addResults('JSearch', jsearchResults);
      addResults('LinkedIn', linkedinResults);
      addResults('Indeed', indeedResults);
      addResults('Jobicy', jobicyResults, !location || remoteOnly);
      addResults('Remotive', remotiveResults, !location || remoteOnly);
      addResults('Arbeitnow', arbeitnowResults);
      setApiStatus(status);

      if (combined.length === 0) throw new Error('No jobs found. Try different keywords or location.');

      const deduped = deduplicateJobs(combined);

      const stats: Record<string, number> = {};
      deduped.forEach(j => { const s = j.source_platform || 'Other'; stats[s] = (stats[s] || 0) + 1; });
      setSourceStats(stats);

      searchCacheRef.current = { query: searchKey, results: deduped, timestamp: now };

      setAllJobs(deduped);
      setTotal(deduped.length);
      const start = (p - 1) * limit;
      setJobs(deduped.slice(start, start + limit));
      setModalJob(null);
    } catch (e: any) {
      setError(e.message);
      setJobs([]); setAllJobs([]);
    } finally {
      if (loadingMsgRef.current) { clearInterval(loadingMsgRef.current); loadingMsgRef.current = undefined; }
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
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const PlatformBadge = ({ platform }: { platform: string }) => {
    const color = PLATFORM_COLORS[platform] || '#6b7280';
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, color: color, background: color + '12', border: '1px solid ' + color + '25', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
        {platform}
      </span>
    );
  };

  const JobCard = ({ job, locked = false }: { job: JobResult | SavedJob; locked?: boolean }) => {
    const saved = savedJobs.get(job.job_id);
    const match = userResume ? ('matchScore' in job && job.matchScore) || calcMatch(job.job_description, userResume) : null;
    const salary = formatSalary(job.job_min_salary, job.job_max_salary, job.job_salary_currency, job.job_salary_period);
    const platform = job.source_platform || detectPlatform(job.job_publisher, job.job_apply_link, job.apply_options);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f9fafb', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {job.employer_logo ? <img src={job.employer_logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => (e.target as HTMLImageElement).style.display = 'none'} /> : <Building2 size={22} color="#9ca3af" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.job_title}</h3>
              <p style={{ color: '#6b7280', fontSize: 12, fontWeight: 500, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.employer_name}</p>
            </div>
          </div>
          <PlatformBadge platform={platform} />
        </div>

        {salary && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 10 }}>
            <DollarSign size={16} color="#111827" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{salary}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          {(job.job_city || job.job_country) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 7px', borderRadius: 5, fontSize: 10, background: '#f3f4f6', color: '#6b7280' }}>
              <MapPin size={10} color="#6b7280" />
              <span>{[job.job_city, job.job_state, job.job_country].filter(Boolean).join(', ').slice(0, 35)}</span>
            </div>
          )}
          {job.job_is_remote && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 7px', borderRadius: 5, fontSize: 10, background: '#f3f4f6', color: '#6b7280', fontWeight: 600 }}>
              <Globe size={10} color="#6b7280" />Remote
            </div>
          )}
          {job.job_employment_type && (
            <div style={{ padding: '3px 7px', borderRadius: 5, fontSize: 10, background: '#f3f4f6', color: '#6b7280', fontWeight: 500 }}>
              {EMPLOYMENT_TYPES[job.job_employment_type] || job.job_employment_type}
            </div>
          )}
          {job.job_posted_at_datetime_utc && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 7px', borderRadius: 5, fontSize: 10, background: '#f3f4f6', color: '#6b7280' }}>
              <Clock size={10} color="#6b7280" />{timeAgo(job.job_posted_at_datetime_utc)}
            </div>
          )}
        </div>

        <p style={{ color: '#6b7280', fontSize: 11, lineHeight: 1.5, margin: '0 0 10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{job.job_description}</p>

        {match !== null && match > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 10 }}>
            <TrendingUp size={14} color="#6b7280" />
            <div style={{ flex: 1 }}>
              <div style={{ height: 5, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: match + '%', height: '100%', background: '#111827', transition: 'width 0.3s' }} />
              </div>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{match}%</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
          <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.stopPropagation(); updateStatus(job, 'applied'); }}
            style={{ flex: 1, padding: '9px', borderRadius: 8, background: '#111827', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, textDecoration: 'none' }}>
            Apply on {platform} <ExternalLink size={12} />
          </a>
          <button onClick={(e) => { e.stopPropagation(); setModalJob(job); }}
            style={{ padding: '9px 14px', borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Eye size={13} /> View
          </button>
        </div>

        <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
          <button onClick={(e) => { e.stopPropagation(); updateStatus(job, 'saved'); }} style={{ flex: 1, padding: '6px', borderRadius: 6, background: saved?.status === 'saved' ? '#111827' : '#f9fafb', border: '1px solid ' + (saved?.status === 'saved' ? '#111827' : '#e5e7eb'), color: saved?.status === 'saved' ? '#fff' : '#6b7280', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <Bookmark size={12} fill={saved?.status === 'saved' ? '#fff' : 'none'} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); updateStatus(job, 'applied'); }} style={{ flex: 1, padding: '6px', borderRadius: 6, background: saved?.status === 'applied' ? '#111827' : '#f9fafb', border: '1px solid ' + (saved?.status === 'applied' ? '#111827' : '#e5e7eb'), color: saved?.status === 'applied' ? '#fff' : '#6b7280', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <CheckCircle2 size={12} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); updateStatus(job, 'ignored'); }} style={{ flex: 1, padding: '6px', borderRadius: 6, background: saved?.status === 'ignored' ? '#111827' : '#f9fafb', border: '1px solid ' + (saved?.status === 'ignored' ? '#111827' : '#e5e7eb'), color: saved?.status === 'ignored' ? '#fff' : '#9ca3af', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <X size={12} />
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
            <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>Aggregating jobs from LinkedIn, Indeed, Glassdoor, Naukri, Remotive & more</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 14, padding: '10px 16px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Bookmark size={14} color="#6b7280" /><span style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{savedCount}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><CheckCircle2 size={14} color="#6b7280" /><span style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{appliedCount}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><X size={14} color="#6b7280" /><span style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{ignoredCount}</span></div>
          </div>
          <button onClick={() => setShowSaved(!showSaved)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e5e7eb', background: showSaved ? '#111827' : '#fff', color: showSaved ? '#fff' : '#111827', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bookmark size={14} /> {showSaved ? 'Back to Search' : 'Saved Jobs'}
          </button>
        </div>
      </div>

      {!isPremium && !showSaved && (
        <div style={{ marginBottom: 20, padding: '12px 20px', borderRadius: 12, background: '#f9fafb', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#111827', fontSize: 13, fontWeight: 500 }}>Free plan: <strong>{FREE_RESULT_LIMIT} results</strong>. Upgrade for {PREMIUM_RESULT_LIMIT} jobs/page with pagination.</span>
          <button onClick={() => navigate('/settings/billing')} style={{ padding: '8px 20px', borderRadius: 8, background: '#111827', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Upgrade</button>
        </div>
      )}

      {!showSaved && (
        <div style={{ marginBottom: 20, padding: '16px 20px', borderRadius: 12, background: resumeProfile ? '#f0fdf4' : '#fffbeb', border: '1px solid ' + (resumeProfile ? '#bbf7d0' : '#fde68a') }}>
          {resumeProfile ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{resumeProfile.suggestedRole}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 6, background: '#dcfce7', color: '#166534', fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>{resumeProfile.experienceLevel}</span>
                    {resumeProfile.experienceYears > 0 && <span style={{ fontSize: 12, color: '#6b7280' }}>{resumeProfile.experienceYears} yrs exp</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {resumeProfile.skills.slice(0, 6).map(s => (
                      <span key={s} style={{ padding: '2px 6px', borderRadius: 4, background: '#fff', border: '1px solid #e5e7eb', fontSize: 10, color: '#6b7280' }}>{s}</span>
                    ))}
                    {resumeProfile.skills.length > 6 && <span style={{ fontSize: 10, color: '#9ca3af' }}>+{resumeProfile.skills.length - 6} more</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => setShowResumeModal(true)} style={{ padding: '8px 16px', borderRadius: 8, background: '#fff', border: '1px solid #e5e7eb', color: '#111827', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={14} /> Update Resume
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Sparkles size={20} color="#f59e0b" />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Get personalized job matches</p>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Paste your resume to auto-detect role, skills & experience level</p>
                </div>
              </div>
              <button onClick={() => setShowResumeModal(true)} style={{ padding: '10px 20px', borderRadius: 8, background: '#111827', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={14} /> Paste Resume
              </button>
            </div>
          )}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {filteredSaved.map(job => <JobCard key={job.job_id} job={job} />)}
            </div>
          )}
        </div>
      ) : (
        <>
          <form onSubmit={onSubmit} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 2, position: 'relative' }}>
                <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="text" placeholder="Job title, role, or keyword..." value={query} onChange={e => setQuery(e.target.value)}
                  style={{ width: '100%', padding: '14px 16px 14px 46px', borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 14, color: '#111827', outline: 'none', background: '#fff', fontWeight: 500, boxSizing: 'border-box' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#111827'} onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'} />
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <MapPin size={18} color="#9ca3af" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="text" placeholder="City or location..." value={location} onChange={e => onLocChange(e.target.value)}
                  onFocus={e => { setShowLocDropdown(true); e.currentTarget.style.borderColor = '#111827'; if (location.length >= 1) searchLoc(location); }}
                  onBlur={e => { setTimeout(() => setShowLocDropdown(false), 200); e.currentTarget.style.borderColor = '#e5e7eb'; }}
                  style={{ width: '100%', padding: '14px 16px 14px 46px', borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 14, color: '#111827', outline: 'none', background: '#fff', fontWeight: 500, boxSizing: 'border-box' }} />
                {showLocDropdown && locSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, marginTop: 4, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden', maxHeight: 280, overflowY: 'auto' }}>
                    {locSuggestions.map((s, i) => (
                      <div key={i} onClick={() => selectLoc(s)} style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 10, borderBottom: i < locSuggestions.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                        <MapPin size={14} color="#9ca3af" />
                        <span style={{ fontWeight: 500 }}>{s.city}</span>
                        <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>{s.country}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" disabled={loading || !query.trim()} style={{ padding: '14px 32px', borderRadius: 12, background: loading || !query.trim() ? '#d1d5db' : '#111827', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading || !query.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                <Search size={18} />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <Filter size={14} color="#6b7280" />
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: remoteOnly ? '#111827' : '#f9fafb', border: '1px solid ' + (remoteOnly ? '#111827' : '#e5e7eb'), cursor: 'pointer', fontSize: 12, color: remoteOnly ? '#fff' : '#6b7280', fontWeight: 600 }}>
                <input type="checkbox" checked={remoteOnly} onChange={e => setRemoteOnly(e.target.checked)} style={{ accentColor: '#111827', width: 14, height: 14 }} />
                <Globe size={13} /> Remote Only
              </label>
              <select value={datePosted} onChange={e => setDatePosted(e.target.value)} style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 12, color: '#111827', cursor: 'pointer', fontWeight: 500 }}>
                <option value="all">Any time</option><option value="today">Today</option><option value="3days">Last 3 days</option><option value="week">This week</option><option value="month">This month</option>
              </select>
              <select value={empType} onChange={e => setEmpType(e.target.value)} style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 12, color: '#111827', cursor: 'pointer', fontWeight: 500 }}>
                <option value="">All types</option><option value="FULLTIME">Full-time</option><option value="PARTTIME">Part-time</option><option value="CONTRACTOR">Contract</option><option value="INTERN">Internship</option>
              </select>
            </div>
          </form>

          {!searched && (
            <div style={{ marginBottom: 28 }}>
              <p style={{ color: '#9ca3af', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Popular Roles</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {POPULAR_ROLES.map(r => (
                  <button key={r} onClick={() => { setQuery(r); setTimeout(() => search(1), 0); }}
                    style={{ padding: '8px 16px', borderRadius: 20, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#111827', e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#f9fafb', e.currentTarget.style.color = '#111827')}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: 16, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <X size={16} /> {error}
            </div>
          )}

          {loading && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', background: '#f9fafb', borderRadius: 16, border: '1px solid #e5e7eb', marginBottom: 24 }}>
                <div style={{ position: 'relative', width: 72, height: 72, marginBottom: 20 }}>
                  <div style={{ position: 'absolute', inset: 0, border: '4px solid #e5e7eb', borderRadius: '50%' }} />
                  <div style={{ position: 'absolute', inset: 0, border: '4px solid #111827', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <div style={{ position: 'absolute', inset: '50%', transform: 'translate(-50%, -50%)', width: 36, height: 36, background: '#111827', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={18} color="#fff" />
                  </div>
                </div>
                <h3 style={{ color: '#111827', fontSize: 18, fontWeight: 700, margin: '0 0 6px', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>{loadingMessage}</h3>
                <p style={{ color: '#6b7280', fontSize: 13, margin: 0, textAlign: 'center' }}>Aggregating from 10+ job platforms</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#111827', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0s' }} />
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#111827', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.16s' }} />
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#111827', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.32s' }} />
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {['LinkedIn', 'Indeed', 'Glassdoor', 'Jobicy', 'Remotive', 'Arbeitnow'].map(p => (
                    <span key={p} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600, color: PLATFORM_COLORS[p] || '#6b7280', background: (PLATFORM_COLORS[p] || '#6b7280') + '12', border: '1px solid ' + (PLATFORM_COLORS[p] || '#6b7280') + '25' }}>{p}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, opacity: 0.2 }}>
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} style={{ padding: 20, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff' }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f3f4f6' }}/>
                      <div style={{ flex: 1 }}>
                        <div style={{ width: '70%', height: 14, background: '#f3f4f6', borderRadius: 6, marginBottom: 8 }}/>
                        <div style={{ width: '50%', height: 12, background: '#f3f4f6', borderRadius: 6 }}/>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: 50, background: '#f3f4f6', borderRadius: 8 }}/>
                  </div>
                ))}
              </div>
            </>
          )}

          {searched && !loading && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <p style={{ color: '#6b7280', fontSize: 13, fontWeight: 500, margin: 0 }}>
                  {jobs.length > 0 ? (
                    <>Found <strong style={{ color: '#111827' }}>{total}</strong> jobs from {Object.keys(sourceStats).length} platforms {!isPremium && total > FREE_RESULT_LIMIT && <span style={{ color: '#111827', fontWeight: 600 }}>| Upgrade for all</span>}</>
                  ) : 'No jobs found. Try different keywords.'}
                </p>
                {Object.keys(sourceStats).length > 0 && (
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {Object.entries(sourceStats).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([platform, count]) => (
                      <span key={platform} style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, color: PLATFORM_COLORS[platform] || '#6b7280', background: (PLATFORM_COLORS[platform] || '#6b7280') + '12', border: '1px solid ' + (PLATFORM_COLORS[platform] || '#6b7280') + '25' }}>
                        {platform} ({count})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {searched && Object.values(apiStatus).some(s => s === 'fail') && (
                <div style={{ marginBottom: 16, padding: '10px 16px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#92400e', fontWeight: 500 }}>Enable more sources:</span>
                  {Object.entries(apiStatus).filter(([, s]) => s === 'fail').map(([name]) => {
                    const urls: Record<string, string> = {
                      LinkedIn: 'https://rapidapi.com/jaypat87/api/linkedin-jobs-search',
                      Indeed: 'https://rapidapi.com/indeed12-indeed12-default/api/indeed12',
                    };
                    return urls[name] ? (
                      <a key={name} href={urls[name]} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, background: '#fff', border: '1px solid #fde68a', color: PLATFORM_COLORS[name] || '#92400e', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                        Subscribe to {name} API (free) <ExternalLink size={9} />
                      </a>
                    ) : null;
                  })}
                </div>
              )}

              {searched && query && (
                <div style={{ marginBottom: 20, padding: '12px 16px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Also search directly on</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {buildDirectLinks(query, location).map(link => (
                      <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: '#fff', border: '1px solid #e5e7eb', color: link.color, fontSize: 11, fontWeight: 600, textDecoration: 'none', transition: 'all 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = link.color, e.currentTarget.style.color = '#fff')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#fff', e.currentTarget.style.color = link.color)}>
                        {link.name} <ExternalLink size={10} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginBottom: 24 }}>
                {jobs.map((job, i) => <JobCard key={job.job_id} job={job} locked={!isPremium && i >= FREE_RESULT_LIMIT} />)}
              </div>

              {isPremium && total > limit && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 28 }}>
                  <button onClick={() => changePage(page - 1)} disabled={page <= 1} style={{ padding: '10px 22px', borderRadius: 10, background: page <= 1 ? '#f3f4f6' : '#fff', border: '1px solid #e5e7eb', color: page <= 1 ? '#d1d5db' : '#111827', fontSize: 13, fontWeight: 600, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}>Previous</button>
                  <span style={{ padding: '10px 18px', color: '#6b7280', fontSize: 13, fontWeight: 600 }}>Page {page} of {totalPages}</span>
                  <button onClick={() => changePage(page + 1)} disabled={page >= totalPages} style={{ padding: '10px 22px', borderRadius: 10, background: page >= totalPages ? '#f3f4f6' : '#fff', border: '1px solid #e5e7eb', color: page >= totalPages ? '#d1d5db' : '#111827', fontSize: 13, fontWeight: 600, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
                </div>
              )}

              {!isPremium && total > FREE_RESULT_LIMIT && (
                <div style={{ marginTop: 28, padding: 36, borderRadius: 16, background: '#f9fafb', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Briefcase size={28} color="#fff" />
                  </div>
                  <h3 style={{ color: '#111827', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Unlock All {total} Jobs</h3>
                  <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20, maxWidth: 480, margin: '0 auto 16px' }}>{PREMIUM_RESULT_LIMIT} jobs per page with pagination, save jobs, track applications.</p>
                  <button onClick={() => navigate('/settings/billing')} style={{ padding: '12px 36px', borderRadius: 12, background: '#111827', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Upgrade to Premium</button>
                </div>
              )}
            </>
          )}

          {!searched && !loading && (
            <div style={{ textAlign: 'center', padding: 70, background: '#f9fafb', borderRadius: 16, border: '1px solid #e5e7eb' }}>
              <Search size={52} color="#d1d5db" style={{ margin: '0 auto 18px' }} />
              <h3 style={{ color: '#111827', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Search Millions of Jobs</h3>
              <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 20px' }}>Aggregating jobs from LinkedIn, Indeed, Glassdoor, Naukri, Remotive & more</p>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                {Object.entries(PLATFORM_COLORS).slice(0, 8).map(([p, c]) => (
                  <span key={p} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600, color: c, background: c + '12', border: '1px solid ' + c + '25' }}>{p}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {modalJob && (
        <div onClick={() => setModalJob(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, maxWidth: 800, width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: 24, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>{modalJob.job_title}</h2>
                  <PlatformBadge platform={modalJob.source_platform || detectPlatform(modalJob.job_publisher, modalJob.job_apply_link, modalJob.apply_options)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  {modalJob.employer_logo && <img src={modalJob.employer_logo} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'contain' }} />}
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#6b7280' }}>{modalJob.employer_name}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {formatSalary(modalJob.job_min_salary, modalJob.job_max_salary, modalJob.job_salary_currency, modalJob.job_salary_period) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                      <DollarSign size={14} color="#111827" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{formatSalary(modalJob.job_min_salary, modalJob.job_max_salary, modalJob.job_salary_currency, modalJob.job_salary_period)}</span>
                    </div>
                  )}
                  {(modalJob.job_city || modalJob.job_country) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: '#f3f4f6', borderRadius: 8 }}>
                      <MapPin size={13} color="#6b7280" />
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{[modalJob.job_city, modalJob.job_state, modalJob.job_country].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  {modalJob.job_is_remote && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: '#f3f4f6', borderRadius: 8 }}>
                      <Globe size={13} color="#6b7280" /><span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Remote</span>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => setModalJob(null)} style={{ padding: 8, borderRadius: 8, background: '#f3f4f6', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#6b7280" />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              <p style={{ color: '#374151', fontSize: 13, lineHeight: 1.7, marginBottom: 24, whiteSpace: 'pre-wrap' }}>{modalJob.job_description}</p>

              {modalJob.job_highlights && (
                <div style={{ marginBottom: 24 }}>
                  {modalJob.job_highlights.Qualifications && (
                    <div style={{ marginBottom: 14 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Qualifications</h4>
                      <ul style={{ margin: 0, paddingLeft: 18, color: '#6b7280', fontSize: 12, lineHeight: 1.6 }}>
                        {modalJob.job_highlights.Qualifications.map((q, i) => <li key={i}>{q}</li>)}
                      </ul>
                    </div>
                  )}
                  {modalJob.job_highlights.Responsibilities && (
                    <div style={{ marginBottom: 14 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Responsibilities</h4>
                      <ul style={{ margin: 0, paddingLeft: 18, color: '#6b7280', fontSize: 12, lineHeight: 1.6 }}>
                        {modalJob.job_highlights.Responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                  {modalJob.job_highlights.Benefits && (
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Benefits</h4>
                      <ul style={{ margin: 0, paddingLeft: 18, color: '#6b7280', fontSize: 12, lineHeight: 1.6 }}>
                        {modalJob.job_highlights.Benefits.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {modalJob.apply_options && modalJob.apply_options.length > 1 && (
                <div style={{ marginBottom: 24, padding: 14, background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Apply on Multiple Platforms</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {modalJob.apply_options.map((opt, i) => (
                      <a key={i} href={opt.apply_link} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: '#fff', border: '1px solid #e5e7eb', color: PLATFORM_COLORS[detectPlatform(opt.publisher, opt.apply_link, undefined)] || '#111827', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                        {opt.publisher} {opt.is_direct && '(Direct)'} <ExternalLink size={10} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <a href={modalJob.job_apply_link} target="_blank" rel="noopener noreferrer" onClick={() => updateStatus(modalJob, 'applied')}
                  style={{ flex: 1, padding: '12px', borderRadius: 10, background: '#111827', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  Apply on {modalJob.source_platform || detectPlatform(modalJob.job_publisher, modalJob.job_apply_link, modalJob.apply_options)} <ExternalLink size={14} />
                </a>
                {modalJob.job_google_link && (
                  <a href={modalJob.job_google_link} target="_blank" rel="noopener noreferrer"
                    style={{ padding: '12px 18px', borderRadius: 10, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827', fontSize: 13, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    Google <ExternalLink size={14} />
                  </a>
                )}
                <button onClick={() => navigator.clipboard.writeText(modalJob.job_apply_link)} style={{ padding: '12px 16px', borderRadius: 10, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#6b7280', cursor: 'pointer' }}>
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResumeModal && (
        <div onClick={() => setShowResumeModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, maxWidth: 600, width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: 24, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Paste Your Resume</h2>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>We'll auto-detect your role, skills & experience level</p>
              </div>
              <button onClick={() => setShowResumeModal(false)} style={{ padding: 8, borderRadius: 8, background: '#f3f4f6', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#6b7280" />
              </button>
            </div>
            <div style={{ padding: 24 }}>
              <textarea
                placeholder="Paste your resume text here...&#10;&#10;Example:&#10;John Doe - Senior Software Engineer&#10;5+ years of experience in Python, React, AWS&#10;Skills: Python, JavaScript, React, Node.js, AWS, Docker..."
                value={userResume}
                onChange={e => setUserResume(e.target.value)}
                style={{ width: '100%', height: 250, padding: 16, borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 13, color: '#111827', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
                onFocus={e => e.currentTarget.style.borderColor = '#111827'}
                onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
              {userResume && (
                <div style={{ marginTop: 16, padding: 16, background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Preview</p>
                  {(() => {
                    const preview = parseResume(userResume);
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Detected Role:</span>
                          <span style={{ padding: '3px 10px', borderRadius: 6, background: '#111827', color: '#fff', fontSize: 12, fontWeight: 600 }}>{preview.suggestedRole}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Experience:</span>
                          <span style={{ padding: '3px 10px', borderRadius: 6, background: '#dcfce7', color: '#166534', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{preview.experienceLevel}</span>
                          {preview.experienceYears > 0 && <span style={{ fontSize: 12, color: '#6b7280' }}>({preview.experienceYears} years)</span>}
                        </div>
                        {preview.skills.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>Skills:</span>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {preview.skills.map(s => (
                                <span key={s} style={{ padding: '2px 8px', borderRadius: 4, background: '#fff', border: '1px solid #e5e7eb', fontSize: 11, color: '#6b7280' }}>{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button
                  onClick={() => {
                    if (userResume) {
                      const profile = parseResume(userResume);
                      setResumeProfile(profile);
                      setQuery(profile.suggestedRole);
                      setShowResumeModal(false);
                      // Save to Supabase if user is logged in
                      if (user) {
                        supabase.from('interview_context').upsert({ user_id: user.id, resume: userResume }, { onConflict: 'user_id' });
                      }
                    }
                  }}
                  disabled={!userResume}
                  style={{ flex: 1, padding: '12px', borderRadius: 10, background: userResume ? '#111827' : '#e5e7eb', border: 'none', color: userResume ? '#fff' : '#9ca3af', fontSize: 14, fontWeight: 600, cursor: userResume ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Sparkles size={16} /> Find Matching Jobs
                </button>
                <button
                  onClick={() => { setUserResume(''); setResumeProfile(null); }}
                  style={{ padding: '12px 20px', borderRadius: 10, background: '#f9fafb', border: '1px solid #e5e7eb', color: '#6b7280', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{'\
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }\
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }\
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }\
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }\
      '}</style>
    </div>
  );
}
