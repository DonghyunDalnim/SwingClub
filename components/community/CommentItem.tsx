'use client'

import { useState, useTransition } from 'react'
import { Timestamp } from 'firebase/firestore'
import { Heart, MoreHorizontal, Edit, Trash2, Flag, X, Check } from 'lucide-react'
import {
  updateCommentAction,
  deleteCommentAction,
  likeCommentAction,
  unlikeCommentAction
} from '@/lib/actions/comments'
import type { CommentNode } from '@/hooks/useComments'

interface CommentItemProps {
  comment: CommentNode
  currentUserId?: string
  currentUserName?: string
  currentUserProfile?: string
  onReplySuccess?: () => void
  className?: string
}

export function CommentItem({
  comment,
  currentUserId,
  currentUserName,
  currentUserProfile,
  onReplySuccess,
  className = ''
}: CommentItemProps) {
  const [showEditForm, setShowEditForm] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [showOptions, setShowOptions] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(comment.likes || 0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // 작성자인지 확인
  const isAuthor = currentUserId === comment.authorId

  // 시간 포맷팅
  const formatDateTime = (timestamp: Timestamp) => {
    const now = new Date()
    const commentDate = timestamp.toDate()
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return '방금 전'
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}일 전`

    return new Intl.DateTimeFormat('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(commentDate)
  }

  // 댓글 수정 제출
  const handleEditSubmit = async () => {
    if (!editContent.trim()) {
      setError('댓글 내용을 입력해주세요.')
      return
    }

    startTransition(async () => {
      try {
        setError(null)
        const result = await updateCommentAction(comment.id, { content: editContent.trim() })

        if (result.success) {
          setShowEditForm(false)
          onReplySuccess?.()
        } else {
          setError(result.error || '댓글 수정에 실패했습니다.')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '댓글 수정 중 오류가 발생했습니다.')
      }
    })
  }

  // 댓글 수정 취소
  const handleEditCancel = () => {
    setEditContent(comment.content)
    setShowEditForm(false)
    setError(null)
  }

  // 댓글 삭제
  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    startTransition(async () => {
      try {
        setError(null)
        const result = await deleteCommentAction(comment.id)

        if (result.success) {
          onReplySuccess?.()
        } else {
          setError(result.error || '댓글 삭제에 실패했습니다.')
          setShowDeleteConfirm(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '댓글 삭제 중 오류가 발생했습니다.')
        setShowDeleteConfirm(false)
      }
    })
  }

  // 좋아요
  const handleLike = () => {
    if (!currentUserId) return

    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1)

    startTransition(async () => {
      try {
        const result = newLiked
          ? await likeCommentAction(comment.id)
          : await unlikeCommentAction(comment.id)

        if (!result.success) {
          // 실패 시 되돌리기
          setLiked(!newLiked)
          setLikeCount(prev => newLiked ? prev - 1 : prev + 1)
        }
      } catch (err) {
        // 실패 시 되돌리기
        setLiked(!newLiked)
        setLikeCount(prev => newLiked ? prev - 1 : prev + 1)
      }
    })
  }

  return (
    <div className={`comment-item-container ${className}`}>
      <div className="comment-item">
        {/* 댓글 헤더 */}
        <div className="comment-header">
          <div className="author-section">
            {/* 프로필 아바타 */}
            <div className="avatar">
              {comment.authorProfileUrl ? (
                <img
                  src={comment.authorProfileUrl}
                  alt={comment.authorName}
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  {comment.authorName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* 작성자 정보 */}
            <div className="author-info">
              <div className="author-meta">
                <span className="author-name">{comment.authorName}</span>
                <span className="comment-time">{formatDateTime(comment.createdAt)}</span>
                {comment.updatedAt && comment.createdAt &&
                 Math.abs(comment.updatedAt.toMillis() - comment.createdAt.toMillis()) > 1000 && (
                  <span className="edited-badge">(수정됨)</span>
                )}
              </div>
            </div>
          </div>

          {/* 옵션 메뉴 */}
          {currentUserId && (
            <div className="options-menu">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="options-button"
              >
                <MoreHorizontal className="options-icon" />
              </button>

              {showOptions && (
                <div className="options-dropdown">
                  {isAuthor ? (
                    <>
                      <button
                        onClick={() => {
                          setShowEditForm(true)
                          setShowOptions(false)
                        }}
                        className="option-item edit-option"
                      >
                        <Edit className="option-icon" />
                        <span>수정</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowOptions(false)
                          handleDelete()
                        }}
                        disabled={isPending}
                        className="option-item delete-option"
                      >
                        <Trash2 className="option-icon" />
                        <span>삭제</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowOptions(false)}
                      className="option-item report-option"
                    >
                      <Flag className="option-icon" />
                      <span>신고</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 댓글 내용 */}
        {showEditForm ? (
          <div className="edit-form-wrapper">
            <textarea
              className="edit-textarea"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="댓글을 수정해주세요..."
              disabled={isPending}
              maxLength={1000}
            />
            <div className="edit-actions">
              <button
                className="edit-cancel-btn"
                onClick={handleEditCancel}
                disabled={isPending}
              >
                <X className="btn-icon" />
                취소
              </button>
              <button
                className="edit-submit-btn"
                onClick={handleEditSubmit}
                disabled={isPending || !editContent.trim()}
              >
                <Check className="btn-icon" />
                {isPending ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        ) : (
          <div className="comment-content">
            <p className="content-text">{comment.content}</p>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* 댓글 액션 */}
        <div className="comment-actions">
          <button
            onClick={handleLike}
            disabled={!currentUserId}
            className={`action-button like-button ${liked ? 'liked' : ''}`}
          >
            <Heart className={`action-icon ${liked ? 'filled' : ''}`} />
            <span className="action-count">{likeCount}</span>
          </button>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">댓글 삭제</h3>
            <p className="modal-message">
              정말로 이 댓글을 삭제하시겠습니까?<br />
              삭제된 댓글은 복구할 수 없습니다.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isPending}
                className="modal-btn cancel-btn"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="modal-btn confirm-btn"
              >
                {isPending ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 외부 클릭으로 옵션 닫기 */}
      {showOptions && (
        <div className="options-backdrop" onClick={() => setShowOptions(false)} />
      )}

      <style jsx>{`
        .comment-item-container {
          background: transparent;
        }

        .comment-item {
          padding: var(--space-lg);
          border-bottom: 1px solid rgba(200, 200, 200, 0.1);
          transition: background-color 0.2s;
        }

        .comment-item:hover {
          background: rgba(249, 250, 251, 0.5);
        }

        /* 헤더 */
        .comment-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-sm);
          gap: var(--space-sm);
        }

        .author-section {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          flex: 1;
          min-width: 0;
        }

        /* 아바타 */
        .avatar {
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

        /* 작성자 정보 */
        .author-info {
          flex: 1;
          min-width: 0;
        }

        .author-meta {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          flex-wrap: wrap;
        }

        .author-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--gray-900);
        }

        .comment-time {
          font-size: 12px;
          color: var(--gray-500);
        }

        .edited-badge {
          font-size: 11px;
          color: var(--gray-400);
        }

        /* 옵션 메뉴 */
        .options-menu {
          position: relative;
          flex-shrink: 0;
        }

        .options-button {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--gray-400);
          cursor: pointer;
          transition: all 0.2s;
        }

        .options-button:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .options-icon {
          width: 18px;
          height: 18px;
        }

        .options-dropdown {
          position: absolute;
          right: 0;
          top: 40px;
          background: white;
          border: 1px solid rgba(200, 200, 200, 0.2);
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          padding: 6px;
          min-width: 140px;
          z-index: 10;
        }

        .option-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 10px 12px;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .option-icon {
          width: 16px;
          height: 16px;
        }

        .edit-option {
          color: var(--gray-700);
        }

        .edit-option:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .delete-option {
          color: #ef4444;
        }

        .delete-option:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .delete-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .report-option {
          color: #f97316;
        }

        .report-option:hover {
          background: rgba(249, 115, 22, 0.1);
        }

        /* 댓글 내용 */
        .comment-content {
          margin-bottom: var(--space-sm);
        }

        .content-text {
          font-size: 14px;
          line-height: 1.6;
          color: var(--gray-800);
          white-space: pre-wrap;
          word-break: break-word;
        }

        .edit-form-wrapper {
          margin-bottom: var(--space-sm);
        }

        .edit-textarea {
          width: 100%;
          min-height: 100px;
          padding: 12px 16px;
          border: 2px solid rgba(102, 126, 234, 0.3);
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.6;
          color: var(--gray-800);
          background: white;
          resize: vertical;
          transition: all 0.2s;
          font-family: inherit;
        }

        .edit-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .edit-textarea:disabled {
          background: var(--gray-50);
          cursor: not-allowed;
        }

        .edit-actions {
          display: flex;
          gap: var(--space-sm);
          margin-top: var(--space-sm);
          justify-content: flex-end;
        }

        .edit-cancel-btn,
        .edit-submit-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .edit-cancel-btn {
          background: var(--gray-100);
          color: var(--gray-700);
        }

        .edit-cancel-btn:hover:not(:disabled) {
          background: var(--gray-200);
        }

        .edit-submit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .edit-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .edit-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-icon {
          width: 14px;
          height: 14px;
        }

        /* 에러 메시지 */
        .error-message {
          padding: 10px 14px;
          margin-bottom: var(--space-sm);
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          color: #dc2626;
          font-size: 13px;
          font-weight: 500;
        }

        /* 댓글 액션 */
        .comment-actions {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--gray-500);
        }

        .action-button:hover:not(:disabled) {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-icon {
          width: 16px;
          height: 16px;
        }

        .like-button.liked {
          color: #667eea;
        }

        .action-icon.filled {
          fill: currentColor;
        }

        .action-count {
          font-size: 13px;
        }

        /* 모달 */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: var(--space-lg);
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          padding: var(--space-xl);
          max-width: 400px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-md);
        }

        .modal-message {
          font-size: 14px;
          line-height: 1.6;
          color: var(--gray-600);
          margin-bottom: var(--space-xl);
        }

        .modal-actions {
          display: flex;
          gap: var(--space-sm);
        }

        .modal-btn {
          flex: 1;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .cancel-btn {
          background: var(--gray-100);
          color: var(--gray-700);
        }

        .cancel-btn:hover:not(:disabled) {
          background: var(--gray-200);
        }

        .confirm-btn {
          background: #ef4444;
          color: white;
        }

        .confirm-btn:hover:not(:disabled) {
          background: #dc2626;
        }

        .modal-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* 백드롭 */
        .options-backdrop {
          position: fixed;
          inset: 0;
          z-index: 5;
        }

        /* 반응형 */
        @media (max-width: 768px) {
          .comment-item {
            padding: var(--space-md);
          }

          .author-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  )
}
