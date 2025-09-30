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

// 문의 상태
export type InquiryStatus =
  | 'active'      // 활성 상태 (진행중)
  | 'completed'   // 거래 완료
  | 'cancelled'   // 취소됨
  | 'blocked'     // 차단됨

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

// 거래 문의 시스템

// 문의 메시지 인터페이스 (채팅 형태)
export interface InquiryMessage {
  id: string
  inquiryId: string
  senderId: string      // 메시지 보낸 사람 ID
  senderName: string    // 메시지 보낸 사람 이름 (비정규화)
  senderType: 'buyer' | 'seller' // 구매자 또는 판매자
  content: string       // 메시지 내용
  messageType: 'text' | 'system' | 'offer' // 메시지 타입
  offerPrice?: number   // 가격 제안 (offer 타입일 때)
  createdAt: Timestamp
  readAt?: Timestamp    // 읽음 시간
  editedAt?: Timestamp  // 수정 시간
  status: 'active' | 'deleted' | 'reported'
}

// 거래 문의 스레드 인터페이스
export interface ItemInquiry {
  id: string
  itemId: string
  itemTitle: string     // 상품 제목 (비정규화)
  itemPrice: number     // 상품 가격 (비정규화)
  itemStatus: ItemStatus // 상품 상태 (비정규화)
  sellerId: string
  sellerName: string    // 판매자 이름 (비정규화)
  buyerId: string
  buyerName: string     // 구매자 이름 (비정규화)

  // 문의 상태
  status: InquiryStatus

  // 통계
  messageCount: number
  lastMessageAt: Timestamp
  lastMessageContent: string // 마지막 메시지 미리보기
  lastMessageSender: 'buyer' | 'seller'

  // 메타데이터
  createdAt: Timestamp
  updatedAt: Timestamp

  // 읽음 상태
  buyerLastRead?: Timestamp
  sellerLastRead?: Timestamp

  // 거래 완료 정보
  completedAt?: Timestamp
  completedBy?: string   // 거래 완료 처리한 사람
  finalPrice?: number    // 최종 거래 가격

  // 신고 및 관리
  reported: boolean
  reportedBy?: string[]
  blockedBy?: string[]   // 차단한 사용자 목록
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

// 문의 상태 라벨
export const INQUIRY_STATUS_LABELS = {
  active: '진행중',
  completed: '거래완료',
  cancelled: '취소됨',
  blocked: '차단됨'
} as const

// 문의 관련 액션 인터페이스

// 문의 시작 데이터
export interface CreateInquiryData {
  itemId: string
  initialMessage: string
}

// 메시지 생성 데이터
export interface CreateMessageData {
  inquiryId: string
  content: string
  messageType?: 'text' | 'offer'
  offerPrice?: number
}

// 문의 업데이트 데이터
export interface UpdateInquiryData {
  status?: InquiryStatus
  finalPrice?: number
  completedBy?: string
}

// 문의 검색 필터
export interface InquirySearchFilters {
  status?: InquiryStatus[]
  userId?: string        // 특정 사용자의 문의만
  itemId?: string        // 특정 상품의 문의만
  userType?: 'buyer' | 'seller' // 구매자 또는 판매자 관점
  hasUnread?: boolean    // 읽지 않은 메시지가 있는 문의만
  dateRange?: {
    from: Date
    to: Date
  }
}

// 문의 목록 응답
export interface InquiryListResponse {
  inquiries: ItemInquiry[]
  total: number
  hasMore: boolean
  filters: InquirySearchFilters
}

// 메시지 목록 응답
export interface MessageListResponse {
  messages: InquiryMessage[]
  total: number
  hasMore: boolean
  inquiry: ItemInquiry
}