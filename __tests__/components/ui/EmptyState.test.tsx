import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmptyState, EmptyPostsIllustration, EmptyMarketplaceIllustration } from '@/components/ui/EmptyState';

// Mock the Button component
jest.mock('@/components/core', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

describe('EmptyState', () => {
  const defaultProps = {
    title: 'No data found',
  };

  it('renders with minimal required props', () => {
    render(<EmptyState {...defaultProps} />);

    expect(screen.getByText('No data found')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'No data found' })).toBeInTheDocument();
  });

  it('renders default emoji icon', () => {
    render(<EmptyState {...defaultProps} />);

    const iconElement = screen.getByRole('img', { name: 'No data found' });
    expect(iconElement).toHaveTextContent('📝');
    expect(iconElement).toHaveClass('text-6xl', 'mb-4');
  });

  it('renders custom string icon', () => {
    render(<EmptyState {...defaultProps} icon="🚫" />);

    const iconElement = screen.getByRole('img', { name: 'No data found' });
    expect(iconElement).toHaveTextContent('🚫');
  });

  it('renders ReactNode icon', () => {
    const CustomIcon = () => <div data-testid="custom-icon">Custom</div>;
    render(<EmptyState {...defaultProps} icon={<CustomIcon />} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders title with correct styling and #293341 color', () => {
    render(<EmptyState {...defaultProps} />);

    const title = screen.getByText('No data found');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H3');
    expect(title).toHaveClass('text-lg', 'font-medium', 'text-[#293341]', 'mb-2');

    // Test computed styles for color
    const computedStyle = window.getComputedStyle(title);
    expect(title).toHaveClass('text-[#293341]');
  });

  it('renders description when provided with #6A7685 color', () => {
    const description = 'This is a detailed description of the empty state.';
    render(<EmptyState {...defaultProps} description={description} />);

    const descElement = screen.getByText(description);
    expect(descElement).toBeInTheDocument();
    expect(descElement.tagName).toBe('P');
    expect(descElement).toHaveClass('text-[#6A7685]', 'text-sm', 'leading-relaxed', 'max-w-sm', 'mb-6');

    // Test that description color class is applied
    expect(descElement).toHaveClass('text-[#6A7685]');
  });

  it('does not render description when not provided', () => {
    render(<EmptyState {...defaultProps} />);

    expect(screen.queryByText(/detailed description/)).not.toBeInTheDocument();
  });

  it('renders action button with primary style when provided', () => {
    const actionLabel = 'Take Action';
    const onAction = jest.fn();

    render(
      <EmptyState
        {...defaultProps}
        actionLabel={actionLabel}
        onAction={onAction}
      />
    );

    const button = screen.getByRole('button', { name: actionLabel });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('mt-2');

    // Test that button text content is correct
    expect(button).toHaveTextContent(actionLabel);
  });

  it('calls onAction when action button is clicked', () => {
    const actionLabel = 'Take Action';
    const onAction = jest.fn();

    render(
      <EmptyState
        {...defaultProps}
        actionLabel={actionLabel}
        onAction={onAction}
      />
    );

    const button = screen.getByRole('button', { name: actionLabel });
    fireEvent.click(button);

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when actionLabel is provided but onAction is not', () => {
    render(
      <EmptyState
        {...defaultProps}
        actionLabel="Take Action"
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not render action button when onAction is provided but actionLabel is not', () => {
    render(
      <EmptyState
        {...defaultProps}
        onAction={jest.fn()}
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<EmptyState {...defaultProps} className="custom-empty-state" />);

    const container = screen.getByText('No data found').closest('div');
    expect(container).toHaveClass('custom-empty-state');
  });

  it('combines custom className with default classes', () => {
    render(<EmptyState {...defaultProps} className="bg-red-100" />);

    const container = screen.getByText('No data found').closest('div');
    expect(container).toHaveClass('bg-red-100', 'flex', 'flex-col', 'items-center', 'justify-center');
  });

  it('has proper layout structure', () => {
    render(
      <EmptyState
        {...defaultProps}
        description="Test description"
        actionLabel="Test Action"
        onAction={jest.fn()}
      />
    );

    const container = screen.getByText('No data found').closest('div');
    expect(container).toHaveClass(
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'py-12',
      'px-6',
      'text-center'
    );
  });

  it('renders all elements with full props', () => {
    const fullProps = {
      icon: '🎯',
      title: 'Complete Title',
      description: 'Complete description text',
      actionLabel: 'Complete Action',
      onAction: jest.fn(),
      className: 'complete-class',
    };

    render(<EmptyState {...fullProps} />);

    expect(screen.getByRole('img', { name: 'Complete Title' })).toHaveTextContent('🎯');
    expect(screen.getByText('Complete Title')).toBeInTheDocument();
    expect(screen.getByText('Complete description text')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Complete Action' })).toBeInTheDocument();

    const container = screen.getByText('Complete Title').closest('div');
    expect(container).toHaveClass('complete-class');
  });

  it('has proper accessibility attributes for string icons', () => {
    render(<EmptyState {...defaultProps} icon="🔍" />);

    const iconElement = screen.getByRole('img', { name: 'No data found' });
    expect(iconElement).toHaveAttribute('role', 'img');
    expect(iconElement).toHaveAttribute('aria-label', 'No data found');
  });

  it('maintains icon structure for React Node icons', () => {
    const CustomIcon = () => <span data-testid="react-icon">React Icon</span>;
    render(<EmptyState {...defaultProps} icon={<CustomIcon />} />);

    const iconContainer = screen.getByTestId('react-icon').closest('div');
    expect(iconContainer).toHaveClass('mb-4');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders with proper semantic structure', () => {
    render(
      <EmptyState
        {...defaultProps}
        description="Semantic test description"
        actionLabel="Semantic Action"
        onAction={jest.fn()}
      />
    );

    // Check semantic HTML structure
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toHaveTextContent('No data found');

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Semantic Action');
  });

  it('conditionally renders description based on props', () => {
    const { rerender } = render(<EmptyState {...defaultProps} />);

    // Initially no description
    expect(screen.queryByText(/description/)).not.toBeInTheDocument();

    // Add description
    rerender(<EmptyState {...defaultProps} description="Added description" />);
    expect(screen.getByText('Added description')).toBeInTheDocument();

    // Remove description
    rerender(<EmptyState {...defaultProps} description={undefined} />);
    expect(screen.queryByText('Added description')).not.toBeInTheDocument();
  });

  it('conditionally renders action button based on both actionLabel and onAction props', () => {
    const { rerender } = render(<EmptyState {...defaultProps} />);

    // Initially no button
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    // Add only actionLabel (should not render)
    rerender(<EmptyState {...defaultProps} actionLabel="Test Action" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    // Add both actionLabel and onAction (should render)
    rerender(<EmptyState {...defaultProps} actionLabel="Test Action" onAction={jest.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    // Remove actionLabel (should not render)
    rerender(<EmptyState {...defaultProps} onAction={jest.fn()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('EmptyPostsIllustration', () => {
  it('renders SVG illustration with correct attributes', () => {
    const { container } = render(<EmptyPostsIllustration />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '80');
    expect(svg).toHaveAttribute('height', '80');
    expect(svg).toHaveAttribute('viewBox', '0 0 80 80');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveClass('text-[#EFF1F5]');
  });

  it('contains proper SVG elements with correct properties', () => {
    const { container } = render(<EmptyPostsIllustration />);

    // Check main container rect
    const mainRect = container.querySelector('rect[x="12"][y="20"]');
    expect(mainRect).toBeInTheDocument();
    expect(mainRect).toHaveAttribute('width', '56');
    expect(mainRect).toHaveAttribute('height', '40');
    expect(mainRect).toHaveAttribute('rx', '4');
    expect(mainRect).toHaveAttribute('fill', 'currentColor');
    expect(mainRect).toHaveAttribute('stroke', '#C7CED6');
    expect(mainRect).toHaveAttribute('stroke-width', '2');

    // Check text line rects
    const textRects = container.querySelectorAll('rect[fill="#C7CED6"]');
    expect(textRects).toHaveLength(4);

    // Check first text line
    const firstLine = container.querySelector('rect[x="20"][y="28"]');
    expect(firstLine).toHaveAttribute('width', '40');
    expect(firstLine).toHaveAttribute('height', '2');
    expect(firstLine).toHaveAttribute('rx', '1');
  });

  it('has correct styling and layout structure', () => {
    const { container } = render(<EmptyPostsIllustration />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('text-[#EFF1F5]');

    // Verify all rect elements are present
    const allRects = container.querySelectorAll('rect');
    expect(allRects).toHaveLength(5); // 1 main container + 4 text lines
  });

  it('renders as SVG with proper structure for accessibility', () => {
    const { container } = render(<EmptyPostsIllustration />);

    const svg = container.querySelector('svg');
    expect(svg?.tagName).toBe('svg');

    // SVG should contain vector elements for illustration
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(0);
  });

  it('uses consistent color scheme', () => {
    const { container } = render(<EmptyPostsIllustration />);

    // Check for stroke color consistency
    const strokedElements = container.querySelectorAll('[stroke="#C7CED6"]');
    expect(strokedElements.length).toBeGreaterThan(0);

    // Check for fill color consistency
    const filledElements = container.querySelectorAll('[fill="#C7CED6"]');
    expect(filledElements.length).toBeGreaterThan(0);
  });
});

describe('EmptyMarketplaceIllustration', () => {
  it('renders SVG illustration with correct attributes', () => {
    const { container } = render(<EmptyMarketplaceIllustration />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '80');
    expect(svg).toHaveAttribute('height', '80');
    expect(svg).toHaveAttribute('viewBox', '0 0 80 80');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveClass('text-[#EFF1F5]');
  });

  it('contains proper SVG elements with marketplace-specific styling', () => {
    const { container } = render(<EmptyMarketplaceIllustration />);

    // Check main container rect
    const mainRect = container.querySelector('rect[x="20"][y="30"]');
    expect(mainRect).toBeInTheDocument();
    expect(mainRect).toHaveAttribute('width', '40');
    expect(mainRect).toHaveAttribute('height', '30');
    expect(mainRect).toHaveAttribute('rx', '4');
    expect(mainRect).toHaveAttribute('fill', 'currentColor');
    expect(mainRect).toHaveAttribute('stroke', '#C7CED6');

    // Check circle element (product image placeholder)
    const circle = container.querySelector('circle');
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute('cx', '30');
    expect(circle).toHaveAttribute('cy', '42');
    expect(circle).toHaveAttribute('r', '4');
    expect(circle).toHaveAttribute('fill', '#C7CED6');

    // Check primary color element (price/action element)
    const primaryRect = container.querySelector('rect[fill="#693BF2"]');
    expect(primaryRect).toBeInTheDocument();
    expect(primaryRect).toHaveAttribute('x', '24');
    expect(primaryRect).toHaveAttribute('y', '52');
    expect(primaryRect).toHaveAttribute('width', '8');
    expect(primaryRect).toHaveAttribute('height', '2');
  });

  it('has correct element count and structure', () => {
    const { container } = render(<EmptyMarketplaceIllustration />);

    // Verify element counts
    const allRects = container.querySelectorAll('rect');
    const allCircles = container.querySelectorAll('circle');

    expect(allRects).toHaveLength(5); // 1 main container + 4 content rects
    expect(allCircles).toHaveLength(1); // 1 product image circle

    // Check for primary brand color usage
    const primaryColorElements = container.querySelectorAll('[fill="#693BF2"]');
    expect(primaryColorElements).toHaveLength(1);

    // Check for neutral color usage
    const neutralColorElements = container.querySelectorAll('[fill="#C7CED6"]');
    expect(neutralColorElements.length).toBeGreaterThan(0);
  });

  it('maintains consistent styling with posts illustration', () => {
    const { container: marketplaceContainer } = render(<EmptyMarketplaceIllustration />);
    const { container: postsContainer } = render(<EmptyPostsIllustration />);

    const marketplaceSvg = marketplaceContainer.querySelector('svg');
    const postsSvg = postsContainer.querySelector('svg');

    // Both should have same class and dimensions
    expect(marketplaceSvg).toHaveClass('text-[#EFF1F5]');
    expect(postsSvg).toHaveClass('text-[#EFF1F5]');
    expect(marketplaceSvg).toHaveAttribute('width', '80');
    expect(postsSvg).toHaveAttribute('width', '80');
  });

  it('renders as SVG with proper structure for accessibility', () => {
    const { container } = render(<EmptyMarketplaceIllustration />);

    const svg = container.querySelector('svg');
    expect(svg?.tagName).toBe('svg');

    // SVG should contain vector elements for illustration
    const rects = container.querySelectorAll('rect');
    const circles = container.querySelectorAll('circle');
    expect(rects.length).toBeGreaterThan(0);
    expect(circles.length).toBeGreaterThan(0);
  });

  it('uses brand-specific colors for marketplace elements', () => {
    const { container } = render(<EmptyMarketplaceIllustration />);

    // Check that marketplace illustration uses the primary brand color
    const brandColorElements = container.querySelectorAll('[fill="#693BF2"]');
    expect(brandColorElements).toHaveLength(1);

    // Verify this color is used appropriately for call-to-action elements
    const brandElement = brandColorElements[0];
    expect(brandElement).toHaveAttribute('x', '24');
    expect(brandElement).toHaveAttribute('y', '52');
  });
});