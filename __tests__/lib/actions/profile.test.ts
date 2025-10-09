/**
 * Comprehensive tests for profile Server Actions
 * Tests all Server Actions with 80%+ coverage
 */

import {
  updateProfileAction,
  getProfileAction,
  checkNicknameAvailability
} from '@/lib/actions/profile'
import type { UserProfile } from '@/lib/types/auth'

// Mock modules
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  runTransaction: jest.fn(),
  query: jest.fn(),
  collection: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  serverTimestamp: jest.fn(() => ({ _seconds: 1234567890, _nanoseconds: 0 }))
}))

jest.mock('@/lib/firebase', () => ({
  db: {}
}))

jest.mock('@/lib/auth/server', () => ({
  getCurrentUser: jest.fn()
}))

jest.mock('@/lib/validators/profile', () => ({
  validateProfileData: jest.fn(),
  validateSocialLinks: jest.fn(),
  validateProfileImageUrl: jest.fn()
}))

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
import {
  validateProfileData,
  validateSocialLinks,
  validateProfileImageUrl
} from '@/lib/validators/profile'

describe('Profile Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateProfileAction', () => {
    const mockUser = {
      uid: 'user123',
      email: 'test@example.com',
      displayName: 'Test User'
    }

    const validProfileData: Partial<UserProfile> = {
      nickname: 'TestUser',
      location: '서울',
      danceLevel: 'intermediate',
      interests: ['Lindy Hop', 'Charleston'],
      bio: 'Hello, I love swing dance!'
    }

    beforeEach(() => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(validateProfileData as jest.Mock).mockReturnValue({ valid: true })
      ;(validateSocialLinks as jest.Mock).mockReturnValue({ valid: true })
      ;(validateProfileImageUrl as jest.Mock).mockReturnValue({ valid: true })
      ;(doc as jest.Mock).mockReturnValue({ id: mockUser.uid })
      ;(serverTimestamp as jest.Mock).mockReturnValue({ _seconds: 1234567890 })
      // Default: no nickname duplicates
      ;(getDocs as jest.Mock).mockResolvedValue({ docs: [] })
    })

    it('should successfully update profile data', async () => {
      const mockUserDoc = {
        exists: () => true,
        data: () => ({
          profile: {
            nickname: 'OldNickname',
            location: '부산',
            danceLevel: 'beginner'
          },
          createdAt: { _seconds: 1234567890 }
        })
      }

      // Mock getDocs for nickname duplicate check (no duplicates)
      ;(getDocs as jest.Mock).mockResolvedValue({
        docs: []
      })

      ;(runTransaction as jest.Mock).mockImplementation(async (db, callback) => {
        const transaction = {
          get: jest.fn().mockResolvedValue(mockUserDoc),
          update: jest.fn()
        }
        await callback(transaction)
        return Promise.resolve()
      })

      const result = await updateProfileAction(validProfileData)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(getCurrentUser).toHaveBeenCalledTimes(1)
      expect(validateProfileData).toHaveBeenCalledWith(validProfileData)
      expect(runTransaction).toHaveBeenCalledWith(db, expect.any(Function))
      expect(revalidatePath).toHaveBeenCalledWith('/profile')
      expect(revalidatePath).toHaveBeenCalledWith(`/profile/${mockUser.uid}`)
    })

    it('should successfully update profile with photoURL', async () => {
      const profileDataWithPhoto = {
        ...validProfileData,
        photoURL: 'https://example.com/photo.jpg'
      }

      const mockUserDoc = {
        exists: () => true,
        data: () => ({
          profile: { nickname: 'OldNickname' },
          photoURL: 'https://example.com/old-photo.jpg'
        })
      }

      // Mock getDocs for nickname duplicate check
      ;(getDocs as jest.Mock).mockResolvedValue({
        docs: []
      })

      ;(runTransaction as jest.Mock).mockImplementation(async (db, callback) => {
        const transaction = {
          get: jest.fn().mockResolvedValue(mockUserDoc),
          update: jest.fn()
        }
        await callback(transaction)
        return Promise.resolve()
      })

      const result = await updateProfileAction(profileDataWithPhoto)

      expect(result.success).toBe(true)
      expect(validateProfileImageUrl).toHaveBeenCalledWith(profileDataWithPhoto.photoURL)
    })

    it('should fail when user is not authenticated', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

      const result = await updateProfileAction(validProfileData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('로그인이 필요합니다.')
      expect(runTransaction).not.toHaveBeenCalled()
    })

    it('should fail when profile data validation fails', async () => {
      ;(validateProfileData as jest.Mock).mockReturnValue({
        valid: false,
        error: '닉네임은 최소 2자 이상이어야 합니다.',
        field: 'nickname'
      })

      const result = await updateProfileAction({ nickname: 'A' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('닉네임은 최소 2자 이상이어야 합니다.')
      expect(result.field).toBe('nickname')
      expect(runTransaction).not.toHaveBeenCalled()
    })

    it('should fail when social links validation fails', async () => {
      const profileWithSocialLinks = {
        ...validProfileData,
        socialLinks: {
          kakao: 'k'.repeat(51) // Too long
        }
      }

      ;(validateSocialLinks as jest.Mock).mockReturnValue({
        valid: false,
        error: '카카오톡 ID는 최대 50자까지 입력 가능합니다.',
        field: 'socialLinks.kakao'
      })

      const result = await updateProfileAction(profileWithSocialLinks)

      expect(result.success).toBe(false)
      expect(result.error).toBe('카카오톡 ID는 최대 50자까지 입력 가능합니다.')
      expect(result.field).toBe('socialLinks.kakao')
      expect(runTransaction).not.toHaveBeenCalled()
    })

    it('should fail when photoURL validation fails', async () => {
      ;(validateProfileImageUrl as jest.Mock).mockReturnValue({
        valid: false,
        error: '유효하지 않은 이미지 URL 형식입니다.',
        field: 'photoURL'
      })

      const result = await updateProfileAction({
        ...validProfileData,
        photoURL: 'invalid-url'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('유효하지 않은 이미지 URL 형식입니다.')
      expect(result.field).toBe('photoURL')
      expect(runTransaction).not.toHaveBeenCalled()
    })

    it('should fail when user document does not exist', async () => {
      const mockUserDoc = {
        exists: () => false,
        data: () => null
      }

      ;(runTransaction as jest.Mock).mockImplementation(async (db, callback) => {
        const transaction = {
          get: jest.fn().mockResolvedValue(mockUserDoc),
          update: jest.fn()
        }
        try {
          await callback(transaction)
        } catch (error) {
          throw error
        }
      })

      const result = await updateProfileAction(validProfileData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('사용자 정보를 찾을 수 없습니다.')
    })

    it('should fail when nickname is already taken by another user', async () => {
      const mockUserDoc = {
        exists: () => true,
        data: () => ({
          profile: { nickname: 'OldNickname' }
        })
      }

      const mockQuerySnapshot = {
        docs: [
          { id: 'other-user-123', data: () => ({ profile: { nickname: 'TestUser' } }) }
        ]
      }

      ;(getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot)
      ;(runTransaction as jest.Mock).mockImplementation(async (db, callback) => {
        const transaction = {
          get: jest.fn().mockResolvedValue(mockUserDoc),
          update: jest.fn()
        }
        try {
          await callback(transaction)
        } catch (error) {
          throw error
        }
      })

      const result = await updateProfileAction({ nickname: 'TestUser' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('이미 사용 중인 닉네임입니다.')
      expect(result.field).toBe('nickname')
    })

    it('should succeed when nickname is taken by current user', async () => {
      const mockUserDoc = {
        exists: () => true,
        data: () => ({
          profile: { nickname: 'TestUser' }
        })
      }

      const mockQuerySnapshot = {
        docs: [
          { id: mockUser.uid, data: () => ({ profile: { nickname: 'TestUser' } }) }
        ]
      }

      ;(getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot)
      ;(runTransaction as jest.Mock).mockImplementation(async (db, callback) => {
        const transaction = {
          get: jest.fn().mockResolvedValue(mockUserDoc),
          update: jest.fn()
        }
        await callback(transaction)
        return Promise.resolve()
      })

      const result = await updateProfileAction({ nickname: 'TestUser' })

      expect(result.success).toBe(true)
    })

    it('should handle permission-denied error', async () => {
      ;(runTransaction as jest.Mock).mockRejectedValue({
        code: 'permission-denied',
        message: 'Permission denied'
      })

      const result = await updateProfileAction(validProfileData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('프로필을 수정할 권한이 없습니다.')
    })

    it('should handle network unavailable error', async () => {
      ;(runTransaction as jest.Mock).mockRejectedValue({
        code: 'unavailable',
        message: 'Network unavailable'
      })

      const result = await updateProfileAction(validProfileData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('네트워크 연결을 확인해주세요.')
    })

    it('should handle generic errors', async () => {
      ;(runTransaction as jest.Mock).mockRejectedValue(new Error('Unknown error'))

      const result = await updateProfileAction(validProfileData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('프로필 업데이트 중 오류가 발생했습니다.')
    })

    it('should handle null photoURL (profile image removal)', async () => {
      const profileDataWithNullPhoto = {
        ...validProfileData,
        photoURL: null
      }

      const mockUserDoc = {
        exists: () => true,
        data: () => ({
          profile: { nickname: 'OldNickname' },
          photoURL: 'https://example.com/old-photo.jpg'
        })
      }

      ;(runTransaction as jest.Mock).mockImplementation(async (db, callback) => {
        const transaction = {
          get: jest.fn().mockResolvedValue(mockUserDoc),
          update: jest.fn()
        }
        await callback(transaction)
        return Promise.resolve()
      })

      const result = await updateProfileAction(profileDataWithNullPhoto)

      expect(result.success).toBe(true)
      expect(validateProfileImageUrl).toHaveBeenCalledWith(null)
    })

    it('should not check nickname duplicate when nickname unchanged', async () => {
      const mockUserDoc = {
        exists: () => true,
        data: () => ({
          profile: { nickname: 'TestUser', location: '부산' }
        })
      }

      ;(runTransaction as jest.Mock).mockImplementation(async (db, callback) => {
        const transaction = {
          get: jest.fn().mockResolvedValue(mockUserDoc),
          update: jest.fn()
        }
        await callback(transaction)
        return Promise.resolve()
      })

      const result = await updateProfileAction({ location: '서울' })

      expect(result.success).toBe(true)
      expect(getDocs).not.toHaveBeenCalled()
    })
  })

  describe('getProfileAction', () => {
    const mockUser = {
      uid: 'user123',
      email: 'test@example.com',
      displayName: 'Test User'
    }

    const mockUserData = {
      profile: {
        nickname: 'TestUser',
        location: '서울',
        danceLevel: 'intermediate',
        interests: ['Lindy Hop', 'Charleston'],
        bio: 'Hello, I love swing dance!'
      },
      photoURL: 'https://example.com/photo.jpg',
      email: 'test@example.com',
      createdAt: { _seconds: 1234567890 }
    }

    beforeEach(() => {
      ;(doc as jest.Mock).mockReturnValue({ id: mockUser.uid })
    })

    it('should successfully get profile for current user', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockUserData
      })

      const result = await getProfileAction()

      expect(result.success).toBe(true)
      expect(result.profile).toEqual({
        ...mockUserData.profile,
        photoURL: mockUserData.photoURL
      })
      expect(getCurrentUser).toHaveBeenCalledTimes(1)
      expect(getDoc).toHaveBeenCalledTimes(1)
    })

    it('should successfully get profile for specific user', async () => {
      const targetUserId = 'other-user-456'
      ;(doc as jest.Mock).mockReturnValue({ id: targetUserId })
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockUserData
      })

      const result = await getProfileAction(targetUserId)

      expect(result.success).toBe(true)
      expect(result.profile).toEqual({
        ...mockUserData.profile,
        photoURL: mockUserData.photoURL
      })
      expect(getCurrentUser).not.toHaveBeenCalled()
      expect(doc).toHaveBeenCalledWith(db, 'users', targetUserId)
    })

    it('should fail when no userId provided and user not authenticated', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

      const result = await getProfileAction()

      expect(result.success).toBe(false)
      expect(result.error).toBe('로그인이 필요합니다.')
      expect(result.profile).toBeUndefined()
    })

    it('should fail when user document does not exist', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
        data: () => null
      })

      const result = await getProfileAction()

      expect(result.success).toBe(false)
      expect(result.error).toBe('사용자 정보를 찾을 수 없습니다.')
      expect(result.profile).toBeUndefined()
    })

    it('should handle profile without photoURL', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          ...mockUserData,
          photoURL: undefined
        })
      })

      const result = await getProfileAction()

      expect(result.success).toBe(true)
      expect(result.profile?.photoURL).toBeNull()
    })

    it('should handle generic errors', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'))

      const result = await getProfileAction()

      expect(result.success).toBe(false)
      expect(result.error).toBe('프로필을 불러오는 중 오류가 발생했습니다.')
      expect(result.profile).toBeUndefined()
    })

    it('should handle null photoURL in user data', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          ...mockUserData,
          photoURL: null
        })
      })

      const result = await getProfileAction()

      expect(result.success).toBe(true)
      expect(result.profile?.photoURL).toBeNull()
    })
  })

  describe('checkNicknameAvailability', () => {
    const mockUser = {
      uid: 'user123',
      email: 'test@example.com',
      displayName: 'Test User'
    }

    beforeEach(() => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(collection as jest.Mock).mockReturnValue({})
      ;(query as jest.Mock).mockReturnValue({})
      ;(where as jest.Mock).mockReturnValue({})
    })

    it('should return available for unique nickname', async () => {
      const mockQuerySnapshot = {
        docs: []
      }

      ;(getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot)

      const result = await checkNicknameAvailability('UniqueNickname')

      expect(result.available).toBe(true)
      expect(result.error).toBeUndefined()
      expect(collection).toHaveBeenCalledWith(db, 'users')
      expect(getDocs).toHaveBeenCalledTimes(1)
    })

    it('should return available for nickname used by current user', async () => {
      const mockQuerySnapshot = {
        docs: [
          { id: mockUser.uid, data: () => ({ profile: { nickname: 'MyNickname' } }) }
        ]
      }

      ;(getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot)

      const result = await checkNicknameAvailability('MyNickname')

      expect(result.available).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return unavailable for nickname used by another user', async () => {
      const mockQuerySnapshot = {
        docs: [
          { id: 'other-user-456', data: () => ({ profile: { nickname: 'TakenNickname' } }) }
        ]
      }

      ;(getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot)

      const result = await checkNicknameAvailability('TakenNickname')

      expect(result.available).toBe(false)
      expect(result.error).toBeUndefined()
    })

    it('should return unavailable when user not authenticated', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

      const result = await checkNicknameAvailability('SomeNickname')

      expect(result.available).toBe(false)
      expect(result.error).toBe('로그인이 필요합니다.')
      expect(getDocs).not.toHaveBeenCalled()
    })

    it('should return unavailable for empty nickname', async () => {
      const result = await checkNicknameAvailability('')

      expect(result.available).toBe(false)
      expect(result.error).toBe('닉네임을 입력해주세요.')
      expect(getDocs).not.toHaveBeenCalled()
    })

    it('should return unavailable for whitespace-only nickname', async () => {
      const result = await checkNicknameAvailability('   ')

      expect(result.available).toBe(false)
      expect(result.error).toBe('닉네임을 입력해주세요.')
      expect(getDocs).not.toHaveBeenCalled()
    })

    it('should trim nickname before checking', async () => {
      const mockQuerySnapshot = {
        docs: []
      }

      ;(getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot)

      const result = await checkNicknameAvailability('  TrimmedNickname  ')

      expect(result.available).toBe(true)
      expect(where).toHaveBeenCalledWith('profile.nickname', '==', 'TrimmedNickname')
    })

    it('should handle Firestore errors', async () => {
      ;(getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'))

      const result = await checkNicknameAvailability('SomeNickname')

      expect(result.available).toBe(false)
      expect(result.error).toBe('닉네임 중복 확인 중 오류가 발생했습니다.')
    })

    it('should handle multiple users with same nickname (edge case)', async () => {
      const mockQuerySnapshot = {
        docs: [
          { id: 'other-user-1', data: () => ({ profile: { nickname: 'Duplicate' } }) },
          { id: 'other-user-2', data: () => ({ profile: { nickname: 'Duplicate' } }) }
        ]
      }

      ;(getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot)

      const result = await checkNicknameAvailability('Duplicate')

      expect(result.available).toBe(false)
    })

    it('should handle network errors in nickname check', async () => {
      ;(getDocs as jest.Mock).mockRejectedValue({
        code: 'unavailable',
        message: 'Network unavailable'
      })

      const result = await checkNicknameAvailability('SomeNickname')

      expect(result.available).toBe(false)
      expect(result.error).toBe('닉네임 중복 확인 중 오류가 발생했습니다.')
    })
  })
})
