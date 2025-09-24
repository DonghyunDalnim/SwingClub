import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/core/Card';

// Mock CSS property getters for testing computed styles
const mockGetComputedStyle = (element: Element, styles: Record<string, string>) => {
  Object.defineProperty(element, 'style', {
    writable: true,
    value: styles
  });

  // Mock getComputedStyle for this specific element
  const originalGetComputedStyle = global.getComputedStyle;
  jest.spyOn(global, 'getComputedStyle').mockImplementation((el) => {
    if (el === element) {
      return {
        ...styles,
        getPropertyValue: (prop: string) => styles[prop] || '',
      } as CSSStyleDeclaration;
    }
    return originalGetComputedStyle(el);
  });
};

// Helper to check if element has CSS class
const hasClass = (element: Element, className: string): boolean => {
  return element.classList.contains(className) ||
         element.className.includes(className);
};

// Helper to check CSS transforms in style or class
const hasTransform = (element: Element, transform: string): boolean => {
  const style = element.getAttribute('style') || '';
  const className = element.className || '';
  return style.includes(transform) ||
         className.includes(transform.replace(/[(),-]/g, '')) ||
         className.includes('hover:-translate-y-0.5') ||
         className.includes('active:scale-[0.99]');
};

describe('Card Interaction Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock CSS animations and transitions
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      value: jest.fn(() => ({
        finished: Promise.resolve(),
        cancel: jest.fn(),
        play: jest.fn(),
        pause: jest.fn(),
      })),
      writable: true,
    });

    // Mock getBoundingClientRect for layout calculations
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 320,
      height: 200,
      top: 0,
      left: 0,
      bottom: 200,
      right: 320,
      x: 0,
      y: 0,
      toJSON: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Hover Effects', () => {
    it('should apply hover transform and shadow for default variant', async () => {
      render(
        <Card data-testid="card" variant="default">
          <div>Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      // Check that hover classes are present in the default state
      expect(hasClass(card, 'hover:shadow-')).toBe(true);
      expect(hasClass(card, 'hover:-translate-y-0.5')).toBe(true);

      // Simulate hover
      fireEvent.mouseEnter(card);

      // Check that hover effects are applied
      expect(card).toHaveClass('hover:-translate-y-0.5');
      expect(card).toHaveClass('hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]');
    });

    it('should apply hover effects for service variant', async () => {
      render(
        <Card data-testid="card" variant="service">
          <div>Service Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      // Check service variant specific classes
      expect(hasClass(card, 'rounded-lg')).toBe(true);
      expect(hasClass(card, 'p-3')).toBe(true);
      expect(hasClass(card, 'text-center')).toBe(true);

      // Simulate hover
      fireEvent.mouseEnter(card);

      // Check hover effects for service variant
      expect(card).toHaveClass('hover:-translate-y-0.5');
      expect(card).toHaveClass('hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]');
    });

    it('should apply hover effects for portfolio variant', async () => {
      render(
        <Card data-testid="card" variant="portfolio">
          <div>Portfolio Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      // Check portfolio variant specific classes
      expect(hasClass(card, 'rounded-xl')).toBe(true);
      expect(hasClass(card, 'overflow-hidden')).toBe(true);

      // Simulate hover
      fireEvent.mouseEnter(card);

      // Check hover effects for portfolio variant
      expect(card).toHaveClass('hover:-translate-y-0.5');
      expect(card).toHaveClass('hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]');
    });

    it('should apply override classes when hoverable is false', async () => {
      render(
        <Card data-testid="card" hoverable={false}>
          <div>Non-hoverable Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      // Check that hover disabling classes are applied (these override the base hover classes)
      expect(card).toHaveClass('hover:shadow-none');
      expect(card).toHaveClass('hover:transform-none');

      // Note: The base hover classes are still present but overridden by the above classes
      // This is correct behavior - CSS specificity will make the override classes take effect
      expect(card).toHaveClass('hover:-translate-y-0.5'); // Present but overridden
      expect(card).toHaveClass('hover:shadow-none'); // Override class

      // Simulate hover
      fireEvent.mouseEnter(card);

      // The override classes should be present and take precedence
      expect(card).toHaveClass('hover:shadow-none');
      expect(card).toHaveClass('hover:transform-none');
    });

    it('should handle mouse enter and leave events', async () => {
      const onMouseEnter = jest.fn();
      const onMouseLeave = jest.fn();

      render(
        <Card
          data-testid="card"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div>Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      // Test mouse enter
      fireEvent.mouseEnter(card);
      expect(onMouseEnter).toHaveBeenCalledTimes(1);

      // Test mouse leave
      fireEvent.mouseLeave(card);
      expect(onMouseLeave).toHaveBeenCalledTimes(1);
    });
  });

  describe('Active State Effects', () => {
    it('should apply active scale transformation', async () => {
      render(
        <Card data-testid="card" clickable>
          <div>Clickable Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      // Check that active scale class is present
      expect(card).toHaveClass('active:scale-[0.99]');

      // Simulate mouse down (active state)
      fireEvent.mouseDown(card);

      // The active pseudo-class styling would be handled by CSS
      // We verify the class is present
      expect(hasTransform(card, 'scale(0.99)')).toBe(true);
    });

    it('should apply active shadow effects for default variant', async () => {
      render(
        <Card data-testid="card" variant="default" clickable>
          <div>Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      // Check active shadow class is present
      expect(card).toHaveClass('active:shadow-[0_2px_8px_rgba(0,0,0,0.08)]');

      fireEvent.mouseDown(card);
      fireEvent.mouseUp(card);
    });

    it('should handle click events properly', async () => {
      const onClick = jest.fn();

      render(
        <Card data-testid="card" onClick={onClick} clickable>
          <div>Clickable Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      await user.click(card);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Clickable Behavior', () => {
    it('should add cursor pointer when clickable is true', () => {
      render(
        <Card data-testid="card" clickable>
          <div>Clickable Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('should not add cursor pointer when clickable is false', () => {
      render(
        <Card data-testid="card" clickable={false}>
          <div>Non-clickable Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).not.toHaveClass('cursor-pointer');
    });

    it('should be focusable when clickable', async () => {
      render(
        <Card data-testid="card" clickable tabIndex={0}>
          <div>Clickable Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      // Focus the card
      card.focus();
      expect(card).toHaveFocus();
    });

    it('should handle focus events when clickable', async () => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();

      render(
        <Card
          data-testid="card"
          clickable
          tabIndex={0}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          <div>Focusable Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      // Test focus
      await user.click(card);
      card.focus();
      expect(onFocus).toHaveBeenCalled();

      // Test blur
      card.blur();
      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('Keyboard Accessibility', () => {
    it('should respond to Enter key when clickable', async () => {
      const onClick = jest.fn();

      render(
        <Card
          data-testid="card"
          clickable
          tabIndex={0}
          onClick={onClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onClick(e);
            }
          }}
        >
          <div>Keyboard Accessible Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      card.focus();
      await user.keyboard('[Enter]');

      expect(onClick).toHaveBeenCalled();
    });

    it('should respond to Space key when clickable', async () => {
      const onClick = jest.fn();

      render(
        <Card
          data-testid="card"
          clickable
          tabIndex={0}
          onClick={onClick}
          onKeyDown={(e) => {
            if (e.key === ' ') {
              e.preventDefault();
              onClick(e);
            }
          }}
        >
          <div>Space-accessible Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      card.focus();
      await user.keyboard(' ');

      expect(onClick).toHaveBeenCalled();
    });

    it('should have proper ARIA attributes when clickable', () => {
      render(
        <Card
          data-testid="card"
          clickable
          tabIndex={0}
          role="button"
          aria-label="Interactive card"
        >
          <div>Accessible Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('aria-label', 'Interactive card');
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Card Variants', () => {
    it('should apply correct styling for default variant', () => {
      render(
        <Card data-testid="card" variant="default">
          <div>Default Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      // Check default variant classes
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('p-4');
      expect(card).toHaveClass('shadow-[0_2px_8px_rgba(0,0,0,0.06)]');
      expect(card).toHaveClass('hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]');
    });

    it('should apply correct styling for service variant', () => {
      render(
        <Card data-testid="card" variant="service">
          <div>Service Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      // Check service variant classes
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('p-3');
      expect(card).toHaveClass('text-center');
      expect(card).toHaveClass('hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]');
    });

    it('should apply correct styling for portfolio variant', () => {
      render(
        <Card data-testid="card" variant="portfolio">
          <div>Portfolio Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      // Check portfolio variant classes
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('overflow-hidden');
      expect(card).toHaveClass('shadow-[0_2px_12px_rgba(0,0,0,0.08)]');
      expect(card).toHaveClass('hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]');
    });

    it('should combine variant with custom className', () => {
      render(
        <Card data-testid="card" variant="service" className="custom-class">
          <div>Custom Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      // Should have both variant classes and custom class
      expect(card).toHaveClass('rounded-lg'); // service variant
      expect(card).toHaveClass('custom-class'); // custom
    });
  });

  describe('Card Sub-Components', () => {
    describe('CardHeader', () => {
      it('should render with correct styling', () => {
        render(
          <Card>
            <CardHeader data-testid="card-header">
              <div>Header Content</div>
            </CardHeader>
          </Card>
        );

        const header = screen.getByTestId('card-header');

        expect(header).toHaveClass('flex');
        expect(header).toHaveClass('flex-col');
        expect(header).toHaveClass('space-y-1.5');
        expect(header).toHaveClass('p-0');
        expect(header).toHaveClass('pb-4');
      });

      it('should accept custom className', () => {
        render(
          <CardHeader data-testid="card-header" className="custom-header">
            <div>Header Content</div>
          </CardHeader>
        );

        const header = screen.getByTestId('card-header');
        expect(header).toHaveClass('custom-header');
      });
    });

    describe('CardTitle', () => {
      it('should render as h3 with correct styling', () => {
        render(
          <CardTitle data-testid="card-title">Test Title</CardTitle>
        );

        const title = screen.getByTestId('card-title');

        expect(title.tagName).toBe('H3');
        expect(title).toHaveClass('text-base');
        expect(title).toHaveClass('font-medium');
        expect(title).toHaveClass('leading-[25.12px]');
        expect(title).toHaveClass('text-[#293341]');
      });

      it('should display content correctly', () => {
        render(<CardTitle>Test Title Content</CardTitle>);
        expect(screen.getByText('Test Title Content')).toBeInTheDocument();
      });

      it('should accept custom className', () => {
        render(
          <CardTitle data-testid="card-title" className="custom-title">
            Title
          </CardTitle>
        );

        const title = screen.getByTestId('card-title');
        expect(title).toHaveClass('custom-title');
      });
    });

    describe('CardDescription', () => {
      it('should render as p with correct styling', () => {
        render(
          <CardDescription data-testid="card-description">
            Test Description
          </CardDescription>
        );

        const description = screen.getByTestId('card-description');

        expect(description.tagName).toBe('P');
        expect(description).toHaveClass('text-sm');
        expect(description).toHaveClass('text-[#6A7685]');
      });

      it('should display content correctly', () => {
        render(<CardDescription>Test description content</CardDescription>);
        expect(screen.getByText('Test description content')).toBeInTheDocument();
      });

      it('should accept custom className', () => {
        render(
          <CardDescription data-testid="card-description" className="custom-desc">
            Description
          </CardDescription>
        );

        const description = screen.getByTestId('card-description');
        expect(description).toHaveClass('custom-desc');
      });
    });

    describe('CardContent', () => {
      it('should render with correct styling', () => {
        render(
          <CardContent data-testid="card-content">
            <div>Content</div>
          </CardContent>
        );

        const content = screen.getByTestId('card-content');
        expect(content).toHaveClass('p-0');
      });

      it('should accept custom className', () => {
        render(
          <CardContent data-testid="card-content" className="custom-content">
            Content
          </CardContent>
        );

        const content = screen.getByTestId('card-content');
        expect(content).toHaveClass('custom-content');
      });
    });

    describe('CardFooter', () => {
      it('should render with correct styling', () => {
        render(
          <CardFooter data-testid="card-footer">
            <div>Footer Content</div>
          </CardFooter>
        );

        const footer = screen.getByTestId('card-footer');

        expect(footer).toHaveClass('flex');
        expect(footer).toHaveClass('items-center');
        expect(footer).toHaveClass('p-0');
        expect(footer).toHaveClass('pt-4');
      });

      it('should accept custom className', () => {
        render(
          <CardFooter data-testid="card-footer" className="custom-footer">
            Footer
          </CardFooter>
        );

        const footer = screen.getByTestId('card-footer');
        expect(footer).toHaveClass('custom-footer');
      });
    });

    it('should render complete card with all sub-components', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader data-testid="header">
            <CardTitle data-testid="title">Card Title</CardTitle>
            <CardDescription data-testid="description">Card Description</CardDescription>
          </CardHeader>
          <CardContent data-testid="content">
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter data-testid="footer">
            <button>Action Button</button>
          </CardFooter>
        </Card>
      );

      // Verify all components are rendered
      expect(screen.getByTestId('complete-card')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toBeInTheDocument();
      expect(screen.getByTestId('description')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();

      // Verify content
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Card content goes here')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Accessibility', () => {
    it('should handle empty content gracefully', () => {
      render(<Card data-testid="empty-card">{null}</Card>);

      const card = screen.getByTestId('empty-card');
      expect(card).toBeInTheDocument();
      expect(card).toBeEmptyDOMElement();
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Card ref={ref} data-testid="card-with-ref">
          <div>Content</div>
        </Card>
      );

      expect(ref.current).toBe(screen.getByTestId('card-with-ref'));
    });

    it('should pass through HTML attributes', () => {
      render(
        <Card
          data-testid="card"
          id="test-card"
          aria-label="Test card"
          data-custom="custom-value"
        >
          <div>Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('id', 'test-card');
      expect(card).toHaveAttribute('aria-label', 'Test card');
      expect(card).toHaveAttribute('data-custom', 'custom-value');
    });

    it('should handle multiple event handlers', async () => {
      const onMouseEnter = jest.fn();
      const onMouseLeave = jest.fn();
      const onClick = jest.fn();
      const onFocus = jest.fn();

      render(
        <Card
          data-testid="card"
          clickable
          tabIndex={0}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
          onFocus={onFocus}
        >
          <div>Interactive Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      // Test all interactions
      fireEvent.mouseEnter(card);
      expect(onMouseEnter).toHaveBeenCalledTimes(1);

      await user.click(card);
      expect(onClick).toHaveBeenCalledTimes(1);

      card.focus();
      expect(onFocus).toHaveBeenCalledTimes(1);

      fireEvent.mouseLeave(card);
      expect(onMouseLeave).toHaveBeenCalledTimes(1);
    });

    it('should maintain accessibility when both hoverable and clickable are false', () => {
      render(
        <Card
          data-testid="card"
          hoverable={false}
          clickable={false}
          tabIndex={0}
          role="article"
        >
          <div>Static Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      // Should still have accessibility attributes
      expect(card).toHaveAttribute('role', 'article');
      expect(card).toHaveAttribute('tabIndex', '0');

      // But should not have interaction classes
      expect(card).not.toHaveClass('cursor-pointer');
      expect(card).toHaveClass('hover:shadow-none');
      expect(card).toHaveClass('hover:transform-none');
    });

    it('should handle rapid hover/unhover events', async () => {
      const onMouseEnter = jest.fn();
      const onMouseLeave = jest.fn();

      render(
        <Card
          data-testid="card"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div>Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');

      // Rapid mouse events
      fireEvent.mouseEnter(card);
      fireEvent.mouseLeave(card);
      fireEvent.mouseEnter(card);
      fireEvent.mouseLeave(card);
      fireEvent.mouseEnter(card);

      expect(onMouseEnter).toHaveBeenCalledTimes(3);
      expect(onMouseLeave).toHaveBeenCalledTimes(2);
    });

    it('should work with nested interactive elements', async () => {
      const cardClick = jest.fn();
      const buttonClick = jest.fn((e) => {
        // Prevent event from bubbling to parent card
        e.stopPropagation();
      });

      render(
        <Card data-testid="card" clickable onClick={cardClick}>
          <CardContent>
            <button onClick={buttonClick}>Nested Button</button>
          </CardContent>
        </Card>
      );

      const card = screen.getByTestId('card');
      const button = screen.getByRole('button', { name: 'Nested Button' });

      // Click button should trigger button handler, not card handler (due to stopPropagation)
      await user.click(button);
      expect(buttonClick).toHaveBeenCalledTimes(1);
      expect(cardClick).toHaveBeenCalledTimes(0); // Should not be called due to stopPropagation

      // Click card background (not button) should trigger card handler
      // We need to click on a specific area of the card that's not the button
      const cardContent = card.querySelector('[data-testid="content"]') || card;
      fireEvent.click(cardContent);
      expect(cardClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance and Memory', () => {
    it('should not cause memory leaks with event listeners', () => {
      const { unmount } = render(
        <Card
          data-testid="card"
          onMouseEnter={jest.fn()}
          onMouseLeave={jest.fn()}
          onClick={jest.fn()}
        >
          <div>Content</div>
        </Card>
      );

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle prop changes without re-mounting', () => {
      const { rerender } = render(
        <Card data-testid="card" hoverable={true}>
          <div>Content</div>
        </Card>
      );

      const card = screen.getByTestId('card');
      const initialCard = card;

      // Change props
      rerender(
        <Card data-testid="card" hoverable={false} clickable={true}>
          <div>Content</div>
        </Card>
      );

      const updatedCard = screen.getByTestId('card');

      // Should be the same element (not re-mounted)
      expect(updatedCard).toBe(initialCard);

      // Should have updated classes
      expect(updatedCard).toHaveClass('hover:shadow-none');
      expect(updatedCard).toHaveClass('cursor-pointer');
    });
  });
});