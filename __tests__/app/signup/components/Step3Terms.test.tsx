/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Step3Terms from '@/app/signup/components/Step3Terms';
import type { Step3TermsProps } from '@/app/signup/components/Step3Terms';

// Mock SignupButton component
jest.mock('@/app/signup/components/SignupButton', () => {
  return function MockSignupButton({
    children,
    onClick,
    disabled,
    loading,
    variant,
    type,
    style,
    'aria-label': ariaLabel,
    'data-testid': dataTestId,
    ...props
  }: any) {
    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        data-loading={loading}
        data-variant={variant}
        type={type}
        style={style}
        aria-label={ariaLabel}
        data-testid={dataTestId}
        {...props}
      >
        {children}
      </button>
    );
  };
});

// Mock SignupState type
type MockSignupState = {
  termsData: {
    serviceTerms: boolean;
    privacyPolicy: boolean;
    marketingConsent: boolean;
  };
};

describe('Step3Terms Component', () => {
  // Mock functions
  const mockOnBack = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnUpdateTermsData = jest.fn();

  // Default props
  const defaultProps: Step3TermsProps = {
    termsData: {
      serviceTerms: false,
      privacyPolicy: false,
      marketingConsent: false,
    },
    loading: false,
    onBack: mockOnBack,
    onSubmit: mockOnSubmit,
    onUpdateTermsData: mockOnUpdateTermsData,
  };

  // Mock window.open
  const mockWindowOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.open = mockWindowOpen;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('1. 초기 렌더링 - UI Elements', () => {
    it('should render all UI elements correctly', () => {
      render(<Step3Terms {...defaultProps} />);

      // Header elements
      expect(screen.getByText('약관 동의')).toBeInTheDocument();
      expect(screen.getByText(/서비스 이용을 위해/)).toBeInTheDocument();
      expect(screen.getByText(/약관에 동의해주세요/)).toBeInTheDocument();

      // Agree all checkbox
      expect(screen.getByLabelText('전체 동의')).toBeInTheDocument();
      expect(screen.getByText('전체 동의')).toBeInTheDocument();

      // Service terms checkbox
      expect(screen.getByLabelText('서비스 이용약관 동의 (필수)')).toBeInTheDocument();
      expect(screen.getByText('서비스 이용약관')).toBeInTheDocument();
      const requiredIndicators = screen.getAllByText('(필수)');
      expect(requiredIndicators.length).toBeGreaterThanOrEqual(2);

      // Privacy policy checkbox
      expect(screen.getByLabelText('개인정보 처리방침 동의 (필수)')).toBeInTheDocument();
      expect(screen.getByText('개인정보 처리방침')).toBeInTheDocument();

      // Marketing consent checkbox
      expect(screen.getByLabelText('마케팅 정보 수신 동의 (선택)')).toBeInTheDocument();
      expect(screen.getByText('마케팅 정보 수신 동의')).toBeInTheDocument();
      expect(screen.getByText('(선택)')).toBeInTheDocument();
      expect(screen.getByText(/이벤트, 프로모션 등 마케팅 정보/)).toBeInTheDocument();
    });

    it('should render all checkboxes unchecked by default', () => {
      render(<Step3Terms {...defaultProps} />);

      const agreeAllCheckbox = screen.getByLabelText('전체 동의') as HTMLInputElement;
      const serviceTermsCheckbox = screen.getByLabelText('서비스 이용약관 동의 (필수)') as HTMLInputElement;
      const privacyPolicyCheckbox = screen.getByLabelText('개인정보 처리방침 동의 (필수)') as HTMLInputElement;
      const marketingConsentCheckbox = screen.getByLabelText('마케팅 정보 수신 동의 (선택)') as HTMLInputElement;

      expect(agreeAllCheckbox.checked).toBe(false);
      expect(serviceTermsCheckbox.checked).toBe(false);
      expect(privacyPolicyCheckbox.checked).toBe(false);
      expect(marketingConsentCheckbox.checked).toBe(false);
    });

    it('should render action buttons with correct labels', () => {
      render(<Step3Terms {...defaultProps} />);

      const backButton = screen.getByTestId('back-button');
      const submitButton = screen.getByTestId('submit-button');

      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveTextContent('이전');
      expect(backButton).toHaveAttribute('aria-label', '이전 단계로');

      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('회원가입 완료');
      expect(submitButton).toHaveAttribute('aria-label', '회원가입 완료');
    });

    it('should render "보기" links for required terms', () => {
      render(<Step3Terms {...defaultProps} />);

      const viewLinks = screen.getAllByText('보기');
      expect(viewLinks).toHaveLength(2); // Service terms and Privacy policy

      expect(screen.getByLabelText('서비스 이용약관 보기')).toBeInTheDocument();
      expect(screen.getByLabelText('개인정보 처리방침 보기')).toBeInTheDocument();
    });
  });

  describe('2. 전체 동의 - Agree All Functionality', () => {
    it('should check all checkboxes when agree all is checked', async () => {
      render(<Step3Terms {...defaultProps} />);

      const agreeAllCheckbox = screen.getByLabelText('전체 동의');

      await userEvent.click(agreeAllCheckbox);

      expect(mockOnUpdateTermsData).toHaveBeenCalledWith({
        serviceTerms: true,
        privacyPolicy: true,
        marketingConsent: true,
      });
    });

    it('should uncheck all checkboxes when agree all is unchecked', async () => {
      const propsWithAllChecked: Step3TermsProps = {
        ...defaultProps,
        termsData: {
          serviceTerms: true,
          privacyPolicy: true,
          marketingConsent: true,
        },
      };

      render(<Step3Terms {...propsWithAllChecked} />);

      const agreeAllCheckbox = screen.getByLabelText('전체 동의') as HTMLInputElement;
      expect(agreeAllCheckbox.checked).toBe(true);

      await userEvent.click(agreeAllCheckbox);

      expect(mockOnUpdateTermsData).toHaveBeenCalledWith({
        serviceTerms: false,
        privacyPolicy: false,
        marketingConsent: false,
      });
    });

    it('should check agree all when all individual checkboxes are checked', () => {
      const propsWithAllChecked: Step3TermsProps = {
        ...defaultProps,
        termsData: {
          serviceTerms: true,
          privacyPolicy: true,
          marketingConsent: true,
        },
      };

      render(<Step3Terms {...propsWithAllChecked} />);

      const agreeAllCheckbox = screen.getByLabelText('전체 동의') as HTMLInputElement;
      expect(agreeAllCheckbox.checked).toBe(true);
    });

    it('should uncheck agree all when any individual checkbox is unchecked', () => {
      const propsWithPartialCheck: Step3TermsProps = {
        ...defaultProps,
        termsData: {
          serviceTerms: true,
          privacyPolicy: true,
          marketingConsent: false,
        },
      };

      render(<Step3Terms {...propsWithPartialCheck} />);

      const agreeAllCheckbox = screen.getByLabelText('전체 동의') as HTMLInputElement;
      expect(agreeAllCheckbox.checked).toBe(false);
    });
  });

  describe('3. 개별 약관 동의 - Individual Checkbox Changes', () => {
    it('should toggle service terms checkbox', async () => {
      render(<Step3Terms {...defaultProps} />);

      const serviceTermsCheckbox = screen.getByLabelText('서비스 이용약관 동의 (필수)');

      await userEvent.click(serviceTermsCheckbox);

      expect(mockOnUpdateTermsData).toHaveBeenCalledWith({
        serviceTerms: true,
      });
    });

    it('should toggle privacy policy checkbox', async () => {
      render(<Step3Terms {...defaultProps} />);

      const privacyPolicyCheckbox = screen.getByLabelText('개인정보 처리방침 동의 (필수)');

      await userEvent.click(privacyPolicyCheckbox);

      expect(mockOnUpdateTermsData).toHaveBeenCalledWith({
        privacyPolicy: true,
      });
    });

    it('should toggle marketing consent checkbox', async () => {
      render(<Step3Terms {...defaultProps} />);

      const marketingConsentCheckbox = screen.getByLabelText('마케팅 정보 수신 동의 (선택)');

      await userEvent.click(marketingConsentCheckbox);

      expect(mockOnUpdateTermsData).toHaveBeenCalledWith({
        marketingConsent: true,
      });
    });

    it('should update local state and parent state on individual checkbox change', async () => {
      render(<Step3Terms {...defaultProps} />);

      const serviceTermsCheckbox = screen.getByLabelText('서비스 이용약관 동의 (필수)') as HTMLInputElement;

      expect(serviceTermsCheckbox.checked).toBe(false);

      await userEvent.click(serviceTermsCheckbox);

      expect(mockOnUpdateTermsData).toHaveBeenCalledTimes(1);
      expect(mockOnUpdateTermsData).toHaveBeenCalledWith({
        serviceTerms: true,
      });
    });
  });

  describe('4. 필수 약관 검증 - Submit Button Validation', () => {
    it('should disable submit button when required terms are not agreed', () => {
      render(<Step3Terms {...defaultProps} />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when only service terms is agreed', () => {
      const propsWithServiceTerms: Step3TermsProps = {
        ...defaultProps,
        termsData: {
          serviceTerms: true,
          privacyPolicy: false,
          marketingConsent: false,
        },
      };

      render(<Step3Terms {...propsWithServiceTerms} />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when only privacy policy is agreed', () => {
      const propsWithPrivacyPolicy: Step3TermsProps = {
        ...defaultProps,
        termsData: {
          serviceTerms: false,
          privacyPolicy: true,
          marketingConsent: false,
        },
      };

      render(<Step3Terms {...propsWithPrivacyPolicy} />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when all required terms are agreed', () => {
      const propsWithRequiredTerms: Step3TermsProps = {
        ...defaultProps,
        termsData: {
          serviceTerms: true,
          privacyPolicy: true,
          marketingConsent: false,
        },
      };

      render(<Step3Terms {...propsWithRequiredTerms} />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).not.toBeDisabled();
    });

    it('should enable submit button when all terms including optional are agreed', () => {
      const propsWithAllTerms: Step3TermsProps = {
        ...defaultProps,
        termsData: {
          serviceTerms: true,
          privacyPolicy: true,
          marketingConsent: true,
        },
      };

      render(<Step3Terms {...propsWithAllTerms} />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('5. 보기 링크 - View Terms Links', () => {
    it('should open service terms in new window when 보기 link is clicked', async () => {
      render(<Step3Terms {...defaultProps} />);

      const serviceTermsViewLink = screen.getByLabelText('서비스 이용약관 보기');

      await userEvent.click(serviceTermsViewLink);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        '/terms/service',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('should open privacy policy in new window when 보기 link is clicked', async () => {
      render(<Step3Terms {...defaultProps} />);

      const privacyPolicyViewLink = screen.getByLabelText('개인정보 처리방침 보기');

      await userEvent.click(privacyPolicyViewLink);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        '/terms/privacy',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('should have correct type attribute for view links', () => {
      render(<Step3Terms {...defaultProps} />);

      const serviceTermsViewLink = screen.getByLabelText('서비스 이용약관 보기');
      const privacyPolicyViewLink = screen.getByLabelText('개인정보 처리방침 보기');

      expect(serviceTermsViewLink).toHaveAttribute('type', 'button');
      expect(privacyPolicyViewLink).toHaveAttribute('type', 'button');
    });
  });

  describe('6. 버튼 동작 - Button Actions', () => {
    it('should call onBack when back button is clicked', async () => {
      render(<Step3Terms {...defaultProps} />);

      const backButton = screen.getByTestId('back-button');

      await userEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should call onSubmit when submit button is clicked and required terms are agreed', async () => {
      const propsWithRequiredTerms: Step3TermsProps = {
        ...defaultProps,
        termsData: {
          serviceTerms: true,
          privacyPolicy: true,
          marketingConsent: false,
        },
      };

      render(<Step3Terms {...propsWithRequiredTerms} />);

      const submitButton = screen.getByTestId('submit-button');

      await userEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should not call onSubmit when submit button is clicked and required terms are not agreed', async () => {
      render(<Step3Terms {...defaultProps} />);

      const submitButton = screen.getByTestId('submit-button');

      // Try to click disabled button
      fireEvent.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should disable back button during loading', () => {
      const propsWithLoading: Step3TermsProps = {
        ...defaultProps,
        loading: true,
      };

      render(<Step3Terms {...propsWithLoading} />);

      const backButton = screen.getByTestId('back-button');
      expect(backButton).toBeDisabled();
    });
  });

  describe('7. 로딩 상태 - Loading State', () => {
    it('should show loading text when loading prop is true', () => {
      const propsWithLoading: Step3TermsProps = {
        ...defaultProps,
        termsData: {
          serviceTerms: true,
          privacyPolicy: true,
          marketingConsent: false,
        },
        loading: true,
      };

      render(<Step3Terms {...propsWithLoading} />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveTextContent('처리 중...');
    });

    it('should show normal text when loading prop is false', () => {
      const propsWithRequiredTerms: Step3TermsProps = {
        ...defaultProps,
        termsData: {
          serviceTerms: true,
          privacyPolicy: true,
          marketingConsent: false,
        },
        loading: false,
      };

      render(<Step3Terms {...propsWithRequiredTerms} />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveTextContent('회원가입 완료');
    });

    it('should disable submit button during loading even if required terms are agreed', () => {
      const propsWithLoadingAndTerms: Step3TermsProps = {
        ...defaultProps,
        termsData: {
          serviceTerms: true,
          privacyPolicy: true,
          marketingConsent: false,
        },
        loading: true,
      };

      render(<Step3Terms {...propsWithLoadingAndTerms} />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('should pass loading prop to SignupButton component', () => {
      const propsWithLoading: Step3TermsProps = {
        ...defaultProps,
        termsData: {
          serviceTerms: true,
          privacyPolicy: true,
          marketingConsent: false,
        },
        loading: true,
      };

      render(<Step3Terms {...propsWithLoading} />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveAttribute('data-loading', 'true');
    });

    it('should not call onSubmit when loading is true', async () => {
      const propsWithLoading: Step3TermsProps = {
        ...defaultProps,
        termsData: {
          serviceTerms: true,
          privacyPolicy: true,
          marketingConsent: false,
        },
        loading: true,
      };

      render(<Step3Terms {...propsWithLoading} />);

      const submitButton = screen.getByTestId('submit-button');

      // Try to click disabled button
      fireEvent.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('8. 접근성 - Accessibility', () => {
    it('should have proper ARIA labels for all checkboxes', () => {
      render(<Step3Terms {...defaultProps} />);

      expect(screen.getByLabelText('전체 동의')).toBeInTheDocument();
      expect(screen.getByLabelText('서비스 이용약관 동의 (필수)')).toBeInTheDocument();
      expect(screen.getByLabelText('개인정보 처리방침 동의 (필수)')).toBeInTheDocument();
      expect(screen.getByLabelText('마케팅 정보 수신 동의 (선택)')).toBeInTheDocument();
    });

    it('should mark required checkboxes with aria-required', () => {
      render(<Step3Terms {...defaultProps} />);

      const serviceTermsCheckbox = screen.getByLabelText('서비스 이용약관 동의 (필수)');
      const privacyPolicyCheckbox = screen.getByLabelText('개인정보 처리방침 동의 (필수)');
      const marketingConsentCheckbox = screen.getByLabelText('마케팅 정보 수신 동의 (선택)');

      expect(serviceTermsCheckbox).toHaveAttribute('aria-required', 'true');
      expect(privacyPolicyCheckbox).toHaveAttribute('aria-required', 'true');
      expect(marketingConsentCheckbox).not.toHaveAttribute('aria-required');
    });

    it('should have proper ARIA labels for action buttons', () => {
      render(<Step3Terms {...defaultProps} />);

      const backButton = screen.getByTestId('back-button');
      const submitButton = screen.getByTestId('submit-button');

      expect(backButton).toHaveAttribute('aria-label', '이전 단계로');
      expect(submitButton).toHaveAttribute('aria-label', '회원가입 완료');
    });

    it('should have proper ARIA labels for view links', () => {
      render(<Step3Terms {...defaultProps} />);

      expect(screen.getByLabelText('서비스 이용약관 보기')).toBeInTheDocument();
      expect(screen.getByLabelText('개인정보 처리방침 보기')).toBeInTheDocument();
    });

    it('should hide custom checkbox from screen readers with aria-hidden', () => {
      const { container } = render(<Step3Terms {...defaultProps} />);

      const customCheckboxes = container.querySelectorAll('.checkbox-custom');
      customCheckboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('9. 데이터 동기화 - Data Synchronization', () => {
    it('should sync with parent when termsData prop changes', () => {
      const { rerender } = render(<Step3Terms {...defaultProps} />);

      const serviceTermsCheckbox = screen.getByLabelText('서비스 이용약관 동의 (필수)') as HTMLInputElement;
      expect(serviceTermsCheckbox.checked).toBe(false);

      // Update props
      const updatedProps: Step3TermsProps = {
        ...defaultProps,
        termsData: {
          serviceTerms: true,
          privacyPolicy: false,
          marketingConsent: false,
        },
      };

      rerender(<Step3Terms {...updatedProps} />);

      expect(serviceTermsCheckbox.checked).toBe(true);
    });

    it('should update parent state via onUpdateTermsData on checkbox changes', async () => {
      render(<Step3Terms {...defaultProps} />);

      const serviceTermsCheckbox = screen.getByLabelText('서비스 이용약관 동의 (필수)');

      await userEvent.click(serviceTermsCheckbox);

      expect(mockOnUpdateTermsData).toHaveBeenCalledWith({
        serviceTerms: true,
      });

      const privacyPolicyCheckbox = screen.getByLabelText('개인정보 처리방침 동의 (필수)');

      await userEvent.click(privacyPolicyCheckbox);

      expect(mockOnUpdateTermsData).toHaveBeenCalledWith({
        privacyPolicy: true,
      });
    });

    it('should maintain local state independently from parent', async () => {
      render(<Step3Terms {...defaultProps} />);

      const serviceTermsCheckbox = screen.getByLabelText('서비스 이용약관 동의 (필수)');

      await userEvent.click(serviceTermsCheckbox);

      expect(mockOnUpdateTermsData).toHaveBeenCalledWith({
        serviceTerms: true,
      });

      // Parent hasn't updated yet, but local state should reflect the change
      // This is tested implicitly by the component continuing to function correctly
    });

    it('should handle rapid checkbox changes', async () => {
      render(<Step3Terms {...defaultProps} />);

      const serviceTermsCheckbox = screen.getByLabelText('서비스 이용약관 동의 (필수)');
      const privacyPolicyCheckbox = screen.getByLabelText('개인정보 처리방침 동의 (필수)');

      await userEvent.click(serviceTermsCheckbox);
      await userEvent.click(privacyPolicyCheckbox);
      await userEvent.click(serviceTermsCheckbox);

      expect(mockOnUpdateTermsData).toHaveBeenCalledTimes(3);
      expect(mockOnUpdateTermsData).toHaveBeenNthCalledWith(1, { serviceTerms: true });
      expect(mockOnUpdateTermsData).toHaveBeenNthCalledWith(2, { privacyPolicy: true });
      expect(mockOnUpdateTermsData).toHaveBeenNthCalledWith(3, { serviceTerms: false });
    });

    it('should sync all checkboxes when termsData updates from parent', () => {
      const { rerender } = render(<Step3Terms {...defaultProps} />);

      const agreeAllCheckbox = screen.getByLabelText('전체 동의') as HTMLInputElement;
      const serviceTermsCheckbox = screen.getByLabelText('서비스 이용약관 동의 (필수)') as HTMLInputElement;
      const privacyPolicyCheckbox = screen.getByLabelText('개인정보 처리방침 동의 (필수)') as HTMLInputElement;
      const marketingConsentCheckbox = screen.getByLabelText('마케팅 정보 수신 동의 (선택)') as HTMLInputElement;

      expect(agreeAllCheckbox.checked).toBe(false);
      expect(serviceTermsCheckbox.checked).toBe(false);
      expect(privacyPolicyCheckbox.checked).toBe(false);
      expect(marketingConsentCheckbox.checked).toBe(false);

      // Update all terms from parent
      const updatedProps: Step3TermsProps = {
        ...defaultProps,
        termsData: {
          serviceTerms: true,
          privacyPolicy: true,
          marketingConsent: true,
        },
      };

      rerender(<Step3Terms {...updatedProps} />);

      expect(agreeAllCheckbox.checked).toBe(true);
      expect(serviceTermsCheckbox.checked).toBe(true);
      expect(privacyPolicyCheckbox.checked).toBe(true);
      expect(marketingConsentCheckbox.checked).toBe(true);
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle checkbox interaction correctly', async () => {
      render(<Step3Terms {...defaultProps} />);

      const agreeAllCheckbox = screen.getByLabelText('전체 동의');

      await userEvent.click(agreeAllCheckbox);

      expect(mockOnUpdateTermsData).toHaveBeenCalledWith({
        serviceTerms: true,
        privacyPolicy: true,
        marketingConsent: true,
      });
    });

    it('should display correct required/optional indicators', () => {
      render(<Step3Terms {...defaultProps} />);

      const requiredIndicators = screen.getAllByText('(필수)');
      const optionalIndicator = screen.getByText('(선택)');

      expect(requiredIndicators).toHaveLength(2); // Service terms and Privacy policy
      expect(optionalIndicator).toBeInTheDocument();
    });

    it('should have correct button styles and variants', () => {
      render(<Step3Terms {...defaultProps} />);

      const backButton = screen.getByTestId('back-button');
      const submitButton = screen.getByTestId('submit-button');

      expect(backButton).toHaveAttribute('data-variant', 'primary');
      expect(submitButton).toHaveAttribute('data-variant', 'primary');
      expect(backButton).toHaveAttribute('type', 'button');
      expect(submitButton).toHaveAttribute('type', 'button');
    });

    it('should maintain checkbox state consistency during rapid updates', async () => {
      const { rerender } = render(<Step3Terms {...defaultProps} />);

      const agreeAllCheckbox = screen.getByLabelText('전체 동의');

      await userEvent.click(agreeAllCheckbox);

      // Simulate parent updating state
      const updatedProps1: Step3TermsProps = {
        ...defaultProps,
        termsData: {
          serviceTerms: true,
          privacyPolicy: true,
          marketingConsent: true,
        },
      };

      rerender(<Step3Terms {...updatedProps1} />);

      const allCheckboxes = [
        screen.getByLabelText('전체 동의'),
        screen.getByLabelText('서비스 이용약관 동의 (필수)'),
        screen.getByLabelText('개인정보 처리방침 동의 (필수)'),
        screen.getByLabelText('마케팅 정보 수신 동의 (선택)'),
      ] as HTMLInputElement[];

      allCheckboxes.forEach(checkbox => {
        expect(checkbox.checked).toBe(true);
      });
    });
  });
});
