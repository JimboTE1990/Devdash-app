import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-card/80 backdrop-blur-md border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/jimbula-logo-final.svg"
                alt="Jimbula"
                width={60}
                height={36}
                className="h-9"
              />
              <span className="text-2xl font-bold text-foreground tracking-tight">Jimbula</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/planner-v2"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Project Planner
                </Link>
              </li>
              <li>
                <Link
                  href="/calendar"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Calendar
                </Link>
              </li>
              <li>
                <Link
                  href="/ideas"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Ideas
                </Link>
              </li>
              <li>
                <Link
                  href="/finance"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Finance
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">More Info</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#features"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:contact@jimbula.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Jimbula. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
