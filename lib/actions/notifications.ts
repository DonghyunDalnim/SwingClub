/**
 * 알림 관련 Server Actions
 * Next.js 15 App Router Server Actions 패턴 사용
 */

'use server'

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  increment,
  Timestamp,
  onSnapshot,
  type DocumentData,
  type QueryDocumentSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getCurrentUser } from '@/lib/auth/server'
import type {
  Notification,
  CreateNotificationData,
  UpdateNotificationData,
  NotificationFilters,
  NotificationListResponse,
  NotificationCounts,
  NotificationSettings,
  NotificationStatus,
  NotificationType
} from '@/lib/types/notification'
import { DEFAULT_NOTIFICATION_SETTINGS } from '@/lib/types/notification'

/**
 * 알림 생성
 */
export async function createNotificationAction(
  data: CreateNotificationData
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    // 수신자의 알림 설정 확인
    const settingsDoc = await getDoc(doc(db, 'notification_settings', data.recipientId))
    const settings = settingsDoc.exists() ? settingsDoc.data() : DEFAULT_NOTIFICATION_SETTINGS

    // 해당 타입의 알림이 비활성화된 경우 생성하지 않음
    if (!settings.types[data.type]?.enabled) {
      return { success: true } // 성공으로 처리하되 알림은 생성하지 않음
    }

    // 알림 데이터 준비
    const notificationDoc: Omit<Notification, 'id'> = {
      recipientId: data.recipientId,
      type: data.type,
      priority: data.priority || 'normal',
      title: data.title,
      message: data.message,
      summary: data.summary,
      relatedPostId: data.relatedPostId,
      relatedCommentId: data.relatedCommentId,
      relatedUserId: data.relatedUserId,
      relatedUserName: data.relatedUserName,
      relatedUserProfileUrl: data.relatedUserProfileUrl,
      status: 'unread',
      isRead: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      actionUrl: data.actionUrl,
      actionData: data.actionData,
      expiresAt: data.expiresAt,
      groupKey: data.groupKey,
      isPushSent: false
    }

    // Firestore에 저장
    const docRef = await addDoc(collection(db, 'notifications'), notificationDoc)

    // 사용자의 읽지 않은 알림 수 증가
    const userCounterRef = doc(db, 'notification_counters', data.recipientId)
    await updateDoc(userCounterRef, {
      total: increment(1),
      unread: increment(1),
      [`byType.${data.type}`]: increment(1),
      [`byPriority.${data.priority || 'normal'}`]: increment(1),
      lastUpdated: Timestamp.now()
    }).catch(async () => {
      // 카운터 문서가 없으면 생성
      await addDoc(collection(db, 'notification_counters'), {
        userId: data.recipientId,
        total: 1,
        unread: 1,
        byType: { [data.type]: 1 },
        byPriority: { [data.priority || 'normal']: 1 },
        lastUpdated: Timestamp.now()
      })
    })

    return { success: true, notificationId: docRef.id }

  } catch (error) {
    console.error('Error creating notification:', error)
    return {
      success: false,
      error: '알림 생성 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 사용자 알림 목록 조회
 */
export async function getUserNotificationsAction(
  filters?: NotificationFilters
): Promise<{ success: boolean; data?: NotificationListResponse; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 기본 쿼리
    let notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    // 필터 적용
    if (filters?.types && filters.types.length > 0) {
      notificationsQuery = query(
        notificationsQuery,
        where('type', 'in', filters.types)
      )
    }

    if (filters?.status && filters.status.length > 0) {
      notificationsQuery = query(
        notificationsQuery,
        where('status', 'in', filters.status)
      )
    }

    if (filters?.isRead !== undefined) {
      notificationsQuery = query(
        notificationsQuery,
        where('isRead', '==', filters.isRead)
      )
    }

    // 페이지네이션
    if (filters?.limit) {
      notificationsQuery = query(notificationsQuery, limit(filters.limit))
    } else {
      notificationsQuery = query(notificationsQuery, limit(20))
    }

    const querySnapshot = await getDocs(notificationsQuery)
    const notifications = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Notification[]

    // 읽지 않은 알림 수 조회
    const unreadQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      where('isRead', '==', false)
    )
    const unreadSnapshot = await getDocs(unreadQuery)
    const unreadCount = unreadSnapshot.size

    return {
      success: true,
      data: {
        notifications,
        unreadCount,
        total: notifications.length,
        hasMore: notifications.length === (filters?.limit || 20),
        filters: filters || {}
      }
    }

  } catch (error) {
    console.error('Error getting user notifications:', error)
    return {
      success: false,
      error: '알림 목록 조회 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 알림 읽음 처리
 */
export async function markNotificationAsReadAction(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 알림 조회 및 권한 확인
    const notificationDoc = await getDoc(doc(db, 'notifications', notificationId))
    if (!notificationDoc.exists()) {
      return { success: false, error: '알림을 찾을 수 없습니다.' }
    }

    const notification = { ...notificationDoc.data(), id: notificationDoc.id } as Notification

    if (notification.recipientId !== user.uid) {
      return { success: false, error: '알림 읽기 권한이 없습니다.' }
    }

    // 이미 읽은 알림인 경우
    if (notification.isRead) {
      return { success: true }
    }

    // 읽음 처리
    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: true,
      readAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    // 카운터 업데이트
    const userCounterRef = doc(db, 'notification_counters', user.uid)
    await updateDoc(userCounterRef, {
      unread: increment(-1),
      lastUpdated: Timestamp.now()
    })

    return { success: true }

  } catch (error) {
    console.error('Error marking notification as read:', error)
    return {
      success: false,
      error: '알림 읽음 처리 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 모든 알림 읽음 처리
 */
export async function markAllNotificationsAsReadAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 읽지 않은 알림 조회
    const unreadQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      where('isRead', '==', false)
    )

    const unreadSnapshot = await getDocs(unreadQuery)

    if (unreadSnapshot.empty) {
      return { success: true }
    }

    // 배치 업데이트
    const batch = writeBatch(db)
    const updateTime = Timestamp.now()

    unreadSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        isRead: true,
        readAt: updateTime,
        updatedAt: updateTime
      })
    })

    await batch.commit()

    // 카운터 업데이트
    const userCounterRef = doc(db, 'notification_counters', user.uid)
    await updateDoc(userCounterRef, {
      unread: 0,
      lastUpdated: updateTime
    })

    return { success: true }

  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return {
      success: false,
      error: '모든 알림 읽음 처리 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 알림 삭제
 */
export async function deleteNotificationAction(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 알림 조회 및 권한 확인
    const notificationDoc = await getDoc(doc(db, 'notifications', notificationId))
    if (!notificationDoc.exists()) {
      return { success: false, error: '알림을 찾을 수 없습니다.' }
    }

    const notification = { ...notificationDoc.data(), id: notificationDoc.id } as Notification

    if (notification.recipientId !== user.uid) {
      return { success: false, error: '알림 삭제 권한이 없습니다.' }
    }

    // 소프트 삭제 (status 변경)
    await updateDoc(doc(db, 'notifications', notificationId), {
      status: 'deleted',
      updatedAt: Timestamp.now()
    })

    // 카운터 업데이트
    const userCounterRef = doc(db, 'notification_counters', user.uid)
    const updates: any = {
      total: increment(-1),
      [`byType.${notification.type}`]: increment(-1),
      [`byPriority.${notification.priority}`]: increment(-1),
      lastUpdated: Timestamp.now()
    }

    if (!notification.isRead) {
      updates.unread = increment(-1)
    }

    await updateDoc(userCounterRef, updates)

    return { success: true }

  } catch (error) {
    console.error('Error deleting notification:', error)
    return {
      success: false,
      error: '알림 삭제 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 알림 카운터 조회
 */
export async function getNotificationCountsAction(): Promise<{
  success: boolean;
  counts?: NotificationCounts;
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const counterDoc = await getDoc(doc(db, 'notification_counters', user.uid))

    if (!counterDoc.exists()) {
      // 카운터가 없으면 기본값 반환
      return {
        success: true,
        counts: {
          total: 0,
          unread: 0,
          byType: {} as Record<NotificationType, number>,
          byPriority: {
            low: 0,
            normal: 0,
            high: 0,
            urgent: 0
          }
        }
      }
    }

    const data = counterDoc.data()
    return {
      success: true,
      counts: {
        total: data.total || 0,
        unread: data.unread || 0,
        byType: data.byType || {},
        byPriority: data.byPriority || {
          low: 0,
          normal: 0,
          high: 0,
          urgent: 0
        }
      }
    }

  } catch (error) {
    console.error('Error getting notification counts:', error)
    return {
      success: false,
      error: '알림 카운터 조회 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 알림 설정 조회
 */
export async function getNotificationSettingsAction(): Promise<{
  success: boolean;
  settings?: NotificationSettings;
  error?: string;
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const settingsDoc = await getDoc(doc(db, 'notification_settings', user.uid))

    if (!settingsDoc.exists()) {
      // 기본 설정 생성
      const defaultSettings: NotificationSettings = {
        userId: user.uid,
        ...DEFAULT_NOTIFICATION_SETTINGS,
        updatedAt: Timestamp.now()
      }

      await addDoc(collection(db, 'notification_settings'), defaultSettings)
      return { success: true, settings: defaultSettings }
    }

    const settings = { userId: user.uid, ...settingsDoc.data() } as NotificationSettings
    return { success: true, settings }

  } catch (error) {
    console.error('Error getting notification settings:', error)
    return {
      success: false,
      error: '알림 설정 조회 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 알림 설정 업데이트
 */
export async function updateNotificationSettingsAction(
  settings: Partial<Omit<NotificationSettings, 'userId' | 'updatedAt'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const updateData = {
      ...settings,
      updatedAt: Timestamp.now()
    }

    await updateDoc(doc(db, 'notification_settings', user.uid), updateData)

    return { success: true }

  } catch (error) {
    console.error('Error updating notification settings:', error)
    return {
      success: false,
      error: '알림 설정 업데이트 중 오류가 발생했습니다.'
    }
  }
}

// ===== 자동 알림 생성 헬퍼 함수들 =====

/**
 * 게시글 좋아요 알림 생성
 */
export async function createPostLikeNotification(
  postId: string,
  postTitle: string,
  postAuthorId: string,
  likerUserId: string,
  likerUserName: string
): Promise<void> {
  if (postAuthorId === likerUserId) return // 자신의 게시글에 좋아요한 경우 알림 안함

  await createNotificationAction({
    recipientId: postAuthorId,
    type: 'post_like',
    title: '게시글 좋아요',
    message: `${likerUserName}님이 회원님의 게시글을 좋아합니다.`,
    summary: `${likerUserName}님이 좋아요를 눌렀습니다`,
    relatedPostId: postId,
    relatedUserId: likerUserId,
    relatedUserName: likerUserName,
    actionUrl: `/community/${postId}`,
    groupKey: `post_like_${postId}`
  })
}

/**
 * 댓글 좋아요 알림 생성
 */
export async function createCommentLikeNotification(
  postId: string,
  commentId: string,
  commentAuthorId: string,
  likerUserId: string,
  likerUserName: string
): Promise<void> {
  if (commentAuthorId === likerUserId) return

  await createNotificationAction({
    recipientId: commentAuthorId,
    type: 'comment_like',
    title: '댓글 좋아요',
    message: `${likerUserName}님이 회원님의 댓글을 좋아합니다.`,
    summary: `${likerUserName}님이 댓글에 좋아요를 눌렀습니다`,
    relatedPostId: postId,
    relatedCommentId: commentId,
    relatedUserId: likerUserId,
    relatedUserName: likerUserName,
    actionUrl: `/community/${postId}#comment-${commentId}`,
    groupKey: `comment_like_${commentId}`
  })
}

/**
 * 새 댓글 알림 생성
 */
export async function createNewCommentNotification(
  postId: string,
  postTitle: string,
  postAuthorId: string,
  commenterId: string,
  commenterName: string
): Promise<void> {
  if (postAuthorId === commenterId) return

  await createNotificationAction({
    recipientId: postAuthorId,
    type: 'new_comment',
    title: '새 댓글',
    message: `${commenterName}님이 회원님의 게시글에 댓글을 남겼습니다.`,
    summary: `${commenterName}님이 댓글을 남겼습니다`,
    relatedPostId: postId,
    relatedUserId: commenterId,
    relatedUserName: commenterName,
    actionUrl: `/community/${postId}`,
    priority: 'normal'
  })
}

/**
 * 댓글 답글 알림 생성
 */
export async function createCommentReplyNotification(
  postId: string,
  parentCommentId: string,
  parentCommentAuthorId: string,
  replierUserId: string,
  replierUserName: string
): Promise<void> {
  if (parentCommentAuthorId === replierUserId) return

  await createNotificationAction({
    recipientId: parentCommentAuthorId,
    type: 'comment_reply',
    title: '댓글 답글',
    message: `${replierUserName}님이 회원님의 댓글에 답글을 남겼습니다.`,
    summary: `${replierUserName}님이 답글을 남겼습니다`,
    relatedPostId: postId,
    relatedCommentId: parentCommentId,
    relatedUserId: replierUserId,
    relatedUserName: replierUserName,
    actionUrl: `/community/${postId}#comment-${parentCommentId}`,
    priority: 'normal'
  })
}

/**
 * 댓글 알림 생성 (통합 함수)
 */
export async function createNotificationForComment(data: {
  postId: string
  postTitle: string
  postAuthorId: string
  commentId: string
  commentAuthorId: string
  commentAuthorName: string
  commentContent: string
  isReply: boolean
}): Promise<void> {
  if (data.isReply) {
    // 답글인 경우
    await createCommentReplyNotification(
      data.postId,
      data.commentId,
      data.postAuthorId,
      data.commentAuthorId,
      data.commentAuthorName
    )
  } else {
    // 새 댓글인 경우
    await createNewCommentNotification(
      data.postId,
      data.postTitle,
      data.postAuthorId,
      data.commentAuthorId,
      data.commentAuthorName
    )
  }
}

/**
 * 좋아요 알림 생성 (통합 함수)
 */
export async function createNotificationForLike(data: {
  targetType: 'post' | 'comment'
  targetId: string
  targetTitle: string
  targetAuthorId: string
  likeUserId: string
  likeUserName: string
  relatedPostId?: string
}): Promise<void> {
  if (data.targetType === 'post') {
    await createPostLikeNotification(
      data.targetId,
      data.targetTitle,
      data.targetAuthorId,
      data.likeUserId,
      data.likeUserName
    )
  } else {
    await createCommentLikeNotification(
      data.relatedPostId || data.targetId,
      data.targetId,
      data.targetAuthorId,
      data.likeUserId,
      data.likeUserName
    )
  }
}