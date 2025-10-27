# Stripe Integration Setup Guide

## Overview
The DevDash application uses Stripe for processing premium subscription payments. To enable the upgrade functionality, you need to configure your Stripe API keys.

## Current Status
- ❌ **Stripe Not Configured** - Placeholder keys in `.env.local`
- ❌ **Upgrade Button Failing** - Getting "Invalid API Key" error when clicked
- ✅ **Code Ready** - All Stripe integration code is implemented and working

## Prerequisites

- A Stripe account (sign up at https://stripe.com)
- Node.js and npm installed

## Step 1: Get Your Stripe API Keys

1. Go to https://dashboard.stripe.com
2. Navigate to **Developers** → **API keys**
3. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

## Step 2: Configure Environment Variables

1. Open `.env.local` in the project root
2. Replace the placeholder values with your actual Stripe keys:

```env
# Stripe API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:4000
```

**IMPORTANT**: After updating `.env.local`, **restart your development server** (stop with Ctrl+C, then run `npm run dev` again)

## Step 3: Set Up Stripe Webhook (for production)

Webhooks allow Stripe to notify your app about payment events.

### For Local Development (using Stripe CLI):

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhook events to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret (starts with `whsec_`) and add it to `.env.local`

### For Production:

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select the following events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret and add it to your production environment variables

## Step 4: Test Payments

Stripe provides test card numbers for testing:

### Successful Payment:
- **Card Number:** 4242 4242 4242 4242
- **Expiry:** Any future date (e.g., 12/34)
- **CVC:** Any 3 digits (e.g., 123)

### Payment Requires Authentication:
- **Card Number:** 4000 0025 0000 3155

### Card Declined:
- **Card Number:** 4000 0000 0000 9995

More test cards: https://stripe.com/docs/testing

## Step 5: Test the Payment Flow

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the pricing page and click on a plan

3. Select a plan (Personal or Enterprise) on the checkout page

4. Click "Continue to Payment"

5. You'll be redirected to Stripe Checkout

6. Use a test card to complete the payment

7. After successful payment, you'll be redirected to the success page

## Payment Flow Overview

1. User selects a plan on `/checkout`
2. Clicks "Continue to Payment"
3. App creates a Stripe Checkout Session via `/api/create-checkout-session`
4. User is redirected to Stripe's hosted checkout page
5. User enters payment details and completes payment
6. Stripe processes the payment
7. User is redirected back to `/checkout/success`
8. User's plan is upgraded to premium in localStorage
9. Webhook events update subscription status in the background

## Features

- ✅ Personal Plan: £14.99/month
- ✅ Enterprise Plan: £100/month
- ✅ 7-day free trial (Personal plan only, first-time users)
- ✅ Secure payment processing with Stripe Checkout
- ✅ Webhook handling for subscription events
- ✅ Trial tracking (users can't use trial twice)
- ✅ Subscription management

## Important Notes

- **Test Mode**: Always test in Stripe's test mode before going live
- **Live Mode**: Switch to live keys when ready for production
- **Security**: Never commit your `.env.local` file to version control
- **Webhooks**: Ensure webhook secret is configured for production
- **Currency**: Currently set to GBP (£). Change in `/api/create-checkout-session/route.ts` if needed

## Troubleshooting

### "Error creating checkout session"
- Check that your Stripe secret key is correct in `.env.local`
- Ensure the Stripe package is installed: `npm install stripe`

### "Webhook signature verification failed"
- Verify your webhook secret is correct in `.env.local`
- For local development, ensure Stripe CLI is running

### Payment not updating user status
- Check browser console for errors
- Verify the success page is upgrading the user via `upgradeToPremium()`
- Check that webhooks are being received (Stripe Dashboard → Developers → Webhooks)

## Going Live

Before launching to production:

1. Switch from test keys to live keys in your production environment
2. Set up production webhook endpoint
3. Test with real payment methods (use small amounts)
4. Set up proper error handling and monitoring
5. Configure email notifications for payment events
6. Add subscription management UI in the user profile
7. Implement proper database integration (currently uses localStorage)

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Testing Stripe](https://stripe.com/docs/testing)
