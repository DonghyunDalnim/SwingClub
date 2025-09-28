'use client'

import { useState, useTransition } from 'react'
import { Timestamp } from 'firebase/firestore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useFocusTrap } from '@/lib/hooks/useFocusTrap'
import { Card, CardContent, CardHeader } from '@/components/core/Card'
import { Badge } from '@/components/core/Badge'
import { Button } from '@/components/core/Button'
import { CommentSection } from './CommentSection'
import { ArrowLeft, Heart, MessageCircle, Eye, Edit, Trash2, Share2 } from 'lucide-react'
import { deletePostAction } from '@/lib/actions/posts'
import { POST_CATEGORIES } from '@/lib/types/community'
import type { Post } from '@/lib/types/community'

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
  const [liked, setLiked] = useState(false) // TODO: 실제 좋아요 상태 연동
  const [likeCount, setLikeCount] = useState(post.stats.likes)

  // 삭제 확인 모달을 위한 포커스 트랩
  const { containerRef: modalRef } = useFocusTrap({
    enabled: showDeleteConfirm,
    autoFocus: true,
    onEscape: () => setShowDeleteConfirm(false),
    restoreFocusOnCleanup: true
  })

  // 작성자인지 확인
  const isAuthor = currentUserId === post.metadata.authorId

  // 시간 포맷팅
  const formatDateTime = (timestamp: Timestamp) => {
    const date = timestamp.toDate()
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
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

  // 좋아요 토글 (임시 구현)
  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
    // TODO: 실제 좋아요 API 연동
  }

  // 공유하기
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content.slice(0, 100) + '...',
        url: window.location.href
      })
    } else {
      // 클립보드에 URL 복사
      navigator.clipboard.writeText(window.location.href)
      alert('링크가 클립보드에 복사되었습니다.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* 뒤로가기 헤더 */}
      <div className="flex items-center justify-between">
        <Link href="/community">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Button>
        </Link>

        {/* 액션 버튼들 */}
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>

          {isAuthor && (
            <>
              <Link href={`/community/${post.id}/edit`}>
                <Button variant="secondary" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  수정
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
                className={showDeleteConfirm ? 'bg-red-50 border-red-200' : ''}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 게시글 내용 */}
      <Card>
        <CardHeader>
          {/* 카테고리와 메타 정보 */}
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="category">
              {POST_CATEGORIES[post.category]}
            </Badge>
            {post.tags && post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* 제목 */}
          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

          {/* 작성자 정보 */}
          <div className="flex items-center justify-between text-sm text-gray-600 border-b pb-4">
            <div className="flex items-center space-x-4">
              <span className="font-medium">{post.metadata.authorName}</span>
              <span>{formatDateTime(post.metadata.createdAt)}</span>
              {post.metadata.updatedAt && post.metadata.updatedAt !== post.metadata.createdAt && (
                <span className="text-xs">(수정됨)</span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {post.stats.views}
              </span>
              <span className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                {post.stats.comments}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* 본문 내용 */}
          <div className="prose max-w-none mb-6">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {post.content}
            </div>
          </div>

          {/* 첨부 이미지들 */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">첨부 이미지</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {post.attachments.map((attachment, index) => (
                  <div key={attachment.id} className="relative">
                    <img
                      src={attachment.fileUrl}
                      alt={`첨부 이미지 ${index + 1}`}
                      className="w-full h-auto rounded-lg shadow-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 특수 정보 (이벤트, 마켓플레이스) */}
          {post.eventInfo && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">🎭 이벤트 정보</h3>
              <div className="text-sm space-y-1">
                {post.eventInfo.startDate && (
                  <p><strong>시작일:</strong> {formatDateTime(post.eventInfo.startDate)}</p>
                )}
                {post.eventInfo.endDate && (
                  <p><strong>종료일:</strong> {formatDateTime(post.eventInfo.endDate)}</p>
                )}
                {post.eventInfo.location && (
                  <p><strong>장소:</strong> {post.eventInfo.location.address}</p>
                )}
                {post.eventInfo.capacity && (
                  <p><strong>정원:</strong> {post.eventInfo.capacity}명</p>
                )}
                {post.eventInfo.organizer && (
                  <p><strong>주최자:</strong> {post.eventInfo.organizer}</p>
                )}
              </div>
            </div>
          )}

          {post.marketplaceInfo && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium mb-2">🛍 거래 정보</h3>
              <div className="text-sm space-y-1">
                <p><strong>가격:</strong> {post.marketplaceInfo.price.amount.toLocaleString()}원</p>
                <p><strong>상태:</strong> {post.marketplaceInfo.condition}</p>
                <p><strong>거래방법:</strong> {post.marketplaceInfo.deliveryMethod.join(', ')}</p>
                {post.marketplaceInfo.location && (
                  <p><strong>거래지역:</strong> {post.marketplaceInfo.location.address}</p>
                )}
              </div>
            </div>
          )}

          {/* 좋아요 버튼 */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant={liked ? 'default' : 'outline'}
              onClick={handleLike}
              className="flex items-center gap-2"
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              좋아요 {likeCount}
            </Button>

            {/* 신고하기 (작성자가 아닌 경우) */}
            {!isAuthor && (
              <Button variant="secondary" size="sm" className="text-red-600">
                신고하기
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          aria-labelledby="delete-modal-title"
          aria-describedby="delete-modal-description"
        >
          <Card
            ref={modalRef as any}
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md mx-4"
          >
            <CardHeader>
              <h3 id="delete-modal-title" className="text-lg font-semibold">
                게시글 삭제
              </h3>
            </CardHeader>
            <CardContent>
              <p id="delete-modal-description" className="text-gray-600 mb-4">
                정말로 이 게시글을 삭제하시겠습니까?<br />
                삭제된 게시글은 복구할 수 없습니다.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isPending}
                  aria-label="삭제 취소"
                >
                  취소
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:outline-2 focus:outline-red-600 focus:outline-offset-2"
                  aria-label={isPending ? '게시글 삭제 중' : '게시글 삭제 확인'}
                >
                  {isPending ? '삭제 중...' : '삭제'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 댓글 섹션 */}
      <Card>
        <CommentSection
          postId={post.id}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserProfile={currentUserProfile}
          initialCommentCount={post.stats.comments}
        />
      </Card>
    </div>
  )
}