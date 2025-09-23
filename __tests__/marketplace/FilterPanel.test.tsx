/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterPanel } from '@/components/marketplace/FilterPanel'
import type { ItemSearchFilters, ItemSortOption } from '@/lib/types/marketplace'

// Mock UI components
jest.mock('@/components/core', () => ({
  Badge: ({ children, variant, className, onClick, ...props }: any) => (
    <span
      className={`badge ${variant} ${className}`}
      onClick={onClick}
      data-testid="badge"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      {...props}
    >
      {children}
    </span>
  ),
  Button: ({ children, className, onClick, disabled, size, variant, ...props }: any) => (
    <button
      className={`button ${variant} ${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
      {...props}
    >
      {children}
    </button>
  ),
  SearchInput: ({ placeholder, value, onChange, className, ...props }: any) => (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      data-testid="search-input"
      {...props}
    />
  ),
}))

describe('FilterPanel', () => {
  const defaultFilters: ItemSearchFilters = {}
  const defaultSort: ItemSortOption = 'latest'
  const mockOnFiltersChange = jest.fn()
  const mockOnSortChange = jest.fn()

  const defaultProps = {
    filters: defaultFilters,
    onFiltersChange: mockOnFiltersChange,
    sortBy: defaultSort,
    onSortChange: mockOnSortChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Basic Rendering', () => {
    it('renders search input and basic controls', () => {
      render(<FilterPanel {...defaultProps} />)

      expect(screen.getByTestId('search-input')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('상품명, 브랜드, 설명 검색...')).toBeInTheDocument()
      expect(screen.getByText('필터')).toBeInTheDocument()
    })

    it('renders all category badges', () => {
      render(<FilterPanel {...defaultProps} />)

      expect(screen.getByText('댄스화')).toBeInTheDocument()
      expect(screen.getByText('의상')).toBeInTheDocument()
      expect(screen.getByText('액세서리')).toBeInTheDocument()
      expect(screen.getByText('기타')).toBeInTheDocument()
    })

    it('renders sort dropdown with correct options', () => {
      render(<FilterPanel {...defaultProps} />)

      const sortSelect = screen.getByDisplayValue('최신순')
      expect(sortSelect).toBeInTheDocument()

      // Check options
      expect(screen.getByRole('option', { name: '최신순' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '낮은가격순' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '높은가격순' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '인기순' })).toBeInTheDocument()
    })

    it('shows filter count badge when filters are active', () => {
      const filtersWithData: ItemSearchFilters = {
        category: ['shoes'],
        condition: ['new'],
        searchTerm: 'test',
      }

      render(<FilterPanel {...defaultProps} filters={filtersWithData} />)

      // Should show badge with count of 3 (category, condition, searchTerm)
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('does not show filter count badge when no filters are active', () => {
      render(<FilterPanel {...defaultProps} />)

      // Should not show count badge
      expect(screen.queryByText(/[0-9]+/)).not.toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('updates search term with debouncing', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<FilterPanel {...defaultProps} />)

      const searchInput = screen.getByTestId('search-input')

      await user.type(searchInput, 'test search')

      // Should not call immediately
      expect(mockOnFiltersChange).not.toHaveBeenCalled()

      // Advance timers to trigger debounce
      jest.advanceTimersByTime(300)

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          searchTerm: 'test search',
        })
      })
    })

    it('handles empty search term correctly', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<FilterPanel {...defaultProps} />)

      const searchInput = screen.getByTestId('search-input')

      await user.type(searchInput, 'test')
      jest.advanceTimersByTime(300)

      // Clear the search
      await user.clear(searchInput)
      jest.advanceTimersByTime(300)

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
          searchTerm: undefined,
        })
      })
    })

    it('trims whitespace from search terms', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<FilterPanel {...defaultProps} />)

      const searchInput = screen.getByTestId('search-input')

      await user.type(searchInput, '  test search  ')
      jest.advanceTimersByTime(300)

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          searchTerm: 'test search',
        })
      })
    })
  })

  describe('Category Filter', () => {
    it('toggles category selection correctly', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)

      const shoesBadge = screen.getByText('댄스화')
      await user.click(shoesBadge)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        category: ['shoes'],
      })
    })

    it('allows multiple category selection', async () => {
      const user = userEvent.setup()
      const filtersWithShoes: ItemSearchFilters = {
        category: ['shoes'],
      }

      render(<FilterPanel {...defaultProps} filters={filtersWithShoes} />)

      const clothingBadge = screen.getByText('의상')
      await user.click(clothingBadge)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        category: ['shoes', 'clothing'],
      })
    })

    it('removes category when clicked again', async () => {
      const user = userEvent.setup()
      const filtersWithCategories: ItemSearchFilters = {
        category: ['shoes', 'clothing'],
      }

      render(<FilterPanel {...defaultProps} filters={filtersWithCategories} />)

      const shoesBadge = screen.getByText('댄스화')
      await user.click(shoesBadge)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        category: ['clothing'],
      })
    })

    it('clears category filter when all categories are removed', async () => {
      const user = userEvent.setup()
      const filtersWithOneCategory: ItemSearchFilters = {
        category: ['shoes'],
      }

      render(<FilterPanel {...defaultProps} filters={filtersWithOneCategory} />)

      const shoesBadge = screen.getByText('댄스화')
      await user.click(shoesBadge)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        category: undefined,
      })
    })
  })

  describe('Filter Panel Expansion', () => {
    it('expands filter panel when filter button is clicked', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)

      const filterButton = screen.getByText('필터').closest('button')!
      await user.click(filterButton)

      // Should show expanded filter options
      expect(screen.getByText('가격 범위')).toBeInTheDocument()
      expect(screen.getByText('상품 상태')).toBeInTheDocument()
      expect(screen.getByText('거래 방식')).toBeInTheDocument()
    })

    it('collapses filter panel when clicked again', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)

      const filterButton = screen.getByText('필터').closest('button')!

      // Expand
      await user.click(filterButton)
      expect(screen.getByText('가격 범위')).toBeInTheDocument()

      // Collapse
      await user.click(filterButton)
      expect(screen.queryByText('가격 범위')).not.toBeInTheDocument()
    })
  })

  describe('Price Range Filter', () => {
    it('formats price input with commas', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)

      // Expand filter panel
      const filterButton = screen.getByText('필터').closest('button')!
      await user.click(filterButton)

      const minPriceInput = screen.getByPlaceholderText('최소 가격')
      await user.type(minPriceInput, '50000')

      expect(minPriceInput).toHaveValue('50,000')
    })

    it('applies price range filter correctly', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)

      // Expand filter panel
      const filterButton = screen.getByText('필터').closest('button')!
      await user.click(filterButton)

      const minPriceInput = screen.getByPlaceholderText('최소 가격')
      const maxPriceInput = screen.getByPlaceholderText('최대 가격')
      const applyButton = screen.getByText('적용')

      await user.type(minPriceInput, '10000')
      await user.type(maxPriceInput, '50000')
      await user.click(applyButton)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        priceRange: { min: 10000, max: 50000 },
      })
    })

    it('handles invalid price input gracefully', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)

      const filterButton = screen.getByText('필터').closest('button')!
      await user.click(filterButton)

      const minPriceInput = screen.getByPlaceholderText('최소 가격')
      const applyButton = screen.getByText('적용')

      await user.type(minPriceInput, 'invalid')
      await user.click(applyButton)

      // Should not break or call filter change with invalid data
      expect(minPriceInput).toHaveValue('invalid')
    })
  })

  describe('Condition Filter', () => {
    it('toggles condition selection correctly', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)

      const filterButton = screen.getByText('필터').closest('button')!
      await user.click(filterButton)

      const newConditionBadge = screen.getByText('새상품')
      await user.click(newConditionBadge)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        condition: ['new'],
      })
    })

    it('allows multiple condition selection', async () => {
      const user = userEvent.setup()
      const filtersWithCondition: ItemSearchFilters = {
        condition: ['new'],
      }

      render(<FilterPanel {...defaultProps} filters={filtersWithCondition} />)

      const filterButton = screen.getByText('필터').closest('button')!
      await user.click(filterButton)

      const likeNewBadge = screen.getByText('거의새상품')
      await user.click(likeNewBadge)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        condition: ['new', 'like_new'],
      })
    })
  })

  describe('Trade Method Filter', () => {
    it('toggles trade method selection correctly', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)

      const filterButton = screen.getByText('필터').closest('button')!
      await user.click(filterButton)

      const directTradeBadge = screen.getByText('직거래')
      await user.click(directTradeBadge)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        tradeMethod: ['direct'],
      })
    })
  })

  describe('Additional Filters', () => {
    it('toggles negotiable filter correctly', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)

      const filterButton = screen.getByText('필터').closest('button')!
      await user.click(filterButton)

      const negotiableCheckbox = screen.getByLabelText('협상 가능')
      await user.click(negotiableCheckbox)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        negotiable: true,
      })
    })

    it('toggles delivery available filter correctly', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)

      const filterButton = screen.getByText('필터').closest('button')!
      await user.click(filterButton)

      const deliveryCheckbox = screen.getByLabelText('택배 가능')
      await user.click(deliveryCheckbox)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        deliveryAvailable: true,
      })
    })
  })

  describe('Sort Functionality', () => {
    it('changes sort option correctly', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)

      const sortSelect = screen.getByDisplayValue('최신순')
      await user.selectOptions(sortSelect, 'price_low')

      expect(mockOnSortChange).toHaveBeenCalledWith('price_low')
    })

    it('displays correct sort option', () => {
      render(<FilterPanel {...defaultProps} sortBy="price_high" />)

      expect(screen.getByDisplayValue('높은가격순')).toBeInTheDocument()
    })
  })

  describe('Clear All Filters', () => {
    it('shows clear all button when filters are active', async () => {
      const user = userEvent.setup()
      const filtersWithData: ItemSearchFilters = {
        category: ['shoes'],
        searchTerm: 'test',
      }

      render(<FilterPanel {...defaultProps} filters={filtersWithData} />)

      const filterButton = screen.getByText('필터').closest('button')!
      await user.click(filterButton)

      expect(screen.getByText('전체 초기화')).toBeInTheDocument()
    })

    it('clears all filters when clear button is clicked', async () => {
      const user = userEvent.setup()
      const filtersWithData: ItemSearchFilters = {
        category: ['shoes'],
        condition: ['new'],
        searchTerm: 'test',
        negotiable: true,
      }

      render(<FilterPanel {...defaultProps} filters={filtersWithData} />)

      const filterButton = screen.getByText('필터').closest('button')!
      await user.click(filterButton)

      const clearButton = screen.getByText('전체 초기화')
      await user.click(clearButton)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({})
      expect(mockOnSortChange).toHaveBeenCalledWith('latest')
    })

    it('does not show clear button when no filters are active', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)

      const filterButton = screen.getByText('필터').closest('button')!
      await user.click(filterButton)

      expect(screen.queryByText('전체 초기화')).not.toBeInTheDocument()
    })
  })

  describe('Result Count Display', () => {
    it('displays result count when provided', async () => {
      const user = userEvent.setup()
      const filtersWithData: ItemSearchFilters = {
        category: ['shoes'],
      }

      render(<FilterPanel {...defaultProps} filters={filtersWithData} resultCount={42} />)

      const filterButton = screen.getByText('필터').closest('button')!
      await user.click(filterButton)

      expect(screen.getByText('42개 상품')).toBeInTheDocument()
    })

    it('does not display result count when not provided', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)

      const filterButton = screen.getByText('필터').closest('button')!
      await user.click(filterButton)

      expect(screen.queryByText(/개 상품/)).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('provides proper form labels', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)

      const filterButton = screen.getByText('필터').closest('button')!
      await user.click(filterButton)

      expect(screen.getByLabelText('협상 가능')).toBeInTheDocument()
      expect(screen.getByLabelText('택배 가능')).toBeInTheDocument()
    })

    it('provides accessible search input', () => {
      render(<FilterPanel {...defaultProps} />)

      const searchInput = screen.getByTestId('search-input')
      expect(searchInput).toHaveAttribute('placeholder', '상품명, 브랜드, 설명 검색...')
    })

    it('provides accessible sort dropdown', () => {
      render(<FilterPanel {...defaultProps} />)

      const sortSelect = screen.getByRole('combobox')
      expect(sortSelect).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles missing filter props gracefully', () => {
      const minimalProps = {
        filters: {},
        onFiltersChange: mockOnFiltersChange,
        sortBy: 'latest' as ItemSortOption,
        onSortChange: mockOnSortChange,
      }

      expect(() => render(<FilterPanel {...minimalProps} />)).not.toThrow()
    })

    it('handles undefined filter values gracefully', () => {
      const filtersWithUndefined: ItemSearchFilters = {
        category: undefined,
        condition: undefined,
        searchTerm: undefined,
      }

      expect(() =>
        render(<FilterPanel {...defaultProps} filters={filtersWithUndefined} />)
      ).not.toThrow()
    })
  })
})