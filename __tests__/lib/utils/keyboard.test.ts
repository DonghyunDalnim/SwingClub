/**
 * Keyboard utilities unit tests
 * Tests for keyboard navigation and accessibility utility functions
 */

import {
  isKey,
  isOneOfKeys,
  getFocusableElements,
  getNextFocusableElement,
  getFirstFocusableElement,
  getLastFocusableElement,
  focusElement,
  createKeyHandler,
  createListNavigationHandler,
  createEscapeHandler,
  createActivationHandler,
  FOCUSABLE_ELEMENTS,
  type KeyboardKey,
} from '@/lib/utils/keyboard';

// Mock setTimeout for focusElement tests
jest.useFakeTimers();

// Mock HTMLElement properties for visibility testing
const mockElementVisibility = (element: HTMLElement, visible: boolean = true) => {
  Object.defineProperty(element, 'offsetWidth', {
    value: visible ? 100 : 0,
    configurable: true,
  });
  Object.defineProperty(element, 'offsetHeight', {
    value: visible ? 20 : 0,
    configurable: true,
  });
};

describe('Keyboard Utilities', () => {
  // Helper function to create keyboard events
  const createKeyboardEvent = (key: KeyboardKey, options: KeyboardEventInit = {}): KeyboardEvent => {
    return new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...options,
    });
  };

  // Helper function to create test DOM elements
  const createTestContainer = (): HTMLElement => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    return container;
  };

  // Helper to create visible focusable elements
  const createVisibleFocusableElements = (container: HTMLElement, htmlContent: string) => {
    container.innerHTML = htmlContent;
    // Make all elements visible by default
    const allElements = container.querySelectorAll('*');
    allElements.forEach(el => {
      if (el instanceof HTMLElement) {
        mockElementVisibility(el, true);
      }
    });
  };

  // Cleanup helper
  const cleanup = () => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
    jest.clearAllTimers();
  };

  afterEach(cleanup);

  describe('isKey', () => {
    it('should return true when event key matches target key', () => {
      const event = createKeyboardEvent('Enter');
      expect(isKey(event, 'Enter')).toBe(true);
    });

    it('should return false when event key does not match target key', () => {
      const event = createKeyboardEvent('Enter');
      expect(isKey(event, 'Escape')).toBe(false);
    });

    it('should handle all supported keyboard keys', () => {
      const keys: KeyboardKey[] = [
        'Tab', 'Enter', 'Space', 'Escape',
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Home', 'End', 'PageUp', 'PageDown'
      ];

      keys.forEach(key => {
        const event = createKeyboardEvent(key);
        expect(isKey(event, key)).toBe(true);
      });
    });

    it('should be case-sensitive', () => {
      const event = createKeyboardEvent('enter' as KeyboardKey);
      expect(isKey(event, 'Enter')).toBe(false);
    });
  });

  describe('isOneOfKeys', () => {
    it('should return true when event key is in the keys array', () => {
      const event = createKeyboardEvent('Enter');
      expect(isOneOfKeys(event, ['Enter', 'Space'])).toBe(true);
    });

    it('should return false when event key is not in the keys array', () => {
      const event = createKeyboardEvent('Escape');
      expect(isOneOfKeys(event, ['Enter', 'Space'])).toBe(false);
    });

    it('should handle empty keys array', () => {
      const event = createKeyboardEvent('Enter');
      expect(isOneOfKeys(event, [])).toBe(false);
    });

    it('should handle single key array', () => {
      const event = createKeyboardEvent('Enter');
      expect(isOneOfKeys(event, ['Enter'])).toBe(true);
    });

    it('should handle multiple matching keys', () => {
      const enterEvent = createKeyboardEvent('Enter');
      const spaceEvent = createKeyboardEvent('Space');
      const keys: KeyboardKey[] = ['Enter', 'Space', 'Tab'];

      expect(isOneOfKeys(enterEvent, keys)).toBe(true);
      expect(isOneOfKeys(spaceEvent, keys)).toBe(true);
    });
  });

  describe('FOCUSABLE_ELEMENTS', () => {
    it('should include all expected focusable element selectors', () => {
      const expectedSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ];

      expectedSelectors.forEach(selector => {
        expect(FOCUSABLE_ELEMENTS).toContain(selector);
      });
    });
  });

  describe('getFocusableElements', () => {
    it('should return all focusable elements in container', () => {
      const container = createTestContainer();
      createVisibleFocusableElements(container, `
        <button>Button 1</button>
        <a href="#">Link</a>
        <input type="text" />
        <select><option>Option</option></select>
        <textarea></textarea>
        <div tabindex="0">Focusable div</div>
        <div contenteditable="true">Editable div</div>
      `);

      const focusableElements = getFocusableElements(container);
      expect(focusableElements).toHaveLength(7);
    });

    it('should exclude disabled elements', () => {
      const container = createTestContainer();
      createVisibleFocusableElements(container, `
        <button>Enabled Button</button>
        <button disabled>Disabled Button</button>
        <input type="text" />
        <input type="text" disabled />
        <select><option>Option</option></select>
        <select disabled><option>Option</option></select>
      `);

      const focusableElements = getFocusableElements(container);
      expect(focusableElements).toHaveLength(3);
      expect(focusableElements.every(el => !el.hasAttribute('disabled'))).toBe(true);
    });

    it('should exclude elements with aria-hidden', () => {
      const container = createTestContainer();
      createVisibleFocusableElements(container, `
        <button>Visible Button</button>
        <button aria-hidden="true">Hidden Button</button>
        <input type="text" />
        <input type="text" aria-hidden="true" />
      `);

      const focusableElements = getFocusableElements(container);
      expect(focusableElements).toHaveLength(2);
      expect(focusableElements.every(el => !el.getAttribute('aria-hidden'))).toBe(true);
    });

    it('should exclude hidden inputs', () => {
      const container = createTestContainer();
      createVisibleFocusableElements(container, `
        <input type="text" />
        <input type="hidden" />
        <input type="password" />
      `);

      const focusableElements = getFocusableElements(container);
      expect(focusableElements).toHaveLength(2);
      expect(focusableElements.every(el => el.getAttribute('type') !== 'hidden')).toBe(true);
    });

    it('should exclude elements with negative tabindex', () => {
      const container = createTestContainer();
      createVisibleFocusableElements(container, `
        <div tabindex="0">Focusable</div>
        <div tabindex="-1">Not focusable</div>
        <div tabindex="1">Also focusable</div>
      `);

      const focusableElements = getFocusableElements(container);
      expect(focusableElements).toHaveLength(2);
    });

    it('should handle empty container', () => {
      const container = createTestContainer();
      const focusableElements = getFocusableElements(container);
      expect(focusableElements).toHaveLength(0);
    });

    it('should handle container with no focusable elements', () => {
      const container = createTestContainer();
      createVisibleFocusableElements(container, `
        <div>Plain div</div>
        <span>Plain span</span>
        <p>Plain paragraph</p>
      `);

      const focusableElements = getFocusableElements(container);
      expect(focusableElements).toHaveLength(0);
    });

    it('should filter out elements with zero dimensions', () => {
      const container = createTestContainer();
      container.innerHTML = `
        <button>Visible Button</button>
        <button>Hidden Button</button>
        <button>Display None Button</button>
      `;

      const buttons = container.querySelectorAll('button');
      mockElementVisibility(buttons[0] as HTMLElement, true);  // Visible
      mockElementVisibility(buttons[1] as HTMLElement, false); // Hidden
      mockElementVisibility(buttons[2] as HTMLElement, false); // Hidden

      const focusableElements = getFocusableElements(container);
      expect(focusableElements).toHaveLength(1);
    });
  });

  describe('getNextFocusableElement', () => {
    let elements: HTMLElement[];

    beforeEach(() => {
      elements = [
        document.createElement('button'),
        document.createElement('input'),
        document.createElement('select'),
      ];
      elements.forEach((el, index) => {
        el.setAttribute('data-testid', `element-${index}`);
      });
    });

    it('should return next element in forward direction', () => {
      const nextElement = getNextFocusableElement(elements, elements[0], 'next');
      expect(nextElement).toBe(elements[1]);
    });

    it('should return previous element in backward direction', () => {
      const prevElement = getNextFocusableElement(elements, elements[1], 'previous');
      expect(prevElement).toBe(elements[0]);
    });

    it('should wrap to first element when going next from last', () => {
      const nextElement = getNextFocusableElement(elements, elements[2], 'next');
      expect(nextElement).toBe(elements[0]);
    });

    it('should wrap to last element when going previous from first', () => {
      const prevElement = getNextFocusableElement(elements, elements[0], 'previous');
      expect(prevElement).toBe(elements[2]);
    });

    it('should return null for empty elements array', () => {
      const nextElement = getNextFocusableElement([], elements[0], 'next');
      expect(nextElement).toBeNull();
    });

    it('should return null when current element is not in array', () => {
      const outsideElement = document.createElement('div');
      const nextElement = getNextFocusableElement(elements, outsideElement, 'next');
      expect(nextElement).toBeNull();
    });

    it('should handle single element array', () => {
      const singleElement = [elements[0]];
      const nextElement = getNextFocusableElement(singleElement, elements[0], 'next');
      expect(nextElement).toBe(elements[0]);

      const prevElement = getNextFocusableElement(singleElement, elements[0], 'previous');
      expect(prevElement).toBe(elements[0]);
    });
  });

  describe('getFirstFocusableElement', () => {
    it('should return first focusable element', () => {
      const container = createTestContainer();
      createVisibleFocusableElements(container, `
        <div>Not focusable</div>
        <button>First Button</button>
        <input type="text" />
        <a href="#">Link</a>
      `);

      const firstElement = getFirstFocusableElement(container);
      expect(firstElement?.tagName).toBe('BUTTON');
      expect(firstElement?.textContent).toBe('First Button');
    });

    it('should return null for container with no focusable elements', () => {
      const container = createTestContainer();
      createVisibleFocusableElements(container, `
        <div>Not focusable</div>
        <span>Also not focusable</span>
      `);

      const firstElement = getFirstFocusableElement(container);
      expect(firstElement).toBeNull();
    });

    it('should return null for empty container', () => {
      const container = createTestContainer();
      const firstElement = getFirstFocusableElement(container);
      expect(firstElement).toBeNull();
    });
  });

  describe('getLastFocusableElement', () => {
    it('should return last focusable element', () => {
      const container = createTestContainer();
      createVisibleFocusableElements(container, `
        <button>First Button</button>
        <input type="text" />
        <a href="#">Last Link</a>
        <div>Not focusable</div>
      `);

      const lastElement = getLastFocusableElement(container);
      expect(lastElement?.tagName).toBe('A');
      expect(lastElement?.textContent).toBe('Last Link');
    });

    it('should return null for container with no focusable elements', () => {
      const container = createTestContainer();
      createVisibleFocusableElements(container, `
        <div>Not focusable</div>
        <span>Also not focusable</span>
      `);

      const lastElement = getLastFocusableElement(container);
      expect(lastElement).toBeNull();
    });

    it('should return null for empty container', () => {
      const container = createTestContainer();
      const lastElement = getLastFocusableElement(container);
      expect(lastElement).toBeNull();
    });
  });

  describe('focusElement', () => {
    it('should focus element after timeout', () => {
      const element = document.createElement('button');
      const focusSpy = jest.spyOn(element, 'focus');
      document.body.appendChild(element);

      focusElement(element);

      expect(focusSpy).not.toHaveBeenCalled();

      jest.runAllTimers();

      expect(focusSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle null element gracefully', () => {
      expect(() => focusElement(null)).not.toThrow();

      jest.runAllTimers();
      // Should not throw any errors
    });

    it('should handle element without focus method', () => {
      const element = document.createElement('div');
      // Remove focus method to simulate edge case
      delete (element as any).focus;

      expect(() => focusElement(element as HTMLElement)).not.toThrow();

      jest.runAllTimers();
      // Should not throw any errors
    });

    it('should use setTimeout with 0 delay', () => {
      const element = document.createElement('button');
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      focusElement(element);

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 0);
    });
  });

  describe('createKeyHandler', () => {
    it('should call appropriate handler for matching key', () => {
      const enterHandler = jest.fn();
      const escapeHandler = jest.fn();

      const keyHandler = createKeyHandler({
        'Enter': enterHandler,
        'Escape': escapeHandler,
      });

      const enterEvent = createKeyboardEvent('Enter');
      keyHandler(enterEvent);

      expect(enterHandler).toHaveBeenCalledTimes(1);
      expect(escapeHandler).not.toHaveBeenCalled();
      expect(enterEvent.defaultPrevented).toBe(true);
    });

    it('should prevent default and stop propagation for handled keys', () => {
      const handler = jest.fn();
      const keyHandler = createKeyHandler({ 'Enter': handler });

      const event = createKeyboardEvent('Enter');
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

      keyHandler(event);

      expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
      expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
    });

    it('should not call handler or prevent default for unhandled keys', () => {
      const handler = jest.fn();
      const keyHandler = createKeyHandler({ 'Enter': handler });

      const event = createKeyboardEvent('Escape');
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      keyHandler(event);

      expect(handler).not.toHaveBeenCalled();
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple key handlers', () => {
      const handlers = {
        'Enter': jest.fn(),
        'Space': jest.fn(),
        'Escape': jest.fn(),
        'Tab': jest.fn(),
      };

      const keyHandler = createKeyHandler(handlers);

      Object.entries(handlers).forEach(([key, handler]) => {
        const event = createKeyboardEvent(key as KeyboardKey);
        keyHandler(event);
        expect(handler).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle empty handlers object', () => {
      const keyHandler = createKeyHandler({});
      const event = createKeyboardEvent('Enter');

      expect(() => keyHandler(event)).not.toThrow();
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('createListNavigationHandler', () => {
    let container: HTMLElement;
    let navigationHandler: (event: KeyboardEvent) => void;

    beforeEach(() => {
      container = createTestContainer();
      createVisibleFocusableElements(container, `
        <button data-testid="btn-1">Button 1</button>
        <button data-testid="btn-2">Button 2</button>
        <button data-testid="btn-3">Button 3</button>
      `);
    });

    describe('vertical navigation (default)', () => {
      beforeEach(() => {
        navigationHandler = createListNavigationHandler(container);
      });

      it('should move focus down with ArrowDown', () => {
        const buttons = container.querySelectorAll('button');

        // Mock activeElement to be the first button
        Object.defineProperty(document, 'activeElement', {
          value: buttons[0],
          configurable: true,
        });

        const event = createKeyboardEvent('ArrowDown');
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

        navigationHandler(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
        jest.runAllTimers();
      });

      it('should move focus up with ArrowUp', () => {
        const buttons = container.querySelectorAll('button');

        Object.defineProperty(document, 'activeElement', {
          value: buttons[1],
          configurable: true,
        });

        const event = createKeyboardEvent('ArrowUp');
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

        navigationHandler(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
        jest.runAllTimers();
      });

      it('should not handle horizontal arrow keys in vertical mode', () => {
        const buttons = container.querySelectorAll('button');

        Object.defineProperty(document, 'activeElement', {
          value: buttons[0],
          configurable: true,
        });

        const rightEvent = createKeyboardEvent('ArrowRight');
        const leftEvent = createKeyboardEvent('ArrowLeft');

        navigationHandler(rightEvent);
        navigationHandler(leftEvent);

        expect(rightEvent.defaultPrevented).toBe(false);
        expect(leftEvent.defaultPrevented).toBe(false);
      });
    });

    describe('horizontal navigation', () => {
      beforeEach(() => {
        navigationHandler = createListNavigationHandler(container, {
          vertical: false,
          horizontal: true,
        });
      });

      it('should move focus right with ArrowRight', () => {
        const buttons = container.querySelectorAll('button');

        Object.defineProperty(document, 'activeElement', {
          value: buttons[0],
          configurable: true,
        });

        const event = createKeyboardEvent('ArrowRight');
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

        navigationHandler(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
        jest.runAllTimers();
      });

      it('should move focus left with ArrowLeft', () => {
        const buttons = container.querySelectorAll('button');

        Object.defineProperty(document, 'activeElement', {
          value: buttons[1],
          configurable: true,
        });

        const event = createKeyboardEvent('ArrowLeft');
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

        navigationHandler(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
        jest.runAllTimers();
      });

      it('should not handle vertical arrow keys in horizontal mode', () => {
        const buttons = container.querySelectorAll('button');

        Object.defineProperty(document, 'activeElement', {
          value: buttons[0],
          configurable: true,
        });

        const downEvent = createKeyboardEvent('ArrowDown');
        const upEvent = createKeyboardEvent('ArrowUp');

        navigationHandler(downEvent);
        navigationHandler(upEvent);

        expect(downEvent.defaultPrevented).toBe(false);
        expect(upEvent.defaultPrevented).toBe(false);
      });
    });

    describe('Home and End keys', () => {
      beforeEach(() => {
        navigationHandler = createListNavigationHandler(container);
      });

      it('should focus first element with Home key', () => {
        const buttons = container.querySelectorAll('button');

        Object.defineProperty(document, 'activeElement', {
          value: buttons[2],
          configurable: true,
        });

        const event = createKeyboardEvent('Home');
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

        navigationHandler(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
        jest.runAllTimers();
      });

      it('should focus last element with End key', () => {
        const buttons = container.querySelectorAll('button');

        Object.defineProperty(document, 'activeElement', {
          value: buttons[0],
          configurable: true,
        });

        const event = createKeyboardEvent('End');
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

        navigationHandler(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
        jest.runAllTimers();
      });
    });

    describe('edge cases', () => {
      beforeEach(() => {
        navigationHandler = createListNavigationHandler(container);
      });

      it('should do nothing when active element is not in focusable elements', () => {
        const outsideElement = document.createElement('div');
        document.body.appendChild(outsideElement);

        Object.defineProperty(document, 'activeElement', {
          value: outsideElement,
          configurable: true,
        });

        const event = createKeyboardEvent('ArrowDown');
        const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

        navigationHandler(event);

        expect(preventDefaultSpy).not.toHaveBeenCalled();
      });

      it('should handle empty container', () => {
        const emptyContainer = createTestContainer();
        const emptyNavigationHandler = createListNavigationHandler(emptyContainer);

        const event = createKeyboardEvent('ArrowDown');

        expect(() => emptyNavigationHandler(event)).not.toThrow();
      });

      it('should handle container with single element', () => {
        const singleContainer = createTestContainer();
        createVisibleFocusableElements(singleContainer, '<button>Only Button</button>');
        const singleNavigationHandler = createListNavigationHandler(singleContainer);

        const button = singleContainer.querySelector('button')!;
        Object.defineProperty(document, 'activeElement', {
          value: button,
          configurable: true,
        });

        const event = createKeyboardEvent('ArrowDown');
        singleNavigationHandler(event);

        expect(event.defaultPrevented).toBe(true);
        jest.runAllTimers();
      });
    });

    describe('options configuration', () => {
      it('should support both vertical and horizontal navigation', () => {
        navigationHandler = createListNavigationHandler(container, {
          vertical: true,
          horizontal: true,
        });

        const buttons = container.querySelectorAll('button');

        Object.defineProperty(document, 'activeElement', {
          value: buttons[0],
          configurable: true,
        });

        const events = [
          createKeyboardEvent('ArrowDown'),
          createKeyboardEvent('ArrowUp'),
          createKeyboardEvent('ArrowRight'),
          createKeyboardEvent('ArrowLeft'),
        ];

        events.forEach(event => {
          navigationHandler(event);
          expect(event.defaultPrevented).toBe(true);
        });
      });

      it('should handle disabled vertical and horizontal navigation', () => {
        navigationHandler = createListNavigationHandler(container, {
          vertical: false,
          horizontal: false,
        });

        const buttons = container.querySelectorAll('button');

        Object.defineProperty(document, 'activeElement', {
          value: buttons[0],
          configurable: true,
        });

        const events = [
          createKeyboardEvent('ArrowDown'),
          createKeyboardEvent('ArrowUp'),
          createKeyboardEvent('ArrowRight'),
          createKeyboardEvent('ArrowLeft'),
        ];

        events.forEach(event => {
          navigationHandler(event);
          expect(event.defaultPrevented).toBe(false);
        });
      });
    });
  });

  describe('createEscapeHandler', () => {
    it('should call callback when Escape key is pressed', () => {
      const callback = jest.fn();
      const escapeHandler = createEscapeHandler(callback);

      const event = createKeyboardEvent('Escape');
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      escapeHandler(event);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
    });

    it('should not call callback for other keys', () => {
      const callback = jest.fn();
      const escapeHandler = createEscapeHandler(callback);

      const keys: KeyboardKey[] = ['Enter', 'Space', 'Tab', 'ArrowDown'];

      keys.forEach(key => {
        const event = createKeyboardEvent(key);
        escapeHandler(event);
        expect(event.defaultPrevented).toBe(false);
      });

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle multiple calls', () => {
      const callback = jest.fn();
      const escapeHandler = createEscapeHandler(callback);

      const event1 = createKeyboardEvent('Escape');
      const event2 = createKeyboardEvent('Escape');

      escapeHandler(event1);
      escapeHandler(event2);

      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe('createActivationHandler', () => {
    it('should call callback when Enter key is pressed', () => {
      const callback = jest.fn();
      const activationHandler = createActivationHandler(callback);

      const event = createKeyboardEvent('Enter');
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      activationHandler(event);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
    });

    it('should call callback when Space key is pressed', () => {
      const callback = jest.fn();
      const activationHandler = createActivationHandler(callback);

      const event = createKeyboardEvent('Space');
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      activationHandler(event);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
    });

    it('should not call callback for other keys', () => {
      const callback = jest.fn();
      const activationHandler = createActivationHandler(callback);

      const keys: KeyboardKey[] = ['Escape', 'Tab', 'ArrowDown', 'ArrowUp'];

      keys.forEach(key => {
        const event = createKeyboardEvent(key);
        activationHandler(event);
        expect(event.defaultPrevented).toBe(false);
      });

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle both Enter and Space in same handler', () => {
      const callback = jest.fn();
      const activationHandler = createActivationHandler(callback);

      const enterEvent = createKeyboardEvent('Enter');
      const spaceEvent = createKeyboardEvent('Space');

      activationHandler(enterEvent);
      activationHandler(spaceEvent);

      expect(callback).toHaveBeenCalledTimes(2);
      expect(enterEvent.defaultPrevented).toBe(true);
      expect(spaceEvent.defaultPrevented).toBe(true);
    });

    it('should handle multiple callbacks', () => {
      const callback = jest.fn();
      const activationHandler = createActivationHandler(callback);

      const event1 = createKeyboardEvent('Enter');
      const event2 = createKeyboardEvent('Space');
      const event3 = createKeyboardEvent('Enter');

      activationHandler(event1);
      activationHandler(event2);
      activationHandler(event3);

      expect(callback).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integration Tests', () => {
    it('should work together for complete keyboard navigation', () => {
      const container = createTestContainer();
      createVisibleFocusableElements(container, `
        <button data-testid="btn-1">Button 1</button>
        <button data-testid="btn-2">Button 2</button>
        <button data-testid="btn-3">Button 3</button>
      `);

      const buttons = container.querySelectorAll('button');
      const onEscape = jest.fn();
      const onActivation = jest.fn();

      // Create handlers
      const navigationHandler = createListNavigationHandler(container);
      const escapeHandler = createEscapeHandler(onEscape);
      const activationHandler = createActivationHandler(onActivation);

      // Combined handler
      const combinedHandler = (event: KeyboardEvent) => {
        navigationHandler(event);
        escapeHandler(event);
        activationHandler(event);
      };

      // Focus first button
      Object.defineProperty(document, 'activeElement', {
        value: buttons[0],
        configurable: true,
      });

      // Test navigation
      const downEvent = createKeyboardEvent('ArrowDown');
      combinedHandler(downEvent);
      expect(downEvent.defaultPrevented).toBe(true);

      // Test activation
      const enterEvent = createKeyboardEvent('Enter');
      combinedHandler(enterEvent);
      expect(onActivation).toHaveBeenCalledTimes(1);
      expect(enterEvent.defaultPrevented).toBe(true);

      // Test escape
      const escapeEvent = createKeyboardEvent('Escape');
      combinedHandler(escapeEvent);
      expect(onEscape).toHaveBeenCalledTimes(1);
      expect(escapeEvent.defaultPrevented).toBe(true);
    });

    it('should handle focus management with dynamic elements', () => {
      const container = createTestContainer();
      createVisibleFocusableElements(container, `
        <button>Initial Button</button>
      `);

      let focusableElements = getFocusableElements(container);
      expect(focusableElements).toHaveLength(1);

      // Add more elements
      const newButton = document.createElement('button');
      newButton.textContent = 'New Button';
      mockElementVisibility(newButton, true);
      container.appendChild(newButton);

      focusableElements = getFocusableElements(container);
      expect(focusableElements).toHaveLength(2);

      // Test navigation with updated elements
      const navigationHandler = createListNavigationHandler(container);

      Object.defineProperty(document, 'activeElement', {
        value: focusableElements[0],
        configurable: true,
      });

      const event = createKeyboardEvent('ArrowDown');
      navigationHandler(event);
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle null/undefined values gracefully', () => {
      expect(() => getFocusableElements(null as any)).toThrow();
      expect(() => focusElement(null)).not.toThrow();
      expect(() => getNextFocusableElement([], null as any, 'next')).not.toThrow();
    });

    it('should handle malformed DOM structures', () => {
      const container = createTestContainer();

      // Create element with malformed attributes
      const malformedButton = document.createElement('button');
      malformedButton.setAttribute('tabindex', 'invalid');
      mockElementVisibility(malformedButton, true);
      container.appendChild(malformedButton);

      expect(() => getFocusableElements(container)).not.toThrow();
    });

    it('should handle rapid successive keyboard events', () => {
      const container = createTestContainer();
      createVisibleFocusableElements(container, `
        <button>Button 1</button>
        <button>Button 2</button>
      `);

      const navigationHandler = createListNavigationHandler(container);
      const buttons = container.querySelectorAll('button');

      Object.defineProperty(document, 'activeElement', {
        value: buttons[0],
        configurable: true,
      });

      // Rapid successive events
      for (let i = 0; i < 10; i++) {
        const event = createKeyboardEvent('ArrowDown');
        expect(() => navigationHandler(event)).not.toThrow();
      }
    });

    it('should handle memory cleanup properly', () => {
      const container = createTestContainer();
      const navigationHandler = createListNavigationHandler(container);

      // Remove container from DOM
      container.remove();

      const event = createKeyboardEvent('ArrowDown');
      expect(() => navigationHandler(event)).not.toThrow();
    });
  });
});