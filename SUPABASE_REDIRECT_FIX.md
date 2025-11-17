# Fix "Expected Path is Invalid" Error - URGENT

## 🚨 Problem

Users seeing **"expected path is invalid"** error when clicking email confirmation or password reset links. This is a **Supabase configuration issue**, not a code issue.

## ✅ Solution

You need to configure the allowed redirect URLs in your Supabase dashboard.

---

## 🔧 Fix Steps (2 minutes)

### Step 1: Go to Supabase Dashboard

1. **Login**: https://supabase.com/dashboard
2. **Select your project** (devdash-app / jimbula)
3. **Navigate to Authentication Settings**:
   - Left sidebar → Click "Authentication"
   - Click "URL Configuration"

### Step 2: Add Redirect URLs

You need to add these **exact URLs** to your Supabase configuration:

#### Site URL
```
https://www.jimbula.co.uk
```

#### Redirect URLs (Add ALL of these)
```
https://www.jimbula.co.uk/auth/confirm
https://www.jimbula.co.uk/auth/reset-password
https://www.jimbula.co.uk/dashboard
https://jimbula.co.uk/auth/confirm
https://jimbula.co.uk/auth/reset-password
https://jimbula.co.uk/dashboard
http://localhost:3000/auth/confirm
http://localhost:3000/auth/reset-password
http://localhost:3000/dashboard
http://localhost:4000/auth/confirm
http://localhost:4000/auth/reset-password
http://localhost:4000/dashboard
```

**Important**: Include BOTH `www.jimbula.co.uk` and `jimbula.co.uk` versions!

### Step 3: Save Configuration

1. Click **"Save"** at the bottom of the page
2. Wait 1-2 minutes for changes to propagate

### Step 4: Test

1. Request a new password reset or sign up with new email
2. Click the link in the email
3. Should now work without "invalid path" error

---

## 📋 Detailed Configuration

### In Supabase Dashboard → Authentication → URL Configuration

#### 1. Site URL
The base URL of your site:
```
https://www.jimbula.co.uk
```

#### 2. Redirect URLs
All URLs that users can be redirected to after authentication actions.

**Format**: One URL per line

```
https://www.jimbula.co.uk/auth/confirm
https://www.jimbula.co.uk/auth/reset-password
https://www.jimbula.co.uk/dashboard
https://jimbula.co.uk/auth/confirm
https://jimbula.co.uk/auth/reset-password
https://jimbula.co.uk/dashboard
http://localhost:3000/auth/confirm
http://localhost:3000/auth/reset-password
http://localhost:3000/dashboard
http://localhost:4000/auth/confirm
http://localhost:4000/auth/reset-password
http://localhost:4000/dashboard
```

**Why both www and non-www?**
- Users might access site via either URL
- Email links might use either format
- Prevents redirect errors regardless of which URL is used

**Why localhost?**
- For local development and testing
- Won't affect production but makes dev easier

---

## 🔍 How to Verify Current Settings

### Check What's Currently Configured

1. Go to: Supabase Dashboard → Authentication → URL Configuration
2. Look at "Redirect URLs" section
3. If you see only `http://localhost:3000/**` or similar, that's the problem!

### What You Should See After Fix

**Site URL:**
```
https://www.jimbula.co.uk
```

**Redirect URLs:** (Should show all URLs listed above)

---

## 🧪 Testing After Fix

### Test Email Confirmation (New Signup)

1. Go to: https://www.jimbula.co.uk/auth
2. Register with a new email
3. Check email for confirmation link
4. Click link
5. **Should see**: "Email Verified! Your 7-day free trial has started"
6. **Should redirect**: To dashboard after 2 seconds

### Test Password Reset

1. Go to: https://www.jimbula.co.uk/auth/forgot-password
2. Enter your email
3. Check email for reset link
4. Click link
5. **Should see**: Password reset form (NOT error)
6. Enter new password
7. **Should see**: Success screen with redirect

---

## 💡 Why This Happens

Supabase has security measures to prevent redirect attacks. They only allow redirects to URLs you've explicitly whitelisted.

**Default behavior:**
- Supabase blocks any redirect not in the whitelist
- Shows "expected path is invalid" error
- Protects against malicious redirect attacks

**After configuration:**
- Supabase allows redirects to your specified URLs
- Email confirmation and password reset work correctly
- Your app functions as expected

---

## 🆘 Troubleshooting

### Still Getting Error After Adding URLs?

**1. Check Exact URL Match**
- URLs must match EXACTLY (including protocol, subdomain, path)
- `https://www.jimbula.co.uk/auth/confirm` ≠ `https://jimbula.co.uk/auth/confirm`
- Add both versions to be safe

**2. Wait for Propagation**
- Changes can take 1-2 minutes to propagate
- Clear browser cache or use incognito mode
- Request a NEW email (old links use old config)

**3. Check Email Link URL**
- Look at the actual URL in the email
- Example: `https://www.jimbula.co.uk/auth/confirm?code=xxx&redirect_to=...`
- The base URL and redirect_to must both be whitelisted

**4. Check for Trailing Slashes**
- Try adding both with and without trailing slashes:
  - `https://www.jimbula.co.uk/auth/confirm`
  - `https://www.jimbula.co.uk/auth/confirm/`

### Error: "Invalid redirect URL"
- The redirect URL in your code doesn't match Supabase config
- Check `AuthContext.tsx` line 151 and 111 for redirect URLs
- Ensure they match what's in Supabase dashboard

### Error: "Unable to validate email"
- Link may have expired (24 hour limit)
- Request a new confirmation or reset email
- Use the new link

---

## 📊 What This Fixes

### Before Fix
- ❌ Email confirmation shows "expected path is invalid"
- ❌ Password reset shows "expected path is invalid"
- ❌ Users can't complete onboarding
- ❌ Users can't reset passwords
- ❌ Trial never activates

### After Fix
- ✅ Email confirmation works perfectly
- ✅ Password reset works perfectly
- ✅ Users see proper success screens
- ✅ 7-day trial activates automatically
- ✅ Users redirected to dashboard

---

## 🎯 Expected Outcome

After configuring redirect URLs correctly:

✅ New signups can verify their email
✅ Email verification shows success screen
✅ 7-day trial activates immediately
✅ Users redirected to dashboard
✅ Password reset flow works end-to-end
✅ No more "invalid path" errors

---

## 📚 Related Files

- **Email confirmation**: `src/app/auth/confirm/page.tsx`
- **Password reset**: `src/app/auth/reset-password/page.tsx`
- **Auth context**: `src/context/AuthContext.tsx` (lines 111, 151)
- **Trial activation**: `src/app/api/auth/complete-registration/route.ts`

---

**Priority**: 🚨 CRITICAL - Blocks all user onboarding
**Fix Time**: 2 minutes (just configuration in Supabase dashboard)
**No Code Changes Required**: This is purely a Supabase configuration issue

**Last Updated**: 2025-11-17
