'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, BellRing } from 'lucide-react'
import { useNotificationCounts } from '@/hooks/useNotifications'
import { Button } from '@/components/core/Button'
import { Badge } from '@/components/core/Badge'

interface NotificationBellProps {
  className?: string
  showLabel?: boolean
}

export function NotificationBell({
  className = '',
  showLabel = false
}: NotificationBellProps) {
  const { counts, loading } = useNotificationCounts()
  const [isAnimating, setIsAnimating] = useState(false)

  // 새 알림이 있을 때 애니메이션 효과
  useEffect(() => {
    if (counts && counts.unread > 0) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [counts?.unread])

  const unreadCount = counts?.unread || 0
  const hasUnread = unreadCount > 0

  return (
    <Link href="/notifications" className="relative">
      <Button
        variant="ghost"
        size="sm"
        className={`
          relative flex items-center gap-2 p-2 rounded-lg
          hover:bg-purple-50 transition-all duration-200
          ${hasUnread ? 'text-purple-600' : 'text-gray-600'}
          ${isAnimating ? 'animate-pulse' : ''}
          ${className}
        `}
        aria-label={`알림 ${unreadCount}개`}
      >
        {/* 알림 아이콘 */}
        <div className="relative">
          {hasUnread ? (
            <BellRing
              className={`h-5 w-5 ${isAnimating ? 'animate-bounce' : ''}`}
              aria-hidden="true"
            />
          ) : (
            <Bell
              className="h-5 w-5"
              aria-hidden="true"
            />
          )}

          {/* 알림 배지 */}
          {hasUnread && (
            <Badge
              variant="destructive"
              className="
                absolute -top-2 -right-2 h-5 w-5 p-0
                flex items-center justify-center text-xs font-bold
                bg-red-500 text-white border-2 border-white
                animate-in fade-in duration-200
              "
              aria-hidden="true"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>

        {/* 라벨 (옵션) */}
        {showLabel && (
          <span className="text-sm font-medium">
            알림
          </span>
        )}

        {/* 스크린 리더를 위한 상태 정보 */}
        <span className="sr-only">
          {hasUnread
            ? `읽지 않은 알림 ${unreadCount}개가 있습니다.`
            : '새로운 알림이 없습니다.'
          }
        </span>
      </Button>

      {/* 새 알림 표시기 (점) */}
      {hasUnread && (
        <div
          className="
            absolute top-1 right-1 w-2 h-2
            bg-red-500 rounded-full
            animate-ping
          "
          aria-hidden="true"
        />
      )}
    </Link>
  )
}

// 작은 버전 (헤더나 컴팩트한 공간용)
export function NotificationBellCompact({ className = '' }: { className?: string }) {
  const { counts } = useNotificationCounts()
  const unreadCount = counts?.unread || 0
  const hasUnread = unreadCount > 0

  return (
    <Link href="/notifications" className="relative">
      <Button
        variant="ghost"
        size="sm"
        className={`
          relative p-1.5 rounded-full
          hover:bg-purple-50 transition-colors
          ${hasUnread ? 'text-purple-600' : 'text-gray-500'}
          ${className}
        `}
        aria-label={`알림 ${unreadCount}개`}
      >
        {hasUnread ? (
          <BellRing className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Bell className="h-4 w-4" aria-hidden="true" />
        )}

        {hasUnread && (
          <Badge
            variant="destructive"
            className="
              absolute -top-1 -right-1 h-4 w-4 p-0
              flex items-center justify-center text-xs
              bg-red-500 text-white border border-white
            "
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>
    </Link>
  )
}