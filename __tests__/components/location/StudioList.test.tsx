import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudioList from '@/components/location/StudioList';
import { Studio } from '@/lib/types/studio';

// Mock StudioCard component
jest.mock('@/components/location/StudioCard', () => {
  return {
    __esModule: true,
    default: ({ studio, isSelected, onClick, searchQuery }: any) => (
      <div
        data-testid={`studio-card-${studio.id}`}
        data-selected={isSelected}
        data-search-query={searchQuery}
        onClick={() => onClick?.(studio)}
      >
        {studio.name}
      </div>
    ),
  };
});

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}));

// Mock studio data
const mockStudios: Studio[] = [
  {
    id: 'studio-1',
    name: 'Test Studio 1',
    category: 'studio',
    description: 'Test description 1',
    location: {
      geopoint: { latitude: 37.5665, longitude: 126.978 } as any,
      address: 'Test Address 1',
      region: 'Test Region 1',
    },
    stats: {
      views: 100,
      favorites: 50,
      avgRating: 4.5,
      reviewCount: 10,
    },
    metadata: {
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
      createdBy: 'test-user',
      verified: true,
      featured: false,
      status: 'active',
    },
  },
  {
    id: 'studio-2',
    name: 'Test Studio 2',
    category: 'practice_room',
    location: {
      geopoint: { latitude: 37.5665, longitude: 126.978 } as any,
      address: 'Test Address 2',
      region: 'Test Region 2',
    },
    stats: {
      views: 200,
      favorites: 75,
      avgRating: 4.0,
      reviewCount: 20,
    },
    metadata: {
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
      createdBy: 'test-user',
      verified: false,
      featured: false,
      status: 'active',
    },
  },
];

describe('StudioList', () => {
  const defaultProps = {
    studios: mockStudios,
    selectedStudioId: undefined,
    onStudioSelect: jest.fn(),
    isLoading: false,
    searchQuery: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<StudioList {...defaultProps} />);
      expect(screen.getByText('총 2개 스튜디오')).toBeInTheDocument();
    });

    it('renders all studios', () => {
      render(<StudioList {...defaultProps} />);
      expect(screen.getByTestId('studio-card-studio-1')).toBeInTheDocument();
      expect(screen.getByTestId('studio-card-studio-2')).toBeInTheDocument();
    });

    it('shows total count correctly', () => {
      render(<StudioList {...defaultProps} />);
      expect(screen.getByText('총 2개 스튜디오')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <StudioList {...defaultProps} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Loading State', () => {
    it('shows loading skeleton when isLoading is true', () => {
      render(<StudioList {...defaultProps} isLoading={true} />);
      expect(screen.getAllByRole('generic')).toHaveLength(3); // 3 skeleton items
    });

    it('shows loading animation', () => {
      render(<StudioList {...defaultProps} isLoading={true} />);
      const skeletons = screen.getAllByRole('generic');
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('animate-pulse');
      });
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no studios', () => {
      render(<StudioList {...defaultProps} studios={[]} />);
      expect(screen.getByText('스튜디오가 없습니다')).toBeInTheDocument();
    });

    it('shows search-specific empty message', () => {
      render(
        <StudioList
          {...defaultProps}
          studios={[]}
          searchQuery="nonexistent"
        />
      );
      expect(screen.getByText("'nonexistent' 검색 결과가 없습니다. 다른 검색어를 시도해보세요.")).toBeInTheDocument();
    });

    it('shows guidance text in empty state', () => {
      render(<StudioList {...defaultProps} studios={[]} />);
      expect(screen.getByText('지도를 이동하거나 필터 조건을 변경해보세요.')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    const manyStudios = Array.from({ length: 25 }, (_, i) => ({
      ...mockStudios[0],
      id: `studio-${i + 1}`,
      name: `Studio ${i + 1}`,
    }));

    it('shows pagination when studios exceed itemsPerPage', () => {
      render(<StudioList {...defaultProps} studios={manyStudios} />);
      expect(screen.getByText('1 / 3 페이지')).toBeInTheDocument();
    });

    it('shows only itemsPerPage studios per page', () => {
      render(<StudioList {...defaultProps} studios={manyStudios} itemsPerPage={5} />);
      const studioCards = screen.getAllByTestId(/studio-card-/);
      expect(studioCards).toHaveLength(5);
    });

    it('navigates to next page', async () => {
      const user = userEvent.setup();
      render(<StudioList {...defaultProps} studios={manyStudios} />);

      const nextButton = screen.getByRole('button', { name: '다음' });
      await user.click(nextButton);

      expect(screen.getByText('2 / 3 페이지')).toBeInTheDocument();
    });

    it('navigates to previous page', async () => {
      const user = userEvent.setup();
      render(<StudioList {...defaultProps} studios={manyStudios} />);

      // Go to page 2 first
      const nextButton = screen.getByRole('button', { name: '다음' });
      await user.click(nextButton);

      // Then go back
      const prevButton = screen.getByRole('button', { name: '이전' });
      await user.click(prevButton);

      expect(screen.getByText('1 / 3 페이지')).toBeInTheDocument();
    });

    it('disables previous button on first page', () => {
      render(<StudioList {...defaultProps} studios={manyStudios} />);
      const prevButton = screen.getByRole('button', { name: '이전' });
      expect(prevButton).toBeDisabled();
    });

    it('disables next button on last page', async () => {
      const user = userEvent.setup();
      render(<StudioList {...defaultProps} studios={manyStudios} />);

      // Go to last page
      const pageButton = screen.getByRole('button', { name: '3' });
      await user.click(pageButton);

      const nextButton = screen.getByRole('button', { name: '다음' });
      expect(nextButton).toBeDisabled();
    });

    it('navigates to specific page number', async () => {
      const user = userEvent.setup();
      render(<StudioList {...defaultProps} studios={manyStudios} />);

      const pageButton = screen.getByRole('button', { name: '2' });
      await user.click(pageButton);

      expect(screen.getByText('2 / 3 페이지')).toBeInTheDocument();
    });
  });

  describe('Studio Selection', () => {
    it('calls onStudioSelect when studio is clicked', async () => {
      const user = userEvent.setup();
      const mockOnSelect = jest.fn();

      render(
        <StudioList
          {...defaultProps}
          onStudioSelect={mockOnSelect}
        />
      );

      const studioCard = screen.getByTestId('studio-card-studio-1');
      await user.click(studioCard);

      expect(mockOnSelect).toHaveBeenCalledWith(mockStudios[0]);
    });

    it('shows selected studio correctly', () => {
      render(
        <StudioList
          {...defaultProps}
          selectedStudioId="studio-1"
        />
      );

      const selectedCard = screen.getByTestId('studio-card-studio-1');
      expect(selectedCard).toHaveAttribute('data-selected', 'true');
    });

    it('passes search query to studio cards', () => {
      render(
        <StudioList
          {...defaultProps}
          searchQuery="test search"
        />
      );

      const studioCard = screen.getByTestId('studio-card-studio-1');
      expect(studioCard).toHaveAttribute('data-search-query', 'test search');
    });
  });

  describe('Search Results', () => {
    it('shows search query in result summary', () => {
      render(
        <StudioList
          {...defaultProps}
          searchQuery="test query"
        />
      );
      expect(screen.getByText('총 2개 스튜디오 (검색: test query)')).toBeInTheDocument();
    });

    it('does not show search text when no query', () => {
      render(<StudioList {...defaultProps} searchQuery="" />);
      expect(screen.getByText('총 2개 스튜디오')).toBeInTheDocument();
      expect(screen.queryByText(/검색:/)).not.toBeInTheDocument();
    });
  });

  describe('Additional Features', () => {
    it('shows guidance for large result sets', () => {
      const manyStudios = Array.from({ length: 50 }, (_, i) => ({
        ...mockStudios[0],
        id: `studio-${i + 1}`,
      }));

      render(<StudioList {...defaultProps} studios={manyStudios} />);
      expect(screen.getByText('더 정확한 결과를 위해 검색어나 필터를 사용해보세요.')).toBeInTheDocument();
    });

    it('scrolls to top when page changes', async () => {
      const scrollToSpy = jest.spyOn(window, 'scrollTo');
      scrollToSpy.mockImplementation(() => {});

      const user = userEvent.setup();
      const manyStudios = Array.from({ length: 25 }, (_, i) => ({
        ...mockStudios[0],
        id: `studio-${i + 1}`,
      }));

      render(<StudioList {...defaultProps} studios={manyStudios} />);

      const nextButton = screen.getByRole('button', { name: '다음' });
      await user.click(nextButton);

      expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });

      scrollToSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined onStudioSelect gracefully', async () => {
      const user = userEvent.setup();

      render(
        <StudioList
          {...defaultProps}
          onStudioSelect={undefined}
        />
      );

      const studioCard = screen.getByTestId('studio-card-studio-1');
      await user.click(studioCard);

      // Should not throw error
      expect(studioCard).toBeInTheDocument();
    });

    it('handles custom itemsPerPage correctly', () => {
      const manyStudios = Array.from({ length: 7 }, (_, i) => ({
        ...mockStudios[0],
        id: `studio-${i + 1}`,
      }));

      render(
        <StudioList
          {...defaultProps}
          studios={manyStudios}
          itemsPerPage={3}
        />
      );

      expect(screen.getByText('1 / 3 페이지')).toBeInTheDocument();
      const studioCards = screen.getAllByTestId(/studio-card-/);
      expect(studioCards).toHaveLength(3);
    });

    it('handles single page correctly', () => {
      render(<StudioList {...defaultProps} itemsPerPage={10} />);
      expect(screen.queryByText(/페이지/)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '이전' })).not.toBeInTheDocument();
    });
  });
});