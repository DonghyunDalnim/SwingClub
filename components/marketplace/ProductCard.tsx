'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, Badge, Button } from '@/components/core'
import { Heart, MapPin, Clock, Eye, Star } from 'lucide-react'
import { PRODUCT_CATEGORIES, ITEM_STATUS, PRODUCT_CONDITIONS, TRADE_METHODS } from '@/lib/types/marketplace'
import type { MarketplaceItem } from '@/lib/types/marketplace'
import { useState } from 'react'

interface ProductCardProps {
  item: MarketplaceItem
  currentUserId?: string
  showActions?: boolean
}

export function ProductCard({ item, currentUserId, showActions = false }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)

  // 카테고리 이모지 매핑
  const categoryEmojis = {
    shoes: '👠',
    clothing: '👗',
    accessories: '💍',
    other: '📱'
  }

  // 시간 포맷팅 (한국어)
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}분전`
    if (hours < 24) return `${hours}시간전`
    if (days < 7) return `${days}일전`
    return date.toLocaleDateString('ko-KR')
  }

  // 가격 포맷팅 (원화)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  // 상태 배지 색상
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available': return 'default'
      case 'reserved': return 'secondary'
      case 'sold': return 'destructive'
      default: return 'outline'
    }
  }

  // 관심 표시 토글
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
    // TODO: API 호출로 관심 상품 등록/해제
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <Link href={`/marketplace/${item.id}`} className="block">
          <div className="flex space-x-4">
            {/* 상품 이미지 */}
            <div className="w-20 h-20 relative flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
              {item.images && item.images.length > 0 ? (
                <Image
                  src={item.images[0]}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  {categoryEmojis[item.category]}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* 제목과 상태 */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate pr-2 hover:text-purple-600">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {PRODUCT_CATEGORIES[item.category]}
                    </Badge>

                    <Badge
                      variant={getStatusBadgeVariant(item.metadata.status)}
                      className="text-xs"
                    >
                      {ITEM_STATUS[item.metadata.status]}
                    </Badge>

                    {/* 새 상품 표시 */}
                    {new Date().getTime() - item.metadata.createdAt.toDate().getTime() < 24 * 60 * 60 * 1000 && (
                      <Badge variant="destructive" className="text-xs">NEW</Badge>
                    )}
                  </div>
                </div>

                {/* 관심 표시 버튼 */}
                {showActions && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-1 h-7 w-7"
                    onClick={handleLike}
                  >
                    <Heart className={`h-3 w-3 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                )}
              </div>

              {/* 판매자 정보 */}
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium">판매자명</span>
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs">4.8</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {item.location.region}
                </Badge>
              </div>

              {/* 상품 설명 미리보기 */}
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                "{item.description.slice(0, 50)}{item.description.length > 50 ? '...' : ''}"
              </p>

              {/* 가격과 통계 */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-purple-600">
                    {formatPrice(item.pricing.price)}
                  </span>
                  {item.pricing.negotiable && (
                    <span className="text-xs text-gray-500">협상가능</span>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(item.metadata.createdAt.toDate())}
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      {item.stats.favorites}
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {item.stats.views}
                    </span>
                  </div>
                </div>
              </div>

              {/* 추가 정보 */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1">
                  {item.specs.condition && (
                    <Badge variant="outline" className="text-xs">
                      {PRODUCT_CONDITIONS[item.specs.condition]}
                    </Badge>
                  )}

                  <Badge variant="outline" className="text-xs">
                    {TRADE_METHODS[item.pricing.tradeMethod]}
                  </Badge>
                </div>

                {item.pricing.deliveryFee === 0 && (
                  <Badge variant="secondary" className="text-xs">
                    무료배송
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}