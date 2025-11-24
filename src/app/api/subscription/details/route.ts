import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/server'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    })
  : null

export async function GET(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    )
  }

  try {
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
      .select('stripe_subscription_id, stripe_customer_id, billing_interval, plan, trial_end_date, subscription_start_date, subscription_end_date')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile query error:', profileError)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // If no subscription, return basic info
    if (!profile.stripe_subscription_id) {
      return NextResponse.json({
        plan: profile.plan,
        billing_interval: profile.billing_interval,
        trial_end_date: profile.trial_end_date,
        subscription_start_date: profile.subscription_start_date,
        subscription_end_date: profile.subscription_end_date,
        subscription: null,
      })
    }

    // Fetch full subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)

    return NextResponse.json({
      plan: profile.plan,
      billing_interval: profile.billing_interval,
      trial_end_date: profile.trial_end_date,
      subscription_start_date: profile.subscription_start_date,
      subscription_end_date: profile.subscription_end_date,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        cancel_at: subscription.cancel_at,
        canceled_at: subscription.canceled_at,
        trial_end: subscription.trial_end,
        amount: subscription.items.data[0]?.price.unit_amount || 0,
        currency: subscription.items.data[0]?.price.currency || 'gbp',
        interval: subscription.items.data[0]?.price.recurring?.interval || 'month',
      },
    })
  } catch (err: any) {
    console.error('Error fetching subscription details:', err)
    return NextResponse.json(
      { error: 'Failed to fetch subscription details', details: err.message },
      { status: 500 }
    )
  }
}
