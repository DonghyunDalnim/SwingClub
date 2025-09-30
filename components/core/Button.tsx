import React from 'react';
import { createButtonStyle } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'default';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  loadingText?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, loading, loadingText = '로딩 중...', fullWidth, disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg'
    };

    const buttonClasses = cn(
      createButtonStyle(variant),
      sizeClasses[size],
      fullWidth && 'w-full',
      loading && 'cursor-not-allowed opacity-70',
      className
    );

    return (
      <button
        className={cn(
          buttonClasses,
          // WCAG AA 준수 포커스 스타일: #693BF2 색상, 2px 두께, 명확한 가시성
          'focus:outline-none',
          'focus-visible:ring-2 focus-visible:ring-[#693BF2] focus-visible:ring-offset-2',
          // 숨고 마이크로 인터랙션: 호버/클릭 애니메이션
          'transition-all duration-200 ease-out',
          'hover:scale-[1.02]',
          'active:scale-[0.98]',
          'transform',
          // reduce-motion 접근성 지원
          'motion-reduce:transition-none motion-reduce:hover:transform-none'
        )}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-label={loading ? loadingText : props['aria-label']}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            role="presentation"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        <span className={loading ? 'sr-only' : undefined}>
          {children}
        </span>
        {loading && (
          <span aria-live="polite" className="sr-only">
            {loadingText}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
export { Button };