'use client'

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

export interface OptimizedImageProps extends Omit<ImageProps, 'alt'> {
  /**
   * 이미지에 대한 대체 텍스트 (필수)
   */
  alt: string;
  /**
   * 이미지가 로딩 중일 때 표시할 텍스트
   */
  loadingText?: string;
  /**
   * 이미지 로딩 실패 시 표시할 텍스트
   */
  errorText?: string;
  /**
   * 이미지가 장식용인지 여부 (alt="" 허용)
   */
  decorative?: boolean;
  /**
   * 추가 래퍼 클래스
   */
  wrapperClassName?: string;
}

/**
 * 접근성이 향상된 최적화 이미지 컴포넌트
 * Next.js Image를 래핑하여 접근성 속성과 에러 처리를 추가
 */
export const OptimizedImage = React.forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({
    alt,
    loadingText = '이미지 로딩 중...',
    errorText = '이미지를 불러올 수 없습니다',
    decorative = false,
    wrapperClassName,
    className,
    onError,
    onLoad,
    ...props
  }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoading(false);
      setHasError(false);
      onLoad?.(e);
    };

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoading(false);
      setHasError(true);
      onError?.(e);
    };

    // 장식용 이미지인 경우 빈 alt 텍스트 사용
    const imageAlt = decorative ? '' : alt;

    if (hasError) {
      return (
        <div
          className={cn(
            'flex items-center justify-center bg-gray-100 text-gray-500 text-sm',
            wrapperClassName
          )}
          role="img"
          aria-label={decorative ? undefined : errorText}
        >
          <span>{errorText}</span>
        </div>
      );
    }

    return (
      <div className={cn('relative', wrapperClassName)}>
        {isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400 text-sm z-10"
            aria-live="polite"
            aria-label={loadingText}
          >
            <span>{loadingText}</span>
          </div>
        )}
        <Image
          ref={ref}
          alt={imageAlt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-200',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;