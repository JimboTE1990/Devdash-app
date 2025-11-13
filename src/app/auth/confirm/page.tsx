'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

function ConfirmEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token from URL - support both new and legacy formats
        const token_hash = searchParams.get('token_hash')
        const token = searchParams.get('token') // Legacy format
        const type = searchParams.get('type')

        // Accept both 'email' and 'signup' types, and check for either token format
        const validToken = token_hash || token
        const validType = type === 'email' || type === 'signup' || type === 'magiclink'

        if (!validToken || !validType) {
          console.error('Invalid verification parameters:', { token_hash, token, type })
          setStatus('error')
          setMessage('Invalid verification link. Please try requesting a new verification email.')
          return
        }

        // Verify the email with Supabase using appropriate method
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: validToken,
          type: 'email',
        })

        if (error) {
          console.error('Email verification error:', error)
          setStatus('error')
          setMessage('Email verification failed. Please try again.')
          return
        }

        if (!data.user) {
          setStatus('error')
          setMessage('No user found')
          return
        }

        // Call our API to complete profile creation
        const response = await fetch('/api/auth/complete-registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id }),
        })

        if (!response.ok) {
          setStatus('error')
          setMessage('Failed to complete registration. Please contact support.')
          return
        }

        // Success!
        setStatus('success')
        setMessage('Email verified successfully! Redirecting to dashboard...')

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } catch (err) {
        console.error('Verification error:', err)
        setStatus('error')
        setMessage('An unexpected error occurred')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block mb-4"
                >
                  <Loader2 className="w-16 h-16 text-primary" />
                </motion.div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Verifying Email</h1>
                <p className="text-muted-foreground">{message}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="inline-block mb-4"
                >
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                </motion.div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Email Verified!</h1>
                <p className="text-muted-foreground mb-6">{message}</p>
                <div className="w-full bg-secondary rounded-full h-1 overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'linear' }}
                    className="h-full bg-primary"
                  />
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="inline-block mb-4"
                >
                  <XCircle className="w-16 h-16 text-red-500" />
                </motion.div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Verification Failed</h1>
                <p className="text-muted-foreground mb-6">{message}</p>
                <button
                  onClick={() => router.push('/auth')}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Back to Login
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  )
}
