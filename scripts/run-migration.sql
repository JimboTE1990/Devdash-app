-- Run this SQL in Supabase SQL Editor
-- This will add the missing columns and set founder to lifetime free

-- Step 1: Add columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_lifetime_free BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_duration_days INTEGER DEFAULT 7;

-- Step 2: Add comments for documentation
COMMENT ON COLUMN profiles.is_lifetime_free IS 'True for accounts with permanent free access (e.g., founder)';
COMMENT ON COLUMN profiles.trial_duration_days IS 'Custom trial duration in days (default: 7 days)';

-- Step 3: Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_lifetime_free ON profiles(is_lifetime_free) WHERE is_lifetime_free = true;

-- Step 4: Make founder lifetime free
UPDATE profiles
SET is_lifetime_free = true, updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'jfamarketingsolutions@gmail.com');

-- Step 5: Verify it worked
SELECT
  u.email,
  p.first_name,
  p.last_name,
  p.plan,
  p.is_lifetime_free,
  p.trial_duration_days,
  p.trial_start_date,
  p.trial_end_date
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'jfamarketingsolutions@gmail.com';
