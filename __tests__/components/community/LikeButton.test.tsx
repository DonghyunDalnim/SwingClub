/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LikeButton } from '@/components/community/LikeButton'

// Mock animations
jest.mock('@/lib/utils/animations', () => ({
  HeartParticles: jest.fn().mockImplementation(() => ({
    createParticle: jest.fn(),
    destroy: jest.fn(),
  })),
  animateCount: jest.fn((element, start, end, duration, callback) => {
    element.textContent = end.toString()
    if (callback) callback(end)
  }),
  createColorTransition: jest.fn(),
  reduceMotion: jest.fn(() => false),
}))

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 16)
  return 1
})

global.cancelAnimationFrame = jest.fn()

// Mock devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', {
  value: 2,
  writable: true
})

const mockOnToggleLike = jest.fn()

const defaultProps = {
  postId: 'test-post-1',
  isLiked: false,
  likeCount: 5,
  onToggleLike: mockOnToggleLike,
}

describe('LikeButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockOnToggleLike.mockResolvedValue({ success: true, newCount: 6 })
  })

  describe('Rendering', () => {
    test('renders with initial props', () => {
      render(<LikeButton {...defaultProps} />)

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByLabelText('Add like')).toBeInTheDocument()
    })

    test('renders liked state correctly', () => {
      render(<LikeButton {...defaultProps} isLiked={true} />)

      expect(screen.getByLabelText('Remove like')).toBeInTheDocument()
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    })

    test('renders different sizes correctly', () => {
      const { rerender } = render(<LikeButton {...defaultProps} size="sm" />)
      expect(screen.getByRole('button')).toHaveClass('h-6', 'text-xs')

      rerender(<LikeButton {...defaultProps} size="md" />)
      expect(screen.getByRole('button')).toHaveClass('h-8', 'text-sm')

      rerender(<LikeButton {...defaultProps} size="lg" />)
      expect(screen.getByRole('button')).toHaveClass('h-10', 'text-base')
    })

    test('applies custom className', () => {
      render(<LikeButton {...defaultProps} className="custom-class" />)
      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })

    test('renders canvas element for particles', () => {
      render(<LikeButton {...defaultProps} />)
      const canvas = document.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
      expect(canvas).toHaveClass('pointer-events-none', 'absolute')
    })
  })

  describe('Interaction', () => {
    test('toggles like state on click', async () => {
      render(<LikeButton {...defaultProps} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)

      expect(mockOnToggleLike).toHaveBeenCalledWith('test-post-1', true)
      await waitFor(() => {
        expect(screen.getByText('6')).toBeInTheDocument()
      })
    })

    test('handles optimistic updates correctly', async () => {
      render(<LikeButton {...defaultProps} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)

      // Should immediately update the count optimistically
      expect(screen.getByText('6')).toBeInTheDocument()

      await waitFor(() => {
        expect(mockOnToggleLike).toHaveBeenCalled()
      })
    })

    test('reverts optimistic update on failure', async () => {
      mockOnToggleLike.mockResolvedValueOnce({ success: false, newCount: 5 })

      render(<LikeButton {...defaultProps} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument()
      })
    })

    test('handles network errors gracefully', async () => {
      mockOnToggleLike.mockRejectedValueOnce(new Error('Network error'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      render(<LikeButton {...defaultProps} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument()
        expect(consoleSpy).toHaveBeenCalledWith('Failed to toggle like:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })

    test('prevents multiple rapid clicks', async () => {
      render(<LikeButton {...defaultProps} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)
      fireEvent.click(button)

      expect(mockOnToggleLike).toHaveBeenCalledTimes(1)
    })

    test('respects disabled prop', () => {
      render(<LikeButton {...defaultProps} disabled />)
      const button = screen.getByRole('button')

      expect(button).toBeDisabled()

      fireEvent.click(button)
      expect(mockOnToggleLike).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    test('has correct ARIA attributes', () => {
      render(<LikeButton {...defaultProps} />)
      const button = screen.getByRole('button')

      expect(button).toHaveAttribute('aria-label', 'Add like')
      expect(button).toHaveAttribute('aria-pressed', 'false')
    })

    test('updates ARIA attributes when liked', () => {
      render(<LikeButton {...defaultProps} isLiked={true} />)
      const button = screen.getByRole('button')

      expect(button).toHaveAttribute('aria-label', 'Remove like')
      expect(button).toHaveAttribute('aria-pressed', 'true')
    })

    test('canvas is hidden from screen readers', () => {
      render(<LikeButton {...defaultProps} />)
      const canvas = document.querySelector('canvas')

      expect(canvas).toHaveAttribute('aria-hidden', 'true')
    })

    test('maintains focus states', () => {
      render(<LikeButton {...defaultProps} />)
      const button = screen.getByRole('button')

      button.focus()
      expect(button).toHaveFocus()
    })
  })

  describe('Visual States', () => {
    test('applies correct styles for liked state', () => {
      render(<LikeButton {...defaultProps} isLiked={true} />)

      const heartIcon = document.querySelector('svg')
      expect(heartIcon).toHaveClass('fill-[#693BF2]', 'text-[#693BF2]')

      const count = screen.getByText('5')
      expect(count).toHaveClass('text-[#693BF2]')
    })

    test('applies correct styles for unliked state', () => {
      render(<LikeButton {...defaultProps} isLiked={false} />)

      const heartIcon = document.querySelector('svg')
      expect(heartIcon).toHaveClass('text-[#6A7685]')
      expect(heartIcon).not.toHaveClass('fill-[#693BF2]')

      const count = screen.getByText('5')
      expect(count).toHaveClass('text-[#6A7685]')
    })

    test('shows loading state during animation', async () => {
      render(<LikeButton {...defaultProps} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)

      const count = screen.getByText('6')
      expect(count).toHaveClass('opacity-75')
    })

    test('shows disabled state correctly', () => {
      render(<LikeButton {...defaultProps} disabled />)
      const button = screen.getByRole('button')

      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
    })
  })

  describe('Animation Integration', () => {
    test('calls createColorTransition on like', async () => {
      const { createColorTransition } = require('@/lib/utils/animations')

      render(<LikeButton {...defaultProps} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)

      await waitFor(() => {
        expect(createColorTransition).toHaveBeenCalled()
      })
    })

    test('calls animateCount for count changes', async () => {
      const { animateCount } = require('@/lib/utils/animations')

      render(<LikeButton {...defaultProps} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)

      await waitFor(() => {
        expect(animateCount).toHaveBeenCalled()
      })
    })

    test('creates heart particles on like', async () => {
      const mockParticles = require('@/lib/utils/animations').HeartParticles
      const createParticleMock = jest.fn()
      mockParticles.mockImplementation(() => ({
        createParticle: createParticleMock,
        destroy: jest.fn(),
      }))

      render(<LikeButton {...defaultProps} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)

      await waitFor(() => {
        expect(createParticleMock).toHaveBeenCalled()
      })
    })

    test('respects reduced motion preferences', async () => {
      const { reduceMotion, createColorTransition } = require('@/lib/utils/animations')
      reduceMotion.mockReturnValueOnce(true)

      render(<LikeButton {...defaultProps} />)
      const button = screen.getByRole('button')

      fireEvent.click(button)

      await waitFor(() => {
        expect(createColorTransition).not.toHaveBeenCalled()
      })
    })
  })

  describe('Canvas Management', () => {
    test('initializes canvas with correct dimensions', () => {
      render(<LikeButton {...defaultProps} />)

      const canvas = document.querySelector('canvas') as HTMLCanvasElement
      expect(canvas.width).toBe(0) // Initially 0 due to getBoundingClientRect mock
      expect(canvas.height).toBe(0)
    })

    test('cleans up particles on unmount', () => {
      const mockDestroy = jest.fn()
      const mockParticles = require('@/lib/utils/animations').HeartParticles
      mockParticles.mockImplementation(() => ({
        createParticle: jest.fn(),
        destroy: mockDestroy,
      }))

      const { unmount } = render(<LikeButton {...defaultProps} />)

      unmount()

      expect(mockDestroy).toHaveBeenCalled()
    })
  })

  describe('Event Handling', () => {
    test('prevents event propagation', () => {
      const parentClickHandler = jest.fn()

      render(
        <div onClick={parentClickHandler}>
          <LikeButton {...defaultProps} />
        </div>
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(parentClickHandler).not.toHaveBeenCalled()
    })

    test('handles touch events correctly', () => {
      render(<LikeButton {...defaultProps} />)
      const button = screen.getByRole('button')

      fireEvent.touchStart(button)
      fireEvent.touchEnd(button)

      // Should not cause additional calls
      expect(mockOnToggleLike).toHaveBeenCalledTimes(0)
    })
  })

  describe('Props Validation', () => {
    test('handles missing optional props', () => {
      render(
        <LikeButton
          postId="test"
          isLiked={false}
          likeCount={0}
          onToggleLike={mockOnToggleLike}
        />
      )

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    test('handles zero like count', () => {
      render(<LikeButton {...defaultProps} likeCount={0} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    test('handles large like counts', () => {
      render(<LikeButton {...defaultProps} likeCount={9999} />)
      expect(screen.getByText('9999')).toBeInTheDocument()
    })
  })
})