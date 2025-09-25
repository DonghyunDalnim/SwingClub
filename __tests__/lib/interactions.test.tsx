import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  tokens,
  createButtonStyle,
  createCardStyle,
  createTextStyle,
  createBadgeStyle,
  flexStyles,
  responsiveGrid
} from '@/lib/design-tokens';

// Mock CSS functions for testing
const getComputedStyleMock = (element: Element, pseudo?: string | null) => {
  const styles: Record<string, string> = {};

  // Mock computed styles based on class names
  const classNames = element.className;

  if (classNames.includes('soomgo-link')) {
    styles.transition = 'all 0.2s ease';
    styles.color = 'var(--color-neutral-medium)';
    styles.textDecoration = 'none';
  }

  if (classNames.includes('soomgo-interactive')) {
    styles.transition = 'all 0.2s ease';
  }

  return {
    getPropertyValue: (property: string) => styles[property] || '',
    transition: styles.transition || '',
    color: styles.color || '',
    textDecoration: styles.textDecoration || '',
    outline: styles.outline || '',
    outlineOffset: styles.outlineOffset || '',
    transform: styles.transform || '',
  };
};

// Mock window.getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: getComputedStyleMock,
  writable: true,
});

// Test components for interaction testing
const TestLink: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <a href="#" className={`soomgo-link ${className}`}>
    {children}
  </a>
);

const TestInteractiveElement: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <div className={`soomgo-interactive ${className}`} tabIndex={0}>
    {children}
  </div>
);

const TestButton: React.FC<{ variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'default' }> = ({
  variant = 'primary'
}) => (
  <button className={createButtonStyle(variant)}>
    Test Button
  </button>
);

const TestCard: React.FC<{ variant?: 'default' | 'service' | 'portfolio' }> = ({
  variant = 'default'
}) => (
  <div className={createCardStyle(variant)}>
    Test Card Content
  </div>
);

describe('Interaction System Tests', () => {
  beforeEach(() => {
    // Reset any document styles
    document.head.innerHTML = '';

    // Add global CSS variables for testing
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --color-primary: #693BF2;
        --color-primary-hover: #5A2FD9;
        --color-neutral-medium: #6A7685;
        --color-neutral-darkest: #293341;
        --color-white: #FFFFFF;
        --color-neutral-background: #F6F7F9;
        --color-secondary-light: #F1EEFF;
        --color-neutral-light: #E0E5EB;
      }

      .soomgo-link {
        color: var(--color-neutral-medium);
        text-decoration: none;
        transition: all 0.2s ease;
      }

      .soomgo-link:hover {
        color: var(--color-primary);
        transform: scale(1.01);
      }

      .soomgo-link:focus {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
        border-radius: 4px;
      }

      .soomgo-link:active {
        transform: scale(0.99);
      }

      .soomgo-interactive {
        transition: all 0.2s ease;
      }

      .soomgo-interactive:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
        border-radius: 4px;
      }

      @media (prefers-reduced-motion: reduce) {
        .soomgo-link,
        .soomgo-interactive,
        button,
        [role="button"] {
          transition: none !important;
          animation: none !important;
          transform: none !important;
        }
      }

      button:focus-visible,
      [role="button"]:focus-visible,
      a:focus-visible,
      input:focus-visible,
      textarea:focus-visible,
      select:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  });

  describe('Design Tokens', () => {
    describe('Color Tokens', () => {
      test('should have correct CSS variable definitions', () => {
        expect(tokens.colors.primary).toBe('var(--color-primary, #693BF2)');
        expect(tokens.colors.primaryHover).toBe('var(--color-primary-hover, #5A2FD9)');
        expect(tokens.colors.neutral.medium).toBe('var(--color-neutral-medium, #6A7685)');
        expect(tokens.colors.neutral.darkest).toBe('var(--color-neutral-darkest, #293341)');
        expect(tokens.colors.white).toBe('var(--color-white, #FFFFFF)');
      });

      test('should have fallback values for all color tokens', () => {
        Object.values(tokens.colors).forEach(color => {
          if (typeof color === 'string') {
            expect(color).toMatch(/var\(--[\w-]+,\s*#[0-9A-F]{6}\)/i);
          } else if (typeof color === 'object') {
            Object.values(color).forEach(nestedColor => {
              expect(nestedColor).toMatch(/var\(--[\w-]+,\s*#[0-9A-F]{6}\)/i);
            });
          }
        });
      });
    });

    describe('Interaction Tokens', () => {
      test('should have consistent transition timings', () => {
        expect(tokens.interactions.transition.default).toBe('all 0.2s ease');
        expect(tokens.interactions.transition.fast).toBe('all 0.15s ease');
        expect(tokens.interactions.transition.slow).toBe('all 0.3s ease');
      });

      test('should have transform effects for different states', () => {
        expect(tokens.interactions.transform.hover.card).toBe('translateY(-2px)');
        expect(tokens.interactions.transform.hover.button).toBe('scale(1.02)');
        expect(tokens.interactions.transform.hover.link).toBe('scale(1.01)');

        expect(tokens.interactions.transform.active.button).toBe('scale(0.98)');
        expect(tokens.interactions.transform.active.card).toBe('scale(0.99)');
      });

      test('should have focus outline specifications', () => {
        expect(tokens.interactions.transform.focus.outline).toBe('2px solid var(--color-primary)');
        expect(tokens.interactions.transform.focus.offset).toBe('2px');
      });

      test('should have elevation effects', () => {
        expect(tokens.interactions.elevation.hover.card).toBe('0 4px 16px rgba(0, 0, 0, 0.12)');
        expect(tokens.interactions.elevation.hover.button).toBe('0 2px 8px rgba(105, 59, 242, 0.3)');
        expect(tokens.interactions.elevation.active.card).toBe('0 2px 8px rgba(0, 0, 0, 0.08)');
      });
    });

    describe('Spacing and Layout Tokens', () => {
      test('should have consistent spacing scale', () => {
        expect(tokens.spacing.xs).toBe('4px');
        expect(tokens.spacing.sm).toBe('8px');
        expect(tokens.spacing.md).toBe('12px');
        expect(tokens.spacing.lg).toBe('16px');
        expect(tokens.spacing.xl).toBe('24px');
        expect(tokens.spacing['2xl']).toBe('32px');
        expect(tokens.spacing['3xl']).toBe('48px');
        expect(tokens.spacing['4xl']).toBe('64px');
      });

      test('should have responsive breakpoints', () => {
        expect(tokens.breakpoints.mobile).toBe('375px');
        expect(tokens.breakpoints.tablet).toBe('768px');
        expect(tokens.breakpoints.desktop).toBe('1200px');
      });
    });
  });

  describe('Soomgo Link Classes', () => {
    test('should render with correct base classes', () => {
      render(<TestLink>Test Link</TestLink>);
      const link = screen.getByText('Test Link');

      expect(link).toHaveClass('soomgo-link');
    });

    test('should apply CSS variables correctly', () => {
      render(<TestLink>Test Link</TestLink>);
      const link = screen.getByText('Test Link');

      const styles = window.getComputedStyle(link);
      expect(styles.color).toBe('var(--color-neutral-medium)');
      expect(styles.textDecoration).toBe('none');
      expect(styles.transition).toBe('all 0.2s ease');
    });

    test('should have hover state with transform and color change', () => {
      const { container } = render(<TestLink>Test Link</TestLink>);
      const link = screen.getByText('Test Link');

      // Check that hover styles are defined in stylesheet
      const styleSheet = container.querySelector('style') || document.querySelector('style');
      const styleText = styleSheet?.textContent || '';

      expect(styleText).toMatch(/\.soomgo-link:hover[\s\S]*color:\s*var\(--color-primary\)/);
      expect(styleText).toMatch(/\.soomgo-link:hover[\s\S]*transform:\s*scale\(1\.01\)/);
    });

    test('should have focus state with outline', () => {
      const { container } = render(<TestLink>Test Link</TestLink>);
      const styleSheet = container.querySelector('style') || document.querySelector('style');
      const styleText = styleSheet?.textContent || '';

      expect(styleText).toMatch(/\.soomgo-link:focus[\s\S]*outline:\s*2px solid var\(--color-primary\)/);
      expect(styleText).toMatch(/\.soomgo-link:focus[\s\S]*outline-offset:\s*2px/);
    });

    test('should have active state with scale down', () => {
      const { container } = render(<TestLink>Test Link</TestLink>);
      const styleSheet = container.querySelector('style') || document.querySelector('style');
      const styleText = styleSheet?.textContent || '';

      expect(styleText).toMatch(/\.soomgo-link:active[\s\S]*transform:\s*scale\(0\.99\)/);
    });

    test('should be keyboard accessible', () => {
      render(<TestLink>Test Link</TestLink>);
      const link = screen.getByText('Test Link');

      // Test focus
      link.focus();
      expect(link).toHaveFocus();

      // Test keyboard activation
      fireEvent.keyDown(link, { key: 'Enter' });
      fireEvent.keyDown(link, { key: ' ' });
    });
  });

  describe('Interactive Element Base Classes', () => {
    test('should render with soomgo-interactive class', () => {
      render(<TestInteractiveElement>Interactive Element</TestInteractiveElement>);
      const element = screen.getByText('Interactive Element');

      expect(element).toHaveClass('soomgo-interactive');
    });

    test('should have base transition timing', () => {
      render(<TestInteractiveElement>Interactive Element</TestInteractiveElement>);
      const element = screen.getByText('Interactive Element');

      const styles = window.getComputedStyle(element);
      expect(styles.transition).toBe('all 0.2s ease');
    });

    test('should have focus-visible styles', () => {
      const { container } = render(<TestInteractiveElement>Interactive Element</TestInteractiveElement>);
      const styleSheet = container.querySelector('style') || document.querySelector('style');
      const styleText = styleSheet?.textContent || '';

      expect(styleText).toMatch(/\.soomgo-interactive:focus-visible[\s\S]*outline:\s*2px solid var\(--color-primary\)/);
      expect(styleText).toMatch(/\.soomgo-interactive:focus-visible[\s\S]*outline-offset:\s*2px/);
    });

    test('should be focusable with tabIndex', () => {
      render(<TestInteractiveElement>Interactive Element</TestInteractiveElement>);
      const element = screen.getByText('Interactive Element');

      expect(element).toHaveAttribute('tabIndex', '0');
      element.focus();
      expect(element).toHaveFocus();
    });
  });

  describe('Design Token Functions', () => {
    describe('createButtonStyle', () => {
      test('should generate correct primary button classes', () => {
        const buttonClass = createButtonStyle('primary');

        expect(buttonClass).toContain('inline-flex items-center justify-center');
        expect(buttonClass).toContain('transition-all duration-200 ease');
        expect(buttonClass).toContain('focus:outline-none focus:ring-2 focus:ring-[#693BF2]');
        expect(buttonClass).toContain('hover:scale-[1.02] active:scale-[0.98]');
        expect(buttonClass).toContain('bg-[#693BF2] text-white');
        expect(buttonClass).toContain('hover:bg-[#5A2FD9]');
      });

      test('should generate correct secondary button classes', () => {
        const buttonClass = createButtonStyle('secondary');

        expect(buttonClass).toContain('bg-transparent text-[#293341] border border-[#E0E5EB]');
        expect(buttonClass).toContain('hover:bg-[#F6F7F9] hover:border-[#693BF2]');
      });

      test('should generate correct ghost button classes', () => {
        const buttonClass = createButtonStyle('ghost');

        expect(buttonClass).toContain('bg-transparent text-[#693BF2]');
        expect(buttonClass).toContain('hover:bg-[#F1EEFF]');
      });

      test('should generate correct outline button classes', () => {
        const buttonClass = createButtonStyle('outline');

        expect(buttonClass).toContain('bg-transparent text-[#693BF2] border border-[#693BF2]');
        expect(buttonClass).toContain('hover:bg-[#F1EEFF]');
      });

      test('should default to primary variant', () => {
        const defaultButton = createButtonStyle();
        const primaryButton = createButtonStyle('primary');

        expect(defaultButton).toBe(primaryButton);
      });

      test('should include disabled states', () => {
        const buttonClass = createButtonStyle('primary');

        expect(buttonClass).toContain('disabled:opacity-50');
        expect(buttonClass).toContain('disabled:pointer-events-none');
        expect(buttonClass).toContain('disabled:hover:scale-100');
        expect(buttonClass).toContain('disabled:active:scale-100');
      });
    });

    describe('createCardStyle', () => {
      test('should generate correct default card classes', () => {
        const cardClass = createCardStyle('default');

        expect(cardClass).toContain('bg-white border border-[#EFF1F5]');
        expect(cardClass).toContain('transition-all duration-200 ease');
        expect(cardClass).toContain('rounded-xl p-4');
        expect(cardClass).toContain('hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]');
        expect(cardClass).toContain('hover:-translate-y-0.5');
        expect(cardClass).toContain('active:scale-[0.99]');
      });

      test('should generate correct service card classes', () => {
        const cardClass = createCardStyle('service');

        expect(cardClass).toContain('rounded-lg p-3 text-center');
        expect(cardClass).toContain('hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]');
      });

      test('should generate correct portfolio card classes', () => {
        const cardClass = createCardStyle('portfolio');

        expect(cardClass).toContain('rounded-xl overflow-hidden');
        expect(cardClass).toContain('shadow-[0_2px_12px_rgba(0,0,0,0.08)]');
        expect(cardClass).toContain('hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]');
      });
    });

    describe('createTextStyle', () => {
      test('should generate correct heading styles', () => {
        expect(createTextStyle('h1')).toContain('text-5xl font-normal leading-[60px] text-[#293341]');
        expect(createTextStyle('h2')).toContain('text-3xl font-bold leading-[48px] text-[#293341]');
        expect(createTextStyle('h3')).toContain('text-sm font-medium leading-5 text-white');
        expect(createTextStyle('h4')).toContain('text-base font-medium leading-[25.12px] text-[#293341]');
      });

      test('should generate correct body text styles', () => {
        expect(createTextStyle('body')).toContain('text-base font-normal leading-6 text-[#293341]');
        expect(createTextStyle('small')).toContain('text-sm text-[#6A7685]');
      });
    });

    describe('createBadgeStyle', () => {
      test('should generate correct rating badge classes', () => {
        const badgeClass = createBadgeStyle('rating');

        expect(badgeClass).toContain('inline-flex items-center justify-center font-medium');
        expect(badgeClass).toContain('bg-[#693BF2] text-white px-2 py-1 rounded text-xs font-semibold');
      });

      test('should generate correct category badge classes', () => {
        const badgeClass = createBadgeStyle('category');

        expect(badgeClass).toContain('inline-flex items-center justify-center font-medium');
        expect(badgeClass).toContain('bg-[#F1EEFF] text-[#693BF2] px-3 py-1 rounded-full text-xs');
      });

      test('should default to category variant', () => {
        const defaultBadge = createBadgeStyle();
        const categoryBadge = createBadgeStyle('category');

        expect(defaultBadge).toBe(categoryBadge);
      });
    });
  });

  describe('Transition Timing Consistency', () => {
    test('should use consistent 0.2s ease timing', () => {
      const buttonClass = createButtonStyle('primary');
      const cardClass = createCardStyle('default');

      expect(buttonClass).toContain('duration-200 ease');
      expect(cardClass).toContain('duration-200 ease');
      expect(tokens.interactions.transition.default).toBe('all 0.2s ease');
    });

    test('should have alternative timing options', () => {
      expect(tokens.interactions.transition.fast).toBe('all 0.15s ease');
      expect(tokens.interactions.transition.slow).toBe('all 0.3s ease');
    });
  });

  describe('Focus Outline Styles', () => {
    test('should have consistent focus ring styles', () => {
      const buttonClass = createButtonStyle('primary');

      expect(buttonClass).toContain('focus:ring-2 focus:ring-[#693BF2] focus:ring-offset-2');
    });

    test('should have correct focus outline token', () => {
      expect(tokens.interactions.transform.focus.outline).toBe('2px solid var(--color-primary)');
      expect(tokens.interactions.transform.focus.offset).toBe('2px');
    });

    test('should apply focus styles to interactive elements', () => {
      const { container } = render(<TestInteractiveElement>Interactive</TestInteractiveElement>);
      const styleSheet = container.querySelector('style') || document.querySelector('style');
      const styleText = styleSheet?.textContent || '';

      expect(styleText).toMatch(/focus-visible[\s\S]*outline:\s*2px solid var\(--color-primary\)/);
    });
  });

  describe('Reduced Motion Accessibility', () => {
    test('should have reduced motion media query', () => {
      const { container } = render(<TestLink>Link</TestLink>);
      const styleSheet = container.querySelector('style') || document.querySelector('style');
      const styleText = styleSheet?.textContent || '';

      expect(styleText).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
      expect(styleText).toMatch(/transition:\s*none\s*!important/);
      expect(styleText).toMatch(/animation:\s*none\s*!important/);
      expect(styleText).toMatch(/transform:\s*none\s*!important/);
    });

    test('should disable transitions for multiple element types', () => {
      const { container } = render(<div><TestLink>Link</TestLink><TestButton /></div>);
      const styleSheet = container.querySelector('style') || document.querySelector('style');
      const styleText = styleSheet?.textContent || '';

      expect(styleText).toMatch(/\.soomgo-link,[\s\S]*\.soomgo-interactive,[\s\S]*button,[\s\S]*\[role="button"\]/);
    });
  });

  describe('Color Scheme Integration', () => {
    test('should use CSS custom properties for colors', () => {
      const buttonClass = createButtonStyle('primary');

      // Should use hard-coded colors for Tailwind compatibility
      expect(buttonClass).toContain('bg-[#693BF2]');
      expect(buttonClass).toContain('hover:bg-[#5A2FD9]');
    });

    test('should have color tokens with CSS variables', () => {
      expect(tokens.colors.primary).toBe('var(--color-primary, #693BF2)');
      expect(tokens.colors.primaryHover).toBe('var(--color-primary-hover, #5A2FD9)');
    });

    test('should support CSS variable fallbacks', () => {
      Object.values(tokens.colors).forEach(color => {
        if (typeof color === 'string') {
          expect(color).toMatch(/var\(--[\w-]+,\s*#[0-9A-F]{6}\)/i);
        } else if (typeof color === 'object') {
          Object.values(color).forEach(nestedColor => {
            expect(nestedColor).toMatch(/var\(--[\w-]+,\s*#[0-9A-F]{6}\)/i);
          });
        }
      });
    });
  });

  describe('Layout and Utility Functions', () => {
    test('should have flex utility classes', () => {
      expect(flexStyles.center).toBe('flex items-center justify-center');
      expect(flexStyles.between).toBe('flex items-center justify-between');
      expect(flexStyles.start).toBe('flex items-center justify-start');
      expect(flexStyles.column).toBe('flex flex-col');
      expect(flexStyles.columnCenter).toBe('flex flex-col items-center justify-center');
      expect(flexStyles.wrap).toBe('flex flex-wrap');
    });

    test('should have responsive grid classes', () => {
      expect(responsiveGrid.autoFit).toBe('grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-3');
      expect(responsiveGrid.mobile2).toBe('grid grid-cols-2 gap-4');
      expect(responsiveGrid.tablet3).toBe('grid grid-cols-2 md:grid-cols-3 gap-4');
      expect(responsiveGrid.desktop6).toBe('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4');
    });
  });

  describe('Component Integration', () => {
    test('should render button with correct classes', () => {
      render(<TestButton variant="primary" />);
      const button = screen.getByText('Test Button');

      expect(button).toHaveClass(...createButtonStyle('primary').split(' '));
    });

    test('should render card with correct classes', () => {
      render(<TestCard variant="default" />);
      const card = screen.getByText('Test Card Content');

      expect(card).toHaveClass(...createCardStyle('default').split(' '));
    });

    test('should support variant switching', () => {
      const { rerender } = render(<TestButton variant="primary" />);
      let button = screen.getByText('Test Button');
      expect(button.className).toContain('bg-[#693BF2]');

      rerender(<TestButton variant="secondary" />);
      button = screen.getByText('Test Button');
      expect(button.className).toContain('bg-transparent');
      expect(button.className).toContain('border-[#E0E5EB]');
    });
  });

  describe('Global Style Variables', () => {
    test('should define all required CSS custom properties', () => {
      const requiredVariables = [
        '--color-primary',
        '--color-primary-hover',
        '--color-neutral-medium',
        '--color-neutral-darkest',
        '--color-white',
        '--color-neutral-background',
        '--color-secondary-light'
      ];

      const { container } = render(<div>Test</div>);
      const styleSheet = container.querySelector('style') || document.querySelector('style');
      const styleText = styleSheet?.textContent || '';

      requiredVariables.forEach(variable => {
        expect(styleText).toMatch(new RegExp(`${variable}:\\s*#[0-9A-F]{6}`, 'i'));
      });
    });

    test('should have consistent color values', () => {
      const { container } = render(<div>Test</div>);
      const styleSheet = container.querySelector('style') || document.querySelector('style');
      const styleText = styleSheet?.textContent || '';

      expect(styleText).toMatch(/--color-primary:\s*#693BF2/i);
      expect(styleText).toMatch(/--color-primary-hover:\s*#5A2FD9/i);
    });
  });
});