'use client'

import { useState, useTransition } from 'react'
import { Send, X } from 'lucide-react'
import { createCommentAction } from '@/lib/actions/comments'
import type { CreateCommentData } from '@/lib/types/community'

interface CommentFormProps {
  postId: string
  parentId?: string
  authorName: string
  authorProfileUrl?: string
  placeholder?: string
  onSuccess?: () => void
  onCancel?: () => void
  autoFocus?: boolean
  className?: string
}

export function CommentForm({
  postId,
  parentId,
  authorName,
  authorProfileUrl,
  placeholder = '댓글을 작성해주세요...',
  onSuccess,
  onCancel,
  autoFocus = false,
  className = ''
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isReply = !!parentId
  const maxLength = 1000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      setError('댓글 내용을 입력해주세요.')
      return
    }

    if (content.length > maxLength) {
      setError(`댓글은 ${maxLength}자를 초과할 수 없습니다.`)
      return
    }

    startTransition(async () => {
      try {
        setError(null)

        const commentData: CreateCommentData = {
          postId,
          content: content.trim(),
          parentId
        }

        const result = await createCommentAction(commentData)

        if (result.success) {
          setContent('')
          onSuccess?.()
        } else {
          setError(result.error || '댓글 작성에 실패했습니다.')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '댓글 작성 중 오류가 발생했습니다.')
      }
    })
  }

  const handleCancel = () => {
    setContent('')
    setError(null)
    onCancel?.()
  }

  const remainingChars = maxLength - content.length

  return (
    <div className={`comment-form-container ${className}`}>
      <form onSubmit={handleSubmit} className="comment-form">
        {/* 작성자 정보 */}
        <div className="author-section">
          <div className="author-avatar">
            {authorProfileUrl ? (
              <img
                src={authorProfileUrl}
                alt={authorName}
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="author-info">
            <span className="author-name">{authorName}</span>
            {isReply && <span className="reply-badge">답글 작성 중</span>}
          </div>
        </div>

        {/* 텍스트 입력 */}
        <div className="textarea-wrapper">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            rows={isReply ? 3 : 4}
            maxLength={maxLength}
            disabled={isPending}
            className={`textarea ${isPending ? 'disabled' : ''} ${error ? 'error' : ''}`}
          />

          {/* 글자 수 카운터 */}
          <div className="char-counter">
            <span className={remainingChars < 50 ? 'warning' : ''}>
              {content.length}
            </span>
            <span className="separator">/</span>
            <span>{maxLength}</span>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="button-section">
          <div className="hint-text">
            {isReply ? '답글로 작성됩니다' : 'Shift + Enter로 줄바꿈'}
          </div>

          <div className="button-group">
            {onCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="btn-cancel"
              >
                <X className="btn-icon" />
                <span>취소</span>
              </button>
            )}

            <button
              type="submit"
              disabled={!content.trim() || isPending || remainingChars < 0}
              className="btn-submit"
            >
              {isPending ? (
                <>
                  <div className="spinner" />
                  <span>작성 중...</span>
                </>
              ) : (
                <>
                  <Send className="btn-icon" />
                  <span>{isReply ? '답글' : '댓글'} 작성</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <style jsx>{`
        .comment-form-container {
          background: white;
          border-radius: 16px;
          padding: var(--space-lg);
          border: 1px solid rgba(200, 200, 200, 0.2);
        }

        .comment-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        /* 작성자 섹션 */
        .author-section {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .author-avatar {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .author-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .author-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--gray-900);
        }

        .reply-badge {
          font-size: 12px;
          color: #667eea;
        }

        /* 텍스트 영역 */
        .textarea-wrapper {
          position: relative;
        }

        .textarea {
          width: 100%;
          padding: 14px;
          padding-bottom: 36px;
          border: 2px solid rgba(200, 200, 200, 0.2);
          border-radius: 12px;
          resize: none;
          font-size: 14px;
          line-height: 1.6;
          color: var(--gray-900);
          background: white;
          transition: all 0.2s;
          outline: none;
        }

        .textarea:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .textarea.disabled {
          background: rgba(249, 250, 251, 0.8);
          cursor: not-allowed;
          color: var(--gray-500);
        }

        .textarea.error {
          border-color: #ef4444;
        }

        .textarea::placeholder {
          color: var(--gray-400);
        }

        .char-counter {
          position: absolute;
          bottom: 10px;
          right: 14px;
          font-size: 12px;
          color: var(--gray-400);
          pointer-events: none;
        }

        .char-counter .warning {
          color: #f97316;
          font-weight: 600;
        }

        .char-counter .separator {
          margin: 0 2px;
        }

        /* 에러 메시지 */
        .error-message {
          padding: 10px 14px;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          color: #dc2626;
          font-size: 13px;
          font-weight: 500;
        }

        /* 버튼 섹션 */
        .button-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-md);
        }

        .hint-text {
          font-size: 12px;
          color: var(--gray-500);
        }

        .button-group {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .btn-cancel,
        .btn-submit {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          outline: none;
        }

        .btn-cancel {
          background: rgba(249, 250, 251, 0.8);
          color: var(--gray-700);
          border: 1px solid rgba(200, 200, 200, 0.2);
        }

        .btn-cancel:hover:not(:disabled) {
          background: rgba(243, 244, 246, 1);
          transform: translateY(-1px);
        }

        .btn-submit {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .btn-submit:hover:not(:disabled) {
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
          transform: translateY(-2px);
        }

        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .btn-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-icon {
          width: 16px;
          height: 16px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* 반응형 */
        @media (max-width: 768px) {
          .comment-form-container {
            padding: var(--space-md);
          }

          .button-section {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-sm);
          }

          .button-group {
            width: 100%;
            justify-content: flex-end;
          }

          .btn-cancel span,
          .btn-submit span {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  )
}

// 간단한 댓글 작성 폼 (인라인 사용)
export function InlineCommentForm({
  postId,
  parentId,
  onSuccess,
  onCancel,
  placeholder = '댓글을 작성해주세요...'
}: {
  postId: string
  parentId?: string
  onSuccess?: () => void
  onCancel?: () => void
  placeholder?: string
}) {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return

    startTransition(async () => {
      try {
        const commentData: CreateCommentData = {
          postId,
          content: content.trim(),
          parentId
        }

        const result = await createCommentAction(commentData)

        if (result.success) {
          setContent('')
          onSuccess?.()
        }
      } catch (err) {
        console.error('Failed to create comment:', err)
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
    if (e.key === 'Escape') {
      onCancel?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isPending}
        autoFocus
        className="inline-input"
      />

      <button
        type="submit"
        disabled={!content.trim() || isPending}
        className="inline-submit"
      >
        {isPending ? '...' : '전송'}
      </button>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="inline-cancel"
        >
          취소
        </button>
      )}

      <style jsx>{`
        .inline-form {
          display: flex;
          gap: var(--space-xs);
          align-items: center;
        }

        .inline-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid rgba(200, 200, 200, 0.3);
          border-radius: 10px;
          font-size: 13px;
          outline: none;
          transition: all 0.2s;
        }

        .inline-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .inline-submit,
        .inline-cancel {
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          outline: none;
        }

        .inline-submit {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .inline-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .inline-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .inline-cancel {
          background: transparent;
          color: var(--gray-600);
          border: 1px solid rgba(200, 200, 200, 0.3);
        }

        .inline-cancel:hover:not(:disabled) {
          background: rgba(249, 250, 251, 0.8);
        }
      `}</style>
    </form>
  )
}
