'use client'

import { useState, useEffect, useCallback } from 'react'
import { ProductCard } from './ProductCard'
import { Button } from '@/components/core'
import { Loader2, AlertCircle } from 'lucide-react'
import { getMarketplaceItems } from '@/lib/actions/marketplace'
import type { MarketplaceItem, ItemSearchFilters, ItemSortOption } from '@/lib/types/marketplace'

interface ProductGridProps {
  filters: ItemSearchFilters
  sortBy: ItemSortOption
  currentUserId?: string
}

interface LoadingState {
  initial: boolean
  loadingMore: boolean
  error: string | null
}

export function ProductGrid({ filters, sortBy, currentUserId }: ProductGridProps) {
  const [items, setItems] = useState<MarketplaceItem[]>([])
  const [loading, setLoading] = useState<LoadingState>({
    initial: true,
    loadingMore: false,
    error: null
  })
  const [hasMore, setHasMore] = useState(true)
  const [lastCursor, setLastCursor] = useState<string | null>(null)

  const ITEMS_PER_PAGE = 12

  // 초기 데이터 로드
  const loadInitialData = useCallback(async () => {
    setLoading({ initial: true, loadingMore: false, error: null })

    try {
      const result = await getMarketplaceItems(1, ITEMS_PER_PAGE, sortBy)

      setItems(result.data)
      setHasMore(result.pagination.hasNext)
      setLastCursor(result.pagination.page.toString())
    } catch (error) {
      console.error('상품 로드 실패:', error)
      setLoading(prev => ({ ...prev, error: '상품을 불러오는데 실패했습니다.' }))
    } finally {
      setLoading(prev => ({ ...prev, initial: false }))
    }
  }, [filters, sortBy])

  // 추가 데이터 로드 (무한 스크롤)
  const loadMoreData = useCallback(async () => {
    if (!hasMore || loading.loadingMore || !lastCursor) return

    setLoading(prev => ({ ...prev, loadingMore: true, error: null }))

    try {
      const nextPage = parseInt(lastCursor) + 1
      const result = await getMarketplaceItems(nextPage, ITEMS_PER_PAGE, sortBy)

      setItems(prev => [...prev, ...result.data])
      setHasMore(result.pagination.hasNext)
      setLastCursor(nextPage.toString())
    } catch (error) {
      console.error('추가 상품 로드 실패:', error)
      setLoading(prev => ({ ...prev, error: '추가 상품을 불러오는데 실패했습니다.' }))
    } finally {
      setLoading(prev => ({ ...prev, loadingMore: false }))
    }
  }, [filters, sortBy, hasMore, loading.loadingMore, lastCursor])

  // 필터나 정렬이 변경되면 초기 데이터 다시 로드
  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // 로딩 스켈레톤 컴포넌트
  const LoadingSkeleton = () => (
    <div className="grid gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border p-4">
          <div className="flex space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/6" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // 에러 상태
  if (loading.error && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <AlertCircle className="h-12 w-12 text-gray-400" />
        <p className="text-gray-600 text-center">{loading.error}</p>
        <Button onClick={loadInitialData} variant="outline">
          다시 시도
        </Button>
      </div>
    )
  }

  // 초기 로딩 상태
  if (loading.initial) {
    return <LoadingSkeleton />
  }

  // 빈 상태
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-6xl">🛍️</div>
        <h3 className="text-lg font-semibold text-gray-900">상품이 없습니다</h3>
        <p className="text-gray-600 text-center">
          검색 조건을 변경하거나<br />
          나중에 다시 확인해보세요.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 상품 그리드 */}
      <div className="grid gap-4">
        {items.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            currentUserId={currentUserId}
            showActions={true}
          />
        ))}
      </div>

      {/* 더 보기 버튼 */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={loadMoreData}
            disabled={loading.loadingMore}
            variant="outline"
            className="min-w-[120px]"
          >
            {loading.loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                로딩 중...
              </>
            ) : (
              '더 보기'
            )}
          </Button>
        </div>
      )}

      {/* 하단 에러 메시지 */}
      {loading.error && items.length > 0 && (
        <div className="flex flex-col items-center space-y-2 text-sm text-red-600">
          <p>{loading.error}</p>
          <Button onClick={loadMoreData} variant="ghost" size="sm">
            다시 시도
          </Button>
        </div>
      )}

      {/* 끝 메시지 */}
      {!hasMore && items.length > 0 && (
        <div className="text-center text-sm text-gray-500 py-4">
          모든 상품을 확인했습니다 ({items.length}개)
        </div>
      )}
    </div>
  )
}