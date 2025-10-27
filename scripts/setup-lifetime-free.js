#!/usr/bin/env node

/**
 * Setup Lifetime Free Access for Founder
 *
 * This script:
 * 1. Adds is_lifetime_free and trial_duration_days columns to profiles table
 * 2. Sets founder account (jfamarketingsolutions@gmail.com) to lifetime free
 * 3. Verifies the changes
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read .env.local file manually
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY
const founderEmail = 'jfamarketingsolutions@gmail.com'

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function main() {
  console.log('🔧 Setting up lifetime free access...\n')

  try {
    // Step 1: Add columns to profiles table
    console.log('📋 Step 1: Adding columns to profiles table...')

    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add new columns if they don't exist
        DO $$
        BEGIN
          -- Add is_lifetime_free column
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'profiles' AND column_name = 'is_lifetime_free'
          ) THEN
            ALTER TABLE profiles ADD COLUMN is_lifetime_free BOOLEAN DEFAULT false;
            RAISE NOTICE 'Added column: is_lifetime_free';
          ELSE
            RAISE NOTICE 'Column already exists: is_lifetime_free';
          END IF;

          -- Add trial_duration_days column
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'profiles' AND column_name = 'trial_duration_days'
          ) THEN
            ALTER TABLE profiles ADD COLUMN trial_duration_days INTEGER DEFAULT 7;
            RAISE NOTICE 'Added column: trial_duration_days';
          ELSE
            RAISE NOTICE 'Column already exists: trial_duration_days';
          END IF;
        END $$;

        -- Add comments
        COMMENT ON COLUMN profiles.is_lifetime_free IS 'True for accounts with permanent free access (e.g., founder)';
        COMMENT ON COLUMN profiles.trial_duration_days IS 'Custom trial duration in days (default: 7 days)';

        -- Create index
        CREATE INDEX IF NOT EXISTS idx_profiles_lifetime_free ON profiles(is_lifetime_free) WHERE is_lifetime_free = true;
      `
    })

    if (alterError) {
      // If rpc doesn't exist, try direct SQL execution
      console.log('   Note: exec_sql function not found, will update profile directly')
    } else {
      console.log('✅ Columns added successfully\n')
    }

    // Step 2: Get founder user ID
    console.log('📋 Step 2: Finding founder account...')

    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
      throw new Error(`Failed to list users: ${userError.message}`)
    }

    const founderUser = userData.users.find(u => u.email === founderEmail)

    if (!founderUser) {
      throw new Error(`Founder account not found: ${founderEmail}`)
    }

    console.log(`   Found user: ${founderUser.email} (${founderUser.id})`)
    console.log('✅ Founder account found\n')

    // Step 3: Update profile to lifetime free
    console.log('📋 Step 3: Setting lifetime free access...')

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_lifetime_free: true,
        trial_duration_days: 7,
        updated_at: new Date().toISOString(),
      })
      .eq('id', founderUser.id)

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }

    console.log('✅ Profile updated successfully\n')

    // Step 4: Verify the changes
    console.log('📋 Step 4: Verifying changes...')

    const { data: profile, error: verifyError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, plan, is_lifetime_free, trial_duration_days, trial_start_date, trial_end_date')
      .eq('id', founderUser.id)
      .single()

    if (verifyError) {
      throw new Error(`Failed to verify: ${verifyError.message}`)
    }

    console.log('   Profile Details:')
    console.log(`   - Email: ${founderEmail}`)
    console.log(`   - Name: ${profile.first_name} ${profile.last_name}`)
    console.log(`   - Plan: ${profile.plan}`)
    console.log(`   - Lifetime Free: ${profile.is_lifetime_free}`)
    console.log(`   - Trial Duration: ${profile.trial_duration_days} days`)

    if (profile.is_lifetime_free === true) {
      console.log('✅ Verification successful!\n')
      console.log('🎉 Setup complete!')
      console.log('   → Refresh your browser (Cmd+Shift+R / Ctrl+Shift+R)')
      console.log('   → Profile page should now show "Lifetime Free"')
      console.log('   → Trial expiration banners should disappear')
    } else {
      console.log('⚠️  Warning: is_lifetime_free is not true')
      console.log('   This might indicate the update did not work properly')
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('\nTroubleshooting:')
    console.error('1. Check your .env.local file has correct Supabase credentials')
    console.error('2. Verify the founder email is correct: ' + founderEmail)
    console.error('3. Ensure the profiles table exists in your database')
    process.exit(1)
  }
}

main()
