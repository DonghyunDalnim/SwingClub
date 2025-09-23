import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getMarketplaceItem } from '@/lib/actions/marketplace'
import { ProductDetail } from '@/components/marketplace/ProductDetail'

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

// 메타데이터 생성
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const item = await getMarketplaceItem(id)

  if (!item) {
    return {
      title: '상품을 찾을 수 없습니다 - SwingClub',
      description: '요청하신 상품을 찾을 수 없습니다.'
    }
  }
  const priceFormatted = new Intl.NumberFormat('ko-KR').format(item.pricing.price) + '원'

  return {
    title: `${item.title} - ${priceFormatted} | SwingClub 중고거래`,
    description: item.description.slice(0, 160),
    openGraph: {
      title: item.title,
      description: item.description,
      images: item.images?.length ? [item.images[0]] : [],
      type: 'website',
      locale: 'ko_KR'
    },
    keywords: [
      item.title,
      '스윙댄스',
      '중고거래',
      '댄스용품',
      item.specs.brand,
      item.location.region
    ].filter((keyword): keyword is string => Boolean(keyword))
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const item = await getMarketplaceItem(id)

  if (!item) {
    notFound()
  }

  return (
    <ProductDetail
      item={item}
      currentUserId="current-user-id" // TODO: Get from auth context
    />
  )
}