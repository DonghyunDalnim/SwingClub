/**
 * 스튜디오 관련 Server Actions
 * Next.js 13+ Server Actions 패턴 사용
 */

'use server'

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
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  GeoPoint,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  Studio,
  CreateStudioData,
  UpdateStudioData,
  StudioSearchFilters,
  StudioSearchResult,
  GeographicSearch,
  StudiosResponse,
  StudioError
} from '@/lib/types/studio'
import {
  kakaoToGeoPoint,
  geoPointToKakao,
  calculateDistance,
  calculateBoundingBox,
  generateGeoHash,
  isValidCoordinates,
  findNearestRegion
} from '@/lib/utils/geo'

const STUDIOS_COLLECTION = 'studios'

/**
 * 스튜디오 생성
 */
export async function createStudio(
  data: CreateStudioData,
  createdBy: string
): Promise<{ success: boolean; studioId?: string; error?: string }> {
  try {
    // 데이터 유효성 검증
    const validationErrors = validateStudioData(data)
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors.map(e => e.message).join(', ')
      }
    }

    // 좌표 변환 및 지역 자동 감지
    const geopoint = kakaoToGeoPoint(data.location.coordinates)
    const detectedRegion = findNearestRegion(data.location.coordinates)

    // Firestore 문서 데이터 준비
    const studioDoc: Omit<Studio, 'id'> = {
      name: data.name,
      description: data.description,
      category: data.category,
      location: {
        ...data.location,
        geopoint,
        region: detectedRegion || data.location.region
      },
      contact: data.contact,
      facilities: data.facilities,
      pricing: data.pricing,
      operatingHours: data.operatingHours,
      images: data.images || [],
      stats: {
        views: 0,
        favorites: 0,
        avgRating: 0,
        reviewCount: 0
      },
      metadata: {
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy,
        verified: false,
        featured: false,
        status: 'active',
        tags: data.tags || [],
        keywords: generateSearchKeywords(data)
      }
    }

    // Firestore에 저장
    const docRef = await addDoc(collection(db, STUDIOS_COLLECTION), studioDoc)

    return {
      success: true,
      studioId: docRef.id
    }
  } catch (error) {
    console.error('Error creating studio:', error)
    return {
      success: false,
      error: '스튜디오 생성 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 스튜디오 조회 (ID로)
 */
export async function getStudio(studioId: string): Promise<Studio | null> {
  try {
    const docRef = doc(db, STUDIOS_COLLECTION, studioId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Studio
  } catch (error) {
    console.error('Error getting studio:', error)
    return null
  }
}

/**
 * 스튜디오 업데이트
 */
export async function updateStudio(
  studioId: string,
  data: UpdateStudioData,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 권한 확인 (스튜디오 소유자 또는 관리자만 수정 가능)
    const studio = await getStudio(studioId)
    if (!studio) {
      return { success: false, error: '스튜디오를 찾을 수 없습니다.' }
    }

    if (studio.metadata.createdBy !== userId) {
      return { success: false, error: '수정 권한이 없습니다.' }
    }

    // 업데이트 데이터 준비
    const updateData: Partial<Studio> = {
      metadata: {
        ...studio.metadata,
        updatedAt: Timestamp.now()
      }
    }

    // 기본 데이터 복사 (location 제외)
    const { location: _, ...restData } = data
    Object.assign(updateData, restData)

    // 좌표가 변경된 경우 GeoPoint 업데이트
    if (data.location?.coordinates) {
      const geopoint = kakaoToGeoPoint(data.location.coordinates)
      const detectedRegion = findNearestRegion(data.location.coordinates)

      updateData.location = {
        ...studio.location,
        ...data.location,
        geopoint,
        region: detectedRegion || data.location.region || studio.location.region
      }
    } else if (data.location) {
      // 좌표 변경 없이 다른 location 필드만 업데이트
      updateData.location = {
        ...studio.location,
        ...data.location
      }
    }

    // 검색 키워드 업데이트
    if (data.name || data.description || data.category) {
      updateData.metadata!.keywords = generateSearchKeywords({
        name: data.name || studio.name,
        description: data.description || studio.description,
        category: data.category || studio.category,
        location: {
          coordinates: data.location?.coordinates ? data.location.coordinates :
            geoPointToKakao(studio.location.geopoint),
          address: data.location?.address || studio.location.address,
          region: data.location?.region || studio.location.region
        },
        tags: data.tags || studio.metadata.tags
      })
    }

    const docRef = doc(db, STUDIOS_COLLECTION, studioId)
    await updateDoc(docRef, updateData)

    return { success: true }
  } catch (error) {
    console.error('Error updating studio:', error)
    return { success: false, error: '스튜디오 업데이트 중 오류가 발생했습니다.' }
  }
}

/**
 * 스튜디오 삭제
 */
export async function deleteStudio(
  studioId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 권한 확인
    const studio = await getStudio(studioId)
    if (!studio) {
      return { success: false, error: '스튜디오를 찾을 수 없습니다.' }
    }

    if (studio.metadata.createdBy !== userId) {
      return { success: false, error: '삭제 권한이 없습니다.' }
    }

    const docRef = doc(db, STUDIOS_COLLECTION, studioId)
    await deleteDoc(docRef)

    return { success: true }
  } catch (error) {
    console.error('Error deleting studio:', error)
    return { success: false, error: '스튜디오 삭제 중 오류가 발생했습니다.' }
  }
}

/**
 * 스튜디오 목록 조회 (페이지네이션)
 */
export async function getStudios(
  page: number = 1,
  pageSize: number = 20,
  category?: string
): Promise<StudiosResponse> {
  try {
    let studiosQuery = query(
      collection(db, STUDIOS_COLLECTION),
      where('metadata.status', '==', 'active'),
      orderBy('metadata.updatedAt', 'desc'),
      limit(pageSize + 1) // +1 to check if there are more items
    )

    if (category) {
      studiosQuery = query(
        collection(db, STUDIOS_COLLECTION),
        where('metadata.status', '==', 'active'),
        where('category', '==', category),
        orderBy('metadata.updatedAt', 'desc'),
        limit(pageSize + 1)
      )
    }

    // 페이지네이션을 위한 offset 처리 (실제 프로덕션에서는 cursor 기반 권장)
    if (page > 1) {
      const skipCount = (page - 1) * pageSize
      // Note: Firestore에서 offset은 비효율적이므로 실제로는 cursor 기반 구현 권장
    }

    const querySnapshot = await getDocs(studiosQuery)
    const docs = querySnapshot.docs

    const hasNext = docs.length > pageSize
    const studios = docs
      .slice(0, pageSize)
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Studio[]

    return {
      data: studios,
      pagination: {
        page,
        limit: pageSize,
        total: studios.length, // 실제로는 별도 count 쿼리 필요
        hasNext,
        hasPrev: page > 1
      }
    }
  } catch (error) {
    console.error('Error getting studios:', error)
    return {
      data: [],
      pagination: {
        page: 1,
        limit: pageSize,
        total: 0,
        hasNext: false,
        hasPrev: false
      }
    }
  }
}

/**
 * 지리적 검색 (위치 기반)
 */
export async function searchStudiosByLocation(
  search: GeographicSearch
): Promise<Studio[]> {
  try {
    // 경계 박스 계산
    const bounds = calculateBoundingBox(search.center, search.radius)

    // Firestore 지리적 쿼리 (compound query 제한으로 기본 쿼리만)
    let studiosQuery = query(
      collection(db, STUDIOS_COLLECTION),
      where('metadata.status', '==', 'active'),
      where('location.geopoint', '>=', new GeoPoint(bounds.southwest.lat, bounds.southwest.lng)),
      where('location.geopoint', '<=', new GeoPoint(bounds.northeast.lat, bounds.northeast.lng))
    )

    if (search.category) {
      // Note: Firestore compound query 제한으로 클라이언트 필터링
    }

    if (search.limit) {
      studiosQuery = query(studiosQuery, limit(search.limit))
    }

    const querySnapshot = await getDocs(studiosQuery)
    let studios = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Studio[]

    // 클라이언트에서 정확한 거리 계산 및 필터링
    studios = studios.filter(studio => {
      const studioCoords = geoPointToKakao(studio.location.geopoint)
      const distance = calculateDistance(search.center, studioCoords)
      return distance <= search.radius
    })

    // 카테고리 필터링 (클라이언트)
    if (search.category) {
      studios = studios.filter(studio => studio.category === search.category)
    }

    // 거리순 정렬
    studios.sort((a, b) => {
      const distanceA = calculateDistance(search.center, geoPointToKakao(a.location.geopoint))
      const distanceB = calculateDistance(search.center, geoPointToKakao(b.location.geopoint))
      return distanceA - distanceB
    })

    return studios
  } catch (error) {
    console.error('Error searching studios by location:', error)
    return []
  }
}

/**
 * 텍스트 검색
 */
export async function searchStudios(
  searchTerm: string,
  filters?: StudioSearchFilters
): Promise<StudioSearchResult> {
  try {
    // 기본 쿼리
    let studiosQuery = query(
      collection(db, STUDIOS_COLLECTION),
      where('metadata.status', '==', 'active')
    )

    // 카테고리 필터
    if (filters?.category && filters.category.length > 0) {
      studiosQuery = query(
        studiosQuery,
        where('category', 'in', filters.category)
      )
    }

    const querySnapshot = await getDocs(studiosQuery)
    let studios = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Studio[]

    // 클라이언트에서 텍스트 검색 (Firestore 전문 검색 제한)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      studios = studios.filter(studio => {
        const searchableText = [
          studio.name,
          studio.description,
          studio.location.address,
          studio.location.region,
          ...(studio.metadata.tags || []),
          ...(studio.metadata.keywords || [])
        ].join(' ').toLowerCase()

        return searchableText.includes(lowerSearchTerm)
      })
    }

    // 추가 필터링
    studios = applyFilters(studios, filters)

    return {
      studios,
      total: studios.length,
      hasMore: false,
      filters: filters || {}
    }
  } catch (error) {
    console.error('Error searching studios:', error)
    return {
      studios: [],
      total: 0,
      hasMore: false,
      filters: {}
    }
  }
}

/**
 * 조회수 증가
 */
export async function incrementStudioViews(studioId: string): Promise<void> {
  try {
    const docRef = doc(db, STUDIOS_COLLECTION, studioId)
    const studio = await getStudio(studioId)

    if (studio) {
      await updateDoc(docRef, {
        'stats.views': studio.stats.views + 1,
        'metadata.updatedAt': Timestamp.now()
      })
    }
  } catch (error) {
    console.error('Error incrementing studio views:', error)
  }
}

/**
 * 즐겨찾기 토글
 */
export async function toggleStudioFavorite(
  studioId: string,
  increment: boolean
): Promise<{ success: boolean }> {
  try {
    const studio = await getStudio(studioId)
    if (!studio) {
      return { success: false }
    }

    const docRef = doc(db, STUDIOS_COLLECTION, studioId)
    const newFavorites = increment
      ? studio.stats.favorites + 1
      : Math.max(0, studio.stats.favorites - 1)

    await updateDoc(docRef, {
      'stats.favorites': newFavorites,
      'metadata.updatedAt': Timestamp.now()
    })

    return { success: true }
  } catch (error) {
    console.error('Error toggling studio favorite:', error)
    return { success: false }
  }
}

// ===== Helper Functions =====

/**
 * 스튜디오 데이터 유효성 검증
 */
function validateStudioData(data: CreateStudioData): StudioError[] {
  const errors: StudioError[] = []

  if (!data.name?.trim()) {
    errors.push({ code: 'INVALID_NAME', message: '스튜디오 이름은 필수입니다.' })
  }

  if (!data.category) {
    errors.push({ code: 'INVALID_CATEGORY', message: '카테고리는 필수입니다.' })
  }

  if (!data.location?.coordinates) {
    errors.push({ code: 'INVALID_LOCATION', message: '위치 정보는 필수입니다.' })
  } else if (!isValidCoordinates(data.location.coordinates)) {
    errors.push({ code: 'INVALID_COORDINATES', message: '올바르지 않은 좌표입니다.' })
  }

  if (!data.location?.address?.trim()) {
    errors.push({ code: 'INVALID_ADDRESS', message: '주소는 필수입니다.' })
  }

  return errors
}

/**
 * 검색 키워드 생성
 */
function generateSearchKeywords(data: Partial<CreateStudioData>): string[] {
  const keywords = new Set<string>()

  // 이름에서 키워드 추출
  if (data.name) {
    keywords.add(data.name.toLowerCase())
    data.name.split(' ').forEach(word => keywords.add(word.toLowerCase()))
  }

  // 설명에서 키워드 추출
  if (data.description) {
    data.description.split(' ').forEach(word => {
      if (word.length > 1) keywords.add(word.toLowerCase())
    })
  }

  // 카테고리 추가
  if (data.category) {
    keywords.add(data.category)
  }

  // 지역 정보 추가
  if (data.location?.region) {
    keywords.add(data.location.region.toLowerCase())
  }

  // 태그 추가
  if (data.tags) {
    data.tags.forEach(tag => keywords.add(tag.toLowerCase()))
  }

  return Array.from(keywords)
}

/**
 * 필터 적용
 */
function applyFilters(studios: Studio[], filters?: StudioSearchFilters): Studio[] {
  if (!filters) return studios

  let filtered = studios

  // 지역 필터
  if (filters.region && filters.region.length > 0) {
    filtered = filtered.filter(studio =>
      filters.region!.includes(studio.location.region)
    )
  }

  // 시설 필터
  if (filters.hasParking) {
    filtered = filtered.filter(studio => studio.facilities?.parking === true)
  }

  if (filters.hasSoundSystem) {
    filtered = filtered.filter(studio => studio.facilities?.soundSystem === true)
  }

  if (filters.hasAirConditioning) {
    filtered = filtered.filter(studio => studio.facilities?.airConditioning === true)
  }

  // 면적 필터
  if (filters.minArea || filters.maxArea) {
    filtered = filtered.filter(studio => {
      const area = studio.facilities?.area
      if (!area) return false

      if (filters.minArea && area < filters.minArea) return false
      if (filters.maxArea && area > filters.maxArea) return false

      return true
    })
  }

  // 가격 필터
  if (filters.priceRange) {
    filtered = filtered.filter(studio => {
      const pricing = studio.pricing
      if (!pricing) return false

      const priceType = filters.priceRange!.type
      const price = pricing[priceType]
      if (!price) return false

      if (filters.priceRange!.min && price < filters.priceRange!.min) return false
      if (filters.priceRange!.max && price > filters.priceRange!.max) return false

      return true
    })
  }

  // 위치 기반 필터
  if (filters.coordinates && filters.radius) {
    filtered = filtered.filter(studio => {
      const studioCoords = geoPointToKakao(studio.location.geopoint)
      const distance = calculateDistance(filters.coordinates!, studioCoords)
      return distance <= filters.radius!
    })
  }

  return filtered
}