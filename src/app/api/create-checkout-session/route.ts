import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    })
  : null

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    const { planType, billingInterval = 'monthly', userId, userEmail, hasUsedTrial } = await req.json()

    // Define plan pricing (monthly base price: £24.99, annual: £249.90 for 12 months = 2 months free)
    const planPrices = {
      personal: {
        monthly: {
          amount: 2499, // £24.99 in pence (Early Bird Special - 40% off £39.99)
          name: 'Personal Plan - Monthly',
          interval: 'month' as const,
        },
        annual: {
          amount: 24990, // £249.90 in pence (10 months price, 2 months free)
          name: 'Personal Plan - Annual (2 Months Free)',
          interval: 'year' as const,
        },
      },
      enterprise: {
        monthly: {
          amount: 10000, // £100 in pence
          name: 'Enterprise Plan - Monthly',
          interval: 'month' as const,
        },
        annual: {
          amount: 100000, // £1000 in pence
          name: 'Enterprise Plan - Annual',
          interval: 'year' as const,
        },
      },
    }

    const selectedPlan = planPrices[planType as keyof typeof planPrices]?.[billingInterval as 'monthly' | 'annual']
      || planPrices.personal.monthly

    // Create Checkout Session
    // All paid subscriptions include 7-day trial period
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: selectedPlan.name,
              description: `Jimbula ${selectedPlan.name} - Includes 7-day free trial`,
            },
            unit_amount: selectedPlan.amount,
            recurring: {
              interval: selectedPlan.interval,
            },
          },
          quantity: 1,
        },
      ],
      // All paid plans include 7-day trial
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          userId,
          planType,
          billingInterval,
        },
      },
      customer_email: userEmail,
      metadata: {
        userId,
        planType,
        billingInterval,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?plan=${planType}&billing=${billingInterval}`,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
