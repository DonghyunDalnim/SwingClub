'use client'

import { useState, useEffect } from 'react'
import { Badge, Button, SearchInput } from '@/components/core'
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
  TRADE_METHODS,
  ITEM_SORT_OPTIONS
} from '@/lib/types/marketplace'
import type {
  ItemSearchFilters,
  ProductCategory,
  ProductCondition,
  TradeMethod,
  ItemSortOption
} from '@/lib/types/marketplace'

interface FilterPanelProps {
  filters: ItemSearchFilters
  onFiltersChange: (filters: ItemSearchFilters) => void
  sortBy: ItemSortOption
  onSortChange: (sort: ItemSortOption) => void
  resultCount?: number
}

export function FilterPanel({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  resultCount
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '')
  const [priceRange, setPriceRange] = useState({
    min: filters.priceRange?.min?.toString() || '',
    max: filters.priceRange?.max?.toString() || ''
  })

  // 디바운싱을 위한 검색어 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({
        ...filters,
        searchTerm: searchTerm.trim() || undefined
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // 카테고리 필터 토글
  const toggleCategory = (category: ProductCategory) => {
    const currentCategories = filters.category || []
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category]

    onFiltersChange({
      ...filters,
      category: newCategories.length > 0 ? newCategories : undefined
    })
  }

  // 상태 필터 토글
  const toggleCondition = (condition: ProductCondition) => {
    const currentConditions = filters.condition || []
    const newConditions = currentConditions.includes(condition)
      ? currentConditions.filter(c => c !== condition)
      : [...currentConditions, condition]

    onFiltersChange({
      ...filters,
      condition: newConditions.length > 0 ? newConditions : undefined
    })
  }

  // 거래 방식 필터 토글
  const toggleTradeMethod = (method: TradeMethod) => {
    const currentMethods = filters.tradeMethod || []
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method]

    onFiltersChange({
      ...filters,
      tradeMethod: newMethods.length > 0 ? newMethods : undefined
    })
  }

  // 가격 범위 적용
  const applyPriceRange = () => {
    const min = priceRange.min ? parseInt(priceRange.min.replace(/,/g, '')) : undefined
    const max = priceRange.max ? parseInt(priceRange.max.replace(/,/g, '')) : undefined

    onFiltersChange({
      ...filters,
      priceRange: (min || max) ? { min, max } : undefined
    })
  }

  // 가격 포맷팅 (콤마 추가)
  const formatPrice = (value: string) => {
    const num = value.replace(/,/g, '')
    if (isNaN(Number(num))) return value
    return Number(num).toLocaleString()
  }

  // 모든 필터 초기화
  const clearAllFilters = () => {
    setSearchTerm('')
    setPriceRange({ min: '', max: '' })
    onFiltersChange({})
    onSortChange('latest')
  }

  // 활성 필터 개수 계산
  const getActiveFilterCount = () => {
    let count = 0
    if (filters.category?.length) count++
    if (filters.condition?.length) count++
    if (filters.tradeMethod?.length) count++
    if (filters.priceRange) count++
    if (filters.searchTerm) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
      <div className="px-4 py-3 space-y-3">
        {/* 검색바와 기본 컨트롤 */}
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <SearchInput
              placeholder="상품명, 브랜드, 설명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1"
          >
            <Filter className="h-4 w-4" />
            <span>필터</span>
            {activeFilterCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs min-w-[16px] h-4 p-0 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {/* 정렬 옵션 */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as ItemSortOption)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {Object.entries(ITEM_SORT_OPTIONS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* 카테고리 필터 (항상 표시) */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {Object.entries(PRODUCT_CATEGORIES).map(([key, label]) => {
            const category = key as ProductCategory
            const isSelected = filters.category?.includes(category) || false

            return (
              <Badge
                key={key}
                variant={isSelected ? 'default' : 'outline'}
                className="whitespace-nowrap cursor-pointer hover:bg-purple-100"
                onClick={() => toggleCategory(category)}
              >
                {label}
              </Badge>
            )
          })}
        </div>

        {/* 확장된 필터 옵션 */}
        {isExpanded && (
          <div className="space-y-4 pt-2 border-t border-gray-100">
            {/* 가격 범위 */}
            <div>
              <h4 className="text-sm font-medium mb-2">가격 범위</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="최소 가격"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({
                    ...prev,
                    min: formatPrice(e.target.value)
                  }))}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-500">~</span>
                <input
                  type="text"
                  placeholder="최대 가격"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({
                    ...prev,
                    max: formatPrice(e.target.value)
                  }))}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button size="sm" onClick={applyPriceRange}>
                  적용
                </Button>
              </div>
            </div>

            {/* 상품 상태 */}
            <div>
              <h4 className="text-sm font-medium mb-2">상품 상태</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PRODUCT_CONDITIONS).map(([key, label]) => {
                  const condition = key as ProductCondition
                  const isSelected = filters.condition?.includes(condition) || false

                  return (
                    <Badge
                      key={key}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-purple-100"
                      onClick={() => toggleCondition(condition)}
                    >
                      {label}
                    </Badge>
                  )
                })}
              </div>
            </div>

            {/* 거래 방식 */}
            <div>
              <h4 className="text-sm font-medium mb-2">거래 방식</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(TRADE_METHODS).map(([key, label]) => {
                  const method = key as TradeMethod
                  const isSelected = filters.tradeMethod?.includes(method) || false

                  return (
                    <Badge
                      key={key}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-purple-100"
                      onClick={() => toggleTradeMethod(method)}
                    >
                      {label}
                    </Badge>
                  )
                })}
              </div>
            </div>

            {/* 추가 필터 옵션 */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.negotiable || false}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    negotiable: e.target.checked || undefined
                  })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span>협상 가능</span>
              </label>

              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.deliveryAvailable || false}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    deliveryAvailable: e.target.checked || undefined
                  })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span>택배 가능</span>
              </label>
            </div>

            {/* 필터 초기화 */}
            {activeFilterCount > 0 && (
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-gray-600">
                  {resultCount !== undefined && `${resultCount}개 상품`}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  전체 초기화
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}