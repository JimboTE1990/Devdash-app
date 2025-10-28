# Stripe Payment Testing Guide for Jimbula

## Overview
This guide will walk you through testing the complete Stripe integration for Jimbula, including payments, subscriptions, trials, and webhooks.

## Prerequisites Checklist

- [ ] Stripe account created at https://stripe.com
- [ ] Stripe test API keys obtained from dashboard
- [ ] Environment variables configured in `.env.local`
- [ ] Dev server running at http://localhost:4000
- [ ] Stripe CLI installed (optional, for webhook testing)

## Phase 1: Environment Setup

### Step 1: Get Your Stripe Test Keys

1. Go to [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Copy these keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal test key"

### Step 2: Update Environment Variables

Open `.env.local` and replace the placeholder values:

```env
# Stripe API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_temp_placeholder  # We'll update this later
```

### Step 3: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

## Phase 2: Test Stripe Test Cards

Stripe provides these test cards for different scenarios:

### ✅ Successful Payment
```
Card: 4242 4242 4242 4242
Expiry: 12/34 (any future date)
CVC: 123 (any 3 digits)
ZIP: 12345 (any valid ZIP)
```

### 🔐 Requires 3D Secure Authentication
```
Card: 4000 0025 0000 3155
Expiry: 12/34
CVC: 123
ZIP: 12345
```

### ❌ Card Declined
```
Card: 4000 0000 0000 9995
Expiry: 12/34
CVC: 123
ZIP: 12345
```

### 💰 Insufficient Funds
```
Card: 4000 0000 0000 9995
```

Full list: https://stripe.com/docs/testing

## Phase 3: End-to-End Testing

### Test Scenario 1: Free Trial Flow (First-Time User)

**Expected Result**: User gets 7-day free trial, then charged £14.99/month

1. [ ] Go to http://localhost:4000
2. [ ] Click "Get Started" or "Sign Up"
3. [ ] Register a new account with test email (e.g., `test1@example.com`)
4. [ ] Verify email in Supabase (or skip if email verification is disabled)
5. [ ] Go to http://localhost:4000/pricing
6. [ ] Click "Free Trial" button on Personal Plan
7. [ ] Should see "7 days free" message on checkout page
8. [ ] Click "Continue to Payment"
9. [ ] Fill in Stripe checkout with test card `4242 4242 4242 4242`
10. [ ] Complete payment
11. [ ] Should redirect to success page
12. [ ] Verify profile shows "Premium" plan
13. [ ] Go to Stripe Dashboard → Customers → Find your test customer
14. [ ] Verify subscription shows 7-day trial

**What to Check:**
- ✅ Trial period is set to 7 days
- ✅ No immediate charge (charge happens after trial)
- ✅ User has premium access immediately
- ✅ Profile in Supabase shows premium plan

### Test Scenario 2: Direct Payment (Skip Trial)

**Expected Result**: User is charged immediately, no trial

1. [ ] Create a new test account OR log out and register again
2. [ ] Go to pricing page
3. [ ] Click "Premium" button (£14.99/month - skip trial option)
4. [ ] Should NOT see trial messaging
5. [ ] Complete payment with test card
6. [ ] Verify immediate charge in Stripe dashboard
7. [ ] Verify premium access

**What to Check:**
- ✅ No trial period
- ✅ Immediate charge of £14.99
- ✅ User upgraded to premium immediately

### Test Scenario 3: Trial Already Used

**Expected Result**: User cannot get another trial

1. [ ] Use same account from Scenario 1 (already used trial)
2. [ ] Try to start trial again
3. [ ] Should not see trial option OR should skip trial automatically
4. [ ] Can only do direct payment

**What to Check:**
- ✅ `has_used_trial` flag is set in Supabase
- ✅ System prevents second trial

### Test Scenario 4: Payment Decline Handling

**Expected Result**: User sees error, can retry with different card

1. [ ] Start checkout flow
2. [ ] Use declined card: `4000 0000 0000 9995`
3. [ ] Should see error from Stripe
4. [ ] Can go back and try again with valid card

**What to Check:**
- ✅ Error message is clear
- ✅ User can retry
- ✅ No partial subscription created

### Test Scenario 5: 3D Secure Authentication

**Expected Result**: User completes additional authentication step

1. [ ] Start checkout flow
2. [ ] Use 3DS card: `4000 0025 0000 3155`
3. [ ] Complete 3D Secure challenge in Stripe modal
4. [ ] Payment completes successfully

**What to Check:**
- ✅ 3DS modal appears
- ✅ Authentication works
- ✅ Payment completes after auth

## Phase 4: Webhook Testing

Webhooks allow Stripe to notify your app about subscription events.

### Option A: Manual Testing (Production Only)

Skip to Phase 5 - webhooks will work once deployed to production.

### Option B: Local Webhook Testing with Stripe CLI

#### Install Stripe CLI

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
Download from https://github.com/stripe/stripe-cli/releases

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.0/stripe_1.19.0_linux_x86_64.tar.gz
tar -xvf stripe_1.19.0_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

#### Configure Webhook Forwarding

1. Login to Stripe CLI:
```bash
stripe login
```

2. Forward webhooks to your local server:
```bash
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

3. Copy the webhook signing secret (starts with `whsec_`)

4. Update `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

5. Restart your dev server

#### Test Webhook Events

1. In a new terminal, trigger test events:

```bash
# Test successful checkout
stripe trigger checkout.session.completed

# Test subscription created
stripe trigger customer.subscription.created

# Test subscription canceled
stripe trigger customer.subscription.deleted

# Test payment failed
stripe trigger invoice.payment_failed
```

2. Watch your server logs for webhook events
3. Check Supabase to verify profile updates

**What to Check:**
- ✅ Webhook events appear in server console
- ✅ `checkout.session.completed` upgrades user to premium
- ✅ `customer.subscription.deleted` downgrades to free
- ✅ Profile updates in Supabase database

## Phase 5: Verify Database Updates

After each payment test, check Supabase:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/unzikrmweevksqxllpnv/editor)
2. Click "Table Editor" → "profiles"
3. Find your test user
4. Verify these fields:

| Field | Expected Value |
|-------|---------------|
| `plan` | "premium" (after payment) or "free" (after cancel) |
| `subscription_start_date` | ISO timestamp of when premium started |
| `stripe_customer_id` | Starts with `cus_` |
| `stripe_subscription_id` | Starts with `sub_` |
| `has_used_trial` | `true` (after first trial) |

## Phase 6: Test User Experience Flows

### Flow 1: Complete Trial Journey

Day 1-7 (Trial Period):
- [ ] User has full premium access
- [ ] No charges yet
- [ ] Can cancel anytime

Day 8 (Trial Ends):
- [ ] Stripe charges £14.99
- [ ] Subscription becomes active
- [ ] User continues with premium access

### Flow 2: Subscription Management

- [ ] User can view subscription in profile
- [ ] Can cancel subscription (implement cancel flow)
- [ ] After cancellation, access continues until period end

### Flow 3: Payment Failure Handling

- [ ] Card expires or fails
- [ ] Stripe sends `invoice.payment_failed` webhook
- [ ] User receives notification (to implement)
- [ ] User can update payment method

## Phase 7: Production Readiness Checklist

Before going live:

- [ ] Switch from test keys to **live keys** in Vercel
- [ ] Set up production webhook at `https://www.jimbula.co.uk/api/webhooks/stripe`
- [ ] Test with real card (small amount)
- [ ] Verify email notifications work
- [ ] Add subscription management UI in profile
- [ ] Test refund process
- [ ] Configure Stripe tax settings (if needed)
- [ ] Set up Stripe Billing Portal for customer self-service

## Common Issues & Troubleshooting

### Issue: "Stripe is not configured" error

**Solution:**
- Check `.env.local` has correct keys
- Restart dev server after updating `.env.local`
- Verify keys start with `pk_test_` and `sk_test_`

### Issue: Payment succeeds but user not upgraded

**Solution:**
- Check browser console for errors
- Verify Supabase credentials in `.env.local`
- Check webhook is receiving events (if using webhooks)
- Look at server logs for API errors

### Issue: Webhook signature verification failed

**Solution:**
- Verify `STRIPE_WEBHOOK_SECRET` in `.env.local`
- If using Stripe CLI, get fresh secret with `stripe listen`
- Restart dev server after updating webhook secret

### Issue: Trial not working

**Solution:**
- Check `has_used_trial` field in Supabase profiles table
- Verify trial logic in `/api/create-checkout-session`
- Ensure user hasn't used trial before

### Issue: Can't find customer in Stripe dashboard

**Solution:**
- Make sure you're in Test Mode (toggle in top-right)
- Search by email address
- Check if payment actually completed

## Monitoring & Logs

### Where to Check for Issues:

1. **Browser Console**: Client-side errors
   - Open DevTools → Console tab
   - Look for red errors

2. **Server Logs**: API and webhook errors
   - Terminal running `npm run dev`
   - Check for errors in webhook handler

3. **Stripe Dashboard**: Payment and subscription status
   - Customers tab - see all test customers
   - Payments tab - see all transactions
   - Webhooks tab - see webhook delivery status

4. **Supabase Logs**: Database queries and errors
   - Supabase Dashboard → Logs
   - Check for failed queries

## Test Coverage Checklist

Run through this comprehensive checklist:

### Payments
- [ ] Successful payment with trial
- [ ] Successful payment without trial
- [ ] Declined card handling
- [ ] 3D Secure authentication
- [ ] Multiple payment attempts

### Subscriptions
- [ ] Trial subscription created
- [ ] Direct subscription created
- [ ] Trial converts to paid after 7 days
- [ ] Subscription cancellation
- [ ] Subscription renewal

### User Management
- [ ] New user with trial
- [ ] Existing user (no trial)
- [ ] User upgrade to premium
- [ ] User downgrade to free
- [ ] Multiple users with different plans

### Webhooks (if testing locally)
- [ ] checkout.session.completed
- [ ] customer.subscription.created
- [ ] customer.subscription.updated
- [ ] customer.subscription.deleted
- [ ] invoice.payment_succeeded
- [ ] invoice.payment_failed

### Database
- [ ] Profile created on signup
- [ ] Profile updated on payment
- [ ] Stripe IDs stored correctly
- [ ] Trial tracking works
- [ ] Plan status reflects subscription

## Next Steps After Testing

Once all tests pass:

1. **Document any issues found** during testing
2. **Add error monitoring** (e.g., Sentry)
3. **Set up production webhooks** in Stripe dashboard
4. **Add to Vercel environment variables**
5. **Test on staging/preview deployment**
6. **Go live with live Stripe keys** 🚀

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Testing**: https://stripe.com/docs/testing
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Your Codebase**: See `STRIPE_SETUP.md` for technical details

---

**Good luck with testing!** 🎉

If you encounter any issues, check the Troubleshooting section or review the server logs for detailed error messages.
