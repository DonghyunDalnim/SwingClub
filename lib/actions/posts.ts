/**
 * 게시글 관련 Server Actions
 * Next.js 15 App Router Server Actions 패턴 사용
 */

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createPost,
  getPost,
  getPosts,
  updatePost,
  deletePost,
  getPostCountsByCategory
} from '@/lib/firebase/collections'
import type {
  CreatePostData,
  UpdatePostData,
  PostSearchFilters,
  PostCategory
} from '@/lib/types/community'
import { getCurrentUser } from '@/lib/auth/server'
import { serializePost, serializePosts } from '@/lib/utils/serialization'

// 게시글 생성
export async function createPostAction(data: CreatePostData): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const user = await getCurrentUser()
    console.log('[createPostAction] User from getCurrentUser:', user)

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // userId 추출 (uid 또는 id 필드 지원)
    const userId = user.uid || (user as any).id
    const userName = user.displayName || (user as any).profile?.nickname || (user as any).displayName || '익명'

    console.log('[createPostAction] Using userId:', userId, 'userName:', userName)

    if (!userId) {
      console.error('[createPostAction] No valid userId found in user object:', user)
      return { success: false, error: '사용자 ID를 확인할 수 없습니다.' }
    }

    // 콘텐츠 검증
    if (!data.title?.trim() || !data.content?.trim()) {
      return { success: false, error: '제목과 내용을 입력해주세요.' }
    }

    // XSS 방지를 위한 기본 검증
    const sanitizedData: CreatePostData = {
      ...data,
      title: data.title.trim(),
      content: data.content.trim(),
      tags: data.tags?.map(tag => tag.trim()).filter(Boolean) || []
    }

    console.log('[createPostAction] Calling createPost with userId:', userId)
    const postId = await createPost(sanitizedData, userId, userName)
    console.log('[createPostAction] Post created successfully, postId:', postId)

    revalidatePath('/community')
    return { success: true, postId }
  } catch (error) {
    console.error('[createPostAction] 게시글 생성 실패:', error)
    return { success: false, error: '게시글 생성에 실패했습니다.' }
  }
}

// 게시글 수정
export async function updatePostAction(postId: string, data: UpdatePostData): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 작성자 권한 확인
    const post = await getPost(postId)
    if (!post || post.metadata.authorId !== user.uid) {
      return { success: false, error: '수정 권한이 없습니다.' }
    }

    // 콘텐츠 검증
    if (!data.title?.trim() || !data.content?.trim()) {
      return { success: false, error: '제목과 내용을 입력해주세요.' }
    }

    // XSS 방지를 위한 기본 검증
    const sanitizedData: UpdatePostData = {
      ...data,
      title: data.title.trim(),
      content: data.content.trim(),
      tags: data.tags?.map(tag => tag.trim()).filter(Boolean) || []
    }

    await updatePost(postId, sanitizedData)

    revalidatePath('/community')
    revalidatePath(`/community/${postId}`)
    return { success: true }
  } catch (error) {
    console.error('게시글 수정 실패:', error)
    return { success: false, error: '게시글 수정에 실패했습니다.' }
  }
}

// 게시글 삭제
export async function deletePostAction(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 작성자 권한 확인
    const post = await getPost(postId)
    if (!post || post.metadata.authorId !== user.uid) {
      return { success: false, error: '삭제 권한이 없습니다.' }
    }

    await deletePost(postId)

    revalidatePath('/community')
    return { success: true }
  } catch (error) {
    console.error('게시글 삭제 실패:', error)
    return { success: false, error: '게시글 삭제에 실패했습니다.' }
  }
}

// 게시글 목록 조회
export async function getPostsAction(filters?: PostSearchFilters) {
  try {
    const posts = await getPosts(filters)
    // Firestore Timestamp를 문자열로 직렬화하여 클라이언트로 전달
    const serializedPosts = serializePosts(posts)
    return { success: true, data: serializedPosts }
  } catch (error) {
    console.error('게시글 목록 조회 실패:', error)
    return { success: false, error: '게시글을 불러오는데 실패했습니다.', data: [] }
  }
}

// 게시글 상세 조회
export async function getPostAction(postId: string) {
  try {
    const post = await getPost(postId)
    if (!post) {
      return { success: false, error: '게시글을 찾을 수 없습니다.' }
    }
    // Firestore Timestamp를 문자열로 직렬화하여 클라이언트로 전달
    const serializedPost = serializePost(post)
    return { success: true, data: serializedPost }
  } catch (error) {
    console.error('게시글 조회 실패:', error)
    return { success: false, error: '게시글을 불러오는데 실패했습니다.' }
  }
}

// 카테고리별 게시글 수 조회
export async function getPostCountsAction() {
  try {
    const counts = await getPostCountsByCategory()
    return { success: true, data: counts }
  } catch (error) {
    console.error('게시글 수 조회 실패:', error)
    return { success: false, error: '통계를 불러오는데 실패했습니다.', data: {} }
  }
}

// 게시글 작성 후 리다이렉트
export async function createPostAndRedirect(data: CreatePostData) {
  const result = await createPostAction(data)

  if (result.success && result.postId) {
    redirect(`/community/${result.postId}`)
  } else {
    throw new Error(result.error || '게시글 생성에 실패했습니다.')
  }
}

// 게시글 수정 후 리다이렉트
export async function updatePostAndRedirect(postId: string, data: UpdatePostData) {
  const result = await updatePostAction(postId, data)

  if (result.success) {
    redirect(`/community/${postId}`)
  } else {
    throw new Error(result.error || '게시글 수정에 실패했습니다.')
  }
}

// 게시글 삭제 후 리다이렉트
export async function deletePostAndRedirect(postId: string) {
  const result = await deletePostAction(postId)

  if (result.success) {
    redirect('/community')
  } else {
    throw new Error(result.error || '게시글 삭제에 실패했습니다.')
  }
}