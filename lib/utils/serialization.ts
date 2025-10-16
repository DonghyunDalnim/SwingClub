/**
 * 직렬화 유틸리티 함수들
 * Next.js RSC 프로토콜에서 서버 컴포넌트 → 클라이언트 컴포넌트로 데이터 전달 시 사용
 *
 * Firestore Timestamp 객체는 toJSON() 메서드를 가지고 있어 RSC 직렬화에서
 * "Objects with toJSON methods are not supported" 에러를 발생시킵니다.
 * 이 유틸리티는 Timestamp를 ISO 8601 문자열로 변환하여 문제를 해결합니다.
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
 * Firestore Timestamp 감지 함수
 */
function isFirestoreTimestamp(value: any): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    'seconds' in value &&
    'nanoseconds' in value &&
    typeof value.seconds === 'number' &&
    typeof value.nanoseconds === 'number'
  )
}

/**
 * 객체 내의 모든 Timestamp를 문자열로 변환 (깊은 복사)
 * RSC 프로토콜 직렬화를 위해 완전히 새로운 객체 생성
 */
export function serializeTimestamps<T extends Record<string, any>>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj
  }

  // Firestore Timestamp 객체 감지 및 변환
  if (isFirestoreTimestamp(obj)) {
    return serializeTimestamp(obj) as any
  }

  // Date 객체 변환
  if (obj instanceof Date) {
    return obj.toISOString() as any
  }

  // 배열 처리 (깊은 복사)
  if (Array.isArray(obj)) {
    return obj.map(item => serializeTimestamps(item)) as any
  }

  // 일반 객체 처리 (깊은 복사)
  if (typeof obj === 'object') {
    const result: any = {}

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key]

        // null/undefined는 그대로 유지
        if (value === null || value === undefined) {
          result[key] = value
        }
        // Timestamp 변환
        else if (isFirestoreTimestamp(value)) {
          result[key] = serializeTimestamp(value)
        }
        // Date 변환
        else if (value instanceof Date) {
          result[key] = value.toISOString()
        }
        // 중첩 객체/배열 재귀 처리
        else if (typeof value === 'object') {
          result[key] = serializeTimestamps(value)
        }
        // 원시 타입은 그대로 복사
        else {
          result[key] = value
        }
      }
    }

    return result
  }

  // 원시 타입은 그대로 반환
  return obj
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
