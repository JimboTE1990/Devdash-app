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

/**
 * Ensures a profile exists for a verified user
 * Creates a minimal profile (no trial dates) if one doesn't exist
 * This allows verified users to login and reach the ClaimTrialPrompt
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log(`[Ensure Profile] Checking profile for user: ${userId}`)

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = not found, which is expected
      console.error('[Ensure Profile] Error checking profile:', checkError)
      return NextResponse.json({ error: 'Failed to check profile' }, { status: 500 })
    }

    if (existingProfile) {
      console.log(`[Ensure Profile] Profile already exists for user ${userId}`)
      return NextResponse.json({
        success: true,
        existed: true,
        profile: existingProfile,
      })
    }

    // Profile doesn't exist - create minimal profile without trial
    // User will claim trial later via ClaimTrialPrompt
    console.log(`[Ensure Profile] Creating minimal profile for user ${userId}`)

    // Get user metadata for name
    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId)
    const firstName = authData?.user?.user_metadata?.first_name || ''
    const lastName = authData?.user?.user_metadata?.last_name || ''

    const now = new Date()

    const { data: newProfile, error: createError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        plan: 'free',
        // No trial dates - user needs to claim trial
        trial_start_date: null,
        trial_end_date: null,
        trial_duration_days: 7,
        has_used_trial: false,
        is_lifetime_free: false,
        updated_at: now.toISOString(),
      })
      .select()
      .single()

    if (createError) {
      console.error('[Ensure Profile] Error creating profile:', createError)
      console.error('[Ensure Profile] Error details:', {
        code: createError.code,
        message: createError.message,
        details: createError.details,
      })
      return NextResponse.json({
        error: 'Failed to create profile',
        details: createError.message,
      }, { status: 500 })
    }

    console.log(`[Ensure Profile] Profile created successfully for user ${userId}`)
    return NextResponse.json({
      success: true,
      existed: false,
      profile: newProfile,
    })
  } catch (error) {
    console.error('[Ensure Profile] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
