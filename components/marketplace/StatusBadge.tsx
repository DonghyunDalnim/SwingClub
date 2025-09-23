'use client'

import { Badge } from '@/components/core'
import { Button } from '@/components/core'
import { Check, X, AlertTriangle, Clock } from 'lucide-react'
import type { InquiryStatus } from '@/lib/types/marketplace'
import { INQUIRY_STATUS } from '@/lib/types/marketplace'

interface StatusBadgeProps {
  status: InquiryStatus
  showActions?: boolean
  onStatusChange?: (newStatus: InquiryStatus) => Promise<void>
  isOwner?: boolean
  loading?: boolean
}

export function StatusBadge({
  status,
  showActions = false,
  onStatusChange,
  isOwner = false,
  loading = false
}: StatusBadgeProps) {

  // 상태별 색상과 아이콘
  const getStatusDisplay = (status: InquiryStatus) => {
    switch (status) {
      case 'active':
        return {
          variant: 'default' as const,
          icon: <Clock className="h-3 w-3" />,
          color: 'bg-blue-500',
          textColor: 'text-blue-600',
          label: INQUIRY_STATUS.active
        }
      case 'completed':
        return {
          variant: 'secondary' as const,
          icon: <Check className="h-3 w-3" />,
          color: 'bg-green-500',
          textColor: 'text-green-600',
          label: INQUIRY_STATUS.completed
        }
      case 'cancelled':
        return {
          variant: 'outline' as const,
          icon: <X className="h-3 w-3" />,
          color: 'bg-gray-500',
          textColor: 'text-gray-600',
          label: INQUIRY_STATUS.cancelled
        }
      case 'reported':
        return {
          variant: 'outline' as const,
          icon: <AlertTriangle className="h-3 w-3" />,
          color: 'bg-red-500',
          textColor: 'text-red-600',
          label: INQUIRY_STATUS.reported
        }
      default:
        return {
          variant: 'outline' as const,
          icon: null,
          color: 'bg-gray-500',
          textColor: 'text-gray-600',
          label: '알 수 없음'
        }
    }
  }

  const statusDisplay = getStatusDisplay(status)

  const handleStatusChange = async (newStatus: InquiryStatus) => {
    if (onStatusChange && !loading) {
      await onStatusChange(newStatus)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {/* 상태 배지 */}
      <Badge variant={statusDisplay.variant} className="flex items-center space-x-1">
        {statusDisplay.icon}
        <span>{statusDisplay.label}</span>
      </Badge>

      {/* 액션 버튼들 (판매자만) */}
      {showActions && isOwner && status === 'active' && (
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange('completed')}
            disabled={loading}
            className="h-6 text-xs px-2"
          >
            <Check className="h-3 w-3 mr-1" />
            완료
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange('cancelled')}
            disabled={loading}
            className="h-6 text-xs px-2"
          >
            <X className="h-3 w-3 mr-1" />
            취소
          </Button>
        </div>
      )}

      {/* 신고 버튼 (양쪽 모두) */}
      {showActions && status !== 'reported' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleStatusChange('reported')}
          disabled={loading}
          className="h-6 text-xs px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          신고
        </Button>
      )}
    </div>
  )
}

// 상태별 설명 텍스트 컴포넌트
interface StatusDescriptionProps {
  status: InquiryStatus
  className?: string
}

export function StatusDescription({ status, className = "" }: StatusDescriptionProps) {
  const getDescription = (status: InquiryStatus) => {
    switch (status) {
      case 'active':
        return '문의가 진행중입니다. 판매자와 구매자가 메시지를 주고받을 수 있습니다.'
      case 'completed':
        return '거래가 완료되었습니다. 더 이상 메시지를 보낼 수 없습니다.'
      case 'cancelled':
        return '문의가 취소되었습니다. 더 이상 메시지를 보낼 수 없습니다.'
      case 'reported':
        return '이 문의가 신고되었습니다. 관리자 검토 중입니다.'
      default:
        return ''
    }
  }

  return (
    <p className={`text-sm text-gray-600 ${className}`}>
      {getDescription(status)}
    </p>
  )
}

// 상태 변경 확인 모달용 컴포넌트
interface StatusChangeConfirmProps {
  currentStatus: InquiryStatus
  newStatus: InquiryStatus
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function StatusChangeConfirm({
  currentStatus,
  newStatus,
  onConfirm,
  onCancel,
  loading = false
}: StatusChangeConfirmProps) {

  const getConfirmMessage = (from: InquiryStatus, to: InquiryStatus) => {
    if (to === 'completed') {
      return '거래를 완료 처리하시겠습니까? 완료 후에는 메시지를 주고받을 수 없습니다.'
    }
    if (to === 'cancelled') {
      return '문의를 취소하시겠습니까? 취소 후에는 메시지를 주고받을 수 없습니다.'
    }
    if (to === 'reported') {
      return '이 문의를 신고하시겠습니까? 신고 후 관리자가 검토합니다.'
    }
    return '상태를 변경하시겠습니까?'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">상태 변경 확인</h3>

        <p className="text-gray-600 mb-6">
          {getConfirmMessage(currentStatus, newStatus)}
        </p>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            취소
          </Button>

          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 ${newStatus === 'reported' ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' : ''}`}
            variant={newStatus === 'reported' ? 'outline' : 'default'}
          >
            {loading ? '처리중...' : '확인'}
          </Button>
        </div>
      </div>
    </div>
  )
}