/**
 * LoadingSpinner Component - Soomgo Standards
 * #693BF2 색상, 3가지 크기 (sm, md, lg)
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3'
}

export function LoadingSpinner({
  size = 'md',
  className,
  label = '로딩 중'
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn('inline-block', className)}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-solid border-[#693BF2]/20',
          'border-t-[#693BF2]',
          sizeMap[size]
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}

/**
 * LoadingOverlay - 전체 화면 로딩 오버레이
 */
export interface LoadingOverlayProps {
  message?: string
  className?: string
}

export function LoadingOverlay({
  message = '로딩 중...',
  className
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-white/80 backdrop-blur-sm',
        className
      )}
      role="status"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        {message && (
          <p className="text-[#6A7685] text-sm font-medium">{message}</p>
        )}
      </div>
    </div>
  )
}

/**
 * LoadingButton - 로딩 상태가 있는 버튼
 */
export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
}

export function LoadingButton({
  loading = false,
  loadingText = '처리 중...',
  children,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'px-4 py-2 rounded-lg font-medium',
        'bg-[#693BF2] text-white',
        'hover:bg-[#693BF2]/90 focus:ring-2 focus:ring-[#693BF2] focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-all duration-200',
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="text-white" />}
      {loading ? loadingText : children}
    </button>
  )
}

/**
 * LoadingDots - 점 3개 애니메이션
 */
export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-[#693BF2] rounded-full animate-bounce"
          style={{
            animationDelay: `${i * 150}ms`,
            animationDuration: '600ms'
          }}
        />
      ))}
    </div>
  )
}

/**
 * LoadingPulse - 펄스 애니메이션
 */
export function LoadingPulse({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="h-12 w-12 rounded-full bg-[#693BF2] animate-ping opacity-75" />
    </div>
  )
}

export default LoadingSpinner