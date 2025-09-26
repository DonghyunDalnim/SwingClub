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

  it('renders title with correct styling', () => {
    render(<EmptyState {...defaultProps} />);

    const title = screen.getByText('No data found');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H3');
    expect(title).toHaveClass('text-lg', 'font-medium', 'text-[#293341]', 'mb-2');
  });

  it('renders description when provided', () => {
    const description = 'This is a detailed description of the empty state.';
    render(<EmptyState {...defaultProps} description={description} />);

    const descElement = screen.getByText(description);
    expect(descElement).toBeInTheDocument();
    expect(descElement.tagName).toBe('P');
    expect(descElement).toHaveClass('text-[#6A7685]', 'text-sm', 'leading-relaxed', 'max-w-sm', 'mb-6');
  });

  it('does not render description when not provided', () => {
    render(<EmptyState {...defaultProps} />);

    expect(screen.queryByText(/detailed description/)).not.toBeInTheDocument();
  });

  it('renders action button when provided', () => {
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
});

describe('EmptyPostsIllustration', () => {
  it('renders SVG illustration', () => {
    render(<EmptyPostsIllustration />);

    const svg = screen.getByText('', { selector: 'svg' });
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '80');
    expect(svg).toHaveAttribute('height', '80');
    expect(svg).toHaveClass('text-[#EFF1F5]');
  });

  it('contains proper SVG elements', () => {
    render(<EmptyPostsIllustration />);

    const rects = screen.getAllByText('', { selector: 'rect' });
    expect(rects.length).toBeGreaterThan(0);
  });
});

describe('EmptyMarketplaceIllustration', () => {
  it('renders SVG illustration', () => {
    render(<EmptyMarketplaceIllustration />);

    const svg = screen.getByText('', { selector: 'svg' });
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '80');
    expect(svg).toHaveAttribute('height', '80');
    expect(svg).toHaveClass('text-[#EFF1F5]');
  });

  it('contains proper SVG elements', () => {
    render(<EmptyMarketplaceIllustration />);

    const rects = screen.getAllByText('', { selector: 'rect' });
    const circles = screen.getAllByText('', { selector: 'circle' });
    expect(rects.length).toBeGreaterThan(0);
    expect(circles.length).toBeGreaterThan(0);
  });
});