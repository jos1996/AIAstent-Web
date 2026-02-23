import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', path: '/settings/dashboard' },
  { id: 'profile', label: 'Profile', icon: 'user', path: '/settings/profile' },
  { id: 'updates', label: 'Latest Updates', icon: 'sparkle', path: '/settings/updates' },
  { id: 'tutorials', label: 'Tutorials', icon: 'play', path: '/settings/tutorials' },
  { id: 'history', label: 'History', icon: 'clock', path: '/settings/history' },
  { id: 'reminders', label: 'Reminders', icon: 'bell', path: '/settings/reminders' },
  { id: 'language', label: 'Language', icon: 'globe', path: '/settings/language' },
  { id: 'billing', label: 'Billing', icon: 'card', path: '/settings/billing' },
];

const supportItems = [
  { id: 'help', label: 'Help Center', icon: 'help', path: '/settings/help' },
];

function SidebarIcon({ type }: { type: string }) {
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 };
  switch (type) {
    case 'grid': return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case 'user': return <svg {...s}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case 'clock': return <svg {...s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case 'bell': return <svg {...s}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
    case 'globe': return <svg {...s}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>;
    case 'card': return <svg {...s}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
    case 'help': return <svg {...s}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
    case 'gear': return <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
    case 'back': return <svg {...s}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
    case 'test': return <svg {...s}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
    case 'sparkle': return <svg {...s}><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>;
    case 'play': return <svg {...s}><polygon points="5 3 19 12 5 21 5 3"/></svg>;
    default: return null;
  }
}


export default function SettingsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, signIn, signUp, signInWithGoogle, resetPassword, signOut } = useAuth();
  const [showPrefs, setShowPrefs] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');

  // Auth form state (embedded in settings)
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const currentPath = location.pathname;

  // Redirect authenticated users to dashboard if they're at /settings root
  useEffect(() => {
    if (user && currentPath === '/settings') {
      navigate('/settings/dashboard', { replace: true });
    }
  }, [user, currentPath, navigate]);

  useEffect(() => {
    if (!user) return;
    const loadHeaderProfile = async () => {
      // Read from central users table first
      const { data: userData } = await supabase
        .from('users')
        .select('full_name, username, display_name, avatar_url')
        .eq('id', user.id)
        .single();
      if (userData) {
        setProfileName(userData.display_name || userData.full_name || '');
        setProfileUsername(userData.username || '');
        setProfileAvatar(userData.avatar_url || '');
        return;
      }
      // Fallback to profiles table
      const { data } = await supabase
        .from('profiles')
        .select('full_name, username, display_name, avatar_url')
        .eq('id', user.id)
        .single();
      if (data) {
        setProfileName(data.display_name || data.full_name || '');
        setProfileUsername(data.username || '');
        setProfileAvatar(data.avatar_url || '');
      }
    };
    loadHeaderProfile();
  }, [user]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthSubmitting(true);
    if (authMode === 'login') {
      const { error } = await signIn(authEmail, authPassword);
      if (error) {
        setAuthError(error);
        setAuthSubmitting(false);
      } else {
        // Successfully signed in - redirect to dashboard
        navigate('/settings/dashboard');
      }
    } else if (authMode === 'signup') {
      const { error } = await signUp(authEmail, authPassword, authFullName);
      if (error) setAuthError(error);
      else setAuthSuccess('Account created! Check your email for verification.');
      setAuthSubmitting(false);
    } else if (authMode === 'forgot') {
      const { error } = await resetPassword(authEmail);
      if (error) setAuthError(error);
      else setAuthSuccess('Password reset email sent. Check your inbox.');
      setAuthSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError('');
    const { error } = await signInWithGoogle();
    if (error) setAuthError(error);
  };

  const isAuthenticated = !!user;

  // Show loading spinner while session is being resolved — prevents auth form flash
  if (authLoading) {
    return (
      <div style={{
        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111118 50%, #0a0a0a 100%)',
        fontFamily: "-apple-system, 'SF Pro Text', system-ui, sans-serif",
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div style={{ color: '#6b7280', fontSize: 13 }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #111118 50%, #0a0a0a 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "-apple-system, 'SF Pro Text', system-ui, sans-serif",
      color: '#e5e7eb',
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* Top Bar */}
      <div
        style={{
          height: 52, flexShrink: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(20,20,20,0.8)', backdropFilter: 'blur(20px)',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <span style={{ color: '#e5e7eb', fontSize: 15, fontWeight: 700 }}>HelplyAI Settings</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isAuthenticated ? (
            <>
              {profileAvatar ? (
                <img src={profileAvatar} alt="" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover' }} />
              ) : profileName ? (
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 11, fontWeight: 700,
                }}>{profileName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>
              ) : null}
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                {profileName && <span style={{ color: '#e5e7eb', fontSize: 13, fontWeight: 500 }}>{profileName}</span>}
                <span style={{ color: '#6b7280', fontSize: profileName ? 11 : 13 }}>{profileUsername ? `@${profileUsername}` : user?.email}</span>
              </div>
              <div style={{ position: 'relative' }}>
                <button
                  className="no-drag"
                  onClick={() => setShowPrefs(!showPrefs)}
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: showPrefs ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { if (!showPrefs) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; } }}
                >
                  <SidebarIcon type="gear" />
                </button>
                {showPrefs && <PreferencesPanel onClose={() => setShowPrefs(false)} />}
              </div>
            </>
          ) : (
            <button
              className="no-drag"
              onClick={() => { navigate('/settings/dashboard'); }}
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                border: 'none', color: '#fff', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, padding: '8px 18px',
                borderRadius: 10, transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Login / Sign Up
            </button>
          )}

        </div>
      </div>

      {isAuthenticated ? (
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Sidebar */}
          <div style={{
            width: 260, flexShrink: 0,
            borderRight: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            background: 'rgba(0,0,0,0.2)',
          }}>
            {/* Nav items — fixed, no scroll */}
            <div style={{ flex: 1, padding: '20px 16px 12px', overflow: 'hidden' }}>
              <div style={{ marginBottom: 8 }}>
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      background: currentPath === item.path ? 'rgba(37,99,235,0.12)' : 'transparent',
                      border: currentPath === item.path ? '1px solid rgba(37,99,235,0.2)' : '1px solid transparent',
                      color: currentPath === item.path ? '#60a5fa' : '#9ca3af',
                      fontSize: 14, fontWeight: currentPath === item.path ? 600 : 500,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
                      transition: 'all 0.2s', textAlign: 'left', marginBottom: 4,
                    }}
                    onMouseEnter={e => { if (currentPath !== item.path) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e5e7eb'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; } }}
                    onMouseLeave={e => { if (currentPath !== item.path) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'transparent'; } }}
                  >
                    <SidebarIcon type={item.icon} />
                    {item.label}
                  </button>
                ))}
              </div>

              <div style={{ padding: '16px 16px 8px', color: '#6b7280', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                Support
              </div>
              {supportItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    background: currentPath === item.path ? 'rgba(37,99,235,0.12)' : 'transparent',
                    border: currentPath === item.path ? '1px solid rgba(37,99,235,0.2)' : '1px solid transparent',
                    color: currentPath === item.path ? '#60a5fa' : '#9ca3af',
                    fontSize: 14, fontWeight: currentPath === item.path ? 600 : 500,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
                    transition: 'all 0.2s', textAlign: 'left', marginBottom: 4,
                  }}
                  onMouseEnter={e => { if (currentPath !== item.path) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e5e7eb'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; } }}
                  onMouseLeave={e => { if (currentPath !== item.path) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'transparent'; } }}
                >
                  <SidebarIcon type={item.icon} />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Bottom actions — always pinned, never scrolls */}
            <div style={{
              flexShrink: 0, padding: '12px 16px 20px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  width: '100%', padding: '11px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#9ca3af', fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.2s', marginBottom: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Home
              </button>
              <button
                onClick={async () => { await signOut(); navigate('/settings'); }}
                style={{
                  width: '100%', padding: '11px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#9ca3af', fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px 48px' }}>
            <Outlet />
          </div>
        </div>
      ) : (
        /* ── Embedded Auth Form (when not logged in) ── */
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: 400, padding: 40, borderRadius: 20,
            background: 'rgba(30,30,30,0.9)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <img src="/favicon.png" alt="HelplyAI" style={{ width: 56, height: 56, borderRadius: '50%', marginBottom: 16 }} />
              <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>
                {authMode === 'login' ? 'Welcome back' : authMode === 'signup' ? 'Create account' : 'Reset password'}
              </h1>
              <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 8 }}>
                {authMode === 'login' ? 'Sign in to unlock all features' : authMode === 'signup' ? 'Get started with HelplyAI' : 'Enter your email to reset'}
              </p>
            </div>

            {authError && (
              <div style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 16,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171', fontSize: 13,
              }}>{authError}</div>
            )}

            {authSuccess && (
              <div style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 16,
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                color: '#4ade80', fontSize: 13,
              }}>{authSuccess}</div>
            )}

            <form onSubmit={handleAuthSubmit}>
              {authMode === 'signup' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: '#9ca3af', fontSize: 13, marginBottom: 6, display: 'block' }}>Full Name</label>
                  <input
                    type="text" value={authFullName} onChange={e => setAuthFullName(e.target.value)}
                    placeholder="John Doe" required
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ color: '#9ca3af', fontSize: 13, marginBottom: 6, display: 'block' }}>Email</label>
                <input
                  type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                  placeholder="you@example.com" required
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {authMode !== 'forgot' && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ color: '#9ca3af', fontSize: 13, marginBottom: 6, display: 'block' }}>Password</label>
                  <input
                    type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                    placeholder="At least 8 characters" required minLength={8}
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              <button
                type="submit" disabled={authSubmitting}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 10,
                  background: authSubmitting ? 'rgba(37,99,235,0.5)' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  border: 'none', color: '#fff', fontSize: 15, fontWeight: 600,
                  cursor: authSubmitting ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                }}
              >
                {authSubmitting ? 'Please wait...' : authMode === 'login' ? 'Sign In' : authMode === 'signup' ? 'Create Account' : 'Send Reset Link'}
              </button>
            </form>

            {authMode !== 'forgot' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                  <span style={{ color: '#6b7280', fontSize: 12 }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                </div>
                <button
                  onClick={handleGoogleAuth}
                  style={{
                    width: '100%', padding: '12px 0', borderRadius: 10,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#e5e7eb', fontSize: 14, fontWeight: 500,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
              </>
            )}

            <div style={{ marginTop: 20, textAlign: 'center' }}>
              {authMode === 'login' && (
                <>
                  <button onClick={() => { setAuthMode('forgot'); setAuthError(''); setAuthSuccess(''); }} style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: 13, cursor: 'pointer', marginBottom: 8, display: 'block', width: '100%' }}>
                    Forgot password?
                  </button>
                  <span style={{ color: '#6b7280', fontSize: 13 }}>
                    Don't have an account?{' '}
                    <button onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthSuccess(''); }} style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: 13, cursor: 'pointer' }}>Sign up</button>
                  </span>
                </>
              )}
              {authMode === 'signup' && (
                <span style={{ color: '#6b7280', fontSize: 13 }}>
                  Already have an account?{' '}
                  <button onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }} style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: 13, cursor: 'pointer' }}>Sign in</button>
                </span>
              )}
              {authMode === 'forgot' && (
                <button onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }} style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: 13, cursor: 'pointer' }}>
                  Back to sign in
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PreferencesPanel({ onClose }: { onClose: () => void }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState('dark');
  const [startup, setStartup] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSaveHistory, setAutoSaveHistory] = useState(true);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('user_preferences')
        .select('theme, open_on_startup, notifications_enabled, auto_save_history')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setTheme(data.theme || 'dark');
        setStartup(data.open_on_startup || false);
        setNotifications(data.notifications_enabled ?? true);
        setAutoSaveHistory(data.auto_save_history ?? true);
      }
      setPrefsLoaded(true);
    };
    load();
  }, [user]);

  const savePrefs = async (updates: Record<string, any>) => {
    if (!user) return;
    await supabase
      .from('user_preferences')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
  };

  const handleTheme = (t: string) => { setTheme(t); savePrefs({ theme: t }); };
  const handleStartup = () => { const v = !startup; setStartup(v); savePrefs({ open_on_startup: v }); };
  const handleNotifications = () => { const v = !notifications; setNotifications(v); savePrefs({ notifications_enabled: v }); };
  const handleAutoSave = () => { const v = !autoSaveHistory; setAutoSaveHistory(v); savePrefs({ auto_save_history: v }); };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50 }} />
      <div style={{
        position: 'absolute', top: 42, right: 0, width: 280, zIndex: 51,
        background: 'rgba(30,30,30,0.95)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14, padding: 20, backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Preferences</h3>

        {!prefsLoaded ? (
          <div style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', padding: 12 }}>Loading...</div>
        ) : (
          <>
            <div style={{ marginBottom: 18 }}>
              <label style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8, display: 'block' }}>Theme</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {['light', 'dark', 'system'].map(t => (
                  <button
                    key={t}
                    onClick={() => handleTheme(t)}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 500,
                      background: theme === t ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.06)',
                      border: theme === t ? '1px solid rgba(37,99,235,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      color: theme === t ? '#60a5fa' : '#9ca3af', cursor: 'pointer',
                      textTransform: 'capitalize', transition: 'all 0.15s',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <ToggleRow label="Open on startup" desc="Launch when you log in" value={startup} onToggle={handleStartup} />
            <ToggleRow label="Notifications" desc="Enable push notifications" value={notifications} onToggle={handleNotifications} />
            <ToggleRow label="Auto-save history" desc="Save all interactions" value={autoSaveHistory} onToggle={handleAutoSave} />

            {/* Divider + Sign Out */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '14px 0 10px' }} />
            <button
              onClick={async () => {
                await signOut();
                onClose();
                navigate('/settings');
              }}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 10,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </button>
          </>
        )}
      </div>
    </>
  );
}

function ToggleRow({ label, desc, value, onToggle }: { label: string; desc: string; value: boolean; onToggle: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        <div style={{ color: '#e5e7eb', fontSize: 13, fontWeight: 500 }}>{label}</div>
        <div style={{ color: '#6b7280', fontSize: 11 }}>{desc}</div>
      </div>
      <button
        onClick={onToggle}
        style={{
          width: 42, height: 24, borderRadius: 12, padding: 2,
          background: value ? '#2563eb' : 'rgba(255,255,255,0.15)',
          border: 'none', cursor: 'pointer', transition: 'all 0.2s',
          display: 'flex', alignItems: 'center',
        }}
      >
        <div style={{
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          transition: 'all 0.2s', transform: value ? 'translateX(18px)' : 'translateX(0)',
        }} />
      </button>
    </div>
  );
}
