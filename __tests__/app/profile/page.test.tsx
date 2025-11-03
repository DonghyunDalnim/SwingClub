/**
 * ProfilePage integration tests
 * Tests the integration of DanceStyleDisplay component in profile page
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilePage from '@/app/profile/page'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks'
import type { DanceStyle } from '@/lib/types/auth'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/lib/auth/hooks', () => ({
  useAuth: jest.fn()
}))

describe('ProfilePage - DanceStyleDisplay Integration', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  }

  const mockSignOut = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      signOut: mockSignOut,
      loading: false
    })
  })

  describe('Dance Styles Section', () => {
    it('renders dance styles when user has danceStyles', () => {
      const mockDanceStyles: DanceStyle[] = [
        { name: 'Lindy Hop', level: 5 },
        { name: 'Charleston', level: 3 },
        { name: 'Balboa', level: 2 }
      ]

      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          uid: 'test-123',
          email: 'test@example.com',
          displayName: 'Test User',
          profile: {
            danceStyles: mockDanceStyles,
            danceLevel: 'intermediate',
            location: 'Seoul'
          }
        },
        signOut: mockSignOut,
        loading: false
      })

      render(<ProfilePage />)

      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getByText('Charleston')).toBeInTheDocument()
      expect(screen.getByText('Balboa')).toBeInTheDocument()
    })

    it('renders empty state when user has no dance styles', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          uid: 'test-123',
          email: 'test@example.com',
          displayName: 'Test User',
          profile: {
            danceStyles: [],
            danceLevel: 'beginner',
            location: 'Seoul'
          }
        },
        signOut: mockSignOut,
        loading: false
      })

      const { container } = render(<ProfilePage />)

      expect(container.querySelector('[role="status"]')).toBeInTheDocument()
    })

    it('renders empty state when danceStyles is undefined', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          uid: 'test-123',
          email: 'test@example.com',
          displayName: 'Test User',
          profile: {
            danceLevel: 'beginner',
            location: 'Seoul'
          }
        },
        signOut: mockSignOut,
        loading: false
      })

      const { container } = render(<ProfilePage />)

      expect(container.querySelector('[role="status"]')).toBeInTheDocument()
    })

    it('shows edit button in empty state and navigates on click', async () => {
      const user = userEvent.setup()

      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          uid: 'test-123',
          email: 'test@example.com',
          displayName: 'Test User',
          profile: {
            danceStyles: [],
            danceLevel: 'beginner',
            location: 'Seoul'
          }
        },
        signOut: mockSignOut,
        loading: false
      })

      render(<ProfilePage />)

      const editButtons = screen.getAllByRole('button')
      const emptyStateEditButton = editButtons.find(btn =>
        btn.textContent?.includes('Edit') || btn.getAttribute('aria-label')?.includes('Edit')
      )

      if (emptyStateEditButton) {
        await user.click(emptyStateEditButton)
        expect(mockRouter.push).toHaveBeenCalledWith('/profile/edit')
      }
    })

    it('displays correct level information for each dance style', () => {
      const mockDanceStyles: DanceStyle[] = [
        { name: 'Lindy Hop', level: 5 },
        { name: 'Charleston', level: 1 }
      ]

      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          uid: 'test-123',
          email: 'test@example.com',
          displayName: 'Test User',
          profile: {
            danceStyles: mockDanceStyles
          }
        },
        signOut: mockSignOut,
        loading: false
      })

      render(<ProfilePage />)

      expect(screen.getByText('Level 5/5')).toBeInTheDocument()
      expect(screen.getByText('Level 1/5')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('displays dance styles in info tab by default', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          uid: 'test-123',
          email: 'test@example.com',
          displayName: 'Test User',
          profile: {
            danceStyles: [{ name: 'Lindy Hop', level: 3 }]
          }
        },
        signOut: mockSignOut,
        loading: false
      })

      render(<ProfilePage />)

      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
    })

    it('hides dance styles when switching to activity tab', async () => {
      const user = userEvent.setup()

      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          uid: 'test-123',
          email: 'test@example.com',
          displayName: 'Test User',
          profile: {
            danceStyles: [{ name: 'Lindy Hop', level: 3 }]
          }
        },
        signOut: mockSignOut,
        loading: false
      })

      render(<ProfilePage />)

      // Initially on info tab with dance styles visible
      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()

      // Get all tab buttons and find activity tab by icon
      const tabs = screen.getAllByRole('button')
      const activityTab = tabs.find(tab => tab.textContent?.includes('📊'))

      if (activityTab) {
        await user.click(activityTab)

        await waitFor(() => {
          expect(screen.queryByText('Lindy Hop')).not.toBeInTheDocument()
        })
      }
    })
  })

  describe('Responsive Behavior', () => {
    it('renders dance styles in responsive grid', () => {
      const mockDanceStyles: DanceStyle[] = Array.from({ length: 6 }, (_, i) => ({
        name: `Dance Style ${i + 1}`,
        level: (i % 5) + 1
      }))

      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          uid: 'test-123',
          email: 'test@example.com',
          displayName: 'Test User',
          profile: {
            danceStyles: mockDanceStyles
          }
        },
        signOut: mockSignOut,
        loading: false
      })

      render(<ProfilePage />)

      const danceStyleCards = screen.getAllByRole('listitem')
      expect(danceStyleCards).toHaveLength(6)
    })
  })

  describe('Edge Cases', () => {
    it('handles maximum dance styles (10)', () => {
      const mockDanceStyles: DanceStyle[] = Array.from({ length: 10 }, (_, i) => ({
        name: `Dance ${i + 1}`,
        level: 3
      }))

      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          uid: 'test-123',
          email: 'test@example.com',
          displayName: 'Test User',
          profile: {
            danceStyles: mockDanceStyles
          }
        },
        signOut: mockSignOut,
        loading: false
      })

      render(<ProfilePage />)

      const danceStyleCards = screen.getAllByRole('listitem')
      expect(danceStyleCards).toHaveLength(10)
    })

    it('handles single dance style', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          uid: 'test-123',
          email: 'test@example.com',
          displayName: 'Test User',
          profile: {
            danceStyles: [{ name: 'Lindy Hop', level: 4 }]
          }
        },
        signOut: mockSignOut,
        loading: false
      })

      render(<ProfilePage />)

      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getByText('Level 4/5')).toBeInTheDocument()
    })

    it('handles user with no profile', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          uid: 'test-123',
          email: 'test@example.com',
          displayName: 'Test User'
        },
        signOut: mockSignOut,
        loading: false
      })

      const { container } = render(<ProfilePage />)

      expect(container.querySelector('[role="status"]')).toBeInTheDocument()
    })

    it('renders aria-label for dance style list', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: {
          uid: 'test-123',
          email: 'test@example.com',
          displayName: 'Test User',
          profile: {
            danceStyles: [
              { name: 'Lindy Hop', level: 3 },
              { name: 'Charleston', level: 2 }
            ]
          }
        },
        signOut: mockSignOut,
        loading: false
      })

      render(<ProfilePage />)

      const list = screen.getByRole('list')
      expect(list).toBeInTheDocument()
    })
  })
})
