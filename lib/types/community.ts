/**
 * 커뮤니티 게시판 관련 TypeScript 타입 정의
 */

import type { Timestamp, GeoPoint } from 'firebase/firestore'
import type { User } from './auth'

// 게시글 카테고리
export type PostCategory =
  | 'general'      // 자유게시판
  | 'qna'          // 질문답변
  | 'event'        // 이벤트/공지
  | 'marketplace'  // 중고거래
  | 'lesson'       // 레슨정보
  | 'review'       // 리뷰

// 게시글 상태
export type PostStatus = 'active' | 'hidden' | 'deleted' | 'reported'

// 중고거래 상태
export type MarketplaceStatus = 'selling' | 'reserved' | 'sold' | 'hidden'

// 이벤트 상태
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

// 게시글 공개 범위
export type PostVisibility = 'public' | 'members_only' | 'region_only'

// 첨부파일 타입
export interface Attachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  uploadedAt: Timestamp
}

// 위치 정보 (이벤트, 거래 등에 사용)
export interface PostLocation {
  geopoint?: GeoPoint
  address?: string
  region: string         // 지역 필터링용
  details?: string       // 상세 장소 설명
}

// 가격 정보 (중고거래용)
export interface MarketplacePrice {
  amount: number
  currency: 'KRW'
  negotiable: boolean    // 가격 협상 가능 여부
  originalPrice?: number // 정가
}

// 이벤트 정보
export interface EventInfo {
  startDate: Timestamp
  endDate?: Timestamp
  location?: PostLocation
  capacity?: number      // 참가 인원 제한
  currentParticipants: number
  requiresRegistration: boolean
  registrationDeadline?: Timestamp
  fee?: MarketplacePrice
  organizer: string      // 주최자 사용자 ID
}

// 중고거래 정보
export interface MarketplaceInfo {
  price: MarketplacePrice
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  brand?: string
  purchaseDate?: Timestamp
  location?: PostLocation
  deliveryMethod: ('pickup' | 'delivery' | 'meetup')[]
  status: MarketplaceStatus
}

// 게시글 통계
export interface PostStats {
  views: number
  likes: number
  comments: number
  shares: number
  reports: number
  lastActivity: Timestamp
}

// 게시글 메타데이터
export interface PostMetadata {
  createdAt: Timestamp
  updatedAt: Timestamp
  authorId: string       // 작성자 ID
  authorName: string     // 작성자 닉네임 (비정규화)
  authorProfileUrl?: string // 작성자 프로필 이미지
  ipAddress?: string     // 신고/관리용
  userAgent?: string     // 신고/관리용
  isPinned?: boolean     // 고정글 여부
  editHistory?: {
    editedAt: Timestamp
    reason?: string
  }[]
}

// 메인 게시글 인터페이스
export interface Post {
  id: string
  title: string
  content: string
  category: PostCategory
  status: PostStatus
  visibility: PostVisibility

  // 선택적 정보 (카테고리별)
  eventInfo?: EventInfo
  marketplaceInfo?: MarketplaceInfo
  location?: PostLocation

  // 첨부파일
  attachments?: Attachment[]
  images?: string[]      // 이미지 URL 배열

  // 태그 및 검색
  tags?: string[]
  keywords?: string[]    // 검색 최적화용

  // 통계 및 메타데이터
  stats: PostStats
  metadata: PostMetadata

  // 고정글, 추천글 등
  isPinned: boolean
  isFeatured: boolean

  // 지역 필터링
  region?: string
}

// 댓글 인터페이스
export interface Comment {
  id: string
  postId: string
  content: string

  // 계층 구조 (대댓글)
  parentId?: string      // 부모 댓글 ID
  depth: number          // 댓글 깊이 (0: 원댓글, 1: 대댓글)
  rootId?: string        // 최상위 댓글 ID

  // 작성자 정보
  authorId: string
  authorName: string     // 비정규화
  authorProfileUrl?: string

  // 상태
  status: 'active' | 'hidden' | 'deleted' | 'reported'

  // 통계
  likes: number
  reports: number

  // 메타데이터
  createdAt: Timestamp
  updatedAt: Timestamp
  ipAddress?: string

  // 수정 기록
  editHistory?: {
    editedAt: Timestamp
    previousContent?: string
  }[]
}

// 좋아요 인터페이스
export interface Like {
  id: string
  targetType: 'post' | 'comment'
  targetId: string       // 게시글 또는 댓글 ID
  userId: string
  createdAt: Timestamp
}

// 신고 인터페이스
export interface Report {
  id: string
  targetType: 'post' | 'comment' | 'user'
  targetId: string
  reporterId: string
  reason: ReportReason
  description?: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reviewedBy?: string    // 관리자 ID
  reviewedAt?: Timestamp
  createdAt: Timestamp
}

export type ReportReason =
  | 'spam'
  | 'inappropriate_content'
  | 'harassment'
  | 'false_information'
  | 'copyright_violation'
  | 'other'

// 커뮤니티 알림 인터페이스
export interface CommunityNotification {
  id: string
  recipientId: string
  type: NotificationType

  // 알림 내용
  title: string
  message: string

  // 관련 데이터
  relatedPostId?: string
  relatedCommentId?: string
  relatedUserId?: string

  // 상태
  isRead: boolean
  createdAt: Timestamp

  // 액션 정보
  actionUrl?: string     // 클릭시 이동할 URL
  actionData?: Record<string, any>
}

export type NotificationType =
  | 'post_like'          // 게시글 좋아요
  | 'comment_like'       // 댓글 좋아요
  | 'new_comment'        // 새 댓글
  | 'comment_reply'      // 댓글 답글
  | 'post_mention'       // 게시글에서 멘션
  | 'comment_mention'    // 댓글에서 멘션
  | 'event_reminder'     // 이벤트 알림
  | 'marketplace_inquiry'// 중고거래 문의
  | 'report_status'      // 신고 처리 결과

// 생성용 인터페이스들
export interface CreatePostData {
  title: string
  content: string
  category: PostCategory
  visibility?: PostVisibility
  eventInfo?: Omit<EventInfo, 'currentParticipants'>
  marketplaceInfo?: Omit<MarketplaceInfo, 'status'>
  location?: PostLocation
  attachments?: Omit<Attachment, 'id' | 'uploadedAt'>[]
  images?: string[]
  tags?: string[]
  keywords?: string[]
  isPinned?: boolean
  isFeatured?: boolean
  region?: string
}

export interface CreateCommentData {
  postId: string
  content: string
  parentId?: string
}

export interface UpdatePostData extends Partial<CreatePostData> {
  status?: PostStatus
}

export interface UpdateCommentData {
  content?: string
  status?: 'active' | 'hidden' | 'deleted'
}

// 검색 및 필터링
export interface PostSearchFilters {
  category?: PostCategory | PostCategory[]
  region?: string[]
  author?: string
  keyword?: string
  tags?: string[]
  dateRange?: {
    from: Date
    to: Date
  }
  hasImages?: boolean
  hasAttachments?: boolean
  status?: PostStatus[]
  visibility?: PostVisibility[]
  sortBy?: 'latest' | 'popular' | 'views'
  limit?: number
}

export interface PostSearchResult {
  posts: Post[]
  total: number
  hasMore: boolean
  filters: PostSearchFilters
  page: number
  limit: number
}

// 통계 및 분석용
export interface CommunityStats {
  totalPosts: number
  totalComments: number
  totalUsers: number
  postsToday: number
  commentsToday: number
  topCategories: {
    category: PostCategory
    count: number
  }[]
  activeUsers: number
  timestamp: Timestamp
}

// 상수 정의
export const POST_CATEGORIES = {
  general: '자유게시판',
  qna: '질문답변',
  event: '이벤트/공지',
  marketplace: '중고거래',
  lesson: '레슨정보',
  review: '리뷰'
} as const

export const POST_STATUS_LABELS = {
  active: '활성',
  hidden: '숨김',
  deleted: '삭제됨',
  reported: '신고됨'
} as const

export const MARKETPLACE_STATUS_LABELS = {
  selling: '판매중',
  reserved: '예약중',
  sold: '판매완료',
  hidden: '숨김'
} as const

export const EVENT_STATUS_LABELS = {
  upcoming: '예정',
  ongoing: '진행중',
  completed: '완료',
  cancelled: '취소'
} as const

export const REPORT_REASON_LABELS = {
  spam: '스팸',
  inappropriate_content: '부적절한 내용',
  harassment: '괴롭힘',
  false_information: '거짓 정보',
  copyright_violation: '저작권 침해',
  other: '기타'
} as const

// 검증 함수 타입
export type ValidatePostData = (data: CreatePostData) => string[]
export type ValidateCommentData = (data: CreateCommentData) => string[]

// Firestore 컨버터용 타입
export interface PostDocument extends Omit<Post, 'id'> {}
export interface CommentDocument extends Omit<Comment, 'id'> {}
export interface LikeDocument extends Omit<Like, 'id'> {}
export interface ReportDocument extends Omit<Report, 'id'> {}
export interface NotificationDocument extends Omit<CommunityNotification, 'id'> {}