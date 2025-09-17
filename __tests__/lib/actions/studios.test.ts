/**
 * 스튜디오 Server Actions 통합 테스트
 * Firebase Firestore 상호작용 및 지리적 유틸리티 테스트
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  GeoPoint,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore'

import {
  createStudio,
  getStudio,
  updateStudio,
  deleteStudio,
  getStudios,
  searchStudiosByLocation,
  searchStudios,
  incrementStudioViews,
  toggleStudioFavorite
} from '@/lib/actions/studios'

import * as geoUtils from '@/lib/utils/geo'
import type {
  Studio,
  CreateStudioData,
  UpdateStudioData,
  StudioSearchFilters,
  GeographicSearch
} from '@/lib/types/studio'

// Firebase Firestore Mocks
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  GeoPoint: jest.fn((lat, lng) => ({ latitude: lat, longitude: lng })),
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1634567890, nanoseconds: 0 }))
  }
}))

// Firebase 설정 Mock
jest.mock('@/lib/firebase', () => ({
  db: { _type: 'mock-firestore' }
}))

// Geo 유틸리티 Mocks
jest.mock('@/lib/utils/geo', () => ({
  kakaoToGeoPoint: jest.fn(),
  geoPointToKakao: jest.fn(),
  calculateDistance: jest.fn(),
  calculateBoundingBox: jest.fn(),
  generateGeoHash: jest.fn(),
  isValidCoordinates: jest.fn(),
  findNearestRegion: jest.fn()
}))

// Mock functions 타입 캐스팅
const mockCollection = collection as jest.MockedFunction<typeof collection>
const mockDoc = doc as jest.MockedFunction<typeof doc>
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>
const mockQuery = query as jest.MockedFunction<typeof query>
const mockWhere = where as jest.MockedFunction<typeof where>
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>
const mockLimit = limit as jest.MockedFunction<typeof limit>
const mockTimestamp = Timestamp as jest.Mocked<typeof Timestamp>

const mockKakaoToGeoPoint = geoUtils.kakaoToGeoPoint as jest.MockedFunction<typeof geoUtils.kakaoToGeoPoint>
const mockGeoPointToKakao = geoUtils.geoPointToKakao as jest.MockedFunction<typeof geoUtils.geoPointToKakao>
const mockCalculateDistance = geoUtils.calculateDistance as jest.MockedFunction<typeof geoUtils.calculateDistance>
const mockCalculateBoundingBox = geoUtils.calculateBoundingBox as jest.MockedFunction<typeof geoUtils.calculateBoundingBox>
const mockIsValidCoordinates = geoUtils.isValidCoordinates as jest.MockedFunction<typeof geoUtils.isValidCoordinates>
const mockFindNearestRegion = geoUtils.findNearestRegion as jest.MockedFunction<typeof geoUtils.findNearestRegion>

describe('Studios Server Actions', () => {
  // 테스트 데이터
  const mockTimestampValue = { seconds: 1634567890, nanoseconds: 0 }
  const mockGeoPoint = new GeoPoint(37.5173, 127.0473)
  const mockKakaoCoords = { lat: 37.5173, lng: 127.0473 }

  const mockCreateStudioData: CreateStudioData = {
    name: '강남 댄스 스튜디오',
    description: '전문적인 스윙댄스 스튜디오입니다.',
    category: 'studio',
    location: {
      coordinates: mockKakaoCoords,
      address: '서울시 강남구 테헤란로 123',
      addressDetail: '5층',
      region: '강남',
      district: '서울특별시 강남구',
      subway: ['강남역', '역삼역'],
      landmarks: ['코엑스', 'CGV강남']
    },
    contact: {
      phone: '02-1234-5678',
      email: 'info@studio.com',
      website: 'https://studio.com',
      kakaoTalk: '@studio',
      instagram: '@studio_insta'
    },
    facilities: {
      area: 50,
      capacity: 20,
      floorType: '원목',
      soundSystem: true,
      airConditioning: true,
      parking: true,
      wifi: true,
      shower: false,
      lockers: true,
      equipment: ['스피커', '거울'],
      amenities: ['정수기', '휴게실']
    },
    pricing: {
      hourly: 30000,
      daily: 200000,
      monthly: 500000,
      currency: 'KRW',
      notes: '주말 할증 20%'
    },
    operatingHours: {
      monday: '09:00-22:00',
      tuesday: '09:00-22:00',
      wednesday: '09:00-22:00',
      thursday: '09:00-22:00',
      friday: '09:00-22:00',
      saturday: '10:00-20:00',
      sunday: '10:00-20:00',
      holidays: 'closed'
    },
    images: ['image1.jpg', 'image2.jpg'],
    tags: ['스윙댄스', '사교댄스', '강남'],
    keywords: ['dance', 'swing', 'gangnam']
  }

  const mockStudio: Studio = {
    id: 'studio-123',
    name: mockCreateStudioData.name,
    description: mockCreateStudioData.description,
    category: mockCreateStudioData.category,
    location: {
      ...mockCreateStudioData.location,
      geopoint: mockGeoPoint
    },
    contact: mockCreateStudioData.contact,
    facilities: mockCreateStudioData.facilities,
    pricing: mockCreateStudioData.pricing,
    operatingHours: mockCreateStudioData.operatingHours,
    images: mockCreateStudioData.images,
    stats: {
      views: 100,
      favorites: 25,
      avgRating: 4.5,
      reviewCount: 12
    },
    metadata: {
      createdAt: mockTimestampValue as any,
      updatedAt: mockTimestampValue as any,
      createdBy: 'user-123',
      verified: false,
      featured: false,
      status: 'active',
      tags: mockCreateStudioData.tags,
      keywords: ['강남', '댄스', '스튜디오', 'studio', 'gangnam']
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // 기본 Mock 설정
    mockTimestamp.now.mockReturnValue(mockTimestampValue as any)
    mockKakaoToGeoPoint.mockReturnValue(mockGeoPoint)
    mockGeoPointToKakao.mockReturnValue(mockKakaoCoords)
    mockIsValidCoordinates.mockReturnValue(true)
    mockFindNearestRegion.mockReturnValue('강남')
    mockCalculateDistance.mockReturnValue(2.5)
    mockCalculateBoundingBox.mockReturnValue({
      northeast: { lat: 37.5273, lng: 127.0573 },
      southwest: { lat: 37.5073, lng: 127.0373 }
    })

    // Query mocks
    mockQuery.mockImplementation((...args) => args)
    mockWhere.mockImplementation((field, operator, value) => ({ field, operator, value }))
    mockOrderBy.mockImplementation((field, direction) => ({ field, direction }))
    mockLimit.mockImplementation((value) => ({ limit: value }))
  })

  describe('createStudio', () => {
    it('유효한 데이터로 스튜디오를 성공적으로 생성해야 함', async () => {
      // Arrange
      const mockDocRef = { id: 'new-studio-id' }
      mockAddDoc.mockResolvedValue(mockDocRef as any)

      // Act
      const result = await createStudio(mockCreateStudioData, 'user-123')

      // Assert
      expect(result.success).toBe(true)
      expect(result.studioId).toBe('new-studio-id')
      expect(result.error).toBeUndefined()

      expect(mockKakaoToGeoPoint).toHaveBeenCalledWith(mockCreateStudioData.location.coordinates)
      expect(mockFindNearestRegion).toHaveBeenCalledWith(mockCreateStudioData.location.coordinates)
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(), // collection reference
        expect.objectContaining({
          name: mockCreateStudioData.name,
          category: mockCreateStudioData.category,
          location: expect.objectContaining({
            geopoint: mockGeoPoint,
            region: '강남'
          }),
          stats: {
            views: 0,
            favorites: 0,
            avgRating: 0,
            reviewCount: 0
          },
          metadata: expect.objectContaining({
            createdBy: 'user-123',
            verified: false,
            featured: false,
            status: 'active'
          })
        })
      )
    })

    it('잘못된 데이터로 인한 유효성 검증 실패 시 에러를 반환해야 함', async () => {
      // Arrange
      mockIsValidCoordinates.mockReturnValue(false)
      const invalidData = {
        ...mockCreateStudioData,
        name: '', // 빈 이름
        location: {
          ...mockCreateStudioData.location,
          coordinates: { lat: 200, lng: 200 } // 잘못된 좌표
        }
      }

      // Act
      const result = await createStudio(invalidData, 'user-123')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('스튜디오 이름은 필수입니다.')
      expect(result.error).toContain('올바르지 않은 좌표입니다.')
      expect(mockAddDoc).not.toHaveBeenCalled()
    })

    it('Firestore 오류 시 적절한 에러 메시지를 반환해야 함', async () => {
      // Arrange
      mockAddDoc.mockRejectedValue(new Error('Firestore error'))

      // Act
      const result = await createStudio(mockCreateStudioData, 'user-123')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('스튜디오 생성 중 오류가 발생했습니다.')
    })
  })

  describe('getStudio', () => {
    it('존재하는 스튜디오 ID로 스튜디오를 성공적으로 조회해야 함', async () => {
      // Arrange
      const studioDataWithoutId = { ...mockStudio }
      delete (studioDataWithoutId as any).id

      const mockDocSnap = {
        exists: () => true,
        id: 'studio-123',
        data: () => studioDataWithoutId
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)

      // Act
      const result = await getStudio('studio-123')

      // Assert
      expect(result).toEqual(expect.objectContaining({
        id: 'studio-123',
        name: mockStudio.name,
        category: mockStudio.category
      }))
      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'studios', 'studio-123')
      expect(mockGetDoc).toHaveBeenCalled()
    })

    it('존재하지 않는 스튜디오 ID로 조회 시 null을 반환해야 함', async () => {
      // Arrange
      const mockDocSnap = {
        exists: () => false
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)

      // Act
      const result = await getStudio('non-existent-id')

      // Assert
      expect(result).toBeNull()
    })

    it('Firestore 오류 시 null을 반환해야 함', async () => {
      // Arrange
      mockGetDoc.mockRejectedValue(new Error('Firestore error'))

      // Act
      const result = await getStudio('studio-123')

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('updateStudio', () => {
    it('권한이 있는 사용자가 스튜디오를 성공적으로 업데이트해야 함', async () => {
      // Arrange
      const studioDataWithoutId = { ...mockStudio }
      delete (studioDataWithoutId as any).id

      const mockDocSnap = {
        exists: () => true,
        id: 'studio-123',
        data: () => studioDataWithoutId
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)
      mockUpdateDoc.mockResolvedValue(undefined)

      const updateData: UpdateStudioData = {
        name: '업데이트된 스튜디오',
        description: '새로운 설명'
      }

      // Act
      const result = await updateStudio('studio-123', updateData, 'user-123')

      // Assert
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: '업데이트된 스튜디오',
          description: '새로운 설명',
          metadata: expect.objectContaining({
            updatedAt: mockTimestampValue
          })
        })
      )
    })

    it('존재하지 않는 스튜디오 업데이트 시도 시 에러를 반환해야 함', async () => {
      // Arrange
      const mockDocSnap = {
        exists: () => false
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)

      // Act
      const result = await updateStudio('non-existent', {}, 'user-123')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('스튜디오를 찾을 수 없습니다.')
    })

    it('권한이 없는 사용자의 업데이트 시도 시 에러를 반환해야 함', async () => {
      // Arrange
      const studioDataWithoutId = { ...mockStudio }
      delete (studioDataWithoutId as any).id

      const mockDocSnap = {
        exists: () => true,
        id: 'studio-123',
        data: () => studioDataWithoutId
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)

      // Act
      const result = await updateStudio('studio-123', {}, 'wrong-user')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('수정 권한이 없습니다.')
      expect(mockUpdateDoc).not.toHaveBeenCalled()
    })

    it('좌표 변경 시 GeoPoint를 업데이트해야 함', async () => {
      // Arrange
      const studioDataWithoutId = { ...mockStudio }
      delete (studioDataWithoutId as any).id

      const mockDocSnap = {
        exists: () => true,
        id: 'studio-123',
        data: () => studioDataWithoutId
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)
      mockUpdateDoc.mockResolvedValue(undefined)

      const newCoords = { lat: 37.5563, lng: 126.9236 }
      const newGeoPoint = new GeoPoint(newCoords.lat, newCoords.lng)
      mockKakaoToGeoPoint.mockReturnValue(newGeoPoint)
      mockFindNearestRegion.mockReturnValue('홍대')

      const updateData: UpdateStudioData = {
        location: {
          coordinates: newCoords,
          address: '새로운 주소',
          region: '홍대'
        }
      }

      // Act
      const result = await updateStudio('studio-123', updateData, 'user-123')

      // Assert
      expect(result.success).toBe(true)
      expect(mockKakaoToGeoPoint).toHaveBeenCalledWith(newCoords)
      expect(mockFindNearestRegion).toHaveBeenCalledWith(newCoords)
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          location: expect.objectContaining({
            geopoint: newGeoPoint,
            region: '홍대'
          })
        })
      )
    })
  })

  describe('deleteStudio', () => {
    it('권한이 있는 사용자가 스튜디오를 성공적으로 삭제해야 함', async () => {
      // Arrange
      const studioDataWithoutId = { ...mockStudio }
      delete (studioDataWithoutId as any).id

      const mockDocSnap = {
        exists: () => true,
        id: 'studio-123',
        data: () => studioDataWithoutId
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)
      mockDeleteDoc.mockResolvedValue(undefined)

      // Act
      const result = await deleteStudio('studio-123', 'user-123')

      // Assert
      expect(result.success).toBe(true)
      expect(mockDeleteDoc).toHaveBeenCalled()
    })

    it('존재하지 않는 스튜디오 삭제 시도 시 에러를 반환해야 함', async () => {
      // Arrange
      const mockDocSnap = {
        exists: () => false
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)

      // Act
      const result = await deleteStudio('non-existent', 'user-123')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('스튜디오를 찾을 수 없습니다.')
      expect(mockDeleteDoc).not.toHaveBeenCalled()
    })

    it('권한이 없는 사용자의 삭제 시도 시 에러를 반환해야 함', async () => {
      // Arrange
      const studioDataWithoutId = { ...mockStudio }
      delete (studioDataWithoutId as any).id

      const mockDocSnap = {
        exists: () => true,
        id: 'studio-123',
        data: () => studioDataWithoutId
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)

      // Act
      const result = await deleteStudio('studio-123', 'wrong-user')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('삭제 권한이 없습니다.')
      expect(mockDeleteDoc).not.toHaveBeenCalled()
    })
  })

  describe('getStudios', () => {
    it('페이지네이션을 포함해 스튜디오 목록을 성공적으로 조회해야 함', async () => {
      // Arrange
      const studioData = { ...mockStudio }
      delete (studioData as any).id

      const mockDocs = [
        { id: 'studio-1', data: () => studioData },
        { id: 'studio-2', data: () => studioData },
        { id: 'studio-3', data: () => studioData }
      ]
      const mockQuerySnapshot = { docs: mockDocs }
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any)

      // Act
      const result = await getStudios(1, 2)

      // Assert
      expect(result.data).toHaveLength(2)
      expect(result.pagination).toEqual({
        page: 1,
        limit: 2,
        total: 2,
        hasNext: true,
        hasPrev: false
      })
    })

    it('카테고리 필터가 포함된 스튜디오 목록을 조회해야 함', async () => {
      // Arrange
      const studioData = { ...mockStudio }
      delete (studioData as any).id

      const mockDocs = [
        { id: 'studio-1', data: () => studioData }
      ]
      const mockQuerySnapshot = { docs: mockDocs }
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any)

      // Act
      const result = await getStudios(1, 20, 'studio')

      // Assert
      expect(result.data).toHaveLength(1)
      expect(result.data[0]).toEqual(expect.objectContaining({
        id: 'studio-1',
        category: 'studio'
      }))
    })

    it('Firestore 오류 시 빈 결과를 반환해야 함', async () => {
      // Arrange
      mockGetDocs.mockRejectedValue(new Error('Firestore error'))

      // Act
      const result = await getStudios()

      // Assert
      expect(result.data).toEqual([])
      expect(result.pagination.total).toBe(0)
    })
  })

  describe('searchStudiosByLocation', () => {
    it('지리적 검색으로 스튜디오를 성공적으로 찾아야 함', async () => {
      // Arrange
      const searchParams: GeographicSearch = {
        center: mockKakaoCoords,
        radius: 5,
        limit: 10,
        category: 'studio'
      }

      const studioData1 = { ...mockStudio, category: 'studio' as const }
      const studioData2 = { ...mockStudio, category: 'practice_room' as const }
      delete (studioData1 as any).id
      delete (studioData2 as any).id

      const mockDocs = [
        { id: 'studio-1', data: () => studioData1 },
        { id: 'studio-2', data: () => studioData2 }
      ]
      const mockQuerySnapshot = { docs: mockDocs }
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any)
      mockCalculateDistance.mockReturnValue(3) // 반경 내

      // Act
      const result = await searchStudiosByLocation(searchParams)

      // Assert
      expect(result).toHaveLength(1) // 카테고리 필터링 적용
      expect(result[0].category).toBe('studio')
      expect(mockCalculateBoundingBox).toHaveBeenCalledWith(mockKakaoCoords, 5)
      expect(mockCalculateDistance).toHaveBeenCalled()
    })

    it('반경을 벗어난 스튜디오는 필터링되어야 함', async () => {
      // Arrange
      const searchParams: GeographicSearch = {
        center: mockKakaoCoords,
        radius: 5
      }

      const studioData = { ...mockStudio }
      delete (studioData as any).id

      const mockDocs = [
        { id: 'studio-1', data: () => studioData },
        { id: 'studio-2', data: () => studioData }
      ]
      const mockQuerySnapshot = { docs: mockDocs }
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any)
      mockCalculateDistance
        .mockReturnValueOnce(3)  // 반경 내
        .mockReturnValueOnce(10) // 반경 외

      // Act
      const result = await searchStudiosByLocation(searchParams)

      // Assert
      expect(result).toHaveLength(1)
    })

    it('거리순으로 정렬되어야 함', async () => {
      // Arrange
      const searchParams: GeographicSearch = {
        center: mockKakaoCoords,
        radius: 10
      }

      const farStudioData = { ...mockStudio, name: 'Far Studio' }
      const nearStudioData = { ...mockStudio, name: 'Near Studio' }
      delete (farStudioData as any).id
      delete (nearStudioData as any).id

      const mockDocs = [
        { id: 'studio-1', data: () => farStudioData },
        { id: 'studio-2', data: () => nearStudioData }
      ]
      const mockQuerySnapshot = { docs: mockDocs }
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any)

      // Mock distance calculations for filtering and sorting
      mockCalculateDistance
        .mockReturnValueOnce(8)  // Far studio during filtering
        .mockReturnValueOnce(2)  // Near studio during filtering
        .mockReturnValueOnce(8)  // Far studio during sorting
        .mockReturnValueOnce(2)  // Near studio during sorting

      // Act
      const result = await searchStudiosByLocation(searchParams)

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Near Studio') // 가까운 순서
      expect(result[1].name).toBe('Far Studio')
    })
  })

  describe('searchStudios', () => {
    it('텍스트 검색으로 스튜디오를 성공적으로 찾아야 함', async () => {
      // Arrange
      const searchTerm = '강남'
      const filters: StudioSearchFilters = {
        category: ['studio']
      }

      const gangnamStudio = {
        ...mockStudio,
        name: '강남 댄스 스튜디오',
        location: { ...mockStudio.location, region: '강남' }
      }
      const hongdaeStudio = {
        ...mockStudio,
        name: '홍대 스튜디오',
        location: { ...mockStudio.location, region: '홍대' }
      }
      delete (gangnamStudio as any).id
      delete (hongdaeStudio as any).id

      const mockDocs = [
        { id: 'studio-1', data: () => gangnamStudio },
        { id: 'studio-2', data: () => hongdaeStudio }
      ]
      const mockQuerySnapshot = { docs: mockDocs }
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any)

      // Act
      const result = await searchStudios(searchTerm, filters)

      // Assert
      expect(result.studios).toHaveLength(1)
      expect(result.studios[0].name).toContain('강남')
      expect(result.total).toBe(1)
    })

    it('필터 없이 모든 활성 스튜디오를 검색해야 함', async () => {
      // Arrange
      const studioData = { ...mockStudio }
      delete (studioData as any).id

      const mockDocs = [
        { id: 'studio-1', data: () => studioData },
        { id: 'studio-2', data: () => studioData }
      ]
      const mockQuerySnapshot = { docs: mockDocs }
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any)

      // Act
      const result = await searchStudios('')

      // Assert
      expect(result.studios).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('복합 필터를 적용해야 함', async () => {
      // Arrange
      const filters: StudioSearchFilters = {
        category: ['studio'],
        region: ['강남'],
        hasParking: true,
        minArea: 40,
        coordinates: mockKakaoCoords,
        radius: 5
      }

      const validStudio = { ...mockStudio }
      const invalidStudio = {
        ...mockStudio,
        facilities: { ...mockStudio.facilities, parking: false }
      }
      const wrongRegionStudio = {
        ...mockStudio,
        location: { ...mockStudio.location, region: '홍대' }
      }

      delete (validStudio as any).id
      delete (invalidStudio as any).id
      delete (wrongRegionStudio as any).id

      const mockDocs = [
        { id: 'studio-1', data: () => validStudio },
        { id: 'studio-2', data: () => invalidStudio },
        { id: 'studio-3', data: () => wrongRegionStudio }
      ]
      const mockQuerySnapshot = { docs: mockDocs }
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any)
      mockCalculateDistance.mockReturnValue(3) // 반경 내

      // Act
      const result = await searchStudios('', filters)

      // Assert
      expect(result.studios).toHaveLength(1)
      expect(result.studios[0].facilities?.parking).toBe(true)
      expect(result.studios[0].location.region).toBe('강남')
    })
  })

  describe('incrementStudioViews', () => {
    it('스튜디오 조회수를 성공적으로 증가시켜야 함', async () => {
      // Arrange
      const studioDataWithoutId = { ...mockStudio }
      delete (studioDataWithoutId as any).id

      const mockDocSnap = {
        exists: () => true,
        id: 'studio-123',
        data: () => studioDataWithoutId
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)
      mockUpdateDoc.mockResolvedValue(undefined)

      // Act
      await incrementStudioViews('studio-123')

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        {
          'stats.views': mockStudio.stats.views + 1,
          'metadata.updatedAt': mockTimestampValue
        }
      )
    })

    it('존재하지 않는 스튜디오의 조회수 증가 시도 시 아무 작업도 하지 않아야 함', async () => {
      // Arrange
      const mockDocSnap = {
        exists: () => false
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)

      // Act
      await incrementStudioViews('non-existent')

      // Assert
      expect(mockUpdateDoc).not.toHaveBeenCalled()
    })

    it('Firestore 오류 시 조용히 실패해야 함', async () => {
      // Arrange
      mockGetDoc.mockRejectedValue(new Error('Firestore error'))

      // Act & Assert - 에러가 throw되지 않아야 함
      await expect(incrementStudioViews('studio-123')).resolves.toBeUndefined()
    })
  })

  describe('toggleStudioFavorite', () => {
    it('즐겨찾기를 성공적으로 증가시켜야 함', async () => {
      // Arrange
      const studioDataWithoutId = { ...mockStudio }
      delete (studioDataWithoutId as any).id

      const mockDocSnap = {
        exists: () => true,
        id: 'studio-123',
        data: () => studioDataWithoutId
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)
      mockUpdateDoc.mockResolvedValue(undefined)

      // Act
      const result = await toggleStudioFavorite('studio-123', true)

      // Assert
      expect(result.success).toBe(true)
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        {
          'stats.favorites': mockStudio.stats.favorites + 1,
          'metadata.updatedAt': mockTimestampValue
        }
      )
    })

    it('즐겨찾기를 성공적으로 감소시켜야 함', async () => {
      // Arrange
      const studioDataWithoutId = { ...mockStudio }
      delete (studioDataWithoutId as any).id

      const mockDocSnap = {
        exists: () => true,
        id: 'studio-123',
        data: () => studioDataWithoutId
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)
      mockUpdateDoc.mockResolvedValue(undefined)

      // Act
      const result = await toggleStudioFavorite('studio-123', false)

      // Assert
      expect(result.success).toBe(true)
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        {
          'stats.favorites': mockStudio.stats.favorites - 1,
          'metadata.updatedAt': mockTimestampValue
        }
      )
    })

    it('즐겨찾기 감소 시 0 이하로 내려가지 않아야 함', async () => {
      // Arrange
      const mockStudioWithZeroFavorites = {
        ...mockStudio,
        stats: { ...mockStudio.stats, favorites: 0 }
      }
      delete (mockStudioWithZeroFavorites as any).id

      const mockDocSnap = {
        exists: () => true,
        id: 'studio-123',
        data: () => mockStudioWithZeroFavorites
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)
      mockUpdateDoc.mockResolvedValue(undefined)

      // Act
      const result = await toggleStudioFavorite('studio-123', false)

      // Assert
      expect(result.success).toBe(true)
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        {
          'stats.favorites': 0, // Math.max(0, 0 - 1) = 0
          'metadata.updatedAt': mockTimestampValue
        }
      )
    })

    it('존재하지 않는 스튜디오의 즐겨찾기 토글 시 실패를 반환해야 함', async () => {
      // Arrange
      const mockDocSnap = {
        exists: () => false
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)

      // Act
      const result = await toggleStudioFavorite('non-existent', true)

      // Assert
      expect(result.success).toBe(false)
      expect(mockUpdateDoc).not.toHaveBeenCalled()
    })
  })

  describe('Integration Tests - Data Flow', () => {
    it('스튜디오 생성부터 조회까지의 전체 플로우가 작동해야 함', async () => {
      // 1. 스튜디오 생성
      const mockDocRef = { id: 'new-studio-id' }
      mockAddDoc.mockResolvedValue(mockDocRef as any)

      const createResult = await createStudio(mockCreateStudioData, 'user-123')
      expect(createResult.success).toBe(true)
      expect(createResult.studioId).toBe('new-studio-id')

      // 2. 생성된 스튜디오 조회
      const studioDataWithoutId = { ...mockStudio }
      delete (studioDataWithoutId as any).id

      const mockDocSnap = {
        exists: () => true,
        id: 'new-studio-id',
        data: () => studioDataWithoutId
      }
      mockGetDoc.mockResolvedValue(mockDocSnap as any)

      const getResult = await getStudio('new-studio-id')
      expect(getResult).toEqual(expect.objectContaining({
        id: 'new-studio-id',
        name: mockCreateStudioData.name
      }))
    })

    it('지리적 검색과 텍스트 검색이 일관된 결과를 반환해야 함', async () => {
      // Arrange - 같은 스튜디오 데이터 설정
      const studioData = { ...mockStudio }
      delete (studioData as any).id

      const mockDocs = [
        { id: 'studio-1', data: () => studioData }
      ]
      const mockQuerySnapshot = { docs: mockDocs }
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any)
      mockCalculateDistance.mockReturnValue(2)

      // 1. 지리적 검색
      const geoSearchResult = await searchStudiosByLocation({
        center: mockKakaoCoords,
        radius: 5,
        category: 'studio'
      })

      // 2. 텍스트 검색 (같은 카테고리)
      const textSearchResult = await searchStudios('', {
        category: ['studio'],
        coordinates: mockKakaoCoords,
        radius: 5
      })

      // Assert - 같은 스튜디오가 검색되어야 함
      expect(geoSearchResult).toHaveLength(1)
      expect(textSearchResult.studios).toHaveLength(1)
      expect(geoSearchResult[0].id).toBe(textSearchResult.studios[0].id)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('빈 검색 결과를 올바르게 처리해야 함', async () => {
      // Arrange
      const mockQuerySnapshot = { docs: [] }
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any)

      // Act
      const result = await searchStudios('nonexistent')

      // Assert
      expect(result.studios).toEqual([])
      expect(result.total).toBe(0)
      expect(result.hasMore).toBe(false)
    })

    it('잘못된 필터 값에 대해 방어적으로 처리해야 함', async () => {
      // Arrange
      const invalidFilters: StudioSearchFilters = {
        minArea: -1,
        maxArea: -1,
        radius: -1
      }

      const studioData = { ...mockStudio }
      delete (studioData as any).id

      const mockDocs = [
        { id: 'studio-1', data: () => studioData }
      ]
      const mockQuerySnapshot = { docs: mockDocs }
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any)

      // Act & Assert - 에러가 발생하지 않아야 함
      await expect(searchStudios('', invalidFilters)).resolves.toBeDefined()
    })

    it('네트워크 오류 시 적절한 기본값을 반환해야 함', async () => {
      // Arrange - suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      mockGetDocs.mockRejectedValue(new Error('Network error'))

      // Act
      const searchResult = await searchStudios('test')
      const studiosResult = await getStudios()
      const geoSearchResult = await searchStudiosByLocation({
        center: mockKakaoCoords,
        radius: 5
      })

      // Assert
      expect(searchResult.studios).toEqual([])
      expect(studiosResult.data).toEqual([])
      expect(geoSearchResult).toEqual([])

      // Cleanup
      consoleSpy.mockRestore()
    })
  })

  describe('Performance and Optimization', () => {
    it('대용량 검색 결과를 효율적으로 처리해야 함', async () => {
      // Arrange - 많은 스튜디오 데이터 생성
      const studioData = { ...mockStudio }
      delete (studioData as any).id

      const mockDocs = Array.from({ length: 100 }, (_, i) => ({
        id: `studio-${i}`,
        data: () => ({ ...studioData, name: `Studio ${i}` })
      }))
      const mockQuerySnapshot = { docs: mockDocs }
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any)

      // Act
      const result = await getStudios(1, 50)

      // Assert
      expect(result.data).toHaveLength(50) // 페이지 크기 제한
      expect(result.pagination.hasNext).toBe(true)
    })

    it('지리적 검색에서 거리 계산 최적화가 적용되어야 함', async () => {
      // Arrange
      const studioData = { ...mockStudio }
      delete (studioData as any).id

      const mockDocs = [
        { id: 'studio-1', data: () => studioData }
      ]
      const mockQuerySnapshot = { docs: mockDocs }
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any)

      // Act
      await searchStudiosByLocation({
        center: mockKakaoCoords,
        radius: 5,
        limit: 10
      })

      // Assert
      expect(mockCalculateBoundingBox).toHaveBeenCalledTimes(1)
      expect(mockCalculateDistance).toHaveBeenCalled()
    })
  })
})