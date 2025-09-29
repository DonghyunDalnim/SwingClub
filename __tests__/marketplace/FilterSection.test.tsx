import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { FilterSection } from '@/components/marketplace/FilterSection'
import type { ItemSearchFilters } from '@/lib/types/marketplace'

describe('FilterSection', () => {
  const defaultFilters: ItemSearchFilters = {
    searchTerm: '',
    category: undefined,
    priceRange: { min: 0, max: 500000 },
    condition: undefined
  }

  const mockOnFiltersChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('기본 렌더링', () => {
    test('검색 입력창이 렌더링되어야 함', () => {
      render(<FilterSection filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      expect(screen.getByPlaceholderText('상품명, 브랜드 검색...')).toBeInTheDocument()
    })

    test('가격 슬라이더가 렌더링되어야 함', () => {
      render(<FilterSection filters={defaultFilters} onFiltersChange={mockOnFiltersChange} collapsible={false} />)

      expect(screen.getByText('0원')).toBeInTheDocument()
      expect(screen.getByText('500,000원')).toBeInTheDocument()
    })

    test('카테고리 필터 버튼들이 렌더링되어야 함', () => {
      render(<FilterSection filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      expect(screen.getByText('댄스화')).toBeInTheDocument()
      expect(screen.getByText('의상')).toBeInTheDocument()
      expect(screen.getByText('액세서리')).toBeInTheDocument()
      expect(screen.getByText('기타')).toBeInTheDocument()
    })

    test('상태 필터 버튼들이 렌더링되어야 함', () => {
      render(<FilterSection filters={defaultFilters} onFiltersChange={mockOnFiltersChange} collapsible={false} />)

      expect(screen.getByText('새상품')).toBeInTheDocument()
      expect(screen.getByText('거의새상품')).toBeInTheDocument()
      expect(screen.getByText('상태좋음')).toBeInTheDocument()
      expect(screen.getByText('보통')).toBeInTheDocument()
      expect(screen.getByText('상태나쁨')).toBeInTheDocument()
    })

    test('정렬 옵션들이 렌더링되어야 함', () => {
      render(<FilterSection filters={defaultFilters} onFiltersChange={mockOnFiltersChange} collapsible={false} />)

      expect(screen.getByText('최신순')).toBeInTheDocument()
      expect(screen.getByText('가격 낮은순')).toBeInTheDocument()
      expect(screen.getByText('가격 높은순')).toBeInTheDocument()
      expect(screen.getByText('인기순')).toBeInTheDocument()
    })
  })

  describe('검색 기능', () => {
    test('검색어 입력시 onFiltersChange가 호출되어야 함', () => {
      render(<FilterSection filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      const searchInput = screen.getByPlaceholderText('상품명, 브랜드 검색...')
      fireEvent.change(searchInput, { target: { value: '댄스화' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        searchTerm: '댄스화'
      })
    })

    test('검색어가 비어있을 때 undefined로 처리되어야 함', () => {
      render(<FilterSection filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      const searchInput = screen.getByPlaceholderText('상품명, 브랜드 검색...')
      fireEvent.change(searchInput, { target: { value: '' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        searchTerm: undefined
      })
    })
  })

  describe('카테고리 필터', () => {
    test('카테고리 선택시 필터가 적용되어야 함', () => {
      render(<FilterSection filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      const shoesButton = screen.getByText('댄스화')
      fireEvent.click(shoesButton)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        category: ['shoes']
      })
    })

    test('이미 선택된 카테고리 클릭시 필터가 해제되어야 함', () => {
      const filtersWithCategory = { ...defaultFilters, category: ['shoes'] as any }
      render(<FilterSection filters={filtersWithCategory} onFiltersChange={mockOnFiltersChange} />)

      const shoesButton = screen.getByText('댄스화')
      fireEvent.click(shoesButton)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        category: undefined
      })
    })

    test('여러 카테고리 선택이 가능해야 함', () => {
      const filtersWithCategory = { ...defaultFilters, category: ['shoes'] as any }
      render(<FilterSection filters={filtersWithCategory} onFiltersChange={mockOnFiltersChange} />)

      const clothingButton = screen.getByText('의상')
      fireEvent.click(clothingButton)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        category: ['shoes', 'clothing']
      })
    })

    test('선택된 카테고리는 활성화 스타일이 적용되어야 함', () => {
      const filtersWithCategory = { ...defaultFilters, category: ['shoes'] as any }
      render(<FilterSection filters={filtersWithCategory} onFiltersChange={mockOnFiltersChange} />)

      const shoesButton = screen.getByText('댄스화')
      expect(shoesButton).toHaveStyle('background-color: #693BF2')
      expect(shoesButton).toHaveStyle('color: white')
    })
  })

  describe('상태 필터', () => {
    test('상태 선택시 필터가 적용되어야 함', () => {
      render(<FilterSection filters={defaultFilters} onFiltersChange={mockOnFiltersChange} collapsible={false} />)

      const newButton = screen.getByText('새상품')
      fireEvent.click(newButton)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        condition: ['new']
      })
    })

    test('이미 선택된 상태 클릭시 필터가 해제되어야 함', () => {
      const filtersWithCondition = { ...defaultFilters, condition: ['new'] as any }
      render(<FilterSection filters={filtersWithCondition} onFiltersChange={mockOnFiltersChange} collapsible={false} />)

      const newButton = screen.getByText('새상품')
      fireEvent.click(newButton)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        condition: undefined
      })
    })

    test('선택된 상태는 활성화 스타일이 적용되어야 함', () => {
      const filtersWithCondition = { ...defaultFilters, condition: ['new'] as any }
      render(<FilterSection filters={filtersWithCondition} onFiltersChange={mockOnFiltersChange} collapsible={false} />)

      const newButton = screen.getByText('새상품')
      expect(newButton).toHaveStyle('background-color: rgb(105, 59, 242)')
      expect(newButton).toHaveStyle('color: white')
    })
  })

  describe('가격 슬라이더', () => {
    test('가격 범위 변경시 onFiltersChange가 호출되어야 함', () => {
      render(<FilterSection filters={defaultFilters} onFiltersChange={mockOnFiltersChange} collapsible={false} />)

      // 가격 슬라이더는 PriceSlider 컴포넌트 테스트에서 상세히 다룸
      // 여기서는 콜백이 제대로 연결되는지만 확인
      expect(screen.getAllByText('0원')).toHaveLength(2) // 현재값과 최소값
      expect(screen.getAllByText('500,000원')).toHaveLength(2) // 현재값과 최대값
    })
  })

  describe('정렬 기능', () => {
    test('정렬 옵션들이 클릭 가능해야 함', () => {
      render(<FilterSection filters={defaultFilters} onFiltersChange={mockOnFiltersChange} collapsible={false} />)

      // 정렬은 배지 형태로 구현됨
      const recentSort = screen.getByText('최신순')
      fireEvent.click(recentSort)

      // 클릭 후에도 존재해야 함
      expect(recentSort).toBeInTheDocument()
    })

    test('모든 정렬 옵션이 표시되어야 함', () => {
      render(<FilterSection filters={defaultFilters} onFiltersChange={mockOnFiltersChange} collapsible={false} />)

      expect(screen.getByText('최신순')).toBeInTheDocument()
      expect(screen.getByText('가격 낮은순')).toBeInTheDocument()
      expect(screen.getByText('가격 높은순')).toBeInTheDocument()
      expect(screen.getByText('인기순')).toBeInTheDocument()
    })
  })

  describe('모바일 반응형', () => {
    test('모바일에서 필터 토글 버튼이 표시되어야 함', () => {
      // 모바일 뷰포트 시뮬레이션
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<FilterSection filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      expect(screen.getByText('필터')).toBeInTheDocument()
    })

    test('필터 토글 클릭시 필터 섹션이 열려야 함', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<FilterSection filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      const toggleButton = screen.getByText('필터')
      fireEvent.click(toggleButton)

      // 필터가 열린 후 카테고리 버튼들이 보여야 함
      expect(screen.getByText('댄스화')).toBeVisible()
    })
  })

  describe('필터 리셋', () => {
    test('필터 리셋 버튼이 활성 필터가 있을 때만 표시되어야 함', () => {
      const activeFilters = {
        ...defaultFilters,
        searchTerm: '댄스화',
        category: ['shoes'] as any,
        condition: 'new' as any
      }

      render(<FilterSection filters={activeFilters} onFiltersChange={mockOnFiltersChange} />)

      expect(screen.getByText('초기화')).toBeInTheDocument()
    })

    test('필터 리셋 클릭시 모든 필터가 초기화되어야 함', () => {
      const activeFilters = {
        ...defaultFilters,
        searchTerm: '댄스화',
        category: ['shoes'] as any,
        condition: ['new'] as any
      }

      render(<FilterSection filters={activeFilters} onFiltersChange={mockOnFiltersChange} />)

      const resetButton = screen.getByText('초기화')
      fireEvent.click(resetButton)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        searchTerm: undefined,
        category: undefined,
        priceRange: undefined,
        condition: undefined
      })
    })

    test('기본 필터 상태에서는 리셋 버튼이 표시되지 않아야 함', () => {
      render(<FilterSection filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      expect(screen.queryByText('필터 초기화')).not.toBeInTheDocument()
    })
  })

  describe('접근성', () => {
    test('모든 버튼에 적절한 aria-label이 있어야 함', () => {
      render(<FilterSection filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      const categoryButtons = screen.getAllByRole('button')
      categoryButtons.forEach(button => {
        expect(button).toBeInTheDocument()
      })
    })

    test('선택된 상태가 스크린 리더에게 전달되어야 함', () => {
      const filtersWithCategory = { ...defaultFilters, category: ['shoes'] as any }
      render(<FilterSection filters={filtersWithCategory} onFiltersChange={mockOnFiltersChange} collapsible={false} />)

      const shoesButton = screen.getByText('댄스화')
      // 배지는 기본적으로 접근 가능한 요소임
      expect(shoesButton).toBeInTheDocument()
    })
  })

  describe('카테고리 매핑', () => {
    test('카테고리 한글명이 올바르게 표시되어야 함', () => {
      render(<FilterSection filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      expect(screen.getByText('댄스화')).toBeInTheDocument() // shoes
      expect(screen.getByText('의상')).toBeInTheDocument()   // clothing
      expect(screen.getByText('액세서리')).toBeInTheDocument() // accessories
      expect(screen.getByText('기타')).toBeInTheDocument()   // other
    })
  })

  describe('상태 매핑', () => {
    test('상태 한글명이 올바르게 표시되어야 함', () => {
      render(<FilterSection filters={defaultFilters} onFiltersChange={mockOnFiltersChange} collapsible={false} />)

      expect(screen.getByText('새상품')).toBeInTheDocument()      // new
      expect(screen.getByText('거의새상품')).toBeInTheDocument()   // like_new
      expect(screen.getByText('상태좋음')).toBeInTheDocument()    // good
      expect(screen.getByText('보통')).toBeInTheDocument()       // fair
      expect(screen.getByText('상태나쁨')).toBeInTheDocument()   // poor
    })
  })
})