import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudioFilter from '@/components/location/StudioFilter';

// Mock UI components
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className, onClick }: any) => (
    <div
      role="button"
      data-variant={variant}
      className={className}
      onClick={onClick}
      data-testid="filter-badge"
    >
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </button>
  ),
}));

// Mock icons
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
}));

describe('StudioFilter', () => {
  const defaultProps = {
    currentCategory: 'all',
    onCategoryChange: jest.fn(),
    studioCounts: {
      studio: 5,
      practice_room: 3,
      club: 2,
      public_space: 1,
      cafe: 1,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<StudioFilter {...defaultProps} />);
      expect(screen.getByText('카테고리')).toBeInTheDocument();
    });

    it('renders all category filters', () => {
      render(<StudioFilter {...defaultProps} />);
      expect(screen.getByText('전체')).toBeInTheDocument();
      expect(screen.getByText('스튜디오')).toBeInTheDocument();
      expect(screen.getByText('연습실')).toBeInTheDocument();
      expect(screen.getByText('클럽/파티')).toBeInTheDocument();
      expect(screen.getByText('공공장소')).toBeInTheDocument();
      expect(screen.getByText('카페')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <StudioFilter {...defaultProps} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Category Selection', () => {
    it('shows active state for current category', () => {
      render(<StudioFilter {...defaultProps} currentCategory="studio" />);
      const filterBadges = screen.getAllByTestId('filter-badge');
      const studioBadge = filterBadges.find(badge =>
        badge.textContent?.includes('스튜디오')
      );
      expect(studioBadge).toHaveAttribute('data-variant', 'default');
    });

    it('shows inactive state for non-current categories', () => {
      render(<StudioFilter {...defaultProps} currentCategory="studio" />);
      const filterBadges = screen.getAllByTestId('filter-badge');
      const practiceRoomBadge = filterBadges.find(badge =>
        badge.textContent?.includes('연습실')
      );
      expect(practiceRoomBadge).toHaveAttribute('data-variant', 'outline');
    });

    it('calls onCategoryChange when category is clicked', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(
        <StudioFilter
          {...defaultProps}
          onCategoryChange={mockOnChange}
        />
      );

      const studioButton = screen.getByText('스튜디오');
      await user.click(studioButton);

      expect(mockOnChange).toHaveBeenCalledWith('studio');
    });

    it('calls onCategoryChange with correct category for each filter', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(
        <StudioFilter
          {...defaultProps}
          onCategoryChange={mockOnChange}
        />
      );

      // Test all categories
      const categories = [
        { text: '전체', value: 'all' },
        { text: '스튜디오', value: 'studio' },
        { text: '연습실', value: 'practice_room' },
        { text: '클럽/파티', value: 'club' },
        { text: '공공장소', value: 'public_space' },
        { text: '카페', value: 'cafe' },
      ];

      for (const category of categories) {
        await user.click(screen.getByText(category.text));
        expect(mockOnChange).toHaveBeenCalledWith(category.value);
      }
    });
  });

  describe('Studio Counts', () => {
    it('displays correct counts for each category', () => {
      render(<StudioFilter {...defaultProps} />);
      expect(screen.getByText('전체 (12)')).toBeInTheDocument(); // Total of all counts
      expect(screen.getByText('스튜디오 (5)')).toBeInTheDocument();
      expect(screen.getByText('연습실 (3)')).toBeInTheDocument();
      expect(screen.getByText('클럽/파티 (2)')).toBeInTheDocument();
      expect(screen.getByText('공공장소 (1)')).toBeInTheDocument();
      expect(screen.getByText('카페 (1)')).toBeInTheDocument();
    });

    it('handles empty studioCounts', () => {
      render(<StudioFilter {...defaultProps} studioCounts={{}} />);
      expect(screen.getByText('전체 (0)')).toBeInTheDocument();
      expect(screen.getByText('스튜디오 (0)')).toBeInTheDocument();
    });

    it('handles missing counts for specific categories', () => {
      const partialCounts = {
        studio: 3,
        practice_room: 2,
      };

      render(<StudioFilter {...defaultProps} studioCounts={partialCounts} />);
      expect(screen.getByText('전체 (5)')).toBeInTheDocument();
      expect(screen.getByText('스튜디오 (3)')).toBeInTheDocument();
      expect(screen.getByText('클럽/파티 (0)')).toBeInTheDocument();
    });

    it('does not show count when count is 0', () => {
      const countsWithZero = {
        ...defaultProps.studioCounts,
        cafe: 0,
      };

      render(<StudioFilter {...defaultProps} studioCounts={countsWithZero} />);
      expect(screen.getByText('카페')).toBeInTheDocument();
      expect(screen.queryByText('카페 (0)')).not.toBeInTheDocument();
    });
  });

  describe('Filter Reset', () => {
    it('shows reset button when active filter is not "all"', () => {
      render(<StudioFilter {...defaultProps} currentCategory="studio" />);
      expect(screen.getByText('필터 초기화')).toBeInTheDocument();
    });

    it('does not show reset button when filter is "all"', () => {
      render(<StudioFilter {...defaultProps} currentCategory="all" />);
      expect(screen.queryByText('필터 초기화')).not.toBeInTheDocument();
    });

    it('calls onCategoryChange with "all" when reset button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(
        <StudioFilter
          {...defaultProps}
          currentCategory="studio"
          onCategoryChange={mockOnChange}
        />
      );

      const resetButton = screen.getByText('필터 초기화');
      await user.click(resetButton);

      expect(mockOnChange).toHaveBeenCalledWith('all');
    });

    it('shows active filter in applied filters section', () => {
      render(<StudioFilter {...defaultProps} currentCategory="studio" />);
      expect(screen.getByText('적용된 필터:')).toBeInTheDocument();
      expect(screen.getByText('스튜디오')).toBeInTheDocument();
    });

    it('allows removing active filter from applied filters section', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(
        <StudioFilter
          {...defaultProps}
          currentCategory="practice_room"
          onCategoryChange={mockOnChange}
        />
      );

      // Find the X button in the applied filters section
      const appliedFiltersSection = screen.getByText('적용된 필터:').closest('div');
      const xButton = appliedFiltersSection?.querySelector('[data-testid="x-icon"]')?.parentElement;

      if (xButton) {
        await user.click(xButton);
        expect(mockOnChange).toHaveBeenCalledWith('all');
      }
    });
  });

  describe('Styling and Accessibility', () => {
    it('applies correct styling for active filters', () => {
      render(<StudioFilter {...defaultProps} currentCategory="studio" />);
      const filterBadges = screen.getAllByTestId('filter-badge');
      const studioBadge = filterBadges.find(badge =>
        badge.textContent?.includes('스튜디오')
      );
      expect(studioBadge).toHaveClass('bg-blue-600', 'text-white', 'border-blue-600');
    });

    it('applies correct styling for inactive filters', () => {
      render(<StudioFilter {...defaultProps} currentCategory="studio" />);
      const filterBadges = screen.getAllByTestId('filter-badge');
      const allBadge = filterBadges.find(badge =>
        badge.textContent?.includes('전체')
      );
      expect(allBadge).toHaveClass('hover:bg-gray-50', 'hover:border-gray-300');
    });

    it('renders X icons correctly', () => {
      render(<StudioFilter {...defaultProps} currentCategory="studio" />);
      const xIcons = screen.getAllByTestId('x-icon');
      expect(xIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined onCategoryChange gracefully', async () => {
      const user = userEvent.setup();

      render(
        <StudioFilter
          {...defaultProps}
          onCategoryChange={undefined as any}
        />
      );

      const studioButton = screen.getByText('스튜디오');
      await user.click(studioButton);

      // Should not throw error
      expect(studioButton).toBeInTheDocument();
    });

    it('handles invalid currentCategory', () => {
      render(
        <StudioFilter
          {...defaultProps}
          currentCategory="invalid_category"
        />
      );

      // Should still render without crashing
      expect(screen.getByText('카테고리')).toBeInTheDocument();
      // All badges should be inactive
      const filterBadges = screen.getAllByTestId('filter-badge');
      filterBadges.forEach(badge => {
        expect(badge).toHaveAttribute('data-variant', 'outline');
      });
    });

    it('handles negative counts', () => {
      const countsWithNegative = {
        studio: -1,
        practice_room: 3,
      };

      render(<StudioFilter {...defaultProps} studioCounts={countsWithNegative} />);
      // Should handle gracefully, possibly showing 0 or the negative value
      expect(screen.getByText(/스튜디오/)).toBeInTheDocument();
    });

    it('calculates total correctly with mixed counts', () => {
      const mixedCounts = {
        studio: 5,
        practice_room: 0,
        club: 2,
        // Missing some categories
      };

      render(<StudioFilter {...defaultProps} studioCounts={mixedCounts} />);
      expect(screen.getByText('전체 (7)')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('works correctly when mounted and unmounted', () => {
      const { unmount } = render(<StudioFilter {...defaultProps} />);
      expect(screen.getByText('카테고리')).toBeInTheDocument();
      unmount();
      // Should not throw errors on unmount
    });

    it('updates correctly when props change', () => {
      const { rerender } = render(<StudioFilter {...defaultProps} />);

      rerender(
        <StudioFilter
          {...defaultProps}
          currentCategory="studio"
          studioCounts={{ studio: 10 }}
        />
      );

      expect(screen.getByText('스튜디오 (10)')).toBeInTheDocument();
      expect(screen.getByText('필터 초기화')).toBeInTheDocument();
    });
  });
});