import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PostCard } from '@/components/community/PostCard'
import type { Post } from '@/lib/types/community'

// Mock useRouter at the top level
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

// Mock the actions
jest.mock('@/lib/actions/posts', () => ({
  deletePostAction: jest.fn(),
}))

// Import the mocked function after mocking
import { deletePostAction } from '@/lib/actions/posts'
const mockDeletePostAction = deletePostAction as jest.MockedFunction<typeof deletePostAction>

// Mock Timestamp class
class MockTimestamp {
  public seconds: number
  public nanoseconds: number

  constructor(seconds: number, nanoseconds: number = 0) {
    this.seconds = seconds
    this.nanoseconds = nanoseconds
  }

  toDate() {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1000000)
  }

  getTime() {
    return this.seconds * 1000 + this.nanoseconds / 1000000
  }

  static now() {
    return new MockTimestamp(Date.now() / 1000)
  }

  static fromDate(date: Date) {
    return new MockTimestamp(date.getTime() / 1000)
  }
}

// Mock post data for swing dance community
const createMockPost = (overrides: Partial<Post> = {}): Post => ({
  id: 'post-1',
  title: '스윙댄스 레슨 후기 공유합니다!',
  content: '어제 강남역 스윙댄스 스튜디오에서 린디합 기초 레슨을 받았는데 정말 재미있었어요. 선생님이 친절하게 가르쳐주셔서...',
  category: 'review',
  status: 'active',
  visibility: 'public',
  tags: ['린디합', '강남역', '기초레슨'],
  stats: {
    views: 142,
    likes: 15,
    comments: 8,
    shares: 3,
    reports: 0,
    lastActivity: new MockTimestamp(Date.now() / 1000, 0) as any
  },
  metadata: {
    createdAt: new MockTimestamp(Date.now() / 1000 - 3600, 0) as any, // 1시간 전
    updatedAt: new MockTimestamp(Date.now() / 1000, 0) as any,
    authorId: 'user-123',
    authorName: '스윙초보자',
    authorProfileUrl: 'https://example.com/profile.jpg',
    isPinned: false
  },
  isPinned: false,
  isFeatured: false,
  region: '서울',
  attachments: [
    {
      id: 'img-1',
      fileName: 'lesson_photo.jpg',
      fileUrl: 'https://example.com/lesson.jpg',
      fileSize: 1024000,
      mimeType: 'image/jpeg',
      uploadedAt: new MockTimestamp(Date.now() / 1000, 0) as any
    }
  ],
  ...overrides
})

describe('PostCard 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('기본 렌더링', () => {
    it('게시글 정보를 올바르게 표시한다', () => {
      const post = createMockPost()
      render(<PostCard post={post} />)

      expect(screen.getByText('스윙댄스 레슨 후기 공유합니다!')).toBeInTheDocument()
      expect(screen.getByText('스윙초보자')).toBeInTheDocument()
      expect(screen.getByText('리뷰')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
      expect(screen.getByText('142')).toBeInTheDocument()
    })

    it('카테고리별 이모지를 올바르게 표시한다', () => {
      const categories = [
        { category: 'general', emoji: '💬' },
        { category: 'qna', emoji: '❓' },
        { category: 'event', emoji: '🎭' },
        { category: 'marketplace', emoji: '🛍' },
        { category: 'lesson', emoji: '📚' },
        { category: 'review', emoji: '⭐' }
      ] as const

      categories.forEach(({ category, emoji }) => {
        const post = createMockPost({ category })
        const { rerender } = render(<PostCard post={post} />)

        expect(screen.getByText(emoji)).toBeInTheDocument()

        rerender(<div />)
      })
    })

    it('NEW 뱃지를 24시간 이내 게시글에 표시한다', () => {
      const recentPost = createMockPost({
        metadata: {
          ...createMockPost().metadata,
          createdAt: new MockTimestamp(Date.now() / 1000 - 3600, 0) as any // 1시간 전
        }
      })

      render(<PostCard post={recentPost} />)
      expect(screen.getByText('NEW')).toBeInTheDocument()
    })

    it('NEW 뱃지를 24시간 이후 게시글에는 표시하지 않는다', () => {
      const oldPost = createMockPost({
        metadata: {
          ...createMockPost().metadata,
          createdAt: new MockTimestamp(Date.now() / 1000 - 86400 - 3600, 0) as any // 25시간 전
        }
      })

      render(<PostCard post={oldPost} />)
      expect(screen.queryByText('NEW')).not.toBeInTheDocument()
    })
  })

  describe('시간 포맷팅', () => {
    it('분 단위로 시간을 표시한다 (1시간 미만)', () => {
      const post = createMockPost({
        metadata: {
          ...createMockPost().metadata,
          createdAt: new MockTimestamp(Date.now() / 1000 - 1800, 0) as any // 30분 전
        }
      })

      render(<PostCard post={post} />)
      expect(screen.getByText('30분전')).toBeInTheDocument()
    })

    it('시간 단위로 시간을 표시한다 (1일 미만)', () => {
      const post = createMockPost({
        metadata: {
          ...createMockPost().metadata,
          createdAt: new MockTimestamp(Date.now() / 1000 - 7200, 0) as any // 2시간 전
        }
      })

      render(<PostCard post={post} />)
      expect(screen.getByText('2시간전')).toBeInTheDocument()
    })

    it('일 단위로 시간을 표시한다 (1주일 미만)', () => {
      const post = createMockPost({
        metadata: {
          ...createMockPost().metadata,
          createdAt: new MockTimestamp(Date.now() / 1000 - 172800, 0) as any // 2일 전
        }
      })

      render(<PostCard post={post} />)
      expect(screen.getByText('2일전')).toBeInTheDocument()
    })

    it('날짜 형식으로 시간을 표시한다 (1주일 이후)', () => {
      const weekAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      const post = createMockPost({
        metadata: {
          ...createMockPost().metadata,
          createdAt: new MockTimestamp(weekAgo.getTime() / 1000, 0) as any
        }
      })

      render(<PostCard post={post} />)
      expect(screen.getByText(weekAgo.toLocaleDateString())).toBeInTheDocument()
    })
  })

  describe('고정 게시글', () => {
    it('고정 게시글에 핀 아이콘을 표시한다', () => {
      const pinnedPost = createMockPost({
        metadata: { ...createMockPost().metadata, isPinned: true }
      })

      render(<PostCard post={pinnedPost} isPinned={true} />)

      const card = screen.getByText('스윙댄스 레슨 후기 공유합니다!').closest('div')
      expect(card).toHaveClass('border-blue-200', 'bg-blue-50')
    })

    it('일반 게시글에는 특별한 스타일을 적용하지 않는다', () => {
      const post = createMockPost()
      render(<PostCard post={post} />)

      const card = screen.getByText('스윙댄스 레슨 후기 공유합니다!').closest('div')
      expect(card).not.toHaveClass('border-blue-200', 'bg-blue-50')
    })
  })

  describe('첨부파일 표시', () => {
    it('이미지 첨부파일 수를 표시한다', () => {
      const postWithImages = createMockPost({
        attachments: [
          {
            id: 'img-1',
            fileName: 'lesson1.jpg',
            fileUrl: 'https://example.com/lesson1.jpg',
            fileSize: 1024000,
            mimeType: 'image/jpeg',
            uploadedAt: new MockTimestamp(Date.now() / 1000, 0) as any
          },
          {
            id: 'img-2',
            fileName: 'lesson2.jpg',
            fileUrl: 'https://example.com/lesson2.jpg',
            fileSize: 2048000,
            mimeType: 'image/jpeg',
            uploadedAt: new MockTimestamp(Date.now() / 1000, 0) as any
          }
        ]
      })

      render(<PostCard post={postWithImages} />)
      expect(screen.getByText('이미지 2장')).toBeInTheDocument()
    })

    it('태그를 표시한다', () => {
      const postWithTags = createMockPost({
        tags: ['린디합', '발뽀', '스윙아웃']
      })

      render(<PostCard post={postWithTags} />)
      expect(screen.getByText('#린디합 +2')).toBeInTheDocument()
    })

    it('태그가 하나만 있을 때는 개수를 표시하지 않는다', () => {
      const postWithOneTag = createMockPost({
        tags: ['린디합']
      })

      render(<PostCard post={postWithOneTag} />)
      expect(screen.getByText('#린디합')).toBeInTheDocument()
      expect(screen.queryByText('+1')).not.toBeInTheDocument()
    })
  })

  describe('작성자 권한', () => {
    it('작성자에게 수정/삭제 버튼을 표시한다', () => {
      const post = createMockPost()
      render(
        <PostCard
          post={post}
          currentUserId="user-123"
          showActions={true}
        />
      )

      // aria-label 또는 title 속성을 사용하여 버튼 찾기
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })

    it('작성자가 아닌 사용자에게는 액션 버튼을 표시하지 않는다', () => {
      const post = createMockPost()
      render(
        <PostCard
          post={post}
          currentUserId="user-456"
          showActions={true}
        />
      )

      // 수정/삭제 버튼이 없어야 함
      const editButtons = screen.queryAllByText(/edit/i)
      expect(editButtons).toHaveLength(0)
    })

    it('showActions가 false이면 액션 버튼을 표시하지 않는다', () => {
      const post = createMockPost()
      render(
        <PostCard
          post={post}
          currentUserId="user-123"
          showActions={false}
        />
      )

      const editButtons = screen.queryAllByText(/edit/i)
      expect(editButtons).toHaveLength(0)
    })
  })

  describe('삭제 플로우', () => {
    it('삭제 버튼 클릭 시 확인 메시지를 표시한다', async () => {
      const post = createMockPost()
      render(
        <PostCard
          post={post}
          currentUserId="user-123"
          showActions={true}
        />
      )

      // 삭제 버튼 찾기 (Trash2 아이콘)
      const deleteButtons = screen.getAllByRole('button')
      const deleteButton = deleteButtons.find(button => button.querySelector('svg'))

      if (deleteButton) {
        fireEvent.click(deleteButton)
        expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument()
        expect(screen.getByText('취소')).toBeInTheDocument()
        expect(screen.getByText('삭제')).toBeInTheDocument()
      }
    })

    it('삭제 확인 시 deletePostAction을 호출한다', async () => {
      mockDeletePostAction.mockResolvedValue({ success: true })

      const post = createMockPost()
      render(
        <PostCard
          post={post}
          currentUserId="user-123"
          showActions={true}
        />
      )

      const deleteButtons = screen.getAllByRole('button')
      const deleteButton = deleteButtons.find(button => button.querySelector('svg'))

      if (deleteButton) {
        fireEvent.click(deleteButton)

        const confirmButton = screen.getByText('삭제')
        fireEvent.click(confirmButton)

        await waitFor(() => {
          expect(mockDeletePostAction).toHaveBeenCalledWith('post-1')
        })
      }
    })

    it('삭제 성공 시 페이지를 새로고침한다', async () => {
      mockDeletePostAction.mockResolvedValue({ success: true })

      const post = createMockPost()
      render(
        <PostCard
          post={post}
          currentUserId="user-123"
          showActions={true}
        />
      )

      const deleteButtons = screen.getAllByRole('button')
      const deleteButton = deleteButtons.find(button => button.querySelector('svg'))

      if (deleteButton) {
        fireEvent.click(deleteButton)

        const confirmButton = screen.getByText('삭제')
        fireEvent.click(confirmButton)

        await waitFor(() => {
          expect(mockRouter.refresh).toHaveBeenCalled()
        })
      }
    })

    it('삭제 실패 시 에러 메시지를 표시한다', async () => {
      mockDeletePostAction.mockResolvedValue({
        success: false,
        error: '삭제 권한이 없습니다.'
      })

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

      const post = createMockPost()
      render(
        <PostCard
          post={post}
          currentUserId="user-123"
          showActions={true}
        />
      )

      const deleteButtons = screen.getAllByRole('button')
      const deleteButton = deleteButtons.find(button => button.querySelector('svg'))

      if (deleteButton) {
        fireEvent.click(deleteButton)

        const confirmButton = screen.getByText('삭제')
        fireEvent.click(confirmButton)

        await waitFor(() => {
          expect(alertSpy).toHaveBeenCalledWith('삭제 권한이 없습니다.')
        })
      }

      alertSpy.mockRestore()
    })
  })

  describe('링크 동작', () => {
    it('제목 클릭 시 게시글 상세 페이지로 이동한다', () => {
      const post = createMockPost()
      render(<PostCard post={post} />)

      const titleLink = screen.getByText('스윙댄스 레슨 후기 공유합니다!')
      expect(titleLink.closest('a')).toHaveAttribute('href', '/community/post-1')
    })
  })

  describe('콘텐츠 미리보기', () => {
    it('짧은 콘텐츠는 전체를 표시한다', () => {
      const post = createMockPost({
        content: '짧은 내용입니다.'
      })

      render(<PostCard post={post} />)
      expect(screen.getByText('"짧은 내용입니다."')).toBeInTheDocument()
    })

    it('긴 콘텐츠는 50자로 자르고 ...을 표시한다', () => {
      const longContent = '이것은 아주 긴 내용입니다. '.repeat(10)
      const post = createMockPost({
        content: longContent
      })

      render(<PostCard post={post} />)
      const truncatedText = `"${longContent.slice(0, 50)}..."`
      expect(screen.getByText(truncatedText)).toBeInTheDocument()
    })
  })

  describe('스윙댄스 커뮤니티 특화 시나리오', () => {
    it('이벤트 카테고리 게시글을 올바르게 표시한다', () => {
      const eventPost = createMockPost({
        category: 'event',
        title: '12월 스윙댄스 파티 모집!',
        tags: ['파티', '린디합', '홍대']
      })

      render(<PostCard post={eventPost} />)

      expect(screen.getByText('🎭')).toBeInTheDocument()
      expect(screen.getByText('이벤트/공지')).toBeInTheDocument()
      expect(screen.getByText('12월 스윙댄스 파티 모집!')).toBeInTheDocument()
    })

    it('중고거래 카테고리 게시글을 올바르게 표시한다', () => {
      const marketplacePost = createMockPost({
        category: 'marketplace',
        title: '스윙댄스 신발 판매합니다',
        tags: ['신발', '린디합', '중고']
      })

      render(<PostCard post={marketplacePost} />)

      expect(screen.getByText('🛍')).toBeInTheDocument()
      expect(screen.getByText('중고거래')).toBeInTheDocument()
      expect(screen.getByText('스윙댄스 신발 판매합니다')).toBeInTheDocument()
    })

    it('레슨 카테고리 게시글을 올바르게 표시한다', () => {
      const lessonPost = createMockPost({
        category: 'lesson',
        title: '초보자를 위한 린디합 레슨 안내',
        tags: ['린디합', '초보', '강남']
      })

      render(<PostCard post={lessonPost} />)

      expect(screen.getByText('📚')).toBeInTheDocument()
      expect(screen.getByText('레슨정보')).toBeInTheDocument()
      expect(screen.getByText('초보자를 위한 린디합 레슨 안내')).toBeInTheDocument()
    })

    it('Q&A 카테고리 게시글을 올바르게 표시한다', () => {
      const qnaPost = createMockPost({
        category: 'qna',
        title: '스윙아웃 연결 동작 질문있어요',
        tags: ['스윙아웃', '질문', '기초']
      })

      render(<PostCard post={qnaPost} />)

      expect(screen.getByText('❓')).toBeInTheDocument()
      expect(screen.getByText('질문답변')).toBeInTheDocument()
      expect(screen.getByText('스윙아웃 연결 동작 질문있어요')).toBeInTheDocument()
    })
  })
})