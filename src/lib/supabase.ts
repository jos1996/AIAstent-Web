import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vodhulbrqziyamcpdokz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZGh1bGJycXppeWFtY3Bkb2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzc5MzUsImV4cCI6MjA4NTQ1MzkzNX0.4HUs9qd7i6XbKwBcxprgk4_59Nx4l8DKZJO5VuzXruY';

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
