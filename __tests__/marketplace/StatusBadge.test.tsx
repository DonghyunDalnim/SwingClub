/**
 * StatusBadge 컴포넌트 테스트
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StatusBadge, StatusDescription, StatusChangeConfirm } from '@/components/marketplace/StatusBadge'
import type { InquiryStatus } from '@/lib/types/marketplace'

// Mock dependencies
jest.mock('@/components/core', () => ({
  Badge: ({ children, variant, className }: any) => (
    <div data-testid="badge" className={`badge ${variant} ${className}`}>
      {children}
    </div>
  ),
  Button: ({ children, onClick, disabled, className, size, variant }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      className={`button ${size} ${variant} ${className}`}
    >
      {children}
    </button>
  )
}))

describe('StatusBadge', () => {
  const mockOnStatusChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('상태 표시', () => {
    it('active 상태를 올바르게 표시해야 함', () => {
      render(<StatusBadge status="active" />)

      expect(screen.getByText('진행중')).toBeInTheDocument()
      expect(screen.getByTestId('badge')).toHaveClass('badge default')
    })

    it('completed 상태를 올바르게 표시해야 함', () => {
      render(<StatusBadge status="completed" />)

      expect(screen.getByText('완료')).toBeInTheDocument()
      expect(screen.getByTestId('badge')).toHaveClass('badge secondary')
    })

    it('cancelled 상태를 올바르게 표시해야 함', () => {
      render(<StatusBadge status="cancelled" />)

      expect(screen.getByText('취소')).toBeInTheDocument()
      expect(screen.getByTestId('badge')).toHaveClass('badge outline')
    })

    it('reported 상태를 올바르게 표시해야 함', () => {
      render(<StatusBadge status="reported" />)

      expect(screen.getByText('신고됨')).toBeInTheDocument()
      expect(screen.getByTestId('badge')).toHaveClass('badge destructive')
    })
  })

  describe('액션 버튼', () => {
    it('판매자이고 active 상태일 때 완료/취소 버튼을 표시해야 함', () => {
      render(
        <StatusBadge
          status="active"
          showActions={true}
          isOwner={true}
          onStatusChange={mockOnStatusChange}
        />
      )

      expect(screen.getByText('완료')).toBeInTheDocument()
      expect(screen.getByText('취소')).toBeInTheDocument()
    })

    it('판매자가 아니면 완료/취소 버튼을 표시하지 않아야 함', () => {
      render(
        <StatusBadge
          status="active"
          showActions={true}
          isOwner={false}
          onStatusChange={mockOnStatusChange}
        />
      )

      expect(screen.queryByText('완료')).not.toBeInTheDocument()
      expect(screen.queryByText('취소')).not.toBeInTheDocument()
    })

    it('신고 버튼은 양쪽 모두에게 표시되어야 함', () => {
      render(
        <StatusBadge
          status="active"
          showActions={true}
          isOwner={false}
          onStatusChange={mockOnStatusChange}
        />
      )

      expect(screen.getByText('신고')).toBeInTheDocument()
    })

    it('이미 신고된 상태에서는 신고 버튼이 표시되지 않아야 함', () => {
      render(
        <StatusBadge
          status="reported"
          showActions={true}
          onStatusChange={mockOnStatusChange}
        />
      )

      expect(screen.queryByText('신고')).not.toBeInTheDocument()
    })

    it('완료 버튼 클릭 시 onStatusChange가 호출되어야 함', async () => {
      render(
        <StatusBadge
          status="active"
          showActions={true}
          isOwner={true}
          onStatusChange={mockOnStatusChange}
        />
      )

      const completeButton = screen.getByText('완료')
      fireEvent.click(completeButton)

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalledWith('completed')
      })
    })

    it('취소 버튼 클릭 시 onStatusChange가 호출되어야 함', async () => {
      render(
        <StatusBadge
          status="active"
          showActions={true}
          isOwner={true}
          onStatusChange={mockOnStatusChange}
        />
      )

      const cancelButton = screen.getByText('취소')
      fireEvent.click(cancelButton)

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalledWith('cancelled')
      })
    })

    it('신고 버튼 클릭 시 onStatusChange가 호출되어야 함', async () => {
      render(
        <StatusBadge
          status="active"
          showActions={true}
          onStatusChange={mockOnStatusChange}
        />
      )

      const reportButton = screen.getByText('신고')
      fireEvent.click(reportButton)

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalledWith('reported')
      })
    })
  })

  describe('로딩 상태', () => {
    it('로딩 중일 때 버튼이 비활성화되어야 함', () => {
      render(
        <StatusBadge
          status="active"
          showActions={true}
          isOwner={true}
          loading={true}
          onStatusChange={mockOnStatusChange}
        />
      )

      const buttons = screen.getAllByTestId('button')
      buttons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })
  })
})

describe('StatusDescription', () => {
  it('각 상태에 대한 적절한 설명을 표시해야 함', () => {
    const statuses: InquiryStatus[] = ['active', 'completed', 'cancelled', 'reported']

    statuses.forEach(status => {
      const { unmount } = render(<StatusDescription status={status} />)

      // 설명 텍스트가 존재하는지 확인
      const description = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'p' && content.length > 0
      })

      expect(description).toBeInTheDocument()
      unmount()
    })
  })

  it('커스텀 클래스명을 적용할 수 있어야 함', () => {
    render(<StatusDescription status="active" className="custom-class" />)

    const description = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'p' && content.includes('진행중')
    })

    expect(description).toHaveClass('custom-class')
  })
})

describe('StatusChangeConfirm', () => {
  const mockOnConfirm = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('확인 모달이 올바르게 렌더링되어야 함', () => {
    render(
      <StatusChangeConfirm
        currentStatus="active"
        newStatus="completed"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('상태 변경 확인')).toBeInTheDocument()
    expect(screen.getByText('취소')).toBeInTheDocument()
    expect(screen.getByText('확인')).toBeInTheDocument()
  })

  it('완료 상태 변경에 대한 적절한 메시지를 표시해야 함', () => {
    render(
      <StatusChangeConfirm
        currentStatus="active"
        newStatus="completed"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText(/거래를 완료 처리하시겠습니까/)).toBeInTheDocument()
  })

  it('취소 상태 변경에 대한 적절한 메시지를 표시해야 함', () => {
    render(
      <StatusChangeConfirm
        currentStatus="active"
        newStatus="cancelled"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText(/문의를 취소하시겠습니까/)).toBeInTheDocument()
  })

  it('신고에 대한 적절한 메시지를 표시해야 함', () => {
    render(
      <StatusChangeConfirm
        currentStatus="active"
        newStatus="reported"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText(/이 문의를 신고하시겠습니까/)).toBeInTheDocument()
  })

  it('확인 버튼 클릭 시 onConfirm이 호출되어야 함', () => {
    render(
      <StatusChangeConfirm
        currentStatus="active"
        newStatus="completed"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    const confirmButton = screen.getByText('확인')
    fireEvent.click(confirmButton)

    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
  })

  it('취소 버튼 클릭 시 onCancel이 호출되어야 함', () => {
    render(
      <StatusChangeConfirm
        currentStatus="active"
        newStatus="completed"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    const cancelButton = screen.getByText('취소')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('로딩 중일 때 버튼이 비활성화되어야 함', () => {
    render(
      <StatusChangeConfirm
        currentStatus="active"
        newStatus="completed"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        loading={true}
      />
    )

    const confirmButton = screen.getByText('처리중...')
    const cancelButton = screen.getByText('취소')

    expect(confirmButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })

  it('신고 상태 변경 시 destructive 버튼 스타일을 사용해야 함', () => {
    render(
      <StatusChangeConfirm
        currentStatus="active"
        newStatus="reported"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    const confirmButton = screen.getByText('확인')
    expect(confirmButton).toHaveClass('destructive')
  })
})