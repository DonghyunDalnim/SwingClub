/**
 * Firebase connection test utility
 */

import { auth, db, isFirebaseInitialized } from '../firebase'
import { connectAuthEmulator } from 'firebase/auth'
import { connectFirestoreEmulator } from 'firebase/firestore'

export const testFirebaseConnection = async (): Promise<{
  success: boolean
  message: string
  details?: any
}> => {
  try {
    // Check if Firebase is initialized
    if (!isFirebaseInitialized()) {
      return {
        success: false,
        message: 'Firebase initialization failed'
      }
    }

    // Check Auth configuration
    if (!auth.app.options.authDomain) {
      return {
        success: false,
        message: 'Firebase Auth domain not configured'
      }
    }

    // Check Firestore configuration
    if (!auth.app.options.projectId) {
      return {
        success: false,
        message: 'Firebase project ID not configured'
      }
    }

    // Test Auth connection (safe operation)
    try {
      await auth.authStateReady()
    } catch (authError: any) {
      return {
        success: false,
        message: 'Firebase Auth connection failed',
        details: authError.message
      }
    }

    return {
      success: true,
      message: 'Firebase connection successful',
      details: {
        projectId: auth.app.options.projectId,
        authDomain: auth.app.options.authDomain,
        currentUser: auth.currentUser?.uid || 'No user signed in'
      }
    }

  } catch (error: any) {
    return {
      success: false,
      message: 'Firebase connection test failed',
      details: error.message
    }
  }
}

// Utility to check environment variables
export const checkFirebaseEnv = () => {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ]

  const missing = requiredVars.filter(varName => !process.env[varName])
  const present = requiredVars.filter(varName => !!process.env[varName])

  return {
    allPresent: missing.length === 0,
    missing,
    present,
    details: present.reduce((acc, varName) => {
      const value = process.env[varName] || ''
      acc[varName] = value.length > 10 ? `${value.substring(0, 10)}...` : value
      return acc
    }, {} as Record<string, string>)
  }
}