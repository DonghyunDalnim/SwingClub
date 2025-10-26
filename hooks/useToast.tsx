'use client'

import { useState, useCallback } from 'react'
import type { ToastType } from '@/components/ui/Toast'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
  duration?: number
}

/**
 * 토스트 알림을 관리하는 커스텀 훅
 *
 * @example
 * ```tsx
 * const { toasts, showToast, showSuccess, showError } = useToast()
 *
 * // 성공 메시지
 * showSuccess('저장되었습니다')
 *
 * // 에러 메시지
 * showError('저장에 실패했습니다')
 *
 * // 커스텀 메시지
 * showToast('알림 메시지', 'info', 5000)
 * ```
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3000) => {
      const id = `toast-${Date.now()}-${Math.random()}`
      const newToast: ToastMessage = { id, message, type, duration }

      setToasts(prev => [...prev, newToast])

      // 자동 제거
      if (duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id))
        }, duration + 300) // 애니메이션 시간 포함
      }
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'success', duration)
    },
    [showToast]
  )

  const showError = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'error', duration)
    },
    [showToast]
  )

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'info', duration)
    },
    [showToast]
  )

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'warning', duration)
    },
    [showToast]
  )

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeToast
  }
}
