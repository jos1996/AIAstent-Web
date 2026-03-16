import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import * as pdfjsLib from 'pdfjs-dist';

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ExtractedResume {
  name: string;
  email: string;
  phone: string;
  experience: string[];
  skills: string[];
  education: string[];
  certifications: string[];
  projects: string[];
  companies: string[];
}

interface ExtractedJD {
  title: string;
  company: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
}

interface ProfileData {
  full_name: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  location: string;
  created_at: string;
}

interface Stats {
  totalChats: number;
  totalScreenAnalyses: number;
  totalInterviews: number;
  totalGenerations: number;
}

interface HistoryItem {
  id: string;
  type: string;
  mode: string;
  query: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<Stats>({ totalChats: 0, totalScreenAnalyses: 0, totalInterviews: 0, totalGenerations: 0 });
  const [recentActivity, setRecentActivity] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'windows' | null>(null);
  
  // Initial Setup - JD/Resume
  const [showSetup, setShowSetup] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [savingSetup, setSavingSetup] = useState(false);
  const [setupSaved, setSetupSaved] = useState(false);
  const [extractedResume, setExtractedResume] = useState<ExtractedResume | null>(null);
  const [extractedJD, setExtractedJD] = useState<ExtractedJD | null>(null);
  const [parsingResume, setParsingResume] = useState(false);
  const [parsingJD, setParsingJD] = useState(false);
  // Toggle preferences for answer generation
  const [useJD, setUseJD] = useState(true);
  const [useResume, setUseResume] = useState(true);

  const downloadLinks = {
    macAppleSilicon: 'https://beeptalk.s3.eu-north-1.amazonaws.com/HelplyAI-Notarized-aarch64+(2).dmg',
    macIntel: 'https://beeptalk.s3.eu-north-1.amazonaws.com/HelplyAI-Notarized-x64.dmg',
    windowsMSI: 'https://beeptalk.s3.eu-north-1.amazonaws.com/windows-msi+(7)+(1).zip',
    windowsNSIS: 'https://beeptalk.s3.eu-north-1.amazonaws.com/windows-nsis+(3)+(1).zip',
  };

  const handleDirectDownload = (url: string) => {
    window.open(url, '_blank');
    setShowDownloadModal(false);
  };

  const handleDownloadClick = (platform: 'ios' | 'windows') => {
    setSelectedPlatform(platform);
    setShowDownloadModal(true);
  };

  useEffect(() => {
    if (user) {
      loadProfile();
      loadDashboard();
      loadInterviewContext();
    }
  }, [user, filterType]);

  const loadInterviewContext = async () => {
    const { data } = await supabase
      .from('interview_context')
      .select('*')
      .eq('user_id', user!.id)
      .single();
    if (data) {
      setJobDescription(data.job_description || '');
      setResume(data.resume || '');
      setTargetRole(data.target_role || '');
      setCompanyName(data.company_name || '');
      setUseJD(data.use_jd !== false);
      setUseResume(data.use_resume !== false);
      setSetupSaved(true);
    }
  };

  const saveInterviewContext = async () => {
    if (!jobDescription.trim() && !resume.trim()) {
      alert('Please enter at least a Job Description or Resume');
      return;
    }
    setSavingSetup(true);
    try {
      const { error } = await supabase
        .from('interview_context')
        .upsert({
          user_id: user!.id,
          job_description: jobDescription.trim(),
          resume: resume.trim(),
          target_role: targetRole.trim(),
          company_name: companyName.trim(),
          use_jd: useJD,
          use_resume: useResume,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      if (error) throw error;
      setSetupSaved(true);
      setShowSetup(false);
      alert('Interview context saved! The chatbot will now use this information for personalized answers.');
    } catch (err: any) {
      console.error('Save error:', err);
      alert('Failed to save: ' + (err.message || 'Unknown error'));
    }
    setSavingSetup(false);
  };

  // Extract text from PDF file
  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText.trim();
  };

  // Parse resume text to extract structured data
  const parseResumeText = (text: string): ExtractedResume => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const extracted: ExtractedResume = {
      name: '', email: '', phone: '',
      experience: [], skills: [], education: [],
      certifications: [], projects: [], companies: []
    };

    // Extract email
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) extracted.email = emailMatch[0];

    // Extract phone
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) extracted.phone = phoneMatch[0];

    // Extract name (usually first line or before email)
    const firstLine = lines[0];
    if (firstLine && !firstLine.includes('@') && firstLine.length < 50) {
      extracted.name = firstLine;
    }

    // Extract sections
    let currentSection = '';
    const sectionKeywords: Record<string, keyof ExtractedResume> = {
      'experience': 'experience', 'work experience': 'experience', 'employment': 'experience', 'work history': 'experience',
      'skills': 'skills', 'technical skills': 'skills', 'core competencies': 'skills', 'technologies': 'skills',
      'education': 'education', 'academic': 'education', 'qualification': 'education',
      'certification': 'certifications', 'certifications': 'certifications', 'licenses': 'certifications',
      'project': 'projects', 'projects': 'projects', 'key projects': 'projects'
    };

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      // Check if this is a section header
      for (const [keyword, section] of Object.entries(sectionKeywords)) {
        if (lowerLine.includes(keyword) && line.length < 40) {
          currentSection = section;
          break;
        }
      }
      // Add content to current section
      if (currentSection && line.length > 10 && !Object.keys(sectionKeywords).some(k => lowerLine.includes(k))) {
        const arr = extracted[currentSection as keyof ExtractedResume];
        if (Array.isArray(arr) && arr.length < 10) {
          (arr as string[]).push(line);
        }
      }
      // Extract company names (common patterns)
      const companyPatterns = [/at\s+([A-Z][A-Za-z\s&]+)/g, /([A-Z][A-Za-z\s&]+)\s*[-–]\s*\d{4}/g];
      for (const pattern of companyPatterns) {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          if (match[1] && !extracted.companies.includes(match[1].trim())) {
            extracted.companies.push(match[1].trim());
          }
        }
      }
    }

    // Extract skills from comma-separated lists
    const skillsMatch = text.match(/skills?[:\s]+([^.]+)/i);
    if (skillsMatch && extracted.skills.length === 0) {
      extracted.skills = skillsMatch[1].split(/[,;]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 30).slice(0, 15);
    }

    return extracted;
  };

  // Parse JD text to extract structured data
  const parseJDText = (text: string): ExtractedJD => {
    const extracted: ExtractedJD = {
      title: '', company: '',
      requirements: [], responsibilities: [], skills: []
    };

    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    // Extract job title (usually first line or after "Position:")
    const titleMatch = text.match(/(?:position|title|role)[:\s]+([^\n]+)/i) || 
                       text.match(/^([A-Za-z\s]+(?:Engineer|Developer|Manager|Designer|Analyst|Lead|Director|Specialist))/im);
    if (titleMatch) extracted.title = titleMatch[1].trim();
    else if (lines[0] && lines[0].length < 60) extracted.title = lines[0];

    // Extract company
    const companyMatch = text.match(/(?:company|organization|employer)[:\s]+([^\n]+)/i) ||
                         text.match(/(?:at|with)\s+([A-Z][A-Za-z\s&]+)/);
    if (companyMatch) extracted.company = companyMatch[1].trim();

    // Extract sections
    let currentSection = '';
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('requirement') || lowerLine.includes('qualification')) {
        currentSection = 'requirements';
      } else if (lowerLine.includes('responsibilit') || lowerLine.includes('duties')) {
        currentSection = 'responsibilities';
      } else if (lowerLine.includes('skill') || lowerLine.includes('technolog')) {
        currentSection = 'skills';
      } else if (currentSection && line.length > 10) {
        const arr = extracted[currentSection as keyof typeof extracted];
        if (Array.isArray(arr) && arr.length < 10) {
          arr.push(line.replace(/^[-•*]\s*/, ''));
        }
      }
    }

    return extracted;
  };

  // Handle file upload for Resume
  const handleResumeUpload = async (file: File) => {
    setParsingResume(true);
    try {
      let text = '';
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else {
        text = await file.text();
      }
      setResume(text);
      const parsed = parseResumeText(text);
      setExtractedResume(parsed);
      // Auto-fill name if found
      if (parsed.name && !targetRole) {
        // Don't auto-fill targetRole with name
      }
    } catch (err) {
      console.error('Error parsing resume:', err);
      alert('Error parsing file. Please try pasting the content instead.');
    }
    setParsingResume(false);
  };

  // Handle file upload for JD
  const handleJDUpload = async (file: File) => {
    setParsingJD(true);
    try {
      let text = '';
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else {
        text = await file.text();
      }
      setJobDescription(text);
      const parsed = parseJDText(text);
      setExtractedJD(parsed);
      // Auto-fill target role and company if found
      if (parsed.title && !targetRole) setTargetRole(parsed.title);
      if (parsed.company && !companyName) setCompanyName(parsed.company);
    } catch (err) {
      console.error('Error parsing JD:', err);
      alert('Error parsing file. Please try pasting the content instead.');
    }
    setParsingJD(false);
  };

  const loadProfile = async () => {
    // Read from central users table
    const { data: userData } = await supabase
      .from('users')
      .select('full_name, username, display_name, avatar_url, bio, location, created_at')
      .eq('id', user!.id)
      .single();
    if (userData) { setProfile(userData); return; }
    // Fallback to profiles table
    const { data } = await supabase
      .from('profiles')
      .select('full_name, username, display_name, avatar_url, bio, location, created_at')
      .eq('id', user!.id)
      .single();
    if (data) setProfile(data);
  };

  const loadDashboard = async () => {
    setLoading(true);

    const { data: history } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (history) {
      setStats({
        totalChats: history.filter(h => h.type === 'chat').length,
        totalScreenAnalyses: history.filter(h => h.type === 'screen_analysis').length,
        totalInterviews: history.filter(h => h.type === 'interview').length,
        totalGenerations: history.filter(h => h.type === 'generation').length,
      });

      const filtered = filterType === 'all' ? history : history.filter(h => h.type === filterType);
      setRecentActivity(filtered.slice(0, 20));
    }
    setLoading(false);
  };

  const statCards = [
    {
      label: 'Chats', value: stats.totalChats,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      ),
    },
    {
      label: 'Screen Analyses', value: stats.totalScreenAnalyses,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      ),
    },
    {
      label: 'Interviews', value: stats.totalInterviews,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
          <path d="M19 10v2a7 7 0 01-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      ),
    },
    {
      label: 'Generations', value: stats.totalGenerations,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
        </svg>
      ),
    },
  ];

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'chat', label: 'Chats' },
    { value: 'screen_analysis', label: 'Screen' },
    { value: 'interview', label: 'Interview' },
    { value: 'generation', label: 'Generated' },
  ];

  return (
    <div>
      {/* Action Buttons - Top Right */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 16 }}>
        {/* Download for Mac */}
        <button
          onClick={() => handleDownloadClick('ios')}
          style={{
            padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600,
            background: '#000',
            border: '2px solid #000',
            color: '#ffffff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
          onMouseEnter={e => { 
            e.currentTarget.style.transform = 'translateY(-2px)'; 
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
            e.currentTarget.style.background = '#1a1a1a';
          }}
          onMouseLeave={e => { 
            e.currentTarget.style.transform = 'translateY(0)'; 
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            e.currentTarget.style.background = '#000';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Download for Mac
        </button>

        {/* Download for Windows */}
        <button
          onClick={() => handleDownloadClick('windows')}
          style={{
            padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600,
            background: '#000',
            border: '2px solid #000',
            color: '#ffffff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
          onMouseEnter={e => { 
            e.currentTarget.style.transform = 'translateY(-2px)'; 
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
            e.currentTarget.style.background = '#1a1a1a';
          }}
          onMouseLeave={e => { 
            e.currentTarget.style.transform = 'translateY(0)'; 
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            e.currentTarget.style.background = '#000';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
          </svg>
          Download for Windows
        </button>

        {/* Open Chatbot */}
        <button
          onClick={() => {
            // Try to open desktop app if installed
            window.location.href = 'helplyai://open';
            setTimeout(() => {
              alert('HelplyAI desktop app is required. Please download it using the buttons above.');
            }, 1000);
          }}
          style={{
            padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            border: 'none', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(37,99,235,0.2)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.2)'; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            <path d="M8 10h8M8 14h4"/>
          </svg>
          Open Chatbot
        </button>
      </div>

      {/* Profile Welcome Card */}
      <div style={{
        marginBottom: 28, padding: 24, borderRadius: 12,
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 56, height: 56, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 20, fontWeight: 700,
          }}>
            {(profile?.display_name || profile?.full_name || user?.email || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ color: '#000000', fontSize: 20, fontWeight: 700, marginBottom: 2 }}>
            Welcome back{profile?.display_name || profile?.full_name ? `, ${profile.display_name || profile.full_name}` : ''}!
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {profile?.username && <span style={{ color: '#60a5fa', fontSize: 13 }}>@{profile.username}</span>}
            {profile?.location && <span style={{ color: '#6b7280', fontSize: 13 }}>{profile.location}</span>}
            {profile?.created_at && (
              <span style={{ color: '#4b5563', fontSize: 12 }}>
                Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
          {profile?.bio && <div style={{ color: '#9ca3af', fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{profile.bio}</div>}
        </div>
      </div>

      {/* Upload Resume & Job Description Card */}
      <div style={{
        marginBottom: 28, padding: 28, borderRadius: 16,
        background: setupSaved ? '#f0fdf4' : 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
        border: setupSaved ? '2px solid #86efac' : '2px solid #c7d2fe',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showSetup ? 24 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: setupSaved ? '#22c55e' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}>
              {setupSaved ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              )}
            </div>
            <div>
              <div style={{ color: '#000', fontSize: 18, fontWeight: 700 }}>
                {setupSaved ? '✅ Resume & JD Uploaded' : '📄 Upload Resume & Job Description'}
              </div>
              <div style={{ color: '#6b7280', fontSize: 14, marginTop: 2 }}>
                {setupSaved 
                  ? 'Your documents are saved. The chatbot will provide personalized answers based on your profile.'
                  : 'Upload or paste your Resume and Job Description to get tailored interview answers'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowSetup(!showSetup)}
            style={{
              padding: '12px 24px', borderRadius: 10, fontSize: 15, fontWeight: 600,
              background: showSetup ? '#f3f4f6' : (setupSaved ? '#22c55e' : 'linear-gradient(135deg, #2563eb, #7c3aed)'),
              border: 'none',
              color: showSetup ? '#374151' : '#fff',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: showSetup ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            {showSetup ? 'Close' : (setupSaved ? 'Edit Documents' : 'Upload Now')}
          </button>
        </div>

        {showSetup && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', color: '#374151', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Target Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1px solid #d1d5db', fontSize: 14,
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#374151', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Google, Microsoft"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1px solid #d1d5db', fontSize: 14,
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Job Description Section */}
            <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: useJD ? '2px solid #2563eb' : '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#374151', fontSize: 14, fontWeight: 600 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Job Description
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: useJD ? '#2563eb' : '#9ca3af' }}>
                  <input
                    type="checkbox"
                    checked={useJD}
                    onChange={(e) => setUseJD(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#2563eb' }}
                  />
                  Use in answers
                </label>
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10, background: '#f0f9ff', padding: '8px 10px', borderRadius: 6 }}>
                💡 <strong>Tip:</strong> Copy the JD from LinkedIn/job site, paste into ChatGPT and ask: "Extract key requirements, skills, and responsibilities as bullet points" - then paste here.
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => {
                  setJobDescription(e.target.value);
                  if (e.target.value.length > 100) {
                    const parsed = parseJDText(e.target.value);
                    setExtractedJD(parsed);
                    if (parsed.title && !targetRole) setTargetRole(parsed.title);
                    if (parsed.company && !companyName) setCompanyName(parsed.company);
                  }
                }}
                placeholder="Paste the job description text here...

Example format:
- Job Title: Senior Software Engineer
- Requirements: 5+ years experience in React, Node.js
- Responsibilities: Lead development team, architect solutions
- Skills: JavaScript, TypeScript, AWS, Docker"
                style={{
                  width: '100%', minHeight: 140, padding: '14px 16px', borderRadius: 10,
                  border: '1px solid #e5e7eb', fontSize: 14, lineHeight: 1.6,
                  outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                  fontFamily: 'inherit', background: '#fafafa',
                }}
              />
              {jobDescription && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#22c55e', fontWeight: 500 }}>
                  ✓ {jobDescription.split(/\s+/).length} words saved
                </div>
              )}
            </div>

            {/* Resume Section */}
            <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: useResume ? '2px solid #7c3aed' : '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#374151', fontSize: 14, fontWeight: 600 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Resume / CV
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: useResume ? '#7c3aed' : '#9ca3af' }}>
                  <input
                    type="checkbox"
                    checked={useResume}
                    onChange={(e) => setUseResume(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#7c3aed' }}
                  />
                  Use in answers
                </label>
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10, background: '#faf5ff', padding: '8px 10px', borderRadius: 6 }}>
                💡 <strong>Tip:</strong> Upload your resume to ChatGPT and ask: "Extract my name, skills, experience, education, and projects as bullet points" - then paste here.
              </div>
              <textarea
                value={resume}
                onChange={(e) => {
                  setResume(e.target.value);
                  if (e.target.value.length > 100) {
                    const parsed = parseResumeText(e.target.value);
                    setExtractedResume(parsed);
                  }
                }}
                placeholder="Paste your resume details here...

Example format:
- Name: John Doe
- Email: john@example.com
- Experience: 5 years at Google as Senior Engineer, 3 years at Amazon
- Skills: React, TypeScript, Node.js, AWS, Python
- Education: BS Computer Science, Stanford University
- Projects: Built e-commerce platform serving 1M users"
                style={{
                  width: '100%', minHeight: 100, padding: '14px 16px', borderRadius: 10,
                  border: '1px solid #e5e7eb', fontSize: 14, lineHeight: 1.6,
                  outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                  fontFamily: 'inherit', background: '#fafafa',
                }}
              />
              {resume && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
                  ✓ {resume.split(/\s+/).length} words captured
                </div>
              )}
              {/* Extracted Resume Fields */}
              {extractedResume && (extractedResume.name || extractedResume.skills.length > 0 || extractedResume.experience.length > 0) && (
                <div style={{ marginTop: 16, maxHeight: 280, overflowY: 'auto', padding: 16, background: '#faf5ff', borderRadius: 10, border: '1px solid #e9d5ff' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed', marginBottom: 12 }}>📄 Extracted Profile</div>
                  
                  {/* Basic Info Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 12 }}>
                    {extractedResume.name && (
                      <div style={{ background: '#fff', padding: 10, borderRadius: 8, border: '1px solid #e9d5ff' }}>
                        <div style={{ fontSize: 9, fontWeight: 600, color: '#6b7280', marginBottom: 2 }}>NAME</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{extractedResume.name}</div>
                      </div>
                    )}
                    {extractedResume.email && (
                      <div style={{ background: '#fff', padding: 10, borderRadius: 8, border: '1px solid #e9d5ff' }}>
                        <div style={{ fontSize: 9, fontWeight: 600, color: '#6b7280', marginBottom: 2 }}>EMAIL</div>
                        <div style={{ fontSize: 12, color: '#1f2937' }}>{extractedResume.email}</div>
                      </div>
                    )}
                    {extractedResume.phone && (
                      <div style={{ background: '#fff', padding: 10, borderRadius: 8, border: '1px solid #e9d5ff' }}>
                        <div style={{ fontSize: 9, fontWeight: 600, color: '#6b7280', marginBottom: 2 }}>PHONE</div>
                        <div style={{ fontSize: 12, color: '#1f2937' }}>{extractedResume.phone}</div>
                      </div>
                    )}
                    {extractedResume.companies.length > 0 && (
                      <div style={{ background: '#fff', padding: 10, borderRadius: 8, border: '1px solid #e9d5ff' }}>
                        <div style={{ fontSize: 9, fontWeight: 600, color: '#6b7280', marginBottom: 2 }}>COMPANIES</div>
                        <div style={{ fontSize: 12, color: '#1f2937' }}>{extractedResume.companies.slice(0, 3).join(', ')}</div>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {extractedResume.skills.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>💡 SKILLS</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {extractedResume.skills.slice(0, 10).map((skill, i) => (
                          <span key={i} style={{ padding: '4px 8px', background: '#e9d5ff', color: '#6b21a8', borderRadius: 5, fontSize: 11, fontWeight: 500 }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {extractedResume.experience.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>💼 EXPERIENCE</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {extractedResume.experience.slice(0, 3).map((exp, i) => (
                          <div key={i} style={{ padding: '6px 10px', background: '#fff', borderRadius: 6, fontSize: 11, color: '#374151', border: '1px solid #e9d5ff' }}>
                            {exp.length > 80 ? exp.slice(0, 80) + '...' : exp}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {extractedResume.education.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>🎓 EDUCATION</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {extractedResume.education.slice(0, 2).map((edu, i) => (
                          <span key={i} style={{ padding: '4px 8px', background: '#fef3c7', color: '#92400e', borderRadius: 5, fontSize: 11 }}>
                            {edu.length > 50 ? edu.slice(0, 50) + '...' : edu}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {extractedResume.certifications.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>🏆 CERTIFICATIONS</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {extractedResume.certifications.slice(0, 3).map((cert, i) => (
                          <span key={i} style={{ padding: '4px 8px', background: '#d1fae5', color: '#065f46', borderRadius: 5, fontSize: 11 }}>
                            {cert.length > 40 ? cert.slice(0, 40) + '...' : cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {extractedResume.projects.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>🚀 PROJECTS</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {extractedResume.projects.slice(0, 2).map((proj, i) => (
                          <div key={i} style={{ padding: '6px 10px', background: '#fff', borderRadius: 6, fontSize: 11, color: '#374151', border: '1px solid #e9d5ff' }}>
                            {proj.length > 70 ? proj.slice(0, 70) + '...' : proj}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                onClick={() => setShowSetup(false)}
                style={{
                  padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                  background: '#f3f4f6', border: 'none', color: '#374151',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveInterviewContext}
                disabled={savingSetup}
                style={{
                  padding: '12px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600,
                  background: savingSetup ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  border: 'none', color: '#fff',
                  cursor: savingSetup ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: savingSetup ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.3)',
                }}
              >
                {savingSetup ? 'Saving...' : '💾 Save Documents'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            padding: 20, borderRadius: 12,
            background: '#ffffff', border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ color: '#6b7280', marginBottom: 12, display: 'flex' }}>{card.icon}</div>
            <div style={{ color: '#000000', fontSize: 26, fontWeight: 700 }}>{loading ? '—' : card.value}</div>
            <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{
        borderRadius: 12, background: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ color: '#000000', fontSize: 16, fontWeight: 600, margin: 0 }}>Recent Activity</h2>
          <div style={{ display: 'flex', gap: 6 }}>
            {filterOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterType(opt.value)}
                style={{
                  padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                  background: filterType === opt.value ? '#2563eb' : '#f3f4f6',
                  border: 'none',
                  color: filterType === opt.value ? '#ffffff' : '#6b7280',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '8px 0' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading...</div>
          ) : recentActivity.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
              No activity yet. Start using HelplyAI to see your history here.
            </div>
          ) : (
            recentActivity.map(item => (
              <div key={item.id} style={{
                padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid #f3f4f6',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#000000', fontSize: 14, marginBottom: 2 }}>
                    {item.query ? (item.query.length > 80 ? item.query.slice(0, 80) + '...' : item.query) : 'Screen Analysis'}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                      background: item.type === 'chat' ? '#dbeafe' : item.type === 'interview' ? '#d1fae5' : '#ede9fe',
                      color: item.type === 'chat' ? '#1e40af' : item.type === 'interview' ? '#065f46' : '#5b21b6',
                    }}>{item.type.replace('_', ' ')}</span>
                    <span style={{ color: '#6b7280', fontSize: 11 }}>{item.mode}</span>
                  </div>
                </div>
                <div style={{ color: '#4b5563', fontSize: 12 }}>
                  {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Download Modal */}
      {showDownloadModal && (
        <div onClick={() => setShowDownloadModal(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 24,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 20, padding: 40,
            maxWidth: 500, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative',
          }}>
            <button onClick={() => setShowDownloadModal(false)} style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(0,0,0,0.05)', border: 'none',
              borderRadius: '50%', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 18, color: '#666',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = '#000' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#666' }}
            >×</button>

            <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: '#000' }}>
              {selectedPlatform === 'ios' ? 'Download for macOS' : 'Download for Windows'}
            </h3>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
              {selectedPlatform === 'ios' 
                ? 'Choose your Mac processor type' 
                : 'Choose the installer type that best suits your needs'}
            </p>

            {selectedPlatform === 'ios' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button onClick={() => handleDirectDownload(downloadLinks.macAppleSilicon)} style={{
                  width: '100%', padding: '16px 24px', borderRadius: 12,
                  background: '#000', color: '#fff', border: 'none',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  transition: 'all 0.3s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span>Apple Silicon (M1/M2/M3/M4)</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>For Macs with Apple M-series chips (2020 and newer)</span>
                </button>

                <button onClick={() => handleDirectDownload(downloadLinks.macIntel)} style={{
                  width: '100%', padding: '16px 24px', borderRadius: 12,
                  background: '#fff', color: '#000', border: '2px solid #000',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  transition: 'all 0.3s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span>Intel Processor</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', fontWeight: 400 }}>For Macs with Intel processors (2019 and older)</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button onClick={() => handleDirectDownload(downloadLinks.windowsMSI)} style={{
                  width: '100%', padding: '16px 24px', borderRadius: 12,
                  background: '#000', color: '#fff', border: 'none',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  transition: 'all 0.3s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span>MSI Installer (Individual)</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>Traditional Windows installer for personal use</span>
                </button>

                <button onClick={() => handleDirectDownload(downloadLinks.windowsNSIS)} style={{
                  width: '100%', padding: '16px 24px', borderRadius: 12,
                  background: '#fff', color: '#000', border: '2px solid #000',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  transition: 'all 0.3s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span>NSIS Installer (Organization)</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', fontWeight: 400 }}>Modern installer for enterprise deployment</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
