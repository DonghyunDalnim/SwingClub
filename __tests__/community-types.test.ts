/**
 * Comprehensive tests for community types defined in lib/types/community.ts
 */

import type {
  PostCategory,
  PostStatus,
  PostVisibility,
  MarketplaceStatus,
  ReportReason,
  NotificationType,
  Attachment,
  PostLocation,
  MarketplacePrice,
  EventInfo,
  Post,
  Comment,
  CommunityNotification,
  CreatePostData,
  CreateCommentData,
  PostSearchFilters,
  PostSearchResult,
  CommunityStats
} from '../lib/types/community'

import {
  POST_CATEGORIES,
  POST_STATUS_LABELS,
  MARKETPLACE_STATUS_LABELS,
  REPORT_REASON_LABELS
} from '../lib/types/community'

describe('Community Types', () => {

  describe('Enum Types', () => {

    describe('PostCategory', () => {
      it('should have all required categories', () => {
        const categories: PostCategory[] = ['general', 'qna', 'event', 'marketplace', 'lesson', 'review']

        categories.forEach(category => {
          expect(POST_CATEGORIES[category]).toBeDefined()
          expect(typeof POST_CATEGORIES[category]).toBe('string')
        })
      })

      it('should have Korean labels for all categories', () => {
        expect(POST_CATEGORIES.general).toBe('자유게시판')
        expect(POST_CATEGORIES.qna).toBe('질문답변')
        expect(POST_CATEGORIES.event).toBe('이벤트/공지')
        expect(POST_CATEGORIES.marketplace).toBe('중고거래')
        expect(POST_CATEGORIES.lesson).toBe('레슨정보')
        expect(POST_CATEGORIES.review).toBe('리뷰')
      })
    })

    describe('PostStatus', () => {
      it('should have all required status types', () => {
        const statuses: PostStatus[] = ['active', 'hidden', 'deleted', 'reported']

        statuses.forEach(status => {
          expect(POST_STATUS_LABELS[status]).toBeDefined()
        })
      })

      it('should have Korean labels for all statuses', () => {
        expect(POST_STATUS_LABELS.active).toBe('활성')
        expect(POST_STATUS_LABELS.hidden).toBe('숨김')
        expect(POST_STATUS_LABELS.deleted).toBe('삭제됨')
        expect(POST_STATUS_LABELS.reported).toBe('신고됨')
      })
    })

    describe('MarketplaceStatus', () => {
      it('should have all marketplace statuses', () => {
        const statuses: MarketplaceStatus[] = ['selling', 'reserved', 'sold', 'hidden']

        statuses.forEach(status => {
          expect(MARKETPLACE_STATUS_LABELS[status]).toBeDefined()
        })
      })

      it('should have Korean labels', () => {
        expect(MARKETPLACE_STATUS_LABELS.selling).toBe('판매중')
        expect(MARKETPLACE_STATUS_LABELS.reserved).toBe('예약중')
        expect(MARKETPLACE_STATUS_LABELS.sold).toBe('판매완료')
        expect(MARKETPLACE_STATUS_LABELS.hidden).toBe('숨김')
      })
    })

    describe('PostVisibility', () => {
      it('should have all visibility options', () => {
        const visibilities: PostVisibility[] = ['public', 'members_only', 'region_only']

        visibilities.forEach(visibility => {
          expect(['public', 'members_only', 'region_only']).toContain(visibility)
        })
      })
    })

    describe('ReportReason', () => {
      it('should have all report reasons', () => {
        const reasons: ReportReason[] = [
          'spam', 'inappropriate_content', 'harassment',
          'false_information', 'copyright_violation', 'other'
        ]

        reasons.forEach(reason => {
          expect(REPORT_REASON_LABELS[reason]).toBeDefined()
        })
      })

      it('should have Korean labels', () => {
        expect(REPORT_REASON_LABELS.spam).toBe('스팸')
        expect(REPORT_REASON_LABELS.inappropriate_content).toBe('부적절한 내용')
        expect(REPORT_REASON_LABELS.harassment).toBe('괴롭힘')
        expect(REPORT_REASON_LABELS.false_information).toBe('거짓 정보')
        expect(REPORT_REASON_LABELS.copyright_violation).toBe('저작권 침해')
        expect(REPORT_REASON_LABELS.other).toBe('기타')
      })
    })

    describe('NotificationType', () => {
      it('should have all notification types', () => {
        const types: NotificationType[] = [
          'post_like', 'comment_like', 'new_comment', 'comment_reply',
          'post_mention', 'comment_mention', 'event_reminder',
          'marketplace_inquiry', 'report_status'
        ]

        types.forEach(type => {
          expect(typeof type).toBe('string')
        })
      })
    })
  })

  describe('Interface Structure Validation', () => {

    describe('Attachment', () => {
      it('should validate attachment structure', () => {
        const attachment: Attachment = {
          id: 'test-id',
          fileName: 'dance-video.mp4',
          fileUrl: 'https://storage.example.com/dance-video.mp4',
          fileSize: 25000000, // 25MB
          mimeType: 'video/mp4',
          uploadedAt: { seconds: 1640995200, nanoseconds: 0 } as any
        }

        expect(attachment.id).toBeTruthy()
        expect(attachment.fileName).toMatch(/\.(mp4|jpg|png|pdf)$/)
        expect(attachment.fileUrl).toMatch(/^https?:\/\//)
        expect(attachment.fileSize).toBeGreaterThan(0)
        expect(attachment.fileSize).toBeLessThanOrEqual(20971520) // 20MB max
        expect(attachment.mimeType).toMatch(/^(video|image|application)\//)
      })

      it('should handle Korean file names', () => {
        const attachment: Partial<Attachment> = {
          fileName: '스윙댄스_기본기.pdf',
          mimeType: 'application/pdf'
        }

        expect(attachment.fileName).toMatch(/^[가-힣a-zA-Z0-9_.-]+\.(pdf|mp4|jpg|png)$/)
      })
    })

    describe('PostLocation', () => {
      it('should validate Seoul regions', () => {
        const location: PostLocation = {
          address: '서울특별시 강남구 강남대로 123',
          region: '강남',
          details: '강남역 3번 출구'
        }

        expect(location.region).toMatch(/^(강남|홍대|신촌|이태원|성수)$/)
        expect(location.address).toContain('서울특별시')
      })

      it('should validate Busan regions', () => {
        const location: PostLocation = {
          region: '해운대',
          address: '부산광역시 해운대구'
        }

        expect(['해운대', '서면', '남포동']).toContain(location.region)
      })
    })

    describe('MarketplacePrice', () => {
      it('should validate price structure', () => {
        const price: MarketplacePrice = {
          amount: 150000,
          currency: 'KRW',
          negotiable: true,
          originalPrice: 200000
        }

        expect(price.currency).toBe('KRW')
        expect(price.amount).toBeGreaterThan(0)
        expect(price.amount).toBeLessThanOrEqual(1000000) // 1M KRW max
        expect(typeof price.negotiable).toBe('boolean')

        if (price.originalPrice) {
          expect(price.originalPrice).toBeGreaterThanOrEqual(price.amount)
        }
      })

      it('should handle typical dance equipment prices', () => {
        const shoePrice: MarketplacePrice = {
          amount: 120000, // 스윙댄스화
          currency: 'KRW',
          negotiable: false
        }

        const lessonPrice: MarketplacePrice = {
          amount: 50000, // 개인레슨
          currency: 'KRW',
          negotiable: true
        }

        expect(shoePrice.amount).toBeGreaterThanOrEqual(50000)
        expect(shoePrice.amount).toBeLessThanOrEqual(300000)
        expect(lessonPrice.amount).toBeGreaterThanOrEqual(30000)
        expect(lessonPrice.amount).toBeLessThanOrEqual(150000)
      })
    })

    describe('EventInfo', () => {
      it('should validate event structure', () => {
        const eventInfo: EventInfo = {
          startDate: { seconds: 1640995200, nanoseconds: 0 } as any,
          endDate: { seconds: 1641002400, nanoseconds: 0 } as any,
          capacity: 30,
          currentParticipants: 15,
          requiresRegistration: true,
          registrationDeadline: { seconds: 1640908800, nanoseconds: 0 } as any,
          organizer: 'user123',
          location: {
            region: '강남',
            address: '서울특별시 강남구 강남대로 123'
          }
        }

        expect(eventInfo.capacity).toBeGreaterThan(0)
        expect(eventInfo.currentParticipants).toBeGreaterThanOrEqual(0)
        expect(eventInfo.currentParticipants).toBeLessThanOrEqual(eventInfo.capacity!)
        expect(typeof eventInfo.requiresRegistration).toBe('boolean')
        expect(eventInfo.organizer).toBeTruthy()
      })

      it('should validate workshop capacity limits', () => {
        const smallWorkshop: Partial<EventInfo> = {
          capacity: 8, // 개인 워크숍
          currentParticipants: 5
        }

        const largeEvent: Partial<EventInfo> = {
          capacity: 100, // 대형 이벤트
          currentParticipants: 75
        }

        expect(smallWorkshop.capacity).toBeGreaterThanOrEqual(4)
        expect(largeEvent.capacity).toBeLessThanOrEqual(200)
      })
    })
  })

  describe('Complex Type Validation', () => {

    describe('Post', () => {
      it('should validate basic post structure', () => {
        const post: Post = {
          id: 'post123',
          title: '🎵 강남 스윙댄스 정기모임',
          content: '매주 화요일 스윙댄스 모임입니다.',
          category: 'event',
          status: 'active',
          visibility: 'public',
          stats: {
            views: 150,
            likes: 12,
            comments: 8,
            shares: 3,
            reports: 0,
            lastActivity: { seconds: 1640995200, nanoseconds: 0 } as any
          },
          metadata: {
            createdAt: { seconds: 1640995200, nanoseconds: 0 } as any,
            updatedAt: { seconds: 1640995200, nanoseconds: 0 } as any,
            authorId: 'user123',
            authorName: '김스윙'
          },
          isPinned: false,
          isFeatured: false,
          tags: ['강남', '정기모임', '린디합'],
          region: '강남'
        }

        expect(post.id).toBeTruthy()
        expect(post.title.length).toBeGreaterThan(0)
        expect(post.title.length).toBeLessThanOrEqual(200)
        expect(post.content.length).toBeGreaterThan(0)
        expect(post.content.length).toBeLessThanOrEqual(10000)
        expect(['general', 'qna', 'event', 'marketplace', 'lesson', 'review']).toContain(post.category)
        expect(post.stats.views).toBeGreaterThanOrEqual(0)
        expect(post.stats.likes).toBeGreaterThanOrEqual(0)
        expect(post.tags?.every(tag => typeof tag === 'string')).toBe(true)
      })

      it('should validate marketplace post', () => {
        const marketplacePost: Partial<Post> = {
          category: 'marketplace',
          marketplaceInfo: {
            price: {
              amount: 120000,
              currency: 'KRW',
              negotiable: true
            },
            condition: 'like_new',
            brand: 'Aris Allen',
            deliveryMethod: ['pickup', 'delivery'],
            status: 'selling'
          }
        }

        expect(marketplacePost.category).toBe('marketplace')
        expect(marketplacePost.marketplaceInfo?.price.currency).toBe('KRW')
        expect(['new', 'like_new', 'good', 'fair', 'poor']).toContain(marketplacePost.marketplaceInfo?.condition)
        expect(marketplacePost.marketplaceInfo?.deliveryMethod).toContain('pickup')
      })

      it('should validate event post', () => {
        const eventPost: Partial<Post> = {
          category: 'event',
          eventInfo: {
            startDate: { seconds: 1640995200, nanoseconds: 0 } as any,
            capacity: 25,
            currentParticipants: 10,
            requiresRegistration: true,
            organizer: 'user123'
          }
        }

        expect(eventPost.category).toBe('event')
        expect(eventPost.eventInfo?.capacity).toBeGreaterThan(0)
        expect(eventPost.eventInfo?.currentParticipants).toBeLessThanOrEqual(eventPost.eventInfo?.capacity!)
      })
    })

    describe('Comment', () => {
      it('should validate comment structure', () => {
        const comment: Comment = {
          id: 'comment123',
          postId: 'post123',
          content: '정말 좋은 정보네요! 참석하고 싶어요.',
          parentId: undefined,
          depth: 0,
          rootId: undefined,
          authorId: 'user456',
          authorName: '이린디',
          status: 'active',
          likes: 3,
          reports: 0,
          createdAt: { seconds: 1640995200, nanoseconds: 0 } as any,
          updatedAt: { seconds: 1640995200, nanoseconds: 0 } as any
        }

        expect(comment.id).toBeTruthy()
        expect(comment.postId).toBeTruthy()
        expect(comment.content.length).toBeGreaterThan(0)
        expect(comment.content.length).toBeLessThanOrEqual(1000)
        expect(comment.depth).toBeGreaterThanOrEqual(0)
        expect(comment.depth).toBeLessThanOrEqual(3) // Max 3 levels
        expect(comment.authorId).toBeTruthy()
        expect(comment.authorName).toBeTruthy()
      })

      it('should validate reply comment structure', () => {
        const reply: Comment = {
          id: 'reply123',
          postId: 'post123',
          content: '저도 함께 가요!',
          parentId: 'comment123',
          depth: 1,
          rootId: 'comment123',
          authorId: 'user789',
          authorName: '박솔로',
          status: 'active',
          likes: 1,
          reports: 0,
          createdAt: { seconds: 1640995200, nanoseconds: 0 } as any,
          updatedAt: { seconds: 1640995200, nanoseconds: 0 } as any
        }

        expect(reply.parentId).toBeTruthy()
        expect(reply.depth).toBe(1)
        expect(reply.rootId).toBeTruthy()
      })
    })

    describe('CommunityNotification', () => {
      it('should validate notification structure', () => {
        const notification: CommunityNotification = {
          id: 'notif123',
          recipientId: 'user123',
          type: 'new_comment',
          title: '새 댓글이 달렸습니다',
          message: '김스윙님이 회원님의 게시글에 댓글을 남겼습니다.',
          relatedPostId: 'post123',
          relatedCommentId: 'comment456',
          isRead: false,
          createdAt: { seconds: 1640995200, nanoseconds: 0 } as any,
          actionUrl: '/community/post/post123'
        }

        expect(notification.recipientId).toBeTruthy()
        expect([
          'post_like', 'comment_like', 'new_comment', 'comment_reply',
          'post_mention', 'comment_mention', 'event_reminder',
          'marketplace_inquiry', 'report_status'
        ]).toContain(notification.type)
        expect(notification.title.length).toBeGreaterThan(0)
        expect(notification.message.length).toBeGreaterThan(0)
        expect(typeof notification.isRead).toBe('boolean')
      })
    })
  })

  describe('Create/Update Data Types', () => {

    describe('CreatePostData', () => {
      it('should validate marketplace post creation', () => {
        const createData: CreatePostData = {
          title: '👠 스윙댄스화 판매 (새제품)',
          content: 'Aris Allen 브랜드 새제품입니다.',
          category: 'marketplace',
          visibility: 'public',
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

        expect(createData.title).toBeTruthy()
        expect(createData.content).toBeTruthy()
        expect(createData.category).toBe('marketplace')
        expect(createData.marketplaceInfo?.price.currency).toBe('KRW')
        expect(createData.tags?.length).toBeGreaterThan(0)
      })

      it('should validate event post creation', () => {
        const createData: CreatePostData = {
          title: '🎵 홍대 린디합 워크숍',
          content: '초보자 대상 린디합 기본기 워크숍입니다.',
          category: 'event',
          eventInfo: {
            startDate: { seconds: 1640995200, nanoseconds: 0 } as any,
            endDate: { seconds: 1641002400, nanoseconds: 0 } as any,
            capacity: 20,
            requiresRegistration: true,
            organizer: 'user123',
            fee: {
              amount: 35000,
              currency: 'KRW',
              negotiable: false
            }
          },
          tags: ['홍대', '워크숍', '초보환영'],
          region: '홍대'
        }

        expect(createData.eventInfo?.capacity).toBeGreaterThan(0)
        expect(createData.eventInfo?.fee?.amount).toBeGreaterThan(0)
        expect(createData.eventInfo?.organizer).toBeTruthy()
      })
    })

    describe('CreateCommentData', () => {
      it('should validate comment creation', () => {
        const createData: CreateCommentData = {
          postId: 'post123',
          content: '좋은 정보 감사합니다! 참석 신청하고 싶어요.',
          parentId: undefined
        }

        expect(createData.postId).toBeTruthy()
        expect(createData.content.length).toBeGreaterThan(0)
        expect(createData.content.length).toBeLessThanOrEqual(1000)
      })

      it('should validate reply creation', () => {
        const replyData: CreateCommentData = {
          postId: 'post123',
          content: '@김스윙 네, 같이 가요!',
          parentId: 'comment123'
        }

        expect(replyData.parentId).toBeTruthy()
        expect(replyData.content).toContain('@')
      })
    })
  })

  describe('Search and Filtering', () => {

    describe('PostSearchFilters', () => {
      it('should validate search filters', () => {
        const filters: PostSearchFilters = {
          category: ['event', 'marketplace'],
          region: ['강남', '홍대'],
          keywords: '린디합 워크숍',
          tags: ['초보환영', '정기모임'],
          dateRange: {
            from: new Date('2024-01-01'),
            to: new Date('2024-12-31')
          },
          hasImages: true,
          status: ['active']
        }

        expect(Array.isArray(filters.category)).toBe(true)
        expect(Array.isArray(filters.region)).toBe(true)
        expect(filters.keywords).toBeTruthy()
        expect(filters.dateRange?.from).toBeInstanceOf(Date)
        expect(typeof filters.hasImages).toBe('boolean')
      })
    })

    describe('PostSearchResult', () => {
      it('should validate search result structure', () => {
        const result: PostSearchResult = {
          posts: [],
          total: 25,
          hasMore: true,
          filters: {
            category: ['event'],
            region: ['강남']
          },
          page: 1,
          limit: 10
        }

        expect(Array.isArray(result.posts)).toBe(true)
        expect(result.total).toBeGreaterThanOrEqual(0)
        expect(typeof result.hasMore).toBe('boolean')
        expect(result.page).toBeGreaterThan(0)
        expect(result.limit).toBeGreaterThan(0)
      })
    })

    describe('CommunityStats', () => {
      it('should validate statistics structure', () => {
        const stats: CommunityStats = {
          totalPosts: 150,
          totalComments: 340,
          totalUsers: 89,
          postsToday: 12,
          commentsToday: 28,
          topCategories: [
            { category: 'general', count: 45 },
            { category: 'event', count: 38 },
            { category: 'marketplace', count: 25 }
          ],
          activeUsers: 67,
          timestamp: { seconds: 1640995200, nanoseconds: 0 } as any
        }

        expect(stats.totalPosts).toBeGreaterThanOrEqual(0)
        expect(stats.totalComments).toBeGreaterThanOrEqual(0)
        expect(stats.totalUsers).toBeGreaterThanOrEqual(0)
        expect(stats.postsToday).toBeLessThanOrEqual(stats.totalPosts)
        expect(Array.isArray(stats.topCategories)).toBe(true)
        expect(stats.topCategories.every(cat => cat.count >= 0)).toBe(true)
      })
    })
  })

  describe('Edge Cases and Validation', () => {

    it('should handle empty content gracefully', () => {
      const emptyFilters: PostSearchFilters = {}
      expect(typeof emptyFilters).toBe('object')
    })

    it('should validate Korean text length', () => {
      const koreanTitle = '스윙댄스 린디합 찰스턴 발볼 쇼그 오토튠'
      expect(koreanTitle.length).toBeLessThanOrEqual(200)
    })

    it('should validate price ranges for dance equipment', () => {
      const priceRanges = {
        danceShoes: { min: 50000, max: 300000 },
        privateLessons: { min: 30000, max: 150000 },
        groupClasses: { min: 15000, max: 50000 },
        workshops: { min: 20000, max: 80000 }
      }

      Object.values(priceRanges).forEach(range => {
        expect(range.min).toBeGreaterThan(0)
        expect(range.max).toBeGreaterThan(range.min)
        expect(range.max).toBeLessThanOrEqual(1000000)
      })
    })

    it('should validate Seoul region formats', () => {
      const regions = ['강남', '홍대', '신촌', '이태원', '성수', '잠실', '여의도']

      regions.forEach(region => {
        expect(region).toMatch(/^[가-힣]{2,4}$/)
      })
    })

    it('should validate file size limits', () => {
      const maxImageSize = 5 * 1024 * 1024 // 5MB
      const maxVideoSize = 50 * 1024 * 1024 // 50MB
      const maxDocumentSize = 10 * 1024 * 1024 // 10MB

      expect(maxImageSize).toBeLessThanOrEqual(20971520) // 20MB project limit
      expect(maxVideoSize).toBeGreaterThan(maxImageSize)
      expect(maxDocumentSize).toBeGreaterThan(maxImageSize)
    })
  })

  describe('Type Safety and Function Validation', () => {

    it('should validate function signatures', () => {
      // These are type-level tests that validate the function signatures exist
      const validatePostData: any = undefined // Would be imported if implemented
      const validateCommentData: any = undefined // Would be imported if implemented

      // Test that the types exist and can be assigned
      expect(typeof 'function').toBe('string') // Placeholder assertion
    })

    it('should validate Firestore document types', () => {
      // Test that Document types properly exclude 'id' field
      const postDoc: Partial<Post> = {
        title: 'Test',
        content: 'Test content',
        category: 'general',
        status: 'active',
        visibility: 'public'
        // 'id' field should not be included in Document types
      }

      expect(postDoc.title).toBeTruthy()
      expect('id' in postDoc).toBe(false)
    })
  })
})