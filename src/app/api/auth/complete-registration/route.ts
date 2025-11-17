import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      console.log(`Profile already exists for user ${userId}, returning success`)
      return NextResponse.json({
        success: true,
        existing: true,
        profile: {
          plan: existingProfile.plan,
          trial_end_date: existingProfile.trial_end_date
        }
      })
    }

    // Get user metadata from auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (authError || !authUser) {
      console.error('Error fetching auth user:', authError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Extract user data from metadata
    const firstName = authUser.user.user_metadata?.first_name || ''
    const lastName = authUser.user.user_metadata?.last_name || ''
    const trialDurationDays = authUser.user.user_metadata?.trial_duration_days || 7

    // Calculate trial dates
    const now = new Date()
    const trialEndDate = new Date(now.getTime() + trialDurationDays * 24 * 60 * 60 * 1000)

    console.log(`Creating NEW profile for user ${userId}:`, {
      firstName,
      lastName,
      email: authUser.user.email,
      trial_start: now.toISOString(),
      trial_end: trialEndDate.toISOString(),
    })

    // Create profile using service role (bypasses RLS)
    const { data: newProfile, error: profileError } = await supabaseAdmin
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

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return NextResponse.json({ error: 'Failed to create profile', details: profileError.message }, { status: 500 })
    }

    console.log(`✅ Profile created successfully for user ${userId}`)
    return NextResponse.json({
      success: true,
      existing: false,
      profile: {
        plan: newProfile.plan,
        trial_end_date: newProfile.trial_end_date
      }
    })
  } catch (err: any) {
    console.error('Error in complete-registration:', err)
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 })
  }
}
