'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export default function PricingPage() {
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

  return (
    <div className="relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-white dark:from-orange-950/10 dark:via-amber-950/5 dark:to-background -z-10" />

      {/* Floating orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Simple, transparent pricing
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose the plan that fits your needs
            </p>
          </motion.div>

          <motion.div
            {...staggerContainer}
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12"
          >
            {/* Personal Plan */}
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="glass-strong shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-primary/10 hover:border-primary/30 h-full">
                <CardHeader>
                  <CardTitle className="text-2xl">Personal Plan</CardTitle>
                  <CardDescription>For indie developers and business owners ready to elevate their planning and productivity</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">£14.99</span>
                    <span className="text-muted-foreground ml-2">per month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
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
                      <div className="text-sm font-medium text-foreground text-center mb-4">Choose your plan</div>
                      <div className="grid grid-cols-2 gap-3">
                        <Link href="/auth" className="flex-1">
                          <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold h-auto py-3 flex flex-col items-center gap-1 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                            <span className="text-sm">Free Trial</span>
                            <span className="text-xs opacity-90">7 days free</span>
                          </Button>
                        </Link>
                        <Link href="/checkout?plan=personal" className="flex-1">
                          <Button variant="outline" className="w-full border-2 border-primary text-primary hover:bg-primary/10 h-auto py-3 flex flex-col items-center gap-1 transition-all hover:scale-105">
                            <span className="text-sm">Premium</span>
                            <span className="text-xs opacity-90">£14.99/month</span>
                          </Button>
                        </Link>
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-3">
                        Start with a free trial or go premium right away
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="glass-strong shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-primary/10 hover:border-primary/30 h-full">
                <CardHeader>
                  <CardTitle className="text-2xl">Enterprise Plan</CardTitle>
                  <CardDescription>For small business teams who need to collaborate and manage projects together</CardDescription>
                  <div className="mt-4">
                    <span className="text-2xl font-bold text-foreground">Contact Sales</span>
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
                      <div className="text-sm font-medium text-foreground text-center mb-4">Get in touch</div>
                      <Link href="mailto:sales@devdash.com" className="block">
                        <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold h-auto py-3 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                          Contact Sales Team
                        </Button>
                      </Link>
                      <p className="text-xs text-muted-foreground text-center mt-3">
                        Custom pricing based on team size
                      </p>
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
                  question: 'What happens after my trial ends?',
                  answer: 'After your 7-day trial, you\'ll need to subscribe to the Premium plan (£14.99/month) to continue using Jimbula. You can cancel anytime during the trial without being charged.'
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
