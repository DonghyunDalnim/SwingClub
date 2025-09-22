/**
 * 마켓플레이스 통합 테스트
 * Types, Collections, Actions 간의 완전한 워크플로 테스트
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

// Actions
import {
  createMarketplaceItem,
  getMarketplaceItem,
  updateMarketplaceItem,
  deleteMarketplaceItem,
  getMarketplaceItems,
  getMarketplaceItemsByCategory,
  searchMarketplaceItemsByRegion,
  searchMarketplaceItems,
  searchMarketplaceItemsByLocation,
  incrementItemViews,
  toggleItemFavorite
} from '@/lib/actions/marketplace'

// Types
import type {
  MarketplaceItem,
  CreateItemData,
  UpdateItemData,
  ItemSearchFilters,
  GeographicItemSearch,
  ProductCategory,
  ItemStatus,
  ProductCondition,
  TradeMethod,
  ItemSortOption
} from '@/lib/types/marketplace'

// Collections
import {
  marketplaceItemsCollection,
  getMarketplaceItemDoc,
  COLLECTION_NAMES
} from '@/lib/firebase/collections'

// Validation
import {
  validateMarketplaceItemData,
  sanitizeMarketplaceItemData
} from '@/lib/utils/validation'

// Geo utilities
import {
  kakaoToGeoPoint,
  geoPointToKakao,
  calculateDistance,
  isValidCoordinates,
  findNearestRegion
} from '@/lib/utils/geo'

// Mock Firebase
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
  GeoPoint: jest.fn().mockImplementation((lat: number, lng: number) => ({
    latitude: lat,
    longitude: lng
  })),
  Timestamp: {
    now: jest.fn(() => ({ toMillis: () => Date.now() })),
    fromMillis: jest.fn((ms: number) => ({ toMillis: () => ms }))
  },
  writeBatch: jest.fn()
}))

jest.mock('@/lib/firebase', () => ({
  db: {}
}))

jest.mock('@/lib/firebase/collections', () => ({
  marketplaceItemsCollection: { path: 'marketplace_items' },
  getMarketplaceItemDoc: jest.fn((id: string) => ({ id, path: `marketplace_items/${id}` })),
  COLLECTION_NAMES: {
    MARKETPLACE_ITEMS: 'marketplace_items'
  }
}))

// Realistic test data for swing dance community
const createTestItemData = (overrides: Partial<CreateItemData> = {}): CreateItemData => ({
  title: '브랜드 라틴댄스화 (여성용)',
  description: '브랜드 라틴댄스화입니다. 몇 번 착용했지만 상태 매우 좋아요. 스웨이드 소재로 그립감이 좋고 편안합니다.',
  category: 'shoes' as ProductCategory,
  pricing: {
    price: 150000,
    currency: 'KRW' as const,
    negotiable: true,
    deliveryFee: 3000,
    freeDelivery: false,
    tradeMethod: 'both' as TradeMethod,
    notes: '직거래 시 배송비 없음'
  },
  specs: {
    brand: 'Supadance',
    size: '240',
    color: '베이지',
    condition: 'like_new' as ProductCondition,
    purchaseDate: '2024-06',
    originalPrice: 250000,
    material: '스웨이드',
    gender: 'female' as const,
    features: ['스웨이드', '라틴힐', '쿠션솔']
  },
  location: {
    region: '강남',
    district: '서울특별시 강남구',
    preferredMeetingPlaces: ['강남역 2번출구', '압구정로데오역'],
    deliveryAvailable: true,
    coordinates: { lat: 37.5173, lng: 127.0473 }
  },
  images: [
    'https://firebasestorage.googleapis.com/image1.jpg',
    'https://firebasestorage.googleapis.com/image2.jpg'
  ],
  tags: ['라틴댄스', '댄스화', '여성용'],
  keywords: ['supadance', '라틴댄스화', '베이지', '240', '강남']
})

const createMockMarketplaceItem = (id: string, overrides: Partial<MarketplaceItem> = {}): MarketplaceItem => {
  const testData = createTestItemData()
  return {
    id,
    title: testData.title,
    description: testData.description,
    category: testData.category,
    pricing: testData.pricing,
    specs: testData.specs,
    location: {
      ...testData.location,
      geopoint: new GeoPoint(testData.location.coordinates!.lat, testData.location.coordinates!.lng)
    },
    stats: {
      views: 5,
      favorites: 2,
      inquiries: 1
    },
    metadata: {
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      sellerId: 'seller123',
      status: 'available' as ItemStatus,
      featured: false,
      reported: false,
      tags: testData.tags,
      keywords: testData.keywords
    },
    images: testData.images,
    ...overrides
  }
}

describe('Marketplace Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete Item Lifecycle (CRUD)', () => {
    it('should handle complete item lifecycle: create → read → update → delete', async () => {
      const sellerId = 'seller123'
      const itemData = createTestItemData()

      // Mock create
      const mockDocRef = { id: 'item123' }
      ;(addDoc as jest.Mock).mockResolvedValue(mockDocRef)

      // 1. CREATE - Test type compatibility and validation integration
      const createResult = await createMarketplaceItem(itemData, sellerId)

      expect(createResult.success).toBe(true)
      expect(createResult.itemId).toBe('item123')
      expect(addDoc).toHaveBeenCalledWith(
        marketplaceItemsCollection,
        expect.objectContaining({
          title: itemData.title,
          category: itemData.category,
          location: expect.objectContaining({
            geopoint: expect.any(Object), // GeoPoint conversion
            region: expect.any(String)
          }),
          metadata: expect.objectContaining({
            sellerId,
            status: 'available',
            keywords: expect.arrayContaining(['supadance'])
          })
        })
      )

      // 2. READ - Test collection reference integration
      const mockItem = createMockMarketplaceItem('item123')
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'item123',
        data: () => mockItem
      })

      const retrievedItem = await getMarketplaceItem('item123', true)

      expect(retrievedItem).toBeTruthy()
      expect(retrievedItem!.id).toBe('item123')
      expect(retrievedItem!.pricing.price).toBe(150000)
      expect(getMarketplaceItemDoc).toHaveBeenCalledWith('item123')

      // 3. UPDATE - Test partial update and validation
      const updateData: UpdateItemData = {
        pricing: {
          ...itemData.pricing,
          price: 130000,
          negotiable: false
        },
        location: {
          ...itemData.location,
          coordinates: { lat: 37.5563, lng: 126.9236 } // 홍대
        }
      }

      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      const updateResult = await updateMarketplaceItem('item123', updateData, sellerId)

      expect(updateResult.success).toBe(true)
      expect(updateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          pricing: expect.objectContaining({
            price: 130000,
            negotiable: false
          }),
          location: expect.objectContaining({
            geopoint: expect.any(Object), // Updated GeoPoint
            region: expect.any(String) // Auto-detected region
          }),
          metadata: expect.objectContaining({
            updatedAt: expect.any(Object)
          })
        })
      )

      // 4. DELETE - Test ownership validation
      ;(deleteDoc as jest.Mock).mockResolvedValue(undefined)

      const deleteResult = await deleteMarketplaceItem('item123', sellerId)

      expect(deleteResult.success).toBe(true)
      expect(deleteDoc).toHaveBeenCalledWith(expect.any(Object))
    })

    it('should reject unauthorized updates and deletes', async () => {
      const mockItem = createMockMarketplaceItem('item123', {
        metadata: {
          ...createMockMarketplaceItem('item123').metadata,
          sellerId: 'owner123'
        }
      })
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'item123',
        data: () => mockItem
      })

      // Unauthorized update
      const updateResult = await updateMarketplaceItem('item123', { pricing: { ...mockItem.pricing, price: 100000 } }, 'different_user')
      expect(updateResult.success).toBe(false)
      expect(updateResult.error).toContain('권한이 없습니다')

      // Unauthorized delete
      const deleteResult = await deleteMarketplaceItem('item123', 'different_user')
      expect(deleteResult.success).toBe(false)
      expect(deleteResult.error).toContain('권한이 없습니다')
    })
  })

  describe('Search Workflow Integration', () => {
    it('should handle complex search with filters and geographic coordinates', async () => {
      const mockItems = [
        createMockMarketplaceItem('item1', {
          category: 'shoes',
          location: {
            ...createMockMarketplaceItem('item1').location,
            region: '강남',
            geopoint: new GeoPoint(37.5173, 127.0473)
          }
        }),
        createMockMarketplaceItem('item2', {
          category: 'clothing',
          location: {
            ...createMockMarketplaceItem('item2').location,
            region: '홍대',
            geopoint: new GeoPoint(37.5563, 126.9236)
          }
        })
      ]

      ;(getDocs as jest.Mock).mockResolvedValue({
        docs: mockItems.map(item => ({
          id: item.id,
          data: () => item
        }))
      })

      const filters: ItemSearchFilters = {
        category: ['shoes'],
        priceRange: { min: 100000, max: 200000 },
        region: ['강남'],
        condition: ['like_new', 'good'],
        coordinates: { lat: 37.5173, lng: 127.0473 },
        radius: 5
      }

      const searchResult = await searchMarketplaceItems('댄스화', filters)

      expect(searchResult.items).toHaveLength(expect.any(Number))
      expect(query).toHaveBeenCalledWith(
        marketplaceItemsCollection,
        where('metadata.status', '==', 'available'),
        where('metadata.reported', '==', false)
      )
    })

    it('should integrate geographic search with coordinate conversion', async () => {
      const searchParams: GeographicItemSearch = {
        center: { lat: 37.5173, lng: 127.0473 }, // 강남
        radius: 3,
        category: 'shoes',
        priceRange: { min: 50000, max: 300000 },
        limit: 10
      }

      const mockItems = [
        createMockMarketplaceItem('nearby1', {
          location: {
            ...createMockMarketplaceItem('nearby1').location,
            geopoint: new GeoPoint(37.5200, 127.0500) // 강남 근처
          }
        }),
        createMockMarketplaceItem('faraway1', {
          location: {
            ...createMockMarketplaceItem('faraway1').location,
            geopoint: new GeoPoint(37.5563, 126.9236) // 홍대 (멀음)
          }
        })
      ]

      ;(getDocs as jest.Mock).mockResolvedValue({
        docs: mockItems.map(item => ({
          id: item.id,
          data: () => item
        }))
      })

      const results = await searchMarketplaceItemsByLocation(searchParams)

      // Should filter by distance and sort by proximity
      expect(results).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 'nearby1' })
      ]))

      // Verify bounding box query was used
      expect(query).toHaveBeenCalledWith(
        marketplaceItemsCollection,
        where('metadata.status', '==', 'available'),
        where('metadata.reported', '==', false),
        where('location.geopoint', '>=', expect.any(Object)),
        where('location.geopoint', '<=', expect.any(Object))
      )
    })
  })

  describe('Permission and Validation Workflow', () => {
    it('should validate data through complete validation pipeline', async () => {
      // Test validation integration
      const invalidData: CreateItemData = {
        title: '', // Invalid: empty title
        description: 'short', // Invalid: too short
        category: 'invalid' as ProductCategory, // Invalid category
        pricing: {
          price: -100, // Invalid: negative price
          currency: 'USD' as const, // Invalid: wrong currency
          negotiable: true,
          tradeMethod: 'invalid' as TradeMethod // Invalid trade method
        },
        specs: {
          condition: 'invalid' as ProductCondition, // Invalid condition
          brand: 'x'.repeat(60) // Invalid: too long
        },
        location: {
          region: '', // Invalid: empty region
          deliveryAvailable: true
        },
        images: [] // Invalid: no images
      }

      const validationErrors = validateMarketplaceItemData(invalidData)

      expect(validationErrors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: 'TITLE_REQUIRED' }),
          expect.objectContaining({ code: 'DESCRIPTION_TOO_SHORT' }),
          expect.objectContaining({ code: 'INVALID_CATEGORY' }),
          expect.objectContaining({ code: 'INVALID_PRICE' }),
          expect.objectContaining({ code: 'INVALID_CURRENCY' }),
          expect.objectContaining({ code: 'INVALID_TRADE_METHOD' }),
          expect.objectContaining({ code: 'INVALID_CONDITION' }),
          expect.objectContaining({ code: 'BRAND_TOO_LONG' }),
          expect.objectContaining({ code: 'REGION_REQUIRED' }),
          expect.objectContaining({ code: 'IMAGES_REQUIRED' })
        ])
      )

      // Test sanitization integration
      const maliciousData = createTestItemData({
        title: '<script>alert("xss")</script>Malicious Title',
        description: 'javascript:void(0) Description with <b>HTML</b>',
        pricing: {
          ...createTestItemData().pricing,
          notes: 'Notes with "quotes" and <tags>'
        }
      })

      const sanitizedData = sanitizeMarketplaceItemData(maliciousData)

      expect(sanitizedData.title).not.toContain('<script>')
      expect(sanitizedData.title).not.toContain('javascript:')
      expect(sanitizedData.description).not.toContain('<b>')
      expect(sanitizedData.pricing.notes).not.toContain('"')
    })

    it('should handle error propagation across layers', async () => {
      // Test Firebase error propagation
      ;(addDoc as jest.Mock).mockRejectedValue(new Error('Firestore permission denied'))

      const validData = createTestItemData()
      const result = await createMarketplaceItem(validData, 'seller123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('상품 등록 중 오류가 발생했습니다')

      // Test validation error propagation
      const invalidData = createTestItemData({ title: '' })
      const invalidResult = await createMarketplaceItem(invalidData, 'seller123')

      expect(invalidResult.success).toBe(false)
      expect(invalidResult.error).toContain('상품 제목은 필수입니다')
    })
  })

  describe('Geographic Integration Workflow', () => {
    it('should handle coordinate conversion and region detection', async () => {
      const itemData = createTestItemData({
        location: {
          region: '', // Will be auto-detected
          district: '서울특별시 강남구',
          preferredMeetingPlaces: ['강남역'],
          deliveryAvailable: true,
          coordinates: { lat: 37.5173, lng: 127.0473 } // 강남 좌표
        }
      })

      ;(addDoc as jest.Mock).mockResolvedValue({ id: 'item123' })

      const result = await createMarketplaceItem(itemData, 'seller123')

      expect(result.success).toBe(true)
      expect(addDoc).toHaveBeenCalledWith(
        marketplaceItemsCollection,
        expect.objectContaining({
          location: expect.objectContaining({
            geopoint: expect.objectContaining({
              latitude: 37.5173,
              longitude: 127.0473
            }),
            region: expect.any(String) // Should be auto-detected
          })
        })
      )
    })

    it('should validate coordinates and handle invalid geo data', async () => {
      const invalidCoordinates = { lat: 200, lng: 200 } // Invalid coordinates

      expect(isValidCoordinates(invalidCoordinates)).toBe(false)

      const itemData = createTestItemData({
        location: {
          region: '강남',
          district: '서울특별시 강남구',
          preferredMeetingPlaces: ['강남역'],
          deliveryAvailable: true,
          coordinates: invalidCoordinates
        }
      })

      ;(addDoc as jest.Mock).mockResolvedValue({ id: 'item123' })

      const result = await createMarketplaceItem(itemData, 'seller123')

      // Should still succeed but without geopoint
      expect(result.success).toBe(true)
      expect(addDoc).toHaveBeenCalledWith(
        marketplaceItemsCollection,
        expect.objectContaining({
          location: expect.objectContaining({
            geopoint: undefined, // Invalid coordinates should not create geopoint
            region: '강남' // Manual region should be used
          })
        })
      )
    })
  })

  describe('Category-based Browsing Workflow', () => {
    it('should handle category filtering with type safety', async () => {
      const mockShoes = Array.from({ length: 3 }, (_, i) =>
        createMockMarketplaceItem(`shoe${i}`, { category: 'shoes' })
      )
      const mockClothing = Array.from({ length: 2 }, (_, i) =>
        createMockMarketplaceItem(`cloth${i}`, { category: 'clothing' })
      )

      ;(getDocs as jest.Mock).mockResolvedValue({
        docs: mockShoes.map(item => ({
          id: item.id,
          data: () => item
        }))
      })

      const result = await getMarketplaceItemsByCategory('shoes', 1, 10, 'price_low')

      expect(result.data).toHaveLength(3)
      expect(result.data.every(item => item.category === 'shoes')).toBe(true)
      expect(query).toHaveBeenCalledWith(
        marketplaceItemsCollection,
        where('metadata.status', '==', 'available'),
        where('metadata.reported', '==', false),
        where('category', '==', 'shoes')
      )
    })

    it('should handle different sort options correctly', async () => {
      const mockItems = [
        createMockMarketplaceItem('item1', { pricing: { ...createMockMarketplaceItem('item1').pricing, price: 100000 } }),
        createMockMarketplaceItem('item2', { pricing: { ...createMockMarketplaceItem('item2').pricing, price: 200000 } })
      ]

      ;(getDocs as jest.Mock).mockResolvedValue({
        docs: mockItems.map(item => ({ id: item.id, data: () => item }))
      })

      // Test price sorting
      await getMarketplaceItemsByCategory('shoes', 1, 10, 'price_high')

      expect(query).toHaveBeenCalledWith(
        expect.anything(),
        orderBy('pricing.price', 'desc')
      )

      // Test popularity sorting
      await getMarketplaceItemsByCategory('shoes', 1, 10, 'popular')

      expect(query).toHaveBeenCalledWith(
        expect.anything(),
        orderBy('stats.views', 'desc')
      )
    })
  })

  describe('Pagination Workflow', () => {
    it('should handle pagination with proper hasNext/hasPrev logic', async () => {
      // Mock 21 items (pageSize + 1 to test hasNext)
      const mockItems = Array.from({ length: 21 }, (_, i) =>
        createMockMarketplaceItem(`item${i}`)
      )

      ;(getDocs as jest.Mock).mockResolvedValue({
        docs: mockItems.map(item => ({ id: item.id, data: () => item }))
      })

      const result = await getMarketplaceItems(2, 20, 'latest')

      expect(result.pagination).toEqual({
        page: 2,
        limit: 20,
        total: 20, // Should be limited to pageSize
        hasNext: true, // 21st item indicates more items
        hasPrev: true // Page 2 has previous pages
      })
      expect(result.data).toHaveLength(20) // Should exclude the +1 item
    })

    it('should handle edge cases for first and last pages', async () => {
      const mockItems = Array.from({ length: 5 }, (_, i) =>
        createMockMarketplaceItem(`item${i}`)
      )

      ;(getDocs as jest.Mock).mockResolvedValue({
        docs: mockItems.map(item => ({ id: item.id, data: () => item }))
      })

      // First page
      const firstPageResult = await getMarketplaceItems(1, 10, 'latest')
      expect(firstPageResult.pagination.hasPrev).toBe(false)
      expect(firstPageResult.pagination.hasNext).toBe(false) // Less than pageSize

      // Test with exactly pageSize items
      const exactPageSizeItems = Array.from({ length: 10 }, (_, i) =>
        createMockMarketplaceItem(`item${i}`)
      )
      ;(getDocs as jest.Mock).mockResolvedValue({
        docs: exactPageSizeItems.map(item => ({ id: item.id, data: () => item }))
      })

      const exactResult = await getMarketplaceItems(1, 10, 'latest')
      expect(exactResult.pagination.hasNext).toBe(false) // Exactly pageSize, no more
    })
  })

  describe('Statistics Update Workflow', () => {
    it('should handle view increment integration', async () => {
      const mockItem = createMockMarketplaceItem('item123', { stats: { views: 10, favorites: 5, inquiries: 2 } })

      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'item123',
        data: () => mockItem
      })
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      await incrementItemViews('item123')

      expect(updateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        {
          'stats.views': 11, // Incremented from 10
          'metadata.updatedAt': expect.any(Object)
        }
      )
    })

    it('should handle favorite toggle with proper bounds', async () => {
      const mockItem = createMockMarketplaceItem('item123', { stats: { views: 10, favorites: 5, inquiries: 2 } })

      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'item123',
        data: () => mockItem
      })
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      // Test increment
      let result = await toggleItemFavorite('item123', true)
      expect(result.success).toBe(true)
      expect(updateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        {
          'stats.favorites': 6, // Incremented from 5
          'metadata.updatedAt': expect.any(Object)
        }
      )

      // Test decrement with zero floor
      const zeroFavItem = createMockMarketplaceItem('item123', { stats: { views: 10, favorites: 0, inquiries: 2 } })
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'item123',
        data: () => zeroFavItem
      })

      result = await toggleItemFavorite('item123', false)
      expect(result.success).toBe(true)
      expect(updateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        {
          'stats.favorites': 0, // Should not go below 0
          'metadata.updatedAt': expect.any(Object)
        }
      )
    })
  })

  describe('Data Consistency and Timestamp Integration', () => {
    it('should maintain consistent timestamps across operations', async () => {
      const mockTimestamp = { toMillis: () => 1234567890 }
      ;(Timestamp.now as jest.Mock).mockReturnValue(mockTimestamp)

      const itemData = createTestItemData()
      ;(addDoc as jest.Mock).mockResolvedValue({ id: 'item123' })

      await createMarketplaceItem(itemData, 'seller123')

      expect(addDoc).toHaveBeenCalledWith(
        marketplaceItemsCollection,
        expect.objectContaining({
          metadata: expect.objectContaining({
            createdAt: mockTimestamp,
            updatedAt: mockTimestamp
          })
        })
      )

      // Test update timestamp consistency
      const mockItem = createMockMarketplaceItem('item123')
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'item123',
        data: () => mockItem
      })
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      const newTimestamp = { toMillis: () => 1234567900 }
      ;(Timestamp.now as jest.Mock).mockReturnValue(newTimestamp)

      await updateMarketplaceItem('item123', { pricing: { ...mockItem.pricing, price: 140000 } }, 'seller123')

      expect(updateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          metadata: expect.objectContaining({
            updatedAt: newTimestamp
          })
        })
      )
    })

    it('should handle metadata consistency during updates', async () => {
      const mockItem = createMockMarketplaceItem('item123', {
        metadata: {
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          sellerId: 'seller123',
          status: 'available',
          featured: false,
          reported: false,
          tags: ['original', 'tags'],
          keywords: ['original', 'keywords']
        }
      })

      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'item123',
        data: () => mockItem
      })
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      const updateData: UpdateItemData = {
        title: 'Updated Title',
        tags: ['new', 'tags']
      }

      await updateMarketplaceItem('item123', updateData, 'seller123')

      expect(updateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          title: 'Updated Title',
          tags: ['new', 'tags'],
          metadata: expect.objectContaining({
            sellerId: 'seller123', // Should preserve existing metadata
            status: 'available',
            featured: false,
            reported: false,
            updatedAt: expect.any(Object), // Should update timestamp
            keywords: expect.arrayContaining([expect.any(String)]) // Should regenerate keywords
          })
        })
      )
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle and propagate errors consistently across layers', async () => {
      // Test validation errors
      const invalidData = createTestItemData({ title: '' })
      const createResult = await createMarketplaceItem(invalidData, 'seller123')

      expect(createResult.success).toBe(false)
      expect(createResult.error).toBeTruthy()

      // Test Firestore errors
      ;(addDoc as jest.Mock).mockRejectedValue(new Error('Network error'))
      const validData = createTestItemData()
      const networkErrorResult = await createMarketplaceItem(validData, 'seller123')

      expect(networkErrorResult.success).toBe(false)
      expect(networkErrorResult.error).toContain('오류가 발생했습니다')

      // Test missing item errors
      ;(getDoc as jest.Mock).mockResolvedValue({ exists: () => false })
      const missingItem = await getMarketplaceItem('nonexistent')

      expect(missingItem).toBeNull()

      // Test unauthorized operation errors
      const mockItem = createMockMarketplaceItem('item123', {
        metadata: { ...createMockMarketplaceItem('item123').metadata, sellerId: 'owner123' }
      })
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'item123',
        data: () => mockItem
      })

      const unauthorizedResult = await deleteMarketplaceItem('item123', 'different_user')
      expect(unauthorizedResult.success).toBe(false)
      expect(unauthorizedResult.error).toContain('권한이 없습니다')
    })
  })

  describe('Collection Reference Integration', () => {
    it('should use correct collection references throughout workflow', async () => {
      const itemData = createTestItemData()
      ;(addDoc as jest.Mock).mockResolvedValue({ id: 'item123' })

      await createMarketplaceItem(itemData, 'seller123')

      // Verify collection reference usage
      expect(addDoc).toHaveBeenCalledWith(marketplaceItemsCollection, expect.any(Object))

      // Test document reference usage
      const mockItem = createMockMarketplaceItem('item123')
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'item123',
        data: () => mockItem
      })

      await getMarketplaceItem('item123')
      expect(getMarketplaceItemDoc).toHaveBeenCalledWith('item123')

      // Test update with document reference
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)
      await updateMarketplaceItem('item123', { pricing: { ...mockItem.pricing, price: 140000 } }, 'seller123')

      expect(updateDoc).toHaveBeenCalledWith(expect.any(Object), expect.any(Object))
      expect(getMarketplaceItemDoc).toHaveBeenCalledWith('item123')
    })

    it('should handle collection name constants correctly', async () => {
      expect(COLLECTION_NAMES.MARKETPLACE_ITEMS).toBe('marketplace_items')

      // Verify collection is properly configured
      expect(marketplaceItemsCollection).toEqual({ path: 'marketplace_items' })
    })
  })
})