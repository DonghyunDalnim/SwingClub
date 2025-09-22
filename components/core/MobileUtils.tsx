'use client';

import React, { useEffect, useState } from 'react';
import { theme } from '@/lib/theme';

// Safe area utilities for mobile devices
export function SafeArea({
  children,
  className = '',
  top = true,
  bottom = true
}: {
  children: React.ReactNode;
  className?: string;
  top?: boolean;
  bottom?: boolean;
}) {
  return (
    <div
      className={`${className}`}
      style={{
        paddingTop: top ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: bottom ? 'env(safe-area-inset-bottom)' : undefined,
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      {children}
    </div>
  );
}

// Mobile-optimized bottom sheet
export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: 'auto' | 'half' | 'full';
  snapPoints?: number[];
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  height = 'auto',
  snapPoints,
  className = ''
}: BottomSheetProps) {
  const [currentHeight, setCurrentHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getHeightClass = () => {
    switch (height) {
      case 'half':
        return 'h-1/2';
      case 'full':
        return 'h-full';
      default:
        return 'h-auto max-h-[90vh]';
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    // Only allow downward dragging
    if (deltaY > 0) {
      setCurrentHeight(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // Close if dragged down enough
    if (currentHeight > 100) {
      onClose();
    }

    setCurrentHeight(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        style={{ backdropFilter: 'blur(4px)' }}
      />

      {/* Sheet */}
      <div
        className={`
          relative w-full bg-white rounded-t-lg shadow-xl
          transform transition-transform duration-300
          ${getHeightClass()}
          ${className}
        `}
        style={{
          backgroundColor: theme.colors.white,
          transform: `translateY(${currentHeight}px)`
        }}
      >
        {/* Handle */}
        <div
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="w-12 h-1 rounded-full"
            style={{ backgroundColor: theme.colors.neutral.light }}
          />
        </div>

        {/* Header */}
        {title && (
          <div
            className="px-4 pb-4 border-b"
            style={{ borderColor: theme.colors.neutral.lightest }}
          >
            <h2
              className="text-lg font-semibold text-center"
              style={{ color: theme.colors.neutral.darkest }}
            >
              {title}
            </h2>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <SafeArea bottom={true}>
            {children}
          </SafeArea>
        </div>
      </div>
    </div>
  );
}

// Mobile-optimized tab bar
export interface TabBarProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    badge?: number;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function TabBar({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}: TabBarProps) {
  return (
    <SafeArea top={false}>
      <div
        className={`
          flex border-t bg-white
          ${className}
        `}
        style={{
          borderColor: theme.colors.neutral.lightest,
          backgroundColor: theme.colors.white
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`
              flex-1 flex flex-col items-center justify-center py-2 px-1
              touch-manipulation transition-colors duration-200
              ${activeTab === tab.id ? 'text-purple-600' : 'text-gray-500'}
            `}
            style={{
              color: activeTab === tab.id ? theme.colors.primary.main : theme.colors.neutral.medium,
              minHeight: '60px'
            }}
            onClick={() => onTabChange(tab.id)}
          >
            {/* Icon with badge */}
            <div className="relative mb-1">
              {tab.icon}
              {tab.badge && tab.badge > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[16px] h-4 text-xs rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: theme.colors.accent.red,
                    color: theme.colors.white,
                    fontSize: '10px'
                  }}
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span className="text-xs font-medium">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </SafeArea>
  );
}

// Touch-friendly action sheet
export interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actions: Array<{
    label: string;
    onPress: () => void;
    destructive?: boolean;
    disabled?: boolean;
  }>;
  cancelLabel?: string;
  className?: string;
}

export function ActionSheet({
  isOpen,
  onClose,
  title,
  message,
  actions,
  cancelLabel = '취소',
  className = ''
}: ActionSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      className={className}
    >
      <div className="p-4 space-y-4">
        {/* Header */}
        {(title || message) && (
          <div className="text-center space-y-2">
            {title && (
              <h3
                className="text-lg font-semibold"
                style={{ color: theme.colors.neutral.darkest }}
              >
                {title}
              </h3>
            )}
            {message && (
              <p
                className="text-sm"
                style={{ color: theme.colors.neutral.medium }}
              >
                {message}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`
                w-full py-4 px-4 rounded-lg text-center font-medium
                transition-colors duration-200 touch-manipulation
                ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'active:opacity-70'}
              `}
              style={{
                backgroundColor: theme.colors.neutral.background,
                color: action.destructive ? theme.colors.accent.red : theme.colors.neutral.darkest
              }}
              onClick={() => {
                action.onPress();
                onClose();
              }}
              disabled={action.disabled}
            >
              {action.label}
            </button>
          ))}

          {/* Cancel button */}
          <button
            className="w-full py-4 px-4 rounded-lg text-center font-semibold bg-white border transition-colors duration-200 touch-manipulation active:opacity-70"
            style={{
              backgroundColor: theme.colors.white,
              borderColor: theme.colors.neutral.light,
              color: theme.colors.neutral.darkest
            }}
            onClick={onClose}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

// Responsive breakpoint hook
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1200) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);

    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop'
  };
}

