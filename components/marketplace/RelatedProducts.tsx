'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from './ProductCard'
import { Button } from '@/components/core'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getMarketplaceItemsByCategory } from '@/lib/actions/marketplace'
import type { MarketplaceItem, ProductCategory } from '@/lib/types/marketplace'

interface RelatedProductsProps {
  currentItemId: string
  category: ProductCategory
  sellerId: string
}

export function RelatedProducts({ currentItemId, category, sellerId }: RelatedProductsProps) {
  const [sameCategoryItems, setSameCategoryItems] = useState<MarketplaceItem[]>([])
  const [sameCategoryIndex, setSameCategoryIndex] = useState(0)
  const [sellerItems, setSellerItems] = useState<MarketplaceItem[]>([])
  const [sellerIndex, setSellerIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  const ITEMS_PER_VIEW = 2 // 모바일에서 한번에 보여줄 상품 수

  useEffect(() => {
    loadRelatedProducts()
  }, [currentItemId, category, sellerId])

  const loadRelatedProducts = async () => {
    setLoading(true)

    try {
      // 같은 카테고리 상품 로드
      const categoryResult = await getMarketplaceItemsByCategory(category, 1, 10)
      setSameCategoryItems(categoryResult.data.filter(item => item.id !== currentItemId))

      // 같은 판매자의 다른 상품 로드 (간단한 구현 - 실제로는 seller별 query 필요)
      const allItemsResult = await getMarketplaceItemsByCategory(category, 1, 50)
      const sellerItems = allItemsResult.data.filter(
        item => item.metadata.sellerId === sellerId && item.id !== currentItemId
      )
      setSellerItems(sellerItems.slice(0, 10))
    } catch (error) {
      console.error('관련 상품 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // 같은 카테고리 상품 네비게이션
  const goToPreviousCategory = () => {
    setSameCategoryIndex(prev => Math.max(0, prev - ITEMS_PER_VIEW))
  }

  const goToNextCategory = () => {
    setSameCategoryIndex(prev =>
      Math.min(sameCategoryItems.length - ITEMS_PER_VIEW, prev + ITEMS_PER_VIEW)
    )
  }

  // 같은 판매자 상품 네비게이션
  const goToPreviousSeller = () => {
    setSellerIndex(prev => Math.max(0, prev - ITEMS_PER_VIEW))
  }

  const goToNextSeller = () => {
    setSellerIndex(prev =>
      Math.min(sellerItems.length - ITEMS_PER_VIEW, prev + ITEMS_PER_VIEW)
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* 로딩 스켈레톤 */}
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg border p-4">
                <div className="space-y-3">
                  <div className="h-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const hasAnySameCategoryItems = sameCategoryItems.length > 0
  const hasAnySellerItems = sellerItems.length > 0

  if (!hasAnySameCategoryItems && !hasAnySellerItems) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* 같은 카테고리 상품 */}
      {hasAnySameCategoryItems && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              비슷한 상품 ({sameCategoryItems.length}개)
            </h3>

            {sameCategoryItems.length > ITEMS_PER_VIEW && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousCategory}
                  disabled={sameCategoryIndex === 0}
                  className="p-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextCategory}
                  disabled={sameCategoryIndex >= sameCategoryItems.length - ITEMS_PER_VIEW}
                  className="p-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {sameCategoryItems
              .slice(sameCategoryIndex, sameCategoryIndex + ITEMS_PER_VIEW)
              .map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  showActions={true}
                />
              ))}
          </div>

          {/* 인디케이터 */}
          {sameCategoryItems.length > ITEMS_PER_VIEW && (
            <div className="flex justify-center space-x-1">
              {Array.from({
                length: Math.ceil(sameCategoryItems.length / ITEMS_PER_VIEW)
              }).map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    Math.floor(sameCategoryIndex / ITEMS_PER_VIEW) === index
                      ? 'bg-purple-600'
                      : 'bg-gray-300'
                  }`}
                  onClick={() => setSameCategoryIndex(index * ITEMS_PER_VIEW)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 같은 판매자의 다른 상품 */}
      {hasAnySellerItems && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              이 판매자의 다른 상품 ({sellerItems.length}개)
            </h3>

            {sellerItems.length > ITEMS_PER_VIEW && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousSeller}
                  disabled={sellerIndex === 0}
                  className="p-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextSeller}
                  disabled={sellerIndex >= sellerItems.length - ITEMS_PER_VIEW}
                  className="p-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {sellerItems
              .slice(sellerIndex, sellerIndex + ITEMS_PER_VIEW)
              .map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  showActions={true}
                />
              ))}
          </div>

          {/* 인디케이터 */}
          {sellerItems.length > ITEMS_PER_VIEW && (
            <div className="flex justify-center space-x-1">
              {Array.from({
                length: Math.ceil(sellerItems.length / ITEMS_PER_VIEW)
              }).map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    Math.floor(sellerIndex / ITEMS_PER_VIEW) === index
                      ? 'bg-purple-600'
                      : 'bg-gray-300'
                  }`}
                  onClick={() => setSellerIndex(index * ITEMS_PER_VIEW)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}