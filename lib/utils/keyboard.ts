/**
 * 키보드 네비게이션 및 접근성을 위한 유틸리티 함수들
 */

export type KeyboardKey =
  | 'Tab' | 'Enter' | 'Space' | 'Escape'
  | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'
  | 'Home' | 'End' | 'PageUp' | 'PageDown';

/**
 * 키보드 이벤트가 특정 키인지 확인
 */
export const isKey = (event: KeyboardEvent, key: KeyboardKey): boolean => {
  return event.key === key;
};

/**
 * 여러 키 중 하나인지 확인
 */
export const isOneOfKeys = (event: KeyboardEvent, keys: KeyboardKey[]): boolean => {
  return keys.includes(event.key as KeyboardKey);
};

/**
 * 포커스 가능한 요소들의 셀렉터
 */
export const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(', ');

/**
 * 컨테이너 내의 포커스 가능한 요소들을 찾기
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const elements = container.querySelectorAll(FOCUSABLE_ELEMENTS);
  return Array.from(elements).filter((element) => {
    return (
      element instanceof HTMLElement &&
      !element.hasAttribute('disabled') &&
      !element.getAttribute('aria-hidden') &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0
    );
  }) as HTMLElement[];
};

/**
 * 다음/이전 포커스 요소를 찾기
 */
export const getNextFocusableElement = (
  elements: HTMLElement[],
  currentElement: HTMLElement,
  direction: 'next' | 'previous'
): HTMLElement | null => {
  const currentIndex = elements.indexOf(currentElement);

  if (direction === 'next') {
    return elements[currentIndex + 1] || elements[0] || null;
  } else {
    return elements[currentIndex - 1] || elements[elements.length - 1] || null;
  }
};

/**
 * 첫 번째/마지막 포커스 가능한 요소 찾기
 */
export const getFirstFocusableElement = (container: HTMLElement): HTMLElement | null => {
  const elements = getFocusableElements(container);
  return elements[0] || null;
};

export const getLastFocusableElement = (container: HTMLElement): HTMLElement | null => {
  const elements = getFocusableElements(container);
  return elements[elements.length - 1] || null;
};

/**
 * 요소에 포커스를 안전하게 설정
 */
export const focusElement = (element: HTMLElement | null): void => {
  if (element && typeof element.focus === 'function') {
    // 다음 틱에서 포커스 설정 (DOM 업데이트 완료 후)
    setTimeout(() => {
      element.focus();
    }, 0);
  }
};

/**
 * 키보드 이벤트 핸들러 생성 헬퍼
 */
export const createKeyHandler = (handlers: Partial<Record<KeyboardKey, () => void>>) => {
  return (event: KeyboardEvent) => {
    const key = event.key as KeyboardKey;
    const handler = handlers[key];

    if (handler) {
      event.preventDefault();
      event.stopPropagation();
      handler();
    }
  };
};

/**
 * 방향키로 리스트 네비게이션을 위한 핸들러
 */
export const createListNavigationHandler = (
  container: HTMLElement,
  options: {
    vertical?: boolean;
    horizontal?: boolean;
    loop?: boolean;
  } = {}
) => {
  const { vertical = true, horizontal = false, loop = true } = options;

  return (event: KeyboardEvent) => {
    const focusableElements = getFocusableElements(container);
    const currentElement = document.activeElement as HTMLElement;

    if (!focusableElements.includes(currentElement)) {
      return;
    }

    let targetElement: HTMLElement | null = null;

    if (vertical && isKey(event, 'ArrowDown')) {
      targetElement = getNextFocusableElement(focusableElements, currentElement, 'next');
    } else if (vertical && isKey(event, 'ArrowUp')) {
      targetElement = getNextFocusableElement(focusableElements, currentElement, 'previous');
    } else if (horizontal && isKey(event, 'ArrowRight')) {
      targetElement = getNextFocusableElement(focusableElements, currentElement, 'next');
    } else if (horizontal && isKey(event, 'ArrowLeft')) {
      targetElement = getNextFocusableElement(focusableElements, currentElement, 'previous');
    } else if (isKey(event, 'Home')) {
      targetElement = getFirstFocusableElement(container);
    } else if (isKey(event, 'End')) {
      targetElement = getLastFocusableElement(container);
    }

    if (targetElement) {
      event.preventDefault();
      focusElement(targetElement);
    }
  };
};

/**
 * ESC 키로 액션 실행하는 헬퍼
 */
export const createEscapeHandler = (callback: () => void) => {
  return (event: KeyboardEvent) => {
    if (isKey(event, 'Escape')) {
      event.preventDefault();
      callback();
    }
  };
};

/**
 * Enter/Space 키로 버튼 동작 실행하는 헬퍼
 */
export const createActivationHandler = (callback: () => void) => {
  return (event: KeyboardEvent) => {
    if (isOneOfKeys(event, ['Enter', 'Space'])) {
      event.preventDefault();
      callback();
    }
  };
};