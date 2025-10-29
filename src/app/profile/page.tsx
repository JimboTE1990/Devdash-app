'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { User, CreditCard, Lock, Calendar, Mail, Crown, Sparkles } from 'lucide-react'

export default function ProfilePage() {
  const { user, loading, updateProfile, updatePassword, isTrialActive } = useAuth()
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loadingUpdate, setLoadingUpdate] = useState(false)

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  }

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getInitials = () => {
    return `${firstName?.charAt(0) || 'U'}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const daysRemaining = user.trialEndDate
    ? Math.ceil((user.trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoadingUpdate(true)

    try {
      await updateProfile(firstName, lastName)
      setSuccess('Profile updated successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoadingUpdate(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoadingUpdate(true)

    try {
      await updatePassword(newPassword)
      setSuccess('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err.message || 'Failed to change password')
    } finally {
      setLoadingUpdate(false)
    }
  }

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background dark:from-primary/10 dark:via-accent/5 dark:to-background -z-10" />

      {/* Floating orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Header with Avatar */}
          <motion.div {...fadeInUp} className="text-center px-4">
            <div className="relative inline-block mb-4 sm:mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">{getInitials()}</span>
                </div>
              </div>
              {user.plan === 'premium' && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center border-2 border-background">
                  <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {firstName} {lastName}
              </span>
            </h1>
            <p className="text-sm sm:text-base text-foreground/70 flex items-center justify-center gap-2">
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="break-all">{user.email}</span>
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4"
          >
            <motion.div variants={fadeInUp}>
              <Card className="glass-strong shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground/60 font-medium">Plan Status</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {user.isLifetimeFree
                          ? 'Lifetime Free'
                          : user.plan === 'premium'
                          ? 'Premium'
                          : 'Free Trial'}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent p-0.5">
                      <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="glass-strong shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground/60 font-medium">Member Since</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent p-0.5">
                      <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {isTrialActive && (
              <motion.div variants={fadeInUp}>
                <Card className="glass-strong shadow-lg border-2 border-primary/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-foreground/60 font-medium">Trial Days Left</p>
                        <p className="text-2xl font-bold text-primary mt-1">{daysRemaining}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {error && (
            <motion.div {...fadeInUp} className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div {...fadeInUp} className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
              <p className="text-sm text-green-300">{success}</p>
            </motion.div>
          )}

          {/* Account Information */}
          <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
            <Card className="glass-strong shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Your subscription and billing details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-foreground/70 font-medium">Email Address</Label>
                    <p className="text-foreground mt-1 font-medium">{user.email}</p>
                  </div>
                  <div>
                    <Label className="text-foreground/70 font-medium">Current Plan</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        variant={user.plan === 'premium' ? 'default' : 'secondary'}
                        className={user.plan === 'premium' ? 'bg-gradient-to-r from-primary to-accent' : ''}
                      >
                        {user.plan === 'premium' ? (
                          <><Crown className="h-3 w-3 mr-1" /> Premium</>
                        ) : (
                          'Free Plan'
                        )}
                      </Badge>
                      {user.plan !== 'premium' && (
                        <Button
                          size="sm"
                          onClick={() => router.push('/checkout')}
                          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                        >
                          Upgrade to Premium
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {isTrialActive && user.trialEndDate && (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <Label className="text-foreground font-semibold">Free Trial Active</Label>
                        <p className="text-foreground/80 mt-1">
                          Your trial ends on {formatDate(user.trialEndDate)}
                        </p>
                        <p className="text-sm text-foreground/70 mt-1">
                          {daysRemaining} days remaining • Enjoying Jimbula? Upgrade to keep full access!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {user.plan === 'premium' && user.subscriptionStartDate && (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20">
                    <div className="flex items-start gap-3">
                      <Crown className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <Label className="text-foreground font-semibold">Premium Subscription</Label>
                        <p className="text-foreground/80 mt-1">
                          Active since {formatDate(user.subscriptionStartDate)}
                        </p>
                        <p className="text-sm text-foreground/70 mt-1">
                          £14.99/month • Renews monthly
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!isTrialActive && user.plan === 'free' && (
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <Label className="text-foreground font-semibold">Trial Expired</Label>
                        <p className="text-foreground/80 mt-1">
                          Your free trial has ended. Upgrade to Premium for continued access to all features.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => router.push('/checkout')}
                          className="mt-3 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                        >
                          Upgrade Now
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Personal Information */}
          <motion.div {...fadeInUp} transition={{ delay: 0.15 }}>
            <Card className="glass-strong shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={loadingUpdate}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    {loadingUpdate ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Change Password */}
          <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
            <Card className="glass-strong shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your account password</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loadingUpdate}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    {loadingUpdate ? 'Changing...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
