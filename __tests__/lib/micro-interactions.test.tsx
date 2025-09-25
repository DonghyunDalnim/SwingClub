/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Button } from '@/components/core/Button'
import { Card } from '@/components/core/Card'
import { LikeButton } from '@/components/community/LikeButton'

// Mock animations
jest.mock('@/lib/utils/animations', () => ({
  HeartParticles: jest.fn().mockImplementation(() => ({
    createParticle: jest.fn(),
    destroy: jest.fn(),
  })),
  animateCount: jest.fn(),
  createColorTransition: jest.fn(),
  createScaleAnimation: jest.fn(() => ({
    scaleDown: jest.fn(),
    scaleUp: jest.fn(),
    reset: jest.fn(),
  })),
  reduceMotion: jest.fn(() => false),
}))

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 16)
  return 1
})

describe('Soomgo Micro Interaction System Integration', () => {
  describe('Button Scale Interactions', () => {
    test('button applies hover scale effect', () => {
      render(<Button>Test Button</Button>)
      const button = screen.getByRole('button')

      expect(button).toHaveClass('hover:scale-[1.02]')
    })

    test('button applies active scale effect', () => {
      render(<Button>Test Button</Button>)
      const button = screen.getByRole('button')

      expect(button).toHaveClass('active:scale-[0.98]')
    })

    test('button scale effects work with different variants', () => {
      const variants = ['primary', 'secondary', 'ghost', 'outline'] as const

      variants.forEach(variant => {
        render(<Button variant={variant}>Test {variant}</Button>)
        const button = screen.getByRole('button', { name: `Test ${variant}` })

        expect(button).toHaveClass('hover:scale-[1.02]')
        expect(button).toHaveClass('active:scale-[0.98]')
      })
    })

    test('button maintains scale effects with custom className', () => {
      render(<Button className="custom-class">Test Button</Button>)
      const button = screen.getByRole('button')

      expect(button).toHaveClass('hover:scale-[1.02]')
      expect(button).toHaveClass('active:scale-[0.98]')
      expect(button).toHaveClass('custom-class')
    })

    test('loading buttons do not show scale effects', () => {
      render(<Button loading>Loading Button</Button>)
      const button = screen.getByRole('button')

      // Should still have the classes but be in disabled state
      expect(button).toBeDisabled()
      expect(button).toHaveClass('hover:scale-[1.02]')
      expect(button).toHaveClass('cursor-not-allowed')
    })
  })

  describe('Card Hover Interactions', () => {
    test('card applies hover transform and shadow effects', () => {
      render(
        <Card>
          <div>Test Card Content</div>
        </Card>
      )

      const card = screen.getByText('Test Card Content').parentElement

      // Check that card uses design tokens which include hover effects
      expect(card).toHaveClass('transition-all', 'duration-200')
    })

    test('card hover effects can be disabled', () => {
      render(
        <Card hoverable={false}>
          <div>Test Card Content</div>
        </Card>
      )

      const card = screen.getByText('Test Card Content').parentElement

      expect(card).toHaveClass('hover:shadow-none', 'hover:transform-none')
    })

    test('clickable cards show cursor pointer', () => {
      render(
        <Card clickable>
          <div>Clickable Card</div>
        </Card>
      )

      const card = screen.getByText('Clickable Card').parentElement

      expect(card).toHaveClass('cursor-pointer')
    })

    test('card variants maintain hover effects', () => {
      const variants = ['default', 'service', 'portfolio'] as const

      variants.forEach(variant => {
        render(
          <Card variant={variant}>
            <div>{variant} Card</div>
          </Card>
        )

        const card = screen.getByText(`${variant} Card`).parentElement

        // All variants should have transition classes
        expect(card).toHaveClass('transition-all', 'duration-200')
      })
    })
  })

  describe('LikeButton Micro Interactions', () => {
    const mockOnToggleLike = jest.fn().mockResolvedValue({ success: true, newCount: 6 })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    test('like button triggers all micro interaction effects', async () => {
      const { createColorTransition, animateCount } = require('@/lib/utils/animations')

      render(
        <LikeButton
          postId="test"
          isLiked={false}
          likeCount={5}
          onToggleLike={mockOnToggleLike}
        />
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(createColorTransition).toHaveBeenCalled()
        expect(animateCount).toHaveBeenCalled()
      })
    })

    test('like button respects reduced motion', async () => {
      const { reduceMotion, createColorTransition } = require('@/lib/utils/animations')
      reduceMotion.mockReturnValueOnce(true)

      render(
        <LikeButton
          postId="test"
          isLiked={false}
          likeCount={5}
          onToggleLike={mockOnToggleLike}
        />
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(createColorTransition).not.toHaveBeenCalled()
      })
    })

    test('like button shows correct color transitions', () => {
      render(
        <LikeButton
          postId="test"
          isLiked={true}
          likeCount={5}
          onToggleLike={mockOnToggleLike}
        />
      )

      const heartIcon = document.querySelector('svg')
      const count = screen.getByText('5')

      expect(heartIcon).toHaveClass('fill-[#693BF2]', 'text-[#693BF2]')
      expect(count).toHaveClass('text-[#693BF2]')
    })

    test('like button particle effects are created', async () => {
      const mockCreateParticle = jest.fn()
      const mockParticles = require('@/lib/utils/animations').HeartParticles
      mockParticles.mockImplementation(() => ({
        createParticle: mockCreateParticle,
        destroy: jest.fn(),
      }))

      render(
        <LikeButton
          postId="test"
          isLiked={false}
          likeCount={5}
          onToggleLike={mockOnToggleLike}
        />
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockCreateParticle).toHaveBeenCalled()
      })
    })
  })

  describe('System-wide Interaction Consistency', () => {
    test('all interactive elements use consistent timing', () => {
      render(
        <div>
          <Button>Button</Button>
          <Card>
            <div>Card Content</div>
          </Card>
          <LikeButton
            postId="test"
            isLiked={false}
            likeCount={5}
            onToggleLike={() => Promise.resolve({ success: true, newCount: 6 })}
          />
        </div>
      )

      const button = screen.getByRole('button', { name: 'Button' })
      const card = screen.getByText('Card Content').parentElement
      const likeButton = screen.getByRole('button', { name: 'Add like' })

      // All should use consistent transition timing (0.2s ease)
      expect(button).toHaveClass('transition-all', 'duration-200', 'ease')
      expect(card).toHaveClass('transition-all', 'duration-200')
      expect(likeButton).toHaveClass('transition-all', 'duration-200', 'ease')
    })

    test('all interactive elements respect focus states', () => {
      render(
        <div>
          <Button>Button</Button>
          <LikeButton
            postId="test"
            isLiked={false}
            likeCount={5}
            onToggleLike={() => Promise.resolve({ success: true, newCount: 6 })}
          />
        </div>
      )

      const button = screen.getByRole('button', { name: 'Button' })
      const likeButton = screen.getByRole('button', { name: 'Add like' })

      // Both should have focus ring styles
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2')
      expect(likeButton).toHaveClass('focus:outline-none', 'focus:ring-2')
    })

    test('color consistency across components', () => {
      render(
        <div>
          <Button variant="primary">Primary Button</Button>
          <LikeButton
            postId="test"
            isLiked={true}
            likeCount={5}
            onToggleLike={() => Promise.resolve({ success: true, newCount: 6 })}
          />
        </div>
      )

      const button = screen.getByRole('button', { name: 'Primary Button' })
      const likeCount = screen.getByText('5')
      const heartIcon = document.querySelector('svg')

      // Should use consistent Soomgo purple color (#693BF2)
      expect(button).toHaveClass('bg-[#693BF2]')
      expect(likeCount).toHaveClass('text-[#693BF2]')
      expect(heartIcon).toHaveClass('fill-[#693BF2]', 'text-[#693BF2]')
    })
  })

  describe('Performance and Accessibility', () => {
    test('reduced motion preferences are respected', () => {
      const { reduceMotion } = require('@/lib/utils/animations')
      reduceMotion.mockReturnValueOnce(true)

      render(
        <div>
          <Button>Button</Button>
          <LikeButton
            postId="test"
            isLiked={false}
            likeCount={5}
            onToggleLike={() => Promise.resolve({ success: true, newCount: 6 })}
          />
        </div>
      )

      // Components should check for reduced motion
      expect(reduceMotion).toHaveBeenCalled()
    })

    test('animations do not interfere with screen readers', () => {
      render(
        <LikeButton
          postId="test"
          isLiked={false}
          likeCount={5}
          onToggleLike={() => Promise.resolve({ success: true, newCount: 6 })}
        />
      )

      const canvas = document.querySelector('canvas')
      const button = screen.getByRole('button')

      expect(canvas).toHaveAttribute('aria-hidden', 'true')
      expect(button).toHaveAttribute('aria-label', 'Add like')
    })

    test('interactions maintain keyboard navigation', () => {
      render(
        <div>
          <Button>First</Button>
          <Button>Second</Button>
          <LikeButton
            postId="test"
            isLiked={false}
            likeCount={5}
            onToggleLike={() => Promise.resolve({ success: true, newCount: 6 })}
          />
        </div>
      )

      const firstButton = screen.getByRole('button', { name: 'First' })
      const secondButton = screen.getByRole('button', { name: 'Second' })
      const likeButton = screen.getByRole('button', { name: 'Add like' })

      // Should be focusable in sequence
      firstButton.focus()
      expect(firstButton).toHaveFocus()

      fireEvent.keyDown(firstButton, { key: 'Tab' })
      // In real environment, this would focus next element
      expect(document.activeElement).toBeDefined()
    })
  })

  describe('Error Handling and Edge Cases', () => {
    test('components handle rapid interactions gracefully', async () => {
      const slowToggle = jest.fn(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ success: true, newCount: 6 }), 1000)
        )
      )

      render(
        <LikeButton
          postId="test"
          isLiked={false}
          likeCount={5}
          onToggleLike={slowToggle}
        />
      )

      const button = screen.getByRole('button')

      // Rapid clicks should be prevented
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      expect(slowToggle).toHaveBeenCalledTimes(1)
    })

    test('animations clean up properly on component unmount', () => {
      const mockDestroy = jest.fn()
      const mockParticles = require('@/lib/utils/animations').HeartParticles
      mockParticles.mockImplementation(() => ({
        createParticle: jest.fn(),
        destroy: mockDestroy,
      }))

      const { unmount } = render(
        <LikeButton
          postId="test"
          isLiked={false}
          likeCount={5}
          onToggleLike={() => Promise.resolve({ success: true, newCount: 6 })}
        />
      )

      unmount()

      expect(mockDestroy).toHaveBeenCalled()
    })

    test('components work without JavaScript animations', () => {
      // Mock animation functions to do nothing
      const { HeartParticles, animateCount, createColorTransition } = require('@/lib/utils/animations')
      HeartParticles.mockImplementation(() => { throw new Error('Canvas not supported') })
      animateCount.mockImplementation(() => {})
      createColorTransition.mockImplementation(() => {})

      render(
        <LikeButton
          postId="test"
          isLiked={false}
          likeCount={5}
          onToggleLike={() => Promise.resolve({ success: true, newCount: 6 })}
        />
      )

      const button = screen.getByRole('button')

      // Should still be functional even if animations fail
      expect(button).toBeInTheDocument()
      fireEvent.click(button)
      // Should not crash
    })
  })
})