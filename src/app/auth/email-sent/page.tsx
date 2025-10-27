'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, RefreshCw } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function EmailSentPage() {
  const { resendVerificationEmail } = useAuth()
  const router = useRouter()
  const [resending, setResending] = useState(false)

  const handleResend = async () => {
    setResending(true)
    try {
      await resendVerificationEmail()
    } catch (error) {
      console.error('Error resending email:', error)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
            >
              <Mail className="w-10 h-10 text-primary" />
            </motion.div>

            <h1 className="text-3xl font-bold text-foreground mb-4">Check Your Email</h1>

            <p className="text-muted-foreground mb-6">
              We've sent you a verification email. Please click the link in the email to verify your account and complete your registration.
            </p>

            <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-6">
              <p className="text-sm text-foreground font-medium mb-2">
                Didn't receive the email?
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 text-left">
                <li>• Check your spam or junk folder</li>
                <li>• Make sure you entered the correct email address</li>
                <li>• Wait a few minutes for the email to arrive</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleResend}
                disabled={resending}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Resend Verification Email
                  </>
                )}
              </button>

              <button
                onClick={() => router.push('/auth')}
                className="w-full px-6 py-3 border border-border text-foreground rounded-lg hover:bg-secondary/50 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
