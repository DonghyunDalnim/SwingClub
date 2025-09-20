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
    // 쿠키에서 인증 상태 확인
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth-token')
    const userDataCookie = cookieStore.get('user-data')

    if (!authToken || !userDataCookie) {
      return null
    }

    // 쿠키에서 사용자 데이터 파싱
    try {
      const userData = JSON.parse(userDataCookie.value)
      return userData
    } catch (parseError) {
      console.error('사용자 데이터 파싱 실패:', parseError)
      return null
    }
  } catch (error) {
    console.error('getCurrentUser 실패:', error)
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