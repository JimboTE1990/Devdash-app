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
        // Check if this is a PKCE flow (code parameter) or OTP flow (token_hash parameter)
        const code = searchParams.get('code')
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')

        let user = null

        // Handle PKCE flow (most common for email confirmations in 2025)
        if (code) {
          if (typeof window !== 'undefined') {
            console.log('🔐 Using PKCE flow with code exchange')
          }

          const { data, error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            if (typeof window !== 'undefined') {
              console.log('⚠️ Code exchange error:', error.message)
            }

            // Check if user already has a session (link may have been prefetched by email scanner)
            const { data: sessionData } = await supabase.auth.getSession()

            if (sessionData.session?.user) {
              // User is already verified! This happens when email scanners prefetch the link
              if (typeof window !== 'undefined') {
                console.log('✅ User already has active session (link was prefetched)')
              }
              user = sessionData.session.user
            } else {
              // Genuine error - no session exists
              console.error('❌ Code exchange failed and no active session:', error)
              setStatus('error')
              setMessage(error.message || 'Email verification failed. The link may have expired.')
              return
            }
          } else {
            if (!data.session?.user) {
              setStatus('error')
              setMessage('No user session found')
              return
            }
            user = data.session.user
          }
        }
        // Handle OTP/token_hash flow (legacy or magic link)
        else if (token_hash && type) {
          console.log('Using OTP flow with token_hash')
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          })

          if (error) {
            console.error('Email verification error:', error)
            setStatus('error')
            setMessage(error.message || 'Email verification failed. Please try again.')
            return
          }

          if (!data.user) {
            setStatus('error')
            setMessage('No user found')
            return
          }

          user = data.user
        }
        // No valid parameters found
        else {
          console.error('Invalid verification parameters:', { code, token_hash, type })
          setStatus('error')
          setMessage('Invalid verification link. Please try requesting a new verification email.')
          return
        }

        // Call our API to complete profile creation and set up trial
        if (typeof window !== 'undefined') {
          console.log('📝 Calling complete-registration API for user:', user.id)
        }

        const response = await fetch('/api/auth/complete-registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('❌ Profile creation error:', errorData)
          setStatus('error')
          setMessage('Failed to complete registration. Please contact support.')
          return
        }

        const registrationResult = await response.json()
        if (typeof window !== 'undefined') {
          console.log('✅ Profile creation response:', registrationResult)
        }

        // Force session refresh to update AuthContext with new profile data
        if (typeof window !== 'undefined') {
          console.log('🔄 Refreshing session...')
        }

        const { error: refreshError } = await supabase.auth.refreshSession()

        if (refreshError) {
          console.warn('⚠️ Session refresh warning:', refreshError)
        } else if (typeof window !== 'undefined') {
          console.log('✅ Session refreshed successfully')
        }

        // Get the updated session to verify profile was created
        const { data: { session: updatedSession } } = await supabase.auth.getSession()

        if (updatedSession?.user && typeof window !== 'undefined') {
          console.log('👤 Updated session user ID:', updatedSession.user.id)

          // Fetch profile to verify trial dates
          try {
            const profileResponse = await supabase
              .from('profiles')
              .select('trial_start_date, trial_end_date, plan')
              .eq('id', updatedSession.user.id)
              .single()

            if (profileResponse.data) {
              console.log('📊 Profile data:', {
                plan: profileResponse.data.plan,
                trial_start: profileResponse.data.trial_start_date,
                trial_end: profileResponse.data.trial_end_date,
                days_remaining: profileResponse.data.trial_end_date
                  ? Math.round((new Date(profileResponse.data.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : 'N/A'
              })
            }
          } catch (err) {
            console.error('Error fetching profile for verification:', err)
          }
        }

        // Longer delay to ensure AuthContext picks up the profile update
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Success!
        setStatus('success')
        setMessage('Email verified successfully! Your 7-day free trial has started. Redirecting to dashboard...')

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
