-- Add email column to profiles table
-- This column stores the user's email address from auth.users for easier querying

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email TEXT;

COMMENT ON COLUMN profiles.email IS 'User email address, synced from auth.users';

-- Add subscription_end_date column to track when subscription access ends
-- This is different from subscription_start_date and represents:
-- - For active subscriptions: current_period_end (when next billing occurs)
-- - For cancelled subscriptions: cancel_at or current_period_end (when access ends)
-- - For expired subscriptions: the date access ended

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

COMMENT ON COLUMN profiles.subscription_end_date IS 'When subscription access ends. For active: current_period_end. For cancelled: when access expires. NULL for free/trial users.';

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_end_date ON profiles(subscription_end_date);

-- Populate existing profiles with emails from auth.users
-- This is safe to run multiple times (idempotent)
UPDATE profiles
SET email = auth.users.email
FROM auth.users
WHERE profiles.id = auth.users.id
AND profiles.email IS NULL;
