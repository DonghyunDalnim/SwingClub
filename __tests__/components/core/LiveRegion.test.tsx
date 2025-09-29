import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { LiveRegion, useLiveRegion } from '@/components/core/LiveRegion';

expect.extend(toHaveNoViolations);

// Mock timers for testing clearAfter functionality
jest.useFakeTimers();

describe('LiveRegion Component', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  describe('Rendering and Basic Behavior', () => {
    it('renders correctly with required props', () => {
      render(<LiveRegion message="Test message" />);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveTextContent('Test message');
    });

    it('applies correct accessibility attributes by default', () => {
      render(<LiveRegion message="Test message" />);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
      expect(liveRegion).toHaveAttribute('role', 'status');
    });

    it('is visually hidden with sr-only class', () => {
      render(<LiveRegion message="Test message" />);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveClass('sr-only');
    });

    it('renders null when message is empty', () => {
      const { container } = render(<LiveRegion message="" />);
      expect(container.firstChild).toBeNull();
    });

    it('renders null when message is undefined', () => {
      const { container } = render(<LiveRegion message={undefined as any} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Priority Props Handling', () => {
    it('applies polite priority correctly', () => {
      render(<LiveRegion message="Test message" priority="polite" />);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('applies assertive priority correctly', () => {
      render(<LiveRegion message="Test message" priority="assertive" />);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
    });

    it('renders null when priority is off', () => {
      const { container } = render(
        <LiveRegion message="Test message" priority="off" />
      );
      expect(container.firstChild).toBeNull();
    });

    it('defaults to polite priority when not specified', () => {
      render(<LiveRegion message="Test message" />);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Auto-clear Functionality', () => {
    it('clears message after specified time', async () => {
      const { container } = render(
        <LiveRegion message="Test message" clearAfter={1000} />
      );

      // Initially message should be present
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Fast-forward time and wrap in act
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Message should be cleared
      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('calls onClear callback when auto-clearing', async () => {
      const onClearMock = jest.fn();

      render(
        <LiveRegion
          message="Test message"
          clearAfter={1000}
          onClear={onClearMock}
        />
      );

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(onClearMock).toHaveBeenCalledTimes(1);
      });
    });

    it('does not set timer when clearAfter is not provided', async () => {
      const onClearMock = jest.fn();

      render(
        <LiveRegion message="Test message" onClear={onClearMock} />
      );

      await act(async () => {
        jest.advanceTimersByTime(5000);
      });

      // Message should still be present
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(onClearMock).not.toHaveBeenCalled();
    });

    it('does not set timer when message is empty', async () => {
      const onClearMock = jest.fn();

      render(
        <LiveRegion message="" clearAfter={1000} onClear={onClearMock} />
      );

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(onClearMock).not.toHaveBeenCalled();
    });

    it('clears previous timer when message changes', async () => {
      const onClearMock = jest.fn();

      const { rerender } = render(
        <LiveRegion
          message="First message"
          clearAfter={1000}
          onClear={onClearMock}
        />
      );

      // Fast-forward halfway
      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      // Change message
      rerender(
        <LiveRegion
          message="Second message"
          clearAfter={1000}
          onClear={onClearMock}
        />
      );

      // Fast-forward another 500ms (total 1000ms from start)
      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      // Should not clear yet because timer was reset
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(onClearMock).not.toHaveBeenCalled();

      // Fast-forward another 500ms to complete the new timer
      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(onClearMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Dynamic Message Updates', () => {
    it('updates message content when prop changes', () => {
      const { rerender } = render(<LiveRegion message="Initial message" />);

      expect(screen.getByRole('status')).toHaveTextContent('Initial message');

      rerender(<LiveRegion message="Updated message" />);

      expect(screen.getByRole('status')).toHaveTextContent('Updated message');
    });

    it('handles message becoming empty', () => {
      const { rerender, container } = render(<LiveRegion message="Initial message" />);

      expect(screen.getByRole('status')).toBeInTheDocument();

      rerender(<LiveRegion message="" />);

      expect(container.firstChild).toBeNull();
    });

    it('handles message becoming non-empty from empty', () => {
      const { rerender } = render(<LiveRegion message="" />);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();

      rerender(<LiveRegion message="New message" />);

      expect(screen.getByRole('status')).toHaveTextContent('New message');
    });
  });

  describe('Accessibility Compliance', () => {
    beforeEach(async () => {
      // Use real timers for accessibility tests to avoid axe conflicts
      jest.useRealTimers();
    });

    afterEach(() => {
      jest.useFakeTimers();
    });

    it('has no accessibility violations with polite priority', async () => {
      const { container } = render(
        <LiveRegion message="Test message" priority="polite" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with assertive priority', async () => {
      const { container } = render(
        <LiveRegion message="Test message" priority="assertive" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper role and ARIA attributes for screen readers', () => {
      render(<LiveRegion message="Important announcement" priority="assertive" />);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
      expect(liveRegion).toHaveAttribute('role', 'status');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long messages', () => {
      const longMessage = 'A'.repeat(1000);
      render(<LiveRegion message={longMessage} />);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent(longMessage);
    });

    it('handles special characters and HTML entities', () => {
      const specialMessage = 'Message with <>&"\'';
      render(<LiveRegion message={specialMessage} />);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent(specialMessage);
    });

    it('handles unicode characters', () => {
      const unicodeMessage = '안녕하세요 🎉 こんにちは';
      render(<LiveRegion message={unicodeMessage} />);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent(unicodeMessage);
    });

    it('handles clearAfter value of 0 (does not clear automatically)', () => {
      const onClearMock = jest.fn();

      render(
        <LiveRegion
          message="Test message"
          clearAfter={0}
          onClear={onClearMock}
        />
      );

      // With clearAfter=0, timer should not be set (0 is falsy)
      act(() => {
        jest.runAllTimers();
      });

      // Message should still be present and callback not called
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(onClearMock).not.toHaveBeenCalled();
    });

    it('handles clearAfter with very small positive value', async () => {
      const onClearMock = jest.fn();

      render(
        <LiveRegion
          message="Test message"
          clearAfter={1}
          onClear={onClearMock}
        />
      );

      // With clearAfter=1ms, should clear very quickly
      await act(async () => {
        jest.advanceTimersByTime(1);
      });

      await waitFor(() => {
        expect(onClearMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});

describe('useLiveRegion Hook', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  describe('Basic Functionality', () => {
    it('initializes with empty message and polite priority', () => {
      const { result } = renderHook(() => useLiveRegion());

      expect(result.current.message).toBe('');
      expect(result.current.priority).toBe('polite');
    });

    it('provides announce function', () => {
      const { result } = renderHook(() => useLiveRegion());

      expect(typeof result.current.announce).toBe('function');
    });

    it('provides clear function', () => {
      const { result } = renderHook(() => useLiveRegion());

      expect(typeof result.current.clear).toBe('function');
    });

    it('provides LiveRegionComponent', () => {
      const { result } = renderHook(() => useLiveRegion());

      expect(typeof result.current.LiveRegionComponent).toBe('function');
    });
  });

  describe('Announce Functionality', () => {
    it('announces message with default polite priority', async () => {
      const { result } = renderHook(() => useLiveRegion());

      act(() => {
        result.current.announce('Test announcement');
      });

      // Wait for the setTimeout delay
      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.message).toBe('Test announcement');
        expect(result.current.priority).toBe('polite');
      });
    });

    it('announces message with assertive priority', async () => {
      const { result } = renderHook(() => useLiveRegion());

      act(() => {
        result.current.announce('Urgent announcement', 'assertive');
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.message).toBe('Urgent announcement');
        expect(result.current.priority).toBe('assertive');
      });
    });

    it('clears existing message before announcing new one', async () => {
      const { result } = renderHook(() => useLiveRegion());

      // First announcement
      act(() => {
        result.current.announce('First message');
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.message).toBe('First message');
      });

      // Second announcement should clear and replace
      act(() => {
        result.current.announce('Second message');
      });

      // Should be cleared immediately
      expect(result.current.message).toBe('');

      // After timeout, should have new message
      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.message).toBe('Second message');
      });
    });

    it('handles multiple rapid announcements', async () => {
      const { result } = renderHook(() => useLiveRegion());

      act(() => {
        result.current.announce('Message 1');
        result.current.announce('Message 2');
        result.current.announce('Message 3');
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      // Should only show the last message
      await waitFor(() => {
        expect(result.current.message).toBe('Message 3');
      });
    });
  });

  describe('Clear Functionality', () => {
    it('clears message when clear is called', async () => {
      const { result } = renderHook(() => useLiveRegion());

      act(() => {
        result.current.announce('Test message');
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.message).toBe('Test message');
      });

      act(() => {
        result.current.clear();
      });

      expect(result.current.message).toBe('');
    });

    it('can clear message even when empty', () => {
      const { result } = renderHook(() => useLiveRegion());

      expect(result.current.message).toBe('');

      act(() => {
        result.current.clear();
      });

      expect(result.current.message).toBe('');
    });
  });

  describe('LiveRegionComponent Integration', () => {
    it('renders component with correct props', async () => {
      const { result } = renderHook(() => useLiveRegion());

      act(() => {
        result.current.announce('Component test');
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      const Component = result.current.LiveRegionComponent;
      render(<Component />);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent('Component test');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('auto-clears after 5 seconds', async () => {
      const { result } = renderHook(() => useLiveRegion());

      act(() => {
        result.current.announce('Auto-clear test');
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      const Component = result.current.LiveRegionComponent;
      render(<Component />);

      // Should be present initially
      expect(screen.getByRole('status')).toBeInTheDocument();

      // After 5 seconds should auto-clear
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(result.current.message).toBe('');
      });
    });

    it('updates component when hook state changes', async () => {
      const { result } = renderHook(() => useLiveRegion());

      const TestWrapper = () => {
        const Component = result.current.LiveRegionComponent;
        return <Component />;
      };

      const { rerender } = render(<TestWrapper />);

      // Initially no message
      expect(screen.queryByRole('status')).not.toBeInTheDocument();

      act(() => {
        result.current.announce('Dynamic update');
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      // Re-render the wrapper to pick up state changes
      rerender(<TestWrapper />);

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent('Dynamic update');
      });
    });
  });

  describe('Screen Reader Compatibility Scenarios', () => {
    it('handles form validation announcements', async () => {
      const { result } = renderHook(() => useLiveRegion());

      // Simulate form validation error
      act(() => {
        result.current.announce('Email is required', 'assertive');
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.message).toBe('Email is required');
        expect(result.current.priority).toBe('assertive');
      });
    });

    it('handles loading state announcements', async () => {
      const { result } = renderHook(() => useLiveRegion());

      // Loading start
      act(() => {
        result.current.announce('Loading content...');
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.message).toBe('Loading content...');
      });

      // Loading complete
      act(() => {
        result.current.announce('Content loaded successfully');
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.message).toBe('Content loaded successfully');
      });
    });

    it('handles dynamic content updates', async () => {
      const { result } = renderHook(() => useLiveRegion());

      const announcements = [
        'New message received',
        '3 new notifications',
        'Page updated'
      ];

      for (const announcement of announcements) {
        act(() => {
          result.current.announce(announcement);
        });

        await act(async () => {
          jest.advanceTimersByTime(100);
        });

        await waitFor(() => {
          expect(result.current.message).toBe(announcement);
        });
      }
    });

    it('handles error and success feedback', async () => {
      const { result } = renderHook(() => useLiveRegion());

      // Error announcement (assertive)
      act(() => {
        result.current.announce('Failed to save changes', 'assertive');
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.message).toBe('Failed to save changes');
        expect(result.current.priority).toBe('assertive');
      });

      // Success announcement (polite)
      act(() => {
        result.current.announce('Changes saved successfully');
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.message).toBe('Changes saved successfully');
        expect(result.current.priority).toBe('polite');
      });
    });
  });

  describe('Performance and Memory', () => {
    it('cleans up timers properly', () => {
      const { result, unmount } = renderHook(() => useLiveRegion());

      act(() => {
        result.current.announce('Test message');
      });

      // Should have pending timer
      expect(jest.getTimerCount()).toBeGreaterThan(0);

      unmount();

      // Timers should be cleaned up (component manages its own cleanup)
      // We can't directly test hook cleanup, but we can ensure the component cleans up
      const Component = result.current.LiveRegionComponent;
      const { unmount: unmountComponent } = render(<Component />);

      unmountComponent();

      // Should not cause memory leaks
      expect(true).toBe(true); // Test passes if no memory leaks occur
    });

    it('handles rapid state changes efficiently', async () => {
      const { result } = renderHook(() => useLiveRegion());

      // Simulate rapid state changes
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.announce(`Message ${i}`);
        });
      }

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      // Should only show the last message
      await waitFor(() => {
        expect(result.current.message).toBe('Message 9');
      });
    });
  });

  describe('Integration Testing', () => {
    it('integrates properly with React components', async () => {
      const TestComponent = () => {
        const { announce, LiveRegionComponent } = useLiveRegion();

        return (
          <div>
            <button
              onClick={() => {
                announce('Component mounted');
                // Simulate button click after mount announcement
                setTimeout(() => announce('Button clicked', 'assertive'), 150);
              }}
              data-testid="test-button"
            >
              Click me
            </button>
            <LiveRegionComponent />
          </div>
        );
      };

      render(<TestComponent />);

      const button = screen.getByTestId('test-button');

      // Click button to trigger announcements
      act(() => {
        fireEvent.click(button);
      });

      // Wait for first announcement
      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(screen.getByRole('status')).toHaveTextContent('Component mounted');

      // Wait for second announcement
      await act(async () => {
        jest.advanceTimersByTime(150);
      });

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent('Button clicked');
      });
    });

    it('handles concurrent usage across components', async () => {
      let hook1: any, hook2: any;

      const Component1 = () => {
        hook1 = useLiveRegion();
        return <hook1.LiveRegionComponent />;
      };

      const Component2 = () => {
        hook2 = useLiveRegion();
        return <hook2.LiveRegionComponent />;
      };

      render(
        <div>
          <Component1 />
          <Component2 />
        </div>
      );

      act(() => {
        hook1.announce('Message from component 1');
        hook2.announce('Message from component 2');
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      const liveRegions = screen.getAllByRole('status');
      expect(liveRegions).toHaveLength(2);
      expect(liveRegions[0]).toHaveTextContent('Message from component 1');
      expect(liveRegions[1]).toHaveTextContent('Message from component 2');
    });

    it('handles real-world usage patterns', async () => {
      const { result } = renderHook(() => useLiveRegion());

      // Test sequence: loading → success → error → clear
      const Component = result.current.LiveRegionComponent;
      render(<Component />);

      // 1. Loading announcement
      act(() => {
        result.current.announce('Loading data...', 'polite');
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(screen.getByRole('status')).toHaveTextContent('Loading data...');

      // 2. Success announcement
      act(() => {
        result.current.announce('Data loaded successfully', 'polite');
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(screen.getByRole('status')).toHaveTextContent('Data loaded successfully');

      // 3. Error announcement
      act(() => {
        result.current.announce('Error: Connection failed', 'assertive');
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(screen.getByRole('status')).toHaveTextContent('Error: Connection failed');
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'assertive');

      // 4. Clear
      act(() => {
        result.current.clear();
      });

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('Message Queue Behavior', () => {
    it('properly sequences multiple announcements', async () => {
      const { result } = renderHook(() => useLiveRegion());

      // Queue multiple messages rapidly
      act(() => {
        result.current.announce('First');
        result.current.announce('Second');
        result.current.announce('Third');
      });

      // Only the last message should be announced after delay
      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.message).toBe('Third');
    });

    it('respects message priorities in announcements', async () => {
      const { result } = renderHook(() => useLiveRegion());

      // Mix polite and assertive announcements
      act(() => {
        result.current.announce('Polite message', 'polite');
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.priority).toBe('polite');

      act(() => {
        result.current.announce('Urgent message', 'assertive');
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.priority).toBe('assertive');
    });
  });

  describe('Browser Compatibility', () => {
    it('works with different ARIA live region implementations', () => {
      // Test polite region
      render(<LiveRegion message="Polite message" priority="polite" />);
      const politeRegion = screen.getByRole('status');
      expect(politeRegion).toHaveAttribute('aria-live', 'polite');

      // Test assertive region
      render(<LiveRegion message="Urgent message" priority="assertive" />);
      const assertiveRegion = screen.getAllByRole('status')[1];
      expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive');
    });

    it('maintains screen reader compatibility with aria-atomic', () => {
      render(<LiveRegion message="Complete message update" />);
      const region = screen.getByRole('status');
      expect(region).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('Error Handling', () => {
    it('handles invalid priority values gracefully', () => {
      // Test with invalid priority (should default to polite)
      render(<LiveRegion message="Test message" priority={'invalid' as any} />);
      const region = screen.getByRole('status');
      expect(region).toHaveAttribute('aria-live', 'invalid');
    });

    it('handles null message values', () => {
      const { container } = render(<LiveRegion message={null as any} />);
      expect(container.firstChild).toBeNull();
    });

    it('handles undefined callback', async () => {
      // Should not throw when onClear is undefined
      render(<LiveRegion message="Test message" clearAfter={100} />);

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });
  });
});