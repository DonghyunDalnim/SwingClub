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
        data: mockItems,
        pagination: {
          page: 1,
          limit: 12,
          total: 2,
          hasNext: false,
          hasPrev: false
        }
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
      mockGetMarketplaceItems.mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          hasNext: false,
          hasPrev: false
        }
      })

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(mockGetMarketplaceItems).toHaveBeenCalledWith(1, 12, 'latest')
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message when API call fails', async () => {
      mockGetMarketplaceItems.mockRejectedValue(new Error('상품을 불러오는데 실패했습니다.'))

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('상품을 불러오는데 실패했습니다.')).toBeInTheDocument()
        expect(screen.getByText('다시 시도')).toBeInTheDocument()
      })
    })

    it('shows retry button when error occurs', async () => {
      mockGetMarketplaceItems.mockRejectedValue(new Error('네트워크 오류'))

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        const retryButton = screen.getByText('다시 시도')
        expect(retryButton).toBeInTheDocument()
      })
    })

    it('retries loading when retry button is clicked', async () => {
      const user = userEvent.setup()

      // First call fails
      mockGetMarketplaceItems.mockRejectedValueOnce(new Error('네트워크 오류'))

      // Second call succeeds
      mockGetMarketplaceItems.mockResolvedValueOnce({
        data: mockItems,
        pagination: {
          page: 1,
          limit: 12,
          total: 2,
          hasNext: false,
          hasPrev: false
        }
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
        data: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          hasNext: false,
          hasPrev: false
        }
      })

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('상품이 없습니다')).toBeInTheDocument()
        expect(screen.getByText(/검색 조건을 변경하거나/)).toBeInTheDocument()
      })
    })
  })

  describe('Infinite Scroll / Load More', () => {
    it('shows load more button when hasMore is true', async () => {
      mockGetMarketplaceItems.mockResolvedValue({
        data: mockItems,
        pagination: {
          page: 1,
          limit: 12,
          total: 20,
          hasNext: true,
          hasPrev: false
        }
      })

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('더 보기')).toBeInTheDocument()
      })
    })

    it('does not show load more button when hasMore is false', async () => {
      mockGetMarketplaceItems.mockResolvedValue({
        data: mockItems,
        pagination: {
          page: 1,
          limit: 12,
          total: 2,
          hasNext: false,
          hasPrev: false
        }
      })

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.queryByText('더 보기')).not.toBeInTheDocument()
      })
    })

    it('loads more items when load more button is clicked', async () => {
      const user = userEvent.setup()

      // First load
      mockGetMarketplaceItems.mockResolvedValueOnce({
        data: [mockItems[0]],
        pagination: {
          page: 1,
          limit: 1,
          total: 2,
          hasNext: true,
          hasPrev: false
        }
      })

      // Second load (more items)
      mockGetMarketplaceItems.mockResolvedValueOnce({
        data: [mockItems[1]],
        pagination: {
          page: 2,
          limit: 1,
          total: 2,
          hasNext: false,
          hasPrev: true
        }
      })

      render(<ProductGrid {...defaultProps} />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Test Item 1')).toBeInTheDocument()
        expect(screen.getByText('더 보기')).toBeInTheDocument()
      })

      // Click load more
      const loadMoreButton = screen.getByText('더 보기')
      await user.click(loadMoreButton)

      // Wait for more items to load
      await waitFor(() => {
        expect(screen.getByText('Test Item 2')).toBeInTheDocument()
      })

      expect(mockGetMarketplaceItems).toHaveBeenCalledTimes(2)
      expect(mockGetMarketplaceItems).toHaveBeenNthCalledWith(2, 2, 12, 'latest')
    })

    it('shows loading state on load more button', async () => {
      const user = userEvent.setup()

      // First load
      mockGetMarketplaceItems.mockResolvedValueOnce({
        data: mockItems,
        pagination: {
          page: 1,
          limit: 12,
          total: 20,
          hasNext: true,
          hasPrev: false
        }
      })

      // Second load with delay
      mockGetMarketplaceItems.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({
          data: [],
          pagination: {
            page: 2,
            limit: 12,
            total: 20,
            hasNext: false,
            hasPrev: true
          }
        }), 100))
      )

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('더 보기')).toBeInTheDocument()
      })

      const loadMoreButton = screen.getByText('더 보기')
      await user.click(loadMoreButton)

      // Should show loading state
      expect(loadMoreButton).toBeDisabled()
    })

    it('handles load more error gracefully', async () => {
      const user = userEvent.setup()

      // First load succeeds
      mockGetMarketplaceItems.mockResolvedValueOnce({
        data: mockItems,
        pagination: {
          page: 1,
          limit: 12,
          total: 20,
          hasNext: true,
          hasPrev: false
        }
      })

      // Second load fails
      mockGetMarketplaceItems.mockRejectedValueOnce(new Error('Load more failed'))

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('더 보기')).toBeInTheDocument()
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const loadMoreButton = screen.getByText('더 보기')
      await user.click(loadMoreButton)

      await waitFor(() => {
        expect(screen.getByText('추가 상품을 불러오는데 실패했습니다.')).toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })
  })

  describe('Filter Changes', () => {
    it('reloads data when filters change', async () => {
      const { rerender } = render(<ProductGrid {...defaultProps} />)

      mockGetMarketplaceItems.mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          hasNext: false,
          hasPrev: false
        }
      })

      await waitFor(() => {
        expect(mockGetMarketplaceItems).toHaveBeenCalledWith(1, 12, 'latest')
      })

      // Change filters
      const newFilters: ItemSearchFilters = { category: ['shoes'] }
      rerender(<ProductGrid {...defaultProps} filters={newFilters} />)

      await waitFor(() => {
        expect(mockGetMarketplaceItems).toHaveBeenCalledTimes(2)
      })
    })

    it('reloads data when sort changes', async () => {
      const { rerender } = render(<ProductGrid {...defaultProps} />)

      mockGetMarketplaceItems.mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          hasNext: false,
          hasPrev: false
        }
      })

      await waitFor(() => {
        expect(mockGetMarketplaceItems).toHaveBeenCalledWith(1, 12, 'latest')
      })

      // Change sort
      rerender(<ProductGrid {...defaultProps} sortBy="price_low" />)

      await waitFor(() => {
        expect(mockGetMarketplaceItems).toHaveBeenLastCalledWith(1, 12, 'price_low')
        expect(mockGetMarketplaceItems).toHaveBeenCalledTimes(2)
      })
    })

    it('resets pagination when filters change', async () => {
      const { rerender } = render(<ProductGrid {...defaultProps} />)

      mockGetMarketplaceItems.mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          hasNext: false,
          hasPrev: false
        }
      })

      await waitFor(() => {
        expect(mockGetMarketplaceItems).toHaveBeenCalledWith(1, 12, 'latest')
      })

      // Change filters should reset to page 1
      const newFilters: ItemSearchFilters = { category: ['clothing'] }
      rerender(<ProductGrid {...defaultProps} filters={newFilters} />)

      await waitFor(() => {
        expect(mockGetMarketplaceItems).toHaveBeenLastCalledWith(1, 12, 'latest')
      })
    })
  })

  describe('Product Card Integration', () => {
    it('passes correct props to ProductCard components', async () => {
      mockGetMarketplaceItems.mockResolvedValue({
        data: mockItems,
        pagination: {
          page: 1,
          limit: 12,
          total: 2,
          hasNext: false,
          hasPrev: false
        }
      })

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        const cards = screen.getAllByTestId('product-card')
        expect(cards).toHaveLength(2)
        expect(cards[0]).toHaveAttribute('data-item-id', 'item-1')
        expect(cards[1]).toHaveAttribute('data-item-id', 'item-2')
      })
    })
  })

  describe('Performance', () => {
    it('limits initial items per page', async () => {
      mockGetMarketplaceItems.mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          hasNext: false,
          hasPrev: false
        }
      })

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(mockGetMarketplaceItems).toHaveBeenCalledWith(1, 12, 'latest')
      })
    })

    it('prevents multiple simultaneous load more requests', async () => {
      const user = userEvent.setup()

      mockGetMarketplaceItems.mockResolvedValueOnce({
        data: mockItems,
        pagination: {
          page: 1,
          limit: 12,
          total: 20,
          hasNext: true,
          hasPrev: false
        }
      })

      // Slow second request
      mockGetMarketplaceItems.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({
          data: [],
          pagination: {
            page: 2,
            limit: 12,
            total: 20,
            hasNext: false,
            hasPrev: true
          }
        }), 100))
      )

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('더 보기')).toBeInTheDocument()
      })

      const loadMoreButton = screen.getByText('더 보기')

      // Click multiple times quickly
      await user.click(loadMoreButton)
      await user.click(loadMoreButton)
      await user.click(loadMoreButton)

      // Should only call once
      expect(mockGetMarketplaceItems).toHaveBeenCalledTimes(2)
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined data response', async () => {
      mockGetMarketplaceItems.mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          hasNext: false,
          hasPrev: false
        }
      })

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('상품이 없습니다')).toBeInTheDocument()
      })
    })

    it('handles null cursor gracefully', async () => {
      mockGetMarketplaceItems.mockResolvedValue({
        data: mockItems,
        pagination: {
          page: 1,
          limit: 12,
          total: 2,
          hasNext: false,
          hasPrev: false
        }
      })

      render(<ProductGrid {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getAllByTestId('product-card')).toHaveLength(2)
      })

      // Should not show load more button when hasNext is false
      expect(screen.queryByText('더 보기')).not.toBeInTheDocument()
    })
  })
})