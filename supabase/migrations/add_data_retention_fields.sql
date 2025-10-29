-- Add data retention tracking fields
-- This migration adds fields to track when user data should be deleted for GDPR compliance

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deletion_scheduled_date TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deletion_warning_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_downgrade_date TIMESTAMPTZ;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_deletion_scheduled ON profiles(deletion_scheduled_date);
CREATE INDEX IF NOT EXISTS idx_profiles_last_downgrade ON profiles(last_downgrade_date);

-- Add comments for documentation
COMMENT ON COLUMN profiles.deletion_scheduled_date IS 'Date when user data will be automatically deleted (GDPR compliance). Set to 90 days after trial expiry or 12 months after subscription cancellation.';
COMMENT ON COLUMN profiles.last_downgrade_date IS 'Date when subscription was cancelled or trial expired. Used to calculate deletion_scheduled_date.';
COMMENT ON COLUMN profiles.deletion_warning_sent IS 'Whether 30-day deletion warning email was sent to the user.';
