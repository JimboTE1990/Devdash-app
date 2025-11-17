'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/lib/types'
import { supabase } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  updateProfile: (firstName: string, lastName: string) => Promise<void>
  upgradeToPremium: () => Promise<void>
  resendVerificationEmail: () => Promise<void>
  isTrialActive: boolean
  isPremium: boolean
  hasUsedTrial: boolean
  requiresUpgrade: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper function to fetch user profile from Supabase
async function fetchUserProfile(supabaseUser: SupabaseUser): Promise<User | null> {
  console.log('🔍 Fetching profile for user:', supabaseUser.id)

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', supabaseUser.id)
    .single()

  if (error) {
    console.error('❌ Error fetching profile:', error)
    return null
  }

  if (!profile) {
    console.warn('⚠️ No profile found for user:', supabaseUser.id)
    return null
  }

  const userProfile = {
    uid: profile.id,
    email: supabaseUser.email!,
    firstName: profile.first_name,
    lastName: profile.last_name,
    plan: profile.plan,
    trialStartDate: profile.trial_start_date ? new Date(profile.trial_start_date) : undefined,
    trialEndDate: profile.trial_end_date ? new Date(profile.trial_end_date) : undefined,
    subscriptionStartDate: profile.subscription_start_date ? new Date(profile.subscription_start_date) : undefined,
    isLifetimeFree: profile.is_lifetime_free || false,
    trialDurationDays: profile.trial_duration_days || 7,
    hasUsedTrial: profile.has_used_trial || false,
    createdAt: new Date(profile.created_at),
  }

  console.log('✅ Profile fetched successfully:', {
    email: userProfile.email,
    plan: userProfile.plan,
    trialEndDate: userProfile.trialEndDate?.toISOString(),
    isLifetimeFree: userProfile.isLifetimeFree,
  })

  return userProfile
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user).then((profile) => {
          setUser(profile)
          setLoading(false)
        })
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user).then((profile) => {
          setUser(profile)
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    // Sign up with Supabase Auth with email verification
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })

    if (error) throw error

    if (!data.user) {
      throw new Error('Failed to create user')
    }

    // Note: Profile will be created after email verification
    // via the /api/auth/complete-registration endpoint
  }

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      const profile = await fetchUserProfile(data.user)
      setUser(profile)
    }
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) throw error

    alert(`Password reset email sent to: ${email}\nPlease check your inbox.`)
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
  }

  const updateProfile = async (firstName: string, lastName: string) => {
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
      })
      .eq('id', user.uid)

    if (error) throw error

    // Update local user state
    setUser({ ...user, firstName, lastName })
  }

  const upgradeToPremium = async () => {
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        plan: 'premium',
        subscription_start_date: new Date().toISOString(),
      })
      .eq('id', user.uid)

    if (error) throw error

    // Update local user state
    setUser({
      ...user,
      plan: 'premium',
      subscriptionStartDate: new Date(),
    })
  }

  const resendVerificationEmail = async () => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: user?.email || '',
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })

    if (error) throw error

    alert('Verification email sent! Please check your inbox.')
  }

  const isLifetimeFree = React.useMemo(() => {
    return user?.isLifetimeFree === true
  }, [user])

  const isTrialActive = React.useMemo(() => {
    if (!user || !user.trialEndDate) {
      console.log('🔍 isTrialActive: false (no user or no trial end date)')
      return false
    }
    const active = new Date() < user.trialEndDate && user.plan === 'free'
    console.log('🔍 isTrialActive:', active, {
      now: new Date().toISOString(),
      trialEndDate: user.trialEndDate.toISOString(),
      plan: user.plan,
    })
    return active
  }, [user])

  const isPremium = React.useMemo(() => {
    const premium = user?.plan === 'premium' || isTrialActive || isLifetimeFree
    console.log('🔍 isPremium:', premium, {
      plan: user?.plan,
      isTrialActive,
      isLifetimeFree,
    })
    return premium
  }, [user, isTrialActive, isLifetimeFree])

  const hasUsedTrial = React.useMemo(() => {
    if (!user) return false
    return !!user.trialStartDate
  }, [user])

  const requiresUpgrade = React.useMemo(() => {
    if (!user) {
      console.log('🔍 requiresUpgrade: false (no user)')
      return false
    }
    if (user.plan === 'premium' || isLifetimeFree) {
      console.log('🔍 requiresUpgrade: false (premium or lifetime free)')
      return false
    }
    if (!user.trialEndDate) {
      console.log('⚠️ requiresUpgrade: false (no trial end date - this might be a problem!)')
      return false
    }

    // Trial has expired if current time is AFTER trial end date (not equal to)
    const now = new Date()
    const trialEnd = new Date(user.trialEndDate)
    const expired = now.getTime() > trialEnd.getTime()

    console.log('🔍 requiresUpgrade:', expired, {
      now: now.toISOString(),
      trialEnd: trialEnd.toISOString(),
      difference: `${Math.round((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`,
    })

    return expired
  }, [user, isLifetimeFree])

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    upgradeToPremium,
    resendVerificationEmail,
    isTrialActive,
    isPremium,
    hasUsedTrial,
    requiresUpgrade,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
