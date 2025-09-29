'use client'

import React, { useState } from 'react'
import { SearchInput, Badge, Button } from '@/components/core'
import { PriceSlider } from './PriceSlider'
import { Filter, X } from 'lucide-react'
import { theme } from '@/lib/theme'
import type { ProductCategory, ProductCondition, ItemSortOption, ItemSearchFilters } from '@/lib/types/marketplace'
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS, ITEM_SORT_OPTIONS } from '@/lib/types/marketplace'

interface FilterSectionProps {
  filters: ItemSearchFilters
  onFiltersChange: (filters: ItemSearchFilters) => void
  className?: string
  collapsible?: boolean
}

export function FilterSection({
  filters,
  onFiltersChange,
  className = '',
  collapsible = true
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceRange?.min || 0,
    filters.priceRange?.max || 500000
  ])

  // 검색 핸들러
  const handleSearch = (searchTerm: string) => {
    onFiltersChange({
      ...filters,
      searchTerm: searchTerm.trim() || undefined
    })
  }

  // 카테고리 토글
  const handleCategoryToggle = (category: ProductCategory) => {
    const currentCategories = filters.category || []
    const isSelected = currentCategories.includes(category)

    let newCategories: ProductCategory[]
    if (isSelected) {
      newCategories = currentCategories.filter(c => c !== category)
    } else {
      newCategories = [...currentCategories, category]
    }

    onFiltersChange({
      ...filters,
      category: newCategories.length > 0 ? newCategories : undefined
    })
  }

  // 상태 토글
  const handleConditionToggle = (condition: ProductCondition) => {
    const currentConditions = filters.condition || []
    const isSelected = currentConditions.includes(condition)

    let newConditions: ProductCondition[]
    if (isSelected) {
      newConditions = currentConditions.filter(c => c !== condition)
    } else {
      newConditions = [...currentConditions, condition]
    }

    onFiltersChange({
      ...filters,
      condition: newConditions.length > 0 ? newConditions : undefined
    })
  }

  // 전체 카테고리 토글
  const handleAllCategoriesToggle = () => {
    const allSelected = !filters.category || filters.category.length === 0
    onFiltersChange({
      ...filters,
      category: allSelected ? Object.keys(PRODUCT_CATEGORIES) as ProductCategory[] : undefined
    })
  }

  // 가격 범위 변경
  const handlePriceRangeChange = (newRange: [number, number]) => {
    setPriceRange(newRange)
    onFiltersChange({
      ...filters,
      priceRange: {
        min: newRange[0],
        max: newRange[1]
      }
    })
  }

  // 정렬 변경
  const handleSortChange = (sortBy: ItemSortOption) => {
    onFiltersChange({
      ...filters,
      // sortBy는 ItemSearchFilters에 없으므로 별도 처리 필요
    })
  }

  // 필터 초기화
  const handleReset = () => {
    setPriceRange([0, 500000])
    onFiltersChange({
      searchTerm: undefined,
      category: undefined,
      priceRange: undefined,
      condition: undefined
    })
  }

  // 활성 필터 개수 계산
  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.category && filters.category.length > 0) count++
    if (filters.condition && filters.condition.length > 0) count++
    if (filters.priceRange && (filters.priceRange.min! > 0 || filters.priceRange.max! < 500000)) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* 헤더 (검색 + 필터 토글) */}
      <div className="p-4 space-y-4">
        {/* 검색바 */}
        <SearchInput
          placeholder="상품명, 브랜드 검색..."
          onSearch={handleSearch}
          containerClassName="w-full"
        />

        {/* 필터 토글 버튼 (모바일용) */}
        {collapsible && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              <span>필터</span>
              {activeFiltersCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-1 text-xs"
                  style={{
                    backgroundColor: theme.colors.primary.main,
                    color: 'white'
                  }}
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                초기화
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 필터 옵션들 */}
      <div className={`border-t border-gray-200 ${collapsible ? (isExpanded ? 'block' : 'hidden') : 'block'}`}>
        <div className="p-4 space-y-6">
          {/* 카테고리 필터 */}
          <div>
            <h3 className="font-medium text-sm mb-3">카테고리</h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={(!filters.category || filters.category.length === 0) ? 'default' : 'outline'}
                className="cursor-pointer transition-colors"
                style={(!filters.category || filters.category.length === 0)
                  ? theme.components.badges.category
                  : { ...theme.components.badges.category, backgroundColor: 'transparent' }
                }
                onClick={handleAllCategoriesToggle}
              >
                전체
              </Badge>

              {Object.entries(PRODUCT_CATEGORIES).map(([key, label]) => {
                const category = key as ProductCategory
                const isSelected = filters.category?.includes(category) || false
                const categoryIcons = {
                  shoes: '👠',
                  clothing: '👗',
                  accessories: '💍',
                  other: '📱'
                }

                return (
                  <Badge
                    key={key}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer transition-colors"
                    style={isSelected
                      ? theme.components.badges.category
                      : { ...theme.components.badges.category, backgroundColor: 'transparent' }
                    }
                    onClick={() => handleCategoryToggle(category)}
                  >
                    <span className="mr-1">{categoryIcons[category]}</span>
                    {label}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* 상태 필터 */}
          <div>
            <h3 className="font-medium text-sm mb-3">상품 상태</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PRODUCT_CONDITIONS).map(([key, label]) => {
                const condition = key as ProductCondition
                const isSelected = filters.condition?.includes(condition) || false

                return (
                  <Badge
                    key={key}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer transition-colors"
                    style={isSelected
                      ? theme.components.badges.category
                      : { ...theme.components.badges.category, backgroundColor: 'transparent' }
                    }
                    onClick={() => handleConditionToggle(condition)}
                  >
                    {label}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* 가격 범위 */}
          <div>
            <h3 className="font-medium text-sm mb-3">가격 범위</h3>
            <PriceSlider
              min={0}
              max={500000}
              value={priceRange}
              onChange={handlePriceRangeChange}
              step={10000}
            />
          </div>

          {/* 정렬 옵션 */}
          <div>
            <h3 className="font-medium text-sm mb-3">정렬</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ITEM_SORT_OPTIONS).map(([key, label]) => {
                const sortOption = key as ItemSortOption
                // 정렬은 별도 상태로 관리해야 함 (filters에 포함되지 않음)
                const isSelected = false // 임시로 false

                return (
                  <Badge
                    key={key}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer transition-colors"
                    style={isSelected
                      ? theme.components.badges.category
                      : { ...theme.components.badges.category, backgroundColor: 'transparent' }
                    }
                    onClick={() => handleSortChange(sortOption)}
                  >
                    {label}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* 조건 옵션 */}
          <div>
            <h3 className="font-medium text-sm mb-3">거래 조건</h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={filters.negotiable ? 'default' : 'outline'}
                className="cursor-pointer transition-colors"
                style={filters.negotiable
                  ? theme.components.badges.category
                  : { ...theme.components.badges.category, backgroundColor: 'transparent' }
                }
                onClick={() => onFiltersChange({
                  ...filters,
                  negotiable: !filters.negotiable
                })}
              >
                가격협상 가능
              </Badge>

              <Badge
                variant={filters.deliveryAvailable ? 'default' : 'outline'}
                className="cursor-pointer transition-colors"
                style={filters.deliveryAvailable
                  ? theme.components.badges.category
                  : { ...theme.components.badges.category, backgroundColor: 'transparent' }
                }
                onClick={() => onFiltersChange({
                  ...filters,
                  deliveryAvailable: !filters.deliveryAvailable
                })}
              >
                택배 가능
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterSection