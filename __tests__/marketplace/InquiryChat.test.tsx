/**
 * InquiryChat 컴포넌트 테스트
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { InquiryChat } from '@/components/marketplace/InquiryChat'
import type { ItemInquiry, InquiryMessage } from '@/lib/types/marketplace'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn()
  })
}))

jest.mock('@/lib/actions/inquiry', () => ({
  getInquiry: jest.fn(),
  getInquiryMessages: jest.fn(),
  sendInquiryMessage: jest.fn(),
  markInquiryAsRead: jest.fn(),
  updateInquiryStatus: jest.fn()
}))

jest.mock('@/components/core', () => ({
  Button: ({ children, onClick, disabled, className, variant, size }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      className={`button ${variant} ${size} ${className}`}
    >
      {children}
    </button>
  ),
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={`card ${className}`}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={`card-content ${className}`}>
      {children}
    </div>
  )
}))

jest.mock('@/components/marketplace/StatusBadge', () => ({
  StatusBadge: ({ status, showActions, onStatusChange, isOwner }: any) => (
    <div data-testid="status-badge">
      <span>Status: {status}</span>
      {showActions && isOwner && (
        <button onClick={() => onStatusChange('completed')}>Complete</button>
      )}
    </div>
  ),
  StatusDescription: ({ status }: any) => (
    <div data-testid="status-description">Status: {status}</div>
  ),
  StatusChangeConfirm: ({ currentStatus, newStatus, onConfirm, onCancel }: any) => (
    <div data-testid="status-confirm">
      <span>Change from {currentStatus} to {newStatus}</span>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  )
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}))

// Mock data
const mockInquiry: ItemInquiry = {
  id: 'inquiry123',
  itemId: 'item123',
  itemTitle: '테스트 상품',
  itemImage: 'test-image.jpg',
  buyerId: 'buyer123',
  buyerName: '구매자',
  sellerId: 'seller123',
  sellerName: '판매자',
  status: 'active',
  lastMessage: '안녕하세요',
  lastMessageAt: { toDate: () => new Date() } as any,
  lastSenderId: 'buyer123',
  buyerLastReadAt: { toDate: () => new Date() } as any,
  unreadCount: {
    buyer: 0,
    seller: 1
  },
  messageCount: 2,
  createdAt: { toDate: () => new Date() } as any,
  updatedAt: { toDate: () => new Date() } as any
}

const mockMessages: InquiryMessage[] = [
  {
    id: 'message1',
    inquiryId: 'inquiry123',
    senderId: 'buyer123',
    senderName: '구매자',
    senderType: 'buyer',
    type: 'text',
    content: '안녕하세요. 이 상품 구매하고 싶습니다.',
    isRead: true,
    createdAt: { toDate: () => new Date(Date.now() - 86400000) } as any, // 1일 전
    updatedAt: { toDate: () => new Date(Date.now() - 86400000) } as any
  },
  {
    id: 'message2',
    inquiryId: 'inquiry123',
    senderId: 'seller123',
    senderName: '판매자',
    senderType: 'seller',
    type: 'text',
    content: '네, 가능합니다. 언제 만나실까요?',
    isRead: false,
    createdAt: { toDate: () => new Date() } as any,
    updatedAt: { toDate: () => new Date() } as any
  }
]

describe('InquiryChat', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock router
    const { useRouter } = require('next/navigation')
    useRouter.mockReturnValue(mockRouter)
  })

  describe('인증 및 권한', () => {
    it('로그인하지 않은 경우 로그인 요구 메시지를 표시해야 함', () => {
      render(<InquiryChat inquiryId="inquiry123" />)

      expect(screen.getByText('로그인이 필요합니다.')).toBeInTheDocument()
      expect(screen.getByText('로그인')).toBeInTheDocument()
    })

    it('로그인 버튼 클릭 시 로그인 페이지로 이동해야 함', () => {
      render(<InquiryChat inquiryId="inquiry123" />)

      const loginButton = screen.getByText('로그인')
      fireEvent.click(loginButton)

      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
    })

    it('권한이 없는 사용자는 접근할 수 없어야 함', async () => {
      const { getInquiry } = require('@/lib/actions/inquiry')
      getInquiry.mockResolvedValue({
        success: true,
        inquiry: mockInquiry
      })

      render(<InquiryChat inquiryId="inquiry123" currentUserId="other123" />)

      await waitFor(() => {
        expect(screen.getByText('문의를 볼 권한이 없습니다.')).toBeInTheDocument()
      })
    })
  })

  describe('데이터 로딩', () => {
    it('로딩 중일 때 로딩 표시를 해야 함', () => {
      const { getInquiry, getInquiryMessages } = require('@/lib/actions/inquiry')
      getInquiry.mockImplementation(() => new Promise(() => {})) // 무한 대기
      getInquiryMessages.mockImplementation(() => new Promise(() => {}))

      render(<InquiryChat inquiryId="inquiry123" currentUserId="buyer123" />)

      expect(screen.getByText('로딩 중...')).toBeInTheDocument()
    })

    it('문의 정보 로드 실패 시 에러 메시지를 표시해야 함', async () => {
      const { getInquiry } = require('@/lib/actions/inquiry')
      getInquiry.mockResolvedValue({
        success: false,
        error: '문의를 찾을 수 없습니다.'
      })

      render(<InquiryChat inquiryId="inquiry123" currentUserId="buyer123" />)

      await waitFor(() => {
        expect(screen.getByText('문의를 찾을 수 없습니다.')).toBeInTheDocument()
      })
    })

    it('문의와 메시지를 성공적으로 로드해야 함', async () => {
      const { getInquiry, getInquiryMessages } = require('@/lib/actions/inquiry')

      getInquiry.mockResolvedValue({
        success: true,
        inquiry: mockInquiry
      })

      getInquiryMessages.mockResolvedValue({
        success: true,
        data: { data: mockMessages }
      })

      render(<InquiryChat inquiryId="inquiry123" currentUserId="buyer123" />)

      await waitFor(() => {
        expect(screen.getByText('판매자')).toBeInTheDocument() // 헤더의 상대방 이름
        expect(screen.getByText('테스트 상품')).toBeInTheDocument() // 상품 제목
      })
    })
  })

  describe('메시지 표시', () => {
    beforeEach(async () => {
      const { getInquiry, getInquiryMessages } = require('@/lib/actions/inquiry')

      getInquiry.mockResolvedValue({
        success: true,
        inquiry: mockInquiry
      })

      getInquiryMessages.mockResolvedValue({
        success: true,
        data: { data: mockMessages }
      })
    })

    it('메시지 목록을 올바르게 표시해야 함', async () => {
      render(<InquiryChat inquiryId="inquiry123" currentUserId="buyer123" />)

      await waitFor(() => {
        expect(screen.getByText('안녕하세요. 이 상품 구매하고 싶습니다.')).toBeInTheDocument()
        expect(screen.getByText('네, 가능합니다. 언제 만나실까요?')).toBeInTheDocument()
      })
    })

    it('본인 메시지와 상대방 메시지를 구분해서 표시해야 함', async () => {
      render(<InquiryChat inquiryId="inquiry123" currentUserId="buyer123" />)

      await waitFor(() => {
        const messages = screen.getAllByText(/안녕하세요|네, 가능합니다/)
        expect(messages).toHaveLength(2)
      })
    })

    it('메시지 시간을 포맷팅해서 표시해야 함', async () => {
      render(<InquiryChat inquiryId="inquiry123" currentUserId="buyer123" />)

      await waitFor(() => {
        // 시간 표시가 있는지 확인 (정확한 포맷은 함수에 따라 다름)
        expect(screen.getByText(/일 전|시간 전|분 전|방금/)).toBeInTheDocument()
      })
    })
  })

  describe('메시지 전송', () => {
    beforeEach(async () => {
      const { getInquiry, getInquiryMessages } = require('@/lib/actions/inquiry')

      getInquiry.mockResolvedValue({
        success: true,
        inquiry: mockInquiry
      })

      getInquiryMessages.mockResolvedValue({
        success: true,
        data: { data: mockMessages }
      })
    })

    it('새 메시지를 입력하고 전송할 수 있어야 함', async () => {
      const { sendInquiryMessage } = require('@/lib/actions/inquiry')
      sendInquiryMessage.mockResolvedValue({
        success: true,
        messageId: 'message3'
      })

      render(<InquiryChat inquiryId="inquiry123" currentUserId="buyer123" />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/메시지를 입력하세요/)).toBeInTheDocument()
      })

      const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/)
      const sendButton = screen.getByRole('button', { name: /send/i }) ||
                         screen.getAllByTestId('button').find(btn =>
                           btn.textContent?.includes('Send') || btn.querySelector('svg')
                         )

      fireEvent.change(textarea, { target: { value: '새 메시지입니다' } })

      if (sendButton) {
        fireEvent.click(sendButton)

        await waitFor(() => {
          expect(sendInquiryMessage).toHaveBeenCalledWith({
            inquiryId: 'inquiry123',
            type: 'text',
            content: '새 메시지입니다'
          })
        })
      }
    })

    it('빈 메시지는 전송할 수 없어야 함', async () => {
      render(<InquiryChat inquiryId="inquiry123" currentUserId="buyer123" />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/메시지를 입력하세요/)).toBeInTheDocument()
      })

      const sendButton = screen.getByRole('button', { name: /send/i }) ||
                         screen.getAllByTestId('button').find(btn =>
                           btn.textContent?.includes('Send') || btn.querySelector('svg')
                         )

      if (sendButton) {
        expect(sendButton).toBeDisabled()
      }
    })

    it('Enter 키로 메시지를 전송할 수 있어야 함', async () => {
      const { sendInquiryMessage } = require('@/lib/actions/inquiry')
      sendInquiryMessage.mockResolvedValue({
        success: true,
        messageId: 'message3'
      })

      render(<InquiryChat inquiryId="inquiry123" currentUserId="buyer123" />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/메시지를 입력하세요/)).toBeInTheDocument()
      })

      const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/)

      fireEvent.change(textarea, { target: { value: '엔터로 전송' } })
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })

      await waitFor(() => {
        expect(sendInquiryMessage).toHaveBeenCalledWith({
          inquiryId: 'inquiry123',
          type: 'text',
          content: '엔터로 전송'
        })
      })
    })

    it('Shift+Enter는 줄바꿈만 해야 함', async () => {
      const { sendInquiryMessage } = require('@/lib/actions/inquiry')

      render(<InquiryChat inquiryId="inquiry123" currentUserId="buyer123" />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/메시지를 입력하세요/)).toBeInTheDocument()
      })

      const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/)

      fireEvent.change(textarea, { target: { value: '줄바꿈 테스트' } })
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })

      // sendInquiryMessage가 호출되지 않아야 함
      expect(sendInquiryMessage).not.toHaveBeenCalled()
    })

    it('완료된 문의에서는 메시지를 전송할 수 없어야 함', async () => {
      const { getInquiry, getInquiryMessages } = require('@/lib/actions/inquiry')

      const completedInquiry = { ...mockInquiry, status: 'completed' }

      getInquiry.mockResolvedValue({
        success: true,
        inquiry: completedInquiry
      })

      getInquiryMessages.mockResolvedValue({
        success: true,
        data: { data: mockMessages }
      })

      render(<InquiryChat inquiryId="inquiry123" currentUserId="buyer123" />)

      await waitFor(() => {
        // 메시지 입력 영역이 표시되지 않아야 함
        expect(screen.queryByPlaceholderText(/메시지를 입력하세요/)).not.toBeInTheDocument()
      })
    })
  })

  describe('상태 관리', () => {
    beforeEach(async () => {
      const { getInquiry, getInquiryMessages } = require('@/lib/actions/inquiry')

      getInquiry.mockResolvedValue({
        success: true,
        inquiry: mockInquiry
      })

      getInquiryMessages.mockResolvedValue({
        success: true,
        data: { data: mockMessages }
      })
    })

    it('상태 배지를 표시해야 함', async () => {
      render(<InquiryChat inquiryId="inquiry123" currentUserId="seller123" />)

      await waitFor(() => {
        expect(screen.getByTestId('status-badge')).toBeInTheDocument()
        expect(screen.getByText('Status: active')).toBeInTheDocument()
      })
    })

    it('판매자는 상태를 변경할 수 있어야 함', async () => {
      render(<InquiryChat inquiryId="inquiry123" currentUserId="seller123" />)

      await waitFor(() => {
        expect(screen.getByText('Complete')).toBeInTheDocument()
      })

      const completeButton = screen.getByText('Complete')
      fireEvent.click(completeButton)

      // 상태 변경 확인 모달이 표시되어야 함
      expect(screen.getByTestId('status-confirm')).toBeInTheDocument()
    })

    it('상태 변경 확인 시 서버에 요청을 보내야 함', async () => {
      const { updateInquiryStatus } = require('@/lib/actions/inquiry')
      updateInquiryStatus.mockResolvedValue({ success: true })

      render(<InquiryChat inquiryId="inquiry123" currentUserId="seller123" />)

      await waitFor(() => {
        expect(screen.getByText('Complete')).toBeInTheDocument()
      })

      // 상태 변경 버튼 클릭
      const completeButton = screen.getByText('Complete')
      fireEvent.click(completeButton)

      // 확인 버튼 클릭
      const confirmButton = screen.getByText('Confirm')
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(updateInquiryStatus).toHaveBeenCalledWith('inquiry123', 'completed')
      })
    })
  })

  describe('상품 정보', () => {
    beforeEach(async () => {
      const { getInquiry, getInquiryMessages } = require('@/lib/actions/inquiry')

      getInquiry.mockResolvedValue({
        success: true,
        inquiry: mockInquiry
      })

      getInquiryMessages.mockResolvedValue({
        success: true,
        data: { data: mockMessages }
      })
    })

    it('상품 정보 카드를 표시해야 함', async () => {
      render(<InquiryChat inquiryId="inquiry123" currentUserId="buyer123" />)

      await waitFor(() => {
        expect(screen.getByText('테스트 상품')).toBeInTheDocument()
        expect(screen.getByText('상품 상세보기 →')).toBeInTheDocument()
      })
    })

    it('상품 이미지를 표시해야 함', async () => {
      render(<InquiryChat inquiryId="inquiry123" currentUserId="buyer123" />)

      await waitFor(() => {
        const image = screen.getByAltText('테스트 상품')
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('src', 'test-image.jpg')
      })
    })

    it('상품 카드 클릭 시 상품 페이지로 이동해야 함', async () => {
      render(<InquiryChat inquiryId="inquiry123" currentUserId="buyer123" />)

      await waitFor(() => {
        const productLink = screen.getByRole('link', { name: /테스트 상품/ })
        expect(productLink).toHaveAttribute('href', '/marketplace/item123')
      })
    })
  })

  describe('에러 처리', () => {
    it('메시지 전송 실패 시 에러 메시지를 표시해야 함', async () => {
      const { getInquiry, getInquiryMessages, sendInquiryMessage } = require('@/lib/actions/inquiry')

      getInquiry.mockResolvedValue({
        success: true,
        inquiry: mockInquiry
      })

      getInquiryMessages.mockResolvedValue({
        success: true,
        data: { data: mockMessages }
      })

      sendInquiryMessage.mockResolvedValue({
        success: false,
        error: '메시지 전송에 실패했습니다.'
      })

      render(<InquiryChat inquiryId="inquiry123" currentUserId="buyer123" />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/메시지를 입력하세요/)).toBeInTheDocument()
      })

      const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/)
      fireEvent.change(textarea, { target: { value: '테스트 메시지' } })
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })

      await waitFor(() => {
        expect(screen.getByText('메시지 전송에 실패했습니다.')).toBeInTheDocument()
      })
    })

    it('백 버튼으로 돌아갈 수 있어야 함', async () => {
      const { getInquiry, getInquiryMessages } = require('@/lib/actions/inquiry')

      getInquiry.mockResolvedValue({
        success: true,
        inquiry: mockInquiry
      })

      getInquiryMessages.mockResolvedValue({
        success: true,
        data: { data: mockMessages }
      })

      render(<InquiryChat inquiryId="inquiry123" currentUserId="buyer123" />)

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /arrow/i }) ||
                           screen.getAllByTestId('button').find(btn =>
                             btn.querySelector('svg') || btn.textContent?.includes('←')
                           )

        if (backButton) {
          fireEvent.click(backButton)
          expect(mockRouter.back).toHaveBeenCalled()
        }
      })
    })
  })

  describe('읽음 처리', () => {
    it('문의 진입 시 자동으로 읽음 처리해야 함', async () => {
      const { getInquiry, getInquiryMessages, markInquiryAsRead } = require('@/lib/actions/inquiry')

      const unreadInquiry = {
        ...mockInquiry,
        unreadCount: { buyer: 2, seller: 0 }
      }

      getInquiry.mockResolvedValue({
        success: true,
        inquiry: unreadInquiry
      })

      getInquiryMessages.mockResolvedValue({
        success: true,
        data: { data: mockMessages }
      })

      markInquiryAsRead.mockResolvedValue({ success: true })

      render(<InquiryChat inquiryId="inquiry123" currentUserId="buyer123" />)

      await waitFor(() => {
        expect(markInquiryAsRead).toHaveBeenCalledWith('inquiry123')
      })
    })
  })
})