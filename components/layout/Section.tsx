import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'white' | 'gray' | 'transparent';
  variant?: 'default' | 'hero';
  as?: 'section' | 'article' | 'aside' | 'div';
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export const Section = React.forwardRef<any, SectionProps>(
  ({ className, children, spacing = 'md', background = 'transparent', variant = 'default', as: Component = 'section', ...props }, ref) => {
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
      <Component
        ref={ref}
        className={cn(
          variant === 'hero' ? variantClasses.hero : `${spacingClasses[spacing]} ${backgroundClasses[background]}`,
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Section.displayName = 'Section';

// 섹션 헤더 컴포넌트 - 숨고 표준 패턴 (space-between, 24px 하단 마진)
export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  titleId?: string;
}

export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, subtitle, action, level = 2, titleId, ...props }, ref) => {
    const HeadingComponent = `h${level}` as React.ElementType;
    const reactId = React.useId();
    const generatedTitleId = titleId || reactId;

    return (
      <header
        ref={ref}
        className={cn(
          'flex items-center justify-between mb-6',
          className
        )}
        {...props}
      >
        <div className="flex-1">
          {typeof title === 'string' ? (
            <HeadingComponent
              id={generatedTitleId}
              className="text-h2 text-neutral-darkest"
            >
              {title}
            </HeadingComponent>
          ) : (
            <div id={generatedTitleId}>{title}</div>
          )}
          {subtitle && (
            <div className="mt-1" aria-describedby={generatedTitleId}>
              {typeof subtitle === 'string' ? (
                <p className="text-small text-neutral-medium">{subtitle}</p>
              ) : (
                subtitle
              )}
            </div>
          )}
        </div>
        {action && (
          <div
            className="flex-shrink-0 ml-4"
            role="group"
            aria-label="섹션 액션"
          >
            {action}
          </div>
        )}
      </header>
    );
  }
);

SectionHeader.displayName = 'SectionHeader';