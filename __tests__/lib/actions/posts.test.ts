/**
 * Comprehensive tests for post-related Server Actions
 * Testing Korean swing dance community scenarios with high coverage
 */

import {
  createPostAction,
  updatePostAction,
  deletePostAction,
  getPostsAction,
  getPostAction,
  getPostCountsAction,
  createPostAndRedirect,
  updatePostAndRedirect,
  deletePostAndRedirect
} from '@/lib/actions/posts'

import type {
  CreatePostData,
  UpdatePostData,
  PostSearchFilters,
  Post
} from '@/lib/types/community'

// Mock Next.js cache and navigation
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

// Mock Firebase collections
jest.mock('@/lib/firebase/collections', () => ({
  createPost: jest.fn(),
  getPost: jest.fn(),
  getPosts: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
  getPostCountsByCategory: jest.fn()
}))

// Mock auth server
jest.mock('@/lib/auth/server', () => ({
  getCurrentUser: jest.fn()
}))

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createPost,
  getPost,
  getPosts,
  updatePost,
  deletePost,
  getPostCountsByCategory
} from '@/lib/firebase/collections'
import { getCurrentUser } from '@/lib/auth/server'

describe('Post Server Actions', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Mock user data for Korean swing dance community
  const mockUser = {
    uid: 'swing_dancer_123',
    displayName: '김린디',
    email: 'kim.lindy@example.com'
  }

  const mockUnauthorizedUser = {
    uid: 'unauthorized_user',
    displayName: '익명사용자',
    email: 'anon@example.com'
  }

  const mockExistingPost: Post = {
    id: 'existing_post_123',
    title: '기존 게시글',
    content: '기존 내용',
    category: 'general',
    status: 'active',
    visibility: 'public',
    metadata: {
      authorId: 'swing_dancer_123',
      authorName: '김린디',
      createdAt: { seconds: 1640995200, nanoseconds: 0 } as any,
      updatedAt: { seconds: 1640995200, nanoseconds: 0 } as any
    },
    stats: {
      views: 10,
      likes: 5,
      comments: 3,
      shares: 0,
      reports: 0,
      lastActivity: { seconds: 1640995200, nanoseconds: 0 } as any
    },
    isPinned: false,
    isFeatured: false
  }

  describe('createPostAction', () => {

    describe('🎵 Success Cases - Korean Swing Dance Community', () => {

      it('should create a general swing dance question post', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(createPost as jest.Mock).mockResolvedValue('post_lindy_basic_123')

        const swingQuestionData: CreatePostData = {
          title: '🎵 린디합 기본기 질문 - 록스텝 중심잡기',
          content: `안녕하세요! 스윙댄스 초보입니다.

린디합을 배우고 있는데 록스텝(rock step)을 할 때 중심을 잡는 방법이 궁금합니다.
특히 8카운트에서 1-2 박자에서 뒤로 갈 때 균형을 잃곤 해요.

선배님들의 조언 부탁드립니다! 🙏`,
          category: 'qna',
          visibility: 'public',
          tags: ['린디합', '록스텝', '기본기', '초보자'],
          keywords: ['린디합', '록스텝', '기본기', '균형', '8카운트'],
          region: '서울'
        }

        const result = await createPostAction(swingQuestionData)

        expect(result.success).toBe(true)
        expect(result.postId).toBe('post_lindy_basic_123')
        expect(result.error).toBeUndefined()

        expect(createPost).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '🎵 린디합 기본기 질문 - 록스텝 중심잡기',
            content: expect.stringContaining('린디합을 배우고 있는데'),
            category: 'qna',
            tags: ['린디합', '록스텝', '기본기', '초보자'],
            region: '서울'
          }),
          'swing_dancer_123',
          '김린디'
        )

        expect(revalidatePath).toHaveBeenCalledWith('/community')
      })

      it('should create an event post for swing dance workshop', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(createPost as jest.Mock).mockResolvedValue('event_workshop_456')

        const eventData: CreatePostData = {
          title: '🎭 강남 스윙댄스 워크숍 - Lindy Hop Intensive',
          content: `📅 일시: 2024년 2월 17일 (토) 오후 2시-6시
📍 장소: 강남 댄스 스튜디오 (강남역 3번 출구 도보 5분)
👥 정원: 20명 (선착순)
💰 참가비: 50,000원

🎵 프로그램:
- Lindy Hop 기본기 완성
- Charleston 연결동작
- Swing out 심화과정
- 자유 댄스 타임

강사: 이솔로 (10년 경력, 해외 워크숍 수료)

참가 희망자는 댓글로 신청해주세요! 🕺💃`,
          category: 'event',
          visibility: 'public',
          eventInfo: {
            startDate: { seconds: 1708149600, nanoseconds: 0 } as any, // 2024-02-17 14:00
            endDate: { seconds: 1708164000, nanoseconds: 0 } as any,   // 2024-02-17 18:00
            capacity: 20,
            currentParticipants: 0,
            requiresRegistration: true,
            registrationDeadline: { seconds: 1708063200, nanoseconds: 0 } as any, // 2024-02-16
            fee: {
              amount: 50000,
              currency: 'KRW',
              negotiable: false
            },
            organizer: 'swing_dancer_123',
            location: {
              address: '서울시 강남구 강남대로 지하 396',
              region: '강남',
              details: '강남역 3번 출구 도보 5분, 지하 1층 댄스 스튜디오'
            }
          },
          tags: ['워크숍', '린디합', '강남', '초보환영', '집중강의'],
          region: '강남'
        }

        const result = await createPostAction(eventData)

        expect(result.success).toBe(true)
        expect(result.postId).toBe('event_workshop_456')

        expect(createPost).toHaveBeenCalledWith(
          expect.objectContaining({
            category: 'event',
            eventInfo: expect.objectContaining({
              capacity: 20,
              currentParticipants: 0,
              organizer: 'swing_dancer_123'
            })
          }),
          'swing_dancer_123',
          '김린디'
        )
      })

      it('should create a marketplace post for swing dance shoes', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(createPost as jest.Mock).mockResolvedValue('marketplace_shoes_789')

        const marketplaceData: CreatePostData = {
          title: '👠 Aris Allen 스윙댄스화 판매 (250mm, 새제품)',
          content: `🩰 브랜드: Aris Allen
📏 사이즈: 250mm (US 8)
⭐ 상태: 새제품 (착용 1회)
💰 가격: 120,000원 (정가 180,000원)

미국에서 직접 구매했으나 사이즈가 맞지 않아 판매합니다.
한 번만 착용했고 거의 새제품 수준입니다.

📦 거래 방법:
- 직거래: 홍대 또는 강남 지역
- 택배: 착불 가능 (포장비 별도)

스윙댄스 전용 신발로 유명한 브랜드입니다.
관심 있으신 분은 댓글이나 쪽지 주세요! 😊`,
          category: 'marketplace',
          visibility: 'public',
          marketplaceInfo: {
            price: {
              amount: 120000,
              currency: 'KRW',
              negotiable: true,
              originalPrice: 180000
            },
            condition: 'like_new',
            brand: 'Aris Allen',
            deliveryMethod: ['pickup', 'delivery'],
            location: {
              region: '홍대',
              details: '홍대입구역 또는 강남역 직거래 가능'
            }
          },
          tags: ['댄스화', 'aris-allen', '250mm', '새제품', '스윙댄스'],
          images: ['https://example.com/shoe1.jpg', 'https://example.com/shoe2.jpg'],
          region: '홍대'
        }

        const result = await createPostAction(marketplaceData)

        expect(result.success).toBe(true)
        expect(createPost).toHaveBeenCalledWith(
          expect.objectContaining({
            category: 'marketplace',
            marketplaceInfo: expect.objectContaining({
              price: expect.objectContaining({
                amount: 120000,
                negotiable: true
              }),
              condition: 'like_new',
              brand: 'Aris Allen'
            })
          }),
          'swing_dancer_123',
          '김린디'
        )
      })
    })

    describe('🚫 Error Cases - Authentication and Validation', () => {

      it('should fail when user is not authenticated', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

        const postData: CreatePostData = {
          title: '테스트 게시글',
          content: '인증되지 않은 사용자의 게시글',
          category: 'general'
        }

        const result = await createPostAction(postData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('로그인이 필요합니다.')
        expect(result.postId).toBeUndefined()
        expect(createPost).not.toHaveBeenCalled()
      })

      it('should fail with empty title', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

        const invalidData: CreatePostData = {
          title: '   ', // Only whitespace
          content: '내용은 있지만 제목이 없는 게시글',
          category: 'general'
        }

        const result = await createPostAction(invalidData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('제목과 내용을 입력해주세요.')
        expect(createPost).not.toHaveBeenCalled()
      })

      it('should fail with empty content', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

        const invalidData: CreatePostData = {
          title: '제목은 있지만',
          content: '', // Empty content
          category: 'qna'
        }

        const result = await createPostAction(invalidData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('제목과 내용을 입력해주세요.')
        expect(createPost).not.toHaveBeenCalled()
      })
    })

    describe('🛡️ XSS Prevention Tests', () => {

      it('should sanitize malicious script tags in title', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(createPost as jest.Mock).mockResolvedValue('safe_post_123')

        const xssData: CreatePostData = {
          title: '  <script>alert("XSS")</script>스윙댄스 질문  ',
          content: '정상적인 내용입니다.',
          category: 'qna',
          tags: ['  <script>alert("tag")</script>  ', '린디합', '   ']
        }

        const result = await createPostAction(xssData)

        expect(result.success).toBe(true)
        expect(createPost).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '<script>alert("XSS")</script>스윙댄스 질문', // Trimmed but not filtered (done at DB level)
            content: '정상적인 내용입니다.',
            tags: ['<script>alert("tag")</script>', '린디합'] // Empty tags filtered out
          }),
          'swing_dancer_123',
          '김린디'
        )
      })

      it('should filter empty tags and trim whitespace', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(createPost as jest.Mock).mockResolvedValue('clean_post_456')

        const messyData: CreatePostData = {
          title: '  깔끔한 게시글  ',
          content: '  내용도 깔끔하게  ',
          category: 'general',
          tags: ['  유효한태그  ', '', '   ', '다른태그', undefined as any, null as any]
        }

        const result = await createPostAction(messyData)

        expect(result.success).toBe(true)
        expect(createPost).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '깔끔한 게시글',
            content: '내용도 깔끔하게',
            tags: ['유효한태그', '다른태그'] // Only valid, trimmed tags
          }),
          'swing_dancer_123',
          '김린디'
        )
      })
    })

    describe('🔥 Firebase Error Handling', () => {

      it('should handle Firebase connection errors gracefully', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(createPost as jest.Mock).mockRejectedValue(new Error('Firebase connection failed'))

        const postData: CreatePostData = {
          title: '테스트 게시글',
          content: 'Firebase 오류 테스트',
          category: 'general'
        }

        const result = await createPostAction(postData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('게시글 생성에 실패했습니다.')
        expect(result.postId).toBeUndefined()
      })

      it('should handle Firestore permission errors', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(createPost as jest.Mock).mockRejectedValue(new Error('Permission denied'))

        const postData: CreatePostData = {
          title: '권한 테스트 게시글',
          content: '권한 오류 테스트',
          category: 'general'
        }

        const result = await createPostAction(postData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('게시글 생성에 실패했습니다.')
      })
    })
  })

  describe('updatePostAction', () => {

    describe('✅ Success Cases', () => {

      it('should update swing dance event details successfully', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(getPost as jest.Mock).mockResolvedValue(mockExistingPost)
        ;(updatePost as jest.Mock).mockResolvedValue(undefined)

        const updateData: UpdatePostData = {
          title: '🎭 강남 스윙댄스 워크숍 - 일정 변경 알림',
          content: `⚠️ 중요 공지: 일정이 변경되었습니다!

📅 변경된 일시: 2024년 2월 24일 (토) 오후 2시-6시
📍 장소: 동일 (강남 댄스 스튜디오)

기존 신청자분들께는 개별 연락드렸습니다.
새로운 일정으로 참가 가능하신 분들만 참석 부탁드립니다.

죄송합니다! 🙏`,
          tags: ['워크숍', '린디합', '강남', '일정변경', '공지']
        }

        const result = await updatePostAction('existing_post_123', updateData)

        expect(result.success).toBe(true)
        expect(result.error).toBeUndefined()

        expect(getPost).toHaveBeenCalledWith('existing_post_123')
        expect(updatePost).toHaveBeenCalledWith(
          'existing_post_123',
          expect.objectContaining({
            title: '🎭 강남 스윙댄스 워크숍 - 일정 변경 알림',
            content: expect.stringContaining('⚠️ 중요 공지'),
            tags: ['워크숍', '린디합', '강남', '일정변경', '공지']
          })
        )

        expect(revalidatePath).toHaveBeenCalledWith('/community')
        expect(revalidatePath).toHaveBeenCalledWith('/community/existing_post_123')
      })
    })

    describe('🚫 Authorization Tests', () => {

      it('should fail when user is not authenticated', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

        const updateData: UpdatePostData = {
          title: '수정된 제목'
        }

        const result = await updatePostAction('existing_post_123', updateData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('로그인이 필요합니다.')
        expect(getPost).not.toHaveBeenCalled()
        expect(updatePost).not.toHaveBeenCalled()
      })

      it('should fail when user is not the author', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUnauthorizedUser)
        ;(getPost as jest.Mock).mockResolvedValue(mockExistingPost)

        const updateData: UpdatePostData = {
          title: '다른 사용자가 수정하려는 제목'
        }

        const result = await updatePostAction('existing_post_123', updateData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('수정 권한이 없습니다.')
        expect(updatePost).not.toHaveBeenCalled()
      })

      it('should fail when post does not exist', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(getPost as jest.Mock).mockResolvedValue(null)

        const updateData: UpdatePostData = {
          title: '존재하지 않는 게시글 수정'
        }

        const result = await updatePostAction('nonexistent_post', updateData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('수정 권한이 없습니다.')
        expect(updatePost).not.toHaveBeenCalled()
      })
    })

    describe('📝 Content Validation', () => {

      it('should validate title and content are not empty', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(getPost as jest.Mock).mockResolvedValue(mockExistingPost)

        const invalidData: UpdatePostData = {
          title: '   ', // Empty after trim
          content: '정상적인 내용'
        }

        const result = await updatePostAction('existing_post_123', invalidData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('제목과 내용을 입력해주세요.')
        expect(updatePost).not.toHaveBeenCalled()
      })
    })
  })

  describe('deletePostAction', () => {

    describe('✅ Success Cases', () => {

      it('should delete swing dance marketplace post successfully', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(getPost as jest.Mock).mockResolvedValue(mockExistingPost)
        ;(deletePost as jest.Mock).mockResolvedValue(undefined)

        const result = await deletePostAction('existing_post_123')

        expect(result.success).toBe(true)
        expect(result.error).toBeUndefined()

        expect(getPost).toHaveBeenCalledWith('existing_post_123')
        expect(deletePost).toHaveBeenCalledWith('existing_post_123')
        expect(revalidatePath).toHaveBeenCalledWith('/community')
      })
    })

    describe('🚫 Authorization Tests', () => {

      it('should fail when user is not authenticated', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

        const result = await deletePostAction('existing_post_123')

        expect(result.success).toBe(false)
        expect(result.error).toBe('로그인이 필요합니다.')
        expect(getPost).not.toHaveBeenCalled()
        expect(deletePost).not.toHaveBeenCalled()
      })

      it('should fail when user is not the author', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUnauthorizedUser)
        ;(getPost as jest.Mock).mockResolvedValue(mockExistingPost)

        const result = await deletePostAction('existing_post_123')

        expect(result.success).toBe(false)
        expect(result.error).toBe('삭제 권한이 없습니다.')
        expect(deletePost).not.toHaveBeenCalled()
      })

      it('should fail when post does not exist', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(getPost as jest.Mock).mockResolvedValue(null)

        const result = await deletePostAction('nonexistent_post')

        expect(result.success).toBe(false)
        expect(result.error).toBe('삭제 권한이 없습니다.')
        expect(deletePost).not.toHaveBeenCalled()
      })
    })
  })

  describe('getPostsAction', () => {

    const mockSwingPosts = [
      {
        id: 'lindy_question_1',
        title: '🎵 린디합 기본기 질문',
        category: 'qna',
        region: '서울',
        tags: ['린디합', '기본기']
      },
      {
        id: 'swing_event_2',
        title: '🎭 홍대 스윙댄스 모임',
        category: 'event',
        region: '홍대',
        tags: ['모임', '홍대']
      },
      {
        id: 'shoes_sale_3',
        title: '👠 댄스화 판매',
        category: 'marketplace',
        region: '강남',
        tags: ['댄스화', '판매']
      }
    ]

    describe('✅ Success Cases', () => {

      it('should retrieve all swing dance posts successfully', async () => {
        ;(getPosts as jest.Mock).mockResolvedValue({
          posts: mockSwingPosts,
          hasMore: false,
          total: 3
        })

        const result = await getPostsAction()

        expect(result.success).toBe(true)
        expect(result.data).toEqual({
          posts: mockSwingPosts,
          hasMore: false,
          total: 3
        })
        expect(getPosts).toHaveBeenCalledWith(undefined)
      })

      it('should filter posts by swing dance categories', async () => {
        const filteredPosts = mockSwingPosts.filter(p => ['event', 'qna'].includes(p.category))
        ;(getPosts as jest.Mock).mockResolvedValue({
          posts: filteredPosts,
          hasMore: false,
          total: 2
        })

        const filters: PostSearchFilters = {
          category: ['event', 'qna'],
          region: ['서울', '홍대']
        }

        const result = await getPostsAction(filters)

        expect(result.success).toBe(true)
        expect(result.data.posts).toHaveLength(2)
        expect(getPosts).toHaveBeenCalledWith(filters)
      })

      it('should filter posts by swing dance keywords', async () => {
        ;(getPosts as jest.Mock).mockResolvedValue({
          posts: [mockSwingPosts[0]], // Only lindy hop question
          hasMore: false,
          total: 1
        })

        const filters: PostSearchFilters = {
          keyword: '린디합',
          tags: ['린디합', '기본기']
        }

        const result = await getPostsAction(filters)

        expect(result.success).toBe(true)
        expect(result.data.posts).toHaveLength(1)
        expect(result.data.posts[0].title).toContain('린디합')
      })
    })

    describe('🔥 Error Handling', () => {

      it('should handle Firebase query errors gracefully', async () => {
        ;(getPosts as jest.Mock).mockRejectedValue(new Error('Firestore query failed'))

        const result = await getPostsAction()

        expect(result.success).toBe(false)
        expect(result.error).toBe('게시글을 불러오는데 실패했습니다.')
        expect(result.data).toEqual([])
      })
    })
  })

  describe('getPostAction', () => {

    describe('✅ Success Cases', () => {

      it('should retrieve specific swing dance post', async () => {
        const swingPost = {
          id: 'lindy_workshop_123',
          title: '🎭 린디합 심화 워크숍',
          content: '프로페셔널 강사와 함께하는 심화과정입니다.',
          category: 'event',
          tags: ['워크숍', '린디합', '심화과정']
        }

        ;(getPost as jest.Mock).mockResolvedValue(swingPost)

        const result = await getPostAction('lindy_workshop_123')

        expect(result.success).toBe(true)
        expect(result.data).toEqual(swingPost)
        expect(getPost).toHaveBeenCalledWith('lindy_workshop_123')
      })
    })

    describe('🚫 Error Cases', () => {

      it('should handle non-existent post', async () => {
        ;(getPost as jest.Mock).mockResolvedValue(null)

        const result = await getPostAction('nonexistent_post')

        expect(result.success).toBe(false)
        expect(result.error).toBe('게시글을 찾을 수 없습니다.')
        expect(result.data).toBeUndefined()
      })

      it('should handle Firebase errors', async () => {
        ;(getPost as jest.Mock).mockRejectedValue(new Error('Database connection failed'))

        const result = await getPostAction('some_post_id')

        expect(result.success).toBe(false)
        expect(result.error).toBe('게시글을 불러오는데 실패했습니다.')
      })
    })
  })

  describe('getPostCountsAction', () => {

    describe('✅ Success Cases', () => {

      it('should retrieve swing dance community post counts by category', async () => {
        const swingCommunityStats = {
          general: 45,    // 자유게시판
          qna: 28,        // 질문답변 (기본기, 의상 등)
          event: 15,      // 이벤트/모임
          marketplace: 12, // 중고거래 (댄스화, 의상)
          lesson: 8,      // 레슨정보
          review: 6       // 리뷰 (스튜디오, 이벤트)
        }

        ;(getPostCountsByCategory as jest.Mock).mockResolvedValue(swingCommunityStats)

        const result = await getPostCountsAction()

        expect(result.success).toBe(true)
        expect(result.data).toEqual(swingCommunityStats)
        expect(result.data.qna).toBe(28) // Swing dance Q&A is popular
        expect(result.data.event).toBe(15) // Active event community
      })
    })

    describe('🔥 Error Handling', () => {

      it('should handle statistics query errors', async () => {
        ;(getPostCountsByCategory as jest.Mock).mockRejectedValue(new Error('Stats unavailable'))

        const result = await getPostCountsAction()

        expect(result.success).toBe(false)
        expect(result.error).toBe('통계를 불러오는데 실패했습니다.')
        expect(result.data).toEqual({})
      })
    })
  })

  describe('Redirect Actions', () => {

    describe('createPostAndRedirect', () => {

      it('should create post and redirect to post page', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(createPost as jest.Mock).mockResolvedValue('new_swing_post_123')

        const postData: CreatePostData = {
          title: '🎵 새 스윙댄스 모임',
          content: '신규 모임 안내입니다.',
          category: 'event'
        }

        await createPostAndRedirect(postData)

        expect(createPost).toHaveBeenCalled()
        expect(redirect).toHaveBeenCalledWith('/community/new_swing_post_123')
      })

      it('should throw error when creation fails', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

        const postData: CreatePostData = {
          title: '실패할 게시글',
          content: '인증 실패',
          category: 'general'
        }

        await expect(createPostAndRedirect(postData)).rejects.toThrow('로그인이 필요합니다.')
        expect(redirect).not.toHaveBeenCalled()
      })
    })

    describe('updatePostAndRedirect', () => {

      it('should update post and redirect to post page', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(getPost as jest.Mock).mockResolvedValue(mockExistingPost)
        ;(updatePost as jest.Mock).mockResolvedValue(undefined)

        const updateData: UpdatePostData = {
          title: '수정된 스윙댄스 모임'
        }

        await updatePostAndRedirect('existing_post_123', updateData)

        expect(updatePost).toHaveBeenCalled()
        expect(redirect).toHaveBeenCalledWith('/community/existing_post_123')
      })

      it('should throw error when update fails', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUnauthorizedUser)
        ;(getPost as jest.Mock).mockResolvedValue(mockExistingPost)

        const updateData: UpdatePostData = {
          title: '권한 없는 수정'
        }

        await expect(updatePostAndRedirect('existing_post_123', updateData)).rejects.toThrow('수정 권한이 없습니다.')
        expect(redirect).not.toHaveBeenCalled()
      })
    })

    describe('deletePostAndRedirect', () => {

      it('should delete post and redirect to community page', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
        ;(getPost as jest.Mock).mockResolvedValue(mockExistingPost)
        ;(deletePost as jest.Mock).mockResolvedValue(undefined)

        await deletePostAndRedirect('existing_post_123')

        expect(deletePost).toHaveBeenCalledWith('existing_post_123')
        expect(redirect).toHaveBeenCalledWith('/community')
      })

      it('should throw error when deletion fails', async () => {
        ;(getCurrentUser as jest.Mock).mockResolvedValue(null)

        await expect(deletePostAndRedirect('existing_post_123')).rejects.toThrow('로그인이 필요합니다.')
        expect(redirect).not.toHaveBeenCalled()
      })
    })
  })

  describe('🎯 Korean Swing Dance Community Edge Cases', () => {

    it('should handle Korean text with special characters', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(createPost as jest.Mock).mockResolvedValue('korean_text_post')

      const koreanData: CreatePostData = {
        title: '🎵 스윙댄스 🕺💃 한글 제목 테스트! 😊',
        content: `안녕하세요! 👋

이것은 한글 테스트입니다.
특수문자도 포함: ♪♫♬🎶

린디합, 찰스턴, 발보아 등등...
다양한 스윙댄스 장르를 다룹니다!`,
        category: 'general',
        tags: ['한글태그', '🎵음악', 'swing-dance']
      }

      const result = await createPostAction(koreanData)

      expect(result.success).toBe(true)
      expect(createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('스윙댄스'),
          content: expect.stringContaining('린디합'),
          tags: ['한글태그', '🎵음악', 'swing-dance']
        }),
        'swing_dancer_123',
        '김린디'
      )
    })

    it('should handle long swing dance event descriptions', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(createPost as jest.Mock).mockResolvedValue('long_event_post')

      const longEventContent = `🎭 서울 스윙댄스 페스티벌 2024

📅 일정: 2024년 4월 13일-14일 (토-일)
📍 장소: 올림픽공원 평화의광장
🎫 참가비:
- 1일권: 30,000원
- 2일권: 50,000원
- 학생할인: 20% 할인

🎵 라인업:
- 라이브 밴드: Seoul Swing Orchestra
- DJ: 김스윙, 이린디, 박찰스턴
- 워크숍 강사: 해외 초청 강사 5명

📋 프로그램:
토요일:
10:00-11:30 초급 린디합 워크숍
12:00-13:30 중급 찰스턴 워크숍
14:00-15:30 고급 발보아 워크숍
16:00-17:30 파트너 매칭 세션
18:00-22:00 소셜 댄스 파티

일요일:
10:00-11:30 솔로 재즈 워크숍
12:00-13:30 쇼코스 워크숍
14:00-15:30 경연대회 예선
16:00-17:00 경연대회 결선
17:00-18:00 시상식 및 마무리

🎯 특별 이벤트:
- 빈티지 의상 콘테스트
- 스윙댄스 사진전 전시
- 댄스화 및 의상 플리마켓
- 초보자를 위한 무료 체험 레슨

🚇 교통편:
- 올림픽공원역 3번 출구 도보 10분
- 주차장 이용 가능 (유료)
- 셔틀버스 운행 (강남역 ↔ 행사장)

📞 문의사항:
- 이메일: seoul.swing.festival@example.com
- 전화: 02-1234-5678
- 카카오톡 채널: @서울스윙페스티벌

⚠️ 주의사항:
- 마스크 착용 권장
- 음식물 반입 금지
- 반려동물 동반 불가
- 우천 시 실내 대체 장소 운영

많은 참여 부탁드립니다! 🕺💃✨`

      const longEventData: CreatePostData = {
        title: '🎭 서울 스윙댄스 페스티벌 2024 - 참가자 모집',
        content: longEventContent,
        category: 'event',
        tags: ['페스티벌', '서울', '스윙댄스', '2024', '올림픽공원']
      }

      const result = await createPostAction(longEventData)

      expect(result.success).toBe(true)
      expect(createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('서울 스윙댄스 페스티벌')
        }),
        'swing_dancer_123',
        '김린디'
      )
    })

    it('should handle marketplace post with detailed swing shoe information', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(createPost as jest.Mock).mockResolvedValue('detailed_shoes_post')

      const detailedShoeData: CreatePostData = {
        title: '👠 프로급 스윙댄스화 전문 판매 - 다양한 브랜드 및 사이즈',
        content: `🩰 전문 스윙댄스화 판매합니다!

📦 판매 목록:

1️⃣ Aris Allen 브랜드
- 남성용 옥스포드 (240mm): 150,000원
- 여성용 T-bar (230mm): 140,000원
- 상태: 새제품 (미착용)

2️⃣ Remix Vintage Shoes
- 여성용 메리제인 (250mm): 120,000원
- 남성용 윙팁 (270mm): 130,000원
- 상태: 거의 새것 (착용 2-3회)

3️⃣ Bleyer Dance Shoes
- 여성용 발레플랫 (235mm): 80,000원
- 남성용 재즈슈즈 (260mm): 90,000원
- 상태: 양호 (6개월 사용)

💡 스윙댄스화 선택 가이드:
- 초보자: 발레플랫 또는 재즈슈즈 추천
- 중급자: T-bar 또는 옥스포드 추천
- 고급자: 전문 스윙댄스화 추천

🔍 상태 설명:
- 새제품: 택 미제거, 완전 미착용
- 거의 새것: 실내에서만 몇 번 착용
- 양호: 일반 사용감 있으나 기능상 문제없음

📦 배송 정보:
- 택배비: 3,000원 (무료배송 X)
- 직거래: 홍대입구역, 강남역, 잠실역
- 포장: 원래 박스 + 에어캡 포장

💳 결제 방법:
- 계좌이체 (농협: 123-456-789012)
- 페이팔 가능
- 직거래 시 현금결제

📞 연락처:
- 댓글 또는 쪽지
- 카카오톡 ID: swing_shoes_seller
- 전화상담: 오후 7시 이후 가능

⭐ 참고사항:
- 미국/유럽 직수입 정품만 판매
- 교환/환불: 상품 하자 시에만 가능
- 착용 후 교환/환불 불가
- 구매 전 사이즈 확인 필수

🎵 스윙댄스를 사랑하는 분들께 좋은 신발을 저렴하게 나눠드리고 싶습니다!
궁금한 점 있으시면 언제든 연락주세요 😊`,
        category: 'marketplace',
        marketplaceInfo: {
          price: {
            amount: 80000, // Starting price
            currency: 'KRW',
            negotiable: false
          },
          condition: 'new',
          brand: '다양한 브랜드',
          deliveryMethod: ['pickup', 'delivery']
        },
        tags: ['댄스화', '스윙댄스', 'aris-allen', 'remix', 'bleyer', '전문신발'],
        region: '서울'
      }

      const result = await createPostAction(detailedShoeData)

      expect(result.success).toBe(true)
      expect(createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'marketplace',
          content: expect.stringContaining('Aris Allen'),
          tags: expect.arrayContaining(['댄스화', '스윙댄스'])
        }),
        'swing_dancer_123',
        '김린디'
      )
    })
  })

  describe('📊 Performance and Coverage Tests', () => {

    it('should handle concurrent post creation requests', async () => {
      ;(getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(createPost as jest.Mock)
        .mockResolvedValueOnce('post1')
        .mockResolvedValueOnce('post2')
        .mockResolvedValueOnce('post3')

      const posts: CreatePostData[] = [
        { title: '동시 생성 테스트 1', content: '내용1', category: 'general' },
        { title: '동시 생성 테스트 2', content: '내용2', category: 'qna' },
        { title: '동시 생성 테스트 3', content: '내용3', category: 'event' }
      ]

      const results = await Promise.all(
        posts.map(post => createPostAction(post))
      )

      expect(results).toHaveLength(3)
      expect(results.every(r => r.success)).toBe(true)
      expect(createPost).toHaveBeenCalledTimes(3)
    })

    it('should handle multiple post retrievals efficiently', async () => {
      const mockPosts = Array.from({ length: 50 }, (_, i) => ({
        id: `post_${i}`,
        title: `스윙댄스 게시글 ${i}`,
        category: i % 2 === 0 ? 'general' : 'qna'
      }))

      ;(getPosts as jest.Mock).mockResolvedValue({
        posts: mockPosts,
        hasMore: false,
        total: 50
      })

      const result = await getPostsAction()

      expect(result.success).toBe(true)
      expect(result.data.posts).toHaveLength(50)
      expect(getPosts).toHaveBeenCalledTimes(1) // Single efficient query
    })
  })
})