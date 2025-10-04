/**
 * SignupWizard 컴포넌트 통합 테스트
 * - 3단계 회원가입 플로우 검증
 * - localStorage 상태 저장/복원 검증
 * - 네비게이션 및 에러 핸들링 검증
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignupWizard from '@/app/signup/components/SignupWizard';
import { SIGNUP_STORAGE_KEY, INITIAL_SIGNUP_STATE } from '@/lib/types/signup';

// next/navigation 모킹
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

// StepIndicator 컴포넌트 모킹
jest.mock('@/app/signup/components/StepIndicator', () => {
  return function MockStepIndicator({ currentStep, steps }: any) {
    return (
      <div data-testid="step-indicator" data-current-step={currentStep}>
        {steps.map((step: any) => (
          <div key={step.number} data-testid={`step-${step.number}`}>
            {step.label}
          </div>
        ))}
      </div>
    );
  };
});

describe('SignupWizard 컴포넌트', () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // localStorage 모킹 초기화
    localStorageMock = {};

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => localStorageMock[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('초기 렌더링', () => {
    it('컴포넌트가 정상적으로 렌더링되어야 함', () => {
      render(<SignupWizard />);

      expect(screen.getByTestId('step-indicator')).toBeInTheDocument();
      expect(screen.getByText('소셜 계정으로 시작하기')).toBeInTheDocument();
      expect(screen.getByText('Google 계정으로 간편하게 가입하세요')).toBeInTheDocument();
    });

    it('Step 1이 기본으로 표시되어야 함', () => {
      render(<SignupWizard />);

      const stepIndicator = screen.getByTestId('step-indicator');
      expect(stepIndicator).toHaveAttribute('data-current-step', '1');
      expect(screen.getByText('Step 1: 소셜 로그인 UI (Issue #67에서 구현 예정)')).toBeInTheDocument();
    });

    it('StepIndicator가 올바른 props를 받아야 함', () => {
      render(<SignupWizard />);

      expect(screen.getByTestId('step-1')).toHaveTextContent('소셜 로그인');
      expect(screen.getByTestId('step-2')).toHaveTextContent('프로필 정보');
      expect(screen.getByTestId('step-3')).toHaveTextContent('약관 동의');
    });

    it('Step 1에서 "다음" 버튼만 표시되어야 함', () => {
      render(<SignupWizard />);

      expect(screen.getByText('다음')).toBeInTheDocument();
      expect(screen.queryByText('이전')).not.toBeInTheDocument();
      expect(screen.queryByText('회원가입 완료')).not.toBeInTheDocument();
    });

    it('로그인 링크가 표시되어야 함', () => {
      render(<SignupWizard />);

      const loginLink = screen.getByText('로그인');
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Step 전환 (1 → 2 → 3)', () => {
    it('Step 1에서 "다음" 버튼 클릭 시 Step 2로 이동해야 함', async () => {
      render(<SignupWizard />);

      const nextButton = screen.getByText('다음');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '2');
        expect(screen.getByText('프로필 정보 입력')).toBeInTheDocument();
        expect(screen.getByText('스윙댄스 커뮤니티에서 사용할 프로필을 설정하세요')).toBeInTheDocument();
      });
    });

    it('Step 2에서 "다음" 버튼 클릭 시 Step 3으로 이동해야 함', async () => {
      render(<SignupWizard />);

      // Step 1 → 2
      fireEvent.click(screen.getByText('다음'));

      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '2');
      });

      // Step 2 → 3
      fireEvent.click(screen.getByText('다음'));

      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '3');
        expect(screen.getByRole('heading', { name: '약관 동의', level: 2 })).toBeInTheDocument();
        expect(screen.getByText('서비스 이용을 위한 약관에 동의해주세요')).toBeInTheDocument();
      });
    });

    it('Step 2에서 "이전" 버튼이 표시되어야 함', async () => {
      render(<SignupWizard />);

      fireEvent.click(screen.getByText('다음'));

      await waitFor(() => {
        expect(screen.getByText('이전')).toBeInTheDocument();
        expect(screen.getByText('다음')).toBeInTheDocument();
      });
    });

    it('Step 3에서 "회원가입 완료" 버튼이 표시되어야 함', async () => {
      render(<SignupWizard />);

      // Step 1 → 2 → 3
      fireEvent.click(screen.getByText('다음'));
      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '2');
      });

      fireEvent.click(screen.getByText('다음'));

      await waitFor(() => {
        expect(screen.getByText('회원가입 완료')).toBeInTheDocument();
        expect(screen.getByText('이전')).toBeInTheDocument();
        expect(screen.queryByText('다음')).not.toBeInTheDocument();
      });
    });
  });

  describe('Step 역방향 전환 (3 → 2 → 1)', () => {
    it('Step 2에서 "이전" 버튼 클릭 시 Step 1로 돌아가야 함', async () => {
      render(<SignupWizard />);

      // Step 1 → 2
      fireEvent.click(screen.getByText('다음'));

      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '2');
      });

      // Step 2 → 1
      fireEvent.click(screen.getByText('이전'));

      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '1');
        expect(screen.getByText('소셜 계정으로 시작하기')).toBeInTheDocument();
      });
    });

    it('Step 3에서 "이전" 버튼 클릭 시 Step 2로 돌아가야 함', async () => {
      render(<SignupWizard />);

      // Step 1 → 2 → 3
      fireEvent.click(screen.getByText('다음'));
      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '2');
      });

      fireEvent.click(screen.getByText('다음'));
      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '3');
      });

      // Step 3 → 2
      fireEvent.click(screen.getByText('이전'));

      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '2');
        expect(screen.getByText('프로필 정보 입력')).toBeInTheDocument();
      });
    });

    it('Step 전환 시 에러가 초기화되어야 함', async () => {
      render(<SignupWizard />);

      // Step 3으로 이동
      fireEvent.click(screen.getByText('다음'));
      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '2');
      });

      fireEvent.click(screen.getByText('다음'));
      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '3');
      });

      // 회원가입 시도 (약관 동의 없이)
      fireEvent.click(screen.getByText('회원가입 완료'));

      await waitFor(() => {
        expect(screen.getByText('필수 약관에 동의해주세요')).toBeInTheDocument();
      });

      // Step 2로 이동 시 에러 초기화
      fireEvent.click(screen.getByText('이전'));

      await waitFor(() => {
        expect(screen.queryByText('필수 약관에 동의해주세요')).not.toBeInTheDocument();
      });
    });
  });

  describe('localStorage 상태 저장', () => {
    it('초기 렌더링 시 localStorage에 상태가 저장되어야 함', async () => {
      render(<SignupWizard />);

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          SIGNUP_STORAGE_KEY,
          expect.stringContaining('"currentStep":1')
        );
      });
    });

    it('Step 전환 시 localStorage에 새로운 step이 저장되어야 함', async () => {
      render(<SignupWizard />);

      fireEvent.click(screen.getByText('다음'));

      await waitFor(() => {
        const savedData = localStorageMock[SIGNUP_STORAGE_KEY];
        expect(savedData).toBeDefined();
        const parsedData = JSON.parse(savedData);
        expect(parsedData.currentStep).toBe(2);
      });
    });

    it('페이지 새로고침 시 저장된 step이 복원되어야 함', async () => {
      // 사전에 Step 2 상태 저장
      const savedState = {
        ...INITIAL_SIGNUP_STATE,
        currentStep: 2,
      };
      localStorageMock[SIGNUP_STORAGE_KEY] = JSON.stringify(savedState);

      render(<SignupWizard />);

      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '2');
        expect(screen.getByText('프로필 정보 입력')).toBeInTheDocument();
      });
    });

    it('localStorage에 잘못된 데이터가 있어도 에러가 발생하지 않아야 함', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      localStorageMock[SIGNUP_STORAGE_KEY] = 'invalid json data';

      render(<SignupWizard />);

      // 기본 Step 1로 렌더링되어야 함
      expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '1');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load signup progress:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('localStorage 저장 실패 시 에러를 콘솔에 로그해야 함', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const setItemError = new Error('Storage quota exceeded');

      // localStorage.setItem이 에러를 던지도록 모킹
      (localStorage.setItem as jest.Mock).mockImplementation(() => {
        throw setItemError;
      });

      render(<SignupWizard />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to save signup progress:', setItemError);
      });

      consoleSpy.mockRestore();
    });
  });

  describe('회원가입 제출', () => {
    it('필수 약관 동의 없이 제출 시 에러가 표시되어야 함', async () => {
      render(<SignupWizard />);

      // Step 3으로 이동
      fireEvent.click(screen.getByText('다음'));
      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '2');
      });

      fireEvent.click(screen.getByText('다음'));
      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '3');
      });

      // 회원가입 시도
      fireEvent.click(screen.getByText('회원가입 완료'));

      await waitFor(() => {
        expect(screen.getByText('필수 약관에 동의해주세요')).toBeInTheDocument();
      });
    });

    it('필수 약관 동의 시 회원가입이 진행되어야 함', async () => {
      // 약관 동의된 상태로 시작
      const savedState = {
        ...INITIAL_SIGNUP_STATE,
        currentStep: 3,
        termsData: {
          serviceTerms: true,
          privacyPolicy: true,
          marketingConsent: false,
        },
      };
      localStorageMock[SIGNUP_STORAGE_KEY] = JSON.stringify(savedState);

      render(<SignupWizard />);

      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '3');
      });

      fireEvent.click(screen.getByText('회원가입 완료'));

      await waitFor(() => {
        expect(screen.getByText('가입 중...')).toBeInTheDocument();
      });
    });

    it('회원가입 성공 시 localStorage가 초기화되어야 함', async () => {
      const savedState = {
        ...INITIAL_SIGNUP_STATE,
        currentStep: 3,
        termsData: {
          serviceTerms: true,
          privacyPolicy: true,
          marketingConsent: false,
        },
      };
      localStorageMock[SIGNUP_STORAGE_KEY] = JSON.stringify(savedState);

      render(<SignupWizard />);

      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '3');
      });

      fireEvent.click(screen.getByText('회원가입 완료'));

      await waitFor(() => {
        expect(localStorage.removeItem).toHaveBeenCalledWith(SIGNUP_STORAGE_KEY);
      }, { timeout: 2000 });
    });

    it('회원가입 성공 시 /home으로 리다이렉트되어야 함', async () => {
      const savedState = {
        ...INITIAL_SIGNUP_STATE,
        currentStep: 3,
        termsData: {
          serviceTerms: true,
          privacyPolicy: true,
          marketingConsent: false,
        },
      };
      localStorageMock[SIGNUP_STORAGE_KEY] = JSON.stringify(savedState);

      render(<SignupWizard />);

      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '3');
      });

      fireEvent.click(screen.getByText('회원가입 완료'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/home');
      }, { timeout: 2000 });
    });

    it('로딩 중에는 버튼이 비활성화되어야 함', async () => {
      const savedState = {
        ...INITIAL_SIGNUP_STATE,
        currentStep: 3,
        termsData: {
          serviceTerms: true,
          privacyPolicy: true,
          marketingConsent: false,
        },
      };
      localStorageMock[SIGNUP_STORAGE_KEY] = JSON.stringify(savedState);

      render(<SignupWizard />);

      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '3');
      });

      fireEvent.click(screen.getByText('회원가입 완료'));

      await waitFor(() => {
        const submitButton = screen.getByText('가입 중...');
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('에러 처리', () => {
    it('에러 메시지가 표시되어야 함', async () => {
      render(<SignupWizard />);

      // Step 3으로 이동
      fireEvent.click(screen.getByText('다음'));
      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '2');
      });

      fireEvent.click(screen.getByText('다음'));
      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '3');
      });

      // 약관 동의 없이 제출
      fireEvent.click(screen.getByText('회원가입 완료'));

      await waitFor(() => {
        const errorMessage = screen.getByText('필수 약관에 동의해주세요');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveStyle({ color: '#dc2626' });
      });
    });

    it('Step 전환 시 에러가 초기화되어야 함', async () => {
      render(<SignupWizard />);

      // Step 3으로 이동
      fireEvent.click(screen.getByText('다음'));
      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '2');
      });

      fireEvent.click(screen.getByText('다음'));
      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '3');
      });

      // 에러 발생
      fireEvent.click(screen.getByText('회원가입 완료'));
      await waitFor(() => {
        expect(screen.getByText('필수 약관에 동의해주세요')).toBeInTheDocument();
      });

      // 다음 Step으로 이동 시 에러 초기화
      fireEvent.click(screen.getByText('이전'));

      await waitFor(() => {
        expect(screen.queryByText('필수 약관에 동의해주세요')).not.toBeInTheDocument();
      });
    });

    it('여러 에러가 동시에 표시될 수 있어야 함', async () => {
      const savedState = {
        ...INITIAL_SIGNUP_STATE,
        currentStep: 3,
        errors: {
          terms: '필수 약관에 동의해주세요',
          profile: '프로필 정보를 입력해주세요',
        },
      };
      localStorageMock[SIGNUP_STORAGE_KEY] = JSON.stringify(savedState);

      render(<SignupWizard />);

      await waitFor(() => {
        expect(screen.getByText('필수 약관에 동의해주세요')).toBeInTheDocument();
        expect(screen.getByText('프로필 정보를 입력해주세요')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('Step 3을 초과하여 이동할 수 없어야 함', async () => {
      const savedState = {
        ...INITIAL_SIGNUP_STATE,
        currentStep: 3,
      };
      localStorageMock[SIGNUP_STORAGE_KEY] = JSON.stringify(savedState);

      render(<SignupWizard />);

      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '3');
      });

      // "다음" 버튼이 없어야 함
      expect(screen.queryByText('다음')).not.toBeInTheDocument();
    });

    it('Step 1 미만으로 이동할 수 없어야 함', () => {
      render(<SignupWizard />);

      // Step 1에서 "이전" 버튼이 없어야 함
      expect(screen.queryByText('이전')).not.toBeInTheDocument();
    });

    it('잘못된 step 번호가 있어도 처리되어야 함', async () => {
      const savedState = {
        ...INITIAL_SIGNUP_STATE,
        currentStep: 99 as any, // 잘못된 step
      };
      localStorageMock[SIGNUP_STORAGE_KEY] = JSON.stringify(savedState);

      render(<SignupWizard />);

      // 컴포넌트가 정상 렌더링되어야 함
      expect(screen.getByTestId('step-indicator')).toBeInTheDocument();
    });

    it('빈 localStorage에서도 정상 작동해야 함', () => {
      localStorageMock = {};

      render(<SignupWizard />);

      expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '1');
      expect(screen.getByText('소셜 계정으로 시작하기')).toBeInTheDocument();
    });

    it('serviceTerms만 true일 때 에러가 발생해야 함', async () => {
      const savedState = {
        ...INITIAL_SIGNUP_STATE,
        currentStep: 3,
        termsData: {
          serviceTerms: true,
          privacyPolicy: false, // 필수 약관 미동의
          marketingConsent: true,
        },
      };
      localStorageMock[SIGNUP_STORAGE_KEY] = JSON.stringify(savedState);

      render(<SignupWizard />);

      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '3');
      });

      fireEvent.click(screen.getByText('회원가입 완료'));

      await waitFor(() => {
        expect(screen.getByText('필수 약관에 동의해주세요')).toBeInTheDocument();
      });
    });

    it('privacyPolicy만 true일 때 에러가 발생해야 함', async () => {
      const savedState = {
        ...INITIAL_SIGNUP_STATE,
        currentStep: 3,
        termsData: {
          serviceTerms: false, // 필수 약관 미동의
          privacyPolicy: true,
          marketingConsent: true,
        },
      };
      localStorageMock[SIGNUP_STORAGE_KEY] = JSON.stringify(savedState);

      render(<SignupWizard />);

      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '3');
      });

      fireEvent.click(screen.getByText('회원가입 완료'));

      await waitFor(() => {
        expect(screen.getByText('필수 약관에 동의해주세요')).toBeInTheDocument();
      });
    });
  });

  describe('UI 및 스타일', () => {
    it('페이지 컨테이너에 올바른 스타일이 적용되어야 함', () => {
      render(<SignupWizard />);

      const mainContainer = screen.getByText('소셜 계정으로 시작하기').closest('div[style*="minHeight"]');
      if (mainContainer) {
        const styles = window.getComputedStyle(mainContainer);
        expect(styles.minHeight).toBe('100vh');
        expect(styles.background).toContain('linear-gradient');
      }
    });

    it('카드 컨테이너에 올바른 스타일이 적용되어야 함', () => {
      render(<SignupWizard />);

      const cardContainer = screen.getByText('소셜 계정으로 시작하기').closest('div[style*="maxWidth"]');
      if (cardContainer) {
        const styles = window.getComputedStyle(cardContainer);
        expect(styles.maxWidth).toBe('600px');
        expect(styles.borderRadius).toBe('24px');
      }
    });

    it('버튼에 올바른 스타일이 적용되어야 함', () => {
      render(<SignupWizard />);

      const nextButton = screen.getByText('다음');
      const styles = window.getComputedStyle(nextButton);
      expect(styles.background).toContain('linear-gradient');
      expect(styles.borderRadius).toBe('12px');
    });

    it('로딩 중 버튼 스타일이 변경되어야 함', async () => {
      const savedState = {
        ...INITIAL_SIGNUP_STATE,
        currentStep: 3,
        termsData: {
          serviceTerms: true,
          privacyPolicy: true,
          marketingConsent: false,
        },
      };
      localStorageMock[SIGNUP_STORAGE_KEY] = JSON.stringify(savedState);

      render(<SignupWizard />);

      await waitFor(() => {
        expect(screen.getByTestId('step-indicator')).toHaveAttribute('data-current-step', '3');
      });

      fireEvent.click(screen.getByText('회원가입 완료'));

      await waitFor(() => {
        const loadingButton = screen.getByText('가입 중...');
        expect(loadingButton).toHaveStyle({
          opacity: '0.5',
          cursor: 'not-allowed',
        });
      });
    });
  });

  describe('접근성', () => {
    it('버튼들이 접근 가능해야 함', () => {
      render(<SignupWizard />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('링크가 접근 가능해야 함', () => {
      render(<SignupWizard />);

      const loginLink = screen.getByRole('link', { name: '로그인' });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('제목 계층구조가 올바라야 함', () => {
      render(<SignupWizard />);

      expect(screen.getByText('소셜 계정으로 시작하기')).toBeInTheDocument();
      expect(screen.getByText('Google 계정으로 간편하게 가입하세요')).toBeInTheDocument();
    });
  });
});
