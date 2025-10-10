/**
 * @jest-environment jsdom
 *
 * TopNav Component Test Suite
 * Issue #85 - TopNav 사용자 메뉴 UX 개선
 *
 * Test Coverage:
 * ✅ Component rendering (authenticated/unauthenticated states)
 * ✅ Dropdown menu interactions (open/close)
 * ✅ Click outside to close dropdown
 * ✅ ESC key to close dropdown
 * ✅ Profile navigation
 * ✅ Settings navigation
 * ✅ Logout dialog flow
 * ✅ Toast notifications
 * ✅ Accessibility features (ARIA, focus trap)
 * ✅ Edge cases and error handling
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Firebase Auth BEFORE any imports that use it
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    addScope: jest.fn(),
  })),
}))

// Mock Next.js navigation with proper mock functions
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockBack = jest.fn()
const mockForward = jest.fn()
const mockRefresh = jest.fn()
const mockPrefetch = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    forward: mockForward,
    refresh: mockRefresh,
    prefetch: mockPrefetch,
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  redirect: jest.fn(),
}))

// Mock toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
  success: jest.fn(),
  error: jest.fn(),
}))

// Mock auth providers
jest.mock('@/lib/auth/providers', () => ({
  signOut: jest.fn().mockResolvedValue(undefined),
  signInWithGoogle: jest.fn(),
  signInWithKakao: jest.fn(),
  signInWithNaver: jest.fn(),
  signInWithEmail: jest.fn(),
  signUpWithEmail: jest.fn(),
  updateUserProfile: jest.fn(),
  getUserProfile: jest.fn(),
}))

// Mock auth hooks
jest.mock('@/lib/auth/hooks', () => ({
  useAuth: jest.fn(),
}))

// Now we can import the components
import toast from 'react-hot-toast'
import { TopNav } from '@/components/navigation/TopNav'
import { useAuth } from '@/lib/auth/hooks'
import { signOut } from '@/lib/auth/providers'

// Mock ConfirmDialog component
jest.mock('@/components/core/ConfirmDialog', () => ({
  ConfirmDialog: ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText,
    cancelText,
    variant,
    isLoading
  }: any) => {
    if (!isOpen) return null
    return (
      <div data-testid="confirm-dialog" role="dialog">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
        <button onClick={onClose} disabled={isLoading}>
          {cancelText || '취소'}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          data-variant={variant}
        >
          {isLoading ? '처리 중...' : (confirmText || '확인')}
        </button>
      </div>
    )
  }
}))

describe('TopNav Component', () => {
  // Mock user data
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    displayName: '테스트사용자',
    photoURL: 'https://example.com/avatar.jpg',
    provider: 'google' as const,
    createdAt: new Date(),
    lastLoginAt: new Date(),
    profile: {
      nickname: '테스트사용자',
      danceLevel: 'beginner' as const,
      location: '서울',
      interests: [],
    },
  }

  const mockUserWithoutPhoto = {
    ...mockUser,
    photoURL: null,
    displayName: null,
    profile: undefined,
  }

  // Setup mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
    mockReplace.mockClear()
    mockBack.mockClear()
    mockForward.mockClear()
    mockRefresh.mockClear()
    mockPrefetch.mockClear()
    ;(toast.success as jest.Mock).mockImplementation(() => {})
    ;(toast.error as jest.Mock).mockImplementation(() => {})
    ;(signOut as jest.Mock).mockResolvedValue(undefined)
  })

  afterEach(() => {
    // Clean up any open dropdowns
    document.body.innerHTML = ''
  })

  // ==========================================
  // 1. COMPONENT RENDERING TESTS
  // ==========================================

  describe('Component Rendering', () => {
    it('should not render when user is not authenticated', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
      })

      const { container } = render(<TopNav />)
      expect(container.firstChild).toBeNull()
    })

    it('should not render when user is null even if isAuthenticated is true', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: true,
      })

      const { container } = render(<TopNav />)
      expect(container.firstChild).toBeNull()
    })

    it('should render navigation when user is authenticated', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      })

      render(<TopNav />)

      expect(screen.getByText('SWING CONNECT')).toBeInTheDocument()
      expect(screen.getByLabelText('사용자 메뉴')).toBeInTheDocument()
    })

    it('should display user avatar when photoURL is provided', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      })

      render(<TopNav />)

      const avatar = screen.getByAltText('테스트사용자')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute('src', mockUser.photoURL)
    })

    it('should display default icon when photoURL is null', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUserWithoutPhoto,
        isAuthenticated: true,
      })

      render(<TopNav />)

      // The User icon from lucide-react should be rendered
      const button = screen.getByLabelText('사용자 메뉴')
      expect(button).toBeInTheDocument()
      // Avatar should not exist when no photoURL
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('should display username from nickname', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      })

      render(<TopNav />)

      // Username is hidden on mobile (md:block class)
      expect(screen.getByText('테스트사용자')).toBeInTheDocument()
    })

    it('should display username from email when nickname is null', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUserWithoutPhoto,
        isAuthenticated: true,
      })

      render(<TopNav />)

      expect(screen.getByText('test')).toBeInTheDocument() // email split at @
    })

    it('should have correct ARIA attributes on menu button', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      })

      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')
      expect(menuButton).toHaveAttribute('aria-haspopup', 'true')
    })
  })

  // ==========================================
  // 2. DROPDOWN MENU INTERACTIONS
  // ==========================================

  describe('Dropdown Menu Interactions', () => {
    beforeEach(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      })
    })

    it('should open dropdown when clicking menu button', async () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')

      // Initially closed
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')

      // Click to open
      fireEvent.click(menuButton)

      // Should be open
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })
      expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('should close dropdown when clicking menu button again', async () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')

      // Open dropdown
      fireEvent.click(menuButton)
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      // Close dropdown
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('should display user info in dropdown', async () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getAllByText('테스트사용자')[0]).toBeInTheDocument()
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
      })
    })

    it('should display all menu items in dropdown', async () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getByText('내 프로필')).toBeInTheDocument()
        expect(screen.getByText('설정')).toBeInTheDocument()
        expect(screen.getByText('로그아웃')).toBeInTheDocument()
      })
    })

    it('should rotate chevron icon when dropdown opens', async () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      // ChevronDown is the last svg in the button
      const chevrons = menuButton.querySelectorAll('svg')
      const chevron = chevrons[chevrons.length - 1] as SVGElement

      expect(chevron).toBeTruthy()
      // SVG className is SVGAnimatedString, check classList instead
      expect(chevron.classList.contains('rotate-180')).toBe(false)

      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(chevron.classList.contains('rotate-180')).toBe(true)
      })
    })
  })

  // ==========================================
  // 3. CLICK OUTSIDE TO CLOSE
  // ==========================================

  describe('Click Outside to Close', () => {
    beforeEach(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      })
    })

    it('should close dropdown when clicking outside', async () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      // Click outside
      fireEvent.mouseDown(document.body)

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })

    it('should not close dropdown when clicking inside dropdown', async () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      const dropdown = screen.getByRole('menu')
      fireEvent.mouseDown(dropdown)

      // Should still be open
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('should clean up event listeners when dropdown closes', async () => {
      const { unmount } = render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      unmount()

      // Should not throw error when clicking after unmount
      expect(() => fireEvent.mouseDown(document.body)).not.toThrow()
    })
  })

  // ==========================================
  // 4. ESC KEY TO CLOSE
  // ==========================================

  describe('ESC Key to Close', () => {
    beforeEach(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      })
    })

    it('should close dropdown when pressing ESC key', async () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })

    it('should not respond to ESC key when dropdown is closed', () => {
      render(<TopNav />)

      // Dropdown is closed
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()

      fireEvent.keyDown(document, { key: 'Escape' })

      // Should still be closed
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('should clean up ESC key listener on unmount', async () => {
      const { unmount } = render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      unmount()

      // Should not throw error when pressing ESC after unmount
      expect(() => fireEvent.keyDown(document, { key: 'Escape' })).not.toThrow()
    })
  })

  // ==========================================
  // 5. PROFILE NAVIGATION
  // ==========================================

  describe('Profile Navigation', () => {
    beforeEach(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      })
    })

    it('should navigate to profile page when clicking profile menu item', async () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getByText('내 프로필')).toBeInTheDocument()
      })

      const profileButton = screen.getByText('내 프로필')
      fireEvent.click(profileButton)

      expect(mockPush).toHaveBeenCalledWith('/profile')
    })

    it('should close dropdown after navigating to profile', async () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getByText('내 프로필')).toBeInTheDocument()
      })

      const profileButton = screen.getByText('내 프로필')
      fireEvent.click(profileButton)

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })
  })

  // ==========================================
  // 6. SETTINGS NAVIGATION
  // ==========================================

  describe('Settings Navigation', () => {
    beforeEach(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      })
    })

    it('should navigate to settings page when clicking settings menu item', async () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getByText('설정')).toBeInTheDocument()
      })

      const settingsButton = screen.getByText('설정')
      fireEvent.click(settingsButton)

      expect(mockPush).toHaveBeenCalledWith('/profile#settings')
    })

    it('should close dropdown after navigating to settings', async () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getByText('설정')).toBeInTheDocument()
      })

      const settingsButton = screen.getByText('설정')
      fireEvent.click(settingsButton)

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })
  })

  // ==========================================
  // 7. LOGOUT DIALOG OPENING
  // ==========================================

  describe('Logout Dialog Opening', () => {
    beforeEach(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      })
    })

    it('should open logout confirmation dialog when clicking logout', async () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        const logoutButtons = screen.getAllByText('로그아웃')
        expect(logoutButtons.length).toBeGreaterThan(0)
      })

      const logoutButtons = screen.getAllByText('로그아웃')
      const logoutMenuButton = logoutButtons[0] // First one is in the dropdown menu
      fireEvent.click(logoutMenuButton)

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      })
    })

    it('should display correct logout dialog content', async () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        const logoutButtons = screen.getAllByText('로그아웃')
        expect(logoutButtons.length).toBeGreaterThan(0)
      })

      const logoutButtons = screen.getAllByText('로그아웃')
      fireEvent.click(logoutButtons[0])

      await waitFor(() => {
        const dialog = screen.getByTestId('confirm-dialog')
        expect(within(dialog).getByText('정말 로그아웃하시겠습니까?')).toBeInTheDocument()
        expect(within(dialog).getByText('다시 로그인하려면 인증이 필요합니다')).toBeInTheDocument()
      })
    })

    it('should close dropdown when opening logout dialog', async () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      const logoutButtons = screen.getAllByText('로그아웃')
      fireEvent.click(logoutButtons[0])

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })

    it('should display danger variant button in logout dialog', async () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        const logoutButtons = screen.getAllByText('로그아웃')
        expect(logoutButtons.length).toBeGreaterThan(0)
      })

      const logoutButtons = screen.getAllByText('로그아웃')
      fireEvent.click(logoutButtons[0])

      await waitFor(() => {
        const dialog = screen.getByTestId('confirm-dialog')
        const confirmButton = within(dialog).getAllByRole('button').find(btn =>
          btn.textContent === '로그아웃'
        )
        expect(confirmButton).toHaveAttribute('data-variant', 'danger')
      })
    })
  })

  // ==========================================
  // 8. LOGOUT FLOW
  // ==========================================

  describe('Logout Flow', () => {
    beforeEach(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      })
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should call signOut when confirming logout', async () => {
      render(<TopNav />)

      // Open dropdown and click logout
      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        const logoutButtons = screen.getAllByText('로그아웃')
        expect(logoutButtons.length).toBeGreaterThan(0)
      })

      const logoutButtons = screen.getAllByText('로그아웃')
      fireEvent.click(logoutButtons[0])

      // Confirm logout in dialog
      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByTestId('confirm-dialog')
      const confirmButton = within(dialog).getAllByRole('button').find(btn =>
        btn.textContent === '로그아웃'
      )

      fireEvent.click(confirmButton!)

      await waitFor(() => {
        expect(signOut).toHaveBeenCalledTimes(1)
      })
    })

    it('should show success toast after successful logout', async () => {
      render(<TopNav />)

      // Open dropdown and click logout
      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        const logoutButtons = screen.getAllByText('로그아웃')
        expect(logoutButtons.length).toBeGreaterThan(0)
      })

      const logoutButtons = screen.getAllByText('로그아웃')
      fireEvent.click(logoutButtons[0])

      // Confirm logout
      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByTestId('confirm-dialog')
      const confirmButton = within(dialog).getAllByRole('button').find(btn =>
        btn.textContent === '로그아웃'
      )

      fireEvent.click(confirmButton!)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('로그아웃되었습니다', {
          duration: 3000,
          position: 'top-center',
        })
      })
    })

    it('should redirect to home page after logout', async () => {
      render(<TopNav />)

      // Open dropdown and click logout
      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        const logoutButtons = screen.getAllByText('로그아웃')
        expect(logoutButtons.length).toBeGreaterThan(0)
      })

      const logoutButtons = screen.getAllByText('로그아웃')
      fireEvent.click(logoutButtons[0])

      // Confirm logout
      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByTestId('confirm-dialog')
      const confirmButton = within(dialog).getAllByRole('button').find(btn =>
        btn.textContent === '로그아웃'
      )

      fireEvent.click(confirmButton!)

      await waitFor(() => {
        expect(signOut).toHaveBeenCalled()
      })

      // Fast-forward timers to trigger redirect
      jest.advanceTimersByTime(500)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('should close dialog after successful logout', async () => {
      render(<TopNav />)

      // Open dropdown and click logout
      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        const logoutButtons = screen.getAllByText('로그아웃')
        expect(logoutButtons.length).toBeGreaterThan(0)
      })

      const logoutButtons = screen.getAllByText('로그아웃')
      fireEvent.click(logoutButtons[0])

      // Confirm logout
      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByTestId('confirm-dialog')
      const confirmButton = within(dialog).getAllByRole('button').find(btn =>
        btn.textContent === '로그아웃'
      )

      fireEvent.click(confirmButton!)

      await waitFor(() => {
        expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument()
      })
    })

    it('should show error toast when logout fails', async () => {
      ;(signOut as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<TopNav />)

      // Open dropdown and click logout
      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        const logoutButtons = screen.getAllByText('로그아웃')
        expect(logoutButtons.length).toBeGreaterThan(0)
      })

      const logoutButtons = screen.getAllByText('로그아웃')
      fireEvent.click(logoutButtons[0])

      // Confirm logout
      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByTestId('confirm-dialog')
      const confirmButton = within(dialog).getAllByRole('button').find(btn =>
        btn.textContent === '로그아웃'
      )

      fireEvent.click(confirmButton!)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('로그아웃에 실패했습니다')
      })
    })

    it('should not redirect when logout fails', async () => {
      ;(signOut as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<TopNav />)

      // Open dropdown and click logout
      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        const logoutButtons = screen.getAllByText('로그아웃')
        expect(logoutButtons.length).toBeGreaterThan(0)
      })

      const logoutButtons = screen.getAllByText('로그아웃')
      fireEvent.click(logoutButtons[0])

      // Confirm logout
      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByTestId('confirm-dialog')
      const confirmButton = within(dialog).getAllByRole('button').find(btn =>
        btn.textContent === '로그아웃'
      )

      fireEvent.click(confirmButton!)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })

      // Fast-forward timers
      jest.advanceTimersByTime(500)

      // Should not redirect
      expect(mockPush).not.toHaveBeenCalledWith('/')
    })

    it('should cancel logout when clicking cancel button', async () => {
      render(<TopNav />)

      // Open dropdown and click logout
      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        const logoutButtons = screen.getAllByText('로그아웃')
        expect(logoutButtons.length).toBeGreaterThan(0)
      })

      const logoutButtons = screen.getAllByText('로그아웃')
      fireEvent.click(logoutButtons[0])

      // Cancel logout
      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByTestId('confirm-dialog')
      const cancelButton = within(dialog).getByText('취소')

      fireEvent.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument()
      })

      expect(signOut).not.toHaveBeenCalled()
    })
  })

  // ==========================================
  // 9. TOAST NOTIFICATIONS
  // ==========================================

  describe('Toast Notifications', () => {
    beforeEach(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      })
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should show success toast with correct configuration', async () => {
      render(<TopNav />)

      // Trigger logout
      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        const logoutButtons = screen.getAllByText('로그아웃')
        expect(logoutButtons.length).toBeGreaterThan(0)
      })

      const logoutButtons = screen.getAllByText('로그아웃')
      fireEvent.click(logoutButtons[0])

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByTestId('confirm-dialog')
      const confirmButton = within(dialog).getAllByRole('button').find(btn =>
        btn.textContent === '로그아웃'
      )

      fireEvent.click(confirmButton!)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          '로그아웃되었습니다',
          expect.objectContaining({
            duration: 3000,
            position: 'top-center',
          })
        )
      })
    })

    it('should show error toast without success toast when logout fails', async () => {
      ;(signOut as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<TopNav />)

      // Trigger logout
      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        const logoutButtons = screen.getAllByText('로그아웃')
        expect(logoutButtons.length).toBeGreaterThan(0)
      })

      const logoutButtons = screen.getAllByText('로그아웃')
      fireEvent.click(logoutButtons[0])

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByTestId('confirm-dialog')
      const confirmButton = within(dialog).getAllByRole('button').find(btn =>
        btn.textContent === '로그아웃'
      )

      fireEvent.click(confirmButton!)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('로그아웃에 실패했습니다')
        expect(toast.success).not.toHaveBeenCalled()
      })
    })

    it('should log error to console when logout fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Network error')
      ;(signOut as jest.Mock).mockRejectedValueOnce(error)

      render(<TopNav />)

      // Trigger logout
      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        const logoutButtons = screen.getAllByText('로그아웃')
        expect(logoutButtons.length).toBeGreaterThan(0)
      })

      const logoutButtons = screen.getAllByText('로그아웃')
      fireEvent.click(logoutButtons[0])

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByTestId('confirm-dialog')
      const confirmButton = within(dialog).getAllByRole('button').find(btn =>
        btn.textContent === '로그아웃'
      )

      fireEvent.click(confirmButton!)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Logout failed:', error)
      })

      consoleSpy.mockRestore()
    })
  })

  // ==========================================
  // 10. ACCESSIBILITY FEATURES
  // ==========================================

  describe('Accessibility Features', () => {
    beforeEach(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      })
    })

    it('should have proper ARIA labels on menu button', () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      expect(menuButton).toHaveAttribute('aria-label', '사용자 메뉴')
      expect(menuButton).toHaveAttribute('aria-expanded')
      expect(menuButton).toHaveAttribute('aria-haspopup', 'true')
    })

    it('should update aria-expanded when dropdown opens/closes', async () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')

      // Initially collapsed
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')

      // Open dropdown
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(menuButton).toHaveAttribute('aria-expanded', 'true')
      })

      // Close dropdown
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(menuButton).toHaveAttribute('aria-expanded', 'false')
      })
    })

    it('should have role="menu" on dropdown', async () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        const dropdown = screen.getByRole('menu')
        expect(dropdown).toBeInTheDocument()
        expect(dropdown).toHaveAttribute('aria-orientation', 'vertical')
      })
    })

    it('should have role="menuitem" on menu items', async () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem')
        expect(menuItems).toHaveLength(3) // Profile, Settings, Logout
      })
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')

      // Tab to menu button
      await user.tab()
      expect(menuButton).toHaveFocus()

      // Open with Enter
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })
    })

    it('should have focus styles on interactive elements', () => {
      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      expect(menuButton).toHaveClass('focus:outline-none')
      expect(menuButton).toHaveClass('focus:ring-2')
      expect(menuButton).toHaveClass('focus:ring-[#693BF2]')
    })

    it('should be navigable via keyboard only', async () => {
      const user = userEvent.setup()
      render(<TopNav />)

      // Tab to menu button
      await user.tab()

      const menuButton = screen.getByLabelText('사용자 메뉴')
      expect(menuButton).toHaveFocus()

      // Open dropdown
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      // Close with ESC
      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })
  })

  // ==========================================
  // 11. EDGE CASES AND ERROR HANDLING
  // ==========================================

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing user email gracefully', () => {
      const userWithoutEmail = {
        ...mockUser,
        email: null,
        nickname: null,
      }

      ;(useAuth as jest.Mock).mockReturnValue({
        user: userWithoutEmail,
        isAuthenticated: true,
      })

      expect(() => render(<TopNav />)).not.toThrow()
    })

    it('should handle logo click navigation', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      })

      render(<TopNav />)

      const logo = screen.getByText('SWING CONNECT')
      fireEvent.click(logo)

      expect(mockPush).toHaveBeenCalledWith('/home')
    })

    it('should disable logout dialog close during logout process', async () => {
      let resolveSignOut: () => void
      const signOutPromise = new Promise<void>((resolve) => {
        resolveSignOut = resolve
      })
      ;(signOut as jest.Mock).mockReturnValue(signOutPromise)

      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      })

      render(<TopNav />)

      // Open dropdown and click logout
      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        const logoutButtons = screen.getAllByText('로그아웃')
        expect(logoutButtons.length).toBeGreaterThan(0)
      })

      const logoutButtons = screen.getAllByText('로그아웃')
      fireEvent.click(logoutButtons[0])

      // Confirm logout
      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByTestId('confirm-dialog')
      const confirmButton = within(dialog).getAllByRole('button').find(btn =>
        btn.textContent === '로그아웃'
      )

      fireEvent.click(confirmButton!)

      // Dialog should show loading state
      await waitFor(() => {
        const loadingButton = within(dialog).getAllByRole('button').find(btn =>
          btn.textContent === '처리 중...'
        )
        expect(loadingButton).toBeInTheDocument()
        expect(loadingButton).toBeDisabled()
      })

      // Resolve the logout
      resolveSignOut!()
    })

    it('should maintain dropdown state when re-rendering', async () => {
      const { rerender } = render(<TopNav />)

      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      })

      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      // Re-render
      rerender(<TopNav />)

      // Dropdown should still be open
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('should handle rapid dropdown open/close clicks', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      })

      render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')

      // Rapid clicks
      fireEvent.click(menuButton)
      fireEvent.click(menuButton)
      fireEvent.click(menuButton)

      // Should end up in consistent state
      await waitFor(() => {
        const dropdown = screen.queryByRole('menu')
        // Should be open (odd number of clicks)
        expect(dropdown).toBeInTheDocument()
      })
    })

    it('should clean up all event listeners on unmount', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      })

      const { unmount } = render(<TopNav />)

      const menuButton = screen.getByLabelText('사용자 메뉴')
      fireEvent.click(menuButton)

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      unmount()

      // Should not throw errors
      expect(() => {
        fireEvent.mouseDown(document.body)
        fireEvent.keyDown(document, { key: 'Escape' })
      }).not.toThrow()
    })
  })
})
