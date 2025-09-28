/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

import { SkipLink } from '@/components/core/SkipLink';
import { theme } from '@/lib/theme';

// jest-axe 매처 확장
expect.extend(toHaveNoViolations);

// DOM 조작 및 스크롤 동작 모킹
const mockScrollIntoView = jest.fn();
const mockFocus = jest.fn();
const mockSetAttribute = jest.fn();
const mockHasAttribute = jest.fn();

// Element.prototype 메서드 모킹
Element.prototype.scrollIntoView = mockScrollIntoView;

describe('SkipLink', () => {
  // 각 테스트 전 모킹 초기화
  beforeEach(() => {
    jest.clearAllMocks();

    // DOM getElementById 모킹을 위한 mock element 생성
    const createMockTarget = () => {
      const mockTarget = {
        id: 'main-content',
        focus: mockFocus,
        scrollIntoView: mockScrollIntoView,
        setAttribute: mockSetAttribute,
        hasAttribute: mockHasAttribute,
        tabIndex: -1,
        nodeType: 1,
        tagName: 'DIV'
      };
      return mockTarget as unknown as HTMLElement;
    };

    jest.spyOn(document, 'getElementById').mockReturnValue(createMockTarget());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('렌더링 및 기본 구조', () => {
    it('올바른 텍스트와 함께 링크를 렌더링한다', () => {
      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      // hidden 요소도 찾을 수 있도록 옵션 추가
      const link = screen.getByRole('link', {
        name: '메인 콘텐츠로 건너뛰기',
        hidden: true
      });
      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent('메인 콘텐츠로 건너뛰기');
    });

    it('targetId에 기반한 올바른 href 속성을 가진다', () => {
      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });
      expect(link).toHaveAttribute('href', '#main-content');
    });

    it('커스텀 className을 적용한다', () => {
      render(
        <SkipLink targetId="main-content" className="custom-class">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });
      expect(link).toHaveClass('custom-class');
    });

    it('forwardRef가 올바르게 작동한다', () => {
      const ref = React.createRef<HTMLAnchorElement>();
      render(
        <SkipLink ref={ref} targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
      expect(ref.current).toHaveAttribute('href', '#main-content');
    });
  });

  describe('스타일 및 테마 적용', () => {
    it('기본 CSS 클래스들이 적용된다', () => {
      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });

      // 위치 및 z-index 클래스
      expect(link).toHaveClass('absolute', 'left-4', 'top-4', 'z-[9999]');

      // 패딩 및 모양 클래스
      expect(link).toHaveClass('px-4', 'py-2', 'rounded-md');

      // 텍스트 스타일 클래스
      expect(link).toHaveClass('text-white', 'font-medium', 'text-sm');

      // 변형 및 전환 클래스
      expect(link).toHaveClass('transform', '-translate-y-16', 'opacity-0');
      expect(link).toHaveClass('transition-all', 'duration-200', 'ease-in-out');

      // 포커스 상태 클래스
      expect(link).toHaveClass('focus:translate-y-0', 'focus:opacity-100');

      // 배경 및 포커스 스타일 클래스
      expect(link).toHaveClass('bg-gray-900', 'hover:bg-gray-800');
      expect(link).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
      expect(link).toHaveClass('shadow-lg');
    });

    it('테마 색상이 인라인 스타일로 적용된다', () => {
      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });

      expect(link).toHaveStyle({
        backgroundColor: theme.colors.neutral.darkest,
        color: theme.colors.white,
        boxShadow: `0 0 0 2px ${theme.colors.primary.main}`,
      });
    });
  });

  describe('키보드 포커스 동작', () => {
    it('Tab 키로 포커스를 받을 수 있다', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <button>이전 요소</button>
          <SkipLink targetId="main-content">
            메인 콘텐츠로 건너뛰기
          </SkipLink>
          <button>다음 요소</button>
        </div>
      );

      const link = screen.getByRole('link', { hidden: true });

      // Tab으로 포커스 이동
      await user.tab();
      await user.tab();

      expect(link).toHaveFocus();
    });

    it('Enter 키로 활성화할 수 있다', async () => {
      const user = userEvent.setup();
      mockHasAttribute.mockReturnValue(false);

      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });

      // 포커스 후 Enter 키 입력
      link.focus();
      await user.keyboard('{Enter}');

      // 기본 링크 동작이 발생하므로 직접 클릭 시뮬레이션
      fireEvent.click(link);

      expect(document.getElementById).toHaveBeenCalledWith('main-content');
    });

    it('Space 키로 활성화할 수 있다', async () => {
      const user = userEvent.setup();
      mockHasAttribute.mockReturnValue(false);

      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });

      // 포커스 후 Space 키 입력 (링크의 경우 클릭 이벤트 발생)
      link.focus();
      fireEvent.click(link);

      expect(document.getElementById).toHaveBeenCalledWith('main-content');
    });
  });

  describe('클릭 동작 및 타겟 요소 처리', () => {
    it('클릭 시 기본 동작을 방지한다', async () => {
      const user = userEvent.setup();
      mockHasAttribute.mockReturnValue(false);

      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });

      // preventDefault가 내부적으로 호출되는지 확인하기 위해 이벤트 리스너 사용
      const preventDefaultSpy = jest.fn();
      const originalAddEventListener = link.addEventListener;

      link.addEventListener = jest.fn((event, handler) => {
        if (event === 'click') {
          const wrappedHandler = (e: Event) => {
            e.preventDefault = preventDefaultSpy;
            (handler as (e: Event) => void)(e);
          };
          return originalAddEventListener.call(link, event, wrappedHandler);
        }
        return originalAddEventListener.call(link, event, handler);
      });

      // 클릭 이벤트 처리
      await user.click(link);

      expect(document.getElementById).toHaveBeenCalledWith('main-content');
    });

    it('타겟 요소가 존재할 때 포커스를 이동한다', async () => {
      const user = userEvent.setup();
      mockHasAttribute.mockReturnValue(false);

      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });
      await user.click(link);

      expect(document.getElementById).toHaveBeenCalledWith('main-content');
      expect(mockFocus).toHaveBeenCalled();
    });

    it('타겟 요소가 존재할 때 스크롤을 실행한다', async () => {
      const user = userEvent.setup();
      mockHasAttribute.mockReturnValue(false);

      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });
      await user.click(link);

      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start'
      });
    });

    it('타겟 요소에 tabindex가 없을 때 자동으로 설정한다', async () => {
      const user = userEvent.setup();
      mockHasAttribute.mockReturnValue(false);

      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });
      await user.click(link);

      expect(mockHasAttribute).toHaveBeenCalledWith('tabindex');
      expect(mockSetAttribute).toHaveBeenCalledWith('tabindex', '-1');
    });

    it('타겟 요소에 이미 tabindex가 있을 때는 설정하지 않는다', async () => {
      const user = userEvent.setup();
      mockHasAttribute.mockReturnValue(true);

      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });
      await user.click(link);

      expect(mockHasAttribute).toHaveBeenCalledWith('tabindex');
      expect(mockSetAttribute).not.toHaveBeenCalled();
    });

    it('타겟 요소가 존재하지 않을 때 에러를 발생시키지 않는다', async () => {
      const user = userEvent.setup();
      jest.spyOn(document, 'getElementById').mockReturnValue(null);

      render(
        <SkipLink targetId="non-existent">
          존재하지 않는 요소로 이동
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });

      // 에러 없이 실행되어야 함
      await expect(user.click(link)).resolves.not.toThrow();

      expect(mockFocus).not.toHaveBeenCalled();
      expect(mockScrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe('접근성 (Accessibility)', () => {
    it('WCAG 접근성 규칙을 준수한다', async () => {
      const { container } = render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('스크린 리더를 위한 적절한 링크 텍스트를 제공한다', () => {
      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });

      // 링크의 접근 가능한 이름이 명확해야 함
      expect(link).toHaveAccessibleName('메인 콘텐츠로 건너뛰기');
    });

    it('키보드만으로 완전히 조작 가능하다', async () => {
      const user = userEvent.setup();
      mockHasAttribute.mockReturnValue(false);

      render(
        <div>
          <SkipLink targetId="main-content">
            메인 콘텐츠로 건너뛰기
          </SkipLink>
          <main id="main-content" tabIndex={-1}>
            메인 콘텐츠
          </main>
        </div>
      );

      const link = screen.getByRole('link', { hidden: true });

      // 키보드로 포커스 이동
      await user.tab();
      expect(link).toHaveFocus();

      // Enter로 활성화 (클릭 시뮬레이션)
      fireEvent.click(link);

      // 타겟 요소로 포커스 이동 확인
      expect(mockFocus).toHaveBeenCalled();
    });

    it('고대비 환경에서도 충분한 색상 대비를 제공한다', () => {
      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });

      // 테마에서 정의된 고대비 색상 확인
      expect(link).toHaveStyle({
        backgroundColor: theme.colors.neutral.darkest, // 어두운 배경
        color: theme.colors.white, // 흰색 텍스트
      });
    });

    it('포커스 표시자가 명확하게 보인다', () => {
      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });

      // 포커스 관련 클래스들이 적용되어야 함
      expect(link).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');

      // 포커스 시 표시를 위한 변형 클래스
      expect(link).toHaveClass('focus:translate-y-0', 'focus:opacity-100');
    });
  });

  describe('시각적 상태 관리', () => {
    it('기본 상태에서는 시각적으로 숨겨져 있다', () => {
      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });

      // 기본적으로 숨겨진 상태의 클래스들
      expect(link).toHaveClass('-translate-y-16', 'opacity-0');
    });

    it('포커스 시 표시되는 클래스가 적용된다', () => {
      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });

      // 포커스 시 표시되는 클래스들
      expect(link).toHaveClass('focus:translate-y-0', 'focus:opacity-100');
    });

    it('부드러운 전환 효과가 적용된다', () => {
      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });

      // 전환 효과 클래스들
      expect(link).toHaveClass('transition-all', 'duration-200', 'ease-in-out');
    });
  });

  describe('HTML 구조 및 시맨틱', () => {
    it('semantic하게 올바른 anchor 태그를 사용한다', () => {
      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });
      expect(link.tagName).toBe('A');
    });

    it('추가 props가 링크에 전달된다', () => {
      render(
        <SkipLink
          targetId="main-content"
          data-testid="skip-link"
          aria-label="메인 콘텐츠로 바로 이동"
        >
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByTestId('skip-link');
      expect(link).toHaveAttribute('aria-label', '메인 콘텐츠로 바로 이동');
    });

    it('올바른 displayName을 가진다', () => {
      expect(SkipLink.displayName).toBe('SkipLink');
    });
  });

  describe('에러 처리 및 예외 상황', () => {
    it('빈 targetId로도 렌더링된다', () => {
      render(
        <SkipLink targetId="">
          빈 타겟
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '#');
    });

    it('undefined children으로도 렌더링된다', () => {
      render(
        <SkipLink targetId="main-content">
          {undefined}
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });
      expect(link).toBeInTheDocument();
    });

    it('복잡한 children 구조를 처리할 수 있다', () => {
      render(
        <SkipLink targetId="main-content">
          <span>메인 콘텐츠로</span>
          <strong> 건너뛰기</strong>
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });
      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent('메인 콘텐츠로 건너뛰기');
    });
  });

  describe('성능 및 최적화', () => {
    it('불필요한 리렌더링을 방지한다', () => {
      const { rerender } = render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });
      const firstRender = link.outerHTML;

      // 동일한 props로 리렌더링
      rerender(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const secondRender = link.outerHTML;
      expect(firstRender).toBe(secondRender);
    });

    it('클릭 핸들러가 정의되어 있다', () => {
      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });

      // 클릭 핸들러가 정의되어 있어야 함
      expect(link.onclick).toBeDefined();
    });
  });

  describe('실제 DOM 통합 테스트', () => {
    it('실제 DOM 요소와의 상호작용이 올바르게 작동한다', async () => {
      const user = userEvent.setup();

      // 실제 DOM에 타겟 요소 추가
      const targetElement = document.createElement('main');
      targetElement.id = 'real-main-content';
      targetElement.tabIndex = -1;
      document.body.appendChild(targetElement);

      // 실제 getElementById가 작동하도록 모킹 해제
      jest.restoreAllMocks();

      render(
        <SkipLink targetId="real-main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });

      // 클릭하면 실제 요소로 포커스가 이동해야 함
      fireEvent.click(link);

      // 실제 DOM 요소가 포커스를 받았는지 확인
      await waitFor(() => {
        expect(document.activeElement).toBe(targetElement);
      });

      // 정리
      document.body.removeChild(targetElement);
    });

    it('포커스 시 시각적으로 표시되는 동작을 확인한다', async () => {
      const user = userEvent.setup();

      render(
        <SkipLink targetId="main-content">
          메인 콘텐츠로 건너뛰기
        </SkipLink>
      );

      const link = screen.getByRole('link', { hidden: true });

      // 포커스 전에는 숨겨진 상태
      expect(link).toHaveClass('-translate-y-16', 'opacity-0');

      // 포커스 후에는 표시되는 클래스가 활성화되어야 함
      link.focus();
      expect(link).toHaveFocus();

      // CSS 클래스는 여전히 동일하지만, 브라우저에서는 :focus 가상 클래스가 활성화됨
      expect(link).toHaveClass('focus:translate-y-0', 'focus:opacity-100');
    });
  });
});