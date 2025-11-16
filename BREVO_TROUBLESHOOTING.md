# Brevo SMTP Troubleshooting - "Error Sending Confirmation Email"

## 🔴 Error: "Error sending confirmation email"

This error occurs when Supabase cannot authenticate with Brevo's SMTP server.

---

## ✅ Step-by-Step Fix

### Step 1: Verify Brevo SMTP Credentials

1. **Login to Brevo**: https://app.brevo.com

2. **Get SMTP Key**:
   - Click your name (top-right)
   - Select **"SMTP & API"**
   - Go to **"SMTP"** tab
   - You should see your SMTP credentials

3. **Important - Copy the correct credentials**:
   ```
   SMTP Server: smtp-relay.brevo.com
   Port: 587
   Login/Username: [YOUR BREVO ACCOUNT EMAIL]
   SMTP Key/Password: [Starts with "xsmtpsib-" - NOT your Brevo login password!]
   ```

**⚠️ Common Mistake**: Using your Brevo account password instead of the SMTP key!

---

### Step 2: Double-Check Supabase SMTP Settings

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard

2. **Navigate to your project** → **Settings** (gear icon) → **Authentication**

3. **Scroll down to "SMTP Settings"**

4. **Verify EXACT configuration**:
   ```
   Enable Custom SMTP: ON (toggle enabled)

   Host: smtp-relay.brevo.com
   Port Number: 587
   Sender Email: [email verified in Brevo - see Step 3]
   Sender Name: Jimbula
   Username: [YOUR BREVO ACCOUNT EMAIL]
   Password: [YOUR SMTP KEY starting with xsmtpsib-]
   ```

5. **Click "Save"** (important!)

---

### Step 3: Verify Sender Email

The sender email MUST be verified in Brevo.

**Option A: Use Your Personal Email (Quick Test)**
1. In Brevo → Senders & IPs → Senders
2. Check which email is verified (usually your account email)
3. In Supabase SMTP Settings, use this verified email as "Sender Email"
4. Example: If `yourname@gmail.com` is verified in Brevo, use that

**Option B: Verify Your Domain (Production)**
1. In Brevo → Senders & IPs → Domains
2. Click "Add a domain"
3. Enter: `jimbula.co.uk`
4. Add the DNS records Brevo provides to your domain registrar
5. Wait for verification (can take 24-48 hours)
6. Once verified, use `contact@jimbula.co.uk` as sender email

---

### Step 4: Test Configuration

After updating settings:

1. **Wait 1-2 minutes** for Supabase to apply changes

2. **Try registering again**:
   - Go to https://jimbula.co.uk/auth
   - Register with new test email
   - Check if email arrives

3. **Check Brevo Dashboard**:
   - Go to Statistics → Email
   - Should see the sent email
   - If not, SMTP auth is still failing

---

## 🔍 Common Issues & Solutions

### Issue 1: "Authentication failed"
**Cause**: Wrong SMTP key or username

**Solution**:
- Regenerate SMTP key in Brevo:
  1. Brevo → SMTP & API → SMTP tab
  2. Click "Generate a new SMTP key"
  3. Copy the NEW key (starts with `xsmtpsib-`)
  4. Update in Supabase Settings → Save
  5. Wait 2 minutes and test again

### Issue 2: "Sender email not verified"
**Cause**: Using an email that's not verified in Brevo

**Solution**:
- Use your Brevo account email (already verified)
- OR verify the domain first (see Step 3, Option B)

### Issue 3: "Connection timeout"
**Cause**: Wrong host or port

**Solution**:
- Verify EXACT spelling: `smtp-relay.brevo.com` (no https://, no www)
- Verify port: `587` (NOT 465, NOT 25)

### Issue 4: Settings not saving
**Cause**: Browser cache or session issue

**Solution**:
- Clear browser cache
- Log out and log back into Supabase
- Try incognito/private window
- Re-enter settings and save

---

## 🧪 Test SMTP Connection (Advanced)

You can test SMTP directly using a tool:

**Option 1: Online SMTP Tester**
- Visit: https://www.gmass.co/smtp-test
- Enter your Brevo credentials
- Test connection

**Option 2: Command Line (Mac/Linux)**
```bash
# Test SMTP connection
telnet smtp-relay.brevo.com 587

# Should show: 220 smtp-relay.brevo.com ESMTP
# Press Ctrl+C to exit
```

---

## 📋 Checklist Before Testing Again

- [ ] SMTP key copied correctly (starts with `xsmtpsib-`)
- [ ] Username is your Brevo account email
- [ ] Host is exactly `smtp-relay.brevo.com`
- [ ] Port is `587`
- [ ] Sender email is verified in Brevo
- [ ] "Enable Custom SMTP" toggle is ON
- [ ] Clicked "Save" in Supabase
- [ ] Waited 2 minutes for changes to apply
- [ ] Tested with NEW account (different email)

---

## 🎯 Quick Copy-Paste Template

Here's what your Supabase SMTP settings should look like:

```
Enable Custom SMTP: [X] ON

Sender Details:
  Sender Email: [your-verified-email@domain.com]
  Sender Name: Jimbula

SMTP Provider Settings:
  Host: smtp-relay.brevo.com
  Port Number: 587
  Username: [your-brevo-account-email@domain.com]
  Password: xsmtpsib-[your-smtp-key-here]
```

---

## 🆘 Still Not Working?

### Check Supabase Auth Logs:
1. Supabase Dashboard → Logs
2. Filter by "Auth"
3. Look for SMTP errors
4. Share error message for more specific help

### Check Brevo Activity:
1. Brevo Dashboard → Statistics → Email
2. Check "Last 24 hours"
3. If no emails attempted → SMTP auth is failing in Supabase
4. If emails show as "blocked" or "bounced" → Different issue

### Temporary Workaround (Testing Only):
If you need to test payments urgently:
1. Supabase → Settings → Authentication
2. Find "Enable email confirmations"
3. Turn OFF temporarily
4. Users can register without email verification
5. You can test payment flow
6. ⚠️ Re-enable before going live!

---

## 📞 Support Resources

**Brevo SMTP Docs**:
- https://help.brevo.com/hc/en-us/articles/209467485

**Supabase SMTP Docs**:
- https://supabase.com/docs/guides/auth/auth-smtp

**Brevo Support**:
- Live chat available in Brevo dashboard

---

**Last Updated**: 2025-01-13
**Common Fix Time**: 5 minutes
**Success Rate**: 95%
