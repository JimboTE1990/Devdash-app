'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

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
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

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
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-md">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-md">
            <p className="text-sm text-green-300">{success}</p>
          </div>
        )}

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your current account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <p className="text-white mt-1">{user.email}</p>
            </div>
            <div>
              <Label>Plan</Label>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={user.plan === 'premium' ? 'default' : 'secondary'}>
                  {user.plan === 'premium' ? 'Premium' : 'Free'}
                </Badge>
                {user.plan !== 'premium' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push('/pricing')}
                  >
                    Upgrade to Premium
                  </Button>
                )}
              </div>
            </div>
            {isTrialActive && user.trialEndDate && (
              <div>
                <Label>Free Trial Status</Label>
                <p className="text-white mt-1">
                  Active until {formatDate(user.trialEndDate)}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {Math.ceil((user.trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                </p>
              </div>
            )}
            {user.plan === 'premium' && user.subscriptionStartDate && (
              <div>
                <Label>Premium Subscription</Label>
                <p className="text-white mt-1">
                  Active since {formatDate(user.subscriptionStartDate)}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  £9.99/month - Renews monthly
                </p>
              </div>
            )}
            {!isTrialActive && user.plan === 'free' && (
              <div>
                <Label>Plan Status</Label>
                <p className="text-white mt-1">Free plan</p>
                <p className="text-sm text-yellow-400 mt-1">
                  Trial expired. Upgrade to Premium for full access.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              <Button type="submit" disabled={loadingUpdate}>
                {loadingUpdate ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password</CardDescription>
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
              <Button type="submit" disabled={loadingUpdate}>
                {loadingUpdate ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
