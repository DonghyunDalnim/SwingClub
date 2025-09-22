import React from 'react';
import { theme } from '@/lib/theme';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

const sizeMap = {
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px'
} as const;

const colorMap = {
  primary: theme.colors.primary.main,
  secondary: theme.colors.neutral.medium,
  white: theme.colors.white
} as const;

export default function Spinner({
  size = 'md',
  color = 'primary',
  className = ''
}: SpinnerProps) {
  const spinnerSize = sizeMap[size];
  const spinnerColor = colorMap[color];

  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] ${className}`}
      style={{
        width: spinnerSize,
        height: spinnerSize,
        color: spinnerColor,
        borderTopColor: spinnerColor,
        borderRightColor: 'transparent',
        borderBottomColor: spinnerColor,
        borderLeftColor: spinnerColor
      }}
      role="status"
      aria-label="로딩 중"
    >
      <span className="sr-only">로딩 중...</span>
    </div>
  );
}

