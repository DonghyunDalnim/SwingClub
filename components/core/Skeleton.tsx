/**
 * Skeleton Component - Soomgo Standards
 * #EFF1F5 배경, 반짝임 애니메이션
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg'
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  }

  return (
    <div
      className={cn(
        'bg-[#EFF1F5]',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height
      }}
      aria-hidden="true"
    />
  )
}

/**
 * SkeletonText - 텍스트 스켈레톤 (여러 줄)
 */
export interface SkeletonTextProps {
  lines?: number
  className?: string
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  )
}

/**
 * SkeletonCard - 카드 스켈레톤
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'border border-gray-200 rounded-lg p-4 bg-white',
        className
      )}
    >
      {/* 이미지 영역 */}
      <Skeleton variant="rounded" height={200} className="mb-4" />

      {/* 제목 */}
      <Skeleton variant="text" height={24} width="80%" className="mb-2" />

      {/* 설명 */}
      <SkeletonText lines={2} className="mb-4" />

      {/* 하단 정보 */}
      <div className="flex items-center justify-between">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="text" width={100} height={16} />
      </div>
    </div>
  )
}

/**
 * SkeletonProductCard - 상품 카드 스켈레톤
 */
export function SkeletonProductCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'border border-gray-200 rounded-lg overflow-hidden bg-white',
        className
      )}
    >
      {/* 상품 이미지 (4:3 비율) */}
      <Skeleton variant="rectangular" className="aspect-[4/3]" />

      <div className="p-4">
        {/* 카테고리 */}
        <Skeleton variant="text" width={60} height={20} className="mb-2" />

        {/* 제목 */}
        <Skeleton variant="text" height={20} width="90%" className="mb-2" />

        {/* 가격 */}
        <Skeleton variant="text" height={24} width={100} className="mb-3" />

        {/* 하단 정보 */}
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width={80} height={14} />
        </div>
      </div>
    </div>
  )
}

/**
 * SkeletonPostCard - 게시글 카드 스켈레톤
 */
export function SkeletonPostCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'border border-gray-200 rounded-lg p-4 bg-white',
        className
      )}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" width={120} height={16} className="mb-1" />
          <Skeleton variant="text" width={80} height={14} />
        </div>
      </div>

      {/* 내용 */}
      <SkeletonText lines={3} className="mb-3" />

      {/* 태그 */}
      <div className="flex gap-2 mb-3">
        <Skeleton variant="rounded" width={60} height={24} />
        <Skeleton variant="rounded" width={80} height={24} />
      </div>

      {/* 하단 통계 */}
      <div className="flex items-center gap-4">
        <Skeleton variant="text" width={60} height={16} />
        <Skeleton variant="text" width={60} height={16} />
        <Skeleton variant="text" width={60} height={16} />
      </div>
    </div>
  )
}

/**
 * SkeletonList - 여러 스켈레톤 렌더링
 */
export interface SkeletonListProps {
  count?: number
  itemComponent?: React.ComponentType<{ className?: string }>
  itemClassName?: string
  containerClassName?: string
}

export function SkeletonList({
  count = 3,
  itemComponent: ItemComponent = SkeletonCard,
  itemClassName,
  containerClassName
}: SkeletonListProps) {
  return (
    <div className={cn('space-y-4', containerClassName)}>
      {Array.from({ length: count }).map((_, i) => (
        <ItemComponent key={i} className={itemClassName} />
      ))}
    </div>
  )
}

/**
 * SkeletonGrid - 그리드 레이아웃 스켈레톤
 */
export interface SkeletonGridProps {
  count?: number
  cols?: number
  itemComponent?: React.ComponentType<{ className?: string }>
  itemClassName?: string
  containerClassName?: string
}

export function SkeletonGrid({
  count = 6,
  cols = 3,
  itemComponent: ItemComponent = SkeletonCard,
  itemClassName,
  containerClassName
}: SkeletonGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        cols === 2 && 'grid-cols-1 md:grid-cols-2',
        cols === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        cols === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        containerClassName
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ItemComponent key={i} className={itemClassName} />
      ))}
    </div>
  )
}

export default Skeleton