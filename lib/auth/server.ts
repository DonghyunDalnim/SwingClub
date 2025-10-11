/**
 * 서버 사이드 인증 유틸리티
 * Server Actions와 Server Components에서 사용
 */

import { cookies } from 'next/headers'
import { auth } from '@/lib/firebase'
import type { User } from 'firebase/auth'

// 서버에서 현재 사용자 정보 가져오기
export async function getCurrentUser(): Promise<User | null> {
  try {
    // 쿠키에서 인증 상태 확인 (firebase-token으로 변경)
    const cookieStore = await cookies()
    const authToken = cookieStore.get('firebase-token')  // 'auth-token' -> 'firebase-token'
    const userDataCookie = cookieStore.get('user-data')

    console.log('[Server] getCurrentUser - authToken exists:', !!authToken)
    console.log('[Server] getCurrentUser - userDataCookie exists:', !!userDataCookie)

    if (!authToken || !userDataCookie) {
      console.warn('[Server] Missing cookies - authToken:', !!authToken, 'userData:', !!userDataCookie)
      return null
    }

    // 쿠키에서 사용자 데이터 파싱 (decodeURIComponent 추가)
    try {
      const userData = JSON.parse(decodeURIComponent(userDataCookie.value))
      console.log('[Server] User data parsed successfully, uid:', userData.uid || userData.id)
      return userData
    } catch (parseError) {
      console.error('[Server] 사용자 데이터 파싱 실패:', parseError)
      console.error('[Server] Raw cookie value:', userDataCookie.value)
      return null
    }
  } catch (error) {
    console.error('[Server] getCurrentUser 실패:', error)
    return null
  }
}

// 서버에서 인증 상태 확인
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

// 서버에서 사용자 ID 가져오기
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.uid || null
}