import React from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  as?: React.ElementType;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

const Container = React.forwardRef<any, ContainerProps>(
  ({ className, children, size = 'lg', padding = true, as: Component = 'div', ...props }, ref) => {
    const sizeClasses = {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-[1200px]',
      xl: 'max-w-screen-xl',
      full: 'max-w-full'
    };

    return (
      <Component
        ref={ref}
        className={cn(
          'mx-auto',
          sizeClasses[size],
          padding && 'px-4',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = 'Container';

// 플렉스 레이아웃 컴포넌트
export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
  as?: React.ElementType;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export const Flex = React.forwardRef<any, FlexProps>(
  ({
    className,
    children,
    direction = 'row',
    align = 'start',
    justify = 'start',
    gap = 'md',
    wrap = false,
    as: Component = 'div',
    ...props
  }, ref) => {
    const directionClasses = {
      row: 'flex-row',
      column: 'flex-col'
    };

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch'
    };

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    };

    const gapClasses = {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    };

    return (
      <Component
        ref={ref}
        className={cn(
          'flex',
          directionClasses[direction],
          alignClasses[align],
          justifyClasses[justify],
          gapClasses[gap],
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Flex.displayName = 'Flex';

export default Container;