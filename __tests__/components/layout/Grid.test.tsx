import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Grid, CategoryGrid } from '@/components/layout/Grid';

describe('Grid Component', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <Grid>
          <div>Grid item 1</div>
          <div>Grid item 2</div>
        </Grid>
      );

      expect(screen.getByText('Grid item 1')).toBeInTheDocument();
      expect(screen.getByText('Grid item 2')).toBeInTheDocument();
    });

    it('renders with correct div tag', () => {
      const { container } = render(
        <Grid>Test content</Grid>
      );

      expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
      expect(container.firstChild).toHaveClass('grid');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Grid ref={ref}>Test content</Grid>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Cols Prop', () => {
    it('applies default cols (auto-fit)', () => {
      const { container } = render(
        <Grid>Test content</Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-[repeat(auto-fit,minmax(200px,1fr))]');
    });

    it('applies numeric cols without responsive', () => {
      const { container } = render(
        <Grid cols={3} responsive={false}>Test content</Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-3');
    });

    it('applies numeric cols with responsive (default)', () => {
      const { container } = render(
        <Grid cols={4}>Test content</Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass(
        'grid-cols-1',
        'sm:grid-cols-2',
        'md:grid-cols-3',
        'lg:grid-cols-4'
      );
    });

    it('applies cols=1 with responsive', () => {
      const { container } = render(
        <Grid cols={1}>Test content</Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass(
        'grid-cols-1',
        'sm:grid-cols-2',
        'md:grid-cols-1',
        'lg:grid-cols-1'
      );
    });

    it('applies cols=2 with responsive', () => {
      const { container } = render(
        <Grid cols={2}>Test content</Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass(
        'grid-cols-1',
        'sm:grid-cols-2',
        'md:grid-cols-2',
        'lg:grid-cols-2'
      );
    });

    it('applies cols=5 with responsive', () => {
      const { container } = render(
        <Grid cols={5}>Test content</Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass(
        'grid-cols-1',
        'sm:grid-cols-2',
        'md:grid-cols-3',
        'lg:grid-cols-5'
      );
    });

    it('applies cols=6 with responsive', () => {
      const { container } = render(
        <Grid cols={6}>Test content</Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass(
        'grid-cols-1',
        'sm:grid-cols-2',
        'md:grid-cols-3',
        'lg:grid-cols-6'
      );
    });

    it('applies auto-fit cols', () => {
      const { container } = render(
        <Grid cols="auto-fit">Test content</Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-[repeat(auto-fit,minmax(200px,1fr))]');
    });

    it('applies auto-fill cols', () => {
      const { container } = render(
        <Grid cols="auto-fill">Test content</Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-[repeat(auto-fill,minmax(200px,1fr))]');
    });
  });

  describe('Gap Prop', () => {
    it('applies default gap (md)', () => {
      const { container } = render(
        <Grid>Test content</Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('gap-4');
    });

    it('applies none gap', () => {
      const { container } = render(
        <Grid gap="none">Test content</Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('gap-0');
    });

    it('applies sm gap', () => {
      const { container } = render(
        <Grid gap="sm">Test content</Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('gap-2');
    });

    it('applies md gap', () => {
      const { container } = render(
        <Grid gap="md">Test content</Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('gap-4');
    });

    it('applies lg gap', () => {
      const { container } = render(
        <Grid gap="lg">Test content</Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('gap-6');
    });

    it('applies xl gap', () => {
      const { container } = render(
        <Grid gap="xl">Test content</Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('gap-8');
    });
  });

  describe('Responsive Prop', () => {
    it('applies responsive classes when responsive=true (default)', () => {
      const { container } = render(
        <Grid cols={3}>Test content</Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass(
        'grid-cols-1',
        'sm:grid-cols-2',
        'md:grid-cols-3',
        'lg:grid-cols-3'
      );
    });

    it('applies non-responsive classes when responsive=false', () => {
      const { container } = render(
        <Grid cols={3} responsive={false}>Test content</Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-3');
      expect(grid).not.toHaveClass('grid-cols-1', 'sm:grid-cols-2');
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <Grid className="custom-grid-class">Test content</Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('custom-grid-class');
    });

    it('passes through other HTML attributes', () => {
      const { container } = render(
        <Grid data-testid="grid-test" id="grid-id">
          Test content
        </Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveAttribute('data-testid', 'grid-test');
      expect(grid).toHaveAttribute('id', 'grid-id');
    });
  });

  describe('Complex Combinations', () => {
    it('combines all props correctly', () => {
      const { container } = render(
        <Grid
          cols={4}
          gap="lg"
          responsive={true}
          className="complex-grid"
        >
          <div>Item 1</div>
          <div>Item 2</div>
        </Grid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass(
        'grid',
        'grid-cols-1',
        'sm:grid-cols-2',
        'md:grid-cols-3',
        'lg:grid-cols-4',
        'gap-6',
        'complex-grid'
      );
    });
  });
});

describe('CategoryGrid Component', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <CategoryGrid>
          <div>Category 1</div>
          <div>Category 2</div>
        </CategoryGrid>
      );

      expect(screen.getByText('Category 1')).toBeInTheDocument();
      expect(screen.getByText('Category 2')).toBeInTheDocument();
    });

    it('renders with correct div tag and grid classes', () => {
      const { container } = render(
        <CategoryGrid>Test content</CategoryGrid>
      );

      expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
      expect(container.firstChild).toHaveClass('grid');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <CategoryGrid ref={ref}>Test content</CategoryGrid>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('MinItemWidth Prop - 숨고 표준 (최소 80px)', () => {
    it('applies default minItemWidth (80px)', () => {
      const { container } = render(
        <CategoryGrid>Test content</CategoryGrid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-[repeat(auto-fit,minmax(80px,1fr))]');
    });

    it('applies custom minItemWidth', () => {
      const { container } = render(
        <CategoryGrid minItemWidth={120}>Test content</CategoryGrid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-[repeat(auto-fit,minmax(120px,1fr))]');
    });

    it('applies minItemWidth with responsive=false', () => {
      const { container } = render(
        <CategoryGrid minItemWidth={100} responsive={false}>
          Test content
        </CategoryGrid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-[repeat(auto-fill,minmax(100px,1fr))]');
    });
  });

  describe('Gap Prop - 숨고 표준 (12px 간격)', () => {
    it('applies default gap (sm = 12px)', () => {
      const { container } = render(
        <CategoryGrid>Test content</CategoryGrid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('gap-3');
    });

    it('applies none gap', () => {
      const { container } = render(
        <CategoryGrid gap="none">Test content</CategoryGrid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('gap-0');
    });

    it('applies sm gap (12px)', () => {
      const { container } = render(
        <CategoryGrid gap="sm">Test content</CategoryGrid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('gap-3');
    });

    it('applies md gap', () => {
      const { container } = render(
        <CategoryGrid gap="md">Test content</CategoryGrid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('gap-4');
    });

    it('applies lg gap', () => {
      const { container } = render(
        <CategoryGrid gap="lg">Test content</CategoryGrid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('gap-6');
    });

    it('applies xl gap', () => {
      const { container } = render(
        <CategoryGrid gap="xl">Test content</CategoryGrid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('gap-8');
    });
  });

  describe('Responsive Prop', () => {
    it('applies auto-fit when responsive=true (default)', () => {
      const { container } = render(
        <CategoryGrid minItemWidth={100}>Test content</CategoryGrid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-[repeat(auto-fit,minmax(100px,1fr))]');
    });

    it('applies auto-fill when responsive=false', () => {
      const { container } = render(
        <CategoryGrid minItemWidth={100} responsive={false}>
          Test content
        </CategoryGrid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-[repeat(auto-fill,minmax(100px,1fr))]');
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <CategoryGrid className="custom-category-class">
          Test content
        </CategoryGrid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('custom-category-class');
    });

    it('passes through other HTML attributes', () => {
      const { container } = render(
        <CategoryGrid data-testid="category-test" role="grid">
          Test content
        </CategoryGrid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveAttribute('data-testid', 'category-test');
      expect(grid).toHaveAttribute('role', 'grid');
    });
  });

  describe('Soomgo Standard Pattern Compliance', () => {
    it('meets Soomgo standards: auto-fit, 80px minimum, 12px gap', () => {
      const { container } = render(
        <CategoryGrid>
          <div>Category Item</div>
        </CategoryGrid>
      );

      const grid = container.firstChild as HTMLElement;

      // auto-fit pattern
      expect(grid).toHaveClass('grid-cols-[repeat(auto-fit,minmax(80px,1fr))]');

      // 12px gap (gap-3 in Tailwind)
      expect(grid).toHaveClass('gap-3');

      // responsive by default
      expect(grid).toHaveClass('grid');
    });

    it('allows customization while maintaining pattern integrity', () => {
      const { container } = render(
        <CategoryGrid minItemWidth={120} gap="md">
          <div>Custom Item</div>
        </CategoryGrid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-[repeat(auto-fit,minmax(120px,1fr))]');
      expect(grid).toHaveClass('gap-4');
    });
  });

  describe('Complex Combinations', () => {
    it('combines all props correctly', () => {
      const { container } = render(
        <CategoryGrid
          minItemWidth={150}
          gap="lg"
          responsive={false}
          className="complex-category-grid"
        >
          <div>Item 1</div>
          <div>Item 2</div>
        </CategoryGrid>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass(
        'grid',
        'grid-cols-[repeat(auto-fill,minmax(150px,1fr))]',
        'gap-6',
        'complex-category-grid'
      );
    });
  });

  describe('Accessibility', () => {
    it('supports ARIA attributes for grid semantics', () => {
      render(
        <CategoryGrid role="grid" aria-label="Category selection grid">
          <div role="gridcell">Category 1</div>
          <div role="gridcell">Category 2</div>
        </CategoryGrid>
      );

      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveAttribute('aria-label', 'Category selection grid');
      expect(screen.getAllByRole('gridcell')).toHaveLength(2);
    });
  });
});