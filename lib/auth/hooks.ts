/**
 * Custom authentication hooks for Swing Connect
 */

import { useAuth } from './context'
import type { User, UserProfile } from '../types/auth'

// Re-export useAuth for convenience
export { useAuth }

// Hook to get current user
export const useUser = (): User | null => {
  const { user } = useAuth()
  return user
}

// Hook to check if user is authenticated
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated
}

// Hook to get loading state
export const useAuthLoading = (): boolean => {
  const { loading } = useAuth()
  return loading
}

// Hook to get authentication error
export const useAuthError = (): string | null => {
  const { error } = useAuth()
  return error
}

// Hook to get user profile
export const useUserProfile = (): UserProfile | undefined => {
  const { user } = useAuth()
  return user?.profile
}

// Hook for sign in actions
export const useSignIn = () => {
  const {
    signInWithGoogle,
    signInWithKakao,
    signInWithNaver,
    signInWithEmail,
    clearError
  } = useAuth()

  return {
    signInWithGoogle,
    signInWithKakao,
    signInWithNaver,
    signInWithEmail,
    clearError
  }
}

// Hook for sign up actions
export const useSignUp = () => {
  const { signUp, clearError } = useAuth()

  return {
    signUp,
    clearError
  }
}

// Hook for sign out action
export const useSignOut = () => {
  const { signOut } = useAuth()
  return signOut
}

// Hook for profile management
export const useProfile = () => {
  const { user, updateProfile } = useAuth()

  return {
    profile: user?.profile,
    updateProfile,
    hasProfile: !!user?.profile
  }
}

// Hook to require authentication (throws if not authenticated)
export const useRequireAuth = (): User => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    throw new Error('Authentication required')
  }

  return user
}