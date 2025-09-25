import React from 'react';
import { cn } from '@/lib/utils';

// 캐러셀 컴포넌트 - 숨고 표준 패턴 (Flex 레이아웃, 16px 간격)
export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  scrollable?: boolean;
  showScrollbar?: boolean;
}

export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ className, children, gap = 'md', scrollable = true, showScrollbar = false, ...props }, ref) => {
    const gapClasses = {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-4', // 16px - 숨고 표준
      lg: 'gap-6',
      xl: 'gap-8'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex', // Flex 레이아웃 - 숨고 표준
          gapClasses[gap],
          scrollable && 'overflow-x-auto',
          scrollable && !showScrollbar && 'scrollbar-hide',
          scrollable && 'snap-x snap-mandatory',
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => (
          <div className={cn('flex-shrink-0', scrollable && 'snap-start')}>
            {child}
          </div>
        ))}
      </div>
    );
  }
);

Carousel.displayName = 'Carousel';

// 캐러셀 아이템 컴포넌트
export interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  width?: string;
}

export const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ className, children, width, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex-shrink-0', className)}
        style={{ width, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CarouselItem.displayName = 'CarouselItem';

export default Carousel;