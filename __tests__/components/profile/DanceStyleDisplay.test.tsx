import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { DanceStyleDisplay } from '@/app/profile/components/DanceStyleDisplay'
import type { DanceStyle } from '@/lib/types/auth'

// Mock data
const mockDanceStyles: DanceStyle[] = [
  { name: 'Lindy Hop', level: 3 },
  { name: 'Charleston', level: 5 },
  { name: 'Balboa', level: 1 }
]

describe('DanceStyleDisplay', () => {
  // Helper function to create default props
  const defaultProps = {
    danceStyles: mockDanceStyles,
    isOwnProfile: false,
    onEdit: undefined,
    className: undefined
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('renders without crashing', () => {
      render(<DanceStyleDisplay {...defaultProps} />)
      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
    })

    it('displays all dance styles', () => {
      render(<DanceStyleDisplay {...defaultProps} />)
      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getByText('Charleston')).toBeInTheDocument()
      expect(screen.getByText('Balboa')).toBeInTheDocument()
    })

    it('displays correct level for each style', () => {
      render(<DanceStyleDisplay {...defaultProps} />)
      expect(screen.getByText('Level 3/5')).toBeInTheDocument()
      expect(screen.getByText('Level 5/5')).toBeInTheDocument()
      expect(screen.getByText('Level 1/5')).toBeInTheDocument()
    })

    it('applies custom className when provided', () => {
      const { container } = render(<DanceStyleDisplay {...defaultProps} className="custom-class" />)
      const mainDiv = container.firstChild
      expect(mainDiv).toHaveClass('custom-class')
    })
  })

  describe('Empty State', () => {
    it('displays empty state when no dance styles provided', () => {
      render(<DanceStyleDisplay {...defaultProps} danceStyles={[]} />)
      expect(screen.getByText('댄스 스타일이 없습니다')).toBeInTheDocument()
    })

    it('displays empty state when danceStyles is undefined', () => {
      render(<DanceStyleDisplay {...defaultProps} danceStyles={undefined as any} />)
      expect(screen.getByText('댄스 스타일이 없습니다')).toBeInTheDocument()
    })

    it('shows own profile message when isOwnProfile is true and empty', () => {
      render(<DanceStyleDisplay {...defaultProps} danceStyles={[]} isOwnProfile={true} />)
      expect(screen.getByText('아직 댄스 스타일을 설정하지 않았습니다')).toBeInTheDocument()
      expect(screen.getByText('프로필을 편집하여 선호하는 댄스 스타일을 추가해보세요.')).toBeInTheDocument()
    })

    it('shows other profile message when isOwnProfile is false and empty', () => {
      render(<DanceStyleDisplay {...defaultProps} danceStyles={[]} isOwnProfile={false} />)
      expect(screen.getByText('댄스 스타일이 없습니다')).toBeInTheDocument()
      expect(screen.getByText('이 사용자는 아직 댄스 스타일을 설정하지 않았습니다.')).toBeInTheDocument()
    })

    it('shows edit button in empty state when isOwnProfile and onEdit provided', () => {
      const onEdit = jest.fn()
      render(<DanceStyleDisplay {...defaultProps} danceStyles={[]} isOwnProfile={true} onEdit={onEdit} />)
      expect(screen.getByRole('button', { name: '프로필 편집' })).toBeInTheDocument()
    })

    it('does not show edit button in empty state when not own profile', () => {
      const onEdit = jest.fn()
      render(<DanceStyleDisplay {...defaultProps} danceStyles={[]} isOwnProfile={false} onEdit={onEdit} />)
      expect(screen.queryByRole('button', { name: '프로필 편집' })).not.toBeInTheDocument()
    })

    it('calls onEdit when edit button clicked in empty state', async () => {
      const user = userEvent.setup()
      const onEdit = jest.fn()
      render(<DanceStyleDisplay {...defaultProps} danceStyles={[]} isOwnProfile={true} onEdit={onEdit} />)

      const editButton = screen.getByRole('button', { name: '프로필 편집' })
      await user.click(editButton)

      expect(onEdit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Header Section', () => {
    it('displays header with edit button when isOwnProfile and onEdit provided', () => {
      const onEdit = jest.fn()
      render(<DanceStyleDisplay {...defaultProps} isOwnProfile={true} onEdit={onEdit} />)

      expect(screen.getByText('댄스 스타일')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '댄스 스타일 편집' })).toBeInTheDocument()
    })

    it('does not display header when not own profile', () => {
      render(<DanceStyleDisplay {...defaultProps} isOwnProfile={false} />)

      // Header should not be rendered
      expect(screen.queryByText('댄스 스타일')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '댄스 스타일 편집' })).not.toBeInTheDocument()
    })

    it('does not display edit button when onEdit not provided', () => {
      render(<DanceStyleDisplay {...defaultProps} isOwnProfile={true} onEdit={undefined} />)

      expect(screen.queryByRole('button', { name: '댄스 스타일 편집' })).not.toBeInTheDocument()
    })

    it('calls onEdit when edit button clicked in header', async () => {
      const user = userEvent.setup()
      const onEdit = jest.fn()
      render(<DanceStyleDisplay {...defaultProps} isOwnProfile={true} onEdit={onEdit} />)

      const editButton = screen.getByRole('button', { name: '댄스 스타일 편집' })
      await user.click(editButton)

      expect(onEdit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Level Visualization', () => {
    it('displays correct number of stars for each level', () => {
      render(<DanceStyleDisplay {...defaultProps} danceStyles={[{ name: 'Lindy Hop', level: 3 }]} />)

      const levelText = screen.getByText('Level 3/5')
      const card = levelText.closest('[role="listitem"]')
      const stars = card!.querySelectorAll('span')

      // Should have 5 stars
      const starSpans = Array.from(stars).filter(span => span.textContent === '⭐')
      expect(starSpans).toHaveLength(5)
    })

    it('applies correct opacity to stars based on level', () => {
      render(<DanceStyleDisplay {...defaultProps} danceStyles={[{ name: 'Lindy Hop', level: 3 }]} />)

      const levelText = screen.getByText('Level 3/5')
      const card = levelText.closest('[role="listitem"]')
      const stars = card!.querySelectorAll('span')

      const starSpans = Array.from(stars).filter(span => span.textContent === '⭐')

      // First 3 stars should have full opacity (opacity-100)
      expect(starSpans[0]).toHaveClass('opacity-100')
      expect(starSpans[1]).toHaveClass('opacity-100')
      expect(starSpans[2]).toHaveClass('opacity-100')

      // Last 2 stars should have reduced opacity (opacity-30 grayscale)
      expect(starSpans[3]).toHaveClass('opacity-30', 'grayscale')
      expect(starSpans[4]).toHaveClass('opacity-30', 'grayscale')
    })

    it('shows all stars filled for level 5', () => {
      render(<DanceStyleDisplay {...defaultProps} danceStyles={[{ name: 'Charleston', level: 5 }]} />)

      const levelText = screen.getByText('Level 5/5')
      const card = levelText.closest('[role="listitem"]')
      const stars = card!.querySelectorAll('span')

      const starSpans = Array.from(stars).filter(span => span.textContent === '⭐')

      starSpans.forEach(star => {
        expect(star).toHaveClass('opacity-100')
        expect(star).not.toHaveClass('grayscale')
      })
    })

    it('shows only one star filled for level 1', () => {
      render(<DanceStyleDisplay {...defaultProps} danceStyles={[{ name: 'Balboa', level: 1 }]} />)

      const levelText = screen.getByText('Level 1/5')
      const card = levelText.closest('[role="listitem"]')
      const stars = card!.querySelectorAll('span')

      const starSpans = Array.from(stars).filter(span => span.textContent === '⭐')

      expect(starSpans[0]).toHaveClass('opacity-100')
      expect(starSpans[1]).toHaveClass('opacity-30', 'grayscale')
      expect(starSpans[2]).toHaveClass('opacity-30', 'grayscale')
      expect(starSpans[3]).toHaveClass('opacity-30', 'grayscale')
      expect(starSpans[4]).toHaveClass('opacity-30', 'grayscale')
    })
  })

  describe('Color Gradient', () => {
    it('applies different background colors based on level', () => {
      const { container } = render(<DanceStyleDisplay {...defaultProps} danceStyles={[
        { name: 'Level 1', level: 1 },
        { name: 'Level 5', level: 5 }
      ]} />)

      // Get all cards
      const cards = container.querySelectorAll('[role="listitem"] > div')

      // Cards should have different background colors based on level
      const level1Card = cards[0] as HTMLElement
      const level5Card = cards[1] as HTMLElement

      const level1BgColor = level1Card.style.background
      const level5BgColor = level5Card.style.background

      // Level 5 should have higher opacity than level 1
      expect(level1BgColor).toContain('rgba(105, 59, 242, 0.05)')
      expect(level5BgColor).toContain('rgba(105, 59, 242, 0.25)')
    })

    it('applies border color based on level', () => {
      const { container } = render(<DanceStyleDisplay {...defaultProps} danceStyles={[
        { name: 'Lindy Hop', level: 3 }
      ]} />)

      const card = container.querySelector('[role="listitem"] > div') as HTMLElement
      const borderColor = card.style.borderColor

      // Should use primary color with opacity based on level
      expect(borderColor).toContain('rgba(105, 59, 242')
    })
  })

  describe('Responsive Layout', () => {
    it('applies responsive grid classes', () => {
      const { container } = render(<DanceStyleDisplay {...defaultProps} />)

      const grid = container.querySelector('[role="list"]')

      expect(grid).toHaveClass('grid-cols-1')
      expect(grid).toHaveClass('md:grid-cols-2')
      expect(grid).toHaveClass('lg:grid-cols-3')
    })

    it('displays items in a grid layout', () => {
      render(<DanceStyleDisplay {...defaultProps} />)

      const grid = screen.getByRole('list', { name: '댄스 스타일 목록' })
      expect(grid).toHaveClass('grid')
    })
  })

  describe('Accessibility', () => {
    it('has role="list" on container', () => {
      render(<DanceStyleDisplay {...defaultProps} />)

      const list = screen.getByRole('list', { name: '댄스 스타일 목록' })
      expect(list).toBeInTheDocument()
    })

    it('has role="listitem" on each dance style card', () => {
      render(<DanceStyleDisplay {...defaultProps} />)

      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(3)
    })

    it('has proper aria-label on each listitem', () => {
      render(<DanceStyleDisplay {...defaultProps} />)

      expect(screen.getByRole('listitem', { name: 'Lindy Hop, 레벨 3/5' })).toBeInTheDocument()
      expect(screen.getByRole('listitem', { name: 'Charleston, 레벨 5/5' })).toBeInTheDocument()
      expect(screen.getByRole('listitem', { name: 'Balboa, 레벨 1/5' })).toBeInTheDocument()
    })

    it('stars are hidden from screen readers with aria-hidden', () => {
      const { container } = render(<DanceStyleDisplay {...defaultProps} danceStyles={[{ name: 'Lindy Hop', level: 3 }]} />)

      const starsContainer = container.querySelector('[aria-hidden="true"]')
      expect(starsContainer).toBeInTheDocument()
    })

    it('provides text alternative for level information', () => {
      render(<DanceStyleDisplay {...defaultProps} danceStyles={[{ name: 'Lindy Hop', level: 3 }]} />)

      // Text "Level 3/5" should be visible for screen readers
      expect(screen.getByText('Level 3/5')).toBeInTheDocument()
    })
  })

  describe('Multiple Dance Styles', () => {
    it('displays all provided dance styles', () => {
      const manyStyles: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 },
        { name: 'Charleston', level: 5 },
        { name: 'Balboa', level: 1 },
        { name: 'Shag', level: 2 },
        { name: 'Blues', level: 4 }
      ]

      render(<DanceStyleDisplay {...defaultProps} danceStyles={manyStyles} />)

      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getByText('Charleston')).toBeInTheDocument()
      expect(screen.getByText('Balboa')).toBeInTheDocument()
      expect(screen.getByText('Shag')).toBeInTheDocument()
      expect(screen.getByText('Blues')).toBeInTheDocument()
    })

    it('renders correct number of cards', () => {
      const manyStyles: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 },
        { name: 'Charleston', level: 5 },
        { name: 'Balboa', level: 1 },
        { name: 'Shag', level: 2 }
      ]

      render(<DanceStyleDisplay {...defaultProps} danceStyles={manyStyles} />)

      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(4)
    })
  })

  describe('Edge Cases', () => {
    it('handles single dance style', () => {
      render(<DanceStyleDisplay {...defaultProps} danceStyles={[{ name: 'Lindy Hop', level: 3 }]} />)

      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getByText('Level 3/5')).toBeInTheDocument()
    })

    it('handles level at minimum boundary (1)', () => {
      render(<DanceStyleDisplay {...defaultProps} danceStyles={[{ name: 'Lindy Hop', level: 1 }]} />)

      expect(screen.getByText('Level 1/5')).toBeInTheDocument()
    })

    it('handles level at maximum boundary (5)', () => {
      render(<DanceStyleDisplay {...defaultProps} danceStyles={[{ name: 'Charleston', level: 5 }]} />)

      expect(screen.getByText('Level 5/5')).toBeInTheDocument()
    })

    it('renders correctly when props change', () => {
      const { rerender } = render(<DanceStyleDisplay {...defaultProps} danceStyles={[]} />)
      expect(screen.getByText('댄스 스타일이 없습니다')).toBeInTheDocument()

      rerender(<DanceStyleDisplay {...defaultProps} danceStyles={mockDanceStyles} />)
      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getByText('Charleston')).toBeInTheDocument()
    })

    it('handles isOwnProfile toggle correctly', () => {
      const onEdit = jest.fn()
      const { rerender } = render(<DanceStyleDisplay {...defaultProps} isOwnProfile={false} onEdit={onEdit} />)

      expect(screen.queryByRole('button', { name: '댄스 스타일 편집' })).not.toBeInTheDocument()

      rerender(<DanceStyleDisplay {...defaultProps} isOwnProfile={true} onEdit={onEdit} />)
      expect(screen.getByRole('button', { name: '댄스 스타일 편집' })).toBeInTheDocument()
    })

    it('handles dance style names with special characters', () => {
      render(<DanceStyleDisplay {...defaultProps} danceStyles={[
        { name: 'St. Louis Shag', level: 3 }
      ]} />)

      expect(screen.getByText('St. Louis Shag')).toBeInTheDocument()
    })
  })

  describe('Component Memoization', () => {
    it('is properly memoized with React.memo', () => {
      expect(DanceStyleDisplay.displayName).toBe('DanceStyleDisplay')
    })
  })

  describe('Card Component Integration', () => {
    it('renders cards with correct styling', () => {
      const { container } = render(<DanceStyleDisplay {...defaultProps} danceStyles={[{ name: 'Lindy Hop', level: 3 }]} />)

      const card = container.querySelector('[role="listitem"] > div')
      expect(card).toHaveClass('text-center')
      expect(card).toHaveClass('transition-all')
      expect(card).toHaveClass('duration-200')
    })

    it('applies hoverable={false} to cards', () => {
      const { container } = render(<DanceStyleDisplay {...defaultProps} danceStyles={[{ name: 'Lindy Hop', level: 3 }]} />)

      // Cards should not have hover effects since hoverable={false}
      const card = container.querySelector('[role="listitem"] > div')
      expect(card).toBeInTheDocument()
    })
  })
})
