import React from 'react';
import { createBadgeStyle } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rating' | 'category' | 'status' | 'outline';
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'category', color = 'primary', children, ...props }, ref) => {
    let badgeClasses = '';

    if (variant === 'rating' || variant === 'category') {
      badgeClasses = createBadgeStyle(variant);
    } else {
      // 커스텀 variant들
      const base = 'inline-flex items-center justify-center font-medium text-xs px-2 py-1 rounded';

      const variantClasses = {
        status: 'rounded-full',
        outline: 'border'
      };

      const colorClasses = {
        primary: variant === 'outline'
          ? 'border-[#693BF2] text-[#693BF2] bg-transparent'
          : 'bg-[#693BF2] text-white',
        secondary: variant === 'outline'
          ? 'border-[#6A7685] text-[#6A7685] bg-transparent'
          : 'bg-[#F1EEFF] text-[#693BF2]',
        success: variant === 'outline'
          ? 'border-green-600 text-green-600 bg-transparent'
          : 'bg-green-100 text-green-800',
        warning: variant === 'outline'
          ? 'border-yellow-600 text-yellow-600 bg-transparent'
          : 'bg-yellow-100 text-yellow-800',
        error: variant === 'outline'
          ? 'border-red-600 text-red-600 bg-transparent'
          : 'bg-red-100 text-red-800'
      };

      badgeClasses = cn(
        base,
        variantClasses[variant],
        colorClasses[color]
      );
    }

    return (
      <div
        ref={ref}
        className={cn(badgeClasses, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
export { Badge };