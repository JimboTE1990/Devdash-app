# Password Reset Rate Limit Issue - URGENT FIX

## 🚨 Problem

Users hitting "rate limit exceeded" error when requesting password reset emails. This happens because Supabase has a default limit of **2 emails per hour** when using their default email service.

## ✅ Solution

Configure Supabase to use your **Brevo SMTP server** instead of Supabase's default email service. This bypasses the 2 emails/hour limitation.

---

## 🔧 Fix Steps (5 minutes)

### Step 1: Verify Brevo SMTP Configuration in Supabase

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: devdash-app / jimbula
3. **Navigate to Authentication Settings**:
   - Left sidebar → Click "Settings" (⚙️ gear icon)
   - Click "Authentication"
4. **Scroll down to "SMTP Settings"**
5. **Check if "Enable Custom SMTP" is ON**:
   - ✅ If **ON**: Verify the settings match below
   - ❌ If **OFF**: Enable it and configure with settings below

### Step 2: Configure Brevo SMTP (if not already configured)

**Required Settings:**
```
Host: smtp-relay.brevo.com
Port: 587
Username: [Your Brevo account email]
Password: [Your Brevo SMTP key - starts with xsmtpsib-...]
Sender Email: noreply@jimbula.co.uk
Sender Name: Jimbula
```

**How to Get Brevo SMTP Key:**
1. Login to Brevo: https://app.brevo.com
2. Click your name (top-right) → "SMTP & API"
3. Click "SMTP" tab
4. Click "Create a new SMTP key" (or view existing)
5. Copy the key (starts with `xsmtpsib-...`)

### Step 3: Test the Configuration

After saving SMTP settings in Supabase:

1. **Wait 2-3 minutes** for Supabase to apply changes
2. **Request a password reset** from your app
3. **Check email delivery** (should arrive within seconds)
4. **Try multiple resets** (should NOT hit rate limit anymore)

---

## 📊 Rate Limits Comparison

### Using Supabase Default Email Service (PROBLEM)
- ❌ Limit: **2 emails per hour**
- ❌ Affects all users globally
- ❌ No way to increase without custom SMTP
- ❌ Users get "rate limit exceeded" error

### Using Brevo SMTP (SOLUTION)
- ✅ Limit: **300 emails per day** (free tier)
- ✅ Can upgrade to 40,000+ emails/day
- ✅ Per-account limit (not global)
- ✅ Much more reliable delivery
- ✅ Better spam protection with DNS setup

---

## 🧪 How to Test if Fix is Working

### Test 1: Send Multiple Password Resets
```
1. Go to: https://jimbula.co.uk/auth/forgot-password
2. Request password reset for email #1
3. Wait 10 seconds
4. Request password reset for email #2
5. Wait 10 seconds
6. Request password reset for email #3

Expected: All 3 emails should send successfully
If rate limited: Custom SMTP is NOT configured correctly
```

### Test 2: Check Email Headers
1. Open password reset email
2. View email source/headers
3. Look for "Received: from smtp-relay.brevo.com"
4. If you see Brevo in headers → Custom SMTP is working ✅
5. If you see Supabase servers → Still using default ❌

---

## 🔍 Troubleshooting

### Still Getting Rate Limited After Configuring SMTP?

**Check 1: SMTP is Actually Enabled**
- Dashboard → Authentication → SMTP Settings
- Toggle must be **ON** (green)
- Click "Save" after any changes

**Check 2: Credentials are Correct**
- Username should be your **Brevo account email**
- Password should be **SMTP key** (NOT your Brevo login password)
- SMTP key starts with `xsmtpsib-`

**Check 3: Sender Email is Verified**
- If using `noreply@jimbula.co.uk`, verify domain in Brevo
- OR use a Brevo-verified email address temporarily
- Unverified senders may fail silently

**Check 4: Wait for Changes to Propagate**
- After saving SMTP settings, wait 2-3 minutes
- Supabase needs time to apply configuration changes

### Error: "Invalid SMTP credentials"
- Double-check username is your Brevo **email** (not name)
- Verify SMTP key is correct (generate new one if needed)
- Ensure no extra spaces in credentials

### Emails Still Going to Spam?
- This is a separate issue from rate limiting
- See: `EMAIL_DELIVERABILITY_GUIDE.md` for DNS setup
- Add SPF, DKIM, DMARC records to improve deliverability

---

## 💡 Why This Happens

Supabase uses their own email service by default to make setup easy. However, this default service has strict rate limits to prevent abuse:

- **2 emails per hour per project** (very restrictive)
- Applies to ALL auth emails (password reset, email confirmation, etc.)
- Cannot be increased without configuring custom SMTP

By switching to Brevo SMTP:
- You control the rate limits (based on your Brevo plan)
- Much higher limits (300/day on free tier, 40k+/day on paid)
- Better deliverability with proper DNS setup
- More professional sender reputation

---

## 📋 Checklist

Before marking this as complete, verify:

- [ ] Supabase Custom SMTP is **enabled** (toggle ON)
- [ ] SMTP credentials are correct (host, port, username, password)
- [ ] Sender email is configured (`noreply@jimbula.co.uk`)
- [ ] Settings are **saved** in Supabase dashboard
- [ ] Waited 2-3 minutes for changes to propagate
- [ ] Tested sending 3+ password resets in a row
- [ ] All emails delivered successfully (no rate limit error)
- [ ] Emails appear in inbox or spam (but NOT blocked entirely)

---

## 🎯 Expected Outcome

After configuring Brevo SMTP correctly:

✅ Users can request multiple password resets without hitting rate limits
✅ Emails send within seconds (not minutes)
✅ Up to 300 password resets per day on free tier
✅ No "rate limit exceeded" errors for legitimate users
✅ Better email deliverability overall

---

## 📚 Related Documentation

- **SMTP Setup**: `BREVO_SMTP_SETUP.md`
- **Email Deliverability**: `EMAIL_DELIVERABILITY_GUIDE.md`
- **Password Reset Flow**: `src/app/auth/reset-password/page.tsx`

---

**Priority**: 🚨 CRITICAL - Blocks users from resetting passwords
**Estimated Fix Time**: 5 minutes (just configuration, no code changes)
**Testing Time**: 2 minutes

**Last Updated**: 2025-11-17
