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

    const { planType, userId, userEmail, hasUsedTrial } = await req.json()

    // Define plan pricing
    const planPrices = {
      personal: {
        amount: 2499, // £24.99 in pence (Early Bird Special - 40% off £39.99)
        name: 'Personal Plan',
      },
      enterprise: {
        amount: 10000, // £100 in pence
        name: 'Enterprise Plan',
      },
    }

    const selectedPlan = planPrices[planType as keyof typeof planPrices] || planPrices.personal

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: selectedPlan.name,
              description: `Jimbula ${selectedPlan.name} - Monthly subscription`,
            },
            unit_amount: selectedPlan.amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      // Only offer trial for personal plan if user hasn't used it
      subscription_data: (planType === 'personal' && !hasUsedTrial) ? {
        trial_period_days: 7,
        metadata: {
          userId,
          planType,
        },
      } : {
        metadata: {
          userId,
          planType,
        },
      },
      customer_email: userEmail,
      metadata: {
        userId,
        planType,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?plan=${planType}`,
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
