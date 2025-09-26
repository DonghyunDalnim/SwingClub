import React from 'react';
import { Button } from '@/components/core';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon = '📝',
  title,
  description,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      {/* 일러스트레이션 */}
      <div className="mb-6">
        {typeof icon === 'string' ? (
          <div className="text-6xl mb-4" role="img" aria-label={title}>
            {icon}
          </div>
        ) : (
          <div className="mb-4">
            {icon}
          </div>
        )}
      </div>

      {/* 제목 */}
      <h3 className="text-lg font-medium text-[#293341] mb-2">
        {title}
      </h3>

      {/* 설명 */}
      {description && (
        <p className="text-[#6A7685] text-sm leading-relaxed max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* 액션 버튼 */}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// 프리셋 일러스트레이션 컴포넌트들
export function EmptyPostsIllustration() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      className="text-[#EFF1F5]"
    >
      <rect
        x="12"
        y="20"
        width="56"
        height="40"
        rx="4"
        fill="currentColor"
        stroke="#C7CED6"
        strokeWidth="2"
      />
      <rect x="20" y="28" width="40" height="2" rx="1" fill="#C7CED6" />
      <rect x="20" y="32" width="24" height="2" rx="1" fill="#C7CED6" />
      <rect x="20" y="40" width="32" height="2" rx="1" fill="#C7CED6" />
      <rect x="20" y="44" width="28" height="2" rx="1" fill="#C7CED6" />
    </svg>
  );
}

export function EmptyMarketplaceIllustration() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      className="text-[#EFF1F5]"
    >
      <rect
        x="20"
        y="30"
        width="40"
        height="30"
        rx="4"
        fill="currentColor"
        stroke="#C7CED6"
        strokeWidth="2"
      />
      <circle cx="30" cy="42" r="4" fill="#C7CED6" />
      <rect x="36" y="40" width="16" height="2" rx="1" fill="#C7CED6" />
      <rect x="36" y="44" width="12" height="2" rx="1" fill="#C7CED6" />
      <rect x="24" y="52" width="8" height="2" rx="1" fill="#693BF2" />
      <rect x="44" y="52" width="6" height="2" rx="1" fill="#C7CED6" />
    </svg>
  );
}

export default EmptyState;