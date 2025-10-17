'use client'

import Link from 'next/link'
import { Badge, Button } from '@/components/core'
import { Heart, MessageCircle, Eye, Pin, Edit, Trash2 } from 'lucide-react'
import { deletePostAction } from '@/lib/actions/posts'
import { POST_CATEGORIES } from '@/lib/types/community'
import type { Post } from '@/lib/types/community'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toDate } from '@/lib/utils/date'

interface PostCardProps {
  post: Post
  currentUserId?: string
  showActions?: boolean
  isPinned?: boolean
}

export function PostCard({ post, currentUserId, showActions = false, isPinned = false }: PostCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // 카테고리 이모지 매핑
  const categoryEmojis = {
    general: '💬',
    qna: '❓',
    event: '🎭',
    marketplace: '🛍',
    lesson: '📚',
    review: '⭐'
  }

  // 시간 포맷팅
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  }

  // 게시글 삭제
  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    startTransition(async () => {
      try {
        const result = await deletePostAction(post.id)
        if (result.success) {
          router.refresh()
        } else {
          alert(result.error || '삭제에 실패했습니다.')
        }
      } catch (error) {
        console.error('삭제 실패:', error)
        alert('삭제 중 오류가 발생했습니다.')
      }
    })
  }

  // 작성자인지 확인
  const isAuthor = currentUserId === post.metadata.authorId

  return (
    <article className="post-card">
      <Link href={`/community/${post.id}`} className="post-card-link">
        <div className="post-card-content">
          {/* 상단: 카테고리 + 고정 표시 */}
          <div className="post-header">
            <div className="category-badge">
              <span className="category-emoji" aria-hidden="true">
                {categoryEmojis[post.category]}
              </span>
              <span className="category-text">{POST_CATEGORIES[post.category]}</span>
            </div>
            {isPinned && (
              <div className="pinned-badge">
                <Pin className="pin-icon" aria-hidden="true" />
                <span>고정</span>
              </div>
            )}
          </div>

          {/* 제목 */}
          <h3 className="post-title">{post.title}</h3>

          {/* 내용 미리보기 */}
          {post.content && (
            <p className="post-preview">
              {post.content.slice(0, 120)}{post.content.length > 120 ? '...' : ''}
            </p>
          )}

          {/* 하단: 작성자 + 통계 */}
          <div className="post-footer">
            <div className="author-info">
              <div className="author-avatar">
                {post.metadata.authorName.charAt(0).toUpperCase()}
              </div>
              <div className="author-details">
                <span className="author-name">{post.metadata.authorName}</span>
                <time className="post-time" dateTime={toDate(post.metadata.createdAt).toISOString()}>
                  {formatTime(toDate(post.metadata.createdAt))}
                </time>
              </div>
            </div>

            <div className="post-stats">
              <span className="stat-item">
                <Eye className="stat-icon" aria-hidden="true" />
                <span className="stat-value">{post.stats.views}</span>
              </span>
              <span className="stat-item stat-interactive">
                <Heart className="stat-icon" aria-hidden="true" />
                <span className="stat-value">{post.stats.likes}</span>
              </span>
              <span className="stat-item stat-interactive">
                <MessageCircle className="stat-icon" aria-hidden="true" />
                <span className="stat-value">{post.stats.comments}</span>
              </span>
            </div>
          </div>

          {/* 태그 및 첨부파일 */}
          {(post.attachments?.length || post.tags?.length) && (
            <div className="post-meta">
              {post.attachments && post.attachments.length > 0 && (
                <span className="meta-badge">
                  📎 {post.attachments.length}
                </span>
              )}
              {post.tags && post.tags.length > 0 && (
                <span className="meta-badge tag-badge">
                  #{post.tags[0]}{post.tags.length > 1 ? ` +${post.tags.length - 1}` : ''}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* 작성자 액션 버튼 */}
      {showActions && isAuthor && (
        <div className="post-actions">
          <Link href={`/community/${post.id}/edit`}>
            <button className="action-button edit-button" aria-label="게시글 수정">
              <Edit className="action-icon" aria-hidden="true" />
            </button>
          </Link>
          <button
            className={`action-button delete-button ${showDeleteConfirm ? 'delete-confirm' : ''}`}
            onClick={handleDelete}
            disabled={isPending}
            aria-label="게시글 삭제"
          >
            <Trash2 className="action-icon" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* 삭제 확인 메시지 */}
      {showDeleteConfirm && (
        <div className="delete-confirm-dialog">
          <p className="confirm-message">정말 삭제하시겠습니까?</p>
          <div className="confirm-actions">
            <button
              className="confirm-button cancel-button"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isPending}
            >
              취소
            </button>
            <button
              className="confirm-button delete-button-final"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .post-card {
          position: relative;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(200, 200, 200, 0.15);
        }

        .post-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.15);
          border-color: rgba(102, 126, 234, 0.2);
        }

        .post-card-link {
          display: block;
          text-decoration: none;
          color: inherit;
        }

        .post-card-content {
          padding: var(--space-xl);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        /* 상단: 카테고리 + 고정 */
        .post-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-sm);
        }

        .category-badge {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 6px 12px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-radius: 10px;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .category-emoji {
          font-size: 14px;
          line-height: 1;
        }

        .category-text {
          font-size: 12px;
          font-weight: 600;
          color: #667eea;
        }

        .pinned-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          color: white;
          font-size: 11px;
          font-weight: 600;
        }

        .pin-icon {
          width: 12px;
          height: 12px;
        }

        /* 제목 */
        .post-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--gray-900);
          line-height: 1.4;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.2s;
        }

        .post-card:hover .post-title {
          color: #667eea;
        }

        /* 내용 미리보기 */
        .post-preview {
          font-size: 14px;
          line-height: 1.6;
          color: var(--gray-600);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* 하단: 작성자 + 통계 */
        .post-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-md);
          padding-top: var(--space-sm);
          border-top: 1px solid rgba(200, 200, 200, 0.15);
        }

        .author-info {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          min-width: 0;
          flex: 1;
        }

        .author-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 13px;
          font-weight: 600;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .author-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .author-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--gray-900);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .post-time {
          font-size: 11px;
          color: var(--gray-500);
        }

        .post-stats {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          flex-shrink: 0;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: var(--gray-600);
          transition: all 0.2s;
        }

        .stat-interactive {
          cursor: pointer;
        }

        .stat-interactive:hover {
          color: #667eea;
          transform: scale(1.1);
        }

        .stat-icon {
          width: 16px;
          height: 16px;
          color: var(--gray-400);
          transition: color 0.2s;
        }

        .stat-interactive:hover .stat-icon {
          color: #667eea;
        }

        .stat-value {
          font-weight: 600;
          min-width: 20px;
          text-align: center;
        }

        /* 메타 정보 (태그, 첨부파일) */
        .post-meta {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          flex-wrap: wrap;
        }

        .meta-badge {
          padding: 4px 10px;
          background: rgba(200, 200, 200, 0.15);
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          color: var(--gray-600);
        }

        .tag-badge {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        /* 작성자 액션 */
        .post-actions {
          position: absolute;
          top: var(--space-md);
          right: var(--space-md);
          display: flex;
          gap: var(--space-xs);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .post-card:hover .post-actions {
          opacity: 1;
        }

        .action-button {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: white;
          border: 1px solid rgba(200, 200, 200, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .action-button:hover {
          transform: scale(1.05);
        }

        .edit-button:hover {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.1);
        }

        .delete-button:hover {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .delete-button.delete-confirm {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.2);
        }

        .action-icon {
          width: 14px;
          height: 14px;
          color: var(--gray-600);
        }

        .edit-button:hover .action-icon {
          color: #667eea;
        }

        .delete-button:hover .action-icon {
          color: #ef4444;
        }

        /* 삭제 확인 */
        .delete-confirm-dialog {
          margin: 0 var(--space-xl) var(--space-xl);
          padding: var(--space-md);
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
        }

        .confirm-message {
          font-size: 13px;
          font-weight: 600;
          color: #dc2626;
          margin: 0 0 var(--space-sm);
        }

        .confirm-actions {
          display: flex;
          gap: var(--space-xs);
        }

        .confirm-button {
          flex: 1;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .cancel-button {
          background: white;
          color: var(--gray-700);
          border: 1px solid rgba(200, 200, 200, 0.3);
        }

        .cancel-button:hover {
          background: var(--gray-50);
        }

        .delete-button-final {
          background: #ef4444;
          color: white;
        }

        .delete-button-final:hover {
          background: #dc2626;
        }

        .delete-button-final:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* 반응형 */
        @media (max-width: 768px) {
          .post-card-content {
            padding: var(--space-lg);
            gap: var(--space-sm);
          }

          .post-title {
            font-size: 16px;
          }

          .post-preview {
            font-size: 13px;
          }

          .post-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-sm);
          }

          .post-stats {
            width: 100%;
            justify-content: space-between;
          }

          .post-actions {
            opacity: 1;
          }
        }
      `}</style>
    </article>
  )
}
