'use client'

import { POST_CATEGORIES } from '@/lib/types/community'
import type { PostCategory } from '@/lib/types/community'
import { theme } from '@/lib/theme'

interface CategoryTabsProps {
  selectedCategory?: PostCategory
  onCategoryChange: (category?: PostCategory) => void
  className?: string
}

export function CategoryTabs({ selectedCategory, onCategoryChange, className = '' }: CategoryTabsProps) {
  const categories = [
    { key: undefined, label: '전체' },
    ...Object.entries(POST_CATEGORIES).map(([key, label]) => ({
      key: key as PostCategory,
      label
    }))
  ]

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {categories.map(({ key, label }) => {
        const isSelected = selectedCategory === key

        return (
          <button
            key={key || 'all'}
            onClick={() => onCategoryChange(key)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 whitespace-nowrap"
            style={{
              backgroundColor: isSelected
                ? theme.colors.primary.main
                : theme.colors.secondary.light,
              color: isSelected
                ? theme.colors.white
                : theme.colors.primary.main,
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = theme.colors.secondary.medium
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = theme.colors.secondary.light
              }
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}