-- Simple migration: Just add the new columns (skip enum creation since it exists)
-- Run this in Supabase SQL Editor

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_lifetime_free BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_duration_days INTEGER DEFAULT 7;

-- Add helpful comments
COMMENT ON COLUMN profiles.is_lifetime_free IS 'True for accounts with permanent free access (e.g., founder)';
COMMENT ON COLUMN profiles.trial_duration_days IS 'Custom trial duration in days (default: 7 days)';

-- Create index for querying lifetime free users
CREATE INDEX IF NOT EXISTS idx_profiles_lifetime_free ON profiles(is_lifetime_free) WHERE is_lifetime_free = true;

-- Display success message
SELECT 'Migration completed successfully!' as message;
