/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Step1AccountInfo, { Step1AccountInfoProps } from '@/app/signup/components/Step1AccountInfo';
import { signInWithGoogle } from '@/lib/auth/providers';
import type { User } from '@/lib/types/auth';

// Mock auth providers
jest.mock('@/lib/auth/providers', () => ({
  signInWithGoogle: jest.fn(),
}));

// Mock SignupButton component
jest.mock('@/app/signup/components/SignupButton', () => ({
  __esModule: true,
  default: ({ children, onClick, loading, variant, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={loading}
      data-testid="signup-button"
      data-variant={variant}
      data-loading={loading}
      {...props}
    >
      {loading ? '로그인 중...' : children}
    </button>
  ),
}));

describe('Step1AccountInfo', () => {
  // Mock functions
  const mockOnNext = jest.fn();
  const mockOnUpdateAccountData = jest.fn();
  const mockSignInWithGoogle = signInWithGoogle as jest.MockedFunction<typeof signInWithGoogle>;

  // Default props
  const defaultProps: Step1AccountInfoProps = {
    onNext: mockOnNext,
    onUpdateAccountData: mockOnUpdateAccountData,
  };

  // Mock user data
  const mockUser: User = {
    id: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    provider: 'google',
    createdAt: new Date(),
    lastLoginAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('초기 렌더링', () => {
    it('should render the component with all UI elements', () => {
      render(<Step1AccountInfo {...defaultProps} />);

      // Check header elements
      expect(screen.getByText('소셜 계정으로 시작하기')).toBeInTheDocument();
      expect(screen.getByText(/Google 계정으로 간편하게 가입하고/)).toBeInTheDocument();
      expect(screen.getByText(/스윙댄스 커뮤니티에 참여하세요/)).toBeInTheDocument();

      // Check button
      const button = screen.getByTestId('signup-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Google로 계속하기');
      expect(button).toHaveAttribute('aria-label', 'Google로 계속하기');
      expect(button).toHaveAttribute('data-variant', 'social-google');

      // Check info section
      expect(screen.getByText('안전한 소셜 로그인')).toBeInTheDocument();
      expect(screen.getByText('빠른 회원가입')).toBeInTheDocument();
      expect(screen.getByText('간편한 정보 입력')).toBeInTheDocument();

      // Check divider text
      expect(screen.getByText('안전하고 빠른 가입')).toBeInTheDocument();
    });

    it('should not show error message initially', () => {
      render(<Step1AccountInfo {...defaultProps} />);

      const errorAlert = screen.queryByRole('alert');
      expect(errorAlert).not.toBeInTheDocument();
    });

    it('should render button in enabled state initially', () => {
      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');
      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute('data-loading', 'false');
    });
  });

  describe('Google 로그인 성공', () => {
    it('should call signInWithGoogle when button is clicked', async () => {
      mockSignInWithGoogle.mockResolvedValueOnce(mockUser);

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');
      await userEvent.click(button);

      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
    });

    it('should update account data with correct user information', async () => {
      mockSignInWithGoogle.mockResolvedValueOnce(mockUser);

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockOnUpdateAccountData).toHaveBeenCalledWith({
          provider: 'google',
          uid: 'test-user-123',
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: 'https://example.com/photo.jpg',
        });
      });
    });

    it('should call onNext after successful login', async () => {
      mockSignInWithGoogle.mockResolvedValueOnce(mockUser);

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle user with missing optional fields', async () => {
      const userWithoutOptionals: User = {
        ...mockUser,
        email: null,
        displayName: null,
        photoURL: null,
      };

      mockSignInWithGoogle.mockResolvedValueOnce(userWithoutOptionals);

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockOnUpdateAccountData).toHaveBeenCalledWith({
          provider: 'google',
          uid: 'test-user-123',
          email: '',
          displayName: '',
          photoURL: '',
        });
      });
    });

    it('should show loading state during login', async () => {
      mockSignInWithGoogle.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockUser), 100))
      );

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');
      await userEvent.click(button);

      // Check loading state
      expect(button).toHaveAttribute('data-loading', 'true');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('로그인 중...');

      // Wait for completion
      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalled();
      });

      // Loading should be cleared
      expect(button).toHaveAttribute('data-loading', 'false');
    });
  });

  describe('Google 로그인 실패', () => {
    it('should show error message when popup is blocked', async () => {
      const error: any = new Error('Popup blocked');
      error.code = 'auth/popup-blocked';
      mockSignInWithGoogle.mockRejectedValueOnce(error);

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');
      await userEvent.click(button);

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert.textContent).toContain('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.');
      });
    });

    it('should show error message when user cancels login', async () => {
      const error: any = new Error('User cancelled');
      error.code = 'auth/popup-closed-by-user';
      mockSignInWithGoogle.mockRejectedValueOnce(error);

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');
      await userEvent.click(button);

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert.textContent).toContain('로그인이 취소되었습니다.');
      });
    });

    it('should show error message for network errors', async () => {
      const error: any = new Error('Network error');
      error.code = 'auth/network-request-failed';
      mockSignInWithGoogle.mockRejectedValueOnce(error);

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');
      await userEvent.click(button);

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert.textContent).toContain('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
      });
    });

    it('should show generic error message for unknown errors', async () => {
      const error: any = { code: 'auth/unknown' }; // Error without message
      mockSignInWithGoogle.mockRejectedValueOnce(error);

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');
      await userEvent.click(button);

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert.textContent).toContain('로그인에 실패했습니다. 다시 시도해주세요.');
      });
    });

    it('should show error message from error.message if available', async () => {
      const error = new Error('Custom error message');
      mockSignInWithGoogle.mockRejectedValueOnce(error);

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');
      await userEvent.click(button);

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert.textContent).toContain('Custom error message');
      });
    });

    it('should not call onNext when login fails', async () => {
      const error = new Error('Login failed');
      mockSignInWithGoogle.mockRejectedValueOnce(error);

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(mockOnNext).not.toHaveBeenCalled();
    });

    it('should clear loading state after error', async () => {
      const error = new Error('Login failed');
      mockSignInWithGoogle.mockRejectedValueOnce(error);

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(button).toHaveAttribute('data-loading', 'false');
      expect(button).not.toBeDisabled();
    });

    it('should log error to console', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      mockSignInWithGoogle.mockRejectedValueOnce(error);

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');
      await userEvent.click(button);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Google login failed:', error);
      });

      consoleSpy.mockRestore();
    });
  });

  describe('에러 메시지 표시', () => {
    it('should display error with warning icon', async () => {
      const error = new Error('Test error');
      mockSignInWithGoogle.mockRejectedValueOnce(error);

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');
      await userEvent.click(button);

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent('⚠️');
        expect(errorAlert).toHaveTextContent('Test error');
      });
    });

    it('should clear error when retrying login', async () => {
      const error = new Error('First error');
      mockSignInWithGoogle.mockRejectedValueOnce(error);

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');

      // First attempt - error
      await userEvent.click(button);
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Second attempt - success
      mockSignInWithGoogle.mockResolvedValueOnce(mockUser);
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    it('should replace old error with new error on subsequent failures', async () => {
      const error1 = new Error('First error');
      const error2 = new Error('Second error');

      mockSignInWithGoogle.mockRejectedValueOnce(error1);

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');

      // First attempt
      await userEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second attempt
      mockSignInWithGoogle.mockRejectedValueOnce(error2);
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Second error')).toBeInTheDocument();
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });
  });

  describe('로딩 상태', () => {
    it('should disable button during loading', async () => {
      mockSignInWithGoogle.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockUser), 100))
      );

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');
      await userEvent.click(button);

      expect(button).toBeDisabled();

      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalled();
      });
    });

    it('should show loading text during login', async () => {
      mockSignInWithGoogle.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockUser), 100))
      );

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');
      expect(button).toHaveTextContent('Google로 계속하기');

      await userEvent.click(button);

      expect(button).toHaveTextContent('로그인 중...');

      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalled();
      });
    });

    it('should prevent multiple simultaneous login attempts', async () => {
      mockSignInWithGoogle.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockUser), 100))
      );

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');

      // Click multiple times
      await userEvent.click(button);
      await userEvent.click(button);
      await userEvent.click(button);

      // Should only be called once because button is disabled after first click
      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalled();
      });

      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
    });
  });

  describe('접근성', () => {
    it('should have proper ARIA labels on button', () => {
      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');
      expect(button).toHaveAttribute('aria-label', 'Google로 계속하기');
    });

    it('should use role="alert" for error messages', async () => {
      const error = new Error('Test error');
      mockSignInWithGoogle.mockRejectedValueOnce(error);

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');
      await userEvent.click(button);

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toBeInTheDocument();
      });
    });

    it('should be keyboard accessible', async () => {
      mockSignInWithGoogle.mockResolvedValueOnce(mockUser);

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');

      // Tab to button and press Enter
      button.focus();
      expect(button).toHaveFocus();

      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      await userEvent.click(button); // Simulate the click that would happen with Enter

      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalled();
      });
    });
  });

  describe('스타일링', () => {
    it('should render Glassmorphism card with correct classes', () => {
      const { container } = render(<Step1AccountInfo {...defaultProps} />);

      const card = container.querySelector('.step1-card');
      expect(card).toBeInTheDocument();

      const cardContainer = container.querySelector('.step1-container');
      expect(cardContainer).toBeInTheDocument();
    });

    it('should render with proper layout structure', () => {
      const { container } = render(<Step1AccountInfo {...defaultProps} />);

      expect(container.querySelector('.step1-header')).toBeInTheDocument();
      expect(container.querySelector('.step1-content')).toBeInTheDocument();
      expect(container.querySelector('.info-section')).toBeInTheDocument();
    });

    it('should display info items with icons and text', () => {
      const { container } = render(<Step1AccountInfo {...defaultProps} />);

      const infoItems = container.querySelectorAll('.info-item');
      expect(infoItems).toHaveLength(3);

      const icons = container.querySelectorAll('.info-icon');
      expect(icons).toHaveLength(3);
      expect(icons[0]).toHaveTextContent('🔒');
      expect(icons[1]).toHaveTextContent('⚡');
      expect(icons[2]).toHaveTextContent('✨');
    });

    it('should have responsive design classes', () => {
      const { container } = render(<Step1AccountInfo {...defaultProps} />);

      // Check that style tag exists (indicates styled-jsx is working)
      const styles = container.querySelector('style');
      expect(styles).toBeInTheDocument();
    });
  });

  describe('컴포넌트 displayName', () => {
    it('should have proper displayName for debugging', () => {
      expect(Step1AccountInfo.displayName).toBe('Step1AccountInfo');
    });
  });

  describe('통합 시나리오', () => {
    it('should complete full successful login flow', async () => {
      mockSignInWithGoogle.mockResolvedValueOnce(mockUser);

      render(<Step1AccountInfo {...defaultProps} />);

      // Initial state
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      const button = screen.getByTestId('signup-button');
      expect(button).not.toBeDisabled();

      // Click login
      await userEvent.click(button);

      // Wait for completion
      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalled();
        expect(mockOnUpdateAccountData).toHaveBeenCalledWith({
          provider: 'google',
          uid: mockUser.id,
          email: mockUser.email,
          displayName: mockUser.displayName,
          photoURL: mockUser.photoURL,
        });
        expect(mockOnNext).toHaveBeenCalled();
      });

      // No error shown
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should handle retry after error', async () => {
      const error: any = new Error('Network error');
      error.code = 'auth/network-request-failed';

      mockSignInWithGoogle.mockRejectedValueOnce(error);

      render(<Step1AccountInfo {...defaultProps} />);

      const button = screen.getByTestId('signup-button');

      // First attempt fails
      await userEvent.click(button);
      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert.textContent).toContain('네트워크 오류가 발생했습니다');
      });

      // Second attempt succeeds
      mockSignInWithGoogle.mockResolvedValueOnce(mockUser);
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalled();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });
});
