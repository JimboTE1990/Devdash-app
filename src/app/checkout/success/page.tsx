'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Crown, Sparkles, ArrowRight } from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { upgradeToPremium, user } = useAuth()
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')

    if (sessionId && user) {
      // Upgrade user to premium in localStorage
      upgradeToPremium().then(() => {
        setProcessing(false)
      })
    } else {
      setProcessing(false)
    }
  }, [searchParams, upgradeToPremium, user])

  if (processing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Processing your subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-strong shadow-2xl border-2 border-primary/20">
            <CardHeader className="text-center pb-4">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-6"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center relative">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                  <motion.div
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-primary"
                  />
                </div>
              </motion.div>

              <CardTitle className="text-3xl font-bold text-foreground mb-2">
                Welcome to Premium!
              </CardTitle>
              <p className="text-muted-foreground">
                Your subscription is now active
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Premium Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Crown className="h-4 w-4 text-primary" />
                  <span>You now have access to all premium features</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Unlimited boards and tasks</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Priority support included</span>
                </div>
              </div>

              {/* Next Steps */}
              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold text-foreground mb-3">What's Next?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start building your boards and organizing your tasks. Your premium features are ready to use!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => router.push('/profile')}
                  className="w-full"
                >
                  View Profile
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Confirmation */}
              <div className="text-center pt-4">
                <p className="text-xs text-muted-foreground">
                  A confirmation email has been sent to {user?.email}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
