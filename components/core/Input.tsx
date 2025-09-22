import React, { forwardRef } from 'react';
import { theme } from '@/lib/theme';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
  className?: string;
}

const sizeMap = {
  sm: {
    input: 'h-8 px-3 text-sm',
    label: 'text-sm',
    text: 'text-xs'
  },
  md: {
    input: 'h-10 px-3 text-sm',
    label: 'text-sm',
    text: 'text-xs'
  },
  lg: {
    input: 'h-12 px-4 text-base',
    label: 'text-base',
    text: 'text-sm'
  }
} as const;

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  size = 'md',
  variant = 'default',
  leftIcon,
  rightIcon,
  required = false,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const getVariantStyles = () => {
    const baseStyles = {
      borderRadius: '6px',
      transition: 'all 0.2s ease',
      fontFamily: theme.typography.fontFamily.primary
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.white,
          border: `1px solid ${hasError ? theme.colors.accent.red : theme.colors.neutral.light}`,
          '&:focus': {
            outline: 'none',
            borderColor: hasError ? theme.colors.accent.red : theme.colors.primary.main,
            boxShadow: `0 0 0 3px ${hasError ? theme.colors.accent.red : theme.colors.primary.main}33`
          }
        };
      case 'filled':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.neutral.lightest,
          border: `1px solid transparent`,
          '&:focus': {
            outline: 'none',
            backgroundColor: theme.colors.white,
            borderColor: hasError ? theme.colors.accent.red : theme.colors.primary.main,
            boxShadow: `0 0 0 3px ${hasError ? theme.colors.accent.red : theme.colors.primary.main}33`
          }
        };
      case 'default':
      default:
        return {
          ...baseStyles,
          backgroundColor: theme.colors.neutral.lightest,
          border: 'none',
          '&:focus': {
            outline: 'none',
            backgroundColor: theme.colors.white,
            boxShadow: `0 0 0 3px ${hasError ? theme.colors.accent.red : theme.colors.primary.main}33`
          }
        };
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={`block font-medium ${sizeMap[size].label}`}
          style={{ color: theme.colors.neutral.darkest }}
        >
          {label}
          {required && (
            <span style={{ color: theme.colors.accent.red }}> *</span>
          )}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <div style={{ color: theme.colors.neutral.medium }}>
              {leftIcon}
            </div>
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          className={`w-full ${sizeMap[size].input} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} transition-all duration-200 focus:outline-none`}
          style={{
            ...getVariantStyles(),
            color: theme.colors.neutral.darkest
          }}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <div style={{ color: theme.colors.neutral.medium }}>
              {rightIcon}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p
          className={`${sizeMap[size].text} mt-1`}
          style={{ color: theme.colors.accent.red }}
        >
          {error}
        </p>
      )}

      {/* Hint Message */}
      {hint && !error && (
        <p
          className={`${sizeMap[size].text} mt-1`}
          style={{ color: theme.colors.neutral.medium }}
        >
          {hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

// Textarea 컴포넌트
export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  required?: boolean;
  className?: string;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  hint,
  size = 'md',
  variant = 'default',
  required = false,
  className = '',
  resize = 'vertical',
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const getVariantStyles = () => {
    const baseStyles = {
      borderRadius: '6px',
      transition: 'all 0.2s ease',
      fontFamily: theme.typography.fontFamily.primary,
      resize: resize
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.white,
          border: `1px solid ${hasError ? theme.colors.accent.red : theme.colors.neutral.light}`,
          '&:focus': {
            outline: 'none',
            borderColor: hasError ? theme.colors.accent.red : theme.colors.primary.main,
            boxShadow: `0 0 0 3px ${hasError ? theme.colors.accent.red : theme.colors.primary.main}33`
          }
        };
      case 'filled':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.neutral.lightest,
          border: `1px solid transparent`,
          '&:focus': {
            outline: 'none',
            backgroundColor: theme.colors.white,
            borderColor: hasError ? theme.colors.accent.red : theme.colors.primary.main,
            boxShadow: `0 0 0 3px ${hasError ? theme.colors.accent.red : theme.colors.primary.main}33`
          }
        };
      case 'default':
      default:
        return {
          ...baseStyles,
          backgroundColor: theme.colors.neutral.lightest,
          border: 'none',
          '&:focus': {
            outline: 'none',
            backgroundColor: theme.colors.white,
            boxShadow: `0 0 0 3px ${hasError ? theme.colors.accent.red : theme.colors.primary.main}33`
          }
        };
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={textareaId}
          className={`block font-medium ${sizeMap[size].label}`}
          style={{ color: theme.colors.neutral.darkest }}
        >
          {label}
          {required && (
            <span style={{ color: theme.colors.accent.red }}> *</span>
          )}
        </label>
      )}

      {/* Textarea */}
      <textarea
        ref={ref}
        id={textareaId}
        className={`w-full ${sizeMap[size].input} min-h-[80px] transition-all duration-200 focus:outline-none`}
        style={{
          ...getVariantStyles(),
          color: theme.colors.neutral.darkest
        }}
        {...props}
      />

      {/* Error Message */}
      {error && (
        <p
          className={`${sizeMap[size].text} mt-1`}
          style={{ color: theme.colors.accent.red }}
        >
          {error}
        </p>
      )}

      {/* Hint Message */}
      {hint && !error && (
        <p
          className={`${sizeMap[size].text} mt-1`}
          style={{ color: theme.colors.neutral.medium }}
        >
          {hint}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

