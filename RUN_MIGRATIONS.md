# Database Migrations Required

## Critical: Run These Migrations ASAP

Two migrations are required to fix the trial claim functionality:

### Migration 1: Add Trial Columns
**File**: `supabase/migrations/20250118_add_trial_columns.sql`

**What it does**: Adds missing columns to the `profiles` table:
- `trial_duration_days` (INTEGER, default 7)
- `has_used_trial` (BOOLEAN, default false)
- `is_lifetime_free` (BOOLEAN, default false)

### Migration 2: Update User Trigger
**File**: `supabase/migrations/20250118_update_user_trigger.sql`

**What it does**: Modifies the `handle_new_user()` trigger to NOT auto-create profiles. This allows the trial claim API to create profiles with proper trial dates instead.

## How to Run

### Option 1: Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `supabase/migrations/20250118_add_trial_columns.sql`
6. Paste and click **Run**
7. Wait for success message
8. Click **New Query** again
9. Copy the contents of `supabase/migrations/20250118_update_user_trigger.sql`
10. Paste and click **Run**
11. Wait for success message

### Option 2: Supabase CLI (If Installed)

```bash
supabase db push
```

This will apply all pending migrations.

## After Running Migrations

1. Test with a brand new email address
2. Sign up → Verify email → See ClaimTrialPrompt
3. Click "Claim My 7-Day Free Trial"
4. Should successfully activate trial and unlock features

## Fixing Existing Test Accounts

If you have existing test accounts that were created before these migrations, you can fix them with this SQL:

```sql
-- Delete the empty profile created by old trigger
DELETE FROM profiles WHERE id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_TEST_EMAIL@example.com'
);

-- The user can now click "Claim Trial" and it will create a proper profile with trial dates
```

## Why These Migrations Are Needed

**Problem**: The `/api/trial/claim` endpoint was trying to write to columns that didn't exist in the database:
- `trial_duration_days`
- `has_used_trial`
- `is_lifetime_free`

This caused the "Failed to update trial" error.

**Solution**: Add these columns to the schema and update the user creation trigger to not interfere with the trial claim flow.

## Verification

After running migrations, check the schema:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY column_name;
```

You should see:
- `has_used_trial` (boolean, default false)
- `is_lifetime_free` (boolean, default false)
- `trial_duration_days` (integer, default 7)
- `trial_end_date` (timestamp with time zone)
- `trial_start_date` (timestamp with time zone)

## Troubleshooting

**Error: "column already exists"**
- Safe to ignore, means migration already ran

**Error: "function already exists"**
- Safe to ignore, means trigger migration already ran

**Still getting "Failed to update trial"**
- Check Vercel function logs for detailed error message
- Verify migrations ran successfully
- Check if columns exist in database schema
