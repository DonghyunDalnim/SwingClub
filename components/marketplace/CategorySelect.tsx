'use client'

import { Badge } from '@/components/core/Badge'
import { PRODUCT_CATEGORIES, type ProductCategory } from '@/lib/types/marketplace'

interface CategorySelectProps {
  value: ProductCategory
  onChange: (category: ProductCategory) => void
  className?: string
}

export function CategorySelect({ value, onChange, className = '' }: CategorySelectProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {Object.entries(PRODUCT_CATEGORIES).map(([key, label]) => (
        <Badge
          key={key}
          variant={value === key ? 'default' : 'outline'}
          className="cursor-pointer transition-colors hover:bg-purple-100"
          onClick={() => onChange(key as ProductCategory)}
        >
          {label}
        </Badge>
      ))}
    </div>
  )
}