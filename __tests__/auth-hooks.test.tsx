/**
 * Comprehensive tests for authentication custom hooks
 */

import { renderHook } from '@testing-library/react'
import { ReactNode } from 'react'
import { AuthProvider } from '../lib/auth/context'
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
} from '../lib/auth/hooks'
import { onAuthStateChanged } from 'firebase/auth'
import { getUserProfile } from '../lib/auth/providers'

// Mock Firebase and providers
jest.mock('firebase/auth')
jest.mock('../lib/auth/providers')

const mockedOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>
const mockedGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>

// Wrapper component for hooks that need AuthProvider
const createWrapper = (initialState?: any) => {
  return ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )
}

describe('Authentication Hooks', () => {
  let mockUnsubscribe: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockUnsubscribe = jest.fn()
    mockedOnAuthStateChanged.mockReturnValue(mockUnsubscribe)
    mockedGetUserProfile.mockResolvedValue(null)
  })

  describe('useAuth', () => {
    it('should return auth context value', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      })

      expect(result.current).toMatchObject({
        user: null,
        loading: true,
        error: null,
        isAuthenticated: false,
        signInWithGoogle: expect.any(Function),
        signInWithKakao: expect.any(Function),
        signInWithNaver: expect.any(Function),
        signInWithEmail: expect.any(Function),
        signUp: expect.any(Function),
        signOut: expect.any(Function),
        updateProfile: expect.any(Function),
        clearError: expect.any(Function)
      })
    })

    it('should throw error when used outside AuthProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')

      consoleSpy.mockRestore()
    })
  })

  describe('useUser', () => {
    it('should return null when user is not authenticated', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: createWrapper()
      })

      expect(result.current).toBeNull()
    })
  })

  describe('useIsAuthenticated', () => {
    it('should return false initially', () => {
      const { result } = renderHook(() => useIsAuthenticated(), {
        wrapper: createWrapper()
      })

      expect(result.current).toBe(false)
    })
  })

  describe('useAuthLoading', () => {
    it('should return true initially', () => {
      const { result } = renderHook(() => useAuthLoading(), {
        wrapper: createWrapper()
      })

      expect(result.current).toBe(true)
    })
  })

  describe('useAuthError', () => {
    it('should return null initially', () => {
      const { result } = renderHook(() => useAuthError(), {
        wrapper: createWrapper()
      })

      expect(result.current).toBeNull()
    })
  })

  describe('useUserProfile', () => {
    it('should return undefined when user has no profile', () => {
      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper()
      })

      expect(result.current).toBeUndefined()
    })
  })

  describe('useSignIn', () => {
    it('should return sign in methods and clearError', () => {
      const { result } = renderHook(() => useSignIn(), {
        wrapper: createWrapper()
      })

      expect(result.current).toMatchObject({
        signInWithGoogle: expect.any(Function),
        signInWithKakao: expect.any(Function),
        signInWithNaver: expect.any(Function),
        signInWithEmail: expect.any(Function),
        clearError: expect.any(Function)
      })
    })
  })

  describe('useSignUp', () => {
    it('should return signUp method and clearError', () => {
      const { result } = renderHook(() => useSignUp(), {
        wrapper: createWrapper()
      })

      expect(result.current).toMatchObject({
        signUp: expect.any(Function),
        clearError: expect.any(Function)
      })
    })
  })

  describe('useSignOut', () => {
    it('should return signOut function', () => {
      const { result } = renderHook(() => useSignOut(), {
        wrapper: createWrapper()
      })

      expect(typeof result.current).toBe('function')
    })
  })

  describe('useProfile', () => {
    it('should return profile management object', () => {
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper()
      })

      expect(result.current).toMatchObject({
        profile: undefined,
        updateProfile: expect.any(Function),
        hasProfile: false
      })
    })
  })

  describe('useRequireAuth', () => {
    it('should throw error when user is not authenticated', () => {
      const { result } = renderHook(() => {
        try {
          return useRequireAuth()
        } catch (error) {
          return { error: (error as Error).message }
        }
      }, {
        wrapper: createWrapper()
      })

      expect(result.current).toEqual({ error: 'Authentication required' })
    })
  })
})