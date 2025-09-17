'use client';

import { useEffect, useRef, useState } from 'react';
import {
  loadKakaoMapSDK,
  createKakaoMap,
  getCurrentPosition,
  createMarker,
  DEFAULT_CENTER,
  DEFAULT_ZOOM_LEVEL
} from '@/lib/kakao-map';
import { KakaoMapProps, KakaoLatLng } from '@/lib/types/kakao-map';

interface MapState {
  isLoading: boolean;
  error: string | null;
  map: any | null;
}

export const Map: React.FC<KakaoMapProps> = ({
  width = '100%',
  height = '400px',
  center = DEFAULT_CENTER,
  level = DEFAULT_ZOOM_LEVEL,
  className = '',
  onMapCreated,
  onCenterChanged,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapState, setMapState] = useState<MapState>({
    isLoading: true,
    error: null,
    map: null,
  });
  const [currentLocation, setCurrentLocation] = useState<KakaoLatLng | null>(null);

  // 지도 초기화
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initializeMap = async () => {
      try {
        setMapState(prev => ({ ...prev, isLoading: true, error: null }));

        // 카카오맵 SDK 로드
        await loadKakaoMapSDK();

        // 지도 생성
        const map = createKakaoMap(mapContainerRef.current!, {
          center,
          level,
        });

        setMapState(prev => ({ ...prev, map, isLoading: false }));
        onMapCreated?.(map);

        // 지도 중심 변경 이벤트 리스너
        if (onCenterChanged && window.kakao) {
          window.kakao.maps.event.addListener(map, 'center_changed', () => {
            const centerLatLng = map.getCenter();
            onCenterChanged({
              lat: centerLatLng.getLat(),
              lng: centerLatLng.getLng(),
            });
          });
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '지도 로딩 중 오류가 발생했습니다.';
        setMapState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      }
    };

    initializeMap();
  }, [center.lat, center.lng, level, onMapCreated, onCenterChanged]);

  // 현재 위치 가져오기
  const handleGetCurrentLocation = () => {
    getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        setCurrentLocation(newLocation);

        // 지도가 있으면 중심을 현재 위치로 이동
        if (mapState.map && window.kakao) {
          const newCenter = new window.kakao.maps.LatLng(latitude, longitude);
          mapState.map.setCenter(newCenter);

          // 현재 위치에 마커 추가
          createMarker(mapState.map, newLocation, '현재 위치');
        }
      },
      (error) => {
        setMapState(prev => ({
          ...prev,
          error: `위치 정보 오류: ${error.message}`
        }));
      }
    );
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (mapState.map && window.kakao) {
        // 필요시 지도 이벤트 리스너 정리
      }
    };
  }, [mapState.map]);

  // 로딩 상태
  if (mapState.isLoading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 text-sm">지도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (mapState.error) {
    return (
      <div
        className={`flex items-center justify-center bg-red-50 border-2 border-dashed border-red-300 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center space-y-3">
          <div className="text-4xl">❌</div>
          <div>
            <h3 className="font-semibold text-red-800 mb-2">지도 로딩 실패</h3>
            <p className="text-red-600 text-sm mb-3">{mapState.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              새로고침
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* 지도 컨테이너 */}
      <div
        ref={mapContainerRef}
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ width, height }}
      />

      {/* 현재 위치 버튼 */}
      <button
        onClick={handleGetCurrentLocation}
        className="absolute top-3 right-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-2 shadow-md transition-colors"
        title="현재 위치로 이동"
      >
        <svg
          className="w-5 h-5 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* 현재 위치 표시 */}
      {currentLocation && (
        <div className="absolute bottom-3 left-3 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-md text-sm">
          <span className="text-green-600">● </span>
          현재 위치: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
        </div>
      )}
    </div>
  );
};

export default Map;