'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { User } from '@/lib/types'

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            firstName: userData.firstName,
            lastName: userData.lastName,
            plan: userData.plan || 'free',
            trialStartDate: userData.trialStartDate?.toDate(),
            trialEndDate: userData.trialEndDate?.toDate(),
            subscriptionStartDate: userData.subscriptionStartDate?.toDate(),
            createdAt: userData.createdAt?.toDate(),
          })
        }
        setFirebaseUser(firebaseUser)
      } else {
        setUser(null)
        setFirebaseUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const now = new Date()
    const trialEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      firstName,
      lastName,
      plan: 'free',
      trialStartDate: now,
      trialEndDate,
      createdAt: now,
    })
  }

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    await signOut(auth)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const updatePassword = async (newPassword: string) => {
    if (firebaseUser) {
      await firebaseUpdatePassword(firebaseUser, newPassword)
    }
  }

  const updateProfile = async (firstName: string, lastName: string) => {
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
      })
      setUser({ ...user, firstName, lastName })
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
    firebaseUser,
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
