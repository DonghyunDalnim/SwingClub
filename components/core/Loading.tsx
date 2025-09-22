import React from 'react';
import { theme } from '@/lib/theme';
import Spinner from './Spinner';

export interface LoadingProps {
  variant?: 'inline' | 'overlay' | 'page';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  children?: React.ReactNode;
  className?: string;
  transparent?: boolean;
}

export default function Loading({
  variant = 'inline',
  size = 'md',
  text,
  children,
  className = '',
  transparent = false
}: LoadingProps) {
  const getLoadingContent = () => (
    <div className="flex flex-col items-center justify-center space-y-3">
      <Spinner size={size} color="primary" />
      {text && (
        <p
          className="text-sm"
          style={{ color: theme.colors.neutral.medium }}
        >
          {text}
        </p>
      )}
    </div>
  );

  switch (variant) {
    case 'inline':
      return (
        <div className={`flex items-center justify-center py-8 ${className}`}>
          {getLoadingContent()}
        </div>
      );

    case 'overlay':
      return (
        <div className={`relative ${className}`}>
          {children}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backgroundColor: transparent
                ? 'rgba(255, 255, 255, 0.8)'
                : theme.colors.white,
              backdropFilter: transparent ? 'blur(2px)' : 'none'
            }}
          >
            {getLoadingContent()}
          </div>
        </div>
      );

    case 'page':
      return (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 ${className}`}
          style={{
            backgroundColor: transparent
              ? 'rgba(255, 255, 255, 0.9)'
              : theme.colors.white
          }}
        >
          {getLoadingContent()}
        </div>
      );

    default:
      return null;
  }
}

// 특정 용도별 로딩 컴포넌트들
export function ButtonLoading({
  size = 'sm',
  className = ''
}: {
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Spinner size={size} color="white" />
    </div>
  );
}

export function CardLoading({
  height = '200px',
  className = ''
}: {
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center border border-gray-200 rounded-lg ${className}`}
      style={{
        height,
        backgroundColor: theme.colors.neutral.background
      }}
    >
      <div className="text-center space-y-3">
        <Spinner size="lg" />
        <p
          className="text-sm"
          style={{ color: theme.colors.neutral.medium }}
        >
          데이터를 불러오는 중...
        </p>
      </div>
    </div>
  );
}

export function TableLoading({
  rows = 5,
  className = ''
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-12 rounded-lg animate-pulse"
          style={{ backgroundColor: theme.colors.neutral.lightest }}
        />
      ))}
    </div>
  );
}

export function ListLoading({
  items = 3,
  className = ''
}: {
  items?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex space-x-3">
          <div
            className="w-12 h-12 rounded-full animate-pulse"
            style={{ backgroundColor: theme.colors.neutral.lightest }}
          />
          <div className="flex-1 space-y-2">
            <div
              className="h-4 rounded animate-pulse"
              style={{
                backgroundColor: theme.colors.neutral.lightest,
                width: `${60 + Math.random() * 30}%`
              }}
            />
            <div
              className="h-3 rounded animate-pulse"
              style={{
                backgroundColor: theme.colors.neutral.lightest,
                width: `${40 + Math.random() * 30}%`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

