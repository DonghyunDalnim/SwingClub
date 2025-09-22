/**
 * Authentication Hooks Tests
 */

import React from 'react'
import { renderHook } from '@testing-library/react'

// Mock the auth context
const mockAuthContext = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  signInWithGoogle: jest.fn(),
  signInWithKakao: jest.fn(),
  signInWithNaver: jest.fn(),
  signInWithEmail: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  clearError: jest.fn()
}

jest.mock('@/lib/auth/context', () => ({
  useAuth: () => mockAuthContext
}))

import {
  useAuth,
  useUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
  useUserProfile,
  useSignIn,
  useSignUp,
  useSignOut,
  useProfile,
  useRequireAuth
} from '@/lib/auth/hooks'

import type { User, UserProfile } from '@/lib/types/auth'

describe('Authentication Hooks', () => {
  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    provider: 'google',
    emailVerified: true,
    metadata: {
      creationTime: '2023-01-01T00:00:00Z',
      lastSignInTime: '2023-01-02T00:00:00Z'
    }
  }

  const mockProfile: UserProfile = {
    phoneNumber: '010-1234-5678',
    danceLevel: 'beginner',
    location: {
      region: '강남',
      address: '서울시 강남구'
    },
    preferences: {
      partnerGender: 'any',
      ageRange: [20, 40],
      notifications: {
        email: true,
        push: true
      }
    },
    socialLinks: {
      instagram: '@testuser'
    },
    privacy: {
      showProfile: true,
      showLocation: true,
      showContact: false
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset to default state
    mockAuthContext.user = null
    mockAuthContext.loading = false
    mockAuthContext.error = null
    mockAuthContext.isAuthenticated = false
  })

  describe('useAuth', () => {
    it('should return auth context', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current).toBe(mockAuthContext)
    })
  })

  describe('useUser', () => {
    it('should return null when no user is authenticated', () => {
      mockAuthContext.user = null

      const { result } = renderHook(() => useUser())

      expect(result.current).toBeNull()
    })

    it('should return user when authenticated', () => {
      mockAuthContext.user = mockUser

      const { result } = renderHook(() => useUser())

      expect(result.current).toBe(mockUser)
    })
  })

  describe('useIsAuthenticated', () => {
    it('should return false when not authenticated', () => {
      mockAuthContext.isAuthenticated = false

      const { result } = renderHook(() => useIsAuthenticated())

      expect(result.current).toBe(false)
    })

    it('should return true when authenticated', () => {
      mockAuthContext.isAuthenticated = true

      const { result } = renderHook(() => useIsAuthenticated())

      expect(result.current).toBe(true)
    })
  })

  describe('useAuthLoading', () => {
    it('should return false when not loading', () => {
      mockAuthContext.loading = false

      const { result } = renderHook(() => useAuthLoading())

      expect(result.current).toBe(false)
    })

    it('should return true when loading', () => {
      mockAuthContext.loading = true

      const { result } = renderHook(() => useAuthLoading())

      expect(result.current).toBe(true)
    })
  })

  describe('useAuthError', () => {
    it('should return null when no error', () => {
      mockAuthContext.error = null

      const { result } = renderHook(() => useAuthError())

      expect(result.current).toBeNull()
    })

    it('should return error message when error exists', () => {
      const errorMessage = 'Authentication failed'
      mockAuthContext.error = errorMessage

      const { result } = renderHook(() => useAuthError())

      expect(result.current).toBe(errorMessage)
    })
  })

  describe('useUserProfile', () => {
    it('should return undefined when no user', () => {
      mockAuthContext.user = null

      const { result } = renderHook(() => useUserProfile())

      expect(result.current).toBeUndefined()
    })

    it('should return undefined when user has no profile', () => {
      mockAuthContext.user = mockUser

      const { result } = renderHook(() => useUserProfile())

      expect(result.current).toBeUndefined()
    })

    it('should return profile when user has profile', () => {
      mockAuthContext.user = { ...mockUser, profile: mockProfile }

      const { result } = renderHook(() => useUserProfile())

      expect(result.current).toBe(mockProfile)
    })
  })

  describe('useSignIn', () => {
    it('should return sign in methods', () => {
      const { result } = renderHook(() => useSignIn())

      expect(result.current).toEqual({
        signInWithGoogle: mockAuthContext.signInWithGoogle,
        signInWithKakao: mockAuthContext.signInWithKakao,
        signInWithNaver: mockAuthContext.signInWithNaver,
        signInWithEmail: mockAuthContext.signInWithEmail,
        clearError: mockAuthContext.clearError
      })
    })

    it('should call the correct methods', () => {
      const { result } = renderHook(() => useSignIn())

      result.current.signInWithGoogle()
      expect(mockAuthContext.signInWithGoogle).toHaveBeenCalled()

      result.current.signInWithKakao()
      expect(mockAuthContext.signInWithKakao).toHaveBeenCalled()

      result.current.signInWithNaver()
      expect(mockAuthContext.signInWithNaver).toHaveBeenCalled()

      result.current.signInWithEmail('test@example.com', 'password')
      expect(mockAuthContext.signInWithEmail).toHaveBeenCalledWith('test@example.com', 'password')

      result.current.clearError()
      expect(mockAuthContext.clearError).toHaveBeenCalled()
    })
  })

  describe('useSignUp', () => {
    it('should return sign up methods', () => {
      const { result } = renderHook(() => useSignUp())

      expect(result.current).toEqual({
        signUp: mockAuthContext.signUp,
        clearError: mockAuthContext.clearError
      })
    })

    it('should call the correct methods', () => {
      const { result } = renderHook(() => useSignUp())

      result.current.signUp('test@example.com', 'password', 'Test User')
      expect(mockAuthContext.signUp).toHaveBeenCalledWith('test@example.com', 'password', 'Test User')

      result.current.clearError()
      expect(mockAuthContext.clearError).toHaveBeenCalled()
    })
  })

  describe('useSignOut', () => {
    it('should return sign out function', () => {
      const { result } = renderHook(() => useSignOut())

      expect(result.current).toBe(mockAuthContext.signOut)
    })

    it('should call sign out', () => {
      const { result } = renderHook(() => useSignOut())

      result.current()
      expect(mockAuthContext.signOut).toHaveBeenCalled()
    })
  })

  describe('useProfile', () => {
    it('should return profile data and methods when no user', () => {
      mockAuthContext.user = null

      const { result } = renderHook(() => useProfile())

      expect(result.current).toEqual({
        profile: undefined,
        updateProfile: mockAuthContext.updateProfile,
        hasProfile: false
      })
    })

    it('should return profile data and methods when user has no profile', () => {
      mockAuthContext.user = mockUser

      const { result } = renderHook(() => useProfile())

      expect(result.current).toEqual({
        profile: undefined,
        updateProfile: mockAuthContext.updateProfile,
        hasProfile: false
      })
    })

    it('should return profile data and methods when user has profile', () => {
      mockAuthContext.user = { ...mockUser, profile: mockProfile }

      const { result } = renderHook(() => useProfile())

      expect(result.current).toEqual({
        profile: mockProfile,
        updateProfile: mockAuthContext.updateProfile,
        hasProfile: true
      })
    })

    it('should call updateProfile', () => {
      const { result } = renderHook(() => useProfile())

      result.current.updateProfile(mockProfile)
      expect(mockAuthContext.updateProfile).toHaveBeenCalledWith(mockProfile)
    })
  })

  describe('useRequireAuth', () => {
    it('should throw error when not authenticated', () => {
      mockAuthContext.isAuthenticated = false
      mockAuthContext.user = null

      const { result } = renderHook(() => {
        try {
          return useRequireAuth()
        } catch (error) {
          return { error: (error as Error).message }
        }
      })

      expect(result.current).toEqual({ error: 'Authentication required' })
    })

    it('should throw error when authenticated but no user', () => {
      mockAuthContext.isAuthenticated = true
      mockAuthContext.user = null

      const { result } = renderHook(() => {
        try {
          return useRequireAuth()
        } catch (error) {
          return { error: (error as Error).message }
        }
      })

      expect(result.current).toEqual({ error: 'Authentication required' })
    })

    it('should return user when authenticated', () => {
      mockAuthContext.isAuthenticated = true
      mockAuthContext.user = mockUser

      const { result } = renderHook(() => useRequireAuth())

      expect(result.current).toBe(mockUser)
    })
  })

  describe('Integration', () => {
    it('should work together correctly', () => {
      // Set up authenticated state
      mockAuthContext.isAuthenticated = true
      mockAuthContext.user = { ...mockUser, profile: mockProfile }
      mockAuthContext.loading = false
      mockAuthContext.error = null

      const { result: userResult } = renderHook(() => useUser())
      const { result: authResult } = renderHook(() => useIsAuthenticated())
      const { result: loadingResult } = renderHook(() => useAuthLoading())
      const { result: errorResult } = renderHook(() => useAuthError())
      const { result: profileResult } = renderHook(() => useUserProfile())
      const { result: requireAuthResult } = renderHook(() => useRequireAuth())

      expect(userResult.current).toBe(mockAuthContext.user)
      expect(authResult.current).toBe(true)
      expect(loadingResult.current).toBe(false)
      expect(errorResult.current).toBeNull()
      expect(profileResult.current).toBe(mockProfile)
      expect(requireAuthResult.current).toBe(mockAuthContext.user)
    })
  })
})