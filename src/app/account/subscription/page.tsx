'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CancelSubscriptionFlow } from '@/components/subscription/CancelSubscriptionFlow'
import { SwitchPlanDialog } from '@/components/subscription/SwitchPlanDialog'
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'

interface SubscriptionDetails {
  plan: string
  billing_interval: string | null
  trial_end_date: string | null
  subscription_start_date: string | null
  subscription: {
    id: string
    status: string
    current_period_start: number
    current_period_end: number
    cancel_at_period_end: boolean
    cancel_at: number | null
    canceled_at: number | null
    trial_end: number | null
    amount: number
    currency: string
    interval: string
  } | null
}

export default function SubscriptionPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [details, setDetails] = useState<SubscriptionDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false)
  const [isReactivating, setIsReactivating] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchSubscriptionDetails()
    }
  }, [user])

  const fetchSubscriptionDetails = async () => {
    try {
      // Get the session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/subscription/details', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch subscription details')
      }
      const data = await response.json()
      setDetails(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivate = async () => {
    setIsReactivating(true)
    try {
      // Get the session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/subscription/reactivate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription')
      }

      await fetchSubscriptionDetails()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsReactivating(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </Card>
      </div>
    )
  }

  if (!details || !details.subscription) {
    // Check if user is on trial
    const isOnTrial = user?.trialEndDate && new Date() < user.trialEndDate && user.plan === 'free'
    const daysRemaining = isOnTrial && user?.trialEndDate
      ? Math.ceil((user.trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0

    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>

        {isOnTrial ? (
          <div className="space-y-6">
            {/* Trial Status Banner */}
            <Card className="border-blue-200 bg-blue-50 p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h2 className="text-xl font-semibold text-blue-900 mb-1">7-Day Free Trial Active</h2>
                  <p className="text-blue-700">
                    {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining • Full access to all premium features
                  </p>
                </div>
              </div>
            </Card>

            {/* Upgrade Options */}
            <div>
              <h2 className="text-2xl font-bold mb-2">Upgrade to Premium</h2>
              <p className="text-muted-foreground mb-6">
                Choose your billing preference. Your subscription will begin when your trial ends.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Monthly Plan */}
                <Card className="p-6 hover:border-primary transition-colors">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-1">Monthly</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">£24.99</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </div>
                  <Button asChild className="w-full" size="lg">
                    <Link href="/checkout?plan=personal&billing=monthly">
                      Upgrade to Monthly
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3">
                    Billed monthly • Cancel anytime
                  </p>
                </Card>

                {/* Annual Plan */}
                <Card className="p-6 border-primary hover:border-primary transition-colors relative">
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-600">Save £59.88/year</Badge>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-1">Annual</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">£249.90</span>
                      <span className="text-muted-foreground">/year</span>
                    </div>
                    <p className="text-sm text-green-600 font-medium mt-1">2 months free</p>
                  </div>
                  <Button asChild className="w-full" size="lg">
                    <Link href="/checkout?plan=personal&billing=annual">
                      Upgrade to Annual
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3">
                    Billed annually • Cancel anytime
                  </p>
                </Card>
              </div>
            </div>

            {/* Features */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Premium features include:</h3>
              <ul className="grid md:grid-cols-2 gap-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-sm">Unlimited dashboard access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-sm">Advanced analytics and reporting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-sm">Priority customer support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-sm">Custom integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-sm">Team collaboration features</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-sm">Advanced planner features</span>
                </li>
              </ul>
            </Card>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-lg font-medium mb-4">No Active Subscription</p>
            <p className="text-muted-foreground mb-6">
              You don't have an active subscription yet.
            </p>
            <Button asChild>
              <Link href="/pricing">View Plans</Link>
            </Button>
          </Card>
        )}
      </div>
    )
  }

  const { subscription, billing_interval, trial_end_date } = details
  const isCancelled = subscription.cancel_at_period_end
  const isTrialing = subscription.trial_end && subscription.trial_end * 1000 > Date.now()

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const daysUntilRenewal = Math.ceil(
    (subscription.current_period_end * 1000 - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Profile
      </Link>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription, billing, and plan details
          </p>
        </div>

        {/* Status Banner */}
        {isCancelled && (
          <Card className="border-orange-200 bg-orange-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-orange-900">Subscription Cancelled</p>
                <p className="text-sm text-orange-700 mt-1">
                  Your subscription will end on {formatDate(subscription.current_period_end)}.
                  You'll continue to have access until then.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 border-orange-600 text-orange-600 hover:bg-orange-100"
                  onClick={handleReactivate}
                  disabled={isReactivating}
                >
                  {isReactivating ? 'Reactivating...' : 'Undo Cancellation'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {isTrialing && (
          <Card className="border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Free Trial Active</p>
                <p className="text-sm text-blue-700 mt-1">
                  Your {billing_interval} subscription will begin on{' '}
                  {subscription.trial_end && formatDate(subscription.trial_end)} when your free trial ends.
                  Cancel anytime.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Current Plan */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  Personal Plan
                </p>
                <p className="text-muted-foreground capitalize">
                  {billing_interval} billing
                </p>
              </div>
              <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'} className="text-sm">
                {subscription.status}
              </Badge>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>Price</span>
                </div>
                <span className="font-medium">
                  {formatCurrency(subscription.amount, subscription.currency)}/
                  {subscription.interval === 'year' ? 'year' : 'month'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Next billing date</span>
                </div>
                <span className="font-medium">
                  {formatDate(subscription.current_period_end)}
                  <span className="text-muted-foreground ml-1">
                    ({daysUntilRenewal} {daysUntilRenewal === 1 ? 'day' : 'days'})
                  </span>
                </span>
              </div>

              {subscription.cancel_at && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="h-4 w-4" />
                    <span>Cancels on</span>
                  </div>
                  <span className="font-medium text-orange-600">
                    {formatDate(subscription.cancel_at)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Actions */}
        {!isCancelled && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Manage Your Plan</h2>
            <div className="space-y-4">
              {/* Switch Plan */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Switch Billing Frequency</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Change between monthly and annual billing
                      {billing_interval === 'monthly' && ' (Save 2 months with annual!)'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSwitchDialogOpen(true)}
                >
                  Switch to {billing_interval === 'monthly' ? 'Annual' : 'Monthly'}
                </Button>
              </div>

              {/* Cancel Subscription */}
              <div className="flex items-start justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Cancel Subscription</p>
                    <p className="text-sm text-red-700 mt-1">
                      Cancel your subscription. You'll keep access until the end of your billing period.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-600 text-red-600 hover:bg-red-100"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  Cancel Plan
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <CancelSubscriptionFlow
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        periodEndDate={subscription.current_period_end.toString()}
        onSuccess={fetchSubscriptionDetails}
      />

      <SwitchPlanDialog
        open={switchDialogOpen}
        onOpenChange={setSwitchDialogOpen}
        currentInterval={billing_interval as 'monthly' | 'annual'}
        periodEndDate={subscription.current_period_end.toString()}
        onSuccess={fetchSubscriptionDetails}
      />
    </div>
  )
}
