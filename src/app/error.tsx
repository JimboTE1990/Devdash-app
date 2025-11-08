'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Next.js error page component
 * Automatically wraps route segments and handles errors
 * https://nextjs.org/docs/app/api-reference/file-conventions/error
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Next.js error page caught:', error)
    }

    // TODO: In production, log to error reporting service
    // Example: logErrorToService(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-lg w-full bg-card border border-border rounded-lg shadow-xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Oops! Something went wrong</h1>
            <p className="text-sm text-muted-foreground mt-1">
              We encountered an unexpected error
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Don't worry, your data is safe. This error has been logged and we'll look into it.
            You can try refreshing the page or return to the home page.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 p-4 bg-secondary rounded-lg border border-border">
            <summary className="cursor-pointer text-sm font-semibold text-foreground mb-3 hover:text-primary transition-colors">
              🔍 Error Details (Development Mode)
            </summary>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Message:</p>
                <p className="text-sm text-red-600 dark:text-red-400 font-mono">
                  {error.message}
                </p>
              </div>
              {error.digest && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Digest:</p>
                  <p className="text-xs text-muted-foreground font-mono">{error.digest}</p>
                </div>
              )}
              {error.stack && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Stack Trace:</p>
                  <pre className="text-xs text-red-600 dark:text-red-400 overflow-x-auto whitespace-pre-wrap break-words font-mono bg-red-50 dark:bg-red-950/20 p-3 rounded border border-red-200 dark:border-red-800">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={reset} variant="default" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={() => (window.location.href = '/')} variant="outline" className="flex-1">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>

        {process.env.NODE_ENV === 'production' && (
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              If this problem persists, please contact{' '}
              <a
                href="mailto:contact@jimbula.com"
                className="text-primary hover:underline font-medium"
              >
                contact@jimbula.com
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
