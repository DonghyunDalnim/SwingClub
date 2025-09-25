import React from 'react';
import { cn } from '@/lib/utils';

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

// 카테고리 그리드 컴포넌트 - 숨고 표준 패턴 (auto-fit, 최소 80px, 12px 간격)
export interface CategoryGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  minItemWidth?: number;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

export const CategoryGrid = React.forwardRef<HTMLDivElement, CategoryGridProps>(
  ({ className, children, minItemWidth = 80, gap = 'sm', responsive = true, ...props }, ref) => {
    const gapClasses = {
      none: 'gap-0',
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    };

    const gridTemplate = responsive
      ? `grid-cols-[repeat(auto-fit,minmax(${minItemWidth}px,1fr))]`
      : `grid-cols-[repeat(auto-fill,minmax(${minItemWidth}px,1fr))]`;

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          gridTemplate,
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

CategoryGrid.displayName = 'CategoryGrid';