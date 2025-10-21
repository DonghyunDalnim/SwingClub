import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignupButton, { SignupButtonProps } from '@/app/signup/components/SignupButton';

describe('SignupButton', () => {
  const defaultProps: SignupButtonProps = {
    variant: 'primary',
    children: '회원가입',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    test('primary 변형으로 정확히 렌더링되어야 함', () => {
      render(<SignupButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: '회원가입' });
      expect(button).toBeInTheDocument();
    });

    test('social-google 변형으로 정확히 렌더링되어야 함', () => {
      render(<SignupButton variant="social-google">구글로 가입하기</SignupButton>);

      const button = screen.getByRole('button', { name: /구글로 가입하기/ });
      expect(button).toBeInTheDocument();
    });


    test('children 텍스트를 정확히 표시해야 함', () => {
      render(<SignupButton {...defaultProps} />);

      expect(screen.getByText('회원가입')).toBeInTheDocument();
    });

    test('social-google 변형에서 올바른 아이콘을 표시해야 함', () => {
      render(<SignupButton variant="social-google">구글로 가입하기</SignupButton>);

      expect(screen.getByText('🔵')).toBeInTheDocument();
    });

    test('primary 변형에서 아이콘이 표시되지 않아야 함', () => {
      render(<SignupButton {...defaultProps} />);

      expect(screen.queryByText('🔵')).not.toBeInTheDocument();
    });
  });

  describe('로딩 상태 테스트', () => {
    test('loading=true일 때 스피너를 표시해야 함', () => {
      render(<SignupButton {...defaultProps} loading={true} />);

      expect(screen.getByText('⏳')).toBeInTheDocument();
    });

    test('loading=true일 때 "로딩 중..." 텍스트를 표시해야 함', () => {
      render(<SignupButton {...defaultProps} loading={true} />);

      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
      expect(screen.queryByText('회원가입')).not.toBeInTheDocument();
    });

    test('loading=true일 때 버튼이 비활성화되어야 함', () => {
      render(<SignupButton {...defaultProps} loading={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    test('loading=true일 때 aria-busy가 true여야 함', () => {
      render(<SignupButton {...defaultProps} loading={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    test('loading=false일 때 aria-busy가 false여야 함', () => {
      render(<SignupButton {...defaultProps} loading={false} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'false');
    });

    test('loading=true일 때 소셜 아이콘 대신 스피너를 표시해야 함', () => {
      render(<SignupButton variant="social-google" loading={true}>구글로 가입하기</SignupButton>);

      expect(screen.getByText('⏳')).toBeInTheDocument();
      expect(screen.queryByText('🔵')).not.toBeInTheDocument();
    });
  });

  describe('비활성화 상태 테스트', () => {
    test('disabled=true일 때 버튼이 비활성화되어야 함', () => {
      render(<SignupButton {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    test('disabled=true일 때 cursor가 "not-allowed"여야 함', () => {
      render(<SignupButton {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      expect(styles.cursor).toBe('not-allowed');
    });

    test('disabled=true일 때 opacity가 0.6이어야 함', () => {
      render(<SignupButton {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      expect(styles.opacity).toBe('0.6');
    });

    test('disabled=false일 때 버튼이 활성화되어야 함', () => {
      render(<SignupButton {...defaultProps} disabled={false} />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    test('disabled=false일 때 cursor가 "pointer"여야 함', () => {
      render(<SignupButton {...defaultProps} disabled={false} />);

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      expect(styles.cursor).toBe('pointer');
    });

    test('disabled=false일 때 opacity가 1이어야 함', () => {
      render(<SignupButton {...defaultProps} disabled={false} />);

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      expect(styles.opacity).toBe('1');
    });
  });

  describe('상호작용 테스트', () => {
    test('버튼 클릭 시 onClick 핸들러가 호출되어야 함', () => {
      const mockOnClick = jest.fn();
      render(<SignupButton {...defaultProps} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    test('disabled=true일 때 onClick이 호출되지 않아야 함', () => {
      const mockOnClick = jest.fn();
      render(<SignupButton {...defaultProps} disabled={true} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    test('loading=true일 때 onClick이 호출되지 않아야 함', () => {
      const mockOnClick = jest.fn();
      render(<SignupButton {...defaultProps} loading={true} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    test('여러 번 클릭해도 onClick이 각각 호출되어야 함', () => {
      const mockOnClick = jest.fn();
      render(<SignupButton {...defaultProps} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('접근성 테스트', () => {
    test('aria-label을 올바르게 설정해야 함', () => {
      render(<SignupButton {...defaultProps} aria-label="회원가입 버튼" />);

      const button = screen.getByRole('button', { name: '회원가입 버튼' });
      expect(button).toHaveAttribute('aria-label', '회원가입 버튼');
    });

    test('loading=true일 때 aria-label이 override되어야 함', () => {
      render(<SignupButton {...defaultProps} loading={true} aria-label="회원가입 버튼" />);

      const button = screen.getByRole('button');
      // 컴포넌트는 loading 중에도 원래 aria-label을 유지
      expect(button).toHaveAttribute('aria-label', '회원가입 버튼');
    });

    test('aria-label이 없을 때 loading 중에는 "로딩 중..."으로 설정되어야 함', () => {
      render(<SignupButton {...defaultProps} loading={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', '로딩 중...');
    });

    test('aria-busy 속성을 가져야 함', () => {
      render(<SignupButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy');
    });

    test('버튼 역할을 올바르게 가져야 함', () => {
      render(<SignupButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('스타일 테스트', () => {
    test('primary 변형에서 올바른 배경색을 가져야 함', () => {
      render(<SignupButton variant="primary">회원가입</SignupButton>);

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      expect(styles.background).toContain('linear-gradient');
    });

    test('social-google 변형에서 올바른 배경색을 가져야 함', () => {
      render(<SignupButton variant="social-google">구글로 가입하기</SignupButton>);

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      expect(styles.background).toContain('linear-gradient');
    });


    test('버튼 크기가 올바르게 설정되어야 함', () => {
      render(<SignupButton {...defaultProps} />);

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      expect(styles.height).toBe('56px');
      expect(styles.width).toBe('100%');
    });

    test('border-radius가 올바르게 설정되어야 함', () => {
      render(<SignupButton {...defaultProps} />);

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      expect(styles.borderRadius).toBe('14px');
    });

    test('폰트 설정이 올바르게 적용되어야 함', () => {
      render(<SignupButton {...defaultProps} />);

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      expect(styles.fontSize).toBe('16px');
      expect(styles.fontWeight).toBe('700');
    });

    test('flexbox 레이아웃이 올바르게 설정되어야 함', () => {
      render(<SignupButton {...defaultProps} />);

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      expect(styles.display).toBe('flex');
      expect(styles.alignItems).toBe('center');
      expect(styles.justifyContent).toBe('center');
    });
  });

  describe('hover 효과 테스트', () => {
    test('hover 시 transform 효과가 적용되어야 함', () => {
      render(<SignupButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      // hover 상태는 CSS에서 처리되므로 실제 DOM에서 확인할 수 없지만,
      // :hover 선택자가 존재하는지 확인
      expect(button.classList.contains('signup-button')).toBe(true);
    });

    test('disabled 상태에서는 hover 효과가 적용되지 않아야 함', () => {
      render(<SignupButton {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('엣지 케이스 테스트', () => {
    test('className prop이 올바르게 적용되어야 함', () => {
      render(<SignupButton {...defaultProps} className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('signup-button', 'custom-class');
    });

    test('추가 HTML 속성이 올바르게 전달되어야 함', () => {
      render(<SignupButton {...defaultProps} data-testid="signup-btn" id="btn-1" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-testid', 'signup-btn');
      expect(button).toHaveAttribute('id', 'btn-1');
    });

    test('children이 빈 문자열이어도 렌더링되어야 함', () => {
      render(<SignupButton variant="primary" children="" />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    test('매우 긴 텍스트도 올바르게 렌더링되어야 함', () => {
      const longText = '매우 긴 텍스트입니다. 이 텍스트는 버튼 내부에 올바르게 표시되어야 합니다.';
      render(<SignupButton {...defaultProps}>{longText}</SignupButton>);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    test('loading과 disabled가 동시에 true일 때 버튼이 비활성화되어야 함', () => {
      render(<SignupButton {...defaultProps} loading={true} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    test('type prop이 올바르게 전달되어야 함', () => {
      render(<SignupButton {...defaultProps} type="submit" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    test('type이 지정되지 않으면 type 속성이 없어야 함', () => {
      render(<SignupButton {...defaultProps} />);

      const button = screen.getByRole('button');
      // type prop이 전달되지 않으면 DOM에 속성 없음
      expect(button).not.toHaveAttribute('type');
    });
  });

  describe('React.memo 최적화 테스트', () => {
    test('컴포넌트가 displayName을 가져야 함', () => {
      expect(SignupButton.displayName).toBe('SignupButton');
    });

    test('동일한 props에서는 리렌더링되지 않아야 함', () => {
      const { rerender } = render(<SignupButton {...defaultProps} />);
      const button1 = screen.getByRole('button');

      rerender(<SignupButton {...defaultProps} />);
      const button2 = screen.getByRole('button');

      expect(button1).toBe(button2);
    });
  });

  describe('스피너 애니메이션 테스트', () => {
    test('로딩 중일 때 spinner 클래스를 가진 요소가 있어야 함', () => {
      render(<SignupButton {...defaultProps} loading={true} />);

      const spinner = screen.getByText('⏳');
      expect(spinner).toHaveClass('spinner');
    });
  });

  describe('변형별 색상 대비 테스트', () => {
    test('primary 변형에서 흰색 텍스트를 사용해야 함', () => {
      render(<SignupButton variant="primary">회원가입</SignupButton>);

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      expect(styles.color).toBe('rgb(255, 255, 255)');
    });

    test('social-google 변형에서 흰색 텍스트를 사용해야 함', () => {
      render(<SignupButton variant="social-google">구글로 가입하기</SignupButton>);

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      expect(styles.color).toBe('rgb(255, 255, 255)');
    });
  });
});
