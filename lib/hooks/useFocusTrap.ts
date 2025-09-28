'use client'

import { useCallback, useEffect, useRef } from 'react';
import {
  getFocusableElements,
  focusElement,
  isKey,
  getFirstFocusableElement,
  getLastFocusableElement
} from '@/lib/utils/keyboard';

export interface UseFocusTrapOptions {
  /**
   * 포커스 트랩이 활성화되어 있는지 여부
   */
  enabled?: boolean;
  /**
   * 초기 포커스를 첫 번째 요소로 설정
   */
  autoFocus?: boolean;
  /**
   * ESC 키로 트랩 해제 시 실행할 콜백
   */
  onEscape?: () => void;
  /**
   * 트랩이 해제될 때 포커스를 돌려받을 요소
   */
  restoreFocusOnCleanup?: boolean;
}

/**
 * 모달, 팝업 등에서 포커스를 트랩하는 커스텀 훅
 */
export const useFocusTrap = (options: UseFocusTrapOptions = {}) => {
  const {
    enabled = true,
    autoFocus = true,
    onEscape,
    restoreFocusOnCleanup = true
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Tab 키 핸들러 - 포커스 트랩 구현
  const handleTabKey = useCallback((event: KeyboardEvent) => {
    if (!enabled || !containerRef.current || !isKey(event, 'Tab')) {
      return;
    }

    const focusableElements = getFocusableElements(containerRef.current);

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    // Shift + Tab (역방향)
    if (event.shiftKey) {
      if (activeElement === firstElement) {
        event.preventDefault();
        focusElement(lastElement);
      }
    } else {
      // Tab (정방향)
      if (activeElement === lastElement) {
        event.preventDefault();
        focusElement(firstElement);
      }
    }
  }, [enabled]);

  // ESC 키 핸들러
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (!enabled || !onEscape || !isKey(event, 'Escape')) {
      return;
    }

    event.preventDefault();
    onEscape();
  }, [enabled, onEscape]);

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    handleTabKey(event);
    handleEscapeKey(event);
  }, [handleTabKey, handleEscapeKey]);

  // 포커스 트랩 활성화/비활성화
  useEffect(() => {
    if (!enabled || !containerRef.current) {
      return;
    }

    // 현재 활성 요소 저장
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // 키보드 이벤트 리스너 등록
    document.addEventListener('keydown', handleKeyDown);

    // 초기 포커스 설정
    if (autoFocus) {
      const firstFocusable = getFirstFocusableElement(containerRef.current);
      if (firstFocusable) {
        focusElement(firstFocusable);
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // 포커스 복원
      if (restoreFocusOnCleanup && previousActiveElementRef.current) {
        focusElement(previousActiveElementRef.current);
      }
    };
  }, [enabled, handleKeyDown, autoFocus, restoreFocusOnCleanup]);

  return {
    containerRef,
    /**
     * 첫 번째 포커스 가능한 요소로 포커스 이동
     */
    focusFirst: useCallback(() => {
      if (!containerRef.current) return;

      const firstElement = getFirstFocusableElement(containerRef.current);
      if (firstElement) {
        focusElement(firstElement);
      }
    }, []),
    /**
     * 마지막 포커스 가능한 요소로 포커스 이동
     */
    focusLast: useCallback(() => {
      if (!containerRef.current) return;

      const lastElement = getLastFocusableElement(containerRef.current);
      if (lastElement) {
        focusElement(lastElement);
      }
    }, []),
    /**
     * 이전에 포커스되어 있던 요소로 포커스 복원
     */
    restoreFocus: useCallback(() => {
      if (previousActiveElementRef.current) {
        focusElement(previousActiveElementRef.current);
      }
    }, [])
  };
};