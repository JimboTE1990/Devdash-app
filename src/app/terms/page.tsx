'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, FileText, Scale, CreditCard, UserCheck, AlertCircle, Mail } from 'lucide-react'

export default function TermsPage() {
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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-blue-950/10 dark:via-indigo-950/5 dark:to-background -z-10" />

      {/* Floating orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Terms of Service
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Simple, fair terms for using Jimbula.<br />
              No legal jargon, just what you need to know.
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: January 2025
            </p>
          </motion.div>

          {/* The Short Version */}
          <motion.div {...fadeInUp} className="mb-12">
            <Card className="glass-strong shadow-xl border-2 border-primary/20 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-1">
                <div className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl text-center">
                      The Short Version
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-foreground/80 text-center mb-6">
                      We believe in keeping things simple and transparent. Here's what you're agreeing to:
                    </p>
                    <motion.div {...staggerContainer} className="space-y-4">
                      {[
                        'You must be 18 or older to use Jimbula',
                        'You are responsible for keeping your account secure',
                        'Be respectful and don\'t use our service for anything illegal',
                        'We can update these terms, but we\'ll notify you of major changes',
                        'You can cancel your subscription at any time'
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                          <span className="text-foreground/90">{item}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Detailed Sections */}
          <motion.div {...staggerContainer} className="space-y-8">
            {/* Acceptance of Terms */}
            <motion.div {...fadeInUp}>
              <Card className="glass-strong hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Acceptance of Terms</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/80">
                    By creating an account and using Jimbula, you agree to these Terms of Service and our Privacy Policy.
                    If you don't agree with any part of these terms, please don't use our service.
                  </p>
                  <p className="text-foreground/80">
                    These terms apply to all users of Jimbula, including both free and paid subscribers.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Account Registration */}
            <motion.div {...fadeInUp}>
              <Card className="glass-strong hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Account Registration & Security</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">Creating an Account</h3>
                    <p className="text-foreground/80">
                      You must provide accurate and complete information when creating your account.
                      You must be at least 18 years old to use Jimbula.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">Account Security</h3>
                    <p className="text-foreground/80">
                      You are responsible for maintaining the security of your account and password.
                      Jimbula is not liable for any loss or damage from your failure to maintain account security.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">One Account Per Person</h3>
                    <p className="text-foreground/80">
                      Each account should be used by one person only. You may not share your account credentials
                      or allow others to access your account.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Acceptable Use */}
            <motion.div {...fadeInUp}>
              <Card className="glass-strong hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Scale className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Acceptable Use</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/80">
                    You agree to use Jimbula in a responsible and lawful manner. You may not:
                  </p>
                  <ul className="space-y-2 ml-4">
                    {[
                      'Use the service for any illegal or unauthorized purpose',
                      'Violate any laws in your jurisdiction',
                      'Transmit any malicious code, viruses, or harmful content',
                      'Attempt to gain unauthorized access to our systems',
                      'Interfere with or disrupt the service or servers',
                      'Use automated systems to scrape or data mine the service',
                      'Impersonate another person or entity',
                      'Harass, abuse, or harm other users'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1.5">•</span>
                        <span className="text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-foreground/80 mt-4">
                    We reserve the right to suspend or terminate accounts that violate these terms.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Subscriptions & Payments */}
            <motion.div {...fadeInUp}>
              <Card className="glass-strong hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Subscriptions & Payments</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">Free Trial</h3>
                    <p className="text-foreground/80">
                      New users receive a 7-day free trial with full access to all features.
                      You will not be charged during the trial period. You can cancel at any time.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">Paid Subscriptions</h3>
                    <p className="text-foreground/80">
                      After your trial ends, you'll be automatically enrolled in a paid subscription unless you cancel.
                      Subscriptions are billed monthly or annually based on your chosen plan.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">Cancellation & Refunds</h3>
                    <p className="text-foreground/80">
                      You can cancel your subscription at any time through your account settings or by managing your
                      subscription through Stripe. Cancellations take effect at the end of your current billing period.
                      We do not offer refunds for partial months or unused portions of your subscription.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">Price Changes</h3>
                    <p className="text-foreground/80">
                      We may change our pricing from time to time. If we do, we'll notify you at least 30 days
                      in advance. Existing subscribers will be grandfathered at their current price for at least
                      one billing cycle.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Your Data & Content */}
            <motion.div {...fadeInUp}>
              <Card className="glass-strong hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl">Your Data & Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">Ownership</h3>
                    <p className="text-foreground/80">
                      You retain all rights to the content you create in Jimbula (tasks, boards, notes, etc.).
                      We claim no ownership over your data.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">License to Operate</h3>
                    <p className="text-foreground/80">
                      By using Jimbula, you grant us a limited license to store, process, and display your content
                      solely for the purpose of providing the service to you.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">Data Deletion</h3>
                    <p className="text-foreground/80">
                      If you delete your account, all your data will be permanently deleted within 30 days.
                      This action cannot be undone, so please export any data you want to keep before deleting your account.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Service Availability */}
            <motion.div {...fadeInUp}>
              <Card className="glass-strong hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Service Availability</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/80">
                    We work hard to keep Jimbula available 24/7, but we can't guarantee 100% uptime.
                    We may need to perform maintenance, which could temporarily affect availability.
                  </p>
                  <p className="text-foreground/80">
                    We are not liable for any damages resulting from service interruptions, data loss,
                    or technical issues. We recommend backing up important data regularly.
                  </p>
                  <p className="text-foreground/80">
                    We reserve the right to modify, suspend, or discontinue any part of the service at any time
                    with reasonable notice.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Limitation of Liability */}
            <motion.div {...fadeInUp}>
              <Card className="glass-strong hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl">Limitation of Liability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/80">
                    Jimbula is provided "as is" without warranties of any kind, either express or implied.
                    We do our best to provide a great service, but we can't guarantee it will meet all your needs.
                  </p>
                  <p className="text-foreground/80">
                    To the maximum extent permitted by law, Jimbula and its owners shall not be liable for any
                    indirect, incidental, special, or consequential damages arising from your use of the service.
                  </p>
                  <p className="text-foreground/80">
                    Our total liability to you for any claim shall not exceed the amount you paid us in the
                    12 months preceding the claim.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Changes to Terms */}
            <motion.div {...fadeInUp}>
              <Card className="glass-strong hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl">Changes to These Terms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/80">
                    We may update these Terms of Service from time to time. When we make significant changes,
                    we'll notify you by email or through a notice in the app at least 30 days before the changes take effect.
                  </p>
                  <p className="text-foreground/80">
                    By continuing to use Jimbula after the changes take effect, you agree to the updated terms.
                    If you don't agree with the changes, you can cancel your account.
                  </p>
                  <p className="text-foreground/80">
                    The "Last updated" date at the top of this page shows when these terms were last revised.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Governing Law */}
            <motion.div {...fadeInUp}>
              <Card className="glass-strong hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl">Governing Law</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/80">
                    These Terms of Service are governed by and construed in accordance with the laws of
                    England and Wales, without regard to its conflict of law provisions.
                  </p>
                  <p className="text-foreground/80">
                    Any disputes arising from these terms or your use of Jimbula will be subject to the
                    exclusive jurisdiction of the courts of England and Wales.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Us */}
            <motion.div {...fadeInUp}>
              <Card className="glass-strong shadow-xl border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Mail className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Questions About These Terms?</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/80">
                    If you have any questions about these Terms of Service, please don't hesitate to contact us.
                    We're here to help clarify anything you're unsure about.
                  </p>
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <p className="text-foreground/90">
                      Email us at: <a href="mailto:contact@jimbula.co.uk" className="text-primary hover:text-primary/80 font-semibold underline">contact@jimbula.co.uk</a>
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We aim to respond to all inquiries within 48 hours.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
