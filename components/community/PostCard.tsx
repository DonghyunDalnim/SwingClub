'use client'

import Link from 'next/link'
import { Card, CardContent, Badge, Button } from '@/components/core'
import { Heart, MessageCircle, Eye, Pin, Edit, Trash2 } from 'lucide-react'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { Avatar } from '@/components/ui/Avatar'
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
    <Card className={`hover:shadow-md transition-shadow ${isPinned ? 'border-blue-200 bg-blue-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* 카테고리 아이콘 */}
          <div className="text-2xl flex-shrink-0">
            {isPinned && <Pin className="h-5 w-5 text-blue-600 mr-1" />}
            {categoryEmojis[post.category]}
          </div>

          <div className="flex-1 min-w-0">
            {/* 제목과 뱃지 */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <Link href={`/community/${post.id}`} className="hover:text-purple-600">
                  <h3 className="font-semibold text-sm truncate pr-2">
                    {post.title}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={isPinned ? 'default' : 'outline'} className="text-xs">
                    {POST_CATEGORIES[post.category]}
                  </Badge>

                  {/* 새 게시글 표시 */}
                  {new Date().getTime() - post.metadata.createdAt.toDate().getTime() < 24 * 60 * 60 * 1000 && (
                    <Badge variant="destructive" className="text-xs">NEW</Badge>
                  )}

                  <span className="text-xs text-gray-500">
                    {formatTime(post.metadata.createdAt.toDate())}
                  </span>
                </div>
              </div>

              {/* 작성자 액션 버튼 */}
              {showActions && isAuthor && (
                <div className="flex gap-1 ml-2">
                  <Link href={`/community/${post.id}/edit`}>
                    <Button size="sm" variant="outline" className="p-1 h-7 w-7">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`p-1 h-7 w-7 ${showDeleteConfirm ? 'bg-red-50 border-red-200' : ''}`}
                    onClick={handleDelete}
                    disabled={isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* 작성자와 미리보기 */}
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">{post.metadata.authorName}</span>
              {post.content && (
                <>
                  {' | '}
                  <span className="line-clamp-1">
                    &ldquo;{post.content.slice(0, 50)}{post.content.length > 50 ? '...' : ''}&rdquo;
                  </span>
                </>
              )}
            </p>

            {/* 첨부된 이미지들 */}
            {post.attachments && post.attachments.length > 0 && (
              <div className="mb-3">
                {post.attachments.length === 1 ? (
                  <OptimizedImage
                    src={post.attachments[0].fileUrl}
                    alt={post.attachments[0].fileName || `${post.title} 이미지`}
                    ratio="card"
                    className="w-full max-w-md"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-w-md">
                    {post.attachments.slice(0, 4).map((attachment, index) => (
                      <OptimizedImage
                        key={attachment.id || index}
                        src={attachment.fileUrl}
                        alt={attachment.fileName || `${post.title} 이미지 ${index + 1}`}
                        ratio="card"
                        className="w-full"
                      />
                    ))}
                    {post.attachments.length > 4 && (
                      <div className="relative">
                        <OptimizedImage
                          src={post.attachments[3].fileUrl}
                          alt={`${post.title} 이미지 4`}
                          ratio="card"
                          className="w-full"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center text-white font-semibold">
                          +{post.attachments.length - 3}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 통계 및 첨부파일 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  {post.stats.likes}
                </span>
                <span className="flex items-center">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  {post.stats.comments}
                </span>
                <span className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {post.stats.views}
                </span>
              </div>

              {/* 태그 표시 */}
              <div className="flex gap-1">
                {post.tags && post.tags.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    #{post.tags[0]}{post.tags.length > 1 ? ` +${post.tags.length - 1}` : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 삭제 확인 메시지 */}
        {showDeleteConfirm && (
          <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700 mb-2">정말 삭제하시겠습니까?</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isPending}
                className="text-xs"
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
                className="text-xs bg-red-600 hover:bg-red-700 text-white"
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