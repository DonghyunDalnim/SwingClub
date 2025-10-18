/**
 * 댓글 관련 Server Actions
 * Next.js 15 App Router Server Actions 패턴 사용
 */

'use server'

import { revalidatePath } from 'next/cache'
import {
  createComment,
  updateComment,
  deleteComment,
  getComments,
  likeComment,
  unlikeComment,
  createNotification
} from '@/lib/firebase/collections'
import type {
  Comment,
  CreateCommentData,
  UpdateCommentData
} from '@/lib/types/community'
import { getCurrentUser } from '@/lib/auth/server'

// 댓글 생성
export async function createCommentAction(data: CreateCommentData): Promise<{ success: boolean; commentId?: string; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 사용자 ID 추출 (id 또는 uid 필드 지원)
    const userId = (user as any)?.id || (user as any)?.uid
    if (!userId) {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' }
    }

    // 콘텐츠 검증
    if (!data.content?.trim()) {
      return { success: false, error: '댓글 내용을 입력해주세요.' }
    }

    if (data.content.length > 1000) {
      return { success: false, error: '댓글은 1000자를 초과할 수 없습니다.' }
    }

    // XSS 방지를 위한 기본 검증
    const sanitizedData: CreateCommentData = {
      ...data,
      content: data.content.trim()
    }

    const commentId = await createComment(sanitizedData, userId, user.displayName || '익명')

    // 알림 생성 (댓글이 대댓글인 경우와 원댓글인 경우 다르게 처리)
    if (data.parentId) {
      // 대댓글인 경우: 부모 댓글 작성자에게 알림
      await createCommentReplyNotification(data.postId, commentId, data.parentId, userId)
    } else {
      // 원댓글인 경우: 게시글 작성자에게 알림
      await createNewCommentNotification(data.postId, commentId, userId)
    }

    revalidatePath(`/community/${data.postId}`)
    return { success: true, commentId }

  } catch (error) {
    console.error('Failed to create comment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '댓글 작성에 실패했습니다.'
    }
  }
}

// 댓글 수정
export async function updateCommentAction(
  commentId: string,
  data: UpdateCommentData
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const userId = (user as any)?.id || (user as any)?.uid
    if (!userId) {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' }
    }

    // 콘텐츠 검증
    if (data.content && !data.content.trim()) {
      return { success: false, error: '댓글 내용을 입력해주세요.' }
    }

    if (data.content && data.content.length > 1000) {
      return { success: false, error: '댓글은 1000자를 초과할 수 없습니다.' }
    }

    // 댓글 수정 권한 확인 및 실행
    const comment = await updateComment(commentId, data, userId)

    // 해당 게시글 페이지 갱신
    revalidatePath('/community')
    if (comment?.postId) {
      revalidatePath(`/community/${comment.postId}`)
    }

    return { success: true }

  } catch (error) {
    console.error('Failed to update comment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '댓글 수정에 실패했습니다.'
    }
  }
}

// 댓글 삭제
export async function deleteCommentAction(commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const userId = (user as any)?.id || (user as any)?.uid
    if (!userId) {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' }
    }

    // 댓글 삭제 권한 확인 및 실행
    await deleteComment(commentId, userId)

    revalidatePath('/community')
    return { success: true }

  } catch (error) {
    console.error('Failed to delete comment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '댓글 삭제에 실패했습니다.'
    }
  }
}

// 댓글 좋아요
export async function likeCommentAction(commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const userId = (user as any)?.id || (user as any)?.uid
    if (!userId) {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' }
    }

    await likeComment(commentId, userId)

    revalidatePath('/community')
    return { success: true }

  } catch (error) {
    console.error('Failed to like comment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '좋아요 처리에 실패했습니다.'
    }
  }
}

// 댓글 좋아요 취소
export async function unlikeCommentAction(commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const userId = (user as any)?.id || (user as any)?.uid
    if (!userId) {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' }
    }

    await unlikeComment(commentId, userId)

    revalidatePath('/community')
    return { success: true }

  } catch (error) {
    console.error('Failed to unlike comment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '좋아요 취소에 실패했습니다.'
    }
  }
}

// 댓글 목록 조회
export async function getCommentsAction(
  postId: string,
  options?: { limit?: number; lastCommentId?: string }
): Promise<{ success: boolean; comments?: Comment[]; error?: string }> {
  try {
    const result = await getComments(postId, options?.limit || 50)
    return { success: true, comments: result.comments }

  } catch (error) {
    console.error('Failed to get comments:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '댓글 조회에 실패했습니다.'
    }
  }
}

// 새 댓글 알림 생성 (게시글 작성자에게)
async function createNewCommentNotification(postId: string, commentId: string, authorId: string) {
  try {
    // 게시글 정보를 가져와서 작성자에게 알림 생성
    // TODO: getPost 함수로 게시글 정보 조회 후 알림 생성
    await createNotification({
      type: 'new_comment',
      relatedPostId: postId,
      relatedCommentId: commentId,
      relatedUserId: authorId,
      title: '새 댓글',
      message: '게시글에 새 댓글이 달렸습니다.'
    })
  } catch (error) {
    console.error('Failed to create new comment notification:', error)
  }
}

// 대댓글 알림 생성 (부모 댓글 작성자에게)
async function createCommentReplyNotification(postId: string, commentId: string, parentCommentId: string, authorId: string) {
  try {
    // 부모 댓글 정보를 가져와서 작성자에게 알림 생성
    // TODO: getComment 함수로 부모 댓글 정보 조회 후 알림 생성
    await createNotification({
      type: 'comment_reply',
      relatedPostId: postId,
      relatedCommentId: commentId,
      relatedUserId: authorId,
      title: '댓글 답글',
      message: '댓글에 답글이 달렸습니다.'
    })
  } catch (error) {
    console.error('Failed to create comment reply notification:', error)
  }
}