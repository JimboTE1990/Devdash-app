# Email Deliverability Improvement Guide

## 🎯 Goal
Prevent password reset and verification emails from landing in spam folders.

---

## 🚨 Why Emails Go to Spam

1. **No SPF/DKIM/DMARC records** - Email providers can't verify the sender
2. **Using generic sender** (`noreply@jimbula.co.uk`) without domain verification
3. **New sender reputation** - Brevo account hasn't built trust yet
4. **Missing unsubscribe link** - Required by email providers
5. **Poor email content** - Generic templates trigger spam filters

---

## ✅ Step-by-Step Solutions

### 1. Verify Your Domain in Brevo

**This is the MOST IMPORTANT step!**

1. **Login to Brevo**: https://app.brevo.com
2. **Navigate to Senders**: Click "Senders" in the top menu
3. **Add Domain**:
   - Click "Add a sender"
   - Enter: `noreply@jimbula.co.uk`
   - Click "Add"
4. **Verify Domain**:
   - Brevo will show DNS records you need to add
   - You'll need to add these records to your domain registrar

---

### 2. Add DNS Records (Critical for Deliverability)

You need to add these DNS records to your domain (jimbula.co.uk):

#### A. SPF Record (Prevents Spoofing)

**Record Type**: TXT
**Name/Host**: `@` or `jimbula.co.uk`
**Value**:
```
v=spf1 include:spf.brevo.com ~all
```

**What it does**: Tells email providers that Brevo is authorized to send emails from @jimbula.co.uk

#### B. DKIM Record (Email Authentication)

Brevo will provide you with a DKIM record. It will look like:

**Record Type**: TXT
**Name/Host**: `mail._domainkey.jimbula.co.uk`
**Value**:
```
v=DKIM1; k=rsa; p=[long key provided by Brevo]
```

**What it does**: Cryptographically signs your emails so providers know they're legitimate

#### C. DMARC Record (Policy Enforcement)

**Record Type**: TXT
**Name/Host**: `_dmarc.jimbula.co.uk`
**Value**:
```
v=DMARC1; p=none; rua=mailto:dmarc@jimbula.co.uk
```

**What it does**: Tells email providers what to do if SPF/DKIM checks fail

---

### 3. How to Add DNS Records

#### If using Vercel for DNS:

1. Go to Vercel Dashboard → Your Domain → DNS
2. Add each record as shown above
3. Wait 24-48 hours for propagation (usually faster, 1-2 hours)

#### If using another DNS provider (GoDaddy, Namecheap, Cloudflare, etc.):

1. Login to your domain registrar
2. Find DNS settings / DNS management
3. Add each TXT record as shown above
4. Save changes

#### Verify DNS Records are Active:

Use this free tool: https://mxtoolbox.com/SuperTool.aspx

1. Enter: `jimbula.co.uk`
2. Select "SPF Record Lookup"
3. Should show your SPF record
4. Repeat for DKIM and DMARC

---

### 4. Customize Email Templates in Supabase

Make emails look more professional and less like spam:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: Authentication → Email Templates
3. **Customize "Reset Password" template**:

```html
<h2>Reset Your Password</h2>

<p>Hi there,</p>

<p>You requested to reset your password for your Jimbula account.</p>

<p>Click the button below to set a new password:</p>

<a href="{{ .ConfirmationURL }}"
   style="display: inline-block; background: linear-gradient(to right, #f97316, #fb923c); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0;">
  Reset Password
</a>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 24 hours.</p>

<p>If you didn't request this, you can safely ignore this email.</p>

<hr>

<p style="font-size: 12px; color: #666;">
  This email was sent by Jimbula. If you have questions, contact us at contact@jimbula.co.uk
</p>

<p style="font-size: 12px; color: #666;">
  © 2025 Jimbula. All rights reserved.
</p>
```

4. **Customize "Email Confirmation" template** (same styling)

---

### 5. Warm Up Your Sender Reputation

**Problem**: New Brevo accounts have no sender reputation yet.

**Solution - Gradual Sending**:

1. **Week 1**: Send 20-50 emails/day
2. **Week 2**: Send 100-200 emails/day
3. **Week 3**: Send 500+ emails/day
4. **Week 4+**: Normal volume

**Why it works**: Email providers trust senders who gradually increase volume.

**Alternative**: Use Brevo's "Warm-up" feature (if available on your plan)

---

### 6. Update Brevo Sender Settings

1. **Go to Brevo** → Settings → Senders
2. **Verify sender email**: `noreply@jimbula.co.uk`
3. **Add reply-to address**: `contact@jimbula.co.uk` (monitored inbox)
4. **Enable DKIM signing**: Should auto-enable after DNS setup

---

### 7. Test Email Deliverability

#### A. Use Mail-Tester (Free)

1. Go to: https://www.mail-tester.com/
2. They'll give you a temporary email address
3. Trigger a password reset to that address
4. Go back to mail-tester and click "Then check your score"
5. **Target**: 8/10 or higher (10/10 is perfect)

**Common issues shown**:
- Missing SPF/DKIM/DMARC
- No unsubscribe link
- Spammy content
- New sender reputation

#### B. Test with Multiple Email Providers

Send password reset to:
- Gmail (most common)
- Outlook/Hotmail
- Yahoo
- ProtonMail
- Your custom domain

**Check**:
- ✅ Arrives in inbox (not spam)
- ✅ Arrives within 1-2 minutes
- ✅ Links work correctly
- ✅ Branded correctly

---

### 8. Monitor Email Delivery in Brevo

1. **Brevo Dashboard** → Transactional → Logs
2. **Check delivery status**:
   - ✅ Delivered = Success!
   - ⚠️ Soft Bounce = Temporary failure (retry)
   - ❌ Hard Bounce = Email doesn't exist
   - 📧 Spam = Email marked as spam by recipient

3. **Watch for patterns**:
   - If many emails go to spam → Review content/DNS
   - If hard bounces → Validate email addresses
   - If soft bounces → Try again later

---

## 🛠️ Quick Fixes

### Fix 1: Add "Not Spam" Instructions to Email

Add this to your email template:

```
To ensure you receive future emails:
1. Add noreply@jimbula.co.uk to your contacts
2. If this email is in spam, mark it as "Not Spam"
```

### Fix 2: Use Transactional Email Best Practices

✅ **Do:**
- Use clear, simple subject lines ("Reset Your Password")
- Include recipient name if possible
- Have clear call-to-action button
- Include company address (GDPR requirement)
- Use HTTPS links only
- Keep email under 102KB

❌ **Don't:**
- Use excessive exclamation points!!!
- Write in ALL CAPS
- Use spammy words (FREE, URGENT, CLICK HERE)
- Include too many images
- Use URL shorteners
- Send from free email provider (gmail.com)

### Fix 3: Enable Link Tracking (Optional)

In Brevo, you can track if users open emails and click links. This helps with:
- Understanding delivery success
- Building sender reputation
- Debugging issues

---

## 📊 Expected Timeline

| Action | Time | Impact |
|--------|------|--------|
| Add DNS records | 1-48 hours | ⭐⭐⭐⭐⭐ CRITICAL |
| Verify domain in Brevo | Immediate | ⭐⭐⭐⭐⭐ CRITICAL |
| Customize email templates | 30 minutes | ⭐⭐⭐ HIGH |
| Warm up sender | 2-4 weeks | ⭐⭐⭐⭐ VERY HIGH |
| Monitor & adjust | Ongoing | ⭐⭐⭐ HIGH |

---

## ✅ Checklist: Complete Setup

- [ ] Domain verified in Brevo
- [ ] SPF record added to DNS
- [ ] DKIM record added to DNS
- [ ] DMARC record added to DNS
- [ ] DNS records verified (wait 24-48h, check with MXToolbox)
- [ ] Email templates customized in Supabase
- [ ] Reply-to address set (contact@jimbula.co.uk)
- [ ] Test email sent to Gmail (check inbox, not spam)
- [ ] Test email sent to Outlook (check inbox, not spam)
- [ ] Mail-Tester score checked (aim for 8+/10)
- [ ] Brevo logs monitored for delivery status

---

## 🎯 Success Metrics

**Before DNS setup:**
- 30-50% emails land in spam
- Low sender reputation
- Users don't receive password resets

**After DNS setup (24-48 hours):**
- 80-90% emails land in inbox
- Improved sender reputation
- Users reliably receive emails

**After warm-up period (2-4 weeks):**
- 95%+ emails land in inbox
- Strong sender reputation
- Trusted by email providers

---

## 🆘 Troubleshooting

### Issue: Emails still going to spam after DNS setup

**Causes**:
- DNS not fully propagated (wait 48 hours)
- DKIM not correctly configured
- Sender reputation still low (needs warm-up)

**Solutions**:
1. Verify DNS with MXToolbox
2. Check Brevo shows "Verified" status
3. Start warm-up period (low volume sends)
4. Review email content for spam triggers

### Issue: DNS records not working

**Check**:
- Correct domain (jimbula.co.uk, not www.jimbula.co.uk)
- No typos in values
- TXT record type (not A or CNAME)
- Records saved and published

**Test**:
```bash
# Check SPF
dig TXT jimbula.co.uk

# Check DKIM (replace with actual record name from Brevo)
dig TXT mail._domainkey.jimbula.co.uk

# Check DMARC
dig TXT _dmarc.jimbula.co.uk
```

### Issue: Brevo won't verify domain

**Solutions**:
1. Wait 24-48 hours after adding DNS records
2. Click "Check again" in Brevo
3. Contact Brevo support with DNS screenshot
4. Ensure you're using correct email (noreply@jimbula.co.uk)

---

## 📚 Additional Resources

- **DNS Setup Help**: https://www.youtube.com/watch?v=QcQ3nqmxx8Q
- **Brevo Documentation**: https://help.brevo.com/hc/en-us/articles/209557065
- **Email Deliverability**: https://www.emaildeliverability.com/
- **Mail-Tester**: https://www.mail-tester.com/
- **MX Toolbox**: https://mxtoolbox.com/

---

## 💡 Pro Tips

1. **Always test** before sending to users
2. **Monitor Brevo logs** for first week
3. **Ask users** to whitelist noreply@jimbula.co.uk
4. **Keep email simple** - less is more
5. **Use plain text alternative** - helps with spam filters
6. **Build gradually** - don't blast 1000 emails day 1

---

**Last Updated**: 2025-11-16
**Status**: Ready to implement - DNS setup is critical first step
**Priority**: ⭐⭐⭐⭐⭐ HIGH (affects all email delivery)
