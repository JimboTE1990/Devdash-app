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
  claimFreeTrial: () => Promise<void>
  isTrialActive: boolean
  isPremium: boolean
  hasUsedTrial: boolean
  requiresUpgrade: boolean
  hasClaimedTrial: boolean
  hasAccess: boolean
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
  if (typeof window !== 'undefined') {
    console.log('🔍 Fetching profile for user:', supabaseUser.id)
  }

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
    if (typeof window !== 'undefined') {
      console.warn('⚠️ No profile found for user:', supabaseUser.id)
    }
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
    billingInterval: profile.billing_interval,
    isLifetimeFree: profile.is_lifetime_free || false,
    trialDurationDays: profile.trial_duration_days || 7,
    hasUsedTrial: profile.has_used_trial || false,
    createdAt: new Date(profile.created_at),
  }

  if (typeof window !== 'undefined') {
    console.log('✅ Profile loaded:', {
      email: userProfile.email,
      plan: userProfile.plan,
      trial_end: userProfile.trialEndDate?.toISOString(),
      days_remaining: userProfile.trialEndDate
        ? Math.round((userProfile.trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null
    })
  }

  return userProfile
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Helper to ensure profile exists and fetch it
  const ensureAndFetchProfile = async (supabaseUser: SupabaseUser) => {
    let profile = await fetchUserProfile(supabaseUser)

    // If no profile exists, create minimal profile
    if (!profile) {
      if (typeof window !== 'undefined') {
        console.log('⚠️ No profile on session init, creating...')
      }

      try {
        const response = await fetch('/api/auth/ensure-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: supabaseUser.id }),
        })

        if (response.ok) {
          profile = await fetchUserProfile(supabaseUser)
        }
      } catch (err) {
        console.error('Failed to ensure profile:', err)
      }
    }

    return profile
  }

  useEffect(() => {
    // Check active session - don't block on profile creation during page load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Just fetch profile, don't create it yet (speeds up page load)
        const profile = await fetchUserProfile(session.user)
        setUser(profile)
        setLoading(false)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Just fetch profile during auth state changes
        const profile = await fetchUserProfile(session.user)
        setUser(profile)
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
      let profile = await fetchUserProfile(data.user)

      // If no profile exists, create one
      if (!profile) {
        if (typeof window !== 'undefined') {
          console.log('⚠️ No profile found, creating minimal profile...')
        }

        // Call API to ensure profile exists
        const response = await fetch('/api/auth/ensure-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id }),
        })

        if (response.ok) {
          // Try fetching profile again
          profile = await fetchUserProfile(data.user)

          if (typeof window !== 'undefined') {
            console.log('✅ Profile created, user can now proceed')
          }
        } else {
          console.error('❌ Failed to create profile during login')
          throw new Error('Failed to create user profile. Please try again.')
        }
      }

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

  const claimFreeTrial = async () => {
    if (!user) throw new Error('Must be logged in to claim trial')

    // Call API to create profile with trial
    const response = await fetch('/api/trial/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.uid }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to claim trial')
    }

    // Refresh user profile to get trial dates
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData.session?.user) {
      const updatedProfile = await fetchUserProfile(sessionData.session.user)
      setUser(updatedProfile)
    }
  }

  const isLifetimeFree = React.useMemo(() => {
    return user?.isLifetimeFree === true
  }, [user])

  const isTrialActive = React.useMemo(() => {
    if (!user || !user.trialEndDate) return false
    return new Date() < user.trialEndDate && user.plan === 'free'
  }, [user])

  const isPremium = React.useMemo(() => {
    return user?.plan === 'premium' || isTrialActive || isLifetimeFree
  }, [user, isTrialActive, isLifetimeFree])

  const hasUsedTrial = React.useMemo(() => {
    if (!user) return false
    return !!user.trialStartDate
  }, [user])

  const requiresUpgrade = React.useMemo(() => {
    if (!user) return false
    if (user.plan === 'premium' || isLifetimeFree) return false
    if (!user.trialEndDate) return false

    // Trial has expired if current time is AFTER trial end date
    const now = new Date()
    const trialEnd = new Date(user.trialEndDate)
    return now.getTime() > trialEnd.getTime()
  }, [user, isLifetimeFree])

  // Has the user claimed their free trial (i.e., does a profile with trial exist)?
  const hasClaimedTrial = React.useMemo(() => {
    if (!user) return false
    // Profile exists with trial dates = trial has been claimed
    return !!user.trialStartDate && !!user.trialEndDate
  }, [user])

  // Does the user have access to features?
  // Yes if: premium plan OR active trial OR lifetime free
  // No if: no trial claimed yet OR trial expired and not premium
  const hasAccess = React.useMemo(() => {
    if (!user) return false
    if (user.plan === 'premium' || isLifetimeFree) return true
    if (!hasClaimedTrial) return false // No trial claimed yet
    return isTrialActive // Trial claimed, check if still active
  }, [user, isTrialActive, isLifetimeFree, hasClaimedTrial])

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
    claimFreeTrial,
    isTrialActive,
    isPremium,
    hasUsedTrial,
    requiresUpgrade,
    hasClaimedTrial,
    hasAccess,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
