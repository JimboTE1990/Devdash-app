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
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find the user in Supabase
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, stripe_customer_id')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    // Search for customer in Stripe by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    })

    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: 'No Stripe customer found with this email' },
        { status: 404 }
      )
    }

    const customer = customers.data[0]

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 1,
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { error: 'No subscriptions found for this customer' },
        { status: 404 }
      )
    }

    const subscription = subscriptions.data[0]

    // Extract billing interval
    const interval = subscription.items.data[0]?.price.recurring?.interval
    const billingInterval = interval === 'year' ? 'annual' : 'monthly'

    // Determine plan based on subscription status
    let plan: 'free' | 'premium' = 'free'
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      plan = 'premium'
    }

    // Update the profile
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        plan: plan,
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        billing_interval: billingInterval,
        subscription_start_date: subscription.status === 'active'
          ? new Date(subscription.current_period_start * 1000).toISOString()
          : new Date().toISOString(),
        subscription_end_date: subscription.cancel_at
          ? new Date(subscription.cancel_at * 1000).toISOString()
          : new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('id', profile.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription synced successfully',
      data: {
        customerId: customer.id,
        subscriptionId: subscription.id,
        status: subscription.status,
        plan: plan,
        billingInterval: billingInterval,
      },
    })
  } catch (err: any) {
    console.error('Error syncing subscription:', err)
    return NextResponse.json(
      { error: 'Failed to sync subscription', details: err.message },
      { status: 500 }
    )
  }
}
