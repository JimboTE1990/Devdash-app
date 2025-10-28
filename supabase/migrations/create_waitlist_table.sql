-- Create waitlist table for storing email signups
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  plan TEXT NOT NULL, -- 'enterprise' or other future plans
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  notified BOOLEAN DEFAULT FALSE, -- Track if we've sent launch notification
  metadata JSONB DEFAULT '{}'::jsonb, -- Store any additional data

  -- Prevent duplicate emails for same plan
  UNIQUE(email, plan)
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_plan ON public.waitlist(plan);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (public signup)
CREATE POLICY "Anyone can sign up for waitlist"
  ON public.waitlist
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Only service role can read/update/delete
CREATE POLICY "Only service role can manage waitlist"
  ON public.waitlist
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE public.waitlist IS 'Stores email signups for product launch waiting lists';
