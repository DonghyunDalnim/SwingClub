'use client'

import { useState, useTransition } from 'react'
import { Timestamp } from 'firebase/firestore'
import { Button } from '@/components/core/Button'
import { CommentForm, InlineCommentForm } from './CommentForm'
import { Heart, MessageCircle, MoreHorizontal, Edit, Trash2, Flag } from 'lucide-react'
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
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [liked, setLiked] = useState(false) // TODO: Get actual like status
  const [likeCount, setLikeCount] = useState(comment.likes || 0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // 작성자인지 확인
  const isAuthor = currentUserId === comment.authorId

  // 들여쓰기 계산 (최대 3레벨)
  const indentLevel = Math.min(comment.level, 3)
  const indentClass = indentLevel > 0 ? `ml-${indentLevel * 4}` : ''

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

  // 댓글 수정
  const handleEdit = async (newContent: string) => {
    if (!newContent.trim()) return

    startTransition(async () => {
      try {
        setError(null)
        const result = await updateCommentAction(comment.id, { content: newContent.trim() })

        if (result.success) {
          setShowEditForm(false)
        } else {
          setError(result.error || '댓글 수정에 실패했습니다.')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '댓글 수정 중 오류가 발생했습니다.')
      }
    })
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
          // 삭제 성공 - 부모에서 새로고침 처리
        } else {
          setError(result.error || '댓글 삭제에 실패했습니다.')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '댓글 삭제 중 오류가 발생했습니다.')
      }
    })
  }

  // 좋아요 토글
  const handleLike = async () => {
    if (!currentUserId) {
      setError('로그인이 필요합니다.')
      return
    }

    const wasLiked = liked
    setLiked(!liked)
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1)

    try {
      const result = wasLiked
        ? await unlikeCommentAction(comment.id)
        : await likeCommentAction(comment.id)

      if (!result.success) {
        // 롤백
        setLiked(wasLiked)
        setLikeCount(prev => wasLiked ? prev + 1 : prev - 1)
        setError(result.error || '좋아요 처리에 실패했습니다.')
      }
    } catch (err) {
      // 롤백
      setLiked(wasLiked)
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1)
      setError(err instanceof Error ? err.message : '좋아요 처리 중 오류가 발생했습니다.')
    }
  }

  // 답글 작성 성공
  const handleReplySuccess = () => {
    setShowReplyForm(false)
    onReplySuccess?.()
  }

  return (
    <div className={`${className} ${indentClass}`}>
      <div className="bg-white border-l-2 border-gray-100 pl-4 py-3">
        {/* 댓글 헤더 */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* 프로필 이미지 */}
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              {comment.authorProfileUrl ? (
                <img
                  src={comment.authorProfileUrl}
                  alt={comment.authorName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-purple-600 text-sm font-medium">
                  {comment.authorName.charAt(0)}
                </span>
              )}
            </div>

            {/* 작성자 정보 */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {comment.authorName}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDateTime(comment.createdAt)}
                </span>
                {comment.updatedAt && comment.updatedAt.toDate() !== comment.createdAt.toDate() && (
                  <span className="text-xs text-gray-400">(수정됨)</span>
                )}
              </div>
            </div>
          </div>

          {/* 옵션 메뉴 */}
          {currentUserId && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOptions(!showOptions)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>

              {showOptions && (
                <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  {isAuthor ? (
                    <>
                      <button
                        onClick={() => {
                          setShowEditForm(true)
                          setShowOptions(false)
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        수정
                      </button>
                      <button
                        onClick={() => {
                          setShowOptions(false)
                          handleDelete()
                        }}
                        disabled={isPending}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        삭제
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowOptions(false)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                    >
                      <Flag className="h-4 w-4" />
                      신고
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 댓글 내용 */}
        {showEditForm ? (
          <div className="mb-3">
            <InlineCommentForm
              postId={comment.postId}
              placeholder="댓글을 수정해주세요..."
              onSuccess={() => setShowEditForm(false)}
              onCancel={() => setShowEditForm(false)}
            />
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {/* 댓글 액션 */}
        <div className="flex items-center gap-4 text-sm">
          {/* 좋아요 */}
          <button
            onClick={handleLike}
            disabled={!currentUserId}
            className={`flex items-center gap-1 hover:text-purple-600 transition-colors ${
              liked ? 'text-purple-600' : 'text-gray-500'
            }`}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            <span>{likeCount}</span>
          </button>

          {/* 답글 */}
          {comment.level < 2 && currentUserId && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-gray-500 hover:text-purple-600 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              답글
            </button>
          )}
        </div>

        {/* 답글 작성 폼 */}
        {showReplyForm && currentUserId && currentUserName && (
          <div className="mt-3 pl-4 border-l-2 border-purple-100">
            <CommentForm
              postId={comment.postId}
              parentId={comment.id}
              authorName={currentUserName}
              authorProfileUrl={currentUserProfile}
              placeholder="답글을 작성해주세요..."
              onSuccess={handleReplySuccess}
              onCancel={() => setShowReplyForm(false)}
              autoFocus={true}
              className="bg-gray-50"
            />
          </div>
        )}

        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold mb-2">댓글 삭제</h3>
              <p className="text-gray-600 mb-4">
                정말로 이 댓글을 삭제하시겠습니까?
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isPending}
                >
                  취소
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isPending ? '삭제 중...' : '삭제'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 대댓글들 */}
        {comment.children.length > 0 && (
          <div className="mt-3 space-y-2">
            {comment.children.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                currentUserProfile={currentUserProfile}
                onReplySuccess={onReplySuccess}
              />
            ))}
          </div>
        )}
      </div>

      {/* 외부 클릭으로 옵션 닫기 */}
      {showOptions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  )
}