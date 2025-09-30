'use client'

import { Badge } from '@/components/core'
import { cn } from '@/lib/utils'
import type { ItemStatus, InquiryStatus } from '@/lib/types/marketplace'
import { ITEM_STATUS, INQUIRY_STATUS_LABELS } from '@/lib/types/marketplace'

interface StatusBadgeProps {
  status: ItemStatus | InquiryStatus
  type: 'item' | 'inquiry'
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ status, type, className, size = 'md' }: StatusBadgeProps) {
  // 상태별 스타일 정의
  const getStatusStyle = (status: ItemStatus | InquiryStatus, type: 'item' | 'inquiry') => {
    if (type === 'item') {
      switch (status as ItemStatus) {
        case 'available':
          return {
            variant: 'default' as const,
            style: { backgroundColor: '#22c55e', color: 'white' } // 판매중 - 초록색
          }
        case 'reserved':
          return {
            variant: 'outline' as const,
            style: { backgroundColor: '#f59e0b', color: 'white', borderColor: '#f59e0b' } // 예약중 - 주황색
          }
        case 'sold':
          return {
            variant: 'outline' as const,
            style: { backgroundColor: '#6b7280', color: 'white', borderColor: '#6b7280' } // 판매완료 - 회색
          }
        default:
          return {
            variant: 'outline' as const,
            style: { backgroundColor: '#e5e7eb', color: '#374151' } // 기본
          }
      }
    } else {
      switch (status as InquiryStatus) {
        case 'active':
          return {
            variant: 'default' as const,
            style: { backgroundColor: '#693BF2', color: 'white' } // 진행중 - 보라색
          }
        case 'completed':
          return {
            variant: 'outline' as const,
            style: { backgroundColor: '#22c55e', color: 'white', borderColor: '#22c55e' } // 거래완료 - 초록색
          }
        case 'cancelled':
          return {
            variant: 'outline' as const,
            style: { backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' } // 취소됨 - 빨간색
          }
        case 'blocked':
          return {
            variant: 'outline' as const,
            style: { backgroundColor: '#6b7280', color: 'white', borderColor: '#6b7280' } // 차단됨 - 회색
          }
        default:
          return {
            variant: 'outline' as const,
            style: { backgroundColor: '#e5e7eb', color: '#374151' } // 기본
          }
      }
    }
  }

  // 상태별 라벨 가져오기
  const getStatusLabel = (status: ItemStatus | InquiryStatus, type: 'item' | 'inquiry') => {
    if (type === 'item') {
      return ITEM_STATUS[status as ItemStatus] || status
    } else {
      return INQUIRY_STATUS_LABELS[status as InquiryStatus] || status
    }
  }

  // 크기별 클래스
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  const statusStyle = getStatusStyle(status, type)
  const label = getStatusLabel(status, type)

  return (
    <Badge
      variant={statusStyle.variant}
      className={cn(
        'font-medium border-0 shadow-sm',
        sizeClasses[size],
        className
      )}
      style={statusStyle.style}
      aria-label={`${type === 'item' ? '상품' : '문의'} 상태: ${label}`}
    >
      {label}
    </Badge>
  )
}

export default StatusBadge