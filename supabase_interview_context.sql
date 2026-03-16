-- Run this SQL in Supabase SQL Editor (https://supabase.com/dashboard)
-- Go to: SQL Editor > New Query > Paste this > Run

-- Create interview_context table for storing JD and Resume
CREATE TABLE IF NOT EXISTS interview_context (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_description TEXT,
  resume TEXT,
  extracted_skills TEXT[],
  extracted_experience TEXT,
  target_role TEXT,
  company_name TEXT,
  use_jd BOOLEAN DEFAULT true,
  use_resume BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- If table already exists, add the new columns
ALTER TABLE interview_context ADD COLUMN IF NOT EXISTS use_jd BOOLEAN DEFAULT true;
ALTER TABLE interview_context ADD COLUMN IF NOT EXISTS use_resume BOOLEAN DEFAULT true;

-- Enable RLS
ALTER TABLE interview_context ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own context" ON interview_context FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own context" ON interview_context FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own context" ON interview_context FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own context" ON interview_context FOR DELETE USING (auth.uid() = user_id);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_interview_context_user_id ON interview_context(user_id);
