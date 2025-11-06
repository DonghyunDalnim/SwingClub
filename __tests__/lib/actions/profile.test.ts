/**
 * Server Action 테스트: updateUserProfile
 */

import { updateUserProfile, getUserProfile } from '@/lib/actions/profile'
import { getCurrentUser } from '@/lib/auth/server'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import type { DanceStyle } from '@/lib/types/auth'

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({ id: 'mocked-doc-ref' })),
  updateDoc: jest.fn(),
  getDoc: jest.fn()
}))
jest.mock('@/lib/auth/server')
jest.mock('@/lib/firebase', () => ({
  db: {}
}))

describe('updateUserProfile Server Action', () => {
  const mockUser = {
    uid: 'test-user-123',
    displayName: 'Test User'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
  })

  describe('인증 검증', () => {
    it('로그인하지 않은 경우 에러 반환', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

      const result = await updateUserProfile({ nickname: 'test' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('로그인이 필요합니다.')
    })

    it('사용자 ID가 없는 경우 에러 반환', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue({})

      const result = await updateUserProfile({ nickname: 'test' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('사용자 ID를 확인할 수 없습니다.')
    })
  })

  describe('유효성 검증', () => {
    it('닉네임이 비어있으면 에러 반환', async () => {
      const result = await updateUserProfile({ nickname: '' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('닉네임을 입력해주세요.')
    })

    it('닉네임이 20자를 초과하면 에러 반환', async () => {
      const result = await updateUserProfile({
        nickname: '가'.repeat(21)
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('닉네임은 20자 이하여야 합니다.')
    })

    it('위치가 비어있으면 에러 반환', async () => {
      const result = await updateUserProfile({ location: '' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('활동 지역을 입력해주세요.')
    })

    it('자기소개가 200자를 초과하면 에러 반환', async () => {
      const result = await updateUserProfile({
        bio: '가'.repeat(201)
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('자기소개는 200자 이하여야 합니다.')
    })

    it('유효하지 않은 댄스 레벨이면 에러 반환', async () => {
      const result = await updateUserProfile({
        danceLevel: 'invalid' as any
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('유효하지 않은 댄스 레벨입니다.')
    })
  })

  describe('댄스 스타일 유효성 검증', () => {
    it('댄스 스타일이 10개를 초과하면 에러 반환', async () => {
      const danceStyles: DanceStyle[] = Array.from({ length: 11 }, (_, i) => ({
        name: `Style ${i}`,
        level: 3
      }))

      const result = await updateUserProfile({ danceStyles })

      expect(result.success).toBe(false)
      expect(result.error).toBe('댄스 스타일은 최대 10개까지 선택할 수 있습니다.')
    })

    it('댄스 스타일 레벨이 1보다 작으면 에러 반환', async () => {
      const danceStyles: DanceStyle[] = [
        { name: 'Lindy Hop', level: 0 }
      ]

      const result = await updateUserProfile({ danceStyles })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Lindy Hop의 레벨은 1-5 사이여야 합니다.')
    })

    it('댄스 스타일 레벨이 5보다 크면 에러 반환', async () => {
      const danceStyles: DanceStyle[] = [
        { name: 'Charleston', level: 6 }
      ]

      const result = await updateUserProfile({ danceStyles })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Charleston의 레벨은 1-5 사이여야 합니다.')
    })

    it('중복된 댄스 스타일이 있으면 에러 반환', async () => {
      const danceStyles: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 },
        { name: 'Lindy Hop', level: 2 }
      ]

      const result = await updateUserProfile({ danceStyles })

      expect(result.success).toBe(false)
      expect(result.error).toBe('중복된 댄스 스타일이 있습니다.')
    })

    it('유효한 댄스 스타일 배열은 통과', async () => {
      const danceStyles: DanceStyle[] = [
        { name: 'Lindy Hop', level: 3 },
        { name: 'Charleston', level: 2 },
        { name: 'Balboa', level: 4 }
      ]

      const mockDoc = {
        exists: () => true,
        data: () => ({ profile: {} })
      }

      ;(getDoc as jest.Mock).mockResolvedValue(mockDoc)
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      const result = await updateUserProfile({
        nickname: 'Test',
        location: 'Seoul',
        danceStyles
      })

      expect(result.success).toBe(true)
    })
  })

  describe('데이터 정제', () => {
    it('닉네임과 위치의 공백을 제거', async () => {
      const mockDoc = {
        exists: () => true,
        data: () => ({ profile: {} })
      }

      ;(getDoc as jest.Mock).mockResolvedValue(mockDoc)
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      await updateUserProfile({
        nickname: '  Test User  ',
        location: '  Seoul  '
      })

      expect(updateDoc).toHaveBeenCalledWith(
        { id: 'mocked-doc-ref' },
        expect.objectContaining({
          profile: expect.objectContaining({
            nickname: 'Test User',
            location: 'Seoul'
          }),
          updatedAt: expect.any(Date)
        })
      )
    })
  })

  describe('Firestore 업데이트', () => {
    it('사용자 문서가 없으면 에러 반환', async () => {
      const mockDoc = {
        exists: () => false
      }

      ;(getDoc as jest.Mock).mockResolvedValue(mockDoc)

      const result = await updateUserProfile({ nickname: 'Test' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('사용자 정보를 찾을 수 없습니다.')
    })

    it('성공 시 Firestore 업데이트 호출', async () => {
      const mockDoc = {
        exists: () => true,
        data: () => ({
          profile: {
            interests: ['dancing']
          }
        })
      }

      ;(getDoc as jest.Mock).mockResolvedValue(mockDoc)
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      const result = await updateUserProfile({
        nickname: 'Test User',
        danceLevel: 'intermediate',
        location: 'Seoul',
        bio: 'Hello',
        danceStyles: [{ name: 'Lindy Hop', level: 3 }]
      })

      expect(result.success).toBe(true)
      expect(updateDoc).toHaveBeenCalled()
      expect(getDoc).toHaveBeenCalled()
    })

    it('Firestore 에러 발생 시 에러 반환', async () => {
      ;(getDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'))

      const result = await updateUserProfile({ nickname: 'Test' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Firestore error')
    })
  })

  describe('부분 업데이트', () => {
    it('제공된 필드만 업데이트', async () => {
      const mockDoc = {
        exists: () => true,
        data: () => ({
          profile: {
            nickname: 'Old Name',
            location: 'Old Location',
            bio: 'Old Bio'
          }
        })
      }

      ;(getDoc as jest.Mock).mockResolvedValue(mockDoc)
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      await updateUserProfile({
        nickname: 'New Name'
      })

      expect(updateDoc).toHaveBeenCalledWith(
        { id: 'mocked-doc-ref' },
        expect.objectContaining({
          profile: expect.objectContaining({
            nickname: 'New Name',
            location: 'Old Location',
            bio: 'Old Bio'
          }),
          updatedAt: expect.any(Date)
        })
      )
    })
  })
})

describe('getUserProfile Server Action', () => {
  it('사용자 프로필 조회 성공', async () => {
    const mockDoc = {
      exists: () => true,
      data: () => ({
        profile: {
          nickname: 'Test User',
          danceLevel: 'intermediate',
          location: 'Seoul'
        }
      })
    }

    ;(getCurrentUser as jest.Mock).mockResolvedValue({ uid: 'test-123' })
    ;(getDoc as jest.Mock).mockResolvedValue(mockDoc)

    const result = await getUserProfile()

    expect(result.success).toBe(true)
    expect(result.profile).toEqual({
      nickname: 'Test User',
      danceLevel: 'intermediate',
      location: 'Seoul'
    })
  })

  it('사용자가 없으면 에러 반환', async () => {
    ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

    const result = await getUserProfile()

    expect(result.success).toBe(false)
    expect(result.error).toBe('사용자를 찾을 수 없습니다.')
  })
})
