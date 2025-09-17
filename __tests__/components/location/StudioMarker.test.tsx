import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { StudioMarker } from '@/components/location/StudioMarker';
import { Studio, StudioCategory } from '@/lib/types/studio';
import { GeoPoint, Timestamp } from 'firebase/firestore';

// Mock Kakao Map API
const mockMarker = {
  setMap: jest.fn(),
  setImage: jest.fn(),
  setZIndex: jest.fn(),
  getPosition: jest.fn(),
  getTitle: jest.fn(),
};

const mockMarkerImage = jest.fn();
const mockLatLng = jest.fn();
const mockSize = jest.fn();
const mockPoint = jest.fn();
const mockEventAddListener = jest.fn();

// Mock window.kakao
const mockKakao = {
  maps: {
    Marker: jest.fn(() => mockMarker),
    MarkerImage: mockMarkerImage,
    LatLng: mockLatLng,
    Size: mockSize,
    Point: mockPoint,
    event: {
      addListener: mockEventAddListener,
    },
  },
};

// Mock geoPointToKakao utility
jest.mock('@/lib/utils/geo', () => ({
  geoPointToKakao: jest.fn((geopoint) => ({
    lat: geopoint.latitude,
    lng: geopoint.longitude,
  })),
}));

describe('StudioMarker', () => {
  let mockMap: any;
  let mockOnClick: jest.Mock;
  let mockStudio: Studio;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup window.kakao mock
    Object.defineProperty(window, 'kakao', {
      value: mockKakao,
      writable: true,
    });

    mockMap = {
      id: 'test-map',
      getLevel: jest.fn(() => 3),
    };

    mockOnClick = jest.fn();

    // Create mock studio with all required properties
    mockStudio = {
      id: 'studio-1',
      name: 'Test Studio',
      description: 'A test dance studio',
      category: 'studio' as StudioCategory,
      location: {
        geopoint: new GeoPoint(37.5665, 126.9780), // Seoul coordinates
        address: '서울특별시 중구 세종대로 110',
        addressDetail: '3층',
        region: '중구',
        district: '서울특별시 중구',
        subway: ['시청역'],
        landmarks: ['덕수궁'],
      },
      contact: {
        phone: '02-1234-5678',
        email: 'test@studio.com',
        website: 'https://teststudio.com',
      },
      facilities: {
        area: 100,
        capacity: 20,
        floorType: '원목',
        soundSystem: true,
        airConditioning: true,
        parking: true,
        wifi: true,
      },
      pricing: {
        hourly: 50000,
        currency: 'KRW',
      },
      operatingHours: {
        monday: '09:00-22:00',
        tuesday: '09:00-22:00',
        wednesday: '09:00-22:00',
        thursday: '09:00-22:00',
        friday: '09:00-22:00',
        saturday: '10:00-20:00',
        sunday: '10:00-20:00',
      },
      stats: {
        views: 100,
        favorites: 10,
        avgRating: 4.5,
        reviewCount: 20,
        lastActivity: Timestamp.now(),
      },
      metadata: {
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'user-123',
        verified: true,
        featured: false,
        status: 'active',
        tags: ['swing', 'dance', 'lesson'],
        keywords: ['스윙댄스', '춤', '레슨'],
      },
      images: ['https://example.com/image1.jpg'],
    };
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      expect(container.firstChild).toBeNull(); // Component returns null
    });

    it('should create and display marker on map when kakao and map are available', () => {
      render(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      expect(mockKakao.maps.Marker).toHaveBeenCalledWith({
        position: expect.any(Object),
        image: expect.any(Object),
        title: mockStudio.name,
        clickable: true,
        zIndex: 1,
      });

      expect(mockMarker.setMap).toHaveBeenCalledWith(mockMap);
    });

    it('should not create marker when map is not provided', () => {
      render(
        <StudioMarker
          studio={mockStudio}
          map={null}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      expect(mockKakao.maps.Marker).not.toHaveBeenCalled();
      expect(mockMarker.setMap).not.toHaveBeenCalled();
    });

    it('should not create marker when kakao is not available', () => {
      // Remove kakao from window
      Object.defineProperty(window, 'kakao', {
        value: undefined,
        writable: true,
      });

      render(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      expect(mockMarker.setMap).not.toHaveBeenCalled();
    });

    it('should not create marker when studio is not provided', () => {
      render(
        <StudioMarker
          studio={null as any}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      expect(mockKakao.maps.Marker).not.toHaveBeenCalled();
      expect(mockMarker.setMap).not.toHaveBeenCalled();
    });
  });

  describe('Marker Image Selection by Category', () => {
    const testCases: Array<{ category: StudioCategory; expectedUrl: string }> = [
      {
        category: 'studio',
        expectedUrl: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker.png',
      },
      {
        category: 'practice_room',
        expectedUrl: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
      },
      {
        category: 'club',
        expectedUrl: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
      },
      {
        category: 'public_space',
        expectedUrl: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png',
      },
      {
        category: 'cafe',
        expectedUrl: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
      },
    ];

    testCases.forEach(({ category, expectedUrl }) => {
      it(`should use correct marker image for ${category} category`, () => {
        const studioWithCategory = {
          ...mockStudio,
          category,
        };

        render(
          <StudioMarker
            studio={studioWithCategory}
            map={mockMap}
            isSelected={false}
            onClick={mockOnClick}
          />
        );

        expect(mockMarkerImage).toHaveBeenCalledWith(
          expectedUrl,
          expect.any(Object),
          expect.any(Object)
        );
      });
    });

    it('should use default marker image for unknown category', () => {
      const studioWithUnknownCategory = {
        ...mockStudio,
        category: 'unknown' as StudioCategory,
      };

      render(
        <StudioMarker
          studio={studioWithUnknownCategory}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      expect(mockMarkerImage).toHaveBeenCalledWith(
        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker.png',
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe('Selected State Handling', () => {
    it('should use red marker image when isSelected is true', () => {
      render(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={true}
          onClick={mockOnClick}
        />
      );

      expect(mockMarkerImage).toHaveBeenCalledWith(
        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should set higher zIndex when isSelected is true', () => {
      render(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={true}
          onClick={mockOnClick}
        />
      );

      expect(mockKakao.maps.Marker).toHaveBeenCalledWith(
        expect.objectContaining({
          zIndex: 10,
        })
      );
    });

    it('should set lower zIndex when isSelected is false', () => {
      render(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      expect(mockKakao.maps.Marker).toHaveBeenCalledWith(
        expect.objectContaining({
          zIndex: 1,
        })
      );
    });

    it('should update marker image when isSelected changes', () => {
      const { rerender } = render(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      // Clear previous calls
      jest.clearAllMocks();

      // Re-render with isSelected = true
      rerender(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={true}
          onClick={mockOnClick}
        />
      );

      expect(mockMarker.setImage).toHaveBeenCalled();
      expect(mockMarker.setZIndex).toHaveBeenCalledWith(10);
    });

    it('should not update marker if kakao is not available during selection change', () => {
      const { rerender } = render(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      // Remove kakao from window
      Object.defineProperty(window, 'kakao', {
        value: undefined,
        writable: true,
      });

      jest.clearAllMocks();

      rerender(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={true}
          onClick={mockOnClick}
        />
      );

      expect(mockMarker.setImage).not.toHaveBeenCalled();
      expect(mockMarker.setZIndex).not.toHaveBeenCalled();
    });
  });

  describe('Click Event Handling', () => {
    it('should add click event listener to marker', () => {
      render(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      expect(mockEventAddListener).toHaveBeenCalledWith(
        mockMarker,
        'click',
        expect.any(Function)
      );
    });

    it('should call onClick with studio when marker is clicked', () => {
      render(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      // Get the click handler that was passed to addListener
      const clickHandler = mockEventAddListener.mock.calls[0][2];

      // Simulate marker click
      clickHandler();

      expect(mockOnClick).toHaveBeenCalledWith(mockStudio);
    });
  });

  describe('Marker Cleanup', () => {
    it('should remove marker from map when component unmounts', () => {
      const { unmount } = render(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      // Verify marker was created and added to map
      expect(mockMarker.setMap).toHaveBeenCalledWith(mockMap);

      // Clear previous calls to test cleanup
      jest.clearAllMocks();

      // Unmount component
      unmount();

      // Verify marker was removed from map
      expect(mockMarker.setMap).toHaveBeenCalledWith(null);
    });

    it('should handle cleanup when marker ref is null', () => {
      const { unmount } = render(
        <StudioMarker
          studio={mockStudio}
          map={null} // No map provided, so no marker created
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      // This should not throw an error
      expect(() => unmount()).not.toThrow();
    });

    it('should recreate marker when dependencies change', () => {
      const { rerender } = render(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      // Verify initial marker creation
      expect(mockMarker.setMap).toHaveBeenCalledWith(mockMap);
      expect(mockKakao.maps.Marker).toHaveBeenCalledTimes(1);

      // Clear mocks
      jest.clearAllMocks();

      // Create new studio and onClick to trigger effect
      const newStudio = { ...mockStudio, id: 'studio-2', name: 'New Studio' };
      const newOnClick = jest.fn();

      rerender(
        <StudioMarker
          studio={newStudio}
          map={mockMap}
          isSelected={false}
          onClick={newOnClick}
        />
      );

      // Verify cleanup of old marker and creation of new one
      expect(mockMarker.setMap).toHaveBeenCalledWith(null); // Cleanup
      expect(mockKakao.maps.Marker).toHaveBeenCalledTimes(1); // New marker
    });
  });

  describe('Marker Configuration', () => {
    it('should configure marker with correct position from geopoint', () => {
      render(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      expect(mockLatLng).toHaveBeenCalledWith(
        mockStudio.location.geopoint.latitude,
        mockStudio.location.geopoint.longitude
      );
    });

    it('should configure marker with correct title', () => {
      render(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      expect(mockKakao.maps.Marker).toHaveBeenCalledWith(
        expect.objectContaining({
          title: mockStudio.name,
        })
      );
    });

    it('should configure marker as clickable', () => {
      render(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      expect(mockKakao.maps.Marker).toHaveBeenCalledWith(
        expect.objectContaining({
          clickable: true,
        })
      );
    });

    it('should configure marker image with correct size and offset', () => {
      render(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      expect(mockSize).toHaveBeenCalledWith(24, 35);
      expect(mockPoint).toHaveBeenCalledWith(12, 35);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing studio location gracefully', () => {
      const studioWithoutLocation = {
        ...mockStudio,
        location: undefined as any,
      };

      expect(() => {
        render(
          <StudioMarker
            studio={studioWithoutLocation}
            map={mockMap}
            isSelected={false}
            onClick={mockOnClick}
          />
        );
      }).not.toThrow();
    });

    it('should handle invalid geopoint gracefully', () => {
      const studioWithInvalidGeopoint = {
        ...mockStudio,
        location: {
          ...mockStudio.location,
          geopoint: null as any,
        },
      };

      expect(() => {
        render(
          <StudioMarker
            studio={studioWithInvalidGeopoint}
            map={mockMap}
            isSelected={false}
            onClick={mockOnClick}
          />
        );
      }).not.toThrow();
    });

    it('should handle undefined studio name', () => {
      const studioWithoutName = {
        ...mockStudio,
        name: undefined as any,
      };

      render(
        <StudioMarker
          studio={studioWithoutName}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      expect(mockKakao.maps.Marker).toHaveBeenCalledWith(
        expect.objectContaining({
          title: undefined,
        })
      );
    });

    it('should handle onClick being undefined', () => {
      expect(() => {
        render(
          <StudioMarker
            studio={mockStudio}
            map={mockMap}
            isSelected={false}
            onClick={undefined as any}
          />
        );
      }).not.toThrow();
    });

    it('should handle rapid prop changes without errors', () => {
      const { rerender } = render(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      // Rapidly change props multiple times
      for (let i = 0; i < 5; i++) {
        rerender(
          <StudioMarker
            studio={mockStudio}
            map={mockMap}
            isSelected={i % 2 === 0}
            onClick={mockOnClick}
          />
        );
      }

      // Should not throw any errors
      expect(mockMarker.setImage).toHaveBeenCalledTimes(4); // 5 renders - 1 initial = 4 updates
    });
  });

  describe('Integration with Geo Utils', () => {
    it('should call geoPointToKakao with studio geopoint', () => {
      const { geoPointToKakao } = require('@/lib/utils/geo');

      render(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      expect(geoPointToKakao).toHaveBeenCalledWith(mockStudio.location.geopoint);
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should not leave dangling event listeners after unmount', () => {
      const { unmount } = render(
        <StudioMarker
          studio={mockStudio}
          map={mockMap}
          isSelected={false}
          onClick={mockOnClick}
        />
      );

      // Verify event listener was added
      expect(mockEventAddListener).toHaveBeenCalled();

      // Unmount component
      unmount();

      // Verify marker was removed (which should remove event listeners)
      expect(mockMarker.setMap).toHaveBeenCalledWith(null);
    });

    it('should handle multiple mount/unmount cycles correctly', () => {
      for (let i = 0; i < 3; i++) {
        const { unmount } = render(
          <StudioMarker
            studio={mockStudio}
            map={mockMap}
            isSelected={false}
            onClick={mockOnClick}
          />
        );
        unmount();
      }

      // Should have created and cleaned up 3 markers
      expect(mockKakao.maps.Marker).toHaveBeenCalledTimes(3);
      expect(mockMarker.setMap).toHaveBeenCalledWith(null);
    });
  });
});