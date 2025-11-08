import React from 'react'
import { Mail, MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Get in Touch</h1>
            <p className="text-lg text-muted-foreground">
              We'd love to hear from you. Whether you have a question, feedback, or just want to say hello.
            </p>
          </div>

          {/* Contact Card */}
          <div className="bg-card border border-border rounded-xl shadow-xl p-8 md:p-12">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-10 w-10 text-primary" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Email Us</h2>
                <p className="text-muted-foreground mb-6">
                  Send us an email and we'll get back to you as soon as possible.
                </p>
              </div>

              <a
                href="mailto:contact@jimbula.com"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <Send className="h-5 w-5" />
                <span className="text-lg">contact@jimbula.com</span>
              </a>

              <div className="pt-8 border-t border-border w-full">
                <p className="text-sm text-muted-foreground">
                  We typically respond within 24-48 hours during business days.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card/50 border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">Support</h3>
              <p className="text-sm text-muted-foreground">
                Need help with your account or have technical questions? Reach out to our support team.
              </p>
            </div>

            <div className="bg-card/50 border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Got ideas for new features or improvements? We're always listening to our users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
