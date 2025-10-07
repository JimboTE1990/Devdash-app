import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LayoutDashboard, MousePointerClick, ListChecks, TrendingUp } from 'lucide-react'

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How DevDash Works
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            A simple yet powerful project management solution built specifically for indie developers
          </p>
          <Link href="/auth">
            <Button size="lg">Start Your Free Trial</Button>
          </Link>
        </div>

        {/* Step-by-step Guide */}
        <div className="space-y-12 mb-16">
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-[#7dd87d] rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xl">1</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">Sign Up & Start Trial</h3>
              <p className="text-gray-300">
                Create your account in seconds and start your 7-day free trial. No credit card required. You'll immediately get access to all premium features.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-[#7dd87d] rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xl">2</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">Choose Your Board</h3>
              <p className="text-gray-300 mb-4">
                Start with our pre-built boards designed for indie developers, or create your own custom workflow:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#7dd87d]">•</span>
                  <span><strong className="text-white">Marketing Board:</strong> Manage outbound campaigns, organic growth, partnerships, and paid ads</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#7dd87d]">•</span>
                  <span><strong className="text-white">Product Build Board:</strong> Track development, testing, validation, and bug fixes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#7dd87d]">•</span>
                  <span><strong className="text-white">Custom Boards:</strong> Create unlimited boards tailored to your unique workflow</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-[#7dd87d] rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xl">3</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">Organize with Swimlanes</h3>
              <p className="text-gray-300">
                Each board uses horizontal swimlanes to organize your workflow stages. Drag and drop tasks between columns (Backlog, In Progress, Done) within each swimlane. Collapse swimlanes to focus on what matters.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-[#7dd87d] rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xl">4</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">Manage Task Details</h3>
              <p className="text-gray-300 mb-4">
                Click any task to open detailed view where you can:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#7dd87d]">•</span>
                  <span>Add descriptions and due dates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#7dd87d]">•</span>
                  <span>Create subtasks to break down work</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#7dd87d]">•</span>
                  <span>Add comments and collaborate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#7dd87d]">•</span>
                  <span>Block or reject tasks with reasons</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#7dd87d]">•</span>
                  <span>Set priority levels (high, medium, low)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-[#7dd87d] rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xl">5</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">Track Progress & Ship</h3>
              <p className="text-gray-300">
                Watch your tasks move from Backlog to Done. Stay organized, hit your deadlines, and ship your product faster with DevDash keeping everything in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <LayoutDashboard className="h-10 w-10 text-[#7dd87d] mb-2" />
                <CardTitle>Kanban Boards with Swimlanes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Organize tasks by workflow stage with horizontal swimlanes and vertical columns for status tracking.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MousePointerClick className="h-10 w-10 text-[#7dd87d] mb-2" />
                <CardTitle>Drag & Drop Interface</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Intuitive drag-and-drop to move tasks between columns and update their status instantly.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ListChecks className="h-10 w-10 text-[#7dd87d] mb-2" />
                <CardTitle>Rich Task Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Add descriptions, due dates, subtasks, comments, priorities, and block/reject flags to tasks.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-[#7dd87d] mb-2" />
                <CardTitle>Built for Indie Devs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Pre-configured boards for marketing and product development that match how indie developers actually work.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-[#2d4a4a] rounded-lg p-12 border border-[#4a6a6a]">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to streamline your workflow?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join indie developers who are shipping faster with DevDash
          </p>
          <Link href="/auth">
            <Button size="lg" className="text-lg px-12">
              Start Your 7-Day Free Trial
            </Button>
          </Link>
          <p className="text-sm text-gray-400 mt-4">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
