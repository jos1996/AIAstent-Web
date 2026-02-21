import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    // With PKCE flow, Supabase detects ?code= in the URL and exchanges it automatically.
    // We listen for the SIGNED_IN event and navigate to dashboard once the session exists.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/settings/dashboard', { replace: true });
      } else if (event === 'TOKEN_REFRESHED' && session) {
        navigate('/settings/dashboard', { replace: true });
      }
    });

    // Also check if session was already established before this component mounted
    supabase.auth.getSession().then(({ data: { session }, error: err }) => {
      if (err) {
        setError(err.message);
        return;
      }
      if (session) {
        navigate('/settings/dashboard', { replace: true });
      }
    });

    // 15-second timeout fallback
    const timeout = setTimeout(() => {
      setError('Authentication is taking too long. Please try again.');
    }, 15000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

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
              }}
            >Back to Login</button>
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
