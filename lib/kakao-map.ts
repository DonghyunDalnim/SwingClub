import { KakaoLatLng, KakaoMapOptions, GeolocationCallback, GeolocationErrorCallback } from './types/kakao-map';

// 카카오맵 API 키
const KAKAO_MAP_API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

// SDK 로딩 상태 관리
let isSDKLoaded = false;
let sdkLoadPromise: Promise<void> | null = null;

/**
 * 카카오맵 SDK를 동적으로 로드하는 함수
 */
export const loadKakaoMapSDK = (): Promise<void> => {
  // 이미 로딩이 진행 중이면 해당 Promise 반환
  if (sdkLoadPromise) {
    return sdkLoadPromise;
  }

  // 이미 로딩이 완료되었으면 즉시 resolved Promise 반환
  if (isSDKLoaded && window.kakao) {
    return Promise.resolve();
  }

  // API 키가 없으면 에러
  if (!KAKAO_MAP_API_KEY) {
    return Promise.reject(new Error('카카오맵 API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요.'));
  }

  sdkLoadPromise = new Promise((resolve, reject) => {
    // 스크립트 태그 생성
    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false`;

    script.onload = () => {
      // SDK 로딩 완료 후 kakao.maps.load 호출
      if (window.kakao) {
        window.kakao.maps.load(() => {
          isSDKLoaded = true;
          resolve();
        });
      } else {
        reject(new Error('카카오맵 SDK 로딩에 실패했습니다.'));
      }
    };

    script.onerror = () => {
      reject(new Error('카카오맵 SDK 스크립트 로딩에 실패했습니다.'));
    };

    document.head.appendChild(script);
  });

  return sdkLoadPromise;
};

/**
 * 지도를 생성하는 함수
 */
export const createKakaoMap = (container: HTMLElement, options: KakaoMapOptions) => {
  if (!window.kakao || !window.kakao.maps) {
    throw new Error('카카오맵 SDK가 로딩되지 않았습니다.');
  }

  const mapCenter = new window.kakao.maps.LatLng(options.center.lat, options.center.lng);
  const mapOptions = {
    center: mapCenter,
    level: options.level,
  };

  return new window.kakao.maps.Map(container, mapOptions);
};

/**
 * 브라우저의 Geolocation API를 사용하여 현재 위치를 가져오는 함수
 */
export const getCurrentPosition = (
  onSuccess: GeolocationCallback,
  onError?: GeolocationErrorCallback
): void => {
  if (!navigator.geolocation) {
    onError?.({
      code: 0,
      message: '이 브라우저는 위치 서비스를 지원하지 않습니다.',
    });
    return;
  }

  navigator.geolocation.getCurrentPosition(
    onSuccess,
    (error) => {
      const errorMessages: { [key: number]: string } = {
        1: '위치 정보 접근이 거부되었습니다.',
        2: '위치 정보를 가져올 수 없습니다.',
        3: '위치 정보 요청 시간이 초과되었습니다.',
      };

      onError?.({
        code: error.code,
        message: errorMessages[error.code] || '알 수 없는 위치 오류가 발생했습니다.',
      });
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 600000, // 10분간 캐시 사용
    }
  );
};

/**
 * 위도/경도를 카카오맵 LatLng 객체로 변환
 */
export const createLatLng = (lat: number, lng: number) => {
  if (!window.kakao || !window.kakao.maps) {
    throw new Error('카카오맵 SDK가 로딩되지 않았습니다.');
  }
  return new window.kakao.maps.LatLng(lat, lng);
};

/**
 * 지도에 마커를 추가하는 함수
 */
export const createMarker = (map: any, position: KakaoLatLng, title?: string) => {
  if (!window.kakao || !window.kakao.maps) {
    throw new Error('카카오맵 SDK가 로딩되지 않았습니다.');
  }

  const markerPosition = createLatLng(position.lat, position.lng);
  const marker = new window.kakao.maps.Marker({
    position: markerPosition,
    title: title,
  });

  marker.setMap(map);
  return marker;
};

/**
 * 서울시청 기본 좌표 (기본값으로 사용)
 */
export const DEFAULT_CENTER: KakaoLatLng = {
  lat: 37.5665,
  lng: 126.9780,
};

/**
 * 기본 줌 레벨 (숫자가 작을수록 더 확대)
 */
export const DEFAULT_ZOOM_LEVEL = 3;