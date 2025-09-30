'use client'

import Link from 'next/link'
import { Card, CardContent, Badge, Button } from '@/components/core'
import { Heart, MessageCircle, Eye, Pin, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deletePostAction } from '@/lib/actions/posts'
import { POST_CATEGORIES, POST_STATUS_LABELS } from '@/lib/types/community'
import type { Post } from '@/lib/types/community'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

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

    if (minutes < 60) return `${minutes}분전`
    if (hours < 24) return `${hours}시간전`
    if (days < 7) return `${days}일전`
    return date.toLocaleDateString()
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
    <Card
      className={cn(
        'hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white border border-gray-100',
        isPinned ? 'border-blue-200 bg-blue-50 shadow-md' : 'hover:border-gray-200'
      )}
      role="article"
      aria-labelledby={`post-title-${post.id}`}
      aria-describedby={`post-meta-${post.id}`}
      style={{
        borderRadius: '12px',
        boxShadow: isPinned ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}
    >
      <CardContent className="p-5">
        <article className="space-y-4">
          {/* 작성자 정보 및 메타데이터 */}
          <header className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* 작성자 아바타 */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {post.metadata.authorName.charAt(0).toUpperCase()}
                </div>
                {isPinned && (
                  <Pin className="absolute -top-1 -right-1 h-4 w-4 text-blue-600 bg-white rounded-full p-0.5" />
                )}
              </div>

              {/* 작성자 이름 및 카테고리 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 text-sm">
                    {post.metadata.authorName}
                  </span>
                  <Badge
                    variant={isPinned ? 'default' : 'outline'}
                    className="text-xs px-2 py-0.5"
                    style={{
                      backgroundColor: isPinned ? '#693BF2' : '#F1EEFF',
                      color: isPinned ? 'white' : '#693BF2',
                      border: isPinned ? 'none' : '1px solid #693BF2'
                    }}
                  >
                    <span className="mr-1" aria-hidden="true">
                      {categoryEmojis[post.category]}
                    </span>
                    {POST_CATEGORIES[post.category]}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <time
                    className="text-xs text-gray-500"
                    dateTime={post.metadata.createdAt.toDate().toISOString()}
                    title={post.metadata.createdAt.toDate().toLocaleString()}
                  >
                    {formatTime(post.metadata.createdAt.toDate())}
                  </time>
                  {/* 새 게시글 표시 */}
                  {new Date().getTime() - post.metadata.createdAt.toDate().getTime() < 24 * 60 * 60 * 1000 && (
                    <Badge variant="destructive" className="text-xs" aria-label="새 게시글">NEW</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* 작성자 액션 버튼 */}
            {showActions && isAuthor && (
              <div className="flex gap-1" role="group" aria-label="게시글 관리">
                <Link href={`/community/${post.id}/edit`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="p-1 h-7 w-7 border-gray-200 hover:border-[#693BF2] hover:text-[#693BF2]"
                    aria-label={`"${post.title}" 게시글 수정`}
                  >
                    <Edit className="h-3 w-3" aria-hidden="true" />
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    'p-1 h-7 w-7 border-gray-200 hover:border-red-500 hover:text-red-500',
                    showDeleteConfirm && 'bg-red-50 border-red-200 text-red-600'
                  )}
                  onClick={handleDelete}
                  disabled={isPending}
                  aria-label={`"${post.title}" 게시글 삭제${showDeleteConfirm ? ' - 다시 클릭하여 확인' : ''}`}
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                </Button>
              </div>
            )}
          </header>

          <div className="space-y-3">
            {/* 제목과 뱃지 */}
            <header className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <Link href={`/community/${post.id}`} className="hover:text-purple-600">
                  <h3 id={`post-title-${post.id}`} className="font-semibold text-sm truncate pr-2">
                    {post.title}
                  </h3>
                </Link>

                <div id={`post-meta-${post.id}`} className="flex items-center gap-2 mt-1">
                  <Badge variant={isPinned ? 'default' : 'outline'} className="text-xs">
                    {POST_CATEGORIES[post.category]}
                  </Badge>

                  {/* 새 게시글 표시 */}
                  {new Date().getTime() - post.metadata.createdAt.toDate().getTime() < 24 * 60 * 60 * 1000 && (
                    <Badge variant="destructive" className="text-xs" aria-label="새 게시글">NEW</Badge>
                  )}

                  <time
                    className="text-xs text-gray-500"
                    dateTime={post.metadata.createdAt.toDate().toISOString()}
                    title={post.metadata.createdAt.toDate().toLocaleString()}
                  >
                    {formatTime(post.metadata.createdAt.toDate())}
                  </time>
                </div>
              </div>

              {/* 작성자 액션 버튼 */}
              {showActions && isAuthor && (
                <div className="flex gap-1 ml-2" role="group" aria-label="게시글 관리">
                  <Link href={`/community/${post.id}/edit`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="p-1 h-7 w-7"
                      aria-label={`"${post.title}" 게시글 수정`}
                    >
                      <Edit className="h-3 w-3" aria-hidden="true" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`p-1 h-7 w-7 ${showDeleteConfirm ? 'bg-red-50 border-red-200' : ''}`}
                    onClick={handleDelete}
                    disabled={isPending}
                    aria-label={`"${post.title}" 게시글 삭제${showDeleteConfirm ? ' - 다시 클릭하여 확인' : ''}`}
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                  </Button>
                </div>
              )}
            </header>

            {/* 게시글 내용 미리보기 */}
            {post.content && (
              <div className="text-sm text-gray-600 leading-relaxed">
                <p className="line-clamp-2">
                  {post.content.slice(0, 120)}{post.content.length > 120 ? '...' : ''}
                </p>
              </div>
            )}

            {/* 통계 및 첨부파일 */}
            <footer className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-gray-600" role="group" aria-label="게시글 통계">
                <span className="flex items-center hover:text-[#693BF2] transition-colors cursor-pointer" aria-label={`좋아요 ${post.stats.likes}개`}>
                  <Heart className="h-4 w-4 mr-1.5" style={{ color: '#693BF2' }} aria-hidden="true" />
                  <span className="font-medium">{post.stats.likes}</span>
                </span>
                <span className="flex items-center hover:text-[#693BF2] transition-colors cursor-pointer" aria-label={`댓글 ${post.stats.comments}개`}>
                  <MessageCircle className="h-4 w-4 mr-1.5" style={{ color: '#693BF2' }} aria-hidden="true" />
                  <span className="font-medium">{post.stats.comments}</span>
                </span>
                <span className="flex items-center" aria-label={`조회수 ${post.stats.views}회`}>
                  <Eye className="h-4 w-4 mr-1.5 text-gray-400" aria-hidden="true" />
                  <span className="text-gray-500">{post.stats.views}</span>
                </span>
              </div>

              {/* 첨부파일 표시 */}
              <div className="flex gap-2" role="group" aria-label="첨부파일 및 태그">
                {post.attachments && post.attachments.length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-1 bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 transition-colors"
                    aria-label={`첨부 이미지 ${post.attachments.length}장`}
                  >
                    📎 {post.attachments.length}장
                  </Badge>
                )}

                {post.tags && post.tags.length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-1 bg-purple-50 text-[#693BF2] border-purple-200 hover:bg-purple-100 transition-colors"
                    aria-label={`태그: ${post.tags.join(', ')}`}
                  >
                    #{post.tags[0]}{post.tags.length > 1 ? ` +${post.tags.length - 1}` : ''}
                  </Badge>
                )}
              </div>
            </footer>
          </div>
        </article>

        {/* 삭제 확인 메시지 */}
        {showDeleteConfirm && (
          <div
            className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200"
            role="dialog"
            aria-labelledby={`delete-confirm-title-${post.id}`}
            aria-describedby={`delete-confirm-desc-${post.id}`}
          >
            <p
              id={`delete-confirm-title-${post.id}`}
              className="text-sm text-red-700 mb-2"
            >
              정말 삭제하시겠습니까?
            </p>
            <p
              id={`delete-confirm-desc-${post.id}`}
              className="sr-only"
            >
              &quot;{post.title}&quot; 게시글을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-2" role="group" aria-label="삭제 확인 액션">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isPending}
                className="text-xs"
                aria-label="삭제 취소"
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
                className="text-xs bg-red-600 hover:bg-red-700 text-white"
                aria-label={`"${post.title}" 게시글 삭제 확인`}
              >
                {isPending ? '삭제 중...' : '삭제'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}