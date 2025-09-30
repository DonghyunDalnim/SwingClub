/**
 * 마켓플레이스 관련 Server Actions
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
import {
  marketplaceItemsCollection,
  getMarketplaceItemDoc,
  COLLECTION_NAMES
} from '@/lib/firebase/collections'
import type {
  MarketplaceItem,
  CreateItemData,
  UpdateItemData,
  ItemSearchFilters,
  ItemSearchResult,
  GeographicItemSearch,
  ItemsResponse,
  MarketplaceError,
  ProductCategory,
  ItemSortOption,
  ItemInquiry,
  InquiryMessage,
  CreateInquiryData,
  CreateMessageData,
  UpdateInquiryData,
  InquirySearchFilters,
  InquiryListResponse,
  MessageListResponse,
  InquiryStatus
} from '@/lib/types/marketplace'
import {
  validateMarketplaceItemData,
  sanitizeMarketplaceItemData
} from '@/lib/utils/validation'
import {
  kakaoToGeoPoint,
  geoPointToKakao,
  calculateDistance,
  calculateBoundingBox,
  isValidCoordinates,
  findNearestRegion
} from '@/lib/utils/geo'
import { getCurrentUser } from '@/lib/auth/server'

/**
 * 상품 생성
 */
export async function createMarketplaceItem(
  data: CreateItemData,
  sellerId: string
): Promise<{ success: boolean; itemId?: string; error?: string }> {
  try {
    // 데이터 유효성 검증
    const validationErrors = validateMarketplaceItemData(data)
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors.map(e => e.message).join(', ')
      }
    }

    // 입력 데이터 정제 (XSS 방지)
    const sanitizedData = sanitizeMarketplaceItemData(data)

    // 좌표 변환 및 지역 자동 감지 (좌표가 있는 경우)
    let geopoint: GeoPoint | undefined
    let detectedRegion: string | undefined

    if (sanitizedData.location.coordinates && isValidCoordinates(sanitizedData.location.coordinates)) {
      geopoint = kakaoToGeoPoint(sanitizedData.location.coordinates)
      detectedRegion = findNearestRegion(sanitizedData.location.coordinates) || undefined
    }

    // Firestore 문서 데이터 준비
    const itemDoc: Omit<MarketplaceItem, 'id'> = {
      title: sanitizedData.title,
      description: sanitizedData.description,
      category: sanitizedData.category,
      pricing: sanitizedData.pricing,
      specs: sanitizedData.specs,
      location: {
        ...sanitizedData.location,
        geopoint,
        region: detectedRegion || sanitizedData.location.region
      },
      stats: {
        views: 0,
        favorites: 0,
        inquiries: 0
      },
      metadata: {
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        sellerId,
        status: 'available',
        featured: false,
        reported: false,
        tags: sanitizedData.tags || [],
        keywords: generateSearchKeywords(sanitizedData)
      },
      images: sanitizedData.images
    }

    // Firestore에 저장
    const docRef = await addDoc(marketplaceItemsCollection, itemDoc)

    return {
      success: true,
      itemId: docRef.id
    }
  } catch (error) {
    console.error('Error creating marketplace item:', error)
    return {
      success: false,
      error: '상품 등록 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 상품 조회 (ID로)
 */
export async function getMarketplaceItem(
  itemId: string,
  incrementViews: boolean = false
): Promise<MarketplaceItem | null> {
  try {
    const docRef = getMarketplaceItemDoc(itemId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    const item = {
      ...docSnap.data(),
      id: docSnap.id
    } as MarketplaceItem

    // 조회수 증가 (비동기로 처리)
    if (incrementViews) {
      incrementItemViews(itemId).catch(error => {
        console.error('Error incrementing views:', error)
      })
    }

    return item
  } catch (error) {
    console.error('Error getting marketplace item:', error)
    return null
  }
}

/**
 * 상품 업데이트
 */
export async function updateMarketplaceItem(
  itemId: string,
  data: UpdateItemData,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 권한 확인 (상품 소유자만 수정 가능)
    const { isOwner, item } = await validateItemOwnership(itemId, userId)
    if (!isOwner || !item) {
      return { success: false, error: isOwner ? '상품을 찾을 수 없습니다.' : '수정 권한이 없습니다.' }
    }

    // 업데이트할 데이터가 있는지 확인
    if (Object.keys(data).length === 0) {
      return { success: false, error: '업데이트할 데이터가 없습니다.' }
    }

    // 기본 필드들을 포함한 전체 데이터 검증 (부분 업데이트도 전체 유효성 확인)
    if (data.title || data.description || data.category || data.pricing || data.specs || data.location || data.images) {
      const fullData: CreateItemData = {
        title: data.title || item.title,
        description: data.description || item.description,
        category: data.category || item.category,
        pricing: data.pricing || item.pricing,
        specs: data.specs || item.specs,
        location: data.location || {
          region: item.location.region,
          district: item.location.district,
          preferredMeetingPlaces: item.location.preferredMeetingPlaces,
          deliveryAvailable: item.location.deliveryAvailable,
          coordinates: item.location.geopoint ? geoPointToKakao(item.location.geopoint) : undefined
        },
        images: data.images || item.images,
        tags: data.tags || item.metadata.tags,
        keywords: data.keywords || item.metadata.keywords
      }

      const validationErrors = validateMarketplaceItemData(fullData)
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: validationErrors.map(e => e.message).join(', ')
        }
      }
    }

    // 업데이트 데이터 준비
    const updateData: Partial<MarketplaceItem> = {
      metadata: {
        ...item.metadata,
        updatedAt: Timestamp.now()
      }
    }

    // 기본 데이터 복사 (location 제외)
    const { location: _, ...restData } = data
    Object.assign(updateData, restData)

    // 좌표가 변경된 경우 GeoPoint 업데이트
    if (data.location?.coordinates && isValidCoordinates(data.location.coordinates)) {
      const geopoint = kakaoToGeoPoint(data.location.coordinates)
      const detectedRegion = findNearestRegion(data.location.coordinates)

      updateData.location = {
        ...item.location,
        ...data.location,
        geopoint,
        region: detectedRegion || data.location.region || item.location.region
      }
    } else if (data.location) {
      // 좌표 변경 없이 다른 location 필드만 업데이트
      updateData.location = {
        ...item.location,
        ...data.location
      }
    }

    // 검색 키워드 업데이트
    if (data.title || data.description || data.category || data.tags) {
      updateData.metadata!.keywords = generateSearchKeywords({
        title: data.title || item.title,
        description: data.description || item.description,
        category: data.category || item.category,
        pricing: data.pricing || item.pricing,
        specs: data.specs || item.specs,
        location: {
          region: data.location?.region || item.location.region,
          district: data.location?.district || item.location.district,
          preferredMeetingPlaces: data.location?.preferredMeetingPlaces || item.location.preferredMeetingPlaces,
          deliveryAvailable: data.location?.deliveryAvailable !== undefined ? data.location.deliveryAvailable : item.location.deliveryAvailable,
          coordinates: data.location?.coordinates || (item.location.geopoint ? geoPointToKakao(item.location.geopoint) : undefined)
        },
        images: data.images || item.images,
        tags: data.tags || item.metadata.tags
      })
    }

    const docRef = getMarketplaceItemDoc(itemId)
    await updateDoc(docRef, updateData)

    return { success: true }
  } catch (error) {
    console.error('Error updating marketplace item:', error)
    return { success: false, error: '상품 업데이트 중 오류가 발생했습니다.' }
  }
}

/**
 * 상품 삭제
 */
export async function deleteMarketplaceItem(
  itemId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 권한 확인
    const { isOwner } = await validateItemOwnership(itemId, userId)
    if (!isOwner) {
      return { success: false, error: '삭제 권한이 없습니다.' }
    }

    const docRef = getMarketplaceItemDoc(itemId)
    await deleteDoc(docRef)

    return { success: true }
  } catch (error) {
    console.error('Error deleting marketplace item:', error)
    return { success: false, error: '상품 삭제 중 오류가 발생했습니다.' }
  }
}

/**
 * 상품 목록 조회 (페이지네이션)
 */
export async function getMarketplaceItems(
  page: number = 1,
  pageSize: number = 20,
  sortBy: ItemSortOption = 'latest'
): Promise<ItemsResponse> {
  try {
    let itemsQuery = query(
      marketplaceItemsCollection,
      where('metadata.status', '==', 'available'),
      where('metadata.reported', '==', false)
    )

    // 정렬 조건 추가
    switch (sortBy) {
      case 'latest':
        itemsQuery = query(itemsQuery, orderBy('metadata.createdAt', 'desc'))
        break
      case 'oldest':
        itemsQuery = query(itemsQuery, orderBy('metadata.createdAt', 'asc'))
        break
      case 'price_low':
        itemsQuery = query(itemsQuery, orderBy('pricing.price', 'asc'))
        break
      case 'price_high':
        itemsQuery = query(itemsQuery, orderBy('pricing.price', 'desc'))
        break
      case 'popular':
        itemsQuery = query(itemsQuery, orderBy('stats.views', 'desc'))
        break
      default:
        itemsQuery = query(itemsQuery, orderBy('metadata.createdAt', 'desc'))
    }

    // 페이지네이션
    itemsQuery = query(itemsQuery, limit(pageSize + 1)) // +1 to check if there are more items

    const querySnapshot = await getDocs(itemsQuery)
    const docs = querySnapshot.docs

    const hasNext = docs.length > pageSize
    const items = docs
      .slice(0, pageSize)
      .map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as MarketplaceItem[]

    return {
      data: items,
      pagination: {
        page,
        limit: pageSize,
        total: items.length, // 실제로는 별도 count 쿼리 필요
        hasNext,
        hasPrev: page > 1
      }
    }
  } catch (error) {
    console.error('Error getting marketplace items:', error)
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
 * 카테고리별 상품 조회
 */
export async function getMarketplaceItemsByCategory(
  category: ProductCategory,
  page: number = 1,
  pageSize: number = 20,
  sortBy: ItemSortOption = 'latest'
): Promise<ItemsResponse> {
  try {
    let itemsQuery = query(
      marketplaceItemsCollection,
      where('metadata.status', '==', 'available'),
      where('metadata.reported', '==', false),
      where('category', '==', category)
    )

    // 정렬 조건 추가
    switch (sortBy) {
      case 'latest':
        itemsQuery = query(itemsQuery, orderBy('metadata.createdAt', 'desc'))
        break
      case 'oldest':
        itemsQuery = query(itemsQuery, orderBy('metadata.createdAt', 'asc'))
        break
      case 'price_low':
        itemsQuery = query(itemsQuery, orderBy('pricing.price', 'asc'))
        break
      case 'price_high':
        itemsQuery = query(itemsQuery, orderBy('pricing.price', 'desc'))
        break
      case 'popular':
        itemsQuery = query(itemsQuery, orderBy('stats.views', 'desc'))
        break
    }

    itemsQuery = query(itemsQuery, limit(pageSize + 1))

    const querySnapshot = await getDocs(itemsQuery)
    const docs = querySnapshot.docs

    const hasNext = docs.length > pageSize
    const items = docs
      .slice(0, pageSize)
      .map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as MarketplaceItem[]

    return {
      data: items,
      pagination: {
        page,
        limit: pageSize,
        total: items.length,
        hasNext,
        hasPrev: page > 1
      }
    }
  } catch (error) {
    console.error('Error getting marketplace items by category:', error)
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
 * 지역별 상품 검색
 */
export async function searchMarketplaceItemsByRegion(
  region: string,
  filters?: ItemSearchFilters
): Promise<ItemSearchResult> {
  try {
    let itemsQuery = query(
      marketplaceItemsCollection,
      where('metadata.status', '==', 'available'),
      where('metadata.reported', '==', false),
      where('location.region', '==', region)
    )

    const querySnapshot = await getDocs(itemsQuery)
    let items = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as MarketplaceItem[]

    // 추가 필터링 적용
    items = applyFilters(items, filters)

    return {
      items,
      total: items.length,
      hasMore: false,
      filters: filters || {}
    }
  } catch (error) {
    console.error('Error searching marketplace items by region:', error)
    return {
      items: [],
      total: 0,
      hasMore: false,
      filters: {}
    }
  }
}

/**
 * 텍스트 검색
 */
export async function searchMarketplaceItems(
  searchTerm: string,
  filters?: ItemSearchFilters
): Promise<ItemSearchResult> {
  try {
    // 기본 쿼리
    let itemsQuery = query(
      marketplaceItemsCollection,
      where('metadata.status', '==', 'available'),
      where('metadata.reported', '==', false)
    )

    // 카테고리 필터
    if (filters?.category && filters.category.length > 0 && filters.category.length === 1) {
      // Firestore에서는 단일 카테고리만 쿼리 가능
      itemsQuery = query(
        itemsQuery,
        where('category', '==', filters.category[0])
      )
    }

    const querySnapshot = await getDocs(itemsQuery)
    let items = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as MarketplaceItem[]

    // 클라이언트에서 텍스트 검색 (Firestore 전문 검색 제한)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      items = items.filter(item => {
        const searchableText = [
          item.title,
          item.description,
          item.location.region,
          item.specs.brand || '',
          ...(item.metadata.tags || []),
          ...(item.metadata.keywords || [])
        ].join(' ').toLowerCase()

        return searchableText.includes(lowerSearchTerm)
      })
    }

    // 추가 필터링
    items = applyFilters(items, filters)

    return {
      items,
      total: items.length,
      hasMore: false,
      filters: filters || {}
    }
  } catch (error) {
    console.error('Error searching marketplace items:', error)
    return {
      items: [],
      total: 0,
      hasMore: false,
      filters: {}
    }
  }
}

/**
 * 지리적 검색 (위치 기반)
 */
export async function searchMarketplaceItemsByLocation(
  search: GeographicItemSearch
): Promise<MarketplaceItem[]> {
  try {
    // 경계 박스 계산
    const bounds = calculateBoundingBox(search.center, search.radius)

    // Firestore 지리적 쿼리
    let itemsQuery = query(
      marketplaceItemsCollection,
      where('metadata.status', '==', 'available'),
      where('metadata.reported', '==', false),
      where('location.geopoint', '>=', new GeoPoint(bounds.southwest.lat, bounds.southwest.lng)),
      where('location.geopoint', '<=', new GeoPoint(bounds.northeast.lat, bounds.northeast.lng))
    )

    if (search.limit) {
      itemsQuery = query(itemsQuery, limit(search.limit))
    }

    const querySnapshot = await getDocs(itemsQuery)
    let items = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as MarketplaceItem[]

    // 클라이언트에서 정확한 거리 계산 및 필터링
    items = items.filter(item => {
      if (!item.location.geopoint) return false

      const itemCoords = geoPointToKakao(item.location.geopoint)
      const distance = calculateDistance(search.center, itemCoords)
      return distance <= search.radius
    })

    // 카테고리 필터링
    if (search.category) {
      items = items.filter(item => item.category === search.category)
    }

    // 가격 필터링
    if (search.priceRange) {
      items = items.filter(item => {
        const price = item.pricing.price
        if (search.priceRange!.min && price < search.priceRange!.min) return false
        if (search.priceRange!.max && price > search.priceRange!.max) return false
        return true
      })
    }

    // 거리순 정렬
    items.sort((a, b) => {
      const distanceA = a.location.geopoint ? calculateDistance(search.center, geoPointToKakao(a.location.geopoint)) : Infinity
      const distanceB = b.location.geopoint ? calculateDistance(search.center, geoPointToKakao(b.location.geopoint)) : Infinity
      return distanceA - distanceB
    })

    return items
  } catch (error) {
    console.error('Error searching marketplace items by location:', error)
    return []
  }
}

/**
 * 조회수 증가
 */
export async function incrementItemViews(itemId: string): Promise<void> {
  try {
    const item = await getMarketplaceItem(itemId, false)
    if (item) {
      const docRef = getMarketplaceItemDoc(itemId)
      await updateDoc(docRef, {
        'stats.views': item.stats.views + 1,
        'metadata.updatedAt': Timestamp.now()
      })
    }
  } catch (error) {
    console.error('Error incrementing item views:', error)
  }
}

/**
 * 관심 상품 토글
 */
export async function toggleItemFavorite(
  itemId: string,
  increment: boolean
): Promise<{ success: boolean }> {
  try {
    const item = await getMarketplaceItem(itemId, false)
    if (!item) {
      return { success: false }
    }

    const docRef = getMarketplaceItemDoc(itemId)
    const newFavorites = increment
      ? item.stats.favorites + 1
      : Math.max(0, item.stats.favorites - 1)

    await updateDoc(docRef, {
      'stats.favorites': newFavorites,
      'metadata.updatedAt': Timestamp.now()
    })

    return { success: true }
  } catch (error) {
    console.error('Error toggling item favorite:', error)
    return { success: false }
  }
}

// ===== Helper Functions =====

/**
 * 아이템 소유권 검증
 */
async function validateItemOwnership(itemId: string, userId: string): Promise<{ isOwner: boolean; item?: MarketplaceItem }> {
  const item = await getMarketplaceItem(itemId, false)
  if (!item) {
    return { isOwner: false }
  }
  return { isOwner: item.metadata.sellerId === userId, item }
}

/**
 * 검색 키워드 생성
 */
function generateSearchKeywords(data: Partial<CreateItemData>): string[] {
  const keywords = new Set<string>()

  // 제목에서 키워드 추출
  if (data.title) {
    keywords.add(data.title.toLowerCase())
    data.title.split(' ').forEach(word => keywords.add(word.toLowerCase()))
  }

  // 설명에서 키워드 추출 (짧은 단어 제외)
  if (data.description) {
    data.description.split(' ').forEach(word => {
      if (word.length > 1) keywords.add(word.toLowerCase())
    })
  }

  // 카테고리 추가
  if (data.category) {
    keywords.add(data.category)
  }

  // 브랜드 추가
  if (data.specs?.brand) {
    keywords.add(data.specs.brand.toLowerCase())
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
function applyFilters(items: MarketplaceItem[], filters?: ItemSearchFilters): MarketplaceItem[] {
  if (!filters) return items

  let filtered = items

  // 카테고리 필터 (여러 카테고리)
  if (filters.category && filters.category.length > 0) {
    filtered = filtered.filter(item =>
      filters.category!.includes(item.category)
    )
  }

  // 상태 필터
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(item =>
      filters.status!.includes(item.metadata.status)
    )
  }

  // 지역 필터
  if (filters.region && filters.region.length > 0) {
    filtered = filtered.filter(item =>
      filters.region!.includes(item.location.region)
    )
  }

  // 상품 상태 필터
  if (filters.condition && filters.condition.length > 0) {
    filtered = filtered.filter(item =>
      filters.condition!.includes(item.specs.condition)
    )
  }

  // 가격 범위 필터
  if (filters.priceRange) {
    filtered = filtered.filter(item => {
      const price = item.pricing.price
      if (filters.priceRange!.min && price < filters.priceRange!.min) return false
      if (filters.priceRange!.max && price > filters.priceRange!.max) return false
      return true
    })
  }

  // 사이즈 필터
  if (filters.sizeRange && filters.sizeRange.length > 0) {
    filtered = filtered.filter(item =>
      item.specs.size && filters.sizeRange!.includes(item.specs.size)
    )
  }

  // 브랜드 필터
  if (filters.brands && filters.brands.length > 0) {
    filtered = filtered.filter(item =>
      item.specs.brand && filters.brands!.includes(item.specs.brand)
    )
  }

  // 거래 방식 필터
  if (filters.tradeMethod && filters.tradeMethod.length > 0) {
    filtered = filtered.filter(item =>
      filters.tradeMethod!.includes(item.pricing.tradeMethod)
    )
  }

  // 택배 가능 여부 필터
  if (filters.deliveryAvailable !== undefined) {
    filtered = filtered.filter(item =>
      item.location.deliveryAvailable === filters.deliveryAvailable
    )
  }

  // 협상 가능 여부 필터
  if (filters.negotiable !== undefined) {
    filtered = filtered.filter(item =>
      item.pricing.negotiable === filters.negotiable
    )
  }

  // 위치 기반 필터
  if (filters.coordinates && filters.radius) {
    filtered = filtered.filter(item => {
      if (!item.location.geopoint) return false

      const itemCoords = geoPointToKakao(item.location.geopoint)
      const distance = calculateDistance(filters.coordinates!, itemCoords)
      return distance <= filters.radius!
    })
  }

  return filtered
}

// ===== Inquiry Management Actions =====

/**
 * 거래 문의 시작
 */
export async function createInquiryAction(
  data: CreateInquiryData
): Promise<{ success: boolean; inquiryId?: string; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 데이터 검증
    if (!data.initialMessage?.trim()) {
      return { success: false, error: '문의 내용을 입력해주세요.' }
    }

    if (data.initialMessage.length > 1000) {
      return { success: false, error: '문의 내용은 1000자를 초과할 수 없습니다.' }
    }

    // 상품 정보 조회
    const item = await getMarketplaceItem(data.itemId, false)
    if (!item) {
      return { success: false, error: '상품을 찾을 수 없습니다.' }
    }

    // 자신의 상품에 문의하는 것을 방지
    if (item.metadata.sellerId === user.uid) {
      return { success: false, error: '자신의 상품에는 문의할 수 없습니다.' }
    }

    // 문의 데이터 준비
    const inquiryDoc: Omit<ItemInquiry, 'id'> = {
      itemId: data.itemId,
      itemTitle: item.title,
      itemPrice: item.pricing.price,
      itemStatus: item.metadata.status,
      sellerId: item.metadata.sellerId,
      sellerName: 'Unknown', // TODO: 판매자 이름 조회 필요
      buyerId: user.uid,
      buyerName: user.displayName || '익명',
      status: 'active',
      messageCount: 1,
      lastMessageAt: Timestamp.now(),
      lastMessageContent: data.initialMessage,
      lastMessageSender: 'buyer',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      reported: false
    }

    // 문의 생성
    const inquiryRef = await addDoc(collection(db, 'inquiries'), inquiryDoc)
    const inquiryId = inquiryRef.id

    // 초기 메시지 생성
    const messageDoc: Omit<InquiryMessage, 'id'> = {
      inquiryId,
      senderId: user.uid,
      senderName: user.displayName || '익명',
      senderType: 'buyer',
      content: data.initialMessage.trim(),
      messageType: 'text',
      createdAt: Timestamp.now(),
      status: 'active'
    }

    await addDoc(collection(db, 'inquiry_messages'), messageDoc)

    // 상품의 문의 수 증가
    await updateDoc(getMarketplaceItemDoc(data.itemId), {
      'stats.inquiries': item.stats.inquiries + 1,
      'metadata.updatedAt': Timestamp.now()
    })

    return { success: true, inquiryId }

  } catch (error) {
    console.error('Error creating inquiry:', error)
    return {
      success: false,
      error: '문의 생성 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 문의 메시지 전송
 */
export async function sendInquiryMessageAction(
  data: CreateMessageData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 데이터 검증
    if (!data.content?.trim()) {
      return { success: false, error: '메시지 내용을 입력해주세요.' }
    }

    if (data.content.length > 1000) {
      return { success: false, error: '메시지는 1000자를 초과할 수 없습니다.' }
    }

    if (data.messageType === 'offer' && (!data.offerPrice || data.offerPrice <= 0)) {
      return { success: false, error: '올바른 가격 제안을 입력해주세요.' }
    }

    // 문의 정보 조회
    const inquiryDoc = await getDoc(doc(db, 'inquiries', data.inquiryId))
    if (!inquiryDoc.exists()) {
      return { success: false, error: '문의를 찾을 수 없습니다.' }
    }

    const inquiry = { ...inquiryDoc.data(), id: inquiryDoc.id } as ItemInquiry

    // 권한 확인 (구매자 또는 판매자만 메시지 전송 가능)
    if (inquiry.buyerId !== user.uid && inquiry.sellerId !== user.uid) {
      return { success: false, error: '메시지 전송 권한이 없습니다.' }
    }

    // 문의 상태 확인
    if (inquiry.status === 'blocked' || inquiry.status === 'cancelled') {
      return { success: false, error: '종료된 문의에는 메시지를 보낼 수 없습니다.' }
    }

    // 발신자 타입 결정
    const senderType = inquiry.buyerId === user.uid ? 'buyer' : 'seller'

    // 메시지 생성
    const messageDoc: Omit<InquiryMessage, 'id'> = {
      inquiryId: data.inquiryId,
      senderId: user.uid,
      senderName: user.displayName || '익명',
      senderType,
      content: data.content.trim(),
      messageType: data.messageType || 'text',
      offerPrice: data.offerPrice,
      createdAt: Timestamp.now(),
      status: 'active'
    }

    const messageRef = await addDoc(collection(db, 'inquiry_messages'), messageDoc)

    // 문의 정보 업데이트 (마지막 메시지 정보)
    const inquiryUpdateData = {
      messageCount: inquiry.messageCount + 1,
      lastMessageAt: Timestamp.now(),
      lastMessageContent: data.content.trim(),
      lastMessageSender: senderType,
      updatedAt: Timestamp.now()
    }

    await updateDoc(doc(db, 'inquiries', data.inquiryId), inquiryUpdateData)

    return { success: true, messageId: messageRef.id }

  } catch (error) {
    console.error('Error sending inquiry message:', error)
    return {
      success: false,
      error: '메시지 전송 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 사용자의 문의 목록 조회
 */
export async function getUserInquiriesAction(
  filters?: InquirySearchFilters
): Promise<{ success: boolean; data?: InquiryListResponse; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 기본 쿼리 (사용자가 참여한 문의)
    let inquiriesQuery = query(
      collection(db, 'inquiries'),
      where('buyerId', '==', user.uid)
    )

    // 판매자 관점의 문의도 포함하려면 두 개의 쿼리가 필요 (Firestore 제한)
    const buyerQuery = query(
      collection(db, 'inquiries'),
      where('buyerId', '==', user.uid),
      orderBy('lastMessageAt', 'desc'),
      limit(50)
    )

    const sellerQuery = query(
      collection(db, 'inquiries'),
      where('sellerId', '==', user.uid),
      orderBy('lastMessageAt', 'desc'),
      limit(50)
    )

    const [buyerSnapshot, sellerSnapshot] = await Promise.all([
      getDocs(buyerQuery),
      getDocs(sellerQuery)
    ])

    // 결과 합치기
    const allInquiries = [
      ...buyerSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ItemInquiry)),
      ...sellerSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ItemInquiry))
    ]

    // 중복 제거 및 정렬
    const uniqueInquiries = allInquiries
      .filter((inquiry, index, arr) =>
        index === arr.findIndex(i => i.id === inquiry.id)
      )
      .sort((a, b) => b.lastMessageAt.toMillis() - a.lastMessageAt.toMillis())

    // 필터 적용
    let filteredInquiries = uniqueInquiries

    if (filters?.status && filters.status.length > 0) {
      filteredInquiries = filteredInquiries.filter(inquiry =>
        filters.status!.includes(inquiry.status)
      )
    }

    if (filters?.itemId) {
      filteredInquiries = filteredInquiries.filter(inquiry =>
        inquiry.itemId === filters.itemId
      )
    }

    if (filters?.userType) {
      if (filters.userType === 'buyer') {
        filteredInquiries = filteredInquiries.filter(inquiry =>
          inquiry.buyerId === user.uid
        )
      } else {
        filteredInquiries = filteredInquiries.filter(inquiry =>
          inquiry.sellerId === user.uid
        )
      }
    }

    return {
      success: true,
      data: {
        inquiries: filteredInquiries,
        total: filteredInquiries.length,
        hasMore: false,
        filters: filters || {}
      }
    }

  } catch (error) {
    console.error('Error getting user inquiries:', error)
    return {
      success: false,
      error: '문의 목록 조회 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 문의 메시지 목록 조회
 */
export async function getInquiryMessagesAction(
  inquiryId: string
): Promise<{ success: boolean; data?: MessageListResponse; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 문의 정보 조회
    const inquiryDoc = await getDoc(doc(db, 'inquiries', inquiryId))
    if (!inquiryDoc.exists()) {
      return { success: false, error: '문의를 찾을 수 없습니다.' }
    }

    const inquiry = { ...inquiryDoc.data(), id: inquiryDoc.id } as ItemInquiry

    // 권한 확인
    if (inquiry.buyerId !== user.uid && inquiry.sellerId !== user.uid) {
      return { success: false, error: '문의 조회 권한이 없습니다.' }
    }

    // 메시지 목록 조회
    const messagesQuery = query(
      collection(db, 'inquiry_messages'),
      where('inquiryId', '==', inquiryId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'asc')
    )

    const messagesSnapshot = await getDocs(messagesQuery)
    const messages = messagesSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as InquiryMessage[]

    // 읽음 상태 업데이트
    const userType = inquiry.buyerId === user.uid ? 'buyer' : 'seller'
    const readFieldName = userType === 'buyer' ? 'buyerLastRead' : 'sellerLastRead'

    await updateDoc(doc(db, 'inquiries', inquiryId), {
      [readFieldName]: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    return {
      success: true,
      data: {
        messages,
        total: messages.length,
        hasMore: false,
        inquiry
      }
    }

  } catch (error) {
    console.error('Error getting inquiry messages:', error)
    return {
      success: false,
      error: '메시지 조회 중 오류가 발생했습니다.'
    }
  }
}

/**
 * 문의 상태 업데이트
 */
export async function updateInquiryStatusAction(
  inquiryId: string,
  data: UpdateInquiryData
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 문의 정보 조회
    const inquiryDoc = await getDoc(doc(db, 'inquiries', inquiryId))
    if (!inquiryDoc.exists()) {
      return { success: false, error: '문의를 찾을 수 없습니다.' }
    }

    const inquiry = { ...inquiryDoc.data(), id: inquiryDoc.id } as ItemInquiry

    // 권한 확인 (구매자 또는 판매자만)
    if (inquiry.buyerId !== user.uid && inquiry.sellerId !== user.uid) {
      return { success: false, error: '문의 상태 변경 권한이 없습니다.' }
    }

    // 업데이트 데이터 준비
    const updateData: Partial<ItemInquiry> = {
      updatedAt: Timestamp.now()
    }

    if (data.status) {
      updateData.status = data.status

      if (data.status === 'completed') {
        updateData.completedAt = Timestamp.now()
        updateData.completedBy = user.uid
        if (data.finalPrice) {
          updateData.finalPrice = data.finalPrice
        }
      }
    }

    if (data.finalPrice && inquiry.status === 'completed') {
      updateData.finalPrice = data.finalPrice
    }

    await updateDoc(doc(db, 'inquiries', inquiryId), updateData)

    // 거래 완료 시 상품 상태도 업데이트
    if (data.status === 'completed') {
      await updateDoc(getMarketplaceItemDoc(inquiry.itemId), {
        'metadata.status': 'sold',
        'metadata.updatedAt': Timestamp.now()
      })
    }

    return { success: true }

  } catch (error) {
    console.error('Error updating inquiry status:', error)
    return {
      success: false,
      error: '문의 상태 업데이트 중 오류가 발생했습니다.'
    }
  }
}