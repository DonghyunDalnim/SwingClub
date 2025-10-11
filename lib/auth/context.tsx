'use client'

/**
 * Authentication Context Provider for Swing Connect
 */

import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react'
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { auth } from '../firebase'
import {
  signInWithGoogle,
  signInWithKakao,
  signInWithNaver,
  signInWithEmail,
  signUpWithEmail,
  signOut as authSignOut,
  updateUserProfile,
  getUserProfile
} from './providers'
import type { AuthState, AuthContextType, User, UserProfile, AuthError } from '../types/auth'
import { AUTH_ERRORS, AUTH_ERROR_MESSAGES } from '../types/auth'

// Initial state
const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false
}

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_SIGNOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_PROFILE'; payload: UserProfile }

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null,
        isAuthenticated: true
      }
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        loading: false,
        error: action.payload,
        isAuthenticated: false
      }
    case 'AUTH_SIGNOUT':
      return {
        ...state,
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, profile: action.payload } : null
      }
    default:
      return state
  }
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null)

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Convert Firebase error to user-friendly message
const getErrorMessage = (errorCode: string): string => {
  return AUTH_ERROR_MESSAGES[errorCode] || AUTH_ERROR_MESSAGES[AUTH_ERRORS.PROVIDER_ERROR]
}

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Handle authentication actions with error handling
  const handleAuthAction = async (action: () => Promise<User>) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const user = await action()

      // Fetch and attach user profile
      const profile = await getUserProfile(user.id)
      const userWithProfile = { ...user, profile: profile || undefined }

      dispatch({ type: 'AUTH_SUCCESS', payload: userWithProfile })
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.message)
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage })
      throw error // Re-throw for component-level handling if needed
    }
  }

  // Authentication methods
  const handleSignInWithGoogle = () => handleAuthAction(signInWithGoogle)

  const handleSignInWithKakao = async () => {
    dispatch({ type: 'AUTH_START' })
    try {
      // Show friendly message for now
      dispatch({ type: 'AUTH_ERROR', payload: '카카오 로그인은 곧 지원 예정입니다. 현재는 구글 로그인을 이용해주세요.' })
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: '카카오 로그인에 실패했습니다' })
    }
  }

  const handleSignInWithNaver = async () => {
    dispatch({ type: 'AUTH_START' })
    try {
      // Show friendly message for now
      dispatch({ type: 'AUTH_ERROR', payload: '네이버 로그인은 곧 지원 예정입니다. 현재는 구글 로그인을 이용해주세요.' })
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: '네이버 로그인에 실패했습니다' })
    }
  }

  const handleSignInWithEmail = (email: string, password: string) =>
    handleAuthAction(() => signInWithEmail(email, password))

  const handleSignUp = (email: string, password: string, profile: Partial<UserProfile>) =>
    handleAuthAction(() => signUpWithEmail(email, password, profile))

  const handleSignOut = async () => {
    try {
      await authSignOut()
      dispatch({ type: 'AUTH_SIGNOUT' })
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.message)
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage })
    }
  }

  const handleUpdateProfile = async (profile: Partial<UserProfile>) => {
    if (!state.user) return

    try {
      await updateUserProfile(state.user.id, profile)
      const updatedProfile = { ...state.user.profile, ...profile }
      dispatch({ type: 'UPDATE_PROFILE', payload: updatedProfile as UserProfile })
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.message)
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage })
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Listen to Firebase auth state changes
  useEffect(() => {
    // Check if Firebase auth is properly initialized
    if (!auth) {
      console.error('Firebase Auth is not initialized')
      dispatch({
        type: 'AUTH_ERROR',
        payload: 'Firebase 인증 서비스가 초기화되지 않았습니다. Firebase 콘솔에서 Authentication을 활성화해주세요.'
      })
      return
    }

    let unsubscribe: (() => void) | null = null

    try {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        console.log('[AuthContext] Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out')
        try {
          if (firebaseUser) {
            console.log('[AuthContext] Processing logged in user:', firebaseUser.email)
            // Convert Firebase user and fetch profile
            const user: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              provider: 'google', // Default - this should be stored/detected properly
              createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
              lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now())
            }

            // Safely fetch user profile with error handling
            let profile: UserProfile | null = null
            try {
              profile = await getUserProfile(user.id)
            } catch (profileError) {
              console.warn('Failed to fetch user profile:', profileError)
              // Continue with null profile - user can update later
            }

            const userWithProfile = { ...user, profile: profile || undefined }

            // Store authentication state in cookies for server-side access (client-side only)
            if (typeof window !== 'undefined') {
              try {
                console.log('[AuthContext] Getting Firebase ID token...')
                // Get Firebase ID token for middleware validation
                const idToken = await firebaseUser.getIdToken(true) // Force refresh

                if (idToken) {
                  console.log('[AuthContext] Token obtained, setting cookies...')
                  const isSecure = location.protocol === 'https:'
                  document.cookie = `firebase-token=${idToken}; path=/; max-age=${60 * 60}; SameSite=Lax${isSecure ? '; Secure' : ''}`
                  document.cookie = `user-data=${encodeURIComponent(JSON.stringify(userWithProfile))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${isSecure ? '; Secure' : ''}`
                  console.log('[AuthContext] Cookies set successfully')
                }
              } catch (tokenError: any) {
                console.error('[AuthContext] Failed to get Firebase ID token:', tokenError)
                // Continue without token - user might need to re-authenticate
                // Still set basic auth state
                if (typeof window !== 'undefined') {
                  document.cookie = `firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`
                }
              }
            }

            console.log('[AuthContext] Dispatching AUTH_SUCCESS, isAuthenticated will be true')
            dispatch({ type: 'AUTH_SUCCESS', payload: userWithProfile })
          } else {
            // Clear cookies on logout (client-side only)
            if (typeof window !== 'undefined') {
              document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC'
              document.cookie = 'user-data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC'
            }

            dispatch({ type: 'AUTH_SIGNOUT' })
          }
        } catch (authError: any) {
          console.error('Auth state change error:', authError)
          dispatch({
            type: 'AUTH_ERROR',
            payload: `인증 상태 처리 중 오류가 발생했습니다: ${authError.message || '알 수 없는 오류'}`
          })
        }
      })
    } catch (error: any) {
      console.error('Error setting up auth listener:', error)
      dispatch({
        type: 'AUTH_ERROR',
        payload: 'Firebase 인증 리스너 설정에 실패했습니다. Firebase 콘솔에서 Authentication이 활성화되어 있는지 확인해주세요.'
      })
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    }
  }, [])

  const value: AuthContextType = {
    ...state,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithKakao: handleSignInWithKakao,
    signInWithNaver: handleSignInWithNaver,
    signInWithEmail: handleSignInWithEmail,
    signUp: handleSignUp,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
    clearError
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider