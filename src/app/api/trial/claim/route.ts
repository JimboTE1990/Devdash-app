import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create Supabase admin client with service role (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const trialDurationDays = 7

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log(`[Trial Claim] Request from user: ${userId}`)

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = not found, which is expected for new users
      console.error('[Trial Claim] Error checking profile:', checkError)
      return NextResponse.json({ error: 'Failed to check existing profile' }, { status: 500 })
    }

    // If profile exists with trial already claimed
    if (existingProfile && existingProfile.trial_start_date) {
      console.log(`[Trial Claim] Trial already claimed for user ${userId}`)
      return NextResponse.json({
        success: true,
        alreadyClaimed: true,
        profile: {
          plan: existingProfile.plan,
          trial_start_date: existingProfile.trial_start_date,
          trial_end_date: existingProfile.trial_end_date,
        },
      })
    }

    // Calculate trial dates
    const now = new Date()
    const trialEndDate = new Date(now.getTime() + trialDurationDays * 24 * 60 * 60 * 1000)

    console.log(`[Trial Claim] Creating trial for user ${userId}:`, {
      trial_start: now.toISOString(),
      trial_end: trialEndDate.toISOString(),
    })

    // Get user metadata for name (if available)
    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId)
    const firstName = authData?.user?.user_metadata?.first_name || ''
    const lastName = authData?.user?.user_metadata?.last_name || ''

    if (existingProfile) {
      // Profile exists but no trial - update it
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          trial_start_date: now.toISOString(),
          trial_end_date: trialEndDate.toISOString(),
          trial_duration_days: trialDurationDays,
          has_used_trial: false,
          plan: 'free',
          updated_at: now.toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (updateError) {
        console.error('[Trial Claim] Error updating profile:', updateError)
        return NextResponse.json({ error: 'Failed to update trial' }, { status: 500 })
      }

      console.log(`[Trial Claim] Trial updated successfully for user ${userId}`)
      return NextResponse.json({
        success: true,
        alreadyClaimed: false,
        profile: {
          plan: updatedProfile.plan,
          trial_start_date: updatedProfile.trial_start_date,
          trial_end_date: updatedProfile.trial_end_date,
        },
      })
    } else {
      // No profile exists - create new one with trial
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          first_name: firstName,
          last_name: lastName,
          plan: 'free',
          trial_start_date: now.toISOString(),
          trial_end_date: trialEndDate.toISOString(),
          trial_duration_days: trialDurationDays,
          has_used_trial: false,
          updated_at: now.toISOString(),
        })
        .select()
        .single()

      if (createError) {
        console.error('[Trial Claim] Error creating profile:', createError)
        return NextResponse.json({ error: 'Failed to create trial' }, { status: 500 })
      }

      console.log(`[Trial Claim] Profile created successfully for user ${userId}`)
      return NextResponse.json({
        success: true,
        alreadyClaimed: false,
        profile: {
          plan: newProfile.plan,
          trial_start_date: newProfile.trial_start_date,
          trial_end_date: newProfile.trial_end_date,
        },
      })
    }
  } catch (error) {
    console.error('[Trial Claim] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
