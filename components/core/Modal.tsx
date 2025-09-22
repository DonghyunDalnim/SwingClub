'use client';

import React, { useEffect, useState } from 'react';
import { theme } from '@/lib/theme';
import { X } from 'lucide-react';
import Button from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
  className?: string;
  backdropClassName?: string;
  animation?: 'fade' | 'slide' | 'scale';
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full'
} as const;

const animationClasses = {
  fade: {
    enter: 'animate-in fade-in duration-200',
    exit: 'animate-out fade-out duration-200'
  },
  slide: {
    enter: 'animate-in slide-in-from-bottom duration-300',
    exit: 'animate-out slide-out-to-bottom duration-300'
  },
  scale: {
    enter: 'animate-in zoom-in-95 duration-200',
    exit: 'animate-out zoom-out-95 duration-200'
  }
} as const;

export default function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  children,
  className = '',
  backdropClassName = '',
  animation = 'fade'
}: ModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Add slight delay for animation
      setTimeout(() => setIsAnimating(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      setTimeout(() => setIsVisible(false), 200);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isAnimating
          ? `${animationClasses[animation].enter} opacity-100`
          : `${animationClasses[animation].exit} opacity-0`
      } ${backdropClassName}`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`relative w-full ${sizeMap[size]} mx-auto bg-white rounded-lg shadow-xl ${className}`}
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: theme.colors.neutral.lightest }}
          >
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold"
                style={{ color: theme.colors.neutral.darkest }}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="닫기"
              >
                <X className="h-5 w-5" style={{ color: theme.colors.neutral.medium }} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Dialog 변형 컴포넌트들
export function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  confirmText = '확인',
  onConfirm,
  className = ''
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
  className?: string;
}) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      className={className}
      animation="scale"
    >
      <div className="space-y-4">
        <p style={{ color: theme.colors.neutral.darkest }}>{message}</p>
        <div className="flex justify-end">
          <Button onClick={handleConfirm} variant="primary">
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function ConfirmDialog({
  isOpen,
  onClose,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  variant = 'primary',
  className = ''
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'primary' | 'destructive';
  className?: string;
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      className={className}
      animation="scale"
    >
      <div className="space-y-4">
        <p style={{ color: theme.colors.neutral.darkest }}>{message}</p>
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose} variant="ghost">
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            variant={variant === 'destructive' ? 'secondary' : 'primary'}
            style={variant === 'destructive' ? {
              backgroundColor: theme.colors.accent.red,
              color: theme.colors.white
            } : undefined}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function DrawerDialog({
  isOpen,
  onClose,
  title,
  children,
  position = 'bottom',
  className = ''
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'bottom' | 'top' | 'left' | 'right';
  className?: string;
}) {
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'items-end justify-center';
      case 'top':
        return 'items-start justify-center';
      case 'left':
        return 'items-center justify-start';
      case 'right':
        return 'items-center justify-end';
      default:
        return 'items-end justify-center';
    }
  };

  const getDrawerClasses = () => {
    const base = 'w-full bg-white rounded-t-lg';
    switch (position) {
      case 'bottom':
        return `${base} rounded-t-lg`;
      case 'top':
        return `${base} rounded-b-lg`;
      case 'left':
        return 'h-full bg-white rounded-r-lg max-w-sm';
      case 'right':
        return 'h-full bg-white rounded-l-lg max-w-sm';
      default:
        return base;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      className={`p-0 ${className}`}
      animation="slide"
    >
      <div className={`flex ${getPositionClasses()} h-full`}>
        <div className={getDrawerClasses()}>
          {title && (
            <div
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: theme.colors.neutral.lightest }}
            >
              <h2
                className="text-lg font-semibold"
                style={{ color: theme.colors.neutral.darkest }}
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="닫기"
              >
                <X className="h-5 w-5" style={{ color: theme.colors.neutral.medium }} />
              </button>
            </div>
          )}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </Modal>
  );
}

