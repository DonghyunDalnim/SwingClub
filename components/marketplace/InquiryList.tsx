'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, Typography, Button } from '@/components/core'
import { Container, Section } from '@/components/layout'
import { StatusBadge } from './StatusBadge'
import { MessageCircle, ShoppingBag, Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { theme } from '@/lib/theme'
import type { ItemInquiry, InquirySearchFilters } from '@/lib/types/marketplace'
import { getUserInquiriesAction } from '@/lib/actions/marketplace'

interface InquiryListProps {
  currentUserId: string
  filters?: InquirySearchFilters
  className?: string
}

export function InquiryList({ currentUserId, filters, className }: InquiryListProps) {
  const [inquiries, setInquiries] = useState<ItemInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'buyer' | 'seller'>('all')

  // 문의 목록 로드
  const loadInquiries = async () => {
    setLoading(true)
    try {
      const appliedFilters: InquirySearchFilters = {
        ...filters,
        userType: activeTab === 'all' ? undefined : activeTab
      }

      const result = await getUserInquiriesAction(appliedFilters)
      if (result.success && result.data) {
        setInquiries(result.data.inquiries)
      } else {
        console.error('Failed to load inquiries:', result.error)
        setInquiries([])
      }
    } catch (error) {
      console.error('Error loading inquiries:', error)
      setInquiries([])
    } finally {
      setLoading(false)
    }
  }

  // 시간 포맷팅
  const formatTime = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    return date.toLocaleDateString('ko-KR')
  }

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  // 읽지 않은 메시지 확인
  const hasUnreadMessages = (inquiry: ItemInquiry) => {
    const userType = inquiry.buyerId === currentUserId ? 'buyer' : 'seller'
    const lastReadField = userType === 'buyer' ? 'buyerLastRead' : 'sellerLastRead'
    const lastRead = inquiry[lastReadField]

    if (!lastRead) return inquiry.messageCount > 0
    return inquiry.lastMessageAt.toMillis() > lastRead.toMillis()
  }

  useEffect(() => {
    loadInquiries()
  }, [currentUserId, activeTab, filters])

  const tabs = [
    { key: 'all' as const, label: '전체', icon: MessageCircle },
    { key: 'buyer' as const, label: '구매 문의', icon: ShoppingBag },
    { key: 'seller' as const, label: '판매 문의', icon: User }
  ]

  return (
    <Container size="lg" className={className}>
      <Section spacing="md">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <Typography variant="h4" className="font-bold">
            거래 문의
          </Typography>
          <Button
            onClick={loadInquiries}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            {loading ? '새로고침 중...' : '새로고침'}
          </Button>
        </div>

        {/* 탭 */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors',
                  isActive
                    ? 'border-[#693BF2] text-[#693BF2] font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* 문의 목록 */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                    <div className="w-16 h-6 bg-gray-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : inquiries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <Typography variant="h4" color="neutral" className="mb-2">
                문의가 없습니다
              </Typography>
              <Typography variant="body" color="neutral">
                {activeTab === 'buyer'
                  ? '아직 구매 문의를 보낸 적이 없습니다.'
                  : activeTab === 'seller'
                  ? '아직 받은 판매 문의가 없습니다.'
                  : '아직 거래 문의가 없습니다.'}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => {
              const userType = inquiry.buyerId === currentUserId ? 'buyer' : 'seller'
              const otherUserName = userType === 'buyer' ? inquiry.sellerName : inquiry.buyerName
              const unread = hasUnreadMessages(inquiry)

              return (
                <Link key={inquiry.id} href={`/marketplace/inquiry/${inquiry.id}`}>
                  <Card className={cn(
                    'hover:shadow-lg transition-all duration-200 cursor-pointer',
                    unread && 'ring-2 ring-[#693BF2] ring-opacity-20'
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        {/* 상품 이미지 영역 (플레이스홀더) */}
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-gray-400" aria-hidden="true" />
                        </div>

                        {/* 문의 정보 */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center space-x-2">
                            <Typography
                              variant="h4"
                              className={cn(
                                'truncate',
                                unread && 'font-bold'
                              )}
                            >
                              {inquiry.itemTitle}
                            </Typography>
                            <StatusBadge
                              status={inquiry.itemStatus}
                              type="item"
                              size="sm"
                            />
                            {unread && (
                              <div className="w-2 h-2 bg-[#693BF2] rounded-full" />
                            )}
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <User className="h-3 w-3" aria-hidden="true" />
                              <span>{otherUserName}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              <span>{formatTime(inquiry.lastMessageAt)}</span>
                            </span>
                          </div>

                          <Typography
                            variant="body"
                            color="neutral"
                            className={cn(
                              'truncate',
                              unread && 'font-medium'
                            )}
                          >
                            {inquiry.lastMessageSender === userType ? '나: ' : ''}
                            {inquiry.lastMessageContent}
                          </Typography>
                        </div>

                        {/* 우측 정보 */}
                        <div className="text-right space-y-2">
                          <StatusBadge
                            status={inquiry.status}
                            type="inquiry"
                            size="sm"
                          />
                          <Typography variant="small" color="neutral">
                            {formatPrice(inquiry.itemPrice)}
                          </Typography>
                          <div className="flex items-center justify-end space-x-1 text-xs text-gray-500">
                            <MessageCircle className="h-3 w-3" aria-hidden="true" />
                            <span>{inquiry.messageCount}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </Section>
    </Container>
  )
}

export default InquiryList