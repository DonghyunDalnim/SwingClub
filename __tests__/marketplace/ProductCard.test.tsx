import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProductCard } from '@/components/marketplace/ProductCard'
import type { MarketplaceItem } from '@/lib/types/marketplace'
import { Timestamp } from 'firebase/firestore'

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

// Mock 데이터
const mockProduct: MarketplaceItem = {
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
    createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date()),
    sellerId: '댄스러버',
    status: 'available',
    featured: true,
    reported: false,
    tags: ['린디합', '댄스화', '새상품']
  },
  images: ['/images/placeholder-shoes.jpg']
}

const mockProductWithoutBrand: MarketplaceItem = {
  ...mockProduct,
  specs: {
    ...mockProduct.specs,
    brand: undefined
  }
}

const mockSoldProduct: MarketplaceItem = {
  ...mockProduct,
  metadata: {
    ...mockProduct.metadata,
    status: 'sold'
  }
}

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('기본 렌더링', () => {
    test('상품 정보가 정확히 표시되어야 함', () => {
      render(<ProductCard item={mockProduct} />)

      expect(screen.getByText('린디합 전용 댄스화 - 거의 새제품!')).toBeInTheDocument()
      expect(screen.getByText('한 번만 신고 보관만 했어요. 정가 15만원에서 8만원으로 판매합니다.')).toBeInTheDocument()
      expect(screen.getByText('댄스러버')).toBeInTheDocument()
      expect(screen.getByText('강남구')).toBeInTheDocument()
    })

    test('상품 이미지가 올바른 src와 alt를 가져야 함', () => {
      render(<ProductCard item={mockProduct} />)

      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('src', '/images/placeholder-shoes.jpg')
      expect(image).toHaveAttribute('alt', '린디합 전용 댄스화 - 거의 새제품!')
    })

    test('카테고리 배지가 표시되어야 함', () => {
      render(<ProductCard item={mockProduct} />)

      expect(screen.getByText('댄스화')).toBeInTheDocument()
    })

    test('카테고리 아이콘이 표시되어야 함', () => {
      render(<ProductCard item={mockProduct} />)

      expect(screen.getByText('👠')).toBeInTheDocument()
    })
  })

  describe('가격 포맷팅', () => {
    test('가격이 한국어 형식으로 표시되어야 함', () => {
      render(<ProductCard item={mockProduct} />)

      expect(screen.getByText('80,000원')).toBeInTheDocument()
    })

    test('높은 가격도 올바르게 포맷팅되어야 함', () => {
      const expensiveProduct = {
        ...mockProduct,
        pricing: { ...mockProduct.pricing, price: 1250000 }
      }
      render(<ProductCard item={expensiveProduct} />)

      expect(screen.getByText('1,250,000원')).toBeInTheDocument()
    })
  })

  describe('시간 포맷팅', () => {
    test('몇 분전이 올바르게 표시되어야 함', () => {
      const recentProduct = {
        ...mockProduct,
        metadata: {
          ...mockProduct.metadata,
          createdAt: Timestamp.fromDate(new Date(Date.now() - 30 * 60 * 1000)) // 30분 전
        }
      }
      render(<ProductCard item={recentProduct} />)

      expect(screen.getByText('30분전')).toBeInTheDocument()
    })

    test('몇 시간전이 올바르게 표시되어야 함', () => {
      render(<ProductCard item={mockProduct} />)

      expect(screen.getByText('2시간전')).toBeInTheDocument()
    })

    test('몇 일전이 올바르게 표시되어야 함', () => {
      const oldProduct = {
        ...mockProduct,
        metadata: {
          ...mockProduct.metadata,
          createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) // 3일 전
        }
      }
      render(<ProductCard item={oldProduct} />)

      expect(screen.getByText('3일전')).toBeInTheDocument()
    })
  })

  describe('상태 배지', () => {
    test('판매중 상품은 상태 배지가 표시되지 않아야 함', () => {
      render(<ProductCard item={mockProduct} />)

      expect(screen.queryByText('판매중')).not.toBeInTheDocument()
    })

    test('판매완료 상품은 상태 배지가 표시되어야 함', () => {
      render(<ProductCard item={mockSoldProduct} />)

      expect(screen.getByText('판매완료')).toBeInTheDocument()
    })

    test('예약중 상품은 상태 배지가 표시되어야 함', () => {
      const reservedProduct = {
        ...mockProduct,
        metadata: { ...mockProduct.metadata, status: 'reserved' as const }
      }
      render(<ProductCard item={reservedProduct} />)

      expect(screen.getByText('예약중')).toBeInTheDocument()
    })
  })

  describe('컨디션 배지', () => {
    test('good 컨디션이 아닌 경우 컨디션 배지가 표시되어야 함', () => {
      render(<ProductCard item={mockProduct} />)

      expect(screen.getByText('거의새상품')).toBeInTheDocument()
    })

    test('good 컨디션인 경우 컨디션 배지가 표시되지 않아야 함', () => {
      const goodProduct = {
        ...mockProduct,
        specs: { ...mockProduct.specs, condition: 'good' as const }
      }
      render(<ProductCard item={goodProduct} />)

      expect(screen.queryByText('상태좋음')).not.toBeInTheDocument()
    })

    test('new 컨디션인 경우 새상품 배지가 표시되어야 함', () => {
      const newProduct = {
        ...mockProduct,
        specs: { ...mockProduct.specs, condition: 'new' as const }
      }
      render(<ProductCard item={newProduct} />)

      expect(screen.getByText('새상품')).toBeInTheDocument()
    })
  })

  describe('관심 버튼', () => {
    test('showFavoriteButton이 false면 관심 버튼이 표시되지 않아야 함', () => {
      render(<ProductCard item={mockProduct} showFavoriteButton={false} />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    test('showFavoriteButton이 true면 관심 버튼이 표시되어야 함', () => {
      render(<ProductCard item={mockProduct} showFavoriteButton={true} />)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    test('관심 버튼 클릭 시 콜백이 호출되어야 함', () => {
      const mockOnFavoriteClick = jest.fn()
      render(
        <ProductCard
          item={mockProduct}
          showFavoriteButton={true}
          onFavoriteClick={mockOnFavoriteClick}
        />
      )

      const favoriteButton = screen.getByRole('button')
      fireEvent.click(favoriteButton)

      expect(mockOnFavoriteClick).toHaveBeenCalledWith('1')
    })

    test('isFavorited가 true면 하트 아이콘이 채워져야 함', () => {
      render(
        <ProductCard
          item={mockProduct}
          showFavoriteButton={true}
          isFavorited={true}
        />
      )

      const heartIcon = screen.getByRole('button').querySelector('svg')
      expect(heartIcon).toHaveClass('fill-red-500', 'text-red-500')
    })

    test('isFavorited가 false면 하트 아이콘이 비어있어야 함', () => {
      render(
        <ProductCard
          item={mockProduct}
          showFavoriteButton={true}
          isFavorited={false}
        />
      )

      const heartIcon = screen.getByRole('button').querySelector('svg')
      expect(heartIcon).toHaveClass('text-gray-600')
      expect(heartIcon).not.toHaveClass('fill-red-500')
    })
  })

  describe('브랜드 정보', () => {
    test('브랜드가 있으면 브랜드 정보가 표시되어야 함', () => {
      render(<ProductCard item={mockProduct} />)

      expect(screen.getByText(/브랜드:/)).toBeInTheDocument()
      expect(screen.getByText('댄스프로')).toBeInTheDocument()
    })

    test('브랜드가 없으면 브랜드 정보가 표시되지 않아야 함', () => {
      render(<ProductCard item={mockProductWithoutBrand} />)

      expect(screen.queryByText(/브랜드:/)).not.toBeInTheDocument()
    })
  })

  describe('링크', () => {
    test('카드 전체가 상품 상세 페이지로 링크되어야 함', () => {
      render(<ProductCard item={mockProduct} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/marketplace/1')
    })
  })

  describe('평점 표시', () => {
    test('별점 아이콘과 점수가 표시되어야 함', () => {
      render(<ProductCard item={mockProduct} />)

      expect(screen.getByText('4.8')).toBeInTheDocument()
    })
  })

  describe('엣지 케이스', () => {
    test('긴 제목이 올바르게 처리되어야 함', () => {
      const longTitleProduct = {
        ...mockProduct,
        title: '매우 긴 제목을 가진 상품입니다. 이 제목은 한 줄을 넘어갈 정도로 길어서 적절히 잘려야 합니다.'
      }
      render(<ProductCard item={longTitleProduct} />)

      expect(screen.getByText(longTitleProduct.title)).toBeInTheDocument()
    })

    test('이미지가 없는 경우 플레이스홀더가 표시되어야 함', () => {
      const noImageProduct = {
        ...mockProduct,
        images: []
      }
      render(<ProductCard item={noImageProduct} />)

      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('src', '/placeholder-product.jpg')
    })

    test('가격이 0인 경우에도 올바르게 표시되어야 함', () => {
      const freeProduct = {
        ...mockProduct,
        pricing: { ...mockProduct.pricing, price: 0 }
      }
      render(<ProductCard item={freeProduct} />)

      expect(screen.getByText('0원')).toBeInTheDocument()
    })
  })

  describe('카테고리별 아이콘', () => {
    test('신발 카테고리는 👠 아이콘이 표시되어야 함', () => {
      render(<ProductCard item={mockProduct} />)
      expect(screen.getByText('👠')).toBeInTheDocument()
    })

    test('의상 카테고리는 👗 아이콘이 표시되어야 함', () => {
      const clothingProduct = { ...mockProduct, category: 'clothing' as const }
      render(<ProductCard item={clothingProduct} />)
      expect(screen.getByText('👗')).toBeInTheDocument()
    })

    test('액세서리 카테고리는 💍 아이콘이 표시되어야 함', () => {
      const accessoryProduct = { ...mockProduct, category: 'accessories' as const }
      render(<ProductCard item={accessoryProduct} />)
      expect(screen.getByText('💍')).toBeInTheDocument()
    })

    test('기타 카테고리는 📱 아이콘이 표시되어야 함', () => {
      const otherProduct = { ...mockProduct, category: 'other' as const }
      render(<ProductCard item={otherProduct} />)
      expect(screen.getByText('📱')).toBeInTheDocument()
    })
  })
})