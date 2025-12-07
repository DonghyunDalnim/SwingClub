/**
 * Profile-related Server Actions
 * Next.js 15 App Router Server Actions pattern
 */

'use server'

import { revalidatePath } from 'next/cache'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { collections } from '@/lib/firebase/collections'
import { getCurrentUser } from '@/lib/auth/server'
import { validateUserProfile, validateDanceStyles, sanitizeDanceStyles } from '@/lib/validation/profile'
import type { UserProfile } from '@/lib/types/auth'
import type { DanceStyle } from '@/lib/types/user'

/**
 * Update user profile with validation
 * @param profileData - Partial profile data to update
 * @returns Result object with success flag and error message
 */
export async function updateUserProfile(
  profileData: Partial<UserProfile>
): Promise<{ success: boolean; error?: string; errors?: Record<string, string[]> }> {
  try {
    // Get current user
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const userId = user.uid || (user as any).id

    if (!userId) {
      return { success: false, error: '사용자 ID를 확인할 수 없습니다.' }
    }

    // Validate profile data
    const validationResult = validateUserProfile(profileData)

    if (!validationResult.success) {
      return {
        success: false,
        error: '입력한 정보가 올바르지 않습니다.',
        errors: validationResult.errors
      }
    }

    // Sanitize dance styles for backward compatibility
    const sanitizedData = {
      ...validationResult.data,
      danceStyles: validationResult.data?.danceStyles
        ? validationResult.data.danceStyles
        : undefined
    }

    // Remove undefined fields to avoid Firestore errors
    const updateData: any = {}
    Object.entries(sanitizedData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[`profile.${key}`] = value
      }
    })

    // Add update timestamp
    updateData['profile.updatedAt'] = serverTimestamp()

    // Update user document
    const userRef = doc(collections.users, userId)

    // Check if user document exists
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' }
    }

    // Update with partial data (merge)
    await updateDoc(userRef, updateData)

    // Revalidate profile page
    revalidatePath('/profile')
    revalidatePath('/profile/edit')

    return { success: true }
  } catch (error) {
    console.error('[updateUserProfile] Profile update failed:', error)

    // Handle specific Firestore errors
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        return { success: false, error: '프로필 수정 권한이 없습니다.' }
      }
      if (error.message.includes('not-found')) {
        return { success: false, error: '사용자 정보를 찾을 수 없습니다.' }
      }
    }

    return { success: false, error: '프로필 업데이트에 실패했습니다.' }
  }
}

/**
 * Update only dance styles
 * @param danceStyles - Array of dance styles to update
 * @returns Result object with success flag and error message
 */
export async function updateDanceStyles(
  danceStyles: DanceStyle[]
): Promise<{ success: boolean; error?: string; errors?: string[] }> {
  try {
    // Get current user
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const userId = user.uid || (user as any).id

    if (!userId) {
      return { success: false, error: '사용자 ID를 확인할 수 없습니다.' }
    }

    // Validate dance styles
    const validationResult = validateDanceStyles(danceStyles)

    if (!validationResult.success) {
      return {
        success: false,
        error: '댄스 스타일 정보가 올바르지 않습니다.',
        errors: validationResult.errors
      }
    }

    // Update user document
    const userRef = doc(collections.users, userId)

    // Check if user document exists
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' }
    }

    // Update dance styles field
    await updateDoc(userRef, {
      'profile.danceStyles': validationResult.data || [],
      'profile.updatedAt': serverTimestamp()
    })

    // Revalidate profile page
    revalidatePath('/profile')
    revalidatePath('/profile/edit')

    return { success: true }
  } catch (error) {
    console.error('[updateDanceStyles] Dance styles update failed:', error)

    // Handle specific Firestore errors
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        return { success: false, error: '댄스 스타일 수정 권한이 없습니다.' }
      }
      if (error.message.includes('not-found')) {
        return { success: false, error: '사용자 정보를 찾을 수 없습니다.' }
      }
    }

    return { success: false, error: '댄스 스타일 업데이트에 실패했습니다.' }
  }
}

/**
 * Get user profile
 * @param userId - User ID to fetch profile for (optional, defaults to current user)
 * @returns User profile data or null if not found
 */
export async function getUserProfile(
  userId?: string
): Promise<{ success: boolean; data?: UserProfile; error?: string }> {
  try {
    let targetUserId = userId

    // If no userId provided, get current user
    if (!targetUserId) {
      const user = await getCurrentUser()
      if (!user) {
        return { success: false, error: '로그인이 필요합니다.' }
      }
      targetUserId = user.uid || (user as any).id
    }

    if (!targetUserId) {
      return { success: false, error: '사용자 ID를 확인할 수 없습니다.' }
    }

    // Get user document
    const userRef = doc(collections.users, targetUserId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' }
    }

    const userData = userSnap.data()
    const profile = userData.profile as UserProfile

    // Ensure backward compatibility - convert undefined danceStyles to empty array
    if (profile) {
      profile.danceStyles = profile.danceStyles || []
    }

    return { success: true, data: profile }
  } catch (error) {
    console.error('[getUserProfile] Failed to fetch user profile:', error)
    return { success: false, error: '프로필 정보를 불러오는데 실패했습니다.' }
  }
}
