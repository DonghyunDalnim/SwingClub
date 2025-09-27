'use client'

import { useState, useEffect } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/core'
import { Badge } from '@/components/core'
import { Search, Edit, Star, Clock } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { EmptyState, EmptyMarketplaceIllustration } from '@/components/ui/EmptyState'

export default function MarketplacePage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    // 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setItems([
        // Mock 데이터는 그대로 유지하되, 빈 배열로 시작해서 빈 상태도 테스트 가능
        {
          id: 1,
          title: "린디합 전용 댄스화 - 거의 새제품!",
          seller: "댄스러버",
          rating: 4.8,
          location: "강남구",
          price: "80,000원",
          description: "한 번만 신고 보관만 했어요. 정가 15만원 → 8만원",
          time: "2시간전",
          badge: "🔥 인기",
          icon: "👠"
        },
        {
          id: 2,
          title: "빈티지 스윙 드레스 판매합니다",
          seller: "스윙걸23",
          rating: 4.6,
          location: "홍대",
          price: "45,000원",
          description: "공연용으로 한번 착용. 사이즈 55",
          time: "1일전",
          badge: "새상품",
          icon: "👗"
        },
        {
          id: 3,
          title: "스윙댄스 액세서리 세트",
          seller: "액세사랑",
          rating: 4.9,
          location: "신촌",
          price: "25,000원",
          description: "모자, 넷타이, 헤어핀 세트로 판매",
          time: "3일전",
          badge: "세트",
          icon: "💍"
        }
      ])
      setLoading(false)
    }, 2000) // 2초 로딩 시뮬레이션

    return () => clearTimeout(timer)
  }, [])
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-semibold text-lg">중고거래</span>
          <div className="flex items-center space-x-3">
            <Search className="h-6 w-6" />
            <Edit className="h-6 w-6" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Category Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <Badge variant="default" className="whitespace-nowrap">👠신발</Badge>
          <Badge variant="outline" className="whitespace-nowrap">👗의상</Badge>
          <Badge variant="outline" className="whitespace-nowrap">💍액세서리</Badge>
          <Badge variant="outline" className="whitespace-nowrap">📱기타</Badge>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-6">
              <LoadingSpinner size="lg" />
              <p className="text-[#6A7685] ml-3">상품을 불러오는 중...</p>
            </div>

            {/* 스켈레톤 카드들 */}
            {Array.from({ length: 3 }, (_, i) => (
              <SkeletonCard key={i} type="marketplace-item" />
            ))}
          </div>
        )}

        {/* 상품 목록 */}
        {!loading && items.length > 0 && (
          <div className="grid gap-4">
            {items.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">{item.title}</h3>
                        <Badge className={`text-xs ${item.badge.includes('인기') ? 'bg-red-500' : 'bg-gray-500'}`}>
                          {item.badge}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium">{item.seller}</span>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400" />
                          <span className="text-xs">{item.rating}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">{item.location}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        &quot;{item.description}&quot;
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">{item.price}</span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {item.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && items.length === 0 && (
          <EmptyState
            icon={<EmptyMarketplaceIllustration />}
            title="판매중인 상품이 없습니다"
            description="아직 등록된 중고거래 상품이 없어요. 첫 번째 판매자가 되어보세요!"
            actionLabel="상품 등록하기"
            onAction={() => {
              // TODO: 상품 등록 페이지로 이동
              alert('상품 등록 페이지로 이동 (준비중)')
            }}
            className="bg-[#F6F7F9] rounded-xl"
          />
        )}

        {/* Quick Actions */}
        <div className="fixed bottom-20 right-4">
          <Button size="lg" className="rounded-full shadow-lg">
            <Edit className="h-5 w-5 mr-2" />
            등록
          </Button>
        </div>
      </div>
    </div>
  )
}