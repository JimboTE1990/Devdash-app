# Step-by-Step Fix Guide

## Critical Issue: Trial claim fails with "Failed to update trial"

This guide has **2 parts** - both are required:

---

## PART 1: Run Database Migrations (SQL Editor)

### Where to Find SQL Editor

1. Go to https://supabase.com/dashboard
2. Click on your **Jimbula project**
3. Look at the **left sidebar**
4. Click on the **SQL Editor** icon (looks like a database/table icon)
5. You should see "SQL Editor" at the top

### Migration 1: Add Missing Columns

**What this does**: Adds 3 columns that the trial claim API needs

1. In SQL Editor, click **"New Query"** button (top right)
2. **Copy this entire SQL code** and paste it into the editor:

```sql
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
```

3. Click **"Run"** button (or press Ctrl+Enter)
4. Wait for success message: "Success. No rows returned"
5. ✅ Migration 1 complete!

### Migration 2: Update User Trigger

**What this does**: Stops auto-creating empty profiles that conflict with trial claim

1. In SQL Editor, click **"New Query"** button again
2. **Copy this entire SQL code** and paste it:

```sql
-- Update handle_new_user function to NOT create profile automatically
-- This allows the trial claim API to create profiles with proper trial dates
-- The trigger will only create user_preferences now

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create user preferences, NOT the profile
  -- Profile will be created by /api/trial/claim when user claims their trial
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment explaining the change
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates user preferences only. Profile is created when user claims trial via /api/trial/claim';
```

3. Click **"Run"** button
4. Wait for success message: "Success. No rows returned"
5. ✅ Migration 2 complete!

### Verify Migrations Worked

Run this query to check the columns exist:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('trial_duration_days', 'has_used_trial', 'is_lifetime_free')
ORDER BY column_name;
```

You should see **3 rows** returned with these columns.

---

## PART 2: Update Email Template (Email Templates Page)

### Where to Find Email Templates

1. In Supabase Dashboard (left sidebar)
2. Click on **"Authentication"** (shield icon)
3. At the top of the page, you'll see tabs: **Users | Policies | Providers | Email Templates | ...**
4. Click the **"Email Templates"** tab
5. You should see a list of templates like:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

### Update "Confirm signup" Template

1. Click on **"Confirm signup"** in the list
2. You'll see an editor with the current HTML
3. **Select all the text** (Ctrl+A / Cmd+A) and **delete it**
4. **Paste this new template**:

```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your email address:</p>

<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your email address</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email</p>

<p>This link expires in 24 hours.</p>
```

5. Click **"Save"** button (bottom right)
6. ✅ Email template updated!

### Verify Site URL is Correct

1. Still in **Authentication** section
2. Click on **"URL Configuration"** (in the tabs at top)
3. Check **"Site URL"** field - should be: `https://www.jimbula.co.uk`
4. Check **"Redirect URLs"** - should include: `https://www.jimbula.co.uk/**`
5. If not correct, update and **Save**

---

## Testing the Fix

### Test with Brand New Email

1. **Sign up** with a completely new email address you've never used
2. **Check your email inbox**
3. **Look at the verification link** - it should start with:
   ```
   https://www.jimbula.co.uk/auth/confirm?token_hash=...
   ```
   (NOT `https://...supabase.co/auth/v1/verify`)

4. **Click the verification link**
5. Should see success message and redirect to dashboard
6. Should see **"Claim Your Free Trial"** screen
7. **Click "Claim My 7-Day Free Trial"** button
8. Should say "Activating Your Trial..." then unlock the dashboard
9. ✅ **Success!** Trial is active

### Check Browser Console (Optional)

Press F12 (Chrome/Edge) or Cmd+Option+I (Mac) and look for:

```
✅ Email verified for user: [your-id]
📝 Calling trial claim API...
✅ Trial activated successfully
```

---

## What Each Part Fixes

### Part 1 (SQL Migrations):
- ✅ Fixes "Failed to update trial" error
- ✅ Allows trial claim button to work
- ✅ Profiles created with proper trial dates

### Part 2 (Email Template):
- ✅ Fixes email verification error
- ✅ Users reach dashboard successfully
- ✅ Link goes directly to app (not through Supabase)

---

## Troubleshooting

### SQL Editor: "column already exists"
- ✅ Safe to ignore - means you already ran the migration

### SQL Editor: Other errors
- ❌ Copy the error message and share it
- Check you copied the ENTIRE SQL block

### Email Templates: Can't find "Email Templates" tab
- Make sure you clicked **"Authentication"** first (in left sidebar)
- Look for tabs at the TOP of the page (not sidebar)
- Tab is between "Providers" and other options

### Trial claim still fails after migrations
- Wait 2-3 minutes for Vercel deployment
- Try with a **brand new email** (not previously used)
- Check Vercel function logs for errors

### Email link still goes to supabase.co
- Email template not saved properly
- Request a NEW verification email (old one uses old template)

---

## Quick Summary

**Total time**: ~10 minutes
**Difficulty**: Easy (copy/paste SQL and HTML)
**Required**: Both parts must be completed

1. ✅ Run SQL Migration 1 (add columns)
2. ✅ Run SQL Migration 2 (update trigger)
3. ✅ Update email template
4. ✅ Test with new signup

After completing both parts, new users can:
- Sign up successfully ✅
- Verify email successfully ✅
- See "Claim Trial" screen ✅
- Click button and activate trial ✅
- Use app for 7 days ✅
