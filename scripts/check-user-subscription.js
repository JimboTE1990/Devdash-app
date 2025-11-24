#!/usr/bin/env node

/**
 * Check specific user subscription details
 * Usage: node scripts/check-user-subscription.js <user-id>
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkUserSubscription(userId) {
  console.log('\n🔍 Checking subscription for user:', userId)
  console.log('━'.repeat(60))

  try {
    // Get user profile
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

    console.log('\n📊 Database Profile:')
    console.log('  ID:', profile.id)
    console.log('  Email:', profile.email || 'N/A')
    console.log('  Name:', `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'N/A')
    console.log('  Plan:', profile.plan)
    console.log('  Billing Interval:', profile.billing_interval || 'NULL')
    console.log('  Stripe Customer ID:', profile.stripe_customer_id || 'NULL')
    console.log('  Stripe Subscription ID:', profile.stripe_subscription_id || 'NULL')
    console.log('  Subscription Start Date:', profile.subscription_start_date || 'NULL')
    console.log('  Trial Start Date:', profile.trial_start_date || 'NULL')
    console.log('  Trial End Date:', profile.trial_end_date || 'NULL')
    console.log('  Has Used Trial:', profile.has_used_trial || false)
    console.log('  Created At:', profile.created_at)

    console.log('\n🔐 Access Status:')
    const now = new Date()
    const trialEndDate = profile.trial_end_date ? new Date(profile.trial_end_date) : null
    const isOnTrial = trialEndDate && now < trialEndDate && profile.plan === 'free'
    const isPremium = profile.plan === 'premium'
    const hasAccess = isPremium || isOnTrial

    console.log('  Is Premium:', isPremium ? '✅ YES' : '❌ NO')
    console.log('  Is On Trial:', isOnTrial ? '✅ YES' : '❌ NO')
    console.log('  Has Access:', hasAccess ? '✅ YES' : '❌ NO')

    console.log('\n⚠️  Issues Detected:')
    const issues = []

    if (profile.plan === 'premium' && !profile.stripe_subscription_id) {
      issues.push('❌ Premium plan but NO Stripe subscription ID (subscription not linked)')
    }

    if (profile.plan === 'premium' && !profile.billing_interval) {
      issues.push('❌ Premium plan but NO billing interval set')
    }

    if (!profile.stripe_customer_id && profile.plan === 'premium') {
      issues.push('❌ Premium plan but NO Stripe customer ID')
    }

    if (issues.length > 0) {
      issues.forEach(issue => console.log('  ' + issue))
    } else {
      console.log('  ✅ No issues detected')
    }

    console.log('\n💡 Recommendation:')
    if (profile.plan === 'premium' && !profile.stripe_subscription_id) {
      console.log('  This user shows as premium in the database but has no Stripe subscription linked.')
      console.log('  This likely happened because:')
      console.log('  1. The subscription was created in TEST mode')
      console.log('  2. The webhook wasn\'t properly saving subscription IDs at the time')
      console.log('\n  Solutions:')
      console.log('  A. Use the sync endpoint to link their Stripe subscription:')
      console.log(`     curl -X POST https://your-domain.com/api/admin/sync-subscription \\`)
      console.log(`       -H "Content-Type: application/json" \\`)
      console.log(`       -d '{"email":"${profile.email || 'user-email'}"}'`)
      console.log('\n  B. Have the user create a new subscription (they\'ll need to cancel the old one first)')
    }

    console.log('\n' + '━'.repeat(60))

  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

const userId = process.argv[2]

if (!userId) {
  console.error('❌ Please provide a user ID')
  console.error('Usage: node scripts/check-user-subscription.js <user-id>')
  process.exit(1)
}

checkUserSubscription(userId)
