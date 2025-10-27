-- Make founder account (jfamarketingsolutions@gmail.com) lifetime free
-- Run this script in Supabase SQL Editor after running the migration

-- First, run the migration to add the new columns:
-- /supabase/migrations/add_lifetime_free_and_trial_duration.sql

-- Then run this script to make the founder lifetime free:

-- Update the founder's profile to have lifetime free access
UPDATE profiles
SET
  is_lifetime_free = true,
  updated_at = NOW()
WHERE id = (
  SELECT id
  FROM auth.users
  WHERE email = 'jfamarketingsolutions@gmail.com'
);

-- Verify the update
SELECT
  p.id,
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

-- Expected result:
-- is_lifetime_free should be TRUE
-- This user will now have permanent premium access without ever needing to pay
