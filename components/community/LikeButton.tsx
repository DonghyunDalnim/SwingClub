'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HeartParticles, animateCount, createColorTransition, reduceMotion } from '@/lib/utils/animations'

interface LikeButtonProps {
  postId: string
  isLiked: boolean
  likeCount: number
  onToggleLike: (postId: string, isLiked: boolean) => Promise<{ success: boolean; newCount: number }>
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}

export function LikeButton({
  postId,
  isLiked: initialIsLiked,
  likeCount: initialLikeCount,
  onToggleLike,
  size = 'sm',
  className,
  disabled = false
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isOptimistic, setIsOptimistic] = useState(false)

  const buttonRef = useRef<HTMLButtonElement>(null)
  const heartRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<HeartParticles | null>(null)

  const sizeClasses = {
    sm: 'h-6 text-xs',
    md: 'h-8 text-sm',
    lg: 'h-10 text-base'
  }

  const heartSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  useEffect(() => {
    if (canvasRef.current && !particlesRef.current) {
      try {
        particlesRef.current = new HeartParticles(canvasRef.current)
      } catch (error) {
        console.warn('Failed to initialize HeartParticles:', error)
      }
    }

    return () => {
      if (particlesRef.current) {
        particlesRef.current.destroy()
        particlesRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * devicePixelRatio
      canvas.height = rect.height * devicePixelRatio
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(devicePixelRatio, devicePixelRatio)
      }
    }
  }, [])

  const handleClick = useCallback(async (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (disabled || isAnimating) return

    setIsAnimating(true)
    setIsOptimistic(true)

    const newIsLiked = !isLiked
    const optimisticCount = newIsLiked ? likeCount + 1 : likeCount - 1

    setIsLiked(newIsLiked)
    setLikeCount(optimisticCount)

    if (heartRef.current && !reduceMotion()) {
      if (newIsLiked) {
        createColorTransition(heartRef.current, '#6A7685', '#693BF2', 200)

        if (canvasRef.current && particlesRef.current && buttonRef.current) {
          const buttonRect = buttonRef.current.getBoundingClientRect()
          const canvasRect = canvasRef.current.getBoundingClientRect()
          const heartRect = heartRef.current.getBoundingClientRect()

          const originX = heartRect.left + heartRect.width / 2 - canvasRect.left
          const originY = heartRect.top + heartRect.height / 2 - canvasRect.top

          particlesRef.current.createParticle(originX, originY)
        }
      } else {
        createColorTransition(heartRef.current, '#693BF2', '#6A7685', 200)
      }
    }

    if (countRef.current && !reduceMotion()) {
      animateCount(countRef.current, likeCount, optimisticCount, 300)
    }

    try {
      const result = await onToggleLike(postId, newIsLiked)

      if (result.success) {
        setLikeCount(result.newCount)
        if (countRef.current && result.newCount !== optimisticCount) {
          animateCount(countRef.current, optimisticCount, result.newCount, 200)
        }
      } else {
        setIsLiked(isLiked)
        setLikeCount(likeCount)

        if (heartRef.current && !reduceMotion()) {
          createColorTransition(
            heartRef.current,
            newIsLiked ? '#693BF2' : '#6A7685',
            isLiked ? '#693BF2' : '#6A7685',
            200
          )
        }

        if (countRef.current && !reduceMotion()) {
          animateCount(countRef.current, optimisticCount, likeCount, 200)
        }
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)

      setIsLiked(isLiked)
      setLikeCount(likeCount)

      if (heartRef.current && !reduceMotion()) {
        createColorTransition(
          heartRef.current,
          newIsLiked ? '#693BF2' : '#6A7685',
          isLiked ? '#693BF2' : '#6A7685',
          200
        )
      }

      if (countRef.current && !reduceMotion()) {
        animateCount(countRef.current, optimisticCount, likeCount, 200)
      }
    } finally {
      setIsOptimistic(false)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }, [disabled, isAnimating, isLiked, likeCount, onToggleLike, postId])

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={handleClick}
        disabled={disabled || isAnimating}
        className={cn(
          'inline-flex items-center space-x-1 rounded-full px-2 py-1',
          'transition-all duration-200 ease',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#693BF2] focus:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          !reduceMotion() && 'hover:scale-105 active:scale-95',
          sizeClasses[size],
          className
        )}
        aria-label={isLiked ? 'Remove like' : 'Add like'}
        aria-pressed={isLiked}
      >
        <div
          ref={heartRef}
          className={cn(
            'flex items-center justify-center transition-colors duration-200',
            heartSizes[size]
          )}
        >
          <Heart
            className={cn(
              'transition-all duration-200',
              isLiked ? 'fill-[#693BF2] text-[#693BF2]' : 'text-[#6A7685]',
              !reduceMotion() && isAnimating && 'animate-pulse'
            )}
          />
        </div>

        <span
          ref={countRef}
          className={cn(
            'font-medium transition-colors duration-200',
            isLiked ? 'text-[#693BF2]' : 'text-[#6A7685]',
            isOptimistic && 'opacity-75'
          )}
        >
          {likeCount}
        </span>
      </button>

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute left-0 top-0 h-full w-full"
        style={{ width: '100%', height: '100%' }}
        aria-hidden="true"
      />
    </div>
  )
}