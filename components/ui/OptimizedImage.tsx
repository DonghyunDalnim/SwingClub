'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export type ImageRatio = 'hero' | 'card' | 'avatar' | 'banner'

interface OptimizedImageProps {
  src?: string
  alt: string
  ratio?: ImageRatio
  className?: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  placeholder?: 'blur' | 'empty' | `data:image/${string}`
  onLoad?: () => void
  onError?: () => void
}

const ASPECT_RATIOS = {
  hero: 'aspect-video',      // 16:9
  card: 'aspect-[4/3]',      // 4:3
  avatar: 'aspect-square',   // 1:1
  banner: 'aspect-[3/1]'     // 3:1
} as const

const PLACEHOLDER_COLORS = {
  background: '#EFF1F5',
  text: '#6A7685'
}

function ImagePlaceholder({ ratio, alt }: { ratio: ImageRatio; alt: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg text-center',
        ASPECT_RATIOS[ratio]
      )}
      style={{ backgroundColor: PLACEHOLDER_COLORS.background }}
    >
      <div className="p-4">
        <div className="text-4xl mb-2">📷</div>
        <p
          className="text-sm font-medium"
          style={{ color: PLACEHOLDER_COLORS.text }}
        >
          {alt}
        </p>
      </div>
    </div>
  )
}

export function OptimizedImage({
  src,
  alt,
  ratio = 'card',
  className,
  width,
  height,
  fill = false,
  priority = false,
  placeholder,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Show placeholder if no src or has error
  if (!src || hasError) {
    return <ImagePlaceholder ratio={ratio} alt={alt} />
  }

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    onError?.()
  }

  const aspectRatioClass = ASPECT_RATIOS[ratio]

  const imageProps = {
    src,
    alt,
    onLoad: handleLoad,
    onError: handleError,
    className: cn(
      'object-cover rounded-lg transition-opacity duration-300',
      isLoading && 'opacity-0',
      className
    ),
    style: { borderRadius: '8px' },
    priority,
    ...(fill
      ? { fill: true }
      : {
          width: width || 800,
          height: height || (ratio === 'hero' ? 450 : ratio === 'banner' ? 267 : 600)
        }
    ),
    ...(placeholder === 'blur' && { placeholder: 'blur' as const }),
    ...(placeholder === 'empty' && { placeholder: 'empty' as const }),
    ...(typeof placeholder === 'string' && placeholder.startsWith('data:image/') && {
      placeholder: 'blur' as const,
      blurDataURL: placeholder
    })
  }

  if (fill) {
    return (
      <div className={cn('relative overflow-hidden rounded-lg', aspectRatioClass)}>
        {isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: PLACEHOLDER_COLORS.background }}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">📷</div>
              <p
                className="text-xs"
                style={{ color: PLACEHOLDER_COLORS.text }}
              >
                로딩중...
              </p>
            </div>
          </div>
        )}
        <Image {...imageProps} />
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', aspectRatioClass)}>
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-lg"
          style={{ backgroundColor: PLACEHOLDER_COLORS.background }}
        >
          <div className="text-center">
            <div className="text-2xl mb-1">📷</div>
            <p
              className="text-xs"
              style={{ color: PLACEHOLDER_COLORS.text }}
            >
              로딩중...
            </p>
          </div>
        </div>
      )}
      <Image {...imageProps} />
    </div>
  )
}

export default OptimizedImage