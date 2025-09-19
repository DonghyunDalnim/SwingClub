/**
 * Firebase configuration and initialization for Swing Connect
 */

import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { getAnalytics, type Analytics } from 'firebase/analytics'
import type { FirebaseConfig } from './types/firebase'

// Firebase configuration from environment variables
// During build time, use placeholder values if env vars are missing
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abc123def456',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-ABC123DEF4'
}

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
]

// Only validate environment variables in production/development mode, not during build
const isBuildTime = process.env.NODE_ENV === undefined || process.env.NODE_ENV === 'test'
if (!isBuildTime) {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`Missing Firebase environment variable: ${envVar}`)
    }
  }
}

// Initialize Firebase
let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage
let analytics: Analytics | null = null

// Check if we have valid Firebase config (not placeholder values)
const hasValidConfig = firebaseConfig.apiKey !== 'demo-api-key' &&
                      firebaseConfig.projectId !== 'demo-project'

if (hasValidConfig) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)

    // Initialize analytics only in browser environment
    if (typeof window !== 'undefined' && firebaseConfig.measurementId && firebaseConfig.measurementId !== 'G-ABC123DEF4') {
      analytics = getAnalytics(app)
    }
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
    // Don't throw error in development - just warn
    console.warn('Firebase not configured properly. Using mock services.')
  }
} else {
  console.warn('Firebase not configured. Using placeholder values for development.')
}

// Export Firebase services
export { app, auth, db, storage, analytics }

// Export configuration for debugging
export const config = firebaseConfig

// Helper function to check if Firebase is properly initialized
export const isFirebaseInitialized = (): boolean => {
  try {
    return !!(app && auth && db && storage)
  } catch {
    return false
  }
}