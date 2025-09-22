/**
 * Firebase Admin SDK configuration for server-side operations
 */

import { initializeApp, getApps, cert, type App as AdminApp } from 'firebase-admin/app'
import { getAuth, type Auth as AdminAuth } from 'firebase-admin/auth'
import { getFirestore, type Firestore as AdminFirestore } from 'firebase-admin/firestore'

let adminApp: AdminApp
let adminAuth: AdminAuth
let adminDb: AdminFirestore

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  // Check if already initialized
  const existingApps = getApps()
  if (existingApps.length > 0) {
    adminApp = existingApps[0]
    adminAuth = getAuth(adminApp)
    adminDb = getFirestore(adminApp)
    return { adminApp, adminAuth, adminDb }
  }

  try {
    // For development/demo, use emulator or skip initialization
    const isDemo = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-project'
    const isDevelopment = process.env.NODE_ENV === 'development'

    if (isDemo || isDevelopment) {
      // In demo mode, return mock objects
      console.warn('Firebase Admin SDK: Running in demo/development mode')
      return {
        adminApp: null,
        adminAuth: {
          verifyIdToken: async (token: string) => {
            // In demo mode, just return a mock decoded token
            return {
              uid: 'demo-user',
              email: 'demo@example.com',
              email_verified: true,
              auth_time: Math.floor(Date.now() / 1000),
              iat: Math.floor(Date.now() / 1000),
              exp: Math.floor(Date.now() / 1000) + 3600,
              aud: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
              iss: `https://securetoken.google.com/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project'}`,
              sub: 'demo-user'
            }
          }
        } as any,
        adminDb: null
      }
    }

    // Production initialization with service account
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

    if (!serviceAccountKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required for production')
    }

    if (!projectId) {
      throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is required')
    }

    // Parse the service account key
    let serviceAccount
    try {
      serviceAccount = JSON.parse(serviceAccountKey)
    } catch (error) {
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format. Must be valid JSON.')
    }

    // Initialize the app
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: projectId,
      // Optional: Add database URL if using Realtime Database
      // databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`
    })

    adminAuth = getAuth(adminApp)
    adminDb = getFirestore(adminApp)

    console.log('Firebase Admin SDK initialized successfully')

    return { adminApp, adminAuth, adminDb }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error)
    throw error
  }
}

// Initialize on module load
const { adminApp: app, adminAuth: auth, adminDb: db } = initializeFirebaseAdmin()

// Export the instances
export { app as adminApp, auth as adminAuth, db as adminDb }

// Helper function to verify ID token
export async function verifyIdToken(idToken: string) {
  try {
    if (!adminAuth) {
      throw new Error('Firebase Admin Auth not initialized')
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return {
      success: true,
      decodedToken,
      uid: decodedToken.uid,
      email: decodedToken.email
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      decodedToken: null,
      uid: null,
      email: null
    }
  }
}

// Helper function to check if admin SDK is properly initialized
export function isAdminInitialized(): boolean {
  const isDemo = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-project'
  const isDevelopment = process.env.NODE_ENV === 'development'

  // In demo/development mode, consider it initialized if we have mock auth
  if (isDemo || isDevelopment) {
    return !!adminAuth
  }

  // In production, check for real initialization
  return !!(adminApp && adminAuth && adminDb)
}

// Export types for use in other files
export type { DecodedIdToken } from 'firebase-admin/auth'