'use client'

import { useState } from 'react'
import { Button, Typography } from '@/components/core'
import { MessageCircle, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { theme } from '@/lib/theme'
import type { CreateInquiryData } from '@/lib/types/marketplace'
import { createInquiryAction } from '@/lib/actions/marketplace'

interface InquiryButtonProps {
  itemId: string
  itemTitle: string
  sellerId: string
  currentUserId?: string
  onInquiryCreated?: (inquiryId: string) => void
  className?: string
  variant?: 'default' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
}

export function InquiryButton({
  itemId,
  itemTitle,
  sellerId,
  currentUserId,
  onInquiryCreated,
  className,
  variant = 'default',
  size = 'md',
  children
}: InquiryButtonProps) {
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // 문의 시작
  const handleCreateInquiry = async () => {
    if (!currentUserId) {
      alert('로그인이 필요합니다.')
      return
    }

    if (sellerId === currentUserId) {
      alert('자신의 상품에는 문의할 수 없습니다.')
      return
    }

    if (!message.trim()) {
      alert('문의 내용을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const inquiryData: CreateInquiryData = {
        itemId,
        initialMessage: message.trim()
      }

      const result = await createInquiryAction(inquiryData)
      if (result.success && result.inquiryId) {
        setShowForm(false)
        setMessage('')
        if (onInquiryCreated) {
          onInquiryCreated(result.inquiryId)
        } else {
          alert('문의가 성공적으로 전송되었습니다!')
        }
      } else {
        alert(result.error || '문의 전송에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error creating inquiry:', error)
      alert('문의 전송 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 로그인하지 않은 사용자
  if (!currentUserId) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => alert('로그인이 필요합니다.')}
      >
        <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
        {children || '문의하기'}
      </Button>
    )
  }

  // 자신의 상품인 경우
  if (sellerId === currentUserId) {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn('cursor-not-allowed opacity-50', className)}
        disabled
      >
        <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
        내 상품
      </Button>
    )
  }

  return (
    <div className="space-y-3">
      {/* 문의하기 버튼 */}
      {!showForm && (
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={() => setShowForm(true)}
          style={variant === 'default' ? { backgroundColor: theme.colors.primary.main } : undefined}
        >
          <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
          {children || '문의하기'}
        </Button>
      )}

      {/* 문의 작성 폼 */}
      {showForm && (
        <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <Typography variant="h4" className="font-medium">
              상품 문의
            </Typography>
            <button
              onClick={() => {
                setShowForm(false)
                setMessage('')
              }}
              className="text-gray-400 hover:text-gray-600"
              aria-label="문의 작성 취소"
            >
              ✕
            </button>
          </div>

          <Typography variant="body" color="neutral" className="mb-2">
            &quot;{itemTitle}&quot;에 대한 문의
          </Typography>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="문의 내용을 입력해주세요. 예: 상품 상태, 거래 방법, 가격 협의 등"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#693BF2] focus:border-transparent resize-none"
            rows={4}
            maxLength={1000}
          />

          <div className="flex items-center justify-between">
            <Typography variant="small" color="neutral">
              {message.length}/1000자
            </Typography>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowForm(false)
                  setMessage('')
                }}
                disabled={loading}
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleCreateInquiry}
                disabled={loading || !message.trim()}
                style={{ backgroundColor: theme.colors.primary.main }}
                className="text-white"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>전송 중...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="h-4 w-4" aria-hidden="true" />
                    <span>문의 전송</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InquiryButton