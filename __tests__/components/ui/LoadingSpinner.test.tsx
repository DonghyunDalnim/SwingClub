import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('Basic Rendering', () => {
    it('renders the loading spinner with default props', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('renders the screen reader text', () => {
      render(<LoadingSpinner />);

      const srText = screen.getByText('Loading...');
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass('sr-only');
    });

    it('renders as a div element', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner.tagName).toBe('DIV');
    });

    it('contains a span element with screen reader text', () => {
      render(<LoadingSpinner />);

      const span = screen.getByText('Loading...');
      expect(span.tagName).toBe('SPAN');
    });
  });

  describe('Size Variants', () => {
    it('renders small size variant correctly', () => {
      render(<LoadingSpinner size="sm" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-4', 'w-4', 'border-2');
    });

    it('renders medium size variant correctly', () => {
      render(<LoadingSpinner size="md" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-6', 'w-6', 'border-2');
    });

    it('renders large size variant correctly', () => {
      render(<LoadingSpinner size="lg" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-8', 'w-8', 'border-2');
    });

    it('uses medium size as default when size prop is not provided', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-6', 'w-6', 'border-2');
    });

    it('applies correct border width for all sizes', () => {
      const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];

      sizes.forEach(size => {
        const { unmount } = render(<LoadingSpinner size={size} />);
        const spinner = screen.getByRole('status');
        expect(spinner).toHaveClass('border-2');
        unmount();
      });
    });
  });

  describe('Color Styling (#693BF2)', () => {
    it('applies the correct primary color (#693BF2)', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('border-[#693BF2]');
    });

    it('applies transparent border-top for animation effect', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('border-t-transparent');
    });

    it('applies solid border style', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('border-solid');
    });

    it('maintains color consistency across all sizes', () => {
      const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];

      sizes.forEach(size => {
        const { unmount } = render(<LoadingSpinner size={size} />);
        const spinner = screen.getByRole('status');
        expect(spinner).toHaveClass('border-[#693BF2]', 'border-t-transparent', 'border-solid');
        unmount();
      });
    });
  });

  describe('Accessibility Features', () => {
    it('has correct ARIA role for screen readers', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('role', 'status');
    });

    it('has descriptive aria-label', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('contains screen reader only text', () => {
      render(<LoadingSpinner />);

      const srText = screen.getByText('Loading...');
      expect(srText).toHaveClass('sr-only');
    });

    it('is discoverable by screen readers using getByLabelText', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByLabelText('Loading');
      expect(spinner).toBeInTheDocument();
    });

    it('provides appropriate semantic meaning with role="status"', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('role', 'status');
    });

    it('maintains accessibility across all size variants', () => {
      const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];

      sizes.forEach(size => {
        const { unmount } = render(<LoadingSpinner size={size} />);
        const spinner = screen.getByRole('status');
        expect(spinner).toHaveAttribute('aria-label', 'Loading');
        expect(screen.getByText('Loading...')).toHaveClass('sr-only');
        unmount();
      });
    });
  });

  describe('Animation Classes', () => {
    it('applies spin animation class', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('animate-spin');
    });

    it('applies rounded-full class for circular shape', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('rounded-full');
    });

    it('maintains animation classes across all sizes', () => {
      const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];

      sizes.forEach(size => {
        const { unmount } = render(<LoadingSpinner size={size} />);
        const spinner = screen.getByRole('status');
        expect(spinner).toHaveClass('animate-spin', 'rounded-full');
        unmount();
      });
    });

    it('combines animation with border styles correctly', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass(
        'animate-spin',
        'rounded-full',
        'border-solid',
        'border-[#693BF2]',
        'border-t-transparent'
      );
    });
  });

  describe('Custom className Application', () => {
    it('applies custom className when provided', () => {
      const customClass = 'custom-spinner-class';
      render(<LoadingSpinner className={customClass} />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass(customClass);
    });

    it('merges custom className with default classes', () => {
      const customClass = 'opacity-50';
      render(<LoadingSpinner className={customClass} />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass(customClass);
      expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'border-[#693BF2]');
    });

    it('handles multiple custom classes', () => {
      const customClasses = 'opacity-50 ml-4 mr-2';
      render(<LoadingSpinner className={customClasses} />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('opacity-50', 'ml-4', 'mr-2');
    });

    it('combines custom className with different sizes', () => {
      const customClass = 'my-4';

      // Test small size with custom class
      const { unmount: unmountSm } = render(<LoadingSpinner size="sm" className={customClass} />);
      let spinner = screen.getByRole('status');
      expect(spinner).toHaveClass(customClass, 'h-4', 'w-4');
      unmountSm();

      // Test large size with custom class
      const { unmount: unmountLg } = render(<LoadingSpinner size="lg" className={customClass} />);
      spinner = screen.getByRole('status');
      expect(spinner).toHaveClass(customClass, 'h-8', 'w-8');
      unmountLg();
    });

    it('handles empty className gracefully', () => {
      render(<LoadingSpinner className="" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin', 'rounded-full');
    });

    it('handles undefined className gracefully', () => {
      render(<LoadingSpinner className={undefined} />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin', 'rounded-full');
    });
  });

  describe('Component Props Integration', () => {
    it('combines size and className props correctly', () => {
      render(<LoadingSpinner size="lg" className="opacity-75 mx-auto" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass(
        'h-8',
        'w-8',
        'border-2',
        'opacity-75',
        'mx-auto',
        'animate-spin',
        'rounded-full',
        'border-[#693BF2]'
      );
    });

    it('maintains all essential classes regardless of prop combinations', () => {
      const testCases = [
        { size: 'sm' as const, className: 'test-class' },
        { size: 'md' as const, className: 'another-class' },
        { size: 'lg' as const, className: 'final-class' },
        { size: undefined, className: 'no-size-class' },
        { size: 'md' as const, className: undefined },
      ];

      testCases.forEach(({ size, className }) => {
        const { unmount } = render(<LoadingSpinner size={size} className={className} />);

        const spinner = screen.getByRole('status');
        expect(spinner).toHaveClass(
          'animate-spin',
          'rounded-full',
          'border-solid',
          'border-[#693BF2]',
          'border-t-transparent'
        );

        unmount();
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles rapid re-renders without breaking', () => {
      const { rerender } = render(<LoadingSpinner size="sm" />);

      for (let i = 0; i < 10; i++) {
        const size = ['sm', 'md', 'lg'][i % 3] as 'sm' | 'md' | 'lg';
        rerender(<LoadingSpinner size={size} />);

        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveClass('animate-spin');
      }
    });

    it('maintains structure with complex className combinations', () => {
      const complexClassName = 'opacity-50 transform scale-110 hover:opacity-75 transition-all duration-200';
      render(<LoadingSpinner className={complexClassName} />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('role', 'status');
      expect(spinner).toHaveClass('animate-spin', 'border-[#693BF2]');
    });
  });

  describe('TypeScript Type Safety', () => {
    it('accepts only valid size values', () => {
      // These should compile without TypeScript errors
      render(<LoadingSpinner size="sm" />);
      render(<LoadingSpinner size="md" />);
      render(<LoadingSpinner size="lg" />);
      render(<LoadingSpinner />);

      // Verify the rendered components
      expect(screen.getAllByRole('status')).toHaveLength(4);
    });

    it('accepts string className prop', () => {
      render(<LoadingSpinner className="test-class" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('test-class');
    });
  });
});