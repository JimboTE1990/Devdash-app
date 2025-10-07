import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, LayoutDashboard, Zap, Users } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center mb-20">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          The ultimate project planner for
          <span className="text-[#7dd87d]"> indie developers</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Streamline your workflow from build, launch, and marketing. DevDash helps you manage your projects with powerful Kanban boards designed specifically for solo developers and business owners.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth">
            <Button size="lg" className="text-lg px-8">
              Start 7-Day Free Trial
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Learn More
            </Button>
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          No credit card required. Cancel anytime.
        </p>
      </section>

      {/* Features Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Everything you need to stay organized
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <LayoutDashboard className="h-12 w-12 text-[#7dd87d] mb-4" />
              <CardTitle>Pre-built Boards</CardTitle>
              <CardDescription>
                Get started instantly with our Marketing and Product Build boards, designed for indie developers.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-12 w-12 text-[#7dd87d] mb-4" />
              <CardTitle>Drag & Drop</CardTitle>
              <CardDescription>
                Intuitive drag-and-drop interface with swimlanes to organize your tasks by workflow stages.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-[#7dd87d] mb-4" />
              <CardTitle>Custom Workflows</CardTitle>
              <CardDescription>
                Create unlimited custom boards with your own columns and swimlanes to match your process.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Marketing Board Preview */}
      <section className="mb-20">
        <div className="bg-[#2d4a4a] rounded-lg p-8 border border-[#4a6a6a]">
          <h2 className="text-3xl font-bold text-white mb-4">Marketing Board</h2>
          <p className="text-gray-300 mb-6">
            Organize all your marketing efforts in one place with dedicated swimlanes for:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Outbound</h3>
                <p className="text-sm text-gray-400">
                  Cold email campaigns, direct outreach
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Organic</h3>
                <p className="text-sm text-gray-400">
                  Build-in-public, Reddit, content marketing
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Affiliate/Partnership</h3>
                <p className="text-sm text-gray-400">
                  Creator partnerships, affiliate programs
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Paid Ads</h3>
                <p className="text-sm text-gray-400">
                  Google Ads, social media advertising
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Board Preview */}
      <section className="mb-20">
        <div className="bg-[#2d4a4a] rounded-lg p-8 border border-[#4a6a6a]">
          <h2 className="text-3xl font-bold text-white mb-4">Product Build Board</h2>
          <p className="text-gray-300 mb-6">
            Manage your entire development lifecycle with dedicated swimlanes for:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Build</h3>
                <p className="text-sm text-gray-400">
                  Feature development, implementation
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Test</h3>
                <p className="text-sm text-gray-400">
                  Quality assurance, testing
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Validation/Feedback</h3>
                <p className="text-sm text-gray-400">
                  User feedback, validation sessions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-[#7dd87d] shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Bug Fixes/New Features</h3>
                <p className="text-sm text-gray-400">
                  Bug tracking, feature requests
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-[#2d4a4a] rounded-lg p-12 border border-[#4a6a6a]">
        <h2 className="text-4xl font-bold text-white mb-4">
          Ready to streamline your workflow?
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Start your 7-day free trial today. No credit card required.
        </p>
        <Link href="/auth">
          <Button size="lg" className="text-lg px-12">
            Get Started Now
          </Button>
        </Link>
      </section>
    </div>
  )
}
