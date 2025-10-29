-- Add has_used_trial field to profiles table
-- This field tracks whether a user has started their free trial
-- Used to prevent multiple trials from the same user

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_has_used_trial ON profiles(has_used_trial);

-- Update existing users who have trial_start_date to mark has_used_trial as true
UPDATE profiles
SET has_used_trial = TRUE
WHERE trial_start_date IS NOT NULL AND has_used_trial = FALSE;

-- Add comment for documentation
COMMENT ON COLUMN profiles.has_used_trial IS 'Indicates whether the user has ever started a free trial. Used to prevent multiple trials.';
