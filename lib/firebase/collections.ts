/**
 * Firestore 컬렉션 구조 및 헬퍼 함수들
 * 통합된 컬렉션 참조 관리: Community + Marketplace + Studios
 */

import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
  type DocumentReference,
  type CollectionReference,
  type QueryConstraint,
  type Query,
  type DocumentSnapshot
} from 'firebase/firestore'
import { db } from '../firebase'
import type {
  Post,
  Comment,
  CommunityNotification,
  CreatePostData,
  CreateCommentData,
  UpdatePostData,
  UpdateCommentData,
  PostSearchFilters,
  PostCategory,
  PostStatus,
  PostDocument,
  CommentDocument,
  LikeDocument,
  ReportDocument,
  NotificationDocument
} from '../types/community'
import type { Studio } from '@/lib/types/studio'
import type { MarketplaceItem, ItemInquiry } from '@/lib/types/marketplace'

// ================================
// 컬렉션 레퍼런스들
// ================================

export const collections = {
  // Community 컬렉션들
  posts: collection(db, 'posts') as CollectionReference<PostDocument>,
  comments: collection(db, 'comments') as CollectionReference<CommentDocument>,
  likes: collection(db, 'likes') as CollectionReference<LikeDocument>,
  reports: collection(db, 'reports') as CollectionReference<ReportDocument>,
  notifications: collection(db, 'notifications') as CollectionReference<NotificationDocument>,
  communityStats: collection(db, 'communityStats'),

  // 기존 컬렉션들
  users: collection(db, 'users'),
  studios: collection(db, 'studios') as CollectionReference<Studio>,

  // Marketplace 컬렉션들
  marketplaceItems: collection(db, 'marketplace_items') as CollectionReference<MarketplaceItem>,
  itemInquiries: collection(db, 'item_inquiries') as CollectionReference<ItemInquiry>
}

// 호환성을 위한 기존 export들
export const usersCollection = collections.users
export const studiosCollection = collections.studios
export const marketplaceItemsCollection = collections.marketplaceItems
export const itemInquiriesCollection = collections.itemInquiries

// 헬퍼 함수들
export const getStudioDoc = (studioId: string): DocumentReference<Studio> =>
  doc(studiosCollection, studioId)

export const getMarketplaceItemDoc = (itemId: string): DocumentReference<MarketplaceItem> =>
  doc(marketplaceItemsCollection, itemId)

export const getItemInquiryDoc = (inquiryId: string): DocumentReference<ItemInquiry> =>
  doc(itemInquiriesCollection, inquiryId)

// 서브컬렉션 참조 함수들
export const getStudioReviewsCollection = (studioId: string) =>
  collection(db, 'studios', studioId, 'reviews')

export const getStudioImagesCollection = (studioId: string) =>
  collection(db, 'studios', studioId, 'images')

export const getUserFavoritesCollection = (userId: string) =>
  collection(db, 'users', userId, 'favorites')

export const getItemImagesCollection = (itemId: string) =>
  collection(db, 'marketplace_items', itemId, 'images')

// 컬렉션 이름 상수 (Server Actions에서 사용)
export const COLLECTION_NAMES = {
  USERS: 'users',
  STUDIOS: 'studios',
  MARKETPLACE_ITEMS: 'marketplace_items',
  ITEM_INQUIRIES: 'item_inquiries',
  POSTS: 'posts',
  COMMENTS: 'comments',
  LIKES: 'likes',
  REPORTS: 'reports',
  NOTIFICATIONS: 'notifications',
  COMMUNITY_STATS: 'communityStats',
  ANALYTICS: 'analytics',
  CONFIG: 'config'
} as const

// ================================
// 게시글 관련 함수들
// ================================

/**
 * 새 게시글 생성
 */
export async function createPost(data: CreatePostData, authorId: string, authorName: string): Promise<string> {
  const now = serverTimestamp()

  const postData: Omit<PostDocument, 'id'> = {
    title: data.title,
    content: data.content,
    category: data.category,
    status: 'active' as PostStatus,
    visibility: data.visibility || 'public',

    // 첨부파일
    images: data.images || [],

    // 태그 및 검색
    tags: data.tags || [],
    keywords: data.keywords || [],

    // 통계
    stats: {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      reports: 0,
      lastActivity: now as any
    },

    // 메타데이터
    metadata: {
      createdAt: now as any,
      updatedAt: now as any,
      authorId,
      authorName
    },

    // 특별 플래그
    isPinned: data.isPinned || false,
    isFeatured: data.isFeatured || false
  }

  // 선택적 필드들 - undefined가 아닐 때만 추가
  if (data.eventInfo) {
    postData.eventInfo = {
      ...data.eventInfo,
      currentParticipants: 0
    }
  }

  if (data.marketplaceInfo) {
    postData.marketplaceInfo = {
      ...data.marketplaceInfo,
      status: 'selling'
    }
  }

  if (data.location) {
    postData.location = data.location
  }

  if (data.attachments && data.attachments.length > 0) {
    postData.attachments = data.attachments.map(att => ({
      ...att,
      id: crypto.randomUUID(),
      uploadedAt: now as any
    }))
  }

  if (data.region) {
    postData.region = data.region
  }

  const docRef = await addDoc(collections.posts, postData)
  return docRef.id
}

/**
 * 게시글 조회 (조회수 증가)
 */
export async function getPost(postId: string): Promise<Post | null> {
  const docRef = doc(collections.posts, postId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  // 조회수 증가 (비동기)
  updateDoc(docRef, {
    'stats.views': increment(1),
    'stats.lastActivity': serverTimestamp()
  }).catch(console.error)

  return {
    id: docSnap.id,
    ...docSnap.data()
  } as Post
}

/**
 * 게시글 목록 조회
 */
export async function getPosts(
  filters: PostSearchFilters = {},
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot
): Promise<Post[]> {
  let q: Query = collections.posts

  // 필터 적용
  const constraints: QueryConstraint[] = []

  // 필터 조건에 따른 쿼리 구성
  if (filters.category && Array.isArray(filters.category) && filters.category.length > 0) {
    constraints.push(where('category', 'in', filters.category))
  } else if (filters.category && typeof filters.category === 'string') {
    // 단일 카테고리 처리
    constraints.push(where('category', '==', filters.category))
  }

  if (filters.region && Array.isArray(filters.region) && filters.region.length > 0) {
    constraints.push(where('region', 'in', filters.region))
  }

  if (filters.author) {
    constraints.push(where('metadata.authorId', '==', filters.author))
  }

  if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
    constraints.push(where('status', 'in', filters.status))
  } else {
    // 기본적으로 활성 게시글만
    constraints.push(where('status', '==', 'active'))
  }

  if (filters.visibility && Array.isArray(filters.visibility) && filters.visibility.length > 0) {
    constraints.push(where('visibility', 'in', filters.visibility))
  }

  if (filters.hasImages) {
    constraints.push(where('images', '!=', []))
  }

  // 정렬 설정
  if (filters.sortBy === 'popular') {
    // 인기순 (좋아요 수 기준)
    constraints.push(orderBy('stats.likes', 'desc'))
  } else if (filters.sortBy === 'views') {
    // 조회순
    constraints.push(orderBy('stats.views', 'desc'))
  } else {
    // 기본값: 최신순
    constraints.push(orderBy('metadata.createdAt', 'desc'))
  }

  // 페이지네이션
  if (lastDoc) {
    constraints.push(startAfter(lastDoc))
  }
  constraints.push(limit(pageSize))

  q = query(q, ...constraints)
  const snapshot = await getDocs(q)

  const posts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Post[]

  return posts
}

/**
 * 게시글 업데이트
 */
export async function updatePost(postId: string, data: UpdatePostData): Promise<void> {
  const docRef = doc(collections.posts, postId)
  await updateDoc(docRef, {
    ...data,
    'metadata.updatedAt': serverTimestamp()
  })
}

/**
 * 게시글 삭제 (상태 변경)
 */
export async function deletePost(postId: string): Promise<void> {
  const docRef = doc(collections.posts, postId)
  await updateDoc(docRef, {
    status: 'deleted',
    'metadata.updatedAt': serverTimestamp()
  })
}

// ================================
// 댓글 관련 함수들
// ================================

/**
 * 새 댓글 생성
 */
export async function createComment(
  data: CreateCommentData,
  authorId: string,
  authorName: string
): Promise<string> {
  const now = serverTimestamp()

  // 부모 댓글이 있는 경우 깊이 계산
  let depth = 0
  let rootId: string | undefined

  if (data.parentId) {
    const parentDoc = await getDoc(doc(collections.comments, data.parentId))
    if (parentDoc.exists()) {
      const parentData = parentDoc.data() as CommentDocument
      depth = parentData.depth + 1
      rootId = parentData.rootId || data.parentId
    }
  }

  const commentData: Omit<CommentDocument, 'id'> = {
    postId: data.postId,
    content: data.content,

    // 계층 구조
    parentId: data.parentId,
    depth,
    rootId,

    // 작성자
    authorId,
    authorName,
    authorProfileUrl: undefined, // TODO: 사용자 프로필에서 가져오기

    // 상태
    status: 'active',

    // 통계
    likes: 0,
    reports: 0,

    // 메타데이터
    createdAt: now as any,
    updatedAt: now as any
  }

  const docRef = await addDoc(collections.comments, commentData)

  // 게시글의 댓글 수 증가
  const postRef = doc(collections.posts, data.postId)
  await updateDoc(postRef, {
    'stats.comments': increment(1),
    'stats.lastActivity': serverTimestamp()
  })

  // 알림 생성 (게시글 작성자에게)
  try {
    const postSnap = await getDoc(postRef)
    if (postSnap.exists()) {
      const postData = postSnap.data() as PostDocument
      // 자기 자신의 게시글에 댓글을 단 경우가 아니라면 알림 생성
      if (postData.metadata.authorId !== authorId) {
        const { createNotificationForComment } = await import('@/lib/actions/notifications')
        await createNotificationForComment({
          postId: data.postId,
          postTitle: postData.title,
          postAuthorId: postData.metadata.authorId,
          commentId: docRef.id,
          commentAuthorId: authorId,
          commentAuthorName: authorName,
          commentContent: data.content,
          isReply: !!data.parentId
        })
      }
    }
  } catch (error) {
    console.error('Failed to create comment notification:', error)
    // 알림 생성 실패는 댓글 생성에 영향을 주지 않음
  }

  return docRef.id
}

/**
 * 게시글의 댓글 목록 조회
 */
export async function getComments(
  postId: string,
  pageSize: number = 50,
  lastDoc?: DocumentSnapshot
): Promise<{
  comments: Comment[]
  hasMore: boolean
  lastDoc?: DocumentSnapshot
}> {
  const constraints: QueryConstraint[] = [
    where('postId', '==', postId),
    where('status', '==', 'active'),
    orderBy('createdAt', 'asc') // 댓글은 시간순 정렬
  ]

  if (lastDoc) {
    constraints.push(startAfter(lastDoc))
  }
  constraints.push(limit(pageSize + 1))

  const q = query(collections.comments, ...constraints)
  const snapshot = await getDocs(q)

  const comments = snapshot.docs.slice(0, pageSize).map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Comment[]

  const hasMore = snapshot.docs.length > pageSize
  const newLastDoc = snapshot.docs[pageSize - 1]

  return {
    comments,
    hasMore,
    lastDoc: newLastDoc
  }
}

/**
 * 댓글 업데이트 (권한 검증 포함)
 */
export async function updateComment(commentId: string, data: UpdateCommentData, userId: string): Promise<void> {
  const docRef = doc(collections.comments, commentId)

  // 권한 확인
  const currentDoc = await getDoc(docRef)
  if (!currentDoc.exists()) {
    throw new Error('댓글을 찾을 수 없습니다.')
  }

  const currentData = currentDoc.data() as CommentDocument
  if (currentData.authorId !== userId) {
    throw new Error('댓글을 수정할 권한이 없습니다.')
  }

  const updateData: any = {
    ...data,
    updatedAt: serverTimestamp()
  }

  // 수정 기록 추가
  if (data.content) {
    updateData.editHistory = [
      ...(currentData.editHistory || []),
      {
        editedAt: serverTimestamp(),
        previousContent: currentData.content
      }
    ]
  }

  await updateDoc(docRef, updateData)
}

/**
 * 댓글 삭제 (상태 변경, 권한 검증 포함)
 */
export async function deleteComment(commentId: string, userId: string): Promise<void> {
  const docRef = doc(collections.comments, commentId)

  // 권한 확인
  const currentDoc = await getDoc(docRef)
  if (!currentDoc.exists()) {
    throw new Error('댓글을 찾을 수 없습니다.')
  }

  const currentData = currentDoc.data() as CommentDocument
  if (currentData.authorId !== userId) {
    throw new Error('댓글을 삭제할 권한이 없습니다.')
  }

  await updateDoc(docRef, {
    status: 'deleted',
    updatedAt: serverTimestamp()
  })

  // 게시글의 댓글 수 감소
  const postRef = doc(collections.posts, currentData.postId)
  await updateDoc(postRef, {
    'stats.comments': increment(-1),
    'stats.lastActivity': serverTimestamp()
  })
}

// ================================
// 좋아요 관련 함수들
// ================================

/**
 * 좋아요 추가/제거 토글
 */
export async function toggleLike(
  targetType: 'post' | 'comment',
  targetId: string,
  userId: string
): Promise<boolean> {
  const likeId = `${targetType}_${targetId}_${userId}`
  const likeRef = doc(collections.likes, likeId)
  const likeDoc = await getDoc(likeRef)

  if (likeDoc.exists()) {
    // 좋아요 제거
    await deleteDoc(likeRef)

    if (targetType === 'post') {
      const postRef = doc(collections.posts, targetId)
      await updateDoc(postRef, {
        'stats.likes': increment(-1)
      })
    } else {
      const commentRef = doc(collections.comments, targetId)
      await updateDoc(commentRef, {
        likes: increment(-1)
      })
    }

    return false
  } else {
    // 좋아요 추가
    const likeData: LikeDocument = {
      targetType,
      targetId,
      userId,
      createdAt: serverTimestamp() as any
    }

    await addDoc(collections.likes, likeData)

    if (targetType === 'post') {
      const postRef = doc(collections.posts, targetId)
      await updateDoc(postRef, {
        'stats.likes': increment(1),
        'stats.lastActivity': serverTimestamp()
      })

      // 알림 생성 (게시글 작성자에게)
      try {
        const postSnap = await getDoc(postRef)
        if (postSnap.exists()) {
          const postData = postSnap.data() as PostDocument
          // 자기 자신의 게시글에 좋아요를 누른 경우가 아니라면 알림 생성
          if (postData.metadata.authorId !== userId) {
            const { createNotificationForLike } = await import('@/lib/actions/notifications')
            const userSnap = await getDoc(doc(collections.users, userId))
            const userName = userSnap.exists() ? userSnap.data().displayName || '익명' : '익명'

            await createNotificationForLike({
              targetType: 'post',
              targetId,
              targetTitle: postData.title,
              targetAuthorId: postData.metadata.authorId,
              likeUserId: userId,
              likeUserName: userName
            })
          }
        }
      } catch (error) {
        console.error('Failed to create like notification:', error)
        // 알림 생성 실패는 좋아요에 영향을 주지 않음
      }
    } else {
      const commentRef = doc(collections.comments, targetId)
      await updateDoc(commentRef, {
        likes: increment(1)
      })

      // 알림 생성 (댓글 작성자에게)
      try {
        const commentSnap = await getDoc(commentRef)
        if (commentSnap.exists()) {
          const commentData = commentSnap.data() as CommentDocument
          // 자기 자신의 댓글에 좋아요를 누른 경우가 아니라면 알림 생성
          if (commentData.authorId !== userId) {
            const { createNotificationForLike } = await import('@/lib/actions/notifications')
            const userSnap = await getDoc(doc(collections.users, userId))
            const userName = userSnap.exists() ? userSnap.data().displayName || '익명' : '익명'

            await createNotificationForLike({
              targetType: 'comment',
              targetId,
              targetTitle: commentData.content.substring(0, 30) + '...',
              targetAuthorId: commentData.authorId,
              likeUserId: userId,
              likeUserName: userName,
              relatedPostId: commentData.postId
            })
          }
        }
      } catch (error) {
        console.error('Failed to create like notification:', error)
        // 알림 생성 실패는 좋아요에 영향을 주지 않음
      }
    }

    return true
  }
}

/**
 * 댓글 좋아요
 */
export async function likeComment(commentId: string, userId: string): Promise<void> {
  await toggleLike('comment', commentId, userId)
}

/**
 * 댓글 좋아요 취소
 */
export async function unlikeComment(commentId: string, userId: string): Promise<void> {
  await toggleLike('comment', commentId, userId)
}

/**
 * 사용자의 좋아요 상태 확인
 */
export async function getUserLikes(
  targetType: 'post' | 'comment',
  targetIds: string[],
  userId: string
): Promise<Record<string, boolean>> {
  const likes: Record<string, boolean> = {}

  // 배치 조회로 최적화
  const likeQueries = targetIds.map(targetId => {
    const likeId = `${targetType}_${targetId}_${userId}`
    return getDoc(doc(collections.likes, likeId))
  })

  const likeResults = await Promise.all(likeQueries)

  targetIds.forEach((targetId, index) => {
    likes[targetId] = likeResults[index].exists()
  })

  return likes
}

// ================================
// 신고 관련 함수들
// ================================

/**
 * 신고 생성
 */
export async function createReport(
  targetType: 'post' | 'comment' | 'user',
  targetId: string,
  reporterId: string,
  reason: string,
  description?: string
): Promise<string> {
  const reportData: Omit<ReportDocument, 'id'> = {
    targetType,
    targetId,
    reporterId,
    reason: reason as any,
    description,
    status: 'pending',
    createdAt: serverTimestamp() as any
  }

  const docRef = await addDoc(collections.reports, reportData)

  // 신고 대상의 신고 수 증가
  if (targetType === 'post') {
    const targetRef = doc(collections.posts, targetId)
    await updateDoc(targetRef, {
      'stats.reports': increment(1)
    })
  } else if (targetType === 'comment') {
    const targetRef = doc(collections.comments, targetId)
    await updateDoc(targetRef, {
      reports: increment(1)
    })
  }

  return docRef.id
}

// ================================
// 알림 관련 함수들
// ================================

/**
 * 알림 생성 (오버로드 버전)
 */
export async function createNotification(
  recipientId: string,
  type: string,
  title: string,
  message: string,
  relatedData?: {
    postId?: string
    commentId?: string
    userId?: string
    actionUrl?: string
  }
): Promise<string>

export async function createNotification(
  data: {
    type: string
    relatedPostId?: string
    relatedCommentId?: string
    relatedUserId?: string
    title: string
    message: string
    recipientId?: string
  }
): Promise<string>

export async function createNotification(
  recipientIdOrData: string | {
    type: string
    relatedPostId?: string
    relatedCommentId?: string
    relatedUserId?: string
    title: string
    message: string
    recipientId?: string
  },
  type?: string,
  title?: string,
  message?: string,
  relatedData?: {
    postId?: string
    commentId?: string
    userId?: string
    actionUrl?: string
  }
): Promise<string> {
  let notificationData: Omit<NotificationDocument, 'id'>

  if (typeof recipientIdOrData === 'string') {
    // 기존 방식 (5개 매개변수)
    notificationData = {
      recipientId: recipientIdOrData,
      type: type as any,
      title: title!,
      message: message!,
      relatedPostId: relatedData?.postId,
      relatedCommentId: relatedData?.commentId,
      relatedUserId: relatedData?.userId,
      isRead: false,
      createdAt: serverTimestamp() as any,
      actionUrl: relatedData?.actionUrl
    }
  } else {
    // 새로운 방식 (객체 매개변수)
    const data = recipientIdOrData
    notificationData = {
      recipientId: data.recipientId || '',
      type: data.type as any,
      title: data.title,
      message: data.message,
      relatedPostId: data.relatedPostId,
      relatedCommentId: data.relatedCommentId,
      relatedUserId: data.relatedUserId,
      isRead: false,
      createdAt: serverTimestamp() as any
    }
  }

  const docRef = await addDoc(collections.notifications, notificationData)
  return docRef.id
}

/**
 * 사용자의 알림 목록 조회
 */
export async function getUserNotifications(
  userId: string,
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot
): Promise<{
  notifications: CommunityNotification[]
  hasMore: boolean
  lastDoc?: DocumentSnapshot
}> {
  const constraints: QueryConstraint[] = [
    where('recipientId', '==', userId),
    orderBy('createdAt', 'desc')
  ]

  if (lastDoc) {
    constraints.push(startAfter(lastDoc))
  }
  constraints.push(limit(pageSize + 1))

  const q = query(collections.notifications, ...constraints)
  const snapshot = await getDocs(q)

  const notifications = snapshot.docs.slice(0, pageSize).map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as CommunityNotification[]

  const hasMore = snapshot.docs.length > pageSize
  const newLastDoc = snapshot.docs[pageSize - 1]

  return {
    notifications,
    hasMore,
    lastDoc: newLastDoc
  }
}

/**
 * 알림 읽음 처리
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const docRef = doc(collections.notifications, notificationId)
  await updateDoc(docRef, {
    isRead: true
  })
}

// ================================
// 유틸리티 함수들
// ================================

/**
 * 카테고리별 게시글 수 조회
 */
export async function getPostCountsByCategory(): Promise<Record<PostCategory, number>> {
  const categories: PostCategory[] = ['general', 'qna', 'event', 'marketplace', 'lesson', 'review']
  const counts: Record<PostCategory, number> = {} as any

  const queries = categories.map(category =>
    getDocs(query(
      collections.posts,
      where('category', '==', category),
      where('status', '==', 'active')
    ))
  )

  const results = await Promise.all(queries)

  categories.forEach((category, index) => {
    counts[category] = results[index].size
  })

  return counts
}

/**
 * 인기 게시글 조회 (좋아요 + 댓글 수 기준)
 */
export async function getTrendingPosts(maxResults: number = 10): Promise<Post[]> {
  // Firestore에서는 계산된 필드로 정렬할 수 없으므로
  // 클라이언트에서 정렬하거나 별도의 트렌딩 스코어 필드를 만들어야 함
  const q = query(
    collections.posts,
    where('status', '==', 'active'),
    orderBy('stats.likes', 'desc'),
    limit(maxResults * 2) // 더 많이 가져와서 클라이언트에서 필터링
  )

  const snapshot = await getDocs(q)
  const posts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Post[]

  // 트렌딩 스코어 계산 (좋아요 * 2 + 댓글 수)
  return posts
    .map(post => ({
      ...post,
      trendingScore: post.stats.likes * 2 + post.stats.comments
    }))
    .sort((a, b) => (b as any).trendingScore - (a as any).trendingScore)
    .slice(0, maxResults)
}

/**
 * 검색 (제목, 내용, 태그)
 */
export async function searchPosts(
  keyword: string,
  _filters: PostSearchFilters = {},
  pageSize: number = 20
): Promise<Post[]> {
  // Firestore는 전문 검색을 지원하지 않으므로
  // 키워드 배열을 미리 만들어 array-contains로 검색하거나
  // Algolia 같은 외부 검색 서비스를 사용해야 함

  // 임시로 태그 검색만 구현
  if (keyword) {
    const q = query(
      collections.posts,
      where('tags', 'array-contains', keyword.toLowerCase()),
      where('status', '==', 'active'),
      orderBy('metadata.createdAt', 'desc'),
      limit(pageSize)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[]
  }

  return []
}
