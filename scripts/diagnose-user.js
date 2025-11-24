#!/usr/bin/env node

/**
 * Diagnose user subscription mismatch
 * Usage: node scripts/diagnose-user.js <user-id>
 */

const { createClient } = require('@supabase/supabase-js')
const Stripe = require('stripe')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function diagnoseUser(userId) {
  console.log('\n🔍 Diagnosing user subscription mismatch...')
  console.log('User ID:', userId)
  console.log('━'.repeat(80))

  try {
    // Get user profile from database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('❌ Error fetching profile:', error.message)
      return
    }

    if (!profile) {
      console.error('❌ User not found')
      return
    }

    console.log('\n📊 DATABASE PROFILE:')
    console.log('  Email:', profile.email || 'N/A')
    console.log('  Plan:', profile.plan)
    console.log('  Trial Start:', profile.trial_start_date)
    console.log('  Trial End:', profile.trial_end_date)
    console.log('  Subscription Start:', profile.subscription_start_date)
    console.log('  Stripe Customer ID:', profile.stripe_customer_id || '❌ NULL')
    console.log('  Stripe Subscription ID:', profile.stripe_subscription_id || '❌ NULL')
    console.log('  Billing Interval:', profile.billing_interval || '❌ NULL')

    // Check Stripe mode
    const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')
    console.log('\n🔑 STRIPE CONFIGURATION:')
    console.log('  Mode:', isTestMode ? '🧪 TEST MODE' : '🔴 LIVE MODE')
    console.log('  Secret Key:', process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...')

    // Search for customer in Stripe by email
    if (!profile.email) {
      console.log('\n❌ Cannot search Stripe: No email in profile')
      return
    }

    console.log('\n🔍 SEARCHING STRIPE:')
    console.log('  Looking for customer with email:', profile.email)

    const customers = await stripe.customers.list({
      email: profile.email,
      limit: 5,
    })

    if (customers.data.length === 0) {
      console.log('  ❌ No Stripe customer found with this email')
      console.log('\n💡 DIAGNOSIS:')
      console.log('  The user signed up in TEST mode but you\'re searching LIVE mode (or vice versa)')
      console.log('  OR the customer was never created in Stripe')
      return
    }

    console.log(`  ✅ Found ${customers.data.length} customer(s)`)

    for (const customer of customers.data) {
      console.log('\n  Customer:', customer.id)
      console.log('  Created:', new Date(customer.created * 1000).toISOString())
      console.log('  Metadata:', customer.metadata)

      // Get subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 10,
      })

      if (subscriptions.data.length === 0) {
        console.log('  ❌ No subscriptions found for this customer')
      } else {
        console.log(`  ✅ Found ${subscriptions.data.length} subscription(s)`)

        for (const sub of subscriptions.data) {
          console.log('\n    Subscription:', sub.id)
          console.log('    Status:', sub.status)
          console.log('    Created:', new Date(sub.created * 1000).toISOString())
          console.log('    Current Period Start:', new Date(sub.current_period_start * 1000).toISOString())
          console.log('    Current Period End:', new Date(sub.current_period_end * 1000).toISOString())

          if (sub.trial_end) {
            console.log('    Trial End:', new Date(sub.trial_end * 1000).toISOString())
          }

          if (sub.cancel_at) {
            console.log('    Cancels At:', new Date(sub.cancel_at * 1000).toISOString())
          }

          console.log('    Cancel At Period End:', sub.cancel_at_period_end)

          if (sub.items.data.length > 0) {
            const price = sub.items.data[0].price
            console.log('    Price:', price.id)
            console.log('    Amount:', `${price.currency.toUpperCase()} ${(price.unit_amount / 100).toFixed(2)}`)
            console.log('    Interval:', price.recurring?.interval || 'N/A')
          }
        }
      }
    }

    console.log('\n💡 DIAGNOSIS:')

    if (profile.plan === 'premium' && !profile.stripe_subscription_id) {
      console.log('  ❌ MISMATCH: Database shows premium but no Stripe subscription linked')

      if (customers.data.length > 0 && customers.data[0].subscriptions?.data?.length > 0) {
        console.log('\n  ✅ SOLUTION: Run sync-subscription endpoint to link the Stripe subscription')
        console.log(`     curl -X POST http://localhost:4000/api/admin/sync-subscription \\`)
        console.log(`       -H "Content-Type: application/json" \\`)
        console.log(`       -d '{"email":"${profile.email}"}'`)
      } else {
        console.log('\n  ⚠️  ISSUE: No active subscription found in Stripe')
        console.log('     This user needs to create a new subscription')
      }
    }

    console.log('\n' + '━'.repeat(80))
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

const userId = process.argv[2]

if (!userId) {
  console.error('❌ Please provide a user ID')
  console.error('Usage: node scripts/diagnose-user.js <user-id>')
  process.exit(1)
}

diagnoseUser(userId)
