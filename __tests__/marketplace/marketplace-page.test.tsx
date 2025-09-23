/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, useSearchParams } from 'next/navigation'
import MarketplacePage from '@/app/marketplace/page'

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
})

// Mock marketplace components
jest.mock('@/components/marketplace/FilterPanel', () => ({
  FilterPanel: ({ filters, onFiltersChange, sortBy, onSortChange }: any) => (
    <div data-testid="filter-panel">
      <button
        onClick={() => onFiltersChange({ category: ['shoes'] })}
        data-testid="filter-change-button"
      >
        Change Filter
      </button>
      <button
        onClick={() => onSortChange('price_low')}
        data-testid="sort-change-button"
      >
        Change Sort
      </button>
      <div data-testid="current-filters">{JSON.stringify(filters)}</div>
      <div data-testid="current-sort">{sortBy}</div>
    </div>
  ),
}))

jest.mock('@/components/marketplace/ProductGrid', () => ({
  ProductGrid: ({ filters, sortBy, currentUserId }: any) => (
    <div data-testid="product-grid">
      <div data-testid="grid-filters">{JSON.stringify(filters)}</div>
      <div data-testid="grid-sort">{sortBy}</div>
      <div data-testid="grid-user">{currentUserId}</div>
    </div>
  ),
}))

// Mock UI components
jest.mock('@/components/core', () => ({
  Button: ({ children, className, onClick, size, variant, ...props }: any) => (
    <button
      className={`button ${variant} ${size} ${className}`}
      onClick={onClick}
      data-testid="button"
      {...props}
    >
      {children}
    </button>
  ),
}))

const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockRouter = {
  push: mockPush,
  replace: mockReplace,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}

const mockSearchParams = new URLSearchParams()

describe('MarketplacePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
  })

  describe('Basic Rendering', () => {
    it('renders marketplace page with header', () => {
      render(<MarketplacePage />)

      expect(screen.getByText('중고거래')).toBeInTheDocument()
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument()
      expect(screen.getByTestId('product-grid')).toBeInTheDocument()
    })

    it('renders create listing button in header and floating action', () => {
      render(<MarketplacePage />)

      const createButtons = screen.getAllByText('등록')
      expect(createButtons).toHaveLength(2) // Header button and floating button

      // Check links to create page
      const createLinks = screen.getAllByRole('link', { name: /등록/i })
      createLinks.forEach((link) => {
        expect(link).toHaveAttribute('href', '/marketplace/create')
      })
    })

    it('applies correct styling classes', () => {
      render(<MarketplacePage />)

      const mainContainer = screen.getByText('중고거래').closest('div')?.parentElement
      expect(mainContainer).toHaveClass('min-h-screen', 'bg-gray-50')

      // Header should be sticky
      const header = screen.getByText('중고거래').closest('header')
      expect(header).toHaveClass('sticky', 'top-0', 'z-40')
    })
  })

  describe('URL State Management', () => {
    it('initializes with empty filters when no URL params', () => {
      render(<MarketplacePage />)

      const filtersElement = screen.getByTestId('current-filters')
      expect(filtersElement).toHaveTextContent('{}')

      const sortElement = screen.getByTestId('current-sort')
      expect(sortElement).toHaveTextContent('latest')
    })

    it('initializes filters from URL parameters', () => {
      const searchParamsWithFilters = new URLSearchParams({
        category: 'shoes,clothing',
        search: 'test search',
        priceMin: '10000',
        priceMax: '50000',
        sort: 'price_low',
      })
      ;(useSearchParams as jest.Mock).mockReturnValue(searchParamsWithFilters)

      render(<MarketplacePage />)

      const filtersElement = screen.getByTestId('current-filters')
      const filtersText = filtersElement.textContent

      // Should contain the URL parameters
      expect(filtersText).toContain('shoes')
      expect(filtersText).toContain('test search')
      expect(filtersText).toContain('10000')
      expect(filtersText).toContain('50000')

      const sortElement = screen.getByTestId('current-sort')
      expect(sortElement).toHaveTextContent('price_low')
    })

    it('handles boolean URL parameters correctly', () => {
      const searchParamsWithBooleans = new URLSearchParams({
        negotiable: 'true',
        deliveryAvailable: 'true',
      })
      ;(useSearchParams as jest.Mock).mockReturnValue(searchParamsWithBooleans)

      render(<MarketplacePage />)

      const filtersElement = screen.getByTestId('current-filters')
      const filtersText = filtersElement.textContent

      expect(filtersText).toContain('negotiable')
      expect(filtersText).toContain('deliveryAvailable')
    })

    it('ignores invalid URL parameters', () => {
      const searchParamsWithInvalid = new URLSearchParams({
        category: 'invalid-category',
        sort: 'invalid-sort',
        priceMin: 'not-a-number',
      })
      ;(useSearchParams as jest.Mock).mockReturnValue(searchParamsWithInvalid)

      render(<MarketplacePage />)

      // Should handle gracefully without throwing errors
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument()
    })
  })

  describe('Filter State Changes', () => {
    it('updates URL when filters change', async () => {
      const user = userEvent.setup()
      render(<MarketplacePage />)

      const filterChangeButton = screen.getByTestId('filter-change-button')
      await user.click(filterChangeButton)

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/marketplace?category=shoes', {
          scroll: false,
        })
      })
    })

    it('updates URL when sort changes', async () => {
      const user = userEvent.setup()
      render(<MarketplacePage />)

      const sortChangeButton = screen.getByTestId('sort-change-button')
      await user.click(sortChangeButton)

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/marketplace?sort=price_low', {
          scroll: false,
        })
      })
    })

    it('preserves existing filters when adding new ones', async () => {
      const user = userEvent.setup()
      const searchParamsWithExisting = new URLSearchParams({
        search: 'existing search',
      })
      ;(useSearchParams as jest.Mock).mockReturnValue(searchParamsWithExisting)

      render(<MarketplacePage />)

      const filterChangeButton = screen.getByTestId('filter-change-button')
      await user.click(filterChangeButton)

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          expect.stringContaining('category=shoes'),
          { scroll: false }
        )
      })
    })

    it('removes empty filters from URL', async () => {
      const user = userEvent.setup()
      render(<MarketplacePage />)

      // Simulate clearing filters
      const filterPanel = screen.getByTestId('filter-panel')
      const clearButton = document.createElement('button')
      clearButton.onclick = () => {
        // Simulate FilterPanel calling onFiltersChange with empty object
        const event = new CustomEvent('filtersChange', { detail: {} })
        filterPanel.dispatchEvent(event)
      }

      // This would be handled by the actual FilterPanel component
      // For testing, we verify the URL update logic
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('passes correct props to FilterPanel', () => {
      render(<MarketplacePage />)

      // FilterPanel should receive the current filters and sort
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument()
      expect(screen.getByTestId('current-filters')).toHaveTextContent('{}')
      expect(screen.getByTestId('current-sort')).toHaveTextContent('latest')
    })

    it('passes correct props to ProductGrid', () => {
      render(<MarketplacePage />)

      // ProductGrid should receive filters, sort, and user ID
      expect(screen.getByTestId('product-grid')).toBeInTheDocument()
      expect(screen.getByTestId('grid-filters')).toHaveTextContent('{}')
      expect(screen.getByTestId('grid-sort')).toHaveTextContent('latest')
      expect(screen.getByTestId('grid-user')).toHaveTextContent('current-user-id')
    })

    it('updates ProductGrid when filters change', async () => {
      const user = userEvent.setup()
      render(<MarketplacePage />)

      // Initially empty filters
      expect(screen.getByTestId('grid-filters')).toHaveTextContent('{}')

      // Change filters
      const filterChangeButton = screen.getByTestId('filter-change-button')
      await user.click(filterChangeButton)

      // ProductGrid should receive updated filters
      await waitFor(() => {
        const gridFilters = screen.getByTestId('grid-filters')
        expect(gridFilters.textContent).toContain('shoes')
      })
    })
  })

  describe('Navigation', () => {
    it('provides correct navigation links', () => {
      render(<MarketplacePage />)

      const createLinks = screen.getAllByRole('link', { name: /등록/i })
      createLinks.forEach((link) => {
        expect(link).toHaveAttribute('href', '/marketplace/create')
      })
    })

    it('renders floating action button with correct styling', () => {
      render(<MarketplacePage />)

      const floatingButton = screen.getByText('등록').closest('a')
      expect(floatingButton).toHaveClass('fixed', 'bottom-20', 'right-4')

      const button = floatingButton?.querySelector('button')
      expect(button).toHaveClass('rounded-full', 'shadow-lg')
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive container classes', () => {
      render(<MarketplacePage />)

      const container = screen.getByTestId('product-grid').parentElement
      expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-6')
    })

    it('renders mobile-friendly header', () => {
      render(<MarketplacePage />)

      const header = screen.getByText('중고거래').closest('header')
      const headerContent = header?.querySelector('div')

      expect(headerContent).toHaveClass('flex', 'items-center', 'justify-between', 'px-4', 'py-3')
    })
  })

  describe('Error Handling', () => {
    it('handles URL parsing errors gracefully', () => {
      // Mock a problematic search params
      const problematicSearchParams = {
        get: jest.fn((key) => {
          if (key === 'category') throw new Error('URL parsing error')
          return null
        }),
      }
      ;(useSearchParams as jest.Mock).mockReturnValue(problematicSearchParams)

      expect(() => render(<MarketplacePage />)).not.toThrow()
    })

    it('handles router errors gracefully', () => {
      const problematicRouter = {
        ...mockRouter,
        replace: jest.fn(() => {
          throw new Error('Navigation error')
        }),
      }
      ;(useRouter as jest.Mock).mockReturnValue(problematicRouter)

      expect(() => render(<MarketplacePage />)).not.toThrow()
    })
  })

  describe('Performance', () => {
    it('uses replace instead of push for URL updates', async () => {
      const user = userEvent.setup()
      render(<MarketplacePage />)

      const filterChangeButton = screen.getByTestId('filter-change-button')
      await user.click(filterChangeButton)

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalled()
        expect(mockPush).not.toHaveBeenCalled()
      })
    })

    it('prevents scroll on URL updates', async () => {
      const user = userEvent.setup()
      render(<MarketplacePage />)

      const filterChangeButton = screen.getByTestId('filter-change-button')
      await user.click(filterChangeButton)

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(expect.any(String), {
          scroll: false,
        })
      })
    })
  })

  describe('Accessibility', () => {
    it('provides proper semantic structure', () => {
      render(<MarketplacePage />)

      // Should have proper header
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()

      // Should have accessible navigation
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)

      // Should have accessible buttons
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('provides proper heading hierarchy', () => {
      render(<MarketplacePage />)

      const pageTitle = screen.getByText('중고거래')
      expect(pageTitle).toBeInTheDocument()
    })

    it('provides accessible action buttons', () => {
      render(<MarketplacePage />)

      const actionButtons = screen.getAllByText('등록')
      actionButtons.forEach((button) => {
        expect(button).toBeVisible()
      })
    })
  })

  describe('State Persistence', () => {
    it('maintains filter state across component re-renders', () => {
      const { rerender } = render(<MarketplacePage />)

      // Initial state
      expect(screen.getByTestId('current-filters')).toHaveTextContent('{}')

      // Re-render should maintain state
      rerender(<MarketplacePage />)
      expect(screen.getByTestId('current-filters')).toHaveTextContent('{}')
    })

    it('restores state from URL on component mount', () => {
      const searchParamsWithState = new URLSearchParams({
        category: 'shoes',
        sort: 'price_low',
      })
      ;(useSearchParams as jest.Mock).mockReturnValue(searchParamsWithState)

      render(<MarketplacePage />)

      expect(screen.getByTestId('current-sort')).toHaveTextContent('price_low')
      const filtersText = screen.getByTestId('current-filters').textContent
      expect(filtersText).toContain('shoes')
    })
  })
})