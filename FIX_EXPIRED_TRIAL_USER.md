# Fix Expired Trial User Account

## Issue
User account can still access features even though trial has expired.

## Root Cause
Your existing user account has incorrect trial data:
- Possibly `trial_end_date` is `NULL`
- Or `trial_end_date` is in the future
- Or `plan` is set to something other than 'free'

---

## Solution: Update Your Account in Supabase

### Option 1: SQL Query (Recommended - Fast)

1. **Go to Supabase Dashboard** → SQL Editor
2. **Run this query** (replace `your-email@example.com` with your actual email):

```sql
-- Step 1: Find your user ID
SELECT id, email, plan, trial_start_date, trial_end_date, has_used_trial
FROM profiles
WHERE email = (
  SELECT email FROM auth.users WHERE email = 'your-email@example.com'
);

-- Step 2: Set trial as EXPIRED (uncomment and run after Step 1)
-- UPDATE profiles
-- SET
--   plan = 'free',
--   trial_start_date = NOW() - INTERVAL '8 days',  -- Started 8 days ago
--   trial_end_date = NOW() - INTERVAL '1 day',     -- Expired 1 day ago
--   has_used_trial = true,                         -- Trial has been used
--   updated_at = NOW()
-- WHERE email = (
--   SELECT email FROM auth.users WHERE email = 'your-email@example.com'
-- );

-- Step 3: Verify the update
-- SELECT id, email, plan, trial_start_date, trial_end_date, has_used_trial
-- FROM profiles
-- WHERE email = (
--   SELECT email FROM auth.users WHERE email = 'your-email@example.com'
-- );
```

3. **Log out and log back in** to see changes

---

### Option 2: Table Editor (Visual - Easier)

1. **Go to Supabase Dashboard** → Table Editor → **profiles** table
2. **Find your row** (search by email)
3. **Click Edit** on your row
4. **Update these fields**:
   ```
   plan: free
   trial_start_date: [8 days ago] (e.g., 2025-01-05T12:00:00.000Z)
   trial_end_date: [1 day ago] (e.g., 2025-01-12T12:00:00.000Z)
   has_used_trial: true
   ```
5. **Click Save**
6. **Log out and log back in**

---

## Expected Result After Fix

✅ **Red "Trial Expired" banner** appears in header
✅ **All 4 feature pages** (Planner, Calendar, Ideas, Finance) show upgrade prompt
✅ **Cannot access features** until upgrading to premium
✅ **Upgrade button** redirects to `/pricing`

---

## To Test Fresh Trial (Clean Slate)

If you want to test the **7-day trial flow properly**, create a new account:

```sql
-- Create new test user (use Supabase UI to register)
-- This will have:
-- - plan: 'free'
-- - trial_start_date: NOW()
-- - trial_end_date: NOW() + 7 days
-- - has_used_trial: false
```

**Steps**:
1. Go to https://jimbula.co.uk/auth
2. Register with **new email** (e.g., yourname+test2@gmail.com)
3. Verify email
4. Test that trial shows 7 days remaining
5. Test all features work during trial
6. Test payment flow with `4242 4242 4242 4242`

---

## Summary

**Your Current Account Issues**:
1. ❌ Trial dates not set correctly
2. ❌ `requiresUpgrade` returns `false` because `trialEndDate` is NULL or future
3. ❌ Can access all features even though should be locked out

**After Fix**:
1. ✅ Trial dates set to past (expired)
2. ✅ `requiresUpgrade` returns `true`
3. ✅ All features show upgrade prompt
4. ✅ Cannot use app until upgrading

---

**Quick Test**: After updating your account data, visit https://jimbula.co.uk/planner-v2 - you should see the upgrade prompt immediately.
