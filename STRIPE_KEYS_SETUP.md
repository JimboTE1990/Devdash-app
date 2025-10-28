# 🔐 Stripe Keys Setup Guide - Secure Method

## Quick Overview

You're going to add your Stripe test keys to `.env.local` so payments work in development.

**Time needed**: 3 minutes
**Difficulty**: Easy
**Security**: Your keys stay private on your machine

---

## Step 1: Get Your Stripe Test Keys

### A. Open Stripe Dashboard

1. Go to: **https://dashboard.stripe.com/test/apikeys**
2. Make sure you see **"Test mode"** toggle is ON (top-right corner)
   - It should show in a purple/blue color
   - If it says "Live mode", click to switch to Test mode

### B. Copy Your Keys

You'll see two keys on this page:

#### 1. Publishable Key
- Already visible (starts with `pk_test_`)
- Click the **copy icon** next to it
- Paste somewhere temporarily (Notes app, etc.)

#### 2. Secret Key
- Hidden by default (shows `sk_test_••••••••`)
- Click **"Reveal test key"** button
- Click the **copy icon** to copy it
- Paste somewhere temporarily

**Example formats:**
```
Publishable: pk_test_51Abc123XyZ...
Secret:      sk_test_51Abc123XyZ...
```

---

## Step 2: Update Your .env.local File

### A. Open the File

**Option 1 - VS Code:**
```bash
code .env.local
```

**Option 2 - Terminal:**
```bash
nano .env.local
```

**Option 3 - Finder:**
1. Open your project folder: `/Users/jamiefletcher/Documents/Claude Projects/devdash-app`
2. Press `Cmd + Shift + .` to show hidden files
3. Double-click `.env.local`

### B. Find the Stripe Section

Look for this section in the file:

```env
# Stripe API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### C. Replace the Placeholder Values

**BEFORE:**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

**AFTER:** (with your actual keys)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Abc123XyZ...  [YOUR KEY]
STRIPE_SECRET_KEY=sk_test_51Abc123XyZ...  [YOUR KEY]
```

**For the webhook secret**, use this placeholder for now:
```env
STRIPE_WEBHOOK_SECRET=whsec_temp_testing
```
(We'll update this later when setting up webhooks)

### D. Save the File

- **VS Code/Text Editor**: Press `Cmd + S`
- **Nano**: Press `Ctrl + X`, then `Y`, then `Enter`

---

## Step 3: Restart Dev Server

The server needs to reload to pick up the new environment variables.

### A. Stop Current Server

In your terminal where the dev server is running:
- Press `Ctrl + C`
- Wait for it to fully stop

### B. Start Server Again

```bash
npm run dev
```

Wait for this message:
```
✓ Ready in 2.5s
- Local:   http://localhost:4000
```

---

## Step 4: Verify It's Working

### Quick Test

1. Open: **http://localhost:4000/pricing**

2. Click the **"Free Trial"** or **"Premium"** button on Personal Plan

3. You should be redirected to the checkout page

4. Click **"Continue to Payment"**

5. **SUCCESS**: You should see Stripe's checkout page
   - Blue/purple Stripe branding
   - Payment form with card fields
   - Shows "Jimbula Personal Plan"

6. **FAIL**: If you see "Stripe is not configured" error:
   - Double-check your keys are correct
   - Make sure you saved .env.local
   - Make sure you restarted the dev server
   - Check keys start with `pk_test_` and `sk_test_`

---

## Step 5: Test a Payment (Optional)

Use Stripe's test card to complete a test payment:

### Test Card Numbers

**Success Card:**
```
Card Number: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

Fill in the Stripe checkout and complete the payment. You should:
1. Be redirected to success page
2. See confirmation message
3. Have premium access in the app

---

## Troubleshooting

### Problem: "Stripe is not configured" error

**Solutions:**
- [ ] Verify keys start with `pk_test_` and `sk_test_`
- [ ] Check there are no extra spaces before/after keys
- [ ] Make sure you saved .env.local file
- [ ] Restart dev server (Ctrl+C, then `npm run dev`)
- [ ] Check you're in Test mode in Stripe dashboard

### Problem: Keys not working

**Solutions:**
- [ ] Go back to Stripe dashboard and copy keys again
- [ ] Make sure Test mode is ON
- [ ] Try clicking "Regenerate" in Stripe dashboard
- [ ] Check .env.local is in the right folder (project root)

### Problem: Can't find .env.local file

**Solutions:**
- [ ] Press `Cmd + Shift + .` in Finder to show hidden files
- [ ] Create it manually if it doesn't exist (copy from .env.local.example)
- [ ] Make sure you're in the project root directory

---

## Security Checklist

- [x] Using **test keys** (pk_test_, sk_test_) - ✅ Safe for development
- [x] .env.local is in **.gitignore** - ✅ Won't be committed to git
- [x] Keys are **private** - ✅ Only on your machine
- [ ] Will switch to **live keys** later - ⏳ For production only

---

## What You've Accomplished

✅ Added Stripe test keys to your project
✅ Configured environment variables securely
✅ Enabled payment processing in development
✅ Ready to test full payment flow

---

## Next Steps

1. **Test Payments**: Follow [STRIPE_TESTING_GUIDE.md](STRIPE_TESTING_GUIDE.md)
2. **Set Up Webhooks**: For advanced testing (optional for now)
3. **Go Live**: Switch to live keys when ready for production

---

## Quick Reference

**Where are my keys?**
- Stripe Dashboard: https://dashboard.stripe.com/test/apikeys

**Where do I paste them?**
- File: `.env.local` in project root
- Lines: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY`

**How do I restart?**
- Stop: `Ctrl + C`
- Start: `npm run dev`

**How do I test?**
- Card: `4242 4242 4242 4242`
- See: [STRIPE_TEST_CARDS.md](STRIPE_TEST_CARDS.md)

---

**Need help?** Check [STRIPE_TESTING_GUIDE.md](STRIPE_TESTING_GUIDE.md) for comprehensive testing instructions.

**Security concern?** Test keys are safe - they can't process real payments. You can regenerate them anytime in Stripe dashboard if concerned.
