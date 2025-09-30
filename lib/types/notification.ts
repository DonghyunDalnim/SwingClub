/**
 * 알림 시스템 관련 TypeScript 타입 정의
 * 커뮤니티 활동 알림을 위한 포괄적인 타입 시스템
 */

import type { Timestamp } from 'firebase/firestore'

// 알림 타입
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

// 알림 우선순위
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

// 알림 상태
export type NotificationStatus = 'unread' | 'read' | 'archived' | 'deleted'

// 메인 알림 인터페이스
export interface Notification {
  id: string
  recipientId: string
  type: NotificationType
  priority: NotificationPriority

  // 알림 내용
  title: string
  message: string
  summary?: string       // 짧은 요약 (푸시 알림용)

  // 관련 데이터
  relatedPostId?: string
  relatedCommentId?: string
  relatedUserId?: string
  relatedUserName?: string    // 비정규화된 사용자 이름
  relatedUserProfileUrl?: string

  // 상태
  status: NotificationStatus
  isRead: boolean
  readAt?: Timestamp

  // 메타데이터
  createdAt: Timestamp
  updatedAt: Timestamp
  expiresAt?: Timestamp  // 알림 만료 시간 (이벤트 등)

  // 액션 정보
  actionUrl?: string     // 클릭시 이동할 URL
  actionData?: Record<string, any>

  // 푸시 알림 관련
  isPushSent?: boolean
  pushSentAt?: Timestamp

  // 배치 처리용
  batchId?: string       // 같은 배치로 처리된 알림들
  groupKey?: string      // 그룹화용 키 (예: 같은 게시글의 여러 좋아요)
}

// 알림 생성 데이터
export interface CreateNotificationData {
  recipientId: string
  type: NotificationType
  title: string
  message: string
  summary?: string
  priority?: NotificationPriority
  relatedPostId?: string
  relatedCommentId?: string
  relatedUserId?: string
  relatedUserName?: string
  relatedUserProfileUrl?: string
  actionUrl?: string
  actionData?: Record<string, any>
  expiresAt?: Timestamp
  groupKey?: string
}

// 알림 업데이트 데이터
export interface UpdateNotificationData {
  status?: NotificationStatus
  isRead?: boolean
  readAt?: Timestamp
  actionData?: Record<string, any>
}

// 알림 검색 필터
export interface NotificationFilters {
  types?: NotificationType[]
  status?: NotificationStatus[]
  priority?: NotificationPriority[]
  isRead?: boolean
  dateRange?: {
    from: Date
    to: Date
  }
  relatedUserId?: string
  limit?: number
  offset?: number
}

// 알림 목록 응답
export interface NotificationListResponse {
  notifications: Notification[]
  unreadCount: number
  total: number
  hasMore: boolean
  filters: NotificationFilters
}

// 알림 카운터
export interface NotificationCounts {
  total: number
  unread: number
  byType: Record<NotificationType, number>
  byPriority: Record<NotificationPriority, number>
}

// 알림 설정
export interface NotificationSettings {
  userId: string

  // 알림 타입별 설정
  types: {
    [K in NotificationType]: {
      enabled: boolean
      pushEnabled: boolean
      emailEnabled?: boolean
    }
  }

  // 일반 설정
  doNotDisturbStart?: string  // HH:mm 형식
  doNotDisturbEnd?: string    // HH:mm 형식
  maxNotificationsPerDay?: number

  // 메타데이터
  updatedAt: Timestamp
}

// 배치 처리용 인터페이스
export interface NotificationBatch {
  id: string
  type: 'bulk_create' | 'bulk_update' | 'bulk_delete'
  notifications: CreateNotificationData[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: Timestamp
  processedAt?: Timestamp
  errorMessage?: string
}

// 실시간 구독용 인터페이스
export interface NotificationSubscription {
  userId: string
  isActive: boolean
  lastHeartbeat: Timestamp
  deviceInfo?: {
    platform: string
    userAgent: string
    fcmToken?: string  // Firebase Cloud Messaging 토큰
  }
}

// 알림 이벤트 (실시간 전송용)
export interface NotificationEvent {
  type: 'new' | 'read' | 'deleted' | 'count_updated'
  notification?: Notification
  counts?: NotificationCounts
  timestamp: Timestamp
}

// 상수 정의
export const NOTIFICATION_TYPE_LABELS = {
  post_like: '게시글 좋아요',
  comment_like: '댓글 좋아요',
  new_comment: '새 댓글',
  comment_reply: '댓글 답글',
  post_mention: '게시글 멘션',
  comment_mention: '댓글 멘션',
  event_reminder: '이벤트 알림',
  marketplace_inquiry: '거래 문의',
  report_status: '신고 처리 결과'
} as const

export const NOTIFICATION_PRIORITY_LABELS = {
  low: '낮음',
  normal: '보통',
  high: '높음',
  urgent: '긴급'
} as const

export const NOTIFICATION_STATUS_LABELS = {
  unread: '읽지 않음',
  read: '읽음',
  archived: '보관함',
  deleted: '삭제됨'
} as const

// 기본 알림 설정
export const DEFAULT_NOTIFICATION_SETTINGS: Omit<NotificationSettings, 'userId' | 'updatedAt'> = {
  types: {
    post_like: { enabled: true, pushEnabled: true },
    comment_like: { enabled: true, pushEnabled: true },
    new_comment: { enabled: true, pushEnabled: true },
    comment_reply: { enabled: true, pushEnabled: true },
    post_mention: { enabled: true, pushEnabled: true },
    comment_mention: { enabled: true, pushEnabled: true },
    event_reminder: { enabled: true, pushEnabled: true },
    marketplace_inquiry: { enabled: true, pushEnabled: true },
    report_status: { enabled: true, pushEnabled: false }
  },
  maxNotificationsPerDay: 50
}

// 유틸리티 타입
export type NotificationDocument = Omit<Notification, 'id'>
export type NotificationSettingsDocument = Omit<NotificationSettings, 'userId'>
export type NotificationBatchDocument = Omit<NotificationBatch, 'id'>