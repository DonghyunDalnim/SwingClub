/**
 * Map 컴포넌트 테스트
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Map from '@/components/core/Map';

// 카카오맵 관련 모듈 모킹
jest.mock('@/lib/kakao-map', () => ({
  loadKakaoMapSDK: jest.fn(),
  createKakaoMap: jest.fn(),
  getCurrentPosition: jest.fn(),
  createMarker: jest.fn(),
  DEFAULT_CENTER: { lat: 37.5665, lng: 126.9780 },
  DEFAULT_ZOOM_LEVEL: 3,
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
  });
});