/**
 * Firestore 컬렉션 구조 및 헬퍼 함수들
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

// ================================
// 컬렉션 레퍼런스들
// ================================

export const collections = {
  posts: collection(db, 'posts') as CollectionReference<PostDocument>,
  comments: collection(db, 'comments') as CollectionReference<CommentDocument>,
  likes: collection(db, 'likes') as CollectionReference<LikeDocument>,
  reports: collection(db, 'reports') as CollectionReference<ReportDocument>,
  notifications: collection(db, 'notifications') as CollectionReference<NotificationDocument>,
  users: collection(db, 'users'), // 기존 사용자 컬렉션
  communityStats: collection(db, 'communityStats')
}

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

    // 선택적 정보
    eventInfo: data.eventInfo ? {
      ...data.eventInfo,
      currentParticipants: 0
    } : undefined,
    marketplaceInfo: data.marketplaceInfo ? {
      ...data.marketplaceInfo,
      status: 'selling'
    } : undefined,
    location: data.location,

    // 첨부파일
    attachments: data.attachments?.map(att => ({
      ...att,
      id: crypto.randomUUID(),
      uploadedAt: now as any
    })),
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
      authorName,
      authorProfileUrl: undefined // TODO: 사용자 프로필에서 가져오기
    },

    // 특별 플래그
    isPinned: data.isPinned || false,
    isFeatured: data.isFeatured || false,

    // 지역
    region: data.region
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
): Promise<{
  posts: Post[]
  hasMore: boolean
  lastDoc?: DocumentSnapshot
}> {
  let q: Query = collections.posts

  // 필터 적용
  const constraints: QueryConstraint[] = []

  if (filters.category?.length) {
    constraints.push(where('category', 'in', filters.category))
  }

  if (filters.region?.length) {
    constraints.push(where('region', 'in', filters.region))
  }

  if (filters.author) {
    constraints.push(where('metadata.authorId', '==', filters.author))
  }

  if (filters.status?.length) {
    constraints.push(where('status', 'in', filters.status))
  } else {
    // 기본적으로 활성 게시글만
    constraints.push(where('status', '==', 'active'))
  }

  if (filters.visibility?.length) {
    constraints.push(where('visibility', 'in', filters.visibility))
  }

  if (filters.hasImages) {
    constraints.push(where('images', '!=', []))
  }

  // 정렬 (최신순)
  constraints.push(orderBy('metadata.createdAt', 'desc'))

  // 페이지네이션
  if (lastDoc) {
    constraints.push(startAfter(lastDoc))
  }
  constraints.push(limit(pageSize + 1)) // +1로 다음 페이지 존재 여부 확인

  q = query(q, ...constraints)
  const snapshot = await getDocs(q)

  const posts = snapshot.docs.slice(0, pageSize).map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Post[]

  const hasMore = snapshot.docs.length > pageSize
  const newLastDoc = snapshot.docs[pageSize - 1]

  return {
    posts,
    hasMore,
    lastDoc: newLastDoc
  }
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
 * 댓글 업데이트
 */
export async function updateComment(commentId: string, data: UpdateCommentData): Promise<void> {
  const docRef = doc(collections.comments, commentId)
  const updateData: any = {
    ...data,
    updatedAt: serverTimestamp()
  }

  // 수정 기록 추가
  if (data.content) {
    const currentDoc = await getDoc(docRef)
    if (currentDoc.exists()) {
      const currentData = currentDoc.data() as CommentDocument
      updateData.editHistory = [
        ...(currentData.editHistory || []),
        {
          editedAt: serverTimestamp(),
          previousContent: currentData.content
        }
      ]
    }
  }

  await updateDoc(docRef, updateData)
}

/**
 * 댓글 삭제 (상태 변경)
 */
export async function deleteComment(commentId: string, postId: string): Promise<void> {
  const docRef = doc(collections.comments, commentId)
  await updateDoc(docRef, {
    status: 'deleted',
    updatedAt: serverTimestamp()
  })

  // 게시글의 댓글 수 감소
  const postRef = doc(collections.posts, postId)
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
    } else {
      const commentRef = doc(collections.comments, targetId)
      await updateDoc(commentRef, {
        likes: increment(1)
      })
    }

    return true
  }
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
 * 알림 생성
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
): Promise<string> {
  const notificationData: Omit<NotificationDocument, 'id'> = {
    recipientId,
    type: type as any,
    title,
    message,
    relatedPostId: relatedData?.postId,
    relatedCommentId: relatedData?.commentId,
    relatedUserId: relatedData?.userId,
    isRead: false,
    createdAt: serverTimestamp() as any,
    actionUrl: relatedData?.actionUrl
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