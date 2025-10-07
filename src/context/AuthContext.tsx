'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/lib/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  updateProfile: (firstName: string, lastName: string) => Promise<void>
  isTrialActive: boolean
  isPremium: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem('devdash_user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        // Convert date strings back to Date objects
        if (userData.trialStartDate) userData.trialStartDate = new Date(userData.trialStartDate)
        if (userData.trialEndDate) userData.trialEndDate = new Date(userData.trialEndDate)
        if (userData.subscriptionStartDate) userData.subscriptionStartDate = new Date(userData.subscriptionStartDate)
        if (userData.createdAt) userData.createdAt = new Date(userData.createdAt)
        setUser(userData)
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('devdash_user')
      }
    }
    setLoading(false)
  }, [])

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('devdash_users') || '[]')
    if (users.find((u: any) => u.email === email)) {
      throw new Error('User already exists')
    }

    const now = new Date()
    const trialEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

    const userData: User = {
      uid: Math.random().toString(36).substring(7),
      email,
      firstName,
      lastName,
      plan: 'free',
      trialStartDate: now,
      trialEndDate,
      createdAt: now,
    }

    // Store user with password in users list
    users.push({ ...userData, password })
    localStorage.setItem('devdash_users', JSON.stringify(users))

    // Store current user session
    setUser(userData)
    localStorage.setItem('devdash_user', JSON.stringify(userData))
  }

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const users = JSON.parse(localStorage.getItem('devdash_users') || '[]')
    const existingUser = users.find((u: any) => u.email === email && u.password === password)

    if (!existingUser) {
      throw new Error('Invalid email or password')
    }

    const userData: User = {
      uid: existingUser.uid,
      email: existingUser.email,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      plan: existingUser.plan || 'free',
      trialStartDate: existingUser.trialStartDate ? new Date(existingUser.trialStartDate) : undefined,
      trialEndDate: existingUser.trialEndDate ? new Date(existingUser.trialEndDate) : undefined,
      subscriptionStartDate: existingUser.subscriptionStartDate ? new Date(existingUser.subscriptionStartDate) : undefined,
      createdAt: existingUser.createdAt ? new Date(existingUser.createdAt) : new Date(),
    }

    setUser(userData)
    localStorage.setItem('devdash_user', JSON.stringify(userData))
  }

  const logout = async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    setUser(null)
    localStorage.removeItem('devdash_user')
  }

  const resetPassword = async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    // In local mode, just simulate success
    alert(`Password reset email sent to: ${email}\n(This is a demo - no email was actually sent)`)
  }

  const updatePassword = async (newPassword: string) => {
    if (!user) return

    await new Promise(resolve => setTimeout(resolve, 500))

    // Update password in users list
    const users = JSON.parse(localStorage.getItem('devdash_users') || '[]')
    const userIndex = users.findIndex((u: any) => u.uid === user.uid)
    if (userIndex !== -1) {
      users[userIndex].password = newPassword
      localStorage.setItem('devdash_users', JSON.stringify(users))
    }
  }

  const updateProfile = async (firstName: string, lastName: string) => {
    if (!user) return

    const updatedUser = { ...user, firstName, lastName }
    setUser(updatedUser)
    localStorage.setItem('devdash_user', JSON.stringify(updatedUser))

    // Update in users list
    const users = JSON.parse(localStorage.getItem('devdash_users') || '[]')
    const userIndex = users.findIndex((u: any) => u.uid === user.uid)
    if (userIndex !== -1) {
      users[userIndex].firstName = firstName
      users[userIndex].lastName = lastName
      localStorage.setItem('devdash_users', JSON.stringify(users))
    }
  }

  const isTrialActive = React.useMemo(() => {
    if (!user || !user.trialEndDate) return false
    return new Date() < user.trialEndDate && user.plan === 'free'
  }, [user])

  const isPremium = React.useMemo(() => {
    return user?.plan === 'premium' || isTrialActive
  }, [user, isTrialActive])

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    isTrialActive,
    isPremium,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
