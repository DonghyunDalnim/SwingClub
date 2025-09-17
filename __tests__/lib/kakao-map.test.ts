/**
 * 카카오맵 SDK 유틸리티 함수 테스트
 */

import {
  loadKakaoMapSDK,
  createKakaoMap,
  getCurrentPosition,
  createLatLng,
  createMarker,
  DEFAULT_CENTER,
  DEFAULT_ZOOM_LEVEL,
} from '@/lib/kakao-map';

// 전역 Mock 설정
const mockKakaoMaps = {
  load: jest.fn(),
  LatLng: jest.fn(),
  Map: jest.fn(),
  Marker: jest.fn(),
  event: {
    addListener: jest.fn(),
  },
};

const mockKakao = {
  maps: mockKakaoMaps,
};

// DOM 메서드 Mock
const mockScript = {
  onload: null as any,
  onerror: null as any,
  src: '',
  async: false,
};

const mockAppendChild = jest.fn();
const mockCreateElement = jest.fn(() => mockScript);

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
});

Object.defineProperty(document, 'head', {
  value: { appendChild: mockAppendChild },
});

// 환경변수 Mock
const originalEnv = process.env;

describe('카카오맵 SDK 유틸리티', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // window.kakao 초기화
    (global as any).window = { kakao: null };
    // 환경변수 설정
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_KAKAO_MAP_API_KEY: 'test-kakao-api-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    delete (global as any).window;
  });

  describe('loadKakaoMapSDK', () => {
    it('API 키가 없으면 에러를 반환해야 함', async () => {
      process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY = '';

      await expect(loadKakaoMapSDK()).rejects.toThrow(
        '카카오맵 API 키가 설정되지 않았습니다'
      );
    });

    it('SDK가 이미 로딩되어 있으면 즉시 resolve해야 함', async () => {
      (global as any).window = { kakao: mockKakao };
      // 이미 로딩된 상태로 설정
      require('@/lib/kakao-map').__setSDKLoaded(true);

      const result = await loadKakaoMapSDK();
      expect(result).toBeUndefined();
    });

    it('스크립트 로딩 성공 시 SDK를 초기화해야 함', async () => {
      mockKakaoMaps.load.mockImplementation((callback) => callback());

      const loadPromise = loadKakaoMapSDK();

      // 스크립트 onload 트리거
      expect(mockCreateElement).toHaveBeenCalledWith('script');
      expect(mockScript.src).toContain('test-api-key');

      (global as any).window = { kakao: mockKakao };
      mockScript.onload();

      await expect(loadPromise).resolves.toBeUndefined();
      expect(mockKakaoMaps.load).toHaveBeenCalled();
    });

    it('스크립트 로딩 실패 시 에러를 반환해야 함', async () => {
      const loadPromise = loadKakaoMapSDK();

      // 스크립트 onerror 트리거
      mockScript.onerror();

      await expect(loadPromise).rejects.toThrow(
        '카카오맵 SDK 스크립트 로딩에 실패했습니다'
      );
    });

    it('kakao 객체가 없으면 에러를 반환해야 함', async () => {
      const loadPromise = loadKakaoMapSDK();

      // window.kakao가 없는 상태에서 onload 트리거
      mockScript.onload();

      await expect(loadPromise).rejects.toThrow(
        '카카오맵 SDK 로딩에 실패했습니다'
      );
    });

    it('동시에 여러 번 호출해도 한 번만 로딩해야 함', async () => {
      mockKakaoMaps.load.mockImplementation((callback) => callback());

      const promise1 = loadKakaoMapSDK();
      const promise2 = loadKakaoMapSDK();

      (global as any).window = { kakao: mockKakao };
      mockScript.onload();

      await Promise.all([promise1, promise2]);

      // 스크립트는 한 번만 생성되어야 함
      expect(mockCreateElement).toHaveBeenCalledTimes(1);
    });

    it('API 키가 올바르게 스크립트 URL에 포함되어야 함', () => {
      loadKakaoMapSDK();

      expect(mockScript.src).toBe(
        '//dapi.kakao.com/v2/maps/sdk.js?appkey=test-api-key&autoload=false'
      );
    });
  });

  describe('createKakaoMap', () => {
    beforeEach(() => {
      delete (global as any).window;
      (global as any).window = { kakao: mockKakao };
      mockKakaoMaps.LatLng.mockImplementation((lat, lng) => ({ lat, lng }));
      mockKakaoMaps.Map.mockImplementation(() => ({ id: 'mock-map' }));
    });

    it('올바른 옵션으로 지도를 생성해야 함', () => {
      const container = document.createElement('div');
      const options = {
        center: { lat: 37.5665, lng: 126.9780 },
        level: 3,
      };

      const map = createKakaoMap(container, options);

      expect(mockKakaoMaps.LatLng).toHaveBeenCalledWith(37.5665, 126.9780);
      expect(mockKakaoMaps.Map).toHaveBeenCalledWith(container, {
        center: { lat: 37.5665, lng: 126.9780 },
        level: 3,
      });
      expect(map).toEqual({ id: 'mock-map' });
    });

    it('SDK가 로딩되지 않으면 에러를 발생해야 함', () => {
      (global as any).window = {};
      const container = document.createElement('div');
      const options = { center: { lat: 0, lng: 0 }, level: 1 };

      expect(() => createKakaoMap(container, options)).toThrow(
        '카카오맵 SDK가 로딩되지 않았습니다'
      );
    });

    it('kakao.maps가 없으면 에러를 발생해야 함', () => {
      (global as any).window = { kakao: {} };
      const container = document.createElement('div');
      const options = { center: { lat: 0, lng: 0 }, level: 1 };

      expect(() => createKakaoMap(container, options)).toThrow(
        '카카오맵 SDK가 로딩되지 않았습니다'
      );
    });

    it('경계값 좌표로도 지도를 생성할 수 있어야 함', () => {
      const container = document.createElement('div');
      const options = {
        center: { lat: -90, lng: -180 },
        level: 14,
      };

      createKakaoMap(container, options);

      expect(mockKakaoMaps.LatLng).toHaveBeenCalledWith(-90, -180);
    });
  });

  describe('getCurrentPosition', () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn(),
    };

    beforeEach(() => {
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        configurable: true,
      });
    });

    it('위치 정보를 성공적으로 가져와야 함', () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();
      const mockPosition = {
        coords: { latitude: 37.5665, longitude: 126.9780, accuracy: 100 },
        timestamp: Date.now(),
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      getCurrentPosition(onSuccess, onError);

      expect(onSuccess).toHaveBeenCalledWith(mockPosition);
      expect(onError).not.toHaveBeenCalled();
    });

    it('브라우저가 Geolocation을 지원하지 않으면 에러를 호출해야 함', () => {
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        configurable: true,
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      getCurrentPosition(onSuccess, onError);

      expect(onError).toHaveBeenCalledWith({
        code: 0,
        message: '이 브라우저는 위치 서비스를 지원하지 않습니다.',
      });
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('위치 접근 거부 시 적절한 에러 메시지를 반환해야 함', () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();

      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ code: 1, message: 'Permission denied' });
      });

      getCurrentPosition(onSuccess, onError);

      expect(onError).toHaveBeenCalledWith({
        code: 1,
        message: '위치 정보 접근이 거부되었습니다.',
      });
    });

    it('위치를 가져올 수 없을 때 적절한 에러 메시지를 반환해야 함', () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();

      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ code: 2, message: 'Position unavailable' });
      });

      getCurrentPosition(onSuccess, onError);

      expect(onError).toHaveBeenCalledWith({
        code: 2,
        message: '위치 정보를 가져올 수 없습니다.',
      });
    });

    it('위치 요청 시간 초과 시 적절한 에러 메시지를 반환해야 함', () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();

      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ code: 3, message: 'Timeout' });
      });

      getCurrentPosition(onSuccess, onError);

      expect(onError).toHaveBeenCalledWith({
        code: 3,
        message: '위치 정보 요청 시간이 초과되었습니다.',
      });
    });

    it('알 수 없는 에러 코드에 대해 기본 메시지를 반환해야 함', () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();

      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ code: 999, message: 'Unknown error' });
      });

      getCurrentPosition(onSuccess, onError);

      expect(onError).toHaveBeenCalledWith({
        code: 999,
        message: '알 수 없는 위치 오류가 발생했습니다.',
      });
    });

    it('올바른 옵션으로 getCurrentPosition을 호출해야 함', () => {
      getCurrentPosition(jest.fn(), jest.fn());

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000,
        }
      );
    });

    it('onError 콜백이 없어도 정상 동작해야 함', () => {
      const onSuccess = jest.fn();
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ code: 1, message: 'Permission denied' });
      });

      expect(() => getCurrentPosition(onSuccess)).not.toThrow();
    });
  });

  describe('createLatLng', () => {
    beforeEach(() => {
      delete (global as any).window;
      (global as any).window = { kakao: mockKakao };
      mockKakaoMaps.LatLng.mockImplementation((lat, lng) => ({ lat, lng }));
    });

    it('올바른 좌표로 LatLng 객체를 생성해야 함', () => {
      const result = createLatLng(37.5665, 126.9780);

      expect(mockKakaoMaps.LatLng).toHaveBeenCalledWith(37.5665, 126.9780);
      expect(result).toEqual({ lat: 37.5665, lng: 126.9780 });
    });

    it('SDK가 로딩되지 않으면 에러를 발생해야 함', () => {
      (global as any).window = {};

      expect(() => createLatLng(0, 0)).toThrow(
        '카카오맵 SDK가 로딩되지 않았습니다'
      );
    });

    it('경계값 좌표도 처리할 수 있어야 함', () => {
      createLatLng(-90, -180);
      expect(mockKakaoMaps.LatLng).toHaveBeenCalledWith(-90, -180);

      createLatLng(90, 180);
      expect(mockKakaoMaps.LatLng).toHaveBeenCalledWith(90, 180);
    });

    it('0,0 좌표도 올바르게 처리해야 함', () => {
      createLatLng(0, 0);
      expect(mockKakaoMaps.LatLng).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('createMarker', () => {
    const mockMap = { id: 'mock-map' };
    const mockMarker = {
      setMap: jest.fn(),
    };

    beforeEach(() => {
      delete (global as any).window;
      (global as any).window = { kakao: mockKakao };
      mockKakaoMaps.LatLng.mockImplementation((lat, lng) => ({ lat, lng }));
      mockKakaoMaps.Marker.mockImplementation(() => mockMarker);
    });

    it('타이틀 없이 마커를 생성해야 함', () => {
      const position = { lat: 37.5665, lng: 126.9780 };

      const marker = createMarker(mockMap, position);

      expect(mockKakaoMaps.LatLng).toHaveBeenCalledWith(37.5665, 126.9780);
      expect(mockKakaoMaps.Marker).toHaveBeenCalledWith({
        position: { lat: 37.5665, lng: 126.9780 },
        title: undefined,
      });
      expect(mockMarker.setMap).toHaveBeenCalledWith(mockMap);
      expect(marker).toBe(mockMarker);
    });

    it('타이틀과 함께 마커를 생성해야 함', () => {
      const position = { lat: 37.5665, lng: 126.9780 };
      const title = '현재 위치';

      createMarker(mockMap, position, title);

      expect(mockKakaoMaps.Marker).toHaveBeenCalledWith({
        position: { lat: 37.5665, lng: 126.9780 },
        title: '현재 위치',
      });
    });

    it('빈 문자열 타이틀도 처리할 수 있어야 함', () => {
      const position = { lat: 37.5665, lng: 126.9780 };

      createMarker(mockMap, position, '');

      expect(mockKakaoMaps.Marker).toHaveBeenCalledWith({
        position: { lat: 37.5665, lng: 126.9780 },
        title: '',
      });
    });

    it('SDK가 로딩되지 않으면 에러를 발생해야 함', () => {
      (global as any).window = {};
      const position = { lat: 0, lng: 0 };

      expect(() => createMarker(mockMap, position)).toThrow(
        '카카오맵 SDK가 로딩되지 않았습니다'
      );
    });

    it('경계값 좌표로도 마커를 생성할 수 있어야 함', () => {
      const position = { lat: -90, lng: -180 };

      createMarker(mockMap, position);

      expect(mockKakaoMaps.LatLng).toHaveBeenCalledWith(-90, -180);
    });

    it('null 타이틀도 처리할 수 있어야 함', () => {
      const position = { lat: 37.5665, lng: 126.9780 };

      createMarker(mockMap, position, null as any);

      expect(mockKakaoMaps.Marker).toHaveBeenCalledWith({
        position: { lat: 37.5665, lng: 126.9780 },
        title: null,
      });
    });

    it('setMap이 올바른 지도 객체로 호출되어야 함', () => {
      const customMap = { id: 'custom-map' };
      const position = { lat: 37.5665, lng: 126.9780 };

      createMarker(customMap, position);

      expect(mockMarker.setMap).toHaveBeenCalledWith(customMap);
    });
  });

  describe('상수값', () => {
    it('DEFAULT_CENTER가 서울시청 좌표여야 함', () => {
      expect(DEFAULT_CENTER).toEqual({
        lat: 37.5665,
        lng: 126.9780,
      });
    });

    it('DEFAULT_ZOOM_LEVEL이 적절한 값이어야 함', () => {
      expect(DEFAULT_ZOOM_LEVEL).toBe(3);
      expect(typeof DEFAULT_ZOOM_LEVEL).toBe('number');
    });
  });
});

// 테스트 유틸리티: SDK 로딩 상태 설정
(require('@/lib/kakao-map') as any).__setSDKLoaded = (loaded: boolean) => {
  const kakaoMapModule = require('@/lib/kakao-map');
  (kakaoMapModule as any).isSDKLoaded = loaded;
};