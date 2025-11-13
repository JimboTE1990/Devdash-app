'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Shield, Lock, Eye, Database, Mail } from 'lucide-react'

export default function PrivacyPage() {
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
          {/* Hero Section */}
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Privacy Policy
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              We believe in simplicity and transparency.<br />
              Here's how we handle your data.
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
                      Your privacy is incredibly important to us. We are a "no-frills" tool,
                      and that philosophy extends to your data.
                    </p>
                    <motion.div {...staggerContainer} className="space-y-4">
                      {[
                        'We only collect the data we need to make Jimbula work',
                        'We will never sell your data to third parties',
                        'We use privacy-focused analytics that does not use cookies and does not track you across the web',
                        'You are in complete control of your data'
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
            {/* Information We Collect */}
            <motion.div {...fadeInUp}>
              <Card className="glass-strong hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Database className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Information We Collect</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">Account Information</h3>
                    <p className="text-foreground/80">
                      When you create an account, we collect your email address and the password you choose.
                      We also collect any profile information you choose to provide, such as your name.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">Usage Data</h3>
                    <p className="text-foreground/80">
                      We collect information about how you use Jimbula, including the boards you create,
                      tasks you manage, and features you interact with. This helps us improve the product.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">Device Information</h3>
                    <p className="text-foreground/80">
                      We collect basic device information like your browser type, operating system,
                      and IP address to ensure Jimbula works properly on your device.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* How We Use Your Information */}
            <motion.div {...fadeInUp}>
              <Card className="glass-strong hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Eye className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">How We Use Your Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-foreground/80">
                    We use the information we collect to:
                  </p>
                  <ul className="space-y-2 ml-4">
                    {[
                      'Provide, maintain, and improve Jimbula',
                      'Create and manage your account',
                      'Process your subscription and payments',
                      'Send you important updates about your account or service changes',
                      'Respond to your support requests',
                      'Understand how people use Jimbula to make it better',
                      'Prevent fraud and abuse'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1.5">•</span>
                        <span className="text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Data Storage & Security */}
            <motion.div {...fadeInUp}>
              <Card className="glass-strong hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Lock className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Data Storage & Security</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/80">
                    Your data is stored securely using industry-standard encryption. We use secure,
                    reputable cloud hosting providers that comply with international data protection standards.
                  </p>
                  <p className="text-foreground/80">
                    All data transmission is encrypted using SSL/TLS. Your password is hashed using
                    strong cryptographic algorithms and we never store it in plain text.
                  </p>
                  <p className="text-foreground/80">
                    We regularly review our security practices and update them to ensure your data
                    remains protected against evolving threats.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Your Rights & Control */}
            <motion.div {...fadeInUp}>
              <Card className="glass-strong hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Your Rights & Control</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/80">
                    You have complete control over your data. You have the right to:
                  </p>
                  <ul className="space-y-3">
                    {[
                      {
                        title: 'Access Your Data',
                        description: 'Request a copy of all data we have about you'
                      },
                      {
                        title: 'Update Your Information',
                        description: 'Edit your profile and account information at any time'
                      },
                      {
                        title: 'Delete Your Account',
                        description: 'Permanently delete your account and all associated data'
                      },
                      {
                        title: 'Export Your Data',
                        description: 'Download all your boards and tasks in a portable format'
                      },
                      {
                        title: 'Opt Out',
                        description: 'Unsubscribe from marketing emails (we send very few anyway)'
                      }
                    ].map((item, i) => (
                      <li key={i} className="border-l-2 border-primary/30 pl-4">
                        <div className="font-semibold text-foreground">{item.title}</div>
                        <div className="text-sm text-foreground/70">{item.description}</div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Third-Party Services */}
            <motion.div {...fadeInUp}>
              <Card className="glass-strong hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl">Third-Party Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/80">
                    We use a minimal number of trusted third-party services to operate Jimbula:
                  </p>
                  <div className="space-y-3">
                    <div className="border-l-2 border-primary/30 pl-4">
                      <div className="font-semibold text-foreground">Hosting & Infrastructure</div>
                      <div className="text-sm text-foreground/70">
                        We use secure cloud hosting to store your data safely
                      </div>
                    </div>
                    <div className="border-l-2 border-primary/30 pl-4">
                      <div className="font-semibold text-foreground">Payment Processing</div>
                      <div className="text-sm text-foreground/70">
                        Stripe handles all payment processing. We never see or store your credit card information
                      </div>
                    </div>
                    <div className="border-l-2 border-primary/30 pl-4">
                      <div className="font-semibold text-foreground">Analytics</div>
                      <div className="text-sm text-foreground/70">
                        We use privacy-focused analytics that don't use cookies or track you across websites
                      </div>
                    </div>
                  </div>
                  <p className="text-foreground/80">
                    We carefully vet all third-party services to ensure they meet our privacy standards.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Updates to This Policy */}
            <motion.div {...fadeInUp}>
              <Card className="glass-strong hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl">Updates to This Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/80">
                    We may update this privacy policy from time to time to reflect changes in our
                    practices or for legal reasons. When we make significant changes, we'll notify
                    you by email or through a notice in the app.
                  </p>
                  <p className="text-foreground/80">
                    We'll always show the "Last updated" date at the top of this policy so you know
                    when it was last changed.
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
                    <CardTitle className="text-2xl">Contact Us</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/80">
                    If you have any questions about this privacy policy or how we handle your data,
                    please don't hesitate to reach out. We're here to help!
                  </p>
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <p className="text-foreground/90">
                      Email us at: <a href="mailto:contact@jimbula.co.uk" className="text-primary hover:text-primary/80 font-semibold underline">contact@jimbula.co.uk</a>
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We aim to respond to all privacy inquiries within 48 hours.
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
