-- Run this in Supabase SQL Editor
-- Creates secure api_keys table for storing OpenRouter and other API keys
-- Keys are stored per-user with RLS protection

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name VARCHAR(50) NOT NULL, -- e.g., 'openrouter', 'openai', etc.
  key_value TEXT NOT NULL, -- encrypted at application level if needed
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}', -- for storing credits info, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key_name)
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own keys
CREATE POLICY "Users can only access their own API keys"
  ON api_keys
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Instructions for inserting your OpenRouter key:
-- INSERT INTO api_keys (user_id, key_name, key_value, metadata)
-- VALUES (
--   'your-user-id',
--   'openrouter',
--   'sk-or-v1-...',
--   '{"provider": "openrouter", "models": ["mistral:free", "deepseek:free"]}'
-- );
