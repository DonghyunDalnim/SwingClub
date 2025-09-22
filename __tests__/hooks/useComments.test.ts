/**
 * Comprehensive tests for useComments hook
 * Testing real-time comment subscription and tree building functionality
 */

import { renderHook, waitFor } from '@testing-library/react'
import { useComments, useCommentReplies, useCommentLikes } from '@/hooks/useComments'
import type { Comment } from '@/lib/types/community'

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn()
}))

jest.mock('@/lib/firebase', () => ({
  db: {}
}))

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore'

describe('useComments Hook', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Mock comment data for Korean swing dance community
  const mockComments: Comment[] = [
    {
      id: 'comment_1',
      postId: 'post_lindy_basics',
      content: '린디합 기본기 정말 중요해요! 록스텝부터 천천히 연습하세요 🎵',
      status: 'active',
      parentId: null,
      depth: 0,
      rootId: 'comment_1',
      metadata: {
        authorId: 'user_kim_lindy',
        authorName: '김린디',
        authorProfileUrl: 'https://example.com/kim.jpg',
        createdAt: {
          toMillis: () => 1640995200000,
          toDate: () => new Date(1640995200000)
        } as any,
        updatedAt: {
          toMillis: () => 1640995200000,
          toDate: () => new Date(1640995200000)
        } as any
      },
      stats: {
        likes: 5,
        replies: 2,
        reports: 0
      }
    },
    {
      id: 'comment_2',
      postId: 'post_lindy_basics',
      content: '감사합니다! 정말 도움이 되었어요. 트리플스텝도 어려운데 연습법 알려주실 수 있나요?',
      status: 'active',
      parentId: 'comment_1',
      depth: 1,
      rootId: 'comment_1',
      metadata: {
        authorId: 'user_park_swing',
        authorName: '박스윙',
        authorProfileUrl: null,
        createdAt: {
          toMillis: () => 1640995260000,
          toDate: () => new Date(1640995260000)
        } as any,
        updatedAt: {
          toMillis: () => 1640995260000,
          toDate: () => new Date(1640995260000)
        } as any
      },
      stats: {
        likes: 2,
        replies: 1,
        reports: 0
      }
    },
    {
      id: 'comment_3',
      postId: 'post_lindy_basics',
      content: '저도 같은 고민이었는데 김린디님 조언대로 하니까 많이 늘었어요!',
      status: 'active',
      parentId: 'comment_1',
      depth: 1,
      rootId: 'comment_1',
      metadata: {
        authorId: 'user_lee_charleston',
        authorName: '이찰스턴',
        authorProfileUrl: 'https://example.com/lee.jpg',
        createdAt: {
          toMillis: () => 1640995320000,
          toDate: () => new Date(1640995320000)
        } as any,
        updatedAt: {
          toMillis: () => 1640995320000,
          toDate: () => new Date(1640995320000)
        } as any
      },
      stats: {
        likes: 3,
        replies: 0,
        reports: 0
      }
    },
    {
      id: 'comment_4',
      postId: 'post_lindy_basics',
      content: '트리플스텝은 처음에 느리게 연습하세요. 좌-우-좌, 우-좌-우 이런 식으로요!',
      status: 'active',
      parentId: 'comment_2',
      depth: 2,
      rootId: 'comment_1',
      metadata: {
        authorId: 'user_kim_lindy',
        authorName: '김린디',
        authorProfileUrl: 'https://example.com/kim.jpg',
        createdAt: {
          toMillis: () => 1640995380000,
          toDate: () => new Date(1640995380000)
        } as any,
        updatedAt: {
          toMillis: () => 1640995380000,
          toDate: () => new Date(1640995380000)
        } as any
      },
      stats: {
        likes: 1,
        replies: 0,
        reports: 0
      }
    },
    {
      id: 'comment_5',
      postId: 'post_lindy_basics',
      content: '워크숍에서 직접 배우는 것도 추천드려요! 홍대에 좋은 곳 많아요 😊',
      status: 'active',
      parentId: null,
      depth: 0,
      rootId: 'comment_5',
      metadata: {
        authorId: 'user_choi_balboa',
        authorName: '최발보아',
        authorProfileUrl: null,
        createdAt: {
          toMillis: () => 1640995440000,
          toDate: () => new Date(1640995440000)
        } as any,
        updatedAt: {
          toMillis: () => 1640995440000,
          toDate: () => new Date(1640995440000)
        } as any
      },
      stats: {
        likes: 4,
        replies: 0,
        reports: 0
      }
    }
  ]

  describe('✅ Success Cases - Comment Tree Building', () => {

    it('should build correct comment tree structure', async () => {
      const mockUnsubscribe = jest.fn()

      ;(onSnapshot as jest.Mock).mockImplementation((query, successCallback) => {
        // Simulate successful snapshot
        const mockSnapshot = {
          docs: mockComments.map(comment => ({
            id: comment.id,
            data: () => comment
          }))
        }

        setTimeout(() => {
          successCallback(mockSnapshot)
        }, 100)

        return mockUnsubscribe
      })

      const { result } = renderHook(() =>
        useComments('post_lindy_basics', { enabled: true })
      )

      // Initially loading
      expect(result.current.loading).toBe(true)
      expect(result.current.comments).toEqual([])

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Check comment tree structure
      expect(result.current.comments).toHaveLength(2) // 2 root comments
      expect(result.current.totalCount).toBe(5) // Total 5 comments

      // Check first root comment and its children
      const firstRoot = result.current.comments[0]
      expect(firstRoot.id).toBe('comment_1')
      expect(firstRoot.level).toBe(0)
      expect(firstRoot.children).toHaveLength(2) // 2 direct replies

      // Check first reply
      const firstReply = firstRoot.children[0]
      expect(firstReply.id).toBe('comment_2')
      expect(firstReply.level).toBe(1)
      expect(firstReply.children).toHaveLength(1) // 1 nested reply

      // Check nested reply
      const nestedReply = firstReply.children[0]
      expect(nestedReply.id).toBe('comment_4')
      expect(nestedReply.level).toBe(2)
      expect(nestedReply.children).toHaveLength(0)

      // Check second reply to first root
      const secondReply = firstRoot.children[1]
      expect(secondReply.id).toBe('comment_3')
      expect(secondReply.level).toBe(1)
      expect(secondReply.children).toHaveLength(0)

      // Check second root comment
      const secondRoot = result.current.comments[1]
      expect(secondRoot.id).toBe('comment_5')
      expect(secondRoot.level).toBe(0)
      expect(secondRoot.children).toHaveLength(0)
    })

    it('should sort comments by creation time correctly', async () => {
      const mockUnsubscribe = jest.fn()

      ;(onSnapshot as jest.Mock).mockImplementation((query, successCallback) => {
        const mockSnapshot = {
          docs: mockComments.map(comment => ({
            id: comment.id,
            data: () => comment
          }))
        }

        setTimeout(() => {
          successCallback(mockSnapshot)
        }, 100)

        return mockUnsubscribe
      })

      const { result } = renderHook(() =>
        useComments('post_lindy_basics')
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Root comments should be sorted by time (comment_1 before comment_5)
      expect(result.current.comments[0].id).toBe('comment_1')
      expect(result.current.comments[1].id).toBe('comment_5')

      // Replies should be sorted by time within each level
      const replies = result.current.comments[0].children
      expect(replies[0].id).toBe('comment_2') // Earlier than comment_3
      expect(replies[1].id).toBe('comment_3')
    })

    it('should handle empty comment list', async () => {
      const mockUnsubscribe = jest.fn()

      ;(onSnapshot as jest.Mock).mockImplementation((query, successCallback) => {
        const mockSnapshot = {
          docs: []
        }

        setTimeout(() => {
          successCallback(mockSnapshot)
        }, 100)

        return mockUnsubscribe
      })

      const { result } = renderHook(() =>
        useComments('post_no_comments')
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.comments).toEqual([])
      expect(result.current.totalCount).toBe(0)
      expect(result.current.error).toBeNull()
    })
  })

  describe('🚫 Error Cases', () => {

    it('should handle Firebase connection errors', async () => {
      const mockError = new Error('Firebase connection failed')
      const mockOnError = jest.fn()

      ;(onSnapshot as jest.Mock).mockImplementation((query, successCallback, errorCallback) => {
        setTimeout(() => {
          errorCallback(mockError)
        }, 100)

        return jest.fn()
      })

      const { result } = renderHook(() =>
        useComments('post_error_test', {
          enabled: true,
          onError: mockOnError
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Firebase connection failed')
      expect(result.current.comments).toEqual([])
      expect(mockOnError).toHaveBeenCalledWith(expect.any(Error))
    })

    it('should handle malformed comment data', async () => {
      const mockMalformedComments = [
        {
          id: 'malformed_comment',
          // Missing required fields
        }
      ]

      const mockUnsubscribe = jest.fn()

      ;(onSnapshot as jest.Mock).mockImplementation((query, successCallback) => {
        const mockSnapshot = {
          docs: mockMalformedComments.map(comment => ({
            id: comment.id,
            data: () => comment
          }))
        }

        setTimeout(() => {
          successCallback(mockSnapshot)
        }, 100)

        return mockUnsubscribe
      })

      const { result } = renderHook(() =>
        useComments('post_malformed_data')
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should handle malformed data gracefully
      expect(result.current.error).toBeNull()
      expect(result.current.comments).toHaveLength(1)
      expect(result.current.comments[0].id).toBe('malformed_comment')
      expect(result.current.comments[0].level).toBeUndefined() // Shows it's malformed but still processed
    })
  })

  describe('🔧 Hook Options and Controls', () => {

    it('should disable subscription when enabled is false', () => {
      const { result } = renderHook(() =>
        useComments('post_disabled', { enabled: false })
      )

      expect(result.current.loading).toBe(false)
      expect(onSnapshot).not.toHaveBeenCalled()
    })

    it('should handle postId changes correctly', () => {
      const mockUnsubscribe1 = jest.fn()
      const mockUnsubscribe2 = jest.fn()

      ;(onSnapshot as jest.Mock)
        .mockImplementationOnce(() => mockUnsubscribe1)
        .mockImplementationOnce(() => mockUnsubscribe2)

      const { result, rerender } = renderHook(
        ({ postId }) => useComments(postId),
        { initialProps: { postId: 'post_1' } }
      )

      expect(onSnapshot).toHaveBeenCalledTimes(1)

      // Change postId
      rerender({ postId: 'post_2' })

      expect(mockUnsubscribe1).toHaveBeenCalled() // Previous subscription cleaned up
      expect(onSnapshot).toHaveBeenCalledTimes(2) // New subscription created
    })

    it('should cleanup subscription on unmount', () => {
      const mockUnsubscribe = jest.fn()

      ;(onSnapshot as jest.Mock).mockImplementation(() => mockUnsubscribe)

      const { unmount } = renderHook(() =>
        useComments('post_cleanup_test')
      )

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('📊 Performance Tests', () => {

    it('should handle large comment trees efficiently', async () => {
      // Generate 100 comments with nested structure
      const largeCommentSet = Array.from({ length: 100 }, (_, i) => ({
        id: `comment_${i}`,
        postId: 'post_large_tree',
        content: `댓글 ${i}: 스윙댄스 관련 내용`,
        status: 'active' as const,
        parentId: i > 0 && i % 10 === 0 ? `comment_${i - 10}` : null,
        depth: i > 0 && i % 10 === 0 ? 1 : 0,
        rootId: i > 0 && i % 10 === 0 ? `comment_${i - 10}` : `comment_${i}`,
        metadata: {
          authorId: `user_${i}`,
          authorName: `댄서${i}`,
          authorProfileUrl: null,
          createdAt: {
            toMillis: () => 1640995200000 + (i * 1000),
            toDate: () => new Date(1640995200000 + (i * 1000))
          } as any,
          updatedAt: {
            toMillis: () => 1640995200000 + (i * 1000),
            toDate: () => new Date(1640995200000 + (i * 1000))
          } as any
        },
        stats: {
          likes: Math.floor(Math.random() * 10),
          replies: 0,
          reports: 0
        }
      }))

      const mockUnsubscribe = jest.fn()

      ;(onSnapshot as jest.Mock).mockImplementation((query, successCallback) => {
        const mockSnapshot = {
          docs: largeCommentSet.map(comment => ({
            id: comment.id,
            data: () => comment
          }))
        }

        setTimeout(() => {
          successCallback(mockSnapshot)
        }, 100)

        return mockUnsubscribe
      })

      const { result } = renderHook(() =>
        useComments('post_large_tree')
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.totalCount).toBe(100)
      expect(result.current.comments.length).toBeGreaterThan(0)

      // Performance check: should complete within reasonable time
      // (This test passed if it doesn't timeout)
    })
  })
})

describe('useCommentReplies Hook', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockReplies: Comment[] = [
    {
      id: 'reply_1',
      postId: 'post_test',
      content: '좋은 답변이네요!',
      status: 'active',
      parentId: 'parent_comment',
      depth: 1,
      rootId: 'parent_comment',
      metadata: {
        authorId: 'user_reply_1',
        authorName: '답글러1',
        authorProfileUrl: null,
        createdAt: {
          toMillis: () => 1640995200000,
          toDate: () => new Date(1640995200000)
        } as any,
        updatedAt: {
          toMillis: () => 1640995200000,
          toDate: () => new Date(1640995200000)
        } as any
      },
      stats: {
        likes: 1,
        replies: 0,
        reports: 0
      }
    }
  ]

  it('should fetch replies for specific parent comment', async () => {
    const mockUnsubscribe = jest.fn()

    ;(onSnapshot as jest.Mock).mockImplementation((query, successCallback) => {
      const mockSnapshot = {
        docs: mockReplies.map(reply => ({
          id: reply.id,
          data: () => reply
        }))
      }

      setTimeout(() => {
        successCallback(mockSnapshot)
      }, 100)

      return mockUnsubscribe
    })

    const { result } = renderHook(() =>
      useCommentReplies('parent_comment')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.comments).toHaveLength(1)
    expect(result.current.comments[0].id).toBe('reply_1')
    expect(result.current.comments[0].level).toBe(1)
    expect(result.current.totalCount).toBe(1)
  })
})

describe('useCommentLikes Hook', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle comment likes state correctly', () => {
    const commentIds = ['comment_1', 'comment_2', 'comment_3']
    const userId = 'user_test'

    const { result } = renderHook(() =>
      useCommentLikes(commentIds, userId)
    )

    expect(result.current.loading).toBe(false)
    expect(result.current.likes).toEqual({})
  })

  it('should handle empty comment list', () => {
    const { result } = renderHook(() =>
      useCommentLikes([], 'user_test')
    )

    expect(result.current.loading).toBe(false)
    expect(result.current.likes).toEqual({})
  })

  it('should handle missing user ID', () => {
    const commentIds = ['comment_1', 'comment_2']

    const { result } = renderHook(() =>
      useCommentLikes(commentIds, undefined)
    )

    expect(result.current.loading).toBe(false)
    expect(result.current.likes).toEqual({})
  })
})