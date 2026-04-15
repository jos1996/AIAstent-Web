-- Run this in Supabase SQL Editor
-- Creates the tailored_resumes table to store AI-tailored resumes

CREATE TABLE IF NOT EXISTS tailored_resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_text TEXT NOT NULL,
  jd_text TEXT NOT NULL,
  tailored_data JSONB NOT NULL,
  target_role TEXT,
  template_id TEXT DEFAULT 'modern',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tailored_resumes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own resumes" ON tailored_resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resumes" ON tailored_resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON tailored_resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON tailored_resumes FOR DELETE USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_tailored_resumes_user_id ON tailored_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_tailored_resumes_created ON tailored_resumes(created_at DESC);
