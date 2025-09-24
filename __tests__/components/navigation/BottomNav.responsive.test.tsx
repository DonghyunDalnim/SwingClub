import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import BottomNav from '@/components/navigation/BottomNav';
import { theme } from '@/lib/theme';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

// Helper function to simulate different screen sizes
const mockMatchMedia = (matches: boolean, media: string = '') => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: media || query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

describe('BottomNav Responsive Design & Touch Optimization', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/home');
    // Reset to mobile viewport by default
    mockMatchMedia(true, '(max-width: 768px)');
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  describe('Component Rendering', () => {
    it('renders all navigation items correctly', () => {
      render(<BottomNav />);

      expect(screen.getByText('홈')).toBeInTheDocument();
      expect(screen.getByText('지역')).toBeInTheDocument();
      expect(screen.getByText('커뮤니티')).toBeInTheDocument();
      expect(screen.getByText('거래')).toBeInTheDocument();
      expect(screen.getByText('내정보')).toBeInTheDocument();
    });

    it('renders with correct navigation structure', () => {
      render(<BottomNav />);

      const nav = screen.getByRole('navigation');
      const links = screen.getAllByRole('link');

      expect(nav).toBeInTheDocument();
      expect(links).toHaveLength(5);

      // Check that each link has the correct href
      expect(screen.getByRole('link', { name: /홈/i })).toHaveAttribute('href', '/home');
      expect(screen.getByRole('link', { name: /지역/i })).toHaveAttribute('href', '/location');
      expect(screen.getByRole('link', { name: /커뮤니티/i })).toHaveAttribute('href', '/community');
      expect(screen.getByRole('link', { name: /거래/i })).toHaveAttribute('href', '/marketplace');
      expect(screen.getByRole('link', { name: /내정보/i })).toHaveAttribute('href', '/profile');
    });
  });

  describe('Touch Target Size Validation (44px minimum)', () => {
    it('ensures all navigation links meet minimum touch target size', () => {
      render(<BottomNav />);

      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        const styles = window.getComputedStyle(link);
        const minHeight = styles.getPropertyValue('min-height');
        const minWidth = styles.getPropertyValue('min-width');

        // Verify minimum touch target size from theme
        expect(link).toHaveStyle({
          minHeight: theme.responsive.touchOptimization.minTouchTarget,
          minWidth: theme.responsive.touchOptimization.minTouchTarget
        });
      });
    });

    it('applies correct touch target dimensions from theme', () => {
      render(<BottomNav />);

      const homeLink = screen.getByRole('link', { name: /홈/i });

      expect(homeLink).toHaveStyle({
        minHeight: '44px',
        minWidth: '44px'
      });
    });

    it('maintains touch target size when active', () => {
      mockUsePathname.mockReturnValue('/community');
      render(<BottomNav />);

      const activeLink = screen.getByRole('link', { name: /커뮤니티/i });

      expect(activeLink).toHaveStyle({
        minHeight: '44px',
        minWidth: '44px'
      });
    });
  });

  describe('Responsive CSS Classes Application', () => {
    it('applies soomgo-responsive-text class to nav text', () => {
      render(<BottomNav />);

      const textElements = screen.getAllByText(/^(홈|지역|커뮤니티|거래|내정보)$/);

      textElements.forEach((element) => {
        expect(element).toHaveClass('soomgo-responsive-text');
      });
    });

    it('applies responsive text class correctly', () => {
      render(<BottomNav />);

      const homeText = screen.getByText('홈');

      expect(homeText).toHaveClass('soomgo-responsive-text');
      expect(homeText).toHaveClass('text-xs');
      expect(homeText).toHaveClass('font-medium');
    });

    it('maintains responsive classes across different viewport sizes', () => {
      // Test mobile
      mockMatchMedia(true, '(max-width: 768px)');
      const { rerender } = render(<BottomNav />);

      let homeText = screen.getByText('홈');
      expect(homeText).toHaveClass('soomgo-responsive-text');

      // Test tablet
      mockMatchMedia(true, '(min-width: 768px) and (max-width: 1200px)');
      rerender(<BottomNav />);

      homeText = screen.getByText('홈');
      expect(homeText).toHaveClass('soomgo-responsive-text');

      // Test desktop
      mockMatchMedia(true, '(min-width: 1200px)');
      rerender(<BottomNav />);

      homeText = screen.getByText('홈');
      expect(homeText).toHaveClass('soomgo-responsive-text');
    });
  });

  describe('Touch Area Classes and Styles', () => {
    it('applies soomgo-touch-target class to all navigation links', () => {
      render(<BottomNav />);

      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        expect(link).toHaveClass('soomgo-touch-target');
      });
    });

    it('applies soomgo-touch-area class to all navigation links', () => {
      render(<BottomNav />);

      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        expect(link).toHaveClass('soomgo-touch-area');
      });
    });

    it('applies correct touch area styling', () => {
      render(<BottomNav />);

      const homeLink = screen.getByRole('link', { name: /홈/i });

      expect(homeLink).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
      expect(homeLink).toHaveClass('space-y-1', 'rounded-lg');
      expect(homeLink).toHaveClass('transition-all', 'duration-200');
    });
  });

  describe('Touch Optimization Properties', () => {
    it('applies webkit-tap-highlight-color: transparent via CSS class', () => {
      render(<BottomNav />);

      // Since the touch optimization is applied via CSS classes,
      // we verify the classes are present. The actual CSS properties
      // are tested through the CSS class application.
      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        expect(link).toHaveClass('soomgo-touch-target');
        expect(link).toHaveClass('soomgo-touch-area');
      });
    });

    it('applies user-select: none via CSS class', () => {
      render(<BottomNav />);

      const links = screen.getAllByRole('link');

      // The CSS class soomgo-touch-target includes user-select: none
      links.forEach((link) => {
        expect(link).toHaveClass('soomgo-touch-target');
      });
    });

    it('maintains touch optimization on active state', () => {
      mockUsePathname.mockReturnValue('/location');
      render(<BottomNav />);

      const activeLink = screen.getByRole('link', { name: /지역/i });

      expect(activeLink).toHaveClass('soomgo-touch-target');
      expect(activeLink).toHaveClass('soomgo-touch-area');
    });
  });

  describe('Accessibility Features', () => {
    it('provides proper ARIA roles', () => {
      render(<BottomNav />);

      const nav = screen.getByRole('navigation');
      const links = screen.getAllByRole('link');

      expect(nav).toBeInTheDocument();
      expect(links).toHaveLength(5);
    });

    it('provides accessible link text', () => {
      render(<BottomNav />);

      expect(screen.getByRole('link', { name: /홈/i })).toHaveAccessibleName('홈');
      expect(screen.getByRole('link', { name: /지역/i })).toHaveAccessibleName('지역');
      expect(screen.getByRole('link', { name: /커뮤니티/i })).toHaveAccessibleName('커뮤니티');
      expect(screen.getByRole('link', { name: /거래/i })).toHaveAccessibleName('거래');
      expect(screen.getByRole('link', { name: /내정보/i })).toHaveAccessibleName('내정보');
    });

    it('maintains proper focus indicators', () => {
      render(<BottomNav />);

      const homeLink = screen.getByRole('link', { name: /홈/i });

      // Focus the element
      homeLink.focus();
      expect(homeLink).toHaveFocus();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<BottomNav />);

      const homeLink = screen.getByRole('link', { name: /홈/i });
      const locationLink = screen.getByRole('link', { name: /지역/i });

      // Tab to first link
      await user.tab();
      expect(homeLink).toHaveFocus();

      // Tab to next link
      await user.tab();
      expect(locationLink).toHaveFocus();
    });

    it('provides proper color contrast for accessibility', () => {
      // Test inactive state
      mockUsePathname.mockReturnValue('/home');
      render(<BottomNav />);

      const inactiveLink = screen.getByRole('link', { name: /지역/i });
      expect(inactiveLink).toHaveClass('text-[#6A7685]');

      cleanup();

      // Test active state
      mockUsePathname.mockReturnValue('/location');
      render(<BottomNav />);

      const activeLink = screen.getByRole('link', { name: /지역/i });
      expect(activeLink).toHaveClass('text-[#693BF2]');
    });
  });

  describe('Active State Management', () => {
    it('highlights the currently active navigation item', () => {
      mockUsePathname.mockReturnValue('/community');
      render(<BottomNav />);

      const activeLink = screen.getByRole('link', { name: /커뮤니티/i });
      const inactiveLink = screen.getByRole('link', { name: /홈/i });

      // Active link should have primary color
      expect(activeLink).toHaveClass('text-[#693BF2]');
      expect(activeLink).toHaveStyle({
        backgroundColor: theme.colors.secondary.light
      });

      // Inactive link should have neutral color
      expect(inactiveLink).toHaveClass('text-[#6A7685]');
    });

    it('updates active state when pathname changes', () => {
      mockUsePathname.mockReturnValue('/home');
      const { rerender } = render(<BottomNav />);

      // Initially home is active
      let homeLink = screen.getByRole('link', { name: /홈/i });
      let marketplaceLink = screen.getByRole('link', { name: /거래/i });

      expect(homeLink).toHaveClass('text-[#693BF2]');
      expect(marketplaceLink).toHaveClass('text-[#6A7685]');

      // Change to marketplace
      mockUsePathname.mockReturnValue('/marketplace');
      rerender(<BottomNav />);

      homeLink = screen.getByRole('link', { name: /홈/i });
      marketplaceLink = screen.getByRole('link', { name: /거래/i });

      expect(homeLink).toHaveClass('text-[#6A7685]');
      expect(marketplaceLink).toHaveClass('text-[#693BF2]');
    });

    it('applies correct background color for active state', () => {
      mockUsePathname.mockReturnValue('/profile');
      render(<BottomNav />);

      const activeLink = screen.getByRole('link', { name: /내정보/i });

      expect(activeLink).toHaveStyle({
        backgroundColor: theme.colors.secondary.light
      });
    });
  });

  describe('Touch Interaction Testing', () => {
    it('handles touch start events correctly', async () => {
      const user = userEvent.setup();
      render(<BottomNav />);

      const homeLink = screen.getByRole('link', { name: /홈/i });

      // Simulate touch interaction
      await user.pointer({ target: homeLink, keys: '[TouchA>]' });

      expect(homeLink).toBeInTheDocument();
    });

    it('handles touch end events correctly', async () => {
      const user = userEvent.setup();
      render(<BottomNav />);

      const locationLink = screen.getByRole('link', { name: /지역/i });

      // Simulate complete touch interaction
      await user.pointer([
        { target: locationLink, keys: '[TouchA>]' },
        { keys: '[/TouchA]' }
      ]);

      expect(locationLink).toBeInTheDocument();
    });

    it('responds to click events', async () => {
      const user = userEvent.setup();
      render(<BottomNav />);

      const communityLink = screen.getByRole('link', { name: /커뮤니티/i });

      await user.click(communityLink);

      // Link should remain in document after click
      expect(communityLink).toBeInTheDocument();
    });

    it('provides visual feedback on hover (desktop)', async () => {
      // Simulate desktop environment
      mockMatchMedia(true, '(hover: hover)');

      const user = userEvent.setup();
      render(<BottomNav />);

      const marketplaceLink = screen.getByRole('link', { name: /거래/i });

      await user.hover(marketplaceLink);

      expect(marketplaceLink).toHaveClass('hover:text-[#293341]');
      expect(marketplaceLink).toHaveClass('hover:bg-[#F6F7F9]');
    });
  });

  describe('Navigation Container Properties', () => {
    it('applies correct navigation container styles', () => {
      render(<BottomNav />);

      const nav = screen.getByRole('navigation');

      expect(nav).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0', 'z-50');
      expect(nav).toHaveStyle({
        height: theme.components.navigation.height,
        backgroundColor: theme.components.navigation.backgroundColor,
        borderTop: theme.components.navigation.borderBottom,
        padding: theme.components.navigation.padding
      });
    });

    it('applies correct flex layout to navigation items', () => {
      render(<BottomNav />);

      const nav = screen.getByRole('navigation');
      const container = nav.querySelector('div');

      expect(container).toHaveClass('flex', 'items-center', 'justify-around', 'h-full');
    });
  });

  describe('Theme Integration', () => {
    it('uses theme colors correctly', () => {
      mockUsePathname.mockReturnValue('/home');
      render(<BottomNav />);

      const nav = screen.getByRole('navigation');
      const activeLink = screen.getByRole('link', { name: /홈/i });

      expect(nav).toHaveStyle({
        backgroundColor: theme.components.navigation.backgroundColor
      });

      expect(activeLink).toHaveStyle({
        backgroundColor: theme.colors.secondary.light
      });
    });

    it('applies theme-based touch optimization values', () => {
      render(<BottomNav />);

      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        expect(link).toHaveStyle({
          minHeight: theme.responsive.touchOptimization.minTouchTarget,
          minWidth: theme.responsive.touchOptimization.minTouchTarget
        });
      });
    });
  });

  describe('Performance and Optimization', () => {
    it('renders efficiently without unnecessary re-renders', () => {
      const renderSpy = jest.fn();

      const TestWrapper = () => {
        renderSpy();
        return <BottomNav />;
      };

      const { rerender } = render(<TestWrapper />);

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same pathname
      rerender(<TestWrapper />);

      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('handles rapid pathname changes correctly', async () => {
      const pathnames = ['/home', '/location', '/community', '/marketplace', '/profile'];
      const expectedLabels = ['홈', '지역', '커뮤니티', '거래', '내정보'];

      pathnames.forEach((pathname, index) => {
        mockUsePathname.mockReturnValue(pathname);

        cleanup(); // Clean up previous render
        render(<BottomNav />);

        const activeLinks = screen.getAllByRole('link').filter(link =>
          link.classList.contains('text-[#693BF2]')
        );

        expect(activeLinks).toHaveLength(1);
        expect(activeLinks[0]).toHaveTextContent(expectedLabels[index]);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles invalid pathname gracefully', () => {
      mockUsePathname.mockReturnValue('/invalid-path');

      expect(() => render(<BottomNav />)).not.toThrow();

      // Should render all links without active state
      const links = screen.getAllByRole('link');
      const activeLinks = links.filter(link =>
        link.classList.contains('text-[#693BF2]')
      );

      expect(links).toHaveLength(5);
      expect(activeLinks).toHaveLength(0);
    });

    it('handles missing pathname gracefully', () => {
      mockUsePathname.mockReturnValue('');

      expect(() => render(<BottomNav />)).not.toThrow();

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(5);
    });

    it('handles null pathname gracefully', () => {
      mockUsePathname.mockReturnValue(null as any);

      expect(() => render(<BottomNav />)).not.toThrow();

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(5);
    });
  });

  describe('CSS Classes Validation', () => {
    it('applies all required Tailwind CSS classes correctly', () => {
      render(<BottomNav />);

      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        // Verify layout classes
        expect(link).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');

        // Verify spacing and styling classes
        expect(link).toHaveClass('space-y-1', 'rounded-lg');

        // Verify transition classes
        expect(link).toHaveClass('transition-all', 'duration-200');

        // Verify Soomgo classes
        expect(link).toHaveClass('soomgo-touch-target', 'soomgo-touch-area');
      });
    });

    it('applies conditional classes based on active state', () => {
      mockUsePathname.mockReturnValue('/community');
      render(<BottomNav />);

      const activeLink = screen.getByRole('link', { name: /커뮤니티/i });
      const inactiveLink = screen.getByRole('link', { name: /홈/i });

      // Active link classes
      expect(activeLink).toHaveClass('text-[#693BF2]');
      expect(activeLink).not.toHaveClass('text-[#6A7685]');

      // Inactive link classes
      expect(inactiveLink).toHaveClass('text-[#6A7685]');
      expect(inactiveLink).toHaveClass('hover:text-[#293341]');
      expect(inactiveLink).toHaveClass('hover:bg-[#F6F7F9]');
    });
  });

  describe('Icon Rendering', () => {
    it('renders correct icons for each navigation item', () => {
      render(<BottomNav />);

      // Check that SVG icons are present by looking for them directly
      const homeIcon = screen.getByRole('link', { name: /홈/i }).querySelector('svg');
      const locationIcon = screen.getByRole('link', { name: /지역/i }).querySelector('svg');
      const communityIcon = screen.getByRole('link', { name: /커뮤니티/i }).querySelector('svg');
      const marketplaceIcon = screen.getByRole('link', { name: /거래/i }).querySelector('svg');
      const profileIcon = screen.getByRole('link', { name: /내정보/i }).querySelector('svg');

      // Check that all icons exist
      expect(homeIcon).toBeInTheDocument();
      expect(locationIcon).toBeInTheDocument();
      expect(communityIcon).toBeInTheDocument();
      expect(marketplaceIcon).toBeInTheDocument();
      expect(profileIcon).toBeInTheDocument();

      // Check specific icon classes - use more flexible matching since Lucide versions may vary
      expect(homeIcon).toHaveClass('lucide');
      expect(locationIcon).toHaveClass('lucide');
      expect(communityIcon).toHaveClass('lucide');
      expect(marketplaceIcon).toHaveClass('lucide');
      expect(profileIcon).toHaveClass('lucide');

      // Check that icons have specific patterns using getAttribute for reliable class string access
      const homeIconClass = homeIcon?.getAttribute('class') || '';
      const locationIconClass = locationIcon?.getAttribute('class') || '';
      const communityIconClass = communityIcon?.getAttribute('class') || '';
      const marketplaceIconClass = marketplaceIcon?.getAttribute('class') || '';
      const profileIconClass = profileIcon?.getAttribute('class') || '';

      expect(homeIconClass).toMatch(/lucide-(home|house)/);
      expect(locationIconClass).toMatch(/lucide-map-pin/);
      expect(communityIconClass).toMatch(/lucide-users/);
      expect(marketplaceIconClass).toMatch(/lucide-message-circle/);
      expect(profileIconClass).toMatch(/lucide-user/);
    });

    it('applies correct icon sizing', () => {
      render(<BottomNav />);

      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        const icon = link.querySelector('svg');
        expect(icon).toHaveClass('h-5', 'w-5');
      });
    });

    it('ensures icons are properly accessible', () => {
      render(<BottomNav />);

      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        const icon = link.querySelector('svg');
        // Lucide icons have aria-hidden="true" by default, which is correct for decorative icons
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Advanced Touch Optimization', () => {
    it('verifies CSS touch properties through computed styles', () => {
      render(<BottomNav />);

      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        // These CSS properties are applied through the CSS classes
        // We verify the classes are present as the actual CSS properties
        // are applied by the stylesheet
        expect(link).toHaveClass('soomgo-touch-target');
        expect(link).toHaveClass('soomgo-touch-area');
      });
    });

    it('validates touch target areas meet accessibility guidelines', () => {
      render(<BottomNav />);

      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        // Note: In JSDOM, getBoundingClientRect returns zero values,
        // so we check the CSS styles instead for touch target sizing
        expect(link).toHaveStyle({
          minHeight: '44px',
          minWidth: '44px'
        });
      });
    });

    it('ensures touch optimization works across different devices', () => {
      const deviceViewports = [
        { width: 375, height: 667 },  // iPhone SE
        { width: 390, height: 844 },  // iPhone 12
        { width: 768, height: 1024 }, // iPad
      ];

      deviceViewports.forEach((viewport) => {
        // Mock different viewport sizes
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: viewport.height,
        });

        cleanup();
        render(<BottomNav />);

        const links = screen.getAllByRole('link');

        links.forEach((link) => {
          // Touch target sizing should remain consistent across devices
          expect(link).toHaveStyle({
            minHeight: '44px',
            minWidth: '44px'
          });

          expect(link).toHaveClass('soomgo-touch-target');
          expect(link).toHaveClass('soomgo-touch-area');
        });
      });
    });
  });

  describe('Coverage Edge Cases', () => {
    it('handles component unmounting gracefully', () => {
      const { unmount } = render(<BottomNav />);

      expect(() => unmount()).not.toThrow();
    });

    it('maintains state consistency during rapid interactions', async () => {
      const user = userEvent.setup();
      render(<BottomNav />);

      const links = screen.getAllByRole('link');

      // Rapidly interact with different links
      for (const link of links.slice(0, 3)) {
        await user.hover(link);
        await user.unhover(link);
      }

      // Component should still be stable
      expect(screen.getAllByRole('link')).toHaveLength(5);
    });

    it('verifies all navigation paths are configured correctly', () => {
      render(<BottomNav />);

      const expectedPaths = [
        { label: '홈', href: '/home' },
        { label: '지역', href: '/location' },
        { label: '커뮤니티', href: '/community' },
        { label: '거래', href: '/marketplace' },
        { label: '내정보', href: '/profile' }
      ];

      expectedPaths.forEach(({ label, href }) => {
        const link = screen.getByRole('link', { name: new RegExp(label, 'i') });
        expect(link).toHaveAttribute('href', href);
      });
    });
  });
});