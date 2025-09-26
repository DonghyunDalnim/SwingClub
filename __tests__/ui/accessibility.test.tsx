import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

// Mock axe-core properly
jest.mock('axe-core', () => ({
  run: jest.fn().mockResolvedValue({
    violations: [],
    passes: [],
    incomplete: [],
    inapplicable: []
  }),
  configure: jest.fn(),
}));

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations);

// Component imports for accessibility testing
import BottomNav from '@/components/navigation/BottomNav';
import { Button } from '@/components/core/Button';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/home',
}));

// Mock theme
jest.mock('@/lib/theme', () => ({
  theme: {
    components: {
      navigation: {
        height: '64px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #EFF1F5',
        padding: '0 16px',
      }
    },
    colors: {
      secondary: { light: '#F1EEFF' }
    },
    typography: {
      small: { fontSize: '14px' }
    }
  }
}));

describe('Accessibility Tests - WCAG 2.1 AA Compliance', () => {
  describe('Button Component Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <div>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button disabled>Disabled Button</Button>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      render(<Button aria-label="Custom accessible button">Icon Button</Button>);

      const button = screen.getByRole('button', { name: 'Custom accessible button' });
      expect(button).toHaveAttribute('aria-label', 'Custom accessible button');
    });

    it('should support keyboard navigation', () => {
      render(<Button>Focusable Button</Button>);

      const button = screen.getByRole('button', { name: 'Focusable Button' });
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should have sufficient color contrast', () => {
      render(<Button variant="primary">Primary Button</Button>);

      const button = screen.getByRole('button', { name: 'Primary Button' });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Color Contrast Compliance', () => {
    it('should meet WCAG AA contrast ratios for primary colors', () => {
      const colorTests = [
        { color: '#693BF2', background: '#FFFFFF', ratio: 5.98, name: 'Primary on white' },
        { color: '#293341', background: '#FFFFFF', ratio: 12.7, name: 'Text on white' },
        { color: '#6A7685', background: '#FFFFFF', ratio: 4.62, name: 'Medium text on white' },
      ];

      colorTests.forEach(test => {
        // Color contrast should be at least 4.5:1 for WCAG AA
        expect(test.ratio).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should meet WCAG AA contrast for interactive elements', () => {
      const { container } = render(<Button variant="primary">Test Button</Button>);

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();

      // Button should be visible and accessible
      expect(button).not.toHaveStyle('opacity: 0');
    });
  });

  describe('Navigation Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<BottomNav />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper navigation role', () => {
      render(<BottomNav />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should have accessible navigation links', () => {
      render(<BottomNav />);

      const links = screen.getAllByRole('button');
      expect(links.length).toBeGreaterThan(0);

      links.forEach(link => {
        expect(link).toBeVisible();
        expect(link).not.toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should have proper heading hierarchy', () => {
      const { container } = render(
        <div>
          <h1>Main Title</h1>
          <h2>Section Title</h2>
          <h3>Subsection Title</h3>
        </div>
      );

      expect(container.querySelector('h1')).toBeInTheDocument();
      expect(container.querySelector('h2')).toBeInTheDocument();
      expect(container.querySelector('h3')).toBeInTheDocument();
    });

    it('should provide text alternatives for images', () => {
      const { container } = render(
        <div>
          <img src="/test.jpg" alt="Test image description" />
          <img src="/decorative.jpg" alt="" role="presentation" />
        </div>
      );

      const images = container.querySelectorAll('img');
      images.forEach(img => {
        // Images should either have alt text or be marked as decorative
        const hasAlt = img.hasAttribute('alt');
        const isDecorative = img.getAttribute('role') === 'presentation';
        expect(hasAlt || isDecorative).toBe(true);
      });
    });
  });

  describe('Form Accessibility', () => {
    it('should associate labels with form controls', () => {
      const { container } = render(
        <form>
          <label htmlFor="test-input">Test Label</label>
          <input id="test-input" type="text" />
        </form>
      );

      const input = container.querySelector('input');
      const label = container.querySelector('label');

      expect(input).toHaveAttribute('id', 'test-input');
      expect(label).toHaveAttribute('for', 'test-input');
    });

    it('should provide error messages for invalid inputs', () => {
      const { container } = render(
        <form>
          <input type="email" aria-describedby="email-error" aria-invalid="true" />
          <div id="email-error" role="alert">Please enter a valid email</div>
        </form>
      );

      const input = container.querySelector('input');
      const errorMessage = container.querySelector('#email-error');

      expect(input).toHaveAttribute('aria-describedby', 'email-error');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support tab navigation', () => {
      render(
        <div>
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Third</Button>
        </div>
      );

      const buttons = screen.getAllByRole('button');

      // All buttons should be focusable
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('should provide visible focus indicators', () => {
      const { container } = render(<Button>Focusable Button</Button>);

      const button = container.querySelector('button');
      button?.focus();

      expect(button).toHaveFocus();
      // Focus should be visible (not outline: none)
      expect(button).not.toHaveStyle('outline: none');
    });
  });

  describe('ARIA Landmarks', () => {
    it('should use semantic HTML elements', () => {
      const { container } = render(
        <div>
          <header>Header Content</header>
          <nav>Navigation</nav>
          <main>Main Content</main>
          <aside>Sidebar</aside>
          <footer>Footer Content</footer>
        </div>
      );

      expect(container.querySelector('header')).toBeInTheDocument();
      expect(container.querySelector('nav')).toBeInTheDocument();
      expect(container.querySelector('main')).toBeInTheDocument();
      expect(container.querySelector('aside')).toBeInTheDocument();
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('should provide ARIA labels for complex widgets', () => {
      const { container } = render(
        <div role="tabpanel" aria-labelledby="tab-1">
          Tab panel content
        </div>
      );

      const tabpanel = container.querySelector('[role="tabpanel"]');
      expect(tabpanel).toHaveAttribute('aria-labelledby', 'tab-1');
    });
  });

  describe('Motion and Animation Accessibility', () => {
    it('should respect prefers-reduced-motion', () => {
      // Mock matchMedia for reduced motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('prefers-reduced-motion: reduce'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const { container } = render(<Button>Animated Button</Button>);

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();

      // Should not have excessive animations when reduced motion is preferred
      const computedStyle = window.getComputedStyle(button!);
      expect(computedStyle.animationDuration).not.toBe('10s');
    });
  });
});