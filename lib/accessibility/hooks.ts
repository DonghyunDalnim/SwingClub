/**
 * Accessibility React Hooks
 * 키보드 접근성 및 포커스 관리를 위한 커스텀 훅
 */

'use client'

import { useEffect, useRef, RefObject } from 'react'
import { createFocusTrap, getFocusableElements } from './focus-trap'

/**
 * 모달/다이얼로그용 포커스 트랩 훅
 */
export function useFocusTrap<T extends HTMLElement>(isActive: boolean) {
  const containerRef = useRef<T | null>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const trap = createFocusTrap(containerRef.current)
    trap.activate()

    return () => {
      trap.deactivate()
    }
  }, [isActive])

  return containerRef
}

/**
 * ESC 키로 닫기 기능 훅
 */
export function useEscapeKey(callback: () => void, isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        callback()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [callback, isActive])
}

/**
 * 모달 열릴 때 배경 스크롤 방지 및 포커스 관리
 */
export function useModalAccessibility(isOpen: boolean) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.setAttribute('aria-hidden', 'true')
    }

    return () => {
      document.body.style.overflow = originalOverflow
      if (mainContent) {
        mainContent.removeAttribute('aria-hidden')
      }
    }
  }, [isOpen])

  return modalRef
}
