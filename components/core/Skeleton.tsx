import React from 'react';
import { theme } from '@/lib/theme';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
  children?: React.ReactNode;
}

export default function Skeleton({
  width,
  height,
  variant = 'rectangular',
  animation = 'pulse',
  className = '',
  children
}: SkeletonProps) {
  const getVariantStyles = () => {
    const baseStyles = {
      backgroundColor: theme.colors.neutral.lightest,
      display: 'inline-block'
    };

    switch (variant) {
      case 'text':
        return {
          ...baseStyles,
          borderRadius: '4px',
          height: height || '1rem',
          width: width || '100%'
        };
      case 'circular':
        return {
          ...baseStyles,
          borderRadius: '50%',
          width: width || '40px',
          height: height || width || '40px'
        };
      case 'rectangular':
      default:
        return {
          ...baseStyles,
          borderRadius: '8px',
          width: width || '100%',
          height: height || '20px'
        };
    }
  };

  const getAnimationClass = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'wave':
        return 'animate-wave';
      case 'none':
      default:
        return '';
    }
  };

  if (children) {
    return (
      <div className={`relative ${className}`}>
        <div className="invisible">{children}</div>
        <div
          className={`absolute inset-0 ${getAnimationClass()}`}
          style={getVariantStyles()}
        />
      </div>
    );
  }

  return (
    <div
      className={`${getAnimationClass()} ${className}`}
      style={getVariantStyles()}
      aria-label="콘텐츠 로딩 중"
      role="progressbar"
    />
  );
}

// Skeleton 조합 컴포넌트들
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 border border-gray-200 rounded-lg space-y-3 ${className}`}>
      <Skeleton height="12px" width="60%" />
      <Skeleton height="16px" width="100%" />
      <Skeleton height="16px" width="80%" />
      <div className="flex space-x-2 pt-2">
        <Skeleton variant="circular" width="24px" height="24px" />
        <Skeleton height="12px" width="40%" />
      </div>
    </div>
  );
}

export function SkeletonList({
  items = 3,
  className = ''
}: {
  items?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex space-x-3">
          <Skeleton variant="circular" width="40px" height="40px" />
          <div className="flex-1 space-y-2">
            <Skeleton height="14px" width="70%" />
            <Skeleton height="12px" width="50%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className = ''
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Table Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} height="16px" width="80%" />
        ))}
      </div>
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} height="14px" width={`${60 + Math.random() * 30}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}

