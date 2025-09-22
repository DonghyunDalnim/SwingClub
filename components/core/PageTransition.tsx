'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export interface PageTransitionProps {
  children: React.ReactNode;
  variant?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown';
  duration?: number;
  className?: string;
}

const transitionVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 }
  },
  slideDown: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 }
  }
} as const;

export default function PageTransition({
  children,
  variant = 'fade',
  duration = 300,
  className = ''
}: PageTransitionProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const pathname = usePathname();

  useEffect(() => {
    if (displayChildren !== children) {
      setIsAnimating(true);

      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setIsAnimating(false);
      }, duration / 2);

      return () => clearTimeout(timer);
    }
  }, [children, duration, displayChildren]);

  const getTransitionClasses = () => {
    const transition = transitionVariants[variant];

    if (isAnimating) {
      // Exit animation
      return `animate-out ${getExitClasses(variant)} duration-${duration}`;
    } else {
      // Enter animation
      return `animate-in ${getEnterClasses(variant)} duration-${duration}`;
    }
  };

  const getEnterClasses = (variant: string) => {
    switch (variant) {
      case 'fade':
        return 'fade-in';
      case 'slide':
        return 'slide-in-from-right';
      case 'scale':
        return 'zoom-in-95';
      case 'slideUp':
        return 'slide-in-from-bottom';
      case 'slideDown':
        return 'slide-in-from-top';
      default:
        return 'fade-in';
    }
  };

  const getExitClasses = (variant: string) => {
    switch (variant) {
      case 'fade':
        return 'fade-out';
      case 'slide':
        return 'slide-out-to-left';
      case 'scale':
        return 'zoom-out-95';
      case 'slideUp':
        return 'slide-out-to-top';
      case 'slideDown':
        return 'slide-out-to-bottom';
      default:
        return 'fade-out';
    }
  };

  return (
    <div className={`${getTransitionClasses()} ${className}`}>
      {displayChildren}
    </div>
  );
}

// RouteTransition - Next.js App Router용 페이지 전환
export function RouteTransition({
  children,
  variant = 'slideUp',
  duration = 300,
  className = ''
}: PageTransitionProps) {
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState(pathname);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (pathname !== currentPath) {
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setCurrentPath(pathname);
        setIsTransitioning(false);
      }, duration / 2);

      return () => clearTimeout(timer);
    }
  }, [pathname, currentPath, duration]);

  return (
    <PageTransition
      variant={variant}
      duration={duration}
      className={className}
      key={currentPath} // Re-render when path changes
    >
      {children}
    </PageTransition>
  );
}

// ViewTransition - 같은 페이지 내 뷰 전환용
export function ViewTransition({
  children,
  trigger,
  variant = 'fade',
  duration = 200,
  className = ''
}: PageTransitionProps & { trigger?: any }) {
  const [currentTrigger, setCurrentTrigger] = useState(trigger);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (trigger !== currentTrigger) {
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setCurrentTrigger(trigger);
        setIsTransitioning(false);
      }, duration / 2);

      return () => clearTimeout(timer);
    }
  }, [trigger, currentTrigger, duration]);

  return (
    <PageTransition
      variant={variant}
      duration={duration}
      className={className}
      key={currentTrigger}
    >
      {children}
    </PageTransition>
  );
}

