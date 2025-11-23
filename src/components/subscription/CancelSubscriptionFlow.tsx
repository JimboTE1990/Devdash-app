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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CancelSubscriptionFlowProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  periodEndDate: string
  onSuccess: () => void
}

const CANCELLATION_REASONS = [
  'Too expensive',
  'Not using it enough',
  'Missing features I need',
  'Found a better alternative',
  'Technical issues',
  'Customer service issues',
  'Just testing / trial period ending',
  'Other',
]

export function CancelSubscriptionFlow({
  open,
  onOpenChange,
  periodEndDate,
  onSuccess,
}: CancelSubscriptionFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState<'confirm' | 'feedback' | 'final' | 'success'>('confirm')
  const [reason, setReason] = useState('')
  const [additionalFeedback, setAdditionalFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConfirmCancel = () => {
    setStep('feedback')
  }

  const handleSubmitFeedback = async () => {
    if (!reason) {
      setError('Please select a reason')
      return
    }

    // Submit feedback
    try {
      // Get the session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/subscription/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          reason,
          additional_feedback: additionalFeedback || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      setStep('final')
    } catch (err) {
      console.error('Error submitting feedback:', err)
      // Continue to final step even if feedback fails
      setStep('final')
    }
  }

  const handleFinalCancel = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Get the session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      setStep('success')
      setTimeout(() => {
        onOpenChange(false)
        onSuccess()
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep('confirm')
    setReason('')
    setAdditionalFeedback('')
    setError('')
    onOpenChange(false)
  }

  const renderStep = () => {
    switch (step) {
      case 'confirm':
        return (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <DialogTitle>Cancel Subscription?</DialogTitle>
              </div>
              <DialogDescription className="space-y-4 pt-4">
                <p>
                  If you cancel, you'll lose access to these premium features:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Unlimited dashboard access</li>
                  <li>Advanced analytics and reporting</li>
                  <li>Priority customer support</li>
                  <li>Custom integrations</li>
                  <li>Team collaboration features</li>
                </ul>
                <p className="font-medium">
                  Your subscription will remain active until {new Date(parseInt(periodEndDate) * 1000).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}.
                </p>
                <p className="text-sm text-muted-foreground">
                  You can reactivate your subscription anytime before this date.
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleClose}>
                Keep Subscription
              </Button>
              <Button variant="destructive" onClick={handleConfirmCancel}>
                Continue to Cancel
              </Button>
            </DialogFooter>
          </>
        )

      case 'feedback':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Help us improve</DialogTitle>
              <DialogDescription>
                We'd love to know why you're leaving. Your feedback helps us make Jimbula better.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  What's the main reason for cancelling? *
                </label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {CANCELLATION_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Anything else you'd like to share? (optional)
                </label>
                <Textarea
                  placeholder="Tell us more..."
                  value={additionalFeedback}
                  onChange={(e) => setAdditionalFeedback(e.target.value)}
                  rows={4}
                />
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setStep('confirm')}>
                Back
              </Button>
              <Button onClick={handleSubmitFeedback}>
                Continue
              </Button>
            </DialogFooter>
          </>
        )

      case 'final':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Final Confirmation</DialogTitle>
              <DialogDescription className="space-y-4 pt-4">
                <p>
                  Are you sure you want to cancel your subscription?
                </p>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="font-medium">What happens next:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Your subscription will be cancelled</li>
                    <li>You'll keep access until {new Date(parseInt(periodEndDate) * 1000).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}</li>
                    <li>You can undo this cancellation anytime before that date</li>
                    <li>No further charges will be made</li>
                  </ul>
                </div>
              </DialogDescription>
            </DialogHeader>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setStep('feedback')} disabled={isLoading}>
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleFinalCancel}
                disabled={isLoading}
              >
                {isLoading ? 'Cancelling...' : 'Cancel Subscription'}
              </Button>
            </DialogFooter>
          </>
        )

      case 'success':
        return (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <DialogTitle>Subscription Cancelled</DialogTitle>
              </div>
              <DialogDescription className="space-y-4 pt-4">
                <p>
                  Your subscription has been successfully cancelled.
                </p>
                <p>
                  You'll continue to have access to premium features until {new Date(parseInt(periodEndDate) * 1000).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}.
                </p>
                <p className="text-sm text-muted-foreground">
                  Changed your mind? You can reactivate your subscription anytime before then.
                </p>
              </DialogDescription>
            </DialogHeader>
          </>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {renderStep()}
      </DialogContent>
    </Dialog>
  )
}
