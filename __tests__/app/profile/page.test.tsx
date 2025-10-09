/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import ProfilePage from '@/app/profile/page';
import { useAuth } from '@/lib/auth/hooks';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock auth hooks
jest.mock('@/lib/auth/hooks', () => ({
  useAuth: jest.fn(),
}));

// Mock core components
jest.mock('@/components/core', () => ({
  Button: ({ children, className, onClick, variant, size, ...props }: any) => (
    <button
      className={`mock-button mock-button-${variant} mock-button-${size} ${className || ''}`}
      onClick={onClick}
      data-testid="button"
      {...props}
    >
      {children}
    </button>
  ),
  Card: ({ children, className, ...props }: any) => (
    <div className={`mock-card ${className || ''}`} data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div className={`mock-card-content ${className || ''}`} data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div className={`mock-card-header ${className || ''}`} data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <h2 className={`mock-card-title ${className || ''}`} data-testid="card-title" {...props}>
      {children}
    </h2>
  ),
  Badge: ({ children, variant, className, ...props }: any) => (
    <span className={`mock-badge mock-badge-${variant || 'default'} ${className || ''}`} data-testid="badge" {...props}>
      {children}
    </span>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="arrow-left-icon">←</span>,
  Edit: () => <span data-testid="edit-icon">✏️</span>,
  Settings: () => <span data-testid="settings-icon">⚙️</span>,
  MapPin: () => <span data-testid="map-pin-icon">📍</span>,
  Calendar: () => <span data-testid="calendar-icon">📅</span>,
  Award: () => <span data-testid="award-icon">🏆</span>,
  Heart: () => <span data-testid="heart-icon">❤️</span>,
  MessageCircle: () => <span data-testid="message-circle-icon">💬</span>,
  Users: () => <span data-testid="users-icon">👥</span>,
  FileText: () => <span data-testid="file-text-icon">📄</span>,
  Bell: () => <span data-testid="bell-icon">🔔</span>,
  Lock: () => <span data-testid="lock-icon">🔒</span>,
  Smartphone: () => <span data-testid="smartphone-icon">📱</span>,
  HelpCircle: () => <span data-testid="help-circle-icon">❓</span>,
  Mail: () => <span data-testid="mail-icon">✉️</span>,
  LogOut: () => <span data-testid="logout-icon">🚪</span>,
}));

describe('ProfilePage', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  };

  const mockAuthenticatedUser = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      displayName: '댄스러버',
    },
    isAuthenticated: true,
  };

  const mockUnauthenticatedUser = {
    user: null,
    isAuthenticated: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('Initial Rendering', () => {
    it('renders the profile page with all sections', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      // Header
      expect(screen.getByText('내 정보')).toBeInTheDocument();

      // Profile Header Section
      expect(screen.getByText('댄스러버')).toBeInTheDocument();
      expect(screen.getByText('중급')).toBeInTheDocument();
      expect(screen.getByText('강남구')).toBeInTheDocument();

      // Dance Styles Section
      expect(screen.getByText('🎵 선호 스타일')).toBeInTheDocument();
      expect(screen.getByText('린디합')).toBeInTheDocument();
      expect(screen.getByText('찰스턴')).toBeInTheDocument();
      expect(screen.getByText('발보아')).toBeInTheDocument();
      expect(screen.getByText('이스트코스트')).toBeInTheDocument();

      // Activity Stats Section
      expect(screen.getByText('📊 활동 통계')).toBeInTheDocument();
      expect(screen.getByText('작성한 글')).toBeInTheDocument();
      expect(screen.getByText('댓글')).toBeInTheDocument();
      expect(screen.getByText('받은 좋아요')).toBeInTheDocument();
      expect(screen.getByText('참여한 모임')).toBeInTheDocument();

      // Badges Section
      expect(screen.getByText('🏆 내 배지')).toBeInTheDocument();
      expect(screen.getByText('신입댄서')).toBeInTheDocument();
      expect(screen.getByText('모임러버')).toBeInTheDocument();

      // Bio Section
      expect(screen.getByText('💭 자기소개')).toBeInTheDocument();

      // Settings Section
      expect(screen.getByText('알림 설정')).toBeInTheDocument();
      expect(screen.getByText('개인정보 설정')).toBeInTheDocument();
      expect(screen.getByText('로그아웃')).toBeInTheDocument();
    });

    it('renders all profile cards correctly', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      const cards = screen.getAllByTestId('card');
      // Profile Header, Dance Styles, Activity Stats, Badges, Bio, Settings = 6 cards
      expect(cards.length).toBeGreaterThanOrEqual(6);
    });

    it('displays all navigation icons', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    });

    it('displays activity statistics with correct values', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      expect(screen.getByText('15')).toBeInTheDocument(); // 작성한 글
      expect(screen.getByText('47')).toBeInTheDocument(); // 댓글
      expect(screen.getByText('89')).toBeInTheDocument(); // 받은 좋아요
      expect(screen.getByText('8')).toBeInTheDocument(); // 참여한 모임
    });
  });

  describe('Edit Button - Authenticated User', () => {
    it('displays edit button when user is authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /편집/i });
      expect(editButton).toBeInTheDocument();
    });

    it('edit button contains Edit icon', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
    });

    it('edit button has correct variant and size props', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /편집/i });
      expect(editButton).toHaveClass('mock-button-primary');
      expect(editButton).toHaveClass('mock-button-sm');
    });

    it('navigates to /profile/edit when edit button is clicked', async () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      const user = userEvent.setup();
      render(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /편집/i });
      await user.click(editButton);

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/profile/edit');
    });

    it('edit button can be clicked with fireEvent', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /편집/i });
      fireEvent.click(editButton);

      expect(mockPush).toHaveBeenCalledWith('/profile/edit');
    });
  });

  describe('Edit Button - Unauthenticated User', () => {
    it('does not display edit button when user is not authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue(mockUnauthenticatedUser);
      render(<ProfilePage />);

      const editButton = screen.queryByRole('button', { name: /편집/i });
      expect(editButton).not.toBeInTheDocument();
    });

    it('does not display Edit icon when user is not authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue(mockUnauthenticatedUser);
      render(<ProfilePage />);

      expect(screen.queryByTestId('edit-icon')).not.toBeInTheDocument();
    });

    it('router push is never called when unauthenticated', () => {
      (useAuth as jest.Mock).mockReturnValue(mockUnauthenticatedUser);
      render(<ProfilePage />);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Responsive Design - Mobile View', () => {
    it('edit button text has hidden class on mobile', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /편집/i });
      const buttonText = editButton.querySelector('span:not([data-testid])');

      expect(buttonText).toHaveClass('hidden');
      expect(buttonText).toHaveClass('sm:inline');
    });

    it('edit icon is always visible', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      const editIcon = screen.getByTestId('edit-icon');
      expect(editIcon).toBeVisible();
    });

    it('mobile view shows only icon without text breakpoint', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      const { container } = render(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /편집/i });
      const spans = editButton.querySelectorAll('span');

      // Should have Edit icon span and text span
      expect(spans.length).toBeGreaterThanOrEqual(1);

      // Find the text span (not the icon)
      const textSpan = Array.from(spans).find(span =>
        span.textContent === '편집' && !span.hasAttribute('data-testid')
      );

      expect(textSpan).toHaveClass('hidden', 'sm:inline');
    });
  });

  describe('Responsive Design - Desktop View', () => {
    it('edit button text is visible on desktop breakpoint', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /편집/i });
      const buttonText = editButton.querySelector('span:not([data-testid])');

      // Has sm:inline class for desktop visibility
      expect(buttonText).toHaveClass('sm:inline');
    });

    it('both icon and text are present in edit button', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /편집/i });

      // Icon
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument();

      // Text
      const textContent = editButton.textContent;
      expect(textContent).toContain('편집');
    });
  });

  describe('Header Layout', () => {
    it('header has correct layout structure', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('bg-white', 'border-b', 'border-gray-200', 'sticky', 'top-0', 'z-40');
    });

    it('header contains navigation and action elements', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
      expect(screen.getByText('내 정보')).toBeInTheDocument();
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    });

    it('edit button is positioned in header actions area', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      const { container } = render(<ProfilePage />);

      const header = container.querySelector('header');
      const editButton = screen.getByRole('button', { name: /편집/i });

      expect(header).toContainElement(editButton);
    });
  });

  describe('Profile Sections', () => {
    it('renders user profile information correctly', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      expect(screen.getByText('댄스러버')).toBeInTheDocument();
      expect(screen.getByText('중급')).toBeInTheDocument();
      expect(screen.getByText('강남구')).toBeInTheDocument();
      expect(screen.getByText(/가입일:/)).toBeInTheDocument();
    });

    it('renders dance styles with star ratings', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      const stars = screen.getAllByText('⭐');
      expect(stars.length).toBeGreaterThan(0);
    });

    it('renders all badge emojis', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      expect(screen.getByText('🌟')).toBeInTheDocument();
      expect(screen.getByText('👥')).toBeInTheDocument();
      expect(screen.getByText('💬')).toBeInTheDocument();
      expect(screen.getByText('📝')).toBeInTheDocument();
      expect(screen.getByText('🎯')).toBeInTheDocument();
    });

    it('renders bio section with multiline text', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      expect(screen.getByText(/안녕하세요! 스윙댄스를 사랑하는/)).toBeInTheDocument();
      expect(screen.getByText(/언제든 연락주세요~/)).toBeInTheDocument();
    });
  });

  describe('Settings Menu', () => {
    it('renders all settings menu items', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      expect(screen.getByText('알림 설정')).toBeInTheDocument();
      expect(screen.getByText('개인정보 설정')).toBeInTheDocument();
      expect(screen.getByText('계정 연결 관리')).toBeInTheDocument();
      expect(screen.getByText('도움말')).toBeInTheDocument();
      expect(screen.getByText('문의하기')).toBeInTheDocument();
      expect(screen.getByText('로그아웃')).toBeInTheDocument();
    });

    it('renders settings menu icons', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
      expect(screen.getByTestId('smartphone-icon')).toBeInTheDocument();
      expect(screen.getByTestId('help-circle-icon')).toBeInTheDocument();
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
      expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
    });

    it('settings items have proper clickable structure', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      const { container } = render(<ProfilePage />);

      const settingsItems = container.querySelectorAll('.flex.items-center.justify-between.py-2');
      expect(settingsItems.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic HTML structure', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      expect(document.querySelector('header')).toBeInTheDocument();
      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('edit button is keyboard accessible', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /편집/i });
      expect(editButton).toBeInTheDocument();

      editButton.focus();
      expect(editButton).toHaveFocus();
    });

    it('all icons have testid for screen reader compatibility', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      // Test a few key icons
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
      expect(screen.getByTestId('award-icon')).toBeInTheDocument();
    });

    it('section titles are properly structured', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      expect(screen.getByText('🎵 선호 스타일')).toBeInTheDocument();
      expect(screen.getByText('📊 활동 통계')).toBeInTheDocument();
      expect(screen.getByText('🏆 내 배지')).toBeInTheDocument();
      expect(screen.getByText('💭 자기소개')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('uses correct Button component props', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /편집/i });
      expect(editButton).toHaveClass('mock-button-primary');
      expect(editButton).toHaveClass('mock-button-sm');
      expect(editButton).toHaveClass('flex', 'items-center', 'space-x-1');
    });

    it('uses Card components for all sections', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThanOrEqual(6);
    });

    it('uses CardHeader and CardTitle components', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      const cardTitles = screen.getAllByTestId('card-title');
      expect(cardTitles.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles missing user gracefully', () => {
      (useAuth as jest.Mock).mockReturnValue({ user: null, isAuthenticated: false });

      expect(() => render(<ProfilePage />)).not.toThrow();
    });

    it('handles undefined isAuthenticated', () => {
      (useAuth as jest.Mock).mockReturnValue({ user: null, isAuthenticated: undefined });

      render(<ProfilePage />);
      expect(screen.queryByRole('button', { name: /편집/i })).not.toBeInTheDocument();
    });

    it('renders page even when router is unavailable', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      (useRouter as jest.Mock).mockReturnValue({ push: undefined });

      expect(() => render(<ProfilePage />)).not.toThrow();
    });

    it('multiple clicks on edit button call router.push multiple times', async () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      const user = userEvent.setup();
      render(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /편집/i });

      await user.click(editButton);
      await user.click(editButton);
      await user.click(editButton);

      expect(mockPush).toHaveBeenCalledTimes(3);
      expect(mockPush).toHaveBeenCalledWith('/profile/edit');
    });
  });

  describe('Layout and Styling', () => {
    it('has proper container spacing', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      const { container } = render(<ProfilePage />);

      const mainContainer = container.querySelector('.container');
      expect(mainContainer).toHaveClass('mx-auto', 'px-4', 'py-6', 'space-y-6');
    });

    it('page has minimum height and background color', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      const { container } = render(<ProfilePage />);

      const pageWrapper = container.querySelector('.min-h-screen');
      expect(pageWrapper).toHaveClass('bg-gray-50');
    });

    it('header is sticky positioned', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      const header = document.querySelector('header');
      expect(header).toHaveClass('sticky', 'top-0', 'z-40');
    });
  });

  describe('User Interaction', () => {
    it('edit button responds to click events', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /편집/i });
      fireEvent.click(editButton);

      expect(mockPush).toHaveBeenCalledWith('/profile/edit');
    });

    it('edit button does not prevent default behavior', () => {
      (useAuth as jest.Mock).mockReturnValue(mockAuthenticatedUser);
      render(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /편집/i });
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');

      editButton.dispatchEvent(clickEvent);

      expect(mockPush).toHaveBeenCalled();
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });
});
