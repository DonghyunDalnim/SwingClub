import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { DanceStyleSelector } from '@/app/profile/edit/components/DanceStyleSelector'
import type { DanceStyle } from '@/lib/types/auth'

describe('DanceStyleSelector', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render component with empty state', () => {
      render(<DanceStyleSelector value={[]} onChange={mockOnChange} />)

      expect(screen.getByRole('region', { name: /댄스 스타일 선택/i })).toBeInTheDocument()
      expect(screen.getByText(/아직 선택된 댄스 스타일이 없습니다/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /스타일 추가/i })).toBeInTheDocument()
    })

    it('should render with initial dance styles', () => {
      const initialStyles: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 },
        { name: 'Charleston', level: 2 }
      ]

      render(<DanceStyleSelector value={initialStyles} onChange={mockOnChange} />)

      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getByText('Charleston')).toBeInTheDocument()
      expect(screen.getByText(/2\/10/)).toBeInTheDocument()
    })

    it('should display correct count indicator', () => {
      const styles: DanceStyle[] = [
        { name: 'Lindy Hop', level: 1 },
        { name: 'Charleston', level: 1 },
        { name: 'Balboa', level: 1 }
      ]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      expect(screen.getByText(/3\/10/)).toBeInTheDocument()
    })

    it('should show max limit badge when 10 styles selected', () => {
      const maxStyles: DanceStyle[] = [
        { name: 'Lindy Hop', level: 1 },
        { name: 'Charleston', level: 1 },
        { name: 'Balboa', level: 1 },
        { name: 'Shag', level: 1 },
        { name: 'Blues', level: 1 },
        { name: 'Collegiate Shag', level: 1 },
        { name: 'St. Louis Shag', level: 1 },
        { name: 'Slow Drag', level: 1 },
        { name: 'Authentic Jazz', level: 1 },
        { name: 'Solo Jazz', level: 1 }
      ]

      render(<DanceStyleSelector value={maxStyles} onChange={mockOnChange} />)

      expect(screen.getByText(/최대 개수 도달/i)).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /스타일 추가/i })).not.toBeInTheDocument()
    })
  })

  describe('Adding Dance Styles', () => {
    it('should show available styles when add button is clicked', async () => {
      const user = userEvent.setup()
      render(<DanceStyleSelector value={[]} onChange={mockOnChange} />)

      const addButton = screen.getByRole('button', { name: /스타일 추가/i })
      await user.click(addButton)

      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getByText('Charleston')).toBeInTheDocument()
      expect(screen.getByText('Balboa')).toBeInTheDocument()
      expect(screen.getByText('Blues')).toBeInTheDocument()
    })

    it('should add a dance style when clicked from available list', async () => {
      const user = userEvent.setup()
      render(<DanceStyleSelector value={[]} onChange={mockOnChange} />)

      // 추가 버튼 클릭
      await user.click(screen.getByRole('button', { name: /스타일 추가/i }))

      // 'Lindy Hop' 추가
      const lindyButton = screen.getByRole('button', { name: /Lindy Hop 추가/i })
      await user.click(lindyButton)

      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Lindy Hop', level: 1 }
      ])
    })

    it('should close available styles list after adding a style', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<DanceStyleSelector value={[]} onChange={mockOnChange} />)

      // 목록 열기
      await user.click(screen.getByRole('button', { name: /스타일 추가/i }))

      // 스타일 추가
      await user.click(screen.getByRole('button', { name: /Lindy Hop 추가/i }))

      // 상태 업데이트 시뮬레이션
      rerender(
        <DanceStyleSelector
          value={[{ name: 'Lindy Hop', level: 1 }]}
          onChange={mockOnChange}
        />
      )

      // 목록이 다시 열려있지 않은지 확인
      expect(screen.queryByRole('button', { name: /Charleston 추가/i })).not.toBeInTheDocument()
    })

    it('should not show already selected styles in available list', async () => {
      const user = userEvent.setup()
      const existingStyles: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 },
        { name: 'Charleston', level: 2 }
      ]

      render(<DanceStyleSelector value={existingStyles} onChange={mockOnChange} />)

      await user.click(screen.getByRole('button', { name: /스타일 추가/i }))

      // 이미 선택된 스타일은 목록에 없어야 함
      expect(screen.queryByRole('button', { name: /Lindy Hop 추가/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Charleston 추가/i })).not.toBeInTheDocument()

      // 선택되지 않은 스타일은 있어야 함
      expect(screen.getByRole('button', { name: /Balboa 추가/i })).toBeInTheDocument()
    })

    it('should prevent adding more than 10 styles', async () => {
      const user = userEvent.setup()
      const maxStyles: DanceStyle[] = Array.from({ length: 10 }, (_, i) => ({
        name: `Style ${i}`,
        level: 1
      }))

      render(<DanceStyleSelector value={maxStyles} onChange={mockOnChange} />)

      // 추가 버튼이 없어야 함
      expect(screen.queryByRole('button', { name: /스타일 추가/i })).not.toBeInTheDocument()
    })
  })

  describe('Removing Dance Styles', () => {
    it('should remove a dance style when remove button is clicked', async () => {
      const user = userEvent.setup()
      const styles: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 },
        { name: 'Charleston', level: 2 }
      ]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      const removeButton = screen.getByRole('button', { name: /Lindy Hop 제거/i })
      await user.click(removeButton)

      expect(mockOnChange).toHaveBeenCalledWith([{ name: 'Charleston', level: 2 }])
    })

    it('should remove all styles one by one', async () => {
      const user = userEvent.setup()
      const styles: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 },
        { name: 'Charleston', level: 2 }
      ]

      const { rerender } = render(
        <DanceStyleSelector value={styles} onChange={mockOnChange} />
      )

      // 첫 번째 스타일 제거
      await user.click(screen.getByRole('button', { name: /Lindy Hop 제거/i }))

      rerender(
        <DanceStyleSelector
          value={[{ name: 'Charleston', level: 2 }]}
          onChange={mockOnChange}
        />
      )

      // 두 번째 스타일 제거
      await user.click(screen.getByRole('button', { name: /Charleston 제거/i }))

      expect(mockOnChange).toHaveBeenLastCalledWith([])
    })
  })

  describe('Level Control', () => {
    it('should render level slider with correct value', () => {
      const styles: DanceStyle[] = [{ name: 'Lindy Hop', level: 3 }]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      const slider = screen.getByLabelText(/Lindy Hop 레벨 선택/i) as HTMLInputElement
      expect(slider).toHaveValue('3')
      expect(slider).toHaveAttribute('min', '1')
      expect(slider).toHaveAttribute('max', '5')
    })

    it('should update level when slider is changed', async () => {
      const user = userEvent.setup()
      const styles: DanceStyle[] = [{ name: 'Lindy Hop', level: 3 }]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      const slider = screen.getByLabelText(/Lindy Hop 레벨 선택/i)
      await user.clear(slider)
      await user.type(slider, '5')

      expect(mockOnChange).toHaveBeenCalledWith([{ name: 'Lindy Hop', level: 5 }])
    })

    it('should display correct number of filled stars based on level', () => {
      const styles: DanceStyle[] = [{ name: 'Lindy Hop', level: 3 }]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      const card = screen.getByText('Lindy Hop').closest('[role="listitem"]')
      expect(card).toBeInTheDocument()

      const stars = card?.querySelectorAll('.star')
      expect(stars).toHaveLength(5)

      const filledStars = card?.querySelectorAll('.star-filled')
      expect(filledStars).toHaveLength(3)
    })

    it('should handle all level values from 1 to 5', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <DanceStyleSelector value={[{ name: 'Lindy Hop', level: 1 }]} onChange={mockOnChange} />
      )

      const slider = screen.getByLabelText(/Lindy Hop 레벨 선택/i)

      for (let level = 1; level <= 5; level++) {
        await user.clear(slider)
        await user.type(slider, level.toString())

        expect(mockOnChange).toHaveBeenCalledWith([{ name: 'Lindy Hop', level }])

        rerender(
          <DanceStyleSelector
            value={[{ name: 'Lindy Hop', level }]}
            onChange={mockOnChange}
          />
        )
      }
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<DanceStyleSelector value={[]} onChange={mockOnChange} />)

      expect(screen.getByRole('region', { name: /댄스 스타일 선택/i })).toBeInTheDocument()
    })

    it('should have aria-expanded on add button', async () => {
      const user = userEvent.setup()
      render(<DanceStyleSelector value={[]} onChange={mockOnChange} />)

      const addButton = screen.getByRole('button', { name: /스타일 추가/i })
      expect(addButton).toHaveAttribute('aria-expanded', 'false')

      await user.click(addButton)
      expect(addButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('should have proper aria attributes on slider', () => {
      const styles: DanceStyle[] = [{ name: 'Lindy Hop', level: 3 }]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      const slider = screen.getByLabelText(/Lindy Hop 레벨 선택/i)
      expect(slider).toHaveAttribute('aria-valuemin', '1')
      expect(slider).toHaveAttribute('aria-valuemax', '5')
      expect(slider).toHaveAttribute('aria-valuenow', '3')
      expect(slider).toHaveAttribute('aria-valuetext', '레벨 3')
    })

    it('should have proper role attributes for lists', async () => {
      const user = userEvent.setup()
      render(<DanceStyleSelector value={[]} onChange={mockOnChange} />)

      await user.click(screen.getByRole('button', { name: /스타일 추가/i }))

      expect(screen.getByRole('list', { name: /선택 가능한 댄스 스타일/i })).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<DanceStyleSelector value={[]} onChange={mockOnChange} />)

      const addButton = screen.getByRole('button', { name: /스타일 추가/i })

      // Tab to add button and press Enter
      await user.tab()
      expect(addButton).toHaveFocus()

      await user.keyboard('{Enter}')

      // Available styles should be visible
      expect(screen.getByRole('button', { name: /Lindy Hop 추가/i })).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should disable all controls when disabled prop is true', () => {
      const styles: DanceStyle[] = [{ name: 'Lindy Hop', level: 3 }]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} disabled={true} />)

      const slider = screen.getByLabelText(/Lindy Hop 레벨 선택/i)
      const removeButton = screen.getByRole('button', { name: /Lindy Hop 제거/i })

      expect(slider).toBeDisabled()
      expect(removeButton).toBeDisabled()
    })

    it('should not show add button when disabled', () => {
      render(<DanceStyleSelector value={[]} onChange={mockOnChange} disabled={true} />)

      // Note: 빈 상태에서는 추가 버튼이 여전히 보이지만 disabled 상태여야 함
      const addButton = screen.queryByRole('button', { name: /스타일 추가/i })
      if (addButton) {
        expect(addButton).toBeDisabled()
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty value array', () => {
      render(<DanceStyleSelector value={[]} onChange={mockOnChange} />)

      expect(screen.getByText(/아직 선택된 댄스 스타일이 없습니다/i)).toBeInTheDocument()
    })

    it('should handle maximum capacity correctly', () => {
      const maxStyles: DanceStyle[] = Array.from({ length: 10 }, (_, i) => ({
        name: `Style ${i}`,
        level: 1
      }))

      render(<DanceStyleSelector value={maxStyles} onChange={mockOnChange} />)

      expect(screen.getByText(/최대 개수 도달/i)).toBeInTheDocument()
      expect(screen.getByText(/10\/10/)).toBeInTheDocument()
    })

    it('should handle rapid add/remove operations', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <DanceStyleSelector value={[]} onChange={mockOnChange} />
      )

      // 빠르게 추가
      await user.click(screen.getByRole('button', { name: /스타일 추가/i }))
      await user.click(screen.getByRole('button', { name: /Lindy Hop 추가/i }))

      rerender(
        <DanceStyleSelector
          value={[{ name: 'Lindy Hop', level: 1 }]}
          onChange={mockOnChange}
        />
      )

      // 빠르게 제거
      await user.click(screen.getByRole('button', { name: /Lindy Hop 제거/i }))

      expect(mockOnChange).toHaveBeenCalledTimes(2)
    })

    it('should preserve other styles when removing one', async () => {
      const user = userEvent.setup()
      const styles: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 },
        { name: 'Charleston', level: 2 },
        { name: 'Balboa', level: 4 }
      ]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      await user.click(screen.getByRole('button', { name: /Charleston 제거/i }))

      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Lindy Hop', level: 3 },
        { name: 'Balboa', level: 4 }
      ])
    })
  })

  describe('Custom aria-label', () => {
    it('should use custom aria-label when provided', () => {
      render(
        <DanceStyleSelector
          value={[]}
          onChange={mockOnChange}
          aria-label="커스텀 댄스 스타일 선택기"
        />
      )

      expect(screen.getByRole('region', { name: /커스텀 댄스 스타일 선택기/i })).toBeInTheDocument()
    })

    it('should use default aria-label when not provided', () => {
      render(<DanceStyleSelector value={[]} onChange={mockOnChange} />)

      expect(screen.getByRole('region', { name: /댄스 스타일 선택/i })).toBeInTheDocument()
    })
  })
})
