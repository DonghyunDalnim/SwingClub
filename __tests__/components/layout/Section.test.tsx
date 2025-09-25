import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Section, SectionHeader } from '@/components/layout/Section';

describe('Section Component', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <Section>
          <div>Test content</div>
        </Section>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('renders with correct semantic HTML tag', () => {
      const { container } = render(
        <Section>Test content</Section>
      );

      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLElement>();
      render(
        <Section ref={ref}>Test content</Section>
      );

      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName).toBe('SECTION');
    });
  });

  describe('Spacing Prop', () => {
    it('applies default spacing (md)', () => {
      const { container } = render(
        <Section>Test content</Section>
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass('py-12');
    });

    it('applies none spacing', () => {
      const { container } = render(
        <Section spacing="none">Test content</Section>
      );

      const section = container.querySelector('section');
      expect(section).not.toHaveClass('py-8', 'py-12', 'py-16');
    });

    it('applies sm spacing', () => {
      const { container } = render(
        <Section spacing="sm">Test content</Section>
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass('py-8');
    });

    it('applies md spacing', () => {
      const { container } = render(
        <Section spacing="md">Test content</Section>
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass('py-12');
    });

    it('applies lg spacing', () => {
      const { container } = render(
        <Section spacing="lg">Test content</Section>
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass('py-16');
    });
  });

  describe('Background Prop', () => {
    it('applies default background (transparent)', () => {
      const { container } = render(
        <Section>Test content</Section>
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-transparent');
    });

    it('applies white background', () => {
      const { container } = render(
        <Section background="white">Test content</Section>
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-white');
    });

    it('applies gray background', () => {
      const { container } = render(
        <Section background="gray">Test content</Section>
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-[#F6F7F9]');
    });

    it('applies transparent background', () => {
      const { container } = render(
        <Section background="transparent">Test content</Section>
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-transparent');
    });
  });

  describe('Variant Prop', () => {
    it('applies default variant', () => {
      const { container } = render(
        <Section>Test content</Section>
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass('py-12', 'bg-transparent');
    });

    it('applies hero variant - 숨고 표준 패턴 (흰색 배경, 60px 패딩, 중앙 정렬)', () => {
      const { container } = render(
        <Section variant="hero">Test content</Section>
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass(
        'bg-white',
        'py-[60px]',
        'flex',
        'items-center',
        'justify-center',
        'text-center',
        'hero-responsive'
      );
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <Section className="custom-class">Test content</Section>
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass('custom-class');
    });

    it('passes through other HTML attributes', () => {
      const { container } = render(
        <Section data-testid="section-test" aria-label="Test section">
          Test content
        </Section>
      );

      const section = container.querySelector('section');
      expect(section).toHaveAttribute('data-testid', 'section-test');
      expect(section).toHaveAttribute('aria-label', 'Test section');
    });
  });

  describe('Accessibility', () => {
    it('has correct semantic structure', () => {
      const { container } = render(
        <Section>
          <h1>Section Title</h1>
          <p>Section content</p>
        </Section>
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('supports ARIA attributes', () => {
      render(
        <Section role="region" aria-labelledby="section-title">
          <h2 id="section-title">Section Title</h2>
        </Section>
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByRole('region')).toHaveAttribute('aria-labelledby', 'section-title');
    });
  });
});

describe('SectionHeader Component', () => {
  describe('Rendering', () => {
    it('renders title correctly', () => {
      render(
        <SectionHeader title="Test Title" />
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders title as string with h2 tag', () => {
      render(
        <SectionHeader title="String Title" />
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-h2', 'text-neutral-darkest');
    });

    it('renders title as ReactNode', () => {
      render(
        <SectionHeader title={<h1>Custom Title</h1>} />
      );

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <SectionHeader ref={ref} title="Test Title" />
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Subtitle Prop', () => {
    it('renders subtitle as string', () => {
      render(
        <SectionHeader
          title="Test Title"
          subtitle="Test subtitle"
        />
      );

      expect(screen.getByText('Test subtitle')).toBeInTheDocument();
      const subtitle = screen.getByText('Test subtitle');
      expect(subtitle).toHaveClass('text-small', 'text-neutral-medium');
    });

    it('renders subtitle as ReactNode', () => {
      render(
        <SectionHeader
          title="Test Title"
          subtitle={<span className="custom-subtitle">Custom subtitle</span>}
        />
      );

      expect(screen.getByText('Custom subtitle')).toBeInTheDocument();
      expect(screen.getByText('Custom subtitle')).toHaveClass('custom-subtitle');
    });

    it('does not render subtitle when undefined', () => {
      render(
        <SectionHeader title="Test Title" />
      );

      expect(screen.queryByText('Test subtitle')).not.toBeInTheDocument();
    });
  });

  describe('Action Prop', () => {
    it('renders action element', () => {
      render(
        <SectionHeader
          title="Test Title"
          action={<button>Action Button</button>}
        />
      );

      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
    });

    it('does not render action when undefined', () => {
      render(
        <SectionHeader title="Test Title" />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('applies correct flex layout for action', () => {
      const { container } = render(
        <SectionHeader
          title="Test Title"
          action={<button>Action</button>}
        />
      );

      const actionContainer = container.querySelector('.flex-shrink-0.ml-4');
      expect(actionContainer).toBeInTheDocument();
    });
  });

  describe('Layout - 숨고 표준 패턴 (space-between 레이아웃, 24px 하단 마진)', () => {
    it('applies correct layout classes', () => {
      const { container } = render(
        <SectionHeader title="Test Title" />
      );

      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass(
        'flex',
        'items-center',
        'justify-between',
        'mb-6'  // 24px margin-bottom
      );
    });

    it('maintains space-between layout with title and action', () => {
      const { container } = render(
        <SectionHeader
          title="Test Title"
          action={<button>Action</button>}
        />
      );

      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('justify-between');

      const titleContainer = container.querySelector('.flex-1');
      const actionContainer = container.querySelector('.flex-shrink-0.ml-4');

      expect(titleContainer).toBeInTheDocument();
      expect(actionContainer).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <SectionHeader
          title="Test Title"
          className="custom-header-class"
        />
      );

      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('custom-header-class');
    });

    it('passes through other HTML attributes', () => {
      const { container } = render(
        <SectionHeader
          title="Test Title"
          data-testid="header-test"
          id="section-header"
        />
      );

      const header = container.firstChild as HTMLElement;
      expect(header).toHaveAttribute('data-testid', 'header-test');
      expect(header).toHaveAttribute('id', 'section-header');
    });
  });

  describe('Complex Combinations', () => {
    it('renders all props together correctly', () => {
      render(
        <SectionHeader
          title={<h3>Complex Title</h3>}
          subtitle={<em>Complex subtitle</em>}
          action={<div>Complex action</div>}
          className="complex-class"
        />
      );

      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
      expect(screen.getByText('Complex Title')).toBeInTheDocument();
      expect(screen.getByText('Complex subtitle')).toBeInTheDocument();
      expect(screen.getByText('Complex action')).toBeInTheDocument();
    });
  });
});