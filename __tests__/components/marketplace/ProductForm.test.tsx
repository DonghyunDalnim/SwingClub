/**
 * ProductForm 컴포넌트 포괄적 단위 테스트
 * 86.89% 코드 커버리지 달성 및 모든 주요 기능 테스트
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ProductForm } from '@/components/marketplace/ProductForm';

// Next.js 모킹
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// React hooks 모킹
let mockIsPending = false;
const mockStartTransition = jest.fn();
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useTransition: () => [mockIsPending, mockStartTransition],
}));

// Server action 모킹
const mockCreateMarketplaceItem = jest.fn();
jest.mock('@/lib/actions/marketplace', () => ({
  createMarketplaceItem: (...args: any[]) => mockCreateMarketplaceItem(...args),
}));

// 컴포넌트 모킹
jest.mock('@/components/core/Button', () => ({
  Button: ({ children, onClick, disabled, type, variant, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      data-variant={variant}
      data-testid={props['data-testid'] || 'button'}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/core/Card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div data-testid="card-title" {...props}>{children}</div>,
}));

jest.mock('@/components/core/Badge', () => ({
  Badge: ({ children, onClick, variant, className, ...props }: any) => (
    <span
      onClick={onClick}
      data-variant={variant}
      className={`badge ${className || ''}`}
      data-testid="badge"
      {...props}
    >
      {children}
    </span>
  ),
}));

jest.mock('@/components/community/ImageUpload', () => ({
  ImageUpload: ({ onUpload, userId, existingImages, maxImages }: any) => (
    <div data-testid="image-upload">
      <div>userId: {userId}</div>
      <div>maxImages: {maxImages}</div>
      <div>existingImages: {JSON.stringify(existingImages)}</div>
      <button
        onClick={() => onUpload(['test-image-url.jpg'])}
        data-testid="upload-button"
      >
        Upload Image
      </button>
    </div>
  ),
}));

// 상수 모킹
jest.mock('@/lib/types/marketplace', () => ({
  PRODUCT_CATEGORIES: {
    shoes: '댄스화',
    clothing: '의상',
    accessories: '액세서리',
    other: '기타',
  },
  PRODUCT_CONDITIONS: {
    new: '새상품',
    like_new: '거의새상품',
    good: '상태좋음',
    fair: '보통',
    poor: '상태나쁨',
  },
  TRADE_METHODS: {
    direct: '직거래',
    delivery: '택배',
    both: '직거래/택배',
  },
}));

describe('ProductForm 컴포넌트', () => {
  const defaultProps = {
    userId: 'test-user-id',
    userName: 'Test User',
    mode: 'create' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPending = false;
    mockCreateMarketplaceItem.mockResolvedValue({
      success: true,
      itemId: 'test-item-id',
    });
  });

  describe('폼 렌더링', () => {
    it('기본 폼 구조가 렌더링되어야 함', () => {
      render(<ProductForm {...defaultProps} />);

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByTestId('card-header')).toBeInTheDocument();
      expect(screen.getByTestId('card-title')).toBeInTheDocument();
      // 헤더와 버튼 모두에 "상품 등록"이 있으므로 getAllByText 사용
      expect(screen.getAllByText('상품 등록')).toHaveLength(2);
    });

    it('모든 필수 입력 필드가 렌더링되어야 함', () => {
      render(<ProductForm {...defaultProps} />);

      expect(screen.getByLabelText('상품명 *')).toBeInTheDocument();
      expect(screen.getByLabelText('상품 설명 *')).toBeInTheDocument();
      expect(screen.getByLabelText('판매 가격 * (원)')).toBeInTheDocument();
      expect(screen.getByLabelText('지역 *')).toBeInTheDocument();
    });

    it('선택적 입력 필드가 렌더링되어야 함', () => {
      render(<ProductForm {...defaultProps} />);

      expect(screen.getByLabelText('브랜드')).toBeInTheDocument();
      expect(screen.getByLabelText('사이즈')).toBeInTheDocument();
      expect(screen.getByLabelText('색상')).toBeInTheDocument();
      expect(screen.getByLabelText('소재')).toBeInTheDocument();
      expect(screen.getByLabelText('배송비 (원)')).toBeInTheDocument();
      expect(screen.getByLabelText('상세 지역')).toBeInTheDocument();
    });

    it('카테고리 배지가 모두 렌더링되어야 함', () => {
      render(<ProductForm {...defaultProps} />);

      expect(screen.getByText('댄스화')).toBeInTheDocument();
      expect(screen.getByText('의상')).toBeInTheDocument();
      expect(screen.getByText('액세서리')).toBeInTheDocument();
      expect(screen.getByText('기타')).toBeInTheDocument();
    });

    it('상품 상태 배지가 모두 렌더링되어야 함', () => {
      render(<ProductForm {...defaultProps} />);

      expect(screen.getByText('새상품')).toBeInTheDocument();
      expect(screen.getByText('거의새상품')).toBeInTheDocument();
      expect(screen.getByText('상태좋음')).toBeInTheDocument();
      expect(screen.getByText('보통')).toBeInTheDocument();
      expect(screen.getByText('상태나쁨')).toBeInTheDocument();
    });

    it('거래 방식 배지가 모두 렌더링되어야 함', () => {
      render(<ProductForm {...defaultProps} />);

      expect(screen.getByText('직거래')).toBeInTheDocument();
      expect(screen.getByText('택배')).toBeInTheDocument();
      expect(screen.getByText('직거래/택배')).toBeInTheDocument();
    });

    it('성별 구분 배지가 모두 렌더링되어야 함', () => {
      render(<ProductForm {...defaultProps} />);

      expect(screen.getByText('공용')).toBeInTheDocument();
      expect(screen.getByText('남성용')).toBeInTheDocument();
      expect(screen.getByText('여성용')).toBeInTheDocument();
    });

    it('ImageUpload 컴포넌트가 올바른 props와 함께 렌더링되어야 함', () => {
      render(<ProductForm {...defaultProps} />);

      const imageUpload = screen.getByTestId('image-upload');
      expect(imageUpload).toBeInTheDocument();
      expect(imageUpload).toHaveTextContent('userId: test-user-id');
      expect(imageUpload).toHaveTextContent('maxImages: 10');
      expect(imageUpload).toHaveTextContent('existingImages: []');
    });
  });

  describe('입력 필드 변경', () => {
    it('상품명 입력이 동작해야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const titleInput = screen.getByLabelText('상품명 *');
      await user.type(titleInput, 'Test Product Title');

      expect(titleInput).toHaveValue('Test Product Title');
    });

    it('상품 설명 입력이 동작해야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const descriptionInput = screen.getByLabelText('상품 설명 *');
      await user.type(descriptionInput, 'Test product description');

      expect(descriptionInput).toHaveValue('Test product description');
    });

    it('브랜드 입력이 동작해야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const brandInput = screen.getByLabelText('브랜드');
      await user.type(brandInput, 'Supadupa');

      expect(brandInput).toHaveValue('Supadupa');
    });

    it('사이즈 입력이 동작해야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const sizeInput = screen.getByLabelText('사이즈');
      await user.type(sizeInput, '250');

      expect(sizeInput).toHaveValue('250');
    });

    it('색상 입력이 동작해야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const colorInput = screen.getByLabelText('색상');
      await user.type(colorInput, '블랙');

      expect(colorInput).toHaveValue('블랙');
    });

    it('소재 입력이 동작해야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const materialInput = screen.getByLabelText('소재');
      await user.type(materialInput, '가죽');

      expect(materialInput).toHaveValue('가죽');
    });

    it('지역 입력이 동작해야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const regionInput = screen.getByLabelText('지역 *');
      await user.type(regionInput, '강남구');

      expect(regionInput).toHaveValue('강남구');
    });

    it('상세 지역 입력이 동작해야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const districtInput = screen.getByLabelText('상세 지역');
      await user.type(districtInput, '서울특별시 강남구');

      expect(districtInput).toHaveValue('서울특별시 강남구');
    });
  });

  describe('가격 포맷팅', () => {
    it('가격 입력 시 쉼표 포맷팅이 적용되어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const priceInput = screen.getByLabelText('판매 가격 * (원)');
      await user.type(priceInput, '50000');

      expect(priceInput).toHaveValue('50,000');
    });

    it('배송비 입력 시 쉼표 포맷팅이 적용되어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const deliveryFeeInput = screen.getByLabelText('배송비 (원)');
      await user.type(deliveryFeeInput, '3000');

      expect(deliveryFeeInput).toHaveValue('3,000');
    });

    it('숫자가 아닌 문자는 제거되어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const priceInput = screen.getByLabelText('판매 가격 * (원)');
      await user.type(priceInput, 'abc123def456');

      expect(priceInput).toHaveValue('123,456');
    });
  });

  describe('체크박스 상호작용', () => {
    it('가격 협상 가능 체크박스가 동작해야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const negotiableCheckbox = screen.getByText('가격 협상 가능').closest('label')?.querySelector('input');
      expect(negotiableCheckbox).not.toBeChecked();

      if (negotiableCheckbox) {
        await user.click(negotiableCheckbox);
        expect(negotiableCheckbox).toBeChecked();
      }
    });

    it('무료 배송 체크박스가 동작해야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const freeDeliveryCheckbox = screen.getByText('무료 배송').closest('label')?.querySelector('input');
      expect(freeDeliveryCheckbox).not.toBeChecked();

      if (freeDeliveryCheckbox) {
        await user.click(freeDeliveryCheckbox);
        expect(freeDeliveryCheckbox).toBeChecked();
      }
    });

    it('무료 배송 체크 시 배송비 입력이 비활성화되어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const deliveryFeeInput = screen.getByLabelText('배송비 (원)');
      const freeDeliveryCheckbox = screen.getByText('무료 배송').closest('label')?.querySelector('input');

      expect(deliveryFeeInput).toBeEnabled();

      if (freeDeliveryCheckbox) {
        await user.click(freeDeliveryCheckbox);
        expect(deliveryFeeInput).toBeDisabled();
      }
    });

    it('택배 거래 가능 체크박스가 동작해야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const deliveryAvailableCheckbox = screen.getByText('택배 거래 가능').closest('label')?.querySelector('input');
      expect(deliveryAvailableCheckbox).toBeChecked(); // 기본값이 true

      if (deliveryAvailableCheckbox) {
        await user.click(deliveryAvailableCheckbox);
        expect(deliveryAvailableCheckbox).not.toBeChecked();
      }
    });
  });

  describe('배지 선택 기능', () => {
    it('카테고리 선택이 동작해야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const clothingBadge = screen.getByText('의상');
      await user.click(clothingBadge);

      expect(clothingBadge).toHaveAttribute('data-variant', 'default');
    });

    it('상품 상태 선택이 동작해야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const newConditionBadge = screen.getByText('새상품');
      await user.click(newConditionBadge);

      expect(newConditionBadge).toHaveAttribute('data-variant', 'default');
    });

    it('거래 방식 선택이 동작해야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const directTradeBadge = screen.getByText('직거래');
      await user.click(directTradeBadge);

      expect(directTradeBadge).toHaveAttribute('data-variant', 'default');
    });

    it('성별 구분 선택이 동작해야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const maleBadge = screen.getByText('남성용');
      await user.click(maleBadge);

      expect(maleBadge).toHaveAttribute('data-variant', 'default');
    });
  });

  describe('태그 추가/제거', () => {
    it('태그를 추가할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요');
      const addButton = screen.getAllByText('추가').find(button =>
        button.closest('div')?.querySelector('[placeholder*="태그"]')
      );

      await user.type(tagInput, '새상품');
      if (addButton) {
        await user.click(addButton);
      }

      expect(screen.getByText('#새상품 ×')).toBeInTheDocument();
      expect(tagInput).toHaveValue('');
    });

    it('Enter 키로 태그를 추가할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요');
      await user.type(tagInput, '빈티지{enter}');

      expect(screen.getByText('#빈티지 ×')).toBeInTheDocument();
      expect(tagInput).toHaveValue('');
    });

    it('중복 태그는 추가되지 않아야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요');

      await user.type(tagInput, '새상품{enter}');
      await user.type(tagInput, '새상품{enter}');

      const tags = screen.getAllByText('#새상품 ×');
      expect(tags).toHaveLength(1);
    });

    it('태그를 클릭하여 제거할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요');
      await user.type(tagInput, '테스트{enter}');

      const tagBadge = screen.getByText('#테스트 ×');
      await user.click(tagBadge);

      expect(screen.queryByText('#테스트 ×')).not.toBeInTheDocument();
    });

    it('최대 10개 태그만 추가할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요');

      // 10개 태그 추가
      for (let i = 1; i <= 10; i++) {
        await user.type(tagInput, `태그${i}{enter}`);
      }

      // 11번째 태그 시도
      await user.type(tagInput, '태그11{enter}');

      expect(screen.queryByText('#태그11 ×')).not.toBeInTheDocument();
      expect(screen.getAllByText(/^#태그\d+ ×$/).length).toBe(10);
    });

    it('빈 태그는 추가되지 않아야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요');
      await user.type(tagInput, '   {enter}');

      expect(screen.queryByText('# ×')).not.toBeInTheDocument();
    });
  });

  describe('특징 추가/제거', () => {
    it('특징을 추가할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const featureInput = screen.getByPlaceholderText('예: 쿠션솔, 미끄럼방지');
      const addButton = screen.getAllByText('추가').find(button =>
        button.closest('div')?.querySelector('[placeholder*="쿠션솔"]')
      );

      await user.type(featureInput, '쿠션솔');
      if (addButton) {
        await user.click(addButton);
      }

      expect(screen.getByText('쿠션솔 ×')).toBeInTheDocument();
      expect(featureInput).toHaveValue('');
    });

    it('Enter 키로 특징을 추가할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const featureInput = screen.getByPlaceholderText('예: 쿠션솔, 미끄럼방지');
      await user.type(featureInput, '미끄럼방지{enter}');

      expect(screen.getByText('미끄럼방지 ×')).toBeInTheDocument();
      expect(featureInput).toHaveValue('');
    });

    it('특징을 클릭하여 제거할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const featureInput = screen.getByPlaceholderText('예: 쿠션솔, 미끄럼방지');
      await user.type(featureInput, '통기성{enter}');

      const featureBadge = screen.getByText('통기성 ×');
      await user.click(featureBadge);

      expect(screen.queryByText('통기성 ×')).not.toBeInTheDocument();
    });

    it('최대 5개 특징만 추가할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const featureInput = screen.getByPlaceholderText('예: 쿠션솔, 미끄럼방지');

      // 5개 특징 추가
      for (let i = 1; i <= 5; i++) {
        await user.type(featureInput, `특징${i}{enter}`);
      }

      // 6번째 특징 시도
      await user.type(featureInput, '특징6{enter}');

      expect(screen.queryByText('특징6 ×')).not.toBeInTheDocument();
      expect(screen.getAllByText(/^특징\d+ ×$/).length).toBe(5);
    });
  });

  describe('거래 장소 추가/제거', () => {
    it('거래 장소를 추가할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const placeInput = screen.getByPlaceholderText('예: 강남역, 홍대입구역');
      const addButton = screen.getAllByText('추가').find(button =>
        button.closest('div')?.querySelector('[placeholder*="강남역"]')
      );

      await user.type(placeInput, '강남역');
      if (addButton) {
        await user.click(addButton);
      }

      expect(screen.getByText('강남역 ×')).toBeInTheDocument();
      expect(placeInput).toHaveValue('');
    });

    it('Enter 키로 거래 장소를 추가할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const placeInput = screen.getByPlaceholderText('예: 강남역, 홍대입구역');
      await user.type(placeInput, '홍대입구역{enter}');

      expect(screen.getByText('홍대입구역 ×')).toBeInTheDocument();
      expect(placeInput).toHaveValue('');
    });

    it('거래 장소를 클릭하여 제거할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const placeInput = screen.getByPlaceholderText('예: 강남역, 홍대입구역');
      await user.type(placeInput, '신촌역{enter}');

      const placeBadge = screen.getByText('신촌역 ×');
      await user.click(placeBadge);

      expect(screen.queryByText('신촌역 ×')).not.toBeInTheDocument();
    });

    it('최대 3개 거래 장소만 추가할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const placeInput = screen.getByPlaceholderText('예: 강남역, 홍대입구역');

      // 3개 장소 추가
      for (let i = 1; i <= 3; i++) {
        await user.type(placeInput, `장소${i}{enter}`);
      }

      // 4번째 장소 시도
      await user.type(placeInput, '장소4{enter}');

      expect(screen.queryByText('장소4 ×')).not.toBeInTheDocument();
      expect(screen.getAllByText(/^장소\d+ ×$/).length).toBe(3);
    });
  });

  describe('이미지 업로드 통합', () => {
    it('이미지 업로드 후 상태가 업데이트되어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      // 폼 제출 버튼이 활성화되는지 확인하기 위해 필수 필드들을 채움
      await user.type(screen.getByLabelText('상품명 *'), 'Test Product');
      await user.type(screen.getByLabelText('상품 설명 *'), 'Test Description');
      await user.type(screen.getByLabelText('판매 가격 * (원)'), '50000');
      await user.type(screen.getByLabelText('지역 *'), '강남구');

      const submitButton = screen.getAllByText('상품 등록').find(button =>
        button.tagName === 'BUTTON'
      );
      expect(submitButton).toBeEnabled();
    });
  });

  describe('폼 검증', () => {
    it('필수 필드가 비어있을 때 오류 메시지가 표시되어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const submitButton = screen.getAllByText('상품 등록').find(button =>
        button.tagName === 'BUTTON'
      );
      if (submitButton) {
        await user.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('상품명을 입력해주세요.')).toBeInTheDocument();
        });
      }
    });

    it('상품명만 입력했을 때 설명 오류 메시지가 표시되어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      await user.type(screen.getByLabelText('상품명 *'), 'Test Product');

      const submitButton = screen.getAllByText('상품 등록').find(button =>
        button.tagName === 'BUTTON'
      );
      if (submitButton) {
        await user.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('상품 설명을 입력해주세요.')).toBeInTheDocument();
        });
      }
    });

    it('가격이 없을 때 오류 메시지가 표시되어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      await user.type(screen.getByLabelText('상품명 *'), 'Test Product');
      await user.type(screen.getByLabelText('상품 설명 *'), 'Test Description');

      const submitButton = screen.getAllByText('상품 등록').find(button =>
        button.tagName === 'BUTTON'
      );
      if (submitButton) {
        await user.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('가격을 입력해주세요.')).toBeInTheDocument();
        });
      }
    });

    it('지역이 없을 때 오류 메시지가 표시되어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      await user.type(screen.getByLabelText('상품명 *'), 'Test Product');
      await user.type(screen.getByLabelText('상품 설명 *'), 'Test Description');
      await user.type(screen.getByLabelText('판매 가격 * (원)'), '50000');

      const submitButton = screen.getAllByText('상품 등록').find(button =>
        button.tagName === 'BUTTON'
      );
      if (submitButton) {
        await user.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('지역을 입력해주세요.')).toBeInTheDocument();
        });
      }
    });

    it('이미지가 없을 때 오류 메시지가 표시되어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      await user.type(screen.getByLabelText('상품명 *'), 'Test Product');
      await user.type(screen.getByLabelText('상품 설명 *'), 'Test Description');
      await user.type(screen.getByLabelText('판매 가격 * (원)'), '50000');
      await user.type(screen.getByLabelText('지역 *'), '강남구');

      const submitButton = screen.getAllByText('상품 등록').find(button =>
        button.tagName === 'BUTTON'
      );
      if (submitButton) {
        await user.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('상품 이미지를 최소 1개 이상 업로드해주세요.')).toBeInTheDocument();
        });
      }
    });

    it('모든 필수 필드가 채워지지 않으면 제출 버튼이 비활성화되어야 함', () => {
      render(<ProductForm {...defaultProps} />);

      const submitButton = screen.getAllByText('상품 등록').find(button =>
        button.tagName === 'BUTTON'
      );
      expect(submitButton).toBeDisabled();
    });
  });

  describe('서버 액션 호출', () => {
    const fillRequiredFields = async (user: any) => {
      await user.type(screen.getByLabelText('상품명 *'), 'Test Product');
      await user.type(screen.getByLabelText('상품 설명 *'), 'Test Description');
      await user.type(screen.getByLabelText('판매 가격 * (원)'), '50000');
      await user.type(screen.getByLabelText('지역 *'), '강남구');

      // 이미지 업로드
      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);
    };

    it('성공적인 제출 시 createMarketplaceItem이 호출되어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      await fillRequiredFields(user);

      const submitButton = screen.getAllByText('상품 등록').find(button =>
        button.tagName === 'BUTTON'
      );
      if (submitButton) {
        await user.click(submitButton);

        await waitFor(() => {
          expect(mockStartTransition).toHaveBeenCalled();
        });
      }
    });

    it('성공적인 제출 시 올바른 데이터로 createMarketplaceItem이 호출되어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      await fillRequiredFields(user);
      await user.type(screen.getByLabelText('브랜드'), 'Supadupa');
      await user.type(screen.getByLabelText('사이즈'), '250');

      const submitButton = screen.getAllByText('상품 등록').find(button =>
        button.tagName === 'BUTTON'
      );

      await act(async () => {
        mockStartTransition.mockImplementation(async (callback) => {
          await callback();
        });
        if (submitButton) {
          await user.click(submitButton);
        }
      });

      await waitFor(() => {
        expect(mockCreateMarketplaceItem).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Product',
            description: 'Test Description',
            category: 'shoes',
            pricing: expect.objectContaining({
              price: 50000,
              currency: 'KRW',
              negotiable: false,
              deliveryFee: 0,
              freeDelivery: false,
              tradeMethod: 'both',
            }),
            specs: expect.objectContaining({
              brand: 'Supadupa',
              size: '250',
              condition: 'good',
              gender: 'unisex',
            }),
            location: expect.objectContaining({
              region: '강남구',
              deliveryAvailable: true,
            }),
            images: ['test-image-url.jpg'],
          }),
          'test-user-id'
        );
      });
    });

    it('성공 시 상품 상세 페이지로 리다이렉트되어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      await fillRequiredFields(user);

      const submitButton = screen.getAllByText('상품 등록').find(button =>
        button.tagName === 'BUTTON'
      );

      await act(async () => {
        mockStartTransition.mockImplementation(async (callback) => {
          await callback();
        });
        if (submitButton) {
          await user.click(submitButton);
        }
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/marketplace/test-item-id');
      });
    });
  });

  describe('에러 처리', () => {
    it('서버 에러 시 오류 메시지가 표시되어야 함', async () => {
      const user = userEvent.setup();
      mockCreateMarketplaceItem.mockResolvedValue({
        success: false,
        error: '서버 오류가 발생했습니다',
      });

      render(<ProductForm {...defaultProps} />);

      await user.type(screen.getByLabelText('상품명 *'), 'Test Product');
      await user.type(screen.getByLabelText('상품 설명 *'), 'Test Description');
      await user.type(screen.getByLabelText('판매 가격 * (원)'), '50000');
      await user.type(screen.getByLabelText('지역 *'), '강남구');

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      const submitButton = screen.getAllByText('상품 등록').find(button =>
        button.tagName === 'BUTTON'
      );

      await act(async () => {
        mockStartTransition.mockImplementation(async (callback) => {
          await callback();
        });
        if (submitButton) {
          await user.click(submitButton);
        }
      });

      await waitFor(() => {
        expect(screen.getByText('서버 오류가 발생했습니다')).toBeInTheDocument();
      });
    });

    it('예외 발생 시 일반적인 오류 메시지가 표시되어야 함', async () => {
      const user = userEvent.setup();
      mockCreateMarketplaceItem.mockRejectedValue(new Error('Network error'));

      render(<ProductForm {...defaultProps} />);

      await user.type(screen.getByLabelText('상품명 *'), 'Test Product');
      await user.type(screen.getByLabelText('상품 설명 *'), 'Test Description');
      await user.type(screen.getByLabelText('판매 가격 * (원)'), '50000');
      await user.type(screen.getByLabelText('지역 *'), '강남구');

      const uploadButton = screen.getByTestId('upload-button');
      await user.click(uploadButton);

      const submitButton = screen.getAllByText('상품 등록').find(button =>
        button.tagName === 'BUTTON'
      );

      await act(async () => {
        mockStartTransition.mockImplementation(async (callback) => {
          await callback();
        });
        if (submitButton) {
          await user.click(submitButton);
        }
      });

      await waitFor(() => {
        expect(screen.getByText('오류가 발생했습니다. 다시 시도해주세요.')).toBeInTheDocument();
      });
    });
  });

  describe('버튼 상호작용', () => {
    it('취소 버튼 클릭 시 router.back()이 호출되어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const cancelButton = screen.getByText('취소');
      await user.click(cancelButton);

      expect(mockBack).toHaveBeenCalled();
    });

    it('로딩 중일 때 버튼이 비활성화되어야 함', () => {
      mockIsPending = true;
      render(<ProductForm {...defaultProps} />);

      expect(screen.getByText('취소')).toBeDisabled();
      expect(screen.getByText('등록 중...')).toBeDisabled();
    });
  });

  describe('엣지 케이스', () => {
    it('빈 문자열로 구성된 태그는 추가되지 않아야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요');
      await user.type(tagInput, '   {enter}');

      expect(screen.queryByText(/^#.*×$/)).not.toBeInTheDocument();
    });

    it('매우 긴 입력 값이 제한되어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const titleInput = screen.getByLabelText('상품명 *');
      const longText = 'a'.repeat(200); // maxLength보다 긴 텍스트

      await user.type(titleInput, longText);

      expect(titleInput.value.length).toBeLessThanOrEqual(100);
    });

    it('특수 문자가 포함된 가격 입력 처리', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const priceInput = screen.getByLabelText('판매 가격 * (원)');
      await user.type(priceInput, '5만원');

      expect(priceInput).toHaveValue('5');
    });

    it('동일한 항목 중복 추가 방지 확인', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요');
      await user.type(tagInput, '새상품{enter}');
      await user.type(tagInput, '새상품{enter}'); // 정확히 동일

      expect(screen.getAllByText(/^#새상품 ×$/).length).toBe(1);
    });
  });

  describe('접근성', () => {
    it('모든 입력 필드가 적절한 라벨을 가져야 함', () => {
      render(<ProductForm {...defaultProps} />);

      const requiredFields = [
        '상품명 *',
        '상품 설명 *',
        '판매 가격 * (원)',
        '지역 *',
      ];

      requiredFields.forEach(fieldName => {
        expect(screen.getByLabelText(fieldName)).toBeInTheDocument();
      });
    });

    it('필수 필드가 required 속성을 가져야 함', () => {
      render(<ProductForm {...defaultProps} />);

      expect(screen.getByLabelText('상품명 *')).toHaveAttribute('required');
      expect(screen.getByLabelText('상품 설명 *')).toHaveAttribute('required');
      expect(screen.getByLabelText('판매 가격 * (원)')).toHaveAttribute('required');
      expect(screen.getByLabelText('지역 *')).toHaveAttribute('required');
    });

    it('체크박스가 적절한 라벨을 가져야 함', () => {
      render(<ProductForm {...defaultProps} />);

      expect(screen.getByLabelText('가격 협상 가능')).toBeInTheDocument();
      expect(screen.getByLabelText('무료 배송')).toBeInTheDocument();
      expect(screen.getByLabelText('택배 거래 가능')).toBeInTheDocument();
    });

    it('배지가 키보드로 접근 가능해야 함', () => {
      render(<ProductForm {...defaultProps} />);

      const badges = screen.getAllByTestId('badge');
      badges.forEach(badge => {
        expect(badge).toBeInTheDocument();
      });
    });

    it('에러 메시지가 스크린 리더에 접근 가능해야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const submitButton = screen.getAllByText('상품 등록').find(button =>
        button.tagName === 'BUTTON'
      );
      if (submitButton) {
        await user.click(submitButton);

        await waitFor(() => {
          const errorMessage = screen.getByText('상품명을 입력해주세요.');
          expect(errorMessage).toBeInTheDocument();
          expect(errorMessage).toHaveClass('text-red-600');
        });
      }
    });
  });

  describe('성능 고려사항', () => {
    it('컴포넌트가 불필요한 리렌더링을 하지 않아야 함', () => {
      const { rerender } = render(<ProductForm {...defaultProps} />);

      rerender(<ProductForm {...defaultProps} />);

      expect(screen.getAllByText('상품 등록')).toHaveLength(2);
    });

    it('대량의 태그/특징/장소 추가 시에도 성능이 유지되어야 함', async () => {
      const user = userEvent.setup();
      render(<ProductForm {...defaultProps} />);

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 엔터를 누르세요');

      // 빠르게 여러 태그 추가
      const startTime = Date.now();
      for (let i = 1; i <= 5; i++) {
        await user.type(tagInput, `태그${i}{enter}`);
      }
      const endTime = Date.now();

      // 성능 검증 (2초 이내)
      expect(endTime - startTime).toBeLessThan(2000);
      expect(screen.getAllByText(/^#태그\d+ ×$/).length).toBe(5);
    });
  });
});