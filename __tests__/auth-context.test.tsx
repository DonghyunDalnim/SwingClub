/**
 * Comprehensive tests for AuthProvider context and authentication state management
 */

import React, { ReactNode } from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { onAuthStateChanged } from 'firebase/auth'
import { AuthProvider, useAuth } from '../lib/auth/context'
import {
  signInWithGoogle,
  signInWithKakao,
  signInWithNaver,
  signInWithEmail,
  signUpWithEmail,
  signOut as authSignOut,
  updateUserProfile,
  getUserProfile
} from '../lib/auth/providers'
import { AUTH_ERROR_MESSAGES } from '../lib/types/auth'

// Mock all auth providers
jest.mock('../lib/auth/providers', () => ({
  signInWithGoogle: jest.fn(),
  signInWithKakao: jest.fn(),
  signInWithNaver: jest.fn(),
  signInWithEmail: jest.fn(),
  signUpWithEmail: jest.fn(),
  signOut: jest.fn(),
  updateUserProfile: jest.fn(),
  getUserProfile: jest.fn(),
}))

// Mock Firebase auth
jest.mock('firebase/auth')

const mockedOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>
const mockedSignInWithGoogle = signInWithGoogle as jest.MockedFunction<typeof signInWithGoogle>
const mockedSignInWithKakao = signInWithKakao as jest.MockedFunction<typeof signInWithKakao>
const mockedSignInWithNaver = signInWithNaver as jest.MockedFunction<typeof signInWithNaver>
const mockedSignInWithEmail = signInWithEmail as jest.MockedFunction<typeof signInWithEmail>
const mockedSignUpWithEmail = signUpWithEmail as jest.MockedFunction<typeof signUpWithEmail>
const mockedAuthSignOut = authSignOut as jest.MockedFunction<typeof authSignOut>
const mockedUpdateUserProfile = updateUserProfile as jest.MockedFunction<typeof updateUserProfile>
const mockedGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>

// Test component that uses useAuth hook
const TestComponent: React.FC = () => {
  const auth = useAuth()
  return (
    <div>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <div data-testid="authenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="user-id">{auth.user?.id || 'null'}</div>
      <div data-testid="user-email">{auth.user?.email || 'null'}</div>
      <div data-testid="error">{auth.error || 'null'}</div>
      <div data-testid="profile-nickname">{auth.user?.profile?.nickname || 'null'}</div>
      <button data-testid="google-signin" onClick={auth.signInWithGoogle}>
        Google Sign In
      </button>
      <button data-testid="kakao-signin" onClick={auth.signInWithKakao}>
        Kakao Sign In
      </button>
      <button data-testid="naver-signin" onClick={auth.signInWithNaver}>
        Naver Sign In
      </button>
      <button data-testid="email-signin" onClick={() => auth.signInWithEmail('test@test.com', 'password')}>
        Email Sign In
      </button>
      <button data-testid="signup" onClick={() => auth.signUp('test@test.com', 'password', { nickname: 'test' })}>
        Sign Up
      </button>
      <button data-testid="signout" onClick={auth.signOut}>
        Sign Out
      </button>
      <button data-testid="update-profile" onClick={() => auth.updateProfile({ nickname: 'updated' })}>
        Update Profile
      </button>
      <button data-testid="clear-error" onClick={auth.clearError}>
        Clear Error
      </button>
    </div>
  )
}

// Helper to render component with AuthProvider
const renderWithProvider = (children: ReactNode) => {
  return render(<AuthProvider>{children}</AuthProvider>)
}

describe('AuthProvider Context', () => {
  let mockUnsubscribe: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockUnsubscribe = jest.fn()
    mockedOnAuthStateChanged.mockReturnValue(mockUnsubscribe)
    mockedGetUserProfile.mockResolvedValue(null)
  })

  describe('Initial State', () => {
    it('should provide initial auth state', () => {
      renderWithProvider(<TestComponent />)

      expect(screen.getByTestId('loading')).toHaveTextContent('true')
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('user-id')).toHaveTextContent('null')
      expect(screen.getByTestId('error')).toHaveTextContent('null')
    })

    it('should set up Firebase auth state listener', () => {
      renderWithProvider(<TestComponent />)

      expect(mockedOnAuthStateChanged).toHaveBeenCalledWith(
        expect.anything(), // auth instance
        expect.any(Function)
      )
    })

    it('should cleanup Firebase listener on unmount', () => {
      const { unmount } = renderWithProvider(<TestComponent />)

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('Authentication State Changes', () => {
    it('should handle successful Firebase user authentication', async () => {
      let authCallback: ((user: any) => void) | null = null
      mockedOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          authCallback = callback
        }
        return mockUnsubscribe
      })

      const mockProfile = {
        nickname: 'TestUser',
        danceLevel: 'intermediate' as const,
        location: 'Seoul',
        interests: ['salsa']
      }
      mockedGetUserProfile.mockResolvedValue(mockProfile)

      renderWithProvider(<TestComponent />)

      // Simulate Firebase user authentication
      await act(async () => {
        authCallback?.((global as any).mockFirebaseUser)
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
        expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id')
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
        expect(screen.getByTestId('profile-nickname')).toHaveTextContent('TestUser')
      })
    })

    it('should handle Firebase user sign out', async () => {
      let authCallback: ((user: any) => void) | null = null
      mockedOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          authCallback = callback
        }
        return mockUnsubscribe
      })

      renderWithProvider(<TestComponent />)

      // Simulate sign out
      await act(async () => {
        authCallback?.(null)
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
        expect(screen.getByTestId('user-id')).toHaveTextContent('null')
      })
    })

    it('should handle profile fetch error during Firebase auth', async () => {
      let authCallback: ((user: any) => void) | null = null
      mockedOnAuthStateChanged.mockImplementation((auth, callback) => {
        if (typeof callback === 'function') {
          authCallback = callback
        }
        return mockUnsubscribe
      })

      mockedGetUserProfile.mockRejectedValue(new Error('Profile fetch failed'))

      renderWithProvider(<TestComponent />)

      await act(async () => {
        authCallback?.((global as any).mockFirebaseUser)
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('사용자 정보를 불러오는데 실패했습니다')
      })
    })
  })

  describe('Authentication Actions', () => {
    describe('Google Sign In', () => {
      it('should handle successful Google sign in', async () => {
        const mockUserWithProfile = { ...(global as any).mockUser }
        mockedSignInWithGoogle.mockResolvedValue(mockUserWithProfile)
        mockedGetUserProfile.mockResolvedValue(mockUserWithProfile.profile)

        renderWithProvider(<TestComponent />)

        await act(async () => {
          screen.getByTestId('google-signin').click()
        })

        await waitFor(() => {
          expect(mockedSignInWithGoogle).toHaveBeenCalled()
          expect(screen.getByTestId('loading')).toHaveTextContent('false')
          expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
        })
      })

      it('should handle Google sign in error', async () => {
        mockedSignInWithGoogle.mockRejectedValue(new Error('google-signin-failed'))

        renderWithProvider(<TestComponent />)

        await act(async () => {
          screen.getByTestId('google-signin').click()
        })

        await waitFor(() => {
          expect(screen.getByTestId('loading')).toHaveTextContent('false')
          expect(screen.getByTestId('error')).toHaveTextContent(AUTH_ERROR_MESSAGES['provider-error'])
        })
      })
    })

    describe('Kakao Sign In', () => {
      it('should show not implemented message for Kakao', async () => {
        mockedSignInWithKakao.mockRejectedValue(new Error('kakao-not-implemented'))

        renderWithProvider(<TestComponent />)

        await act(async () => {
          screen.getByTestId('kakao-signin').click()
        })

        await waitFor(() => {
          expect(screen.getByTestId('error')).toHaveTextContent('카카오 로그인은 곧 지원 예정입니다')
        })
      })

      it('should handle generic Kakao error', async () => {
        mockedSignInWithKakao.mockRejectedValue(new Error('kakao-generic-error'))

        renderWithProvider(<TestComponent />)

        await act(async () => {
          screen.getByTestId('kakao-signin').click()
        })

        await waitFor(() => {
          expect(screen.getByTestId('error')).toHaveTextContent('카카오 로그인에 실패했습니다')
        })
      })
    })

    describe('Naver Sign In', () => {
      it('should show not implemented message for Naver', async () => {
        mockedSignInWithNaver.mockRejectedValue(new Error('naver-not-implemented'))

        renderWithProvider(<TestComponent />)

        await act(async () => {
          screen.getByTestId('naver-signin').click()
        })

        await waitFor(() => {
          expect(screen.getByTestId('error')).toHaveTextContent('네이버 로그인은 곧 지원 예정입니다')
        })
      })

      it('should handle generic Naver error', async () => {
        mockedSignInWithNaver.mockRejectedValue(new Error('naver-generic-error'))

        renderWithProvider(<TestComponent />)

        await act(async () => {
          screen.getByTestId('naver-signin').click()
        })

        await waitFor(() => {
          expect(screen.getByTestId('error')).toHaveTextContent('네이버 로그인에 실패했습니다')
        })
      })
    })

    describe('Email Sign In', () => {
      it('should handle successful email sign in', async () => {
        mockedSignInWithEmail.mockResolvedValue((global as any).mockUser)
        mockedGetUserProfile.mockResolvedValue((global as any).mockUser.profile)

        renderWithProvider(<TestComponent />)

        await act(async () => {
          screen.getByTestId('email-signin').click()
        })

        await waitFor(() => {
          expect(mockedSignInWithEmail).toHaveBeenCalledWith('test@test.com', 'password')
          expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
        })
      })

      it('should handle email sign in error', async () => {
        mockedSignInWithEmail.mockRejectedValue(new Error('invalid-credentials'))

        renderWithProvider(<TestComponent />)

        await act(async () => {
          screen.getByTestId('email-signin').click()
        })

        await waitFor(() => {
          expect(screen.getByTestId('error')).toHaveTextContent(AUTH_ERROR_MESSAGES['invalid-credentials'])
        })
      })
    })

    describe('Sign Up', () => {
      it('should handle successful sign up', async () => {
        mockedSignUpWithEmail.mockResolvedValue((global as any).mockUser)
        mockedGetUserProfile.mockResolvedValue((global as any).mockUser.profile)

        renderWithProvider(<TestComponent />)

        await act(async () => {
          screen.getByTestId('signup').click()
        })

        await waitFor(() => {
          expect(mockedSignUpWithEmail).toHaveBeenCalledWith('test@test.com', 'password', { nickname: 'test' })
          expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
        })
      })

      it('should handle sign up error', async () => {
        mockedSignUpWithEmail.mockRejectedValue(new Error('email-already-in-use'))

        renderWithProvider(<TestComponent />)

        await act(async () => {
          screen.getByTestId('signup').click()
        })

        await waitFor(() => {
          expect(screen.getByTestId('error')).toHaveTextContent(AUTH_ERROR_MESSAGES['email-already-in-use'])
        })
      })
    })

    describe('Sign Out', () => {
      it('should handle successful sign out', async () => {
        mockedAuthSignOut.mockResolvedValue()

        renderWithProvider(<TestComponent />)

        await act(async () => {
          screen.getByTestId('signout').click()
        })

        await waitFor(() => {
          expect(mockedAuthSignOut).toHaveBeenCalled()
          expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
          expect(screen.getByTestId('user-id')).toHaveTextContent('null')
        })
      })

      it('should handle sign out error', async () => {
        mockedAuthSignOut.mockRejectedValue(new Error('signout-failed'))

        renderWithProvider(<TestComponent />)

        await act(async () => {
          screen.getByTestId('signout').click()
        })

        await waitFor(() => {
          expect(screen.getByTestId('error')).toHaveTextContent(AUTH_ERROR_MESSAGES['provider-error'])
        })
      })
    })

    describe('Update Profile', () => {
      it('should handle successful profile update when user is authenticated', async () => {
        // First set up authenticated user
        const authCallback = jest.fn()
        mockedOnAuthStateChanged.mockImplementation((auth, callback) => {
          authCallback.mockImplementation(callback)
          return mockUnsubscribe
        })

        mockedGetUserProfile.mockResolvedValue((global as any).mockUser.profile)
        mockedUpdateUserProfile.mockResolvedValue()

        renderWithProvider(<TestComponent />)

        // Authenticate user first
        await act(async () => {
          authCallback?.((global as any).mockFirebaseUser)
        })

        // Update profile
        await act(async () => {
          screen.getByTestId('update-profile').click()
        })

        await waitFor(() => {
          expect(mockedUpdateUserProfile).toHaveBeenCalledWith('test-user-id', { nickname: 'updated' })
        })
      })

      it('should not update profile when user is not authenticated', async () => {
        renderWithProvider(<TestComponent />)

        await act(async () => {
          screen.getByTestId('update-profile').click()
        })

        expect(mockedUpdateUserProfile).not.toHaveBeenCalled()
      })

      it('should handle profile update error', async () => {
        // Set up authenticated user
        const authCallback = jest.fn()
        mockedOnAuthStateChanged.mockImplementation((auth, callback) => {
          authCallback.mockImplementation(callback)
          return mockUnsubscribe
        })

        mockedGetUserProfile.mockResolvedValue((global as any).mockUser.profile)
        mockedUpdateUserProfile.mockRejectedValue(new Error('profile-update-failed'))

        renderWithProvider(<TestComponent />)

        await act(async () => {
          authCallback?.((global as any).mockFirebaseUser)
        })

        await act(async () => {
          screen.getByTestId('update-profile').click()
        })

        await waitFor(() => {
          expect(screen.getByTestId('error')).toHaveTextContent(AUTH_ERROR_MESSAGES['provider-error'])
        })
      })
    })

    describe('Clear Error', () => {
      it('should clear error state', async () => {
        mockedSignInWithGoogle.mockRejectedValue(new Error('test-error'))

        renderWithProvider(<TestComponent />)

        // Trigger an error
        await act(async () => {
          screen.getByTestId('google-signin').click()
        })

        await waitFor(() => {
          expect(screen.getByTestId('error')).not.toHaveTextContent('null')
        })

        // Clear the error
        await act(async () => {
          screen.getByTestId('clear-error').click()
        })

        expect(screen.getByTestId('error')).toHaveTextContent('null')
      })
    })
  })

  describe('Error Handling', () => {
    it('should map Firebase error codes to Korean messages', async () => {
      mockedSignInWithEmail.mockRejectedValue(new Error('auth/user-not-found'))

      renderWithProvider(<TestComponent />)

      await act(async () => {
        screen.getByTestId('email-signin').click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(AUTH_ERROR_MESSAGES['provider-error'])
      })
    })

    it('should use default error message for unknown errors', async () => {
      mockedSignInWithGoogle.mockRejectedValue(new Error('unknown-error'))

      renderWithProvider(<TestComponent />)

      await act(async () => {
        screen.getByTestId('google-signin').click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(AUTH_ERROR_MESSAGES['provider-error'])
      })
    })
  })

  describe('Context Provider Error', () => {
    it('should throw error when useAuth is used outside of AuthProvider', () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAuth must be used within an AuthProvider')

      consoleSpy.mockRestore()
    })
  })
})