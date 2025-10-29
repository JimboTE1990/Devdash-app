import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/server'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    })
  : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    )
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session completed:', session.id)

        // Update user to premium in Supabase
        if (session.metadata?.userId) {
          const { error } = await supabaseAdmin
            .from('profiles')
            .update({
              plan: 'premium',
              subscription_start_date: new Date().toISOString(),
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              // Clear deletion fields when user upgrades (reactivates)
              deletion_scheduled_date: null,
              deletion_warning_sent: false,
              last_downgrade_date: null,
            })
            .eq('id', session.metadata.userId)

          if (error) {
            console.error('Error updating user to premium:', error)
          } else {
            console.log(`User ${session.metadata.userId} upgraded to premium`)
          }
        }

        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription created:', subscription.id)

        // Store subscription details
        if (subscription.metadata?.userId) {
          await supabaseAdmin
            .from('profiles')
            .update({
              stripe_subscription_id: subscription.id,
              stripe_customer_id: subscription.customer as string,
            })
            .eq('id', subscription.metadata.userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription updated:', subscription.id)

        // Find user by stripe customer ID
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single()

        if (profile) {
          // Handle subscription updates (plan changes, etc.)
          if (subscription.status === 'active') {
            await supabaseAdmin
              .from('profiles')
              .update({ plan: 'premium' })
              .eq('id', profile.id)
          } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            await supabaseAdmin
              .from('profiles')
              .update({ plan: 'free' })
              .eq('id', profile.id)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription deleted:', subscription.id)

        // Find user by stripe customer ID and downgrade to free
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single()

        if (profile) {
          // Calculate deletion date: 12 months after subscription cancellation (GDPR compliance)
          const now = new Date()
          const deletionDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 12 months

          await supabaseAdmin
            .from('profiles')
            .update({
              plan: 'free',
              stripe_subscription_id: null,
              last_downgrade_date: now.toISOString(),
              deletion_scheduled_date: deletionDate.toISOString(),
              deletion_warning_sent: false,
            })
            .eq('id', profile.id)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment succeeded for invoice:', invoice.id)
        // You could log this or send confirmation email
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment failed for invoice:', invoice.id)

        // Optionally notify user of payment failure
        // await sendPaymentFailureEmail(invoice.customer_email)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error(`Error processing webhook: ${err.message}`)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
