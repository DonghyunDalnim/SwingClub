import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SkeletonCard } from '@/components/ui/SkeletonCard';

describe('SkeletonCard', () => {
  it('renders with default post type', () => {
    render(<SkeletonCard />);

    const skeleton = screen.getByLabelText('Loading post');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('bg-white', 'border', 'border-[#EFF1F5]', 'rounded-xl', 'p-4', 'shadow-sm', 'space-y-4');
  });

  it('renders post type skeleton with correct structure', () => {
    render(<SkeletonCard type="post" />);

    const skeleton = screen.getByLabelText('Loading post');
    expect(skeleton).toBeInTheDocument();

    // Check for skeleton elements with animate-pulse
    const skeletonElements = within(skeleton).getAllByText('', { selector: '[class*="animate-pulse"]' });
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('renders marketplace-item type skeleton with correct structure', () => {
    render(<SkeletonCard type="marketplace-item" />);

    const skeleton = screen.getByLabelText('Loading marketplace item');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('bg-white', 'border', 'border-[#EFF1F5]', 'rounded-xl', 'p-4', 'shadow-sm');

    // Should contain flex layout structure
    const flexContainer = within(skeleton).getByText('', { selector: '.flex.space-x-4' });
    expect(flexContainer).toBeInTheDocument();
  });

  it('applies correct background color to skeleton elements', () => {
    render(<SkeletonCard />);

    const skeleton = screen.getByLabelText('Loading post');
    const skeletonBoxes = within(skeleton).getAllByText('', { selector: '[class*="bg-[#EFF1F5]"]' });
    expect(skeletonBoxes.length).toBeGreaterThan(0);
  });

  it('applies animate-pulse to skeleton elements', () => {
    render(<SkeletonCard />);

    const skeleton = screen.getByLabelText('Loading post');
    const animatedElements = within(skeleton).getAllByText('', { selector: '[class*="animate-pulse"]' });
    expect(animatedElements.length).toBeGreaterThan(0);
  });

  it('has proper accessibility attributes', () => {
    render(<SkeletonCard />);

    const skeleton = screen.getByLabelText('Loading post');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading post');

    const skeletonBoxes = within(skeleton).getAllByText('', { selector: '[aria-busy="true"]' });
    expect(skeletonBoxes.length).toBeGreaterThan(0);
  });

  it('marketplace-item has proper accessibility attributes', () => {
    render(<SkeletonCard type="marketplace-item" />);

    const skeleton = screen.getByLabelText('Loading marketplace item');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading marketplace item');
  });

  it('applies custom className', () => {
    render(<SkeletonCard className="custom-skeleton" />);

    const skeleton = screen.getByLabelText('Loading post');
    expect(skeleton).toHaveClass('custom-skeleton');
  });

  it('combines custom className with default classes', () => {
    render(<SkeletonCard className="my-4" type="marketplace-item" />);

    const skeleton = screen.getByLabelText('Loading marketplace item');
    expect(skeleton).toHaveClass('my-4', 'bg-white', 'border');
  });

  it('renders different structures for different types', () => {
    // Test post type structure
    const { unmount } = render(<SkeletonCard type="post" />);
    const postSkeleton = screen.getByLabelText('Loading post');
    expect(postSkeleton).toHaveClass('space-y-4');
    unmount();

    // Test marketplace-item type structure
    render(<SkeletonCard type="marketplace-item" />);
    const marketplaceSkeleton = screen.getByLabelText('Loading marketplace item');

    // Marketplace type should have flex space-x-4 (horizontal spacing)
    const flexContainer = within(marketplaceSkeleton).getByText('', { selector: '.flex.space-x-4' });
    expect(flexContainer).toBeInTheDocument();
  });

  it('maintains consistent styling across types', () => {
    const { rerender } = render(<SkeletonCard type="post" />);
    let skeleton = screen.getByLabelText('Loading post');
    expect(skeleton).toHaveClass('bg-white', 'border-[#EFF1F5]', 'rounded-xl', 'shadow-sm');

    rerender(<SkeletonCard type="marketplace-item" />);
    skeleton = screen.getByLabelText('Loading marketplace item');
    expect(skeleton).toHaveClass('bg-white', 'border-[#EFF1F5]', 'rounded-xl', 'shadow-sm');
  });

  it('skeleton elements have proper rounded corners', () => {
    render(<SkeletonCard />);

    const skeleton = screen.getByLabelText('Loading post');
    const roundedElements = within(skeleton).getAllByText('', { selector: '[class*="rounded"]' });
    expect(roundedElements.length).toBeGreaterThan(0);
  });
});