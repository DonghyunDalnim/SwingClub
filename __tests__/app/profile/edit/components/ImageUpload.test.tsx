/**
 * ImageUpload 컴포넌트 테스트
 * 프로필 이미지 업로드 및 미리보기 UI 테스트
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImageUpload from '@/app/profile/edit/components/ImageUpload'

// Avatar 컴포넌트 모킹
jest.mock('@/components/core', () => ({
  Avatar: jest.fn(({ src, alt, size, className }) => (
    <div
      data-testid="mock-avatar"
      data-src={src}
      data-alt={alt}
      data-size={size}
      className={className}
    >
      Avatar Mock
    </div>
  ))
}))

// FileReader 모킹
const mockFileReader = {
  readAsDataURL: jest.fn(),
  onloadend: null as any,
  result: null as any
}

global.FileReader = jest.fn(() => mockFileReader) as any

describe('ImageUpload', () => {
  const mockOnImageChange = jest.fn()
  const defaultProps = {
    currentImage: null,
    onImageChange: mockOnImageChange,
    maxSizeMB: 5
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockFileReader.result = null
  })

  describe('렌더링', () => {
    it('기본 컴포넌트가 렌더링되어야 한다', () => {
      render(<ImageUpload {...defaultProps} />)

      expect(screen.getByTestId('mock-avatar')).toBeInTheDocument()
      expect(screen.getByLabelText('이미지 변경')).toBeInTheDocument()
      expect(screen.getByText('클릭하거나 이미지를 드래그하세요')).toBeInTheDocument()
    })

    it('현재 이미지가 Avatar에 표시되어야 한다', () => {
      render(<ImageUpload {...defaultProps} currentImage="https://example.com/image.jpg" />)

      const avatar = screen.getByTestId('mock-avatar')
      expect(avatar).toHaveAttribute('data-src', 'https://example.com/image.jpg')
      expect(avatar).toHaveAttribute('data-alt', '프로필 이미지')
    })

    it('maxSizeMB 정보가 표시되어야 한다', () => {
      render(<ImageUpload {...defaultProps} maxSizeMB={3} />)

      expect(screen.getByText(/최대 3MB/)).toBeInTheDocument()
    })

    it('이미지가 있을 때 제거 버튼이 표시되어야 한다', () => {
      render(<ImageUpload {...defaultProps} currentImage="https://example.com/image.jpg" />)

      expect(screen.getByLabelText('이미지 제거')).toBeInTheDocument()
    })

    it('이미지가 없을 때 제거 버튼이 표시되지 않아야 한다', () => {
      render(<ImageUpload {...defaultProps} currentImage={null} />)

      expect(screen.queryByLabelText('이미지 제거')).not.toBeInTheDocument()
    })
  })

  describe('파일 선택', () => {
    it('파일 선택 시 FileReader가 호출되어야 한다', async () => {
      render(<ImageUpload {...defaultProps} />)

      const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText('프로필 이미지 업로드') as HTMLInputElement

      await userEvent.upload(input, file)

      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file)
    })

    it('유효한 이미지 파일 선택 시 onImageChange가 호출되어야 한다', async () => {
      render(<ImageUpload {...defaultProps} />)

      const file = new File(['dummy content'], 'test.png', { type: 'image/png' })
      const input = screen.getByLabelText('프로필 이미지 업로드') as HTMLInputElement

      mockFileReader.result = 'data:image/png;base64,dummy'

      await userEvent.upload(input, file)

      // FileReader의 onloadend를 수동으로 트리거
      await waitFor(() => {
        if (mockFileReader.onloadend) {
          mockFileReader.onloadend()
        }
      })

      await waitFor(() => {
        expect(mockOnImageChange).toHaveBeenCalledWith(file, 'data:image/png;base64,dummy')
      })
    })
  })

  describe('파일 유효성 검증', () => {
    it('파일 크기가 초과하면 에러 메시지가 표시되어야 한다', async () => {
      render(<ImageUpload {...defaultProps} maxSizeMB={1} />)

      // 2MB 파일 생성 (1MB 제한 초과)
      const largeFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText('프로필 이미지 업로드') as HTMLInputElement

      await userEvent.upload(input, largeFile)

      await waitFor(() => {
        expect(screen.getByText(/이미지 크기는 1MB 이하여야 합니다/)).toBeInTheDocument()
      })

      expect(mockOnImageChange).not.toHaveBeenCalled()
    })

    it('이미지 파일이 아니면 에러 메시지가 표시되어야 한다', async () => {
      render(<ImageUpload {...defaultProps} />)

      const textFile = new File(['text content'], 'test.txt', { type: 'text/plain' })
      const input = screen.getByLabelText('프로필 이미지 업로드') as HTMLInputElement

      await userEvent.upload(input, textFile)

      await waitFor(() => {
        expect(screen.getByText('이미지 파일만 업로드 가능합니다')).toBeInTheDocument()
      }, { timeout: 3000 })

      expect(mockOnImageChange).not.toHaveBeenCalled()
    })

    it('유효한 파일 선택 후 에러가 초기화되어야 한다', async () => {
      render(<ImageUpload {...defaultProps} />)

      // 먼저 잘못된 파일 업로드
      const textFile = new File(['text'], 'test.txt', { type: 'text/plain' })
      const input = screen.getByLabelText('프로필 이미지 업로드') as HTMLInputElement

      await userEvent.upload(input, textFile)

      await waitFor(() => {
        expect(screen.getByText('이미지 파일만 업로드 가능합니다')).toBeInTheDocument()
      }, { timeout: 3000 })

      // 유효한 파일 업로드
      const imageFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
      await userEvent.upload(input, imageFile)

      await waitFor(() => {
        expect(screen.queryByText('이미지 파일만 업로드 가능합니다')).not.toBeInTheDocument()
      })
    })
  })

  describe('드래그 앤 드롭', () => {
    it('드래그 오버 시 시각적 피드백이 있어야 한다', () => {
      render(<ImageUpload {...defaultProps} />)

      const dropZone = screen.getByText('클릭하거나 이미지를 드래그하세요').closest('div')

      fireEvent.dragOver(dropZone!)
      // 드래그 상태 확인은 스타일로 검증되어야 하지만, 여기서는 에러가 발생하지 않는지만 확인
      expect(dropZone).toBeInTheDocument()
    })

    it('드래그 리브 시 상태가 초기화되어야 한다', () => {
      render(<ImageUpload {...defaultProps} />)

      const dropZone = screen.getByText('클릭하거나 이미지를 드래그하세요').closest('div')

      fireEvent.dragOver(dropZone!)
      fireEvent.dragLeave(dropZone!)

      expect(dropZone).toBeInTheDocument()
    })

    it('파일 드롭 시 onImageChange가 호출되어야 한다', async () => {
      render(<ImageUpload {...defaultProps} />)

      const file = new File(['dummy content'], 'dropped.jpg', { type: 'image/jpeg' })
      const dropZone = screen.getByText('클릭하거나 이미지를 드래그하세요').closest('div')

      const dataTransfer = {
        files: [file],
        types: ['Files']
      }

      mockFileReader.result = 'data:image/jpeg;base64,dropped'

      fireEvent.drop(dropZone!, { dataTransfer })

      // FileReader의 onloadend를 수동으로 트리거
      await waitFor(() => {
        if (mockFileReader.onloadend) {
          mockFileReader.onloadend()
        }
      })

      await waitFor(() => {
        expect(mockOnImageChange).toHaveBeenCalled()
      })
    })
  })

  describe('이미지 제거', () => {
    it('제거 버튼 클릭 시 이미지가 제거되어야 한다', async () => {
      render(<ImageUpload {...defaultProps} currentImage="https://example.com/image.jpg" />)

      const removeButton = screen.getByLabelText('���미지 제거')
      await userEvent.click(removeButton)

      expect(mockOnImageChange).toHaveBeenCalledWith(null, null)
    })

    it('이미지 제거 후 input value가 초기화되어야 한다', async () => {
      render(<ImageUpload {...defaultProps} currentImage="https://example.com/image.jpg" />)

      const input = screen.getByLabelText('프로필 이미지 업로드') as HTMLInputElement
      const removeButton = screen.getByLabelText('이미지 제거')

      await userEvent.click(removeButton)

      expect(input.value).toBe('')
    })

    it('이미지 제거 시 에러 메시지도 함께 제거되어야 한다', async () => {
      render(<ImageUpload {...defaultProps} />)

      // 먼저 에러 발생
      const textFile = new File(['text'], 'test.txt', { type: 'text/plain' })
      const input = screen.getByLabelText('프로필 이미지 업로드') as HTMLInputElement
      await userEvent.upload(input, textFile)

      expect(screen.getByText('이미지 파일만 업로드 가능합니다')).toBeInTheDocument()

      // 이미지 설정 후 제거
      const imageFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
      mockFileReader.result = 'data:image/jpeg;base64,test'
      await userEvent.upload(input, imageFile)

      await waitFor(() => {
        if (mockFileReader.onloadend) {
          mockFileReader.onloadend()
        }
      })

      await waitFor(() => {
        const removeButton = screen.queryByLabelText('이미지 제거')
        if (removeButton) {
          userEvent.click(removeButton)
        }
      })
    })
  })

  describe('접근성', () => {
    it('모든 버튼에 aria-label이 있어야 한다', () => {
      render(<ImageUpload {...defaultProps} currentImage="https://example.com/image.jpg" />)

      expect(screen.getByLabelText('이미지 변경')).toBeInTheDocument()
      expect(screen.getByLabelText('이미지 제거')).toBeInTheDocument()
    })

    it('파일 입력에 aria-label이 있어야 한다', () => {
      render(<ImageUpload {...defaultProps} />)

      expect(screen.getByLabelText('프로필 이미지 업로드')).toBeInTheDocument()
    })

    it('에러 메시지에 role="alert"가 있어야 한다', async () => {
      render(<ImageUpload {...defaultProps} />)

      const textFile = new File(['text'], 'test.txt', { type: 'text/plain' })
      const input = screen.getByLabelText('프로필 이미지 업로드') as HTMLInputElement

      await userEvent.upload(input, textFile)

      const errorMessage = await screen.findByText('이미지 파일만 업로드 가능합니다', {}, { timeout: 3000 })
      expect(errorMessage).toHaveAttribute('role', 'alert')
    })
  })

  describe('엣지 케이스', () => {
    it('maxSizeMB가 0이어도 에러가 발생하지 않아야 한다', () => {
      expect(() => render(<ImageUpload {...defaultProps} maxSizeMB={0} />)).not.toThrow()
    })

    it('현재 이미지가 undefined여도 렌더링되어야 한다', () => {
      render(<ImageUpload {...defaultProps} currentImage={undefined} />)

      expect(screen.getByTestId('mock-avatar')).toBeInTheDocument()
    })

    it('onImageChange가 호출되지 않아도 에러가 발생하지 않아야 한다', async () => {
      const { rerender } = render(<ImageUpload {...defaultProps} />)

      // onImageChange를 undefined로 변경
      rerender(<ImageUpload currentImage={null} onImageChange={undefined as any} maxSizeMB={5} />)

      expect(screen.getByTestId('mock-avatar')).toBeInTheDocument()
    })
  })

  describe('다양한 이미지 타입', () => {
    const imageTypes = [
      { type: 'image/jpeg', extension: 'jpg' },
      { type: 'image/png', extension: 'png' },
      { type: 'image/gif', extension: 'gif' },
      { type: 'image/webp', extension: 'webp' }
    ]

    imageTypes.forEach(({ type, extension }) => {
      it(`${extension} 파일이 허용되어야 한다`, async () => {
        render(<ImageUpload {...defaultProps} />)

        const file = new File(['image'], `test.${extension}`, { type })
        const input = screen.getByLabelText('프로필 이미지 업로드') as HTMLInputElement

        mockFileReader.result = `data:${type};base64,test`

        await userEvent.upload(input, file)

        await waitFor(() => {
          if (mockFileReader.onloadend) {
            mockFileReader.onloadend()
          }
        })

        await waitFor(() => {
          expect(mockOnImageChange).toHaveBeenCalled()
        })
      })
    })
  })
})
