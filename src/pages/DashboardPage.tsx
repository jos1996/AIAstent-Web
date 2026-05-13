import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DOWNLOAD_LINKS } from '../config/releases';
import { trackDownload } from '../lib/analytics';
import ResumeBuilderPage from './ResumeBuilderPage';
import AtsCheckPage from './AtsCheckPage';

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
  const [allHistory, setAllHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  // Derived stats and filtered activity — computed locally, no extra API calls
  const stats: Stats = useMemo(() => ({
    totalChats: allHistory.filter(h => h.type === 'chat').length,
    totalScreenAnalyses: allHistory.filter(h => h.type === 'screen_analysis').length,
    totalInterviews: allHistory.filter(h => h.type === 'interview').length,
    totalGenerations: allHistory.filter(h => h.type === 'generation').length,
  }), [allHistory]);

  const recentActivity: HistoryItem[] = useMemo(() => {
    const filtered = filterType === 'all' ? allHistory : allHistory.filter(h => h.type === filterType);
    return filtered.slice(0, 20);
  }, [allHistory, filterType]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'windows' | null>(null);
  
  // JD/Resume state
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [savingSetup, setSavingSetup] = useState(false);
  const [useJD, setUseJD] = useState(true);
  const [useResume, setUseResume] = useState(true);
  const [shortAnswers, setShortAnswers] = useState(false);
  const [longAnswers, setLongAnswers] = useState(true);
  const [showResumeBuilder, setShowResumeBuilder] = useState(false);
  const [showAtsCheck, setShowAtsCheck] = useState(false);

  // Use centralized download links from config/releases.ts
  const downloadLinks = DOWNLOAD_LINKS;

  const handleDirectDownload = (url: string) => {
    const platform = url.includes('Apple_Silicon') ? 'mac_apple_silicon' : url.includes('Intel') && url.includes('.dmg') ? 'mac_intel' : url.includes('MSI') ? 'windows_msi' : 'windows_nsis';
    trackDownload(platform);
    window.open(url, '_blank');
    setShowDownloadModal(false);
  };

  const handleDownloadClick = (platform: 'ios' | 'windows') => {
    setSelectedPlatform(platform);
    setShowDownloadModal(true);
  };

  // Load everything in ONE parallel call on mount only
  useEffect(() => {
    if (!user) return;
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;
    setLoading(true);

    // Fire all 3 queries in parallel — no sequential waiting
    const [profileRes, historyRes, contextRes] = await Promise.all([
      supabase.from('users').select('full_name,username,display_name,avatar_url,bio,location,created_at').eq('id', user.id).single(),
      supabase.from('history').select('id,type,mode,query,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('interview_context').select('*').eq('user_id', user.id).single(),
    ]);

    // Profile: try users table first, fall back to profiles
    if (profileRes.data) {
      setProfile(profileRes.data);
    } else {
      const { data: fallback } = await supabase.from('profiles').select('full_name,username,display_name,avatar_url,bio,location,created_at').eq('id', user.id).single();
      if (fallback) setProfile(fallback);
    }

    // History
    if (historyRes.data) setAllHistory(historyRes.data);

    // Interview context
    if (contextRes.data) {
      const d = contextRes.data;
      setJobDescription(d.job_description || '');
      setResume(d.resume || '');
      setTargetRole(d.target_role || '');
      setCompanyName(d.company_name || '');
      setUseJD(d.use_jd !== false);
      setUseResume(d.use_resume !== false);
      setShortAnswers(d.short_answers === true);
      setLongAnswers(d.long_answers !== false);
    }

    setLoading(false);
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
          short_answers: shortAnswers,
          long_answers: longAnswers,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      if (error) throw error;
      alert('Saved! The chatbot will now use this for personalized answers.');
    } catch (err: any) {
      console.error('Save error:', err);
      alert('Failed to save: ' + (err.message || 'Unknown error'));
    }
    setSavingSetup(false);
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

  // Show Resume Builder view
  if (showResumeBuilder) {
    if (!resume.trim()) {
      return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', background: '#fff' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#000', margin: '0 0 8px' }}>Resume Required</h2>
          <p style={{ color: '#666', fontSize: 14, margin: '0 0 24px' }}>Please paste your resume in the Resume / CV section on the dashboard first, then click Resume Builder.</p>
          <button onClick={() => setShowResumeBuilder(false)} style={{ padding: '10px 24px', borderRadius: 8, background: '#000', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Go Back to Dashboard
          </button>
        </div>
      );
    }
    return <ResumeBuilderPage resumeText={resume} onClose={() => setShowResumeBuilder(false)} />;
  }

  // Show ATS Check view
  if (showAtsCheck) {
    if (!resume.trim()) {
      return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', background: '#fff' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#000', margin: '0 0 8px' }}>Resume Required</h2>
          <p style={{ color: '#666', fontSize: 14, margin: '0 0 24px' }}>Paste your resume in the Resume / CV section on the dashboard first, then click ATS Check to score it.</p>
          <button onClick={() => setShowAtsCheck(false)} style={{ padding: '10px 24px', borderRadius: 8, background: '#000', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Go Back to Dashboard
          </button>
        </div>
      );
    }
    return <AtsCheckPage resumeText={resume} initialJd={jobDescription} onClose={() => setShowAtsCheck(false)} />;
  }

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
            background: '#000',
            border: '2px solid #000', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'; e.currentTarget.style.background = '#1a1a1a'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'; e.currentTarget.style.background = '#000'; }}
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
            background: '#000',
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
            {profile?.username && <span style={{ color: '#555', fontSize: 13 }}>@{profile.username}</span>}
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

      {/* Resume & Job Description Card - Always visible */}
      <div style={{
        marginBottom: 28, padding: 24, borderRadius: 16,
        background: '#fff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: '#000', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            📄 Resume & Job Description
          </div>
          <div style={{ color: '#6b7280', fontSize: 13 }}>
            Paste your resume and job description below. Use ChatGPT or any AI tool to extract details from your documents first.
          </div>
        </div>

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
            <div>
              <div style={{ marginBottom: 6 }}>
                <label style={{ color: '#374151', fontSize: 13, fontWeight: 500 }}>
                  Job Description
                </label>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                style={{
                  width: '100%', minHeight: 120, padding: '12px 14px', borderRadius: 8,
                  border: '1px solid #d1d5db', fontSize: 14, lineHeight: 1.5,
                  outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                  fontFamily: 'inherit', background: '#fafafa',
                }}
              />
              {jobDescription && (
                <div style={{ marginTop: 6, fontSize: 11, color: '#22c55e' }}>
                  ✓ {jobDescription.split(/\s+/).length} words
                </div>
              )}
            </div>

            {/* Resume Section */}
            <div>
              <div style={{ marginBottom: 6 }}>
                <label style={{ color: '#374151', fontSize: 13, fontWeight: 500 }}>
                  Resume / CV
                </label>
              </div>
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Paste your resume here..."
                style={{
                  width: '100%', minHeight: 120, padding: '12px 14px', borderRadius: 8,
                  border: '1px solid #d1d5db', fontSize: 14, lineHeight: 1.5,
                  outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                  fontFamily: 'inherit', background: '#fafafa',
                }}
              />
              {resume && (
                <div style={{ marginTop: 6, fontSize: 11, color: '#22c55e' }}>
                  ✓ {resume.split(/\s+/).length} words
                </div>
              )}
            </div>

            {/* Answer Mode Checkboxes */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <label style={{ color: '#374151', fontSize: 13, fontWeight: 600 }}>
                  Chatbot Answer Preferences
                </label>
                <span style={{ color: '#9ca3af', fontSize: 11 }}>Select how the chatbot should respond</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
                  border: `1.5px solid ${useJD ? '#000' : '#e5e7eb'}`, background: useJD ? '#f9f9f9' : '#fff',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <input type="checkbox" checked={useJD} onChange={(e) => setUseJD(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#000' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Based on JD</div>
                    <div style={{ fontSize: 11, color: '#888' }}>Answer using job description context</div>
                  </div>
                </label>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
                  border: `1.5px solid ${useResume ? '#000' : '#e5e7eb'}`, background: useResume ? '#f9f9f9' : '#fff',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <input type="checkbox" checked={useResume} onChange={(e) => setUseResume(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#000' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Based on Resume</div>
                    <div style={{ fontSize: 11, color: '#888' }}>Answer using your resume context</div>
                  </div>
                </label>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
                  border: `1.5px solid ${shortAnswers ? '#000' : '#e5e7eb'}`, background: shortAnswers ? '#f9f9f9' : '#fff',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <input type="checkbox" checked={shortAnswers} onChange={(e) => { setShortAnswers(e.target.checked); if (e.target.checked) setLongAnswers(false); }} style={{ width: 16, height: 16, accentColor: '#000' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Short Answers</div>
                    <div style={{ fontSize: 11, color: '#888' }}>Concise, to-the-point responses</div>
                  </div>
                </label>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
                  border: `1.5px solid ${longAnswers ? '#000' : '#e5e7eb'}`, background: longAnswers ? '#f9f9f9' : '#fff',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <input type="checkbox" checked={longAnswers} onChange={(e) => { setLongAnswers(e.target.checked); if (e.target.checked) setShortAnswers(false); }} style={{ width: 16, height: 16, accentColor: '#000' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Long Answers</div>
                    <div style={{ fontSize: 11, color: '#888' }}>Detailed, comprehensive responses</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Save & Resume Builder Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                onClick={saveInterviewContext}
                disabled={savingSetup}
                style={{
                  padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  background: savingSetup ? '#9ca3af' : '#000',
                  border: 'none', color: '#fff',
                  cursor: savingSetup ? 'not-allowed' : 'pointer',
                }}
              >
                {savingSetup ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setShowResumeBuilder(true)}
                style={{
                  padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  background: '#fff', border: '2px solid #000', color: '#000',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                Resume Builder
              </button>
              <button
                onClick={() => setShowAtsCheck(true)}
                disabled={!resume.trim()}
                title={!resume.trim() ? 'Paste your resume above first' : 'Run an ATS check on this resume'}
                style={{
                  padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  background: resume.trim() ? '#000' : '#9ca3af',
                  border: '2px solid ' + (resume.trim() ? '#000' : '#9ca3af'),
                  color: '#fff',
                  cursor: resume.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (resume.trim()) { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={e => { if (resume.trim()) { e.currentTarget.style.background = '#000'; e.currentTarget.style.transform = 'translateY(0)'; } }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                ATS Check
              </button>
            </div>
          </div>
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
                  background: filterType === opt.value ? '#000' : '#f3f4f6',
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
                      background: '#f3f4f6', border: '1px solid #e5e7eb',
                      color: '#374151',
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
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>Download ZIP → extract → run .exe to install</span>
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
