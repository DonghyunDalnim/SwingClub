import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Container,
  Section,
  SectionHeader,
  Carousel,
  CategoryGrid,
  type SectionProps,
  type SectionHeaderProps,
  type CarouselProps,
  type CategoryGridProps
} from '@/components/layout';

// Mock cn function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ')
}));

describe('Layout Components - Soomgo Pattern System', () => {
  describe('Section Component with Hero Variant', () => {
    it('renders default section correctly', () => {
      render(
        <Section data-testid="section">
          <p>Section content</p>
        </Section>
      );

      const section = screen.getByTestId('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('py-12', 'bg-transparent');
      expect(section).toContainElement(screen.getByText('Section content'));
    });

    it('renders hero section with correct styling', () => {
      render(
        <Section variant="hero" data-testid="hero-section">
          <h1>Hero Content</h1>
        </Section>
      );

      const heroSection = screen.getByTestId('hero-section');
      expect(heroSection).toBeInTheDocument();
      expect(heroSection).toHaveClass(
        'bg-white',
        'py-[60px]',
        'flex',
        'items-center',
        'justify-center',
        'text-center',
        'hero-responsive'
      );
      expect(heroSection).toContainElement(screen.getByText('Hero Content'));
    });

    it('applies custom spacing and background for non-hero variants', () => {
      render(
        <Section
          spacing="lg"
          background="gray"
          data-testid="custom-section"
        >
          Content
        </Section>
      );

      const section = screen.getByTestId('custom-section');
      expect(section).toHaveClass('py-16', 'bg-[#F6F7F9]');
    });

    it('accepts custom className prop', () => {
      render(
        <Section className="custom-class" data-testid="section">
          Content
        </Section>
      );

      expect(screen.getByTestId('section')).toHaveClass('custom-class');
    });
  });

  describe('SectionHeader Component', () => {
    it('renders with title only', () => {
      render(
        <SectionHeader title="Section Title" data-testid="section-header" />
      );

      const header = screen.getByTestId('section-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('flex', 'items-center', 'justify-between', 'mb-6');

      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveTextContent('Section Title');
      expect(title).toHaveClass('text-h2', 'text-neutral-darkest');
    });

    it('renders with title and subtitle', () => {
      render(
        <SectionHeader
          title="Main Title"
          subtitle="This is a subtitle"
          data-testid="section-header"
        />
      );

      expect(screen.getByText('Main Title')).toBeInTheDocument();

      const subtitle = screen.getByText('This is a subtitle');
      expect(subtitle).toBeInTheDocument();
      expect(subtitle).toHaveClass('text-small', 'text-neutral-medium');
    });

    it('renders with custom title and subtitle components', () => {
      render(
        <SectionHeader
          title={<h3>Custom Title</h3>}
          subtitle={<div>Custom Subtitle</div>}
          data-testid="section-header"
        />
      );

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Custom Title');
      expect(screen.getByText('Custom Subtitle')).toBeInTheDocument();
    });

    it('renders with action element', () => {
      render(
        <SectionHeader
          title="Title"
          action={<button>Action Button</button>}
          data-testid="section-header"
        />
      );

      const action = screen.getByRole('button', { name: 'Action Button' });
      expect(action).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <SectionHeader
          title="Title"
          className="custom-header"
          data-testid="section-header"
        />
      );

      expect(screen.getByTestId('section-header')).toHaveClass('custom-header');
    });
  });

  describe('Carousel Component', () => {
    const carouselItems = [
      <div key="1">Item 1</div>,
      <div key="2">Item 2</div>,
      <div key="3">Item 3</div>
    ];

    it('renders scrollable carousel by default', () => {
      render(
        <Carousel data-testid="carousel">
          {carouselItems}
        </Carousel>
      );

      const carousel = screen.getByTestId('carousel');
      expect(carousel).toBeInTheDocument();
      expect(carousel).toHaveClass(
        'flex',
        'gap-4',
        'overflow-x-auto',
        'scrollbar-hide',
        'snap-x',
        'snap-mandatory'
      );
    });

    it('renders non-scrollable carousel', () => {
      render(
        <Carousel scrollable={false} data-testid="carousel">
          {carouselItems}
        </Carousel>
      );

      const carousel = screen.getByTestId('carousel');
      expect(carousel).not.toHaveClass('overflow-x-auto', 'scrollbar-hide', 'snap-x', 'snap-mandatory');
      expect(carousel).toHaveClass('flex', 'gap-4');
    });

    it('applies different gap sizes', () => {
      render(
        <Carousel gap="lg" data-testid="carousel">
          {carouselItems}
        </Carousel>
      );

      expect(screen.getByTestId('carousel')).toHaveClass('gap-6');
    });

    it('wraps children with proper snap classes', () => {
      render(
        <Carousel data-testid="carousel">
          <div data-testid="item-1">Item 1</div>
          <div data-testid="item-2">Item 2</div>
        </Carousel>
      );

      const item1Parent = screen.getByTestId('item-1').parentElement;
      const item2Parent = screen.getByTestId('item-2').parentElement;

      expect(item1Parent).toHaveClass('flex-shrink-0', 'snap-start');
      expect(item2Parent).toHaveClass('flex-shrink-0', 'snap-start');
    });

    it('applies custom className', () => {
      render(
        <Carousel className="custom-carousel" data-testid="carousel">
          {carouselItems}
        </Carousel>
      );

      expect(screen.getByTestId('carousel')).toHaveClass('custom-carousel');
    });
  });

  describe('CategoryGrid Component', () => {
    const gridItems = [
      <div key="1">Category 1</div>,
      <div key="2">Category 2</div>,
      <div key="3">Category 3</div>,
      <div key="4">Category 4</div>
    ];

    it('renders responsive category grid by default', () => {
      render(
        <CategoryGrid data-testid="category-grid">
          {gridItems}
        </CategoryGrid>
      );

      const grid = screen.getByTestId('category-grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass(
        'grid',
        'grid-cols-[repeat(auto-fit,minmax(80px,1fr))]',
        'gap-3'
      );
    });

    it('renders non-responsive category grid', () => {
      render(
        <CategoryGrid responsive={false} data-testid="category-grid">
          {gridItems}
        </CategoryGrid>
      );

      const grid = screen.getByTestId('category-grid');
      expect(grid).toHaveClass('grid-cols-[repeat(auto-fill,minmax(80px,1fr))]');
    });

    it('applies custom minimum item width', () => {
      render(
        <CategoryGrid minItemWidth={120} data-testid="category-grid">
          {gridItems}
        </CategoryGrid>
      );

      const grid = screen.getByTestId('category-grid');
      expect(grid).toHaveClass('grid-cols-[repeat(auto-fit,minmax(120px,1fr))]');
    });

    it('applies different gap sizes', () => {
      render(
        <CategoryGrid gap="lg" data-testid="category-grid">
          {gridItems}
        </CategoryGrid>
      );

      expect(screen.getByTestId('category-grid')).toHaveClass('gap-6');
    });

    it('applies custom className', () => {
      render(
        <CategoryGrid className="custom-category-grid" data-testid="category-grid">
          {gridItems}
        </CategoryGrid>
      );

      expect(screen.getByTestId('category-grid')).toHaveClass('custom-category-grid');
    });

    it('renders all grid items correctly', () => {
      render(
        <CategoryGrid>
          <div data-testid="item-1">Category 1</div>
          <div data-testid="item-2">Category 2</div>
          <div data-testid="item-3">Category 3</div>
        </CategoryGrid>
      );

      expect(screen.getByTestId('item-1')).toHaveTextContent('Category 1');
      expect(screen.getByTestId('item-2')).toHaveTextContent('Category 2');
      expect(screen.getByTestId('item-3')).toHaveTextContent('Category 3');
    });
  });

  describe('Integration Tests', () => {
    it('works together in complex layout scenarios', () => {
      render(
        <Container data-testid="main-container">
          <Section variant="hero" data-testid="hero">
            <SectionHeader
              title="Welcome to Swing Connect"
              subtitle="Your complete swing dance community platform"
              data-testid="hero-header"
            />
          </Section>

          <Section spacing="lg" data-testid="content-section">
            <SectionHeader
              title="Categories"
              action={<button>View All</button>}
              data-testid="categories-header"
            />
            <CategoryGrid gap="md" data-testid="categories">
              <div>Dance Studios</div>
              <div>Events</div>
              <div>Equipment</div>
              <div>Community</div>
            </CategoryGrid>
          </Section>

          <Section data-testid="carousel-section">
            <SectionHeader title="Featured Content" />
            <Carousel gap="lg" data-testid="featured-carousel">
              <div>Featured 1</div>
              <div>Featured 2</div>
              <div>Featured 3</div>
            </Carousel>
          </Section>
        </Container>
      );

      // Verify all components render
      expect(screen.getByTestId('main-container')).toBeInTheDocument();
      expect(screen.getByTestId('hero')).toBeInTheDocument();
      expect(screen.getByTestId('hero-header')).toBeInTheDocument();
      expect(screen.getByTestId('content-section')).toBeInTheDocument();
      expect(screen.getByTestId('categories-header')).toBeInTheDocument();
      expect(screen.getByTestId('categories')).toBeInTheDocument();
      expect(screen.getByTestId('carousel-section')).toBeInTheDocument();
      expect(screen.getByTestId('featured-carousel')).toBeInTheDocument();

      // Verify specific text content
      expect(screen.getByText('Welcome to Swing Connect')).toBeInTheDocument();
      expect(screen.getByText('Your complete swing dance community platform')).toBeInTheDocument();
      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Featured Content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'View All' })).toBeInTheDocument();

      // Verify proper styling application
      expect(screen.getByTestId('hero')).toHaveClass('hero-responsive');
      expect(screen.getByTestId('content-section')).toHaveClass('py-16');
      expect(screen.getByTestId('categories')).toHaveClass('gap-4');
      expect(screen.getByTestId('featured-carousel')).toHaveClass('gap-6');
    });
  });

  describe('TypeScript Props Validation', () => {
    it('accepts all valid Section props', () => {
      const validProps: SectionProps = {
        children: <div>Content</div>,
        spacing: 'lg',
        background: 'white',
        variant: 'hero',
        className: 'test-class'
      };

      render(<Section {...validProps} data-testid="section" />);
      expect(screen.getByTestId('section')).toBeInTheDocument();
    });

    it('accepts all valid SectionHeader props', () => {
      const validProps: SectionHeaderProps = {
        title: 'Test Title',
        subtitle: 'Test Subtitle',
        action: <button>Action</button>,
        className: 'test-class'
      };

      render(<SectionHeader {...validProps} data-testid="header" />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('accepts all valid Carousel props', () => {
      const validProps: CarouselProps = {
        children: <div>Item</div>,
        gap: 'xl',
        scrollable: false,
        className: 'test-class'
      };

      render(<Carousel {...validProps} data-testid="carousel" />);
      expect(screen.getByTestId('carousel')).toBeInTheDocument();
    });

    it('accepts all valid CategoryGrid props', () => {
      const validProps: CategoryGridProps = {
        children: <div>Item</div>,
        minItemWidth: 100,
        gap: 'lg',
        responsive: false,
        className: 'test-class'
      };

      render(<CategoryGrid {...validProps} data-testid="grid" />);
      expect(screen.getByTestId('grid')).toBeInTheDocument();
    });
  });
});