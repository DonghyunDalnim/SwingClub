'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CommentSection } from './CommentSection'
import { ArrowLeft, Heart, MessageCircle, Eye, Edit, Trash2, Calendar, MapPin, DollarSign, Package } from 'lucide-react'
import { deletePostAction } from '@/lib/actions/posts'
import { POST_CATEGORIES } from '@/lib/types/community'
import type { Post } from '@/lib/types/community'
import { formatDateTime } from '@/lib/utils/date'

interface PostDetailProps {
  post: Post
  currentUserId?: string
  currentUserName?: string
  currentUserProfile?: string
}

export function PostDetail({ post, currentUserId, currentUserName, currentUserProfile }: PostDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.stats.likes)

  const isAuthor = currentUserId === post.metadata.authorId

  // 카테고리 이모지
  const categoryEmojis = {
    general: '💬',
    qna: '❓',
    event: '🎭',
    marketplace: '🛍',
    lesson: '📚',
    review: '⭐'
  }

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    startTransition(async () => {
      try {
        const result = await deletePostAction(post.id)
        if (result.success) {
          router.push('/community')
        } else {
          alert(result.error || '삭제에 실패했습니다.')
        }
      } catch (error) {
        console.error('삭제 실패:', error)
        alert('삭제 중 오류가 발생했습니다.')
      }
    })
  }

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
  }

  return (
    <div className="detail-container">
      <div className="detail-wrapper">
        {/* 헤더 */}
        <div className="detail-header">
          <Link href="/community" className="back-button">
            <ArrowLeft className="back-icon" />
            <span>목록으로</span>
          </Link>

          <div className="header-actions">
            {isAuthor && (
              <>
                <Link href={`/community/${post.id}/edit`}>
                  <button className="action-btn edit-btn">
                    <Edit className="action-icon" />
                    <span>수정</span>
                  </button>
                </Link>
                <button
                  className={`action-btn delete-btn ${showDeleteConfirm ? 'delete-active' : ''}`}
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  <Trash2 className="action-icon" />
                  <span>삭제</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 게시글 카드 */}
        <article className="post-detail-card">
          {/* 카테고리 + 태그 */}
          <div className="post-meta-header">
            <div className="category-badge">
              <span className="category-emoji">{categoryEmojis[post.category]}</span>
              <span className="category-text">{POST_CATEGORIES[post.category]}</span>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="tags-container">
                {post.tags.map((tag, index) => (
                  <span key={index} className="tag-badge">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 제목 */}
          <h1 className="post-title">{post.title}</h1>

          {/* 작성자 정보 + 통계 */}
          <div className="post-author-section">
            <div className="author-info">
              <div className="author-avatar">
                {post.metadata.authorName.charAt(0).toUpperCase()}
              </div>
              <div className="author-details">
                <span className="author-name">{post.metadata.authorName}</span>
                <time className="post-time">
                  {formatDateTime(post.metadata.createdAt)}
                  {post.metadata.updatedAt && post.metadata.updatedAt !== post.metadata.createdAt && (
                    <span className="edited-mark"> (수정됨)</span>
                  )}
                </time>
              </div>
            </div>

            <div className="post-stats">
              <span className="stat-item">
                <Eye className="stat-icon" />
                <span className="stat-value">{post.stats.views}</span>
              </span>
              <span className="stat-item">
                <Heart className="stat-icon" />
                <span className="stat-value">{likeCount}</span>
              </span>
              <span className="stat-item">
                <MessageCircle className="stat-icon" />
                <span className="stat-value">{post.stats.comments}</span>
              </span>
            </div>
          </div>

          {/* 본문 */}
          <div className="post-content">
            <p className="content-text">{post.content}</p>
          </div>

          {/* 첨부 이미지 */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="attachments-section">
              <h3 className="section-subtitle">첨부 이미지</h3>
              <div className="images-grid">
                {post.attachments.map((attachment, index) => (
                  <div key={attachment.id} className="image-item">
                    <img
                      src={attachment.fileUrl}
                      alt={`첨부 이미지 ${index + 1}`}
                      className="attachment-image"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 이벤트 정보 */}
          {post.eventInfo && (
            <div className="info-card event-card">
              <h3 className="info-card-title">
                <Calendar className="info-icon" />
                이벤트 정보
              </h3>
              <div className="info-content">
                {post.eventInfo.startDate && (
                  <div className="info-row">
                    <span className="info-label">시작일</span>
                    <span className="info-value">{formatDateTime(post.eventInfo.startDate)}</span>
                  </div>
                )}
                {post.eventInfo.endDate && (
                  <div className="info-row">
                    <span className="info-label">종료일</span>
                    <span className="info-value">{formatDateTime(post.eventInfo.endDate)}</span>
                  </div>
                )}
                {post.eventInfo.location && (
                  <div className="info-row">
                    <MapPin className="info-icon-sm" />
                    <span className="info-value">{post.eventInfo.location.address}</span>
                  </div>
                )}
                {post.eventInfo.capacity && (
                  <div className="info-row">
                    <span className="info-label">정원</span>
                    <span className="info-value">{post.eventInfo.capacity}명</span>
                  </div>
                )}
                {post.eventInfo.organizer && (
                  <div className="info-row">
                    <span className="info-label">주최자</span>
                    <span className="info-value">{post.eventInfo.organizer}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 거래 정보 */}
          {post.marketplaceInfo && (
            <div className="info-card marketplace-card">
              <h3 className="info-card-title">
                <Package className="info-icon" />
                거래 정보
              </h3>
              <div className="info-content">
                <div className="info-row">
                  <DollarSign className="info-icon-sm" />
                  <span className="info-value price-value">
                    {post.marketplaceInfo.price.amount.toLocaleString()}원
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">상태</span>
                  <span className="info-value">{post.marketplaceInfo.condition}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">거래방법</span>
                  <span className="info-value">{post.marketplaceInfo.deliveryMethod.join(', ')}</span>
                </div>
                {post.marketplaceInfo.location && (
                  <div className="info-row">
                    <MapPin className="info-icon-sm" />
                    <span className="info-value">{post.marketplaceInfo.location.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 좋아요 + 신고 */}
          <div className="post-actions-bar">
            <button
              className={`like-button ${liked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              <Heart className={`like-icon ${liked ? 'liked' : ''}`} />
              <span>좋아요 {likeCount}</span>
            </button>

            {!isAuthor && (
              <button className="report-button">
                신고하기
              </button>
            )}
          </div>
        </article>

        {/* 댓글 섹션 */}
        <div className="comments-card">
          <CommentSection
            postId={post.id}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserProfile={currentUserProfile}
            initialCommentCount={post.stats.comments}
          />
        </div>

        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">게시글 삭제</h3>
              <p className="modal-message">
                정말로 이 게시글을 삭제하시겠습니까?<br />
                삭제된 게시글은 복구할 수 없습니다.
              </p>
              <div className="modal-actions">
                <button
                  className="modal-btn cancel-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isPending}
                >
                  취소
                </button>
                <button
                  className="modal-btn confirm-btn"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  {isPending ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .detail-container {
          min-height: 100vh;
          background: var(--warm-gray);
          padding: var(--space-xl) 0;
        }

        .detail-wrapper {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        /* 헤더 */
        .detail-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-md);
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          border: 1px solid rgba(200, 200, 200, 0.2);
          color: var(--gray-700);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .back-button:hover {
          background: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .back-icon {
          width: 16px;
          height: 16px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          border: 1px solid rgba(200, 200, 200, 0.2);
          color: var(--gray-700);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .action-icon {
          width: 16px;
          height: 16px;
        }

        .edit-btn:hover {
          border-color: #667eea;
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
        }

        .delete-btn:hover {
          border-color: #ef4444;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .delete-btn.delete-active {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.2);
          color: #dc2626;
        }

        /* 게시글 카드 */
        .post-detail-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 24px;
          padding: var(--space-2xl);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(200, 200, 200, 0.15);
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        /* 메타 헤더 */
        .post-meta-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          flex-wrap: wrap;
        }

        .category-badge {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 8px 16px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-radius: 12px;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .category-emoji {
          font-size: 16px;
        }

        .category-text {
          font-size: 13px;
          font-weight: 600;
          color: #667eea;
        }

        .tags-container {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          flex-wrap: wrap;
        }

        .tag-badge {
          padding: 6px 12px;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          color: #667eea;
        }

        /* 제목 */
        .post-title {
          font-size: 32px;
          font-weight: 800;
          color: var(--gray-900);
          line-height: 1.3;
          margin: 0;
        }

        /* 작성자 섹션 */
        .post-author-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md) 0;
          border-top: 1px solid rgba(200, 200, 200, 0.15);
          border-bottom: 1px solid rgba(200, 200, 200, 0.15);
          gap: var(--space-md);
        }

        .author-info {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          min-width: 0;
          flex: 1;
        }

        .author-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          font-weight: 700;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .author-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .author-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--gray-900);
        }

        .post-time {
          font-size: 13px;
          color: var(--gray-500);
        }

        .edited-mark {
          font-size: 11px;
          color: var(--gray-400);
        }

        .post-stats {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          flex-shrink: 0;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .stat-icon {
          width: 18px;
          height: 18px;
          color: var(--gray-400);
        }

        .stat-value {
          font-size: 15px;
          font-weight: 600;
          color: var(--gray-600);
        }

        /* 본문 */
        .post-content {
          padding: var(--space-md) 0;
        }

        .content-text {
          font-size: 16px;
          line-height: 1.8;
          color: var(--gray-800);
          white-space: pre-wrap;
          word-break: break-word;
        }

        /* 첨부 이미지 */
        .attachments-section {
          padding: var(--space-lg) 0;
          border-top: 1px solid rgba(200, 200, 200, 0.15);
        }

        .section-subtitle {
          font-size: 15px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-md);
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-md);
        }

        .image-item {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .attachment-image {
          width: 100%;
          height: auto;
          display: block;
        }

        /* 정보 카드 */
        .info-card {
          padding: var(--space-lg);
          border-radius: 16px;
          border: 1px solid rgba(200, 200, 200, 0.2);
        }

        .event-card {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.05) 100%);
          border-color: rgba(59, 130, 246, 0.2);
        }

        .marketplace-card {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(134, 239, 172, 0.05) 100%);
          border-color: rgba(34, 197, 94, 0.2);
        }

        .info-card-title {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 16px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-md);
        }

        .info-icon {
          width: 20px;
          height: 20px;
        }

        .info-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 14px;
        }

        .info-label {
          font-weight: 600;
          color: var(--gray-700);
          min-width: 70px;
        }

        .info-value {
          color: var(--gray-800);
        }

        .price-value {
          font-size: 18px;
          font-weight: 700;
          color: #667eea;
        }

        .info-icon-sm {
          width: 16px;
          height: 16px;
          color: var(--gray-500);
        }

        /* 액션 바 */
        .post-actions-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: var(--space-lg);
          border-top: 1px solid rgba(200, 200, 200, 0.15);
        }

        .like-button {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 12px 24px;
          background: rgba(102, 126, 234, 0.1);
          border: 2px solid rgba(102, 126, 234, 0.2);
          border-radius: 12px;
          color: #667eea;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .like-button:hover {
          background: rgba(102, 126, 234, 0.15);
          transform: scale(1.05);
        }

        .like-button.liked {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          color: white;
        }

        .like-icon {
          width: 18px;
          height: 18px;
        }

        .like-icon.liked {
          fill: currentColor;
        }

        .report-button {
          padding: 10px 20px;
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #ef4444;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .report-button:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: #ef4444;
        }

        /* 댓글 카드 */
        .comments-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(200, 200, 200, 0.15);
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

        .cancel-btn:hover {
          background: var(--gray-200);
        }

        .confirm-btn {
          background: #ef4444;
          color: white;
        }

        .confirm-btn:hover {
          background: #dc2626;
        }

        .confirm-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* 반응형 */
        @media (max-width: 768px) {
          .detail-container {
            padding: var(--space-md) 0;
          }

          .detail-wrapper {
            padding: 0 var(--space-md);
            gap: var(--space-lg);
          }

          .detail-header {
            flex-wrap: wrap;
          }

          .header-actions {
            flex-wrap: wrap;
          }

          .action-btn span {
            display: none;
          }

          .action-btn {
            padding: 10px;
          }

          .post-detail-card {
            padding: var(--space-lg);
            gap: var(--space-lg);
          }

          .post-title {
            font-size: 24px;
          }

          .post-author-section {
            flex-direction: column;
            align-items: flex-start;
          }

          .post-stats {
            width: 100%;
            justify-content: space-between;
          }

          .images-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
