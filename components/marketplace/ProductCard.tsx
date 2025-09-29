'use client'

import React from 'react'
import Link from 'next/link'
import { Card, Badge } from '@/components/core'
import { Star, Clock, Heart } from 'lucide-react'
import { theme } from '@/lib/theme'
import type { MarketplaceItem } from '@/lib/types/marketplace'
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS, ITEM_STATUS } from '@/lib/types/marketplace'

interface ProductCardProps {
  item: MarketplaceItem
  showFavoriteButton?: boolean
  onFavoriteClick?: (itemId: string) => void
  isFavorited?: boolean
  className?: string
}

export function ProductCard({
  item,
  showFavoriteButton = false,
  onFavoriteClick,
  isFavorited = false,
  className = ''
}: ProductCardProps) {

  // 시간 포맷팅
  const formatTimeAgo = (timestamp: any) => {
    const now = new Date()
    const createdAt = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const diff = now.getTime() - createdAt.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}분전`
    if (hours < 24) return `${hours}시간전`
    if (days < 7) return `${days}일전`
    return createdAt.toLocaleDateString()
  }

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  // 상태 배지 스타일 결정
  const getStatusBadgeVariant = (status: any): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'available': return 'default'
      case 'reserved': return 'secondary'
      case 'sold': return 'destructive'
      default: return 'default'
    }
  }

  // 카테고리 아이콘 매핑
  const categoryIcons = {
    shoes: '👠',
    clothing: '👗',
    accessories: '💍',
    other: '📱'
  }

  return (
    <Card
      className={`overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${className}`}
      style={theme.components.cards.portfolio}
    >
      <Link href={`/marketplace/${item.id}`}>
        {/* 상품 이미지 */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={item.images[0] || '/placeholder-product.jpg'}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
            style={{ borderRadius: '8px 8px 0 0' }}
          />

          {/* 상태 배지 */}
          {item.metadata.status !== 'available' && (
            <div className="absolute top-3 left-3">
              <Badge
                variant={getStatusBadgeVariant(item.metadata.status)}
                style={theme.components.badges.category}
                className="text-xs font-medium"
              >
                {ITEM_STATUS[item.metadata.status]}
              </Badge>
            </div>
          )}

          {/* 관심 버튼 */}
          {showFavoriteButton && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onFavoriteClick?.(item.id)
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors"
            >
              <Heart
                className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </button>
          )}

          {/* 컨디션 배지 */}
          {item.specs.condition !== 'good' && (
            <div className="absolute bottom-3 left-3">
              <Badge
                variant="secondary"
                style={{
                  ...theme.components.badges.category,
                  backgroundColor: item.specs.condition === 'new' ? theme.colors.accent.blue : theme.colors.secondary.light
                }}
                className="text-xs"
              >
                {PRODUCT_CONDITIONS[item.specs.condition]}
              </Badge>
            </div>
          )}
        </div>

        {/* 카드 내용 */}
        <div className="p-4 space-y-3">
          {/* 제목과 카테고리 */}
          <div className="space-y-1">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-sm line-clamp-2 flex-1 pr-2">
                {item.title}
              </h3>
              <span className="text-lg flex-shrink-0">
                {categoryIcons[item.category]}
              </span>
            </div>

            {/* 카테고리 배지 */}
            <Badge
              variant="outline"
              style={theme.components.badges.category}
              className="text-xs"
            >
              {PRODUCT_CATEGORIES[item.category]}
            </Badge>
          </div>

          {/* 판매자 정보 */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{item.metadata.sellerId}</span>
              <div className="flex items-center">
                <Star className="h-3 w-3 text-yellow-400 mr-1" />
                <span className="text-xs text-gray-600">4.8</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {item.location.region}
            </Badge>
          </div>

          {/* 설명 */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {item.description}
          </p>

          {/* 가격과 시간 */}
          <div className="flex items-center justify-between">
            <span
              className="text-lg font-bold"
              style={{
                color: theme.colors.primary.main,
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {formatPrice(item.pricing.price)}
            </span>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {formatTimeAgo(item.metadata.createdAt)}
            </div>
          </div>

          {/* 브랜드 정보 (있는 경우) */}
          {item.specs.brand && (
            <div className="pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                브랜드: <span className="font-medium">{item.specs.brand}</span>
              </span>
            </div>
          )}
        </div>
      </Link>
    </Card>
  )
}

export default ProductCard