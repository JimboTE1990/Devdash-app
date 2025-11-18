# Fix Email Verification Issues - CRITICAL

## 🚨 Problem

New users see "Verification Failed" error when clicking email confirmation links, even though they are actually being verified. Then they see "Trial Expired" immediately.

## Root Cause

**Supabase default email template** sends verification URLs through Supabase's auth server:
```
https://PROJECT.supabase.co/auth/v1/verify?token=XXX&redirect_to=https://jimbula.co.uk/auth/confirm
```

But our app expects direct URLs with token_hash:
```
https://jimbula.co.uk/auth/confirm?token_hash=XXX&type=email
```

The URL format mismatch causes:
1. User gets redirected without proper parameters
2. Code can't extract token_hash to verify
3. Shows error even though verification succeeded on Supabase's end
4. Profile never gets created (complete-registration API not called)
5. No trial dates set

## ✅ Solution: Update Supabase Email Template

### Step 1: Login to Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project (unzikrmweevksqxllpnv)
3. Navigate to: **Authentication** → **Email Templates**

### Step 2: Update "Confirm signup" Template

Click on **"Confirm signup"** template and replace the content with:

```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your email address and activate your 7-day free trial:</p>

<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your email address</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email</p>

<p>This link expires in 24 hours.</p>
```

**Key changes:**
- Uses `{{ .SiteURL }}` (your app URL: https://www.jimbula.co.uk)
- Adds `/auth/confirm` path directly
- Uses `token_hash={{ .TokenHash }}` parameter
- Includes `&type=email` parameter
- Link goes directly to your app, NOT through Supabase verify endpoint

### Step 3: Verify Site URL is Set

1. In Supabase Dashboard: **Authentication** → **URL Configuration**
2. Ensure "Site URL" is set to: `https://www.jimbula.co.uk`
3. Ensure redirect URLs include: `https://www.jimbula.co.uk/auth/confirm`

### Step 4: Optional - Customize Magic Link Template Too

Click on **"Magic Link"** template and update similarly:

```html
<h2>Magic Link</h2>

<p>Follow this link to sign in:</p>

<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink">Sign in</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink</p>

<p>This link expires in 24 hours.</p>
```

---

## 🧪 Testing After Fix

### Test 1: New Signup

1. **Sign up** with a brand new email
2. **Check email** (should come from noreply@jimbula.co.uk)
3. **Look at the link URL** - should start with `https://www.jimbula.co.uk/auth/confirm?token_hash=`
4. **Click the link**
5. **Open browser console** (F12) to see logs
6. **Expected**:
   - Console shows: "Using OTP flow with token_hash"
   - Console shows: "Profile creation response"
   - Console shows: "Profile data" with trial dates
   - Success screen appears
   - Redirects to dashboard after 2 seconds
   - NO "trial expired" banner

### Test 2: Verify in Console Logs

Browser console should show (in order):
```
🔐 Using PKCE flow with code exchange
⚠️ Code exchange error: ... (if PKCE tried first)
-- OR --
Using OTP flow with token_hash
📝 Calling complete-registration API for user: [id]
✅ Profile creation response: { success: true, existing: false }
🔄 Refreshing session...
✅ Session refreshed successfully
👤 Updated session user ID: [id]
📊 Profile data: { plan: 'free', trial_end: '2025-11-24...', days_remaining: 7 }
```

### Test 3: Verify Profile in Database

1. Go to Supabase Dashboard → Table Editor → profiles
2. Find your profile
3. Check:
   - `trial_start_date` - should be set to now
   - `trial_end_date` - should be 7 days from now
   - `plan` - should be "free"
   - `has_used_trial` - should be false

---

## 🔧 Code Changes (Already Deployed)

The app code (commit 80a0562) already handles both formats:

### 1. PKCE Flow (code parameter)
```typescript
if (code) {
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  // ... handles code parameter
}
```

### 2. Token Hash Flow (token_hash parameter)
```typescript
else if (token_hash && type) {
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as any,
  })
  // ... handles token_hash parameter
}
```

### 3. Profile Creation with Trial
```typescript
// Calls API to create profile
const response = await fetch('/api/auth/complete-registration', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: user.id }),
})

// Refreshes session
await supabase.auth.refreshSession()

// Waits for profile to propagate
await new Promise(resolve => setTimeout(resolve, 1000))
```

---

## ⚠️ Why This Happened

Supabase's default email templates use `{{ .ConfirmationURL }}` which generates URLs like:
```
https://PROJECT.supabase.co/auth/v1/verify?token=XXX&type=email&redirect_to=https://jimbula.co.uk/auth/confirm
```

This URL:
1. Goes to Supabase's server first
2. Verifies the token there
3. Then redirects to your app
4. By the time it reaches your app, the token is already consumed
5. No parameters are passed to your app for creating the profile

By changing to `{{ .TokenHash }}` format, the link:
1. Goes directly to your app
2. Your app verifies the token with Supabase
3. Your app creates the profile
4. Everything works in the correct order

---

## 📋 Checklist

- [ ] Login to Supabase Dashboard
- [ ] Navigate to Authentication → Email Templates
- [ ] Update "Confirm signup" template with new URL format
- [ ] Save template
- [ ] Verify Site URL is set correctly
- [ ] Sign up with new test email
- [ ] Verify email link has correct format (starts with www.jimbula.co.uk)
- [ ] Click link and verify success screen appears
- [ ] Check browser console for confirmation logs
- [ ] Verify trial is active (no "expired" banner)
- [ ] Check Supabase profiles table for correct trial dates

---

## 🆘 Troubleshooting

### Still Seeing "Verification Failed"?

Check browser console:
- If you see "Using OTP flow with token_hash" → Email template is correct
- If you see "Using PKCE flow with code exchange" followed by error → Email template still using old format
- If you see "Invalid verification parameters" → URL is missing token_hash parameter

### Still Seeing "Trial Expired"?

Check browser console for:
```
📊 Profile data: { plan: 'free', trial_end: '...', days_remaining: 7 }
```

If you don't see this:
- Profile creation might be failing
- Check Vercel function logs for complete-registration errors
- Verify Supabase service role key is set correctly

### Email Link Still Goes to supabase.co Domain?

- Email template not saved correctly
- Clear browser cache
- Request new verification email (old one uses old template)

---

## Expected Timeline

| Step | Duration |
|------|----------|
| Update email template in Supabase | 2 minutes |
| Test with new signup | 3 minutes |
| Verify trial is working | 1 minute |
| **Total** | **6 minutes** |

---

**Priority**: 🚨🚨🚨 CRITICAL - Blocks ALL new user signups
**Difficulty**: Easy - Just update email template
**Impact**: HIGH - Fixes both verification error AND trial expiry issues

**Last Updated**: 2025-11-17
