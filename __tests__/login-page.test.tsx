/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import LoginPage from '@/app/login/page'
import { useSignIn, useAuthError, useAuthLoading, useIsAuthenticated } from '@/lib/auth/hooks'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock auth hooks
jest.mock('@/lib/auth/hooks', () => ({
  useSignIn: jest.fn(),
  useAuthError: jest.fn(),
  useAuthLoading: jest.fn(),
  useIsAuthenticated: jest.fn(),
}))

// Mock UI components to avoid dependency issues in tests
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, className, onClick, disabled, ...props }: any) => (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
      {...props}
    >
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardDescription: ({ children, className, ...props }: any) => (
    <p className={className} data-testid="card-description" {...props}>
      {children}
    </p>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <h1 className={className} data-testid="card-title" {...props}>
      {children}
    </h1>
  ),
}))

describe('LoginPage', () => {
  // Mock functions
  const mockPush = jest.fn()
  const mockSignInWithGoogle = jest.fn()
  const mockSignInWithKakao = jest.fn()
  const mockSignInWithNaver = jest.fn()
  const mockClearError = jest.fn()

  const defaultMockUseRouter = {
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }

  const defaultMockUseSignIn = {
    signInWithGoogle: mockSignInWithGoogle,
    signInWithKakao: mockSignInWithKakao,
    signInWithNaver: mockSignInWithNaver,
    clearError: mockClearError,
  }

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    // Set up default mock implementations
    ;(useRouter as jest.Mock).mockReturnValue(defaultMockUseRouter)
    ;(useSignIn as jest.Mock).mockReturnValue(defaultMockUseSignIn)
    ;(useAuthError as jest.Mock).mockReturnValue(null)
    ;(useAuthLoading as jest.Mock).mockReturnValue(false)
    ;(useIsAuthenticated as jest.Mock).mockReturnValue(false)
  })

  describe('Initial Rendering', () => {
    it('renders the login page with all UI elements', () => {
      render(<LoginPage />)

      // Check main title and description
      expect(screen.getByText('SWING CONNECT')).toBeInTheDocument()
      expect(screen.getByText('스윙댄스 커뮤니티')).toBeInTheDocument()
      expect(screen.getByText('환영합니다!')).toBeInTheDocument()
      expect(screen.getByText('스윙댄스 동호회에 참여하세요')).toBeInTheDocument()

      // Check dance emojis
      expect(screen.getByText('🕺')).toBeInTheDocument()
      expect(screen.getByText('💫')).toBeInTheDocument()
      expect(screen.getByText('💃')).toBeInTheDocument()
    })

    it('renders all three social login buttons', () => {
      render(<LoginPage />)

      // Check Kakao button
      expect(screen.getByRole('button', { name: /카카오톡으로 로그인/i })).toBeInTheDocument()
      expect(screen.getByText('🟡')).toBeInTheDocument()

      // Check Naver button
      expect(screen.getByRole('button', { name: /네이버로 로그인/i })).toBeInTheDocument()
      expect(screen.getByText('🟢')).toBeInTheDocument()

      // Check Google button
      expect(screen.getByRole('button', { name: /구글로 로그인/i })).toBeInTheDocument()
      expect(screen.getByText('🔵')).toBeInTheDocument()
    })

    it('renders terms and privacy links', () => {
      render(<LoginPage />)

      expect(screen.getByText('서비스 이용약관')).toBeInTheDocument()
      expect(screen.getByText('개인정보처리방침')).toBeInTheDocument()
      expect(screen.getByText('|')).toBeInTheDocument()
    })

    it('has proper accessibility structure', () => {
      render(<LoginPage />)

      // Check semantic structure
      expect(screen.getByTestId('card')).toBeInTheDocument()
      expect(screen.getByTestId('card-header')).toBeInTheDocument()
      expect(screen.getByTestId('card-content')).toBeInTheDocument()
      expect(screen.getByTestId('card-title')).toBeInTheDocument()
      expect(screen.getByTestId('card-description')).toBeInTheDocument()

      // Check that buttons are properly labeled
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(3)
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName()
      })
    })
  })

  describe('Authentication Redirect', () => {
    it('redirects to home when user is already authenticated', () => {
      ;(useIsAuthenticated as jest.Mock).mockReturnValue(true)

      const { container } = render(<LoginPage />)

      expect(mockPush).toHaveBeenCalledWith('/home')
      expect(container.firstChild).toBeNull()
    })

    it('does not redirect when user is not authenticated', () => {
      ;(useIsAuthenticated as jest.Mock).mockReturnValue(false)

      render(<LoginPage />)

      expect(mockPush).not.toHaveBeenCalled()
      expect(screen.getByText('SWING CONNECT')).toBeInTheDocument()
    })
  })

  describe('Social Login Interactions', () => {
    describe('Kakao Login', () => {
      it('calls signInWithKakao when Kakao button is clicked', async () => {
        const user = userEvent.setup()
        render(<LoginPage />)

        const kakaoButton = screen.getByRole('button', { name: /카카오톡으로 로그인/i })
        await user.click(kakaoButton)

        expect(mockClearError).toHaveBeenCalledTimes(1)
        expect(mockSignInWithKakao).toHaveBeenCalledTimes(1)
      })

      it('shows loading state for Kakao button during authentication', async () => {
        ;(useAuthLoading as jest.Mock).mockReturnValue(true)

        // Mock that Kakao is the active provider
        const user = userEvent.setup()
        render(<LoginPage />)

        const kakaoButton = screen.getByRole('button', { name: /카카오톡으로 로그인/i })
        await user.click(kakaoButton)

        // Re-render with loading state
        ;(useAuthLoading as jest.Mock).mockReturnValue(true)
        render(<LoginPage />)

        expect(screen.getByText('로그인 중...')).toBeInTheDocument()
        expect(screen.getByText('⏳')).toBeInTheDocument()
      })
    })

    describe('Naver Login', () => {
      it('calls signInWithNaver when Naver button is clicked', async () => {
        const user = userEvent.setup()
        render(<LoginPage />)

        const naverButton = screen.getByRole('button', { name: /네이버로 로그인/i })
        await user.click(naverButton)

        expect(mockClearError).toHaveBeenCalledTimes(1)
        expect(mockSignInWithNaver).toHaveBeenCalledTimes(1)
      })

      it('shows loading state for Naver button during authentication', async () => {
        let activeProvider: string | null = null

        // Mock the component's internal state by intercepting the sign-in call
        mockSignInWithNaver.mockImplementation(async () => {
          activeProvider = 'naver'
          // Simulate loading state
          ;(useAuthLoading as jest.Mock).mockReturnValue(true)
        })

        const user = userEvent.setup()
        const { rerender } = render(<LoginPage />)

        const naverButton = screen.getByRole('button', { name: /네이버로 로그인/i })
        await user.click(naverButton)

        // Simulate component re-render with loading state
        ;(useAuthLoading as jest.Mock).mockReturnValue(true)
        rerender(<LoginPage />)

        expect(screen.getByText('로그인 중...')).toBeInTheDocument()
      })
    })

    describe('Google Login', () => {
      it('calls signInWithGoogle when Google button is clicked', async () => {
        const user = userEvent.setup()
        render(<LoginPage />)

        const googleButton = screen.getByRole('button', { name: /구글로 로그인/i })
        await user.click(googleButton)

        expect(mockClearError).toHaveBeenCalledTimes(1)
        expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1)
      })

      it('shows loading state for Google button during authentication', async () => {
        const user = userEvent.setup()
        const { rerender } = render(<LoginPage />)

        const googleButton = screen.getByRole('button', { name: /구글로 로그인/i })
        await user.click(googleButton)

        // Simulate loading state
        ;(useAuthLoading as jest.Mock).mockReturnValue(true)
        rerender(<LoginPage />)

        expect(screen.getByText('로그인 중...')).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('disables all buttons when loading', () => {
      ;(useAuthLoading as jest.Mock).mockReturnValue(true)
      render(<LoginPage />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })

    it('enables buttons when not loading', () => {
      ;(useAuthLoading as jest.Mock).mockReturnValue(false)
      render(<LoginPage />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).not.toBeDisabled()
      })
    })

    it('shows spinner animation during loading', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<LoginPage />)

      // Click a button to trigger loading
      const kakaoButton = screen.getByRole('button', { name: /카카오톡으로 로그인/i })
      await user.click(kakaoButton)

      // Simulate loading state
      ;(useAuthLoading as jest.Mock).mockReturnValue(true)
      rerender(<LoginPage />)

      const spinner = screen.getByText('⏳')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('animate-spin')
    })
  })

  describe('Error Handling', () => {
    it('displays error message when authentication fails', () => {
      const errorMessage = '로그인에 실패했습니다. 다시 시도해주세요.'
      ;(useAuthError as jest.Mock).mockReturnValue(errorMessage)

      render(<LoginPage />)

      const errorElement = screen.getByText(errorMessage)
      expect(errorElement).toBeInTheDocument()
      expect(errorElement).toHaveClass('text-red-600')
      expect(errorElement.parentElement).toHaveClass('bg-red-50')
    })

    it('does not display error message when there is no error', () => {
      ;(useAuthError as jest.Mock).mockReturnValue(null)

      render(<LoginPage />)

      // Check that no error styling is present
      expect(screen.queryByText(/실패/)).not.toBeInTheDocument()
      expect(document.querySelector('.bg-red-50')).not.toBeInTheDocument()
    })

    it('clears error when attempting new login', async () => {
      const user = userEvent.setup()
      ;(useAuthError as jest.Mock).mockReturnValue('Previous error')

      render(<LoginPage />)

      const kakaoButton = screen.getByRole('button', { name: /카카오톡으로 로그인/i })
      await user.click(kakaoButton)

      expect(mockClearError).toHaveBeenCalledTimes(1)
    })
  })

  describe('Successful Authentication Flow', () => {
    it('redirects to home page after successful Google login', async () => {
      const user = userEvent.setup()
      mockSignInWithGoogle.mockResolvedValue(undefined)

      render(<LoginPage />)

      const googleButton = screen.getByRole('button', { name: /구글로 로그인/i })
      await user.click(googleButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/home')
      })
    })

    it('redirects to home page after successful Kakao login', async () => {
      const user = userEvent.setup()
      mockSignInWithKakao.mockResolvedValue(undefined)

      render(<LoginPage />)

      const kakaoButton = screen.getByRole('button', { name: /카카오톡으로 로그인/i })
      await user.click(kakaoButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/home')
      })
    })

    it('redirects to home page after successful Naver login', async () => {
      const user = userEvent.setup()
      mockSignInWithNaver.mockResolvedValue(undefined)

      render(<LoginPage />)

      const naverButton = screen.getByRole('button', { name: /네이버로 로그인/i })
      await user.click(naverButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/home')
      })
    })
  })

  describe('Failed Authentication Flow', () => {
    it('handles login failure gracefully and logs error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const loginError = new Error('Authentication failed')
      mockSignInWithGoogle.mockRejectedValue(loginError)

      const user = userEvent.setup()
      render(<LoginPage />)

      const googleButton = screen.getByRole('button', { name: /구글로 로그인/i })
      await user.click(googleButton)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Login error:', loginError)
      })

      // Should not redirect on failure
      expect(mockPush).not.toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('resets active provider state after failed login', async () => {
      const loginError = new Error('Authentication failed')
      mockSignInWithKakao.mockRejectedValue(loginError)

      const user = userEvent.setup()
      render(<LoginPage />)

      const kakaoButton = screen.getByRole('button', { name: /카카오톡으로 로그인/i })
      await user.click(kakaoButton)

      // Wait for error handling
      await waitFor(() => {
        expect(mockSignInWithKakao).toHaveBeenCalled()
      })

      // Component should reset loading state (this is handled by the finally block)
      expect(screen.getByRole('button', { name: /카카오톡으로 로그인/i })).not.toBeDisabled()
    })
  })

  describe('Korean Language Content', () => {
    it('displays all Korean text correctly', () => {
      render(<LoginPage />)

      // Main Korean texts
      expect(screen.getByText('스윙댄스 커뮤니티')).toBeInTheDocument()
      expect(screen.getByText('환영합니다!')).toBeInTheDocument()
      expect(screen.getByText('스윙댄스 동호회에 참여하세요')).toBeInTheDocument()

      // Button texts
      expect(screen.getByText('카카오톡으로 로그인')).toBeInTheDocument()
      expect(screen.getByText('네이버로 로그인')).toBeInTheDocument()
      expect(screen.getByText('구글로 로그인')).toBeInTheDocument()

      // Footer texts
      expect(screen.getByText('서비스 이용약관')).toBeInTheDocument()
      expect(screen.getByText('개인정보처리방침')).toBeInTheDocument()
    })

    it('displays Korean loading text during authentication', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<LoginPage />)

      const kakaoButton = screen.getByRole('button', { name: /카카오톡으로 로그인/i })
      await user.click(kakaoButton)

      // Simulate loading state
      ;(useAuthLoading as jest.Mock).mockReturnValue(true)
      rerender(<LoginPage />)

      expect(screen.getByText('로그인 중...')).toBeInTheDocument()
    })
  })

  describe('UI Styling and Visual Elements', () => {
    it('applies correct CSS classes to main container', () => {
      render(<LoginPage />)

      const mainDiv = document.querySelector('.min-h-screen')
      expect(mainDiv).toHaveClass('bg-gradient-to-br', 'from-blue-50', 'via-indigo-50', 'to-purple-50')

      const containerDiv = document.querySelector('.container')
      expect(containerDiv).toHaveClass('mx-auto', 'px-4', 'py-8', 'flex', 'items-center', 'justify-center', 'min-h-screen')
    })

    it('applies correct styling to social login buttons', () => {
      render(<LoginPage />)

      // Kakao button styling
      const kakaoButton = screen.getByRole('button', { name: /카카오톡으로 로그인/i })
      expect(kakaoButton).toHaveClass('bg-yellow-300', 'hover:bg-yellow-400', 'text-black')

      // Naver button styling
      const naverButton = screen.getByRole('button', { name: /네이버로 로그인/i })
      expect(naverButton).toHaveClass('bg-green-500', 'hover:bg-green-600', 'text-white')

      // Google button styling
      const googleButton = screen.getByRole('button', { name: /구글로 로그인/i })
      expect(googleButton).toHaveClass('bg-blue-500', 'hover:bg-blue-600', 'text-white')
    })

    it('shows proper disabled styling when loading', () => {
      ;(useAuthLoading as jest.Mock).mockReturnValue(true)
      render(<LoginPage />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('disabled:opacity-50')
        expect(button).toBeDisabled()
      })
    })
  })

  describe('Interaction Patterns', () => {
    it('prevents multiple simultaneous login attempts', async () => {
      const user = userEvent.setup()
      ;(useAuthLoading as jest.Mock).mockReturnValue(true)
      render(<LoginPage />)

      const buttons = screen.getAllByRole('button')

      // All buttons should be disabled during loading
      buttons.forEach(button => {
        expect(button).toBeDisabled()
      })

      // Try to click disabled buttons
      await user.click(buttons[0])
      await user.click(buttons[1])
      await user.click(buttons[2])

      // Sign-in functions should not be called since buttons are disabled
      expect(mockSignInWithKakao).not.toHaveBeenCalled()
      expect(mockSignInWithNaver).not.toHaveBeenCalled()
      expect(mockSignInWithGoogle).not.toHaveBeenCalled()
    })

    it('handles rapid button clicks gracefully', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const googleButton = screen.getByRole('button', { name: /구글로 로그인/i })

      // Rapid clicks
      await user.click(googleButton)
      await user.click(googleButton)
      await user.click(googleButton)

      // Should still only call sign-in once per click
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(3)
      expect(mockClearError).toHaveBeenCalledTimes(3)
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined error gracefully', () => {
      ;(useAuthError as jest.Mock).mockReturnValue(undefined)

      expect(() => render(<LoginPage />)).not.toThrow()
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    })

    it('handles empty error string', () => {
      ;(useAuthError as jest.Mock).mockReturnValue('')

      render(<LoginPage />)
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    })

    it('handles hook errors gracefully', () => {
      // Mock hooks to throw errors
      ;(useIsAuthenticated as jest.Mock).mockImplementation(() => {
        throw new Error('Hook error')
      })

      expect(() => render(<LoginPage />)).toThrow('Hook error')
    })
  })
})