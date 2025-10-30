# Fix Lifetime Account - jfamarketingsolutions@gmail.com

## Issue
The lifetime account (jfamarketingsolutions@gmail.com) is showing as "invalid" in production.

## Root Causes (Check These)

### 1. Email Not Verified
The account may not have been email verified in production Supabase.

### 2. Missing Database Columns
The `is_lifetime_free` column may not exist in production database.

### 3. Flag Not Set
Even if columns exist, the `is_lifetime_free` flag may not be set to `true`.

---

## Solution Steps

### Step 1: Access Production Supabase

1. Go to: https://app.supabase.com
2. Select your **PRODUCTION** project (jimbula.co.uk)
3. Important: Make sure you're NOT in the staging/dev project

### Step 2: Check Email Verification Status

1. Navigate to: **Authentication** > **Users**
2. Search for: `jfamarketingsolutions@gmail.com`
3. Check the **Email Confirmed** column
   - ✅ If TRUE: Email is verified, proceed to Step 3
   - ❌ If FALSE: Continue to fix below

**To Fix Email Verification:**
1. Click on the user row
2. Click "Send verification email" OR
3. Click the "..." menu > "Confirm email"
4. Confirm the action

### Step 3: Check Database Schema

1. Navigate to: **SQL Editor** > **New Query**
2. Run this query to check if columns exist:

```sql
-- Check if lifetime columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('is_lifetime_free', 'trial_duration_days');
```

**Expected Result:**
- Should return 2 rows showing both columns exist
- If returns 0 rows: Migration hasn't been run (see Step 3b)

### Step 3b: Run Migration (If Columns Missing)

If columns don't exist, run the migration:

```sql
-- Add lifetime free and trial duration columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_lifetime_free BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS trial_duration_days INTEGER DEFAULT 7;

-- Add comments for documentation
COMMENT ON COLUMN profiles.is_lifetime_free IS 'Set to true for accounts with permanent free premium access';
COMMENT ON COLUMN profiles.trial_duration_days IS 'Custom trial duration in days (default: 7)';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_lifetime_free ON profiles(is_lifetime_free);
```

### Step 4: Set Lifetime Free Flag

Run this SQL to make the account lifetime free:

```sql
-- Make founder account lifetime free
UPDATE profiles
SET
  is_lifetime_free = true,
  plan = 'premium',  -- Ensure plan is premium
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
  u.email_confirmed_at,
  p.first_name,
  p.last_name,
  p.plan,
  p.is_lifetime_free,
  p.trial_duration_days,
  p.trial_start_date,
  p.trial_end_date,
  p.subscription_start_date
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'jfamarketingsolutions@gmail.com';
```

**Expected Result:**
- `email_confirmed_at`: Should have a date (not null)
- `plan`: Should be 'premium'
- `is_lifetime_free`: Should be TRUE
- `trial_end_date`: Can be any value (ignored for lifetime free)

### Step 5: Test Login

1. Open production site: https://jimbula.co.uk
2. Login with: jfamarketingsolutions@gmail.com
3. Verify you can access the dashboard
4. Go to Profile page
5. Check "Plan Status" shows: **"Lifetime Free"**

---

## Troubleshooting

### Issue: "Email not confirmed"
**Solution:** In Supabase Auth > Users, click the user and confirm email manually

### Issue: "UPDATE command returned 0 rows"
**Solution:** User doesn't exist in profiles table. Check auth.users:

```sql
-- Check if user exists in auth
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'jfamarketingsolutions@gmail.com';
```

If user exists but no profile:
```sql
-- Create profile manually
INSERT INTO profiles (
  id,
  first_name,
  last_name,
  plan,
  is_lifetime_free,
  trial_duration_days,
  created_at,
  updated_at
)
SELECT
  id,
  'Jamie',  -- Update with real first name
  'Fletcher',  -- Update with real last name
  'premium',
  true,
  7,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'jfamarketingsolutions@gmail.com'
ON CONFLICT (id) DO NOTHING;
```

### Issue: "Invalid login credentials"
**Possible causes:**
1. Wrong password - Reset password via "Forgot Password"
2. Email not verified - See Step 2
3. User deleted - Recreate account

**To reset password manually (in Supabase):**
```sql
-- Generate new password reset link
SELECT
  u.email,
  u.id
FROM auth.users u
WHERE u.email = 'jfamarketingsolutions@gmail.com';

-- Then in Supabase Dashboard:
-- Auth > Users > Click user > Send password reset email
```

---

## Prevention

To prevent this in future, add this to your deployment checklist:

**After Every Fresh Database Setup:**
1. ✅ Run all migrations
2. ✅ Run `make_founder_lifetime_free.sql`
3. ✅ Verify email confirmed
4. ✅ Test login works

---

## Quick Reference SQL

### Check Account Status
```sql
SELECT
  u.email,
  u.email_confirmed_at,
  p.plan,
  p.is_lifetime_free,
  p.trial_end_date
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'jfamarketingsolutions@gmail.com';
```

### Fix Everything at Once
```sql
-- Add columns if missing
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_lifetime_free BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS trial_duration_days INTEGER DEFAULT 7;

-- Set lifetime free
UPDATE profiles
SET
  is_lifetime_free = true,
  plan = 'premium',
  updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'jfamarketingsolutions@gmail.com');

-- Verify
SELECT u.email, u.email_confirmed_at, p.plan, p.is_lifetime_free
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'jfamarketingsolutions@gmail.com';
```

---

**Status**: Ready to run
**Estimated Time**: 5 minutes
**Risk**: Low (only affects one account)
**Rollback**: Change `is_lifetime_free` back to false if needed
