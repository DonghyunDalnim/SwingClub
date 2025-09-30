'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useEscapeKey } from '@/lib/accessibility'
import { ko } from 'date-fns/locale'
import {
  Bell,
  BellRing,
  Heart,
  MessageCircle,
  CheckCircle,
  Trash2,
  Filter,
  MoreHorizontal
} from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/core/Button'
import { Badge } from '@/components/core/Badge'
import Typography from '@/components/core/Typography'
import { Card, CardContent, CardHeader } from '@/components/core/Card'
import { Container, Section } from '@/components/layout'
import type { Notification, NotificationFilters } from '@/lib/types/notification'
import { NOTIFICATION_TYPE_LABELS } from '@/lib/types/notification'

export default function NotificationsPage() {
  const { user } = useAuth()
  const {
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
  } = useNotifications({ realtime: true })

  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showActions, setShowActions] = useState<string | null>(null)

  // 페이지 진입 시 페이지 제목 업데이트
  useEffect(() => {
    document.title = `알림 ${counts?.unread ? `(${counts.unread})` : ''} - SwingConnect`
  }, [counts?.unread])

  // 알림 아이콘 렌더링
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'post_like':
      case 'comment_like':
        return <Heart className="h-5 w-5 text-red-500" fill="currentColor" />
      case 'new_comment':
      case 'comment_reply':
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case 'post_mention':
      case 'comment_mention':
        return <Bell className="h-5 w-5 text-purple-500" />
      case 'event_reminder':
        return <Bell className="h-5 w-5 text-green-500" />
      case 'marketplace_inquiry':
        return <MessageCircle className="h-5 w-5 text-orange-500" />
      case 'report_status':
        return <CheckCircle className="h-5 w-5 text-gray-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  // 알림 클릭 처리
  const handleNotificationClick = async (notification: Notification) => {
    // 읽지 않은 알림이면 읽음 처리
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }

    // 액션 URL이 있으면 이동
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  // 선택된 알림들 읽음 처리
  const handleMarkSelectedAsRead = async () => {
    const promises = selectedNotifications.map(id => markAsRead(id))
    await Promise.all(promises)
    setSelectedNotifications([])
  }

  // 선택된 알림들 삭제
  const handleDeleteSelected = async () => {
    const promises = selectedNotifications.map(id => deleteNotification(id))
    await Promise.all(promises)
    setSelectedNotifications([])
  }

  // 필터 적용
  const handleApplyFilters = (filters: NotificationFilters) => {
    applyFilters(filters)
    setShowFilters(false)
  }

  if (loading) {
    return (
      <Container>
        <Section>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>
      </Container>
    )
  }

  return (
    <Container>
      <Section spacing="lg">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Typography variant="h1" className="text-2xl font-bold text-gray-900">
              알림
            </Typography>
            {counts && (
              <Typography variant="small" className="text-gray-600 mt-1">
                전체 {counts.total}개 • 읽지 않음 {counts.unread}개
              </Typography>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* 필터 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              필터
            </Button>

            {/* 모두 읽음 처리 */}
            {counts && counts.unread > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                모두 읽음
              </Button>
            )}

            {/* 새로고침 */}
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="flex items-center gap-2"
            >
              새로고침
            </Button>
          </div>
        </div>

        {/* 필터 영역 */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <Typography variant="h4">알림 필터</Typography>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 알림 타입 필터 */}
                <div>
                  <Typography variant="small" className="font-medium mb-2">
                    알림 유형
                  </Typography>
                  <div className="space-y-2">
                    {Object.entries(NOTIFICATION_TYPE_LABELS).map(([type, label]) => (
                      <label key={type} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={currentFilters.types?.includes(type as any) || false}
                          onChange={(e) => {
                            const types = currentFilters.types || []
                            if (e.target.checked) {
                              handleApplyFilters({
                                ...currentFilters,
                                types: [...types, type as any]
                              })
                            } else {
                              handleApplyFilters({
                                ...currentFilters,
                                types: types.filter(t => t !== type)
                              })
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 읽음 상태 필터 */}
                <div>
                  <Typography variant="small" className="font-medium mb-2">
                    읽음 상태
                  </Typography>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="readStatus"
                        checked={currentFilters.isRead === undefined}
                        onChange={() => handleApplyFilters({
                          ...currentFilters,
                          isRead: undefined
                        })}
                        className="border-gray-300"
                      />
                      전체
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="readStatus"
                        checked={currentFilters.isRead === false}
                        onChange={() => handleApplyFilters({
                          ...currentFilters,
                          isRead: false
                        })}
                        className="border-gray-300"
                      />
                      읽지 않음
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="readStatus"
                        checked={currentFilters.isRead === true}
                        onChange={() => handleApplyFilters({
                          ...currentFilters,
                          isRead: true
                        })}
                        className="border-gray-300"
                      />
                      읽음
                    </label>
                  </div>
                </div>

                {/* 필터 액션 */}
                <div className="flex flex-col justify-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mb-2"
                  >
                    필터 초기화
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 선택된 알림 액션 */}
        {selectedNotifications.length > 0 && (
          <Card className="mb-6 bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Typography variant="small" className="text-purple-700">
                  {selectedNotifications.length}개 알림 선택됨
                </Typography>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkSelectedAsRead}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    읽음 처리
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 에러 메시지 */}
        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="p-4">
              <Typography variant="small" className="text-red-700">
                {error}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* 알림 목록 */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <Typography variant="h4" className="text-gray-500 mb-2">
                  알림이 없습니다
                </Typography>
                <Typography variant="small" className="text-gray-400">
                  새로운 활동이 있으면 여기에 알림이 표시됩니다.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`
                  cursor-pointer transition-all duration-200 hover:shadow-md
                  ${!notification.isRead ? 'bg-purple-50 border-purple-200' : 'bg-white'}
                  ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-purple-300' : ''}
                `}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* 선택 체크박스 */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        if (e.target.checked) {
                          setSelectedNotifications([...selectedNotifications, notification.id])
                        } else {
                          setSelectedNotifications(selectedNotifications.filter(id => id !== notification.id))
                        }
                      }}
                      className="mt-1 rounded border-gray-300"
                    />

                    {/* 알림 아이콘 */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* 알림 내용 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Typography
                            variant="body"
                            className={`
                              ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}
                            `}
                          >
                            {notification.title}
                          </Typography>
                          <Typography
                            variant="small"
                            className="text-gray-600 mt-1 line-clamp-2"
                          >
                            {notification.message}
                          </Typography>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {NOTIFICATION_TYPE_LABELS[notification.type]}
                            </Badge>
                            <Typography variant="small" className="text-gray-500">
                              {formatDistanceToNow(notification.createdAt.toDate(), {
                                addSuffix: true,
                                locale: ko
                              })}
                            </Typography>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full" />
                            )}
                          </div>
                        </div>

                        {/* 액션 메뉴 */}
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowActions(showActions === notification.id ? null : notification.id)
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>

                          {showActions === notification.id && (
                            <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                              {!notification.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    markAsRead(notification.id)
                                    setShowActions(null)
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  읽음 처리
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.id)
                                  setShowActions(null)
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                삭제
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 더 많은 알림 로드 (추후 무한 스크롤 구현) */}
        {notifications.length > 0 && notifications.length % 20 === 0 && (
          <div className="text-center pt-6">
            <Button variant="outline" onClick={refresh}>
              더 많은 알림 보기
            </Button>
          </div>
        )}
      </Section>

      {/* 외부 클릭으로 액션 메뉴 닫기 */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(null)}
        />
      )}
    </Container>
  )
}