/**
 * InquiryButton 컴포넌트 테스트
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { InquiryButton, ViewInquiriesButton } from '@/components/marketplace/InquiryButton'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn()
  })
}))

jest.mock('@/lib/actions/inquiry', () => ({
  createInquiry: jest.fn()
}))

jest.mock('@/components/core', () => ({
  Button: ({ children, onClick, disabled, className, variant }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      className={`button ${variant} ${className}`}
    >
      {children}
    </button>
  )
}))

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn()
  })
}))

describe('InquiryButton', () => {
  const defaultProps = {
    itemId: 'item123',
    itemTitle: '테스트 상품',
    sellerId: 'seller123'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('로그인 상태에 따른 렌더링', () => {
    it('로그인하지 않은 경우 로그인 버튼을 표시해야 함', () => {
      render(<InquiryButton {...defaultProps} />)

      expect(screen.getByText('로그인 후 문의')).toBeInTheDocument()
    })

    it('로그인 버튼 클릭 시 로그인 페이지로 이동해야 함', () => {
      render(<InquiryButton {...defaultProps} />)

      const loginButton = screen.getByText('로그인 후 문의')
      fireEvent.click(loginButton)

      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })

    it('본인 상품인 경우 버튼을 표시하지 않아야 함', () => {
      render(
        <InquiryButton
          {...defaultProps}
          currentUserId="seller123"
          sellerId="seller123"
        />
      )

      expect(screen.queryByTestId('button')).not.toBeInTheDocument()
    })

    it('이미 진행중인 문의가 있는 경우 문의 확인 버튼을 표시해야 함', () => {
      render(
        <InquiryButton
          {...defaultProps}
          currentUserId="buyer123"
          hasActiveInquiry={true}
          existingInquiryId="inquiry123"
        />
      )

      expect(screen.getByText('문의 확인')).toBeInTheDocument()
    })

    it('문의 확인 버튼 클릭 시 해당 문의로 이동해야 함', () => {
      render(
        <InquiryButton
          {...defaultProps}
          currentUserId="buyer123"
          hasActiveInquiry={true}
          existingInquiryId="inquiry123"
        />
      )

      const viewButton = screen.getByText('문의 확인')
      fireEvent.click(viewButton)

      expect(mockPush).toHaveBeenCalledWith('/marketplace/item123/inquiry/inquiry123')
    })

    it('새 문의가 가능한 경우 판매자 문의 버튼을 표시해야 함', () => {
      render(
        <InquiryButton
          {...defaultProps}
          currentUserId="buyer123"
          hasActiveInquiry={false}
        />
      )

      expect(screen.getByText('판매자 문의')).toBeInTheDocument()
    })
  })

  describe('문의 작성 모달', () => {
    beforeEach(() => {
      render(
        <InquiryButton
          {...defaultProps}
          currentUserId="buyer123"
          hasActiveInquiry={false}
        />
      )
    })

    it('판매자 문의 버튼 클릭 시 모달이 열려야 함', () => {
      const inquiryButton = screen.getByText('판매자 문의')
      fireEvent.click(inquiryButton)

      expect(screen.getByText('판매자에게 문의하기')).toBeInTheDocument()
      expect(screen.getByText('문의 상품')).toBeInTheDocument()
      expect(screen.getByText('테스트 상품')).toBeInTheDocument()
    })

    it('모달에서 X 버튼 클릭 시 모달이 닫혀야 함', () => {
      // 모달 열기
      const inquiryButton = screen.getByText('판매자 문의')
      fireEvent.click(inquiryButton)

      // X 버튼 찾기 (아이콘으로 렌더링되므로 테스트 방식 변경)
      const closeButton = screen.getByRole('button', { name: /close/i }) ||
                           screen.getByTestId('close-button') ||
                           document.querySelector('[data-testid="button"]')

      if (closeButton) {
        fireEvent.click(closeButton)
      }

      // 모달이 닫혔는지 확인하기 위해 다른 방법 사용
      expect(screen.queryByText('판매자에게 문의하기')).not.toBeInTheDocument()
    })

    it('취소 버튼 클릭 시 모달이 닫혀야 함', () => {
      // 모달 열기
      const inquiryButton = screen.getByText('판매자 문의')
      fireEvent.click(inquiryButton)

      // 취소 버튼 클릭
      const cancelButton = screen.getByText('취소')
      fireEvent.click(cancelButton)

      expect(screen.queryByText('판매자에게 문의하기')).not.toBeInTheDocument()
    })
  })

  describe('문의 내용 검증', () => {
    beforeEach(() => {
      render(
        <InquiryButton
          {...defaultProps}
          currentUserId="buyer123"
          hasActiveInquiry={false}
        />
      )

      // 모달 열기
      const inquiryButton = screen.getByText('판매자 문의')
      fireEvent.click(inquiryButton)
    })

    it('빈 내용으로 문의 시 에러 메시지를 표시해야 함', async () => {
      const submitButton = screen.getByText('문의하기')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('문의 내용을 입력해주세요.')).toBeInTheDocument()
      })
    })

    it('1000자를 초과하는 내용으로 문의 시 에러 메시지를 표시해야 함', async () => {
      const textarea = screen.getByPlaceholderText(/궁금한 점을 자유롭게 문의해주세요/)
      const longText = 'a'.repeat(1001)

      fireEvent.change(textarea, { target: { value: longText } })

      const submitButton = screen.getByText('문의하기')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('문의 내용은 1000자를 초과할 수 없습니다.')).toBeInTheDocument()
      })
    })

    it('글자 수 카운터가 올바르게 작동해야 함', () => {
      const textarea = screen.getByPlaceholderText(/궁금한 점을 자유롭게 문의해주세요/)
      const testText = '테스트 문의 내용입니다.'

      fireEvent.change(textarea, { target: { value: testText } })

      expect(screen.getByText(`${testText.length}/1000`)).toBeInTheDocument()
    })

    it('1000자 초과 시 글자 수 카운터가 빨간색으로 표시되어야 함', () => {
      const textarea = screen.getByPlaceholderText(/궁금한 점을 자유롭게 문의해주세요/)
      const longText = 'a'.repeat(1001)

      fireEvent.change(textarea, { target: { value: longText } })

      const counter = screen.getByText(`${longText.length}/1000`)
      expect(counter).toHaveClass('text-red-500')
    })
  })

  describe('문의 전송', () => {
    beforeEach(() => {
      render(
        <InquiryButton
          {...defaultProps}
          currentUserId="buyer123"
          hasActiveInquiry={false}
        />
      )

      // 모달 열기
      const inquiryButton = screen.getByText('판매자 문의')
      fireEvent.click(inquiryButton)
    })

    it('유효한 내용으로 문의 전송 시 성공해야 함', async () => {
      const { createInquiry } = require('@/lib/actions/inquiry')
      createInquiry.mockResolvedValue({
        success: true,
        inquiryId: 'inquiry123'
      })

      const textarea = screen.getByPlaceholderText(/궁금한 점을 자유롭게 문의해주세요/)
      const testMessage = '상품 상태가 어떤가요?'

      fireEvent.change(textarea, { target: { value: testMessage } })

      const submitButton = screen.getByText('문의하기')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(createInquiry).toHaveBeenCalledWith({
          itemId: 'item123',
          message: testMessage
        })
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/marketplace/item123/inquiry/inquiry123')
      })
    })

    it('문의 전송 실패 시 에러 메시지를 표시해야 함', async () => {
      const { createInquiry } = require('@/lib/actions/inquiry')
      createInquiry.mockResolvedValue({
        success: false,
        error: '문의 생성에 실패했습니다.'
      })

      const textarea = screen.getByPlaceholderText(/궁금한 점을 자유롭게 문의해주세요/)
      fireEvent.change(textarea, { target: { value: '테스트 문의' } })

      const submitButton = screen.getByText('문의하기')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('문의 생성에 실패했습니다.')).toBeInTheDocument()
      })
    })

    it('전송 중일 때 버튼이 비활성화되고 로딩 표시되어야 함', async () => {
      const { createInquiry } = require('@/lib/actions/inquiry')
      createInquiry.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      const textarea = screen.getByPlaceholderText(/궁금한 점을 자유롭게 문의해주세요/)
      fireEvent.change(textarea, { target: { value: '테스트 문의' } })

      const submitButton = screen.getByText('문의하기')
      fireEvent.click(submitButton)

      // 로딩 상태 확인
      expect(screen.getByText('전송중...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('Ctrl+Enter로 문의를 전송할 수 있어야 함', async () => {
      const { createInquiry } = require('@/lib/actions/inquiry')
      createInquiry.mockResolvedValue({
        success: true,
        inquiryId: 'inquiry123'
      })

      const textarea = screen.getByPlaceholderText(/궁금한 점을 자유롭게 문의해주세요/)
      fireEvent.change(textarea, { target: { value: '테스트 문의' } })

      fireEvent.keyDown(textarea, {
        key: 'Enter',
        ctrlKey: true
      })

      await waitFor(() => {
        expect(createInquiry).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('접근성', () => {
    it('disabled 상태일 때 버튼이 비활성화되어야 함', () => {
      render(
        <InquiryButton
          {...defaultProps}
          currentUserId="buyer123"
          disabled={true}
        />
      )

      const button = screen.getByText('판매자 문의')
      expect(button).toBeDisabled()
    })

    it('커스텀 클래스명을 적용할 수 있어야 함', () => {
      render(
        <InquiryButton
          {...defaultProps}
          currentUserId="buyer123"
          className="custom-class"
        />
      )

      const button = screen.getByText('판매자 문의')
      expect(button).toHaveClass('custom-class')
    })
  })
})

describe('ViewInquiriesButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('문의가 없을 때 버튼을 표시하지 않아야 함', () => {
    render(<ViewInquiriesButton itemId="item123" inquiryCount={0} />)

    expect(screen.queryByTestId('button')).not.toBeInTheDocument()
  })

  it('문의가 있을 때 버튼을 표시해야 함', () => {
    render(<ViewInquiriesButton itemId="item123" inquiryCount={5} />)

    expect(screen.getByText('문의 5개')).toBeInTheDocument()
  })

  it('버튼 클릭 시 문의 목록 페이지로 이동해야 함', () => {
    render(<ViewInquiriesButton itemId="item123" inquiryCount={3} />)

    const button = screen.getByText('문의 3개')
    fireEvent.click(button)

    expect(mockPush).toHaveBeenCalledWith('/marketplace/item123/inquiries')
  })

  it('커스텀 클래스명을 적용할 수 있어야 함', () => {
    render(
      <ViewInquiriesButton
        itemId="item123"
        inquiryCount={2}
        className="custom-class"
      />
    )

    const button = screen.getByText('문의 2개')
    expect(button).toHaveClass('custom-class')
  })
})