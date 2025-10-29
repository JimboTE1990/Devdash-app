'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertCircle, Crown, Sparkles, ArrowRight, Lock } from 'lucide-react'

interface UpgradePromptProps {
  mode?: 'modal' | 'banner' | 'page'
  showDismiss?: boolean
  onDismiss?: () => void
}

export function UpgradePrompt({ mode = 'page', showDismiss = false, onDismiss }: UpgradePromptProps) {
  const router = useRouter()
  const { user } = useAuth()

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  // Calculate days remaining or days since expiry
  const getDaysInfo = () => {
    if (!user?.trialEndDate) return null

    const now = new Date()
    const diffTime = user.trialEndDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return { daysRemaining: diffDays, isExpired: diffDays <= 0 }
  }

  const daysInfo = getDaysInfo()

  // Banner mode (dismissible warning)
  if (mode === 'banner') {
    return (
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <div className="text-sm">
                {daysInfo?.isExpired ? (
                  <span className="font-medium text-foreground">
                    Your trial has expired. Upgrade to continue using all features.
                  </span>
                ) : (
                  <span className="font-medium text-foreground">
                    Your trial ends in <span className="text-amber-500">{daysInfo?.daysRemaining} days</span>.
                    Upgrade now to keep your data and access all features.
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleUpgrade} className="bg-gradient-to-r from-primary to-accent">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade Now
              </Button>
              {showDismiss && onDismiss && (
                <Button size="sm" variant="ghost" onClick={onDismiss}>
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Modal mode (for sudden warnings)
  if (mode === 'modal') {
    return (
      <Dialog open={true} onOpenChange={onDismiss}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20">
              <Crown className="h-8 w-8 text-amber-500" />
            </div>
            <DialogTitle className="text-center text-2xl">Trial Expired</DialogTitle>
            <DialogDescription className="text-center">
              Your 7-day free trial has ended. Upgrade to premium to continue using all Jimbula features.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Keep all your data</p>
                <p className="text-xs text-muted-foreground">Your tasks, finances, and ideas are safely stored</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Unlimited access</p>
                <p className="text-xs text-muted-foreground">All features unlocked, no restrictions</p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button onClick={handleUpgrade} className="w-full bg-gradient-to-r from-primary to-accent">
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to Premium - £14.99/month
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {showDismiss && onDismiss && (
              <Button variant="outline" onClick={onDismiss} className="w-full">
                Maybe Later
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Page mode (full-page block)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-2">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-2">
            <Crown className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Upgrade to Premium
            </span>
          </CardTitle>
          <CardDescription className="text-base">
            {daysInfo?.isExpired ? (
              <>Your 7-day free trial has ended. Upgrade now to regain access to all your work.</>
            ) : (
              <>Your trial is ending soon. Upgrade to keep using Jimbula without interruption.</>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">All Data Preserved</p>
                <p className="text-xs text-muted-foreground">Your tasks, finances, ideas, and calendar events are safe</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Unlimited Access</p>
                <p className="text-xs text-muted-foreground">Full access to all boards, trackers, and features</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Premium Support</p>
                <p className="text-xs text-muted-foreground">Priority email support and feature requests</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Cancel Anytime</p>
                <p className="text-xs text-muted-foreground">No long-term commitment, cancel whenever you want</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground mb-1">Premium Plan</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-primary">£14.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>
            <ul className="space-y-2 text-sm mb-6">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Project Management Boards</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Financial Tracker</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Ideas & Brainstorming Boards</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Calendar & Planner</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Unlimited boards and tasks</span>
              </li>
            </ul>

            <Button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold py-6 text-lg"
              size="lg"
            >
              <Crown className="mr-2 h-5 w-5" />
              Upgrade to Premium
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Reassurance */}
          <p className="text-center text-xs text-muted-foreground">
            Secure payment powered by Stripe • Cancel anytime • All your data is preserved
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
