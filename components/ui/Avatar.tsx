'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  src?: string
  alt: string
  size?: AvatarSize
  className?: string
  fallback?: string
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
}

const AVATAR_SIZES = {
  xs: 'w-6 h-6',   // 24px
  sm: 'w-8 h-8',   // 32px
  md: 'w-12 h-12', // 48px
  lg: 'w-16 h-16', // 64px
  xl: 'w-24 h-24'  // 96px
} as const

const AVATAR_SIZE_PX = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96
} as const

const PLACEHOLDER_COLORS = {
  background: '#EFF1F5',
  text: '#6A7685'
}

function AvatarPlaceholder({ size, alt, fallback }: { size: AvatarSize; alt: string; fallback?: string }) {
  const sizeClass = AVATAR_SIZES[size]
  const fontSize = size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : size === 'lg' ? 'text-xl' : 'text-2xl'

  // Use fallback text (usually first letter of name) or default icon
  const displayText = fallback || (alt ? alt.charAt(0).toUpperCase() : '👤')

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-semibold',
        sizeClass,
        fontSize
      )}
      style={{
        backgroundColor: PLACEHOLDER_COLORS.background,
        color: PLACEHOLDER_COLORS.text
      }}
    >
      {displayText}
    </div>
  )
}

export function Avatar({
  src,
  alt,
  size = 'md',
  className,
  fallback,
  priority = false,
  onLoad,
  onError
}: AvatarProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Show placeholder if no src or has error
  if (!src || hasError) {
    return <AvatarPlaceholder size={size} alt={alt} fallback={fallback} />
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

  const sizeClass = AVATAR_SIZES[size]
  const sizePx = AVATAR_SIZE_PX[size]

  return (
    <div className={cn('relative overflow-hidden rounded-full', sizeClass, className)}>
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-full z-10"
          style={{ backgroundColor: PLACEHOLDER_COLORS.background }}
        >
          <div
            className="text-xs"
            style={{ color: PLACEHOLDER_COLORS.text }}
          >
            ...
          </div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={sizePx}
        height={sizePx}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'object-cover rounded-full transition-opacity duration-300',
          isLoading && 'opacity-0'
        )}
        style={{ borderRadius: '50%' }}
        priority={priority}
      />
    </div>
  )
}

export default Avatar