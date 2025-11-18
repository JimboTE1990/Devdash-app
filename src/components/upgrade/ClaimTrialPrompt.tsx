'use client'

import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Gift, Sparkles, Calendar, CheckCircle, Loader2 } from 'lucide-react'

export function ClaimTrialPrompt() {
  const { claimFreeTrial } = useAuth()
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClaimTrial = async () => {
    setClaiming(true)
    setError(null)

    try {
      await claimFreeTrial()
      // User state will auto-update via AuthContext
      // Page will re-render and show unlocked content
    } catch (err) {
      console.error('Failed to claim trial:', err)
      setError(err instanceof Error ? err.message : 'Failed to claim trial')
      setClaiming(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-2">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-2">
            <Gift className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Claim Your Free Trial
            </span>
          </CardTitle>
          <CardDescription className="text-base">
            Get instant access to all Jimbula features with a 7-day free trial. No payment required.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* What You Get */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Full Feature Access</p>
                <p className="text-xs text-muted-foreground">
                  All boards, tools, and features unlocked immediately
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">7 Full Days</p>
                <p className="text-xs text-muted-foreground">
                  One week to explore and organize your work
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">No Payment Required</p>
                <p className="text-xs text-muted-foreground">
                  Start now, decide later - no credit card needed
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Gift className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">All Data Saved</p>
                <p className="text-xs text-muted-foreground">
                  Everything you create is preserved forever
                </p>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
            <h3 className="text-sm font-semibold mb-3 text-center">What's Included</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Activity Planner - Organize tasks and projects</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Financial Tracker - Monitor income and expenses</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Ideas Board - Capture and develop concepts</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Calendar & Planner - Schedule and plan ahead</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Unlimited boards, tasks, and entries</span>
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive text-center">{error}</p>
            </div>
          )}

          {/* Claim Button */}
          <Button
            onClick={handleClaimTrial}
            disabled={claiming}
            className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold py-6 text-lg"
            size="lg"
          >
            {claiming ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Activating Your Trial...
              </>
            ) : (
              <>
                <Gift className="mr-2 h-5 w-5" />
                Claim My 7-Day Free Trial
              </>
            )}
          </Button>

          {/* Fine Print */}
          <p className="text-center text-xs text-muted-foreground">
            No credit card required • Full access for 7 days • Cancel anytime
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
