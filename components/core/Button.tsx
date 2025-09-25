'use client'

import React, { useRef, useEffect } from 'react';
import { createButtonStyle } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import { createColorTransition, reduceMotion } from '@/lib/utils/animations';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'default';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, loading, fullWidth, disabled, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const internalRef = (ref as React.RefObject<HTMLButtonElement>) || buttonRef;

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
      'motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] transition-all duration-200',
      className
    );

    const handleMouseEnter = () => {
      if (!disabled && !loading && !reduceMotion() && internalRef.current) {
        const button = internalRef.current;
        if (variant === 'secondary' || variant === 'ghost') {
          createColorTransition(button, button.style.color || '#293341', '#693BF2', 150);
        }
      }
    };

    const handleMouseLeave = () => {
      if (!disabled && !loading && !reduceMotion() && internalRef.current) {
        const button = internalRef.current;
        if (variant === 'secondary' || variant === 'ghost') {
          createColorTransition(button, button.style.color || '#693BF2', '#293341', 150);
        }
      }
    };

    return (
      <button
        className={buttonClasses}
        ref={internalRef}
        disabled={disabled || loading}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
export { Button };