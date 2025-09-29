'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/core'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { FilterSection } from '@/components/marketplace/FilterSection'
import { ArrowLeft, Edit } from 'lucide-react'
import type { MarketplaceItem, ItemSearchFilters } from '@/lib/types/marketplace'
import { Timestamp } from 'firebase/firestore'

// 더미 데이터 (실제로는 서버에서 가져올 데이터)
const mockProducts: MarketplaceItem[] = [
  {
    id: '1',
    title: '린디합 전용 댄스화 - 거의 새제품!',
    description: '한 번만 신고 보관만 했어요. 정가 15만원에서 8만원으로 판매합니다.',
    category: 'shoes',
    pricing: {
      price: 80000,
      currency: 'KRW',
      negotiable: true,
      tradeMethod: 'both'
    },
    specs: {
      condition: 'like_new',
      brand: '댄스프로',
      size: '250',
      color: '블랙'
    },
    location: {
      region: '강남구',
      district: '서울특별시 강남구',
      deliveryAvailable: true
    },
    stats: {
      views: 125,
      favorites: 8,
      inquiries: 3
    },
    metadata: {
      createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)), // 2시간 전
      updatedAt: Timestamp.fromDate(new Date()),
      sellerId: '댄스러버',
      status: 'available',
      featured: true,
      reported: false,
      tags: ['린디합', '댄스화', '새상품']
    },
    images: ['/images/placeholder-shoes.jpg']
  },
  {
    id: '2',
    title: '빈티지 스윙 드레스 판매합니다',
    description: '공연용으로 한번 착용했습니다. 사이즈 55, 상태 매우 좋아요.',
    category: 'clothing',
    pricing: {
      price: 45000,
      currency: 'KRW',
      negotiable: false,
      tradeMethod: 'direct'
    },
    specs: {
      condition: 'like_new',
      size: '55',
      color: '네이비',
      material: '폴리에스터'
    },
    location: {
      region: '홍대',
      district: '서울특별시 마포구',
      deliveryAvailable: false
    },
    stats: {
      views: 89,
      favorites: 12,
      inquiries: 5
    },
    metadata: {
      createdAt: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)), // 1일 전
      updatedAt: Timestamp.fromDate(new Date()),
      sellerId: '스윙걸23',
      status: 'available',
      featured: false,
      reported: false,
      tags: ['스윙', '드레스', '빈티지']
    },
    images: ['/images/placeholder-dress.jpg']
  },
  {
    id: '3',
    title: '스윙댄스 액세서리 세트',
    description: '모자, 넷타이, 헤어핀 세트로 판매합니다. 무대용으로 완벽합니다.',
    category: 'accessories',
    pricing: {
      price: 25000,
      currency: 'KRW',
      negotiable: true,
      tradeMethod: 'both'
    },
    specs: {
      condition: 'good',
      color: '브라운'
    },
    location: {
      region: '신촌',
      district: '서울특별시 서대문구',
      deliveryAvailable: true
    },
    stats: {
      views: 67,
      favorites: 6,
      inquiries: 2
    },
    metadata: {
      createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)), // 3일 전
      updatedAt: Timestamp.fromDate(new Date()),
      sellerId: '액세사랑',
      status: 'available',
      featured: false,
      reported: false,
      tags: ['액세서리', '세트', '무대용']
    },
    images: ['/images/placeholder-accessories.jpg']
  }
]

export default function MarketplacePage() {
  const [filters, setFilters] = useState<ItemSearchFilters>({})
  const [filteredProducts, setFilteredProducts] = useState<MarketplaceItem[]>(mockProducts)

  // 필터 변경 핸들러
  const handleFiltersChange = (newFilters: ItemSearchFilters) => {
    setFilters(newFilters)

    // 필터 적용 로직
    let filtered = [...mockProducts]

    // 검색어 필터
    if (newFilters.searchTerm) {
      const searchTerm = newFilters.searchTerm.toLowerCase()
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.specs.brand?.toLowerCase().includes(searchTerm)
      )
    }

    // 카테고리 필터
    if (newFilters.category && newFilters.category.length > 0) {
      filtered = filtered.filter(product =>
        newFilters.category!.includes(product.category)
      )
    }

    // 가격 범위 필터
    if (newFilters.priceRange) {
      const { min, max } = newFilters.priceRange
      filtered = filtered.filter(product =>
        product.pricing.price >= (min || 0) &&
        product.pricing.price <= (max || Infinity)
      )
    }

    // 협상 가능 필터
    if (newFilters.negotiable) {
      filtered = filtered.filter(product => product.pricing.negotiable)
    }

    // 택배 가능 필터
    if (newFilters.deliveryAvailable) {
      filtered = filtered.filter(product => product.location.deliveryAvailable)
    }

    setFilteredProducts(filtered)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <span className="font-semibold text-lg">중고거래</span>
          </div>
          <Link href="/marketplace/write">
            <Edit className="h-6 w-6" />
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* 필터 섹션 (데스크톱은 사이드바, 모바일은 접을 수 있음) */}
          <div className="lg:col-span-1">
            <FilterSection
              filters={filters}
              onFiltersChange={handleFiltersChange}
              className="lg:sticky lg:top-24"
              collapsible={true}
            />
          </div>

          {/* 상품 목록 */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                총 <span className="font-medium text-gray-900">{filteredProducts.length}</span>개의 상품
              </p>
              <Link href="/marketplace/write">
                <Button className="hidden sm:flex">
                  <Edit className="h-4 w-4 mr-2" />
                  상품 등록
                </Button>
              </Link>
            </div>

            {/* 상품 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  item={product}
                  showFavoriteButton={true}
                  onFavoriteClick={(itemId) => {
                    console.log('Favorite clicked:', itemId)
                  }}
                />
              ))}
            </div>

            {/* 빈 상태 */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">🔍</div>
                <p className="text-gray-500 mb-4">조건에 맞는 상품이 없습니다.</p>
                <Button
                  variant="outline"
                  onClick={() => handleFiltersChange({})}
                >
                  필터 초기화
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 모바일 플로팅 등록 버튼 */}
        <div className="fixed bottom-20 right-4 sm:hidden">
          <Link href="/marketplace/write">
            <Button size="lg" className="rounded-full shadow-lg">
              <Edit className="h-5 w-5 mr-2" />
              등록
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}