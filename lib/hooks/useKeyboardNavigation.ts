'use client'

import { useCallback, useEffect, useRef } from 'react';
import {
  createListNavigationHandler,
  createEscapeHandler,
  getFocusableElements,
  focusElement
} from '@/lib/utils/keyboard';

export interface UseKeyboardNavigationOptions {
  /**
   * 세로 방향 네비게이션 허용 (ArrowUp/ArrowDown)
   */
  vertical?: boolean;
  /**
   * 가로 방향 네비게이션 허용 (ArrowLeft/ArrowRight)
   */
  horizontal?: boolean;
  /**
   * 끝에서 처음으로 이동 허용 (순환 네비게이션)
   */
  loop?: boolean;
  /**
   * ESC 키 핸들러
   */
  onEscape?: () => void;
  /**
   * 초기 포커스를 첫 번째 요소로 설정
   */
  autoFocus?: boolean;
  /**
   * 네비게이션이 활성화되어 있는지 여부
   */
  enabled?: boolean;
}

/**
 * 키보드 네비게이션을 위한 커스텀 훅
 */
export const useKeyboardNavigation = (options: UseKeyboardNavigationOptions = {}) => {
  const {
    vertical = true,
    horizontal = false,
    loop = true,
    onEscape,
    autoFocus = false,
    enabled = true
  } = options;

  const containerRef = useRef<HTMLElement>(null);

  // 리스트 네비게이션 핸들러
  const handleNavigation = useCallback((event: KeyboardEvent) => {
    if (!enabled || !containerRef.current) return;

    const navigationHandler = createListNavigationHandler(
      containerRef.current,
      { vertical, horizontal, loop }
    );

    navigationHandler(event);
  }, [enabled, vertical, horizontal, loop]);

  // ESC 키 핸들러
  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (!enabled || !onEscape) return;

    const escapeHandler = createEscapeHandler(onEscape);
    escapeHandler(event);
  }, [enabled, onEscape]);

  // 이벤트 리스너 등록
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    container.addEventListener('keydown', handleNavigation);

    if (onEscape) {
      container.addEventListener('keydown', handleEscape);
    }

    // 초기 포커스 설정
    if (autoFocus) {
      const focusableElements = getFocusableElements(container);
      if (focusableElements.length > 0) {
        focusElement(focusableElements[0]);
      }
    }

    return () => {
      container.removeEventListener('keydown', handleNavigation);
      if (onEscape) {
        container.removeEventListener('keydown', handleEscape);
      }
    };
  }, [enabled, handleNavigation, handleEscape, autoFocus]);

  return {
    containerRef,
    /**
     * 첫 번째 포커스 가능한 요소로 포커스 이동
     */
    focusFirst: useCallback(() => {
      if (containerRef.current) {
        const focusableElements = getFocusableElements(containerRef.current);
        if (focusableElements.length > 0) {
          focusElement(focusableElements[0]);
        }
      }
    }, []),
    /**
     * 마지막 포커스 가능한 요소로 포커스 이동
     */
    focusLast: useCallback(() => {
      if (containerRef.current) {
        const focusableElements = getFocusableElements(containerRef.current);
        if (focusableElements.length > 0) {
          focusElement(focusableElements[focusableElements.length - 1]);
        }
      }
    }, [])
  };
};