import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'white' | 'gray' | 'transparent';
  variant?: 'default' | 'hero';
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, children, spacing = 'md', background = 'transparent', variant = 'default', ...props }, ref) => {
    const spacingClasses = {
      none: '',
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16'
    };

    const backgroundClasses = {
      white: 'bg-white',
      gray: 'bg-[#F6F7F9]',
      transparent: 'bg-transparent'
    };

    const variantClasses = {
      default: '',
      hero: 'bg-white py-[60px] flex items-center justify-center text-center hero-responsive'
    };

    return (
      <section
        ref={ref}
        className={cn(
          variant === 'hero' ? variantClasses.hero : `${spacingClasses[spacing]} ${backgroundClasses[background]}`,
          className
        )}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = 'Section';

// 섹션 헤더 컴포넌트 - 숨고 표준 패턴 (space-between, 24px 하단 마진)
export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, subtitle, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between mb-6',
          className
        )}
        {...props}
      >
        <div className="flex-1">
          {typeof title === 'string' ? (
            <h2 className="text-h2 text-neutral-darkest">{title}</h2>
          ) : (
            title
          )}
          {subtitle && (
            <div className="mt-1">
              {typeof subtitle === 'string' ? (
                <p className="text-small text-neutral-medium">{subtitle}</p>
              ) : (
                subtitle
              )}
            </div>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0 ml-4">
            {action}
          </div>
        )}
      </div>
    );
  }
);

SectionHeader.displayName = 'SectionHeader';