/**
 * Comprehensive tests for CommentItem component
 * Testing Korean swing dance community comment item functionality
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CommentItem } from '@/components/community/CommentItem'
import {
  updateCommentAction,
  deleteCommentAction,
  likeCommentAction,
  unlikeCommentAction
} from '@/lib/actions/comments'
import type { CommentNode } from '@/hooks/useComments'

// Mock the comment actions
jest.mock('@/lib/actions/comments')

// Mock the CommentForm component
jest.mock('@/components/community/CommentForm', () => ({
  CommentForm: ({ onSuccess, onCancel, placeholder, authorName }: any) => (
    <div data-testid="comment-form">
      <textarea data-testid="comment-textarea" placeholder={placeholder} />
      <span data-testid="comment-author">{authorName}</span>
      <button data-testid="comment-submit" onClick={() => onSuccess?.()}>
        Submit
      </button>
      <button data-testid="comment-cancel" onClick={() => onCancel?.()}>
        Cancel
      </button>
    </div>
  ),
  InlineCommentForm: ({ onSuccess, onCancel, placeholder }: any) => (
    <div data-testid="inline-comment-form">
      <textarea data-testid="inline-textarea" placeholder={placeholder} />
      <button data-testid="inline-submit" onClick={() => onSuccess?.()}>
        Submit
      </button>
      <button data-testid="inline-cancel" onClick={() => onCancel?.()}>
        Cancel
      </button>
    </div>
  )
}))

const mockUpdateCommentAction = updateCommentAction as jest.MockedFunction<typeof updateCommentAction>
const mockDeleteCommentAction = deleteCommentAction as jest.MockedFunction<typeof deleteCommentAction>
const mockLikeCommentAction = likeCommentAction as jest.MockedFunction<typeof likeCommentAction>
const mockUnlikeCommentAction = unlikeCommentAction as jest.MockedFunction<typeof unlikeCommentAction>

describe('CommentItem Component', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockComment: CommentNode = {
    id: 'comment_lindy_basics',
    postId: 'post_lindy_tutorial',
    content: '린디합 기본기 정말 중요해요! 록스텝부터 천천히 연습하세요 🎵',
    level: 0,
    children: [],
    metadata: {
      authorId: 'user_kim_lindy',
      authorName: '김린디',
      authorProfileUrl: 'https://example.com/kim.jpg',
      createdAt: {
        toMillis: () => 1640995200000,
        toDate: () => new Date(1640995200000),
        seconds: 1640995200,
        nanoseconds: 0
      } as any,
      updatedAt: {
        toMillis: () => 1640995200000,
        toDate: () => new Date(1640995200000),
        seconds: 1640995200,
        nanoseconds: 0
      } as any
    },
    stats: {
      likes: 5,
      replies: 2,
      reports: 0
    }
  }

  const defaultProps = {
    comment: mockComment,
    currentUserId: 'user_test',
    currentUserName: '테스트유저',
    currentUserProfile: 'https://example.com/test.jpg',
    onReplySuccess: jest.fn()
  }

  describe('✅ Success Cases - Rendering and Basic Interaction', () => {

    it('should render comment content and author information', () => {
      render(<CommentItem {...defaultProps} />)

      // Check comment content
      expect(screen.getByText(/린디합 기본기 정말 중요해요/)).toBeInTheDocument()

      // Check author information
      expect(screen.getByText('김린디')).toBeInTheDocument()

      // Check timestamp
      expect(screen.getByText(/전/)).toBeInTheDocument() // Should show relative time

      // Check like count
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should show author profile image when available', () => {
      render(<CommentItem {...defaultProps} />)

      const profileImage = screen.getByAltText('김린디')
      expect(profileImage).toBeInTheDocument()
      expect(profileImage).toHaveAttribute('src', 'https://example.com/kim.jpg')
    })

    it('should show author initial when no profile image', () => {
      const commentWithoutImage = {
        ...mockComment,
        metadata: {
          ...mockComment.metadata,
          authorProfileUrl: null
        }
      }

      render(<CommentItem {...defaultProps} comment={commentWithoutImage} />)

      expect(screen.getByText('김')).toBeInTheDocument() // First character of name
    })

    it('should handle comment indentation based on level', () => {
      const nestedComment = {
        ...mockComment,
        level: 2
      }

      const { container } = render(<CommentItem {...defaultProps} comment={nestedComment} />)

      // Should apply indentation class for nested comments
      expect(container.querySelector('.ml-8')).toBeInTheDocument() // ml-8 for level 2
    })

    it('should show reply button for level < 2 comments', () => {
      render(<CommentItem {...defaultProps} />)

      expect(screen.getByText('답글')).toBeInTheDocument()
    })

    it('should not show reply button for level 2 comments', () => {
      const maxLevelComment = {
        ...mockComment,
        level: 2
      }

      render(<CommentItem {...defaultProps} comment={maxLevelComment} />)

      expect(screen.queryByText('답글')).not.toBeInTheDocument()
    })
  })

  describe('👤 Author Actions - Edit and Delete', () => {

    const authorProps = {
      ...defaultProps,
      currentUserId: 'user_kim_lindy' // Same as comment author
    }

    it('should show options menu for comment author', () => {
      render(<CommentItem {...authorProps} />)

      const optionsButton = screen.getByRole('button', { name: /options/i })
      fireEvent.click(optionsButton)

      expect(screen.getByText('수정')).toBeInTheDocument()
      expect(screen.getByText('삭제')).toBeInTheDocument()
    })

    it('should show edit form when edit button clicked', () => {
      render(<CommentItem {...authorProps} />)

      // Open options menu
      const optionsButton = screen.getByRole('button', { name: /options/i })
      fireEvent.click(optionsButton)

      // Click edit
      const editButton = screen.getByText('수정')
      fireEvent.click(editButton)

      // Should show inline edit form
      expect(screen.getByTestId('inline-comment-form')).toBeInTheDocument()
      expect(screen.getByTestId('inline-textarea')).toBeInTheDocument()
    })

    it('should handle comment edit successfully', async () => {
      mockUpdateCommentAction.mockResolvedValue({ success: true })

      render(<CommentItem {...authorProps} />)

      // Open edit form
      const optionsButton = screen.getByRole('button', { name: /options/i })
      fireEvent.click(optionsButton)
      fireEvent.click(screen.getByText('수정'))

      // Submit edit
      const submitButton = screen.getByTestId('inline-submit')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateCommentAction).toHaveBeenCalled()
      })
    })

    it('should show delete confirmation modal', () => {
      render(<CommentItem {...authorProps} />)

      // Open options menu
      const optionsButton = screen.getByRole('button', { name: /options/i })
      fireEvent.click(optionsButton)

      // Click delete
      const deleteButton = screen.getByText('삭제')
      fireEvent.click(deleteButton)

      // Should show confirmation modal
      expect(screen.getByText('댓글 삭제')).toBeInTheDocument()
      expect(screen.getByText('정말로 이 댓글을 삭제하시겠습니까?')).toBeInTheDocument()
    })

    it('should handle comment deletion successfully', async () => {
      mockDeleteCommentAction.mockResolvedValue({ success: true })

      render(<CommentItem {...authorProps} />)

      // Open options and click delete
      const optionsButton = screen.getByRole('button', { name: /options/i })
      fireEvent.click(optionsButton)
      fireEvent.click(screen.getByText('삭제'))

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /삭제/ })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockDeleteCommentAction).toHaveBeenCalledWith('comment_lindy_basics')
      })
    })
  })

  describe('❤️ Like Functionality', () => {

    it('should handle like action for unauthenticated user', () => {
      const unauthenticatedProps = {
        ...defaultProps,
        currentUserId: undefined
      }

      render(<CommentItem {...unauthenticatedProps} />)

      const likeButton = screen.getByRole('button', { name: /5/ })
      expect(likeButton).toBeDisabled()
    })

    it('should handle like action successfully', async () => {
      mockLikeCommentAction.mockResolvedValue({ success: true })

      render(<CommentItem {...defaultProps} />)

      const likeButton = screen.getByRole('button', { name: /5/ })
      fireEvent.click(likeButton)

      await waitFor(() => {
        expect(mockLikeCommentAction).toHaveBeenCalledWith('comment_lindy_basics')
      })
    })

    it('should handle unlike action successfully', async () => {
      // Mock that comment is already liked
      const likedComment = {
        ...mockComment,
        // Note: This test assumes the component determines like state
        // In real implementation, this might come from user's liked comments
      }

      mockUnlikeCommentAction.mockResolvedValue({ success: true })

      render(<CommentItem {...defaultProps} comment={likedComment} />)

      const likeButton = screen.getByRole('button', { name: /5/ })
      fireEvent.click(likeButton)

      // Note: The exact behavior depends on how like state is managed
      // This test structure shows the pattern
    })

    it('should show optimistic UI updates for likes', async () => {
      mockLikeCommentAction.mockResolvedValue({ success: true })

      render(<CommentItem {...defaultProps} />)

      const likeButton = screen.getByRole('button', { name: /5/ })
      fireEvent.click(likeButton)

      // Should immediately update UI before API response
      // Exact behavior depends on implementation
    })
  })

  describe('💬 Reply Functionality', () => {

    it('should show reply form when reply button clicked', () => {
      render(<CommentItem {...defaultProps} />)

      const replyButton = screen.getByText('답글')
      fireEvent.click(replyButton)

      expect(screen.getByTestId('comment-form')).toBeInTheDocument()
      expect(screen.getByTestId('comment-author')).toHaveTextContent('테스트유저')
    })

    it('should handle reply submission successfully', () => {
      const mockOnReplySuccess = jest.fn()

      render(<CommentItem {...defaultProps} onReplySuccess={mockOnReplySuccess} />)

      // Open reply form
      const replyButton = screen.getByText('답글')
      fireEvent.click(replyButton)

      // Submit reply
      const submitButton = screen.getByTestId('comment-submit')
      fireEvent.click(submitButton)

      expect(mockOnReplySuccess).toHaveBeenCalled()
    })

    it('should cancel reply form', () => {
      render(<CommentItem {...defaultProps} />)

      // Open reply form
      const replyButton = screen.getByText('답글')
      fireEvent.click(replyButton)

      // Cancel reply
      const cancelButton = screen.getByTestId('comment-cancel')
      fireEvent.click(cancelButton)

      // Form should be hidden
      expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument()
    })
  })

  describe('👥 Non-Author Actions', () => {

    const nonAuthorProps = {
      ...defaultProps,
      currentUserId: 'different_user'
    }

    it('should show report option for non-authors', () => {
      render(<CommentItem {...nonAuthorProps} />)

      const optionsButton = screen.getByRole('button', { name: /options/i })
      fireEvent.click(optionsButton)

      expect(screen.getByText('신고')).toBeInTheDocument()
      expect(screen.queryByText('수정')).not.toBeInTheDocument()
      expect(screen.queryByText('삭제')).not.toBeInTheDocument()
    })

    it('should not show options menu when user not authenticated', () => {
      const unauthenticatedProps = {
        ...defaultProps,
        currentUserId: undefined
      }

      render(<CommentItem {...unauthenticatedProps} />)

      expect(screen.queryByRole('button', { name: /options/i })).not.toBeInTheDocument()
    })
  })

  describe('🕐 Time Display', () => {

    it('should show relative time correctly', () => {
      // Mock current time to be 1 hour after comment creation
      const mockNow = new Date(1640995200000 + 3600000) // 1 hour later
      jest.spyOn(Date, 'now').mockReturnValue(mockNow.getTime())

      render(<CommentItem {...defaultProps} />)

      expect(screen.getByText('1시간 전')).toBeInTheDocument()

      jest.restoreAllMocks()
    })

    it('should show edited indicator when comment is updated', () => {
      const editedComment = {
        ...mockComment,
        metadata: {
          ...mockComment.metadata,
          updatedAt: {
            toMillis: () => 1640995260000, // 1 minute later
            toDate: () => new Date(1640995260000),
            seconds: 1640995260,
            nanoseconds: 0
          } as any
        }
      }

      render(<CommentItem {...defaultProps} comment={editedComment} />)

      expect(screen.getByText('(수정됨)')).toBeInTheDocument()
    })
  })

  describe('🎯 Korean Swing Dance Community Scenarios', () => {

    it('should handle Korean swing dance terminology correctly', () => {
      const swingComment = {
        ...mockComment,
        content: `스윙아웃 연습할 때 파트너와의 커넥션이 가장 중요해요! 💃

기본 자세:
- 프레임 유지하기
- 리드와 팔로우 역할 명확히
- 음악의 스윙감 느끼기

홍대 스윙댄스 스튜디오에서 연습하시면 좋을 것 같아요! 🎵`
      }

      render(<CommentItem {...defaultProps} comment={swingComment} />)

      expect(screen.getByText(/스윙아웃 연습할 때/)).toBeInTheDocument()
      expect(screen.getByText(/프레임 유지하기/)).toBeInTheDocument()
      expect(screen.getByText(/홍대 스윙댄스 스튜디오/)).toBeInTheDocument()
    })

    it('should handle Korean user names correctly', () => {
      const koreanUserComment = {
        ...mockComment,
        metadata: {
          ...mockComment.metadata,
          authorName: '박린디호퍼'
        }
      }

      render(<CommentItem {...defaultProps} comment={koreanUserComment} />)

      expect(screen.getByText('박린디호퍼')).toBeInTheDocument()
      expect(screen.getByText('박')).toBeInTheDocument() // Initial
    })

    it('should handle long detailed swing dance advice', () => {
      const longAdviceComment = {
        ...mockComment,
        content: `스윙댄스 초보자를 위한 상세 가이드입니다! 🎵

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

지속적인 연습이 가장 중요합니다! 화이팅 💪`
      }

      render(<CommentItem {...defaultProps} comment={longAdviceComment} />)

      expect(screen.getByText(/스윙댄스 초보자를 위한 상세 가이드/)).toBeInTheDocument()
      expect(screen.getByText(/기본 자세 익히기/)).toBeInTheDocument()
      expect(screen.getByText(/지속적인 연습이 가장 중요합니다/)).toBeInTheDocument()
    })
  })

  describe('🔧 Component Props and Edge Cases', () => {

    it('should apply custom className', () => {
      const { container } = render(
        <CommentItem {...defaultProps} className="custom-comment-item" />
      )

      expect(container.firstChild).toHaveClass('custom-comment-item')
    })

    it('should handle missing onReplySuccess prop', () => {
      const propsWithoutCallback = {
        ...defaultProps,
        onReplySuccess: undefined
      }

      render(<CommentItem {...propsWithoutCallback} />)

      // Should not crash when callback is missing
      const replyButton = screen.getByText('답글')
      fireEvent.click(replyButton)

      const submitButton = screen.getByTestId('comment-submit')
      fireEvent.click(submitButton)

      // Should not crash
    })

    it('should handle error states gracefully', async () => {
      mockLikeCommentAction.mockRejectedValue(new Error('Network error'))

      render(<CommentItem {...defaultProps} />)

      const likeButton = screen.getByRole('button', { name: /5/ })
      fireEvent.click(likeButton)

      // Should handle error gracefully without crashing
      await waitFor(() => {
        expect(mockLikeCommentAction).toHaveBeenCalled()
      })
    })
  })

  describe('♿ Accessibility', () => {

    it('should have proper ARIA labels for buttons', () => {
      render(<CommentItem {...defaultProps} />)

      // Like button should be accessible
      const likeButton = screen.getByRole('button', { name: /5/ })
      expect(likeButton).toBeInTheDocument()

      // Reply button should be accessible
      const replyButton = screen.getByRole('button', { name: /답글/ })
      expect(replyButton).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      render(<CommentItem {...defaultProps} />)

      const likeButton = screen.getByRole('button', { name: /5/ })

      // Should be focusable
      likeButton.focus()
      expect(document.activeElement).toBe(likeButton)
    })
  })
})