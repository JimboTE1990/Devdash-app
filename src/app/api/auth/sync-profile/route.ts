import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * Sync profile data from auth.users metadata to profiles table
 * Useful for fixing existing accounts where names didn't sync properly
 */
export async function POST(req: NextRequest) {
  try {
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user metadata from auth.users (using admin client)
    const { data: authUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(user.id)

    if (fetchError || !authUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Extract names from metadata
    const firstName = authUser.user.user_metadata?.first_name || ''
    const lastName = authUser.user.user_metadata?.last_name || ''

    console.log(`Syncing profile for user ${user.id}:`, {
      firstName,
      lastName,
      metadata: authUser.user.user_metadata
    })

    // Update profile with names from metadata
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json({ error: 'Failed to sync profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      firstName,
      lastName
    })
  } catch (err: any) {
    console.error('Error in sync-profile:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
