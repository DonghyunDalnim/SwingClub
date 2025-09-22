/**
 * Authentication Context Tests
 */

import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { beforeEach, afterEach } from '@jest/globals'

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn()
}))

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: { mockAuth: true }
}))

// Mock auth providers
jest.mock('@/lib/auth/providers', () => ({
  signInWithGoogle: jest.fn(),
  signInWithKakao: jest.fn(),
  signInWithNaver: jest.fn(),
  signInWithEmail: jest.fn(),
  signUpWithEmail: jest.fn(),
  signOut: jest.fn(),
  updateUserProfile: jest.fn(),
  getUserProfile: jest.fn()
}))

import { onAuthStateChanged } from 'firebase/auth'
import {
  signInWithGoogle,
  signInWithKakao,
  signInWithNaver,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  updateUserProfile,
  getUserProfile
} from '@/lib/auth/providers'

import { AuthProvider, useAuth } from '@/lib/auth/context'
import type { User, UserProfile } from '@/lib/types/auth'

const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>
const mockSignInWithGoogle = signInWithGoogle as jest.MockedFunction<typeof signInWithGoogle>
const mockSignInWithKakao = signInWithKakao as jest.MockedFunction<typeof signInWithKakao>
const mockSignInWithNaver = signInWithNaver as jest.MockedFunction<typeof signInWithNaver>
const mockSignInWithEmail = signInWithEmail as jest.MockedFunction<typeof signInWithEmail>
const mockSignUpWithEmail = signUpWithEmail as jest.MockedFunction<typeof signUpWithEmail>
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>
const mockUpdateUserProfile = updateUserProfile as jest.MockedFunction<typeof updateUserProfile>
const mockGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>

describe('AuthContext', () => {
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
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      // Simulate no user initially
      callback(null)
      return jest.fn() // Unsubscribe function
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('useAuth Hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const TestComponent = () => {
        useAuth()
        return <div>Test</div>
      }

      expect(() => render(<TestComponent />)).toThrow(
        'useAuth must be used within an AuthProvider'
      )
    })

    it('should provide auth context when used inside AuthProvider', () => {
      const TestComponent = () => {
        const auth = useAuth()
        return <div>Loading: {auth.loading.toString()}</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByText(/Loading:/)).toBeInTheDocument()
    })
  })

  describe('AuthProvider', () => {
    it('should render children and provide initial state', () => {
      render(
        <AuthProvider>
          <div data-testid="child">Test Child</div>
        </AuthProvider>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should start with loading state', () => {
      const TestComponent = () => {
        const { loading, isAuthenticated, user } = useAuth()
        return (
          <div>
            <div data-testid="loading">{loading.toString()}</div>
            <div data-testid="authenticated">{isAuthenticated.toString()}</div>
            <div data-testid="user">{user ? 'user exists' : 'no user'}</div>
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('loading')).toHaveTextContent('true')
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('user')).toHaveTextContent('no user')
    })

    it('should handle authentication state changes', async () => {
      let authCallback: ((user: any) => void) | null = null

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback
        return jest.fn()
      })

      const TestComponent = () => {
        const { user, loading, isAuthenticated } = useAuth()
        return (
          <div>
            <div data-testid="loading">{loading.toString()}</div>
            <div data-testid="authenticated">{isAuthenticated.toString()}</div>
            <div data-testid="user-id">{user?.id || 'no-user'}</div>
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Simulate user sign in
      const firebaseUser = {
        uid: mockUser.id,
        email: mockUser.email,
        displayName: mockUser.displayName,
        photoURL: mockUser.photoURL,
        emailVerified: mockUser.emailVerified,
        metadata: {
          creationTime: mockUser.metadata.creationTime,
          lastSignInTime: mockUser.metadata.lastSignInTime
        },
        providerData: [{ providerId: 'google.com' }]
      }

      mockGetUserProfile.mockResolvedValue(mockProfile)

      act(() => {
        authCallback?.(firebaseUser)
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
      expect(screen.getByTestId('user-id')).toHaveTextContent(mockUser.id)
    })
  })

  describe('Authentication Methods', () => {
    let authContext: any

    const TestComponent = () => {
      authContext = useAuth()
      return <div>Test</div>
    }

    beforeEach(() => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )
    })

    it('should handle Google sign in successfully', async () => {
      mockSignInWithGoogle.mockResolvedValue(mockUser)
      mockGetUserProfile.mockResolvedValue(mockProfile)

      await act(async () => {
        await authContext.signInWithGoogle()
      })

      expect(mockSignInWithGoogle).toHaveBeenCalled()
      expect(mockGetUserProfile).toHaveBeenCalledWith(mockUser.id)
    })

    it('should handle Google sign in error', async () => {
      const error = new Error('auth/popup-blocked')
      mockSignInWithGoogle.mockRejectedValue(error)

      await act(async () => {
        try {
          await authContext.signInWithGoogle()
        } catch (e) {
          // Expected to throw
        }
      })

      expect(mockSignInWithGoogle).toHaveBeenCalled()
      expect(authContext.error).toBeTruthy()
    })

    it('should handle Kakao sign in with not implemented error', async () => {
      const error = new Error('kakao-not-implemented')
      mockSignInWithKakao.mockRejectedValue(error)

      await act(async () => {
        await authContext.signInWithKakao()
      })

      expect(mockSignInWithKakao).toHaveBeenCalled()
      expect(authContext.error).toBe('카카오 로그인은 곧 지원 예정입니다')
    })

    it('should handle Kakao sign in with general error', async () => {
      const error = new Error('some-other-error')
      mockSignInWithKakao.mockRejectedValue(error)

      await act(async () => {
        await authContext.signInWithKakao()
      })

      expect(mockSignInWithKakao).toHaveBeenCalled()
      expect(authContext.error).toBe('카카오 로그인에 실패했습니다')
    })

    it('should handle Naver sign in with not implemented error', async () => {
      const error = new Error('naver-not-implemented')
      mockSignInWithNaver.mockRejectedValue(error)

      await act(async () => {
        await authContext.signInWithNaver()
      })

      expect(mockSignInWithNaver).toHaveBeenCalled()
      expect(authContext.error).toBe('네이버 로그인은 곧 지원 예정입니다')
    })

    it('should handle email sign in', async () => {
      mockSignInWithEmail.mockResolvedValue(mockUser)
      mockGetUserProfile.mockResolvedValue(mockProfile)

      await act(async () => {
        await authContext.signInWithEmail('test@example.com', 'password123')
      })

      expect(mockSignInWithEmail).toHaveBeenCalledWith('test@example.com', 'password123')
    })

    it('should handle email sign up', async () => {
      mockSignUpWithEmail.mockResolvedValue(mockUser)
      mockGetUserProfile.mockResolvedValue(null)

      await act(async () => {
        await authContext.signUpWithEmail('test@example.com', 'password123', 'Test User')
      })

      expect(mockSignUpWithEmail).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User')
    })

    it('should handle sign out', async () => {
      mockSignOut.mockResolvedValue(undefined)

      await act(async () => {
        await authContext.signOut()
      })

      expect(mockSignOut).toHaveBeenCalled()
    })

    it('should handle profile update', async () => {
      mockUpdateUserProfile.mockResolvedValue(mockProfile)

      await act(async () => {
        await authContext.updateProfile(mockProfile)
      })

      expect(mockUpdateUserProfile).toHaveBeenCalledWith(undefined, mockProfile)
    })

    it('should clear error', () => {
      act(() => {
        authContext.clearError()
      })

      expect(authContext.error).toBeNull()
    })
  })

  describe('Reducer', () => {
    // Test the reducer logic by importing it directly would require exposing it
    // Instead, we test it through the provider's behavior
    it('should update state correctly through provider actions', async () => {
      const TestComponent = () => {
        const { user, loading, error, isAuthenticated } = useAuth()
        return (
          <div>
            <div data-testid="loading">{loading.toString()}</div>
            <div data-testid="error">{error || 'no-error'}</div>
            <div data-testid="authenticated">{isAuthenticated.toString()}</div>
            <div data-testid="user">{user ? user.id : 'no-user'}</div>
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Initial state
      expect(screen.getByTestId('loading')).toHaveTextContent('true')
      expect(screen.getByTestId('error')).toHaveTextContent('no-error')
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('user')).toHaveTextContent('no-user')
    })
  })

  describe('Error Handling', () => {
    it('should handle unknown error codes gracefully', async () => {
      const TestComponent = () => {
        const auth = useAuth()
        return (
          <div>
            <button
              onClick={async () => {
                try {
                  await auth.signInWithGoogle()
                } catch (e) {
                  // Expected
                }
              }}
            >
              Sign In
            </button>
            <div data-testid="error">{auth.error || 'no-error'}</div>
          </div>
        )
      }

      mockSignInWithGoogle.mockRejectedValue(new Error('unknown-error-code'))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const button = screen.getByText('Sign In')

      await act(async () => {
        button.click()
      })

      // Should show default error message
      expect(screen.getByTestId('error')).not.toHaveTextContent('no-error')
    })
  })
})