/**
 * 지리적 좌표 변환 및 계산 유틸리티
 * Firestore GeoPoint ↔ 카카오맵 좌표 변환
 */

import { GeoPoint } from 'firebase/firestore'
import type { KakaoLatLng } from '@/lib/types/kakao-map'

/**
 * 카카오맵 좌표를 Firestore GeoPoint로 변환
 */
export const kakaoToGeoPoint = (coordinates: KakaoLatLng): GeoPoint => {
  return new GeoPoint(coordinates.lat, coordinates.lng)
}

/**
 * Firestore GeoPoint를 카카오맵 좌표로 변환
 */
export const geoPointToKakao = (geopoint: GeoPoint): KakaoLatLng => {
  return {
    lat: geopoint.latitude,
    lng: geopoint.longitude
  }
}

/**
 * 두 지점 간의 거리 계산 (Haversine 공식)
 * @param point1 첫 번째 지점
 * @param point2 두 번째 지점
 * @returns 거리 (km)
 */
export const calculateDistance = (
  point1: KakaoLatLng,
  point2: KakaoLatLng
): number => {
  const R = 6371 // 지구 반지름 (km)
  const dLat = toRadians(point2.lat - point1.lat)
  const dLng = toRadians(point2.lng - point1.lng)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * 도를 라디안으로 변환
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180)
}

/**
 * 주어진 중심점과 반지름으로 경계 박스 계산
 * Firestore 지리적 쿼리 최적화를 위한 사각형 영역
 */
export const calculateBoundingBox = (
  center: KakaoLatLng,
  radiusKm: number
): {
  northeast: KakaoLatLng
  southwest: KakaoLatLng
} => {
  // 위도 1도 ≈ 111km, 경도 1도 ≈ 111km * cos(위도)
  const latDelta = radiusKm / 111
  const lngDelta = radiusKm / (111 * Math.cos(toRadians(center.lat)))

  return {
    northeast: {
      lat: center.lat + latDelta,
      lng: center.lng + lngDelta
    },
    southwest: {
      lat: center.lat - latDelta,
      lng: center.lng - lngDelta
    }
  }
}

/**
 * GeoHash 생성 (간단한 구현)
 * 지리적 쿼리 최적화를 위한 해시값
 */
export const generateGeoHash = (
  coordinates: KakaoLatLng,
  precision: number = 8
): string => {
  const base32 = '0123456789bcdefghjkmnpqrstuvwxyz'
  let lat = coordinates.lat
  let lng = coordinates.lng
  let hash = ''
  let bits = 0
  let bit = 0
  let evenBit = true

  let latMin = -90, latMax = 90
  let lngMin = -180, lngMax = 180

  while (hash.length < precision) {
    if (evenBit) {
      // 경도 처리
      const mid = (lngMin + lngMax) / 2
      if (lng >= mid) {
        bit = (bit << 1) + 1
        lngMin = mid
      } else {
        bit = bit << 1
        lngMax = mid
      }
    } else {
      // 위도 처리
      const mid = (latMin + latMax) / 2
      if (lat >= mid) {
        bit = (bit << 1) + 1
        latMin = mid
      } else {
        bit = bit << 1
        latMax = mid
      }
    }

    evenBit = !evenBit
    bits++

    if (bits === 5) {
      hash += base32[bit]
      bits = 0
      bit = 0
    }
  }

  return hash
}

/**
 * 좌표가 유효한지 검증
 */
export const isValidCoordinates = (coordinates: KakaoLatLng): boolean => {
  const { lat, lng } = coordinates
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    !isNaN(lat) && !isNaN(lng)
  )
}

/**
 * 서울 지역 경계 확인
 * 대략적인 서울 지역 경계 내에 있는지 확인
 */
export const isInSeoulArea = (coordinates: KakaoLatLng): boolean => {
  const seoulBounds = {
    north: 37.7,
    south: 37.4,
    east: 127.3,
    west: 126.7
  }

  return (
    coordinates.lat >= seoulBounds.south &&
    coordinates.lat <= seoulBounds.north &&
    coordinates.lng >= seoulBounds.west &&
    coordinates.lng <= seoulBounds.east
  )
}

/**
 * 지역별 중심 좌표 상수
 */
export const REGION_CENTERS: Record<string, KakaoLatLng> = {
  // 서울 주요 지역
  '강남': { lat: 37.5173, lng: 127.0473 },
  '홍대': { lat: 37.5563, lng: 126.9236 },
  '신촌': { lat: 37.5596, lng: 126.9426 },
  '이태원': { lat: 37.5347, lng: 126.9947 },
  '건대': { lat: 37.5401, lng: 127.0688 },
  '압구정': { lat: 37.5274, lng: 127.0276 },
  '청담': { lat: 37.5225, lng: 127.0478 },
  '잠실': { lat: 37.5133, lng: 127.1028 },
  '여의도': { lat: 37.5219, lng: 126.9245 },
  '종로': { lat: 37.5735, lng: 126.9788 },
  '명동': { lat: 37.5636, lng: 126.9832 },
  '동대문': { lat: 37.5707, lng: 127.0095 },
  '서초': { lat: 37.4837, lng: 127.0324 },
  '송파': { lat: 37.5145, lng: 127.1059 },
  '마포': { lat: 37.5637, lng: 126.9086 }
}

/**
 * 지역명으로 중심 좌표 가져오기
 */
export const getRegionCenter = (regionName: string): KakaoLatLng | null => {
  return REGION_CENTERS[regionName] || null
}

/**
 * 좌표를 기준으로 가장 가까운 지역 찾기
 */
export const findNearestRegion = (coordinates: KakaoLatLng): string | null => {
  let nearestRegion = null
  let minDistance = Infinity

  for (const [region, center] of Object.entries(REGION_CENTERS)) {
    const distance = calculateDistance(coordinates, center)
    if (distance < minDistance) {
      minDistance = distance
      nearestRegion = region
    }
  }

  // 5km 이내의 지역만 반환
  return minDistance <= 5 ? nearestRegion : null
}

/**
 * 좌표 배열의 중심점 계산
 */
export const calculateCenterPoint = (coordinates: KakaoLatLng[]): KakaoLatLng => {
  if (coordinates.length === 0) {
    throw new Error('좌표 배열이 비어있습니다')
  }

  const totalLat = coordinates.reduce((sum, coord) => sum + coord.lat, 0)
  const totalLng = coordinates.reduce((sum, coord) => sum + coord.lng, 0)

  return {
    lat: totalLat / coordinates.length,
    lng: totalLng / coordinates.length
  }
}

/**
 * 좌표 형식화 (표시용)
 */
export const formatCoordinates = (
  coordinates: KakaoLatLng,
  precision: number = 4
): string => {
  return `${coordinates.lat.toFixed(precision)}, ${coordinates.lng.toFixed(precision)}`
}

/**
 * 거리 형식화 (표시용)
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`
  } else {
    return `${Math.round(distanceKm)}km`
  }
}