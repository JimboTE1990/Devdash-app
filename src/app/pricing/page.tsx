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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Free Trial */}
          <Card className="border-2 border-[#4a6a6a]">
            <CardHeader>
              <CardTitle className="text-2xl">Free Trial</CardTitle>
              <CardDescription>Perfect for testing DevDash</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">£0</span>
                <span className="text-gray-400 ml-2">for 7 days</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <span className="text-gray-200">Unlimited custom boards</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-0.5" />
                  <span className="text-gray-200">No credit card required</span>
                </li>
              </ul>
              <Link href="/auth">
                <Button variant="outline" className="w-full mt-4">
                  Start Free Trial
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-[#7dd87d] relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-[#7dd87d] text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Premium</CardTitle>
              <CardDescription>For serious indie developers</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">£9.99</span>
                <span className="text-gray-400 ml-2">per month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-0.5" />
                  <span className="text-gray-200">Everything in Free Trial</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-0.5" />
                  <span className="text-gray-200">Unlimited tasks and boards</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-0.5" />
                  <span className="text-gray-200">Advanced task management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-0.5" />
                  <span className="text-gray-200">Task comments and subtasks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-0.5" />
                  <span className="text-gray-200">Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-0.5" />
                  <span className="text-gray-200">Cancel anytime</span>
                </li>
              </ul>
              <Link href="/auth">
                <Button className="w-full mt-4">
                  Start 7-Day Free Trial
                </Button>
              </Link>
              <p className="text-xs text-gray-400 text-center">
                After trial, you'll be charged £9.99/month
              </p>
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
