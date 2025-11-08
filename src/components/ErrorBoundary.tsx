'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
}

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child
 * component tree and displays a fallback UI instead of crashing the whole app.
 *
 * @example
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * @example With custom fallback
 * <ErrorBoundary fallback={CustomErrorFallback}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // TODO: In production, you can log to an error reporting service
    // Example: logErrorToService(error, errorInfo)
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback

      return (
        <FallbackComponent
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Default error fallback UI component
 */
function DefaultErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-card border border-border rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          An unexpected error occurred. Don't worry, your data is safe. Try refreshing the page or
          contact support if the problem persists.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4 p-3 bg-secondary rounded-md">
            <summary className="cursor-pointer text-sm font-medium text-foreground mb-2">
              Error Details (Development Only)
            </summary>
            <pre className="text-xs text-red-600 dark:text-red-400 overflow-x-auto whitespace-pre-wrap break-words">
              {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex gap-3">
          <Button onClick={resetErrorBoundary} variant="default" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={() => (window.location.href = '/')}
            variant="outline"
            className="flex-1"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to create a custom error boundary with specific error handling
 *
 * @example
 * function MyComponent() {
 *   const { ErrorBoundary } = useErrorHandler()
 *   return (
 *     <ErrorBoundary>
 *       <RiskyComponent />
 *     </ErrorBoundary>
 *   )
 * }
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return {
    error,
    setError,
    resetError: () => setError(null),
  }
}
