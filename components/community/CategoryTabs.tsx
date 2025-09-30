'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { POST_CATEGORIES, type PostCategory } from '@/lib/types/community'
import { theme } from '@/lib/theme'

interface CategoryTabsProps {
  activeCategory: PostCategory | 'all'
  onCategoryChange: (category: PostCategory | 'all') => void
  className?: string
}

export function CategoryTabs({ activeCategory, onCategoryChange, className }: CategoryTabsProps) {
  const categories = [
    { key: 'all' as const, label: '전체', icon: '📋' },
    { key: 'general' as PostCategory, label: POST_CATEGORIES.general, icon: '💬' },
    { key: 'qna' as PostCategory, label: POST_CATEGORIES.qna, icon: '❓' },
    { key: 'event' as PostCategory, label: POST_CATEGORIES.event, icon: '🎭' },
    { key: 'marketplace' as PostCategory, label: POST_CATEGORIES.marketplace, icon: '🛍️' },
    { key: 'lesson' as PostCategory, label: POST_CATEGORIES.lesson, icon: '📚' },
    { key: 'review' as PostCategory, label: POST_CATEGORIES.review, icon: '⭐' },
  ]

  return (
    <div
      className={cn('w-full', className)}
      role="tablist"
      aria-label="커뮤니티 카테고리"
    >
      {/* 스크롤 가능한 탭 컨테이너 */}
      <div className="flex overflow-x-auto scrollbar-hide space-x-2 pb-1">
        {categories.map((category) => {
          const isActive = activeCategory === category.key

          return (
            <button
              key={category.key}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${category.key}`}
              className={cn(
                'flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main',
                'hover:scale-105 hover:shadow-sm',
                isActive
                  ? 'text-white shadow-md transform scale-105'
                  : 'text-[#693BF2] hover:bg-[#F1EEFF]/70'
              )}
              style={isActive ? {
                backgroundColor: theme.colors.primary.main,
                boxShadow: '0 4px 12px rgba(105, 59, 242, 0.3)'
              } : {
                backgroundColor: '#F1EEFF'
              }}
              onClick={() => onCategoryChange(category.key)}
            >
              <span className="text-base" aria-hidden="true">
                {category.icon}
              </span>
              <span>{category.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CategoryTabs