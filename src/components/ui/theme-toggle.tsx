'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

function ThemeToggleClient() {
  // This component will only be imported client-side
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useTheme } = require('@/context/ThemeContext')
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-lg border border-border">
      <button
        onClick={toggleTheme}
        className={`text-xs font-medium transition-colors ${
          theme === 'light' ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        Light
      </button>

      <button
        onClick={toggleTheme}
        className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        style={{
          backgroundColor: theme === 'dark' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
        }}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>

      <button
        onClick={toggleTheme}
        className={`text-xs font-medium transition-colors ${
          theme === 'dark' ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        Dark
      </button>
    </div>
  )
}

// Placeholder shown during SSR
function ThemeTogglePlaceholder() {
  return (
    <div className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-lg border border-border">
      <span className="text-xs font-medium text-muted-foreground">Light</span>
      <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-muted-foreground">
        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-0.5" />
      </div>
      <span className="text-xs font-medium text-muted-foreground">Dark</span>
    </div>
  )
}

export const ThemeToggle = dynamic(() => Promise.resolve(ThemeToggleClient), {
  ssr: false,
  loading: () => <ThemeTogglePlaceholder />,
})
