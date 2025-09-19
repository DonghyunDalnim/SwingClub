/**
 * Comprehensive tests for Firestore collection helpers in lib/firebase/collections.ts
 */

import {
  collections,
  createPost,
  getPost,
  getPosts,
  updatePost,
  deletePost,
  createComment,
  getComments,
  updateComment,
  deleteComment,
  toggleLike,
  getUserLikes,
  createReport,
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  getPostCountsByCategory,
  getTrendingPosts,
  searchPosts
} from '../lib/firebase/collections'

import type {
  CreatePostData,
  CreateCommentData,
  UpdatePostData,
  UpdateCommentData,
  PostSearchFilters
} from '../lib/types/community'

// Mock Firebase/Firestore using factory functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn().mockImplementation((_db, path) => ({ id: path, path })),
  doc: jest.fn().mockReturnValue({ id: 'mockDoc' }),
  query: jest.fn().mockReturnValue({}),
  where: jest.fn().mockReturnValue({}),
  orderBy: jest.fn().mockReturnValue({}),
  limit: jest.fn().mockReturnValue({}),
  startAfter: jest.fn().mockReturnValue({}),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  increment: jest.fn().mockReturnValue({}),
  serverTimestamp: jest.fn().mockReturnValue({ seconds: 1640995200, nanoseconds: 0 })
}))

jest.mock('../lib/firebase', () => ({
  db: {
    app: 'mocked-app'
  }
}))

// Import the mocked functions (they're already mocked above)
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore'

describe('Firestore Collections', () => {

  beforeEach(() => {
    jest.clearAllMocks()

    // Reset mock implementations after clearing
    ;(collection as jest.Mock).mockImplementation((_db, path) => ({ id: path, path }))
    ;(doc as jest.Mock).mockReturnValue({ id: 'mockDoc' })
    ;(query as jest.Mock).mockReturnValue({})
    ;(where as jest.Mock).mockReturnValue({})
    ;(orderBy as jest.Mock).mockReturnValue({})
    ;(limit as jest.Mock).mockReturnValue({})
    ;(startAfter as jest.Mock).mockReturnValue({})
    ;(increment as jest.Mock).mockReturnValue({})
    ;(serverTimestamp as jest.Mock).mockReturnValue({ seconds: 1640995200, nanoseconds: 0 })
  })

  describe('Collections Configuration', () => {
    it('should have all required collections defined', () => {
      expect(collections.posts).toBeDefined()
      expect(collections.comments).toBeDefined()
      expect(collections.likes).toBeDefined()
      expect(collections.reports).toBeDefined()
      expect(collections.notifications).toBeDefined()
      expect(collections.users).toBeDefined()
      expect(collections.communityStats).toBeDefined()
    })
  })

  describe('Post CRUD Operations', () => {

    describe('createPost', () => {
      it('should create a general post successfully', async () => {
        const mockDocRef = { id: 'post123' };
        (addDoc as jest.Mock).mockResolvedValue(mockDocRef as any)

        const postData: CreatePostData = {
          title: '🎵 스윙댄스 기본기 질문',
          content: '린디합에서 록스텝을 할 때 중심을 잡는 방법이 궁금합니다.',
          category: 'qna',
          visibility: 'public',
          tags: ['린디합', '기본기', '초보'],
          keywords: ['린디합', '록스텝', '기본기'],
          region: '서울'
        }

        const postId = await createPost(postData, 'user123', '김스윙')

        expect(addDoc as jest.Mock).toHaveBeenCalledWith(
          collections.posts,
          expect.objectContaining({
            title: postData.title,
            content: postData.content,
            category: 'qna',
            status: 'active',
            visibility: 'public',
            tags: ['린디합', '기본기', '초보'],
            region: '서울',
            metadata: expect.objectContaining({
              authorId: 'user123',
              authorName: '김스윙'
            }),
            stats: expect.objectContaining({
              views: 0,
              likes: 0,
              comments: 0
            })
          })
        )
        expect(postId).toBe('post123')
      })

      it('should create an event post with event info', async () => {
        const mockDocRef = { id: 'event123' };
        (addDoc as jest.Mock).mockResolvedValue(mockDocRef as any)

        const eventData: CreatePostData = {
          title: '🎵 강남 스윙댄스 정기모임',
          content: '매주 화요일 오후 7시 강남에서 열리는 정기모임입니다.',
          category: 'event',
          visibility: 'public',
          eventInfo: {
            startDate: { seconds: 1640995200, nanoseconds: 0 } as any,
            endDate: { seconds: 1641002400, nanoseconds: 0 } as any,
            capacity: 25,
            requiresRegistration: true,
            organizer: 'user123'
          },
          tags: ['강남', '정기모임', '린디합'],
          region: '강남'
        }

        const postId = await createPost(eventData, 'user123', '김스윙')

        expect(addDoc as jest.Mock).toHaveBeenCalledWith(
          collections.posts,
          expect.objectContaining({
            category: 'event',
            eventInfo: expect.objectContaining({
              startDate: eventData.eventInfo?.startDate,
              capacity: 25,
              currentParticipants: 0,
              organizer: 'user123'
            })
          })
        )
        expect(postId).toBe('event123')
      })

      it('should create a marketplace post with marketplace info', async () => {
        const mockDocRef = { id: 'marketplace123' };
        (addDoc as jest.Mock).mockResolvedValue(mockDocRef as any)

        const marketplaceData: CreatePostData = {
          title: '👠 스윙댄스화 판매 (새제품)',
          content: 'Aris Allen 브랜드 250mm 새제품입니다.',
          category: 'marketplace',
          marketplaceInfo: {
            price: {
              amount: 120000,
              currency: 'KRW',
              negotiable: true,
              originalPrice: 180000
            },
            condition: 'new',
            brand: 'Aris Allen',
            deliveryMethod: ['pickup', 'delivery']
          },
          tags: ['댄스화', 'aris-allen', '새제품'],
          region: '서울'
        }

        const postId = await createPost(marketplaceData, 'user456', '이린디')

        expect(addDoc as jest.Mock).toHaveBeenCalledWith(
          collections.posts,
          expect.objectContaining({
            category: 'marketplace',
            marketplaceInfo: expect.objectContaining({
              price: {
                amount: 120000,
                currency: 'KRW',
                negotiable: true,
                originalPrice: 180000
              },
              condition: 'new',
              status: 'selling'
            })
          })
        )
        expect(postId).toBe('marketplace123')
      })
    })

    describe('getPost', () => {
      it('should retrieve post and increment view count', async () => {
        const mockPost = {
          id: 'post123',
          title: '🎵 홍대 스윙댄스 모임',
          content: '매주 목요일 홍대에서 모임합니다.',
          category: 'event',
          status: 'active',
          stats: { views: 10, likes: 5, comments: 3 }
        }

        const mockDocSnap = {
          exists: () => true,
          id: 'post123',
          data: () => mockPost
        };

        (getDoc as jest.Mock).mockResolvedValue(mockDocSnap as any)
        (updateDoc as jest.Mock).mockResolvedValue(undefined)

        const result = await getPost('post123')

        expect(getDoc as jest.Mock).toHaveBeenCalled()
        expect(updateDoc as jest.Mock).toHaveBeenCalledWith(
          {},
          expect.objectContaining({
            'stats.views': expect.anything(),
            'stats.lastActivity': expect.anything()
          })
        )
        expect(result).toEqual({ ...mockPost, id: 'post123' })
      })

      it('should return null for non-existent post', async () => {
        const mockDocSnap = {
          exists: () => false
        };

        (getDoc as jest.Mock).mockResolvedValue(mockDocSnap as any)

        const result = await getPost('nonexistent')

        expect(result).toBeNull()
      })
    })

    describe('getPosts', () => {
      it('should retrieve posts with filters', async () => {
        const mockPosts = [
          {
            id: 'post1',
            title: '강남 이벤트',
            category: 'event',
            region: '강남',
            status: 'active'
          },
          {
            id: 'post2',
            title: '홍대 모임',
            category: 'event',
            region: '홍대',
            status: 'active'
          }
        ];

        const mockSnapshot = {
          docs: mockPosts.map(post => ({
            id: post.id,
            data: () => post
          }))
        };;

        (getDocs as jest.Mock).mockResolvedValue(mockSnapshot as any)

        const filters: PostSearchFilters = {
          category: ['event'],
          region: ['강남', '홍대'],
          status: ['active']
        }

        const result = await getPosts(filters, 10)

        expect(query as jest.Mock).toHaveBeenCalled()
        expect(where as jest.Mock).toHaveBeenCalledWith('category', 'in', ['event'])
        expect(where as jest.Mock).toHaveBeenCalledWith('region', 'in', ['강남', '홍대'])
        expect(where as jest.Mock).toHaveBeenCalledWith('status', 'in', ['active'])
        expect(result.posts).toHaveLength(2)
        expect(result.hasMore).toBe(false)
      })

      it('should handle pagination correctly', async () => {
        const mockPosts = Array.from({ length: 11 }, (_, i) => ({
          id: `post${i}`,
          title: `Post ${i}`,
          category: 'general',
          status: 'active'
        }))

        const mockSnapshot = {
          docs: mockPosts.map(post => ({
            id: post.id,
            data: () => post
          }))
        };;

        (getDocs as jest.Mock).mockResolvedValue(mockSnapshot as any)

        const result = await getPosts({}, 10)

        expect(result.posts).toHaveLength(10)
        expect(result.hasMore).toBe(true)
        expect(result.lastDoc).toBeDefined()
      })

      it('should filter by author', async () => {
        const mockSnapshot = {
          docs: [
            {
              id: 'post1',
              data: () => ({ title: 'My Post', metadata: { authorId: 'user123' } })
            }
          ]
        };

        (getDocs as jest.Mock).mockResolvedValue(mockSnapshot as any)

        const filters: PostSearchFilters = {
          author: 'user123'
        }

        await getPosts(filters)

        expect(where as jest.Mock).toHaveBeenCalledWith('metadata.authorId', '==', 'user123')
      })
    })

    describe('updatePost', () => {
      it('should update post with new data', async () => {
        (updateDoc as jest.Mock).mockResolvedValue(undefined)

        const updateData: UpdatePostData = {
          title: '수정된 제목',
          content: '수정된 내용',
          tags: ['수정된', '태그']
        }

        await updatePost('post123', updateData)

        expect(updateDoc as jest.Mock).toHaveBeenCalledWith(
          {},
          expect.objectContaining({
            ...updateData,
            'metadata.updatedAt': expect.anything()
          })
        )
      })
    })

    describe('deletePost', () => {
      it('should soft delete post by changing status', async () => {
        (updateDoc as jest.Mock).mockResolvedValue(undefined)

        await deletePost('post123')

        expect(updateDoc as jest.Mock).toHaveBeenCalledWith(
          {},
          expect.objectContaining({
            status: 'deleted',
            'metadata.updatedAt': expect.anything()
          })
        )
      })
    })
  })

  describe('Comment CRUD Operations', () => {

    describe('createComment', () => {
      it('should create a root comment', async () => {
        const mockDocRef = { id: 'comment123' };
        (addDoc as jest.Mock).mockResolvedValue(mockDocRef as any)
        (updateDoc as jest.Mock).mockResolvedValue(undefined)

        const commentData: CreateCommentData = {
          postId: 'post123',
          content: '정말 좋은 정보네요! 참석하고 싶어요.',
          parentId: undefined
        }

        const commentId = await createComment(commentData, 'user456', '이린디')

        expect(addDoc as jest.Mock).toHaveBeenCalledWith(
          collections.comments,
          expect.objectContaining({
            postId: 'post123',
            content: commentData.content,
            authorId: 'user456',
            authorName: '이린디',
            depth: 0,
            parentId: null,
            rootId: null,
            status: 'active'
          })
        )

        // Should increment post comment count
        expect(updateDoc as jest.Mock).toHaveBeenCalledWith(
          {},
          expect.objectContaining({
            'stats.comments': expect.anything(),
            'stats.lastActivity': expect.anything()
          })
        )

        expect(commentId).toBe('comment123')
      })

      it('should create a reply comment with proper depth', async () => {
        const mockParentDoc = {
          exists: () => true,
          data: () => ({
            depth: 1,
            rootId: 'comment123'
          })
        };

        const mockDocRef = { id: 'reply456' };
        (getDoc as jest.Mock).mockResolvedValue(mockParentDoc as any)
        (addDoc as jest.Mock).mockResolvedValue(mockDocRef as any)
        (updateDoc as jest.Mock).mockResolvedValue(undefined)

        const replyData: CreateCommentData = {
          postId: 'post123',
          content: '저도 함께 가고 싶어요!',
          parentId: 'comment456'
        }

        const commentId = await createComment(replyData, 'user789', '박솔로')

        expect(addDoc as jest.Mock).toHaveBeenCalledWith(
          collections.comments,
          expect.objectContaining({
            depth: 2,
            parentId: 'comment456',
            rootId: 'comment123'
          })
        )

        expect(commentId).toBe('reply456')
      })
    })

    describe('getComments', () => {
      it('should retrieve comments for a post', async () => {
        const mockComments = [
          {
            id: 'comment1',
            postId: 'post123',
            content: '첫 번째 댓글',
            status: 'active',
            depth: 0
          },
          {
            id: 'comment2',
            postId: 'post123',
            content: '두 번째 댓글',
            status: 'active',
            depth: 0
          }
        ];

        const mockSnapshot = {
          docs: mockComments.map(comment => ({
            id: comment.id,
            data: () => comment
          }))
        };

        (getDocs as jest.Mock).mockResolvedValue(mockSnapshot as any)

        const result = await getComments('post123', 20)

        expect(where as jest.Mock).toHaveBeenCalledWith('postId', '==', 'post123')
        expect(where as jest.Mock).toHaveBeenCalledWith('status', '==', 'active')
        expect(orderBy as jest.Mock).toHaveBeenCalledWith('createdAt', 'asc')
        expect(result.comments).toHaveLength(2)
        expect(result.hasMore).toBe(false)
      })

      it('should handle pagination for comments', async () => {
        const mockComments = Array.from({ length: 21 }, (_, i) => ({
          id: `comment${i}`,
          postId: 'post123',
          content: `댓글 ${i}`,
          status: 'active'
        }))

        const mockSnapshot = {
          docs: mockComments.map(comment => ({
            id: comment.id,
            data: () => comment
          }))
        };

        (getDocs as jest.Mock).mockResolvedValue(mockSnapshot as any)

        const result = await getComments('post123', 20)

        expect(result.comments).toHaveLength(20)
        expect(result.hasMore).toBe(true)
      })
    })

    describe('updateComment', () => {
      it('should update comment with edit history', async () => {
        const mockCurrentDoc = {
          exists: () => true,
          data: () => ({
            content: '원본 댓글 내용',
            editHistory: []
          })
        };

        (getDoc as jest.Mock).mockResolvedValue(mockCurrentDoc as any)
        (updateDoc as jest.Mock).mockResolvedValue(undefined)

        const updateData: UpdateCommentData = {
          content: '수정된 댓글 내용'
        }

        await updateComment('comment123', updateData)

        expect(updateDoc as jest.Mock).toHaveBeenCalledWith(
          {},
          expect.objectContaining({
            content: '수정된 댓글 내용',
            updatedAt: expect.anything(),
            editHistory: expect.arrayContaining([
              expect.objectContaining({
                editedAt: expect.anything(),
                previousContent: '원본 댓글 내용'
              })
            ])
          })
        )
      })
    })

    describe('deleteComment', () => {
      it('should soft delete comment and decrement post count', async () => {
        (updateDoc as jest.Mock).mockResolvedValue(undefined)

        await deleteComment('comment123', 'post123')

        expect(updateDoc as jest.Mock).toHaveBeenCalledWith(
          {},
          expect.objectContaining({
            status: 'deleted',
            updatedAt: expect.anything()
          })
        )

        expect(updateDoc as jest.Mock).toHaveBeenCalledWith(
          {},
          expect.objectContaining({
            'stats.comments': expect.anything(),
            'stats.lastActivity': expect.anything()
          })
        )
      })
    })
  })

  describe('Like System', () => {

    describe('toggleLike', () => {
      it('should add like when not exists', async () => {
        const mockLikeDoc = {
          exists: () => false
        };

        (getDoc as jest.Mock).mockResolvedValue(mockLikeDoc as any)
        (addDoc as jest.Mock).mockResolvedValue({ id: 'like123' } as any)
        (updateDoc as jest.Mock).mockResolvedValue(undefined)

        const result = await toggleLike('post', 'post123', 'user456')

        expect(addDoc as jest.Mock).toHaveBeenCalledWith(
          collections.likes,
          expect.objectContaining({
            targetType: 'post',
            targetId: 'post123',
            userId: 'user456'
          })
        )

        expect(updateDoc as jest.Mock).toHaveBeenCalledWith(
          {},
          expect.objectContaining({
            'stats.likes': expect.anything(),
            'stats.lastActivity': expect.anything()
          })
        )

        expect(result).toBe(true)
      })

      it('should remove like when exists', async () => {
        const mockLikeDoc = {
          exists: () => true
        };

        (getDoc as jest.Mock).mockResolvedValue(mockLikeDoc as any)
        (deleteDoc as jest.Mock).mockResolvedValue(undefined)
        (updateDoc as jest.Mock).mockResolvedValue(undefined)

        const result = await toggleLike('post', 'post123', 'user456')

        expect(deleteDoc as jest.Mock).toHaveBeenCalled()
        expect(updateDoc as jest.Mock).toHaveBeenCalledWith(
          {},
          expect.objectContaining({
            'stats.likes': expect.anything()
          })
        )

        expect(result).toBe(false)
      })

      it('should handle comment likes correctly', async () => {
        const mockLikeDoc = {
          exists: () => false
        };

        (getDoc as jest.Mock).mockResolvedValue(mockLikeDoc as any)
        (addDoc as jest.Mock).mockResolvedValue({ id: 'like123' } as any)
        (updateDoc as jest.Mock).mockResolvedValue(undefined)

        const result = await toggleLike('comment', 'comment123', 'user456')

        expect(updateDoc as jest.Mock).toHaveBeenCalledWith(
          {},
          expect.objectContaining({
            likes: expect.anything()
          })
        )

        expect(result).toBe(true)
      })
    })

    describe('getUserLikes', () => {
      it('should return like status for multiple targets', async () => {
        const mockLikeResults = [
          { exists: () => true },  // post1 is liked
          { exists: () => false }, // post2 is not liked
          { exists: () => true }   // post3 is liked
        ];

        (getDoc as jest.Mock)
          .mockResolvedValueOnce(mockLikeResults[0] as any)
          .mockResolvedValueOnce(mockLikeResults[1] as any)
          .mockResolvedValueOnce(mockLikeResults[2] as any)

        const result = await getUserLikes('post', ['post1', 'post2', 'post3'], 'user123')

        expect(result).toEqual({
          post1: true,
          post2: false,
          post3: true
        })

        expect(getDoc as jest.Mock).toHaveBeenCalledTimes(3)
      })
    })
  })

  describe('Report System', () => {

    describe('createReport', () => {
      it('should create report and increment target report count', async () => {
        const mockDocRef = { id: 'report123' };
        (addDoc as jest.Mock).mockResolvedValue(mockDocRef as any)
        (updateDoc as jest.Mock).mockResolvedValue(undefined)

        const reportId = await createReport('post', 'post123', 'user456', 'spam', '스팸 게시글입니다.')

        expect(addDoc as jest.Mock).toHaveBeenCalledWith(
          collections.reports,
          expect.objectContaining({
            targetType: 'post',
            targetId: 'post123',
            reporterId: 'user456',
            reason: 'spam',
            description: '스팸 게시글입니다.',
            status: 'pending'
          })
        )

        expect(updateDoc as jest.Mock).toHaveBeenCalledWith(
          {},
          expect.objectContaining({
            'stats.reports': expect.anything()
          })
        )

        expect(reportId).toBe('report123')
      })

      it('should handle comment reports', async () => {
        const mockDocRef = { id: 'report456' };
        (addDoc as jest.Mock).mockResolvedValue(mockDocRef as any)
        (updateDoc as jest.Mock).mockResolvedValue(undefined)

        await createReport('comment', 'comment123', 'user789', 'inappropriate_content')

        expect(updateDoc as jest.Mock).toHaveBeenCalledWith(
          {},
          expect.objectContaining({
            reports: expect.anything()
          })
        )
      })
    })
  })

  describe('Notification System', () => {

    describe('createNotification', () => {
      it('should create notification successfully', async () => {
        const mockDocRef = { id: 'notif123' };
        (addDoc as jest.Mock).mockResolvedValue(mockDocRef as any)

        const notificationId = await createNotification(
          'user123',
          'new_comment',
          '새 댓글 알림',
          '김스윙님이 회원님의 게시글에 댓글을 남겼습니다.',
          {
            postId: 'post123',
            commentId: 'comment456',
            actionUrl: '/community/post/post123'
          }
        )

        expect(addDoc as jest.Mock).toHaveBeenCalledWith(
          collections.notifications,
          expect.objectContaining({
            recipientId: 'user123',
            type: 'new_comment',
            title: '새 댓글 알림',
            message: '김스윙님이 회원님의 게시글에 댓글을 남겼습니다.',
            relatedPostId: 'post123',
            relatedCommentId: 'comment456',
            isRead: false,
            actionUrl: '/community/post/post123'
          })
        )

        expect(notificationId).toBe('notif123')
      })
    })

    describe('getUserNotifications', () => {
      it('should retrieve user notifications with pagination', async () => {
        const mockNotifications = [
          {
            id: 'notif1',
            recipientId: 'user123',
            type: 'new_comment',
            isRead: false
          },
          {
            id: 'notif2',
            recipientId: 'user123',
            type: 'post_like',
            isRead: true
          }
        ];

        const mockSnapshot = {
          docs: mockNotifications.map(notif => ({
            id: notif.id,
            data: () => notif
          }))
        };

        (getDocs as jest.Mock).mockResolvedValue(mockSnapshot as any)

        const result = await getUserNotifications('user123', 10)

        expect(where as jest.Mock).toHaveBeenCalledWith('recipientId', '==', 'user123')
        expect(orderBy as jest.Mock).toHaveBeenCalledWith('createdAt', 'desc')
        expect(result.notifications).toHaveLength(2)
      })
    })

    describe('markNotificationAsRead', () => {
      it('should mark notification as read', async () => {
        (updateDoc as jest.Mock).mockResolvedValue(undefined)

        await markNotificationAsRead('notif123')

        expect(updateDoc as jest.Mock).toHaveBeenCalledWith(
          {},
          expect.objectContaining({
            isRead: true
          })
        )
      })
    })
  })

  describe('Utility Functions', () => {

    describe('getPostCountsByCategory', () => {
      it('should return post counts for all categories', async () => {
        const mockResults = [
          { size: 25 }, // general
          { size: 18 }, // qna
          { size: 12 }, // event
          { size: 8 },  // marketplace
          { size: 15 }, // lesson
          { size: 6 }   // review
        ];

        (getDocs as jest.Mock).mockImplementation(() =>
          Promise.resolve(mockResults.shift() as any)
        )

        const result = await getPostCountsByCategory()

        expect(result).toEqual({
          general: 25,
          qna: 18,
          event: 12,
          marketplace: 8,
          lesson: 15,
          review: 6
        })

        expect(getDocs as jest.Mock).toHaveBeenCalledTimes(6)
      })
    })

    describe('getTrendingPosts', () => {
      it('should return trending posts sorted by score', async () => {
        const mockPosts = [
          {
            id: 'post1',
            title: '인기 게시글 1',
            stats: { likes: 20, comments: 15 } // score: 55
          },
          {
            id: 'post2',
            title: '인기 게시글 2',
            stats: { likes: 15, comments: 10 } // score: 40
          },
          {
            id: 'post3',
            title: '인기 게시글 3',
            stats: { likes: 25, comments: 5 } // score: 55
          }
        ];

        const mockSnapshot = {
          docs: mockPosts.map(post => ({
            id: post.id,
            data: () => post
          }))
        };;

        (getDocs as jest.Mock).mockResolvedValue(mockSnapshot as any)

        const result = await getTrendingPosts(2)

        expect(limit as jest.Mock).toHaveBeenCalledWith(4) // 2 * 2 for client-side filtering
        expect(result).toHaveLength(2)

        // Should be sorted by trending score (likes * 2 + comments)
        expect(result[0].stats.likes * 2 + result[0].stats.comments).toBeGreaterThanOrEqual(
          result[1].stats.likes * 2 + result[1].stats.comments
        )
      })
    })

    describe('searchPosts', () => {
      it('should search posts by tags', async () => {
        const mockPosts = [
          {
            id: 'post1',
            title: '린디합 워크숍',
            tags: ['린디합', '워크숍', '초보환영']
          }
        ];

        const mockSnapshot = {
          docs: mockPosts.map(post => ({
            id: post.id,
            data: () => post
          }))
        };;

        (getDocs as jest.Mock).mockResolvedValue(mockSnapshot as any)

        const result = await searchPosts('린디합', {}, 10)

        expect(where as jest.Mock).toHaveBeenCalledWith('tags', 'array-contains', '린디합')
        expect(where as jest.Mock).toHaveBeenCalledWith('status', '==', 'active')
        expect(result).toHaveLength(1)
      })

      it('should return empty array for empty keyword', async () => {
        const result = await searchPosts('', {}, 10)

        expect(result).toEqual([])
        expect(getDocs as jest.Mock).not.toHaveBeenCalled()
      })
    })
  })

  describe('Error Handling', () => {

    it('should handle Firestore connection errors', async () => {
      (getDoc as jest.Mock).mockRejectedValue(new Error('Firebase connection error'))

      await expect(getPost('post123')).rejects.toThrow('Firebase connection error')
    })

    it('should handle invalid document references', async () => {
      (addDoc as jest.Mock).mockRejectedValue(new Error('Invalid document reference'))

      const postData: CreatePostData = {
        title: 'Test Post',
        content: 'Test content',
        category: 'general'
      }

      await expect(createPost(postData, 'user123', 'Test User')).rejects.toThrow('Invalid document reference')
    })

    it('should handle update failures gracefully', async () => {
      (updateDoc as jest.Mock).mockRejectedValue(new Error('Permission denied'))

      await expect(updatePost('post123', { title: 'New Title' })).rejects.toThrow('Permission denied')
    })
  })

  describe('Edge Cases', () => {

    it('should handle empty filter objects', async () => {
      const mockSnapshot = { docs: [] };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot as any)

      const result = await getPosts({}, 10)

      expect(result.posts).toEqual([])
      expect(result.hasMore).toBe(false)
    })

    it('should handle large dataset pagination', async () => {
      const largeMockData = Array.from({ length: 101 }, (_, i) => ({
        id: `post${i}`,
        data: () => ({ title: `Post ${i}` })
      }))

      const mockSnapshot = { docs: largeMockData };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot as any)

      const result = await getPosts({}, 100)

      expect(result.posts).toHaveLength(100)
      expect(result.hasMore).toBe(true)
    })

    it('should handle Korean text in search', async () => {
      const mockSnapshot = { docs: [] };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot as any)

      await searchPosts('스윙댄스', {}, 10)

      expect(where as jest.Mock).toHaveBeenCalledWith('tags', 'array-contains', '스윙댄스')
    })

    it('should handle comment depth limits', async () => {
      const mockParentDoc = {
        exists: () => true,
        data: () => ({
          depth: 2, // Already at max depth
          rootId: 'root123'
        })
      };

      (getDoc as jest.Mock).mockResolvedValue(mockParentDoc as any)
      (addDoc as jest.Mock).mockResolvedValue({ id: 'deep-comment' } as any)
      (updateDoc as jest.Mock).mockResolvedValue(undefined)

      const replyData: CreateCommentData = {
        postId: 'post123',
        content: '깊은 댓글',
        parentId: 'deep-parent'
      }

      await createComment(replyData, 'user123', 'Test User')

      expect(addDoc as jest.Mock).toHaveBeenCalledWith(
        collections.comments,
        expect.objectContaining({
          depth: 3 // Should increment even at deep levels
        })
      )
    })
  })
})