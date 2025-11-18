// Quick script to fix trial dates for existing user profile
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixTrial() {
  try {
    console.log('🔍 Looking for your profile...')

    // Get all users and their profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, plan, trial_start_date, trial_end_date, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (profileError) {
      console.error('Error fetching profiles:', profileError)
      return
    }

    console.log('\n📋 Recent profiles:')
    profiles.forEach((p, i) => {
      const daysRemaining = p.trial_end_date
        ? Math.round((new Date(p.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null

      console.log(`${i + 1}. ${p.first_name} ${p.last_name} - ${p.plan}`)
      console.log(`   Trial ends: ${p.trial_end_date || 'NOT SET'}`)
      console.log(`   Days remaining: ${daysRemaining !== null ? daysRemaining : 'N/A'}`)
      console.log(`   ID: ${p.id}`)
      console.log()
    })

    // Ask which profile to fix (in production, you'd pass email as argument)
    console.log('To fix your trial, run:')
    console.log('node fix-my-trial.js YOUR_EMAIL@example.com')
    console.log('\nOr update the profile directly in Supabase dashboard with these values:')

    const now = new Date()
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    console.log('\ntrial_start_date:', now.toISOString())
    console.log('trial_end_date:', trialEnd.toISOString())
    console.log('plan: free')
    console.log('has_used_trial: false')

  } catch (err) {
    console.error('Error:', err)
  }
}

// If email provided as argument, fix that specific user
const email = process.argv[2]

if (email) {
  (async () => {
    try {
      console.log(`🔧 Fixing trial for ${email}...`)

      // Get user by matching from auth.users then profiles
      const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()

      const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

      if (!user) {
        console.error('User not found with email:', email)
        return
      }

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, first_name')
        .eq('id', user.id)
        .single()

      if (error || !profiles) {
        console.error('User not found:', error)
        return
      }

      const now = new Date()
      const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          trial_start_date: now.toISOString(),
          trial_end_date: trialEnd.toISOString(),
          plan: 'free',
          has_used_trial: false,
          updated_at: now.toISOString()
        })
        .eq('id', profiles.id)

      if (updateError) {
        console.error('Error updating profile:', updateError)
        return
      }

      console.log('✅ Trial fixed successfully!')
      console.log(`Trial ends: ${trialEnd.toISOString()}`)
      console.log(`Days remaining: 7`)
      console.log('\nPlease logout and login again to see the changes.')

    } catch (err) {
      console.error('Error:', err)
    }
  })()
} else {
  fixTrial()
}
