'use client'

import React from 'react';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';

export interface SkipLinkProps {
  /**
   * 이동할 타겟 요소의 ID
   */
  targetId: string;
  /**
   * 링크에 표시될 텍스트
   */
  children: React.ReactNode;
  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

/**
 * 접근성을 위한 스킵 링크 컴포넌트
 * 키보드 사용자가 네비게이션을 건너뛰고 메인 콘텐츠로 바로 이동할 수 있게 해줌
 */
export const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(
  ({ targetId, children, className, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();

      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        // 포커스 가능하도록 tabindex 설정
        if (!targetElement.hasAttribute('tabindex')) {
          targetElement.setAttribute('tabindex', '-1');
        }

        // 포커스 이동
        targetElement.focus();

        // 스크롤로 해당 위치로 이동
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    };

    return (
      <a
        ref={ref}
        href={`#${targetId}`}
        onClick={handleClick}
        className={cn(
          // 기본적으로 숨겨져 있다가 포커스 시에만 표시
          'absolute left-4 top-4 z-[9999]',
          'px-4 py-2 rounded-md',
          'text-white font-medium text-sm',
          'transform -translate-y-16 opacity-0',
          'transition-all duration-200 ease-in-out',
          // 포커스 시 표시
          'focus:translate-y-0 focus:opacity-100',
          // 고대비 배경과 명확한 포커스 스타일
          'bg-gray-900 hover:bg-gray-800',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'shadow-lg',
          className
        )}
        style={{
          // 테마 색상 사용
          backgroundColor: theme.colors.neutral.darkest,
          color: theme.colors.white,
          boxShadow: `0 0 0 2px ${theme.colors.primary.main}`,
        }}
        {...props}
      >
        {children}
      </a>
    );
  }
);

SkipLink.displayName = 'SkipLink';

export default SkipLink;