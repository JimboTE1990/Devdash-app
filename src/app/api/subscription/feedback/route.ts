import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { reason, additional_feedback } = await req.json()

    if (!reason) {
      return NextResponse.json(
        { error: 'Cancellation reason is required' },
        { status: 400 }
      )
    }

    // Get the authorization token from the request header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify the token and get the user
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Insert cancellation feedback
    const { error: insertError } = await supabaseAdmin
      .from('cancellation_feedback')
      .insert({
        user_id: user.id,
        reason,
        additional_feedback: additional_feedback || null,
      })

    if (insertError) {
      console.error('Error saving cancellation feedback:', insertError)
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback',
    })
  } catch (err: any) {
    console.error('Error processing feedback:', err)
    return NextResponse.json(
      { error: 'Failed to process feedback', details: err.message },
      { status: 500 }
    )
  }
}
