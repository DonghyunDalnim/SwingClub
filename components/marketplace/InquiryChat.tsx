'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/core'
import { Card, CardContent } from '@/components/core'
import { StatusBadge, StatusDescription, StatusChangeConfirm } from './StatusBadge'
import {
  ArrowLeft,
  Send,
  Image as ImageIcon,
  MoreVertical,
  Check,
  CheckCheck,
  Clock
} from 'lucide-react'
import {
  getInquiry,
  getInquiryMessages,
  sendInquiryMessage,
  markInquiryAsRead,
  updateInquiryStatus
} from '@/lib/actions/inquiry'
import type {
  ItemInquiry,
  InquiryMessage,
  CreateInquiryMessageData,
  InquiryStatus,
  InquiryMessageType
} from '@/lib/types/marketplace'
import { INQUIRY_MESSAGE_TYPE } from '@/lib/types/marketplace'

interface InquiryChatProps {
  inquiryId: string
  currentUserId?: string
}

export function InquiryChat({ inquiryId, currentUserId }: InquiryChatProps) {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [inquiry, setInquiry] = useState<ItemInquiry | null>(null)
  const [messages, setMessages] = useState<InquiryMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showStatusConfirm, setShowStatusConfirm] = useState<{
    show: boolean
    newStatus: InquiryStatus
  }>({ show: false, newStatus: 'active' })

  // 현재 사용자가 구매자인지 판매자인지 확인
  const isBuyer = inquiry?.buyerId === currentUserId
  const isSeller = inquiry?.sellerId === currentUserId
  const isOwner = isBuyer || isSeller

  // 문의 정보 로드
  const loadInquiry = useCallback(async () => {
    try {
      const result = await getInquiry(inquiryId)
      if (result.success && result.inquiry) {
        setInquiry(result.inquiry)
      } else {
        setError(result.error || '문의를 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('Failed to load inquiry:', error)
      setError('문의 로드 중 오류가 발생했습니다.')
    }
  }, [inquiryId])

  // 메시지 목록 로드
  const loadMessages = useCallback(async () => {
    try {
      const result = await getInquiryMessages(inquiryId)
      if (result.success && result.data) {
        setMessages(result.data.data)
      } else {
        setError(result.error || '메시지를 불러올 수 없습니다.')
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      setError('메시지 로드 중 오류가 발생했습니다.')
    }
  }, [inquiryId])

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([loadInquiry(), loadMessages()])
      setIsLoading(false)
    }

    loadData()
  }, [loadInquiry, loadMessages])

  // 읽음 처리
  useEffect(() => {
    if (inquiry && isOwner) {
      const hasUnread = isBuyer ? inquiry.unreadCount.buyer > 0 : inquiry.unreadCount.seller > 0
      if (hasUnread) {
        markInquiryAsRead(inquiryId).catch(console.error)
      }
    }
  }, [inquiry, inquiryId, isOwner, isBuyer])

  // 메시지 끝으로 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending || !inquiry) {
      return
    }

    if (inquiry.status !== 'active') {
      setError('진행중인 문의가 아닙니다.')
      return
    }

    setIsSending(true)
    setError(null)

    try {
      const messageData: CreateInquiryMessageData = {
        inquiryId,
        type: 'text',
        content: newMessage.trim()
      }

      const result = await sendInquiryMessage(messageData)

      if (result.success) {
        setNewMessage('')
        await loadMessages() // 메시지 새로고침
        await loadInquiry() // 문의 정보 새로고침 (미읽음 수 등)
      } else {
        setError(result.error || '메시지 전송에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setError('메시지 전송 중 오류가 발생했습니다.')
    } finally {
      setIsSending(false)
    }
  }

  // Enter 키로 메시지 전송
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 상태 변경
  const handleStatusChange = async (newStatus: InquiryStatus) => {
    if (!inquiry) return

    try {
      const result = await updateInquiryStatus(inquiryId, newStatus)
      if (result.success) {
        await loadInquiry()
        setShowStatusConfirm({ show: false, newStatus: 'active' })
      } else {
        setError(result.error || '상태 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      setError('상태 변경 중 오류가 발생했습니다.')
    }
  }

  // 메시지 시간 포맷팅
  const formatMessageTime = (timestamp: any) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return '방금'
    if (diffMinutes < 60) return `${diffMinutes}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`

    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 권한 확인
  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <Button onClick={() => router.push('/auth/login')}>
            로그인
          </Button>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error && !inquiry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>
            돌아가기
          </Button>
        </Card>
      </div>
    )
  }

  if (!inquiry || !isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 text-center max-w-md">
          <p className="text-gray-600 mb-4">문의를 볼 권한이 없습니다.</p>
          <Button onClick={() => router.back()}>
            돌아가기
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold">
                {isBuyer ? inquiry.sellerName : inquiry.buyerName}
              </h1>
              <p className="text-sm text-gray-600">
                {inquiry.itemTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <StatusBadge
              status={inquiry.status}
              showActions={true}
              onStatusChange={async (newStatus) => {
                setShowStatusConfirm({ show: true, newStatus })
              }}
              isOwner={isSeller}
            />
          </div>
        </div>
      </header>

      {/* 상품 정보 카드 */}
      <div className="p-4">
        <Link href={`/marketplace/${inquiry.itemId}`}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex space-x-3">
                {inquiry.itemImage && (
                  <div className="w-16 h-16 relative flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={inquiry.itemImage}
                      alt={inquiry.itemTitle}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{inquiry.itemTitle}</h3>
                  <p className="text-sm text-gray-600">상품 상세보기 →</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 상태 설명 */}
      {inquiry.status !== 'active' && (
        <div className="px-4 pb-4">
          <Card>
            <CardContent className="p-4">
              <StatusDescription status={inquiry.status} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === currentUserId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[75%] rounded-lg p-3 ${
                message.senderId === currentUserId
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border'
              }`}
            >
              {/* 메시지 내용 */}
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>

              {/* 가격 제안 */}
              {message.priceProposal && (
                <div className="mt-2 p-2 bg-black/10 rounded">
                  <p className="text-sm font-medium">💰 가격 제안</p>
                  <p className="text-lg font-bold">
                    {new Intl.NumberFormat('ko-KR').format(message.priceProposal.proposedPrice)}원
                  </p>
                  {message.priceProposal.message && (
                    <p className="text-sm mt-1">{message.priceProposal.message}</p>
                  )}
                </div>
              )}

              {/* 메시지 정보 */}
              <div
                className={`flex items-center justify-between mt-2 text-xs ${
                  message.senderId === currentUserId ? 'text-purple-100' : 'text-gray-500'
                }`}
              >
                <span>{formatMessageTime(message.createdAt)}</span>
                {message.senderId === currentUserId && (
                  <div className="flex items-center space-x-1">
                    {message.isRead ? (
                      <CheckCheck className="h-3 w-3" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="px-4 pb-2">
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}

      {/* 메시지 입력 */}
      {inquiry.status === 'active' && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={1}
                style={{
                  minHeight: '44px',
                  maxHeight: '120px',
                  height: 'auto'
                }}
                disabled={isSending}
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              className="h-11 px-4"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>Enter로 전송, Shift+Enter로 줄바꿈</span>
            <span>{newMessage.length}/1000</span>
          </div>
        </div>
      )}

      {/* 상태 변경 확인 모달 */}
      {showStatusConfirm.show && (
        <StatusChangeConfirm
          currentStatus={inquiry.status}
          newStatus={showStatusConfirm.newStatus}
          onConfirm={() => handleStatusChange(showStatusConfirm.newStatus)}
          onCancel={() => setShowStatusConfirm({ show: false, newStatus: 'active' })}
        />
      )}
    </div>
  )
}