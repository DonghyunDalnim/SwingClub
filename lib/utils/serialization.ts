/**
 * 직렬화 유틸리티 함수들
 * Next.js에서 서버 컴포넌트 → 클라이언트 컴포넌트로 데이터 전달 시 사용
 */

import type { Timestamp } from 'firebase/firestore'

/**
 * Firestore Timestamp를 ISO 8601 문자열로 변환
 */
export function serializeTimestamp(timestamp: Timestamp | Date | any): string {
  if (!timestamp) return new Date().toISOString()

  // Firestore Timestamp 객체 (seconds, nanoseconds)
  if (timestamp.seconds !== undefined) {
    return new Date(timestamp.seconds * 1000).toISOString()
  }

  // Date 객체
  if (timestamp instanceof Date) {
    return timestamp.toISOString()
  }

  // 이미 문자열인 경우
  if (typeof timestamp === 'string') {
    return timestamp
  }

  // 기본값
  return new Date().toISOString()
}

/**
 * 객체 내의 모든 Timestamp를 문자열로 변환
 */
export function serializeTimestamps<T extends Record<string, any>>(obj: T): T {
  const result: any = { ...obj }

  for (const key in result) {
    const value = result[key]

    // null/undefined 체크
    if (value === null || value === undefined) {
      continue
    }

    // Timestamp 객체 변환
    if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
      result[key] = serializeTimestamp(value)
    }

    // Date 객체 변환
    else if (value instanceof Date) {
      result[key] = value.toISOString()
    }

    // 중첩 객체 재귀 처리
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = serializeTimestamps(value)
    }

    // 배열 처리
    else if (Array.isArray(value)) {
      result[key] = value.map(item =>
        item && typeof item === 'object' ? serializeTimestamps(item) : item
      )
    }
  }

  return result
}

/**
 * Post 객체의 Timestamp 필드들을 직렬화
 */
export function serializePost<T extends Record<string, any>>(post: T): T {
  return serializeTimestamps(post)
}

/**
 * 여러 Post를 한번에 직렬화
 */
export function serializePosts<T extends Record<string, any>>(posts: T[]): T[] {
  return posts.map(post => serializePost(post))
}

/**
 * Comment 객체의 Timestamp 필드들을 직렬화
 */
export function serializeComment<T extends Record<string, any>>(comment: T): T {
  return serializeTimestamps(comment)
}

/**
 * 여러 Comment를 한번에 직렬화
 */
export function serializeComments<T extends Record<string, any>>(comments: T[]): T[] {
  return comments.map(comment => serializeComment(comment))
}
