#!/usr/bin/env node

/**
 * Fix missing emails in profiles table by copying from auth.users
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function fixProfileEmails() {
  console.log('\n🔧 Fixing missing emails in profiles table...\n')

  try {
    // Get all users from auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message)
      return
    }

    console.log(`Found ${users.length} auth users\n`)

    for (const user of users) {
      console.log(`Processing user: ${user.email}`)
      console.log(`  Auth ID: ${user.id}`)

      // Try to get the profile directly with service role (bypassing RLS)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        console.log(`  ❌ Error fetching profile: ${profileError.message}`)
        continue
      }

      if (!profile) {
        console.log(`  ⚠️  No profile found - profile may need to be created`)
        continue
      }

      console.log(`  ✅ Found profile: ${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'No name')
      console.log(`  Current email in profile: ${profile.email || 'NULL'}`)

      // Update the email if missing
      if (!profile.email) {
        console.log(`  📝 Updating email to: ${user.email}`)

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ email: user.email })
          .eq('id', user.id)

        if (updateError) {
          console.log(`  ❌ Failed to update: ${updateError.message}`)
        } else {
          console.log(`  ✅ Email updated successfully`)
        }
      } else {
        console.log(`  ℹ️  Email already set, skipping`)
      }

      console.log('')
    }

    console.log('✅ Done!\n')
  } catch (err) {
    console.error('❌ Error:', err.message)
    console.error(err)
  }
}

fixProfileEmails()
