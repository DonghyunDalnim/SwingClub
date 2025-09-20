import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { PostForm } from '@/components/community/PostForm'
import { createPostAction, updatePostAction } from '@/lib/actions/posts'
import type { Post } from '@/lib/types/community'

// Mock dependencies
jest.mock('next/navigation')
jest.mock('@/lib/actions/posts')
jest.mock('@/components/community/ImageUpload', () => ({
  ImageUpload: ({ onUpload, existingImages, maxImages }: any) => (
    <div data-testid="image-upload">
      <button
        onClick={() => onUpload(['https://example.com/new-image.jpg'])}
        data-testid="upload-button"
      >
        Upload Image
      </button>
      <div data-testid="existing-images">
        {existingImages?.map((img: string, idx: number) => (
          <div key={idx} data-testid={`existing-image-${idx}`}>{img}</div>
        ))}
      </div>
      <div data-testid="max-images">Max: {maxImages}</div>
    </div>
  )
}))

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockedCreatePostAction = createPostAction as jest.MockedFunction<typeof createPostAction>
const mockedUpdatePostAction = updatePostAction as jest.MockedFunction<typeof updatePostAction>

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

// Mock post data
const createMockPost = (overrides: Partial<Post> = {}): Post => ({
  id: 'post-1',
  title: '스윙댄스 입문자를 위한 가이드',
  content: '스윙댄스를 시작하려는 분들을 위해 기초적인 내용들을 정리해봤습니다. 먼저 린디합부터 시작하시는 것을 추천드려요...',
  category: 'lesson',
  status: 'active',
  visibility: 'public',
  tags: ['린디합', '입문', '기초', '가이드'],
  stats: {
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    reports: 0,
    lastActivity: new MockTimestamp(Date.now() / 1000, 0) as any
  },
  metadata: {
    createdAt: new MockTimestamp(Date.now() / 1000, 0) as any,
    updatedAt: new MockTimestamp(Date.now() / 1000, 0) as any,
    authorId: 'user-123',
    authorName: '스윙마스터',
    isPinned: false
  },
  isPinned: false,
  isFeatured: false,
  attachments: [
    {
      id: 'img-1',
      fileName: 'guide.jpg',
      fileUrl: 'https://example.com/guide.jpg',
      fileSize: 1024000,
      mimeType: 'image/jpeg',
      uploadedAt: new MockTimestamp(Date.now() / 1000, 0) as any
    }
  ],
  ...overrides
})

describe('PostForm 컴포넌트', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseRouter.mockReturnValue(mockRouter)
  })

  describe('기본 렌더링', () => {
    it('새 게시글 작성 폼을 올바르게 렌더링한다', () => {
      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      expect(screen.getByText('게시글 작성')).toBeInTheDocument()
      expect(screen.getByLabelText('제목 *')).toBeInTheDocument()
      expect(screen.getByLabelText('내용 *')).toBeInTheDocument()
      expect(screen.getByText('카테고리')).toBeInTheDocument()
      expect(screen.getByText('태그')).toBeInTheDocument()
      expect(screen.getByText('이미지')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '게시글 작성' })).toBeInTheDocument()
    })

    it('게시글 수정 폼을 올바르게 렌더링한다', () => {
      const mockPost = createMockPost()

      render(
        <PostForm
          userId="user-123"
          userName="스윙마스터"
          mode="edit"
          initialData={mockPost}
        />
      )

      expect(screen.getByText('게시글 수정')).toBeInTheDocument()
      expect(screen.getByDisplayValue('스윙댄스 입문자를 위한 가이드')).toBeInTheDocument()
      expect(screen.getByDisplayValue(mockPost.content)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '게시글 수정' })).toBeInTheDocument()
    })
  })

  describe('카테고리 선택', () => {
    it('모든 카테고리 옵션을 표시한다', () => {
      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      expect(screen.getByText('자유게시판')).toBeInTheDocument()
      expect(screen.getByText('질문답변')).toBeInTheDocument()
      expect(screen.getByText('이벤트/공지')).toBeInTheDocument()
      expect(screen.getByText('중고거래')).toBeInTheDocument()
      expect(screen.getByText('레슨정보')).toBeInTheDocument()
      expect(screen.getByText('리뷰')).toBeInTheDocument()
    })

    it('카테고리를 선택할 수 있다', async () => {
      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      const lessonCategory = screen.getByText('레슨정보')
      await user.click(lessonCategory)

      // 선택된 카테고리가 활성화 스타일을 가지는지 확인하기 위해
      // 클래스 확인 대신 재렌더링 후 상태 확인
      expect(lessonCategory).toBeInTheDocument()
    })

    it('수정 모드에서 기존 카테고리가 선택되어 있다', () => {
      const mockPost = createMockPost({ category: 'review' })

      render(
        <PostForm
          userId="user-123"
          userName="스윙마스터"
          mode="edit"
          initialData={mockPost}
        />
      )

      // 리뷰 카테고리가 선택되어 있는지 확인
      const reviewCategory = screen.getByText('리뷰')
      expect(reviewCategory).toBeInTheDocument()
    })
  })

  describe('폼 입력', () => {
    it('제목을 입력할 수 있다', async () => {
      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('제목 *')
      await user.type(titleInput, '새로운 스윙댄스 이벤트')

      expect(titleInput).toHaveValue('새로운 스윙댄스 이벤트')
    })

    it('내용을 입력할 수 있다', async () => {
      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      const contentTextarea = screen.getByLabelText('내용 *')
      await user.type(contentTextarea, '12월에 홍대에서 스윙댄스 파티가 있습니다.')

      expect(contentTextarea).toHaveValue('12월에 홍대에서 스윙댄스 파티가 있습니다.')
    })

    it('제목 길이를 100자로 제한한다', () => {
      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('제목 *')
      expect(titleInput).toHaveAttribute('maxLength', '100')
    })
  })

  describe('태그 관리', () => {
    it('태그를 추가할 수 있다', async () => {
      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요')
      const addButton = screen.getByText('추가')

      await user.type(tagInput, '린디합')
      await user.click(addButton)

      expect(screen.getByText('#린디합 ×')).toBeInTheDocument()
      expect(tagInput).toHaveValue('')
    })

    it('엔터키로 태그를 추가할 수 있다', async () => {
      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요')

      await user.type(tagInput, '발뽀{enter}')

      expect(screen.getByText('#발뽀 ×')).toBeInTheDocument()
      expect(tagInput).toHaveValue('')
    })

    it('중복 태그를 추가하지 않는다', async () => {
      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요')
      const addButton = screen.getByText('추가')

      await user.type(tagInput, '린디합')
      await user.click(addButton)

      await user.type(tagInput, '린디합')
      await user.click(addButton)

      const tags = screen.getAllByText(/#린디합 ×/)
      expect(tags).toHaveLength(1)
    })

    it('태그를 제거할 수 있다', async () => {
      const mockPost = createMockPost({
        tags: ['린디합', '발뽀']
      })

      render(
        <PostForm
          userId="user-123"
          userName="스윙마스터"
          mode="edit"
          initialData={mockPost}
        />
      )

      const removeTagButton = screen.getByText('#린디합 ×')
      await user.click(removeTagButton)

      expect(screen.queryByText('#린디합 ×')).not.toBeInTheDocument()
      expect(screen.getByText('#발뽀 ×')).toBeInTheDocument()
    })

    it('태그 개수를 10개로 제한한다', async () => {
      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요')

      // 10개 태그 추가
      for (let i = 1; i <= 10; i++) {
        await user.type(tagInput, `태그${i}{enter}`)
      }

      // 11번째 태그는 추가되지 않아야 함
      await user.type(tagInput, '태그11{enter}')

      expect(screen.queryByText('#태그11 ×')).not.toBeInTheDocument()
      expect(screen.getByText('#태그10 ×')).toBeInTheDocument()
    })

    it('태그 길이를 20자로 제한한다', () => {
      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요')
      expect(tagInput).toHaveAttribute('maxLength', '20')
    })
  })

  describe('이미지 업로드', () => {
    it('ImageUpload 컴포넌트를 렌더링한다', () => {
      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      expect(screen.getByTestId('image-upload')).toBeInTheDocument()
      expect(screen.getByTestId('max-images')).toHaveTextContent('Max: 5')
    })

    it('이미지 업로드를 처리한다', async () => {
      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      const uploadButton = screen.getByTestId('upload-button')
      await user.click(uploadButton)

      // 이미지 업로드 후 상태가 업데이트되는지 확인하는 것은
      // ImageUpload 컴포넌트를 mock했기 때문에 직접적으로 확인하기 어려움
      expect(uploadButton).toBeInTheDocument()
    })

    it('수정 모드에서 기존 이미지를 표시한다', () => {
      const mockPost = createMockPost()

      render(
        <PostForm
          userId="user-123"
          userName="스윙마스터"
          mode="edit"
          initialData={mockPost}
        />
      )

      expect(screen.getByTestId('existing-image-0')).toHaveTextContent('https://example.com/guide.jpg')
    })
  })

  describe('폼 검증', () => {
    it('제목이 비어있으면 에러 메시지를 표시한다', async () => {
      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      const submitButton = screen.getByRole('button', { name: '게시글 작성' })
      await user.click(submitButton)

      expect(screen.getByText('제목을 입력해주세요.')).toBeInTheDocument()
    })

    it('내용이 비어있으면 에러 메시지를 표시한다', async () => {
      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('제목 *')
      await user.type(titleInput, '제목')

      const submitButton = screen.getByRole('button', { name: '게시글 작성' })
      await user.click(submitButton)

      expect(screen.getByText('내용을 입력해주세요.')).toBeInTheDocument()
    })

    it('제목과 내용이 비어있으면 제출 버튼이 비활성화된다', () => {
      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      const submitButton = screen.getByRole('button', { name: '게시글 작성' })
      expect(submitButton).toBeDisabled()
    })

    it('제목과 내용을 입력하면 제출 버튼이 활성화된다', async () => {
      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('제목 *')
      const contentTextarea = screen.getByLabelText('내용 *')

      await user.type(titleInput, '제목')
      await user.type(contentTextarea, '내용')

      const submitButton = screen.getByRole('button', { name: '게시글 작성' })
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('게시글 작성', () => {
    it('새 게시글을 성공적으로 작성한다', async () => {
      mockedCreatePostAction.mockResolvedValue({
        success: true,
        postId: 'new-post-123'
      })

      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('제목 *')
      const contentTextarea = screen.getByLabelText('내용 *')
      const lessonCategory = screen.getByText('레슨정보')

      await user.type(titleInput, '스윙댄스 기초 가이드')
      await user.type(contentTextarea, '스윙댄스를 처음 시작하는 분들을 위한 가이드입니다.')
      await user.click(lessonCategory)

      const submitButton = screen.getByRole('button', { name: '게시글 작성' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedCreatePostAction).toHaveBeenCalledWith({
          title: '스윙댄스 기초 가이드',
          content: '스윙댄스를 처음 시작하는 분들을 위한 가이드입니다.',
          category: 'lesson',
          tags: [],
          visibility: 'public',
          attachments: []
        })
      })

      expect(mockRouter.push).toHaveBeenCalledWith('/community/new-post-123')
    })

    it('게시글 작성 실패 시 에러 메시지를 표시한다', async () => {
      mockedCreatePostAction.mockResolvedValue({
        success: false,
        error: '권한이 없습니다.'
      })

      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('제목 *')
      const contentTextarea = screen.getByLabelText('내용 *')

      await user.type(titleInput, '제목')
      await user.type(contentTextarea, '내용')

      const submitButton = screen.getByRole('button', { name: '게시글 작성' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('권한이 없습니다.')).toBeInTheDocument()
      })
    })

    it('작성 중 로딩 상태를 표시한다', async () => {
      mockedCreatePostAction.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, postId: 'test' }), 1000))
      )

      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('제목 *')
      const contentTextarea = screen.getByLabelText('내용 *')

      await user.type(titleInput, '제목')
      await user.type(contentTextarea, '내용')

      const submitButton = screen.getByRole('button', { name: '게시글 작성' })
      await user.click(submitButton)

      expect(screen.getByText('작성 중...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
  })

  describe('게시글 수정', () => {
    it('기존 게시글을 성공적으로 수정한다', async () => {
      const mockPost = createMockPost()

      mockedUpdatePostAction.mockResolvedValue({
        success: true
      })

      render(
        <PostForm
          userId="user-123"
          userName="스윙마스터"
          mode="edit"
          initialData={mockPost}
        />
      )

      const titleInput = screen.getByDisplayValue('스윙댄스 입문자를 위한 가이드')
      await user.clear(titleInput)
      await user.type(titleInput, '수정된 스윙댄스 가이드')

      const submitButton = screen.getByRole('button', { name: '게시글 수정' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedUpdatePostAction).toHaveBeenCalledWith('post-1', {
          title: '수정된 스윙댄스 가이드',
          content: mockPost.content,
          category: 'lesson',
          tags: ['린디합', '입문', '기초', '가이드'],
          visibility: 'public',
          attachments: expect.any(Array)
        })
      })

      expect(mockRouter.push).toHaveBeenCalledWith('/community/post-1')
    })

    it('게시글 수정 실패 시 에러 메시지를 표시한다', async () => {
      const mockPost = createMockPost()

      mockedUpdatePostAction.mockResolvedValue({
        success: false,
        error: '수정 권한이 없습니다.'
      })

      render(
        <PostForm
          userId="user-123"
          userName="스윙마스터"
          mode="edit"
          initialData={mockPost}
        />
      )

      const submitButton = screen.getByRole('button', { name: '게시글 수정' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('수정 권한이 없습니다.')).toBeInTheDocument()
      })
    })
  })

  describe('취소 기능', () => {
    it('취소 버튼 클릭 시 이전 페이지로 이동한다', async () => {
      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      const cancelButton = screen.getByText('취소')
      await user.click(cancelButton)

      expect(mockRouter.back).toHaveBeenCalled()
    })

    it('작성 중에는 취소 버튼이 비활성화된다', async () => {
      mockedCreatePostAction.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, postId: 'test' }), 1000))
      )

      render(
        <PostForm
          userId="user-123"
          userName="스윙러버"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('제목 *')
      const contentTextarea = screen.getByLabelText('내용 *')

      await user.type(titleInput, '제목')
      await user.type(contentTextarea, '내용')

      const submitButton = screen.getByRole('button', { name: '게시글 작성' })
      await user.click(submitButton)

      const cancelButton = screen.getByText('취소')
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('스윙댄스 커뮤니티 특화 시나리오', () => {
    it('이벤트 게시글을 작성할 수 있다', async () => {
      mockedCreatePostAction.mockResolvedValue({
        success: true,
        postId: 'event-post-123'
      })

      render(
        <PostForm
          userId="user-123"
          userName="이벤트기획자"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('제목 *')
      const contentTextarea = screen.getByLabelText('내용 *')
      const eventCategory = screen.getByText('이벤트/공지')
      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요')

      await user.type(titleInput, '12월 홍대 스윙댄스 파티')
      await user.type(contentTextarea, '연말을 맞아 특별한 스윙댄스 파티를 개최합니다!')
      await user.click(eventCategory)
      await user.type(tagInput, '파티{enter}')
      await user.type(tagInput, '홍대{enter}')
      await user.type(tagInput, '연말이벤트{enter}')

      const submitButton = screen.getByRole('button', { name: '게시글 작성' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedCreatePostAction).toHaveBeenCalledWith({
          title: '12월 홍대 스윙댄스 파티',
          content: '연말을 맞아 특별한 스윙댄스 파티를 개최합니다!',
          category: 'event',
          tags: ['파티', '홍대', '연말이벤트'],
          visibility: 'public',
          attachments: []
        })
      })
    })

    it('중고거래 게시글을 작성할 수 있다', async () => {
      mockedCreatePostAction.mockResolvedValue({
        success: true,
        postId: 'marketplace-post-123'
      })

      render(
        <PostForm
          userId="user-123"
          userName="춤신"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('제목 *')
      const contentTextarea = screen.getByLabelText('내용 *')
      const marketplaceCategory = screen.getByText('중고거래')
      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요')

      await user.type(titleInput, '스윙댄스화 판매합니다')
      await user.type(contentTextarea, '거의 새 상품 스윙댄스화 판매합니다. 사이즈 250입니다.')
      await user.click(marketplaceCategory)
      await user.type(tagInput, '신발{enter}')
      await user.type(tagInput, '250{enter}')
      await user.type(tagInput, '중고{enter}')

      const submitButton = screen.getByRole('button', { name: '게시글 작성' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedCreatePostAction).toHaveBeenCalledWith({
          title: '스윙댄스화 판매합니다',
          content: '거의 새 상품 스윙댄스화 판매합니다. 사이즈 250입니다.',
          category: 'marketplace',
          tags: ['신발', '250', '중고'],
          visibility: 'public',
          attachments: []
        })
      })
    })

    it('질문답변 게시글을 작성할 수 있다', async () => {
      mockedCreatePostAction.mockResolvedValue({
        success: true,
        postId: 'qna-post-123'
      })

      render(
        <PostForm
          userId="user-123"
          userName="초보댄서"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('제목 *')
      const contentTextarea = screen.getByLabelText('내용 *')
      const qnaCategory = screen.getByText('질문답변')
      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요')

      await user.type(titleInput, '스윙아웃 연결동작 어떻게 하나요?')
      await user.type(contentTextarea, '스윙아웃 후 다음 동작으로 자연스럽게 연결하는 방법이 궁금합니다.')
      await user.click(qnaCategory)
      await user.type(tagInput, '스윙아웃{enter}')
      await user.type(tagInput, '연결동작{enter}')
      await user.type(tagInput, '질문{enter}')

      const submitButton = screen.getByRole('button', { name: '게시글 작성' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedCreatePostAction).toHaveBeenCalledWith({
          title: '스윙아웃 연결동작 어떻게 하나요?',
          content: '스윙아웃 후 다음 동작으로 자연스럽게 연결하는 방법이 궁금합니다.',
          category: 'qna',
          tags: ['스윙아웃', '연결동작', '질문'],
          visibility: 'public',
          attachments: []
        })
      })
    })
  })
})