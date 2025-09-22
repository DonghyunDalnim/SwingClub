'use client';

import React, { useEffect, useState, useRef } from 'react';
import { theme } from '@/lib/theme';

// Touch-friendly Button component with enhanced mobile interactions
export interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  ripple?: boolean;
  haptic?: boolean;
  children: React.ReactNode;
}

export function TouchButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ripple = true,
  haptic = false,
  children,
  className = '',
  onClick,
  disabled,
  ...props
}: TouchButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-sm min-h-[44px]',
    lg: 'px-6 py-4 text-base min-h-[52px]',
    xl: 'px-8 py-5 text-lg min-h-[60px]'
  };

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary.main,
      color: theme.colors.white,
      border: 'none'
    },
    secondary: {
      backgroundColor: 'transparent',
      color: theme.colors.neutral.darkest,
      border: `1px solid ${theme.colors.neutral.light}`
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.primary.main,
      border: 'none'
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    // Haptic feedback
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    // Ripple effect
    if (ripple && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const newRipple = { x, y, id: rippleId.current++ };

      setRipples(prev => [...prev, newRipple]);

      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }

    onClick?.(event);
  };

  return (
    <button
      ref={buttonRef}
      className={`
        relative overflow-hidden rounded-lg font-medium transition-all duration-200
        touch-manipulation select-none
        active:scale-95 active:opacity-80
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={variantStyles[variant]}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white opacity-30 animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: '600ms'
          }}
        />
      ))}

      {children}
    </button>
  );
}

// Swipe-enabled Card component
export interface SwipeCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  swipeThreshold?: number;
  className?: string;
}

export function SwipeCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeThreshold = 50,
  className = ''
}: SwipeCardProps) {
  const [startTouch, setStartTouch] = useState<{ x: number; y: number } | null>(null);
  const [currentTouch, setCurrentTouch] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartTouch({ x: touch.clientX, y: touch.clientY });
    setCurrentTouch({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startTouch) return;

    const touch = e.touches[0];
    setCurrentTouch({ x: touch.clientX, y: touch.clientY });

    // Optional: Show visual feedback during swipe
    if (cardRef.current) {
      const deltaX = touch.clientX - startTouch.x;
      const deltaY = touch.clientY - startTouch.y;

      // Apply slight transform for visual feedback
      const maxTransform = 10;
      const transformX = Math.max(-maxTransform, Math.min(maxTransform, deltaX * 0.1));
      const transformY = Math.max(-maxTransform, Math.min(maxTransform, deltaY * 0.1));

      cardRef.current.style.transform = `translate(${transformX}px, ${transformY}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!startTouch || !currentTouch) return;

    const deltaX = currentTouch.x - startTouch.x;
    const deltaY = currentTouch.y - startTouch.y;

    // Reset transform
    if (cardRef.current) {
      cardRef.current.style.transform = '';
    }

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > swipeThreshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    setStartTouch(null);
    setCurrentTouch(null);
  };

  return (
    <div
      ref={cardRef}
      className={`touch-pan-y transition-transform duration-200 ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

// Pull-to-refresh component
export interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  threshold = 100,
  className = ''
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;

    const container = containerRef.current;
    if (container && container.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || isRefreshing || startY === 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    if (distance > 0) {
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    setStartY(0);
  };

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const spinnerOpacity = pullProgress;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200"
        style={{
          height: Math.max(0, pullDistance),
          opacity: spinnerOpacity,
          transform: `translateY(${pullDistance - threshold}px)`
        }}
      >
        <div
          className={`w-6 h-6 border-2 border-t-transparent rounded-full ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          style={{
            borderColor: theme.colors.primary.main,
            borderTopColor: 'transparent'
          }}
        />
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Long press utility hook
export function useLongPress(
  callback: () => void,
  options: {
    threshold?: number;
    onStart?: () => void;
    onEnd?: () => void;
  } = {}
) {
  const { threshold = 500, onStart, onEnd } = options;
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const target = useRef<EventTarget | null>(null);

  const start = (event: React.TouchEvent | React.MouseEvent) => {
    if (onStart) onStart();
    setIsLongPressing(false);
    target.current = event.target;

    timeout.current = setTimeout(() => {
      callback();
      setIsLongPressing(true);
    }, threshold);
  };

  const clear = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    setIsLongPressing(false);
    if (onEnd) onEnd();
  };

  return {
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchCancel: clear,
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    isLongPressing
  };
}

