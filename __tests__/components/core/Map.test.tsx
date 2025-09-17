/**
 * Map 컴포넌트 테스트
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Map from '@/components/core/Map';
import { Studio, StudioCategory } from '@/lib/types/studio';
import { GeoPoint, Timestamp } from 'firebase/firestore';

// 카카오맵 관련 모듈 모킹
jest.mock('@/lib/kakao-map', () => ({
  loadKakaoMapSDK: jest.fn(),
  createKakaoMap: jest.fn(),
  getCurrentPosition: jest.fn(),
  createMarker: jest.fn(),
  DEFAULT_CENTER: { lat: 37.5665, lng: 126.9780 },
  DEFAULT_ZOOM_LEVEL: 3,
}));

// StudioMarker 컴포넌트 모킹
jest.mock('@/components/location/StudioMarker', () => {
  return function MockStudioMarker({ studio, isSelected, onClick }: any) {
    return (
      <div
        data-testid={`studio-marker-${studio.id}`}
        data-selected={isSelected}
        onClick={() => onClick(studio)}
        role="button"
      >
        {studio.name}
      </div>
    );
  };
});

// geo 유틸리티 모킹
jest.mock('@/lib/utils/geo', () => ({
  geoPointToKakao: jest.fn((geopoint: any) => ({
    lat: geopoint.latitude,
    lng: geopoint.longitude
  })),
}));

// 전역 모킹
const mockLoadKakaoMapSDK = require('@/lib/kakao-map').loadKakaoMapSDK;
const mockCreateKakaoMap = require('@/lib/kakao-map').createKakaoMap;
const mockGetCurrentPosition = require('@/lib/kakao-map').getCurrentPosition;
const mockCreateMarker = require('@/lib/kakao-map').createMarker;

// window.kakao 모킹
const mockMap = {
  setCenter: jest.fn(),
  getCenter: jest.fn(() => ({
    getLat: () => 37.5665,
    getLng: () => 126.9780,
  })),
};

const mockKakao = {
  maps: {
    event: {
      addListener: jest.fn(),
    },
    LatLng: jest.fn((lat, lng) => ({ lat, lng })),
  },
};

// window.location mock
const mockLocation = {
  reload: jest.fn(),
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// window.kakao mock
Object.defineProperty(window, 'kakao', {
  value: mockKakao,
  writable: true,
});

// 테스트용 스튜디오 데이터 팩토리
const createMockStudio = (overrides: Partial<Studio> = {}): Studio => ({
  id: 'studio-1',
  name: '테스트 스튜디오',
  description: '테스트용 스튜디오입니다',
  category: 'studio' as StudioCategory,
  location: {
    geopoint: new GeoPoint(37.5665, 126.9780),
    address: '서울시 중구 명동',
    region: '명동',
  },
  contact: {
    phone: '02-1234-5678',
    email: 'test@studio.com',
  },
  facilities: {
    area: 100,
    capacity: 20,
    soundSystem: true,
    airConditioning: true,
  },
  pricing: {
    hourly: 50000,
    currency: 'KRW',
  },
  stats: {
    views: 100,
    favorites: 10,
    avgRating: 4.5,
    reviewCount: 25,
  },
  metadata: {
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy: 'user-1',
    verified: true,
    featured: false,
    status: 'active',
  },
  images: ['image1.jpg', 'image2.jpg'],
  ...overrides,
});

describe('Map 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // 기본 성공 시나리오 설정
    mockLoadKakaoMapSDK.mockResolvedValue(undefined);
    mockCreateKakaoMap.mockReturnValue(mockMap);
    mockCreateMarker.mockReturnValue({ setMap: jest.fn() });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('로딩 상태를 표시해야 함', () => {
      render(<Map />);

      expect(screen.getByText('지도를 불러오는 중...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner') || document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('기본 props로 렌더링되어야 함', async () => {
      await act(async () => {
        render(<Map />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockLoadKakaoMapSDK).toHaveBeenCalled();
      });

      expect(mockCreateKakaoMap).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        {
          center: { lat: 37.5665, lng: 126.9780 },
          level: 3,
        }
      );
    });

    it('사용자 정의 props가 올바르게 적용되어야 함', async () => {
      const customCenter = { lat: 35.1595, lng: 126.8526 };
      const customLevel = 5;

      await act(async () => {
        render(
          <Map
            center={customCenter}
            level={customLevel}
            width="500px"
            height="300px"
            className="custom-map"
          />
        );
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockCreateKakaoMap).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          {
            center: customCenter,
            level: customLevel,
          }
        );
      });

      const mapContainer = screen.getByRole('generic');
      expect(mapContainer).toHaveStyle({
        width: '500px',
        height: '300px',
      });
    });
  });

  describe('스튜디오 기능', () => {
    const mockStudios: Studio[] = [
      createMockStudio({
        id: 'studio-1',
        name: '강남 댄스 스튜디오',
        category: 'studio',
        location: {
          geopoint: new GeoPoint(37.5173, 127.0473),
          address: '서울시 강남구',
          region: '강남',
        },
      }),
      createMockStudio({
        id: 'studio-2',
        name: '홍대 연습실',
        category: 'practice_room',
        location: {
          geopoint: new GeoPoint(37.5563, 126.9236),
          address: '서울시 마포구 홍대',
          region: '홍대',
        },
      }),
      createMockStudio({
        id: 'studio-3',
        name: '신촌 클럽',
        category: 'club',
        location: {
          geopoint: new GeoPoint(37.5596, 126.9426),
          address: '서울시 서대문구 신촌',
          region: '신촌',
        },
      }),
    ];

    it('studios prop으로 전달된 스튜디오들이 렌더링되어야 함', async () => {
      const onStudioSelect = jest.fn();

      await act(async () => {
        render(
          <Map
            studios={mockStudios}
            onStudioSelect={onStudioSelect}
          />
        );
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByTestId('studio-marker-studio-1')).toBeInTheDocument();
        expect(screen.getByTestId('studio-marker-studio-2')).toBeInTheDocument();
        expect(screen.getByTestId('studio-marker-studio-3')).toBeInTheDocument();
      });

      expect(screen.getByText('강남 댄스 스튜디오')).toBeInTheDocument();
      expect(screen.getByText('홍대 연습실')).toBeInTheDocument();
      expect(screen.getByText('신촌 클럽')).toBeInTheDocument();
    });

    it('빈 스튜디오 배열을 처리해야 함', async () => {
      await act(async () => {
        render(<Map studios={[]} />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockLoadKakaoMapSDK).toHaveBeenCalled();
      });

      // 스튜디오 마커가 없어야 함
      expect(screen.queryByTestId(/studio-marker-/)).not.toBeInTheDocument();
    });

    it('selectedStudioId로 선택된 스튜디오를 올바르게 처리해야 함', async () => {
      await act(async () => {
        render(
          <Map
            studios={mockStudios}
            selectedStudioId="studio-2"
          />
        );
        jest.runAllTimers();
      });

      await waitFor(() => {
        const selectedMarker = screen.getByTestId('studio-marker-studio-2');
        const unselectedMarker1 = screen.getByTestId('studio-marker-studio-1');
        const unselectedMarker3 = screen.getByTestId('studio-marker-studio-3');

        expect(selectedMarker).toHaveAttribute('data-selected', 'true');
        expect(unselectedMarker1).toHaveAttribute('data-selected', 'false');
        expect(unselectedMarker3).toHaveAttribute('data-selected', 'false');
      });
    });

    it('스튜디오 마커 클릭 시 onStudioSelect 콜백이 호출되어야 함', async () => {
      const onStudioSelect = jest.fn();

      await act(async () => {
        render(
          <Map
            studios={mockStudios}
            onStudioSelect={onStudioSelect}
          />
        );
        jest.runAllTimers();
      });

      await waitFor(() => {
        const studioMarker = screen.getByTestId('studio-marker-studio-1');
        fireEvent.click(studioMarker);
      });

      expect(onStudioSelect).toHaveBeenCalledWith(mockStudios[0]);
      expect(onStudioSelect).toHaveBeenCalledTimes(1);
    });

    it('onStudioSelect가 제공되지 않아도 에러가 발생하지 않아야 함', async () => {
      await act(async () => {
        render(<Map studios={mockStudios} />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        const studioMarker = screen.getByTestId('studio-marker-studio-1');

        // 에러 없이 클릭 가능해야 함
        expect(() => fireEvent.click(studioMarker)).not.toThrow();
      });
    });

    it('스튜디오 데이터 변경 시 마커가 업데이트되어야 함', async () => {
      const { rerender } = render(<Map studios={mockStudios.slice(0, 2)} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByTestId('studio-marker-studio-1')).toBeInTheDocument();
        expect(screen.getByTestId('studio-marker-studio-2')).toBeInTheDocument();
        expect(screen.queryByTestId('studio-marker-studio-3')).not.toBeInTheDocument();
      });

      // 스튜디오 추가
      await act(async () => {
        rerender(<Map studios={mockStudios} />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByTestId('studio-marker-studio-3')).toBeInTheDocument();
      });
    });

    it('selectedStudioId 변경 시 선택 상태가 업데이트되어야 함', async () => {
      const { rerender } = render(
        <Map
          studios={mockStudios}
          selectedStudioId="studio-1"
        />
      );

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByTestId('studio-marker-studio-1')).toHaveAttribute('data-selected', 'true');
        expect(screen.getByTestId('studio-marker-studio-2')).toHaveAttribute('data-selected', 'false');
      });

      // 선택된 스튜디오 변경
      await act(async () => {
        rerender(
          <Map
            studios={mockStudios}
            selectedStudioId="studio-2"
          />
        );
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByTestId('studio-marker-studio-1')).toHaveAttribute('data-selected', 'false');
        expect(screen.getByTestId('studio-marker-studio-2')).toHaveAttribute('data-selected', 'true');
      });
    });

    it('다양한 카테고리의 스튜디오들이 올바르게 렌더링되어야 함', async () => {
      const diverseStudios = [
        createMockStudio({ id: 'studio', category: 'studio', name: '댄스 스튜디오' }),
        createMockStudio({ id: 'practice', category: 'practice_room', name: '연습실' }),
        createMockStudio({ id: 'club', category: 'club', name: '클럽' }),
        createMockStudio({ id: 'public', category: 'public_space', name: '공공장소' }),
        createMockStudio({ id: 'cafe', category: 'cafe', name: '카페' }),
      ];

      await act(async () => {
        render(<Map studios={diverseStudios} />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        diverseStudios.forEach(studio => {
          expect(screen.getByTestId(`studio-marker-${studio.id}`)).toBeInTheDocument();
          expect(screen.getByText(studio.name)).toBeInTheDocument();
        });
      });
    });
  });

  describe('스튜디오 선택 기능', () => {
    it('selectedStudioId가 변경되면 해당 마커가 선택된 상태로 표시되어야 함', async () => {
      const studios = [
        createMockStudio({ id: 'studio-1', name: 'Studio 1' }),
        createMockStudio({ id: 'studio-2', name: 'Studio 2' }),
      ];
      const onStudioSelect = jest.fn();

      const { rerender } = render(
        <Map
          studios={studios}
          selectedStudioId={undefined}
          onStudioSelect={onStudioSelect}
        />
      );

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByTestId('studio-marker-studio-1')).toHaveAttribute('data-selected', 'false');
        expect(screen.getByTestId('studio-marker-studio-2')).toHaveAttribute('data-selected', 'false');
      });

      // 첫 번째 스튜디오 선택
      rerender(
        <Map
          studios={studios}
          selectedStudioId="studio-1"
          onStudioSelect={onStudioSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('studio-marker-studio-1')).toHaveAttribute('data-selected', 'true');
        expect(screen.getByTestId('studio-marker-studio-2')).toHaveAttribute('data-selected', 'false');
      });
    });

    it('마커 클릭 시 onStudioSelect 콜백이 호출되어야 함', async () => {
      const studios = [createMockStudio({ id: 'studio-1', name: 'Studio 1' })];
      const onStudioSelect = jest.fn();

      render(
        <Map
          studios={studios}
          onStudioSelect={onStudioSelect}
        />
      );

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        const marker = screen.getByTestId('studio-marker-studio-1');
        fireEvent.click(marker);
        expect(onStudioSelect).toHaveBeenCalledWith(studios[0]);
      });
    });

    it('onStudioSelect가 없어도 마커 클릭이 에러를 발생시키지 않아야 함', async () => {
      const studios = [createMockStudio({ id: 'studio-1', name: 'Studio 1' })];

      render(<Map studios={studios} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        const marker = screen.getByTestId('studio-marker-studio-1');
        expect(() => fireEvent.click(marker)).not.toThrow();
      });
    });
  });

  describe('스튜디오 목록 변경', () => {
    it('studios prop이 변경되면 마커들이 업데이트되어야 함', async () => {
      const initialStudios = [createMockStudio({ id: 'studio-1', name: 'Studio 1' })];
      const updatedStudios = [
        createMockStudio({ id: 'studio-1', name: 'Studio 1' }),
        createMockStudio({ id: 'studio-2', name: 'Studio 2' }),
      ];

      const { rerender } = render(<Map studios={initialStudios} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByTestId('studio-marker-studio-1')).toBeInTheDocument();
        expect(screen.queryByTestId('studio-marker-studio-2')).not.toBeInTheDocument();
      });

      rerender(<Map studios={updatedStudios} />);

      await waitFor(() => {
        expect(screen.getByTestId('studio-marker-studio-1')).toBeInTheDocument();
        expect(screen.getByTestId('studio-marker-studio-2')).toBeInTheDocument();
      });
    });

    it('빈 스튜디오 배열을 전달해도 에러가 발생하지 않아야 함', async () => {
      render(<Map studios={[]} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.queryByTestId(/studio-marker-/)).not.toBeInTheDocument();
      });
    });

    it('스튜디오가 제거되면 해당 마커도 제거되어야 함', async () => {
      const initialStudios = [
        createMockStudio({ id: 'studio-1', name: 'Studio 1' }),
        createMockStudio({ id: 'studio-2', name: 'Studio 2' }),
      ];
      const reducedStudios = [createMockStudio({ id: 'studio-1', name: 'Studio 1' })];

      const { rerender } = render(<Map studios={initialStudios} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByTestId('studio-marker-studio-1')).toBeInTheDocument();
        expect(screen.getByTestId('studio-marker-studio-2')).toBeInTheDocument();
      });

      rerender(<Map studios={reducedStudios} />);

      await waitFor(() => {
        expect(screen.getByTestId('studio-marker-studio-1')).toBeInTheDocument();
        expect(screen.queryByTestId('studio-marker-studio-2')).not.toBeInTheDocument();
      });
    });
  });

  describe('지도 초기화', () => {
    it('SDK 로딩 성공 후 지도를 생성해야 함', async () => {
      const onMapCreated = jest.fn();

      await act(async () => {
        render(<Map onMapCreated={onMapCreated} />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockLoadKakaoMapSDK).toHaveBeenCalled();
        expect(mockCreateKakaoMap).toHaveBeenCalled();
        expect(onMapCreated).toHaveBeenCalledWith(mockMap);
      });
    });

    it('center 변경 시 지도를 재초기화해야 함', async () => {
      const { rerender } = render(<Map center={{ lat: 37.5665, lng: 126.9780 }} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockCreateKakaoMap).toHaveBeenCalledTimes(1);
      });

      // center 변경
      await act(async () => {
        rerender(<Map center={{ lat: 35.1595, lng: 126.8526 }} />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockCreateKakaoMap).toHaveBeenCalledTimes(2);
      });
    });

    it('지도 중심 변경 이벤트를 처리해야 함', async () => {
      const onCenterChanged = jest.fn();
      let eventCallback: ((event: any) => void) | null = null;

      // event listener 모킹
      mockKakao.maps.event.addListener.mockImplementation((map, eventType, callback) => {
        if (eventType === 'center_changed') {
          eventCallback = callback;
        }
      });

      await act(async () => {
        render(<Map onCenterChanged={onCenterChanged} />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockKakao.maps.event.addListener).toHaveBeenCalledWith(
          mockMap,
          'center_changed',
          expect.any(Function)
        );
      });

      // 이벤트 트리거
      if (eventCallback) {
        act(() => {
          eventCallback({});
        });
      }

      expect(onCenterChanged).toHaveBeenCalledWith({
        lat: 37.5665,
        lng: 126.9780,
      });
    });
  });

  describe('에러 처리', () => {
    it('SDK 로딩 실패 시 에러 상태를 표시해야 함', async () => {
      const errorMessage = '카카오맵 SDK 로딩에 실패했습니다';
      mockLoadKakaoMapSDK.mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        render(<Map />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText('지도 로딩 실패')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(screen.getByText('❌')).toBeInTheDocument();
      });
    });

    it('에러 상태에서 새로고침 버튼이 동작해야 함', async () => {
      mockLoadKakaoMapSDK.mockRejectedValue(new Error('테스트 에러'));

      await act(async () => {
        render(<Map />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText('새로고침')).toBeInTheDocument();
      });

      const refreshButton = screen.getByText('새로고침');
      fireEvent.click(refreshButton);

      expect(mockLocation.reload).toHaveBeenCalled();
    });

    it('지도 생성 실패 시 에러를 처리해야 함', async () => {
      mockCreateKakaoMap.mockImplementation(() => {
        throw new Error('지도 생성 실패');
      });

      await act(async () => {
        render(<Map />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText('지도 로딩 실패')).toBeInTheDocument();
        expect(screen.getByText('지도 생성 실패')).toBeInTheDocument();
      });
    });

    it('예상치 못한 에러에 대해 기본 메시지를 표시해야 함', async () => {
      mockLoadKakaoMapSDK.mockRejectedValue('문자열 에러');

      await act(async () => {
        render(<Map />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText('지도 로딩 중 오류가 발생했습니다.')).toBeInTheDocument();
      });
    });

    it('스튜디오 props가 있어도 에러 처리가 동작해야 함', async () => {
      const mockStudios = [createMockStudio()];
      mockLoadKakaoMapSDK.mockRejectedValue(new Error('SDK 에러'));

      await act(async () => {
        render(<Map studios={mockStudios} />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText('지도 로딩 실패')).toBeInTheDocument();
        expect(screen.getByText('SDK 에러')).toBeInTheDocument();
      });

      // 스튜디오 마커는 렌더링되지 않아야 함
      expect(screen.queryByTestId('studio-marker-studio-1')).not.toBeInTheDocument();
    });
  });

  describe('현재 위치 기능', () => {
    it('현재 위치 버튼이 렌더링되어야 함', async () => {
      await act(async () => {
        render(<Map />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        const locationButton = screen.getByTitle('현재 위치로 이동');
        expect(locationButton).toBeInTheDocument();
      });
    });

    it('현재 위치 버튼 클릭 시 위치를 가져와야 함', async () => {
      const mockPosition = {
        coords: { latitude: 37.1234, longitude: 127.5678, accuracy: 100 },
        timestamp: Date.now(),
      };

      mockGetCurrentPosition.mockImplementation((onSuccess) => {
        onSuccess(mockPosition);
      });

      await act(async () => {
        render(<Map />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        const locationButton = screen.getByTitle('현재 위치로 이동');
        fireEvent.click(locationButton);
      });

      expect(mockGetCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('위치 정보 획득 성공 시 지도 중심을 이동해야 함', async () => {
      const mockPosition = {
        coords: { latitude: 37.1234, longitude: 127.5678, accuracy: 100 },
        timestamp: Date.now(),
      };

      mockGetCurrentPosition.mockImplementation((onSuccess) => {
        onSuccess(mockPosition);
      });

      await act(async () => {
        render(<Map />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        const locationButton = screen.getByTitle('현재 위치로 이동');
        fireEvent.click(locationButton);
      });

      expect(mockMap.setCenter).toHaveBeenCalledWith({
        lat: 37.1234,
        lng: 127.5678,
      });
      expect(mockCreateMarker).toHaveBeenCalledWith(
        mockMap,
        { lat: 37.1234, lng: 127.5678 },
        '현재 위치'
      );
    });

    it('현재 위치 표시가 업데이트되어야 함', async () => {
      const mockPosition = {
        coords: { latitude: 37.1234, longitude: 127.5678, accuracy: 100 },
        timestamp: Date.now(),
      };

      mockGetCurrentPosition.mockImplementation((onSuccess) => {
        onSuccess(mockPosition);
      });

      await act(async () => {
        render(<Map />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        const locationButton = screen.getByTitle('현재 위치로 이동');
        fireEvent.click(locationButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/현재 위치: 37.1234, 127.5678/)).toBeInTheDocument();
      });
    });

    it('위치 정보 획득 실패 시 에러를 표시해야 함', async () => {
      const errorMessage = '위치 정보 접근이 거부되었습니다';

      mockGetCurrentPosition.mockImplementation((onSuccess, onError) => {
        onError({ code: 1, message: errorMessage });
      });

      await act(async () => {
        render(<Map />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        const locationButton = screen.getByTitle('현재 위치로 이동');
        fireEvent.click(locationButton);
      });

      await waitFor(() => {
        expect(screen.getByText(`위치 정보 오류: ${errorMessage}`)).toBeInTheDocument();
      });
    });

    it('스튜디오가 있는 상태에서 현재 위치 기능이 동작해야 함', async () => {
      const mockStudios = [createMockStudio()];
      const mockPosition = {
        coords: { latitude: 37.1234, longitude: 127.5678, accuracy: 100 },
        timestamp: Date.now(),
      };

      mockGetCurrentPosition.mockImplementation((onSuccess) => {
        onSuccess(mockPosition);
      });

      await act(async () => {
        render(<Map studios={mockStudios} />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        const locationButton = screen.getByTitle('현재 위치로 이동');
        fireEvent.click(locationButton);
      });

      expect(mockMap.setCenter).toHaveBeenCalledWith({
        lat: 37.1234,
        lng: 127.5678,
      });

      // 스튜디오 마커와 현재 위치가 함께 표시되어야 함
      await waitFor(() => {
        expect(screen.getByTestId('studio-marker-studio-1')).toBeInTheDocument();
        expect(screen.getByText(/현재 위치: 37.1234, 127.5678/)).toBeInTheDocument();
      });
    });
  });

  describe('스타일링 및 레이아웃', () => {
    it('기본 스타일이 적용되어야 함', () => {
      render(<Map />);

      const container = document.querySelector('.relative');
      expect(container).toBeInTheDocument();
      expect(container).toHaveStyle({ width: '100%', height: '400px' });
    });

    it('사용자 정의 className이 적용되어야 함', () => {
      render(<Map className="custom-class" />);

      const container = document.querySelector('.custom-class');
      expect(container).toBeInTheDocument();
    });

    it('사용자 정의 크기가 적용되어야 함', () => {
      render(<Map width="600px" height="300px" />);

      const container = document.querySelector('.relative');
      expect(container).toHaveStyle({
        width: '600px',
        height: '300px',
      });
    });

    it('현재 위치 버튼이 올바른 위치에 표시되어야 함', async () => {
      await act(async () => {
        render(<Map />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        const locationButton = screen.getByTitle('현재 위치로 이동');
        expect(locationButton).toHaveClass('absolute', 'top-3', 'right-3');
      });
    });

    it('스튜디오가 있을 때도 레이아웃이 올바르게 적용되어야 함', async () => {
      const mockStudios = [createMockStudio()];

      await act(async () => {
        render(<Map studios={mockStudios} width="800px" height="500px" />);
        jest.runAllTimers();
      });

      const container = document.querySelector('.relative');
      expect(container).toHaveStyle({
        width: '800px',
        height: '500px',
      });

      await waitFor(() => {
        expect(screen.getByTestId('studio-marker-studio-1')).toBeInTheDocument();
      });
    });
  });

  describe('컴포넌트 생명주기', () => {
    it('컴포넌트 언마운트 시 정리 작업을 수행해야 함', async () => {
      const { unmount } = render(<Map />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockLoadKakaoMapSDK).toHaveBeenCalled();
      });

      // 언마운트
      unmount();

      // 메모리 누수가 없는지 확인 (추가 호출이 없어야 함)
      expect(mockLoadKakaoMapSDK).toHaveBeenCalledTimes(1);
    });

    it('mapContainerRef가 없으면 초기화하지 않아야 함', () => {
      // useRef가 null을 반환하도록 모킹
      jest.spyOn(React, 'useRef').mockReturnValue({ current: null });

      render(<Map />);

      expect(mockLoadKakaoMapSDK).not.toHaveBeenCalled();
    });

    it('props 변경 시 재초기화가 수행되어야 함', async () => {
      const { rerender } = render(<Map level={3} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockCreateKakaoMap).toHaveBeenCalledTimes(1);
      });

      // level 변경
      await act(async () => {
        rerender(<Map level={5} />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockCreateKakaoMap).toHaveBeenCalledTimes(2);
      });
    });

    it('스튜디오와 함께 언마운트되어야 함', async () => {
      const mockStudios = [createMockStudio()];
      const { unmount } = render(<Map studios={mockStudios} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByTestId('studio-marker-studio-1')).toBeInTheDocument();
      });

      // 언마운트 시 에러 없이 정리되어야 함
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('접근성', () => {
    it('현재 위치 버튼에 적절한 title 속성이 있어야 함', async () => {
      await act(async () => {
        render(<Map />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        const locationButton = screen.getByTitle('현재 위치로 이동');
        expect(locationButton).toBeInTheDocument();
      });
    });

    it('키보드로 현재 위치 버튼에 접근할 수 있어야 함', async () => {
      await act(async () => {
        render(<Map />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        const locationButton = screen.getByTitle('현재 위치로 이동');
        expect(locationButton).toHaveAttribute('tabIndex', '0');
      });
    });

    it('스크린 리더를 위한 적절한 텍스트가 제공되어야 함', () => {
      render(<Map />);

      expect(screen.getByText('지도를 불러오는 중...')).toBeInTheDocument();
    });

    it('스튜디오 마커가 접근성 속성을 가져야 함', async () => {
      const mockStudios = [createMockStudio()];

      await act(async () => {
        render(<Map studios={mockStudios} />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        const studioMarker = screen.getByTestId('studio-marker-studio-1');
        expect(studioMarker).toHaveAttribute('role', 'button');
      });
    });
  });

  describe('성능 최적화', () => {
    it('동일한 props로 재렌더링 시 불필요한 초기화를 하지 않아야 함', async () => {
      const props = {
        center: { lat: 37.5665, lng: 126.9780 },
        level: 3,
      };

      const { rerender } = render(<Map {...props} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockCreateKakaoMap).toHaveBeenCalledTimes(1);
      });

      // 동일한 props로 재렌더링
      rerender(<Map {...props} />);

      // 추가 초기화가 발생하지 않아야 함
      expect(mockCreateKakaoMap).toHaveBeenCalledTimes(1);
    });

    it('지도 컨테이너가 올바르게 설정되어야 함', async () => {
      await act(async () => {
        render(<Map />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockCreateKakaoMap).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          expect.any(Object)
        );
      });

      const containerElement = mockCreateKakaoMap.mock.calls[0][0];
      expect(containerElement).toBeInstanceOf(HTMLElement);
    });

    it('많은 수의 스튜디오도 효율적으로 렌더링해야 함', async () => {
      const manyStudios = Array.from({ length: 50 }, (_, index) =>
        createMockStudio({
          id: `studio-${index}`,
          name: `스튜디오 ${index}`,
        })
      );

      await act(async () => {
        render(<Map studios={manyStudios} />);
        jest.runAllTimers();
      });

      await waitFor(() => {
        // 첫 번째와 마지막 스튜디오가 렌더링되는지 확인
        expect(screen.getByTestId('studio-marker-studio-0')).toBeInTheDocument();
        expect(screen.getByTestId('studio-marker-studio-49')).toBeInTheDocument();
      });

      // 지도 초기화는 한 번만 발생해야 함
      expect(mockCreateKakaoMap).toHaveBeenCalledTimes(1);
    });
  });

  describe('통합 테스트', () => {
    it('모든 기능이 함께 동작해야 함', async () => {
      const mockStudios = [createMockStudio()];
      const onStudioSelect = jest.fn();
      const onCenterChanged = jest.fn();
      const onMapCreated = jest.fn();

      // 현재 위치 모킹
      const mockPosition = {
        coords: { latitude: 37.1234, longitude: 127.5678, accuracy: 100 },
        timestamp: Date.now(),
      };
      mockGetCurrentPosition.mockImplementation((onSuccess) => {
        onSuccess(mockPosition);
      });

      // 지도 중심 변경 이벤트 모킹
      let eventCallback: ((event: any) => void) | null = null;
      mockKakao.maps.event.addListener.mockImplementation((map, eventType, callback) => {
        if (eventType === 'center_changed') {
          eventCallback = callback;
        }
      });

      await act(async () => {
        render(
          <Map
            studios={mockStudios}
            selectedStudioId="studio-1"
            onStudioSelect={onStudioSelect}
            onCenterChanged={onCenterChanged}
            onMapCreated={onMapCreated}
            width="600px"
            height="400px"
            className="test-map"
          />
        );
        jest.runAllTimers();
      });

      // 지도 초기화 확인
      await waitFor(() => {
        expect(onMapCreated).toHaveBeenCalledWith(mockMap);
        expect(screen.getByTestId('studio-marker-studio-1')).toBeInTheDocument();
      });

      // 스튜디오 선택 확인
      expect(screen.getByTestId('studio-marker-studio-1')).toHaveAttribute('data-selected', 'true');

      // 스튜디오 클릭
      fireEvent.click(screen.getByTestId('studio-marker-studio-1'));
      expect(onStudioSelect).toHaveBeenCalledWith(mockStudios[0]);

      // 현재 위치 버튼 클릭
      fireEvent.click(screen.getByTitle('현재 위치로 이동'));
      await waitFor(() => {
        expect(screen.getByText(/현재 위치: 37.1234, 127.5678/)).toBeInTheDocument();
      });

      // 지도 중심 변경 이벤트
      if (eventCallback) {
        act(() => {
          eventCallback({});
        });
      }
      expect(onCenterChanged).toHaveBeenCalledWith({
        lat: 37.5665,
        lng: 126.9780,
      });

      // 스타일 확인
      const container = document.querySelector('.test-map');
      expect(container).toHaveStyle({
        width: '600px',
        height: '400px',
      });
    });
  });
});