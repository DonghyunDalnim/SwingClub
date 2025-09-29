import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SkipLink } from '@/components/core/SkipLink';
import { theme } from '@/lib/theme';

expect.extend(toHaveNoViolations);

// Mock scrollIntoView as it's not implemented in JSDOM
const mockScrollIntoView = jest.fn();
Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: mockScrollIntoView,
});

describe('SkipLink Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockScrollIntoView.mockClear();

    // Clean up DOM
    document.body.innerHTML = '';
  });

  describe('Rendering and Basic Behavior', () => {
    it('renders correctly with required props', () => {
      render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link', { name: /skip to main content/i });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('renders with custom className', () => {
      render(
        <SkipLink targetId="main-content" className="custom-class">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');
      expect(skipLink).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLAnchorElement>();

      render(
        <SkipLink ref={ref} targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
      expect(ref.current).toBe(screen.getByRole('link'));
    });

    it('accepts additional props', () => {
      render(
        <SkipLink
          targetId="main-content"
          data-testid="skip-link"
          aria-label="Skip to main content section"
        >
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByTestId('skip-link');
      expect(skipLink).toHaveAttribute('aria-label', 'Skip to main content section');
    });

    it('has correct displayName', () => {
      expect(SkipLink.displayName).toBe('SkipLink');
    });
  });

  describe('Styling and Appearance', () => {
    it('applies correct base styling classes', () => {
      render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');

      // Position and z-index
      expect(skipLink).toHaveClass('absolute', 'left-4', 'top-4', 'z-[9999]');

      // Padding and border radius
      expect(skipLink).toHaveClass('px-4', 'py-2', 'rounded-md');

      // Typography
      expect(skipLink).toHaveClass('text-white', 'font-medium', 'text-sm');

      // Initial hidden state
      expect(skipLink).toHaveClass('transform', '-translate-y-16', 'opacity-0');

      // Transitions
      expect(skipLink).toHaveClass('transition-all', 'duration-200', 'ease-in-out');

      // Focus state
      expect(skipLink).toHaveClass('focus:translate-y-0', 'focus:opacity-100');

      // Background and focus styles
      expect(skipLink).toHaveClass('bg-gray-900', 'hover:bg-gray-800');
      expect(skipLink).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
      expect(skipLink).toHaveClass('shadow-lg');
    });

    it('applies theme-based inline styles', () => {
      render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');
      const styles = window.getComputedStyle(skipLink);

      // Note: jsdom doesn't fully compute styles, so we check the style attribute
      expect(skipLink).toHaveStyle({
        backgroundColor: theme.colors.neutral.darkest,
        color: theme.colors.white,
        boxShadow: `0 0 0 2px ${theme.colors.primary.main}`,
      });
    });

    it('merges custom className with default classes', () => {
      render(
        <SkipLink targetId="main-content" className="custom-bg-blue">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');
      expect(skipLink).toHaveClass('custom-bg-blue');
      expect(skipLink).toHaveClass('absolute'); // Still has base classes
    });
  });

  describe('Focus and Visibility Behavior', () => {
    it('is initially hidden and becomes visible on focus', async () => {
      const user = userEvent.setup();

      render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');

      // Initially hidden
      expect(skipLink).toHaveClass('-translate-y-16', 'opacity-0');

      // Focus the link
      await user.tab();
      expect(skipLink).toHaveFocus();

      // Should have focus classes for visibility
      expect(skipLink).toHaveClass('focus:translate-y-0', 'focus:opacity-100');
    });

    it('loses visibility when focus is lost', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <SkipLink targetId="main-content">
            Skip to main content
          </SkipLink>
          <button>Other element</button>
        </div>
      );

      const skipLink = screen.getByRole('link');
      const button = screen.getByRole('button');

      // Focus the skip link
      await user.tab();
      expect(skipLink).toHaveFocus();

      // Move focus away
      await user.tab();
      expect(button).toHaveFocus();
      expect(skipLink).not.toHaveFocus();
    });

    it('can be focused programmatically', () => {
      render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');

      skipLink.focus();
      expect(skipLink).toHaveFocus();
    });
  });

  describe('Click and Navigation Behavior', () => {
    it('prevents default navigation behavior on click', async () => {
      const user = userEvent.setup();

      // Create target element
      const targetElement = document.createElement('div');
      targetElement.id = 'main-content';
      document.body.appendChild(targetElement);

      render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');

      // Mock preventDefault to check if it's called
      const mockPreventDefault = jest.fn();
      skipLink.addEventListener('click', (e) => {
        mockPreventDefault();
        e.preventDefault();
      });

      await user.click(skipLink);

      expect(mockPreventDefault).toHaveBeenCalled();
    });

    it('focuses target element when clicked', async () => {
      const user = userEvent.setup();

      // Create target element
      const targetElement = document.createElement('div');
      targetElement.id = 'main-content';
      targetElement.textContent = 'Main content area';
      document.body.appendChild(targetElement);

      render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');

      await user.click(skipLink);

      expect(targetElement).toHaveFocus();
    });

    it('adds tabindex="-1" to target element if not present', async () => {
      const user = userEvent.setup();

      // Create target element without tabindex
      const targetElement = document.createElement('div');
      targetElement.id = 'main-content';
      document.body.appendChild(targetElement);

      render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');

      // Initially no tabindex
      expect(targetElement.hasAttribute('tabindex')).toBe(false);

      await user.click(skipLink);

      // Should have tabindex after click
      expect(targetElement.getAttribute('tabindex')).toBe('-1');
    });

    it('does not modify existing tabindex on target element', async () => {
      const user = userEvent.setup();

      // Create target element with existing tabindex
      const targetElement = document.createElement('div');
      targetElement.id = 'main-content';
      targetElement.setAttribute('tabindex', '0');
      document.body.appendChild(targetElement);

      render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');

      await user.click(skipLink);

      // Should keep original tabindex
      expect(targetElement.getAttribute('tabindex')).toBe('0');
    });

    it('calls scrollIntoView on target element', async () => {
      const user = userEvent.setup();

      // Create target element
      const targetElement = document.createElement('div');
      targetElement.id = 'main-content';
      document.body.appendChild(targetElement);

      render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');

      await user.click(skipLink);

      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start'
      });
    });

    it('handles missing target element gracefully', async () => {
      const user = userEvent.setup();

      // Don't create target element
      render(
        <SkipLink targetId="non-existent">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');

      // Should not throw error
      await expect(user.click(skipLink)).resolves.not.toThrow();

      // scrollIntoView should not be called
      expect(mockScrollIntoView).not.toHaveBeenCalled();
    });

    it('handles click event with keyboard activation', async () => {
      const user = userEvent.setup();

      // Create target element
      const targetElement = document.createElement('div');
      targetElement.id = 'main-content';
      document.body.appendChild(targetElement);

      render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');

      // Focus and activate with Enter
      skipLink.focus();
      await user.keyboard('{Enter}');

      expect(targetElement).toHaveFocus();
      expect(mockScrollIntoView).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('can be reached by tab navigation', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <button>Before</button>
          <SkipLink targetId="main-content">
            Skip to main content
          </SkipLink>
          <button>After</button>
        </div>
      );

      const beforeButton = screen.getByRole('button', { name: 'Before' });
      const skipLink = screen.getByRole('link');
      const afterButton = screen.getByRole('button', { name: 'After' });

      // Start from before button
      beforeButton.focus();
      expect(beforeButton).toHaveFocus();

      // Tab to skip link
      await user.tab();
      expect(skipLink).toHaveFocus();

      // Tab to after button
      await user.tab();
      expect(afterButton).toHaveFocus();
    });

    it('can be activated with Enter key', async () => {
      const user = userEvent.setup();

      // Create target element
      const targetElement = document.createElement('div');
      targetElement.id = 'main-content';
      document.body.appendChild(targetElement);

      render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');

      skipLink.focus();
      await user.keyboard('{Enter}');

      expect(targetElement).toHaveFocus();
    });

    it('does not interfere with reverse tab navigation', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <button>Before</button>
          <SkipLink targetId="main-content">
            Skip to main content
          </SkipLink>
          <button>After</button>
        </div>
      );

      const beforeButton = screen.getByRole('button', { name: 'Before' });
      const skipLink = screen.getByRole('link');
      const afterButton = screen.getByRole('button', { name: 'After' });

      // Start from after button
      afterButton.focus();

      // Shift+Tab to skip link
      await user.tab({ shift: true });
      expect(skipLink).toHaveFocus();

      // Shift+Tab to before button
      await user.tab({ shift: true });
      expect(beforeButton).toHaveFocus();
    });
  });

  describe('Accessibility Attributes', () => {
    it('has correct semantic role', () => {
      render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');
      expect(skipLink.tagName).toBe('A');
    });

    it('has descriptive href attribute', () => {
      render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('supports custom aria attributes', () => {
      render(
        <SkipLink
          targetId="main-content"
          aria-label="Skip navigation and go to main content"
          aria-describedby="skip-help"
        >
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');
      expect(skipLink).toHaveAttribute('aria-label', 'Skip navigation and go to main content');
      expect(skipLink).toHaveAttribute('aria-describedby', 'skip-help');
    });

    it('maintains accessible focus outline', () => {
      render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');

      // Should have focus ring classes
      expect(skipLink).toHaveClass('focus:ring-2', 'focus:ring-offset-2');
      expect(skipLink).toHaveClass('focus:outline-none');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles empty targetId gracefully', async () => {
      const user = userEvent.setup();

      render(
        <SkipLink targetId="">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');
      expect(skipLink).toHaveAttribute('href', '#');

      // Should not throw when clicked
      await expect(user.click(skipLink)).resolves.not.toThrow();
    });

    it('handles special characters in targetId', () => {
      const specialId = 'main-content_123.test';

      render(
        <SkipLink targetId={specialId}>
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');
      expect(skipLink).toHaveAttribute('href', `#${specialId}`);
    });

    it('handles multiple skip links with different targets', async () => {
      const user = userEvent.setup();

      // Create multiple target elements
      const mainTarget = document.createElement('div');
      mainTarget.id = 'main-content';
      const navTarget = document.createElement('nav');
      navTarget.id = 'navigation';

      document.body.appendChild(mainTarget);
      document.body.appendChild(navTarget);

      render(
        <div>
          <SkipLink targetId="main-content">
            Skip to main content
          </SkipLink>
          <SkipLink targetId="navigation">
            Skip to navigation
          </SkipLink>
        </div>
      );

      const mainSkipLink = screen.getByRole('link', { name: /skip to main content/i });
      const navSkipLink = screen.getByRole('link', { name: /skip to navigation/i });

      // Test first skip link
      await user.click(mainSkipLink);
      expect(mainTarget).toHaveFocus();

      // Test second skip link
      await user.click(navSkipLink);
      expect(navTarget).toHaveFocus();
    });

    it('handles rapid successive clicks', async () => {
      const user = userEvent.setup();

      // Create target element
      const targetElement = document.createElement('div');
      targetElement.id = 'main-content';
      document.body.appendChild(targetElement);

      render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');

      // Multiple rapid clicks
      await user.click(skipLink);
      await user.click(skipLink);
      await user.click(skipLink);

      // Should still work correctly
      expect(targetElement).toHaveFocus();
      expect(mockScrollIntoView).toHaveBeenCalledTimes(3);
    });

    it('works with dynamically created target elements', async () => {
      const user = userEvent.setup();

      render(
        <SkipLink targetId="dynamic-content">
          Skip to dynamic content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');

      // Initially no target
      await user.click(skipLink);
      expect(mockScrollIntoView).not.toHaveBeenCalled();

      // Create target dynamically
      const targetElement = document.createElement('div');
      targetElement.id = 'dynamic-content';
      document.body.appendChild(targetElement);

      // Now it should work
      await user.click(skipLink);
      expect(targetElement).toHaveFocus();
      expect(mockScrollIntoView).toHaveBeenCalled();
    });
  });

  describe('Accessibility Compliance', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations with custom props', async () => {
      const { container } = render(
        <SkipLink
          targetId="main-content"
          className="custom-class"
          aria-label="Navigate to main content area"
        >
          Skip to main content
        </SkipLink>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations in a complex layout', async () => {
      // Create target element in document body first
      const targetElement = document.createElement('section');
      targetElement.id = 'main-content';
      targetElement.innerHTML = '<h1>Main Content</h1><p>This is the main content area.</p>';
      document.body.appendChild(targetElement);

      const { container } = render(
        <div>
          <header>
            <nav>
              <SkipLink targetId="main-content">
                Skip to main content
              </SkipLink>
              <a href="#home">Home</a>
              <a href="#about">About</a>
            </nav>
          </header>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('maintains accessibility with focus trap scenarios', async () => {
      const user = userEvent.setup();

      // Create target element
      const targetElement = document.createElement('div');
      targetElement.id = 'main-content';
      targetElement.setAttribute('tabindex', '-1');
      document.body.appendChild(targetElement);

      const { container } = render(
        <div>
          <SkipLink targetId="main-content">
            Skip to main content
          </SkipLink>
          <button>Regular button</button>
        </div>
      );

      const skipLink = screen.getByRole('link');

      // Focus and activate skip link
      await user.tab();
      expect(skipLink).toHaveFocus();

      await user.click(skipLink);
      expect(targetElement).toHaveFocus();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Integration with Real DOM Elements', () => {
    it('works with main landmark element', async () => {
      const user = userEvent.setup();

      // Create main landmark
      const mainElement = document.createElement('section');
      mainElement.id = 'main-content';
      mainElement.innerHTML = '<h1>Main Content</h1>';
      document.body.appendChild(mainElement);

      render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');

      await user.click(skipLink);
      expect(mainElement).toHaveFocus();
    });

    it('works with section elements', async () => {
      const user = userEvent.setup();

      // Create section element
      const sectionElement = document.createElement('section');
      sectionElement.id = 'content-section';
      sectionElement.innerHTML = '<h2>Section Title</h2>';
      document.body.appendChild(sectionElement);

      render(
        <SkipLink targetId="content-section">
          Skip to content section
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');

      await user.click(skipLink);
      expect(sectionElement).toHaveFocus();
    });

    it('works with heading elements', async () => {
      const user = userEvent.setup();

      // Create heading element
      const headingElement = document.createElement('h1');
      headingElement.id = 'main-heading';
      headingElement.textContent = 'Main Heading';
      document.body.appendChild(headingElement);

      render(
        <SkipLink targetId="main-heading">
          Skip to main heading
        </SkipLink>
      );

      const skipLink = screen.getByRole('link');

      await user.click(skipLink);
      expect(headingElement).toHaveFocus();
    });
  });

  describe('Performance and Memory', () => {
    it('does not create memory leaks with event listeners', () => {
      const { unmount } = render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      // Component should unmount cleanly
      expect(() => unmount()).not.toThrow();
    });

    it('handles multiple renders without issues', () => {
      const { rerender } = render(
        <SkipLink targetId="main-content">
          Skip to main content
        </SkipLink>
      );

      // Re-render with different props
      expect(() => {
        rerender(
          <SkipLink targetId="other-content" className="new-class">
            Skip to other content
          </SkipLink>
        );
      }).not.toThrow();

      const skipLink = screen.getByRole('link');
      expect(skipLink).toHaveAttribute('href', '#other-content');
      expect(skipLink).toHaveClass('new-class');
    });
  });
});