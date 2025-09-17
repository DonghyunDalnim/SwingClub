/**
 * 스튜디오/모임 장소 관련 TypeScript 타입 정의
 */

import type { GeoPoint, Timestamp } from 'firebase/firestore'
import type { KakaoLatLng } from './kakao-map'

// 스튜디오 카테고리
export type StudioCategory = 'studio' | 'practice_room' | 'club' | 'public_space' | 'cafe'

// 운영 상태
export type OperationStatus = 'active' | 'temporarily_closed' | 'permanently_closed'

// 가격 타입
export interface StudioPricing {
  hourly?: number        // 시간당 가격
  daily?: number         // 일일 대여료
  monthly?: number       // 월 정기 이용료
  dropIn?: number        // 드롭인 수업료
  currency: 'KRW'        // 통화 (한국원화)
  notes?: string         // 가격 관련 추가 정보
}

// 운영시간
export interface OperatingHours {
  monday?: string        // 예: "09:00-22:00" 또는 "closed"
  tuesday?: string
  wednesday?: string
  thursday?: string
  friday?: string
  saturday?: string
  sunday?: string
  holidays?: string      // 공휴일 운영시간
  notes?: string         // 운영시간 관련 추가 정보
}

// 시설 정보
export interface StudioFacilities {
  area?: number          // 면적 (평방미터)
  capacity?: number      // 수용 인원
  floorType?: string     // 바닥재 ("원목", "리놀륨", "타일" 등)
  soundSystem?: boolean  // 음향 시설
  airConditioning?: boolean  // 에어컨
  parking?: boolean      // 주차 가능
  wifi?: boolean         // WiFi 제공
  shower?: boolean       // 샤워 시설
  lockers?: boolean      // 사물함
  equipment?: string[]   // 추가 장비 목록
  amenities?: string[]   // 편의시설 목록
}

// 연락처 정보
export interface StudioContact {
  phone?: string
  email?: string
  website?: string
  kakaoTalk?: string     // 카카오톡 채널
  instagram?: string
  booking?: string       // 예약 방법/링크
}

// 위치 정보
export interface StudioLocation {
  geopoint: GeoPoint     // Firestore GeoPoint
  address: string        // 전체 주소
  addressDetail?: string // 상세 주소 (층수, 호수 등)
  region: string         // 지역 ("강남구", "홍대", "신촌" 등)
  district?: string      // 시/구 ("서울특별시 강남구")
  subway?: string[]      // 가까운 지하철역
  landmarks?: string[]   // 주변 랜드마크
}

// 통계 정보
export interface StudioStats {
  views: number          // 조회수
  favorites: number      // 즐겨찾기 수
  avgRating: number      // 평균 평점 (0-5)
  reviewCount: number    // 리뷰 개수
  lastActivity?: Timestamp // 마지막 활동 일시
}

// 메타데이터
export interface StudioMetadata {
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string      // 생성한 사용자 ID
  verified: boolean      // 검증된 스튜디오 여부
  featured: boolean      // 추천 스튜디오 여부
  status: OperationStatus
  tags?: string[]        // 검색용 태그
  keywords?: string[]    // 검색 최적화용 키워드
}

// 메인 스튜디오 인터페이스
export interface Studio {
  id: string
  name: string
  description?: string
  category: StudioCategory
  location: StudioLocation
  contact?: StudioContact
  facilities?: StudioFacilities
  pricing?: StudioPricing
  operatingHours?: OperatingHours
  stats: StudioStats
  metadata: StudioMetadata
  images?: string[]      // 이미지 URL 배열 (Firebase Storage)
}

// 스튜디오 생성용 인터페이스 (ID와 메타데이터 제외)
export interface CreateStudioData {
  name: string
  description?: string
  category: StudioCategory
  location: Omit<StudioLocation, 'geopoint'> & { coordinates: KakaoLatLng }
  contact?: StudioContact
  facilities?: StudioFacilities
  pricing?: StudioPricing
  operatingHours?: OperatingHours
  images?: string[]
  tags?: string[]
  keywords?: string[]
}

// 스튜디오 업데이트용 인터페이스
export interface UpdateStudioData extends Partial<CreateStudioData> {
  status?: OperationStatus
  verified?: boolean
  featured?: boolean
}

// 스튜디오 검색 필터
export interface StudioSearchFilters {
  category?: StudioCategory[]
  region?: string[]
  hasParking?: boolean
  hasSoundSystem?: boolean
  hasAirConditioning?: boolean
  minArea?: number
  maxArea?: number
  priceRange?: {
    min?: number
    max?: number
    type: 'hourly' | 'daily' | 'monthly'
  }
  coordinates?: KakaoLatLng
  radius?: number        // 검색 반경 (km)
}

// 스튜디오 검색 결과
export interface StudioSearchResult {
  studios: Studio[]
  total: number
  hasMore: boolean
  filters: StudioSearchFilters
}

// 지리적 검색용 인터페이스
export interface GeographicSearch {
  center: KakaoLatLng
  radius: number        // km 단위
  limit?: number
  category?: StudioCategory
}

// 스튜디오 목록 응답
export interface StudiosResponse {
  data: Studio[]
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 에러 타입
export interface StudioError {
  code: string
  message: string
  field?: string
}

// 상수 정의
export const STUDIO_CATEGORIES = {
  studio: '댄스 스튜디오',
  practice_room: '연습실',
  club: '클럽/바',
  public_space: '공공장소',
  cafe: '카페'
} as const

export const OPERATION_STATUS = {
  active: '운영 중',
  temporarily_closed: '임시 휴업',
  permanently_closed: '영구 폐업'
} as const

// 검증 함수 타입
export type ValidateStudioData = (data: CreateStudioData) => StudioError[]