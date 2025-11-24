#!/usr/bin/env node

/**
 * Test script to verify subscription management setup
 * Run with: node scripts/test-subscription-setup.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testDatabaseSchema() {
  console.log('\n🔍 Testing Database Schema...\n')

  // Test 1: Check if billing_interval column exists
  console.log('1. Checking billing_interval column...')
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('billing_interval')
      .limit(1)

    if (error) {
      console.error('   ❌ billing_interval column NOT found:', error.message)
      return false
    } else {
      console.log('   ✅ billing_interval column exists')
    }
  } catch (err) {
    console.error('   ❌ Error:', err.message)
    return false
  }

  // Test 2: Check if cancellation_feedback table exists
  console.log('2. Checking cancellation_feedback table...')
  try {
    const { data, error } = await supabase
      .from('cancellation_feedback')
      .select('id')
      .limit(1)

    if (error) {
      console.error('   ❌ cancellation_feedback table NOT found:', error.message)
      return false
    } else {
      console.log('   ✅ cancellation_feedback table exists')
    }
  } catch (err) {
    console.error('   ❌ Error:', err.message)
    return false
  }

  // Test 3: Check profiles table structure
  console.log('3. Checking profiles table structure...')
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, plan, billing_interval, stripe_subscription_id, stripe_customer_id, subscription_start_date')
      .limit(1)

    if (error) {
      console.error('   ❌ Profiles table structure incomplete:', error.message)
      return false
    } else {
      console.log('   ✅ Profiles table has all required columns')
    }
  } catch (err) {
    console.error('   ❌ Error:', err.message)
    return false
  }

  return true
}

async function testEnvironmentVariables() {
  console.log('\n🔍 Testing Environment Variables...\n')

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ]

  let allPresent = true

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      console.log(`✅ ${varName} is set`)
    } else {
      console.error(`❌ ${varName} is MISSING`)
      allPresent = false
    }
  }

  return allPresent
}

async function testStripeConfiguration() {
  console.log('\n🔍 Testing Stripe Configuration...\n')

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

  try {
    // Test Stripe connection
    const balance = await stripe.balance.retrieve()
    console.log('✅ Stripe API connection successful')
    console.log(`   Mode: ${process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'TEST' : 'LIVE'}`)
  } catch (err) {
    console.error('❌ Stripe API connection failed:', err.message)
    return false
  }

  return true
}

async function testUserProfiles() {
  console.log('\n🔍 Testing User Profiles...\n')

  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, plan, billing_interval, stripe_subscription_id')
      .limit(5)

    if (error) {
      console.error('❌ Failed to fetch profiles:', error.message)
      return false
    }

    console.log(`✅ Found ${profiles.length} user profiles`)

    if (profiles.length > 0) {
      console.log('\n   Sample profiles:')
      profiles.forEach(profile => {
        const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'No name'
        console.log(`   - ${name}: ${profile.plan} plan, billing: ${profile.billing_interval || 'not set'}, subscription: ${profile.stripe_subscription_id ? 'linked' : 'not linked'}`)
      })
    }

    return true
  } catch (err) {
    console.error('❌ Error:', err.message)
    return false
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║   Subscription Management Setup Verification Test      ║')
  console.log('╚════════════════════════════════════════════════════════╝')

  const results = {
    envVars: await testEnvironmentVariables(),
    database: await testDatabaseSchema(),
    stripe: await testStripeConfiguration(),
    profiles: await testUserProfiles(),
  }

  console.log('\n╔════════════════════════════════════════════════════════╗')
  console.log('║                    TEST RESULTS                        ║')
  console.log('╚════════════════════════════════════════════════════════╝')
  console.log(`Environment Variables: ${results.envVars ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Database Schema:       ${results.database ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Stripe Configuration:  ${results.stripe ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`User Profiles:         ${results.profiles ? '✅ PASS' : '❌ FAIL'}`)

  const allPassed = Object.values(results).every(result => result)

  if (allPassed) {
    console.log('\n🎉 All tests passed! Subscription management is ready.')
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.')
  }

  console.log('')
}

runTests().catch(console.error)
