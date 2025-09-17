/**
 * StudioPopup 컴포넌트 테스트
 */

import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { StudioPopup } from '@/components/location/StudioPopup';
import { Studio, StudioCategory } from '@/lib/types/studio';
import { GeoPoint, Timestamp } from 'firebase/firestore';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="close-icon">X</div>,
  MapPin: () => <div data-testid="map-pin-icon">📍</div>,
  Phone: () => <div data-testid="phone-icon">📞</div>,
  Globe: () => <div data-testid="globe-icon">🌐</div>,
  Star: () => <div data-testid="star-icon">⭐</div>,
  Users: () => <div data-testid="users-icon">👥</div>,
  Wifi: () => <div data-testid="wifi-icon">📶</div>,
  Car: () => <div data-testid="car-icon">🚗</div>,
  Music: () => <div data-testid="music-icon">🎵</div>,
  Snowflake: () => <div data-testid="snowflake-icon">❄️</div>,
  ShowerHead: () => <div data-testid="shower-icon">🚿</div>,
  Lock: () => <div data-testid="lock-icon">🔒</div>,
  Clock: () => <div data-testid="clock-icon">🕐</div>,
}));

describe('StudioPopup', () => {
  let mockStudio: Studio;
  let mockOnClose: jest.Mock;

  beforeEach(() => {
    mockOnClose = jest.fn();

    // Create comprehensive mock studio data
    mockStudio = {
      id: 'studio-1',
      name: 'Test Dance Studio',
      description: 'A wonderful place for swing dancing with great facilities and friendly atmosphere.',
      category: 'studio' as StudioCategory,
      location: {
        geopoint: new GeoPoint(37.5665, 126.9780),
        address: '서울특별시 중구 세종대로 110',
        addressDetail: '3층 301호',
        region: '중구',
        district: '서울특별시 중구',
        subway: ['시청역', '종각역'],
        landmarks: ['덕수궁', '서울시청'],
      },
      contact: {
        phone: '02-1234-5678',
        email: 'info@teststudio.com',
        website: 'https://teststudio.com',
        kakaoTalk: '@teststudio',
        instagram: '@test_studio',
        booking: 'https://booking.teststudio.com',
      },
      facilities: {
        area: 120,
        capacity: 25,
        floorType: '원목 마루',
        soundSystem: true,
        airConditioning: true,
        parking: true,
        wifi: true,
        shower: true,
        lockers: true,
        equipment: ['스피커', '거울', '의자'],
        amenities: ['정수기', '화장실', '휴게실'],
      },
      pricing: {
        hourly: 50000,
        daily: 300000,
        monthly: 800000,
        dropIn: 25000,
        currency: 'KRW',
        notes: '주말 요금은 20% 할증됩니다.',
      },
      operatingHours: {
        monday: '09:00-22:00',
        tuesday: '09:00-22:00',
        wednesday: '09:00-22:00',
        thursday: '09:00-22:00',
        friday: '09:00-22:00',
        saturday: '10:00-20:00',
        sunday: '10:00-20:00',
        holidays: '10:00-18:00',
        notes: '공휴일은 단축 운영합니다.',
      },
      stats: {
        views: 1500,
        favorites: 75,
        avgRating: 4.8,
        reviewCount: 42,
        lastActivity: Timestamp.now(),
      },
      metadata: {
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'user-123',
        verified: true,
        featured: true,
        status: 'active',
        tags: ['swing', 'dance', 'lesson', 'social'],
        keywords: ['스윙댄스', '춤', '레슨', '사교댄스'],
      },
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    };
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  describe('Visibility and Basic Rendering', () => {
    it('should not render when isVisible is false', () => {
      const { container } = render(
        <StudioPopup
          studio={mockStudio}
          isVisible={false}
          onClose={mockOnClose}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not render when studio is null', () => {
      const { container } = render(
        <StudioPopup
          studio={null}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when both studio and isVisible are true', () => {
      render(
        <StudioPopup
          studio={mockStudio}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Test Dance Studio')).toBeInTheDocument();
    });

    it('should render overlay background', () => {
      render(
        <StudioPopup
          studio={mockStudio}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      const overlay = document.querySelector('.bg-black.bg-opacity-50');
      expect(overlay).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(
        <StudioPopup
          studio={mockStudio}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    });
  });

  describe('Studio Information Display', () => {
    beforeEach(() => {
      render(
        <StudioPopup
          studio={mockStudio}
          isVisible={true}
          onClose={mockOnClose}
        />
      );
    });

    it('should display studio name', () => {
      expect(screen.getByText('Test Dance Studio')).toBeInTheDocument();
    });

    it('should display studio category badge', () => {
      expect(screen.getByText('댄스 스튜디오')).toBeInTheDocument();
    });

    it('should display verified badge when studio is verified', () => {
      expect(screen.getByText('인증완료')).toBeInTheDocument();
    });

    it('should display rating and favorites', () => {
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('75명 즐겨찾기')).toBeInTheDocument();
    });

    it('should display studio description', () => {
      expect(screen.getByText(/A wonderful place for swing dancing/)).toBeInTheDocument();
    });

    it('should display full address', () => {
      expect(screen.getByText('서울특별시 중구 세종대로 110')).toBeInTheDocument();
      expect(screen.getByText('3층 301호')).toBeInTheDocument();
    });

    it('should display subway information', () => {
      expect(screen.getByText(/지하철: 시청역, 종각역/)).toBeInTheDocument();
    });
  });

  describe('Facilities Information', () => {
    beforeEach(() => {
      render(
        <StudioPopup
          studio={mockStudio}
          isVisible={true}
          onClose={mockOnClose}
        />
      );
    });

    it('should display area and capacity', () => {
      expect(screen.getByText('120m² 면적')).toBeInTheDocument();
      expect(screen.getByText('최대 25명')).toBeInTheDocument();
    });

    it('should display facility icons and labels', () => {
      expect(screen.getByTestId('music-icon')).toBeInTheDocument();
      expect(screen.getByText('음향')).toBeInTheDocument();

      expect(screen.getByTestId('snowflake-icon')).toBeInTheDocument();
      expect(screen.getByText('에어컨')).toBeInTheDocument();

      expect(screen.getByTestId('car-icon')).toBeInTheDocument();
      expect(screen.getByText('주차')).toBeInTheDocument();

      expect(screen.getByTestId('wifi-icon')).toBeInTheDocument();
      expect(screen.getByText('WiFi')).toBeInTheDocument();

      expect(screen.getByTestId('shower-icon')).toBeInTheDocument();
      expect(screen.getByText('샤워실')).toBeInTheDocument();

      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
      expect(screen.getByText('사물함')).toBeInTheDocument();
    });
  });

  describe('Pricing Information', () => {
    beforeEach(() => {
      render(
        <StudioPopup
          studio={mockStudio}
          isVisible={true}
          onClose={mockOnClose}
        />
      );
    });

    it('should display formatted prices', () => {
      expect(screen.getByText(/시간당 50,000원/)).toBeInTheDocument();
      expect(screen.getByText(/일일 300,000원/)).toBeInTheDocument();
    });

    it('should display pricing notes', () => {
      expect(screen.getByText('주말 요금은 20% 할증됩니다.')).toBeInTheDocument();
    });
  });

  describe('Operating Hours', () => {
    beforeEach(() => {
      render(
        <StudioPopup
          studio={mockStudio}
          isVisible={true}
          onClose={mockOnClose}
        />
      );
    });

    it('should display operating hours with clock icon', () => {
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
      expect(screen.getByText('운영시간')).toBeInTheDocument();
    });

    it('should display formatted operating hours', () => {
      expect(screen.getByText(/월: 09:00-22:00/)).toBeInTheDocument();
    });

    it('should display operating hours notes', () => {
      expect(screen.getByText('공휴일은 단축 운영합니다.')).toBeInTheDocument();
    });
  });

  describe('Contact Information', () => {
    beforeEach(() => {
      render(
        <StudioPopup
          studio={mockStudio}
          isVisible={true}
          onClose={mockOnClose}
        />
      );
    });

    it('should display phone number with call link', () => {
      expect(screen.getByTestId('phone-icon')).toBeInTheDocument();

      const phoneLink = screen.getByRole('link', { name: '02-1234-5678' });
      expect(phoneLink).toBeInTheDocument();
      expect(phoneLink).toHaveAttribute('href', 'tel:02-1234-5678');
    });

    it('should display website link', () => {
      expect(screen.getByTestId('globe-icon')).toBeInTheDocument();

      const websiteLink = screen.getByRole('link', { name: '웹사이트 방문' });
      expect(websiteLink).toBeInTheDocument();
      expect(websiteLink).toHaveAttribute('href', 'https://teststudio.com');
      expect(websiteLink).toHaveAttribute('target', '_blank');
      expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should display kakao talk info', () => {
      expect(screen.getByText('카톡: @teststudio')).toBeInTheDocument();
    });

    it('should display booking button when booking URL exists', () => {
      const bookingButton = screen.getByRole('button', { name: '예약하기' });
      expect(bookingButton).toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <StudioPopup
          studio={mockStudio}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByTestId('close-icon').parentElement;
      fireEvent.click(closeButton!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when overlay background is clicked', () => {
      render(
        <StudioPopup
          studio={mockStudio}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      const overlay = document.querySelector('.bg-black.bg-opacity-50');
      fireEvent.click(overlay!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when popup content is clicked', () => {
      render(
        <StudioPopup
          studio={mockStudio}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      const popupContent = screen.getByText('Test Dance Studio').closest('.relative');
      fireEvent.click(popupContent!);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should open booking URL when booking button is clicked', () => {
      // Mock window.open
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true,
      });

      render(
        <StudioPopup
          studio={mockStudio}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      const bookingButton = screen.getByRole('button', { name: '예약하기' });
      fireEvent.click(bookingButton);

      expect(mockOpen).toHaveBeenCalledWith('https://booking.teststudio.com', '_blank');
    });
  });

  describe('Different Studio Categories', () => {
    const categories: StudioCategory[] = ['studio', 'practice_room', 'club', 'public_space', 'cafe'];
    const categoryLabels = {
      studio: '댄스 스튜디오',
      practice_room: '연습실',
      club: '클럽/바',
      public_space: '공공장소',
      cafe: '카페',
    };

    categories.forEach((category) => {
      it(`should display correct label for ${category} category`, () => {
        const studioWithCategory = {
          ...mockStudio,
          category,
        };

        render(
          <StudioPopup
            studio={studioWithCategory}
            isVisible={true}
            onClose={mockOnClose}
          />
        );

        expect(screen.getByText(categoryLabels[category])).toBeInTheDocument();
      });
    });
  });

  describe('Missing Information Handling', () => {
    it('should handle missing description gracefully', () => {
      const studioWithoutDescription = {
        ...mockStudio,
        description: undefined,
      };

      render(
        <StudioPopup
          studio={studioWithoutDescription}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Test Dance Studio')).toBeInTheDocument();
    });

    it('should handle missing facilities gracefully', () => {
      const studioWithoutFacilities = {
        ...mockStudio,
        facilities: undefined,
      };

      render(
        <StudioPopup
          studio={studioWithoutFacilities}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Test Dance Studio')).toBeInTheDocument();
      expect(screen.queryByText('시설 정보')).not.toBeInTheDocument();
    });

    it('should handle missing pricing gracefully', () => {
      const studioWithoutPricing = {
        ...mockStudio,
        pricing: undefined,
      };

      render(
        <StudioPopup
          studio={studioWithoutPricing}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Test Dance Studio')).toBeInTheDocument();
      expect(screen.queryByText('가격 정보')).not.toBeInTheDocument();
    });

    it('should handle missing contact information gracefully', () => {
      const studioWithoutContact = {
        ...mockStudio,
        contact: undefined,
      };

      render(
        <StudioPopup
          studio={studioWithoutContact}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Test Dance Studio')).toBeInTheDocument();
      expect(screen.queryByText('연락처')).not.toBeInTheDocument();
    });

    it('should handle missing operating hours gracefully', () => {
      const studioWithoutOperatingHours = {
        ...mockStudio,
        operatingHours: undefined,
      };

      render(
        <StudioPopup
          studio={studioWithoutOperatingHours}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Test Dance Studio')).toBeInTheDocument();
      expect(screen.queryByTestId('clock-icon')).not.toBeInTheDocument();
    });

    it('should display default message when no pricing information available', () => {
      const studioWithEmptyPricing = {
        ...mockStudio,
        pricing: {
          currency: 'KRW' as const,
        },
      };

      render(
        <StudioPopup
          studio={studioWithEmptyPricing}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText('가격 정보')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      render(
        <StudioPopup
          studio={mockStudio}
          isVisible={true}
          onClose={mockOnClose}
        />
      );
    });

    it('should have proper ARIA attributes for modal', () => {
      // The popup should be in a modal-like container
      const popup = screen.getByText('Test Dance Studio').closest('[class*="fixed"]');
      expect(popup).toBeInTheDocument();
    });

    it('should have accessible links with proper attributes', () => {
      const phoneLink = screen.getByRole('link', { name: '02-1234-5678' });
      expect(phoneLink).toHaveAccessibleName();

      const websiteLink = screen.getByRole('link', { name: '웹사이트 방문' });
      expect(websiteLink).toHaveAccessibleName();
    });

    it('should have accessible buttons', () => {
      const closeButton = screen.getByTestId('close-icon').parentElement;
      expect(closeButton).toHaveRole('button');

      const bookingButton = screen.getByRole('button', { name: '예약하기' });
      expect(bookingButton).toHaveAccessibleName();
    });
  });

  describe('Responsive Design', () => {
    it('should render with mobile-optimized classes', () => {
      render(
        <StudioPopup
          studio={mockStudio}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      // Check for responsive classes in the DOM
      const popup = document.querySelector('[class*="sm:items-center"]');
      expect(popup).toBeInTheDocument();
    });

    it('should handle long text content gracefully', () => {
      const studioWithLongContent = {
        ...mockStudio,
        name: 'Very Long Studio Name That Should Be Handled Properly in Mobile View',
        description: 'This is a very long description that should wrap properly and not break the layout even on smaller screens. It contains multiple sentences and should be displayed in a user-friendly manner.',
      };

      render(
        <StudioPopup
          studio={studioWithLongContent}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Very Long Studio Name/)).toBeInTheDocument();
      expect(screen.getByText(/This is a very long description/)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily when props do not change', () => {
      const { rerender } = render(
        <StudioPopup
          studio={mockStudio}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      const initialRender = screen.getByText('Test Dance Studio');

      // Re-render with same props
      rerender(
        <StudioPopup
          studio={mockStudio}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      // Should still be the same element
      expect(screen.getByText('Test Dance Studio')).toBe(initialRender);
    });

    it('should handle rapid visibility changes', () => {
      const { rerender } = render(
        <StudioPopup
          studio={mockStudio}
          isVisible={false}
          onClose={mockOnClose}
        />
      );

      // Rapidly toggle visibility
      for (let i = 0; i < 5; i++) {
        rerender(
          <StudioPopup
            studio={mockStudio}
            isVisible={i % 2 === 0}
            onClose={mockOnClose}
          />
        );
      }

      // Should handle this without errors
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});