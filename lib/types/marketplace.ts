/**
 * 중고거래 마켓플레이스 관련 TypeScript 타입 정의
 * 스윙댄스 커뮤니티 전용 중고거래 시스템
 */

import type { GeoPoint, Timestamp } from 'firebase/firestore'
import type { KakaoLatLng } from './kakao-map'

// 상품 카테고리
export type ProductCategory = 'shoes' | 'clothing' | 'accessories' | 'other'

// 아이템 상태 (거래 상태)
export type ItemStatus = 'available' | 'reserved' | 'sold'

// 상품 컨디션
export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor'

// 거래 방식
export type TradeMethod = 'direct' | 'delivery' | 'both'

// 가격 정보
export interface ItemPricing {
  price: number           // 판매 가격
  currency: 'KRW'         // 통화 (한국원화)
  negotiable: boolean     // 협상 가능 여부
  deliveryFee?: number    // 배송비 (원)
  freeDelivery?: boolean  // 무료배송 여부
  tradeMethod: TradeMethod // 거래 방식
  notes?: string          // 가격 관련 추가 정보
}

// 상품 상세 정보
export interface ItemSpecs {
  brand?: string          // 브랜드명
  size?: string           // 사이즈 (신발: "230", 의상: "55", etc)
  color?: string          // 색상
  condition: ProductCondition // 상품 상태
  purchaseDate?: string   // 구매일 (YYYY-MM 형식)
  originalPrice?: number  // 정가
  material?: string       // 소재 (의상/액세서리용)
  gender?: 'unisex' | 'male' | 'female' // 성별 구분
  features?: string[]     // 특징/기능 (예: ["스웨이드", "쿠션솔"])
}

// 위치 정보 (기존 geo 유틸리티 활용)
export interface ItemLocation {
  geopoint?: GeoPoint     // Firestore GeoPoint (선택적)
  region: string          // 지역 ("강남구", "홍대", "신촌" 등)
  district?: string       // 시/구 ("서울특별시 강남구")
  preferredMeetingPlaces?: string[] // 선호 거래 장소
  deliveryAvailable: boolean // 택배 가능 여부
}

// 통계 정보
export interface ItemStats {
  views: number           // 조회수
  favorites: number       // 관심 표시 수
  inquiries: number       // 문의 수
  lastActivity?: Timestamp // 마지막 활동 일시
}

// 메타데이터
export interface ItemMetadata {
  createdAt: Timestamp
  updatedAt: Timestamp
  sellerId: string        // 판매자 사용자 ID
  status: ItemStatus      // 거래 상태
  featured: boolean       // 추천 상품 여부 (관리자 설정)
  reported: boolean       // 신고된 상품 여부
  tags?: string[]         // 검색용 태그
  keywords?: string[]     // 검색 최적화용 키워드
}

// 메인 마켓플레이스 아이템 인터페이스
export interface MarketplaceItem {
  id: string
  title: string           // 상품 제목
  description: string     // 상품 설명
  category: ProductCategory
  pricing: ItemPricing
  specs: ItemSpecs
  location: ItemLocation
  stats: ItemStats
  metadata: ItemMetadata
  images: string[]        // 이미지 URL 배열 (Firebase Storage)
}

// 아이템 생성용 인터페이스 (ID와 메타데이터 제외)
export interface CreateItemData {
  title: string
  description: string
  category: ProductCategory
  pricing: Omit<ItemPricing, 'notes'> & { notes?: string }
  specs: ItemSpecs
  location: Omit<ItemLocation, 'geopoint'> & { coordinates?: KakaoLatLng }
  images: string[]
  tags?: string[]
  keywords?: string[]
}

// 아이템 업데이트용 인터페이스
export interface UpdateItemData extends Partial<CreateItemData> {
  status?: ItemStatus
  featured?: boolean
  reported?: boolean
}

// 아이템 검색 필터
export interface ItemSearchFilters {
  category?: ProductCategory[]
  status?: ItemStatus[]
  region?: string[]
  condition?: ProductCondition[]
  priceRange?: {
    min?: number
    max?: number
  }
  sizeRange?: string[]    // 사이즈 필터
  brands?: string[]       // 브랜드 필터
  tradeMethod?: TradeMethod[]
  deliveryAvailable?: boolean
  negotiable?: boolean
  coordinates?: KakaoLatLng
  radius?: number         // 검색 반경 (km)
  searchTerm?: string     // 제목/설명 텍스트 검색
}

// 아이템 검색 결과
export interface ItemSearchResult {
  items: MarketplaceItem[]
  total: number
  hasMore: boolean
  filters: ItemSearchFilters
}

// 지리적 검색용 인터페이스
export interface GeographicItemSearch {
  center: KakaoLatLng
  radius: number          // km 단위
  limit?: number
  category?: ProductCategory
  priceRange?: { min?: number; max?: number }
}

// 아이템 목록 응답
export interface ItemsResponse {
  data: MarketplaceItem[]
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 거래 문의 스레드 상태
export type InquiryStatus = 'active' | 'completed' | 'cancelled' | 'reported'

// 문의 메시지 타입
export type InquiryMessageType = 'text' | 'image' | 'price_proposal' | 'system'

// 개별 문의 메시지
export interface InquiryMessage {
  id: string
  inquiryId: string
  senderId: string
  senderName: string
  senderType: 'buyer' | 'seller'
  type: InquiryMessageType
  content: string
  imageUrl?: string
  priceProposal?: {
    proposedPrice: number
    originalPrice: number
    message?: string
  }
  isRead: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  editHistory?: {
    editedAt: Timestamp
    previousContent: string
  }[]
}

// 거래 문의 스레드 (기존 ItemInquiry 확장)
export interface ItemInquiry {
  id: string
  itemId: string
  itemTitle: string      // 상품 제목 (비정규화)
  itemImage?: string     // 상품 대표 이미지
  buyerId: string
  buyerName: string      // 구매자 닉네임 (비정규화)
  sellerId: string
  sellerName: string     // 판매자 닉네임 (비정규화)

  // 문의 상태
  status: InquiryStatus

  // 마지막 메시지 정보 (비정규화 - 목록 표시용)
  lastMessage: string
  lastMessageAt: Timestamp
  lastSenderId: string

  // 읽음 상태
  buyerLastReadAt?: Timestamp
  sellerLastReadAt?: Timestamp
  unreadCount: {
    buyer: number
    seller: number
  }

  // 통계
  messageCount: number

  // 메타데이터
  createdAt: Timestamp
  updatedAt: Timestamp

  // 신고 관련
  reportedBy?: string
  reportReason?: string
  reportedAt?: Timestamp
}

// 에러 타입
export interface MarketplaceError {
  code: string
  message: string
  field?: string
}

// 상수 정의
export const PRODUCT_CATEGORIES = {
  shoes: '댄스화',
  clothing: '의상',
  accessories: '액세서리',
  other: '기타'
} as const

export const ITEM_STATUS = {
  available: '판매중',
  reserved: '예약중',
  sold: '판매완료'
} as const

export const PRODUCT_CONDITIONS = {
  new: '새상품',
  like_new: '거의새상품',
  good: '상태좋음',
  fair: '보통',
  poor: '상태나쁨'
} as const

export const TRADE_METHODS = {
  direct: '직거래',
  delivery: '택배',
  both: '직거래/택배'
} as const

// 검증 함수 타입
export type ValidateItemData = (data: CreateItemData) => MarketplaceError[]

// 상품 정렬 옵션
export type ItemSortOption = 'latest' | 'oldest' | 'price_low' | 'price_high' | 'popular'

export const ITEM_SORT_OPTIONS = {
  latest: '최신순',
  oldest: '오래된순',
  price_low: '낮은가격순',
  price_high: '높은가격순',
  popular: '인기순'
} as const

// 문의 관련 상수
export const INQUIRY_STATUS = {
  active: '진행중',
  completed: '완료',
  cancelled: '취소',
  reported: '신고됨'
} as const

export const INQUIRY_MESSAGE_TYPE = {
  text: '텍스트',
  image: '이미지',
  price_proposal: '가격제안',
  system: '시스템'
} as const

// 문의 생성용 인터페이스
export interface CreateInquiryData {
  itemId: string
  message: string
  messageType?: InquiryMessageType
  priceProposal?: {
    proposedPrice: number
    message?: string
  }
}

// 문의 메시지 생성용 인터페이스
export interface CreateInquiryMessageData {
  inquiryId: string
  type: InquiryMessageType
  content: string
  imageUrl?: string
  priceProposal?: {
    proposedPrice: number
    originalPrice: number
    message?: string
  }
}

// 문의 업데이트용 인터페이스
export interface UpdateInquiryData {
  status?: InquiryStatus
  reportReason?: string
}

// 문의 메시지 업데이트용 인터페이스
export interface UpdateInquiryMessageData {
  content?: string
  isRead?: boolean
}

// 문의 목록 응답
export interface InquiriesResponse {
  data: ItemInquiry[]
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 문의 메시지 목록 응답
export interface InquiryMessagesResponse {
  data: InquiryMessage[]
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 문의 검색 필터
export interface InquirySearchFilters {
  status?: InquiryStatus[]
  itemId?: string
  buyerId?: string
  sellerId?: string
  dateRange?: {
    from: Date
    to: Date
  }
  hasUnread?: boolean
  keyword?: string
  sortBy?: 'latest' | 'oldest' | 'unread_first'
}

// 스팸 방지 설정
export interface InquiryRateLimit {
  maxMessagesPerMinute: number
  maxMessagesPerHour: number
  newAccountLimitHours: number
  duplicateContentThreshold: number
}