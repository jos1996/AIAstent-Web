import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isPlaceholder = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id') || supabaseAnonKey.includes('your-supabase');

if (isPlaceholder) {
  console.warn('Supabase credentials missing or placeholder. Auth features will be disabled.');
}

export const supabaseConfigured = !isPlaceholder;

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      autoRefreshToken: !isPlaceholder,
      persistSession: !isPlaceholder,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
);
