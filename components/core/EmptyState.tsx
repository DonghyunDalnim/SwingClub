/**
 * EmptyState Component - Soomgo Standards
 * 빈 상태 일러스트레이션, #6A7685 색상 메시지, Primary 버튼
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import {
  Search,
  FileText,
  ShoppingBag,
  MessageCircle,
  Users,
  Heart,
  AlertCircle,
  Inbox
} from 'lucide-react'

export interface EmptyStateProps {
  icon?: 'search' | 'file' | 'shop' | 'message' | 'users' | 'heart' | 'alert' | 'inbox' | React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const iconMap = {
  search: Search,
  file: FileText,
  shop: ShoppingBag,
  message: MessageCircle,
  users: Users,
  heart: Heart,
  alert: AlertCircle,
  inbox: Inbox
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  // 아이콘 렌더링
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon
    }

    const iconKey = typeof icon === 'string' && icon in iconMap ? icon as keyof typeof iconMap : 'inbox'
    const IconComponent = iconMap[iconKey]

    return (
      <div
        className="relative mx-auto mb-6"
        style={{ width: 120, height: 120 }}
      >
        {/* 배경 원 */}
        <div className="absolute inset-0 bg-[#EFF1F5] rounded-full" />

        {/* 아이콘 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <IconComponent
            className="text-[#6A7685]"
            size={48}
            strokeWidth={1.5}
          />
        </div>

        {/* 장식용 작은 원들 */}
        <div
          className="absolute top-4 right-4 w-4 h-4 bg-[#693BF2]/10 rounded-full"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-8 left-2 w-6 h-6 bg-[#693BF2]/5 rounded-full"
          aria-hidden="true"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'py-12 px-4',
        className
      )}
      role="status"
      aria-label={title}
    >
      {/* 아이콘 */}
      {renderIcon()}

      {/* 제목 */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>

      {/* 설명 */}
      {description && (
        <p className="text-[#6A7685] text-base max-w-md mb-6">{description}</p>
      )}

      {/* 액션 버튼 */}
      {action && (
        <Button
          variant="primary"
          onClick={action.onClick}
          className="min-w-[160px]"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

/**
 * EmptySearch - 검색 결과 없음
 */
export function EmptySearch({
  query,
  onReset,
  className
}: {
  query?: string
  onReset?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon="search"
      title="검색 결과가 없습니다"
      description={
        query
          ? `'${query}'에 대한 검색 결과를 찾을 수 없습니다.`
          : '다른 키워드로 검색해보세요.'
      }
      action={
        onReset
          ? {
              label: '검색 초기화',
              onClick: onReset
            }
          : undefined
      }
      className={className}
    />
  )
}

/**
 * EmptyPosts - 게시글 없음
 */
export function EmptyPosts({
  onCreatePost,
  className
}: {
  onCreatePost?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon="file"
      title="아직 게시글이 없습니다"
      description="첫 번째 게시글을 작성해보세요."
      action={
        onCreatePost
          ? {
              label: '게시글 작성하기',
              onClick: onCreatePost
            }
          : undefined
      }
      className={className}
    />
  )
}

/**
 * EmptyProducts - 상품 없음
 */
export function EmptyProducts({
  onAddProduct,
  className
}: {
  onAddProduct?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon="shop"
      title="등록된 상품이 없습니다"
      description="첫 번째 상품을 등록해보세요."
      action={
        onAddProduct
          ? {
              label: '상품 등록하기',
              onClick: onAddProduct
            }
          : undefined
      }
      className={className}
    />
  )
}

/**
 * EmptyMessages - 메시지 없음
 */
export function EmptyMessages({ className }: { className?: string }) {
  return (
    <EmptyState
      icon="message"
      title="메시지가 없습니다"
      description="아직 주고받은 메시지가 없습니다."
      className={className}
    />
  )
}

/**
 * EmptyFavorites - 찜 목록 없음
 */
export function EmptyFavorites({
  onBrowse,
  className
}: {
  onBrowse?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon="heart"
      title="찜한 항목이 없습니다"
      description="마음에 드는 항목을 찜해보세요."
      action={
        onBrowse
          ? {
              label: '둘러보기',
              onClick: onBrowse
            }
          : undefined
      }
      className={className}
    />
  )
}

/**
 * EmptyNotifications - 알림 없음
 */
export function EmptyNotifications({ className }: { className?: string }) {
  return (
    <EmptyState
      icon="inbox"
      title="알림이 없습니다"
      description="새로운 활동이 있으면 알려드릴게요."
      className={className}
    />
  )
}

/**
 * ErrorState - 에러 상태
 */
export function ErrorState({
  title = '오류가 발생했습니다',
  description = '잠시 후 다시 시도해주세요.',
  onRetry,
  className
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon="alert"
      title={title}
      description={description}
      action={
        onRetry
          ? {
              label: '다시 시도',
              onClick: onRetry
            }
          : undefined
      }
      className={className}
    />
  )
}

export default EmptyState