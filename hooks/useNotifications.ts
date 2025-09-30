'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  type Unsubscribe
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth/context'
import type {
  Notification,
  NotificationCounts,
  NotificationFilters,
  NotificationEvent
} from '@/lib/types/notification'
import {
  getUserNotificationsAction,
  getNotificationCountsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  deleteNotificationAction
} from '@/lib/actions/notifications'

interface UseNotificationsOptions {
  realtime?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseNotificationsReturn {
  notifications: Notification[]
  counts: NotificationCounts | null
  loading: boolean
  error: string | null

  // Actions
  refresh: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<boolean>
  markAllAsRead: () => Promise<boolean>
  deleteNotification: (notificationId: string) => Promise<boolean>

  // Filters
  applyFilters: (filters: NotificationFilters) => Promise<void>
  clearFilters: () => Promise<void>
  currentFilters: NotificationFilters
}

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { user } = useAuth()
  const {
    realtime = true,
    autoRefresh = false,
    refreshInterval = 30000 // 30초
  } = options

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [counts, setCounts] = useState<NotificationCounts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentFilters, setCurrentFilters] = useState<NotificationFilters>({})

  // 알림 목록 로드
  const loadNotifications = useCallback(async (filters?: NotificationFilters) => {
    if (!user) {
      setNotifications([])
      setCounts(null)
      setLoading(false)
      return
    }

    try {
      setError(null)

      // 알림 목록과 카운터를 병렬로 조회
      const [notificationsResult, countsResult] = await Promise.all([
        getUserNotificationsAction(filters),
        getNotificationCountsAction()
      ])

      if (notificationsResult.success && notificationsResult.data) {
        setNotifications(notificationsResult.data.notifications)
      } else {
        setError(notificationsResult.error || '알림 목록을 불러올 수 없습니다.')
      }

      if (countsResult.success && countsResult.counts) {
        setCounts(countsResult.counts)
      }

    } catch (err) {
      console.error('Error loading notifications:', err)
      setError('알림을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [user])

  // 실시간 구독 설정
  useEffect(() => {
    if (!user || !realtime) return

    let unsubscribeNotifications: Unsubscribe | null = null
    let unsubscribeCounts: Unsubscribe | null = null

    // 알림 목록 실시간 구독
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.id),
      where('status', '!=', 'deleted'),
      orderBy('status'),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    unsubscribeNotifications = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const updatedNotifications = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Notification[]

        setNotifications(updatedNotifications)
        setError(null)
      },
      (error) => {
        console.error('Error in notifications subscription:', error)
        setError('실시간 알림 업데이트에 오류가 발생했습니다.')
      }
    )

    // 카운터 실시간 구독
    const counterDoc = doc(db, 'notification_counters', user.id)
    unsubscribeCounts = onSnapshot(
      counterDoc,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          setCounts({
            total: data.total || 0,
            unread: data.unread || 0,
            byType: data.byType || {},
            byPriority: data.byPriority || {
              low: 0,
              normal: 0,
              high: 0,
              urgent: 0
            }
          })
        } else {
          setCounts({
            total: 0,
            unread: 0,
            byType: {
              post_like: 0,
              comment_like: 0,
              new_comment: 0,
              comment_reply: 0,
              post_mention: 0,
              comment_mention: 0,
              event_reminder: 0,
              marketplace_inquiry: 0,
              report_status: 0
            },
            byPriority: {
              low: 0,
              normal: 0,
              high: 0,
              urgent: 0
            }
          })
        }
      },
      (error) => {
        console.error('Error in counter subscription:', error)
      }
    )

    return () => {
      if (unsubscribeNotifications) unsubscribeNotifications()
      if (unsubscribeCounts) unsubscribeCounts()
    }
  }, [user, realtime])

  // 자동 새로고침 설정
  useEffect(() => {
    if (!autoRefresh || realtime) return

    const interval = setInterval(() => {
      loadNotifications(currentFilters)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, realtime, refreshInterval, loadNotifications, currentFilters])

  // 초기 로드
  useEffect(() => {
    if (!realtime) {
      loadNotifications(currentFilters)
    }
  }, [user, realtime, loadNotifications, currentFilters])

  // 수동 새로고침
  const refresh = useCallback(async () => {
    setLoading(true)
    await loadNotifications(currentFilters)
  }, [loadNotifications, currentFilters])

  // 읽음 처리
  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const result = await markNotificationAsReadAction(notificationId)

      if (result.success) {
        // 로컬 상태 업데이트 (실시간 구독이 있어도 즉시 반영)
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId
              ? { ...n, isRead: true, readAt: new Date() as any }
              : n
          )
        )

        // 카운터 업데이트
        setCounts(prev => prev ? {
          ...prev,
          unread: Math.max(0, prev.unread - 1)
        } : null)

        return true
      } else {
        setError(result.error || '알림 읽음 처리에 실패했습니다.')
        return false
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
      setError('알림 읽음 처리 중 오류가 발생했습니다.')
      return false
    }
  }, [])

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const result = await markAllNotificationsAsReadAction()

      if (result.success) {
        // 로컬 상태 업데이트
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true, readAt: new Date() as any }))
        )

        setCounts(prev => prev ? { ...prev, unread: 0 } : null)
        return true
      } else {
        setError(result.error || '모든 알림 읽음 처리에 실패했습니다.')
        return false
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      setError('모든 알림 읽음 처리 중 오류가 발생했습니다.')
      return false
    }
  }, [])

  // 알림 삭제
  const deleteNotification = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const result = await deleteNotificationAction(notificationId)

      if (result.success) {
        // 로컬 상태에서 제거
        setNotifications(prev => prev.filter(n => n.id !== notificationId))

        return true
      } else {
        setError(result.error || '알림 삭제에 실패했습니다.')
        return false
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
      setError('알림 삭제 중 오류가 발생했습니다.')
      return false
    }
  }, [])

  // 필터 적용
  const applyFilters = useCallback(async (filters: NotificationFilters) => {
    setCurrentFilters(filters)
    setLoading(true)
    await loadNotifications(filters)
  }, [loadNotifications])

  // 필터 초기화
  const clearFilters = useCallback(async () => {
    setCurrentFilters({})
    setLoading(true)
    await loadNotifications({})
  }, [loadNotifications])

  return {
    notifications,
    counts,
    loading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    applyFilters,
    clearFilters,
    currentFilters
  }
}

// 읽지 않은 알림 수만 필요한 경우를 위한 경량 훅
export function useNotificationCounts() {
  const { user } = useAuth()
  const [counts, setCounts] = useState<NotificationCounts | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setCounts(null)
      setLoading(false)
      return
    }

    // 카운터 실시간 구독
    const counterDoc = doc(db, 'notification_counters', user.id)
    const unsubscribe = onSnapshot(
      counterDoc,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          setCounts({
            total: data.total || 0,
            unread: data.unread || 0,
            byType: data.byType || {},
            byPriority: data.byPriority || {
              low: 0,
              normal: 0,
              high: 0,
              urgent: 0
            }
          })
        } else {
          setCounts({
            total: 0,
            unread: 0,
            byType: {
              post_like: 0,
              comment_like: 0,
              new_comment: 0,
              comment_reply: 0,
              post_mention: 0,
              comment_mention: 0,
              event_reminder: 0,
              marketplace_inquiry: 0,
              report_status: 0
            },
            byPriority: {
              low: 0,
              normal: 0,
              high: 0,
              urgent: 0
            }
          })
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error in counter subscription:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  return { counts, loading }
}