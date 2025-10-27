-- Migration: Add lifetime free access and configurable trial duration
-- Purpose:
--   1. Enable lifetime free access for founder account
--   2. Support custom trial durations for beta testers
-- Date: 2025-01-24

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_lifetime_free BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_duration_days INTEGER DEFAULT 7;

-- Add helpful comments
COMMENT ON COLUMN profiles.is_lifetime_free IS 'True for accounts with permanent free access (e.g., founder)';
COMMENT ON COLUMN profiles.trial_duration_days IS 'Custom trial duration in days (default: 7 days)';

-- Create index for querying lifetime free users
CREATE INDEX IF NOT EXISTS idx_profiles_lifetime_free ON profiles(is_lifetime_free) WHERE is_lifetime_free = true;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Added is_lifetime_free and trial_duration_days columns to profiles table';
END $$;
