import React from 'react';
import { createTextStyle } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small';
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant = 'body', as, children, ...props }, ref) => {
    // 기본 HTML 태그 매핑
    const defaultTag = {
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      body: 'p',
      small: 'span'
    } as const;

    const Component = (as || defaultTag[variant]) as keyof JSX.IntrinsicElements;

    return React.createElement(
      Component,
      {
        ref,
        className: cn(createTextStyle(variant), className),
        ...props
      },
      children
    );
  }
);

Typography.displayName = 'Typography';

// 편의성을 위한 특수 컴포넌트들
export const Heading1 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography ref={ref} variant="h1" as="h1" {...props} />
);
Heading1.displayName = 'Heading1';

export const Heading2 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography ref={ref} variant="h2" as="h2" {...props} />
);
Heading2.displayName = 'Heading2';

export const Heading3 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography ref={ref} variant="h3" as="h3" {...props} />
);
Heading3.displayName = 'Heading3';

export const Heading4 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography ref={ref} variant="h4" as="h4" {...props} />
);
Heading4.displayName = 'Heading4';

export const Body = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography ref={ref} variant="body" as="p" {...props} />
);
Body.displayName = 'Body';

export const Small = React.forwardRef<HTMLSpanElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => <Typography ref={ref} variant="small" as="span" {...props} />
);
Small.displayName = 'Small';

export default Typography;