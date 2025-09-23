/**
 * Comprehensive tests for CommentSection component
 * Testing Korean swing dance community comment section functionality
 */

import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { CommentSection } from '@/components/community/CommentSection'
import { useComments } from '@/hooks/useComments'
import type { CommentNode } from '@/hooks/useComments'

// Mock the useComments hook
jest.mock('@/hooks/useComments')

// Mock the CommentForm and CommentItem components
jest.mock('@/components/community/CommentForm', () => ({
  CommentForm: ({ onSuccess, onCancel, placeholder }: any) => (
    <div data-testid="comment-form">
      <textarea data-testid="comment-textarea" placeholder={placeholder} />
      <button data-testid="comment-submit" onClick={() => onSuccess?.()}>
        Submit
      </button>
      <button data-testid="comment-cancel" onClick={() => onCancel?.()}>
        Cancel
      </button>
    </div>
  )
}))

jest.mock('@/components/community/CommentItem', () => ({
  CommentItem: ({ comment, onReplySuccess }: any) => (
    <div data-testid={`comment-item-${comment.id}`}>
      <span>{comment.content}</span>
      <button data-testid={`reply-success-${comment.id}`} onClick={() => onReplySuccess?.()}>
        Reply Success
      </button>
    </div>
  )
}))

const mockUseComments = useComments as jest.MockedFunction<typeof useComments>

describe('CommentSection Component', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockComments: CommentNode[] = [
    {
      id: 'comment_1',
      content: '린디합 기본기 정말 중요해요! 록스텝부터 천천히 연습하세요 🎵',
      level: 0,
      createdAt: {
        toMillis: () => 1640995200000,
        toDate: () => new Date(1640995200000)
      } as any,
      children: [
        {
          id: 'comment_2',
          content: '감사합니다! 정말 도움이 되었어요.',
          level: 1,
          createdAt: {
            toMillis: () => 1640995260000,
            toDate: () => new Date(1640995260000)
          } as any,
          children: []
        }
      ]
    },
    {
      id: 'comment_3',
      content: '워크숍에서 직접 배우는 것도 추천드려요! 홍대에 좋은 곳 많아요 😊',
      level: 0,
      createdAt: {
        toMillis: () => 1640995320000,
        toDate: () => new Date(1640995320000)
      } as any,
      children: []
    }
  ]

  const defaultProps = {
    postId: 'post_lindy_basics',
    currentUserId: 'user_test',
    currentUserName: '테스트유저',
    currentUserProfile: 'https://example.com/profile.jpg',
    initialCommentCount: 3
  }

  describe('✅ Success Cases - Rendering and Interaction', () => {

    it('should render comment section with header and controls', () => {
      mockUseComments.mockReturnValue({
        comments: mockComments,
        loading: false,
        error: null,
        totalCount: 3,
        refetch: jest.fn()
      })

      render(<CommentSection {...defaultProps} />)

      // Check header
      expect(screen.getByText('댓글 3')).toBeInTheDocument()

      // Check sort controls
      expect(screen.getByDisplayValue('newest')).toBeInTheDocument()
      expect(screen.getByText('접기')).toBeInTheDocument()
    })

    it('should show comment form when user clicks to write comment', () => {
      mockUseComments.mockReturnValue({
        comments: [],
        loading: false,
        error: null,
        totalCount: 0,
        refetch: jest.fn()
      })

      render(<CommentSection {...defaultProps} />)

      // Click to show comment form
      const writeButton = screen.getByText('댓글을 작성해주세요...')
      fireEvent.click(writeButton)

      // Should show comment form
      expect(screen.getByTestId('comment-form')).toBeInTheDocument()
      expect(screen.getByTestId('comment-textarea')).toBeInTheDocument()
    })

    it('should render comment list when comments are available', () => {
      mockUseComments.mockReturnValue({
        comments: mockComments,
        loading: false,
        error: null,
        totalCount: 3,
        refetch: jest.fn()
      })

      render(<CommentSection {...defaultProps} />)

      // Should render comment items
      expect(screen.getByTestId('comment-item-comment_1')).toBeInTheDocument()
      expect(screen.getByTestId('comment-item-comment_3')).toBeInTheDocument()

      // Should show comment content
      expect(screen.getByText(/린디합 기본기 정말 중요해요/)).toBeInTheDocument()
      expect(screen.getByText(/워크숍에서 직접 배우는 것도 추천드려요/)).toBeInTheDocument()
    })

    it('should handle comment sorting', () => {
      mockUseComments.mockReturnValue({
        comments: mockComments,
        loading: false,
        error: null,
        totalCount: 3,
        refetch: jest.fn()
      })

      render(<CommentSection {...defaultProps} />)

      // Find and change sort order
      const sortSelect = screen.getByDisplayValue('newest')
      fireEvent.change(sortSelect, { target: { value: 'oldest' } })

      expect(sortSelect).toHaveValue('oldest')
    })

    it('should collapse and expand comments', () => {
      mockUseComments.mockReturnValue({
        comments: mockComments,
        loading: false,
        error: null,
        totalCount: 3,
        refetch: jest.fn()
      })

      render(<CommentSection {...defaultProps} />)

      // Initially expanded - should show comments
      expect(screen.getByTestId('comment-item-comment_1')).toBeInTheDocument()

      // Click collapse button
      const collapseButton = screen.getByText('접기')
      fireEvent.click(collapseButton)

      // Should show expand button and hide comments
      expect(screen.getByText('펼치기')).toBeInTheDocument()
      expect(screen.getByText('3개의 댓글이 있습니다.')).toBeInTheDocument()
    })

    it('should handle comment form success', () => {
      const mockRefetch = jest.fn()

      mockUseComments.mockReturnValue({
        comments: [],
        loading: false,
        error: null,
        totalCount: 0,
        refetch: mockRefetch
      })

      render(<CommentSection {...defaultProps} />)

      // Show comment form
      const writeButton = screen.getByText('댓글을 작성해주세요...')
      fireEvent.click(writeButton)

      // Submit comment
      const submitButton = screen.getByTestId('comment-submit')
      fireEvent.click(submitButton)

      // Should refetch comments and hide form
      expect(mockRefetch).toHaveBeenCalled()
    })

    it('should handle reply success', () => {
      const mockRefetch = jest.fn()

      mockUseComments.mockReturnValue({
        comments: mockComments,
        loading: false,
        error: null,
        totalCount: 3,
        refetch: mockRefetch
      })

      render(<CommentSection {...defaultProps} />)

      // Trigger reply success
      const replyButton = screen.getByTestId('reply-success-comment_1')
      fireEvent.click(replyButton)

      // Should refetch comments
      expect(mockRefetch).toHaveBeenCalled()
    })
  })

  describe('🔄 Loading and Error States', () => {

    it('should show loading state', () => {
      mockUseComments.mockReturnValue({
        comments: [],
        loading: true,
        error: null,
        totalCount: 0,
        refetch: jest.fn()
      })

      render(<CommentSection {...defaultProps} />)

      expect(screen.getByText('댓글을 불러오는 중...')).toBeInTheDocument()
    })

    it('should show error state with retry button', () => {
      const mockRefetch = jest.fn()

      mockUseComments.mockReturnValue({
        comments: [],
        loading: false,
        error: new Error('Failed to load comments'),
        totalCount: 0,
        refetch: mockRefetch
      })

      render(<CommentSection {...defaultProps} />)

      expect(screen.getByText('댓글을 불러오는데 실패했습니다.')).toBeInTheDocument()

      // Should have retry button
      const retryButton = screen.getByText('다시 시도')
      fireEvent.click(retryButton)

      expect(mockRefetch).toHaveBeenCalled()
    })

    it('should show empty state when no comments', () => {
      mockUseComments.mockReturnValue({
        comments: [],
        loading: false,
        error: null,
        totalCount: 0,
        refetch: jest.fn()
      })

      render(<CommentSection {...defaultProps} />)

      expect(screen.getByText('아직 댓글이 없습니다.')).toBeInTheDocument()
      expect(screen.getByText('첫 번째 댓글을 작성해보세요!')).toBeInTheDocument()
    })
  })

  describe('🔐 Authentication States', () => {

    it('should show login prompt when user not authenticated', () => {
      mockUseComments.mockReturnValue({
        comments: [],
        loading: false,
        error: null,
        totalCount: 0,
        refetch: jest.fn()
      })

      const propsWithoutUser = {
        ...defaultProps,
        currentUserId: undefined,
        currentUserName: undefined
      }

      render(<CommentSection {...propsWithoutUser} />)

      expect(screen.getByText(/댓글을 작성하려면/)).toBeInTheDocument()
      expect(screen.getByText('로그인')).toBeInTheDocument()
    })

    it('should show comment form for authenticated users', () => {
      mockUseComments.mockReturnValue({
        comments: [],
        loading: false,
        error: null,
        totalCount: 0,
        refetch: jest.fn()
      })

      render(<CommentSection {...defaultProps} />)

      // Should show write button for authenticated users
      expect(screen.getByText('댓글을 작성해주세요...')).toBeInTheDocument()
    })
  })

  describe('📱 Component Props and Customization', () => {

    it('should apply custom className', () => {
      mockUseComments.mockReturnValue({
        comments: [],
        loading: false,
        error: null,
        totalCount: 0,
        refetch: jest.fn()
      })

      const { container } = render(
        <CommentSection {...defaultProps} className="custom-comment-section" />
      )

      expect(container.firstChild).toHaveClass('custom-comment-section')
    })

    it('should use initialCommentCount when totalCount is 0', () => {
      mockUseComments.mockReturnValue({
        comments: [],
        loading: false,
        error: null,
        totalCount: 0,
        refetch: jest.fn()
      })

      render(<CommentSection {...defaultProps} initialCommentCount={5} />)

      expect(screen.getByText('댓글 5')).toBeInTheDocument()
    })

    it('should prefer totalCount over initialCommentCount', () => {
      mockUseComments.mockReturnValue({
        comments: mockComments,
        loading: false,
        error: null,
        totalCount: 8,
        refetch: jest.fn()
      })

      render(<CommentSection {...defaultProps} initialCommentCount={5} />)

      expect(screen.getByText('댓글 8')).toBeInTheDocument()
    })
  })

  describe('🎯 Korean Swing Dance Community Scenarios', () => {

    it('should handle swing dance specific content correctly', () => {
      const swingComments: CommentNode[] = [
        {
          id: 'swing_comment_1',
          content: '스윙아웃 연습할 때 파트너와의 커넥션이 가장 중요해요! 💃🕺',
          level: 0,
          createdAt: {
            toMillis: () => 1640995200000,
            toDate: () => new Date(1640995200000)
          } as any,
          children: []
        }
      ]

      mockUseComments.mockReturnValue({
        comments: swingComments,
        loading: false,
        error: null,
        totalCount: 1,
        refetch: jest.fn()
      })

      render(<CommentSection {...defaultProps} />)

      expect(screen.getByText(/스윙아웃 연습할 때/)).toBeInTheDocument()
    })

    it('should handle Korean names and emojis correctly', () => {
      const mockRefetch = jest.fn()

      mockUseComments.mockReturnValue({
        comments: [],
        loading: false,
        error: null,
        totalCount: 0,
        refetch: mockRefetch
      })

      const koreanUserProps = {
        ...defaultProps,
        currentUserName: '김린디호퍼',
        currentUserProfile: undefined
      }

      render(<CommentSection {...koreanUserProps} />)

      // Show comment form
      const writeButton = screen.getByText('댓글을 작성해주세요...')
      fireEvent.click(writeButton)

      // Should show form with Korean user context
      expect(screen.getByTestId('comment-form')).toBeInTheDocument()
    })
  })

  describe('🔧 Hook Integration', () => {

    it('should pass correct options to useComments hook', () => {
      const mockRefetch = jest.fn()

      mockUseComments.mockReturnValue({
        comments: [],
        loading: false,
        error: null,
        totalCount: 0,
        refetch: mockRefetch
      })

      render(<CommentSection {...defaultProps} />)

      // Verify useComments was called with correct parameters
      expect(mockUseComments).toHaveBeenCalledWith('post_lindy_basics', {
        enabled: true,
        onError: expect.any(Function)
      })
    })

    it('should handle useComments error callback', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      mockUseComments.mockImplementation((postId, options) => {
        // Simulate error callback
        options?.onError?.(new Error('Test error'))

        return {
          comments: [],
          loading: false,
          error: null,
          totalCount: 0,
          refetch: jest.fn()
        }
      })

      render(<CommentSection {...defaultProps} />)

      expect(consoleSpy).toHaveBeenCalledWith('댓글 로딩 오류:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })
})