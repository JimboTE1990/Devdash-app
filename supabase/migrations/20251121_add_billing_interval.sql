-- Add billing_interval column to profiles table
-- This tracks whether the user is on a monthly or annual subscription plan

ALTER TABLE profiles
ADD COLUMN billing_interval TEXT CHECK (billing_interval IN ('monthly', 'annual'));

-- Add comment for documentation
COMMENT ON COLUMN profiles.billing_interval IS 'Subscription billing interval: monthly or annual. NULL for free/trial users.';
