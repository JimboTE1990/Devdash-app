'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FeatureCard } from '@/components/landing/FeatureCard'
import { AnimatedNumber } from '@/components/landing/AnimatedNumber'
import { supabase } from '@/lib/supabase/client'
import {
  Lightbulb,
  KanbanSquare,
  Wallet,
  Calendar as CalendarIcon,
  CheckCircle,
  TrendingUp,
  Users,
  Eye,
  Zap,
  Target,
  Sparkles,
  ArrowRight
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const handleTrialClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/auth')
    }
  }
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.3 }
  }

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.05
      }
    },
    viewport: { once: true }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-white dark:from-orange-950/10 dark:via-amber-950/5 dark:to-background -z-10" />

      {/* Floating orbs for visual interest */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Hero Section */}
        <motion.section
          className="text-center mb-16 sm:mb-24 lg:mb-32 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-4">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Your Business
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                Command Center
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground/80 mb-6 sm:mb-8 lg:mb-10 max-w-3xl mx-auto leading-relaxed px-4"
          >
            Jimbula brings your ideas, projects, finances, and schedule together.
            Built for small and medium businesses that need <span className="text-primary font-bold">clarity</span>, <span className="text-accent font-bold">productivity</span>, and <span className="text-primary font-bold">results</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.2 }}
            className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center px-4"
          >
            <Button
              size="lg"
              onClick={handleTrialClick}
              disabled={isLoading}
              className="w-full sm:w-auto max-w-md sm:max-w-none text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-accent hover:scale-105 group"
            >
              {isLoading ? 'Loading...' : isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
              <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Link href="/pricing" className="w-full sm:w-auto max-w-md sm:max-w-none">
              <Button size="lg" variant="outline" className="w-full text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 border-2 hover:bg-primary/5 hover:border-primary hover:text-primary hover:scale-105 transition-all duration-300">
                View Pricing
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.15 }}
            className="text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6 px-4"
          >
            7-day free trial • No credit card required • Cancel anytime
          </motion.p>
        </motion.section>

        {/* Key Benefits Section */}
        <motion.section
          className="mb-16 sm:mb-24 lg:mb-32"
          {...staggerContainer}
        >
          <motion.div {...fadeInUp} className="text-center mb-8 sm:mb-12 lg:mb-16 px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Why Businesses Choose Jimbula
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Stop juggling multiple tools. Get complete visibility and control over your business operations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard
              icon={Eye}
              title="Complete Visibility"
              description="See everything at a glance. Track projects, finances, and schedules from one unified dashboard. No more switching between apps or losing track of important details."
              index={0}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Improved Productivity"
              description="Organize work efficiently with visual Kanban boards, weekly planners, and customizable swimlanes. Your team knows exactly what to work on and when."
              index={1}
            />
            <FeatureCard
              icon={Target}
              title="Better Planning"
              description="Make informed decisions with clear financial tracking, idea management, and integrated calendar views. Plan ahead with confidence and adapt quickly."
              index={2}
            />
          </div>
        </motion.section>

        {/* Core Features */}
        <section id="features" className="mb-16 sm:mb-24 lg:mb-32">
          <motion.div {...fadeInUp} className="text-center mb-8 sm:mb-12 lg:mb-16 px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Four Powerful Tools, One Platform
              </span>
            </h2>
          </motion.div>

          {/* Ideas Board */}
          <motion.div {...fadeInUp} className="mb-12 sm:mb-16 lg:mb-20">
            <Card className="overflow-hidden glass-strong shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                      <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Ideas Board</h3>
                  </div>

                  <p className="text-base sm:text-lg text-foreground/80 mb-6 sm:mb-8 leading-relaxed">
                    Never lose a great idea again. Capture, organize, and collaborate on ideas with a visual, flexible board system inspired by creative workflows.
                  </p>

                  <motion.div className="space-y-5 mb-8" {...staggerContainer}>
                    {[
                      { title: 'Multiple Boards', desc: 'Create unlimited boards for different projects, teams, or brainstorming sessions' },
                      { title: 'Visual Sticky Notes', desc: 'Drag-and-drop colorful sticky notes anywhere on the canvas, just like a physical whiteboard' },
                      { title: 'Organized Sections', desc: 'Add vertical columns to group related ideas and keep your boards structured' },
                      { title: 'Team Collaboration', desc: 'Share boards with collaborators, leave comments, and favorite important boards' }
                    ].map((feature, i) => (
                      <motion.div
                        key={i}
                        {...fadeInUp}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-4 items-start group hover:translate-x-2 transition-transform duration-200"
                      >
                        <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="font-bold text-foreground text-base mb-1">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="glass-strong p-6 rounded-2xl border-2 border-primary/10">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h4 className="text-lg font-bold text-foreground">How It Works</h4>
                    </div>
                    <ol className="space-y-3">
                      {[
                        'Create a new board from the gallery view with a custom name',
                        'Add sticky notes with different colors to capture ideas',
                        'Drag notes around the canvas to organize visually',
                        'Create sections (columns) to categorize your ideas',
                        'Share with team members and collaborate with comments',
                        'Clone boards to reuse templates or archive boards when done'
                      ].map((step, i) => (
                        <li key={i} className="flex gap-3 items-start text-foreground/90">
                          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent text-white text-sm flex items-center justify-center font-bold shadow-lg">
                            {i + 1}
                          </span>
                          <span className="text-sm leading-relaxed pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white dark:from-orange-950/20 dark:via-amber-950/10 dark:to-card p-12 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Lightbulb className="h-40 w-40 text-primary mx-auto mb-6 drop-shadow-2xl" />
                    </motion.div>
                    <p className="text-lg font-semibold text-foreground">Capture & organize ideas visually</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Project Planner */}
          <motion.div {...fadeInUp} className="mb-20">
            <Card className="overflow-hidden glass-strong shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white dark:from-orange-950/20 dark:via-amber-950/10 dark:to-card p-12 flex items-center justify-center order-2 lg:order-1">
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <KanbanSquare className="h-40 w-40 text-primary mx-auto mb-6 drop-shadow-2xl" />
                    </motion.div>
                    <p className="text-lg font-semibold text-foreground">Plan and track work visually</p>
                  </div>
                </div>

                <div className="p-10 order-1 lg:order-2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                      <KanbanSquare className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold">Project Planner</h3>
                  </div>

                  <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                    Powerful Kanban-style planning with weekly views and custom swimlanes. Organize tasks by priority, team, or any workflow that fits your business.
                  </p>

                  <motion.div className="space-y-5 mb-8" {...staggerContainer}>
                    {[
                      { title: 'Flexible Planning View', desc: 'Organize tasks across any timeframe with clear visibility and drag-and-drop simplicity' },
                      { title: 'Custom Swimlanes', desc: 'Create priority levels, team lanes, or project phases - organize your way' },
                      { title: 'Subtasks & Dependencies', desc: 'Break down complex tasks with nested subtasks and track blockers' }
                    ].map((feature, i) => (
                      <motion.div
                        key={i}
                        {...fadeInUp}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-4 items-start group hover:translate-x-2 transition-transform duration-200"
                      >
                        <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="font-bold text-foreground text-base mb-1">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="glass-strong p-6 rounded-2xl border-2 border-primary/10">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h4 className="text-lg font-bold text-foreground">How It Works</h4>
                    </div>
                    <ol className="space-y-3">
                      {[
                        'View your month divided into weeks with customizable swimlanes',
                        'Create tasks and drag them to any week/swimlane combination',
                        'Add subtasks that appear as mini-cards beneath parent tasks',
                        'Rename swimlanes to match your workflow (Priority 1-4 by default)',
                        'Mark tasks as blocked and track dependencies',
                        'Use version history to restore previous planning states'
                      ].map((step, i) => (
                        <li key={i} className="flex gap-3 items-start text-foreground/90">
                          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent text-white text-sm flex items-center justify-center font-bold shadow-lg">
                            {i + 1}
                          </span>
                          <span className="text-sm leading-relaxed pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Finance Tracker */}
          <motion.div {...fadeInUp} className="mb-20">
            <Card className="overflow-hidden glass-strong shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="p-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                      <Wallet className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold">Finance Tracker</h3>
                  </div>

                  <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                    Keep your business finances organized with simple income and expense tracking. See your financial health at a glance with visual charts and detailed tables.
                  </p>

                  <motion.div className="space-y-5 mb-8" {...staggerContainer}>
                    {[
                      { title: 'Separate Income & Expenses', desc: 'Two dedicated tables with color-coded displays for clear financial visibility' },
                      { title: 'Visual Charts', desc: 'Bar charts and pie charts show spending patterns and income sources instantly' },
                      { title: 'Recurring Transactions', desc: 'Mark subscriptions and regular income as recurring for accurate planning' },
                      { title: 'Multi-Currency Support', desc: 'Track finances in USD, EUR, GBP, and 6+ other major currencies' }
                    ].map((feature, i) => (
                      <motion.div
                        key={i}
                        {...fadeInUp}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-4 items-start group hover:translate-x-2 transition-transform duration-200"
                      >
                        <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="font-bold text-foreground text-base mb-1">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="glass-strong p-6 rounded-2xl border-2 border-primary/10">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h4 className="text-lg font-bold text-foreground">How It Works</h4>
                    </div>
                    <ol className="space-y-3">
                      {[
                        'Add income and expense transactions with categories and dates',
                        'View separate tables for income (green) and expenses (red)',
                        'Edit existing transactions by clicking the pencil icon',
                        'Filter by month, category, or view yearly/monthly summaries',
                        'Check visual charts to understand spending patterns',
                        'Mark recurring items to track subscriptions and regular income'
                      ].map((step, i) => (
                        <li key={i} className="flex gap-3 items-start text-foreground/90">
                          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent text-white text-sm flex items-center justify-center font-bold shadow-lg">
                            {i + 1}
                          </span>
                          <span className="text-sm leading-relaxed pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white dark:from-orange-950/20 dark:via-amber-950/10 dark:to-card p-12 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Wallet className="h-40 w-40 text-primary mx-auto mb-6 drop-shadow-2xl" />
                    </motion.div>
                    <p className="text-lg font-semibold text-foreground">Track every dollar with clarity</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Calendar */}
          <motion.div {...fadeInUp} className="mb-20">
            <Card className="overflow-hidden glass-strong shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white dark:from-orange-950/20 dark:via-amber-950/10 dark:to-card p-12 flex items-center justify-center order-2 lg:order-1">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotateY: [0, 10, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <CalendarIcon className="h-40 w-40 text-primary mx-auto mb-6 drop-shadow-2xl" />
                    </motion.div>
                    <p className="text-lg font-semibold text-foreground">Schedule and time management</p>
                  </div>
                </div>

                <div className="p-10 order-1 lg:order-2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                      <CalendarIcon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold">Calendar</h3>
                  </div>

                  <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                    Flexible calendar with multiple view modes and color-coded events. Perfect for scheduling meetings, deadlines, and important business milestones.
                  </p>

                  <motion.div className="space-y-5 mb-8" {...staggerContainer}>
                    {[
                      { title: 'Multiple View Modes', desc: 'Switch between day, week, week overview, and month views instantly' },
                      { title: 'Color-Coded Events', desc: 'Choose from 8 colors to categorize meetings, deadlines, and events visually' },
                      { title: 'Time Blocking', desc: 'Set specific start and end times for events to plan your day precisely' },
                      { title: 'Event Details', desc: 'Add descriptions and notes to keep all important context in one place' }
                    ].map((feature, i) => (
                      <motion.div
                        key={i}
                        {...fadeInUp}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-4 items-start group hover:translate-x-2 transition-transform duration-200"
                      >
                        <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="font-bold text-foreground text-base mb-1">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="glass-strong p-6 rounded-2xl border-2 border-primary/10">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h4 className="text-lg font-bold text-foreground">How It Works</h4>
                    </div>
                    <ol className="space-y-3">
                      {[
                        'Choose your preferred view: day, week, week overview, or month',
                        'Click any date or time slot to create a new event',
                        'Add title, description, start/end times, and pick a color',
                        'Events appear color-coded in your calendar view',
                        'Edit or delete events by clicking on them',
                        'Navigate between dates using the arrow controls'
                      ].map((step, i) => (
                        <li key={i} className="flex gap-3 items-start text-foreground/90">
                          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent text-white text-sm flex items-center justify-center font-bold shadow-lg">
                            {i + 1}
                          </span>
                          <span className="text-sm leading-relaxed pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* Integration Benefits */}
        <motion.section {...fadeInUp} className="mb-32">
          <div className="glass-strong rounded-3xl p-12 shadow-2xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  It All Works Together
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Jimbula isn&apos;t just four separate tools—it&apos;s an integrated system designed to keep your entire business in sync.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Zap, title: 'Single Dashboard', desc: 'Everything accessible from one unified interface. No context switching.' },
                { icon: Users, title: 'Team Collaboration', desc: 'Share boards, assign tasks, and keep everyone aligned on priorities.' },
                { icon: Eye, title: 'Full Visibility', desc: 'See projects, finances, and schedules side by side. Make better decisions.' },
                { icon: Target, title: 'Stay Focused', desc: 'Less tool management, more productive work. Focus on growing your business.' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  {...fadeInUp}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl glass text-center group hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-accent p-0.5">
                    <div className="w-full h-full bg-card rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h4 className="font-bold mb-2 text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section {...fadeInUp} className="mb-32">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Built for Modern Businesses
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Whether you&apos;re a growing startup, a consulting agency, or a product team, Jimbula adapts to how you work.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
              {[
                { value: 4, suffix: '', label: 'Core Tools' },
                { value: 1, suffix: '', label: 'Unified Platform' },
                { value: 0, suffix: '∞', label: 'Possibilities' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  {...fadeInUp}
                  transition={{ delay: i * 0.2 }}
                  className="relative"
                >
                  <div className="text-6xl md:text-7xl font-bold text-primary mb-3">
                    {stat.value === 0 ? stat.suffix : <AnimatedNumber value={stat.value} suffix={stat.suffix} />}
                  </div>
                  <p className="text-lg text-muted-foreground font-medium">{stat.label}</p>
                  {i < 2 && <div className="hidden md:block absolute top-1/2 -right-6 w-px h-16 bg-border -translate-y-1/2" />}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.section
          {...fadeInUp}
          className="text-center glass-strong rounded-3xl p-16 shadow-2xl relative overflow-hidden"
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent opacity-50" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Ready to Transform Your Workflow?
              </span>
            </h2>

            <p className="text-xl text-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join businesses that have simplified their operations with Jimbula.
              Start your free trial today—no credit card required.
            </p>

            <motion.div
              className="flex flex-wrap gap-4 justify-center mb-8"
              {...staggerContainer}
            >
              <Button
                size="lg"
                onClick={handleTrialClick}
                disabled={isLoading}
                className="text-lg px-12 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-accent hover:scale-105 group"
              >
                {isLoading ? 'Loading...' : isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-12 py-6 border-2 hover:bg-primary/5 hover:border-primary hover:text-primary hover:scale-105 transition-all duration-300">
                  See Pricing
                </Button>
              </Link>
            </motion.div>

            <p className="text-sm text-muted-foreground">
              7-day free trial • Full access to all features • Cancel anytime
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
