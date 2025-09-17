// Kakao Map API TypeScript 타입 정의

declare global {
  interface Window {
    kakao: any;
  }
}

export interface KakaoMapOptions {
  center: {
    lat: number;
    lng: number;
  };
  level: number;
}

export interface KakaoLatLng {
  lat: number;
  lng: number;
}

export interface KakaoMapProps {
  width?: string | number;
  height?: string | number;
  center?: KakaoLatLng;
  level?: number;
  className?: string;
  onMapCreated?: (map: any) => void;
  onCenterChanged?: (center: KakaoLatLng) => void;
}

export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export type GeolocationCallback = (position: GeolocationPosition) => void;
export type GeolocationErrorCallback = (error: GeolocationError) => void;