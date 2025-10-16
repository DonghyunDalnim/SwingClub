/**
 * 날짜 관련 유틸리티 함수들
 */

import type { Timestamp } from 'firebase/firestore'

/**
 * Timestamp, 문자열, Date 객체를 Date 객체로 변환
 */
export function toDate(timestamp: Timestamp | string | Date | any): Date {
  // Timestamp 객체인 경우 (Firestore에서 직접 가져온 경우)
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return timestamp.toDate()
  }

  // ISO 문자열인 경우 (직렬화된 데이터)
  if (typeof timestamp === 'string') {
    return new Date(timestamp)
  }

  // Date 객체인 경우
  if (timestamp instanceof Date) {
    return timestamp
  }

  // Firestore Timestamp 형식 ({seconds, nanoseconds})인 경우
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Date(timestamp.seconds * 1000)
  }

  // 기본값 (잘못된 값인 경우)
  return new Date()
}

/**
 * 한국어 포맷으로 날짜/시간 표시
 */
export function formatDateTime(timestamp: Timestamp | string | Date | any): string {
  const date = toDate(timestamp)
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

/**
 * 한국어 포맷으로 날짜만 표시
 */
export function formatDate(timestamp: Timestamp | string | Date | any): string {
  const date = toDate(timestamp)
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

/**
 * 상대 시간 표시 (예: "3분 전", "2시간 전")
 */
export function formatRelativeTime(timestamp: Timestamp | string | Date | any): string {
  const date = toDate(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) {
    return '방금 전'
  } else if (diffMins < 60) {
    return `${diffMins}분 전`
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`
  } else if (diffDays < 7) {
    return `${diffDays}일 전`
  } else {
    return formatDate(timestamp)
  }
}

/**
 * 시간만 표시 (예: "오후 3:30")
 */
export function formatTime(timestamp: Timestamp | string | Date | any): string {
  const date = toDate(timestamp)
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
