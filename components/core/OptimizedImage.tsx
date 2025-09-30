'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  // Accessibility enhancements
  role?: string
  'aria-describedby'?: string
  'aria-label'?: string
  decorative?: boolean // 장식용 이미지인 경우 true
  // Soomgo 표준 비율
  aspectRatio?: 'hero' | 'card' | 'banner' | 'square' | 'custom'
  borderRadius?: number // px 단위, 기본 8px
}

// Soomgo 표준 비율 맵
const aspectRatioMap = {
  hero: '16/9',    // 히어로 이미지
  card: '4/3',     // 카드 이미지
  banner: '3/1',   // 배너 이미지
  square: '1/1',   // 정사각형
  custom: undefined // 커스텀 비율
}

export const OptimizedImage = React.forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({
    src,
    alt,
    width,
    height,
    className,
    style,
    priority = false,
    fill = false,
    sizes,
    quality = 75,
    placeholder = 'empty',
    blurDataURL,
    onLoad,
    onError,
    role,
    'aria-describedby': ariaDescribedby,
    'aria-label': ariaLabel,
    decorative = false,
    aspectRatio = 'custom',
    borderRadius = 8,
    ...props
  }, ref) => {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    // 비율에 따른 스타일 계산
    const containerStyle: React.CSSProperties = {
      borderRadius: `${borderRadius}px`,
      overflow: 'hidden',
      ...style
    }

    if (aspectRatio !== 'custom' && aspectRatioMap[aspectRatio]) {
      containerStyle.aspectRatio = aspectRatioMap[aspectRatio]
    }

    const handleLoad = () => {
      setIsLoading(false)
      onLoad?.()
    }

    const handleError = () => {
      setIsLoading(false)
      setHasError(true)
      onError?.()
    }

    // 장식용 이미지는 스크린 리더에서 무시
    const accessibilityProps = decorative
      ? {
          alt: '',
          role: 'presentation',
          'aria-hidden': 'true' as const
        }
      : {
          alt: ariaLabel || alt,
          role: role || undefined,
          'aria-describedby': ariaDescribedby,
          'aria-label': ariaLabel
        }

    // 에러 발생 시 접근 가능한 대체 콘텐츠 - Soomgo 표준 색상
    if (hasError) {
      return (
        <div
          className={cn(
            'flex items-center justify-center bg-[#EFF1F5] text-[#6A7685] border-0',
            fill ? 'absolute inset-0' : '',
            className
          )}
          style={!fill ? { ...containerStyle, width, height } : containerStyle}
          role="img"
          aria-label={`이미지 로드 실패: ${alt}`}
        >
          <div className="text-center p-4">
            <svg
              className="mx-auto h-12 w-12 text-[#6A7685]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm">이미지를 불러올 수 없습니다</p>
            <p className="text-xs mt-1">{alt}</p>
          </div>
        </div>
      )
    }

    return (
      <div className={cn('relative', className)} style={containerStyle}>
        {isLoading && (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-[#EFF1F5] animate-pulse'
            )}
            aria-label="이미지 로딩 중"
          >
            <div className="h-6 w-6 rounded-full border-2 border-[#6A7685]/30 border-t-[#693BF2] animate-spin" />
          </div>
        )}

        <Image
          ref={ref}
          src={src}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          className={cn(
            'transition-opacity duration-300 object-cover',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          priority={priority}
          sizes={sizes}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          {...accessibilityProps}
          {...props}
        />
      </div>
    )
  }
)

OptimizedImage.displayName = 'OptimizedImage'

// 사용 예시를 위한 타입 정의
export interface ImageAltTextOptions {
  context?: 'profile' | 'product' | 'article' | 'banner' | 'icon'
  includeContext?: boolean
}

// alt 텍스트 생성 헬퍼 함수
export const generateAltText = (
  filename: string,
  options: ImageAltTextOptions = {}
): string => {
  const { context, includeContext = true } = options

  // 기본 파일명 정리
  const cleanFilename = filename
    .replace(/\.[^/.]+$/, '') // 확장자 제거
    .replace(/[-_]/g, ' ') // 하이픈과 언더스코어를 공백으로
    .replace(/\d+/g, '') // 숫자 제거
    .trim()

  if (!includeContext || !context) {
    return cleanFilename || '이미지'
  }

  const contextMap = {
    profile: '프로필 사진',
    product: '상품 이미지',
    article: '게시글 이미지',
    banner: '배너 이미지',
    icon: '아이콘'
  }

  return `${contextMap[context]}: ${cleanFilename}` || contextMap[context]
}

export default OptimizedImage