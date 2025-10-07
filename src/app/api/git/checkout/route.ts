import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: Request) {
  try {
    const { hash } = await request.json()

    if (!hash) {
      return NextResponse.json(
        { error: 'Commit hash is required' },
        { status: 400 }
      )
    }

    // Stash any uncommitted changes
    try {
      await execAsync('git stash')
    } catch (e) {
      // Ignore if nothing to stash
    }

    // Checkout the specific commit
    await execAsync(`git checkout ${hash}`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Git checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to checkout commit' },
      { status: 500 }
    )
  }
}
