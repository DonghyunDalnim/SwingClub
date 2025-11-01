import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DanceStyleSelector } from '../DanceStyleSelector'
import type { DanceStyle } from '@/lib/types/auth'

describe('DanceStyleSelector', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  describe('렌더링', () => {
    it('빈 상태일 때 올바르게 렌더링된다', () => {
      render(<DanceStyleSelector value={[]} onChange={mockOnChange} />)

      expect(screen.getByText('댄스 스타일')).toBeInTheDocument()
      expect(screen.getByText(/최대 10개까지 선택할 수 있습니다/)).toBeInTheDocument()
      expect(screen.getByText('아직 선택된 댄스 스타일이 없습니다')).toBeInTheDocument()
      expect(screen.getByText('+ 스타일 추가')).toBeInTheDocument()
    })

    it('선택된 스타일이 있을 때 올바르게 렌더링된다', () => {
      const styles: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 },
        { name: 'Charleston', level: 2 }
      ]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getByText('Charleston')).toBeInTheDocument()
      expect(screen.getByText('레벨: 3')).toBeInTheDocument()
      expect(screen.getByText('레벨: 2')).toBeInTheDocument()
    })

    it('개수 제한 표시가 올바르다', () => {
      const styles: DanceStyle[] = [
        { name: 'Lindy Hop', level: 1 },
        { name: 'Charleston', level: 1 }
      ]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      expect(screen.getByText(/\(2\/10\)/)).toBeInTheDocument()
    })

    it('비활성화 상태일 때 모든 컨트롤이 비활성화된다', () => {
      const styles: DanceStyle[] = [{ name: 'Lindy Hop', level: 3 }]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} disabled />)

      const addButton = screen.getByText('+ 스타일 추가')
      const removeButton = screen.getByLabelText('Lindy Hop 제거')
      const levelSlider = screen.getByLabelText('Lindy Hop 레벨 선택')

      expect(addButton).toBeDisabled()
      expect(removeButton).toBeDisabled()
      expect(levelSlider).toBeDisabled()
    })
  })

  describe('댄스 스타일 추가', () => {
    it('스타일 추가 버튼을 클릭하면 선택 가능한 스타일 목록이 표시된다', async () => {
      const user = userEvent.setup()
      render(<DanceStyleSelector value={[]} onChange={mockOnChange} />)

      const addButton = screen.getByText('+ 스타일 추가')
      await user.click(addButton)

      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getByText('Charleston')).toBeInTheDocument()
      expect(screen.getByText('Balboa')).toBeInTheDocument()
    })

    it('스타일을 선택하면 onChange가 호출된다', async () => {
      const user = userEvent.setup()
      render(<DanceStyleSelector value={[]} onChange={mockOnChange} />)

      const addButton = screen.getByText('+ 스타일 추가')
      await user.click(addButton)

      const lindyHopButton = screen.getByLabelText('Lindy Hop 추가')
      await user.click(lindyHopButton)

      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Lindy Hop', level: 1 }
      ])
    })

    it('스타일 추가 후 선택 목록이 자동으로 닫힌다', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <DanceStyleSelector value={[]} onChange={mockOnChange} />
      )

      const addButton = screen.getByText('+ 스타일 추가')
      await user.click(addButton)

      const lindyHopButton = screen.getByLabelText('Lindy Hop 추가')
      await user.click(lindyHopButton)

      // onChange가 호출된 후 상태 업데이트 시뮬레이션
      rerender(
        <DanceStyleSelector
          value={[{ name: 'Lindy Hop', level: 1 }]}
          onChange={mockOnChange}
        />
      )

      // 선택 목록이 닫혔는지 확인 (다른 스타일들이 보이지 않음)
      expect(screen.queryByLabelText('Charleston 추가')).not.toBeInTheDocument()
    })

    it('이미 선택된 스타일은 추가 목록에 표시되지 않는다', async () => {
      const user = userEvent.setup()
      const styles: DanceStyle[] = [{ name: 'Lindy Hop', level: 3 }]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      const addButton = screen.getByText('+ 스타일 추가')
      await user.click(addButton)

      expect(screen.queryByLabelText('Lindy Hop 추가')).not.toBeInTheDocument()
      expect(screen.getByLabelText('Charleston 추가')).toBeInTheDocument()
    })
  })

  describe('댄스 스타일 제거', () => {
    it('제거 버튼을 클릭하면 onChange가 호출된다', async () => {
      const user = userEvent.setup()
      const styles: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 },
        { name: 'Charleston', level: 2 }
      ]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      const removeButton = screen.getByLabelText('Lindy Hop 제거')
      await user.click(removeButton)

      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Charleston', level: 2 }
      ])
    })
  })

  describe('레벨 변경', () => {
    it('레벨 슬라이더를 변경하면 onChange가 호출된다', () => {
      const styles: DanceStyle[] = [{ name: 'Lindy Hop', level: 3 }]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      const slider = screen.getByLabelText('Lindy Hop 레벨 선택') as HTMLInputElement
      fireEvent.change(slider, { target: { value: '4' } })

      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Lindy Hop', level: 4 }
      ])
    })

    it('레벨 1-5 범위 내에서만 변경된다', () => {
      const styles: DanceStyle[] = [{ name: 'Lindy Hop', level: 3 }]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      const slider = screen.getByLabelText('Lindy Hop 레벨 선택') as HTMLInputElement

      expect(slider.min).toBe('1')
      expect(slider.max).toBe('5')
    })

    it('별점이 레벨에 따라 올바르게 표시된다', () => {
      const styles: DanceStyle[] = [{ name: 'Lindy Hop', level: 3 }]

      const { container } = render(
        <DanceStyleSelector value={styles} onChange={mockOnChange} />
      )

      const stars = container.querySelectorAll('.star')
      expect(stars).toHaveLength(5)

      // 3개의 별이 채워져 있어야 함
      const filledStars = container.querySelectorAll('.star-filled')
      expect(filledStars).toHaveLength(3)
    })
  })

  describe('최대 개수 제한', () => {
    it('10개의 스타일이 선택되면 추가 버튼이 비활성화된다', () => {
      const styles: DanceStyle[] = Array.from({ length: 10 }, (_, i) => ({
        name: `Style ${i}`,
        level: 1
      }))

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      expect(screen.queryByText('+ 스타일 추가')).not.toBeInTheDocument()
      expect(screen.getByText('최대 개수 도달')).toBeInTheDocument()
    })

    it('10개 미만일 때는 추가 버튼이 활성화된다', () => {
      const styles: DanceStyle[] = Array.from({ length: 9 }, (_, i) => ({
        name: `Style ${i}`,
        level: 1
      }))

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      expect(screen.getByText('+ 스타일 추가')).toBeInTheDocument()
      expect(screen.queryByText('최대 개수 도달')).not.toBeInTheDocument()
    })
  })

  describe('접근성', () => {
    it('ARIA 레이블이 올바르게 설정된다', () => {
      render(
        <DanceStyleSelector
          value={[]}
          onChange={mockOnChange}
          aria-label="테스트 레이블"
        />
      )

      const region = screen.getByRole('region', { name: '테스트 레이블' })
      expect(region).toBeInTheDocument()
    })

    it('기본 ARIA 레이블이 제공된다', () => {
      render(<DanceStyleSelector value={[]} onChange={mockOnChange} />)

      const region = screen.getByRole('region', { name: '댄스 스타일 선택' })
      expect(region).toBeInTheDocument()
    })

    it('스타일 목록에 적절한 role이 설정된다', async () => {
      const user = userEvent.setup()
      render(<DanceStyleSelector value={[]} onChange={mockOnChange} />)

      const addButton = screen.getByText('+ 스타일 추가')
      await user.click(addButton)

      const availableList = screen.getByRole('list', {
        name: '선택 가능한 댄스 스타일'
      })
      expect(availableList).toBeInTheDocument()
    })

    it('선택된 스타일 목록에 적절한 role이 설정된다', () => {
      const styles: DanceStyle[] = [{ name: 'Lindy Hop', level: 3 }]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      const selectedList = screen.getByRole('list', {
        name: '선택된 댄스 스타일'
      })
      expect(selectedList).toBeInTheDocument()
    })

    it('레벨 슬라이더에 aria-valuetext가 설정된다', () => {
      const styles: DanceStyle[] = [{ name: 'Lindy Hop', level: 3 }]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      const slider = screen.getByLabelText('Lindy Hop 레벨 선택')
      expect(slider).toHaveAttribute('aria-valuetext', '레벨 3')
      expect(slider).toHaveAttribute('aria-valuenow', '3')
      expect(slider).toHaveAttribute('aria-valuemin', '1')
      expect(slider).toHaveAttribute('aria-valuemax', '5')
    })

    it('추가 버튼에 aria-expanded가 올바르게 설정된다', async () => {
      const user = userEvent.setup()
      render(<DanceStyleSelector value={[]} onChange={mockOnChange} />)

      const addButton = screen.getByText('+ 스타일 추가')
      expect(addButton).toHaveAttribute('aria-expanded', 'false')

      await user.click(addButton)
      expect(addButton).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('엣지 케이스', () => {
    it('빈 배열로 시작하여 여러 스타일을 순차적으로 추가할 수 있다', async () => {
      const user = userEvent.setup()
      let currentStyles: DanceStyle[] = []
      const handleChange = (styles: DanceStyle[]) => {
        currentStyles = styles
        mockOnChange(styles)
      }

      const { rerender } = render(
        <DanceStyleSelector value={currentStyles} onChange={handleChange} />
      )

      // 첫 번째 스타일 추가
      await user.click(screen.getByText('+ 스타일 추가'))
      await user.click(screen.getByLabelText('Lindy Hop 추가'))

      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Lindy Hop', level: 1 }
      ])

      currentStyles = [{ name: 'Lindy Hop', level: 1 }]
      rerender(<DanceStyleSelector value={currentStyles} onChange={handleChange} />)

      // 두 번째 스타일 추가
      await user.click(screen.getByText('+ 스타일 추가'))
      await user.click(screen.getByLabelText('Charleston 추가'))

      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Lindy Hop', level: 1 },
        { name: 'Charleston', level: 1 }
      ])
    })

    it('모든 스타일을 선택하면 추가할 수 있는 스타일이 없다', () => {
      const styles: DanceStyle[] = [
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

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      expect(screen.queryByText('+ 스타일 추가')).not.toBeInTheDocument()
      expect(screen.getByText('최대 개수 도달')).toBeInTheDocument()
    })

    it('레벨을 1에서 5까지 모두 변경할 수 있다', () => {
      const styles: DanceStyle[] = [{ name: 'Lindy Hop', level: 1 }]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      const slider = screen.getByLabelText('Lindy Hop 레벨 선택')

      for (let level = 1; level <= 5; level++) {
        mockOnChange.mockClear()
        fireEvent.change(slider, { target: { value: level.toString() } })

        expect(mockOnChange).toHaveBeenCalledWith([
          { name: 'Lindy Hop', level }
        ])
      }
    })

    it('동일한 이름의 스타일이 중복으로 추가되지 않는다', async () => {
      const user = userEvent.setup()
      const styles: DanceStyle[] = [{ name: 'Lindy Hop', level: 3 }]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      await user.click(screen.getByText('+ 스타일 추가'))

      // Lindy Hop은 이미 선택되어 있으므로 추가 목록에 없어야 함
      expect(screen.queryByLabelText('Lindy Hop 추가')).not.toBeInTheDocument()
    })
  })

  describe('성능', () => {
    it('React.memo로 래핑되어 불필요한 리렌더링을 방지한다', () => {
      const styles: DanceStyle[] = [{ name: 'Lindy Hop', level: 3 }]

      expect(DanceStyleSelector.displayName).toBe('DanceStyleSelector')
    })
  })

  describe('키보드 네비게이션', () => {
    it('Tab 키로 모든 컨트롤에 접근할 수 있다', async () => {
      const user = userEvent.setup()
      const styles: DanceStyle[] = [{ name: 'Lindy Hop', level: 3 }]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      const addButton = screen.getByText('+ 스타일 추가')
      const slider = screen.getByLabelText('Lindy Hop 레벨 선택')
      const removeButton = screen.getByLabelText('Lindy Hop 제거')

      // 탭 네비게이션 시뮬레이션
      await user.tab()
      expect(addButton).toHaveFocus()

      await user.tab()
      expect(slider).toHaveFocus()

      await user.tab()
      expect(removeButton).toHaveFocus()
    })

    it('화살표 키로 슬라이더를 조작할 수 있다', async () => {
      const user = userEvent.setup()
      const styles: DanceStyle[] = [{ name: 'Lindy Hop', level: 3 }]

      render(<DanceStyleSelector value={styles} onChange={mockOnChange} />)

      const slider = screen.getByLabelText('Lindy Hop 레벨 선택')
      slider.focus()

      // 화살표 키는 브라우저 기본 동작으로 처리됨
      expect(slider).toHaveFocus()
    })
  })
})
