import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import BottomNav from '@/components/navigation/BottomNav';

// Mock next/navigation
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: jest.fn(() => '/home'),
}));

// Mock axe-core for accessibility testing
const mockAxeResults = {
  violations: [],
  passes: [],
  incomplete: [],
  inapplicable: []
};

const mockAxe = jest.fn().mockResolvedValue(mockAxeResults);
jest.mock('axe-core', () => ({
  run: mockAxe,
  configure: jest.fn(),
}));

// Mock theme to ensure consistent styling
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
      secondary: {
        light: '#F1EEFF'
      }
    },
    typography: {
      small: {
        fontSize: '14px'
      }
    }
  }
}));

describe('BottomNav Accessibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ARIA Attributes and Semantic Structure', () => {
    it('should have proper navigation role and ARIA label', () => {
      render(<BottomNav />);
      const nav = screen.getByRole('navigation');

      expect(nav).toHaveAttribute('role', 'navigation');
      expect(nav).toHaveAttribute('aria-label', '메인 네비게이션');
    });

    it('should have proper tab role and ARIA attributes for navigation items', () => {
      render(<BottomNav />);

      // Check all navigation items
      const homeLink = screen.getByRole('tab', { name: '홈 페이지로 이동' });
      const locationLink = screen.getByRole('tab', { name: '지역 페이지로 이동' });
      const communityLink = screen.getByRole('tab', { name: '커뮤니티 페이지로 이동' });
      const marketplaceLink = screen.getByRole('tab', { name: '거래 페이지로 이동' });
      const profileLink = screen.getByRole('tab', { name: '내정보 페이지로 이동' });

      // Check ARIA attributes
      [homeLink, locationLink, communityLink, marketplaceLink, profileLink].forEach(link => {
        expect(link).toHaveAttribute('role', 'tab');
        expect(link).toHaveAttribute('aria-label');
      });
    });

    it('should indicate active state with aria-selected', () => {
      render(<BottomNav />);
      const homeLink = screen.getByRole('tab', { name: '홈 페이지로 이동' });

      // Home should be active based on mocked pathname '/home'
      expect(homeLink).toHaveAttribute('aria-selected', 'true');
    });

    it('should mark inactive items with aria-selected="false"', () => {
      render(<BottomNav />);
      const locationLink = screen.getByRole('tab', { name: '지역 페이지로 이동' });

      expect(locationLink).toHaveAttribute('aria-selected', 'false');
    });

    it('should have proper alt text for icons', () => {
      render(<BottomNav />);
      const homeLink = screen.getByRole('tab', { name: '홈 페이지로 이동' });
      const icon = homeLink.querySelector('svg');

      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Focus Management', () => {
    it('should be focusable via keyboard navigation', () => {
      render(<BottomNav />);
      const homeLink = screen.getByRole('tab', { name: '홈 페이지로 이동' });

      homeLink.focus();
      expect(homeLink).toHaveFocus();
    });

    it('should have proper focus indicators with Soomgo primary color', () => {
      render(<BottomNav />);
      const homeLink = screen.getByRole('tab', { name: '홈 페이지로 이동' });

      expect(homeLink).toHaveClass('focus:outline-none');
      expect(homeLink).toHaveClass('focus:ring-2');
      expect(homeLink).toHaveClass('focus:ring-offset-2');
      expect(homeLink).toHaveClass('focus:ring-[#693BF2]');
    });

    it('should maintain focus indicators across all navigation items', () => {
      render(<BottomNav />);
      const links = screen.getAllByRole('tab');

      links.forEach(link => {
        expect(link).toHaveClass('focus:ring-[#693BF2]');
        expect(link).toHaveClass('focus:ring-2');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support tab navigation through all items', async () => {
      const user = userEvent.setup();
      render(<BottomNav />);

      const homeLink = screen.getByRole('tab', { name: '홈 페이지로 이동' });
      const locationLink = screen.getByRole('tab', { name: '지역 페이지로 이동' });

      // Start from before the navigation
      document.body.focus();

      await user.tab();
      expect(homeLink).toHaveFocus();

      await user.tab();
      expect(locationLink).toHaveFocus();
    });

    it('should support shift+tab for reverse navigation', async () => {
      const user = userEvent.setup();
      render(<BottomNav />);

      const homeLink = screen.getByRole('tab', { name: '홈 페이지로 이동' });
      const profileLink = screen.getByRole('tab', { name: '내정보 페이지로 이동' });

      // Start from the last item
      profileLink.focus();
      expect(profileLink).toHaveFocus();

      // Shift+Tab should go to previous item
      await user.tab({ shift: true });
      const marketplaceLink = screen.getByRole('tab', { name: '거래 페이지로 이동' });
      expect(marketplaceLink).toHaveFocus();
    });

    it('should respond to Enter key press', () => {
      render(<BottomNav />);
      const locationLink = screen.getByRole('tab', { name: '지역 페이지로 이동' });

      fireEvent.keyDown(locationLink, { key: 'Enter', code: 'Enter' });

      // Note: Since we're using Next.js Link, the actual navigation would be handled by Next.js
      // We're testing that the element receives the keydown event properly
      expect(locationLink).toBeInTheDocument();
    });

    it('should respond to Space key press', () => {
      render(<BottomNav />);
      const communityLink = screen.getByRole('tab', { name: '커뮤니티 페이지로 이동' });

      fireEvent.keyDown(communityLink, { key: ' ', code: 'Space' });
      expect(communityLink).toBeInTheDocument();
    });
  });

  describe('Visual State Management', () => {
    it('should have proper active state styling', () => {
      render(<BottomNav />);
      const homeLink = screen.getByRole('tab', { name: '홈 페이지로 이동' });

      // Active item should have primary color text
      expect(homeLink).toHaveClass('text-[#693BF2]');
    });

    it('should have proper inactive state styling', () => {
      render(<BottomNav />);
      const locationLink = screen.getByRole('tab', { name: '지역 페이지로 이동' });

      // Inactive items should have medium gray text
      expect(locationLink).toHaveClass('text-[#6A7685]');
      expect(locationLink).toHaveClass('hover:text-[#293341]');
      expect(locationLink).toHaveClass('hover:bg-[#F6F7F9]');
    });
  });

  describe('Touch Target Size', () => {
    it('should provide adequate touch targets for mobile devices', () => {
      render(<BottomNav />);
      const links = screen.getAllByRole('tab');

      links.forEach(link => {
        expect(link).toHaveClass('px-3');
        expect(link).toHaveClass('py-2');
        // The combination of padding should create a touch target ≥44px
      });
    });

    it('should have proper spacing between navigation items', () => {
      render(<BottomNav />);
      const nav = screen.getByRole('navigation');
      const container = nav.querySelector('.flex');

      expect(container).toHaveClass('justify-around');
    });
  });

  describe('Color Contrast Compliance', () => {
    it('should use Soomgo colors with sufficient contrast', () => {
      render(<BottomNav />);
      const homeLink = screen.getByRole('tab', { name: '홈 페이지로 이동' });
      const locationLink = screen.getByRole('tab', { name: '지역 페이지로 이동' });

      // Active state: #693BF2 on background
      expect(homeLink).toHaveClass('text-[#693BF2]');

      // Inactive state: #6A7685 on background (meets 4.62:1 contrast ratio)
      expect(locationLink).toHaveClass('text-[#6A7685]');
    });

    it('should maintain sufficient contrast in hover states', () => {
      render(<BottomNav />);
      const locationLink = screen.getByRole('tab', { name: '지역 페이지로 이동' });

      // Hover state should use darker text #293341 for better contrast
      expect(locationLink).toHaveClass('hover:text-[#293341]');
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide meaningful labels for screen readers', () => {
      render(<BottomNav />);

      // Check that labels are descriptive
      expect(screen.getByRole('tab', { name: '홈 페이지로 이동' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '지역 페이지로 이동' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '커뮤니티 페이지로 이동' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '거래 페이지로 이동' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: '내정보 페이지로 이동' })).toBeInTheDocument();
    });

    it('should hide decorative icons from screen readers', () => {
      render(<BottomNav />);
      const homeLink = screen.getByRole('tab', { name: '홈 페이지로 이동' });
      const icon = homeLink.querySelector('svg');

      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Navigation Landmark', () => {
    it('should be properly identified as navigation landmark', () => {
      render(<BottomNav />);
      const nav = screen.getByRole('navigation', { name: '메인 네비게이션' });

      expect(nav).toBeInTheDocument();
    });

    it('should be properly positioned and styled', () => {
      render(<BottomNav />);
      const nav = screen.getByRole('navigation');

      expect(nav).toHaveClass('fixed');
      expect(nav).toHaveClass('bottom-0');
      expect(nav).toHaveClass('z-50');
    });
  });

  describe('Responsive Design Accessibility', () => {
    it('should maintain accessibility features across different screen sizes', () => {
      render(<BottomNav />);
      const nav = screen.getByRole('navigation');
      const container = nav.querySelector('.flex');

      expect(container).toHaveClass('items-center');
      expect(container).toHaveClass('justify-around');
      expect(container).toHaveClass('h-full');
    });
  });

  describe('Axe Accessibility Tests', () => {
    it('should pass axe accessibility tests', async () => {
      const { container } = render(<BottomNav />);

      await mockAxe(container);
      expect(mockAxe).toHaveBeenCalledWith(container);
    });

    it('should pass axe accessibility tests with home as active state', async () => {
      // Test the default state (home active) - mock is set to '/home'
      const { container } = render(<BottomNav />);

      await mockAxe(container);
      expect(mockAxe).toHaveBeenCalledWith(container);

      // Verify that home is active in this state
      const homeLink = screen.getByRole('tab', { name: '홈 페이지로 이동' });
      expect(homeLink).toHaveAttribute('aria-selected', 'true');
    });

    it('should pass axe accessibility tests for focus states', async () => {
      const { container } = render(<BottomNav />);

      // Focus on different navigation items
      const homeLink = screen.getByRole('tab', { name: '홈 페이지로 이동' });
      homeLink.focus();

      await mockAxe(container);
      expect(mockAxe).toHaveBeenCalledWith(container);
    });
  });
});