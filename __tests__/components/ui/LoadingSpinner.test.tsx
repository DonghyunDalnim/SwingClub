import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders screen reader text', () => {
    render(<LoadingSpinner />);

    const srText = screen.getByText('Loading...');
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass('sr-only');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    let spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-4', 'w-4', 'border-2');

    rerender(<LoadingSpinner size="md" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-6', 'w-6', 'border-2');

    rerender(<LoadingSpinner size="lg" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-8', 'w-8', 'border-2');
  });

  it('applies default medium size when size prop is not provided', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-6', 'w-6', 'border-2');
  });

  it('applies primary color border', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('border-[#693BF2]');
  });

  it('applies animation classes', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('animate-spin', 'rounded-full');
  });

  it('applies transparent top border for spinning effect', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('border-t-transparent');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-spinner" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('custom-spinner');
  });

  it('combines custom className with default classes', () => {
    render(<LoadingSpinner className="my-4" size="lg" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('my-4', 'h-8', 'w-8', 'animate-spin');
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('role', 'status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('maintains structural integrity with all size variants', () => {
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];

    sizes.forEach(size => {
      const { unmount } = render(<LoadingSpinner size={size} />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'border-solid');

      unmount();
    });
  });
});