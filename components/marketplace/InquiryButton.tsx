'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/core'
import { MessageCircle, Send, X } from 'lucide-react'
import { createInquiry } from '@/lib/actions/inquiry'
import type { CreateInquiryData } from '@/lib/types/marketplace'

interface InquiryButtonProps {
  itemId: string
  itemTitle: string
  sellerId: string
  currentUserId?: string
  disabled?: boolean
  hasActiveInquiry?: boolean
  existingInquiryId?: string
  className?: string
}

export function InquiryButton({
  itemId,
  itemTitle,
  sellerId,
  currentUserId,
  disabled = false,
  hasActiveInquiry = false,
  existingInquiryId,
  className = ""
}: InquiryButtonProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 로그인하지 않은 경우
  if (!currentUserId) {
    return (
      <Button
        variant="outline"
        className={`flex-1 ${className}`}
        onClick={() => router.push('/auth/login')}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        로그인 후 문의
      </Button>
    )
  }

  // 본인 상품인 경우
  if (currentUserId === sellerId) {
    return null
  }

  // 이미 진행중인 문의가 있는 경우
  if (hasActiveInquiry && existingInquiryId) {
    return (
      <Button
        variant="default"
        className={`flex-1 ${className}`}
        onClick={() => router.push(`/marketplace/${itemId}/inquiry/${existingInquiryId}`)}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        문의 확인
      </Button>
    )
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
    setMessage('')
    setError(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setMessage('')
    setError(null)
  }

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('문의 내용을 입력해주세요.')
      return
    }

    if (message.length > 1000) {
      setError('문의 내용은 1000자를 초과할 수 없습니다.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const inquiryData: CreateInquiryData = {
        itemId,
        message: message.trim()
      }

      const result = await createInquiry(inquiryData)

      if (result.success && result.inquiryId) {
        // 생성된 문의로 이동
        router.push(`/marketplace/${itemId}/inquiry/${result.inquiryId}`)
        setIsModalOpen(false)
      } else {
        setError(result.error || '문의 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to create inquiry:', error)
      setError('문의 생성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className={`flex-1 ${className}`}
        onClick={handleOpenModal}
        disabled={disabled}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        판매자 문의
      </Button>

      {/* 문의 작성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">판매자에게 문의하기</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseModal}
                className="p-1"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* 상품 정보 */}
            <div className="p-4 bg-gray-50 border-b">
              <p className="text-sm text-gray-600">문의 상품</p>
              <p className="font-medium truncate">{itemTitle}</p>
            </div>

            {/* 문의 내용 입력 */}
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                문의 내용
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="궁금한 점을 자유롭게 문의해주세요.&#10;(예: 상품 상태, 직거래 가능 여부, 할인 가능성 등)"
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  Ctrl+Enter로 전송
                </span>
                <span className={`text-xs ${
                  message.length > 1000 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {message.length}/1000
                </span>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <p className="text-sm text-red-600 mt-2">
                  {error}
                </p>
              )}

              {/* 안내 문구 */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600">
                  💡 문의 팁: 구체적인 질문일수록 빠른 답변을 받을 수 있어요!
                </p>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="flex space-x-3 p-4 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !message.trim()}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    전송중...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    문의하기
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// 문의 목록으로 이동하는 간단한 버튼 컴포넌트
interface ViewInquiriesButtonProps {
  itemId: string
  inquiryCount: number
  className?: string
}

export function ViewInquiriesButton({
  itemId,
  inquiryCount,
  className = ""
}: ViewInquiriesButtonProps) {
  const router = useRouter()

  if (inquiryCount === 0) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.push(`/marketplace/${itemId}/inquiries`)}
      className={`text-gray-600 hover:text-gray-800 ${className}`}
    >
      <MessageCircle className="h-4 w-4 mr-1" />
      문의 {inquiryCount}개
    </Button>
  )
}