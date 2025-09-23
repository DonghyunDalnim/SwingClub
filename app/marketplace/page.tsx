'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/core'
import { Edit } from 'lucide-react'
import { FilterPanel } from '@/components/marketplace/FilterPanel'
import { ProductGrid } from '@/components/marketplace/ProductGrid'
import type { ItemSearchFilters, ItemSortOption } from '@/lib/types/marketplace'

function MarketplaceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL에서 초기 상태 복원
  const [filters, setFilters] = useState<ItemSearchFilters>(() => {
    const initialFilters: ItemSearchFilters = {}

    try {
      // URL 파라미터에서 필터 복원
      const category = searchParams.get('category')
      if (category) {
        initialFilters.category = category.split(',') as any
      }

      const condition = searchParams.get('condition')
      if (condition) {
        initialFilters.condition = condition.split(',') as any
      }

      const tradeMethod = searchParams.get('tradeMethod')
      if (tradeMethod) {
        initialFilters.tradeMethod = tradeMethod.split(',') as any
      }

      const searchTerm = searchParams.get('search')
      if (searchTerm) {
        initialFilters.searchTerm = searchTerm
      }

      const priceMin = searchParams.get('priceMin')
      const priceMax = searchParams.get('priceMax')
      if (priceMin || priceMax) {
        initialFilters.priceRange = {
          min: priceMin ? parseInt(priceMin) : undefined,
          max: priceMax ? parseInt(priceMax) : undefined
        }
      }

      const negotiable = searchParams.get('negotiable')
      if (negotiable === 'true') {
        initialFilters.negotiable = true
      }

      const deliveryAvailable = searchParams.get('deliveryAvailable')
      if (deliveryAvailable === 'true') {
        initialFilters.deliveryAvailable = true
      }
    } catch (error) {
      console.error('URL 파라미터 파싱 오류:', error)
    }

    return initialFilters
  })

  const [sortBy, setSortBy] = useState<ItemSortOption>(() => {
    try {
      return (searchParams.get('sort') as ItemSortOption) || 'latest'
    } catch (error) {
      console.error('정렬 파라미터 파싱 오류:', error)
      return 'latest'
    }
  })

  // URL 상태 업데이트
  const updateURL = (newFilters: ItemSearchFilters, newSort: ItemSortOption) => {
    try {
      const params = new URLSearchParams()

      if (newFilters.category?.length) {
        params.set('category', newFilters.category.join(','))
      }

      if (newFilters.condition?.length) {
        params.set('condition', newFilters.condition.join(','))
      }

      if (newFilters.tradeMethod?.length) {
        params.set('tradeMethod', newFilters.tradeMethod.join(','))
      }

      if (newFilters.searchTerm) {
        params.set('search', newFilters.searchTerm)
      }

      if (newFilters.priceRange?.min) {
        params.set('priceMin', newFilters.priceRange.min.toString())
      }

      if (newFilters.priceRange?.max) {
        params.set('priceMax', newFilters.priceRange.max.toString())
      }

      if (newFilters.negotiable) {
        params.set('negotiable', 'true')
      }

      if (newFilters.deliveryAvailable) {
        params.set('deliveryAvailable', 'true')
      }

      if (newSort !== 'latest') {
        params.set('sort', newSort)
      }

      const queryString = params.toString()
      const newUrl = queryString ? `/marketplace?${queryString}` : '/marketplace'

      // URL 업데이트 (페이지 리로드 없이)
      router.replace(newUrl, { scroll: false })
    } catch (error) {
      console.error('URL 업데이트 오류:', error)
    }
  }

  // 필터 변경 핸들러
  const handleFiltersChange = (newFilters: ItemSearchFilters) => {
    setFilters(newFilters)
    updateURL(newFilters, sortBy)
  }

  // 정렬 변경 핸들러
  const handleSortChange = (newSort: ItemSortOption) => {
    setSortBy(newSort)
    updateURL(filters, newSort)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-semibold text-lg">중고거래</span>
          <div className="flex items-center space-x-3">
            <Link href="/marketplace/create">
              <Button size="sm" variant="ghost">
                <Edit className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />

      {/* Product Grid */}
      <div className="container mx-auto px-4 py-6">
        <ProductGrid
          filters={filters}
          sortBy={sortBy}
          currentUserId="current-user-id" // TODO: Get from auth context
        />
      </div>

      {/* Quick Actions - Create Listing */}
      <div className="fixed bottom-20 right-4">
        <Link href="/marketplace/create">
          <Button size="lg" className="rounded-full shadow-lg">
            <Edit className="h-5 w-5 mr-2" />
            등록
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  )
}