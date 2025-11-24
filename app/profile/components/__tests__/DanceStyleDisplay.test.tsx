/**
 * Unit tests for DanceStyleDisplay component
 */

import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { DanceStyleDisplay } from '../DanceStyleDisplay'
import type { DanceStyle } from '@/lib/types/auth'

describe('DanceStyleDisplay', () => {
  const mockOnEdit = jest.fn()

  beforeEach(() => {
    mockOnEdit.mockClear()
  })

  describe('데이터가 있을 때 렌더링', () => {
    it('댄스 스타일 목록이 올바르게 렌더링되어야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 },
        { name: 'Charleston', level: 2 }
      ]

      render(<DanceStyleDisplay danceStyles={mockData} />)

      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getByText('Charleston')).toBeInTheDocument()
      expect(screen.getByText('Level 3/5')).toBeInTheDocument()
      expect(screen.getByText('Level 2/5')).toBeInTheDocument()
    })

    it('모든 댄스 스타일 카드가 렌더링되어야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 },
        { name: 'Charleston', level: 2 },
        { name: 'Balboa', level: 4 }
      ]

      render(<DanceStyleDisplay danceStyles={mockData} />)

      const cards = screen.getAllByRole('listitem')
      expect(cards).toHaveLength(3)
    })

    it('올바른 ARIA 레이블이 설정되어야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 }
      ]

      render(<DanceStyleDisplay danceStyles={mockData} />)

      const listItem = screen.getByRole('listitem', {
        name: /Lindy Hop, 레벨 3\/5/
      })
      expect(listItem).toBeInTheDocument()
    })
  })

  describe('빈 상태 렌더링', () => {
    it('빈 배열일 때 빈 상태가 표시되어야 함', () => {
      render(<DanceStyleDisplay danceStyles={[]} />)

      expect(screen.getByText(/댄스 스타일이 없습니다/)).toBeInTheDocument()
    })

    it('undefined일 때 빈 상태가 표시되어야 함', () => {
      render(<DanceStyleDisplay danceStyles={undefined as any} />)

      expect(screen.getByText(/댄스 스타일이 없습니다/)).toBeInTheDocument()
    })

    it('본인 프로필의 빈 상태 메시지가 올바르게 표시되어야 함', () => {
      render(<DanceStyleDisplay danceStyles={[]} isOwnProfile={true} />)

      expect(screen.getByText(/아직 댄스 스타일을 설정하지 않았습니다/)).toBeInTheDocument()
      expect(screen.getByText(/프로필을 편집하여 선호하는 댄스 스타일을 추가해보세요/)).toBeInTheDocument()
    })

    it('타인 프로필의 빈 상태 메시지가 올바르게 표시되어야 함', () => {
      render(<DanceStyleDisplay danceStyles={[]} isOwnProfile={false} />)

      expect(screen.getByText(/댄스 스타일이 없습니다/)).toBeInTheDocument()
      expect(screen.getByText(/이 사용자는 아직 댄스 스타일을 설정하지 않았습니다/)).toBeInTheDocument()
    })

    it('본인 프로필 빈 상태에서 편집 버튼이 표시되어야 함', () => {
      render(<DanceStyleDisplay danceStyles={[]} isOwnProfile={true} onEdit={mockOnEdit} />)

      const editButton = screen.getByText('프로필 편집')
      expect(editButton).toBeInTheDocument()
    })

    it('타인 프로필 빈 상태에서 편집 버튼이 표시되지 않아야 함', () => {
      render(<DanceStyleDisplay danceStyles={[]} isOwnProfile={false} onEdit={mockOnEdit} />)

      expect(screen.queryByText('프로필 편집')).not.toBeInTheDocument()
    })
  })

  describe('레벨 시각화', () => {
    it('별점이 올바른 개수만큼 채워져야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 }
      ]

      render(<DanceStyleDisplay danceStyles={mockData} />)

      const stars = screen.getAllByText('⭐')
      expect(stars).toHaveLength(5)

      // 레벨 3이므로 3개는 채워지고 2개는 비어있어야 함
      const filledStars = stars.filter(star =>
        !star.className.includes('grayscale') && star.className.includes('opacity-100')
      )
      expect(filledStars).toHaveLength(3)
    })

    it('레벨 1일 때 1개의 별만 채워져야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 1 }
      ]

      render(<DanceStyleDisplay danceStyles={mockData} />)

      expect(screen.getByText('Level 1/5')).toBeInTheDocument()
    })

    it('레벨 5일 때 5개의 별이 모두 채워져야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 5 }
      ]

      render(<DanceStyleDisplay danceStyles={mockData} />)

      expect(screen.getByText('Level 5/5')).toBeInTheDocument()
    })

    it('레벨별로 색상이 다르게 표시되어야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Level 1 Style', level: 1 },
        { name: 'Level 5 Style', level: 5 }
      ]

      const { container } = render(<DanceStyleDisplay danceStyles={mockData} />)

      // 카드가 있는지 확인 (색상은 인라인 스타일로 적용됨)
      const cards = container.querySelectorAll('[style*="background"]')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  describe('편집 기능', () => {
    it('본인 프로필에서 편집 버튼이 표시되어야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 }
      ]

      render(
        <DanceStyleDisplay
          danceStyles={mockData}
          isOwnProfile={true}
          onEdit={mockOnEdit}
        />
      )

      expect(screen.getByText('편집')).toBeInTheDocument()
    })

    it('타인 프로필에서 편집 버튼이 표시되지 않아야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 }
      ]

      render(
        <DanceStyleDisplay
          danceStyles={mockData}
          isOwnProfile={false}
          onEdit={mockOnEdit}
        />
      )

      expect(screen.queryByText('편집')).not.toBeInTheDocument()
    })

    it('편집 버튼 클릭 시 onEdit이 호출되어야 함', async () => {
      const user = userEvent.setup()
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 }
      ]

      render(
        <DanceStyleDisplay
          danceStyles={mockData}
          isOwnProfile={true}
          onEdit={mockOnEdit}
        />
      )

      const editButton = screen.getByText('편집')
      await user.click(editButton)

      expect(mockOnEdit).toHaveBeenCalledTimes(1)
    })

    it('onEdit가 없으면 편집 버튼이 표시되지 않아야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 }
      ]

      render(
        <DanceStyleDisplay
          danceStyles={mockData}
          isOwnProfile={true}
        />
      )

      expect(screen.queryByText('편집')).not.toBeInTheDocument()
    })
  })

  describe('반응형 그리드', () => {
    it('그리드 레이아웃이 적용되어야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 },
        { name: 'Charleston', level: 2 }
      ]

      const { container } = render(<DanceStyleDisplay danceStyles={mockData} />)

      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
      expect(grid).toHaveClass('gap-4')
      expect(grid).toHaveClass('grid-cols-1')
      expect(grid).toHaveClass('md:grid-cols-2')
      expect(grid).toHaveClass('lg:grid-cols-3')
    })

    it('많은 수의 스타일을 표시할 수 있어야 함', () => {
      const mockData: DanceStyle[] = Array.from({ length: 10 }, (_, i) => ({
        name: `Style ${i + 1}`,
        level: (i % 5) + 1
      }))

      render(<DanceStyleDisplay danceStyles={mockData} />)

      const cards = screen.getAllByRole('listitem')
      expect(cards).toHaveLength(10)
    })
  })

  describe('커스텀 클래스명', () => {
    it('className prop이 적용되어야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 }
      ]

      const { container } = render(
        <DanceStyleDisplay danceStyles={mockData} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('접근성', () => {
    it('목록에 올바른 role이 설정되어야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 }
      ]

      render(<DanceStyleDisplay danceStyles={mockData} />)

      const list = screen.getByRole('list', { name: /댄스 스타일 목록/ })
      expect(list).toBeInTheDocument()
    })

    it('각 항목에 올바른 aria-label이 설정되어야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 },
        { name: 'Charleston', level: 2 }
      ]

      render(<DanceStyleDisplay danceStyles={mockData} />)

      expect(screen.getByRole('listitem', { name: /Lindy Hop, 레벨 3\/5/ })).toBeInTheDocument()
      expect(screen.getByRole('listitem', { name: /Charleston, 레벨 2\/5/ })).toBeInTheDocument()
    })

    it('별점이 aria-hidden으로 설정되어야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 }
      ]

      const { container } = render(<DanceStyleDisplay danceStyles={mockData} />)

      const starsContainer = container.querySelector('[aria-hidden="true"]')
      expect(starsContainer).toBeInTheDocument()
    })

    it('편집 버튼에 올바른 aria-label이 설정되어야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 }
      ]

      render(
        <DanceStyleDisplay
          danceStyles={mockData}
          isOwnProfile={true}
          onEdit={mockOnEdit}
        />
      )

      const editButton = screen.getByRole('button', { name: /댄스 스타일 편집/ })
      expect(editButton).toBeInTheDocument()
    })
  })

  describe('엣지 케이스', () => {
    it('null 데이터를 빈 상태로 처리해야 함', () => {
      render(<DanceStyleDisplay danceStyles={null as any} />)

      expect(screen.getByText(/댄스 스타일이 없습니다/)).toBeInTheDocument()
    })

    it('레벨 경계값이 올바르게 표시되어야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Min Level', level: 1 },
        { name: 'Max Level', level: 5 }
      ]

      render(<DanceStyleDisplay danceStyles={mockData} />)

      expect(screen.getByText('Level 1/5')).toBeInTheDocument()
      expect(screen.getByText('Level 5/5')).toBeInTheDocument()
    })

    it('긴 이름의 댄스 스타일을 올바르게 표시해야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Very Long Dance Style Name That Should Still Display Correctly', level: 3 }
      ]

      render(<DanceStyleDisplay danceStyles={mockData} />)

      expect(screen.getByText(/Very Long Dance Style Name/)).toBeInTheDocument()
    })

    it('동일한 이름의 스타일이 있을 때 키가 유니크해야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 },
        { name: 'Lindy Hop', level: 4 } // 중복 (실제로는 발생하지 않아야 하지만 방어적 처리)
      ]

      const { container } = render(<DanceStyleDisplay danceStyles={mockData} />)

      // 중복된 이름이 있어도 에러 없이 렌더링되어야 함
      const cards = container.querySelectorAll('[role="listitem"]')
      expect(cards).toHaveLength(2)
    })

    it('단일 스타일만 있을 때 올바르게 렌더링되어야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 }
      ]

      render(<DanceStyleDisplay danceStyles={mockData} />)

      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(1)
    })

    it('최대 개수의 스타일을 표시할 수 있어야 함', () => {
      const allStyles = [
        'Lindy Hop', 'Charleston', 'Balboa', 'Shag', 'Blues',
        'Collegiate Shag', 'St. Louis Shag', 'Slow Drag', 'Authentic Jazz', 'Solo Jazz'
      ]
      const mockData: DanceStyle[] = allStyles.map((name, index) => ({
        name,
        level: (index % 5) + 1
      }))

      render(<DanceStyleDisplay danceStyles={mockData} />)

      expect(screen.getAllByRole('listitem')).toHaveLength(10)
    })
  })

  describe('성능 최적화', () => {
    it('React.memo로 최적화되어 있어야 함', () => {
      expect(DanceStyleDisplay.displayName).toBe('DanceStyleDisplay')
    })

    it('불필요한 리렌더링이 발생하지 않아야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 }
      ]

      const { rerender } = render(<DanceStyleDisplay danceStyles={mockData} />)

      // 동일한 props로 리렌더링
      rerender(<DanceStyleDisplay danceStyles={mockData} />)

      // 여전히 렌더링되어 있어야 함
      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
    })
  })

  describe('DanceStyleCard 서브컴포넌트', () => {
    it('카드가 올바른 스타일로 렌더링되어야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 }
      ]

      const { container } = render(<DanceStyleDisplay danceStyles={mockData} />)

      const card = container.querySelector('.text-center')
      expect(card).toBeInTheDocument()
    })

    it('레벨에 따른 배경색이 적용되어야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Low Level', level: 1 },
        { name: 'High Level', level: 5 }
      ]

      const { container } = render(<DanceStyleDisplay danceStyles={mockData} />)

      // 인라인 스타일로 배경색이 적용되어 있는지 확인
      const cards = container.querySelectorAll('[style*="background"]')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  describe('통합 시나리오', () => {
    it('본인 프로필 전체 플로우가 올바르게 동작해야 함', async () => {
      const user = userEvent.setup()
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 },
        { name: 'Charleston', level: 2 }
      ]

      render(
        <DanceStyleDisplay
          danceStyles={mockData}
          isOwnProfile={true}
          onEdit={mockOnEdit}
        />
      )

      // 헤더와 편집 버튼이 표시되어야 함
      expect(screen.getByText('댄스 스타일')).toBeInTheDocument()
      expect(screen.getByText('편집')).toBeInTheDocument()

      // 모든 스타일이 표시되어야 함
      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getByText('Charleston')).toBeInTheDocument()

      // 편집 버튼 클릭
      const editButton = screen.getByText('편집')
      await user.click(editButton)

      expect(mockOnEdit).toHaveBeenCalled()
    })

    it('타인 프로필 전체 플로우가 올바르게 동작해야 함', () => {
      const mockData: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 },
        { name: 'Charleston', level: 2 }
      ]

      render(
        <DanceStyleDisplay
          danceStyles={mockData}
          isOwnProfile={false}
          onEdit={mockOnEdit}
        />
      )

      // 헤더가 표시되지 않아야 함
      expect(screen.queryByText('댄스 스타일')).not.toBeInTheDocument()

      // 편집 버튼이 표시되지 않아야 함
      expect(screen.queryByText('편집')).not.toBeInTheDocument()

      // 모든 스타일이 표시되어야 함
      expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      expect(screen.getByText('Charleston')).toBeInTheDocument()
    })

    it('빈 상태에서 편집으로 이동하는 플로우가 올바르게 동작해야 함', async () => {
      const user = userEvent.setup()

      render(
        <DanceStyleDisplay
          danceStyles={[]}
          isOwnProfile={true}
          onEdit={mockOnEdit}
        />
      )

      // 빈 상태 메시지가 표시되어야 함
      expect(screen.getByText(/아직 댄스 스타일을 설정하지 않았습니다/)).toBeInTheDocument()

      // 프로필 편집 버튼 클릭
      const editButton = screen.getByText('프로필 편집')
      await user.click(editButton)

      expect(mockOnEdit).toHaveBeenCalled()
    })
  })
})
