import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Get current commit
    const { stdout: currentHash } = await execAsync('git rev-parse HEAD')

    // Get last 20 commits with format: hash|short hash|message|date|author
    const { stdout } = await execAsync(
      'git log -20 --pretty=format:"%H|%h|%s|%ar|%an"'
    )

    const commits = stdout
      .trim()
      .split('\n')
      .filter(line => line.length > 0)
      .map(line => {
        const [hash, shortHash, message, date, author] = line.split('|')
        return {
          hash: hash.trim(),
          shortHash: shortHash.trim(),
          message: message.trim(),
          date: date.trim(),
          author: author.trim(),
        }
      })

    return NextResponse.json({
      commits,
      current: currentHash.trim(),
    })
  } catch (error) {
    console.error('Git error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commits' },
      { status: 500 }
    )
  }
}
