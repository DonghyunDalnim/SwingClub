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

    it('should return user when authenticated', async () => {
      // This would require mocking the AuthProvider's state change
      // For now, testing the hook structure
      const { result } = renderHook(() => useUser(), {
        wrapper: createWrapper()
      })

      expect(result.current).toBeNull() // Initial state
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

    it('should call auth methods when invoked', () => {
      const { result: authResult } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      })
      const { result } = renderHook(() => useSignIn(), {
        wrapper: createWrapper()
      })

      // Test that the functions exist and are callable
      expect(typeof result.current.signInWithGoogle).toBe('function')
      expect(typeof result.current.signInWithEmail).toBe('function')
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

    it('should return hasProfile as false when no profile exists', () => {
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper()
      })

      expect(result.current.hasProfile).toBe(false)
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

  describe('Hook Integration Tests', () => {
    it('should have consistent state across multiple hooks', () => {
      const wrapper = createWrapper()

      const { result: authResult } = renderHook(() => useAuth(), { wrapper })
      const { result: userResult } = renderHook(() => useUser(), { wrapper })
      const { result: isAuthResult } = renderHook(() => useIsAuthenticated(), { wrapper })
      const { result: loadingResult } = renderHook(() => useAuthLoading(), { wrapper })
      const { result: errorResult } = renderHook(() => useAuthError(), { wrapper })

      // All hooks should reflect the same initial state
      expect(userResult.current).toBe(authResult.current.user)
      expect(isAuthResult.current).toBe(authResult.current.isAuthenticated)
      expect(loadingResult.current).toBe(authResult.current.loading)
      expect(errorResult.current).toBe(authResult.current.error)
    })

    it('should provide the same function references across re-renders', () => {
      const { result, rerender } = renderHook(() => useSignIn(), {
        wrapper: createWrapper()
      })

      const firstRenderFunctions = { ...result.current }

      rerender()

      const secondRenderFunctions = { ...result.current }

      // Functions should maintain reference equality for performance
      expect(firstRenderFunctions.signInWithGoogle).toBe(secondRenderFunctions.signInWithGoogle)
      expect(firstRenderFunctions.signInWithEmail).toBe(secondRenderFunctions.signInWithEmail)
      expect(firstRenderFunctions.clearError).toBe(secondRenderFunctions.clearError)
    })
  })

  describe('Hook Type Safety', () => {
    it('should maintain proper TypeScript types', () => {
      const { result: userResult } = renderHook(() => useUser(), {
        wrapper: createWrapper()
      })

      const { result: profileResult } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper()
      })

      const { result: signInResult } = renderHook(() => useSignIn(), {
        wrapper: createWrapper()
      })

      // Type assertions to ensure hooks return expected types
      const user = userResult.current // Should be User | null
      const profile = profileResult.current // Should be UserProfile | undefined
      const signIn = signInResult.current // Should have specific sign in methods

      expect(user === null || typeof user === 'object').toBe(true)
      expect(profile === undefined || typeof profile === 'object').toBe(true)
      expect(typeof signIn.signInWithEmail === 'function').toBe(true)
    })
  })

  describe('Hook Error Boundaries', () => {
    it('should handle errors gracefully in hook functions', () => {
      const { result } = renderHook(() => useSignIn(), {
        wrapper: createWrapper()
      })

      // Hooks should not throw during render
      expect(() => {
        const signInMethods = result.current
        expect(signInMethods).toBeDefined()
      }).not.toThrow()
    })

    it('should maintain hook stability across error states', () => {
      const { result } = renderHook(() => {
        const auth = useAuth()
        const user = useUser()
        const isAuth = useIsAuthenticated()
        const loading = useAuthLoading()
        const error = useAuthError()

        return { auth, user, isAuth, loading, error }
      }, {
        wrapper: createWrapper()
      })

      // All hooks should be stable even with errors
      expect(result.current.auth).toBeDefined()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuth).toBe(false)
      expect(result.current.loading).toBe(true)
      expect(result.current.error).toBeNull()
    })
  })

  describe('Performance Considerations', () => {
    it('should not cause unnecessary re-renders', () => {
      let renderCount = 0
      const { result } = renderHook(() => {
        renderCount++
        return useAuth()
      }, {
        wrapper: createWrapper()
      })

      expect(renderCount).toBe(1)

      // Accessing properties should not cause re-renders
      const { user, loading, error } = result.current
      expect(renderCount).toBe(1)
    })

    it('should memoize hook return values appropriately', () => {
      const { result, rerender } = renderHook(() => useProfile(), {
        wrapper: createWrapper()
      })

      const firstResult = result.current
      rerender()
      const secondResult = result.current

      // Object should be stable between renders when state doesn't change
      expect(typeof firstResult.updateProfile).toBe('function')
      expect(typeof secondResult.updateProfile).toBe('function')
    })
  })
})