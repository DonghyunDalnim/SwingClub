/**
 * Avatar Component - Soomgo Standards
 * 1:1 비율, 원형 디스플레이, 8px borderRadius
 */

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface AvatarProps {
  src?: string | null
  alt: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
  className?: string
  onClick?: () => void
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64
}

export function Avatar({
  src,
  alt,
  size = 'md',
  fallback,
  className,
  onClick
}: AvatarProps) {
  const dimension = sizeMap[size]
  const [imageError, setImageError] = React.useState(false)

  // 이미지가 없거나 에러가 발생한 경우 fallback 표시
  const showFallback = !src || imageError

  // Fallback 텍스트 생성 (이름의 첫 글자)
  const getFallbackText = () => {
    if (fallback) return fallback
    if (!alt) return '?'
    // 한글이면 첫 글자, 영문이면 첫 글자의 대문자
    const firstChar = alt.trim()[0]
    return firstChar.toUpperCase()
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-full bg-[#EFF1F5] flex items-center justify-center',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#693BF2] focus-visible:ring-offset-2',
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      style={{
        width: dimension,
        height: dimension,
        minWidth: dimension,
        minHeight: dimension
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      } : undefined}
    >
      {showFallback ? (
        // Fallback UI - Soomgo 표준 색상
        <span
          className="text-[#6A7685] font-medium select-none"
          style={{
            fontSize: dimension / 2.5
          }}
          aria-label={alt}
        >
          {getFallbackText()}
        </span>
      ) : (
        // 이미지 표시
        <Image
          src={src}
          alt={alt}
          width={dimension}
          height={dimension}
          className="object-cover"
          onError={() => setImageError(true)}
          priority={size === 'lg' || size === 'xl'} // 큰 아바타는 우선 로딩
        />
      )}
    </div>
  )
}

/**
 * Avatar Group - 여러 아바타를 겹쳐서 표시
 */
export interface AvatarGroupProps {
  avatars: Array<{
    src?: string | null
    alt: string
    fallback?: string
  }>
  size?: AvatarProps['size']
  max?: number
  className?: string
}

export function AvatarGroup({
  avatars,
  size = 'md',
  max = 3,
  className
}: AvatarGroupProps) {
  const dimension = sizeMap[size]
  const displayAvatars = avatars.slice(0, max)
  const remainingCount = avatars.length - max

  return (
    <div className={cn('flex items-center', className)}>
      {displayAvatars.map((avatar, index) => (
        <div
          key={index}
          className="relative"
          style={{
            marginLeft: index > 0 ? -dimension / 3 : 0,
            zIndex: displayAvatars.length - index
          }}
        >
          <Avatar
            {...avatar}
            size={size}
            className="border-2 border-white"
          />
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className={cn(
            'relative flex items-center justify-center',
            'rounded-full bg-[#EFF1F5] border-2 border-white',
            'text-[#6A7685] font-medium'
          )}
          style={{
            width: dimension,
            height: dimension,
            marginLeft: -dimension / 3,
            fontSize: dimension / 2.5,
            zIndex: 0
          }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

export default Avatar