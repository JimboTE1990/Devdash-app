'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CheckCircle, Loader2, Crown } from 'lucide-react'

export default function PricingPage() {
  const { user } = useAuth()
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [waitlistMessage, setWaitlistMessage] = useState('')

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setWaitlistStatus('loading')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitlistEmail, plan: 'enterprise' })
      })

      const data = await response.json()

      if (response.ok) {
        setWaitlistStatus('success')
        setWaitlistMessage('Thanks! We\'ll notify you when the Enterprise plan launches.')
        setWaitlistEmail('')
      } else {
        setWaitlistStatus('error')
        setWaitlistMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setWaitlistStatus('error')
      setWaitlistMessage('Failed to join waiting list. Please try again.')
    }

    setTimeout(() => {
      setWaitlistStatus('idle')
      setWaitlistMessage('')
    }, 5000)
  }
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  }

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.1
      }
    },
    viewport: { once: true }
  }

  // Prevent duplicate subscriptions - if user is already premium, show different UI
  if (user?.plan === 'premium' && !user.isLifetimeFree) {
    return (
      <div className="relative overflow-hidden min-h-screen">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-white dark:from-orange-950/10 dark:via-amber-950/5 dark:to-background -z-10" />

        <div className="container mx-auto px-4 py-16">
          <motion.div {...fadeInUp} className="max-w-2xl mx-auto text-center">
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">You're Already Subscribed!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              You already have an active Premium subscription. Manage your subscription in your profile settings.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/profile">
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent">
                  Go to Profile
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-white dark:from-orange-950/10 dark:via-amber-950/5 dark:to-background -z-10" />

      {/* Floating orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-8 sm:mb-10 lg:mb-12 px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Simple, transparent pricing
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Choose the plan that fits your needs
            </p>
          </motion.div>

          <motion.div
            {...staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto mb-8 sm:mb-10 lg:mb-12"
          >
            {/* Personal Plan */}
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="glass-strong shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-primary/10 hover:border-primary/30 h-full relative overflow-hidden">
                {/* Early Bird Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                  40% OFF
                </div>
                <CardHeader className="space-y-3">
                  <CardTitle className="text-xl sm:text-2xl">Personal Plan</CardTitle>
                  <CardDescription className="text-sm sm:text-base">For indie developers and business owners ready to elevate their planning and productivity</CardDescription>
                  <div className="mt-3 sm:mt-4 space-y-2">
                    <p className="text-xs sm:text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded inline-block">Start with 7 days free</p>
                    <div className="space-y-2 pt-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base sm:text-lg text-muted-foreground line-through">£39.99</span>
                          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">Early Bird</span>
                        </div>
                        <div>
                          <span className="text-2xl sm:text-3xl font-bold text-foreground">£24.99</span>
                          <span className="text-sm text-muted-foreground ml-1">/month</span>
                        </div>
                      </div>
                      <div className="pt-2 pb-1 border-t border-border/50">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xl sm:text-2xl font-bold text-foreground">£249.90</span>
                          <span className="text-sm text-muted-foreground">/year</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">Save £49.98</span>
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">2 months free!</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium pt-1">Limited time introductory offer</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <ul className="space-y-3">
                    {[
                      'Access to all features',
                      'Pre-built Marketing board',
                      'Pre-built Product Build board',
                      'Unlimited tasks and boards',
                      'Cancel anytime'
                    ].map((feature, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-2"
                      >
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <div className="space-y-4">
                    <div className="pt-2 border-t border-border">
                      <Link href="/auth" className="w-full block mb-4">
                        <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold h-auto py-3 sm:py-4 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                          <span className="text-base sm:text-lg">Start Free 7-Day Trial</span>
                        </Button>
                      </Link>
                      <p className="text-xs text-center text-muted-foreground mb-3">No credit card required</p>

                      <div className="text-xs sm:text-sm font-medium text-foreground text-center mb-3">Or subscribe now with +7 days free</div>
                      <div className="grid grid-cols-1 gap-2 sm:gap-3">
                        <Link href={user ? "/checkout?plan=personal&billing=monthly" : "/auth?redirect=/checkout?plan=personal&billing=monthly"} className="w-full">
                          <Button variant="outline" className="w-full border-2 border-primary/30 text-foreground hover:border-primary hover:bg-primary/5 h-auto py-2.5 sm:py-3 flex justify-between items-center transition-all hover:scale-105">
                            <span className="text-sm font-semibold">Monthly</span>
                            <span className="text-sm font-bold">£24.99/mo</span>
                          </Button>
                        </Link>
                        <Link href={user ? "/checkout?plan=personal&billing=annual" : "/auth?redirect=/checkout?plan=personal&billing=annual"} className="w-full">
                          <Button variant="outline" className="w-full border-2 border-green-500 text-foreground hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 h-auto py-2.5 sm:py-3 flex justify-between items-center transition-all hover:scale-105 relative">
                            <div className="absolute -top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">Best Value</div>
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-semibold">Annual</span>
                              <span className="text-xs text-green-600 dark:text-green-400">2 months free</span>
                            </div>
                            <span className="text-sm font-bold">£249.90/yr</span>
                          </Button>
                        </Link>
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-3">
                        All paid plans include 7 extra days free
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="glass-strong shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-primary/10 hover:border-primary/30 h-full relative overflow-hidden">
                {/* Coming Soon Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  COMING SOON
                </div>

                <CardHeader>
                  <CardTitle className="text-2xl">Enterprise Plan</CardTitle>
                  <CardDescription>For small business teams who need to collaborate and manage projects together</CardDescription>
                  <div className="mt-4">
                    <span className="text-2xl font-bold text-foreground">Launching Soon</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {[
                      'Everything in Personal Plan',
                      'Multiple user accounts',
                      'Team collaboration features',
                      'Shared boards and tasks',
                      'Priority support'
                    ].map((feature, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-2"
                      >
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <div className="space-y-4">
                    <div className="pt-2 border-t border-border">
                      <div className="text-sm font-medium text-foreground text-center mb-4">Join the waiting list</div>
                      <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={waitlistEmail}
                          onChange={(e) => setWaitlistEmail(e.target.value)}
                          required
                          disabled={waitlistStatus === 'loading' || waitlistStatus === 'success'}
                          className="w-full"
                        />
                        <Button
                          type="submit"
                          disabled={waitlistStatus === 'loading' || waitlistStatus === 'success'}
                          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold h-auto py-3 shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {waitlistStatus === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {waitlistStatus === 'success' ? '✓ You\'re on the list!' : 'Notify Me at Launch'}
                        </Button>
                      </form>
                      {waitlistMessage && (
                        <p className={`text-xs text-center mt-3 ${
                          waitlistStatus === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {waitlistMessage}
                        </p>
                      )}
                      {!waitlistMessage && (
                        <p className="text-xs text-muted-foreground text-center mt-3">
                          Be the first to know when we launch team features
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div {...fadeInUp} className="mt-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-8">
              Frequently Asked Questions
            </h2>
            <motion.div {...staggerContainer} className="space-y-6">
              {[
                {
                  question: 'How does the free trial work?',
                  answer: 'Start your 7-day free trial with no credit card required. You\'ll get full access to all features. After 7 days, you can choose to subscribe to continue using Jimbula.'
                },
                {
                  question: 'Do paid plans include a trial?',
                  answer: 'Yes! When you subscribe to a monthly or annual plan, you get an additional 7 days free on top of your subscription. This means you can try Jimbula risk-free before your first payment.'
                },
                {
                  question: 'How much do I save with the annual plan?',
                  answer: 'The annual plan costs £249.90/year, which is 10 months at the early bird price of £24.99. That means you get 2 months completely free - saving £49.98 per year!'
                },
                {
                  question: 'Can I cancel my subscription?',
                  answer: 'Yes! You can cancel your subscription at any time from your profile settings. You\'ll continue to have access until the end of your billing period.'
                },
                {
                  question: 'Do you offer refunds?',
                  answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied with Jimbula, contact us within 30 days of your purchase for a full refund.'
                },
                {
                  question: 'Is there a limit on boards or tasks?',
                  answer: 'No! With the Premium plan, you can create unlimited boards and tasks. There are no artificial limits.'
                }
              ].map((faq, i) => (
                <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }}>
                  <Card className="glass-strong hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg text-foreground">
                        {faq.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
