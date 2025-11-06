'use client'

import React, { useEffect, useState } from 'react'
import { theme } from '@/lib/theme'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose?: () => void
}

/**
 * 토스트 알림 컴포넌트
 *
 * 사용자에게 간단한 알림 메시지를 표시합니다.
 * 자동으로 사라지며, 닫기 버튼도 제공합니다.
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          onClose?.()
        }, 300) // 애니메이션 시간
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose?.()
    }, 300)
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  }

  const colors = {
    success: {
      bg: '#10b981',
      border: '#059669'
    },
    error: {
      bg: theme.colors.accent.red,
      border: '#dc2626'
    },
    info: {
      bg: theme.colors.primary.main,
      border: theme.colors.primary.hover
    },
    warning: {
      bg: '#f59e0b',
      border: '#d97706'
    }
  }

  return (
    <div
      className={cn('toast', !isVisible && 'toast-hidden')}
      role="alert"
      aria-live="polite"
    >
      <div className="toast-icon">{icons[type]}</div>
      <div className="toast-message">{message}</div>
      <button
        onClick={handleClose}
        className="toast-close"
        aria-label="알림 닫기"
      >
        ✕
      </button>

      <style jsx>{`
        .toast {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 300px;
          max-width: 500px;
          padding: 16px;
          background: ${colors[type].bg};
          color: ${theme.colors.white};
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          opacity: 1;
          transform: translateY(0);
          transition: all 0.3s ease;
          pointer-events: auto;
        }

        .toast-hidden {
          opacity: 0;
          transform: translateY(-10px);
          pointer-events: none;
        }

        .toast-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
        }

        .toast-message {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.5;
        }

        .toast-close {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: ${theme.colors.white};
          font-size: 18px;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.2s;
          padding: 0;
        }

        .toast-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .toast-close:focus-visible {
          outline: 2px solid ${theme.colors.white};
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .toast {
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}

/**
 * 토스트 컨테이너 컴포넌트
 */
export const ToastContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="toast-container">
      {children}

      <style jsx>{`
        .toast-container {
          position: fixed;
          top: 80px;
          right: 16px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .toast-container {
            left: 16px;
            right: 16px;
            top: 70px;
          }

          .toast-container :global(.toast) {
            min-width: 100%;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default Toast
