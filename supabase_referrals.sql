-- Referral System Tables for HelplyAI
-- Run this in Supabase SQL Editor

-- Table to store user referral codes
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table to track referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed
  credits_awarded BOOLEAN DEFAULT false,
  credits_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(referred_id) -- Each user can only be referred once
);

-- Enable RLS
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
DROP POLICY IF EXISTS "Users can view own referral code" ON referral_codes;
CREATE POLICY "Users can view own referral code" ON referral_codes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own referral code" ON referral_codes;
CREATE POLICY "Users can create own referral code" ON referral_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow anyone to look up a referral code (for validation during signup)
DROP POLICY IF EXISTS "Anyone can lookup referral codes" ON referral_codes;
CREATE POLICY "Anyone can lookup referral codes" ON referral_codes
  FOR SELECT USING (true);

-- RLS Policies for referrals
DROP POLICY IF EXISTS "Users can view referrals they made" ON referrals;
CREATE POLICY "Users can view referrals they made" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "Users can view if they were referred" ON referrals;
CREATE POLICY "Users can view if they were referred" ON referrals
  FOR SELECT USING (auth.uid() = referred_id);

DROP POLICY IF EXISTS "Users can create referral records" ON referrals;
CREATE POLICY "Users can create referral records" ON referrals
  FOR INSERT WITH CHECK (auth.uid() = referred_id);

DROP POLICY IF EXISTS "System can update referrals" ON referrals;
CREATE POLICY "System can update referrals" ON referrals
  FOR UPDATE USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
