'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/core/Button'
import { Card, CardContent } from '@/components/core/Card'
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
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* 작성자 정보 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              {authorProfileUrl ? (
                <img
                  src={authorProfileUrl}
                  alt={authorName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-purple-600 text-sm font-medium">
                  {authorName.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{authorName}</p>
              {isReply && (
                <p className="text-xs text-gray-500">답글 작성 중</p>
              )}
            </div>
          </div>

          {/* 텍스트 에리어 */}
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              autoFocus={autoFocus}
              rows={isReply ? 3 : 4}
              maxLength={maxLength}
              disabled={isPending}
              className={`
                w-full px-3 py-3 border rounded-lg resize-none
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                ${isPending ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
                ${error ? 'border-red-300' : 'border-gray-300'}
              `}
            />

            {/* 글자 수 표시 */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              <span className={remainingChars < 50 ? 'text-orange-500' : ''}>
                {content.length}
              </span>
              <span>/{maxLength}</span>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          {/* 버튼 영역 */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {isReply ? (
                <span>답글로 작성됩니다</span>
              ) : (
                <span>Enter + Shift로 줄바꿈, Enter로 전송</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="text-gray-600"
                >
                  <X className="h-4 w-4 mr-1" />
                  취소
                </Button>
              )}

              <Button
                type="submit"
                size="sm"
                disabled={!content.trim() || isPending || remainingChars < 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    작성 중...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="h-4 w-4 mr-1" />
                    {isReply ? '답글' : '댓글'} 작성
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isPending}
        autoFocus
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />

      <Button
        type="submit"
        size="sm"
        disabled={!content.trim() || isPending}
        className="bg-purple-600 hover:bg-purple-700"
      >
        {isPending ? '...' : '전송'}
      </Button>

      {onCancel && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isPending}
        >
          취소
        </Button>
      )}
    </form>
  )
}