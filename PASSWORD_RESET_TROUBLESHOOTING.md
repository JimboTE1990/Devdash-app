# Password Reset Email Troubleshooting

## 🔍 How It Works

Password reset emails are sent through **Supabase Auth**, which uses the **Brevo SMTP** configuration you already set up for email verification.

**Flow:**
1. User enters email on `/auth/forgot-password`
2. App calls `supabase.auth.resetPasswordForEmail(email)`
3. Supabase sends email via Brevo SMTP
4. User receives email with reset link
5. User clicks link → redirected to `/auth/reset-password`
6. User enters new password

---

## ✅ Configuration Status

**Already Configured:**
- ✅ Brevo SMTP in Supabase (same as email verification)
- ✅ Code implementation in `AuthContext.tsx:149-157`
- ✅ UI page at `/auth/forgot-password`

**Uses the Same SMTP Settings:**
The password reset emails use the exact same Brevo SMTP configuration as your email verification. If verification emails work, password reset should too!

---

## 🧪 Testing Steps

### Step 1: Test Password Reset

1. Go to https://jimbula.co.uk/auth/forgot-password
2. Enter your email address
3. Click "Send Reset Link"
4. Wait 30-60 seconds
5. Check your inbox (and spam folder!)

### Step 2: Check Brevo Dashboard

1. Go to https://app.brevo.com/
2. Navigate to **Transactional** → **Logs**
3. Look for recent password reset emails
4. Check status:
   - ✅ **Delivered** = Email sent successfully
   - ❌ **Soft bounce** = Temporary delivery failure
   - ❌ **Hard bounce** = Email address invalid
   - ⏳ **Pending** = Still sending

### Step 3: Check Supabase Logs

1. Go to https://supabase.com/dashboard/project/unzikrmweevksqxllpnv
2. Navigate to **Logs** → **Auth Logs**
3. Filter by "password_recovery"
4. Look for entries like:
   ```
   event: password_recovery
   email: user@example.com
   status: success
   ```

---

## 🚨 Common Issues & Fixes

### Issue 1: Email Not Arriving

**Possible Causes:**
- Email in spam folder
- Brevo rate limit exceeded
- Wrong email address entered
- Email provider blocking Brevo

**Solutions:**
1. **Check spam/junk folder** (most common!)
2. **Wait 2-3 minutes** (SMTP can be slow)
3. **Check Brevo logs** for delivery status
4. **Try different email provider** (Gmail, Outlook, etc.)
5. **Check Brevo daily limit** (300 emails/day on free tier)

### Issue 2: Rate Limiting

Brevo free tier limits:
- **300 emails per day**
- **~4-5 emails per minute**

**If you hit the limit:**
- Wait 24 hours for daily limit reset
- Wait 60 seconds for per-minute limit
- Upgrade Brevo plan for higher limits

### Issue 3: Email Template Not Configured

**Check Supabase Email Templates:**
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Find "Reset Password" template
3. Verify it's enabled and configured
4. Default subject: "Reset Your Password"

**If template is missing:**
1. Click "Reset Password" template
2. Ensure "Enable email confirmations" is ON
3. Save changes

### Issue 4: Redirect URL Incorrect

Current redirect URL in code: `${window.location.origin}/auth/reset-password`

**For production:** `https://jimbula.co.uk/auth/reset-password`
**For local:** `http://localhost:4000/auth/reset-password`

**To verify:**
1. Check Supabase → Authentication → URL Configuration
2. Add to "Redirect URLs":
   - `https://jimbula.co.uk/auth/reset-password`
   - `http://localhost:4000/auth/reset-password` (for testing)

---

## 🔧 Manual Testing

### Test 1: Verify SMTP Connection

```sql
-- Check if SMTP is configured in Supabase
-- Go to Supabase → Settings → Auth → SMTP Settings
-- Should show:
-- Host: smtp-relay.brevo.com
-- Port: 587
-- Username: Your Brevo email
```

### Test 2: Send Test Email via Brevo

1. Go to Brevo Dashboard
2. Navigate to **SMTP & API** → **SMTP**
3. Click "Send a test email"
4. Enter your email
5. Verify you receive it

**If test email arrives:** Your SMTP is working! Issue is with Supabase integration.
**If test email fails:** SMTP credentials need to be reconfigured.

### Test 3: Check Supabase Auth Settings

1. Supabase Dashboard → Authentication → Settings
2. **Enable email provider**: ✅ ON
3. **Confirm email**: ✅ ON
4. **Secure email change**: ✅ ON
5. **SMTP Settings**: Should show Brevo configuration

---

## 📧 Expected Email Content

**Subject:** Reset Your Password

**Body:**
```
Hi,

You requested to reset your password for Jimbula.

Click the link below to reset your password:

[Reset Password Button/Link]

If you didn't request this, you can safely ignore this email.

Thanks,
The Jimbula Team
```

---

## 🛠️ Quick Fixes

### Fix 1: Resend Email (User Action)

1. Go back to `/auth/forgot-password`
2. Wait 60 seconds (rate limit)
3. Try again with same email

### Fix 2: Use Different Email Provider

If using a custom domain email (e.g., yourcompany.com):
- Try Gmail or Outlook instead
- Some email servers block automated emails

### Fix 3: Add Brevo to Safe Senders

Add these to your email's safe sender list:
- `noreply@brevo.com`
- `no-reply@supabase.io`
- Your Brevo sender email

### Fix 4: Check Supabase URL Allowlist

1. Supabase Dashboard → Authentication → URL Configuration
2. **Site URL**: `https://jimbula.co.uk`
3. **Redirect URLs**: Add `https://jimbula.co.uk/auth/reset-password`

---

## 🔍 Debugging Checklist

- [ ] Brevo SMTP configured in Supabase
- [ ] Email verification working (same SMTP)
- [ ] Password reset email template enabled in Supabase
- [ ] Redirect URL added to Supabase allowlist
- [ ] Checked spam folder
- [ ] Waited at least 2 minutes
- [ ] Tried different email address
- [ ] Checked Brevo logs for delivery status
- [ ] Not hitting rate limits (300/day, 5/min)
- [ ] Email provider not blocking Brevo

---

## 💡 Pro Tips

1. **Test with Gmail first** - Most reliable for testing
2. **Check spam immediately** - Auto-emails often land there
3. **Wait 2-3 minutes** - SMTP delivery isn't instant
4. **Use Brevo logs** - Shows exactly what happened
5. **Try incognito mode** - Rules out browser cache issues

---

## 🚀 If All Else Fails

### Option 1: Reset Password Manually via Supabase

1. Go to Supabase Dashboard → Authentication → Users
2. Find the user by email
3. Click "..." → "Reset Password"
4. Copy the reset link
5. Send it to user manually

### Option 2: Create New Account

If password reset is completely broken:
1. User creates new account with different email
2. You manually transfer data (if needed)

### Option 3: Contact Brevo Support

If emails aren't sending:
1. Check Brevo status page: https://status.brevo.com/
2. Contact Brevo support with:
   - Your account email
   - Time of failed send
   - Recipient email
   - Error message (if any)

---

## 📊 Monitoring

### Daily Checks

1. **Brevo Dashboard** → Check delivery rate
2. **Supabase Logs** → Look for auth errors
3. **User feedback** → Are people reporting issues?

### Weekly Checks

1. Test password reset flow yourself
2. Verify email templates still working
3. Check Brevo usage (not hitting limits)

---

## 🎯 Success Criteria

✅ **Password reset is working if:**
- User receives email within 2 minutes
- Email arrives in inbox (not spam)
- Reset link redirects to correct page
- User can set new password successfully
- New password works for login

---

**Last Updated:** 2025-11-16
**Status:** Emails configured via Brevo SMTP (same as verification)
