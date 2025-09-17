# Firestore 데이터베이스 스키마 문서

## 개요

이 문서는 SwingClub 애플리케이션의 Firestore 데이터베이스 스키마를 설명합니다. 스윙댄스 커뮤니티의 스튜디오/모임 장소 정보를 효율적으로 저장하고 검색할 수 있도록 설계되었습니다.

## 컬렉션 구조

### 1. `studios` 컬렉션

스윙댄스 스튜디오 및 모임 장소 정보를 저장하는 메인 컬렉션입니다.

#### 문서 구조

```typescript
{
  id: string (auto-generated)
  name: string                    // 스튜디오 이름 (필수)
  description?: string            // 상세 설명
  category: StudioCategory        // 카테고리 (필수)

  // 위치 정보 (필수)
  location: {
    geopoint: GeoPoint           // Firestore GeoPoint (필수)
    address: string              // 전체 주소 (필수)
    addressDetail?: string       // 상세 주소
    region: string               // 지역명 (필수)
    district?: string            // 시/구
    subway?: string[]            // 가까운 지하철역
    landmarks?: string[]         // 주변 랜드마크
  }

  // 연락처 정보
  contact?: {
    phone?: string
    email?: string
    website?: string
    kakaoTalk?: string
    instagram?: string
    booking?: string
  }

  // 시설 정보
  facilities?: {
    area?: number                // 면적 (㎡)
    capacity?: number            // 수용 인원
    floorType?: string           // 바닥재
    soundSystem?: boolean        // 음향 시설
    airConditioning?: boolean    // 에어컨
    parking?: boolean            // 주차장
    wifi?: boolean               // WiFi
    shower?: boolean             // 샤워 시설
    lockers?: boolean            // 사물함
    equipment?: string[]         // 장비 목록
    amenities?: string[]         // 편의시설
  }

  // 가격 정보
  pricing?: {
    hourly?: number              // 시간당 가격
    daily?: number               // 일일 대여료
    monthly?: number             // 월 정기 이용료
    dropIn?: number              // 드롭인 수업료
    currency: "KRW"              // 통화
    notes?: string               // 가격 관련 메모
  }

  // 운영시간
  operatingHours?: {
    monday?: string              // "09:00-22:00" 또는 "closed"
    tuesday?: string
    wednesday?: string
    thursday?: string
    friday?: string
    saturday?: string
    sunday?: string
    holidays?: string
    notes?: string
  }

  // 통계 정보 (필수)
  stats: {
    views: number                // 조회수
    favorites: number            // 즐겨찾기 수
    avgRating: number            // 평균 평점 (0-5)
    reviewCount: number          // 리뷰 개수
    lastActivity?: Timestamp     // 마지막 활동
  }

  // 메타데이터 (필수)
  metadata: {
    createdAt: Timestamp         // 생성일시
    updatedAt: Timestamp         // 수정일시
    createdBy: string            // 생성자 ID
    verified: boolean            // 검증 여부
    featured: boolean            // 추천 여부
    status: OperationStatus      // 운영 상태
    tags?: string[]              // 태그
    keywords?: string[]          // 검색 키워드
  }

  images?: string[]              // 이미지 URL 배열
}
```

#### 인덱스 전략

**단일 필드 인덱스:**
- `category` (ASC/DESC)
- `location.region` (ASC/DESC)
- `metadata.status` (ASC/DESC)
- `metadata.verified` (ASC/DESC)
- `metadata.featured` (ASC/DESC)
- `metadata.createdAt` (ASC/DESC)
- `metadata.updatedAt` (ASC/DESC)
- `stats.avgRating` (ASC/DESC)

**복합 인덱스:**
- `metadata.status` + `category` + `metadata.updatedAt`
- `metadata.status` + `location.region` + `metadata.updatedAt`
- `metadata.status` + `metadata.featured` + `metadata.updatedAt`
- `metadata.status` + `stats.avgRating` + `metadata.updatedAt`

**지리적 인덱스:**
- `location.geopoint` (자동 생성)

### 2. `studios/{studioId}/reviews` 서브컬렉션 (향후 확장)

스튜디오별 리뷰 정보를 저장합니다.

```typescript
{
  id: string (auto-generated)
  userId: string                 // 리뷰 작성자 ID
  studioId: string               // 스튜디오 ID
  rating: number                 // 평점 (1-5)
  comment: string                // 리뷰 내용
  createdAt: Timestamp           // 작성일시
  updatedAt?: Timestamp          // 수정일시
  helpful?: number               // 도움 수
  reported?: boolean             // 신고 여부
}
```

### 3. `studios/{studioId}/images` 서브컬렉션 (향후 확장)

스튜디오별 이미지 메타데이터를 저장합니다.

```typescript
{
  id: string (auto-generated)
  url: string                    // Firebase Storage URL
  thumbnail?: string             // 썸네일 URL
  caption?: string               // 이미지 설명
  order: number                  // 표시 순서
  uploadedBy: string             // 업로드한 사용자 ID
  uploadedAt: Timestamp          // 업로드 일시
  type: "interior" | "exterior" | "equipment" | "event"
}
```

### 4. `users/{userId}/favorites` 서브컬렉션 (향후 확장)

사용자별 즐겨찾기 스튜디오 목록을 저장합니다.

```typescript
{
  studioId: string               // 문서 ID로 사용
  addedAt: Timestamp             // 즐겨찾기 추가일시
  notes?: string                 // 개인 메모
}
```

## 쿼리 패턴

### 1. 기본 조회

```typescript
// 활성 상태 스튜디오 목록
const activeStudios = query(
  collection(db, 'studios'),
  where('metadata.status', '==', 'active'),
  orderBy('metadata.updatedAt', 'desc'),
  limit(20)
)

// 카테고리별 조회
const studiosByCategory = query(
  collection(db, 'studios'),
  where('metadata.status', '==', 'active'),
  where('category', '==', 'studio'),
  orderBy('metadata.updatedAt', 'desc')
)
```

### 2. 지리적 검색

```typescript
// 경계 박스 내 스튜디오 검색
const studiosInBounds = query(
  collection(db, 'studios'),
  where('metadata.status', '==', 'active'),
  where('location.geopoint', '>=', southwestPoint),
  where('location.geopoint', '<=', northeastPoint)
)
```

### 3. 정렬 및 필터링

```typescript
// 평점순 정렬
const topRatedStudios = query(
  collection(db, 'studios'),
  where('metadata.status', '==', 'active'),
  orderBy('stats.avgRating', 'desc'),
  limit(10)
)

// 추천 스튜디오
const featuredStudios = query(
  collection(db, 'studios'),
  where('metadata.status', '==', 'active'),
  where('metadata.featured', '==', true),
  orderBy('metadata.updatedAt', 'desc')
)
```

## 검색 최적화

### 1. 텍스트 검색

Firestore의 제한된 텍스트 검색 능력을 보완하기 위해 다음과 같은 전략을 사용합니다:

- **키워드 배열**: `metadata.keywords` 필드에 검색 가능한 키워드 저장
- **클라이언트 필터링**: 기본 쿼리 후 클라이언트에서 텍스트 매칭
- **대소문자 무시**: 모든 키워드를 소문자로 저장

### 2. 지리적 검색 최적화

- **경계 박스**: 원형 검색을 사각형 경계 박스로 근사
- **클라이언트 거리 계산**: 정확한 거리는 클라이언트에서 계산
- **지역 기반 필터**: `location.region` 필드를 활용한 1차 필터링

### 3. 캐싱 전략

- **인기 검색**: 자주 검색되는 지역/카테고리 결과 캐싱
- **메타데이터 캐싱**: 스튜디오 기본 정보 캐싱
- **이미지 캐싱**: Firebase Storage CDN 활용

## 보안 규칙

### 권한 구조

- **읽기**: 모든 사용자가 활성 스튜디오 조회 가능
- **생성**: 인증된 사용자만 스튜디오 생성 가능
- **수정**: 스튜디오 소유자 또는 관리자만 수정 가능
- **삭제**: 스튜디오 소유자 또는 관리자만 삭제 가능

### 데이터 유효성 검증

- **필수 필드**: name, category, location, metadata 검증
- **데이터 타입**: 각 필드의 타입 및 형식 검증
- **비즈니스 규칙**: 평점 범위(1-5), 카테고리 제한 등

## 확장성 고려사항

### 1. 스케일링

- **분산 카운터**: 조회수, 즐겨찾기 수의 고빈도 업데이트 대응
- **배치 연산**: 대량 데이터 처리를 위한 배치 작업
- **데이터 아카이빙**: 오래된 데이터의 별도 저장소 이전

### 2. 성능 최적화

- **페이지네이션**: 커서 기반 페이지네이션 구현
- **인덱스 최적화**: 쿼리 패턴에 맞는 복합 인덱스 설계
- **캐시 레이어**: Redis 등을 활용한 캐시 레이어 추가

### 3. 기능 확장

- **리뷰 시스템**: 평점 및 리뷰 서브컬렉션
- **이벤트 관리**: 스튜디오별 이벤트 정보
- **예약 시스템**: 실시간 예약 관리
- **결제 연동**: 온라인 결제 시스템 통합

## 마이그레이션 가이드

### 초기 설정

1. **Firestore 규칙 배포**:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **인덱스 생성**:
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. **시드 데이터 생성**:
   ```typescript
   import { seedStudios } from '@/lib/data/studios-seed'
   await seedStudios('admin-user-id')
   ```

### 데이터 마이그레이션

기존 데이터가 있는 경우 다음 단계를 따릅니다:

1. **스키마 검증**: 기존 데이터 구조 확인
2. **변환 스크립트**: 새 스키마로 데이터 변환
3. **단계적 마이그레이션**: 서비스 중단 최소화
4. **검증 및 롤백**: 마이그레이션 결과 확인

## 모니터링 및 유지보수

### 성능 모니터링

- **Firebase Console**: 읽기/쓰기 성능 모니터링
- **쿼리 분석**: 느린 쿼리 식별 및 최적화
- **인덱스 사용률**: 불필요한 인덱스 정리

### 데이터 품질

- **정합성 검사**: 주기적인 데이터 정합성 확인
- **중복 제거**: 중복 데이터 식별 및 정리
- **유효성 검증**: 좌표, 연락처 등 데이터 유효성 확인

### 백업 및 복구

- **자동 백업**: Firebase 자동 백업 설정
- **데이터 내보내기**: 정기적인 데이터 내보내기
- **재해 복구**: 데이터 손실 시 복구 절차

---

**문서 버전**: 1.0
**최종 수정**: 2024년 9월 17일
**작성자**: SwingClub 개발팀