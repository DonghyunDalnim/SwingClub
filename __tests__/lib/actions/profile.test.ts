/**
 * Comprehensive tests for profile-related Server Actions
 * Testing dance style validation and profile updates with high coverage
 */

import {
  updateUserProfile,
  updateDanceStyles,
  getUserProfile
} from '@/lib/actions/profile'

import type { UserProfile } from '@/lib/types/auth'
import type { DanceStyle } from '@/lib/types/user'

// Mock Next.js cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(() => ({ _seconds: 1640995200, _nanoseconds: 0 }))
}))

// Mock Firebase instance and collections
jest.mock('@/lib/firebase', () => ({
  db: {}
}))

jest.mock('@/lib/firebase/collections', () => ({
  collections: {
    users: {}
  }
}))

// Mock auth server
jest.mock('@/lib/auth/server', () => ({
  getCurrentUser: jest.fn()
}))

import { revalidatePath } from 'next/cache'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { getCurrentUser } from '@/lib/auth/server'

describe('Profile Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Mock user data
  const mockUser = {
    uid: 'user123',
    email: 'test@example.com',
    displayName: '테스트유저'
  }

  const mockUserProfile: UserProfile = {
    nickname: '테스트유저',
    danceLevel: 'intermediate',
    location: 'Seoul',
    bio: 'I love swing dance!',
    interests: ['Lindy Hop', 'Charleston'],
    danceStyles: [
      { style: 'Lindy Hop', level: 3 },
      { style: 'Charleston', level: 2 }
    ]
  }

  describe('updateUserProfile', () => {
    it('should successfully update profile with valid data', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ profile: mockUserProfile })
      })
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      const updateData: Partial<UserProfile> = {
        nickname: '새로운닉네임',
        location: 'Busan'
      }

      const result = await updateUserProfile(updateData)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(updateDoc).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/profile')
      expect(revalidatePath).toHaveBeenCalledWith('/profile/edit')
    })

    it('should successfully update dance styles', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ profile: mockUserProfile })
      })
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      const updateData: Partial<UserProfile> = {
        danceStyles: [
          { style: 'Lindy Hop', level: 4 },
          { style: 'Balboa', level: 3 }
        ]
      }

      const result = await updateUserProfile(updateData)

      expect(result.success).toBe(true)
      expect(updateDoc).toHaveBeenCalled()
    })

    it('should return error if user is not logged in', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

      const result = await updateUserProfile({ nickname: 'Test' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('로그인이 필요합니다.')
      expect(updateDoc).not.toHaveBeenCalled()
    })

    it('should return error if user document does not exist', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => false
      })

      const result = await updateUserProfile({ nickname: 'Test' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('사용자 정보를 찾을 수 없습니다.')
      expect(updateDoc).not.toHaveBeenCalled()
    })

    it('should reject invalid nickname (too long)', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      const result = await updateUserProfile({
        nickname: 'a'.repeat(51)
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.errors).toBeDefined()
    })

    it('should reject invalid dance level', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      const result = await updateUserProfile({
        danceLevel: 'invalid' as any
      })

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should reject invalid dance styles', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      const result = await updateUserProfile({
        danceStyles: [
          { style: 'Invalid Style', level: 3 } as any
        ]
      })

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should reject duplicate dance styles', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      const result = await updateUserProfile({
        danceStyles: [
          { style: 'Lindy Hop', level: 3 },
          { style: 'Lindy Hop', level: 4 }
        ]
      })

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should reject too many dance styles', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      const tooManyStyles: DanceStyle[] = Array.from({ length: 11 }, (_, i) => ({
        style: 'Lindy Hop',
        level: 3
      }))

      const result = await updateUserProfile({
        danceStyles: tooManyStyles
      })

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should handle Firestore permission errors', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ profile: mockUserProfile })
      })
      ;(updateDoc as jest.Mock).mockRejectedValue(new Error('permission-denied'))

      const result = await updateUserProfile({ nickname: 'Test' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('프로필 수정 권한이 없습니다.')
    })

    it('should handle Firestore not-found errors', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ profile: mockUserProfile })
      })
      ;(updateDoc as jest.Mock).mockRejectedValue(new Error('not-found'))

      const result = await updateUserProfile({ nickname: 'Test' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('사용자 정보를 찾을 수 없습니다.')
    })

    it('should accept empty dance styles array', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ profile: mockUserProfile })
      })
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      const result = await updateUserProfile({
        danceStyles: []
      })

      expect(result.success).toBe(true)
    })

    it('should accept undefined dance styles', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ profile: mockUserProfile })
      })
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      const result = await updateUserProfile({
        danceStyles: undefined
      })

      expect(result.success).toBe(true)
    })
  })

  describe('updateDanceStyles', () => {
    it('should successfully update dance styles', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ profile: mockUserProfile })
      })
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      const newStyles: DanceStyle[] = [
        { style: 'Lindy Hop', level: 4 },
        { style: 'Balboa', level: 3 }
      ]

      const result = await updateDanceStyles(newStyles)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(updateDoc).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/profile')
      expect(revalidatePath).toHaveBeenCalledWith('/profile/edit')
    })

    it('should return error if user is not logged in', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

      const result = await updateDanceStyles([{ style: 'Lindy Hop', level: 3 }])

      expect(result.success).toBe(false)
      expect(result.error).toBe('로그인이 필요합니다.')
      expect(updateDoc).not.toHaveBeenCalled()
    })

    it('should return error if user document does not exist', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => false
      })

      const result = await updateDanceStyles([{ style: 'Lindy Hop', level: 3 }])

      expect(result.success).toBe(false)
      expect(result.error).toBe('사용자 정보를 찾을 수 없습니다.')
    })

    it('should reject invalid dance style', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      const result = await updateDanceStyles([
        { style: 'Invalid Style', level: 3 } as any
      ])

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should reject level below minimum', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      const result = await updateDanceStyles([
        { style: 'Lindy Hop', level: 0 }
      ])

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should reject level above maximum', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      const result = await updateDanceStyles([
        { style: 'Lindy Hop', level: 6 }
      ])

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should accept empty dance styles array', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ profile: mockUserProfile })
      })
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      const result = await updateDanceStyles([])

      expect(result.success).toBe(true)
    })

    it('should handle Firestore errors gracefully', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ profile: mockUserProfile })
      })
      ;(updateDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'))

      const result = await updateDanceStyles([{ style: 'Lindy Hop', level: 3 }])

      expect(result.success).toBe(false)
      expect(result.error).toBe('댄스 스타일 업데이트에 실패했습니다.')
    })
  })

  describe('getUserProfile', () => {
    it('should successfully fetch user profile', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ profile: mockUserProfile })
      })

      const result = await getUserProfile()

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.danceStyles).toBeDefined()
    })

    it('should fetch profile for specific user ID', async () => {
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ profile: mockUserProfile })
      })

      const result = await getUserProfile('other_user_id')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(getCurrentUser).not.toHaveBeenCalled()
    })

    it('should return error if user is not logged in (no userId provided)', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

      const result = await getUserProfile()

      expect(result.success).toBe(false)
      expect(result.error).toBe('로그인이 필요합니다.')
    })

    it('should return error if user document does not exist', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => false
      })

      const result = await getUserProfile()

      expect(result.success).toBe(false)
      expect(result.error).toBe('사용자 정보를 찾을 수 없습니다.')
    })

    it('should handle backward compatibility (undefined danceStyles)', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      const profileWithoutDanceStyles = {
        ...mockUserProfile,
        danceStyles: undefined
      }
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ profile: profileWithoutDanceStyles })
      })

      const result = await getUserProfile()

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.danceStyles).toEqual([])
    })

    it('should handle Firestore errors', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'))

      const result = await getUserProfile()

      expect(result.success).toBe(false)
      expect(result.error).toBe('프로필 정보를 불러오는데 실패했습니다.')
    })
  })

  describe('Edge Cases and Integration', () => {
    it('should handle all 9 allowed dance styles', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ profile: mockUserProfile })
      })
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      const allStyles: DanceStyle[] = [
        { style: 'Lindy Hop', level: 3 },
        { style: 'Charleston', level: 2 },
        { style: 'Balboa', level: 4 },
        { style: 'Shag', level: 3 },
        { style: 'Blues', level: 5 },
        { style: 'Collegiate Shag', level: 2 },
        { style: 'St. Louis Shag', level: 1 },
        { style: 'Slow Drag', level: 4 },
        { style: 'Authentic Jazz', level: 3 }
      ]

      const result = await updateDanceStyles(allStyles)

      expect(result.success).toBe(true)
    })

    it('should handle maximum 10 styles limit', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ profile: mockUserProfile })
      })
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      const maxStyles: DanceStyle[] = Array.from({ length: 10 }, (_, i) => ({
        style: 'Lindy Hop',
        level: 3
      }))

      const result = await updateDanceStyles(maxStyles)

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should validate level boundaries (1 and 5)', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ profile: mockUserProfile })
      })
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      const boundaryStyles: DanceStyle[] = [
        { style: 'Lindy Hop', level: 1 },
        { style: 'Charleston', level: 5 }
      ]

      const result = await updateDanceStyles(boundaryStyles)

      expect(result.success).toBe(true)
    })

    it('should handle complete profile update', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ profile: mockUserProfile })
      })
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      const completeProfile: Partial<UserProfile> = {
        nickname: '업데이트된닉네임',
        danceLevel: 'advanced',
        location: 'Seoul',
        bio: '새로운 자기소개',
        interests: ['Lindy Hop', 'Charleston', 'Balboa'],
        socialLinks: {
          kakao: 'https://kakao.com/test',
          instagram: 'https://instagram.com/test'
        },
        danceStyles: [
          { style: 'Lindy Hop', level: 4 },
          { style: 'Charleston', level: 3 }
        ]
      }

      const result = await updateUserProfile(completeProfile)

      expect(result.success).toBe(true)
    })
  })
})
