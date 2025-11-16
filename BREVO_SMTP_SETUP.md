# Brevo SMTP Setup for Supabase Auth

## 📧 Configure Brevo SMTP with Supabase

### Step 1: Get Brevo SMTP Credentials

1. **Log in to Brevo**: https://app.brevo.com
2. **Navigate to SMTP & API**:
   - Click your name (top-right)
   - Select "SMTP & API"
3. **Create/View SMTP Key**:
   - Click "SMTP" tab
   - Click "Create a new SMTP key" (or view existing)
   - Copy the SMTP key (starts with `xsmtpsib-...`)
4. **Note these details**:
   ```
   SMTP Server: smtp-relay.brevo.com
   Port: 587
   Login: [your Brevo account email]
   Password: [your SMTP key from step 3]
   ```

---

### Step 2: Configure Supabase SMTP Settings

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project** (devdash-app / jimbula)
3. **Navigate to Settings**:
   - Left sidebar → Click "Settings" (gear icon)
   - Click "Authentication"
4. **Scroll to "SMTP Settings"**
5. **Enable Custom SMTP**:
   - Toggle "Enable Custom SMTP" to **ON**
6. **Enter Brevo SMTP Details**:
   ```
   Host: smtp-relay.brevo.com
   Port: 587
   Username: [your Brevo account email]
   Password: [your Brevo SMTP key from Step 1]
   Sender Email: noreply@jimbula.co.uk
   Sender Name: Jimbula
   ```
7. **Click "Save"**

---

### Step 3: Verify Sender Email (Important!)

**For reliable delivery, you need to verify your sender domain in Brevo:**

#### Option A: Use Brevo's Default Sender (Quick Start)
1. In Brevo Dashboard → Senders & IPs → Senders
2. Use your verified Brevo email address as sender
3. Update Supabase "Sender Email" to match this verified email
   - Example: `your-email@yourdomain.com` (already verified in Brevo)

#### Option B: Verify Custom Domain (Recommended for Production)
1. **In Brevo Dashboard**:
   - Go to "Senders & IPs" → "Domains"
   - Click "Add a domain"
   - Enter: `jimbula.co.uk`
2. **Add DNS Records**:
   - Brevo will provide DNS records (SPF, DKIM, DMARC)
   - Add these to your domain registrar (GoDaddy, Namecheap, etc.)
   - Typical records look like:
     ```
     Type: TXT
     Name: @
     Value: v=spf1 include:spf.brevo.com ~all

     Type: TXT
     Name: mail._domainkey
     Value: [DKIM key from Brevo]
     ```
3. **Verify in Brevo**:
   - Click "Verify" in Brevo dashboard
   - May take 24-48 hours for DNS propagation
4. **Update Supabase sender email**:
   - Use: `noreply@jimbula.co.uk`

---

### Step 4: Configure Email Templates (Optional)

Supabase provides default email templates, but you can customize them:

1. **In Supabase Dashboard**:
   - Settings → Authentication → Email Templates
2. **Customize these templates**:
   - **Confirm signup**: Sent when user registers
   - **Magic Link**: For passwordless login
   - **Change Email Address**: When user changes email
   - **Reset Password**: For password reset

**Default variables you can use**:
- `{{ .ConfirmationURL }}` - Email confirmation link
- `{{ .Token }}` - Verification token
- `{{ .Email }}` - User's email
- `{{ .RedirectTo }}` - Redirect URL after confirmation

**Example Custom Template**:
```html
<h2>Welcome to Jimbula!</h2>
<p>Thanks for signing up. Click the link below to verify your email:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email Address</a></p>
<p>Or copy this link: {{ .ConfirmationURL }}</p>
<p>If you didn't sign up, you can safely ignore this email.</p>
```

---

### Step 5: Test Email Delivery

1. **Sign up with a test account**:
   - Go to: https://jimbula.co.uk/auth
   - Click "Register"
   - Use your real email address (to test delivery)
   - Complete registration

2. **Check your inbox**:
   - Should receive verification email within 1-2 minutes
   - Check spam folder if not in inbox

3. **Verify email works**:
   - Click verification link in email
   - Should redirect to `/auth/confirm`
   - You should be logged in automatically

4. **Check Brevo Dashboard**:
   - Go to "Statistics" → "Email"
   - Should see the sent email
   - Status should be "Delivered"

---

## ✅ Verification Checklist

Before going live, verify these work:

- [ ] Sign up email received
- [ ] Verification link works
- [ ] Password reset email received
- [ ] Password reset flow works
- [ ] Emails not going to spam
- [ ] Sender name shows "Jimbula"
- [ ] Emails are branded/professional looking

---

## 🔍 Troubleshooting

### Emails Not Sending

**Check 1: SMTP Credentials**
- Verify SMTP key is correct in Supabase
- Ensure login email matches your Brevo account email

**Check 2: Sender Email Verification**
- Make sure sender email is verified in Brevo
- Check Brevo Dashboard → Senders & IPs → Senders

**Check 3: Supabase Logs**
- Supabase Dashboard → Logs → Auth logs
- Look for SMTP errors

**Check 4: Brevo Logs**
- Brevo Dashboard → Statistics → Email
- Check for bounce/block reasons

### Emails Going to Spam

**Solution 1: Verify Domain**
- Set up SPF, DKIM, DMARC records (see Step 3, Option B)

**Solution 2: Warm Up Sender**
- Send to a few emails first
- Gradually increase volume
- Avoid sending to many recipients immediately

**Solution 3: Improve Email Content**
- Avoid spam trigger words ("free", "urgent", "act now")
- Include unsubscribe link
- Use proper HTML formatting

### Authentication Errors

**If you see "SMTP Authentication Failed":**
1. Regenerate SMTP key in Brevo
2. Update in Supabase settings
3. Save and try again

---

## 📊 Brevo Free Tier Limits

- **300 emails/day** (free plan)
- **Unlimited contacts**
- **SMTP relay included**

**If you exceed limits:**
- Upgrade to Lite plan (€25/month for 20,000 emails)
- Or use multiple email providers (Brevo for transactional, another for marketing)

---

## 🎯 Production Recommendations

### Security
- [ ] Use environment-specific SMTP keys (don't share between dev/prod)
- [ ] Store SMTP key securely (Supabase handles this)
- [ ] Enable SPF/DKIM/DMARC for domain

### Deliverability
- [ ] Verify sender domain in Brevo
- [ ] Set up DKIM signing
- [ ] Monitor bounce rate in Brevo
- [ ] Keep email list clean (remove bounces)

### Monitoring
- [ ] Check Brevo dashboard daily for issues
- [ ] Set up alerts for high bounce rates
- [ ] Monitor Supabase auth logs for failures

---

## 🚀 Quick Setup Summary

**5-Minute Setup** (using verified Brevo email):
1. Get SMTP key from Brevo
2. Enable Custom SMTP in Supabase
3. Enter credentials (smtp-relay.brevo.com:587)
4. Use verified sender email
5. Save and test

**Production Setup** (~30 minutes, includes DNS):
1. Complete 5-minute setup
2. Verify jimbula.co.uk domain in Brevo
3. Add DNS records (SPF, DKIM, DMARC)
4. Wait for DNS propagation
5. Update sender to noreply@jimbula.co.uk
6. Customize email templates
7. Test thoroughly

---

## 📞 Support

**Brevo Support**:
- Documentation: https://help.brevo.com
- Support: https://app.brevo.com/support

**Supabase SMTP Docs**:
- https://supabase.com/docs/guides/auth/auth-smtp

---

**Last Updated**: 2025-01-13
**Status**: Ready to configure
**Estimated Setup Time**: 5-10 minutes
