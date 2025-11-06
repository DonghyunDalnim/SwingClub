/**
 * 프로필 관련 Server Actions
 * Next.js 15 App Router Server Actions 패턴 사용
 */

'use server'

import { revalidatePath } from 'next/cache'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/auth/server'
import type { UserProfile, DanceStyle } from '@/lib/types/auth'

/**
 * 댄스 스타일 유효성 검증
 */
function validateDanceStyles(danceStyles?: DanceStyle[]): { valid: boolean; error?: string } {
  if (!danceStyles) {
    return { valid: true }
  }

  // 최대 10개 제한
  if (danceStyles.length > 10) {
    return { valid: false, error: '댄스 스타일은 최대 10개까지 선택할 수 있습니다.' }
  }

  // 각 스타일의 레벨 범위 검증 (1-5)
  for (const style of danceStyles) {
    if (!style.name || typeof style.name !== 'string') {
      return { valid: false, error: '댄스 스타일 이름이 유효하지 않습니다.' }
    }

    if (!Number.isInteger(style.level) || style.level < 1 || style.level > 5) {
      return { valid: false, error: `${style.name}의 레벨은 1-5 사이여야 합니다.` }
    }
  }

  // 중복 스타일 검증
  const styleNames = danceStyles.map(s => s.name)
  const uniqueNames = new Set(styleNames)
  if (styleNames.length !== uniqueNames.size) {
    return { valid: false, error: '중복된 댄스 스타일이 있습니다.' }
  }

  return { valid: true }
}

/**
 * 프로필 데이터 유효성 검증
 */
function validateProfileData(data: Partial<UserProfile>): { valid: boolean; error?: string } {
  // 닉네임 검증
  if (data.nickname !== undefined) {
    if (!data.nickname || data.nickname.trim().length === 0) {
      return { valid: false, error: '닉네임을 입력해주세요.' }
    }
    if (data.nickname.length > 20) {
      return { valid: false, error: '닉네임은 20자 이하여야 합니다.' }
    }
  }

  // 위치 검증
  if (data.location !== undefined) {
    if (!data.location || data.location.trim().length === 0) {
      return { valid: false, error: '활동 지역을 입력해주세요.' }
    }
  }

  // 자기소개 검증
  if (data.bio !== undefined && data.bio) {
    if (data.bio.length > 200) {
      return { valid: false, error: '자기소개는 200자 이하여야 합니다.' }
    }
  }

  // 댄스 레벨 검증
  if (data.danceLevel !== undefined) {
    const validLevels = ['beginner', 'intermediate', 'advanced', 'professional']
    if (!validLevels.includes(data.danceLevel)) {
      return { valid: false, error: '유효하지 않은 댄스 레벨입니다.' }
    }
  }

  // 댄스 스타일 검증
  const danceStyleValidation = validateDanceStyles(data.danceStyles)
  if (!danceStyleValidation.valid) {
    return danceStyleValidation
  }

  return { valid: true }
}

/**
 * 사용자 프로필 업데이트
 */
export async function updateUserProfile(
  profileData: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    // 인증 확인
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const userId = user.uid || (user as any).id
    if (!userId) {
      return { success: false, error: '사용자 ID를 확인할 수 없습니다.' }
    }

    // 데이터 유효성 검증
    const validation = validateProfileData(profileData)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // 데이터 정제 (trim 처리)
    const sanitizedData: Partial<UserProfile> = {}

    if (profileData.nickname !== undefined) {
      sanitizedData.nickname = profileData.nickname.trim()
    }
    if (profileData.location !== undefined) {
      sanitizedData.location = profileData.location.trim()
    }
    if (profileData.bio !== undefined) {
      sanitizedData.bio = profileData.bio.trim()
    }
    if (profileData.danceLevel !== undefined) {
      sanitizedData.danceLevel = profileData.danceLevel
    }
    if (profileData.danceStyles !== undefined) {
      sanitizedData.danceStyles = profileData.danceStyles
    }
    if (profileData.interests !== undefined) {
      sanitizedData.interests = profileData.interests
    }
    if (profileData.socialLinks !== undefined) {
      sanitizedData.socialLinks = profileData.socialLinks
    }

    // Firestore 업데이트
    const userRef = doc(db, 'users', userId)

    // 기존 문서 확인
    const userDoc = await getDoc(userRef)
    if (!userDoc.exists()) {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' }
    }

    // profile 필드 업데이트 (변경된 필드만)
    await updateDoc(userRef, {
      'profile': {
        ...userDoc.data().profile,
        ...sanitizedData
      },
      updatedAt: new Date()
    })

    // 프로필 페이지 재검증
    revalidatePath('/profile')
    revalidatePath('/profile/edit')

    return { success: true }
  } catch (error) {
    console.error('[updateUserProfile] 프로필 업데이트 실패:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '프로필 업데이트에 실패했습니다.'
    }
  }
}

/**
 * 사용자 프로필 조회
 */
export async function getUserProfile(userId?: string): Promise<{
  success: boolean
  profile?: UserProfile
  error?: string
}> {
  try {
    const user = userId ? null : await getCurrentUser()
    const targetUserId = userId || user?.uid || (user as any)?.id

    if (!targetUserId) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' }
    }

    const userRef = doc(db, 'users', targetUserId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' }
    }

    const userData = userDoc.data()
    return {
      success: true,
      profile: userData.profile as UserProfile
    }
  } catch (error) {
    console.error('[getUserProfile] 프로필 조회 실패:', error)
    return {
      success: false,
      error: '프로필 조회에 실패했습니다.'
    }
  }
}
