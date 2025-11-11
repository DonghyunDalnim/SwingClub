'use client'

import React from 'react'
import { DanceStyle } from '@/lib/types/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/Card'
import { EmptyState } from '@/components/core/EmptyState'
import { Button } from '@/components/core/Button'
import { cn } from '@/lib/utils'

export interface DanceStyleDisplayProps {
  danceStyles: DanceStyle[]
  isOwnProfile?: boolean
  onEdit?: () => void
  className?: string
}

/**
 * Get background color based on level (1-5)
 * Lower levels have lighter colors, higher levels have darker colors
 */
const getLevelColor = (level: number): { background: string; border: string } => {
  const opacity = Math.min(Math.max(level, 1), 5) * 0.05 // 0.05 to 0.25
  return {
    background: `rgba(105, 59, 242, ${opacity})`,
    border: `rgba(105, 59, 242, ${opacity + 0.1})`
  }
}

/**
 * Individual dance style card component
 */
const DanceStyleCard = React.memo<{ name: string; level: number }>(({ name, level }) => {
  const colors = getLevelColor(level)
  const stars = Array.from({ length: 5 }, (_, i) => i + 1)

  return (
    <Card
      className="text-center transition-all duration-200"
      style={{
        background: colors.background,
        borderColor: colors.border,
        borderWidth: '2px'
      }}
      hoverable={false}
    >
      <CardContent className="py-4">
        {/* Dance name */}
        <h4 className="text-base font-semibold text-[#293341] mb-3">
          {name}
        </h4>

        {/* Star rating */}
        <div
          className="flex justify-center gap-1 mb-2"
          aria-hidden="true"
        >
          {stars.map(star => (
            <span
              key={star}
              className={cn(
                'text-lg transition-all',
                star <= level ? 'opacity-100' : 'opacity-30 grayscale'
              )}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* Level text for accessibility */}
        <p className="text-sm text-[#6A7685] font-medium">
          Level {level}/5
        </p>
      </CardContent>
    </Card>
  )
})

DanceStyleCard.displayName = 'DanceStyleCard'

/**
 * Dance Style Display Component
 *
 * Displays user's dance styles with visual level indicators.
 * Features:
 * - Level-based color gradients (1-5)
 * - Star rating visualization
 * - Responsive grid layout (mobile: 1 col, desktop: 2-3 cols)
 * - Empty state handling
 * - Accessibility support
 */
export const DanceStyleDisplay = React.memo<DanceStyleDisplayProps>(({
  danceStyles,
  isOwnProfile = false,
  onEdit,
  className
}) => {
  // Empty state
  if (!danceStyles || danceStyles.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          icon="heart"
          title={
            isOwnProfile
              ? '아직 댄스 스타일을 설정하지 않았습니다'
              : '댄스 스타일이 없습니다'
          }
          description={
            isOwnProfile
              ? '프로필을 편집하여 선호하는 댄스 스타일을 추가해보세요.'
              : '이 사용자는 아직 댄스 스타일을 설정하지 않았습니다.'
          }
          action={
            isOwnProfile && onEdit
              ? {
                  label: '프로필 편집',
                  onClick: onEdit
                }
              : undefined
          }
        />
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header with optional edit button */}
      {isOwnProfile && onEdit && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#293341]">
            댄스 스타일
          </h3>
          <Button
            variant="ghost"
            onClick={onEdit}
            aria-label="댄스 스타일 편집"
          >
            편집
          </Button>
        </div>
      )}

      {/* Responsive grid */}
      <div
        className={cn(
          'grid gap-4',
          'grid-cols-1',
          'md:grid-cols-2',
          'lg:grid-cols-3'
        )}
        role="list"
        aria-label="댄스 스타일 목록"
      >
        {danceStyles.map((style, index) => (
          <div
            key={`${style.name}-${index}`}
            role="listitem"
            aria-label={`${style.name}, 레벨 ${style.level}/5`}
          >
            <DanceStyleCard
              name={style.name}
              level={style.level}
            />
          </div>
        ))}
      </div>
    </div>
  )
})

DanceStyleDisplay.displayName = 'DanceStyleDisplay'

export default DanceStyleDisplay
