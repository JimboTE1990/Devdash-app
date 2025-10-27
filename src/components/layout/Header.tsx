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
import { User, LogOut, Settings } from 'lucide-react'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/jimbula-logo-final.svg"
              alt="Jimbula"
              width={70}
              height={42}
              className="h-10"
            />
            <span className="text-3xl font-bold text-foreground tracking-tight">Jimbula</span>
          </Link>

          <div className="flex items-center gap-6">
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
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
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
                  <Button>Start Free Trial</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
