/**
 * 프로필 관련 Server Actions
 * Next.js 15 App Router Server Actions 패턴 사용
 */

'use server'

import { revalidatePath } from 'next/cache'
import {
  doc,
  getDoc,
  updateDoc,
  runTransaction,
  query,
  collection,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/auth/server'
import type { UserProfile } from '@/lib/types/auth'
import {
  validateProfileData,
  validateSocialLinks,
  validateProfileImageUrl,
  type ValidationResult
} from '@/lib/validators/profile'

export interface UpdateProfileResult {
  success: boolean
  error?: string
  field?: string
}

/**
 * 닉네임 중복 검사 (Firestore 쿼리)
 */
async function checkNicknameDuplicate(
  nickname: string,
  currentUserId: string
): Promise<boolean> {
  try {
    const usersRef = collection(db, 'users')
    const nicknameQuery = query(
      usersRef,
      where('profile.nickname', '==', nickname)
    )
    const snapshot = await getDocs(nicknameQuery)

    // 다른 사용자가 동일한 닉네임을 사용하고 있는지 확인
    for (const doc of snapshot.docs) {
      if (doc.id !== currentUserId) {
        return true // 중복됨
      }
    }

    return false // 중복되지 않음
  } catch (error) {
    console.error('닉네임 중복 검사 오류:', error)
    throw new Error('닉네임 중복 검사 중 오류가 발생했습니다.')
  }
}

/**
 * 프로필 업데이트 Server Action
 * Transaction을 사용하여 데이터 일관성 보장
 */
export async function updateProfileAction(
  profileData: Partial<UserProfile> & { photoURL?: string | null }
): Promise<UpdateProfileResult> {
  try {
    // 1. 현재 사용자 확인
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: '로그인이 필요합니다.'
      }
    }

    // 2. 유효성 검증
    const { photoURL, ...profile } = profileData

    // 프로필 데이터 검증
    const profileValidation = validateProfileData(profile)
    if (!profileValidation.valid) {
      return {
        success: false,
        error: profileValidation.error,
        field: profileValidation.field
      }
    }

    // 소셜 링크 검증
    if (profile.socialLinks !== undefined) {
      const socialLinksValidation = validateSocialLinks(profile.socialLinks)
      if (!socialLinksValidation.valid) {
        return {
          success: false,
          error: socialLinksValidation.error,
          field: socialLinksValidation.field
        }
      }
    }

    // 프로필 이미지 URL 검증
    if (photoURL !== undefined) {
      const photoURLValidation = validateProfileImageUrl(photoURL)
      if (!photoURLValidation.valid) {
        return {
          success: false,
          error: photoURLValidation.error,
          field: photoURLValidation.field
        }
      }
    }

    // 3. Transaction으로 닉네임 중복 검사 및 업데이트 원자적 처리
    const userRef = doc(db, 'users', user.uid)

    await runTransaction(db, async (transaction) => {
      // 사용자 문서 존재 확인
      const userDoc = await transaction.get(userRef)
      if (!userDoc.exists()) {
        throw new Error('사용자 정보를 찾을 수 없습니다.')
      }

      const currentData = userDoc.data()
      const currentNickname = currentData.profile?.nickname

      // 닉네임이 변경되는 경우 중복 검사
      if (profile.nickname && profile.nickname !== currentNickname) {
        const isDuplicate = await checkNicknameDuplicate(profile.nickname, user.uid)
        if (isDuplicate) {
          throw new Error('이미 사용 중인 닉네임입니다.')
        }
      }

      // 업데이트할 데이터 구성
      const updateData: Record<string, any> = {
        updatedAt: serverTimestamp()
      }

      // 프로필 필드 업데이트
      if (Object.keys(profile).length > 0) {
        // 기존 프로필과 병합
        updateData.profile = {
          ...currentData.profile,
          ...profile
        }
      }

      // 프로필 이미지 URL 업데이트 (최상위 필드)
      if (photoURL !== undefined) {
        updateData.photoURL = photoURL
      }

      // Transaction으로 업데이트
      transaction.update(userRef, updateData)
    })

    // 4. 관련 페이지 재검증
    revalidatePath('/profile')
    revalidatePath(`/profile/${user.uid}`)

    return { success: true }
  } catch (error: any) {
    console.error('프로필 업데이트 오류:', error)

    // 에러 메시지 처리
    if (error.message === '이미 사용 중인 닉네임입니다.') {
      return {
        success: false,
        error: error.message,
        field: 'nickname'
      }
    }

    if (error.message === '사용자 정보를 찾을 수 없습니다.') {
      return {
        success: false,
        error: error.message
      }
    }

    // Firestore 에러 코드 처리
    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: '프로필을 수정할 권한이 없습니다.'
      }
    }

    if (error.code === 'unavailable') {
      return {
        success: false,
        error: '네트워크 연결을 확인해주세요.'
      }
    }

    return {
      success: false,
      error: '프로필 업데이트 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 프로필 조회 Server Action
 */
export async function getProfileAction(userId?: string): Promise<{
  success: boolean
  profile?: UserProfile & { photoURL?: string | null }
  error?: string
}> {
  try {
    // userId가 없으면 현재 사용자 프로필 조회
    let targetUserId = userId
    if (!targetUserId) {
      const user = await getCurrentUser()
      if (!user) {
        return {
          success: false,
          error: '로그인이 필요합니다.'
        }
      }
      targetUserId = user.uid
    }

    const userRef = doc(db, 'users', targetUserId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return {
        success: false,
        error: '사용자 정보를 찾을 수 없습니다.'
      }
    }

    const userData = userDoc.data()
    return {
      success: true,
      profile: {
        ...userData.profile,
        photoURL: userData.photoURL || null
      }
    }
  } catch (error: any) {
    console.error('프로필 조회 오류:', error)
    return {
      success: false,
      error: '프로필을 불러오는 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 닉네임 중복 확인 Server Action
 * 실시간 닉네임 중복 검사를 위한 별도 함수
 */
export async function checkNicknameAvailability(
  nickname: string
): Promise<{
  available: boolean
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        available: false,
        error: '로그인이 필요합니다.'
      }
    }

    // 빈 닉네임 검사
    if (!nickname || !nickname.trim()) {
      return {
        available: false,
        error: '닉네임을 입력해주세요.'
      }
    }

    const isDuplicate = await checkNicknameDuplicate(nickname.trim(), user.uid)

    return {
      available: !isDuplicate
    }
  } catch (error: any) {
    console.error('닉네임 중복 확인 오류:', error)
    return {
      available: false,
      error: '닉네임 중복 확인 중 오류가 발생했습니다.'
    }
  }
}
