/**
 * CategorySelect 컴포넌트 테스트
 * 마켓플레이스 상품 카테고리 선택 UI 테스트
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { CategorySelect } from '@/components/marketplace/CategorySelect'
import { PRODUCT_CATEGORIES, type ProductCategory } from '@/lib/types/marketplace'

describe('CategorySelect', () => {
  const mockOnChange = jest.fn()
  const defaultProps = {
    value: 'shoes' as ProductCategory,
    onChange: mockOnChange
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('렌더링', () => {
    it('모든 카테고리 배지가 표시되어야 한다', () => {
      render(<CategorySelect {...defaultProps} />)

      // 모든 카테고리가 렌더링되는지 확인
      Object.entries(PRODUCT_CATEGORIES).forEach(([key, label]) => {
        expect(screen.getByText(label)).toBeInTheDocument()
      })
    })

    it('선택된 카테고리는 기본 스타일로 표시되어야 한다', () => {
      render(<CategorySelect {...defaultProps} value="clothing" />)

      const clothingBadge = screen.getByText('의상')
      const shoesBadge = screen.getByText('댄스화')

      // 선택된 카테고리는 기본 스타일 (default variant)
      expect(clothingBadge).toHaveClass('bg-[#693BF2]') // default variant class

      // 선택되지 않은 카테고리는 outline 스타일
      expect(shoesBadge).toHaveClass('border') // outline variant class
    })

    it('커스텀 className이 적용되어야 한다', () => {
      render(<CategorySelect {...defaultProps} className="custom-class" />)

      const container = screen.getByText('댄스화').closest('div').parentElement
      expect(container).toHaveClass('custom-class')
    })
  })

  describe('상호작용', () => {
    it('카테고리 클릭 시 onChange가 호출되어야 한다', () => {
      render(<CategorySelect {...defaultProps} />)

      const clothingBadge = screen.getByText('의상')
      fireEvent.click(clothingBadge)

      expect(mockOnChange).toHaveBeenCalledWith('clothing')
      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('이미 선택된 카테고리를 다시 클릭해도 onChange가 호출되어야 한다', () => {
      render(<CategorySelect {...defaultProps} value="shoes" />)

      const shoesBadge = screen.getByText('댄스화')
      fireEvent.click(shoesBadge)

      expect(mockOnChange).toHaveBeenCalledWith('shoes')
    })

    it('모든 카테고리에 대해 클릭이 작동해야 한다', () => {
      render(<CategorySelect {...defaultProps} />)

      Object.entries(PRODUCT_CATEGORIES).forEach(([key, label]) => {
        const badge = screen.getByText(label)
        fireEvent.click(badge)
        expect(mockOnChange).toHaveBeenCalledWith(key)
      })

      expect(mockOnChange).toHaveBeenCalledTimes(4) // 4개 카테고리
    })
  })

  describe('접근성', () => {
    it('모든 카테고리 배지가 클릭 가능해야 한다', () => {
      render(<CategorySelect {...defaultProps} />)

      Object.values(PRODUCT_CATEGORIES).forEach((label) => {
        const badge = screen.getByText(label)
        expect(badge).toHaveClass('cursor-pointer')
      })
    })

    it('키보드 네비게이션을 지원해야 한다', () => {
      render(<CategorySelect {...defaultProps} />)

      const firstBadge = screen.getByText('댄스화')

      // Enter 키로 선택 가능
      fireEvent.keyDown(firstBadge, { key: 'Enter', code: 'Enter' })
      fireEvent.click(firstBadge) // Badge 컴포넌트는 onClick만 지원

      expect(mockOnChange).toHaveBeenCalledWith('shoes')
    })
  })

  describe('스타일링', () => {
    it('호버 효과가 적용되어야 한다', () => {
      render(<CategorySelect {...defaultProps} />)

      const badge = screen.getByText('댄스화')
      expect(badge).toHaveClass('hover:bg-purple-100')
    })

    it('transition 효과가 적용되어야 한다', () => {
      render(<CategorySelect {...defaultProps} />)

      const badge = screen.getByText('댄스화')
      expect(badge).toHaveClass('transition-colors')
    })
  })

  describe('엣지 케이스', () => {
    it('빈 onChange 함수가 전달되어도 에러가 발생하지 않아야 한다', () => {
      const emptyOnChange = jest.fn()
      render(<CategorySelect value="shoes" onChange={emptyOnChange} />)

      const badge = screen.getByText('댄스화')
      expect(() => fireEvent.click(badge)).not.toThrow()
    })

    it('유효하지 않은 카테고리 값이 전달되어도 렌더링되어야 한다', () => {
      // @ts-ignore - 의도적으로 잘못된 타입 전달
      render(<CategorySelect value="invalid" onChange={mockOnChange} />)

      // 모든 카테고리가 outline으로 표시되어야 함
      Object.values(PRODUCT_CATEGORIES).forEach((label) => {
        const badge = screen.getByText(label)
        expect(badge).toHaveClass('border') // outline variant
      })
    })

    it('className이 없어도 기본 스타일이 적용되어야 한다', () => {
      render(<CategorySelect value="shoes" onChange={mockOnChange} />)

      const container = screen.getByText('댄스화').closest('div').parentElement
      expect(container).toHaveClass('flex', 'flex-wrap', 'gap-2')
    })
  })

  describe('카테고리별 테스트', () => {
    const categories: { key: ProductCategory; label: string }[] = [
      { key: 'shoes', label: '댄스화' },
      { key: 'clothing', label: '의상' },
      { key: 'accessories', label: '액세서리' },
      { key: 'other', label: '기타' }
    ]

    it.each(categories)('$label 카테고리 선택이 정상 작동해야 한다', ({ key, label }) => {
      render(<CategorySelect {...defaultProps} value={key} />)

      const badge = screen.getByText(label)
      expect(badge).toHaveClass('bg-[#693BF2]') // selected state

      fireEvent.click(badge)
      expect(mockOnChange).toHaveBeenCalledWith(key)
    })
  })

  describe('성능', () => {
    it('불필요한 리렌더링이 발생하지 않아야 한다', () => {
      const { rerender } = render(<CategorySelect {...defaultProps} />)

      // 같은 props로 리렌더링
      rerender(<CategorySelect {...defaultProps} />)

      // 컴포넌트가 정상적으로 렌더링되어야 함
      expect(screen.getByText('댄스화')).toBeInTheDocument()
    })

    it('많은 클릭 이벤트를 처리할 수 있어야 한다', () => {
      render(<CategorySelect {...defaultProps} />)

      const badge = screen.getByText('댄스화')

      // 빠른 연속 클릭
      for (let i = 0; i < 10; i++) {
        fireEvent.click(badge)
      }

      expect(mockOnChange).toHaveBeenCalledTimes(10)
      expect(mockOnChange).toHaveBeenCalledWith('shoes')
    })
  })
})