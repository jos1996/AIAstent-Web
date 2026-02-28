import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

  const downloadLinks = {
    macOS: 'https://giftsandcoins.s3.eu-north-1.amazonaws.com/Helply+AI_0.1.0_aarch64+(1).dmg',
    windowsMSI: 'https://giftsandcoins.s3.eu-north-1.amazonaws.com/Helply-AI-Windows-MSI-Installer+(1).zip',
    windowsNSIS: 'https://giftsandcoins.s3.eu-north-1.amazonaws.com/Helply-AI-Windows-NSIS-Installer+(1).zip',
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
    }
  }, [user, filterType]);

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
            padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: '#ffffff', border: '1px solid #e5e7eb',
            color: '#000000', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Download for Mac
        </button>

        {/* Download for Windows */}
        <button
          onClick={() => handleDownloadClick('windows')}
          style={{
            padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: '#ffffff', border: '1px solid #e5e7eb',
            color: '#1f2937', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
                ? 'Download the DMG installer for macOS (Apple Silicon)' 
                : 'Choose the installer type that best suits your needs'}
            </p>

            {selectedPlatform === 'ios' ? (
              <button onClick={() => handleDirectDownload(downloadLinks.macOS)} style={{
                width: '100%', padding: '16px 24px', borderRadius: 12,
                background: '#000', color: '#fff', border: 'none',
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download DMG (Apple Silicon)
              </button>
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
