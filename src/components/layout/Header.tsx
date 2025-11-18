'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { User, LogOut, Settings, Menu, X } from 'lucide-react'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isTrialActive, requiresUpgrade } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const isActive = (path: string) => pathname === path

  // Calculate days remaining in trial
  const getDaysRemaining = () => {
    if (!user?.trialEndDate) return 0
    const diffTime = user.trialEndDate.getTime() - new Date().getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const daysRemaining = getDaysRemaining()
  const showTrialBanner = user && isTrialActive && daysRemaining <= 3

  return (
    <>
      {/* Trial Warning Banner */}
      {showTrialBanner && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4 text-center text-sm font-medium">
          ⚠️ Trial ending in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} -
          <button
            onClick={() => router.push('/pricing')}
            className="ml-2 underline hover:no-underline font-semibold"
          >
            Upgrade Now
          </button>
        </div>
      )}

      {/* Expired Trial Banner */}
      {requiresUpgrade && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 text-center text-sm font-medium">
          🔒 Trial expired -
          <button
            onClick={() => router.push('/pricing')}
            className="ml-2 underline hover:no-underline font-semibold"
          >
            Upgrade to continue using Jimbula
          </button>
        </div>
      )}

      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <Image
              src="/jimbula-logo-final.svg"
              alt="Jimbula"
              width={70}
              height={42}
              className="h-8 sm:h-10"
            />
            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">Jimbula</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            <Link
              href="/#features"
              className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
            >
              How it works
            </Link>
            <Link
              href="/pricing"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/pricing') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Pricing
            </Link>

            {user ? (
              <>
                <Link
                  href="/planner-v2"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/planner-v2') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Project Planner
                </Link>
                <Link
                  href="/calendar"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/calendar') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Calendar
                </Link>
                <Link
                  href="/ideas"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/ideas') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Ideas
                </Link>
                <Link
                  href="/finance"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/finance') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Finance
                </Link>

                <ThemeToggle />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <div className="px-4 py-2 text-sm">
                      <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-foreground/70">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link href="/auth">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/auth">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-card border-t border-border">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium transition-colors hover:text-primary py-2 ${
                  isActive('/') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Home
              </Link>
              <Link
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium transition-colors hover:text-primary text-muted-foreground py-2"
              >
                How it works
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium transition-colors hover:text-primary py-2 ${
                  isActive('/pricing') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Pricing
              </Link>

              {user ? (
                <>
                  <div className="border-t border-border pt-4 mt-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Dashboard</p>
                  </div>
                  <Link
                    href="/planner-v2"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-base font-medium transition-colors hover:text-primary py-2 ${
                      isActive('/planner-v2') ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    Project Planner
                  </Link>
                  <Link
                    href="/calendar"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-base font-medium transition-colors hover:text-primary py-2 ${
                      isActive('/calendar') ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    Calendar
                  </Link>
                  <Link
                    href="/ideas"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-base font-medium transition-colors hover:text-primary py-2 ${
                      isActive('/ideas') ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    Ideas
                  </Link>
                  <Link
                    href="/finance"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-base font-medium transition-colors hover:text-primary py-2 ${
                      isActive('/finance') ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    Finance
                  </Link>

                  <div className="border-t border-border pt-4 mt-2">
                    <div className="px-3 py-2 bg-muted/50 rounded-lg mb-3">
                      <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-medium transition-colors hover:text-primary text-muted-foreground py-2 flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="text-base font-medium transition-colors hover:text-primary text-muted-foreground py-2 flex items-center gap-2 text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-border pt-4 mt-2 flex flex-col gap-3">
                    <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">Login</Button>
                    </Link>
                    <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
    </>
  )
}
