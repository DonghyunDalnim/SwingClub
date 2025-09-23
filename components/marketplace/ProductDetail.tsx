'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Card, CardContent, Badge } from '@/components/core'
import { ImageGallery } from './ImageGallery'
import { RelatedProducts } from './RelatedProducts'
import {
  ArrowLeft,
  Heart,
  Share2,
  MessageCircle,
  MapPin,
  Clock,
  Eye,
  Star,
  Truck,
  ShieldCheck,
  Phone,
  Mail
} from 'lucide-react'
import {
  PRODUCT_CATEGORIES,
  ITEM_STATUS,
  PRODUCT_CONDITIONS,
  TRADE_METHODS
} from '@/lib/types/marketplace'
import type { MarketplaceItem } from '@/lib/types/marketplace'

interface ProductDetailProps {
  item: MarketplaceItem
  currentUserId?: string
}

export function ProductDetail({ item, currentUserId }: ProductDetailProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)
  const [showContact, setShowContact] = useState(false)

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
    return date.toLocaleDateString('ko-KR')
  }

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  // 관심 표시 토글
  const handleLike = () => {
    setIsLiked(!isLiked)
    // TODO: API 호출로 관심 상품 등록/해제
  }

  // 공유하기
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: window.location.href
        })
      } catch (error) {
        console.log('공유 취소됨')
      }
    } else {
      // 폴백: 클립보드에 복사
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('링크가 클립보드에 복사되었습니다.')
      } catch (error) {
        console.error('클립보드 복사 실패:', error)
      }
    }
  }

  // 판매자 연락하기
  const handleContact = () => {
    setShowContact(true)
    // TODO: 채팅 시스템 또는 연락처 공개 로직
  }

  const isOwner = currentUserId === item.metadata.sellerId

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="font-semibold">상품 상세</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        {/* 이미지 갤러리 */}
        <ImageGallery images={item.images || []} title={item.title} />

        {/* 상품 정보 */}
        <Card>
          <CardContent className="p-6 space-y-4">
            {/* 제목과 가격 */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-xl font-bold text-gray-900 flex-1 pr-4">
                  {item.title}
                </h1>
                <Badge
                  variant={item.metadata.status === 'available' ? 'default' : 'secondary'}
                  className="flex-shrink-0"
                >
                  {ITEM_STATUS[item.metadata.status]}
                </Badge>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="outline">
                  {PRODUCT_CATEGORIES[item.category]}
                </Badge>
                {item.specs.condition && (
                  <Badge variant="outline">
                    {PRODUCT_CONDITIONS[item.specs.condition]}
                  </Badge>
                )}
                <Badge variant="outline">
                  {TRADE_METHODS[item.pricing.tradeMethod]}
                </Badge>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-purple-600">
                  {formatPrice(item.pricing.price)}
                </span>
                {item.pricing.negotiable && (
                  <span className="text-sm text-gray-500">협상가능</span>
                )}
                {item.specs.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    정가 {formatPrice(item.specs.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* 배송 정보 */}
            {item.pricing.tradeMethod !== 'direct' && (
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <Truck className="h-5 w-5 text-gray-600" />
                <div className="flex-1">
                  <span className="text-sm font-medium">배송비</span>
                  <p className="text-sm text-gray-600">
                    {item.pricing.freeDelivery
                      ? '무료배송'
                      : item.pricing.deliveryFee
                      ? `${formatPrice(item.pricing.deliveryFee)}`
                      : '판매자와 협의'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* 통계 */}
            <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  조회 {item.stats.views}
                </span>
                <span className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  관심 {item.stats.favorites}
                </span>
              </div>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(item.metadata.createdAt.toDate())}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 상품 상세 정보 */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">상품 정보</h2>

            <div className="space-y-3">
              {item.specs.brand && (
                <div className="flex justify-between">
                  <span className="text-gray-600">브랜드</span>
                  <span className="font-medium">{item.specs.brand}</span>
                </div>
              )}

              {item.specs.size && (
                <div className="flex justify-between">
                  <span className="text-gray-600">사이즈</span>
                  <span className="font-medium">{item.specs.size}</span>
                </div>
              )}

              {item.specs.color && (
                <div className="flex justify-between">
                  <span className="text-gray-600">색상</span>
                  <span className="font-medium">{item.specs.color}</span>
                </div>
              )}

              {item.specs.material && (
                <div className="flex justify-between">
                  <span className="text-gray-600">소재</span>
                  <span className="font-medium">{item.specs.material}</span>
                </div>
              )}

              {item.specs.purchaseDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">구매일</span>
                  <span className="font-medium">{item.specs.purchaseDate}</span>
                </div>
              )}

              {item.specs.gender && (
                <div className="flex justify-between">
                  <span className="text-gray-600">성별</span>
                  <span className="font-medium">
                    {item.specs.gender === 'unisex' ? '공용' :
                     item.specs.gender === 'male' ? '남성용' : '여성용'}
                  </span>
                </div>
              )}
            </div>

            {item.specs.features && item.specs.features.length > 0 && (
              <div>
                <span className="text-gray-600 block mb-2">특징</span>
                <div className="flex flex-wrap gap-2">
                  {item.specs.features.map((feature, index) => (
                    <Badge key={index} variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 상품 설명 */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">상품 설명</h2>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {item.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 판매자 정보 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">판매자 정보</h2>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">인증 판매자</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">
                  판매자명[0] {/* TODO: 실제 판매자 정보 */}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium">판매자명</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm">4.8 (리뷰 24개)</span>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {item.location.region}
                  {item.location.district && ` · ${item.location.district}`}
                </div>
              </div>
            </div>

            {/* 연락처 정보 (조건부 표시) */}
            {showContact && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">010-****-****</span>
                    <Button size="sm" variant="outline">연결</Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">채팅으로 문의</span>
                    <Button size="sm" variant="outline">채팅</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 거래 희망 장소 */}
        {item.location.preferredMeetingPlaces && item.location.preferredMeetingPlaces.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">거래 희망 장소</h2>
              <div className="space-y-2">
                {item.location.preferredMeetingPlaces.map((place, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">{place}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 관련 상품 */}
        <RelatedProducts
          currentItemId={item.id}
          category={item.category}
          sellerId={item.metadata.sellerId}
        />
      </div>

      {/* 하단 액션 바 */}
      {!isOwner && item.metadata.status === 'available' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-3 max-w-4xl mx-auto">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleContact}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              판매자 연락
            </Button>
            <Button
              className="flex-1"
              onClick={handleContact}
            >
              구매 문의
            </Button>
          </div>
        </div>
      )}

      {/* 소유자인 경우 관리 버튼 */}
      {isOwner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-3 max-w-4xl mx-auto">
            <Link href={`/marketplace/${item.id}/edit`} className="flex-1">
              <Button variant="outline" className="w-full">
                수정하기
              </Button>
            </Link>
            <Button
              variant="outline"
              className="flex-1"
              disabled={item.metadata.status !== 'available'}
            >
              {item.metadata.status === 'available' ? '판매완료 처리' : '판매완료'}
            </Button>
          </div>
        </div>
      )}

      {/* 하단 여백 (고정 액션 바 때문에) */}
      <div className="h-20" />
    </div>
  )
}