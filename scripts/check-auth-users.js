#!/usr/bin/env node

/**
 * Check auth.users table for emails
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAuthUsers() {
  console.log('\n🔍 Checking auth.users table...\n')

  try {
    // List all users from auth.users
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error('❌ Error fetching users:', error.message)
      return
    }

    if (!users || users.length === 0) {
      console.log('❌ No users found')
      return
    }

    console.log(`Found ${users.length} user(s):\n`)

    for (const user of users) {
      console.log(`User ID: ${user.id}`)
      console.log(`  Email: ${user.email}`)
      console.log(`  Email Verified: ${user.email_confirmed_at ? 'Yes' : 'No'}`)
      console.log(`  Created: ${user.created_at}`)
      console.log(`  Last Sign In: ${user.last_sign_in_at || 'Never'}`)

      // Now check if there's a matching profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, plan')
        .eq('id', user.id)
        .single()

      if (profile) {
        console.log(`  Profile Name: ${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'N/A')
        console.log(`  Profile Email: ${profile.email || '❌ MISSING'}`)
        console.log(`  Profile Plan: ${profile.plan}`)
      } else {
        console.log(`  ❌ No matching profile found`)
      }
      console.log('')
    }
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

checkAuthUsers()
