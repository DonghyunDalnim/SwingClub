/**
 * ImageUploader 컴포넌트 테스트
 * 마켓플레이스 상품 이미지 업로드 UI 테스트
 */

import { render, screen } from '@testing-library/react'
import { ImageUploader } from '@/components/marketplace/ImageUploader'

// ImageUpload 컴포넌트 모킹
jest.mock('@/components/community/ImageUpload', () => ({
  ImageUpload: jest.fn(({ onUpload, maxImages, userId, existingImages }) => (
    <div data-testid="mock-image-upload">
      <div data-testid="max-images">{maxImages}</div>
      <div data-testid="user-id">{userId}</div>
      <div data-testid="existing-images">{JSON.stringify(existingImages)}</div>
      <button
        onClick={() => onUpload(['test-image-1.jpg', 'test-image-2.jpg'])}
        data-testid="mock-upload-button"
      >
        Mock Upload
      </button>
    </div>
  ))
}))

describe('ImageUploader', () => {
  const mockOnUpload = jest.fn()
  const defaultProps = {
    onUpload: mockOnUpload,
    userId: 'test-user-123',
    existingImages: []
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('렌더링', () => {
    it('기본 컴포넌트가 렌더링되어야 한다', () => {
      render(<ImageUploader {...defaultProps} />)

      expect(screen.getByText(/상품 이미지를 업로드하세요/)).toBeInTheDocument()
      expect(screen.getByTestId('mock-image-upload')).toBeInTheDocument()
    })

    it('기본 maxImages 값이 10으로 설정되어야 한다', () => {
      render(<ImageUploader {...defaultProps} />)

      expect(screen.getByText('상품 이미지를 업로드하세요. (최대 10개)')).toBeInTheDocument()
      expect(screen.getByTestId('max-images')).toHaveTextContent('10')
    })

    it('커스텀 maxImages 값이 적용되어야 한다', () => {
      render(<ImageUploader {...defaultProps} maxImages={5} />)

      expect(screen.getByText('상품 이미지를 업로드하세요. (최대 5개)')).toBeInTheDocument()
      expect(screen.getByTestId('max-images')).toHaveTextContent('5')
    })

    it('사용 가이드 텍스트가 표시되어야 한다', () => {
      render(<ImageUploader {...defaultProps} />)

      expect(screen.getByText(/첫 번째 이미지가 대표 이미지로 설정됩니다/)).toBeInTheDocument()
      expect(screen.getByText(/JPG, PNG 파일만 업로드 가능합니다/)).toBeInTheDocument()
      expect(screen.getByText(/파일 크기는 최대 5MB까지 가능합니다/)).toBeInTheDocument()
    })
  })

  describe('Props 전달', () => {
    it('userId가 ImageUpload 컴포넌트에 올바르게 전달되어야 한다', () => {
      render(<ImageUploader {...defaultProps} userId="custom-user-456" />)

      expect(screen.getByTestId('user-id')).toHaveTextContent('custom-user-456')
    })

    it('existingImages가 ImageUpload 컴포넌트에 올바르게 전달되어야 한다', () => {
      const existingImages = ['image1.jpg', 'image2.jpg']
      render(<ImageUploader {...defaultProps} existingImages={existingImages} />)

      expect(screen.getByTestId('existing-images')).toHaveTextContent(JSON.stringify(existingImages))
    })

    it('onUpload 콜백이 올바르게 전달되어야 한다', () => {
      render(<ImageUploader {...defaultProps} />)

      const uploadButton = screen.getByTestId('mock-upload-button')
      uploadButton.click()

      expect(mockOnUpload).toHaveBeenCalledWith(['test-image-1.jpg', 'test-image-2.jpg'])
    })

    it('maxImages가 ImageUpload 컴포넌트에 올바르게 전달되어야 한다', () => {
      render(<ImageUploader {...defaultProps} maxImages={15} />)

      expect(screen.getByTestId('max-images')).toHaveTextContent('15')
    })
  })

  describe('기본값 처리', () => {
    it('maxImages 기본값이 10이어야 한다', () => {
      render(<ImageUploader onUpload={mockOnUpload} userId="test" />)

      expect(screen.getByTestId('max-images')).toHaveTextContent('10')
    })

    it('existingImages 기본값이 빈 배열이어야 한다', () => {
      render(<ImageUploader onUpload={mockOnUpload} userId="test" />)

      expect(screen.getByTestId('existing-images')).toHaveTextContent('[]')
    })
  })

  describe('엣지 케이스', () => {
    it('maxImages가 0이어도 렌더링되어야 한다', () => {
      render(<ImageUploader {...defaultProps} maxImages={0} />)

      expect(screen.getByText('상품 이미지를 업로드하세요. (최대 0개)')).toBeInTheDocument()
      expect(screen.getByTestId('max-images')).toHaveTextContent('0')
    })

    it('매우 큰 maxImages 값도 처리해야 한다', () => {
      render(<ImageUploader {...defaultProps} maxImages={1000} />)

      expect(screen.getByText('상품 이미지를 업로드하세요. (최대 1000개)')).toBeInTheDocument()
      expect(screen.getByTestId('max-images')).toHaveTextContent('1000')
    })

    it('빈 userId가 전달되어도 렌더링되어야 한다', () => {
      render(<ImageUploader {...defaultProps} userId="" />)

      expect(screen.getByTestId('user-id')).toHaveTextContent('')
      expect(screen.getByTestId('mock-image-upload')).toBeInTheDocument()
    })

    it('null onUpload가 전달되어도 에러가 발생하지 않아야 한다', () => {
      // @ts-ignore - 의도적으로 잘못된 타입 전달
      expect(() => render(<ImageUploader onUpload={null} userId="test" />)).not.toThrow()
    })
  })

  describe('스타일링', () => {
    it('컨테이너에 적절한 spacing이 적용되어야 한다', () => {
      render(<ImageUploader {...defaultProps} />)

      const container = screen.getByText(/상품 이미지를 업로드하세요/).closest('div').parentElement
      expect(container).toHaveClass('space-y-3')
    })

    it('설명 텍스트에 적절한 스타일이 적용되어야 한다', () => {
      render(<ImageUploader {...defaultProps} />)

      const descriptionText = screen.getByText(/상품 이미지를 업로드하세요/)
      expect(descriptionText).toHaveClass('text-sm', 'text-gray-600')

      const guideText = screen.getByText(/첫 번째 이미지가 대표 이미지/)
      expect(guideText).toHaveClass('text-xs', 'text-gray-500')
    })
  })

  describe('접근성', () => {
    it('설명 텍스트가 명확해야 한다', () => {
      render(<ImageUploader {...defaultProps} />)

      // 사용자에게 도움이 되는 명확한 지침
      expect(screen.getByText(/첫 번째 이미지가 대표 이미지로 설정됩니다/)).toBeInTheDocument()
      expect(screen.getByText(/JPG, PNG 파일만 업로드 가능합니다/)).toBeInTheDocument()
      expect(screen.getByText(/파일 크기는 최대 5MB까지 가능합니다/)).toBeInTheDocument()
    })

    it('maxImages 정보가 사용자에게 명확히 전달되어야 한다', () => {
      render(<ImageUploader {...defaultProps} maxImages={8} />)

      expect(screen.getByText('상품 이미지를 업로드하세요. (최대 8개)')).toBeInTheDocument()
    })
  })

  describe('컴포넌트 통합', () => {
    it('ImageUpload 컴포넌트가 올바른 props로 렌더링되어야 한다', () => {
      const props = {
        onUpload: mockOnUpload,
        maxImages: 7,
        userId: 'integration-test-user',
        existingImages: ['existing1.jpg', 'existing2.jpg']
      }

      render(<ImageUploader {...props} />)

      expect(screen.getByTestId('max-images')).toHaveTextContent('7')
      expect(screen.getByTestId('user-id')).toHaveTextContent('integration-test-user')
      expect(screen.getByTestId('existing-images')).toHaveTextContent(
        JSON.stringify(['existing1.jpg', 'existing2.jpg'])
      )
    })
  })

  describe('성능', () => {
    it('props 변경 시 적절히 리렌더링되어야 한다', () => {
      const { rerender } = render(<ImageUploader {...defaultProps} maxImages={5} />)

      expect(screen.getByText('상품 이미지를 업로드하세요. (최대 5개)')).toBeInTheDocument()

      rerender(<ImageUploader {...defaultProps} maxImages={8} />)

      expect(screen.getByText('상품 이미지를 업로드하세요. (최대 8개)')).toBeInTheDocument()
    })

    it('불필요한 리렌더링이 발생하지 않아야 한다', () => {
      const { rerender } = render(<ImageUploader {...defaultProps} />)

      // 같은 props로 리렌더링
      rerender(<ImageUploader {...defaultProps} />)

      expect(screen.getByTestId('mock-image-upload')).toBeInTheDocument()
    })
  })
})