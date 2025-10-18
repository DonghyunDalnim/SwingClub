'use client'

import { useState, useEffect } from 'react'
import { useComments } from '@/hooks/useComments'
import { CommentForm } from './CommentForm'
import { CommentItem } from './CommentItem'
import { Button } from '@/components/core/Button'
import { MessageCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

interface CommentSectionProps {
  postId: string
  currentUserId?: string
  currentUserName?: string
  currentUserProfile?: string
  initialCommentCount?: number
  className?: string
}

export function CommentSection({
  postId,
  currentUserId,
  currentUserName,
  currentUserProfile,
  initialCommentCount = 0,
  className = ''
}: CommentSectionProps) {
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [expandedComments, setExpandedComments] = useState(true)

  const {
    comments,
    loading,
    error,
    totalCount,
    refetch
  } = useComments(postId, {
    enabled: true,
    onError: (err) => {
      console.error('댓글 로딩 오류:', err)
    }
  })

  // 댓글 정렬
  const sortedComments = [...comments].sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0
    const bTime = b.createdAt?.toMillis?.() || 0
    return sortOrder === 'newest' ? bTime - aTime : aTime - bTime
  })

  // 댓글 작성 성공 핸들러
  const handleCommentSuccess = () => {
    setShowCommentForm(false)
    refetch()
  }

  // 댓글 새로고침 핸들러
  const handleRefresh = () => {
    refetch()
  }

  return (
    <div className={`comment-section ${className}`}>
      {/* 댓글 섹션 헤더 */}
      <div className="comment-header">
        <div className="header-left">
          <MessageCircle className="comment-icon" />
          <h3 className="comment-title">
            댓글 <span className="comment-count">{totalCount > 0 ? totalCount : initialCommentCount}</span>
          </h3>
          {loading && <Loader2 className="loading-spinner" />}
        </div>

        <div className="header-right">
          {/* 정렬 옵션 */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="sort-select"
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된 순</option>
          </select>

          {/* 댓글 접기/펼치기 */}
          <button
            onClick={() => setExpandedComments(!expandedComments)}
            className="toggle-button"
          >
            {expandedComments ? (
              <>
                <ChevronUp className="toggle-icon" />
                <span>접기</span>
              </>
            ) : (
              <>
                <ChevronDown className="toggle-icon" />
                <span>펼치기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 댓글 작성 영역 - 로그인 사용자에게만 표시 */}
      {currentUserId && (
        <div className="comment-write-section">
          {showCommentForm ? (
            <CommentForm
              postId={postId}
              authorName={currentUserName || '익명'}
              authorProfileUrl={currentUserProfile}
              onSuccess={handleCommentSuccess}
              onCancel={() => setShowCommentForm(false)}
              autoFocus={true}
            />
          ) : (
            <button
              onClick={() => setShowCommentForm(true)}
              className="comment-write-trigger"
            >
              댓글을 작성해주세요...
            </button>
          )}
        </div>
      )}

      {/* 댓글 목록 */}
      {expandedComments && (
        <div className="comment-list">
          {/* 로딩 상태 */}
          {loading && comments.length === 0 && (
            <div className="comment-loading">
              <Loader2 className="loading-spinner-large" />
              <p className="loading-text">댓글을 불러오는 중...</p>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="comment-error">
              <div className="error-card">
                <p className="error-message">댓글을 불러오는데 실패했습니다.</p>
                <button
                  onClick={handleRefresh}
                  className="error-retry-button"
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}

          {/* 댓글이 없는 경우 */}
          {!loading && !error && comments.length === 0 && (
            <div className="comment-empty">
              <MessageCircle className="empty-icon" />
              <p className="empty-text">아직 댓글이 없습니다.</p>
              <p className="empty-subtext">첫 번째 댓글을 작성해보세요!</p>
            </div>
          )}

          {/* 댓글 리스트 */}
          {sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserProfile={currentUserProfile}
              onReplySuccess={handleRefresh}
              className="comment-item-wrapper"
            />
          ))}

          {/* 더 많은 댓글 로드 버튼 (필요시) */}
          {comments.length >= 20 && (
            <div className="load-more-section">
              <button
                onClick={handleRefresh}
                className="load-more-button"
              >
                더 많은 댓글 보기
              </button>
            </div>
          )}
        </div>
      )}

      {/* 댓글 통계 (접힌 상태일 때) */}
      {!expandedComments && totalCount > 0 && (
        <div className="comment-collapsed">
          {totalCount}개의 댓글이 있습니다.
        </div>
      )}

      <style jsx>{`
        .comment-section {
          background: transparent;
        }

        /* 헤더 */
        .comment-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-xl);
          border-bottom: 1px solid rgba(200, 200, 200, 0.15);
          gap: var(--space-md);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          flex: 1;
          min-width: 0;
        }

        .comment-icon {
          width: 22px;
          height: 22px;
          color: #667eea;
          flex-shrink: 0;
        }

        .comment-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--gray-900);
          margin: 0;
        }

        .comment-count {
          color: #667eea;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          color: #667eea;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          flex-shrink: 0;
        }

        .sort-select {
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--gray-700);
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(200, 200, 200, 0.3);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          outline: none;
        }

        .sort-select:hover {
          background: white;
          border-color: #667eea;
        }

        .sort-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .toggle-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          color: var(--gray-700);
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(200, 200, 200, 0.3);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toggle-button:hover {
          background: rgba(102, 126, 234, 0.1);
          border-color: #667eea;
          color: #667eea;
        }

        .toggle-icon {
          width: 16px;
          height: 16px;
        }

        /* 댓글 작성 영역 */
        .comment-write-section {
          padding: var(--space-lg);
          background: transparent;
        }

        .comment-write-trigger {
          width: 100%;
          padding: 14px 18px;
          text-align: left;
          font-size: 14px;
          color: var(--gray-500);
          background: white;
          border: 2px solid rgba(200, 200, 200, 0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .comment-write-trigger:hover {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.02);
        }

        .comment-write-trigger:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        /* 댓글 목록 */
        .comment-list {
          display: flex;
          flex-direction: column;
        }

        .comment-item-wrapper {
          transition: background-color 0.2s;
        }

        .comment-item-wrapper:hover {
          background: rgba(249, 250, 251, 0.8);
        }

        /* 로딩 */
        .comment-loading {
          padding: var(--space-2xl);
          text-align: center;
        }

        .loading-spinner-large {
          width: 32px;
          height: 32px;
          color: #667eea;
          margin: 0 auto var(--space-sm);
          animation: spin 1s linear infinite;
        }

        .loading-text {
          font-size: 14px;
          color: var(--gray-500);
          margin: 0;
        }

        /* 에러 */
        .comment-error {
          padding: var(--space-lg);
        }

        .error-card {
          padding: var(--space-lg);
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          text-align: center;
        }

        .error-message {
          font-size: 14px;
          color: #dc2626;
          margin: 0 0 var(--space-md);
          font-weight: 600;
        }

        .error-retry-button {
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #dc2626;
          background: white;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .error-retry-button:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: #dc2626;
        }

        /* 빈 상태 */
        .comment-empty {
          padding: var(--space-2xl);
          text-align: center;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          color: var(--gray-300);
          margin: 0 auto var(--space-lg);
        }

        .empty-text {
          font-size: 16px;
          font-weight: 600;
          color: var(--gray-600);
          margin: 0 0 var(--space-xs);
        }

        .empty-subtext {
          font-size: 13px;
          color: var(--gray-400);
          margin: 0;
        }

        /* 더보기 */
        .load-more-section {
          padding: var(--space-lg);
          text-align: center;
          border-top: 1px solid rgba(200, 200, 200, 0.15);
        }

        .load-more-button {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .load-more-button:hover {
          background: rgba(102, 126, 234, 0.15);
          transform: translateY(-2px);
        }

        /* 접힌 상태 */
        .comment-collapsed {
          padding: var(--space-lg);
          text-align: center;
          font-size: 13px;
          color: var(--gray-500);
        }

        /* 반응형 */
        @media (max-width: 768px) {
          .comment-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-md);
          }

          .header-left {
            width: 100%;
          }

          .header-right {
            width: 100%;
            justify-content: space-between;
          }

          .sort-select,
          .toggle-button {
            flex: 1;
          }
        }
      `}</style>
    </div>
  )
}

// 경량화된 댓글 미리보기 컴포넌트 (목록에서 사용)
export function CommentPreview({
  postId,
  commentCount,
  className = ''
}: {
  postId: string
  commentCount: number
  className?: string
}) {
  const { comments, loading } = useComments(postId, {
    enabled: commentCount > 0
  })

  const previewComments = comments.slice(0, 2)

  return (
    <div className={`text-sm text-gray-600 ${className}`}>
      {loading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>댓글 로딩 중...</span>
        </div>
      ) : (
        <>
          {previewComments.map((comment) => (
            <div key={comment.id} className="mb-2 last:mb-0">
              <span className="font-medium">{comment.authorName}</span>
              <span className="ml-2">
                {comment.content.slice(0, 50)}
                {comment.content.length > 50 && '...'}
              </span>
            </div>
          ))}
          {commentCount > 2 && (
            <div className="text-purple-600 mt-1">
              +{commentCount - 2}개 더 보기
            </div>
          )}
        </>
      )}
    </div>
  )
}
