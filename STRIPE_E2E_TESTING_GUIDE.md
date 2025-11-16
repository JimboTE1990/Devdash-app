# Stripe E2E Testing Guide (Test Mode)

## 🎯 Prerequisites Checklist

Before testing, verify these are configured in Vercel:

### Vercel Environment Variables
```
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_51SMwxKE6lnZ8xJUy...
✅ STRIPE_SECRET_KEY = sk_test_51SMwxKE6lnZ8xJUy...
✅ STRIPE_WEBHOOK_SECRET = whsec_[your-webhook-secret]
✅ NEXT_PUBLIC_APP_URL = https://jimbula.co.uk
```

### Stripe Dashboard Setup
✅ Webhook endpoint created at: `https://jimbula.co.uk/api/webhooks/stripe`
✅ Events selected:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed

---

## 🧪 Test Scenarios

### Test 1: Successful Subscription with 7-Day Trial

**Goal**: Verify complete checkout flow with trial period

**Steps**:
1. **Open production site** in incognito/private browser
   - URL: https://jimbula.co.uk

2. **Create a test account**
   - Click "Sign Up" or go to `/auth`
   - Use a test email: `test+{random}@example.com`
   - Complete registration

3. **Navigate to Pricing**
   - Go to https://jimbula.co.uk/pricing
   - Click "Start 7-Day Free Trial" on Personal Plan

4. **Complete Checkout**
   - Should redirect to `/checkout?plan=personal`
   - Verify you see:
     - ✅ "7-Day Free Trial" badge
     - ✅ Price: £24.99/month
     - ✅ "You won't be charged until [date]" message
   - Click "Start Free Trial"

5. **Enter Stripe Test Card Details**
   ```
   Card Number: 4242 4242 4242 4242
   Expiry Date: 12/25 (any future date)
   CVC: 123
   ZIP Code: 12345
   Name: Test User
   ```

6. **Complete Payment**
   - Click "Subscribe" or "Pay"
   - Should redirect to `/checkout/success`

**Expected Results**:
✅ Redirect to success page
✅ Success message displayed
✅ User profile updated to "premium" in Supabase
✅ Stripe dashboard shows subscription with 7-day trial
✅ Webhook `checkout.session.completed` fired successfully

**Verification Steps**:
1. **Check Supabase**
   - Go to Supabase dashboard → profiles table
   - Find your test user
   - Verify:
     - `plan` = "premium"
     - `stripe_customer_id` is populated
     - `stripe_subscription_id` is populated
     - `subscription_start_date` is set

2. **Check Stripe Dashboard**
   - Go to https://dashboard.stripe.com/test/subscriptions
   - Find the subscription
   - Verify:
     - Status = "trialing"
     - Trial ends in 7 days
     - Amount = £24.99/month
     - Customer email matches your test email

3. **Check Webhook Logs**
   - Go to https://dashboard.stripe.com/test/webhooks
   - Click on your webhook endpoint
   - Check recent events
   - Verify `checkout.session.completed` shows "200 OK"

---

### Test 2: Declined Card

**Goal**: Verify error handling for failed payments

**Steps**:
1. Follow Test 1 steps 1-4
2. Use declined card:
   ```
   Card Number: 4000 0000 0000 0002
   Expiry: 12/25
   CVC: 123
   ```
3. Click "Subscribe"

**Expected Results**:
✅ Error message displayed: "Your card was declined"
✅ User remains on checkout page
✅ No subscription created in Stripe
✅ User plan stays as "free" in Supabase

---

### Test 3: 3D Secure Authentication

**Goal**: Test Strong Customer Authentication (SCA) flow

**Steps**:
1. Follow Test 1 steps 1-4
2. Use 3D Secure card:
   ```
   Card Number: 4000 0025 0000 3155
   Expiry: 12/25
   CVC: 123
   ```
3. Click "Subscribe"
4. 3D Secure modal should appear
5. Click "Complete authentication"

**Expected Results**:
✅ 3D Secure modal appears
✅ After authentication, payment succeeds
✅ Subscription created successfully
✅ Same verification as Test 1

---

### Test 4: Insufficient Funds

**Goal**: Test insufficient funds error handling

**Steps**:
1. Follow Test 1 steps 1-4
2. Use insufficient funds card:
   ```
   Card Number: 4000 0000 0000 9995
   Expiry: 12/25
   CVC: 123
   ```
3. Click "Subscribe"

**Expected Results**:
✅ Error message: "Your card has insufficient funds"
✅ No subscription created
✅ User can retry with different card

---

### Test 5: Subscription Cancellation

**Goal**: Verify webhook handles subscription cancellation

**Steps**:
1. Complete Test 1 (create active subscription)
2. Go to Stripe Dashboard → Test Mode → Subscriptions
3. Find your test subscription
4. Click "..." → "Cancel subscription"
5. Choose "Cancel immediately"
6. Confirm cancellation

**Expected Results**:
✅ Webhook `customer.subscription.deleted` fires
✅ User plan downgrades to "free" in Supabase
✅ `last_downgrade_date` is set
✅ `deletion_scheduled_date` is set to 12 months from now
✅ `stripe_subscription_id` is cleared

**Verification**:
- Check Supabase profiles table
- User should have:
  - `plan` = "free"
  - `last_downgrade_date` = now
  - `deletion_scheduled_date` = 12 months from now
  - `deletion_warning_sent` = false

---

### Test 6: Already Premium User

**Goal**: Verify duplicate subscription prevention

**Steps**:
1. Complete Test 1 (active premium subscription)
2. While still logged in, go to `/pricing`

**Expected Results**:
✅ Page shows "You're Already Subscribed!" message
✅ Shows Crown icon
✅ Offers "Go to Profile" and "Back to Dashboard" buttons
✅ Cannot create duplicate subscription

---

### Test 7: Trial Already Used

**Goal**: Verify users can't use trial twice

**Steps**:
1. Complete Test 1 with one account
2. Cancel subscription (Test 5)
3. Try to subscribe again from `/pricing`

**Expected Results**:
✅ No "7-Day Free Trial" badge shown
✅ Immediate charge (no trial period)
✅ User is warned they've already used trial
✅ Can still subscribe but charged immediately

---

### Test 8: Webhook Failure Recovery

**Goal**: Test what happens if webhook fails

**Steps**:
1. In Stripe Dashboard, temporarily disable your webhook
2. Complete Test 1 checkout
3. Re-enable webhook in Stripe
4. Click "Resend" on the failed webhook event

**Expected Results**:
✅ Subscription created in Stripe
✅ Initially, user plan stays "free" (webhook didn't fire)
✅ After resending webhook, Supabase updates to "premium"
✅ System recovers gracefully

---

## 📊 Test Matrix

| Test | Card | Expected Result | Status |
|------|------|----------------|--------|
| Successful Trial | 4242 4242 4242 4242 | ✅ Premium + Trial | ⬜ |
| Declined Card | 4000 0000 0000 0002 | ❌ Error shown | ⬜ |
| 3D Secure | 4000 0025 0000 3155 | ✅ Auth modal → Success | ⬜ |
| Insufficient Funds | 4000 0000 0000 9995 | ❌ Error shown | ⬜ |
| Cancellation | N/A | ✅ Downgrade to free | ⬜ |
| Duplicate Prevention | N/A | ✅ Warning shown | ⬜ |
| Trial Already Used | 4242 4242 4242 4242 | ✅ No trial, immediate charge | ⬜ |
| Webhook Recovery | N/A | ✅ Eventual consistency | ⬜ |

---

## 🔍 Debugging Tools

### Check API Response
Open browser DevTools (F12) → Network tab:
- Look for `/api/create-checkout-session` request
- Should return `{ sessionId: "cs_test_...", url: "https://checkout.stripe.com/..." }`
- If error, check response body for error message

### Check Webhook Delivery
Stripe Dashboard → Webhooks → Your endpoint:
- Click on any event
- View "Request details"
- Check response status (should be 200)
- View response body
- Check "Retry attempts" if failed

### Check Supabase Logs
Supabase Dashboard → Logs:
- Filter by "database"
- Look for UPDATE queries on profiles table
- Check for any errors

### Check Vercel Function Logs
Vercel Dashboard → Your project → Functions:
- Filter by `/api/webhooks/stripe`
- Check for any errors or timeouts
- Verify function is receiving webhook calls

---

## 🎯 Success Criteria

Before going live with production keys, all tests should pass:

✅ **Test 1**: Successful subscription with trial
✅ **Test 2**: Declined card error handling
✅ **Test 3**: 3D Secure authentication
✅ **Test 4**: Insufficient funds handling
✅ **Test 5**: Subscription cancellation flow
✅ **Test 6**: Duplicate subscription prevention
✅ **Test 7**: Trial already used handling
✅ **Test 8**: Webhook failure recovery

**Additional Checks**:
✅ Webhook endpoint returns 200 OK consistently
✅ No errors in Vercel function logs
✅ Supabase updates happen within 1-2 seconds
✅ User experience is smooth (no errors/crashes)
✅ Success page displays correctly
✅ User can access premium features after upgrade

---

## 📝 Test Results Template

After each test, document:

```
Test: [Test Name]
Date: [Date/Time]
Tester: [Your Name]
Browser: [Chrome/Safari/Firefox]
Result: [Pass/Fail]
Notes: [Any observations]
Screenshots: [If relevant]
```

---

## 🚨 Common Issues & Solutions

### Issue: Webhook shows 401/403 error
**Solution**: Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard

### Issue: Webhook times out
**Solution**: Check Vercel function timeout limits (default 10s, max 300s)

### Issue: Supabase not updating
**Solution**: Check RLS policies allow service role updates

### Issue: Card details don't show up
**Solution**: Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set correctly

### Issue: Redirect fails after payment
**Solution**: Verify `NEXT_PUBLIC_APP_URL` matches your domain

---

## 🎉 Ready for Production?

Once all tests pass with **test keys**, you can switch to **live keys**:

1. ✅ All 8 tests passed
2. ✅ No errors in logs
3. ✅ Webhooks consistently return 200
4. ✅ User experience is smooth
5. ✅ Database updates happen reliably

**Then**:
- Replace `pk_test_...` with `pk_live_...`
- Replace `sk_test_...` with `sk_live_...`
- Set up live webhook endpoint in Stripe
- Update `STRIPE_WEBHOOK_SECRET` with live webhook secret
- Test once more with your own real card (can refund immediately)
- Monitor closely for first few real transactions

---

**Last Updated**: 2025-01-13
**Test Mode**: Active
**Production Keys**: Not yet activated
