import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  try {
    const { email, plan } = await req.json()

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Validate plan
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan type is required' },
        { status: 400 }
      )
    }

    // Insert into waitlist table
    const { data, error } = await supabase
      .from('waitlist')
      .insert([
        {
          email: email.toLowerCase().trim(),
          plan: plan.toLowerCase(),
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      // Check for duplicate email
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already on the waiting list' },
          { status: 409 }
        )
      }

      console.error('Waitlist signup error:', error)
      return NextResponse.json(
        { error: 'Failed to join waiting list' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully joined the waiting list',
        data
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Waitlist API error:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve waitlist count (optional, for admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const plan = searchParams.get('plan')

    let query = supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    if (plan) {
      query = query.eq('plan', plan)
    }

    const { count, error } = await query

    if (error) {
      console.error('Waitlist count error:', error)
      return NextResponse.json(
        { error: 'Failed to get waitlist count' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        count: count || 0,
        plan: plan || 'all'
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Waitlist GET error:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
