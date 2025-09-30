'use client'

import { useState, useEffect, useRef } from 'react'
import { Button, Typography } from '@/components/core'
import { Container, Section } from '@/components/layout'
import { StatusBadge } from './StatusBadge'
import { Send, ShoppingBag, Clock, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { theme } from '@/lib/theme'
import type { ItemInquiry, InquiryMessage, CreateMessageData } from '@/lib/types/marketplace'
import {
  sendInquiryMessageAction,
  getInquiryMessagesAction,
  updateInquiryStatusAction
} from '@/lib/actions/marketplace'

interface InquiryChatProps {
  inquiryId: string
  currentUserId: string
  className?: string
}

export function InquiryChat({ inquiryId, currentUserId, className }: InquiryChatProps) {
  const [inquiry, setInquiry] = useState<ItemInquiry | null>(null)
  const [messages, setMessages] = useState<InquiryMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [isOfferMode, setIsOfferMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 메시지 목록과 문의 정보 로드
  const loadMessages = async () => {
    try {
      const result = await getInquiryMessagesAction(inquiryId)
      if (result.success && result.data) {
        setInquiry(result.data.inquiry)
        setMessages(result.data.messages)
      } else {
        console.error('Failed to load messages:', result.error)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!newMessage.trim() && !isOfferMode) return
    if (isOfferMode && (!offerPrice || parseFloat(offerPrice) <= 0)) return

    setSending(true)
    try {
      const messageData: CreateMessageData = {
        inquiryId,
        content: isOfferMode ? `가격 제안: ${formatPrice(parseFloat(offerPrice))}` : newMessage.trim(),
        messageType: isOfferMode ? 'offer' : 'text',
        offerPrice: isOfferMode ? parseFloat(offerPrice) : undefined
      }

      const result = await sendInquiryMessageAction(messageData)
      if (result.success) {
        // 메시지 목록 새로고침
        await loadMessages()
        setNewMessage('')
        setOfferPrice('')
        setIsOfferMode(false)
      } else {
        alert(result.error || '메시지 전송에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('메시지 전송 중 오류가 발생했습니다.')
    } finally {
      setSending(false)
    }
  }

  // 거래 완료 처리
  const handleCompleteTransaction = async () => {
    if (!inquiry) return

    const finalPrice = window.prompt('최종 거래 가격을 입력해주세요:', inquiry.itemPrice.toString())
    if (!finalPrice || parseFloat(finalPrice) <= 0) return

    try {
      const result = await updateInquiryStatusAction(inquiryId, {
        status: 'completed',
        finalPrice: parseFloat(finalPrice)
      })

      if (result.success) {
        await loadMessages()
        alert('거래가 완료되었습니다!')
      } else {
        alert(result.error || '거래 완료 처리에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error completing transaction:', error)
      alert('거래 완료 처리 중 오류가 발생했습니다.')
    }
  }

  // 문의 취소
  const handleCancelInquiry = async () => {
    if (!confirm('정말 문의를 취소하시겠습니까?')) return

    try {
      const result = await updateInquiryStatusAction(inquiryId, {
        status: 'cancelled'
      })

      if (result.success) {
        await loadMessages()
        alert('문의가 취소되었습니다.')
      } else {
        alert(result.error || '문의 취소에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error cancelling inquiry:', error)
      alert('문의 취소 중 오류가 발생했습니다.')
    }
  }

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  // 시간 포맷팅
  const formatTime = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 메시지 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 현재 사용자 타입 확인
  const getCurrentUserType = () => {
    if (!inquiry) return null
    return inquiry.buyerId === currentUserId ? 'buyer' : 'seller'
  }

  useEffect(() => {
    loadMessages()
  }, [inquiryId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (loading) {
    return (
      <Container size="md" className={className}>
        <Section spacing="md">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Section>
      </Container>
    )
  }

  if (!inquiry) {
    return (
      <Container size="md" className={className}>
        <Section spacing="md">
          <div className="text-center py-8">
            <Typography variant="body" color="neutral">
              문의를 찾을 수 없습니다.
            </Typography>
          </div>
        </Section>
      </Container>
    )
  }

  const userType = getCurrentUserType()
  const canCompleteTransaction = inquiry.status === 'active' && userType === 'seller'
  const canSendMessages = inquiry.status === 'active'

  return (
    <Container size="md" className={cn('h-full flex flex-col', className)}>
      {/* 문의 헤더 */}
      <Section spacing="sm" background="white" className="border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-gray-500" aria-hidden="true" />
              <Typography variant="h4" className="truncate max-w-xs">
                {inquiry.itemTitle}
              </Typography>
            </div>
            <StatusBadge
              status={inquiry.status}
              type="inquiry"
              size="sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Typography variant="small" color="neutral">
              {formatPrice(inquiry.itemPrice)}
            </Typography>
            {canCompleteTransaction && (
              <Button
                size="sm"
                onClick={handleCompleteTransaction}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                거래완료
              </Button>
            )}
            {inquiry.status === 'active' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelInquiry}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                취소
              </Button>
            )}
          </div>
        </div>
      </Section>

      {/* 메시지 목록 */}
      <Section spacing="none" className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          {messages.map((message) => {
            const isMyMessage = message.senderId === currentUserId
            const isOffer = message.messageType === 'offer'

            return (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  isMyMessage ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-xs lg:max-w-md rounded-lg px-4 py-2 shadow-sm',
                    isMyMessage
                      ? 'bg-[#693BF2] text-white'
                      : 'bg-gray-100 text-gray-900',
                    isOffer && 'border-2 border-yellow-400'
                  )}
                >
                  {/* 메시지 유형 표시 */}
                  {isOffer && (
                    <div className={cn(
                      'flex items-center space-x-1 mb-1',
                      isMyMessage ? 'text-yellow-200' : 'text-yellow-600'
                    )}>
                      <DollarSign className="h-4 w-4" aria-hidden="true" />
                      <Typography variant="small" className="font-medium">
                        가격 제안
                      </Typography>
                    </div>
                  )}

                  {/* 메시지 내용 */}
                  <Typography variant="body" className="whitespace-pre-wrap">
                    {message.content}
                  </Typography>

                  {/* 시간 표시 */}
                  <div className={cn(
                    'flex items-center mt-1',
                    isMyMessage ? 'justify-end' : 'justify-start'
                  )}>
                    <Typography
                      variant="small"
                      className={cn(
                        'flex items-center space-x-1',
                        isMyMessage ? 'text-white/70' : 'text-gray-500'
                      )}
                    >
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      <span>{formatTime(message.createdAt)}</span>
                    </Typography>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </Section>

      {/* 메시지 입력 */}
      {canSendMessages && (
        <Section spacing="sm" background="white" className="border-t border-gray-200 flex-shrink-0">
          <div className="space-y-3">
            {/* 가격 제안 모드 토글 */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={isOfferMode ? "default" : "outline"}
                onClick={() => setIsOfferMode(!isOfferMode)}
                className={isOfferMode ? "bg-yellow-500 hover:bg-yellow-600" : ""}
              >
                <DollarSign className="h-4 w-4 mr-1" aria-hidden="true" />
                가격 제안
              </Button>
              {isOfferMode && (
                <Typography variant="small" color="neutral">
                  가격을 제안해보세요
                </Typography>
              )}
            </div>

            {/* 입력 영역 */}
            <div className="flex space-x-2">
              {isOfferMode ? (
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="제안 가격을 입력하세요"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#693BF2] focus:border-transparent"
                  min="0"
                  step="1000"
                />
              ) : (
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#693BF2] focus:border-transparent resize-none"
                  rows={1}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
              )}

              <Button
                onClick={handleSendMessage}
                disabled={sending || (!newMessage.trim() && !isOfferMode) || (isOfferMode && !offerPrice)}
                style={{ backgroundColor: theme.colors.primary.main }}
                className="text-white hover:opacity-90"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </Section>
      )}

      {/* 종료된 문의 메시지 */}
      {!canSendMessages && (
        <Section spacing="sm" background="gray" className="flex-shrink-0">
          <div className="text-center">
            <Typography variant="body" color="neutral">
              {inquiry.status === 'completed'
                ? '거래가 완료되었습니다.'
                : inquiry.status === 'cancelled'
                ? '문의가 취소되었습니다.'
                : '문의가 종료되었습니다.'}
            </Typography>
            {inquiry.status === 'completed' && inquiry.finalPrice && (
              <Typography variant="small" color="neutral" className="mt-1">
                최종 거래가: {formatPrice(inquiry.finalPrice)}
              </Typography>
            )}
          </div>
        </Section>
      )}
    </Container>
  )
}

export default InquiryChat