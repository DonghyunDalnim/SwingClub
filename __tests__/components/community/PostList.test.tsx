import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PostList } from '@/components/community/PostList'
import { getPostsAction } from '@/lib/actions/posts'
import type { Post } from '@/lib/types/community'

// Mock dependencies
jest.mock('@/lib/actions/posts')
jest.mock('@/components/community/PostCard', () => ({
  PostCard: ({ post, currentUserId, showActions, isPinned }: any) => (
    <div data-testid={`post-card-${post.id}`}>
      <h3>{post.title}</h3>
      <div data-testid="post-category">{post.category}</div>
      <div data-testid="post-author">{post.metadata.authorName}</div>
      {isPinned && <div data-testid="pinned-indicator">📌</div>}
      {currentUserId && <div data-testid="current-user">{currentUserId}</div>}
      {showActions && <div data-testid="show-actions">actions</div>}
    </div>
  )
}))

const mockedGetPostsAction = getPostsAction as jest.MockedFunction<typeof getPostsAction>

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
  title: '스윙댄스 입문 가이드',
  content: '스윙댄스를 시작하려는 분들을 위한 가이드입니다.',
  category: 'lesson',
  status: 'active',
  visibility: 'public',
  tags: ['린디합', '입문'],
  stats: {
    views: 150,
    likes: 25,
    comments: 12,
    shares: 5,
    reports: 0,
    lastActivity: new MockTimestamp(Date.now() / 1000, 0) as any
  },
  metadata: {
    createdAt: new MockTimestamp(Date.now() / 1000 - 3600, 0) as any,
    updatedAt: new MockTimestamp(Date.now() / 1000, 0) as any,
    authorId: 'user-123',
    authorName: '스윙마스터',
    isPinned: false
  },
  isPinned: false,
  isFeatured: false,
  region: '서울',
  ...overrides
})

const createMockPosts = (): Post[] => [
  createMockPost({
    id: 'post-1',
    title: '📌 스윙댄스 커뮤니티 규칙',
    category: 'event',
    metadata: {
      ...createMockPost().metadata,
      authorName: '관리자',
      isPinned: true
    },
    isPinned: true
  }),
  createMockPost({
    id: 'post-2',
    title: '홍대 스윙댄스 파티 후기',
    category: 'review',
    metadata: {
      ...createMockPost().metadata,
      authorName: '파티러버',
      createdAt: new MockTimestamp(Date.now() / 1000 - 1800, 0) as any
    }
  }),
  createMockPost({
    id: 'post-3',
    title: '스윙댄스화 판매합니다',
    category: 'marketplace',
    metadata: {
      ...createMockPost().metadata,
      authorName: '댄스슈즈',
      createdAt: new MockTimestamp(Date.now() / 1000 - 7200, 0) as any
    }
  }),
  createMockPost({
    id: 'post-4',
    title: '린디합 연결동작 질문',
    category: 'qna',
    metadata: {
      ...createMockPost().metadata,
      authorName: '초보댄서',
      createdAt: new MockTimestamp(Date.now() / 1000 - 10800, 0) as any
    }
  }),
  createMockPost({
    id: 'post-5',
    title: '강남 스윙댄스 레슨 추천',
    category: 'lesson',
    metadata: {
      ...createMockPost().metadata,
      authorName: '레슨추천',
      createdAt: new MockTimestamp(Date.now() / 1000 - 14400, 0) as any
    }
  })
]

// Mock window.location.href
delete (window as any).location
window.location = { href: '' } as any

describe('PostList 컴포넌트', () => {
  const user = userEvent.setup()
  const mockPosts = createMockPosts()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetPostsAction.mockResolvedValue({
      success: true,
      data: mockPosts
    })
  })

  describe('기본 렌더링', () => {
    it('초기 게시글 목록을 렌더링한다', () => {
      render(<PostList initialPosts={mockPosts} />)

      expect(screen.getByTestId('post-card-post-1')).toBeInTheDocument()
      expect(screen.getByTestId('post-card-post-2')).toBeInTheDocument()
      expect(screen.getByTestId('post-card-post-3')).toBeInTheDocument()
      expect(screen.getByTestId('post-card-post-4')).toBeInTheDocument()
      expect(screen.getByTestId('post-card-post-5')).toBeInTheDocument()
    })

    it('검색 바를 렌더링한다', () => {
      render(<PostList initialPosts={mockPosts} />)

      expect(screen.getByPlaceholderText('게시글 검색...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '검색' })).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument() // Filter button
    })

    it('currentUserId와 showActions props을 PostCard에 전달한다', () => {
      render(
        <PostList
          initialPosts={mockPosts}
          currentUserId="user-123"
          showActions={true}
        />
      )

      expect(screen.getByTestId('current-user')).toHaveTextContent('user-123')
      expect(screen.getByTestId('show-actions')).toHaveTextContent('actions')
    })
  })

  describe('검색 기능', () => {
    it('검색어를 입력할 수 있다', async () => {
      render(<PostList initialPosts={mockPosts} />)

      const searchInput = screen.getByPlaceholderText('게시글 검색...')
      await user.type(searchInput, '스윙댄스')

      expect(searchInput).toHaveValue('스윙댄스')
    })

    it('검색 버튼 클릭 시 검색을 실행한다', async () => {
      const filteredPosts = mockPosts.filter(post =>
        post.title.includes('스윙댄스')
      )

      mockedGetPostsAction.mockResolvedValue({
        success: true,
        data: filteredPosts
      })

      render(<PostList initialPosts={mockPosts} />)

      const searchInput = screen.getByPlaceholderText('게시글 검색...')
      const searchButton = screen.getByRole('button', { name: '검색' })

      await user.type(searchInput, '스윙댄스')
      await user.click(searchButton)

      await waitFor(() => {
        expect(mockedGetPostsAction).toHaveBeenCalledWith({
          sortBy: 'latest',
          keyword: '스윙댄스'
        })
      })
    })

    it('엔터키로 검색을 실행한다', async () => {
      mockedGetPostsAction.mockResolvedValue({
        success: true,
        data: []
      })

      render(<PostList initialPosts={mockPosts} />)

      const searchInput = screen.getByPlaceholderText('게시글 검색...')
      await user.type(searchInput, '파티{enter}')

      await waitFor(() => {
        expect(mockedGetPostsAction).toHaveBeenCalledWith({
          sortBy: 'latest',
          keyword: '파티'
        })
      })
    })

    it('검색 중 로딩 상태를 표시한다', async () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })

      mockedGetPostsAction.mockReturnValue(promise as any)

      render(<PostList initialPosts={mockPosts} />)

      const searchButton = screen.getByRole('button', { name: '검색' })
      await user.click(searchButton)

      expect(screen.getByText('게시글을 불러오는 중...')).toBeInTheDocument()
      expect(searchButton).toBeDisabled()

      resolvePromise!({ success: true, data: [] })
    })
  })

  describe('필터링 기능', () => {
    it('필터 버튼 클릭 시 필터 옵션을 표시한다', async () => {
      render(<PostList initialPosts={mockPosts} />)

      const filterButton = screen.getAllByRole('button').find(button =>
        button.querySelector('svg') // Filter icon
      )

      if (filterButton) {
        await user.click(filterButton)

        expect(screen.getByText('카테고리')).toBeInTheDocument()
        expect(screen.getByText('정렬')).toBeInTheDocument()
      }
    })

    it('카테고리 필터를 표시한다', async () => {
      render(<PostList initialPosts={mockPosts} />)

      const filterButton = screen.getAllByRole('button').find(button =>
        button.querySelector('svg')
      )

      if (filterButton) {
        await user.click(filterButton)

        expect(screen.getByText('전체')).toBeInTheDocument()
        expect(screen.getByText('자유게시판')).toBeInTheDocument()
        expect(screen.getByText('질문답변')).toBeInTheDocument()
        expect(screen.getByText('이벤트/공지')).toBeInTheDocument()
        expect(screen.getByText('중고거래')).toBeInTheDocument()
        expect(screen.getByText('레슨정보')).toBeInTheDocument()
        expect(screen.getByText('리뷰')).toBeInTheDocument()
      }
    })

    it('정렬 옵션을 표시한다', async () => {
      render(<PostList initialPosts={mockPosts} />)

      const filterButton = screen.getAllByRole('button').find(button =>
        button.querySelector('svg')
      )

      if (filterButton) {
        await user.click(filterButton)

        expect(screen.getByText('최신순')).toBeInTheDocument()
        expect(screen.getByText('인기순')).toBeInTheDocument()
        expect(screen.getByText('조회순')).toBeInTheDocument()
      }
    })

    it('카테고리 필터를 적용한다', async () => {
      const lessonPosts = mockPosts.filter(post => post.category === 'lesson')
      mockedGetPostsAction.mockResolvedValue({
        success: true,
        data: lessonPosts
      })

      render(<PostList initialPosts={mockPosts} />)

      const filterButton = screen.getAllByRole('button').find(button =>
        button.querySelector('svg')
      )

      if (filterButton) {
        await user.click(filterButton)

        const lessonFilter = screen.getByText('레슨정보')
        await user.click(lessonFilter)

        await waitFor(() => {
          expect(mockedGetPostsAction).toHaveBeenCalledWith({
            category: 'lesson',
            sortBy: 'latest'
          })
        })
      }
    })

    it('정렬 옵션을 변경한다', async () => {
      mockedGetPostsAction.mockResolvedValue({
        success: true,
        data: mockPosts
      })

      render(<PostList initialPosts={mockPosts} />)

      const filterButton = screen.getAllByRole('button').find(button =>
        button.querySelector('svg')
      )

      if (filterButton) {
        await user.click(filterButton)

        const popularSort = screen.getByText('인기순')
        await user.click(popularSort)

        await waitFor(() => {
          expect(mockedGetPostsAction).toHaveBeenCalledWith({
            sortBy: 'popular'
          })
        })
      }
    })
  })

  describe('고정 게시글', () => {
    it('고정 게시글과 일반 게시글을 분리하여 표시한다', () => {
      render(<PostList initialPosts={mockPosts} />)

      expect(screen.getByText('📌 고정 게시글')).toBeInTheDocument()
      expect(screen.getByText('📝 게시글')).toBeInTheDocument()
    })

    it('고정 게시글에 isPinned prop을 전달한다', () => {
      render(<PostList initialPosts={mockPosts} />)

      const pinnedPost = screen.getByTestId('post-card-post-1')
      expect(pinnedPost.querySelector('[data-testid="pinned-indicator"]')).toBeInTheDocument()
    })

    it('고정 게시글만 있을 때 일반 게시글 섹션을 표시하지 않는다', () => {
      const pinnedOnlyPosts = [mockPosts[0]] // 고정 게시글만
      render(<PostList initialPosts={pinnedOnlyPosts} />)

      expect(screen.getByText('📌 고정 게시글')).toBeInTheDocument()
      expect(screen.queryByText('📝 게시글')).not.toBeInTheDocument()
    })
  })

  describe('빈 상태', () => {
    it('게시글이 없을 때 빈 상태 메시지를 표시한다', () => {
      render(<PostList initialPosts={[]} />)

      expect(screen.getByText('아직 게시글이 없습니다.')).toBeInTheDocument()
      expect(screen.getByText('첫 번째 게시글 작성하기')).toBeInTheDocument()
    })

    it('검색 결과가 없을 때 해당 메시지를 표시한다', async () => {
      mockedGetPostsAction.mockResolvedValue({
        success: true,
        data: []
      })

      render(<PostList initialPosts={mockPosts} />)

      const searchInput = screen.getByPlaceholderText('게시글 검색...')
      const searchButton = screen.getByRole('button', { name: '검색' })

      await user.type(searchInput, '존재하지않는검색어')
      await user.click(searchButton)

      await waitFor(() => {
        expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument()
      })
    })

    it('필터 결과가 없을 때 해당 메시지를 표시한다', async () => {
      mockedGetPostsAction.mockResolvedValue({
        success: true,
        data: []
      })

      render(<PostList initialPosts={mockPosts} />)

      const filterButton = screen.getAllByRole('button').find(button =>
        button.querySelector('svg')
      )

      if (filterButton) {
        await user.click(filterButton)

        const generalFilter = screen.getByText('자유게시판')
        await user.click(generalFilter)

        await waitFor(() => {
          expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument()
        })
      }
    })

    it('빈 상태에서 게시글 작성 버튼을 클릭할 수 있다', async () => {
      render(<PostList initialPosts={[]} />)

      const writeButton = screen.getByText('첫 번째 게시글 작성하기')
      await user.click(writeButton)

      expect(window.location.href).toBe('/community/write')
    })
  })

  describe('더보기 기능', () => {
    it('10개 이상의 게시글이 있을 때 더보기 버튼을 표시한다', () => {
      const manyPosts = Array.from({ length: 15 }, (_, i) =>
        createMockPost({
          id: `post-${i + 1}`,
          title: `게시글 ${i + 1}`
        })
      )

      render(<PostList initialPosts={manyPosts} />)

      expect(screen.getByText('더보기')).toBeInTheDocument()
    })

    it('10개 미만의 게시글일 때 더보기 버튼을 표시하지 않는다', () => {
      render(<PostList initialPosts={mockPosts} />)

      expect(screen.queryByText('더보기')).not.toBeInTheDocument()
    })

    it('더보기 버튼 클릭 시 추가 게시글을 로드한다', async () => {
      const manyPosts = Array.from({ length: 15 }, (_, i) =>
        createMockPost({
          id: `post-${i + 1}`,
          title: `게시글 ${i + 1}`
        })
      )

      mockedGetPostsAction.mockResolvedValue({
        success: true,
        data: manyPosts
      })

      render(<PostList initialPosts={manyPosts} />)

      const moreButton = screen.getByText('더보기')
      await user.click(moreButton)

      await waitFor(() => {
        expect(mockedGetPostsAction).toHaveBeenCalledWith({
          sortBy: 'latest'
        })
      })
    })
  })

  describe('로딩 상태', () => {
    it('로딩 중에는 스피너를 표시한다', async () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })

      mockedGetPostsAction.mockReturnValue(promise as any)

      render(<PostList initialPosts={mockPosts} />)

      const searchButton = screen.getByRole('button', { name: '검색' })
      await user.click(searchButton)

      expect(screen.getByText('게시글을 불러오는 중...')).toBeInTheDocument()

      resolvePromise!({ success: true, data: [] })
    })

    it('로딩 중에는 게시글 목록을 숨긴다', async () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })

      mockedGetPostsAction.mockReturnValue(promise as any)

      render(<PostList initialPosts={mockPosts} />)

      const searchButton = screen.getByRole('button', { name: '검색' })
      await user.click(searchButton)

      expect(screen.queryByTestId('post-card-post-1')).not.toBeInTheDocument()

      resolvePromise!({ success: true, data: mockPosts })

      await waitFor(() => {
        expect(screen.getByTestId('post-card-post-1')).toBeInTheDocument()
      })
    })
  })

  describe('스윙댄스 커뮤니티 특화 시나리오', () => {
    it('다양한 카테고리의 게시글을 표시한다', () => {
      render(<PostList initialPosts={mockPosts} />)

      expect(screen.getByText('📌 스윙댄스 커뮤니티 규칙')).toBeInTheDocument()
      expect(screen.getByText('홍대 스윙댄스 파티 후기')).toBeInTheDocument()
      expect(screen.getByText('스윙댄스화 판매합니다')).toBeInTheDocument()
      expect(screen.getByText('린디합 연결동작 질문')).toBeInTheDocument()
      expect(screen.getByText('강남 스윙댄스 레슨 추천')).toBeInTheDocument()
    })

    it('스윙댄스 관련 검색을 수행한다', async () => {
      const swingPosts = mockPosts.filter(post =>
        post.title.includes('스윙') || post.title.includes('린디합')
      )

      mockedGetPostsAction.mockResolvedValue({
        success: true,
        data: swingPosts
      })

      render(<PostList initialPosts={mockPosts} />)

      const searchInput = screen.getByPlaceholderText('게시글 검색...')
      const searchButton = screen.getByRole('button', { name: '검색' })

      await user.type(searchInput, '린디합')
      await user.click(searchButton)

      await waitFor(() => {
        expect(mockedGetPostsAction).toHaveBeenCalledWith({
          sortBy: 'latest',
          keyword: '린디합'
        })
      })
    })

    it('레슨 카테고리로 필터링한다', async () => {
      const lessonPosts = mockPosts.filter(post => post.category === 'lesson')
      mockedGetPostsAction.mockResolvedValue({
        success: true,
        data: lessonPosts
      })

      render(<PostList initialPosts={mockPosts} />)

      const filterButton = screen.getAllByRole('button').find(button =>
        button.querySelector('svg')
      )

      if (filterButton) {
        await user.click(filterButton)

        const lessonFilter = screen.getByText('레슨정보')
        await user.click(lessonFilter)

        await waitFor(() => {
          expect(mockedGetPostsAction).toHaveBeenCalledWith({
            category: 'lesson',
            sortBy: 'latest'
          })
        })
      }
    })

    it('중고거래 카테고리로 필터링한다', async () => {
      const marketplacePosts = mockPosts.filter(post => post.category === 'marketplace')
      mockedGetPostsAction.mockResolvedValue({
        success: true,
        data: marketplacePosts
      })

      render(<PostList initialPosts={mockPosts} />)

      const filterButton = screen.getAllByRole('button').find(button =>
        button.querySelector('svg')
      )

      if (filterButton) {
        await user.click(filterButton)

        const marketplaceFilter = screen.getByText('중고거래')
        await user.click(marketplaceFilter)

        await waitFor(() => {
          expect(mockedGetPostsAction).toHaveBeenCalledWith({
            category: 'marketplace',
            sortBy: 'latest'
          })
        })
      }
    })
  })

  describe('에러 처리', () => {
    it('게시글 로드 실패 시 콘솔에 에러를 출력한다', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      mockedGetPostsAction.mockRejectedValue(new Error('Network error'))

      render(<PostList initialPosts={mockPosts} />)

      const searchButton = screen.getByRole('button', { name: '검색' })
      await user.click(searchButton)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('게시글 로드 실패:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })

    it('게시글 로드 실패 시에도 기존 목록을 유지한다', async () => {
      mockedGetPostsAction.mockRejectedValue(new Error('Network error'))

      render(<PostList initialPosts={mockPosts} />)

      const searchButton = screen.getByRole('button', { name: '검색' })
      await user.click(searchButton)

      await waitFor(() => {
        expect(screen.getByTestId('post-card-post-1')).toBeInTheDocument()
      })
    })
  })
})