import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-300">
            One plan with everything you need to manage your projects
          </p>
        </div>

        <div className="flex justify-center mb-12">
          {/* Premium Plan */}
          <Card className="border-2 border-[#4a6a6a] max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-2xl">Premium</CardTitle>
              <CardDescription>For serious indie developers</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">£9.99</span>
                <span className="text-gray-400 ml-2">per month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-0.5" />
                  <span className="text-gray-200">Access to all features</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-0.5" />
                  <span className="text-gray-200">Pre-built Marketing board</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-0.5" />
                  <span className="text-gray-200">Pre-built Product Build board</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-0.5" />
                  <span className="text-gray-200">Unlimited tasks and boards</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-0.5" />
                  <span className="text-gray-200">Cancel anytime</span>
                </li>
              </ul>

              <div className="space-y-4">
                <div className="text-sm font-medium text-white text-center">New Customer?</div>
                <Link href="/auth">
                  <Button className="w-full bg-[#7dd87d] hover:bg-[#6cc86c] text-[#1a3a3a] font-semibold">
                    Start 7-Day Free Trial
                  </Button>
                </Link>
                <p className="text-xs text-gray-400 text-center">
                  No credit card required • After trial: £9.99/month
                </p>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#4a6a6a]"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#3a5a5a] px-2 text-gray-400">or</span>
                  </div>
                </div>

                <Link href="/auth">
                  <Button variant="outline" className="w-full border-[#7dd87d] text-[#7dd87d] hover:bg-[#7dd87d]/10">
                    Sign Up for Premium Plan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  What happens after my trial ends?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  After your 7-day trial, you'll need to subscribe to the Premium plan (£9.99/month) to continue using DevDash. You can cancel anytime during the trial without being charged.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Can I cancel my subscription?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Yes! You can cancel your subscription at any time from your profile settings. You'll continue to have access until the end of your billing period.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Do you offer refunds?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  We offer a 30-day money-back guarantee. If you're not satisfied with DevDash, contact us within 30 days of your purchase for a full refund.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Is there a limit on boards or tasks?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  No! With the Premium plan, you can create unlimited boards and tasks. There are no artificial limits.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
