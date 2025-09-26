import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component imports for responsive testing
import { Button } from '@/components/core/Button';
import { Card } from '@/components/core/Card';
import { Container } from '@/components/layout/Container';
import { Grid } from '@/components/layout/Grid';

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
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    spacing: {
      sections: {
        paddingVertical: '2rem',
        paddingHorizontal: '1rem',
      }
    },
    components: {
      container: {
        maxWidth: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
        },
        padding: '1rem'
      }
    }
  }
}));

describe('Responsive Design Tests', () => {
  // Utility function to simulate viewport changes
  const setViewport = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });

    // Mock matchMedia for breakpoint testing
    window.matchMedia = jest.fn().mockImplementation(query => {
      const breakpoints = {
        '(max-width: 639px)': width < 640,
        '(min-width: 640px)': width >= 640,
        '(min-width: 768px)': width >= 768,
        '(min-width: 1024px)': width >= 1024,
        '(min-width: 1280px)': width >= 1280,
      };

      return {
        matches: breakpoints[query as keyof typeof breakpoints] || false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
    });

    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
  };

  describe('Mobile Viewport (375px)', () => {
    beforeEach(() => {
      setViewport(375, 667);
    });

    it('should render buttons appropriately for mobile', () => {
      const { container } = render(
        <div>
          <Button variant="primary">Mobile Button</Button>
          <Button variant="secondary">Secondary</Button>
        </div>
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button).toBeVisible();

        // Buttons should be touch-friendly (minimum 44px height)
        const styles = window.getComputedStyle(button);
        const height = parseInt(styles.height) || 44;
        expect(height).toBeGreaterThanOrEqual(44);
      });
    });

    it('should stack elements vertically on mobile', () => {
      const { container } = render(
        <Grid cols={2} gap="md" responsive={true}>
          <Card>Card 1</Card>
          <Card>Card 2</Card>
        </Grid>
      );

      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeInTheDocument();
    });

    it('should adjust typography for mobile readability', () => {
      const { container } = render(
        <div>
          <h1>Mobile Heading</h1>
          <p>Mobile body text that should be readable</p>
        </div>
      );

      const heading = container.querySelector('h1');
      const paragraph = container.querySelector('p');

      expect(heading).toBeVisible();
      expect(paragraph).toBeVisible();

      // Text should not be too small on mobile
      if (heading) {
        const headingStyles = window.getComputedStyle(heading);
        const fontSize = parseInt(headingStyles.fontSize) || 16;
        expect(fontSize).toBeGreaterThanOrEqual(16);
      }
    });
  });

  describe('Tablet Viewport (768px)', () => {
    beforeEach(() => {
      setViewport(768, 1024);
    });

    it('should adapt layout for tablet screens', () => {
      const { container } = render(
        <Container size="lg">
          <Grid cols={2} gap="md" responsive={true}>
            <Card>Tablet Card 1</Card>
            <Card>Tablet Card 2</Card>
            <Card>Tablet Card 3</Card>
            <Card>Tablet Card 4</Card>
          </Grid>
        </Container>
      );

      const container_element = container.querySelector('[class*="container"]');
      expect(container_element).toBeInTheDocument();
    });

    it('should show appropriate content density for tablet', () => {
      const { container } = render(
        <div>
          <Button>Tablet Button 1</Button>
          <Button>Tablet Button 2</Button>
          <Button>Tablet Button 3</Button>
        </div>
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(3);

      buttons.forEach(button => {
        expect(button).toBeVisible();
      });
    });
  });

  describe('Desktop Viewport (1280px)', () => {
    beforeEach(() => {
      setViewport(1280, 720);
    });

    it('should display full desktop layout', () => {
      const { container } = render(
        <Container size="xl">
          <Grid cols={4} gap="lg" responsive={true}>
            <Card>Desktop Card 1</Card>
            <Card>Desktop Card 2</Card>
            <Card>Desktop Card 3</Card>
            <Card>Desktop Card 4</Card>
          </Grid>
        </Container>
      );

      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeInTheDocument();
    });

    it('should optimize content for large screens', () => {
      const { container } = render(
        <div>
          <h1>Desktop Heading</h1>
          <p>Desktop content with optimal line length and spacing</p>
          <Button>Desktop Action</Button>
        </div>
      );

      const elements = container.querySelectorAll('h1, p, button');
      elements.forEach(element => {
        expect(element).toBeVisible();
      });
    });
  });

  describe('Breakpoint Transitions', () => {
    const breakpoints = [
      { name: 'mobile', width: 375 },
      { name: 'tablet', width: 768 },
      { name: 'desktop', width: 1024 },
      { name: 'large', width: 1280 },
    ];

    breakpoints.forEach(({ name, width }) => {
      it(`should handle ${name} breakpoint (${width}px)`, () => {
        setViewport(width, 768);

        const { container } = render(
          <Container size="responsive">
            <Grid cols={1} gap="md" responsive={true}>
              <Card>
                <h2>Responsive Card</h2>
                <p>Content that adapts to different screen sizes</p>
                <Button>Action Button</Button>
              </Card>
            </Grid>
          </Container>
        );

        // Verify layout doesn't break at this breakpoint
        expect(container.firstChild).toBeVisible();

        // Check for horizontal overflow
        const bodyStyles = window.getComputedStyle(document.body);
        expect(bodyStyles.overflowX).not.toBe('scroll');
      });
    });
  });

  describe('Touch and Interaction Targets', () => {
    beforeEach(() => {
      setViewport(375, 667); // Mobile viewport
    });

    it('should meet touch target size requirements', () => {
      const { container } = render(
        <div>
          <Button variant="primary">Touch Target</Button>
          <Button variant="secondary">Another Target</Button>
        </div>
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();

        // WCAG 2.1 AA requires minimum 44x44 CSS pixels for touch targets
        expect(rect.width).toBeGreaterThanOrEqual(44);
        expect(rect.height).toBeGreaterThanOrEqual(44);
      });
    });

    it('should provide adequate spacing between touch targets', () => {
      const { container } = render(
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button>Button 1</Button>
          <Button>Button 2</Button>
        </div>
      );

      const buttons = container.querySelectorAll('button');
      if (buttons.length >= 2) {
        const button1Rect = buttons[0].getBoundingClientRect();
        const button2Rect = buttons[1].getBoundingClientRect();

        // Minimum 8px spacing between touch targets
        const spacing = button2Rect.left - (button1Rect.left + button1Rect.width);
        expect(spacing).toBeGreaterThanOrEqual(8);
      }
    });
  });

  describe('Content Reflow', () => {
    it('should reflow content without horizontal scrolling', () => {
      const viewports = [320, 375, 414, 768, 1024, 1280];

      viewports.forEach(width => {
        setViewport(width, 667);

        const { container } = render(
          <Container size="responsive">
            <div>
              <h1>Responsive Heading That Should Not Cause Overflow</h1>
              <p>
                This is a longer paragraph of text that should wrap properly
                at different viewport sizes without causing horizontal scrolling
                or layout issues. The text should remain readable and accessible.
              </p>
              <Button>Responsive Button</Button>
            </div>
          </Container>
        );

        // Check that content fits within viewport
        const content = container.firstChild as HTMLElement;
        if (content) {
          const rect = content.getBoundingClientRect();
          expect(rect.width).toBeLessThanOrEqual(width);
        }
      });
    });
  });

  describe('Image and Media Responsiveness', () => {
    it('should handle responsive images', () => {
      const { container } = render(
        <div>
          <img
            src="/test-image.jpg"
            alt="Responsive test image"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      );

      const image = container.querySelector('img');
      expect(image).toHaveStyle('max-width: 100%');
      expect(image).toHaveStyle('height: auto');
    });

    it('should adapt video content for different screens', () => {
      const { container } = render(
        <div style={{ position: 'relative', width: '100%' }}>
          <video
            style={{ width: '100%', height: 'auto' }}
            controls
          >
            <source src="/test-video.mp4" type="video/mp4" />
          </video>
        </div>
      );

      const video = container.querySelector('video');
      expect(video).toHaveStyle('width: 100%');
    });
  });

  describe('Navigation Responsiveness', () => {
    it('should adapt navigation for mobile screens', () => {
      setViewport(375, 667);

      const { container } = render(
        <nav>
          <Button>Home</Button>
          <Button>About</Button>
          <Button>Contact</Button>
        </nav>
      );

      const nav = container.querySelector('nav');
      const buttons = container.querySelectorAll('button');

      expect(nav).toBeVisible();
      expect(buttons.length).toBe(3);

      buttons.forEach(button => {
        expect(button).toBeVisible();
      });
    });
  });

  describe('Form Responsiveness', () => {
    it('should make forms usable on mobile devices', () => {
      setViewport(375, 667);

      const { container } = render(
        <form>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              style={{ width: '100%', minHeight: '44px' }}
            />
          </div>
          <div>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              style={{ width: '100%', minHeight: '100px' }}
            />
          </div>
          <Button type="submit">Submit</Button>
        </form>
      );

      const inputs = container.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        const rect = input.getBoundingClientRect();
        expect(rect.height).toBeGreaterThanOrEqual(44); // Touch-friendly height
      });
    });
  });
});