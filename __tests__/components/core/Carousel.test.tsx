import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Carousel, CarouselItem } from '@/components/core/Carousel';

describe('Carousel Component', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <Carousel>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Carousel>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('renders with correct div tag and base classes', () => {
      const { container } = render(
        <Carousel>
          <div>Test item</div>
        </Carousel>
      );

      expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
      expect(container.firstChild).toHaveClass('flex');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Carousel ref={ref}>
          <div>Test content</div>
        </Carousel>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('wraps each child in proper container with flex-shrink-0', () => {
      const { container } = render(
        <Carousel>
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>
      );

      const wrappers = container.querySelectorAll('.flex-shrink-0');
      expect(wrappers).toHaveLength(2);
    });
  });

  describe('Gap Prop - 숨고 표준 (16px 간격)', () => {
    it('applies default gap (md = 16px)', () => {
      const { container } = render(
        <Carousel>
          <div>Item 1</div>
        </Carousel>
      );

      const carousel = container.firstChild as HTMLElement;
      expect(carousel).toHaveClass('gap-4'); // gap-4 = 16px in Tailwind
    });

    it('applies none gap', () => {
      const { container } = render(
        <Carousel gap="none">
          <div>Item 1</div>
        </Carousel>
      );

      const carousel = container.firstChild as HTMLElement;
      expect(carousel).toHaveClass('gap-0');
    });

    it('applies sm gap', () => {
      const { container } = render(
        <Carousel gap="sm">
          <div>Item 1</div>
        </Carousel>
      );

      const carousel = container.firstChild as HTMLElement;
      expect(carousel).toHaveClass('gap-2');
    });

    it('applies md gap (16px - 숨고 표준)', () => {
      const { container } = render(
        <Carousel gap="md">
          <div>Item 1</div>
        </Carousel>
      );

      const carousel = container.firstChild as HTMLElement;
      expect(carousel).toHaveClass('gap-4');
    });

    it('applies lg gap', () => {
      const { container } = render(
        <Carousel gap="lg">
          <div>Item 1</div>
        </Carousel>
      );

      const carousel = container.firstChild as HTMLElement;
      expect(carousel).toHaveClass('gap-6');
    });

    it('applies xl gap', () => {
      const { container } = render(
        <Carousel gap="xl">
          <div>Item 1</div>
        </Carousel>
      );

      const carousel = container.firstChild as HTMLElement;
      expect(carousel).toHaveClass('gap-8');
    });
  });

  describe('Scrollable Prop', () => {
    it('applies scrollable classes by default (scrollable=true)', () => {
      const { container } = render(
        <Carousel>
          <div>Item 1</div>
        </Carousel>
      );

      const carousel = container.firstChild as HTMLElement;
      expect(carousel).toHaveClass(
        'overflow-x-auto',
        'snap-x',
        'snap-mandatory'
      );
    });

    it('applies snap-start to wrapped children when scrollable', () => {
      const { container } = render(
        <Carousel scrollable={true}>
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>
      );

      const wrappers = container.querySelectorAll('.snap-start');
      expect(wrappers).toHaveLength(2);
    });

    it('does not apply scrollable classes when scrollable=false', () => {
      const { container } = render(
        <Carousel scrollable={false}>
          <div>Item 1</div>
        </Carousel>
      );

      const carousel = container.firstChild as HTMLElement;
      expect(carousel).not.toHaveClass(
        'overflow-x-auto',
        'snap-x',
        'snap-mandatory'
      );
    });

    it('does not apply snap-start when scrollable=false', () => {
      const { container } = render(
        <Carousel scrollable={false}>
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>
      );

      const wrappers = container.querySelectorAll('.snap-start');
      expect(wrappers).toHaveLength(0);
    });
  });

  describe('ShowScrollbar Prop', () => {
    it('hides scrollbar by default (showScrollbar=false)', () => {
      const { container } = render(
        <Carousel>
          <div>Item 1</div>
        </Carousel>
      );

      const carousel = container.firstChild as HTMLElement;
      expect(carousel).toHaveClass('scrollbar-hide');
    });

    it('hides scrollbar when showScrollbar=false explicitly', () => {
      const { container } = render(
        <Carousel showScrollbar={false}>
          <div>Item 1</div>
        </Carousel>
      );

      const carousel = container.firstChild as HTMLElement;
      expect(carousel).toHaveClass('scrollbar-hide');
    });

    it('shows scrollbar when showScrollbar=true', () => {
      const { container } = render(
        <Carousel showScrollbar={true}>
          <div>Item 1</div>
        </Carousel>
      );

      const carousel = container.firstChild as HTMLElement;
      expect(carousel).not.toHaveClass('scrollbar-hide');
    });

    it('does not apply scrollbar-hide when scrollable=false', () => {
      const { container } = render(
        <Carousel scrollable={false} showScrollbar={false}>
          <div>Item 1</div>
        </Carousel>
      );

      const carousel = container.firstChild as HTMLElement;
      expect(carousel).not.toHaveClass('scrollbar-hide');
    });
  });

  describe('Flex Layout - 숨고 표준 (Flex 레이아웃)', () => {
    it('applies flex layout as base', () => {
      const { container } = render(
        <Carousel>
          <div>Item 1</div>
        </Carousel>
      );

      const carousel = container.firstChild as HTMLElement;
      expect(carousel).toHaveClass('flex');
    });

    it('ensures all children are wrapped with flex-shrink-0', () => {
      const { container } = render(
        <Carousel>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
          <div>Item 4</div>
        </Carousel>
      );

      const wrappers = container.querySelectorAll('.flex-shrink-0');
      expect(wrappers).toHaveLength(4);

      // Check that each original child is inside a wrapper
      expect(screen.getByText('Item 1').parentElement).toHaveClass('flex-shrink-0');
      expect(screen.getByText('Item 2').parentElement).toHaveClass('flex-shrink-0');
      expect(screen.getByText('Item 3').parentElement).toHaveClass('flex-shrink-0');
      expect(screen.getByText('Item 4').parentElement).toHaveClass('flex-shrink-0');
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <Carousel className="custom-carousel-class">
          <div>Item 1</div>
        </Carousel>
      );

      const carousel = container.firstChild as HTMLElement;
      expect(carousel).toHaveClass('custom-carousel-class');
    });

    it('passes through other HTML attributes', () => {
      const { container } = render(
        <Carousel data-testid="carousel-test" id="carousel-id">
          <div>Item 1</div>
        </Carousel>
      );

      const carousel = container.firstChild as HTMLElement;
      expect(carousel).toHaveAttribute('data-testid', 'carousel-test');
      expect(carousel).toHaveAttribute('id', 'carousel-id');
    });
  });

  describe('Soomgo Standard Pattern Compliance', () => {
    it('meets Soomgo standards: Flex layout, 16px gap', () => {
      const { container } = render(
        <Carousel>
          <div>Standard Item</div>
        </Carousel>
      );

      const carousel = container.firstChild as HTMLElement;

      // Flex 레이아웃
      expect(carousel).toHaveClass('flex');

      // 16px 간격 (gap-4)
      expect(carousel).toHaveClass('gap-4');

      // 스크롤 가능
      expect(carousel).toHaveClass('overflow-x-auto', 'snap-x', 'snap-mandatory');

      // 스크롤바 숨김
      expect(carousel).toHaveClass('scrollbar-hide');
    });
  });

  describe('Complex Combinations', () => {
    it('combines all props correctly', () => {
      const { container } = render(
        <Carousel
          gap="lg"
          scrollable={true}
          showScrollbar={true}
          className="complex-carousel"
        >
          <div>Item 1</div>
          <div>Item 2</div>
        </Carousel>
      );

      const carousel = container.firstChild as HTMLElement;
      expect(carousel).toHaveClass(
        'flex',
        'gap-6',
        'overflow-x-auto',
        'snap-x',
        'snap-mandatory',
        'complex-carousel'
      );
      expect(carousel).not.toHaveClass('scrollbar-hide');

      const wrappers = container.querySelectorAll('.flex-shrink-0.snap-start');
      expect(wrappers).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      const { container } = render(
        <Carousel></Carousel>
      );

      const carousel = container.firstChild as HTMLElement;
      expect(carousel).toHaveClass('flex');
      expect(carousel.children).toHaveLength(0);
    });

    it('handles single child', () => {
      const { container } = render(
        <Carousel>
          <div>Single Item</div>
        </Carousel>
      );

      expect(screen.getByText('Single Item')).toBeInTheDocument();
      const wrappers = container.querySelectorAll('.flex-shrink-0');
      expect(wrappers).toHaveLength(1);
    });

    it('handles mixed React elements', () => {
      render(
        <Carousel>
          <div>Div Item</div>
          <span>Span Item</span>
          <button>Button Item</button>
        </Carousel>
      );

      expect(screen.getByText('Div Item')).toBeInTheDocument();
      expect(screen.getByText('Span Item')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Button Item' })).toBeInTheDocument();
    });
  });
});

describe('CarouselItem Component', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <CarouselItem>
          <div>Item content</div>
        </CarouselItem>
      );

      expect(screen.getByText('Item content')).toBeInTheDocument();
    });

    it('renders with correct div tag and base classes', () => {
      const { container } = render(
        <CarouselItem>Content</CarouselItem>
      );

      expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
      expect(container.firstChild).toHaveClass('flex-shrink-0');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <CarouselItem ref={ref}>Content</CarouselItem>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Width Prop', () => {
    it('applies custom width', () => {
      const { container } = render(
        <CarouselItem width="200px">Content</CarouselItem>
      );

      const item = container.firstChild as HTMLElement;
      expect(item.style.width).toBe('200px');
    });

    it('applies width with different units', () => {
      const { container } = render(
        <CarouselItem width="50%">Content</CarouselItem>
      );

      const item = container.firstChild as HTMLElement;
      expect(item.style.width).toBe('50%');
    });

    it('works without width prop', () => {
      const { container } = render(
        <CarouselItem>Content</CarouselItem>
      );

      const item = container.firstChild as HTMLElement;
      expect(item.style.width).toBe('');
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <CarouselItem className="custom-item-class">
          Content
        </CarouselItem>
      );

      const item = container.firstChild as HTMLElement;
      expect(item).toHaveClass('custom-item-class', 'flex-shrink-0');
    });

    it('passes through other HTML attributes', () => {
      const { container } = render(
        <CarouselItem data-testid="item-test" id="item-id">
          Content
        </CarouselItem>
      );

      const item = container.firstChild as HTMLElement;
      expect(item).toHaveAttribute('data-testid', 'item-test');
      expect(item).toHaveAttribute('id', 'item-id');
    });

    it('handles custom style prop combined with width', () => {
      const { container } = render(
        <CarouselItem
          width="300px"
          style={{ backgroundColor: 'red', height: '100px' }}
        >
          Content
        </CarouselItem>
      );

      const item = container.firstChild as HTMLElement;
      expect(item.style.width).toBe('300px');
      expect(item.style.backgroundColor).toBe('red');
      expect(item.style.height).toBe('100px');
    });
  });

  describe('Integration with Carousel', () => {
    it('works correctly inside Carousel component', () => {
      const { container } = render(
        <Carousel>
          <CarouselItem width="250px">Item 1</CarouselItem>
          <CarouselItem width="300px">Item 2</CarouselItem>
          <CarouselItem>Item 3</CarouselItem>
        </Carousel>
      );

      // Should have both the wrapper from Carousel and CarouselItem
      const items = container.querySelectorAll('.flex-shrink-0');
      expect(items).toHaveLength(6); // 3 from Carousel wrapper + 3 from CarouselItem

      // Check specific widths
      const item1 = screen.getByText('Item 1');
      const item2 = screen.getByText('Item 2');
      const item3 = screen.getByText('Item 3');

      expect(item1.style.width).toBe('250px');
      expect(item2.style.width).toBe('300px');
      expect(item3.style.width).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('supports ARIA attributes', () => {
      render(
        <CarouselItem role="listitem" aria-label="Carousel item 1">
          <div>Item Content</div>
        </CarouselItem>
      );

      const item = screen.getByRole('listitem');
      expect(item).toBeInTheDocument();
      expect(item).toHaveAttribute('aria-label', 'Carousel item 1');
    });
  });

  describe('Complex Combinations', () => {
    it('combines all props correctly', () => {
      const { container } = render(
        <CarouselItem
          width="400px"
          className="complex-item"
          style={{ minHeight: '200px' }}
          data-index="0"
        >
          <div>Complex Content</div>
        </CarouselItem>
      );

      const item = container.firstChild as HTMLElement;
      expect(item).toHaveClass('flex-shrink-0', 'complex-item');
      expect(item.style.width).toBe('400px');
      expect(item.style.minHeight).toBe('200px');
      expect(item).toHaveAttribute('data-index', '0');
    });
  });
});