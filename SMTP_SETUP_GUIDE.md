# SMTP Setup Guide for Jimbula Production

## 📧 Why You Need Custom SMTP

Since September 26, 2024, Supabase's default SMTP only delivers emails to your organization's team members. To allow public user signups, you **must** configure a custom SMTP provider.

**Benefits:**
- ✅ Enable signups from any email domain
- ✅ Professional branded emails
- ✅ Better deliverability rates
- ✅ Higher sending limits
- ✅ Email analytics and tracking

---

## 🏆 Recommended Provider: Resend

**Why Resend?**
- Modern, developer-friendly API
- Generous free tier: 3,000 emails/month (100/day)
- Simple setup (5 minutes)
- Great documentation
- Built for transactional emails
- Excellent deliverability

**Free Tier:**
- 3,000 emails/month
- 100 emails/day
- All features included

---

## 🚀 Quick Setup: Resend (Recommended)

### Step 1: Create Resend Account

1. Go to [https://resend.com/signup](https://resend.com/signup)
2. Sign up with your email
3. Verify your email address

### Step 2: Get Your API Key

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it: `Jimbula Production`
4. Permissions: **Sending access**
5. Click **Add**
6. **Copy the API key** (starts with `re_...`) - you'll need this

### Step 3: Verify Your Domain (Optional but Recommended)

**Option A: Custom Domain** (Professional - Recommended)
1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain: `jimbula.co.uk`
4. Add DNS records to your domain provider:
   - SPF record
   - DKIM records
   - DMARC record (optional)
5. Wait for verification (usually < 1 hour)

**Option B: Use Resend's Shared Domain** (Quick Start)
- Use `onboarding@resend.dev` as sender
- Good for testing, but custom domain is better for production

### Step 4: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/unzikrmweevksqxllpnv)
2. Navigate to: **Authentication > Email Templates > SMTP Settings**
3. Toggle **Enable Custom SMTP** to ON
4. Enter the following settings:

   ```
   Host: smtp.resend.com
   Port: 465
   Username: resend
   Password: [Your Resend API Key - starts with re_...]

   Sender name: Jimbula
   Sender email: noreply@jimbula.co.uk
   (or onboarding@resend.dev if using shared domain)
   ```

5. Click **Save**

### Step 5: Test Your Setup

1. Go to your app: [http://localhost:4000/auth](http://localhost:4000/auth)
2. Click **Register** tab
3. Try signing up with a new email (use your personal email)
4. Check your inbox for the verification email
5. Click the verification link
6. Confirm you can login

✅ **Success!** If you received the email, SMTP is working correctly.

---

## 🎨 Customize Email Templates (Optional)

Make your auth emails look professional with Jimbula branding.

### Step 1: Access Email Templates

1. In Supabase Dashboard: **Authentication > Email Templates**
2. You'll see templates for:
   - **Confirm signup** - Email verification
   - **Magic Link** - Passwordless login
   - **Change Email Address** - Email change confirmation
   - **Reset Password** - Password reset

### Step 2: Customize Confirm Signup Template

Click **Confirm signup** and replace with:

```html
<h2>Welcome to Jimbula!</h2>

<p>Hi there,</p>

<p>Thank you for signing up for Jimbula - your all-in-one productivity dashboard.</p>

<p>To complete your registration and start your <strong>7-day free trial</strong>, please verify your email address by clicking the button below:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Verify Email Address</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p><strong>What's included in your free trial:</strong></p>
<ul>
  <li>Task Management Boards</li>
  <li>Financial Tracker</li>
  <li>Planner Calendar</li>
  <li>Ideas Board</li>
  <li>All premium features unlocked</li>
</ul>

<p>If you didn't create this account, you can safely ignore this email.</p>

<p>Best regards,<br>
The Jimbula Team</p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<p style="font-size: 12px; color: #6b7280;">
Jimbula - Your productivity, simplified.<br>
<a href="https://www.jimbula.co.uk">www.jimbula.co.uk</a>
</p>
```

### Step 3: Customize Reset Password Template

Click **Reset Password** and use:

```html
<h2>Reset Your Jimbula Password</h2>

<p>Hi there,</p>

<p>We received a request to reset the password for your Jimbula account.</p>

<p>Click the button below to create a new password:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Reset Password</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p><strong>This link will expire in 1 hour.</strong></p>

<p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>

<p>Best regards,<br>
The Jimbula Team</p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<p style="font-size: 12px; color: #6b7280;">
Jimbula - Your productivity, simplified.<br>
<a href="https://www.jimbula.co.uk">www.jimbula.co.uk</a>
</p>
```

---

## 🔄 Alternative SMTP Providers

### SendGrid (Free: 100 emails/day)

**Setup:**
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: [Your SendGrid API Key]
```

**Get API Key:**
1. [Sign up at SendGrid](https://signup.sendgrid.com/)
2. Go to Settings > API Keys
3. Create API Key with "Mail Send" permissions

---

### AWS SES (Pay-as-you-go: $0.10 per 1,000 emails)

**Setup:**
```
Host: email-smtp.[region].amazonaws.com
Port: 587
Username: [SMTP username from SES]
Password: [SMTP password from SES]
```

**Get Credentials:**
1. [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Verify your domain or email
3. Create SMTP credentials
4. Request production access (starts in sandbox mode)

---

### Mailgun (Free: 5,000 emails/month)

**Setup:**
```
Host: smtp.mailgun.org
Port: 587
Username: [Your Mailgun SMTP username]
Password: [Your Mailgun SMTP password]
```

**Get Credentials:**
1. [Sign up at Mailgun](https://signup.mailgun.com/)
2. Add and verify your domain
3. Go to Domain Settings > SMTP credentials

---

### Postmark (Free trial: 100 emails, then $15/month for 10,000)

**Setup:**
```
Host: smtp.postmarkapp.com
Port: 587
Username: [Your Postmark Server API Token]
Password: [Your Postmark Server API Token]
```

**Get API Token:**
1. [Sign up at Postmark](https://account.postmarkapp.com/sign_up)
2. Create a server
3. Copy Server API Token
4. Verify sender signature (domain or email)

---

## 🧪 Testing Your SMTP Configuration

### 1. Test Signup Flow

```bash
# Try registering a new user
1. Go to: http://localhost:4000/auth
2. Click "Register"
3. Enter test details:
   - First Name: Test
   - Last Name: User
   - Email: your-personal-email@gmail.com
   - Password: Test123456!
4. Submit form
5. Check inbox (and spam folder) for verification email
```

### 2. Test Password Reset

```bash
1. Go to: http://localhost:4000/auth
2. Click "Forgot Password?"
3. Enter your email
4. Check inbox for reset email
5. Click link and reset password
```

### 3. Verify in Resend Dashboard

1. Go to [Resend Dashboard > Emails](https://resend.com/emails)
2. You should see your sent emails
3. Check delivery status (should show "Delivered")
4. Click to view email content

---

## 🔒 Production Deployment Checklist

Before deploying to Vercel production:

- [ ] SMTP provider configured in Supabase
- [ ] Custom domain verified (if using one)
- [ ] Email templates customized with Jimbula branding
- [ ] Sender email matches your domain (`noreply@jimbula.co.uk`)
- [ ] SPF/DKIM records added to DNS
- [ ] Test emails delivered successfully
- [ ] Emails not landing in spam
- [ ] Verification links work correctly
- [ ] Password reset flow tested
- [ ] Email sending limits understood (upgrade plan if needed)

---

## 📊 Monitoring & Limits

### Resend Free Tier Limits

- **3,000 emails/month** (for typical SaaS, this = ~100 signups/month)
- **100 emails/day**
- If you exceed: Upgrade to $20/month for 50,000 emails

### Monitor Usage

1. Check Resend dashboard weekly
2. Set up usage alerts
3. Upgrade before hitting limits

### Email Deliverability Tips

- ✅ Always verify your sending domain
- ✅ Set up SPF, DKIM, and DMARC records
- ✅ Use professional sender name and email
- ✅ Keep email content clean (avoid spammy words)
- ✅ Include unsubscribe links (for marketing emails)
- ✅ Monitor bounce and spam complaint rates

---

## 🆘 Troubleshooting

### Emails Not Arriving

1. **Check spam folder** - Most common issue
2. **Verify SMTP credentials** - Re-enter in Supabase
3. **Check Resend dashboard** - Look for errors
4. **Domain verification** - Ensure DNS records are correct
5. **Check Supabase logs** - Authentication > Logs

### "SMTP connection failed"

- Verify host/port/credentials are correct
- Check firewall isn't blocking port 465 or 587
- Try alternative port (465 vs 587)

### Emails Going to Spam

- Verify sending domain with SPF/DKIM
- Improve email content (less promotional language)
- Use authenticated domain (not resend.dev)
- Check sender reputation

### "Daily limit exceeded"

- You've hit 100 emails/day on free tier
- Wait 24 hours OR upgrade to paid plan
- Monitor usage in Resend dashboard

---

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Supabase SMTP Setup](https://supabase.com/docs/guides/auth/auth-smtp)
- [Email Deliverability Best Practices](https://www.mailgun.com/resources/guides/email-deliverability-best-practices/)
- [SPF/DKIM Setup Guide](https://www.cloudflare.com/learning/dns/dns-records/dns-spf-record/)

---

## ✅ Quick Start Summary

1. **Sign up for Resend** → Get API key
2. **Configure Supabase SMTP** → Add credentials
3. **Test signup flow** → Verify emails arrive
4. **Customize templates** → Add Jimbula branding
5. **Deploy to production** → Update Vercel env vars (if needed)

**Total setup time**: ~15 minutes

---

**Last Updated**: 2025-10-28
**Recommended Provider**: Resend
**Production Ready**: Yes
**Cost**: Free for up to 3,000 emails/month
