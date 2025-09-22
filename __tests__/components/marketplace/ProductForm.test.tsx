import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { ProductForm } from '@/components/marketplace/ProductForm'
import { createMarketplaceItem } from '@/lib/actions/marketplace'
import type { CreateItemData } from '@/lib/types/marketplace'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))
jest.mock('@/lib/actions/marketplace')
jest.mock('@/components/community/ImageUpload', () => ({
  ImageUpload: ({ onUpload, existingImages, maxImages }: any) => (
    <div data-testid="image-upload">
      <button
        onClick={() => onUpload(['https://example.com/new-image.jpg'])}
        data-testid="upload-button"
      >
        Upload Image
      </button>
      <div data-testid="existing-images">
        {existingImages?.map((img: string, idx: number) => (
          <div key={idx} data-testid={`existing-image-${idx}`}>{img}</div>
        ))}
      </div>
      <div data-testid="max-images">Max: {maxImages}</div>
    </div>
  )
}))

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockedCreateMarketplaceItem = createMarketplaceItem as jest.MockedFunction<typeof createMarketplaceItem>

describe('ProductForm 컴포넌트', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseRouter.mockReturnValue(mockRouter)
  })

  describe('기본 렌더링', () => {
    it('상품 등록 폼을 올바르게 렌더링한다', () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      expect(screen.getByText('상품 등록')).toBeInTheDocument()
      expect(screen.getByLabelText('상품명 *')).toBeInTheDocument()
      expect(screen.getByLabelText('상품 설명 *')).toBeInTheDocument()
      expect(screen.getByLabelText('판매 가격 * (원)')).toBeInTheDocument()
      expect(screen.getByText('카테고리 *')).toBeInTheDocument()
      expect(screen.getByText('상품 상태 *')).toBeInTheDocument()
      expect(screen.getByLabelText('지역 *')).toBeInTheDocument()
      expect(screen.getByText('상품 이미지 *')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '상품 등록' })).toBeInTheDocument()
    })

    it('모든 필수 필드에 * 표시가 있다', () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      expect(screen.getByText('카테고리 *')).toBeInTheDocument()
      expect(screen.getByLabelText('상품명 *')).toBeInTheDocument()
      expect(screen.getByLabelText('상품 설명 *')).toBeInTheDocument()
      expect(screen.getByLabelText('판매 가격 * (원)')).toBeInTheDocument()
      expect(screen.getByLabelText('지역 *')).toBeInTheDocument()
      expect(screen.getByText('상품 이미지 *')).toBeInTheDocument()
    })
  })

  describe('카테고리 선택', () => {
    it('모든 카테고리 옵션을 표시한다', () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      expect(screen.getByText('댄스화')).toBeInTheDocument()
      expect(screen.getByText('의상')).toBeInTheDocument()
      expect(screen.getByText('액세서리')).toBeInTheDocument()
      expect(screen.getByText('기타')).toBeInTheDocument()
    })

    it('카테고리를 선택할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const clothingCategory = screen.getByText('의상')
      await user.click(clothingCategory)

      expect(clothingCategory).toBeInTheDocument()
    })

    it('기본값으로 댄스화가 선택되어 있다', () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const shoesCategory = screen.getByText('댄스화')
      expect(shoesCategory).toBeInTheDocument()
    })
  })

  describe('상품 상태 선택', () => {
    it('모든 상품 상태 옵션을 표시한다', () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      expect(screen.getByText('새상품')).toBeInTheDocument()
      expect(screen.getByText('거의새상품')).toBeInTheDocument()
      expect(screen.getByText('상태좋음')).toBeInTheDocument()
      expect(screen.getByText('보통')).toBeInTheDocument()
      expect(screen.getByText('상태나쁨')).toBeInTheDocument()
    })

    it('상품 상태를 선택할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const likeNewCondition = screen.getByText('거의새상품')
      await user.click(likeNewCondition)

      expect(likeNewCondition).toBeInTheDocument()
    })

    it('기본값으로 상태좋음이 선택되어 있다', () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const goodCondition = screen.getByText('상태좋음')
      expect(goodCondition).toBeInTheDocument()
    })
  })

  describe('거래 방식 선택', () => {
    it('모든 거래 방식 옵션을 표시한다', () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      expect(screen.getByText('직거래')).toBeInTheDocument()
      expect(screen.getByText('택배')).toBeInTheDocument()
      expect(screen.getByText('직거래/택배')).toBeInTheDocument()
    })

    it('거래 방식을 선택할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const directTradeMethod = screen.getByText('직거래')
      await user.click(directTradeMethod)

      expect(directTradeMethod).toBeInTheDocument()
    })

    it('기본값으로 직거래/택배가 선택되어 있다', () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const bothMethod = screen.getByText('직거래/택배')
      expect(bothMethod).toBeInTheDocument()
    })
  })

  describe('성별 구분 선택', () => {
    it('모든 성별 구분 옵션을 표시한다', () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      expect(screen.getByText('공용')).toBeInTheDocument()
      expect(screen.getByText('남성용')).toBeInTheDocument()
      expect(screen.getByText('여성용')).toBeInTheDocument()
    })

    it('성별 구분을 선택할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const femaleGender = screen.getByText('여성용')
      await user.click(femaleGender)

      expect(femaleGender).toBeInTheDocument()
    })

    it('기본값으로 공용이 선택되어 있다', () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const unisexGender = screen.getByText('공용')
      expect(unisexGender).toBeInTheDocument()
    })
  })

  describe('기본 정보 입력', () => {
    it('상품명을 입력할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('상품명 *')
      await user.type(titleInput, 'Supadance 댄스화 250')

      expect(titleInput).toHaveValue('Supadance 댄스화 250')
    })

    it('상품 설명을 입력할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const descriptionTextarea = screen.getByLabelText('상품 설명 *')
      await user.type(descriptionTextarea, '거의 새것 같은 상태의 라틴댄스화입니다.')

      expect(descriptionTextarea).toHaveValue('거의 새것 같은 상태의 라틴댄스화입니다.')
    })

    it('상품명 길이를 100자로 제한한다', () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('상품명 *')
      expect(titleInput).toHaveAttribute('maxLength', '100')
    })
  })

  describe('가격 정보 입력', () => {
    it('가격을 입력할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const priceInput = screen.getByLabelText('판매 가격 * (원)')
      await user.type(priceInput, '150000')

      expect(priceInput).toHaveValue('150,000')
    })

    it('가격에 천 단위 콤마를 자동으로 추가한다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const priceInput = screen.getByLabelText('판매 가격 * (원)')
      await user.type(priceInput, '1234567')

      expect(priceInput).toHaveValue('1,234,567')
    })

    it('배송비를 입력할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const deliveryFeeInput = screen.getByLabelText('배송비 (원)')
      await user.type(deliveryFeeInput, '3000')

      expect(deliveryFeeInput).toHaveValue('3,000')
    })

    it('가격 협상 가능 옵션을 선택할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const negotiableCheckbox = screen.getByLabelText('가격 협상 가능')
      await user.click(negotiableCheckbox)

      expect(negotiableCheckbox).toBeChecked()
    })

    it('무료 배송 선택 시 배송비 입력이 비활성화된다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const freeDeliveryCheckbox = screen.getByLabelText('무료 배송')
      const deliveryFeeInput = screen.getByLabelText('배송비 (원)')

      await user.click(freeDeliveryCheckbox)

      expect(freeDeliveryCheckbox).toBeChecked()
      expect(deliveryFeeInput).toBeDisabled()
    })
  })

  describe('상품 상세 정보 입력', () => {
    it('브랜드를 입력할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const brandInput = screen.getByLabelText('브랜드')
      await user.type(brandInput, 'Supadance')

      expect(brandInput).toHaveValue('Supadance')
    })

    it('사이즈를 입력할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const sizeInput = screen.getByLabelText('사이즈')
      await user.type(sizeInput, '250')

      expect(sizeInput).toHaveValue('250')
    })

    it('색상을 입력할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const colorInput = screen.getByLabelText('색상')
      await user.type(colorInput, '블랙')

      expect(colorInput).toHaveValue('블랙')
    })

    it('소재를 입력할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const materialInput = screen.getByLabelText('소재')
      await user.type(materialInput, '스웨이드')

      expect(materialInput).toHaveValue('스웨이드')
    })
  })

  describe('특징/기능 관리', () => {
    it('특징을 추가할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const featureInput = screen.getByPlaceholderText('예: 쿠션솔, 미끄럼방지')
      const addButton = screen.getAllByText('추가')[1] // 특징 추가 버튼 (두 번째)

      await user.type(featureInput, '쿠션솔')
      await user.click(addButton)

      expect(screen.getByText('쿠션솔 ×')).toBeInTheDocument()
      expect(featureInput).toHaveValue('')
    })

    it('엔터키로 특징을 추가할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const featureInput = screen.getByPlaceholderText('예: 쿠션솔, 미끄럼방지')

      await user.type(featureInput, '미끄럼방지{enter}')

      expect(screen.getByText('미끄럼방지 ×')).toBeInTheDocument()
      expect(featureInput).toHaveValue('')
    })

    it('중복 특징을 추가하지 않는다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const featureInput = screen.getByPlaceholderText('예: 쿠션솔, 미끄럼방지')
      const addButton = screen.getAllByText('추가')[1]

      await user.type(featureInput, '쿠션솔')
      await user.click(addButton)

      await user.type(featureInput, '쿠션솔')
      await user.click(addButton)

      const features = screen.getAllByText(/쿠션솔 ×/)
      expect(features).toHaveLength(1)
    })

    it('특징을 제거할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const featureInput = screen.getByPlaceholderText('예: 쿠션솔, 미끄럼방지')

      await user.type(featureInput, '쿠션솔{enter}')
      await user.type(featureInput, '미끄럼방지{enter}')

      const removeFeatureButton = screen.getByText('쿠션솔 ×')
      await user.click(removeFeatureButton)

      expect(screen.queryByText('쿠션솔 ×')).not.toBeInTheDocument()
      expect(screen.getByText('미끄럼방지 ×')).toBeInTheDocument()
    })

    it('특징 길이를 20자로 제한한다', () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const featureInput = screen.getByPlaceholderText('예: 쿠션솔, 미끄럼방지')
      expect(featureInput).toHaveAttribute('maxLength', '20')
    })
  })

  describe('거래 정보 입력', () => {
    it('지역을 입력할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const regionInput = screen.getByLabelText('지역 *')
      await user.type(regionInput, '강남구')

      expect(regionInput).toHaveValue('강남구')
    })

    it('상세 지역을 입력할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const districtInput = screen.getByLabelText('상세 지역')
      await user.type(districtInput, '서울특별시 강남구')

      expect(districtInput).toHaveValue('서울특별시 강남구')
    })

    it('선호 거래 장소를 추가할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const meetingPlaceInput = screen.getByPlaceholderText('예: 강남역, 홍대입구역')
      const addButton = screen.getAllByText('추가')[2] // 거래 장소 추가 버튼 (세 번째)

      await user.type(meetingPlaceInput, '강남역')
      await user.click(addButton)

      expect(screen.getByText('강남역 ×')).toBeInTheDocument()
      expect(meetingPlaceInput).toHaveValue('')
    })

    it('택배 거래 가능 옵션을 선택할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const deliveryAvailableCheckbox = screen.getByLabelText('택배 거래 가능')

      // 기본값으로 체크되어 있어야 함
      expect(deliveryAvailableCheckbox).toBeChecked()

      await user.click(deliveryAvailableCheckbox)

      expect(deliveryAvailableCheckbox).not.toBeChecked()
    })
  })

  describe('태그 관리', () => {
    it('태그를 추가할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요')
      const addButton = screen.getAllByText('추가')[3] // 태그 추가 버튼 (네 번째)

      await user.type(tagInput, '라틴댄스')
      await user.click(addButton)

      expect(screen.getByText('#라틴댄스 ×')).toBeInTheDocument()
      expect(tagInput).toHaveValue('')
    })

    it('엔터키로 태그를 추가할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요')

      await user.type(tagInput, '새상품{enter}')

      expect(screen.getByText('#새상품 ×')).toBeInTheDocument()
      expect(tagInput).toHaveValue('')
    })

    it('중복 태그를 추가하지 않는다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요')

      await user.type(tagInput, '라틴댄스{enter}')
      await user.type(tagInput, '라틴댄스{enter}')

      const tags = screen.getAllByText(/#라틴댄스 ×/)
      expect(tags).toHaveLength(1)
    })

    it('태그를 제거할 수 있다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요')

      await user.type(tagInput, '라틴댄스{enter}')
      await user.type(tagInput, '새상품{enter}')

      const removeTagButton = screen.getByText('#라틴댄스 ×')
      await user.click(removeTagButton)

      expect(screen.queryByText('#라틴댄스 ×')).not.toBeInTheDocument()
      expect(screen.getByText('#새상품 ×')).toBeInTheDocument()
    })

    it('태그 개수를 10개로 제한한다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요')

      // 10개 태그 추가
      for (let i = 1; i <= 10; i++) {
        await user.type(tagInput, `태그${i}{enter}`)
      }

      // 11번째 태그는 추가되지 않아야 함
      await user.type(tagInput, '태그11{enter}')

      expect(screen.queryByText('#태그11 ×')).not.toBeInTheDocument()
      expect(screen.getByText('#태그10 ×')).toBeInTheDocument()
    })

    it('태그 길이를 20자로 제한한다', () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요')
      expect(tagInput).toHaveAttribute('maxLength', '20')
    })
  })

  describe('이미지 업로드', () => {
    it('ImageUpload 컴포넌트를 렌더링한다', () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      expect(screen.getByTestId('image-upload')).toBeInTheDocument()
      expect(screen.getByTestId('max-images')).toHaveTextContent('Max: 10')
    })

    it('이미지 업로드를 처리한다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const uploadButton = screen.getByTestId('upload-button')
      await user.click(uploadButton)

      expect(uploadButton).toBeInTheDocument()
    })
  })

  describe('폼 검증', () => {
    it('필수 필드가 비어있으면 에러 메시지를 표시한다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const submitButton = screen.getByRole('button', { name: '상품 등록' })
      await user.click(submitButton)

      expect(screen.getByText('상품명을 입력해주세요.')).toBeInTheDocument()
    })

    it('상품 설명이 비어있으면 에러 메시지를 표시한다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('상품명 *')
      await user.type(titleInput, '댄스화')

      const submitButton = screen.getByRole('button', { name: '상품 등록' })
      await user.click(submitButton)

      expect(screen.getByText('상품 설명을 입력해주세요.')).toBeInTheDocument()
    })

    it('가격이 비어있으면 에러 메시지를 표시한다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('상품명 *')
      const descriptionTextarea = screen.getByLabelText('상품 설명 *')

      await user.type(titleInput, '댄스화')
      await user.type(descriptionTextarea, '설명')

      const submitButton = screen.getByRole('button', { name: '상품 등록' })
      await user.click(submitButton)

      expect(screen.getByText('가격을 입력해주세요.')).toBeInTheDocument()
    })

    it('지역이 비어있으면 에러 메시지를 표시한다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('상품명 *')
      const descriptionTextarea = screen.getByLabelText('상품 설명 *')
      const priceInput = screen.getByLabelText('판매 가격 * (원)')

      await user.type(titleInput, '댄스화')
      await user.type(descriptionTextarea, '설명')
      await user.type(priceInput, '10000')

      const submitButton = screen.getByRole('button', { name: '상품 등록' })
      await user.click(submitButton)

      expect(screen.getByText('지역을 입력해주세요.')).toBeInTheDocument()
    })

    it('이미지가 없으면 에러 메시지를 표시한다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('상품명 *')
      const descriptionTextarea = screen.getByLabelText('상품 설명 *')
      const priceInput = screen.getByLabelText('판매 가격 * (원)')
      const regionInput = screen.getByLabelText('지역 *')

      await user.type(titleInput, '댄스화')
      await user.type(descriptionTextarea, '설명')
      await user.type(priceInput, '10000')
      await user.type(regionInput, '강남구')

      const submitButton = screen.getByRole('button', { name: '상품 등록' })
      await user.click(submitButton)

      expect(screen.getByText('상품 이미지를 최소 1개 이상 업로드해주세요.')).toBeInTheDocument()
    })

    it('필수 필드가 모두 비어있으면 제출 버튼이 비활성화된다', () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const submitButton = screen.getByRole('button', { name: '상품 등록' })
      expect(submitButton).toBeDisabled()
    })

    it('필수 필드를 모두 입력하면 제출 버튼이 활성화된다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('상품명 *')
      const descriptionTextarea = screen.getByLabelText('상품 설명 *')
      const priceInput = screen.getByLabelText('판매 가격 * (원)')
      const regionInput = screen.getByLabelText('지역 *')
      const uploadButton = screen.getByTestId('upload-button')

      await user.type(titleInput, '댄스화')
      await user.type(descriptionTextarea, '설명')
      await user.type(priceInput, '10000')
      await user.type(regionInput, '강남구')
      await user.click(uploadButton) // 이미지 업로드

      const submitButton = screen.getByRole('button', { name: '상품 등록' })
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('상품 등록', () => {
    const fillRequiredFields = async () => {
      const titleInput = screen.getByLabelText('상품명 *')
      const descriptionTextarea = screen.getByLabelText('상품 설명 *')
      const priceInput = screen.getByLabelText('판매 가격 * (원)')
      const regionInput = screen.getByLabelText('지역 *')
      const uploadButton = screen.getByTestId('upload-button')

      await user.type(titleInput, 'Supadance 댄스화 250')
      await user.type(descriptionTextarea, '거의 새것 같은 라틴댄스화입니다.')
      await user.type(priceInput, '150000')
      await user.type(regionInput, '강남구')
      await user.click(uploadButton)
    }

    it('새 상품을 성공적으로 등록한다', async () => {
      mockedCreateMarketplaceItem.mockResolvedValue({
        success: true,
        itemId: 'new-item-123'
      })

      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      await fillRequiredFields()

      const shoesCategory = screen.getByText('댄스화')
      const brandInput = screen.getByLabelText('브랜드')
      const sizeInput = screen.getByLabelText('사이즈')

      await user.click(shoesCategory)
      await user.type(brandInput, 'Supadance')
      await user.type(sizeInput, '250')

      const submitButton = screen.getByRole('button', { name: '상품 등록' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedCreateMarketplaceItem).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Supadance 댄스화 250',
            description: '거의 새것 같은 라틴댄스화입니다.',
            category: 'shoes',
            pricing: expect.objectContaining({
              price: 150000,
              currency: 'KRW',
              negotiable: false,
              tradeMethod: 'both'
            }),
            specs: expect.objectContaining({
              brand: 'Supadance',
              size: '250',
              condition: 'good'
            }),
            location: expect.objectContaining({
              region: '강남구',
              deliveryAvailable: true
            }),
            images: ['https://example.com/new-image.jpg']
          }),
          'user-123'
        )
      })

      expect(mockRouter.push).toHaveBeenCalledWith('/marketplace/new-item-123')
    })

    it('상품 등록 실패 시 에러 메시지를 표시한다', async () => {
      mockedCreateMarketplaceItem.mockResolvedValue({
        success: false,
        error: '권한이 없습니다.'
      })

      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      await fillRequiredFields()

      const submitButton = screen.getByRole('button', { name: '상품 등록' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('권한이 없습니다.')).toBeInTheDocument()
      })
    })

    it('등록 중 로딩 상태를 표시한다', async () => {
      mockedCreateMarketplaceItem.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, itemId: 'test' }), 1000))
      )

      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      await fillRequiredFields()

      const submitButton = screen.getByRole('button', { name: '상품 등록' })
      await user.click(submitButton)

      expect(screen.getByText('등록 중...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
  })

  describe('취소 기능', () => {
    it('취소 버튼 클릭 시 이전 페이지로 이동한다', async () => {
      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const cancelButton = screen.getByText('취소')
      await user.click(cancelButton)

      expect(mockRouter.back).toHaveBeenCalled()
    })

    it('등록 중에는 취소 버튼이 비활성화된다', async () => {
      mockedCreateMarketplaceItem.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, itemId: 'test' }), 1000))
      )

      render(
        <ProductForm
          userId="user-123"
          userName="댄스용품러버"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('상품명 *')
      const descriptionTextarea = screen.getByLabelText('상품 설명 *')
      const priceInput = screen.getByLabelText('판매 가격 * (원)')
      const regionInput = screen.getByLabelText('지역 *')
      const uploadButton = screen.getByTestId('upload-button')

      await user.type(titleInput, '댄스화')
      await user.type(descriptionTextarea, '설명')
      await user.type(priceInput, '10000')
      await user.type(regionInput, '강남구')
      await user.click(uploadButton)

      const submitButton = screen.getByRole('button', { name: '상품 등록' })
      await user.click(submitButton)

      const cancelButton = screen.getByText('취소')
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('스윙댄스 커뮤니티 특화 시나리오', () => {
    it('댄스화 상품을 등록할 수 있다', async () => {
      mockedCreateMarketplaceItem.mockResolvedValue({
        success: true,
        itemId: 'shoes-item-123'
      })

      render(
        <ProductForm
          userId="user-123"
          userName="댄서"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('상품명 *')
      const descriptionTextarea = screen.getByLabelText('상품 설명 *')
      const priceInput = screen.getByLabelText('판매 가격 * (원)')
      const regionInput = screen.getByLabelText('지역 *')
      const uploadButton = screen.getByTestId('upload-button')
      const shoesCategory = screen.getByText('댄스화')
      const brandInput = screen.getByLabelText('브랜드')
      const sizeInput = screen.getByLabelText('사이즈')
      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요')

      await user.click(shoesCategory)
      await user.type(titleInput, 'Supadance 라틴댄스화')
      await user.type(descriptionTextarea, '거의 새것 같은 상태의 라틴댄스화입니다.')
      await user.type(priceInput, '180000')
      await user.type(brandInput, 'Supadance')
      await user.type(sizeInput, '250')
      await user.type(regionInput, '강남구')
      await user.click(uploadButton)
      await user.type(tagInput, '라틴댄스{enter}')
      await user.type(tagInput, '250{enter}')

      const submitButton = screen.getByRole('button', { name: '상품 등록' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedCreateMarketplaceItem).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Supadance 라틴댄스화',
            category: 'shoes',
            specs: expect.objectContaining({
              brand: 'Supadance',
              size: '250'
            }),
            tags: ['라틴댄스', '250']
          }),
          'user-123'
        )
      })
    })

    it('의상 상품을 등록할 수 있다', async () => {
      mockedCreateMarketplaceItem.mockResolvedValue({
        success: true,
        itemId: 'clothing-item-123'
      })

      render(
        <ProductForm
          userId="user-123"
          userName="댄서"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('상품명 *')
      const descriptionTextarea = screen.getByLabelText('상품 설명 *')
      const priceInput = screen.getByLabelText('판매 가격 * (원)')
      const regionInput = screen.getByLabelText('지역 *')
      const uploadButton = screen.getByTestId('upload-button')
      const clothingCategory = screen.getByText('의상')
      const sizeInput = screen.getByLabelText('사이즈')
      const colorInput = screen.getByLabelText('색상')
      const femaleGender = screen.getByText('여성용')
      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요')

      await user.click(clothingCategory)
      await user.type(titleInput, '라틴댄스 연습복')
      await user.type(descriptionTextarea, '편안한 라틴댄스 연습복입니다.')
      await user.type(priceInput, '45000')
      await user.type(sizeInput, 'M')
      await user.type(colorInput, '블랙')
      await user.click(femaleGender)
      await user.type(regionInput, '홍대')
      await user.click(uploadButton)
      await user.type(tagInput, '연습복{enter}')
      await user.type(tagInput, '여성용{enter}')

      const submitButton = screen.getByRole('button', { name: '상품 등록' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedCreateMarketplaceItem).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '라틴댄스 연습복',
            category: 'clothing',
            specs: expect.objectContaining({
              size: 'M',
              color: '블랙',
              gender: 'female'
            }),
            tags: ['연습복', '여성용']
          }),
          'user-123'
        )
      })
    })

    it('액세서리 상품을 등록할 수 있다', async () => {
      mockedCreateMarketplaceItem.mockResolvedValue({
        success: true,
        itemId: 'accessory-item-123'
      })

      render(
        <ProductForm
          userId="user-123"
          userName="댄서"
          mode="create"
        />
      )

      const titleInput = screen.getByLabelText('상품명 *')
      const descriptionTextarea = screen.getByLabelText('상품 설명 *')
      const priceInput = screen.getByLabelText('판매 가격 * (원)')
      const regionInput = screen.getByLabelText('지역 *')
      const uploadButton = screen.getByTestId('upload-button')
      const accessoryCategory = screen.getByText('액세서리')
      const brandInput = screen.getByLabelText('브랜드')
      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요')

      await user.click(accessoryCategory)
      await user.type(titleInput, '댄스 헤어핀 세트')
      await user.type(descriptionTextarea, '화려한 댄스용 헤어핀 세트입니다.')
      await user.type(priceInput, '25000')
      await user.type(brandInput, 'DanceStar')
      await user.type(regionInput, '신촌')
      await user.click(uploadButton)
      await user.type(tagInput, '헤어핀{enter}')
      await user.type(tagInput, '액세서리{enter}')

      const submitButton = screen.getByRole('button', { name: '상품 등록' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedCreateMarketplaceItem).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '댄스 헤어핀 세트',
            category: 'accessories',
            specs: expect.objectContaining({
              brand: 'DanceStar'
            }),
            tags: ['헤어핀', '액세서리']
          }),
          'user-123'
        )
      })
    })
  })
})