import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { user, loading } = useAuth();
  const hasRedirected = useRef(false);

  // Watch for user from AuthContext — it handles the PKCE exchange via detectSessionInUrl
  useEffect(() => {
    if (hasRedirected.current) return;

    if (!supabaseConfigured) {
      setError('Supabase is not configured. Please add valid credentials to your .env file.');
      return;
    }

    // Once AuthContext finishes loading and user is available, redirect to dashboard
    if (!loading && user) {
      hasRedirected.current = true;
      navigate('/settings/dashboard', { replace: true });
      return;
    }

    // If loading is done but no user, wait a bit more then show error
    if (!loading && !user) {
      const timeout = setTimeout(() => {
        if (!hasRedirected.current) {
          setError('Authentication failed. The redirect URL may not be configured in Supabase. Please check SUPABASE_CONFIG.md and try again.');
        }
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [user, loading, navigate]);

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #111118 50%, #0a0a0a 100%)',
      fontFamily: "-apple-system, 'SF Pro Text', system-ui, sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        {error ? (
          <>
            <div style={{
              padding: '12px 20px', borderRadius: 12, marginBottom: 20,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171', fontSize: 14,
            }}>{error}</div>
            <button
              onClick={() => navigate('/settings', { replace: true })}
              style={{
                padding: '10px 24px', borderRadius: 10,
                background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)',
                color: '#60a5fa', fontSize: 14, cursor: 'pointer',
                marginRight: 10,
              }}
            >Sign In Again</button>
            <button
              onClick={() => navigate('/', { replace: true })}
              style={{
                padding: '10px 24px', borderRadius: 10,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#9ca3af', fontSize: 14, cursor: 'pointer',
              }}
            >Go Home</button>
          </>
        ) : (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: 12, margin: '0 auto 20px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              Signing you in...
            </div>
            <div style={{ color: '#6b7280', fontSize: 14 }}>
              Please wait while we complete authentication
            </div>
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24,
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#2563eb',
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  opacity: 0.4,
                }} />
              ))}
            </div>
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 0.4; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
              }
            `}</style>
          </>
        )}
      </div>
    </div>
  );
}
