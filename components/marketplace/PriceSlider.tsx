'use client'

import React, { useState, useEffect, useRef } from 'react'
import { theme } from '@/lib/theme'

interface PriceSliderProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  step?: number
  formatLabel?: (value: number) => string
  className?: string
}

export function PriceSlider({
  min,
  max,
  value,
  onChange,
  step = 10000,
  formatLabel = (value) => new Intl.NumberFormat('ko-KR').format(value) + '원',
  className = ''
}: PriceSliderProps) {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  // 값을 퍼센트로 변환
  const getPercent = (value: number) => {
    return ((value - min) / (max - min)) * 100
  }

  // 마우스/터치 위치를 값으로 변환
  const getValue = (clientX: number) => {
    if (!sliderRef.current) return min

    const rect = sliderRef.current.getBoundingClientRect()
    const percent = (clientX - rect.left) / rect.width
    const rawValue = min + percent * (max - min)
    return Math.round(rawValue / step) * step
  }

  // 드래그 시작
  const handleStart = (e: React.MouseEvent | React.TouchEvent, type: 'min' | 'max') => {
    e.preventDefault()
    setIsDragging(type)
  }

  // 드래그 중
  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const newValue = Math.max(min, Math.min(max, getValue(clientX)))

    if (isDragging === 'min') {
      const newMin = Math.min(newValue, value[1] - step)
      onChange([newMin, value[1]])
    } else {
      const newMax = Math.max(newValue, value[0] + step)
      onChange([value[0], newMax])
    }
  }

  // 드래그 종료
  const handleEnd = () => {
    setIsDragging(null)
  }

  // 전역 이벤트 리스너
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => handleMove(e)
    const handleTouchMove = (e: TouchEvent) => handleMove(e)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchend', handleEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging, value, handleMove])

  // 트랙 클릭 핸들러
  const handleTrackClick = (e: React.MouseEvent) => {
    if (isDragging) return

    const newValue = getValue(e.clientX)
    const [currentMin, currentMax] = value

    // 가까운 thumb으로 이동
    const distToMin = Math.abs(newValue - currentMin)
    const distToMax = Math.abs(newValue - currentMax)

    if (distToMin < distToMax) {
      const newMin = Math.min(newValue, currentMax - step)
      onChange([Math.max(min, newMin), currentMax])
    } else {
      const newMax = Math.max(newValue, currentMin + step)
      onChange([currentMin, Math.min(max, newMax)])
    }
  }

  const minPercent = getPercent(value[0])
  const maxPercent = getPercent(value[1])

  return (
    <div className={`w-full ${className}`}>
      {/* 값 표시 */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium" style={{ color: theme.colors.primary.main }}>
          {formatLabel(value[0])}
        </span>
        <span className="text-sm text-gray-500">~</span>
        <span className="text-sm font-medium" style={{ color: theme.colors.primary.main }}>
          {formatLabel(value[1])}
        </span>
      </div>

      {/* 슬라이더 */}
      <div
        ref={sliderRef}
        className="relative h-6 cursor-pointer"
        onClick={handleTrackClick}
      >
        {/* 배경 트랙 */}
        <div
          className="absolute top-1/2 w-full h-2 rounded-full transform -translate-y-1/2"
          style={{ backgroundColor: theme.colors.secondary.light }}
        />

        {/* 활성 트랙 */}
        <div
          className="absolute top-1/2 h-2 rounded-full transform -translate-y-1/2 transition-all duration-150"
          style={{
            backgroundColor: theme.colors.primary.main,
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`
          }}
        />

        {/* 최소값 Thumb */}
        <div
          className="absolute top-1/2 w-5 h-5 rounded-full transform -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing shadow-md border-2 border-white transition-all duration-150 hover:scale-110"
          style={{
            backgroundColor: theme.colors.primary.main,
            left: `${minPercent}%`,
            boxShadow: isDragging === 'min' ? '0 0 0 3px rgba(105, 59, 242, 0.2)' : undefined
          }}
          onMouseDown={(e) => handleStart(e, 'min')}
          onTouchStart={(e) => handleStart(e, 'min')}
        />

        {/* 최대값 Thumb */}
        <div
          className="absolute top-1/2 w-5 h-5 rounded-full transform -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing shadow-md border-2 border-white transition-all duration-150 hover:scale-110"
          style={{
            backgroundColor: theme.colors.primary.main,
            left: `${maxPercent}%`,
            boxShadow: isDragging === 'max' ? '0 0 0 3px rgba(105, 59, 242, 0.2)' : undefined
          }}
          onMouseDown={(e) => handleStart(e, 'max')}
          onTouchStart={(e) => handleStart(e, 'max')}
        />
      </div>

      {/* 최소/최대 레이블 */}
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-400">{formatLabel(min)}</span>
        <span className="text-xs text-gray-400">{formatLabel(max)}</span>
      </div>
    </div>
  )
}

export default PriceSlider