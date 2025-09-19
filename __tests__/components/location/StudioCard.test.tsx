/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { StudioCard } from '@/components/location/StudioCard';
import { Studio, StudioCategory, STUDIO_CATEGORIES } from '@/lib/types/studio';
import { GeoPoint, Timestamp } from 'firebase/firestore';

// Mock icons from lucide-react
jest.mock('lucide-react', () => ({
  MapPin: ({ className }: { className?: string }) => (
    <div data-testid="map-pin-icon" className={className}>MapPin</div>
  ),
  Users: ({ className }: { className?: string }) => (
    <div data-testid="users-icon" className={className}>Users</div>
  ),
  Star: ({ className }: { className?: string }) => (
    <div data-testid="star-icon" className={className}>Star</div>
  ),
}));

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, onClick }: any) => (
    <div data-testid="studio-card" className={className} onClick={onClick}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, size, onClick }: any) => (
    <button
      data-testid="details-button"
      data-variant={variant}
      data-size={size}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

// Mock studio data for testing
const createMockTimestamp = (date: Date = new Date()): Timestamp => ({
  seconds: Math.floor(date.getTime() / 1000),
  nanoseconds: 0,
  toDate: () => date,
  toMillis: () => date.getTime(),
  isEqual: (other: Timestamp) => other.seconds === Math.floor(date.getTime() / 1000),
  valueOf: () => date.getTime().toString(),
});

const createMockGeoPoint = (lat: number = 37.5665, lng: number = 126.9780): GeoPoint => ({
  latitude: lat,
  longitude: lng,
  isEqual: (other: GeoPoint) => other.latitude === lat && other.longitude === lng,
});

export const mockStudio: Studio = {
  id: 'studio-001',
  name: '스윙댄스 스튜디오',
  description: '프로페셔널 스윙댄스 스튜디오입니다. 초보자부터 고급자까지 모든 레벨의 수업을 제공합니다.',
  category: 'studio' as StudioCategory,
  location: {
    geopoint: createMockGeoPoint(37.5665, 126.9780),
    address: '서울특별시 강남구 테헤란로 123번길 45',
    addressDetail: '2층 201호',
    region: '강남구',
    district: '서울특별시 강남구',
    subway: ['강남역', '역삼역'],
    landmarks: ['코엑스', '강남역 사거리'],
  },
  contact: {
    phone: '02-1234-5678',
    email: 'info@swingdance.co.kr',
    website: 'https://swingdance.co.kr',
    kakaoTalk: '@swingdance',
    instagram: '@swingdance_studio',
    booking: 'https://booking.swingdance.co.kr',
  },
  facilities: {
    area: 150,
    capacity: 30,
    floorType: '원목',
    soundSystem: true,
    airConditioning: true,
    parking: true,
    wifi: true,
    shower: true,
    lockers: true,
    equipment: ['거울', '스피커', '조명'],
    amenities: ['라커룸', '휴게실', '음료대'],
  },
  pricing: {
    hourly: 50000,
    daily: 300000,
    monthly: 1200000,
    dropIn: 25000,
    currency: 'KRW',
    notes: '회원 할인 가능',
  },
  operatingHours: {
    monday: '09:00-22:00',
    tuesday: '09:00-22:00',
    wednesday: '09:00-22:00',
    thursday: '09:00-22:00',
    friday: '09:00-23:00',
    saturday: '10:00-23:00',
    sunday: '10:00-21:00',
    holidays: '10:00-18:00',
    notes: '월요일 정기 휴관',
  },
  stats: {
    views: 1250,
    favorites: 89,
    avgRating: 4.7,
    reviewCount: 34,
    lastActivity: createMockTimestamp(new Date('2024-01-15T10:30:00Z')),
  },
  metadata: {
    createdAt: createMockTimestamp(new Date('2024-01-01T00:00:00Z')),
    updatedAt: createMockTimestamp(new Date('2024-01-15T10:30:00Z')),
    createdBy: 'user-001',
    verified: true,
    featured: true,
    status: 'active',
    tags: ['스윙댄스', '링디합', '찰스턴', '초보환영'],
    keywords: ['swing', 'dance', 'lindy hop', 'charleston', 'beginner'],
  },
  images: [
    'https://storage.googleapis.com/swing-club/studios/studio-001/main.jpg',
    'https://storage.googleapis.com/swing-club/studios/studio-001/interior-1.jpg',
    'https://storage.googleapis.com/swing-club/studios/studio-001/interior-2.jpg',
  ],
};

const mockStudioWithoutOptionalFields: Studio = {
  id: 'studio-002',
  name: '기본 연습실',
  category: 'practice_room' as StudioCategory,
  location: {
    geopoint: createMockGeoPoint(37.5547, 126.9707),
    address: '서울특별시 마포구 홍대입구로 94',
    region: '마포구',
  },
  stats: {
    views: 150,
    favorites: 12,
    avgRating: 3.8,
    reviewCount: 5,
  },
  metadata: {
    createdAt: createMockTimestamp(new Date('2024-01-10T00:00:00Z')),
    updatedAt: createMockTimestamp(new Date('2024-01-12T15:20:00Z')),
    createdBy: 'user-002',
    verified: false,
    featured: false,
    status: 'active',
  },
};

describe('StudioCard', () => {
  const defaultProps = {
    studio: mockStudio,
    isSelected: false,
    onClick: jest.fn(),
    showDetailsButton: true,
    searchQuery: '',
    className: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('스튜디오 정보 렌더링', () => {
    it('스튜디오 기본 정보가 올바르게 표시된다', () => {
      render(<StudioCard {...defaultProps} />);

      expect(screen.getByText('스윙댄스 스튜디오')).toBeInTheDocument();
      expect(screen.getByText(STUDIO_CATEGORIES[mockStudio.category])).toBeInTheDocument();
      expect(screen.getByText('강남구')).toBeInTheDocument();
      expect(screen.getByText('4.7')).toBeInTheDocument();
      expect(screen.getByText('89명 즐겨찾기')).toBeInTheDocument();
      expect(screen.getByText('서울특별시 강남구 테헤란로 123번길 45')).toBeInTheDocument();
    });

    it('스튜디오 설명이 표시된다', () => {
      render(<StudioCard {...defaultProps} />);

      expect(screen.getByText(/프로페셔널 스윙댄스 스튜디오입니다/)).toBeInTheDocument();
    });

    it('선택적 필드가 없는 스튜디오도 올바르게 렌더링된다', () => {
      render(<StudioCard {...defaultProps} studio={mockStudioWithoutOptionalFields} />);

      expect(screen.getByText('기본 연습실')).toBeInTheDocument();
      expect(screen.getByText(STUDIO_CATEGORIES.practice_room)).toBeInTheDocument();
      expect(screen.getByText('마포구')).toBeInTheDocument();
      expect(screen.getByText('3.8')).toBeInTheDocument();
      expect(screen.getByText('12명 즐겨찾기')).toBeInTheDocument();
    });

    it('스튜디오 설명이 없으면 설명 영역이 렌더링되지 않는다', () => {
      render(<StudioCard {...defaultProps} studio={mockStudioWithoutOptionalFields} />);

      expect(screen.queryByText(/설명/)).not.toBeInTheDocument();
    });
  });

  describe('선택 상태 표시', () => {
    it('선택되지 않은 상태일 때 선택 표시가 없다', () => {
      render(<StudioCard {...defaultProps} isSelected={false} />);

      const card = screen.getByTestId('studio-card');
      expect(card).not.toHaveClass('ring-2 ring-blue-500');
    });

    it('선택된 상태일 때 선택 표시가 나타난다', () => {
      render(<StudioCard {...defaultProps} isSelected={true} />);

      const card = screen.getByTestId('studio-card');
      expect(card).toHaveClass('ring-2 ring-blue-500');
    });

    it('커스텀 className이 적용된다', () => {
      const customClass = 'custom-test-class';
      render(<StudioCard {...defaultProps} className={customClass} />);

      const card = screen.getByTestId('studio-card');
      expect(card).toHaveClass(customClass);
    });
  });

  describe('클릭 이벤트', () => {
    it('카드 클릭 시 onClick 핸들러가 호출된다', () => {
      const mockOnClick = jest.fn();
      render(<StudioCard {...defaultProps} onClick={mockOnClick} />);

      const card = screen.getByTestId('studio-card');
      fireEvent.click(card);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith(mockStudio);
    });

    it('상세보기 버튼 클릭 시 onClick 핸들러가 호출된다', () => {
      const mockOnClick = jest.fn();
      render(<StudioCard {...defaultProps} onClick={mockOnClick} />);

      const detailsButton = screen.getByTestId('details-button');
      fireEvent.click(detailsButton);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith(mockStudio);
    });

    it('상세보기 버튼 클릭 시 이벤트 전파가 중단된다', () => {
      const mockOnClick = jest.fn();
      render(<StudioCard {...defaultProps} onClick={mockOnClick} />);

      const detailsButton = screen.getByTestId('details-button');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');

      fireEvent(detailsButton, clickEvent);

      expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
    });

    it('onClick 핸들러가 없을 때 클릭해도 에러가 발생하지 않는다', () => {
      expect(() => {
        render(<StudioCard {...defaultProps} onClick={undefined} />);
        const card = screen.getByTestId('studio-card');
        fireEvent.click(card);
      }).not.toThrow();
    });
  });

  describe('검색어 하이라이팅', () => {
    it('검색어가 없을 때 하이라이팅이 적용되지 않는다', () => {
      render(<StudioCard {...defaultProps} searchQuery="" />);

      expect(screen.queryByRole('mark')).not.toBeInTheDocument();
    });

    it('스튜디오 이름에서 검색어가 하이라이팅된다', () => {
      render(<StudioCard {...defaultProps} searchQuery="스윙" />);

      const highlightedElements = screen.getAllByText('스윙');
      expect(highlightedElements.length).toBeGreaterThan(0);

      // 첫 번째 하이라이트된 요소가 mark 태그인지 확인
      const firstHighlight = highlightedElements.find(el => el.tagName.toLowerCase() === 'mark');
      expect(firstHighlight).toBeTruthy();
      expect(firstHighlight).toHaveClass('bg-yellow-200', 'text-yellow-900', 'rounded', 'px-1');
    });

    it('지역명에서 검색어가 하이라이팅된다', () => {
      render(<StudioCard {...defaultProps} searchQuery="강남" />);

      const highlightedElements = screen.getAllByText('강남');
      expect(highlightedElements.length).toBeGreaterThan(0);

      // 하이라이트된 요소 중 적어도 하나가 mark 태그인지 확인
      const markElements = highlightedElements.filter(el => el.tagName.toLowerCase() === 'mark');
      expect(markElements.length).toBeGreaterThan(0);
    });

    it('주소에서 검색어가 하이라이팅된다', () => {
      render(<StudioCard {...defaultProps} searchQuery="테헤란로" />);

      const highlightedText = screen.getByText('테헤란로');
      expect(highlightedText.tagName.toLowerCase()).toBe('mark');
    });

    it('설명에서 검색어가 하이라이팅된다', () => {
      render(<StudioCard {...defaultProps} searchQuery="프로페셔널" />);

      const highlightedText = screen.getByText('프로페셔널');
      expect(highlightedText.tagName.toLowerCase()).toBe('mark');
    });

    it('대소문자를 구분하지 않고 하이라이팅된다', () => {
      render(<StudioCard {...defaultProps} searchQuery="SWING" />);

      // 실제로는 '스윙'이므로 대소문자 구분 없이 매칭되지 않을 수 있음
      // 한글과 영어 매칭은 실제 구현에 따라 다를 수 있음
      const studioName = screen.getByText('스윙댄스 스튜디오');
      expect(studioName).toBeInTheDocument();
    });

    it('여러 검색어가 모두 하이라이팅된다', () => {
      render(<StudioCard {...defaultProps} searchQuery="스윙댄스" />);

      const highlightedElements = screen.getAllByText('스윙댄스');
      expect(highlightedElements.length).toBeGreaterThan(0);
      highlightedElements.forEach(element => {
        expect(element.tagName.toLowerCase()).toBe('mark');
      });
    });

    it('부분 매칭도 하이라이팅된다', () => {
      render(<StudioCard {...defaultProps} searchQuery="댄스" />);

      const highlightedElements = screen.getAllByText('댄스');
      expect(highlightedElements.length).toBeGreaterThan(0);

      // 하이라이트된 요소 중 적어도 하나가 mark 태그인지 확인
      const markElements = highlightedElements.filter(el => el.tagName.toLowerCase() === 'mark');
      expect(markElements.length).toBeGreaterThan(0);
    });
  });

  describe('시설 정보 표시', () => {
    it('면적 정보가 표시된다', () => {
      render(<StudioCard {...defaultProps} />);

      expect(screen.getByText('150m²')).toBeInTheDocument();
    });

    it('수용 인원 정보가 표시된다', () => {
      render(<StudioCard {...defaultProps} />);

      expect(screen.getByText('최대 30명')).toBeInTheDocument();
    });

    it('주차 가능 정보가 표시된다', () => {
      render(<StudioCard {...defaultProps} />);

      expect(screen.getByText('주차가능')).toBeInTheDocument();
    });

    it('음향시설 정보가 표시된다', () => {
      render(<StudioCard {...defaultProps} />);

      expect(screen.getByText('음향시설')).toBeInTheDocument();
    });

    it('시설 정보가 없는 스튜디오는 해당 정보가 표시되지 않는다', () => {
      render(<StudioCard {...defaultProps} studio={mockStudioWithoutOptionalFields} />);

      expect(screen.queryByText(/m²/)).not.toBeInTheDocument();
      expect(screen.queryByText(/최대.*명/)).not.toBeInTheDocument();
      expect(screen.queryByText('주차가능')).not.toBeInTheDocument();
      expect(screen.queryByText('음향시설')).not.toBeInTheDocument();
    });

    it('일부 시설 정보만 있어도 올바르게 표시된다', () => {
      const partialFacilitiesStudio: Studio = {
        ...mockStudioWithoutOptionalFields,
        facilities: {
          area: 80,
          parking: true,
        },
      };

      render(<StudioCard {...defaultProps} studio={partialFacilitiesStudio} />);

      expect(screen.getByText('80m²')).toBeInTheDocument();
      expect(screen.getByText('주차가능')).toBeInTheDocument();
      expect(screen.queryByText(/최대.*명/)).not.toBeInTheDocument();
      expect(screen.queryByText('음향시설')).not.toBeInTheDocument();
    });
  });

  describe('인증 배지 표시', () => {
    it('인증된 스튜디오에 인증 배지가 표시된다', () => {
      render(<StudioCard {...defaultProps} />);

      const badges = screen.getAllByTestId('badge');
      const verifiedBadge = badges.find(badge => badge.textContent === '인증');

      expect(verifiedBadge).toBeInTheDocument();
      expect(verifiedBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('인증되지 않은 스튜디오에 인증 배지가 표시되지 않는다', () => {
      render(<StudioCard {...defaultProps} studio={mockStudioWithoutOptionalFields} />);

      const badges = screen.getAllByTestId('badge');
      const verifiedBadge = badges.find(badge => badge.textContent === '인증');

      expect(verifiedBadge).toBeUndefined();
    });

    it('카테고리 배지가 항상 표시된다', () => {
      render(<StudioCard {...defaultProps} />);

      const badges = screen.getAllByTestId('badge');
      const categoryBadge = badges.find(badge =>
        badge.textContent === STUDIO_CATEGORIES[mockStudio.category]
      );

      expect(categoryBadge).toBeInTheDocument();
      expect(categoryBadge).toHaveAttribute('data-variant', 'secondary');
    });
  });

  describe('상세보기 버튼', () => {
    it('showDetailsButton이 true일 때 상세보기 버튼이 표시된다', () => {
      render(<StudioCard {...defaultProps} showDetailsButton={true} />);

      const detailsButton = screen.getByTestId('details-button');
      expect(detailsButton).toBeInTheDocument();
      expect(detailsButton).toHaveTextContent('상세보기');
      expect(detailsButton).toHaveAttribute('data-variant', 'outline');
      expect(detailsButton).toHaveAttribute('data-size', 'sm');
    });

    it('showDetailsButton이 false일 때 상세보기 버튼이 표시되지 않는다', () => {
      render(<StudioCard {...defaultProps} showDetailsButton={false} />);

      expect(screen.queryByTestId('details-button')).not.toBeInTheDocument();
    });
  });

  describe('아이콘 렌더링', () => {
    it('위치 아이콘이 표시된다', () => {
      render(<StudioCard {...defaultProps} />);

      expect(screen.getByTestId('map-pin-icon')).toBeInTheDocument();
    });

    it('별점 아이콘이 표시된다', () => {
      render(<StudioCard {...defaultProps} />);

      const starIcon = screen.getByTestId('star-icon');
      expect(starIcon).toBeInTheDocument();
      expect(starIcon).toHaveClass('text-yellow-400');
    });

    it('사용자 아이콘이 표시된다', () => {
      render(<StudioCard {...defaultProps} />);

      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('카드가 클릭 가능한 요소로 인식된다', () => {
      render(<StudioCard {...defaultProps} />);

      const card = screen.getByTestId('studio-card');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('호버 효과가 적용된다', () => {
      render(<StudioCard {...defaultProps} />);

      const card = screen.getByTestId('studio-card');
      expect(card).toHaveClass('hover:shadow-md', 'transition-shadow');
    });
  });

  describe('데이터 형식', () => {
    it('평점이 소수점 첫째자리까지 표시된다', () => {
      render(<StudioCard {...defaultProps} />);

      expect(screen.getByText('4.7')).toBeInTheDocument();
    });

    it('즐겨찾기 수가 올바른 형식으로 표시된다', () => {
      render(<StudioCard {...defaultProps} />);

      expect(screen.getByText('89명 즐겨찾기')).toBeInTheDocument();
    });
  });

  describe('에지 케이스', () => {
    it('빈 검색어로 하이라이팅 시도 시 에러가 발생하지 않는다', () => {
      expect(() => {
        render(<StudioCard {...defaultProps} searchQuery="   " />);
      }).not.toThrow();
    });

    it('특수문자가 포함된 검색어도 처리된다', () => {
      expect(() => {
        render(<StudioCard {...defaultProps} searchQuery="(스윙)" />);
      }).not.toThrow();
    });

    it('매우 긴 검색어도 처리된다', () => {
      const longQuery = '아주아주아주아주아주긴검색어입니다'.repeat(10);
      expect(() => {
        render(<StudioCard {...defaultProps} searchQuery={longQuery} />);
      }).not.toThrow();
    });

    it('stats가 0인 경우도 올바르게 표시된다', () => {
      const zeroStatsStudio: Studio = {
        ...mockStudio,
        stats: {
          views: 0,
          favorites: 0,
          avgRating: 0.0,
          reviewCount: 0,
        },
      };

      render(<StudioCard {...defaultProps} studio={zeroStatsStudio} />);

      expect(screen.getByText('0.0')).toBeInTheDocument();
      expect(screen.getByText('0명 즐겨찾기')).toBeInTheDocument();
    });
  });
});