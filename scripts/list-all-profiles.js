#!/usr/bin/env node

/**
 * List all profiles in the database
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function listAllProfiles() {
  console.log('\n📋 Listing all profiles...\n')

  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching profiles:', error.message)
      return
    }

    if (!profiles || profiles.length === 0) {
      console.log('❌ No profiles found')
      return
    }

    console.log(`Found ${profiles.length} profile(s):\n`)

    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. User ID: ${profile.id}`)
      console.log(`   Email: ${profile.email || 'N/A'}`)
      console.log(`   Name: ${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'N/A')
      console.log(`   Plan: ${profile.plan}`)
      console.log(`   Billing Interval: ${profile.billing_interval || 'NULL'}`)
      console.log(`   Stripe Customer ID: ${profile.stripe_customer_id || 'NULL'}`)
      console.log(`   Stripe Subscription ID: ${profile.stripe_subscription_id || 'NULL'}`)
      console.log(`   Trial Start: ${profile.trial_start_date || 'NULL'}`)
      console.log(`   Trial End: ${profile.trial_end_date || 'NULL'}`)
      console.log(`   Created: ${profile.created_at}`)
      console.log('')
    })
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

listAllProfiles()
