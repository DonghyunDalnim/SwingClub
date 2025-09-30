/**
 * Focus management utilities for accessibility
 * Helps manage keyboard navigation and focus states
 */

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter((element) => {
      return (
        element instanceof HTMLElement &&
        !element.hidden &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0
      );
    }) as HTMLElement[];
}

/**
 * Trap focus within a container (useful for modals, dropdowns)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);

  if (focusableElements.length === 0) {
    return () => {}; // No cleanup needed
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      // Shift + Tab (backwards)
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab (forwards)
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Focus the first element initially
  firstElement.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Save and restore focus for temporary focus changes
 */
export class FocusManager {
  private previouslyFocused: HTMLElement | null = null;

  /**
   * Save the currently focused element
   */
  save(): void {
    this.previouslyFocused = document.activeElement as HTMLElement;
  }

  /**
   * Restore focus to the previously saved element
   */
  restore(): void {
    if (this.previouslyFocused && typeof this.previouslyFocused.focus === 'function') {
      this.previouslyFocused.focus();
    }
    this.previouslyFocused = null;
  }

  /**
   * Save current focus and move to a new element
   */
  moveTo(element: HTMLElement): void {
    this.save();
    element.focus();
  }
}

/**
 * Create a roving tabindex manager for component groups
 */
export class RovingTabindexManager {
  private elements: HTMLElement[] = [];
  private currentIndex = 0;

  constructor(elements: HTMLElement[], initialIndex = 0) {
    this.elements = elements;
    this.currentIndex = initialIndex;
    this.init();
  }

  private init(): void {
    this.elements.forEach((element, index) => {
      element.tabIndex = index === this.currentIndex ? 0 : -1;
      element.addEventListener('keydown', this.handleKeyDown.bind(this));
      element.addEventListener('focus', () => this.setCurrentIndex(index));
    });
  }

  private handleKeyDown(event: KeyboardEvent): void {
    let newIndex = this.currentIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        newIndex = (this.currentIndex + 1) % this.elements.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        newIndex = this.currentIndex === 0
          ? this.elements.length - 1
          : this.currentIndex - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = this.elements.length - 1;
        break;
      default:
        return;
    }

    this.setCurrentIndex(newIndex);
    this.elements[newIndex].focus();
  }

  private setCurrentIndex(index: number): void {
    this.elements[this.currentIndex].tabIndex = -1;
    this.currentIndex = index;
    this.elements[this.currentIndex].tabIndex = 0;
  }

  /**
   * Update the list of managed elements
   */
  updateElements(elements: HTMLElement[]): void {
    this.cleanup();
    this.elements = elements;
    this.currentIndex = Math.min(this.currentIndex, elements.length - 1);
    this.init();
  }

  /**
   * Clean up event listeners
   */
  cleanup(): void {
    this.elements.forEach((element) => {
      element.removeEventListener('keydown', this.handleKeyDown.bind(this));
    });
  }
}

/**
 * Focus the first invalid field in a form
 */
export function focusFirstInvalidField(form: HTMLFormElement): boolean {
  const invalidField = form.querySelector(':invalid') as HTMLElement;

  if (invalidField && typeof invalidField.focus === 'function') {
    invalidField.focus();
    return true;
  }

  return false;
}

/**
 * Skip to main content (accessibility helper)
 */
export function skipToMainContent(): void {
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.focus();
    mainContent.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * React hook for focus management
 */
export function useFocusManager() {
  const focusManager = new FocusManager();

  return {
    save: () => focusManager.save(),
    restore: () => focusManager.restore(),
    moveTo: (element: HTMLElement) => focusManager.moveTo(element),
    trapFocus,
    getFocusableElements,
    focusFirstInvalidField,
    skipToMainContent
  };
}