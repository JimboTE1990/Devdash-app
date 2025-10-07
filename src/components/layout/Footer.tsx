import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#1a3a3a] border-t border-[#4a6a6a] mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#7dd87d] rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="text-xl font-bold text-white">DevDash</span>
            </div>
            <p className="text-sm text-gray-400">
              The ultimate project planner for indie developers and business owners.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/how-it-works"
                  className="text-sm text-gray-400 hover:text-[#7dd87d] transition-colors"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-gray-400 hover:text-[#7dd87d] transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-400 hover:text-[#7dd87d] transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:text-[#7dd87d] transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:text-[#7dd87d] transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:text-[#7dd87d] transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:text-[#7dd87d] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:text-[#7dd87d] transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#4a6a6a] text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} DevDash. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
