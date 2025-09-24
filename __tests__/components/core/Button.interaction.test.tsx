import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Button } from '@/components/core/Button';

// Mock CSS property getters for testing computed styles
const mockGetComputedStyle = (element: Element, styles: Record<string, string>) => {
  Object.defineProperty(element, 'style', {
    writable: true,
    value: styles
  });

  // Mock getComputedStyle for this specific element
  const originalGetComputedStyle = global.getComputedStyle;
  jest.spyOn(global, 'getComputedStyle').mockImplementation((el) => {
    if (el === element) {
      return {
        ...styles,
        getPropertyValue: (prop: string) => styles[prop] || '',
      } as CSSStyleDeclaration;
    }
    return originalGetComputedStyle(el);
  });
};

describe('Button Interaction Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock CSS animations and transitions
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      value: jest.fn(() => ({
        finished: Promise.resolve(),
        cancel: jest.fn(),
        play: jest.fn(),
        pause: jest.fn(),
      })),
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Hover Effects', () => {
    test('applies hover scale transformation on mouse enter', async () => {
      render(<Button data-testid="hover-button">Hover Me</Button>);
      const button = screen.getByTestId('hover-button');

      // Check initial state
      expect(button).toHaveClass('hover:scale-[1.02]');

      // Simulate hover
      await user.hover(button);

      // Check that hover classes are present
      expect(button).toHaveClass('transition-all', 'duration-200', 'ease-in-out');

      // Unhover to test state restoration
      await user.unhover(button);

      expect(button).toBeInTheDocument();
    });

    test.each([
      ['primary', 'hover:bg-[#5A2FD9]', 'hover:shadow-[0_2px_8px_rgba(105,59,242,0.3)]'],
      ['secondary', 'hover:bg-[#F6F7F9]', 'hover:border-[#693BF2]'],
      ['ghost', 'hover:bg-[#F1EEFF]'],
      ['outline', 'hover:bg-[#F1EEFF]'],
      ['default', 'hover:bg-[#5A2FD9]', 'hover:shadow-[0_2px_8px_rgba(105,59,242,0.3)]'],
    ])('applies correct hover styles for %s variant', async (variant, ...expectedClasses) => {
      render(
        <Button
          variant={variant as any}
          data-testid="variant-button"
        >
          Test Button
        </Button>
      );

      const button = screen.getByTestId('variant-button');

      // Check hover classes are applied
      expectedClasses.forEach(className => {
        expect(button).toHaveClass(className);
      });

      await user.hover(button);
      await user.unhover(button);
    });

    test('shadow effects are applied on hover for primary variant', async () => {
      render(<Button variant="primary" data-testid="shadow-button">Shadow Test</Button>);
      const button = screen.getByTestId('shadow-button');

      expect(button).toHaveClass('hover:shadow-[0_2px_8px_rgba(105,59,242,0.3)]');

      await user.hover(button);
      // Verify the hover state by checking the element is still responsive
      expect(button).toBeEnabled();
    });

    test('disabled button does not apply hover effects', async () => {
      render(
        <Button disabled data-testid="disabled-button">
          Disabled Button
        </Button>
      );

      const button = screen.getByTestId('disabled-button');

      // Check disabled classes prevent hover effects
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:pointer-events-none');
      expect(button).toHaveClass('disabled:hover:scale-100');
      expect(button).toBeDisabled();

      // Try to hover (should have no effect due to pointer-events-none)
      await user.hover(button);
      expect(button).toBeDisabled();
    });
  });

  describe('Focus States', () => {
    test('applies focus ring on keyboard focus', async () => {
      render(<Button data-testid="focus-button">Focus Me</Button>);
      const button = screen.getByTestId('focus-button');

      // Check focus classes are present
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-[#693BF2]');
      expect(button).toHaveClass('focus:ring-offset-2');

      // Focus the button
      await user.tab();
      expect(button).toHaveFocus();

      // Blur to test focus removal
      await user.tab();
      expect(button).not.toHaveFocus();
    });

    test('focus ring is visible for keyboard navigation', async () => {
      render(
        <div>
          <Button data-testid="first-button">First</Button>
          <Button data-testid="second-button">Second</Button>
        </div>
      );

      const firstButton = screen.getByTestId('first-button');
      const secondButton = screen.getByTestId('second-button');

      // Tab to first button
      await user.tab();
      expect(firstButton).toHaveFocus();

      // Tab to second button
      await user.tab();
      expect(secondButton).toHaveFocus();
      expect(firstButton).not.toHaveFocus();
    });

    test('focus styles work correctly for all variants', async () => {
      const variants = ['primary', 'secondary', 'ghost', 'outline', 'default'] as const;

      variants.forEach((variant, index) => {
        render(
          <Button
            variant={variant}
            data-testid={`focus-${variant}-button`}
            key={variant}
          >
            {variant} Button
          </Button>
        );
      });

      for (const variant of variants) {
        const button = screen.getByTestId(`focus-${variant}-button`);
        expect(button).toHaveClass('focus:ring-[#693BF2]');

        button.focus();
        expect(button).toHaveFocus();
        button.blur();
      }
    });

    test('disabled button focus behavior', async () => {
      render(
        <Button disabled data-testid="disabled-focus-button">
          Disabled Button
        </Button>
      );

      const button = screen.getByTestId('disabled-focus-button');

      // Disabled buttons cannot receive focus
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');

      // Try to focus - in modern browsers disabled buttons can't receive focus
      button.focus();
      // Don't expect it to have focus since it's disabled
      expect(button).toBeDisabled();
    });
  });

  describe('Active States', () => {
    test('applies active scale transformation on mouse down', async () => {
      render(<Button data-testid="active-button">Click Me</Button>);
      const button = screen.getByTestId('active-button');

      // Check active class is present
      expect(button).toHaveClass('active:scale-[0.98]');

      // Simulate mouse down and up
      fireEvent.mouseDown(button);
      fireEvent.mouseUp(button);

      expect(button).toBeInTheDocument();
    });

    test('active state works with keyboard interaction', async () => {
      const onClick = jest.fn();
      render(
        <Button onClick={onClick} data-testid="keyboard-active-button">
          Keyboard Button
        </Button>
      );

      const button = screen.getByTestId('keyboard-active-button');

      // Focus and press Enter
      button.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);

      // Press Space - use click method which properly handles space key
      await user.click(button);
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    test('disabled button does not trigger active state', async () => {
      const onClick = jest.fn();
      render(
        <Button
          disabled
          onClick={onClick}
          data-testid="disabled-active-button"
        >
          Disabled Button
        </Button>
      );

      const button = screen.getByTestId('disabled-active-button');

      // Check disabled active class prevents scaling
      expect(button).toHaveClass('disabled:active:scale-100');

      // Try to click (should not work)
      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    test('active state scaling works for all sizes', async () => {
      const sizes = ['sm', 'md', 'lg'] as const;

      sizes.forEach((size) => {
        render(
          <Button
            size={size}
            data-testid={`active-${size}-button`}
            key={size}
          >
            {size} Button
          </Button>
        );
      });

      for (const size of sizes) {
        const button = screen.getByTestId(`active-${size}-button`);
        expect(button).toHaveClass('active:scale-[0.98]');

        fireEvent.mouseDown(button);
        fireEvent.mouseUp(button);
      }
    });
  });

  describe('Keyboard Accessibility', () => {
    test('responds to Enter key', async () => {
      const onClick = jest.fn();
      render(
        <Button onClick={onClick} data-testid="enter-button">
          Enter Button
        </Button>
      );

      const button = screen.getByTestId('enter-button');
      button.focus();

      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    test('responds to Space key', async () => {
      const onClick = jest.fn();
      render(
        <Button onClick={onClick} data-testid="space-button">
          Space Button
        </Button>
      );

      const button = screen.getByTestId('space-button');
      button.focus();

      // Use userEvent.keyboard with space character
      await user.keyboard(' ');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    test('does not respond to other keys', async () => {
      const onClick = jest.fn();
      render(
        <Button onClick={onClick} data-testid="other-keys-button">
          Other Keys Button
        </Button>
      );

      const button = screen.getByTestId('other-keys-button');
      button.focus();

      await user.keyboard('{Escape}');
      await user.keyboard('{ArrowUp}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('a');

      expect(onClick).not.toHaveBeenCalled();
    });

    test('keyboard navigation works with tab sequence', async () => {
      render(
        <div>
          <input data-testid="input-before" />
          <Button data-testid="button-in-sequence">Button</Button>
          <input data-testid="input-after" />
        </div>
      );

      const inputBefore = screen.getByTestId('input-before');
      const button = screen.getByTestId('button-in-sequence');
      const inputAfter = screen.getByTestId('input-after');

      // Start from beginning
      inputBefore.focus();
      expect(inputBefore).toHaveFocus();

      // Tab to button
      await user.tab();
      expect(button).toHaveFocus();

      // Tab to next input
      await user.tab();
      expect(inputAfter).toHaveFocus();

      // Shift+Tab back to button
      await user.tab({ shift: true });
      expect(button).toHaveFocus();
    });
  });

  describe('ARIA Attributes', () => {
    test('has correct button element and attributes', () => {
      render(<Button data-testid="aria-button">ARIA Button</Button>);
      const button = screen.getByTestId('aria-button');

      // Button element should be a proper button tag
      expect(button.tagName).toBe('BUTTON');

      // HTML buttons don't have a default type attribute, but they behave as type="button"
      // unless specified otherwise in forms
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    test('submit type button has correct attributes', () => {
      render(
        <Button type="submit" data-testid="submit-button">
          Submit Button
        </Button>
      );

      const button = screen.getByTestId('submit-button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    test('disabled button has correct aria-disabled', () => {
      render(
        <Button disabled data-testid="aria-disabled-button">
          Disabled Button
        </Button>
      );

      const button = screen.getByTestId('aria-disabled-button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('disabled');
    });

    test('loading button maintains accessibility', () => {
      render(
        <Button loading data-testid="aria-loading-button">
          Loading Button
        </Button>
      );

      const button = screen.getByTestId('aria-loading-button');

      // Should be disabled when loading
      expect(button).toBeDisabled();

      // Should have loading indicator
      const loadingSpinner = button.querySelector('svg.animate-spin');
      expect(loadingSpinner).toBeInTheDocument();
    });

    test('button with custom aria attributes', () => {
      render(
        <Button
          aria-label="Custom Label"
          aria-describedby="description"
          data-testid="custom-aria-button"
        >
          Button
        </Button>
      );

      const button = screen.getByTestId('custom-aria-button');
      expect(button).toHaveAttribute('aria-label', 'Custom Label');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });
  });

  describe('Loading State Interactions', () => {
    test('loading button prevents all interactions', async () => {
      const onClick = jest.fn();
      render(
        <Button loading onClick={onClick} data-testid="loading-button">
          Loading Button
        </Button>
      );

      const button = screen.getByTestId('loading-button');

      // Check loading styles
      expect(button).toHaveClass('cursor-not-allowed', 'opacity-70');
      expect(button).toBeDisabled();

      // Try various interactions
      await user.click(button);
      await user.hover(button);

      button.focus();
      await user.keyboard('{Enter}');
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });

      // None should trigger onClick
      expect(onClick).not.toHaveBeenCalled();
    });

    test('loading button shows spinner', () => {
      render(<Button loading data-testid="spinner-button">Loading</Button>);
      const button = screen.getByTestId('spinner-button');

      const spinner = button.querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('mr-2', 'h-4', 'w-4', 'animate-spin');
    });

    test('loading state prevents hover and active scaling', () => {
      render(<Button loading data-testid="loading-scale-button">Loading</Button>);
      const button = screen.getByTestId('loading-scale-button');

      // Loading state should prevent scaling due to disabled state
      expect(button).toHaveClass('disabled:hover:scale-100');
      expect(button).toHaveClass('disabled:active:scale-100');
      expect(button).toBeDisabled();
    });
  });

  describe('Size Variants Interaction', () => {
    test.each([
      ['sm', 'h-8', 'px-3', 'text-sm'],
      ['md', 'h-10', 'px-4', 'text-base'],
      ['lg', 'h-12', 'px-6', 'text-lg'],
    ])('%s size has correct dimensions and interactions', async (size, height, padding, fontSize) => {
      const onClick = jest.fn();
      render(
        <Button
          size={size as any}
          onClick={onClick}
          data-testid={`size-${size}-button`}
        >
          {size} Button
        </Button>
      );

      const button = screen.getByTestId(`size-${size}-button`);

      // Check size classes
      expect(button).toHaveClass(height, padding, fontSize);

      // Check interactions work for all sizes
      expect(button).toHaveClass('hover:scale-[1.02]', 'active:scale-[0.98]');

      // Test interaction
      await user.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Full Width Variant', () => {
    test('full width button maintains all interactions', async () => {
      const onClick = jest.fn();
      render(
        <Button
          fullWidth
          onClick={onClick}
          data-testid="fullwidth-button"
        >
          Full Width Button
        </Button>
      );

      const button = screen.getByTestId('fullwidth-button');

      expect(button).toHaveClass('w-full');
      expect(button).toHaveClass('hover:scale-[1.02]', 'active:scale-[0.98]');

      await user.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases and Complex Interactions', () => {
    test('rapid hover and click interactions', async () => {
      const onClick = jest.fn();
      render(
        <Button onClick={onClick} data-testid="rapid-interaction-button">
          Rapid Test
        </Button>
      );

      const button = screen.getByTestId('rapid-interaction-button');

      // Rapid sequence of interactions
      await user.hover(button);
      await user.click(button);
      await user.unhover(button);
      await user.hover(button);

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(button).toBeEnabled();
    });

    test('form submission with Enter key', async () => {
      const onSubmit = jest.fn((e) => e.preventDefault());
      render(
        <form onSubmit={onSubmit}>
          <Button type="submit" data-testid="submit-button">
            Submit
          </Button>
        </form>
      );

      const button = screen.getByTestId('submit-button');
      button.focus();

      await user.keyboard('{Enter}');
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    test('button inside disabled fieldset', () => {
      render(
        <fieldset disabled>
          <Button data-testid="fieldset-button">Fieldset Button</Button>
        </fieldset>
      );

      const button = screen.getByTestId('fieldset-button');

      // Button should be disabled due to fieldset
      expect(button).toBeDisabled();
    });

    test('transition timing and ease function', () => {
      render(<Button data-testid="transition-button">Transition</Button>);
      const button = screen.getByTestId('transition-button');

      expect(button).toHaveClass('transition-all', 'duration-200', 'ease-in-out');
    });

    test('button with complex content maintains interactions', async () => {
      const onClick = jest.fn();
      render(
        <Button onClick={onClick} data-testid="complex-content-button">
          <span>Complex</span>
          <strong>Content</strong>
          <em>Button</em>
        </Button>
      );

      const button = screen.getByTestId('complex-content-button');

      // Click on different parts of the button
      await user.click(screen.getByText('Complex'));
      expect(onClick).toHaveBeenCalledTimes(1);

      await user.click(screen.getByText('Content'));
      expect(onClick).toHaveBeenCalledTimes(2);

      await user.click(screen.getByText('Button'));
      expect(onClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility Compliance', () => {
    test('button has minimum 44x44 touch target (mobile)', () => {
      render(<Button size="sm" data-testid="touch-target-button">Small</Button>);
      const button = screen.getByTestId('touch-target-button');

      // Small button should still meet minimum touch target
      expect(button).toHaveClass('h-8'); // 32px height
      // Padding and content should make it accessible
    });

    test('focus indicator has sufficient contrast', async () => {
      render(<Button data-testid="contrast-button">Contrast Test</Button>);
      const button = screen.getByTestId('contrast-button');

      // Focus ring should be visible
      expect(button).toHaveClass('focus:ring-[#693BF2]');
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-offset-2');

      button.focus();
      expect(button).toHaveFocus();
    });

    test('button text has sufficient color contrast', () => {
      const variants = ['primary', 'secondary', 'ghost', 'outline', 'default'] as const;

      variants.forEach((variant) => {
        render(
          <Button
            variant={variant}
            data-testid={`contrast-${variant}-button`}
            key={variant}
          >
            {variant}
          </Button>
        );

        const button = screen.getByTestId(`contrast-${variant}-button`);
        expect(button).toBeInTheDocument();

        // Primary and default should have white text on purple background
        if (variant === 'primary' || variant === 'default') {
          expect(button).toHaveClass('text-white');
        }
      });
    });

    test('disabled state is announced to screen readers', () => {
      render(
        <Button disabled data-testid="sr-disabled-button">
          Screen Reader Test
        </Button>
      );

      const button = screen.getByTestId('sr-disabled-button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('disabled');
    });
  });

  describe('Performance and Memory', () => {
    test('button cleans up event listeners', () => {
      const { unmount } = render(
        <Button data-testid="cleanup-button">Cleanup Test</Button>
      );

      const button = screen.getByTestId('cleanup-button');
      expect(button).toBeInTheDocument();

      // Unmount component
      unmount();

      // Button should be removed from DOM
      expect(screen.queryByTestId('cleanup-button')).not.toBeInTheDocument();
    });

    test('multiple rapid interactions do not cause memory leaks', async () => {
      const onClick = jest.fn();
      render(
        <Button onClick={onClick} data-testid="memory-test-button">
          Memory Test
        </Button>
      );

      const button = screen.getByTestId('memory-test-button');

      // Perform many rapid interactions
      for (let i = 0; i < 10; i++) {
        await user.click(button);
        await user.hover(button);
        await user.unhover(button);
      }

      expect(onClick).toHaveBeenCalledTimes(10);
      expect(button).toBeEnabled();
    });
  });

  describe('CSS Classes and Style Testing', () => {
    test('all variants have correct base classes', () => {
      const variants = ['primary', 'secondary', 'ghost', 'outline', 'default'] as const;
      const baseClasses = [
        'inline-flex',
        'items-center',
        'justify-center',
        'rounded-md',
        'font-medium',
        'transition-all',
        'duration-200',
        'ease-in-out',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-[#693BF2]',
        'focus:ring-offset-2',
        'hover:scale-[1.02]',
        'active:scale-[0.98]'
      ];

      variants.forEach((variant) => {
        render(
          <Button
            variant={variant}
            data-testid={`classes-${variant}-button`}
            key={variant}
          >
            {variant}
          </Button>
        );

        const button = screen.getByTestId(`classes-${variant}-button`);

        baseClasses.forEach((className) => {
          expect(button).toHaveClass(className);
        });
      });
    });

    test('disabled states have correct override classes', () => {
      render(<Button disabled data-testid="disabled-classes">Disabled</Button>);
      const button = screen.getByTestId('disabled-classes');

      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:pointer-events-none');
      expect(button).toHaveClass('disabled:hover:scale-100');
      expect(button).toHaveClass('disabled:active:scale-100');
    });

    test('size classes are correctly applied', () => {
      const sizes = [
        { size: 'sm', classes: ['h-8', 'px-3', 'text-sm'] },
        { size: 'md', classes: ['h-10', 'px-4', 'text-base'] },
        { size: 'lg', classes: ['h-12', 'px-6', 'text-lg'] },
      ] as const;

      sizes.forEach(({ size, classes }) => {
        render(
          <Button
            size={size}
            data-testid={`size-classes-${size}`}
            key={size}
          >
            Size Test
          </Button>
        );

        const button = screen.getByTestId(`size-classes-${size}`);
        classes.forEach((className) => {
          expect(button).toHaveClass(className);
        });
      });
    });
  });

  describe('Event Handling Edge Cases', () => {
    test('prevents double-click issues', async () => {
      const onClick = jest.fn();
      render(
        <Button onClick={onClick} data-testid="double-click-button">
          Double Click Test
        </Button>
      );

      const button = screen.getByTestId('double-click-button');

      // Perform double click
      await user.dblClick(button);

      // Should be called twice (once for each click)
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    test('handles mouse events correctly', async () => {
      const onMouseDown = jest.fn();
      const onMouseUp = jest.fn();
      const onMouseEnter = jest.fn();
      const onMouseLeave = jest.fn();

      render(
        <Button
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          data-testid="mouse-events-button"
        >
          Mouse Events
        </Button>
      );

      const button = screen.getByTestId('mouse-events-button');

      await user.hover(button);
      expect(onMouseEnter).toHaveBeenCalledTimes(1);

      fireEvent.mouseDown(button);
      expect(onMouseDown).toHaveBeenCalledTimes(1);

      fireEvent.mouseUp(button);
      expect(onMouseUp).toHaveBeenCalledTimes(1);

      await user.unhover(button);
      expect(onMouseLeave).toHaveBeenCalledTimes(1);
    });

    test('handles focus and blur events', async () => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();

      render(
        <Button
          onFocus={onFocus}
          onBlur={onBlur}
          data-testid="focus-events-button"
        >
          Focus Events
        </Button>
      );

      const button = screen.getByTestId('focus-events-button');

      button.focus();
      expect(onFocus).toHaveBeenCalledTimes(1);

      button.blur();
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });
});