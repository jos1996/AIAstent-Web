import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  deleteAccount: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Process referral code when a new user signs up
const processReferralOnSignup = async (userId: string) => {
  try {
    // Check URL params first, then localStorage
    const params = new URLSearchParams(window.location.search);
    let refCode = params.get('ref') || localStorage.getItem('referral_code');
    if (!refCode) return;

    // Clear stored referral code
    localStorage.removeItem('referral_code');

    // Check if user was already referred (prevent duplicate credits)
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_id', userId)
      .single();
    if (existingReferral) return; // Already processed

    // Look up the referral code to find the referrer
    const { data: codeData } = await supabase
      .from('referral_codes')
      .select('user_id')
      .eq('code', refCode.toUpperCase())
      .single();
    if (!codeData || codeData.user_id === userId) return; // Invalid code or self-referral

    const referrerId = codeData.user_id;
    const REFERRAL_BONUS_MINUTES = 15;

    // Create referral record
    await supabase.from('referrals').insert({
      referrer_id: referrerId,
      referred_id: userId,
      referral_code: refCode.toUpperCase(),
      status: 'completed',
      credits_awarded: true,
      credits_minutes: REFERRAL_BONUS_MINUTES,
      completed_at: new Date().toISOString(),
    });

    // Credit the referrer with bonus minutes
    const { data: referrerBilling } = await supabase
      .from('billing')
      .select('credits_total_minutes')
      .eq('user_id', referrerId)
      .single();
    
    const currentMinutes = referrerBilling?.credits_total_minutes || 0;
    await supabase.from('billing').upsert({
      user_id: referrerId,
      credits_total_minutes: currentMinutes + REFERRAL_BONUS_MINUTES,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // Credit the new user (referred) with bonus minutes
    const { data: newUserBilling } = await supabase
      .from('billing')
      .select('credits_total_minutes')
      .eq('user_id', userId)
      .single();
    
    const newUserMinutes = newUserBilling?.credits_total_minutes || 0;
    await supabase.from('billing').upsert({
      user_id: userId,
      credits_total_minutes: newUserMinutes + REFERRAL_BONUS_MINUTES,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    console.log(`Referral processed: ${REFERRAL_BONUS_MINUTES} minutes credited to both users`);
  } catch (err) {
    console.error('Error processing referral:', err);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);

  useEffect(() => {
    // Skip auth entirely if Supabase is not configured — app loads instantly
    if (!supabaseConfigured) {
      return;
    }

    const handleAuthFromUrl = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('auth');
        const refreshToken = params.get('ref');

        // Priority 1: URL tokens from Tauri — always use when present (most current)
        if (accessToken && refreshToken) {
          // Clean URL immediately for security before any async work
          window.history.replaceState({}, '', window.location.pathname);

          // Try setting session with both tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error && data.session) {
            setSession(data.session);
            setUser(data.session.user);
            setLoading(false);
            return;
          }
          // Access token may be expired — refresh using the refresh token
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
            refresh_token: refreshToken,
          });
          if (!refreshError && refreshData.session) {
            setSession(refreshData.session);
            setUser(refreshData.session.user);
            setLoading(false);
            return;
          }
        }

        // Priority 2: Existing browser session (no URL tokens present)
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession?.user) {
          setSession(existingSession);
          setUser(existingSession.user);
          setLoading(false);
          return;
        }

        // No session found anywhere
        setSession(null);
        setUser(null);
        setLoading(false);
      } catch (err) {
        console.warn('Auth initialization failed:', err);
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    };

    // Timeout fallback: if auth takes too long, stop loading after 3 seconds
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    handleAuthFromUrl().finally(() => clearTimeout(timeout));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Write session to session_bridge table so the Tauri chatbot can detect login
      if ((_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') && session?.user) {
        void supabase.from('session_bridge').upsert({
          user_id: session.user.id,
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' }).then(() => {});
      }
      // On sign-in, ensure user exists in public.users table
      if (_event === 'SIGNED_IN' && session?.user) {
        void supabase.rpc('sync_user_login', { user_platform: 'web', user_app_version: '1.0.0' }).then(() => {});
        // Process referral code if present in URL or localStorage
        void processReferralOnSignup(session.user.id);
      }
      if (_event === 'SIGNED_OUT') {
        // Clean up session_bridge on sign out
        if (user) {
          void supabase.from('session_bridge').delete()
            .eq('user_id', user.id).then(() => {});
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const notConfiguredError = 'Supabase is not configured. Please add valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file. If deployed, add these environment variables in your hosting platform (Vercel/Cloudflare) settings and redeploy. See ENV_SETUP_GUIDE.md for details.';

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabaseConfigured) return { error: notConfiguredError };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabaseConfigured) return { error: notConfiguredError };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signInWithGoogle = async () => {
    if (!supabaseConfigured) return { error: notConfiguredError };
    // Use exact redirect URL to ensure PKCE verifier matches
    // Normalize to bare domain (no www) so Supabase redirect allowlist matches
    let origin = window.location.origin;
    if (origin.includes('://www.')) {
      origin = origin.replace('://www.', '://');
    }
    const redirectUrl = window.location.hostname === 'localhost' 
      ? `http://localhost:${window.location.port}/auth/callback`
      : `${origin}/auth/callback`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: { prompt: 'select_account' },
      },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    if (!supabaseConfigured) return;
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (!supabaseConfigured) return { error: notConfiguredError };
    let resetOrigin = window.location.origin;
    if (resetOrigin.includes('://www.')) {
      resetOrigin = resetOrigin.replace('://www.', '://');
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${resetOrigin}/auth/callback`,
    });
    return { error: error?.message ?? null };
  };

  const deleteAccount = async () => {
    if (!supabaseConfigured) return { error: notConfiguredError };
    if (!user) return { error: 'No user logged in' };
    const { error } = await supabase.rpc('delete_user');
    if (!error) await supabase.auth.signOut();
    return { error: error?.message ?? null };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut, resetPassword, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
