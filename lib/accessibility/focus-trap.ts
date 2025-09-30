/**
 * Focus Trap Utility for Modal and Dialog Accessibility
 * WCAG 2.1 AA 준수 키보드 네비게이션 지원
 */

/**
 * 포커스 가능한 요소 선택자
 */
const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(', ')

/**
 * 컨테이너 내 포커스 가능한 요소들을 가져옵니다
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS)
  )
  return elements.filter(
    el => !el.hasAttribute('disabled') && el.offsetParent !== null
  )
}

/**
 * 포커스 트랩 생성
 */
export function createFocusTrap(container: HTMLElement) {
  let focusableElements: HTMLElement[] = []
  let firstFocusableElement: HTMLElement | null = null
  let lastFocusableElement: HTMLElement | null = null
  let previouslyFocusedElement: HTMLElement | null = null

  /**
   * 포커스 트랩 활성화
   */
  function activate() {
    // 현재 포커스된 요소 저장
    previouslyFocusedElement = document.activeElement as HTMLElement

    // 포커스 가능한 요소들 찾기
    updateFocusableElements()

    // 첫 번째 요소에 포커스
    if (firstFocusableElement) {
      firstFocusableElement.focus()
    }

    // 이벤트 리스너 등록
    container.addEventListener('keydown', handleKeyDown)
  }

  /**
   * 포커스 트랩 비활성화
   */
  function deactivate() {
    // 이벤트 리스너 제거
    container.removeEventListener('keydown', handleKeyDown)

    // 이전에 포커스된 요소로 복원
    if (previouslyFocusedElement && previouslyFocusedElement.focus) {
      previouslyFocusedElement.focus()
    }
  }

  /**
   * 포커스 가능한 요소들 업데이트
   */
  function updateFocusableElements() {
    focusableElements = getFocusableElements(container)
    firstFocusableElement = focusableElements[0] || null
    lastFocusableElement = focusableElements[focusableElements.length - 1] || null
  }

  /**
   * 키보드 이벤트 핸들러
   */
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return

    updateFocusableElements()

    // Shift + Tab (역방향)
    if (e.shiftKey) {
      if (document.activeElement === firstFocusableElement) {
        e.preventDefault()
        lastFocusableElement?.focus()
      }
    }
    // Tab (순방향)
    else {
      if (document.activeElement === lastFocusableElement) {
        e.preventDefault()
        firstFocusableElement?.focus()
      }
    }
  }

  return {
    activate,
    deactivate,
    updateFocusableElements
  }
}

/**
 * 스킵 링크로 이동
 */
export function skipToContent(targetId: string = 'main-content') {
  const target = document.getElementById(targetId)
  if (target) {
    target.focus()
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
