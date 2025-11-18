-- Add missing trial-related columns to profiles table
-- These columns are required for the decoupled trial flow

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS trial_duration_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_lifetime_free BOOLEAN DEFAULT false;

-- Add comment explaining these columns
COMMENT ON COLUMN profiles.trial_duration_days IS 'Number of days in the free trial (default 7)';
COMMENT ON COLUMN profiles.has_used_trial IS 'Whether the user has ever activated a trial';
COMMENT ON COLUMN profiles.is_lifetime_free IS 'Whether the user has lifetime free access';
