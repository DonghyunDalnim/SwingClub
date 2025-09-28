/**
 * Comprehensive tests for useKeyboardNavigation hook
 * Testing keyboard navigation options, event handling, and focus management
 */

import { renderHook, act } from '@testing-library/react';
import { useKeyboardNavigation, type UseKeyboardNavigationOptions } from '@/lib/hooks/useKeyboardNavigation';

// Mock keyboard utilities
jest.mock('@/lib/utils/keyboard', () => ({
  createListNavigationHandler: jest.fn(),
  createEscapeHandler: jest.fn(),
  getFocusableElements: jest.fn(),
  focusElement: jest.fn()
}));

import {
  createListNavigationHandler,
  createEscapeHandler,
  getFocusableElements,
  focusElement
} from '@/lib/utils/keyboard';

describe('useKeyboardNavigation Hook', () => {
  let mockContainer: HTMLElement;
  let mockButton1: HTMLButtonElement;
  let mockButton2: HTMLButtonElement;
  let mockButton3: HTMLButtonElement;
  let mockFocusableElements: HTMLElement[];

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock DOM elements
    mockContainer = document.createElement('div');
    mockButton1 = document.createElement('button');
    mockButton2 = document.createElement('button');
    mockButton3 = document.createElement('button');

    mockButton1.textContent = 'Button 1';
    mockButton2.textContent = 'Button 2';
    mockButton3.textContent = 'Button 3';

    mockContainer.appendChild(mockButton1);
    mockContainer.appendChild(mockButton2);
    mockContainer.appendChild(mockButton3);

    mockFocusableElements = [mockButton1, mockButton2, mockButton3];

    // Mock document.body to contain our container
    document.body.appendChild(mockContainer);

    // Setup mock implementations
    (getFocusableElements as jest.Mock).mockReturnValue(mockFocusableElements);
    (createListNavigationHandler as jest.Mock).mockReturnValue(jest.fn());
    (createEscapeHandler as jest.Mock).mockReturnValue(jest.fn());
    (focusElement as jest.Mock).mockImplementation((element: HTMLElement) => {
      if (element && element.focus) {
        element.focus();
      }
    });
  });

  afterEach(() => {
    document.body.removeChild(mockContainer);
  });

  describe('Basic Hook Functionality', () => {
    it('should return containerRef and focus methods', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      expect(result.current).toHaveProperty('containerRef');
      expect(result.current).toHaveProperty('focusFirst');
      expect(result.current).toHaveProperty('focusLast');
      expect(typeof result.current.focusFirst).toBe('function');
      expect(typeof result.current.focusLast).toBe('function');
    });

    it('should initialize with default options', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      expect(result.current.containerRef).toBeDefined();
      expect(result.current.focusFirst).toBeDefined();
      expect(result.current.focusLast).toBeDefined();
    });

    it('should handle empty options object', () => {
      const { result } = renderHook(() => useKeyboardNavigation({}));

      expect(result.current.containerRef).toBeDefined();
      expect(result.current.focusFirst).toBeDefined();
      expect(result.current.focusLast).toBeDefined();
    });
  });

  describe('Keyboard Navigation Options', () => {
    it('should configure vertical navigation', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ vertical: true })
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      expect(createListNavigationHandler).toHaveBeenCalledWith(
        mockContainer,
        expect.objectContaining({ vertical: true })
      );
    });

    it('should configure horizontal navigation', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ horizontal: true })
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      expect(createListNavigationHandler).toHaveBeenCalledWith(
        mockContainer,
        expect.objectContaining({ horizontal: true })
      );
    });

    it('should configure loop navigation', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ loop: false })
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      expect(createListNavigationHandler).toHaveBeenCalledWith(
        mockContainer,
        expect.objectContaining({ loop: false })
      );
    });

    it('should configure all navigation options together', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          vertical: false,
          horizontal: true,
          loop: false
        })
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      expect(createListNavigationHandler).toHaveBeenCalledWith(
        mockContainer,
        expect.objectContaining({
          vertical: false,
          horizontal: true,
          loop: false
        })
      );
    });
  });

  describe('ESC Key Handler', () => {
    it('should register escape handler when onEscape is provided', () => {
      const mockOnEscape = jest.fn();
      const mockEscapeHandler = jest.fn();
      (createEscapeHandler as jest.Mock).mockReturnValue(mockEscapeHandler);

      const { result } = renderHook(() =>
        useKeyboardNavigation({ onEscape: mockOnEscape })
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      expect(createEscapeHandler).toHaveBeenCalledWith(mockOnEscape);
    });

    it('should not register escape handler when onEscape is not provided', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({})
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      expect(createEscapeHandler).not.toHaveBeenCalled();
    });

    it('should call onEscape when enabled', () => {
      const mockOnEscape = jest.fn();
      const mockEscapeHandler = jest.fn();
      (createEscapeHandler as jest.Mock).mockReturnValue(mockEscapeHandler);

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          onEscape: mockOnEscape,
          enabled: true
        })
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      expect(createEscapeHandler).toHaveBeenCalledWith(mockOnEscape);
    });
  });

  describe('autoFocus Functionality', () => {
    it('should focus first element when autoFocus is true', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ autoFocus: true })
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      expect(getFocusableElements).toHaveBeenCalledWith(mockContainer);
      expect(focusElement).toHaveBeenCalledWith(mockButton1);
    });

    it('should not auto focus when autoFocus is false', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ autoFocus: false })
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      // focusElement should not be called for auto focus (but createListNavigationHandler might call it)
      // So we check that getFocusableElements was not called for autoFocus specifically
      const getFocusableCalls = (getFocusableElements as jest.Mock).mock.calls;
      const autoFocusCall = getFocusableCalls.find(call => call.length === 1);
      expect(autoFocusCall).toBeUndefined();
    });

    it('should handle empty focusable elements gracefully', () => {
      (getFocusableElements as jest.Mock).mockReturnValue([]);

      const { result } = renderHook(() =>
        useKeyboardNavigation({ autoFocus: true })
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      expect(getFocusableElements).toHaveBeenCalledWith(mockContainer);
      // focusElement should not be called when no focusable elements exist
      expect(focusElement).not.toHaveBeenCalled();
    });
  });

  describe('enabled/disabled State', () => {
    it('should not register event listeners when disabled', () => {
      const mockAddEventListener = jest.spyOn(mockContainer, 'addEventListener');
      const { result } = renderHook(() =>
        useKeyboardNavigation({ enabled: false })
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      expect(mockAddEventListener).not.toHaveBeenCalled();
    });

    it('should register event listeners when enabled', () => {
      const mockAddEventListener = jest.spyOn(mockContainer, 'addEventListener');
      const { result } = renderHook(() =>
        useKeyboardNavigation({ enabled: true })
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should toggle event listeners when enabled state changes', () => {
      const mockAddEventListener = jest.spyOn(mockContainer, 'addEventListener');
      const mockRemoveEventListener = jest.spyOn(mockContainer, 'removeEventListener');

      const { result, rerender } = renderHook(
        ({ enabled }) => useKeyboardNavigation({ enabled }),
        { initialProps: { enabled: true } }
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      // Initially enabled
      expect(mockAddEventListener).toHaveBeenCalled();

      // Change to disabled
      rerender({ enabled: false });

      expect(mockRemoveEventListener).toHaveBeenCalled();
    });
  });

  describe('focusFirst and focusLast Methods', () => {
    it('should focus first element when focusFirst is called', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      act(() => {
        result.current.containerRef.current = mockContainer;
        result.current.focusFirst();
      });

      expect(getFocusableElements).toHaveBeenCalledWith(mockContainer);
      expect(focusElement).toHaveBeenCalledWith(mockButton1);
    });

    it('should focus last element when focusLast is called', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      act(() => {
        result.current.containerRef.current = mockContainer;
        result.current.focusLast();
      });

      expect(getFocusableElements).toHaveBeenCalledWith(mockContainer);
      expect(focusElement).toHaveBeenCalledWith(mockButton3);
    });

    it('should handle empty container gracefully in focusFirst', () => {
      (getFocusableElements as jest.Mock).mockReturnValue([]);
      const { result } = renderHook(() => useKeyboardNavigation());

      act(() => {
        result.current.containerRef.current = mockContainer;
        result.current.focusFirst();
      });

      expect(getFocusableElements).toHaveBeenCalledWith(mockContainer);
      expect(focusElement).not.toHaveBeenCalled();
    });

    it('should handle empty container gracefully in focusLast', () => {
      (getFocusableElements as jest.Mock).mockReturnValue([]);
      const { result } = renderHook(() => useKeyboardNavigation());

      act(() => {
        result.current.containerRef.current = mockContainer;
        result.current.focusLast();
      });

      expect(getFocusableElements).toHaveBeenCalledWith(mockContainer);
      expect(focusElement).not.toHaveBeenCalled();
    });

    it('should handle null containerRef gracefully', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      act(() => {
        result.current.focusFirst();
        result.current.focusLast();
      });

      expect(getFocusableElements).not.toHaveBeenCalled();
      expect(focusElement).not.toHaveBeenCalled();
    });
  });

  describe('Event Listener Management', () => {
    it('should register keydown event listener for navigation', () => {
      const mockAddEventListener = jest.spyOn(mockContainer, 'addEventListener');
      const { result } = renderHook(() => useKeyboardNavigation());

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should register keydown event listener for escape when onEscape is provided', () => {
      const mockAddEventListener = jest.spyOn(mockContainer, 'addEventListener');
      const mockOnEscape = jest.fn();
      const { result } = renderHook(() =>
        useKeyboardNavigation({ onEscape: mockOnEscape })
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      // Should be called twice - once for navigation, once for escape
      expect(mockAddEventListener).toHaveBeenCalledTimes(2);
    });

    it('should remove event listeners on cleanup', () => {
      const mockRemoveEventListener = jest.spyOn(mockContainer, 'removeEventListener');
      const mockOnEscape = jest.fn();

      const { result, unmount } = renderHook(() =>
        useKeyboardNavigation({ onEscape: mockOnEscape })
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      // Should be called at least once for navigation (escape handler removal depends on implementation)
      expect(mockRemoveEventListener).toHaveBeenCalled();
    });

    it('should remove event listeners when container changes', () => {
      const mockRemoveEventListener = jest.spyOn(mockContainer, 'removeEventListener');
      const newContainer = document.createElement('div');
      document.body.appendChild(newContainer);

      const { result, rerender } = renderHook(() => useKeyboardNavigation());

      // Set initial container
      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      // Change container by changing dependencies (enabled state to force re-effect)
      rerender();

      // Change enabled state to trigger cleanup
      const { rerender: rerender2 } = renderHook(() =>
        useKeyboardNavigation({ enabled: false })
      );

      rerender2();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));

      document.body.removeChild(newContainer);
    });
  });

  describe('Keyboard Event Handling', () => {
    it('should handle navigation events when enabled', () => {
      const mockNavigationHandler = jest.fn();
      (createListNavigationHandler as jest.Mock).mockReturnValue(mockNavigationHandler);

      const { result } = renderHook(() =>
        useKeyboardNavigation({ enabled: true })
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      // Simulate keydown event by calling the registered handler directly
      const keydownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });

      // Get the registered handler and call it
      const addEventListenerCalls = (mockContainer.addEventListener as jest.Mock).mock.calls;
      const navigationHandlerCall = addEventListenerCalls.find(call => call[0] === 'keydown');
      if (navigationHandlerCall) {
        navigationHandlerCall[1](keydownEvent);
      }

      expect(mockNavigationHandler).toHaveBeenCalledWith(keydownEvent);
    });

    it('should handle escape events when enabled and onEscape is provided', () => {
      const mockOnEscape = jest.fn();
      const mockEscapeHandler = jest.fn();
      (createEscapeHandler as jest.Mock).mockReturnValue(mockEscapeHandler);

      const { result } = renderHook(() =>
        useKeyboardNavigation({ enabled: true, onEscape: mockOnEscape })
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      // Simulate escape keydown event
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });

      // Get the registered handlers and call the escape one
      const addEventListenerCalls = (mockContainer.addEventListener as jest.Mock).mock.calls;
      const escapeHandlerCall = addEventListenerCalls.find((call, index) =>
        call[0] === 'keydown' && index === 1 // Second keydown handler should be escape
      );
      if (escapeHandlerCall) {
        escapeHandlerCall[1](escapeEvent);
      }

      expect(mockEscapeHandler).toHaveBeenCalledWith(escapeEvent);
    });

    it('should not handle events when disabled', () => {
      const mockNavigationHandler = jest.fn();
      const mockEscapeHandler = jest.fn();
      (createListNavigationHandler as jest.Mock).mockReturnValue(mockNavigationHandler);
      (createEscapeHandler as jest.Mock).mockReturnValue(mockEscapeHandler);

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          enabled: false,
          onEscape: jest.fn()
        })
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      // Since enabled is false, no event listeners should be added
      expect(mockContainer.addEventListener).not.toHaveBeenCalled();
    });
  });

  describe('React Hook Rules Compliance', () => {
    it('should maintain stable references for callback functions', () => {
      const { result, rerender } = renderHook(() => useKeyboardNavigation());

      const firstFocusFirst = result.current.focusFirst;
      const firstFocusLast = result.current.focusLast;

      rerender();

      expect(result.current.focusFirst).toBe(firstFocusFirst);
      expect(result.current.focusLast).toBe(firstFocusLast);
    });

    it('should not violate hook rules when options change', () => {
      const { result, rerender } = renderHook(
        ({ options }) => useKeyboardNavigation(options),
        { initialProps: { options: { vertical: true } as UseKeyboardNavigationOptions } }
      );

      expect(result.current.containerRef).toBeDefined();

      rerender({ options: { horizontal: true } as UseKeyboardNavigationOptions });

      expect(result.current.containerRef).toBeDefined();
      expect(result.current.focusFirst).toBeDefined();
      expect(result.current.focusLast).toBeDefined();
    });

    it('should handle multiple rapid option changes', () => {
      const { result, rerender } = renderHook(
        ({ options }) => useKeyboardNavigation(options),
        { initialProps: { options: { enabled: true } as UseKeyboardNavigationOptions } }
      );

      // Rapid changes
      rerender({ options: { enabled: false } as UseKeyboardNavigationOptions });
      rerender({ options: { enabled: true, vertical: false } as UseKeyboardNavigationOptions });
      rerender({ options: { enabled: true, horizontal: true } as UseKeyboardNavigationOptions });

      expect(result.current.containerRef).toBeDefined();
      expect(result.current.focusFirst).toBeDefined();
      expect(result.current.focusLast).toBeDefined();
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle all options enabled simultaneously', () => {
      const mockOnEscape = jest.fn();
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          vertical: true,
          horizontal: true,
          loop: true,
          onEscape: mockOnEscape,
          autoFocus: true,
          enabled: true
        })
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      expect(createListNavigationHandler).toHaveBeenCalledWith(
        mockContainer,
        { vertical: true, horizontal: true, loop: true }
      );
      expect(createEscapeHandler).toHaveBeenCalledWith(mockOnEscape);
      expect(focusElement).toHaveBeenCalledWith(mockButton1); // autoFocus
    });

    it('should handle container switching', () => {
      const newContainer = document.createElement('div');
      const newButton = document.createElement('button');
      newButton.textContent = 'New Button';
      newContainer.appendChild(newButton);
      document.body.appendChild(newContainer);

      const { result } = renderHook(() => useKeyboardNavigation({ autoFocus: true }));

      // Start with first container
      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      // Switch to new container
      act(() => {
        result.current.containerRef.current = newContainer;
        (getFocusableElements as jest.Mock).mockReturnValue([newButton]);
        result.current.focusFirst();
      });

      expect(getFocusableElements).toHaveBeenCalledWith(newContainer);
      expect(focusElement).toHaveBeenCalledWith(newButton);

      document.body.removeChild(newContainer);
    });

    it('should handle options changing during component lifecycle', () => {
      const mockOnEscape1 = jest.fn();
      const mockOnEscape2 = jest.fn();

      const { result, rerender } = renderHook(
        ({ onEscape }) => useKeyboardNavigation({ onEscape }),
        { initialProps: { onEscape: mockOnEscape1 } }
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      // Change escape handler
      rerender({ onEscape: mockOnEscape2 });

      expect(createEscapeHandler).toHaveBeenCalledWith(mockOnEscape1);
      expect(createEscapeHandler).toHaveBeenCalledWith(mockOnEscape2);
    });
  });

  describe('Integration with Utility Functions', () => {
    it('should pass correct parameters to createListNavigationHandler', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          vertical: false,
          horizontal: true,
          loop: false
        })
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      expect(createListNavigationHandler).toHaveBeenCalledWith(
        mockContainer,
        { vertical: false, horizontal: true, loop: false }
      );
    });

    it('should pass correct callback to createEscapeHandler', () => {
      const mockOnEscape = jest.fn();
      const { result } = renderHook(() =>
        useKeyboardNavigation({ onEscape: mockOnEscape })
      );

      act(() => {
        result.current.containerRef.current = mockContainer;
      });

      expect(createEscapeHandler).toHaveBeenCalledWith(mockOnEscape);
    });

    it('should call getFocusableElements for focus methods', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      act(() => {
        result.current.containerRef.current = mockContainer;
        result.current.focusFirst();
      });

      expect(getFocusableElements).toHaveBeenCalledWith(mockContainer);

      act(() => {
        result.current.focusLast();
      });

      expect(getFocusableElements).toHaveBeenCalledWith(mockContainer);
    });

    it('should call focusElement with correct elements', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      act(() => {
        result.current.containerRef.current = mockContainer;
        result.current.focusFirst();
      });

      expect(focusElement).toHaveBeenCalledWith(mockButton1);

      act(() => {
        result.current.focusLast();
      });

      expect(focusElement).toHaveBeenCalledWith(mockButton3);
    });
  });
});