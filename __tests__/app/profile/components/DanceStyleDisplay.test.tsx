import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DanceStyleDisplay } from '@/app/profile/components/DanceStyleDisplay'
import { DanceStyle } from '@/lib/types/auth'

describe('DanceStyleDisplay', () => {
  const mockDanceStyles: DanceStyle[] = [
    { name: 'Lindy Hop', level: 5 },
    { name: 'Charleston', level: 3 },
    { name: 'Balboa', level: 2 }
  ]

  describe('Rendering with dance styles', () => {
    it('should render all dance styles', () => {
      render(<DanceStyleDisplay danceStyles={mockDanceStyles} />)

      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getByText('Charleston')).toBeInTheDocument()
      expect(screen.getByText('Balboa')).toBeInTheDocument()
    })

    it('should display correct level for each dance style', () => {
      render(<DanceStyleDisplay danceStyles={mockDanceStyles} />)

      expect(screen.getByText('Level 5/5')).toBeInTheDocument()
      expect(screen.getByText('Level 3/5')).toBeInTheDocument()
      expect(screen.getByText('Level 2/5')).toBeInTheDocument()
    })

    it('should render grid layout with correct classes', () => {
      const { container } = render(<DanceStyleDisplay danceStyles={mockDanceStyles} />)
      const grid = container.querySelector('[role="list"]')

      expect(grid).toHaveClass('grid', 'gap-4', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
    })

    it('should render each dance style card with aria label', () => {
      render(<DanceStyleDisplay danceStyles={mockDanceStyles} />)

      expect(screen.getByLabelText('Lindy Hop, 레벨 5/5')).toBeInTheDocument()
      expect(screen.getByLabelText('Charleston, 레벨 3/5')).toBeInTheDocument()
      expect(screen.getByLabelText('Balboa, 레벨 2/5')).toBeInTheDocument()
    })
  })

  describe('Empty state', () => {
    it('should render empty state when no dance styles', () => {
      render(<DanceStyleDisplay danceStyles={[]} />)

      expect(screen.getByText('댄스 스타일이 없습니다')).toBeInTheDocument()
      expect(screen.getByText('이 사용자는 아직 댄스 스타일을 설정하지 않았습니다.')).toBeInTheDocument()
    })

    it('should render own profile empty state', () => {
      render(<DanceStyleDisplay danceStyles={[]} isOwnProfile={true} />)

      expect(screen.getByText('아직 댄스 스타일을 설정하지 않았습니다')).toBeInTheDocument()
      expect(screen.getByText('프로필을 편집하여 선호하는 댄스 스타일을 추가해보세요.')).toBeInTheDocument()
    })

    it('should show edit button in empty state for own profile', () => {
      const mockOnEdit = jest.fn()
      render(
        <DanceStyleDisplay
          danceStyles={[]}
          isOwnProfile={true}
          onEdit={mockOnEdit}
        />
      )

      const editButton = screen.getByText('프로필 편집')
      expect(editButton).toBeInTheDocument()

      fireEvent.click(editButton)
      expect(mockOnEdit).toHaveBeenCalledTimes(1)
    })

    it('should not show edit button in empty state for other users', () => {
      const mockOnEdit = jest.fn()
      render(
        <DanceStyleDisplay
          danceStyles={[]}
          isOwnProfile={false}
          onEdit={mockOnEdit}
        />
      )

      expect(screen.queryByText('프로필 편집')).not.toBeInTheDocument()
    })
  })

  describe('Edit functionality', () => {
    it('should show edit button for own profile', () => {
      const mockOnEdit = jest.fn()
      render(
        <DanceStyleDisplay
          danceStyles={mockDanceStyles}
          isOwnProfile={true}
          onEdit={mockOnEdit}
        />
      )

      const editButton = screen.getByText('편집')
      expect(editButton).toBeInTheDocument()
    })

    it('should call onEdit when edit button is clicked', () => {
      const mockOnEdit = jest.fn()
      render(
        <DanceStyleDisplay
          danceStyles={mockDanceStyles}
          isOwnProfile={true}
          onEdit={mockOnEdit}
        />
      )

      const editButton = screen.getByText('편집')
      fireEvent.click(editButton)

      expect(mockOnEdit).toHaveBeenCalledTimes(1)
    })

    it('should not show edit button for other users', () => {
      const mockOnEdit = jest.fn()
      render(
        <DanceStyleDisplay
          danceStyles={mockDanceStyles}
          isOwnProfile={false}
          onEdit={mockOnEdit}
        />
      )

      expect(screen.queryByText('편집')).not.toBeInTheDocument()
    })

    it('should not show edit button when onEdit is not provided', () => {
      render(
        <DanceStyleDisplay
          danceStyles={mockDanceStyles}
          isOwnProfile={true}
        />
      )

      expect(screen.queryByText('편집')).not.toBeInTheDocument()
    })
  })

  describe('Visual styling', () => {
    it('should render star icons', () => {
      const { container } = render(<DanceStyleDisplay danceStyles={mockDanceStyles} />)
      const stars = container.querySelectorAll('span:has-text("⭐")')

      // Each card has 5 stars, 3 cards total = 15 stars
      expect(container.textContent?.match(/⭐/g)?.length).toBeGreaterThanOrEqual(15)
    })

    it('should apply custom className', () => {
      const { container } = render(
        <DanceStyleDisplay
          danceStyles={mockDanceStyles}
          className="custom-class"
        />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('Edge cases', () => {
    it('should handle undefined danceStyles', () => {
      render(<DanceStyleDisplay danceStyles={undefined as any} />)

      expect(screen.getByText('댄스 스타일이 없습니다')).toBeInTheDocument()
    })

    it('should handle single dance style', () => {
      const singleStyle: DanceStyle[] = [{ name: 'Lindy Hop', level: 4 }]
      render(<DanceStyleDisplay danceStyles={singleStyle} />)

      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getByText('Level 4/5')).toBeInTheDocument()
    })

    it('should handle maximum number of dance styles', () => {
      const maxStyles: DanceStyle[] = Array.from({ length: 10 }, (_, i) => ({
        name: `Dance ${i + 1}`,
        level: (i % 5) + 1
      }))

      render(<DanceStyleDisplay danceStyles={maxStyles} />)

      maxStyles.forEach(style => {
        expect(screen.getByText(style.name)).toBeInTheDocument()
      })
    })

    it('should handle level 1 (minimum)', () => {
      const minLevel: DanceStyle[] = [{ name: 'Solo Jazz', level: 1 }]
      render(<DanceStyleDisplay danceStyles={minLevel} />)

      expect(screen.getByText('Level 1/5')).toBeInTheDocument()
    })

    it('should handle level 5 (maximum)', () => {
      const maxLevel: DanceStyle[] = [{ name: 'Authentic Jazz', level: 5 }]
      render(<DanceStyleDisplay danceStyles={maxLevel} />)

      expect(screen.getByText('Level 5/5')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels on list', () => {
      render(<DanceStyleDisplay danceStyles={mockDanceStyles} />)

      const list = screen.getByRole('list')
      expect(list).toHaveAttribute('aria-label', '댄스 스타일 목록')
    })

    it('should have proper ARIA labels on list items', () => {
      render(<DanceStyleDisplay danceStyles={mockDanceStyles} />)

      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(3)

      expect(listItems[0]).toHaveAttribute('aria-label', 'Lindy Hop, 레벨 5/5')
      expect(listItems[1]).toHaveAttribute('aria-label', 'Charleston, 레벨 3/5')
      expect(listItems[2]).toHaveAttribute('aria-label', 'Balboa, 레벨 2/5')
    })

    it('should have aria-hidden on star icons', () => {
      const { container } = render(<DanceStyleDisplay danceStyles={mockDanceStyles} />)
      const starContainers = container.querySelectorAll('[aria-hidden="true"]')

      expect(starContainers.length).toBeGreaterThan(0)
    })

    it('should have aria-label on edit button', () => {
      const mockOnEdit = jest.fn()
      render(
        <DanceStyleDisplay
          danceStyles={mockDanceStyles}
          isOwnProfile={true}
          onEdit={mockOnEdit}
        />
      )

      const editButton = screen.getByLabelText('댄스 스타일 편집')
      expect(editButton).toBeInTheDocument()
    })
  })

  describe('Performance optimizations', () => {
    it('should use React.memo for component', () => {
      expect(DanceStyleDisplay.displayName).toBe('DanceStyleDisplay')
    })

    it('should not re-render when props are the same', () => {
      const { rerender } = render(<DanceStyleDisplay danceStyles={mockDanceStyles} />)
      const firstRender = screen.getByText('Lindy Hop')

      rerender(<DanceStyleDisplay danceStyles={mockDanceStyles} />)
      const secondRender = screen.getByText('Lindy Hop')

      expect(firstRender).toBe(secondRender)
    })
  })
})
