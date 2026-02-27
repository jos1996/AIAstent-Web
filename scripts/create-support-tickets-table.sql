-- ============================================================
-- Support Tickets Table Migration
-- ============================================================
-- This creates a table to store help/support requests and bug reports
-- from the Help Center page

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Ticket type: 'contact' for general support, 'bug' for bug reports
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('contact', 'bug')),
  
  -- Contact Support fields
  subject TEXT,
  message TEXT,
  
  -- Bug Report fields
  bug_category TEXT CHECK (bug_category IN ('bug', 'feature', 'performance', 'other')),
  bug_description TEXT,
  
  -- Metadata
  user_email TEXT,
  user_name TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  -- Users can view their own tickets
  BEGIN
    CREATE POLICY "Users can view own support tickets" ON public.support_tickets
      FOR SELECT USING (auth.uid() = user_id);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  
  -- Users can insert their own tickets
  BEGIN
    CREATE POLICY "Users can create support tickets" ON public.support_tickets
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  
  -- Users can update their own tickets (e.g., add more info)
  BEGIN
    CREATE POLICY "Users can update own support tickets" ON public.support_tickets
      FOR UPDATE USING (auth.uid() = user_id);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_support_tickets_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT USAGE ON SEQUENCE support_tickets_id_seq TO authenticated;
