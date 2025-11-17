# E2E Test Simulation - Stripe Payment Flow

## 🎯 Purpose
Simulate a complete end-to-end test of the payment flow to verify everything works correctly before accepting real payments.

---

## 📋 Test Scenarios

### Scenario 1: Free 7-Day Trial (No Payment)

**Steps:**
1. ✅ Navigate to https://jimbula.co.uk/pricing
2. ✅ Click "Start Free 7-Day Trial" button
3. ✅ Create new account with email + password
4. ✅ Verify email (click link in email)
5. ✅ Login to account
6. ✅ Check profile → Should show trial end date (7 days from now)
7. ✅ Access all 4 features (Planner, Calendar, Ideas, Finance)
8. ✅ All features should work without payment

**Expected Results:**
- ✅ No payment details requested
- ✅ Full access to all features
- ✅ Trial expires in 7 days
- ✅ User can use app freely during trial

**Database Check (Supabase):**
```sql
SELECT
  id,
  email,
  plan,
  trial_end_date,
  has_used_trial,
  subscription_start_date
FROM profiles
WHERE email = 'test-trial@example.com';
```

Expected:
- `plan`: 'free'
- `trial_end_date`: ~7 days from now
- `has_used_trial`: false
- `subscription_start_date`: null

---

### Scenario 2: Monthly Subscription with Test Card

**Steps:**
1. ✅ Navigate to https://jimbula.co.uk/pricing
2. ✅ Click "Monthly" button (£24.99/mo)
3. ✅ Login or create account
4. ✅ Redirected to checkout page
5. ✅ Verify checkout shows:
   - Monthly price: £24.99
   - 7-day free trial: Included
   - Due today: £0.00
   - First charge: [Date 7 days from now]
6. ✅ Click "Start 7-Day Free Trial"
7. ✅ Redirected to Stripe Checkout
8. ✅ Enter test card: 4242 4242 4242 4242
9. ✅ Submit payment
10. ✅ Redirected to /checkout/success
11. ✅ Check profile → Should show premium plan

**Expected Results:**
- ✅ Trial period: 7 days
- ✅ No charge today
- ✅ First charge on day 8 (£24.99)
- ✅ Recurring monthly billing
- ✅ User upgraded to premium immediately
- ✅ No trial expiration banner

**Stripe Dashboard Check:**
1. Go to https://dashboard.stripe.com/test/subscriptions
2. Should see new subscription:
   - Status: Active
   - Trial: 7 days remaining
   - Amount: £24.99/month
   - Next payment: 7 days from now

**Database Check:**
```sql
SELECT
  id,
  email,
  plan,
  trial_end_date,
  subscription_start_date,
  stripe_customer_id,
  stripe_subscription_id
FROM profiles
WHERE email = 'test-monthly@example.com';
```

Expected:
- `plan`: 'premium'
- `subscription_start_date`: [Today's date]
- `stripe_customer_id`: cus_...
- `stripe_subscription_id`: sub_...

---

### Scenario 3: Annual Subscription with Test Card

**Steps:**
1. ✅ Navigate to https://jimbula.co.uk/pricing
2. ✅ Click "Annual" button (£249.90/yr)
3. ✅ Login or create account
4. ✅ Redirected to checkout page
5. ✅ Verify checkout shows:
   - Annual price: £249.90
   - 7-day free trial: Included
   - Due today: £0.00
   - First charge: [Date 7 days from now]
   - Badge: "Best Value" / "2 months free"
6. ✅ Click "Start 7-Day Free Trial"
7. ✅ Redirected to Stripe Checkout
8. ✅ Enter test card: 4242 4242 4242 4242
9. ✅ Submit payment
10. ✅ Redirected to /checkout/success
11. ✅ Check profile → Should show premium plan

**Expected Results:**
- ✅ Trial period: 7 days
- ✅ No charge today
- ✅ First charge on day 8 (£249.90)
- ✅ Recurring annual billing (every 12 months)
- ✅ Savings: £49.98/year (2 months free)

**Stripe Dashboard Check:**
1. Go to https://dashboard.stripe.com/test/subscriptions
2. Should see new subscription:
   - Status: Active
   - Trial: 7 days remaining
   - Amount: £249.90/year
   - Next payment: 7 days from now
   - Interval: Yearly

**Price Verification:**
- Monthly: £24.99 × 12 = £299.88
- Annual: £249.90
- Savings: £299.88 - £249.90 = £49.98 ✓ (2 months free)

---

### Scenario 4: Trial Expiration and Access Control

**Steps:**
1. ✅ Create free trial account
2. ✅ Wait for trial to expire (or manually set `trial_end_date` to yesterday in DB)
3. ✅ Login to account
4. ✅ Try to access features

**Expected Results:**
- ✅ Banner: "Your trial has expired. Upgrade to continue using Jimbula."
- ✅ All 4 features show upgrade prompt
- ✅ Cannot access Planner, Calendar, Ideas, Finance
- ✅ Can access Profile, Pricing pages
- ✅ Clicking upgrade takes user to /pricing

**Database Simulation:**
```sql
UPDATE profiles
SET trial_end_date = NOW() - INTERVAL '1 day'
WHERE email = 'test-expired@example.com';
```

---

### Scenario 5: Webhook Test (Subscription Lifecycle)

**Test 1: Checkout Completed**

Simulate Stripe webhook event:
```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_123",
      "customer": "cus_test_123",
      "subscription": "sub_test_123",
      "metadata": {
        "userId": "user-uuid-here",
        "planType": "personal",
        "billingInterval": "monthly"
      }
    }
  }
}
```

**Expected:**
- User upgraded to `plan: 'premium'`
- `stripe_customer_id` and `stripe_subscription_id` saved
- `subscription_start_date` set to now

**Test 2: Subscription Deleted (User Cancels)**

```json
{
  "type": "customer.subscription.deleted",
  "data": {
    "object": {
      "id": "sub_test_123",
      "customer": "cus_test_123"
    }
  }
}
```

**Expected:**
- User downgraded to `plan: 'free'`
- `stripe_subscription_id` set to null
- `deletion_scheduled_date` set to 12 months from now (GDPR)
- `last_downgrade_date` set to now

---

## 🧪 API Endpoint Tests

### Test 1: Create Checkout Session (Monthly)

**Request:**
```bash
curl -X POST https://jimbula.co.uk/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "planType": "personal",
    "billingInterval": "monthly",
    "userId": "test-user-123",
    "userEmail": "test@example.com",
    "hasUsedTrial": false
  }'
```

**Expected Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Verify in Response:**
- ✅ sessionId starts with "cs_test_" (test mode)
- ✅ url contains "checkout.stripe.com"

### Test 2: Create Checkout Session (Annual)

**Request:**
```bash
curl -X POST https://jimbula.co.uk/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "planType": "personal",
    "billingInterval": "annual",
    "userId": "test-user-123",
    "userEmail": "test@example.com",
    "hasUsedTrial": false
  }'
```

**Expected Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Verify in Stripe Dashboard:**
1. Go to https://dashboard.stripe.com/test/checkout-sessions
2. Find the session
3. Verify:
   - Amount: £249.90
   - Interval: year
   - Trial: 7 days

---

## 📊 Verification Checklist

### Before Going Live

- [ ] All test scenarios pass
- [ ] Stripe webhooks configured correctly
- [ ] Webhook secret matches Vercel environment variable
- [ ] Email notifications working (Brevo SMTP)
- [ ] Trial expiration logic works correctly
- [ ] Access control blocks expired trial users
- [ ] Monthly subscription creates correct Stripe subscription
- [ ] Annual subscription creates correct Stripe subscription
- [ ] Both show 7-day trial in Stripe
- [ ] Pricing calculations correct (£249.90 = 10 months)
- [ ] Success redirect works
- [ ] Cancel redirect works
- [ ] Database updates on successful payment
- [ ] Database updates on subscription cancellation

### Production Readiness

- [ ] Replace test keys with live keys in Vercel
- [ ] Update webhook URL in Stripe to production
- [ ] Test with real card (small amount)
- [ ] Verify live webhook works
- [ ] Monitor Stripe dashboard for live payments
- [ ] Set up Stripe alerts for failed payments
- [ ] Configure invoice email notifications
- [ ] Test subscription cancellation flow
- [ ] Test refund process (if applicable)

---

## 🎯 Testing Strategy

### Phase 1: Local Testing (Current)
- Use test keys in `.env.local`
- Test all flows on localhost:4000
- Verify database updates
- Check Stripe test dashboard

### Phase 2: Production Testing with Test Keys
- Temporarily use test keys in Vercel Production
- Test on live URL (jimbula.co.uk)
- Use test cards
- Verify everything works in production environment

### Phase 3: Production with Live Keys (Real Money)
- Switch to live keys in Vercel
- Create webhook in Stripe live mode
- Test with real card (£1 test payment)
- Immediately refund test payment
- Monitor for real customer payments

---

## 🔒 Security Checklist

- [ ] Stripe secret keys never exposed to client
- [ ] Webhook signature verification enabled
- [ ] HTTPS enforced on all payment pages
- [ ] User authentication required for checkout
- [ ] Customer email verification
- [ ] Rate limiting on API endpoints
- [ ] Error messages don't expose sensitive data
- [ ] Subscription IDs stored securely in database
- [ ] Payment details only handled by Stripe (PCI compliance)

---

## 🚨 Common Issues & Solutions

### Issue 1: "Stripe is not configured"
**Cause:** Environment variables not set in Vercel
**Solution:** Add STRIPE_SECRET_KEY to Vercel and redeploy

### Issue 2: Test card rejected
**Cause:** Using test card with live keys
**Solution:** Use test keys OR use real card

### Issue 3: Webhook not firing
**Cause:** Webhook URL incorrect or secret mismatch
**Solution:** Verify webhook URL and secret in Stripe dashboard

### Issue 4: User not upgraded after payment
**Cause:** Webhook not processing correctly
**Solution:** Check Vercel function logs for errors

### Issue 5: Trial not showing in Stripe
**Cause:** trial_period_days not set in API
**Solution:** Verify create-checkout-session includes trial_period_days: 7

---

## 📞 Support & Debugging

**Stripe Logs:**
- https://dashboard.stripe.com/test/logs
- Check for API errors
- Verify webhook deliveries

**Vercel Logs:**
- Vercel Dashboard → Functions → Logs
- Check API route execution
- Look for errors in create-checkout-session

**Supabase Logs:**
- Supabase Dashboard → Logs
- Check database updates
- Verify profile changes

---

**Last Updated:** 2025-11-16
**Status:** Ready for production testing with test keys
