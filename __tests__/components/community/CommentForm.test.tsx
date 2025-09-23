/**
 * Comprehensive tests for CommentForm components
 * Testing Korean swing dance community comment form functionality
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CommentForm, InlineCommentForm } from '@/components/community/CommentForm'
import { createCommentAction } from '@/lib/actions/comments'

// Mock the comment action
jest.mock('@/lib/actions/comments')

const mockCreateCommentAction = createCommentAction as jest.MockedFunction<typeof createCommentAction>

describe('CommentForm Component', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const defaultProps = {
    postId: 'post_lindy_basics',
    authorName: '테스트유저',
    authorProfileUrl: 'https://example.com/test.jpg',
    onSuccess: jest.fn(),
    onCancel: jest.fn()
  }

  describe('✅ Success Cases - Rendering and Basic Interaction', () => {

    it('should render comment form with author information', () => {
      render(<CommentForm {...defaultProps} />)

      // Check author name
      expect(screen.getByText('테스트유저')).toBeInTheDocument()

      // Check textarea
      expect(screen.getByRole('textbox')).toBeInTheDocument()

      // Check submit button
      expect(screen.getByRole('button', { name: /등록/ })).toBeInTheDocument()

      // Check cancel button
      expect(screen.getByRole('button', { name: /취소/ })).toBeInTheDocument()
    })

    it('should show author profile image when available', () => {
      render(<CommentForm {...defaultProps} />)

      const profileImage = screen.getByAltText('테스트유저')
      expect(profileImage).toBeInTheDocument()
      expect(profileImage).toHaveAttribute('src', 'https://example.com/test.jpg')
    })

    it('should show author initial when no profile image', () => {
      const propsWithoutImage = {
        ...defaultProps,
        authorProfileUrl: undefined
      }

      render(<CommentForm {...propsWithoutImage} />)

      expect(screen.getByText('테')).toBeInTheDocument() // First character of name
    })

    it('should handle text input and character counting', () => {
      render(<CommentForm {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      const testContent = '테스트 댓글 내용입니다.'

      fireEvent.change(textarea, { target: { value: testContent } })

      expect(textarea).toHaveValue(testContent)
      expect(screen.getByText(`${testContent.length}/1000`)).toBeInTheDocument()
    })

    it('should focus textarea when autoFocus is true', () => {
      render(<CommentForm {...defaultProps} autoFocus={true} />)

      const textarea = screen.getByRole('textbox')
      expect(document.activeElement).toBe(textarea)
    })

    it('should use custom placeholder', () => {
      const customPlaceholder = '스윙댄스에 대한 댓글을 작성해주세요...'

      render(<CommentForm {...defaultProps} placeholder={customPlaceholder} />)

      expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument()
    })
  })

  describe('💬 Comment Submission', () => {

    it('should submit comment successfully', async () => {
      mockCreateCommentAction.mockResolvedValue({
        success: true,
        commentId: 'new_comment_123'
      })

      const mockOnSuccess = jest.fn()

      render(<CommentForm {...defaultProps} onSuccess={mockOnSuccess} />)

      // Type comment content
      const textarea = screen.getByRole('textbox')
      const commentContent = '린디합 기본기에 대한 질문이 있습니다!'

      fireEvent.change(textarea, { target: { value: commentContent } })

      // Submit comment
      const submitButton = screen.getByRole('button', { name: /등록/ })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateCommentAction).toHaveBeenCalledWith({
          postId: 'post_lindy_basics',
          content: commentContent,
          parentId: undefined
        })
      })

      expect(mockOnSuccess).toHaveBeenCalled()
    })

    it('should submit reply comment with parentId', async () => {
      mockCreateCommentAction.mockResolvedValue({
        success: true,
        commentId: 'reply_comment_456'
      })

      const replyProps = {
        ...defaultProps,
        parentId: 'parent_comment_123'
      }

      render(<CommentForm {...replyProps} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: '좋은 조언 감사합니다!' } })

      const submitButton = screen.getByRole('button', { name: /등록/ })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateCommentAction).toHaveBeenCalledWith({
          postId: 'post_lindy_basics',
          content: '좋은 조언 감사합니다!',
          parentId: 'parent_comment_123'
        })
      })
    })

    it('should handle submission error gracefully', async () => {
      mockCreateCommentAction.mockResolvedValue({
        success: false,
        error: '댓글 작성에 실패했습니다.'
      })

      render(<CommentForm {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: '테스트 댓글' } })

      const submitButton = screen.getByRole('button', { name: /등록/ })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('댓글 작성에 실패했습니다.')).toBeInTheDocument()
      })
    })

    it('should handle network error during submission', async () => {
      mockCreateCommentAction.mockRejectedValue(new Error('Network error'))

      render(<CommentForm {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: '테스트 댓글' } })

      const submitButton = screen.getByRole('button', { name: /등록/ })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/댓글 작성 중 오류가 발생했습니다/)).toBeInTheDocument()
      })
    })
  })

  describe('🚫 Validation and Error States', () => {

    it('should prevent submission with empty content', () => {
      render(<CommentForm {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /등록/ })
      expect(submitButton).toBeDisabled()
    })

    it('should prevent submission with only whitespace', () => {
      render(<CommentForm {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: '   \n\t   ' } })

      const submitButton = screen.getByRole('button', { name: /등록/ })
      expect(submitButton).toBeDisabled()
    })

    it('should prevent submission when content exceeds character limit', () => {
      render(<CommentForm {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      const longContent = 'a'.repeat(1001) // Exceeds 1000 character limit

      fireEvent.change(textarea, { target: { value: longContent } })

      const submitButton = screen.getByRole('button', { name: /등록/ })
      expect(submitButton).toBeDisabled()

      // Should show character count in red
      expect(screen.getByText('1001/1000')).toBeInTheDocument()
    })

    it('should disable form during submission', async () => {
      // Mock slow API response
      mockCreateCommentAction.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ success: true, commentId: 'test' }), 1000))
      )

      render(<CommentForm {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: '테스트 댓글' } })

      const submitButton = screen.getByRole('button', { name: /등록/ })
      fireEvent.click(submitButton)

      // Should show loading state
      expect(screen.getByRole('button', { name: /작성 중/ })).toBeInTheDocument()
      expect(textarea).toBeDisabled()
    })
  })

  describe('🎯 Korean Swing Dance Community Content', () => {

    it('should handle Korean swing dance terminology correctly', async () => {
      mockCreateCommentAction.mockResolvedValue({
        success: true,
        commentId: 'swing_comment_789'
      })

      render(<CommentForm {...defaultProps} />)

      const swingComment = `스윙아웃 연습 방법에 대해 질문드립니다! 🎵

현재 록스텝과 트리플스텝은 어느 정도 할 수 있는데,
스윙아웃에서 파트너와의 커넥션이 어려워요.

특히 8카운트 중에서 5-6-7-8 구간에서
리드가 잘 안 되는 것 같습니다.

홍대 스윙댄스 스튜디오에서 배우고 있는데,
개인 연습할 때 어떤 점을 주의해야 할까요?

고수분들의 조언 부탁드려요! 💃🕺`

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: swingComment } })

      const submitButton = screen.getByRole('button', { name: /등록/ })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateCommentAction).toHaveBeenCalledWith({
          postId: 'post_lindy_basics',
          content: swingComment,
          parentId: undefined
        })
      })
    })

    it('should handle Korean names and emojis correctly', () => {
      const koreanUserProps = {
        ...defaultProps,
        authorName: '김린디호퍼'
      }

      render(<CommentForm {...koreanUserProps} />)

      expect(screen.getByText('김린디호퍼')).toBeInTheDocument()

      const textarea = screen.getByRole('textbox')
      const koreanContent = '안녕하세요! 린디합 초보자입니다 😊'

      fireEvent.change(textarea, { target: { value: koreanContent } })

      expect(textarea).toHaveValue(koreanContent)
      expect(screen.getByText(`${koreanContent.length}/1000`)).toBeInTheDocument()
    })
  })

  describe('🔧 Component Behavior and Events', () => {

    it('should handle cancel action', () => {
      const mockOnCancel = jest.fn()

      render(<CommentForm {...defaultProps} onCancel={mockOnCancel} />)

      const cancelButton = screen.getByRole('button', { name: /취소/ })
      fireEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('should clear form after successful submission', async () => {
      mockCreateCommentAction.mockResolvedValue({
        success: true,
        commentId: 'cleared_comment'
      })

      render(<CommentForm {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: '테스트 댓글' } })

      const submitButton = screen.getByRole('button', { name: /등록/ })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(textarea).toHaveValue('')
      })
    })

    it('should apply custom className', () => {
      const { container } = render(
        <CommentForm {...defaultProps} className="custom-comment-form" />
      )

      expect(container.firstChild).toHaveClass('custom-comment-form')
    })
  })
})

describe('InlineCommentForm Component', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const inlineProps = {
    postId: 'post_test',
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
    placeholder: '인라인 댓글을 작성하세요...',
    submitText: '답글 달기'
  }

  describe('✅ Inline Form Functionality', () => {

    it('should render minimal inline form', () => {
      render(<InlineCommentForm {...inlineProps} />)

      expect(screen.getByPlaceholderText('인라인 댓글을 작성하세요...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /답글 달기/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /취소/ })).toBeInTheDocument()
    })

    it('should handle content submission', async () => {
      mockCreateCommentAction.mockResolvedValue({
        success: true,
        commentId: 'inline_comment'
      })

      const mockOnSuccess = jest.fn()

      render(<InlineCommentForm {...inlineProps} onSuccess={mockOnSuccess} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: '인라인 답글입니다' } })

      const submitButton = screen.getByRole('button', { name: /답글 달기/ })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateCommentAction).toHaveBeenCalledWith({
          postId: 'post_test',
          content: '인라인 답글입니다',
          parentId: undefined
        })
      })

      expect(mockOnSuccess).toHaveBeenCalled()
    })

    it('should show character count for inline form', () => {
      render(<InlineCommentForm {...inlineProps} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: '테스트' } })

      expect(screen.getByText('2/1000')).toBeInTheDocument()
    })

    it('should handle initial content for editing', () => {
      const editProps = {
        ...inlineProps,
        initialContent: '수정할 댓글 내용',
        submitText: '수정'
      }

      render(<InlineCommentForm {...editProps} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('수정할 댓글 내용')

      const submitButton = screen.getByRole('button', { name: /수정/ })
      expect(submitButton).toBeInTheDocument()
    })

    it('should handle cancellation', () => {
      const mockOnCancel = jest.fn()

      render(<InlineCommentForm {...inlineProps} onCancel={mockOnCancel} />)

      const cancelButton = screen.getByRole('button', { name: /취소/ })
      fireEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('🚫 Inline Form Validation', () => {

    it('should disable submit when content is empty', () => {
      render(<InlineCommentForm {...inlineProps} />)

      const submitButton = screen.getByRole('button', { name: /답글 달기/ })
      expect(submitButton).toBeDisabled()
    })

    it('should disable submit when content exceeds limit', () => {
      render(<InlineCommentForm {...inlineProps} />)

      const textarea = screen.getByRole('textbox')
      const longContent = 'a'.repeat(1001)

      fireEvent.change(textarea, { target: { value: longContent } })

      const submitButton = screen.getByRole('button', { name: /답글 달기/ })
      expect(submitButton).toBeDisabled()
    })

    it('should show error state in inline form', async () => {
      mockCreateCommentAction.mockResolvedValue({
        success: false,
        error: '인라인 댓글 작성 실패'
      })

      render(<InlineCommentForm {...inlineProps} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: '테스트 댓글' } })

      const submitButton = screen.getByRole('button', { name: /답글 달기/ })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('인라인 댓글 작성 실패')).toBeInTheDocument()
      })
    })
  })

  describe('♿ Accessibility', () => {

    it('should have proper ARIA labels', () => {
      const defaultProps = {
        postId: 'post_accessibility_test',
        authorName: '테스트유저',
        authorProfileUrl: 'https://example.com/test.jpg',
        onSuccess: jest.fn(),
        onCancel: jest.fn()
      }

      render(<CommentForm {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-label', '댓글 내용')

      const submitButton = screen.getByRole('button', { name: /등록/ })
      expect(submitButton).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      const defaultProps = {
        postId: 'post_accessibility_test',
        authorName: '테스트유저',
        authorProfileUrl: 'https://example.com/test.jpg',
        onSuccess: jest.fn(),
        onCancel: jest.fn()
      }

      render(<CommentForm {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      const submitButton = screen.getByRole('button', { name: /등록/ })
      const cancelButton = screen.getByRole('button', { name: /취소/ })

      // Should be able to tab through elements
      textarea.focus()
      expect(document.activeElement).toBe(textarea)

      // Submit and cancel buttons should be focusable
      submitButton.focus()
      expect(document.activeElement).toBe(submitButton)

      cancelButton.focus()
      expect(document.activeElement).toBe(cancelButton)
    })

    it('should announce errors to screen readers', async () => {
      mockCreateCommentAction.mockResolvedValue({
        success: false,
        error: '댓글 작성 실패'
      })

      const defaultProps = {
        postId: 'post_accessibility_test',
        authorName: '테스트유저',
        authorProfileUrl: 'https://example.com/test.jpg',
        onSuccess: jest.fn(),
        onCancel: jest.fn()
      }

      render(<CommentForm {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: '테스트' } })

      const submitButton = screen.getByRole('button', { name: /등록/ })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const errorMessage = screen.getByText('댓글 작성 실패')
        expect(errorMessage).toHaveAttribute('role', 'alert')
      })
    })
  })
})