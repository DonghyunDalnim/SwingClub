/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductGrid } from '@/components/marketplace/ProductGrid'
import { getMarketplaceItems } from '@/lib/actions/marketplace'
import type { MarketplaceItem, ItemSearchFilters, ItemSortOption } from '@/lib/types/marketplace'

// Mock marketplace actions
jest.mock('@/lib/actions/marketplace', () => ({
  getMarketplaceItems: jest.fn(),
}))

// Mock ProductCard component
jest.mock('@/components/marketplace/ProductCard', () => ({
  ProductCard: ({ item }: { item: MarketplaceItem }) => (
    <div data-testid="product-card" data-item-id={item.id}>
      {item.title}
    </div>
  ),
}))

// Mock UI components
jest.mock('@/components/core', () => ({
  Button: ({ children, className, onClick, disabled, variant, ...props }: any) => (
    <button
      className={`button ${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
      {...props}
    >
      {children}
    </button>
  ),
}))

const mockGetMarketplaceItems = getMarketplaceItems as jest.MockedFunction<
  typeof getMarketplaceItems
>

describe('ProductGrid', () => {
  const defaultProps = {
    filters: {} as ItemSearchFilters,
    sortBy: 'latest' as ItemSortOption,
    currentUserId: 'test-user-id',
  }

  const mockItems: MarketplaceItem[] = [
    {
      id: 'item-1',
      title: 'Test Item 1',
      description: 'Description 1',
      category: 'shoes',
      pricing: {
        price: 50000,
        currency: 'KRW',
        negotiable: false,
        tradeMethod: 'direct',
      },
      specs: { condition: 'good' },
      location: { region: '강남구', deliveryAvailable: false },
      stats: { views: 10, favorites: 5, inquiries: 2 },
      metadata: {
        createdAt: { toDate: () => new Date() } as any,
        updatedAt: { toDate: () => new Date() } as any,
        sellerId: 'seller-1',
        status: 'available',
        featured: false,
        reported: false,
      },
      images: [],
    },
    {
      id: 'item-2',
      title: 'Test Item 2',
      description: 'Description 2',
      category: 'clothing',
      pricing: {
        price: 30000,
        currency: 'KRW',
        negotiable: true,
        tradeMethod: 'both',
      },
      specs: { condition: 'like_new' },
      location: { region: '홍대', deliveryAvailable: true },
      stats: { views: 25, favorites: 12, inquiries: 8 },
      metadata: {
        createdAt: { toDate: () => new Date() } as any,
        updatedAt: { toDate: () => new Date() } as any,
        sellerId: 'seller-2',
        status: 'available',
        featured: false,
        reported: false,
      },
      images: [],
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial Loading', () => {
    it('shows loading skeleton while fetching data', () => {
      mockGetMarketplaceItems.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      render(<ProductGrid {...defaultProps} />)

      // Should show loading skeletons
      const skeletons = screen.getAllByText((content, element) => {
        return element?.className?.includes('animate-pulse') || false
      })
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('loads and displays products successfully', async () => {
      mockGetMarketplaceItems.mockResolvedValue({
        success: true,
        data: {
          items: mockItems,
          hasMore: false,
          nextCursor: null,
        },
      })

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Test Item 1')).toBeInTheDocument()
        expect(screen.getByText('Test Item 2')).toBeInTheDocument()
      })

      // Should render ProductCard components
      expect(screen.getAllByTestId('product-card')).toHaveLength(2)
    })

    it('calls getMarketplaceItems with correct parameters', async () => {
      const filters: ItemSearchFilters = {
        category: ['shoes'],
        searchTerm: 'test',
      }
      const sortBy: ItemSortOption = 'price_low'

      mockGetMarketplaceItems.mockResolvedValue({
        success: true,
        data: { items: [], hasMore: false, nextCursor: null },
      })

      render(<ProductGrid {...defaultProps} filters={filters} sortBy={sortBy} />)

      await waitFor(() => {
        expect(mockGetMarketplaceItems).toHaveBeenCalledWith({
          filters,
          sortBy,
          limit: 12,
        })
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message when API call fails', async () => {
      mockGetMarketplaceItems.mockResolvedValue({
        success: false,
        error: '상품을 불러오는데 실패했습니다.',
      })

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('상품을 불러오는데 실패했습니다.')).toBeInTheDocument()
        expect(screen.getByText('다시 시도')).toBeInTheDocument()
      })
    })

    it('shows retry button when error occurs', async () => {
      mockGetMarketplaceItems.mockResolvedValue({
        success: false,
        error: '네트워크 오류',
      })

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        const retryButton = screen.getByText('다시 시도')
        expect(retryButton).toBeInTheDocument()
      })
    })

    it('retries loading when retry button is clicked', async () => {
      const user = userEvent.setup()

      // First call fails
      mockGetMarketplaceItems.mockResolvedValueOnce({
        success: false,
        error: '네트워크 오류',
      })

      // Second call succeeds
      mockGetMarketplaceItems.mockResolvedValueOnce({
        success: true,
        data: { items: mockItems, hasMore: false, nextCursor: null },
      })

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('다시 시도')).toBeInTheDocument()
      })

      const retryButton = screen.getByText('다시 시도')
      await user.click(retryButton)

      await waitFor(() => {
        expect(screen.getByText('Test Item 1')).toBeInTheDocument()
      })

      expect(mockGetMarketplaceItems).toHaveBeenCalledTimes(2)
    })

    it('handles network errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      mockGetMarketplaceItems.mockRejectedValue(new Error('Network error'))

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('상품을 불러오는데 실패했습니다.')).toBeInTheDocument()
      })

      expect(consoleSpy).toHaveBeenCalledWith('상품 로드 실패:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('Empty State', () => {
    it('displays empty state when no products are found', async () => {
      mockGetMarketplaceItems.mockResolvedValue({
        success: true,
        data: { items: [], hasMore: false, nextCursor: null },
      })

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('상품이 없습니다')).toBeInTheDocument()
        expect(screen.getByText('검색 조건을 변경하거나')).toBeInTheDocument()
        expect(screen.getByText('나중에 다시 확인해보세요.')).toBeInTheDocument()
      })

      // Should show shopping bag emoji
      expect(screen.getByText('🛍️')).toBeInTheDocument()
    })
  })

  describe('Infinite Scroll / Load More', () => {
    it('shows load more button when hasMore is true', async () => {
      mockGetMarketplaceItems.mockResolvedValue({
        success: true,
        data: {
          items: mockItems,
          hasMore: true,
          nextCursor: 'cursor-123',
        },
      })

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('더 보기')).toBeInTheDocument()
      })
    })

    it('does not show load more button when hasMore is false', async () => {
      mockGetMarketplaceItems.mockResolvedValue({
        success: true,
        data: {
          items: mockItems,
          hasMore: false,
          nextCursor: null,
        },
      })

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.queryByText('더 보기')).not.toBeInTheDocument()
      })

      // Should show end message
      expect(screen.getByText('모든 상품을 확인했습니다 (2개)')).toBeInTheDocument()
    })

    it('loads more items when load more button is clicked', async () => {
      const user = userEvent.setup()

      // First call
      mockGetMarketplaceItems.mockResolvedValueOnce({
        success: true,
        data: {
          items: [mockItems[0]],
          hasMore: true,
          nextCursor: 'cursor-123',
        },
      })

      // Second call
      mockGetMarketplaceItems.mockResolvedValueOnce({
        success: true,
        data: {
          items: [mockItems[1]],
          hasMore: false,
          nextCursor: null,
        },
      })

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Test Item 1')).toBeInTheDocument()
        expect(screen.getByText('더 보기')).toBeInTheDocument()
      })

      const loadMoreButton = screen.getByText('더 보기')
      await user.click(loadMoreButton)

      await waitFor(() => {
        expect(screen.getByText('Test Item 2')).toBeInTheDocument()
      })

      // Both items should be displayed
      expect(screen.getByText('Test Item 1')).toBeInTheDocument()
      expect(screen.getByText('Test Item 2')).toBeInTheDocument()

      // Second call should include cursor
      expect(mockGetMarketplaceItems).toHaveBeenNthCalledWith(2, {
        filters: {},
        sortBy: 'latest',
        limit: 12,
        cursor: 'cursor-123',
      })
    })

    it('shows loading state on load more button', async () => {
      const user = userEvent.setup()

      mockGetMarketplaceItems.mockResolvedValueOnce({
        success: true,
        data: {
          items: [mockItems[0]],
          hasMore: true,
          nextCursor: 'cursor-123',
        },
      })

      mockGetMarketplaceItems.mockImplementation(
        () => new Promise(() => {}) // Never resolves for loading state
      )

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('더 보기')).toBeInTheDocument()
      })

      const loadMoreButton = screen.getByText('더 보기')
      await user.click(loadMoreButton)

      // Should show loading state
      expect(screen.getByText('로딩 중...')).toBeInTheDocument()
      expect(loadMoreButton).toBeDisabled()
    })

    it('handles load more error gracefully', async () => {
      const user = userEvent.setup()

      // First call succeeds
      mockGetMarketplaceItems.mockResolvedValueOnce({
        success: true,
        data: {
          items: [mockItems[0]],
          hasMore: true,
          nextCursor: 'cursor-123',
        },
      })

      // Second call fails
      mockGetMarketplaceItems.mockResolvedValueOnce({
        success: false,
        error: '추가 상품을 불러오는데 실패했습니다.',
      })

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('더 보기')).toBeInTheDocument()
      })

      const loadMoreButton = screen.getByText('더 보기')
      await user.click(loadMoreButton)

      await waitFor(() => {
        expect(screen.getByText('추가 상품을 불러오는데 실패했습니다.')).toBeInTheDocument()
        expect(screen.getByText('다시 시도')).toBeInTheDocument()
      })

      // Original items should still be displayed
      expect(screen.getByText('Test Item 1')).toBeInTheDocument()
    })
  })

  describe('Filter Changes', () => {
    it('reloads data when filters change', async () => {
      const { rerender } = render(<ProductGrid {...defaultProps} />)

      // Wait for initial load
      await waitFor(() => {
        expect(mockGetMarketplaceItems).toHaveBeenCalledTimes(1)
      })

      // Change filters
      const newFilters: ItemSearchFilters = {
        category: ['shoes'],
      }

      rerender(<ProductGrid {...defaultProps} filters={newFilters} />)

      // Should reload with new filters
      await waitFor(() => {
        expect(mockGetMarketplaceItems).toHaveBeenCalledTimes(2)
        expect(mockGetMarketplaceItems).toHaveBeenLastCalledWith({
          filters: newFilters,
          sortBy: 'latest',
          limit: 12,
        })
      })
    })

    it('reloads data when sort changes', async () => {
      const { rerender } = render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(mockGetMarketplaceItems).toHaveBeenCalledTimes(1)
      })

      // Change sort
      rerender(<ProductGrid {...defaultProps} sortBy="price_low" />)

      await waitFor(() => {
        expect(mockGetMarketplaceItems).toHaveBeenCalledTimes(2)
        expect(mockGetMarketplaceItems).toHaveBeenLastCalledWith({
          filters: {},
          sortBy: 'price_low',
          limit: 12,
        })
      })
    })

    it('resets pagination when filters change', async () => {
      mockGetMarketplaceItems.mockResolvedValue({
        success: true,
        data: { items: mockItems, hasMore: false, nextCursor: null },
      })

      const { rerender } = render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Test Item 1')).toBeInTheDocument()
      })

      // Change filters should reset items
      const newFilters: ItemSearchFilters = {
        category: ['shoes'],
      }

      rerender(<ProductGrid {...defaultProps} filters={newFilters} />)

      // Should start fresh with new filter
      expect(mockGetMarketplaceItems).toHaveBeenLastCalledWith({
        filters: newFilters,
        sortBy: 'latest',
        limit: 12,
        // No cursor - should start from beginning
      })
    })
  })

  describe('Product Card Integration', () => {
    it('passes correct props to ProductCard components', async () => {
      mockGetMarketplaceItems.mockResolvedValue({
        success: true,
        data: { items: mockItems, hasMore: false, nextCursor: null },
      })

      render(<ProductGrid {...defaultProps} currentUserId="test-user" />)

      await waitFor(() => {
        const productCards = screen.getAllByTestId('product-card')
        expect(productCards).toHaveLength(2)

        // Check that items are passed correctly
        expect(productCards[0]).toHaveAttribute('data-item-id', 'item-1')
        expect(productCards[1]).toHaveAttribute('data-item-id', 'item-2')
      })
    })
  })

  describe('Performance', () => {
    it('limits initial items per page', async () => {
      mockGetMarketplaceItems.mockResolvedValue({
        success: true,
        data: { items: [], hasMore: false, nextCursor: null },
      })

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(mockGetMarketplaceItems).toHaveBeenCalledWith({
          filters: {},
          sortBy: 'latest',
          limit: 12, // Should limit to 12 items per page
        })
      })
    })

    it('prevents multiple simultaneous load more requests', async () => {
      const user = userEvent.setup()

      mockGetMarketplaceItems.mockResolvedValueOnce({
        success: true,
        data: {
          items: [mockItems[0]],
          hasMore: true,
          nextCursor: 'cursor-123',
        },
      })

      // Second call takes time
      mockGetMarketplaceItems.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('더 보기')).toBeInTheDocument()
      })

      const loadMoreButton = screen.getByText('더 보기')

      // Click multiple times rapidly
      await user.click(loadMoreButton)
      await user.click(loadMoreButton)
      await user.click(loadMoreButton)

      // Should only make one additional call
      expect(mockGetMarketplaceItems).toHaveBeenCalledTimes(2)
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined data response', async () => {
      mockGetMarketplaceItems.mockResolvedValue({
        success: true,
        data: undefined,
      } as any)

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('상품이 없습니다')).toBeInTheDocument()
      })
    })

    it('handles null cursor gracefully', async () => {
      mockGetMarketplaceItems.mockResolvedValue({
        success: true,
        data: {
          items: mockItems,
          hasMore: true,
          nextCursor: null,
        },
      })

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        // Should not show load more button when cursor is null
        expect(screen.queryByText('더 보기')).not.toBeInTheDocument()
      })
    })
  })
})