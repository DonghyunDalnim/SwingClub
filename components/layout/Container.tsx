import React from 'react';
import { containerStyle, flexStyles, responsiveGrid } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, children, size = 'lg', padding = true, ...props }, ref) => {
    const sizeClasses = {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-[1200px]',
      xl: 'max-w-screen-xl',
      full: 'max-w-full'
    };

    return (
      <div
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
      </div>
    );
  }
);

Container.displayName = 'Container';

// 섹션 컴포넌트
export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'white' | 'gray' | 'transparent';
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, children, spacing = 'md', background = 'transparent', ...props }, ref) => {
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

    return (
      <section
        ref={ref}
        className={cn(
          spacingClasses[spacing],
          backgroundClasses[background],
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

// 플렉스 레이아웃 컴포넌트
export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
}

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({
    className,
    children,
    direction = 'row',
    align = 'start',
    justify = 'start',
    gap = 'md',
    wrap = false,
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
      <div
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
      </div>
    );
  }
);

Flex.displayName = 'Flex';

// 그리드 레이아웃 컴포넌트
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 'auto-fit' | 'auto-fill';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, children, cols = 'auto-fit', gap = 'md', responsive = true, ...props }, ref) => {
    const gapClasses = {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    };

    let colsClasses = '';
    if (typeof cols === 'number') {
      const colsMap: Record<number, string> = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6'
      };
      colsClasses = responsive
        ? `grid-cols-1 sm:grid-cols-2 md:${colsMap[Math.min(cols, 3) as keyof typeof colsMap]} lg:${colsMap[cols as keyof typeof colsMap]}`
        : colsMap[cols as keyof typeof colsMap];
    } else if (cols === 'auto-fit') {
      colsClasses = 'grid-cols-[repeat(auto-fit,minmax(200px,1fr))]';
    } else if (cols === 'auto-fill') {
      colsClasses = 'grid-cols-[repeat(auto-fill,minmax(200px,1fr))]';
    }

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          colsClasses,
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

export default Container;