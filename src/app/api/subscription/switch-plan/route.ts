import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/server'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    })
  : null

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    )
  }

  try {
    const { newInterval } = await req.json() // 'monthly' or 'annual'

    if (!newInterval || !['monthly', 'annual'].includes(newInterval)) {
      return NextResponse.json(
        { error: 'Invalid billing interval. Must be "monthly" or "annual"' },
        { status: 400 }
      )
    }

    // Get the authorization token from the request header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify the token and get the user
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's profile with Stripe subscription ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_subscription_id, billing_interval')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !profile.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Check if already on the requested interval
    if (profile.billing_interval === newInterval) {
      return NextResponse.json(
        { error: `Already on ${newInterval} billing` },
        { status: 400 }
      )
    }

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)

    // Define new price based on interval
    const newPriceData = {
      monthly: {
        amount: 2499, // £24.99
        interval: 'month' as const,
        name: 'Personal Plan - Monthly',
      },
      annual: {
        amount: 24990, // £249.90 (2 months free)
        interval: 'year' as const,
        name: 'Personal Plan - Annual (2 Months Free)',
      },
    }

    const newPrice = newPriceData[newInterval as 'monthly' | 'annual']

    // Create a new price in Stripe
    const priceObject = await stripe.prices.create({
      currency: 'gbp',
      unit_amount: newPrice.amount,
      recurring: {
        interval: newPrice.interval,
      },
      product_data: {
        name: newPrice.name,
      },
    })

    // Schedule the subscription to change at period end
    const updatedSubscription = await stripe.subscriptions.update(
      profile.stripe_subscription_id,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: priceObject.id,
          },
        ],
        proration_behavior: 'none', // No immediate charge, change at period end
        billing_cycle_anchor: 'unchanged',
      }
    )

    // Update billing_interval in database (will be confirmed by webhook)
    await supabaseAdmin
      .from('profiles')
      .update({ billing_interval: newInterval })
      .eq('id', user.id)

    return NextResponse.json({
      success: true,
      message: `Plan will switch to ${newInterval} billing at period end`,
      effective_date: updatedSubscription.current_period_end,
      new_amount: newPrice.amount,
      new_interval: newInterval,
    })
  } catch (err: any) {
    console.error('Error switching plan:', err)
    return NextResponse.json(
      { error: 'Failed to switch plan', details: err.message },
      { status: 500 }
    )
  }
}
