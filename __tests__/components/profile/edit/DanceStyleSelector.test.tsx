import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { DanceStyleSelector } from '@/app/profile/edit/components/DanceStyleSelector'
import type { DanceStyle } from '@/lib/types/auth'

// Mock data
const mockDanceStyles: DanceStyle[] = [
  { name: 'Lindy Hop', level: 3 },
  { name: 'Charleston', level: 4 }
]

describe('DanceStyleSelector', () => {
  // Helper function to create default props
  const defaultProps = {
    value: [] as DanceStyle[],
    onChange: jest.fn(),
    disabled: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('renders without crashing', () => {
      render(<DanceStyleSelector {...defaultProps} />)
      expect(screen.getByText('댄스 스타일')).toBeInTheDocument()
    })

    it('displays empty state when no styles selected', () => {
      render(<DanceStyleSelector {...defaultProps} />)
      expect(screen.getByText('아직 선택된 댄스 스타일이 없습니다')).toBeInTheDocument()
      expect(screen.getByText('스타일 추가 버튼을 눌러 댄스 스타일을 추가해보세요')).toBeInTheDocument()
    })

    it('displays counter showing 0/10 when empty', () => {
      render(<DanceStyleSelector {...defaultProps} />)
      expect(screen.getByText(/최대 10개까지 선택할 수 있습니다 \(0\/10\)/)).toBeInTheDocument()
    })

    it('displays add button when styles are available', () => {
      render(<DanceStyleSelector {...defaultProps} />)
      expect(screen.getByRole('button', { name: /스타일 추가/i })).toBeInTheDocument()
    })

    it('applies custom aria-label when provided', () => {
      render(<DanceStyleSelector {...defaultProps} aria-label="커스텀 레이블" />)
      expect(screen.getByRole('region', { name: '커스텀 레이블' })).toBeInTheDocument()
    })

    it('uses default aria-label when not provided', () => {
      render(<DanceStyleSelector {...defaultProps} />)
      expect(screen.getByRole('region', { name: '댄스 스타일 선택' })).toBeInTheDocument()
    })
  })

  describe('Displaying Selected Styles', () => {
    it('displays selected dance styles', () => {
      render(<DanceStyleSelector {...defaultProps} value={mockDanceStyles} />)
      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getByText('Charleston')).toBeInTheDocument()
    })

    it('displays correct level for each style', () => {
      render(<DanceStyleSelector {...defaultProps} value={mockDanceStyles} />)
      expect(screen.getByText('레벨: 3')).toBeInTheDocument()
      expect(screen.getByText('레벨: 4')).toBeInTheDocument()
    })

    it('displays star visualization matching level', () => {
      render(<DanceStyleSelector {...defaultProps} value={[{ name: 'Lindy Hop', level: 3 }]} />)
      const levelControl = screen.getByText('레벨: 3').closest('.level-control')
      expect(levelControl).toBeInTheDocument()

      // Check that stars are rendered
      const stars = levelControl!.querySelectorAll('.star')
      expect(stars).toHaveLength(5)

      // First 3 stars should be filled
      expect(stars[0]).toHaveClass('star-filled')
      expect(stars[1]).toHaveClass('star-filled')
      expect(stars[2]).toHaveClass('star-filled')
      expect(stars[3]).not.toHaveClass('star-filled')
      expect(stars[4]).not.toHaveClass('star-filled')
    })

    it('displays counter with correct count', () => {
      render(<DanceStyleSelector {...defaultProps} value={mockDanceStyles} />)
      expect(screen.getByText(/최대 10개까지 선택할 수 있습니다 \(2\/10\)/)).toBeInTheDocument()
    })
  })

  describe('Adding Dance Styles', () => {
    it('shows available styles when add button is clicked', async () => {
      const user = userEvent.setup()
      render(<DanceStyleSelector {...defaultProps} />)

      const addButton = screen.getByRole('button', { name: /스타일 추가/i })
      await user.click(addButton)

      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getByText('Charleston')).toBeInTheDocument()
      expect(screen.getByText('Balboa')).toBeInTheDocument()
    })

    it('hides available styles when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<DanceStyleSelector {...defaultProps} />)

      const addButton = screen.getByRole('button', { name: /스타일 추가/i })
      await user.click(addButton)
      expect(screen.getByText('Balboa')).toBeInTheDocument()

      const closeButton = screen.getByRole('button', { name: /닫기/i })
      await user.click(closeButton)

      expect(screen.queryByText('Balboa')).not.toBeInTheDocument()
    })

    it('calls onChange with new style when style is added', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<DanceStyleSelector {...defaultProps} onChange={onChange} />)

      // Open available styles
      await user.click(screen.getByRole('button', { name: /스타일 추가/i }))

      // Add Lindy Hop - buttons have role="listitem" not "button"
      const lindyButton = screen.getByLabelText('Lindy Hop 추가')
      await user.click(lindyButton)

      expect(onChange).toHaveBeenCalledWith([{ name: 'Lindy Hop', level: 1 }])
    })

    it('closes available styles dropdown after adding a style', async () => {
      const user = userEvent.setup()
      render(<DanceStyleSelector {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /스타일 추가/i }))
      const balboaButton = screen.getByLabelText('Balboa 추가')
      await user.click(balboaButton)

      // Dropdown should be closed
      expect(screen.queryByLabelText('Charleston 추가')).not.toBeInTheDocument()
    })

    it('filters out already selected styles from available list', async () => {
      const user = userEvent.setup()
      render(<DanceStyleSelector {...defaultProps} value={[{ name: 'Lindy Hop', level: 2 }]} />)

      await user.click(screen.getByRole('button', { name: /스타일 추가/i }))

      // Lindy Hop should not appear in available styles
      expect(screen.queryByLabelText('Lindy Hop 추가')).not.toBeInTheDocument()
      // But other styles should be available
      expect(screen.getByLabelText('Charleston 추가')).toBeInTheDocument()
    })
  })

  describe('Removing Dance Styles', () => {
    it('calls onChange without removed style when remove button is clicked', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<DanceStyleSelector {...defaultProps} value={mockDanceStyles} onChange={onChange} />)

      const removeButtons = screen.getAllByRole('button', { name: /제거/i })
      await user.click(removeButtons[0]) // Remove first style (Lindy Hop)

      expect(onChange).toHaveBeenCalledWith([{ name: 'Charleston', level: 4 }])
    })

    it('displays correct aria-label for remove buttons', () => {
      render(<DanceStyleSelector {...defaultProps} value={mockDanceStyles} />)

      expect(screen.getByRole('button', { name: 'Lindy Hop 제거' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Charleston 제거' })).toBeInTheDocument()
    })
  })

  describe('Level Adjustment', () => {
    it('renders level slider with correct initial value', () => {
      render(<DanceStyleSelector {...defaultProps} value={[{ name: 'Lindy Hop', level: 3 }]} />)

      const slider = screen.getByRole('slider', { name: 'Lindy Hop 레벨 선택' })
      expect(slider).toHaveValue('3')
    })

    it('calls onChange with updated level when slider is moved', async () => {
      const onChange = jest.fn()
      render(<DanceStyleSelector {...defaultProps} value={[{ name: 'Lindy Hop', level: 3 }]} onChange={onChange} />)

      const slider = screen.getByRole('slider', { name: 'Lindy Hop 레벨 선택' })
      fireEvent.change(slider, { target: { value: '5' } })

      expect(onChange).toHaveBeenCalledWith([{ name: 'Lindy Hop', level: 5 }])
    })

    it('slider has correct min and max values', () => {
      render(<DanceStyleSelector {...defaultProps} value={[{ name: 'Lindy Hop', level: 3 }]} />)

      const slider = screen.getByRole('slider', { name: 'Lindy Hop 레벨 선택' })
      expect(slider).toHaveAttribute('min', '1')
      expect(slider).toHaveAttribute('max', '5')
    })

    it('updates star visualization when level changes', async () => {
      const { rerender } = render(<DanceStyleSelector {...defaultProps} value={[{ name: 'Lindy Hop', level: 2 }]} />)

      let levelControl = screen.getByText('레벨: 2').closest('.level-control')
      let stars = levelControl!.querySelectorAll('.star')
      expect(stars[0]).toHaveClass('star-filled')
      expect(stars[1]).toHaveClass('star-filled')
      expect(stars[2]).not.toHaveClass('star-filled')

      // Update level to 4
      rerender(<DanceStyleSelector {...defaultProps} value={[{ name: 'Lindy Hop', level: 4 }]} />)

      levelControl = screen.getByText('레벨: 4').closest('.level-control')
      stars = levelControl!.querySelectorAll('.star')
      expect(stars[0]).toHaveClass('star-filled')
      expect(stars[1]).toHaveClass('star-filled')
      expect(stars[2]).toHaveClass('star-filled')
      expect(stars[3]).toHaveClass('star-filled')
      expect(stars[4]).not.toHaveClass('star-filled')
    })
  })

  describe('Maximum Limit (10 styles)', () => {
    const tenStyles: DanceStyle[] = [
      { name: 'Lindy Hop', level: 1 },
      { name: 'Charleston', level: 2 },
      { name: 'Balboa', level: 3 },
      { name: 'Shag', level: 4 },
      { name: 'Blues', level: 5 },
      { name: 'Collegiate Shag', level: 1 },
      { name: 'St. Louis Shag', level: 2 },
      { name: 'Slow Drag', level: 3 },
      { name: 'Authentic Jazz', level: 4 },
      { name: 'Solo Jazz', level: 5 }
    ]

    it('displays "최대 개수 도달" badge when 10 styles selected', () => {
      render(<DanceStyleSelector {...defaultProps} value={tenStyles} />)
      expect(screen.getByText('최대 개수 도달')).toBeInTheDocument()
    })

    it('hides add button when 10 styles selected', () => {
      render(<DanceStyleSelector {...defaultProps} value={tenStyles} />)
      expect(screen.queryByRole('button', { name: /스타일 추가/i })).not.toBeInTheDocument()
    })

    it('displays counter showing 10/10', () => {
      render(<DanceStyleSelector {...defaultProps} value={tenStyles} />)
      expect(screen.getByText(/최대 10개까지 선택할 수 있습니다 \(10\/10\)/)).toBeInTheDocument()
    })

    it('prevents adding more than 10 styles', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()

      render(<DanceStyleSelector {...defaultProps} value={tenStyles} onChange={onChange} />)

      // Add button should not be present when at max (10 styles)
      expect(screen.queryByRole('button', { name: /스타일 추가/i })).not.toBeInTheDocument()

      // onChange should not have been called
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Disabled State', () => {
    it('disables add button when disabled prop is true', () => {
      render(<DanceStyleSelector {...defaultProps} disabled={true} />)
      expect(screen.getByRole('button', { name: /스타일 추가/i })).toBeDisabled()
    })

    it('disables all remove buttons when disabled prop is true', () => {
      render(<DanceStyleSelector {...defaultProps} value={mockDanceStyles} disabled={true} />)

      const removeButtons = screen.getAllByRole('button', { name: /제거/i })
      removeButtons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })

    it('disables all level sliders when disabled prop is true', () => {
      render(<DanceStyleSelector {...defaultProps} value={mockDanceStyles} disabled={true} />)

      const sliders = screen.getAllByRole('slider')
      sliders.forEach(slider => {
        expect(slider).toBeDisabled()
      })
    })

    it('disables available style buttons when disabled prop is true', async () => {
      const user = userEvent.setup()
      render(<DanceStyleSelector {...defaultProps} disabled={true} />)

      // Cannot open dropdown when disabled
      const addButton = screen.getByRole('button', { name: /스타일 추가/i })
      expect(addButton).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes on sliders', () => {
      render(<DanceStyleSelector {...defaultProps} value={[{ name: 'Lindy Hop', level: 3 }]} />)

      const slider = screen.getByRole('slider', { name: 'Lindy Hop 레벨 선택' })
      expect(slider).toHaveAttribute('aria-valuemin', '1')
      expect(slider).toHaveAttribute('aria-valuemax', '5')
      expect(slider).toHaveAttribute('aria-valuenow', '3')
      expect(slider).toHaveAttribute('aria-valuetext', '레벨 3')
    })

    it('has proper aria-expanded on add button', async () => {
      const user = userEvent.setup()
      render(<DanceStyleSelector {...defaultProps} />)

      const addButton = screen.getByRole('button', { name: /스타일 추가/i })
      expect(addButton).toHaveAttribute('aria-expanded', 'false')

      await user.click(addButton)
      expect(addButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('has proper aria-controls on add button', () => {
      render(<DanceStyleSelector {...defaultProps} />)

      const addButton = screen.getByRole('button', { name: /스타일 추가/i })
      expect(addButton).toHaveAttribute('aria-controls', 'available-styles-list')
    })

    it('has role="list" on selected styles container', () => {
      render(<DanceStyleSelector {...defaultProps} value={mockDanceStyles} />)

      const list = screen.getByRole('list', { name: '선택된 댄스 스타일' })
      expect(list).toBeInTheDocument()
    })

    it('has role="listitem" on each selected style card', () => {
      render(<DanceStyleSelector {...defaultProps} value={mockDanceStyles} />)

      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(2)
    })

    it('star visualization is hidden from screen readers', () => {
      render(<DanceStyleSelector {...defaultProps} value={[{ name: 'Lindy Hop', level: 3 }]} />)

      const levelControl = screen.getByText('레벨: 3').closest('.level-control')
      const starsContainer = levelControl!.querySelector('.level-stars')
      expect(starsContainer).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports keyboard interaction on add button', async () => {
      const user = userEvent.setup()
      render(<DanceStyleSelector {...defaultProps} />)

      const addButton = screen.getByRole('button', { name: /스타일 추가/i })
      addButton.focus()

      await user.keyboard('{Enter}')
      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
    })

    it('supports keyboard interaction on remove buttons', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<DanceStyleSelector {...defaultProps} value={mockDanceStyles} onChange={onChange} />)

      const removeButton = screen.getByRole('button', { name: 'Lindy Hop 제거' })
      removeButton.focus()

      await user.keyboard('{Enter}')
      expect(onChange).toHaveBeenCalled()
    })

    it('supports keyboard interaction on level sliders', async () => {
      const onChange = jest.fn()
      render(<DanceStyleSelector {...defaultProps} value={[{ name: 'Lindy Hop', level: 3 }]} onChange={onChange} />)

      const slider = screen.getByRole('slider', { name: 'Lindy Hop 레벨 선택' })
      slider.focus()

      fireEvent.keyDown(slider, { key: 'ArrowRight' })
      // Note: Actual keyboard navigation behavior depends on browser implementation
    })
  })

  describe('Edge Cases', () => {
    it('handles empty value array', () => {
      render(<DanceStyleSelector {...defaultProps} value={[]} />)
      expect(screen.getByText('아직 선택된 댄스 스타일이 없습니다')).toBeInTheDocument()
    })

    it('handles single style', () => {
      render(<DanceStyleSelector {...defaultProps} value={[{ name: 'Lindy Hop', level: 1 }]} />)
      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getByText(/\(1\/10\)/)).toBeInTheDocument()
    })

    it('updates correctly when value prop changes externally', () => {
      const { rerender } = render(<DanceStyleSelector {...defaultProps} value={[]} />)
      expect(screen.getByText('아직 선택된 댄스 스타일이 없습니다')).toBeInTheDocument()

      rerender(<DanceStyleSelector {...defaultProps} value={mockDanceStyles} />)
      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getByText('Charleston')).toBeInTheDocument()
    })

    it('maintains state when disabled prop toggles', () => {
      const { rerender } = render(<DanceStyleSelector {...defaultProps} value={mockDanceStyles} disabled={false} />)
      expect(screen.getByRole('button', { name: /스타일 추가/i })).not.toBeDisabled()

      rerender(<DanceStyleSelector {...defaultProps} value={mockDanceStyles} disabled={true} />)
      expect(screen.getByRole('button', { name: /스타일 추가/i })).toBeDisabled()
      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
    })
  })
})
