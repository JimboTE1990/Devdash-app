'use client'

import React from 'react'
import Link from 'next/link'
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
    <header className="bg-[#1a3a3a] border-b border-[#4a6a6a] sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#7dd87d] rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <span className="text-xl font-bold text-white">DevDash</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-[#7dd87d] ${
                isActive('/') ? 'text-[#7dd87d]' : 'text-gray-300'
              }`}
            >
              Home
            </Link>
            <Link
              href="/how-it-works"
              className={`text-sm font-medium transition-colors hover:text-[#7dd87d] ${
                isActive('/how-it-works') ? 'text-[#7dd87d]' : 'text-gray-300'
              }`}
            >
              How it works
            </Link>
            <Link
              href="/pricing"
              className={`text-sm font-medium transition-colors hover:text-[#7dd87d] ${
                isActive('/pricing') ? 'text-[#7dd87d]' : 'text-gray-300'
              }`}
            >
              Pricing
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-[#7dd87d] ${
                    isActive('/dashboard') ? 'text-[#7dd87d]' : 'text-gray-300'
                  }`}
                >
                  Dashboard
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <div className="px-4 py-2 text-sm text-gray-200">
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
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
