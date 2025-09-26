'use client'

import Link from 'next/link'
import { Card, CardContent, Badge, Button } from '@/components/core'
import { Heart, MessageCircle, Eye, Star, Clock, MapPin } from 'lucide-react'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { Avatar } from '@/components/ui/Avatar'
import { useState } from 'react'

interface ProductCardProps {
  product: {
    id: string
    title: string
    price: number
    originalPrice?: number
    description: string
    images: string[]
    category: string
    condition: 'new' | 'like_new' | 'good' | 'fair'
    location: string
    seller: {
      id: string
      name: string
      avatar?: string
      rating: number
      responseTime?: string
    }
    stats: {
      views: number
      likes: number
      comments: number
    }
    tags?: string[]
    isPopular?: boolean
    postedAt: Date
  }
  showActions?: boolean
  currentUserId?: string
}

const CONDITION_LABELS = {
  new: '새상품',
  like_new: '거의 새것',
  good: '양호',
  fair: '사용감 있음'
} as const

const CONDITION_COLORS = {
  new: 'bg-green-100 text-green-800',
  like_new: 'bg-blue-100 text-blue-800',
  good: 'bg-yellow-100 text-yellow-800',
  fair: 'bg-gray-100 text-gray-800'
} as const

export function ProductCard({ product, showActions = false, currentUserId }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)

  // 시간 포맷팅
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}분전`
    if (hours < 24) return `${hours}시간전`
    if (days < 7) return `${days}일전`
    return date.toLocaleDateString()
  }

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  // 할인율 계산
  const discountRate = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  return (
    <Link href={`/marketplace/${product.id}`}>
      <Card className="group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden">
        <div className="relative">
          {/* 상품 이미지 */}
          <OptimizedImage
            src={product.images[0]}
            alt={product.title}
            ratio="card"
            className="w-full group-hover:scale-105 transition-transform duration-300"
          />

          {/* 인기 배지 */}
          {product.isPopular && (
            <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-white text-xs">
              🔥 인기
            </Badge>
          )}

          {/* 좋아요 버튼 */}
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-3 right-3 p-1 h-8 w-8 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-sm"
            onClick={handleLike}
          >
            <Heart
              className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </Button>

          {/* 이미지 개수 표시 */}
          {product.images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              +{product.images.length - 1}
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* 제목과 상태 */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-base leading-tight line-clamp-2 flex-1 pr-2 group-hover:text-purple-600 transition-colors">
              {product.title}
            </h3>
            <Badge
              variant="secondary"
              className={`text-xs whitespace-nowrap ${CONDITION_COLORS[product.condition]}`}
            >
              {CONDITION_LABELS[product.condition]}
            </Badge>
          </div>

          {/* 판매자 정보 */}
          <div className="flex items-center space-x-2 mb-2">
            <Avatar
              src={product.seller.avatar}
              alt={product.seller.name}
              size="xs"
              fallback={product.seller.name.charAt(0)}
            />
            <span className="text-sm font-medium text-gray-800">{product.seller.name}</span>
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600 ml-1">{product.seller.rating.toFixed(1)}</span>
            </div>
            {product.seller.responseTime && (
              <Badge variant="outline" className="text-xs">
                {product.seller.responseTime}
              </Badge>
            )}
          </div>

          {/* 위치 */}
          <div className="flex items-center text-gray-500 mb-3">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="text-xs">{product.location}</span>
          </div>

          {/* 설명 */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            &ldquo;{product.description}&rdquo;
          </p>

          {/* 가격 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {product.originalPrice && discountRate > 0 && (
                <>
                  <span className="text-lg font-bold text-red-600">{discountRate}% ↓</span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-purple-600">
              {formatPrice(product.price)}
            </span>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(product.postedAt)}
            </div>
          </div>

          {/* 통계 */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {product.stats.views}
              </span>
              <span className="flex items-center">
                <Heart className="h-3 w-3 mr-1" />
                {product.stats.likes}
              </span>
              <span className="flex items-center">
                <MessageCircle className="h-3 w-3 mr-1" />
                {product.stats.comments}
              </span>
            </div>

            {/* 태그 */}
            {product.tags && product.tags.length > 0 && (
              <Badge variant="outline" className="text-xs">
                #{product.tags[0]}{product.tags.length > 1 ? ` +${product.tags.length - 1}` : ''}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default ProductCard