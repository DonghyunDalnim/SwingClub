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
    <div className={`bg-white ${className}`}>
      {/* 댓글 섹션 헤더 */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            댓글 {totalCount > 0 ? totalCount : initialCommentCount}
          </h3>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-purple-600" />}
        </div>

        <div className="flex items-center gap-2">
          {/* 정렬 옵션 */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="text-sm border rounded px-2 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된 순</option>
          </select>

          {/* 댓글 접기/펼치기 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandedComments(!expandedComments)}
            className="text-gray-600"
          >
            {expandedComments ? (
              <>
                <ChevronUp className="h-4 w-4" />
                접기
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                펼치기
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 댓글 작성 영역 */}
      {currentUserId ? (
        <div className="p-4 border-b bg-gray-50">
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
              className="w-full p-3 text-left text-gray-500 bg-white border rounded-lg hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            >
              댓글을 작성해주세요...
            </button>
          )}
        </div>
      ) : (
        <div className="p-4 border-b bg-gray-50 text-center">
          <p className="text-gray-600">
            댓글을 작성하려면{' '}
            <a href="/login" className="text-purple-600 hover:underline">
              로그인
            </a>
            이 필요합니다.
          </p>
        </div>
      )}

      {/* 댓글 목록 */}
      {expandedComments && (
        <div className="divide-y divide-gray-100">
          {/* 로딩 상태 */}
          {loading && comments.length === 0 && (
            <div className="p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600 mx-auto mb-2" />
              <p className="text-gray-500">댓글을 불러오는 중...</p>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="p-4 text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 mb-2">댓글을 불러오는데 실패했습니다.</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRefresh}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  다시 시도
                </Button>
              </div>
            </div>
          )}

          {/* 댓글이 없는 경우 */}
          {!loading && !error && comments.length === 0 && (
            <div className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">아직 댓글이 없습니다.</p>
              <p className="text-gray-400 text-sm">첫 번째 댓글을 작성해보세요!</p>
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
              className="hover:bg-gray-50 transition-colors"
            />
          ))}

          {/* 더 많은 댓글 로드 버튼 (필요시) */}
          {comments.length >= 20 && (
            <div className="p-4 text-center border-t">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRefresh}
                className="text-purple-600"
              >
                더 많은 댓글 보기
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 댓글 통계 (접힌 상태일 때) */}
      {!expandedComments && totalCount > 0 && (
        <div className="p-4 text-center text-gray-500 text-sm">
          {totalCount}개의 댓글이 있습니다.
        </div>
      )}
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