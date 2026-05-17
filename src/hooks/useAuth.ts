'use client'
import { useEffect, useState } from 'react'
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  const signInWithEmail = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password)

  const signUpWithEmail = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password)

  const resetPassword = (email: string) =>
    sendPasswordResetEmail(auth, email)

  const signOut = () => firebaseSignOut(auth)

  return { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, signOut }
}
