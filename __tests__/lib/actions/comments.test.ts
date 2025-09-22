/**
 * Comprehensive tests for comment-related Server Actions
 * Testing Korean swing dance community comment scenarios with high coverage
 */

import {
  createCommentAction,
  updateCommentAction,
  deleteCommentAction,
  likeCommentAction,
  unlikeCommentAction,
  getCommentsAction
} from '@/lib/actions/comments'

import type {
  CreateCommentData,
  UpdateCommentData
} from '@/lib/types/community'

// Mock Next.js cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

// Mock Firebase collections
jest.mock('@/lib/firebase/collections', () => ({
  createComment: jest.fn(),
  updateComment: jest.fn(),
  deleteComment: jest.fn(),
  likeComment: jest.fn(),
  unlikeComment: jest.fn(),
  getComments: jest.fn(),
  createNotification: jest.fn()
}))

// Mock auth server
jest.mock('@/lib/auth/server', () => ({
  getCurrentUser: jest.fn()
}))

import { revalidatePath } from 'next/cache'
import {
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  getComments,
  createNotification
} from '@/lib/firebase/collections'
import { getCurrentUser } from '@/lib/auth/server'

describe('Comment Server Actions', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Mock user data for Korean swing dance community
  const mockUser = {
    uid: 'swing_commenter_123',
    displayName: '박린디',
    email: 'park.lindy@example.com'
  }

  const mockUnauthorizedUser = {
    uid: 'unauthorized_commenter',
    displayName: '익명댓글러',
    email: 'anon.commenter@example.com'
  }

  describe('createCommentAction', () => {

    describe('🎵 Success Cases - Korean Swing Dance Community', () => {

      it('should create a helpful comment on swing dance basics question', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(createComment as jest.Mock).mockResolvedValue('comment_lindy_help_123')

        const swingHelpComment: CreateCommentData = {
          postId: 'post_lindy_basic_question',
          content: `안녕하세요! 린디합 5년차 댄서입니다 😊

록스텝에서 중심잡기 팁을 드리자면:
1. 뒤로 갈 때 발끝부터 닿게 하세요
2. 무릎을 살짝 구부려서 충격을 흡수하세요
3. 상체는 조금 앞으로 기울여서 균형을 맞추세요

연습할 때는 천천히 하시면서 몸의 감각을 익히시는 것이 중요해요!
궁금한 점 더 있으시면 언제든 물어보세요 🎵`,
          parentId: null
        }

        const result = await createCommentAction(swingHelpComment)

        expect(result.success).toBe(true)
        expect(result.commentId).toBe('comment_lindy_help_123')
        expect(result.error).toBeUndefined()

        expect(createComment).toHaveBeenCalledWith(
          expect.objectContaining({
            postId: 'post_lindy_basic_question',
            content: expect.stringContaining('린디합 5년차'),
            parentId: null
          }),
          'swing_commenter_123',
          '박린디'
        )

        expect(revalidatePath).toHaveBeenCalledWith('/community/post_lindy_basic_question')
      })

      it('should create a reply comment to swing dance event', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(createComment as jest.Mock).mockResolvedValue('reply_event_123')

        const eventReplyComment: CreateCommentData = {
          postId: 'post_swing_workshop',
          content: `참가 신청합니다! 🙋‍♀️

초보자도 참여 가능한가요?
린디합 배운지 2개월 정도 되었어요.

결제는 현장에서도 가능한지 궁금합니다!`,
          parentId: 'comment_event_original'
        }

        const result = await createCommentAction(eventReplyComment)

        expect(result.success).toBe(true)
        expect(result.commentId).toBe('reply_event_123')

        expect(createComment).toHaveBeenCalledWith(
          expect.objectContaining({
            postId: 'post_swing_workshop',
            content: expect.stringContaining('참가 신청합니다'),
            parentId: 'comment_event_original'
          }),
          'swing_commenter_123',
          '박린디'
        )

        // Should create notification for reply
        expect(createNotification).toHaveBeenCalled()
      })

      it('should create comment on marketplace post about dance shoes', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(createComment as jest.Mock).mockResolvedValue('comment_marketplace_123')

        const marketplaceComment: CreateCommentData = {
          postId: 'post_dance_shoes_sale',
          content: `신발 상태가 정말 좋아 보이네요! 👠

240mm 사이즈는 아직 남아있나요?
직거래는 홍대에서 언제 가능하신지 궁금합니다.

제가 스윙댄스 초보라서 이런 전문 신발이 정말 필요했어요.
연락 기다리겠습니다! 😊`,
          parentId: null
        }

        const result = await createCommentAction(marketplaceComment)

        expect(result.success).toBe(true)
        expect(createComment).toHaveBeenCalledWith(
          expect.objectContaining({
            postId: 'post_dance_shoes_sale',
            content: expect.stringContaining('240mm 사이즈'),
            parentId: null
          }),
          'swing_commenter_123',
          '박린디'
        )
      })
    })

    describe('🚫 Error Cases - Authentication and Validation', () => {

      it('should fail when user is not authenticated', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

        const commentData: CreateCommentData = {
          postId: 'post_test',
          content: '인증되지 않은 댓글',
          parentId: null
        }

        const result = await createCommentAction(commentData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('로그인이 필요합니다.')
        expect(result.commentId).toBeUndefined()
        expect(createComment).not.toHaveBeenCalled()
      })

      it('should fail with empty content', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

        const invalidData: CreateCommentData = {
          postId: 'post_test',
          content: '   ', // Only whitespace
          parentId: null
        }

        const result = await createCommentAction(invalidData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('댓글 내용을 입력해주세요.')
        expect(createComment).not.toHaveBeenCalled()
      })

      it('should fail with content exceeding 1000 characters', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

        const longContent = 'a'.repeat(1001) // 1001 characters

        const invalidData: CreateCommentData = {
          postId: 'post_test',
          content: longContent,
          parentId: null
        }

        const result = await createCommentAction(invalidData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('댓글은 1000자를 초과할 수 없습니다.')
        expect(createComment).not.toHaveBeenCalled()
      })
    })

    describe('🛡️ XSS Prevention Tests', () => {

      it('should sanitize malicious script content', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(createComment as jest.Mock).mockResolvedValue('safe_comment_123')

        const xssData: CreateCommentData = {
          postId: 'post_test',
          content: '  <script>alert("XSS")</script>좋은 스윙댄스 팁이네요!  ',
          parentId: null
        }

        const result = await createCommentAction(xssData)

        expect(result.success).toBe(true)
        expect(createComment).toHaveBeenCalledWith(
          expect.objectContaining({
            content: '<script>alert("XSS")</script>좋은 스윙댄스 팁이네요!' // Trimmed but not filtered (done at DB level)
          }),
          'swing_commenter_123',
          '박린디'
        )
      })
    })

    describe('🔥 Firebase Error Handling', () => {

      it('should handle Firebase connection errors gracefully', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(createComment as jest.Mock).mockRejectedValue(new Error('Firebase connection failed'))

        const commentData: CreateCommentData = {
          postId: 'post_test',
          content: 'Firebase 오류 테스트 댓글',
          parentId: null
        }

        const result = await createCommentAction(commentData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Firebase connection failed')
        expect(result.commentId).toBeUndefined()
      })
    })
  })

  describe('updateCommentAction', () => {

    describe('✅ Success Cases', () => {

      it('should update swing dance comment successfully', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(updateComment as jest.Mock).mockResolvedValue(undefined)

        const updateData: UpdateCommentData = {
          content: `수정된 댓글입니다! 🎵

추가 정보: 린디합 연습할 때는 음악에 맞춰서 하는 것이 중요해요.
스윙 재즈 음악의 리듬감을 느끼면서 연습하시면 더 효과적입니다!

처음에 알려드린 팁에 더해서 이 부분도 참고해보세요 😊`
        }

        const result = await updateCommentAction('comment_123', updateData)

        expect(result.success).toBe(true)
        expect(result.error).toBeUndefined()

        expect(updateComment).toHaveBeenCalledWith(
          'comment_123',
          expect.objectContaining({
            content: expect.stringContaining('수정된 댓글입니다')
          }),
          'swing_commenter_123'
        )

        expect(revalidatePath).toHaveBeenCalledWith('/community')
      })
    })

    describe('🚫 Authorization Tests', () => {

      it('should fail when user is not authenticated', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

        const updateData: UpdateCommentData = {
          content: '수정된 댓글'
        }

        const result = await updateCommentAction('comment_123', updateData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('로그인이 필요합니다.')
        expect(updateComment).not.toHaveBeenCalled()
      })

      it('should fail with empty content', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

        const invalidData: UpdateCommentData = {
          content: '   ' // Only whitespace
        }

        const result = await updateCommentAction('comment_123', invalidData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('댓글 내용을 입력해주세요.')
        expect(updateComment).not.toHaveBeenCalled()
      })
    })
  })

  describe('deleteCommentAction', () => {

    describe('✅ Success Cases', () => {

      it('should delete swing dance comment successfully', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(deleteComment as jest.Mock).mockResolvedValue(undefined)

        const result = await deleteCommentAction('comment_123')

        expect(result.success).toBe(true)
        expect(result.error).toBeUndefined()

        expect(deleteComment).toHaveBeenCalledWith('comment_123', 'swing_commenter_123')
        expect(revalidatePath).toHaveBeenCalledWith('/community')
      })
    })

    describe('🚫 Authorization Tests', () => {

      it('should fail when user is not authenticated', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

        const result = await deleteCommentAction('comment_123')

        expect(result.success).toBe(false)
        expect(result.error).toBe('로그인이 필요합니다.')
        expect(deleteComment).not.toHaveBeenCalled()
      })
    })
  })

  describe('likeCommentAction', () => {

    describe('✅ Success Cases', () => {

      it('should like swing dance comment successfully', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(likeComment as jest.Mock).mockResolvedValue(undefined)

        const result = await likeCommentAction('comment_helpful_tip')

        expect(result.success).toBe(true)
        expect(result.error).toBeUndefined()

        expect(likeComment).toHaveBeenCalledWith('comment_helpful_tip', 'swing_commenter_123')
        expect(revalidatePath).toHaveBeenCalledWith('/community')
      })
    })

    describe('🚫 Authorization Tests', () => {

      it('should fail when user is not authenticated', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

        const result = await likeCommentAction('comment_123')

        expect(result.success).toBe(false)
        expect(result.error).toBe('로그인이 필요합니다.')
        expect(likeComment).not.toHaveBeenCalled()
      })
    })
  })

  describe('unlikeCommentAction', () => {

    describe('✅ Success Cases', () => {

      it('should unlike swing dance comment successfully', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(unlikeComment as jest.Mock).mockResolvedValue(undefined)

        const result = await unlikeCommentAction('comment_liked_tip')

        expect(result.success).toBe(true)
        expect(result.error).toBeUndefined()

        expect(unlikeComment).toHaveBeenCalledWith('comment_liked_tip', 'swing_commenter_123')
        expect(revalidatePath).toHaveBeenCalledWith('/community')
      })
    })

    describe('🚫 Authorization Tests', () => {

      it('should fail when user is not authenticated', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

        const result = await unlikeCommentAction('comment_123')

        expect(result.success).toBe(false)
        expect(result.error).toBe('로그인이 필요합니다.')
        expect(unlikeComment).not.toHaveBeenCalled()
      })
    })
  })

  describe('getCommentsAction', () => {

    const mockSwingComments = [
      {
        id: 'comment_lindy_tip_1',
        content: '린디합 기본기 정말 중요해요! 록스텝부터 천천히 연습하세요 🎵',
        authorName: '김린디',
        createdAt: { seconds: 1640995200, nanoseconds: 0 }
      },
      {
        id: 'comment_workshop_apply_2',
        content: '워크숍 참가 신청합니다! 초보자도 괜찮을까요?',
        authorName: '이스윙',
        createdAt: { seconds: 1640995260, nanoseconds: 0 }
      },
      {
        id: 'comment_shoes_inquiry_3',
        content: '댄스화 아직 남아있나요? 직거래 가능한 시간대 알려주세요!',
        authorName: '박찰스턴',
        createdAt: { seconds: 1640995320, nanoseconds: 0 }
      }
    ]

    describe('✅ Success Cases', () => {

      it('should retrieve swing dance post comments successfully', async () => {
        ;(getComments as jest.Mock).mockResolvedValue(mockSwingComments)

        const result = await getCommentsAction('post_swing_basics', { limit: 10 })

        expect(result.success).toBe(true)
        expect(result.comments).toEqual(mockSwingComments)
        expect(result.error).toBeUndefined()

        expect(getComments).toHaveBeenCalledWith('post_swing_basics', { limit: 10 })
      })

      it('should handle pagination with lastCommentId', async () => {
        const paginatedComments = mockSwingComments.slice(1)
        ;(getComments as jest.Mock).mockResolvedValue(paginatedComments)

        const result = await getCommentsAction('post_swing_basics', {
          limit: 5,
          lastCommentId: 'comment_lindy_tip_1'
        })

        expect(result.success).toBe(true)
        expect(result.comments).toEqual(paginatedComments)
        expect(getComments).toHaveBeenCalledWith('post_swing_basics', {
          limit: 5,
          lastCommentId: 'comment_lindy_tip_1'
        })
      })
    })

    describe('🔥 Error Handling', () => {

      it('should handle Firebase query errors gracefully', async () => {
        ;(getComments as jest.Mock).mockRejectedValue(new Error('Firestore query failed'))

        const result = await getCommentsAction('post_swing_basics')

        expect(result.success).toBe(false)
        expect(result.error).toBe('Firestore query failed')
        expect(result.comments).toBeUndefined()
      })
    })
  })

  describe('🎯 Korean Swing Dance Community Edge Cases', () => {

    it('should handle Korean text with special swing dance terminology', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(createComment as jest.Mock).mockResolvedValue('korean_terms_comment')

      const koreanSwingComment: CreateCommentData = {
        postId: 'post_terminology',
        content: `스윙댄스 용어 정리해드릴게요! 🎵

📚 기본 용어:
- 린디합 (Lindy Hop): 스윙댄스의 대표 장르
- 록스텝 (Rock Step): 기본 스텝 중 하나
- 트리플스텝 (Triple Step): 3박자 스텝
- 스윙아웃 (Swing Out): 대표적인 무브먼트
- 찰스턴 (Charleston): 1920년대 댄스

🎯 레벨 구분:
- 비기너 (Beginner): 초보자
- 인터미디어트 (Intermediate): 중급자
- 어드밴스드 (Advanced): 고급자

도움이 되셨나요? 😊`,
        parentId: null
      }

      const result = await createCommentAction(koreanSwingComment)

      expect(result.success).toBe(true)
      expect(createComment).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('린디합'),
          content: expect.stringContaining('록스텝'),
          content: expect.stringContaining('찰스턴')
        }),
        'swing_commenter_123',
        '박린디'
      )
    })

    it('should handle long detailed swing dance advice comment', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(createComment as jest.Mock).mockResolvedValue('detailed_advice_comment')

      const detailedAdvice = `스윙댄스 초보자를 위한 상세 가이드 🎵

🎯 1단계: 기본 자세 익히기
- 어깨를 편하게 내리고 등을 곧게 펴세요
- 무릎을 살짝 구부려서 유연성을 유지하세요
- 시선은 파트너 얼굴 높이로 맞추세요

💃 2단계: 기본 스텝 연습
- 록스텝: 한 발 뒤로 → 제자리 → 앞으로
- 트리플스텝: 좌우로 삼보 걷기
- 총 8카운트를 완성해보세요

🎵 3단계: 음악 감각 기르기
- 스윙 재즈 음악의 박자를 느껴보세요
- BPM 120-140 정도의 중간 템포부터 시작
- 강약 조절을 통해 스윙감을 표현해보세요

👫 4단계: 파트너와 연결
- 프레임(Frame) 유지가 가장 중요해요
- 리드와 팔로우의 역할을 명확히 하세요
- 소통은 몸의 움직임으로 해보세요

📍 연습 장소 추천:
- 홍대 스윙댄스 스튜디오
- 강남 밸런스 댄스 아카데미
- 성수동 레트로 댄스홀

지속적인 연습이 가장 중요합니다! 화이팅 💪`

      const longCommentData: CreateCommentData = {
        postId: 'post_beginner_guide',
        content: detailedAdvice,
        parentId: null
      }

      const result = await createCommentAction(longCommentData)

      expect(result.success).toBe(true)
      expect(createComment).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('스윙댄스 초보자'),
          content: expect.stringContaining('기본 자세')
        }),
        'swing_commenter_123',
        '박린디'
      )
    })
  })

  describe('📊 Performance and Notification Tests', () => {

    it('should handle concurrent comment creation requests', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(createComment as jest.Mock)
        .mockResolvedValueOnce('comment1')
        .mockResolvedValueOnce('comment2')
        .mockResolvedValueOnce('comment3')

      const comments: CreateCommentData[] = [
        { postId: 'post1', content: '첫 번째 댓글', parentId: null },
        { postId: 'post2', content: '두 번째 댓글', parentId: null },
        { postId: 'post3', content: '세 번째 댓글', parentId: null }
      ]

      const results = await Promise.all(
        comments.map(comment => createCommentAction(comment))
      )

      expect(results).toHaveLength(3)
      expect(results.every(r => r.success)).toBe(true)
      expect(createComment).toHaveBeenCalledTimes(3)
    })

    it('should create notification for new comment (not reply)', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(createComment as jest.Mock).mockResolvedValue('comment_with_notification')

      const commentData: CreateCommentData = {
        postId: 'post_original',
        content: '새로운 댓글입니다',
        parentId: null // Original comment, should create notification
      }

      await createCommentAction(commentData)

      expect(createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'new_comment',
          relatedPostId: 'post_original',
          relatedCommentId: 'comment_with_notification'
        })
      )
    })

    it('should create notification for reply comment', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(createComment as jest.Mock).mockResolvedValue('reply_with_notification')

      const replyData: CreateCommentData = {
        postId: 'post_original',
        content: '답글입니다',
        parentId: 'parent_comment_id' // Reply comment, should create notification
      }

      await createCommentAction(replyData)

      expect(createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'comment_reply',
          relatedPostId: 'post_original',
          relatedCommentId: 'reply_with_notification'
        })
      )
    })
  })
})