import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  type?: 'post' | 'marketplace-item';
  className?: string;
}

function SkeletonBox({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse bg-[#EFF1F5] rounded-md',
        className
      )}
      aria-busy="true"
      {...props}
    />
  );
}

export function SkeletonCard({ type = 'post', className }: SkeletonCardProps) {
  if (type === 'marketplace-item') {
    return (
      <div
        className={cn(
          'bg-white border border-[#EFF1F5] rounded-xl p-4 shadow-sm',
          className
        )}
        aria-label="Loading marketplace item"
      >
        <div className="flex space-x-4">
          {/* 이미지 스켈레톤 */}
          <SkeletonBox className="w-20 h-20 rounded-lg flex-shrink-0" />

          <div className="flex-1 space-y-2">
            {/* 제목과 배지 */}
            <div className="flex items-center justify-between">
              <SkeletonBox className="h-4 w-3/4" />
              <SkeletonBox className="h-5 w-12 rounded-full" />
            </div>

            {/* 판매자 정보 */}
            <div className="flex items-center space-x-2">
              <SkeletonBox className="h-3 w-16" />
              <SkeletonBox className="h-3 w-8" />
              <SkeletonBox className="h-5 w-12 rounded-full" />
            </div>

            {/* 설명 */}
            <SkeletonBox className="h-3 w-full" />

            {/* 가격과 시간 */}
            <div className="flex items-center justify-between">
              <SkeletonBox className="h-5 w-20" />
              <SkeletonBox className="h-3 w-12" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Post 타입 스켈레톤
  return (
    <div
      className={cn(
        'bg-white border border-[#EFF1F5] rounded-xl p-4 shadow-sm space-y-4',
        className
      )}
      aria-label="Loading post"
    >
      {/* 헤더 - 카테고리와 시간 */}
      <div className="flex items-center justify-between">
        <SkeletonBox className="h-6 w-16 rounded-full" />
        <SkeletonBox className="h-4 w-12" />
      </div>

      {/* 제목 */}
      <SkeletonBox className="h-5 w-4/5" />

      {/* 내용 - 2줄 */}
      <div className="space-y-2">
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-3/4" />
      </div>

      {/* 작성자와 통계 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SkeletonBox className="h-8 w-8 rounded-full" />
          <div className="space-y-1">
            <SkeletonBox className="h-3 w-12" />
            <SkeletonBox className="h-3 w-16" />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <SkeletonBox className="h-4 w-8" />
          <SkeletonBox className="h-4 w-8" />
          <SkeletonBox className="h-4 w-8" />
        </div>
      </div>
    </div>
  );
}

export default SkeletonCard;