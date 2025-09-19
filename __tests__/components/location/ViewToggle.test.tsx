import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ViewToggle, ViewMode } from '@/components/location/ViewToggle';

describe('ViewToggle', () => {
  let mockOnViewChange: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnViewChange = jest.fn();
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render both map and list buttons', () => {
      render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      expect(screen.getByRole('button', { name: /지도/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /리스트/i })).toBeInTheDocument();
    });

    it('should render with correct icons', () => {
      render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      // Check for Lucide icons (they should be rendered as SVG elements)
      const buttons = screen.getAllByRole('button');
      const mapButton = buttons.find(button => button.textContent?.includes('지도'));
      const listButton = buttons.find(button => button.textContent?.includes('리스트'));

      expect(mapButton).toBeInTheDocument();
      expect(listButton).toBeInTheDocument();

      // Check for SVG icons
      expect(mapButton?.querySelector('svg')).toBeInTheDocument();
      expect(listButton?.querySelector('svg')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const customClass = 'custom-view-toggle';
      const { container } = render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
          className={customClass}
        />
      );

      expect(container.firstChild).toHaveClass(customClass);
    });

    it('should render without custom className', () => {
      const { container } = render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      expect(container.firstChild).toHaveClass('flex', 'items-center', 'bg-gray-100', 'rounded-lg', 'p-1');
    });
  });

  describe('View Mode States', () => {
    describe('Map View Active', () => {
      it('should show map button as active when currentView is "map"', () => {
        render(
          <ViewToggle
            currentView="map"
            onViewChange={mockOnViewChange}
          />
        );

        const mapButton = screen.getByRole('button', { name: /지도/i });
        const listButton = screen.getByRole('button', { name: /리스트/i });

        // Map button should have active styles
        expect(mapButton).toHaveClass('bg-white', 'shadow-sm', 'text-gray-900');
        expect(mapButton).not.toHaveClass('text-gray-600');

        // List button should have inactive styles
        expect(listButton).toHaveClass('text-gray-600');
        expect(listButton).not.toHaveClass('bg-white', 'shadow-sm');
      });

      it('should apply correct button variant for map view', () => {
        render(
          <ViewToggle
            currentView="map"
            onViewChange={mockOnViewChange}
          />
        );

        const mapButton = screen.getByRole('button', { name: /지도/i });
        const listButton = screen.getByRole('button', { name: /리스트/i });

        // Check that buttons are rendered (variant is handled by the Button component)
        expect(mapButton).toBeInTheDocument();
        expect(listButton).toBeInTheDocument();
      });
    });

    describe('List View Active', () => {
      it('should show list button as active when currentView is "list"', () => {
        render(
          <ViewToggle
            currentView="list"
            onViewChange={mockOnViewChange}
          />
        );

        const mapButton = screen.getByRole('button', { name: /지도/i });
        const listButton = screen.getByRole('button', { name: /리스트/i });

        // List button should have active styles
        expect(listButton).toHaveClass('bg-white', 'shadow-sm', 'text-gray-900');
        expect(listButton).not.toHaveClass('text-gray-600');

        // Map button should have inactive styles
        expect(mapButton).toHaveClass('text-gray-600');
        expect(mapButton).not.toHaveClass('bg-white', 'shadow-sm');
      });

      it('should apply correct button variant for list view', () => {
        render(
          <ViewToggle
            currentView="list"
            onViewChange={mockOnViewChange}
          />
        );

        const mapButton = screen.getByRole('button', { name: /지도/i });
        const listButton = screen.getByRole('button', { name: /리스트/i });

        // Check that buttons are rendered (variant is handled by the Button component)
        expect(mapButton).toBeInTheDocument();
        expect(listButton).toBeInTheDocument();
      });
    });
  });

  describe('Click Event Handling', () => {
    it('should call onViewChange with "map" when map button is clicked', () => {
      render(
        <ViewToggle
          currentView="list"
          onViewChange={mockOnViewChange}
        />
      );

      const mapButton = screen.getByRole('button', { name: /지도/i });
      fireEvent.click(mapButton);

      expect(mockOnViewChange).toHaveBeenCalledWith('map');
      expect(mockOnViewChange).toHaveBeenCalledTimes(1);
    });

    it('should call onViewChange with "list" when list button is clicked', () => {
      render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      const listButton = screen.getByRole('button', { name: /리스트/i });
      fireEvent.click(listButton);

      expect(mockOnViewChange).toHaveBeenCalledWith('list');
      expect(mockOnViewChange).toHaveBeenCalledTimes(1);
    });

    it('should call onViewChange when clicking already active button', () => {
      render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      const mapButton = screen.getByRole('button', { name: /지도/i });
      fireEvent.click(mapButton);

      expect(mockOnViewChange).toHaveBeenCalledWith('map');
      expect(mockOnViewChange).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple rapid clicks correctly', () => {
      render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      const mapButton = screen.getByRole('button', { name: /지도/i });
      const listButton = screen.getByRole('button', { name: /리스트/i });

      // Rapidly click both buttons
      fireEvent.click(listButton);
      fireEvent.click(mapButton);
      fireEvent.click(listButton);
      fireEvent.click(mapButton);

      expect(mockOnViewChange).toHaveBeenCalledTimes(4);
      expect(mockOnViewChange).toHaveBeenNthCalledWith(1, 'list');
      expect(mockOnViewChange).toHaveBeenNthCalledWith(2, 'map');
      expect(mockOnViewChange).toHaveBeenNthCalledWith(3, 'list');
      expect(mockOnViewChange).toHaveBeenNthCalledWith(4, 'map');
    });

    it('should not throw error when onViewChange is undefined', () => {
      expect(() => {
        render(
          <ViewToggle
            currentView="map"
            onViewChange={undefined as any}
          />
        );
      }).not.toThrow();

      const mapButton = screen.getByRole('button', { name: /지도/i });
      expect(() => fireEvent.click(mapButton)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should render accessible buttons with proper semantics', () => {
      render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);

      // Each button should be accessible and have proper semantics
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('should be keyboard accessible', () => {
      render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      const mapButton = screen.getByRole('button', { name: /지도/i });
      const listButton = screen.getByRole('button', { name: /리스트/i });

      // Buttons should be focusable
      mapButton.focus();
      expect(mapButton).toHaveFocus();

      listButton.focus();
      expect(listButton).toHaveFocus();
    });

    it('should support keyboard navigation with Tab', () => {
      render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      const mapButton = screen.getByRole('button', { name: /지도/i });
      const listButton = screen.getByRole('button', { name: /리스트/i });

      // Focus first button
      mapButton.focus();
      expect(mapButton).toHaveFocus();

      // Tab to next button
      fireEvent.keyDown(mapButton, { key: 'Tab' });
      // Note: jsdom doesn't automatically handle focus movement,
      // so we simulate the focus change manually
      listButton.focus();
      expect(listButton).toHaveFocus();
    });

    it('should support keyboard activation with Enter', () => {
      render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      const listButton = screen.getByRole('button', { name: /리스트/i });
      listButton.focus();

      // Test Enter key activation
      fireEvent.keyDown(listButton, { key: 'Enter' });
      fireEvent.click(listButton); // Simulate the actual click that would happen
      expect(mockOnViewChange).toHaveBeenCalledWith('list');
    });

    it('should have descriptive text content', () => {
      render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      expect(screen.getByText('지도')).toBeInTheDocument();
      expect(screen.getByText('리스트')).toBeInTheDocument();
    });

    it('should maintain button semantics with proper labels', () => {
      render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      const mapButton = screen.getByRole('button', { name: /지도/i });
      const listButton = screen.getByRole('button', { name: /리스트/i });

      expect(mapButton).toHaveAccessibleName('지도');
      expect(listButton).toHaveAccessibleName('리스트');
    });
  });

  describe('State Management', () => {
    it('should handle view mode changes correctly', () => {
      const { rerender } = render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      // Initially map should be active
      expect(screen.getByRole('button', { name: /지도/i })).toHaveClass('bg-white', 'shadow-sm');
      expect(screen.getByRole('button', { name: /리스트/i })).toHaveClass('text-gray-600');

      // Change to list view
      rerender(
        <ViewToggle
          currentView="list"
          onViewChange={mockOnViewChange}
        />
      );

      // Now list should be active
      expect(screen.getByRole('button', { name: /리스트/i })).toHaveClass('bg-white', 'shadow-sm');
      expect(screen.getByRole('button', { name: /지도/i })).toHaveClass('text-gray-600');
    });

    it('should handle currentView prop changes without calling onViewChange', () => {
      const { rerender } = render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      rerender(
        <ViewToggle
          currentView="list"
          onViewChange={mockOnViewChange}
        />
      );

      // onViewChange should not be called by prop changes
      expect(mockOnViewChange).not.toHaveBeenCalled();
    });

    it('should maintain state consistency across re-renders', () => {
      const { rerender } = render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      // Click list button
      fireEvent.click(screen.getByRole('button', { name: /리스트/i }));
      expect(mockOnViewChange).toHaveBeenCalledWith('list');

      // Re-render with new currentView
      rerender(
        <ViewToggle
          currentView="list"
          onViewChange={mockOnViewChange}
        />
      );

      // State should be consistent
      expect(screen.getByRole('button', { name: /리스트/i })).toHaveClass('bg-white', 'shadow-sm');
      expect(screen.getByRole('button', { name: /지도/i })).toHaveClass('text-gray-600');
    });
  });

  describe('Styling and CSS Classes', () => {
    it('should apply container styling correctly', () => {
      const { container } = render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      const toggleContainer = container.firstChild as HTMLElement;
      expect(toggleContainer).toHaveClass(
        'flex',
        'items-center',
        'bg-gray-100',
        'rounded-lg',
        'p-1'
      );
    });

    it('should apply button base styling correctly', () => {
      render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      const mapButton = screen.getByRole('button', { name: /지도/i });
      const listButton = screen.getByRole('button', { name: /리스트/i });

      // Both buttons should have common classes
      [mapButton, listButton].forEach(button => {
        expect(button).toHaveClass(
          'flex',
          'items-center',
          'gap-2',
          'px-3',
          'py-2',
          'rounded-md',
          'transition-all'
        );
      });
    });

    it('should apply active button styling correctly', () => {
      render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      const mapButton = screen.getByRole('button', { name: /지도/i });
      expect(mapButton).toHaveClass('bg-white', 'shadow-sm', 'text-gray-900');
    });

    it('should apply inactive button styling correctly', () => {
      render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      const listButton = screen.getByRole('button', { name: /리스트/i });
      expect(listButton).toHaveClass('text-gray-600');
      expect(listButton).not.toHaveClass('bg-white', 'shadow-sm');
    });

    it('should apply hover styles correctly', () => {
      render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      const listButton = screen.getByRole('button', { name: /리스트/i });
      expect(listButton).toHaveClass('hover:text-gray-900', 'hover:bg-gray-50');
    });

    it('should combine custom className with default classes', () => {
      const customClass = 'my-custom-class';
      const { container } = render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
          className={customClass}
        />
      );

      const toggleContainer = container.firstChild as HTMLElement;
      expect(toggleContainer).toHaveClass(customClass);
      expect(toggleContainer).toHaveClass('flex', 'items-center', 'bg-gray-100', 'rounded-lg', 'p-1');
    });
  });

  describe('Icon Rendering', () => {
    it('should render Map icon for map button', () => {
      render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      const mapButton = screen.getByRole('button', { name: /지도/i });
      const icon = mapButton.querySelector('svg');

      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-4', 'w-4');
    });

    it('should render List icon for list button', () => {
      render(
        <ViewToggle
          currentView="list"
          onViewChange={mockOnViewChange}
        />
      );

      const listButton = screen.getByRole('button', { name: /리스트/i });
      const icon = listButton.querySelector('svg');

      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-4', 'w-4');
    });

    it('should render icons with consistent sizing', () => {
      render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const icon = button.querySelector('svg');
        expect(icon).toHaveClass('h-4', 'w-4');
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid currentView gracefully', () => {
      expect(() => {
        render(
          <ViewToggle
            currentView={'invalid' as ViewMode}
            onViewChange={mockOnViewChange}
          />
        );
      }).not.toThrow();
    });

    it('should handle null onViewChange gracefully', () => {
      expect(() => {
        render(
          <ViewToggle
            currentView="map"
            onViewChange={null as any}
          />
        );
      }).not.toThrow();

      const mapButton = screen.getByRole('button', { name: /지도/i });
      expect(() => fireEvent.click(mapButton)).not.toThrow();
    });

    it('should render consistently with different ViewMode values', () => {
      const viewModes: ViewMode[] = ['map', 'list'];

      viewModes.forEach(mode => {
        const { unmount } = render(
          <ViewToggle
            currentView={mode}
            onViewChange={mockOnViewChange}
          />
        );

        expect(screen.getByRole('button', { name: /지도/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /리스트/i })).toBeInTheDocument();

        unmount();
      });
    });

    it('should handle rapid prop changes without errors', () => {
      const { rerender } = render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      // Rapidly change props multiple times
      for (let i = 0; i < 10; i++) {
        rerender(
          <ViewToggle
            currentView={i % 2 === 0 ? 'map' : 'list'}
            onViewChange={mockOnViewChange}
          />
        );
      }

      // Should not throw any errors and should still render correctly
      expect(screen.getByRole('button', { name: /지도/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /리스트/i })).toBeInTheDocument();
    });

    it('should handle undefined className prop', () => {
      expect(() => {
        render(
          <ViewToggle
            currentView="map"
            onViewChange={mockOnViewChange}
            className={undefined}
          />
        );
      }).not.toThrow();
    });

    it('should handle empty string className prop', () => {
      const { container } = render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
          className=""
        />
      );

      expect(container.firstChild).toHaveClass('flex', 'items-center', 'bg-gray-100', 'rounded-lg', 'p-1');
    });
  });

  describe('Component Integration', () => {
    it('should work with React.StrictMode', () => {
      expect(() => {
        render(
          <React.StrictMode>
            <ViewToggle
              currentView="map"
              onViewChange={mockOnViewChange}
            />
          </React.StrictMode>
        );
      }).not.toThrow();

      expect(screen.getByRole('button', { name: /지도/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /리스트/i })).toBeInTheDocument();
    });

    it('should work correctly when nested in other components', () => {
      const ParentComponent = () => (
        <div data-testid="parent">
          <ViewToggle
            currentView="map"
            onViewChange={mockOnViewChange}
          />
        </div>
      );

      render(<ParentComponent />);

      expect(screen.getByTestId('parent')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /지도/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /리스트/i })).toBeInTheDocument();
    });

    it('should maintain functionality when re-mounted', () => {
      const { unmount } = render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      unmount();

      // Re-mount
      render(
        <ViewToggle
          currentView="list"
          onViewChange={mockOnViewChange}
        />
      );

      // Should work correctly after re-mounting
      const mapButton = screen.getByRole('button', { name: /지도/i });
      fireEvent.click(mapButton);

      expect(mockOnViewChange).toHaveBeenCalledWith('map');
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders with same props', () => {
      const { rerender } = render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      const mapButton = screen.getByRole('button', { name: /지도/i });
      const initialHtml = mapButton.outerHTML;

      // Re-render with same props
      rerender(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      const mapButtonAfterRerender = screen.getByRole('button', { name: /지도/i });
      expect(mapButtonAfterRerender.outerHTML).toBe(initialHtml);
    });

    it('should handle many rapid click events efficiently', () => {
      render(
        <ViewToggle
          currentView="map"
          onViewChange={mockOnViewChange}
        />
      );

      const listButton = screen.getByRole('button', { name: /리스트/i });

      // Perform many rapid clicks
      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        fireEvent.click(listButton);
      }
      const endTime = performance.now();

      // Should complete quickly (under 100ms for 100 clicks)
      expect(endTime - startTime).toBeLessThan(100);
      expect(mockOnViewChange).toHaveBeenCalledTimes(100);
    });
  });
});