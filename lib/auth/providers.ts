/**
 * Authentication provider configurations for Swing Connect
 */

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
  type Auth
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'
import type { User, AuthProvider, UserProfile, FirebaseUserToUser } from '../types/auth'

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')

// Convert Firebase User to our User type
const convertFirebaseUser: FirebaseUserToUser = (firebaseUser: FirebaseUser, provider: AuthProvider): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    provider,
    createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
    lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now())
  }
}

// Create or update user document in Firestore
const createOrUpdateUserDoc = async (user: User, profile?: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', user.id)
  const userDoc = await getDoc(userRef)

  if (!userDoc.exists()) {
    // Create new user document
    await setDoc(userRef, {
      ...user,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      profile: profile || {
        nickname: user.displayName || '',
        danceLevel: 'beginner',
        location: '',
        interests: []
      }
    })
  } else {
    // Update last login time
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      ...(profile && { profile: { ...userDoc.data().profile, ...profile } })
    })
  }

  // Return updated user data
  const updatedDoc = await getDoc(userRef)
  return { ...user, profile: updatedDoc.data()?.profile }
}

// Google Authentication
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = convertFirebaseUser(result.user, 'google')
    return await createOrUpdateUserDoc(user)
  } catch (error: any) {
    console.error('Google sign-in error:', error)
    throw error
  }
}

// Kakao Authentication (placeholder for now - requires OAuth setup)
export const signInWithKakao = async (): Promise<User> => {
  // For now, we'll show an alert that Kakao auth is coming soon
  // In production, this would integrate with Kakao OAuth
  throw new Error('kakao-not-implemented')
}

// Naver Authentication (placeholder for now - requires OAuth setup)
export const signInWithNaver = async (): Promise<User> => {
  // For now, we'll show an alert that Naver auth is coming soon
  // In production, this would integrate with Naver OAuth
  throw new Error('naver-not-implemented')
}

// Email/Password Authentication
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const user = convertFirebaseUser(result.user, 'email')
    return await createOrUpdateUserDoc(user)
  } catch (error: any) {
    console.error('Email sign-in error:', error)
    throw error
  }
}

// Email/Password Registration
export const signUpWithEmail = async (
  email: string,
  password: string,
  profile: Partial<UserProfile>
): Promise<User> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const user = convertFirebaseUser(result.user, 'email')
    return await createOrUpdateUserDoc(user, profile)
  } catch (error: any) {
    console.error('Email sign-up error:', error)
    throw new Error(error.code || 'email-signup-failed')
  }
}

// Sign Out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth)
  } catch (error: any) {
    console.error('Sign-out error:', error)
    throw new Error(error.code || 'signout-failed')
  }
}

// Update User Profile
export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      profile,
      updatedAt: serverTimestamp()
    })
  } catch (error: any) {
    console.error('Profile update error:', error)
    throw new Error(error.code || 'profile-update-failed')
  }
}

// Get User Profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    return userDoc.exists() ? userDoc.data().profile || null : null
  } catch (error: any) {
    console.error('Get profile error:', error)
    return null
  }
}