'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle2, TrendingUp } from 'lucide-react'

interface SwitchPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentInterval: 'monthly' | 'annual'
  periodEndDate: string
  onSuccess: () => void
}

export function SwitchPlanDialog({
  open,
  onOpenChange,
  currentInterval,
  periodEndDate,
  onSuccess,
}: SwitchPlanDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const targetInterval = currentInterval === 'monthly' ? 'annual' : 'monthly'

  const prices = {
    monthly: { amount: 2499, display: '£24.99/month' },
    annual: { amount: 24990, display: '£249.90/year' },
  }

  const currentPrice = prices[currentInterval]
  const targetPrice = prices[targetInterval]

  // Calculate savings for annual
  const monthlyCost = prices.monthly.amount * 12
  const annualSavings = targetInterval === 'annual' ? monthlyCost - prices.annual.amount : 0

  const handleSwitch = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Get the session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/subscription/switch-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ newInterval: targetInterval }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to switch plan')
      }

      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        onSuccess()
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to switch plan')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setError('')
      setSuccess(false)
      onOpenChange(false)
    }
  }

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <DialogTitle>Plan Switch Scheduled</DialogTitle>
            </div>
            <DialogDescription className="space-y-4 pt-4">
              <p>
                Your subscription will switch to {targetInterval} billing on{' '}
                {new Date(parseInt(periodEndDate) * 1000).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}.
              </p>
              <p className="text-sm text-muted-foreground">
                You'll continue on your current plan until then.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Switch to {targetInterval === 'annual' ? 'Annual' : 'Monthly'} Billing
          </DialogTitle>
          <DialogDescription>
            Change your billing frequency at the end of your current billing period
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Plan */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
            <div className="border rounded-lg p-4">
              <p className="font-semibold capitalize">{currentInterval} Billing</p>
              <p className="text-2xl font-bold">{currentPrice.display}</p>
            </div>
          </div>

          {/* Arrow/Divider */}
          <div className="flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* New Plan */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">New Plan</p>
            <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
              <p className="font-semibold capitalize">{targetInterval} Billing</p>
              <p className="text-2xl font-bold">{targetPrice.display}</p>
              {targetInterval === 'annual' && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  Save £{(annualSavings / 100).toFixed(2)}/year (2 months free!)
                </p>
              )}
              {targetInterval === 'monthly' && (
                <p className="text-sm text-muted-foreground mt-1">
                  More flexibility with month-to-month billing
                </p>
              )}
            </div>
          </div>

          {/* Change Details */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="font-medium text-sm">What happens next:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Your current subscription continues as normal</li>
              <li>
                On {new Date(parseInt(periodEndDate) * 1000).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}, you'll switch to {targetInterval} billing
              </li>
              <li>Your next charge will be {targetPrice.display}</li>
              <li>You can cancel this change anytime before then</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSwitch} disabled={isLoading}>
            {isLoading ? 'Switching...' : `Switch to ${targetInterval === 'annual' ? 'Annual' : 'Monthly'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
