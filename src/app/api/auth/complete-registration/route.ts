import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
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

    // Log for debugging
    console.log(`Creating profile for user ${userId}:`, {
      firstName,
      lastName,
      email: authUser.user.email,
      metadata: authUser.user.user_metadata
    })

    // Calculate trial dates
    const now = new Date()
    const trialEndDate = new Date(now.getTime() + trialDurationDays * 24 * 60 * 60 * 1000)

    // Create or update profile using service role (bypasses RLS)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: userId,
          first_name: firstName,
          last_name: lastName,
          plan: 'free',
          trial_start_date: now.toISOString(),
          trial_end_date: trialEndDate.toISOString(),
          trial_duration_days: trialDurationDays,
          has_used_trial: false, // User hasn't used trial yet - they're starting it now
          updated_at: now.toISOString(),
        },
        {
          onConflict: 'id',
        }
      )

    if (profileError) {
      console.error('Error creating/updating profile:', profileError)
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }

    console.log(`Profile created successfully for user ${userId}`)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Error in complete-registration:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
