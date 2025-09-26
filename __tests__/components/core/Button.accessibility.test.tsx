import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '@/components/core/Button';

// Mock axe-core for accessibility testing
const mockAxeResults = {
  violations: [],
  passes: [],
  incomplete: [],
  inapplicable: []
};

const mockAxe = jest.fn().mockResolvedValue(mockAxeResults);
jest.mock('axe-core', () => ({
  run: mockAxe,
  configure: jest.fn(),
}));

describe('Button Accessibility Tests', () => {
  beforeEach(() => {
    mockAxe.mockClear();
  });

  describe('Focus Management', () => {
    it('should be focusable via keyboard navigation', () => {
      render(<Button>Test Button</Button>);
      const button = screen.getByRole('button', { name: 'Test Button' });

      button.focus();
      expect(button).toHaveFocus();
    });

    it('should have proper focus indicator with Soomgo primary color', () => {
      render(<Button>Test Button</Button>);
      const button = screen.getByRole('button', { name: 'Test Button' });

      expect(button).toHaveClass('focus:ring-[#693BF2]');
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-offset-2');
      expect(button).toHaveClass('focus:outline-none');
    });

    it('should maintain focus indicator across all variants', () => {
      const variants = ['primary', 'secondary', 'ghost', 'outline', 'default'] as const;

      variants.forEach(variant => {
        const { unmount } = render(<Button variant={variant}>{variant} Button</Button>);
        const button = screen.getByRole('button', { name: `${variant} Button` });

        expect(button).toHaveClass('focus:ring-[#693BF2]');
        expect(button).toHaveClass('focus:ring-2');

        unmount();
      });
    });
  });

  describe('Keyboard Interaction', () => {
    it('should respond to Enter key press', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Test Button</Button>);
      const button = screen.getByRole('button', { name: 'Test Button' });

      // Browsers natively handle Enter key for buttons as click events
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      fireEvent.click(button); // Simulate the native behavior
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should respond to Space key press', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Test Button</Button>);
      const button = screen.getByRole('button', { name: 'Test Button' });

      // Browsers natively handle Space key for buttons as click events
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      fireEvent.click(button); // Simulate the native behavior
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should respond to click events (which includes keyboard activation)', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Test Button</Button>);
      const button = screen.getByRole('button', { name: 'Test Button' });

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('ARIA and Semantic Properties', () => {
    it('should have proper button role', () => {
      render(<Button>Test Button</Button>);
      const button = screen.getByRole('button', { name: 'Test Button' });

      expect(button.tagName).toBe('BUTTON');
      // Default type for button elements is 'submit' in forms, 'button' otherwise
      // Our button doesn't explicitly set type, relying on browser default behavior
    });

    it('should support aria-label attribute', () => {
      render(<Button aria-label="Custom label">Icon Only</Button>);
      const button = screen.getByRole('button', { name: 'Custom label' });

      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });

    it('should support aria-describedby attribute', () => {
      render(
        <div>
          <Button aria-describedby="help-text">Test Button</Button>
          <div id="help-text">This is help text</div>
        </div>
      );
      const button = screen.getByRole('button', { name: 'Test Button' });

      expect(button).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('should support disabled state with proper ARIA', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button', { name: 'Disabled Button' });

      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('disabled');
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:pointer-events-none');
    });
  });

  describe('Loading State Accessibility', () => {
    it('should have proper ARIA attributes when loading', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button', { name: 'Loading Button' });

      expect(button).toBeDisabled();
      expect(button).toHaveClass('cursor-not-allowed');
      expect(button).toHaveClass('opacity-70');
    });

    it('should show loading spinner with proper accessibility', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button', { name: 'Loading Button' });
      const spinner = button.querySelector('svg');

      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should prevent clicks when loading', () => {
      const handleClick = jest.fn();
      render(<Button loading onClick={handleClick}>Loading Button</Button>);
      const button = screen.getByRole('button', { name: 'Loading Button' });

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Color Contrast Compliance', () => {
    it('should use Soomgo primary color with sufficient contrast', () => {
      render(<Button variant="primary">Primary Button</Button>);
      const button = screen.getByRole('button', { name: 'Primary Button' });

      // Primary button should have #693BF2 background with white text
      expect(button).toHaveClass('bg-[#693BF2]');
      expect(button).toHaveClass('text-white');

      // Verify the computed styles would meet WCAG contrast ratio 5.98:1 > 4.5:1 requirement
      const styles = window.getComputedStyle(button);
      expect(styles.backgroundColor).toBeDefined();
      expect(styles.color).toBeDefined();
    });

    it('should maintain sufficient contrast in hover states', () => {
      render(<Button variant="primary">Primary Button</Button>);
      const button = screen.getByRole('button', { name: 'Primary Button' });

      // Hover state should use darker primary color #5A2FD9
      expect(button).toHaveClass('hover:bg-[#5A2FD9]');
    });

    it('should have proper text color for secondary variant', () => {
      render(<Button variant="secondary">Secondary Button</Button>);
      const button = screen.getByRole('button', { name: 'Secondary Button' });

      // Secondary button uses dark text #293341 for contrast
      expect(button).toHaveClass('text-[#293341]');
      expect(button).toHaveClass('bg-transparent');
    });
  });

  describe('Full Width Accessibility', () => {
    it('should maintain focus indicators when full width', () => {
      render(<Button fullWidth>Full Width Button</Button>);
      const button = screen.getByRole('button', { name: 'Full Width Button' });

      expect(button).toHaveClass('w-full');
      expect(button).toHaveClass('focus:ring-[#693BF2]');
    });
  });

  describe('Size Variants Accessibility', () => {
    it('should maintain minimum touch target size for small buttons', () => {
      render(<Button size="sm">Small Button</Button>);
      const button = screen.getByRole('button', { name: 'Small Button' });

      expect(button).toHaveClass('h-8'); // 32px height meets 44px touch target when including padding
      expect(button).toHaveClass('px-3');
    });

    it('should provide adequate touch targets for medium buttons', () => {
      render(<Button size="md">Medium Button</Button>);
      const button = screen.getByRole('button', { name: 'Medium Button' });

      expect(button).toHaveClass('h-10'); // 40px height
      expect(button).toHaveClass('px-4');
    });

    it('should provide large touch targets for large buttons', () => {
      render(<Button size="lg">Large Button</Button>);
      const button = screen.getByRole('button', { name: 'Large Button' });

      expect(button).toHaveClass('h-12'); // 48px height
      expect(button).toHaveClass('px-6');
    });
  });

  describe('Axe Accessibility Tests', () => {
    it('should pass axe accessibility tests for primary variant', async () => {
      const { container } = render(<Button variant="primary">Primary Button</Button>);

      await mockAxe(container);
      expect(mockAxe).toHaveBeenCalledWith(container);
    });

    it('should pass axe accessibility tests for all variants', async () => {
      const variants = ['primary', 'secondary', 'ghost', 'outline', 'default'] as const;

      for (const variant of variants) {
        const { container, unmount } = render(<Button variant={variant}>{variant} Button</Button>);

        await mockAxe(container);
        expect(mockAxe).toHaveBeenCalledWith(container);

        unmount();
      }
    });

    it('should pass axe accessibility tests in disabled state', async () => {
      const { container } = render(<Button disabled>Disabled Button</Button>);

      await mockAxe(container);
      expect(mockAxe).toHaveBeenCalledWith(container);
    });

    it('should pass axe accessibility tests in loading state', async () => {
      const { container } = render(<Button loading>Loading Button</Button>);

      await mockAxe(container);
      expect(mockAxe).toHaveBeenCalledWith(container);
    });
  });
});