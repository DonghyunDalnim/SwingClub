import React from 'react';
import { createCardStyle } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'service' | 'portfolio';
  children: React.ReactNode;
  hoverable?: boolean;
  clickable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, hoverable = true, clickable = false, ...props }, ref) => {
    const cardClasses = cn(
      createCardStyle(variant),
      // 숨고 마이크로 인터랙션
      'transition-all duration-200 ease-out',
      hoverable && 'hover:-translate-y-0.5 hover:shadow-lg',
      !hoverable && 'hover:shadow-none hover:transform-none',
      clickable && 'cursor-pointer active:scale-[0.99]',
      // reduce-motion 접근성 지원
      'motion-reduce:transition-none motion-reduce:hover:transform-none',
      // 키보드 접근성: 클릭 가능한 카드에 포커스 스타일 추가
      clickable && 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#693BF2] focus-visible:ring-offset-2',
      className
    );

    return (
      <div
        className={cardClasses}
        ref={ref}
        // 클릭 가능한 카드는 키보드로도 활성화 가능하도록
        tabIndex={clickable ? 0 : undefined}
        role={clickable ? 'button' : undefined}
        onKeyDown={clickable ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            props.onClick?.(e as any)
          }
        } : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card 서브 컴포넌트들
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-0 pb-4', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-base font-medium leading-[25.12px] text-[#293341]', className)}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-[#6A7685]', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-0 pt-4', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
export default Card;