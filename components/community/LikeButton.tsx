'use client'

import { useState, useEffect, useRef } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  animateCount,
  createHeartParticles,
  updateParticles,
  renderParticles,
  createAnimationLoop,
  shouldReduceMotion,
  type Particle
} from '@/lib/utils/animations'

export interface LikeButtonProps {
  initialLiked?: boolean
  initialCount?: number
  onLike?: (liked: boolean) => Promise<void> | void
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  className?: string
  disabled?: boolean
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
}

export function LikeButton({
  initialLiked = false,
  initialCount = 0,
  onLike,
  size = 'md',
  showCount = true,
  className,
  disabled = false
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [displayCount, setDisplayCount] = useState(initialCount)
  const [isAnimating, setIsAnimating] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const animationCleanupRef = useRef<(() => void) | null>(null)

  // 좋아요 클릭 핸들러
  const handleClick = async () => {
    if (disabled || isAnimating) return

    const newLiked = !liked
    const newCount = newLiked ? count + 1 : count - 1

    setLiked(newLiked)
    setCount(newCount)
    setIsAnimating(true)

    // 좋아요 추가 시 파티클 효과
    if (newLiked && !shouldReduceMotion()) {
      const button = buttonRef.current
      if (button) {
        const rect = button.getBoundingClientRect()
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        setParticles(createHeartParticles(centerX, centerY, 12))
      }
    }

    // 숫자 카운트 애니메이션
    if (showCount) {
      const cleanup = animateCount(
        displayCount,
        newCount,
        300,
        setDisplayCount,
        () => setIsAnimating(false)
      )
      animationCleanupRef.current = cleanup
    } else {
      setTimeout(() => setIsAnimating(false), 300)
    }

    // 서버 액션 호출
    try {
      await onLike?.(newLiked)
    } catch (error) {
      // Rollback on error
      setLiked(!newLiked)
      setCount(count)
      setDisplayCount(count)
      console.error('Failed to update like:', error)
    }
  }

  // 파티클 애니메이션 루프
  useEffect(() => {
    if (particles.length === 0 || shouldReduceMotion()) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cleanup = createAnimationLoop(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const updatedParticles = updateParticles(particles)
      setParticles(updatedParticles)

      renderParticles(ctx, updatedParticles)

      // 파티클이 모두 사라지면 애니메이션 종료
      return updatedParticles.length > 0
    })

    return cleanup
  }, [particles])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationCleanupRef.current) {
        animationCleanupRef.current()
      }
    }
  }, [])

  return (
    <div className={cn('relative inline-flex items-center gap-1', className)}>
      {/* 파티클 캔버스 */}
      <canvas
        ref={canvasRef}
        width={100}
        height={100}
        className="absolute pointer-events-none"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100px',
          height: '100px'
        }}
        aria-hidden="true"
      />

      {/* 좋아요 버튼 */}
      <button
        ref={buttonRef}
        onClick={handleClick}
        disabled={disabled || isAnimating}
        className={cn(
          'relative inline-flex items-center justify-center',
          'rounded-full p-1.5',
          'transition-all duration-200 ease-out',
          'hover:scale-110 active:scale-95',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#693BF2] focus-visible:ring-offset-2',
          'motion-reduce:transition-none motion-reduce:hover:transform-none',
          liked ? 'bg-pink-50' : 'bg-transparent hover:bg-gray-50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-label={liked ? '좋아요 취소' : '좋아요'}
        aria-pressed={liked}
      >
        <Heart
          className={cn(
            sizeMap[size],
            'transition-all duration-200',
            liked ? 'fill-red-500 text-red-500 scale-110' : 'text-[#6A7685]',
            isAnimating && liked && 'animate-bounce'
          )}
          aria-hidden="true"
        />
      </button>

      {/* 좋아요 수 */}
      {showCount && (
        <span
          className={cn(
            'text-sm font-medium tabular-nums',
            'transition-colors duration-200',
            liked ? 'text-red-500' : 'text-[#6A7685]'
          )}
          aria-label={`좋아요 ${displayCount}개`}
        >
          {displayCount.toLocaleString()}
        </span>
      )}
    </div>
  )
}

export default LikeButton