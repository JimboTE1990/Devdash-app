'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Crown, CreditCard, Lock, CheckCircle2, Sparkles, ArrowLeft, Loader2 } from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

function CheckoutPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, hasUsedTrial, upgradeToPremium, loading } = useAuth()

  const [processing, setProcessing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'personal' | 'enterprise'>('personal')
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'annual'>('monthly')

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Set plan and billing from URL
  useEffect(() => {
    const planParam = searchParams.get('plan')
    const billingParam = searchParams.get('billing')

    if (planParam === 'enterprise' || planParam === 'personal') {
      setSelectedPlan(planParam)
    }

    if (billingParam === 'annual' || billingParam === 'monthly') {
      setSelectedBilling(billingParam)
    }
  }, [searchParams])

  const canUseTrial = !hasUsedTrial

  const planDetails = {
    personal: {
      name: 'Personal Plan',
      monthlyPrice: 24.99,
      originalMonthlyPrice: 39.99,
      annualPrice: 249.90, // 10 months price (2 months free)
      originalAnnualPrice: 299.88, // 12 months at £24.99
      comingSoon: false,
      features: [
        'Access to all features',
        'Pre-built Marketing board',
        'Pre-built Product Build board',
        'Unlimited tasks and boards',
        'Cancel anytime'
      ]
    },
    enterprise: {
      name: 'Enterprise Plan',
      monthlyPrice: 0,
      annualPrice: 0,
      comingSoon: true,
      features: [
        'Everything in Personal Plan',
        'Multiple user accounts',
        'Team collaboration features',
        'Shared boards and tasks',
        'Priority support'
      ]
    }
  }

  const currentPlan = planDetails[selectedPlan]
  const currentPrice = selectedBilling === 'annual'
    ? currentPlan.annualPrice
    : currentPlan.monthlyPrice
  const displayPrice = selectedBilling === 'annual'
    ? `£${currentPlan.annualPrice}/year`
    : `£${currentPlan.monthlyPrice}/month`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: selectedPlan,
          billingInterval: selectedBilling,
          userId: user?.uid,
          userEmail: user?.email,
          hasUsedTrial,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error)
      alert(`Failed to start checkout: ${error.message}`)
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 max-w-6xl">
        {/* Back button */}
        <motion.div {...fadeInUp}>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 sm:mb-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div {...fadeInUp} className="text-center mb-6 sm:mb-10 lg:mb-12 px-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-3 sm:mb-4">
            <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-primary">Premium Upgrade</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Unlock Premium Features
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Get unlimited access to all features and take your productivity to the next level
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Payment Form */}
          <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="lg:col-span-2">
            <Card className="glass-strong shadow-xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl sm:text-2xl text-foreground">Payment Details</CardTitle>
                <CardDescription className="text-sm sm:text-base">Enter your payment information below</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Plan Selection */}
                  <div className="space-y-2">
                    <Label className="text-foreground">Select Plan</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setSelectedPlan('personal')}
                        className={`p-3 sm:p-4 rounded-lg border-2 transition-all relative ${
                          selectedPlan === 'personal'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          40% OFF
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-foreground">Personal</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground line-through">£39.99</span>
                          </div>
                          <div className="text-2xl font-bold text-primary">£24.99</div>
                          <div className="text-xs text-muted-foreground">per month</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPlan('enterprise')}
                        disabled
                        className="p-4 rounded-lg border-2 border-border bg-muted/50 opacity-60 cursor-not-allowed relative"
                      >
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-primary to-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          COMING SOON
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-foreground">Enterprise</div>
                          <div className="text-2xl font-bold text-muted-foreground mt-1">Launching Soon</div>
                          <div className="text-xs text-muted-foreground">Team features</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Plan Summary */}
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <Crown className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{currentPlan.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {canUseTrial && selectedPlan === 'personal'
                            ? '7-day free trial, then £' + currentPlan.price + '/month'
                            : '£' + currentPlan.price + '/month'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Billing Email: {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="flex items-center gap-2 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <Lock className="h-4 w-4 text-primary flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Secure payment processing powered by Stripe. You'll be redirected to enter your payment details.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold py-5 sm:py-6 text-base sm:text-lg"
                  >
                    {processing ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Redirecting to Stripe...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Crown className="h-5 w-5" />
                        {selectedPlan === 'enterprise'
                          ? 'Join Enterprise Waitlist'
                          : canUseTrial
                            ? 'Start 7-Day Free Trial'
                            : 'Subscribe to Personal Plan'}
                      </span>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    {canUseTrial && selectedPlan === 'personal'
                      ? 'Start your 7-day free trial. No charge today.'
                      : `You'll be charged £${currentPlan.price} today.`}
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Summary */}
          <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="lg:col-span-1">
            <Card className="glass-strong shadow-xl sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan Details */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{currentPlan.name}</h3>
                      <p className="text-sm text-muted-foreground">Monthly subscription</p>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">What's included:</p>
                    {currentPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Monthly price</span>
                    <span className="font-semibold text-foreground">£{currentPlan.price.toFixed(2)}</span>
                  </div>
                  {canUseTrial && selectedPlan === 'personal' && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">7-day free trial</span>
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        -£{currentPlan.price.toFixed(2)}
                      </Badge>
                    </div>
                  )}
                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">Due today</span>
                      <span className="text-2xl font-bold text-foreground">
                        {canUseTrial && selectedPlan === 'personal' ? '£0.00' : `£${currentPlan.price.toFixed(2)}`}
                      </span>
                    </div>
                    {canUseTrial && selectedPlan === 'personal' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        You'll be charged £{currentPlan.price.toFixed(2)} on {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Trial Notice */}
                {!canUseTrial && (
                  <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      You've already used your free trial. You'll be charged immediately.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  )
}
