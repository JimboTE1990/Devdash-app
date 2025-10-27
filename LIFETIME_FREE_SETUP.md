# Lifetime Free Access & Configurable Trial Periods - Setup Guide

## Overview

This implementation adds:
1. **Lifetime Free Access** for the founder account (jfamarketingsolutions@gmail.com)
2. **Configurable Trial Periods** for beta testers (7, 30, 60, 90+ days)

## What Was Changed

### 1. Database Schema
**File**: `/supabase/migrations/add_lifetime_free_and_trial_duration.sql`

Added two new columns to `profiles` table:
- `is_lifetime_free` (BOOLEAN) - Permanent free access flag
- `trial_duration_days` (INTEGER) - Custom trial duration (default: 7 days)

### 2. TypeScript Types
**File**: `/src/lib/types.ts`

Updated `User` interface with:
```typescript
isLifetimeFree?: boolean
trialDurationDays?: number
```

### 3. Authentication Logic
**File**: `/src/context/AuthContext.tsx`

- Added `isLifetimeFree` computed property
- Updated `isPremium` to include lifetime free users
- Updated `requiresUpgrade` to exclude lifetime free users
- Updated profile fetching to include new fields

### 4. Registration API
**File**: `/src/app/api/auth/complete-registration/route.ts`

- Reads `trial_duration_days` from user metadata
- Calculates trial end date based on custom duration
- Stores trial duration in profile

### 5. Profile Page
**File**: `/src/app/profile/page.tsx`

- Shows "Lifetime Free" badge for founder
- Shows "Premium" for paid users
- Shows "Free Trial" for standard trial users

## Setup Instructions

### Step 1: Run Database Migration

1. Open Supabase Dashboard: https://app.supabase.com
2. Navigate to: **SQL Editor**
3. Copy and paste the contents of `/supabase/migrations/add_lifetime_free_and_trial_duration.sql`
4. Click **Run** to execute the migration

### Step 2: Make Founder Lifetime Free

1. In Supabase SQL Editor
2. Copy and paste the contents of `/supabase/make_founder_lifetime_free.sql`
3. Click **Run** to execute

This will:
- Set `is_lifetime_free = true` for jfamarketingsolutions@gmail.com
- Verify the update with a SELECT query

### Step 3: Verify Setup

1. Log in as founder (jfamarketingsolutions@gmail.com)
2. Navigate to Profile page
3. Verify "Plan Status" shows **"Lifetime Free"**
4. Confirm full premium access with no trial expiration

## How It Works

### For Founder Account
- `is_lifetime_free = true` in database
- `isPremium` returns `true` (via `isLifetimeFree`)
- `requiresUpgrade` returns `false` (never expires)
- Profile page shows "Lifetime Free"
- Never prompted to upgrade or pay

### For Standard Users
- `is_lifetime_free = false` (default)
- `trial_duration_days = 7` (default)
- Trial expires after 7 days
- `requiresUpgrade` returns `true` after trial ends

### For Beta Testers (Custom Trials)

To give a beta tester a 30-day trial:

1. During registration, set user metadata:
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'betatester@example.com',
  password: 'password',
  options: {
    data: {
      first_name: 'Beta',
      last_name: 'Tester',
      trial_duration_days: 30  // Custom trial duration
    }
  }
})
```

2. The registration API will automatically:
   - Read `trial_duration_days` from metadata
   - Calculate trial end date (now + 30 days)
   - Store trial duration in profile

## Files Modified

1. ✅ `/supabase/migrations/add_lifetime_free_and_trial_duration.sql` (NEW)
2. ✅ `/supabase/make_founder_lifetime_free.sql` (NEW)
3. ✅ `/src/lib/types.ts` (UPDATED)
4. ✅ `/src/context/AuthContext.tsx` (UPDATED)
5. ✅ `/src/app/api/auth/complete-registration/route.ts` (UPDATED)
6. ✅ `/src/app/profile/page.tsx` (UPDATED)

## Benefits

✅ **Founder has lifetime free access** - Never expires, never requires payment
✅ **Flexible trial periods** - Can assign 7, 30, 60, 90+ days per user
✅ **No breaking changes** - Existing users unaffected
✅ **Future-proof** - Easy to add more special account types
✅ **Backend configurable** - No code changes needed for new beta testers

## Future Enhancements

You can create an admin API endpoint to set custom trial durations:

**File**: `/src/app/api/admin/set-trial-duration/route.ts`
```typescript
export async function POST(req: NextRequest) {
  const { email, trialDurationDays } = await req.json()

  // Update user metadata
  const { data: user } = await supabaseAdmin.auth.admin.getUserByEmail(email)

  await supabaseAdmin
    .from('profiles')
    .update({ trial_duration_days: trialDurationDays })
    .eq('id', user.id)
}
```

## Support

If you encounter any issues:
1. Check Supabase logs for errors
2. Verify migration ran successfully
3. Confirm founder email matches exactly: `jfamarketingsolutions@gmail.com`
4. Check profile table has both new columns
