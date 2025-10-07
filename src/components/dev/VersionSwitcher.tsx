'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, GitBranch, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface GitCommit {
  hash: string
  shortHash: string
  message: string
  date: string
  author: string
}

export function VersionSwitcher() {
  const [commits, setCommits] = useState<GitCommit[]>([])
  const [currentCommit, setCurrentCommit] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCommits()
  }, [])

  const fetchCommits = async () => {
    try {
      const response = await fetch('/api/git/commits')
      if (response.ok) {
        const data = await response.json()
        setCommits(data.commits)
        setCurrentCommit(data.current)
      }
    } catch (error) {
      console.error('Failed to fetch commits:', error)
    }
  }

  const switchVersion = async (hash: string) => {
    if (loading) return

    setLoading(true)
    try {
      const response = await fetch('/api/git/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash }),
      })

      if (response.ok) {
        // Reload the page to reflect changes
        window.location.reload()
      } else {
        alert('Failed to switch version')
      }
    } catch (error) {
      console.error('Failed to switch version:', error)
      alert('Failed to switch version')
    } finally {
      setLoading(false)
    }
  }

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2">
      {/* Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="outline"
            className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800 shadow-lg"
          >
            <GitBranch className="h-4 w-4 mr-2" />
            Versions
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[min(400px,90vw)] max-h-[min(500px,60vh)] overflow-y-auto !-mt-[calc(100%+3.5rem)]"
        >
          <DropdownMenuLabel className="flex items-center gap-2 sticky top-0 bg-[#2d4a4a] z-10 border-b border-[#4a6a6a]">
            <GitBranch className="h-4 w-4" />
            Git Commits ({commits.length})
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {commits.length === 0 ? (
            <div className="px-2 py-4 text-sm text-gray-400 text-center">
              No commits found
            </div>
          ) : (
            commits.map((commit) => (
              <DropdownMenuItem
                key={commit.hash}
                onClick={() => switchVersion(commit.hash)}
                disabled={loading}
                className={`flex flex-col items-start gap-1 px-3 py-2.5 cursor-pointer ${
                  commit.hash === currentCommit ? 'bg-blue-500/10 border-l-2 border-blue-500' : ''
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-2 w-full flex-wrap">
                  <code className="text-xs font-mono bg-gray-900 px-2 py-0.5 rounded">
                    {commit.shortHash}
                  </code>
                  {commit.hash === currentCommit && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-medium">
                      ● Current
                    </span>
                  )}
                  <RotateCcw className="h-3 w-3 ml-auto text-gray-400" />
                </div>
                <div className="text-sm font-medium break-words w-full text-white">{commit.message}</div>
                <div className="text-xs text-gray-400">
                  {commit.date} • {commit.author}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
