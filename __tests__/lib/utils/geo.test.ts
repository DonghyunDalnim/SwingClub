/**
 * Geographic utilities unit tests
 * Tests coordinate conversion, distance calculation, bounding box, validation,
 * region detection, GeoHash generation, and utility functions
 */

// Mock Firebase GeoPoint first
class MockGeoPoint {
  constructor(public latitude: number, public longitude: number) {}
}

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  GeoPoint: MockGeoPoint
}))

import {
  kakaoToGeoPoint,
  geoPointToKakao,
  calculateDistance,
  calculateBoundingBox,
  generateGeoHash,
  isValidCoordinates,
  isInSeoulArea,
  findNearestRegion,
  getRegionCenter,
  calculateCenterPoint,
  formatCoordinates,
  formatDistance,
  REGION_CENTERS
} from '@/lib/utils/geo'

import type { KakaoLatLng } from '@/lib/types/kakao-map'

describe('Geographic Utilities', () => {
  // Test data using realistic Seoul coordinates
  const seoulCityHall: KakaoLatLng = { lat: 37.5666805, lng: 126.9784147 }
  const gangnamStation: KakaoLatLng = { lat: 37.4979, lng: 127.0276 }
  const hongdaeArea: KakaoLatLng = { lat: 37.5563, lng: 126.9236 }
  const incheonAirport: KakaoLatLng = { lat: 37.4602, lng: 126.4407 } // Outside Seoul
  const busanStation: KakaoLatLng = { lat: 35.1147, lng: 129.0419 } // Far from Seoul

  describe('Coordinate Conversion', () => {
    describe('kakaoToGeoPoint', () => {
      it('should convert KakaoLatLng to GeoPoint correctly', () => {
        const result = kakaoToGeoPoint(seoulCityHall)

        expect(result).toBeInstanceOf(MockGeoPoint)
        expect(result.latitude).toBe(37.5666805)
        expect(result.longitude).toBe(126.9784147)
      })

      it('should handle negative coordinates', () => {
        const negativeCoords: KakaoLatLng = { lat: -37.5666805, lng: -126.9784147 }
        const result = kakaoToGeoPoint(negativeCoords)

        expect(result.latitude).toBe(-37.5666805)
        expect(result.longitude).toBe(-126.9784147)
      })

      it('should handle zero coordinates', () => {
        const zeroCoords: KakaoLatLng = { lat: 0, lng: 0 }
        const result = kakaoToGeoPoint(zeroCoords)

        expect(result.latitude).toBe(0)
        expect(result.longitude).toBe(0)
      })

      it('should handle extreme valid coordinates', () => {
        const extremeCoords: KakaoLatLng = { lat: 90, lng: 180 }
        const result = kakaoToGeoPoint(extremeCoords)

        expect(result.latitude).toBe(90)
        expect(result.longitude).toBe(180)
      })
    })

    describe('geoPointToKakao', () => {
      it('should convert GeoPoint to KakaoLatLng correctly', () => {
        const geoPoint = new MockGeoPoint(37.5666805, 126.9784147)
        const result = geoPointToKakao(geoPoint as any)

        expect(result).toEqual(seoulCityHall)
      })

      it('should handle negative coordinates', () => {
        const geoPoint = new MockGeoPoint(-37.5666805, -126.9784147)
        const result = geoPointToKakao(geoPoint as any)

        expect(result).toEqual({ lat: -37.5666805, lng: -126.9784147 })
      })

      it('should handle zero coordinates', () => {
        const geoPoint = new MockGeoPoint(0, 0)
        const result = geoPointToKakao(geoPoint as any)

        expect(result).toEqual({ lat: 0, lng: 0 })
      })
    })

    describe('Round-trip conversion', () => {
      it('should maintain precision through round-trip conversion', () => {
        const original = seoulCityHall
        const geoPoint = kakaoToGeoPoint(original)
        const converted = geoPointToKakao(geoPoint as any)

        expect(converted).toEqual(original)
      })

      it('should handle high precision coordinates', () => {
        const preciseCoords: KakaoLatLng = {
          lat: 37.56668051234567,
          lng: 126.97841471234567
        }
        const geoPoint = kakaoToGeoPoint(preciseCoords)
        const converted = geoPointToKakao(geoPoint as any)

        expect(converted).toEqual(preciseCoords)
      })
    })
  })

  describe('Distance Calculation', () => {
    describe('calculateDistance', () => {
      it('should calculate distance between Seoul landmarks accurately', () => {
        // Distance between Seoul City Hall and Gangnam Station ~7.2km
        const distance = calculateDistance(seoulCityHall, gangnamStation)

        expect(distance).toBeCloseTo(7.2, 0) // Within 1km accuracy
        expect(distance).toBeGreaterThan(6)
        expect(distance).toBeLessThan(9)
      })

      it('should calculate distance between nearby points accurately', () => {
        // Distance between Seoul City Hall and Hongdae ~5.5km
        const distance = calculateDistance(seoulCityHall, hongdaeArea)

        expect(distance).toBeCloseTo(5.5, 0)
        expect(distance).toBeGreaterThan(4)
        expect(distance).toBeLessThan(7)
      })

      it('should calculate long distance correctly', () => {
        // Distance between Seoul and Busan ~325km
        const distance = calculateDistance(seoulCityHall, busanStation)

        expect(distance).toBeGreaterThan(300)
        expect(distance).toBeLessThan(350)
      })

      it('should return 0 for identical coordinates', () => {
        const distance = calculateDistance(seoulCityHall, seoulCityHall)

        expect(distance).toBe(0)
      })

      it('should handle minimal coordinate differences', () => {
        const point1: KakaoLatLng = { lat: 37.5666805, lng: 126.9784147 }
        const point2: KakaoLatLng = { lat: 37.5666806, lng: 126.9784148 }
        const distance = calculateDistance(point1, point2)

        expect(distance).toBeGreaterThan(0)
        expect(distance).toBeLessThan(0.001) // Very small distance
      })

      it('should handle coordinates across date line', () => {
        const point1: KakaoLatLng = { lat: 0, lng: 179 }
        const point2: KakaoLatLng = { lat: 0, lng: -179 }
        const distance = calculateDistance(point1, point2)

        expect(distance).toBeGreaterThan(0)
        expect(distance).toBeLessThan(250) // Should not be half circumference
      })

      it('should handle polar coordinates', () => {
        const northPole: KakaoLatLng = { lat: 90, lng: 0 }
        const southPole: KakaoLatLng = { lat: -90, lng: 0 }
        const distance = calculateDistance(northPole, southPole)

        expect(distance).toBeCloseTo(20015, 100) // Approximately half circumference
      })
    })
  })

  describe('Bounding Box Calculation', () => {
    describe('calculateBoundingBox', () => {
      it('should calculate bounding box for Seoul area correctly', () => {
        const radiusKm = 5
        const bbox = calculateBoundingBox(seoulCityHall, radiusKm)

        // Verify structure
        expect(bbox).toHaveProperty('northeast')
        expect(bbox).toHaveProperty('southwest')
        expect(bbox.northeast).toHaveProperty('lat')
        expect(bbox.northeast).toHaveProperty('lng')
        expect(bbox.southwest).toHaveProperty('lat')
        expect(bbox.southwest).toHaveProperty('lng')

        // Verify northeast is actually northeast of center
        expect(bbox.northeast.lat).toBeGreaterThan(seoulCityHall.lat)
        expect(bbox.northeast.lng).toBeGreaterThan(seoulCityHall.lng)

        // Verify southwest is actually southwest of center
        expect(bbox.southwest.lat).toBeLessThan(seoulCityHall.lat)
        expect(bbox.southwest.lng).toBeLessThan(seoulCityHall.lng)

        // Verify approximate delta (1 degree ≈ 111km)
        const expectedLatDelta = radiusKm / 111
        const actualLatDelta = bbox.northeast.lat - seoulCityHall.lat
        expect(actualLatDelta).toBeCloseTo(expectedLatDelta, 3)
      })

      it('should handle small radius correctly', () => {
        const radiusKm = 0.1
        const bbox = calculateBoundingBox(seoulCityHall, radiusKm)

        const latDelta = bbox.northeast.lat - seoulCityHall.lat
        const lngDelta = bbox.northeast.lng - seoulCityHall.lng

        expect(latDelta).toBeCloseTo(0.0009, 3) // ~0.1km/111km
        expect(lngDelta).toBeGreaterThan(0)
        expect(lngDelta).toBeLessThan(0.002)
      })

      it('should handle large radius correctly', () => {
        const radiusKm = 100
        const bbox = calculateBoundingBox(seoulCityHall, radiusKm)

        const latDelta = bbox.northeast.lat - seoulCityHall.lat
        const lngDelta = bbox.northeast.lng - seoulCityHall.lng

        expect(latDelta).toBeCloseTo(0.9, 0) // ~100km/111km
        expect(lngDelta).toBeGreaterThan(0.5)
        expect(lngDelta).toBeLessThan(2)
      })

      it('should adjust longitude delta based on latitude', () => {
        const polarArea: KakaoLatLng = { lat: 80, lng: 0 } // Near pole
        const equatorArea: KakaoLatLng = { lat: 0, lng: 0 } // At equator
        const radiusKm = 10

        const polarBox = calculateBoundingBox(polarArea, radiusKm)
        const equatorBox = calculateBoundingBox(equatorArea, radiusKm)

        const polarLngDelta = polarBox.northeast.lng - polarArea.lng
        const equatorLngDelta = equatorBox.northeast.lng - equatorArea.lng

        // Longitude delta should be larger near poles
        expect(polarLngDelta).toBeGreaterThan(equatorLngDelta)
      })

      it('should handle zero radius', () => {
        const bbox = calculateBoundingBox(seoulCityHall, 0)

        expect(bbox.northeast).toEqual(seoulCityHall)
        expect(bbox.southwest).toEqual(seoulCityHall)
      })
    })
  })

  describe('Coordinate Validation', () => {
    describe('isValidCoordinates', () => {
      it('should validate correct Seoul coordinates', () => {
        expect(isValidCoordinates(seoulCityHall)).toBe(true)
        expect(isValidCoordinates(gangnamStation)).toBe(true)
        expect(isValidCoordinates(hongdaeArea)).toBe(true)
      })

      it('should validate boundary coordinates', () => {
        expect(isValidCoordinates({ lat: 90, lng: 180 })).toBe(true)
        expect(isValidCoordinates({ lat: -90, lng: -180 })).toBe(true)
        expect(isValidCoordinates({ lat: 0, lng: 0 })).toBe(true)
      })

      it('should reject invalid latitude', () => {
        expect(isValidCoordinates({ lat: 91, lng: 126.9784147 })).toBe(false)
        expect(isValidCoordinates({ lat: -91, lng: 126.9784147 })).toBe(false)
        expect(isValidCoordinates({ lat: NaN, lng: 126.9784147 })).toBe(false)
        expect(isValidCoordinates({ lat: Infinity, lng: 126.9784147 })).toBe(false)
      })

      it('should reject invalid longitude', () => {
        expect(isValidCoordinates({ lat: 37.5666805, lng: 181 })).toBe(false)
        expect(isValidCoordinates({ lat: 37.5666805, lng: -181 })).toBe(false)
        expect(isValidCoordinates({ lat: 37.5666805, lng: NaN })).toBe(false)
        expect(isValidCoordinates({ lat: 37.5666805, lng: Infinity })).toBe(false)
      })

      it('should reject non-numeric coordinates', () => {
        expect(isValidCoordinates({ lat: '37.5666805' as any, lng: 126.9784147 })).toBe(false)
        expect(isValidCoordinates({ lat: 37.5666805, lng: '126.9784147' as any })).toBe(false)
        expect(isValidCoordinates({ lat: null as any, lng: 126.9784147 })).toBe(false)
        expect(isValidCoordinates({ lat: 37.5666805, lng: undefined as any })).toBe(false)
      })
    })

    describe('isInSeoulArea', () => {
      it('should identify Seoul coordinates as within Seoul area', () => {
        expect(isInSeoulArea(seoulCityHall)).toBe(true)
        expect(isInSeoulArea(gangnamStation)).toBe(true)
        expect(isInSeoulArea(hongdaeArea)).toBe(true)
      })

      it('should identify coordinates outside Seoul as outside Seoul area', () => {
        expect(isInSeoulArea(incheonAirport)).toBe(false)
        expect(isInSeoulArea(busanStation)).toBe(false)
      })

      it('should handle boundary coordinates', () => {
        // Test coordinates near Seoul boundaries
        const northBoundary: KakaoLatLng = { lat: 37.7, lng: 127.0 }
        const southBoundary: KakaoLatLng = { lat: 37.4, lng: 127.0 }
        const eastBoundary: KakaoLatLng = { lat: 37.5, lng: 127.3 }
        const westBoundary: KakaoLatLng = { lat: 37.5, lng: 126.7 }

        expect(isInSeoulArea(northBoundary)).toBe(true)
        expect(isInSeoulArea(southBoundary)).toBe(true)
        expect(isInSeoulArea(eastBoundary)).toBe(true)
        expect(isInSeoulArea(westBoundary)).toBe(true)

        // Just outside boundaries
        expect(isInSeoulArea({ lat: 37.701, lng: 127.0 })).toBe(false)
        expect(isInSeoulArea({ lat: 37.399, lng: 127.0 })).toBe(false)
        expect(isInSeoulArea({ lat: 37.5, lng: 127.301 })).toBe(false)
        expect(isInSeoulArea({ lat: 37.5, lng: 126.699 })).toBe(false)
      })
    })
  })

  describe('Region Detection', () => {
    describe('getRegionCenter', () => {
      it('should return correct coordinates for known regions', () => {
        expect(getRegionCenter('강남')).toEqual({ lat: 37.5173, lng: 127.0473 })
        expect(getRegionCenter('홍대')).toEqual({ lat: 37.5563, lng: 126.9236 })
        expect(getRegionCenter('신촌')).toEqual({ lat: 37.5596, lng: 126.9426 })
      })

      it('should return null for unknown regions', () => {
        expect(getRegionCenter('존재하지않는지역')).toBeNull()
        expect(getRegionCenter('')).toBeNull()
        expect(getRegionCenter('UNKNOWN')).toBeNull()
      })

      it('should be case-sensitive', () => {
        expect(getRegionCenter('강남')).not.toBeNull()
        expect(getRegionCenter('GANGNAM')).toBeNull()
        expect(getRegionCenter('gangnam')).toBeNull()
      })
    })

    describe('findNearestRegion', () => {
      it('should find nearest region for coordinates near known areas', () => {
        // Near Gangnam
        const nearGangnam: KakaoLatLng = { lat: 37.517, lng: 127.047 }
        expect(findNearestRegion(nearGangnam)).toBe('강남')

        // Near Hongdae
        const nearHongdae: KakaoLatLng = { lat: 37.556, lng: 126.923 }
        expect(findNearestRegion(nearHongdae)).toBe('홍대')
      })

      it('should return null for coordinates far from any region', () => {
        expect(findNearestRegion(incheonAirport)).toBeNull()
        expect(findNearestRegion(busanStation)).toBeNull()
      })

      it('should return null for coordinates more than 5km from nearest region', () => {
        // Create a point that's about 6km from nearest region
        const farPoint: KakaoLatLng = { lat: 37.4, lng: 126.8 }
        expect(findNearestRegion(farPoint)).toBeNull()
      })

      it('should find closest region when multiple regions are nearby', () => {
        // Point between Hongdae and Sinchon (closer to Hongdae)
        const betweenRegions: KakaoLatLng = { lat: 37.555, lng: 126.925 }
        const nearest = findNearestRegion(betweenRegions)

        expect(nearest).toBe('홍대')
      })

      it('should handle edge case of exactly 5km distance', () => {
        // This test ensures the boundary condition (≤ 5km) works correctly
        const gangnamCenter = REGION_CENTERS['강남']
        const fiveKmAway: KakaoLatLng = {
          lat: gangnamCenter.lat + (5 / 111), // Approximately 5km north
          lng: gangnamCenter.lng
        }

        // Should be within the 5km threshold
        const result = findNearestRegion(fiveKmAway)
        expect(result).toBe('강남')
      })
    })
  })

  describe('GeoHash Generation', () => {
    describe('generateGeoHash', () => {
      it('should generate consistent hash for same coordinates', () => {
        const hash1 = generateGeoHash(seoulCityHall)
        const hash2 = generateGeoHash(seoulCityHall)

        expect(hash1).toBe(hash2)
        expect(hash1).toBeTruthy()
        expect(typeof hash1).toBe('string')
      })

      it('should generate different hashes for different coordinates', () => {
        const hash1 = generateGeoHash(seoulCityHall)
        const hash2 = generateGeoHash(gangnamStation)

        expect(hash1).not.toBe(hash2)
      })

      it('should respect precision parameter', () => {
        const hash4 = generateGeoHash(seoulCityHall, 4)
        const hash8 = generateGeoHash(seoulCityHall, 8)
        const hash12 = generateGeoHash(seoulCityHall, 12)

        expect(hash4).toHaveLength(4)
        expect(hash8).toHaveLength(8)
        expect(hash12).toHaveLength(12)

        // Shorter hash should be prefix of longer hash
        expect(hash8).toMatch(new RegExp(`^${hash4}`))
        expect(hash12).toMatch(new RegExp(`^${hash8}`))
      })

      it('should use default precision of 8', () => {
        const hashDefault = generateGeoHash(seoulCityHall)
        const hash8 = generateGeoHash(seoulCityHall, 8)

        expect(hashDefault).toBe(hash8)
        expect(hashDefault).toHaveLength(8)
      })

      it('should handle extreme coordinates', () => {
        const northPole: KakaoLatLng = { lat: 90, lng: 0 }
        const southPole: KakaoLatLng = { lat: -90, lng: 0 }
        const dateline: KakaoLatLng = { lat: 0, lng: 180 }

        expect(() => generateGeoHash(northPole)).not.toThrow()
        expect(() => generateGeoHash(southPole)).not.toThrow()
        expect(() => generateGeoHash(dateline)).not.toThrow()

        expect(generateGeoHash(northPole)).toHaveLength(8)
        expect(generateGeoHash(southPole)).toHaveLength(8)
        expect(generateGeoHash(dateline)).toHaveLength(8)
      })

      it('should generate valid base32 characters', () => {
        const hash = generateGeoHash(seoulCityHall, 10)
        const validChars = '0123456789bcdefghjkmnpqrstuvwxyz'

        for (const char of hash) {
          expect(validChars).toContain(char)
        }
      })

      it('should handle precision edge cases', () => {
        expect(() => generateGeoHash(seoulCityHall, 0)).not.toThrow()
        expect(() => generateGeoHash(seoulCityHall, 1)).not.toThrow()
        expect(() => generateGeoHash(seoulCityHall, 20)).not.toThrow()

        expect(generateGeoHash(seoulCityHall, 0)).toBe('')
        expect(generateGeoHash(seoulCityHall, 1)).toHaveLength(1)
        expect(generateGeoHash(seoulCityHall, 20)).toHaveLength(20)
      })
    })
  })

  describe('Utility Functions', () => {
    describe('calculateCenterPoint', () => {
      it('should calculate center of single point', () => {
        const center = calculateCenterPoint([seoulCityHall])
        expect(center).toEqual(seoulCityHall)
      })

      it('should calculate center of two points correctly', () => {
        const center = calculateCenterPoint([seoulCityHall, gangnamStation])

        expect(center.lat).toBeCloseTo((seoulCityHall.lat + gangnamStation.lat) / 2, 6)
        expect(center.lng).toBeCloseTo((seoulCityHall.lng + gangnamStation.lng) / 2, 6)
      })

      it('should calculate center of multiple points', () => {
        const points = [seoulCityHall, gangnamStation, hongdaeArea]
        const center = calculateCenterPoint(points)

        const expectedLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length
        const expectedLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length

        expect(center.lat).toBeCloseTo(expectedLat, 6)
        expect(center.lng).toBeCloseTo(expectedLng, 6)
      })

      it('should throw error for empty array', () => {
        expect(() => calculateCenterPoint([])).toThrow('좌표 배열이 비어있습니다')
      })

      it('should handle points with extreme coordinates', () => {
        const extremePoints: KakaoLatLng[] = [
          { lat: 90, lng: 180 },
          { lat: -90, lng: -180 }
        ]

        const center = calculateCenterPoint(extremePoints)
        expect(center.lat).toBe(0)
        expect(center.lng).toBe(0)
      })
    })

    describe('formatCoordinates', () => {
      it('should format coordinates with default precision', () => {
        const formatted = formatCoordinates(seoulCityHall)
        expect(formatted).toBe('37.5667, 126.9784')
      })

      it('should format coordinates with custom precision', () => {
        const formatted2 = formatCoordinates(seoulCityHall, 2)
        const formatted6 = formatCoordinates(seoulCityHall, 6)

        expect(formatted2).toBe('37.57, 126.98')
        expect(formatted6).toBe('37.566681, 126.978415')
      })

      it('should handle zero precision', () => {
        const formatted = formatCoordinates(seoulCityHall, 0)
        expect(formatted).toBe('38, 127')
      })

      it('should handle negative coordinates', () => {
        const negativeCoords: KakaoLatLng = { lat: -37.5666805, lng: -126.9784147 }
        const formatted = formatCoordinates(negativeCoords, 2)
        expect(formatted).toBe('-37.57, -126.98')
      })

      it('should handle zero coordinates', () => {
        const zeroCoords: KakaoLatLng = { lat: 0, lng: 0 }
        const formatted = formatCoordinates(zeroCoords, 1)
        expect(formatted).toBe('0.0, 0.0')
      })
    })

    describe('formatDistance', () => {
      it('should format distances less than 1km in meters', () => {
        expect(formatDistance(0.1)).toBe('100m')
        expect(formatDistance(0.5)).toBe('500m')
        expect(formatDistance(0.999)).toBe('999m')
      })

      it('should format distances 1-10km with one decimal', () => {
        expect(formatDistance(1.0)).toBe('1.0km')
        expect(formatDistance(2.5)).toBe('2.5km')
        expect(formatDistance(9.9)).toBe('9.9km')
      })

      it('should format distances ≥10km as whole numbers', () => {
        expect(formatDistance(10)).toBe('10km')
        expect(formatDistance(15.7)).toBe('16km')
        expect(formatDistance(100.3)).toBe('100km')
        expect(formatDistance(1000)).toBe('1000km')
      })

      it('should handle zero distance', () => {
        expect(formatDistance(0)).toBe('0m')
      })

      it('should handle very small distances', () => {
        expect(formatDistance(0.001)).toBe('1m')
        expect(formatDistance(0.0001)).toBe('0m')
      })

      it('should round meters correctly', () => {
        expect(formatDistance(0.1234)).toBe('123m')
        expect(formatDistance(0.5678)).toBe('568m')
      })

      it('should round kilometers correctly', () => {
        expect(formatDistance(12.34)).toBe('12km')
        expect(formatDistance(12.56)).toBe('13km')
      })
    })
  })

  describe('Region Centers Data Integrity', () => {
    it('should have valid coordinates for all regions', () => {
      Object.entries(REGION_CENTERS).forEach(([region, coords]) => {
        expect(isValidCoordinates(coords)).toBe(true)
        expect(isInSeoulArea(coords)).toBe(true)
      })
    })

    it('should have expected number of regions', () => {
      expect(Object.keys(REGION_CENTERS)).toHaveLength(15)
    })

    it('should contain major Seoul regions', () => {
      const expectedRegions = ['강남', '홍대', '신촌', '이태원', '여의도', '종로', '명동']
      expectedRegions.forEach(region => {
        expect(REGION_CENTERS).toHaveProperty(region)
      })
    })

    it('should have reasonable distances between regions', () => {
      const regions = Object.values(REGION_CENTERS)

      // Calculate all pairwise distances
      for (let i = 0; i < regions.length; i++) {
        for (let j = i + 1; j < regions.length; j++) {
          const distance = calculateDistance(regions[i], regions[j])

          // All regions should be within Seoul (~50km max diameter)
          expect(distance).toBeLessThan(50)
          // Regions should not be too close (avoid duplicates)
          expect(distance).toBeGreaterThan(0.1)
        }
      }
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle coordinates at international date line', () => {
      const west: KakaoLatLng = { lat: 0, lng: 179.9 }
      const east: KakaoLatLng = { lat: 0, lng: -179.9 }

      expect(() => calculateDistance(west, east)).not.toThrow()
      expect(() => calculateBoundingBox(west, 10)).not.toThrow()
      expect(() => generateGeoHash(west)).not.toThrow()
    })

    it('should handle coordinates at poles', () => {
      const northPole: KakaoLatLng = { lat: 90, lng: 0 }
      const southPole: KakaoLatLng = { lat: -90, lng: 0 }

      expect(() => calculateDistance(northPole, southPole)).not.toThrow()
      expect(() => calculateBoundingBox(northPole, 10)).not.toThrow()
      expect(() => generateGeoHash(northPole)).not.toThrow()
    })

    it('should handle very precise coordinates', () => {
      const preciseCoords: KakaoLatLng = {
        lat: 37.12345678901234567890,
        lng: 126.98765432109876543210
      }

      expect(() => calculateDistance(preciseCoords, seoulCityHall)).not.toThrow()
      expect(() => calculateBoundingBox(preciseCoords, 1)).not.toThrow()
      expect(() => generateGeoHash(preciseCoords)).not.toThrow()
    })

    it('should maintain precision in calculations', () => {
      // Test that repeated calculations don't accumulate floating point errors
      let point = seoulCityHall

      for (let i = 0; i < 100; i++) {
        const bbox = calculateBoundingBox(point, 0.001)
        point = bbox.northeast
      }

      // Point should still be reasonably close to original
      const finalDistance = calculateDistance(seoulCityHall, point)
      expect(finalDistance).toBeLessThan(1) // Less than 1km drift
    })
  })
})