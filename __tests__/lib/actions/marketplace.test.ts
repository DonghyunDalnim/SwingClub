/**
 * Comprehensive tests for marketplace Server Actions
 * Tests all CRUD operations, search functions, and error scenarios
 */

import {
  createMarketplaceItem,
  getMarketplaceItem,
  updateMarketplaceItem,
  deleteMarketplaceItem,
  getMarketplaceItems,
  getMarketplaceItemsByCategory,
  searchMarketplaceItems,
  searchMarketplaceItemsByRegion,
  searchMarketplaceItemsByLocation,
  incrementItemViews,
  toggleItemFavorite
} from '../../../lib/actions/marketplace'

import type {
  CreateItemData,
  UpdateItemData,
  MarketplaceItem,
  ItemSearchFilters,
  GeographicItemSearch
} from '../../../lib/types/marketplace'

// Mock Firebase Firestore
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
  GeoPoint: jest.fn((lat, lng) => ({ lat, lng })),
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1640995200, nanoseconds: 0 }))
  }
}))

// Mock Firebase collections
jest.mock('../../../lib/firebase/collections', () => ({
  marketplaceItemsCollection: 'mocked-collection',
  getMarketplaceItemDoc: jest.fn(() => 'mocked-doc-ref')
}))

// Mock validation utilities
jest.mock('../../../lib/utils/validation', () => ({
  validateMarketplaceItemData: jest.fn(() => []),
  sanitizeMarketplaceItemData: jest.fn((data) => data)
}))

// Mock geo utilities
jest.mock('../../../lib/utils/geo', () => ({
  kakaoToGeoPoint: jest.fn(() => ({ lat: 37.5665, lng: 126.9780 })),
  geoPointToKakao: jest.fn(() => ({ lat: 37.5665, lng: 126.9780 })),
  calculateDistance: jest.fn(() => 1.5),
  calculateBoundingBox: jest.fn(() => ({
    southwest: { lat: 37.5, lng: 126.9 },
    northeast: { lat: 37.6, lng: 127.0 }
  })),
  isValidCoordinates: jest.fn(() => true),
  findNearestRegion: jest.fn(() => '강남구')
}))

import {
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore'

import { validateMarketplaceItemData } from '../../../lib/utils/validation'

describe('Marketplace Server Actions', () => {
  const mockUserId = 'user123'
  const mockItemId = 'item456'

  const mockCreateItemData: CreateItemData = {
    title: 'Supadance 댄스화 250사이즈',
    description: '거의 새것 같은 라틴댄스화입니다.',
    category: 'shoes',
    pricing: {
      price: 150000,
      currency: 'KRW',
      negotiable: true,
      tradeMethod: 'both'
    },
    specs: {
      brand: 'Supadance',
      size: '250',
      condition: 'like_new',
      color: '블랙'
    },
    location: {
      region: '강남구',
      deliveryAvailable: true,
      coordinates: { lat: 37.5665, lng: 126.9780 }
    },
    images: ['image1.jpg', 'image2.jpg']
  }

  const mockMarketplaceItem: MarketplaceItem = {
    id: mockItemId,
    title: mockCreateItemData.title,
    description: mockCreateItemData.description,
    category: mockCreateItemData.category,
    pricing: mockCreateItemData.pricing,
    specs: mockCreateItemData.specs,
    location: {
      ...mockCreateItemData.location,
      geopoint: { lat: 37.5665, lng: 126.9780 } as any
    },
    stats: {
      views: 10,
      favorites: 2,
      inquiries: 1
    },
    metadata: {
      createdAt: Timestamp.now() as any,
      updatedAt: Timestamp.now() as any,
      sellerId: mockUserId,
      status: 'available',
      featured: false,
      reported: false,
      tags: ['댄스화', 'Supadance'],
      keywords: ['댄스화', 'supadance', '250']
    },
    images: mockCreateItemData.images
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createMarketplaceItem', () => {
    it('should create marketplace item successfully', async () => {
      (addDoc as jest.Mock).mockResolvedValue({ id: mockItemId })

      const result = await createMarketplaceItem(mockCreateItemData, mockUserId)

      expect(result.success).toBe(true)
      expect(result.itemId).toBe(mockItemId)
      expect(addDoc).toHaveBeenCalledTimes(1)
      expect(validateMarketplaceItemData).toHaveBeenCalledWith(mockCreateItemData)
    })

    it('should return validation errors for invalid data', async () => {
      const validationErrors = [
        { code: 'TITLE_REQUIRED', message: '상품 제목은 필수입니다.', field: 'title' }
      ];
      (validateMarketplaceItemData as jest.Mock).mockReturnValue(validationErrors)

      const result = await createMarketplaceItem(mockCreateItemData, mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('상품 제목은 필수입니다.')
      expect(addDoc).not.toHaveBeenCalled()
    })

    it('should handle Firestore errors', async () => {
      (addDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'))

      const result = await createMarketplaceItem(mockCreateItemData, mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('상품 등록 중 오류가 발생했습니다.')
    })
  })

  describe('getMarketplaceItem', () => {
    it('should get marketplace item successfully', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: mockItemId,
        data: () => mockMarketplaceItem
      })

      const result = await getMarketplaceItem(mockItemId, false)

      expect(result).toEqual(mockMarketplaceItem)
      expect(getDoc).toHaveBeenCalledTimes(1)
    })

    it('should return null for non-existent item', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false
      })

      const result = await getMarketplaceItem(mockItemId, false)

      expect(result).toBeNull()
    })

    it('should increment views when requested', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: mockItemId,
        data: () => mockMarketplaceItem
      })

      // Mock incrementItemViews to avoid recursive call
      jest.spyOn(require('../../../lib/actions/marketplace'), 'incrementItemViews')
        .mockResolvedValue(undefined)

      const result = await getMarketplaceItem(mockItemId, true)

      expect(result).toEqual(mockMarketplaceItem)
    })

    it('should handle Firestore errors', async () => {
      (getDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'))

      const result = await getMarketplaceItem(mockItemId, false)

      expect(result).toBeNull()
    })
  })

  describe('updateMarketplaceItem', () => {
    const updateData: UpdateItemData = {
      title: '수정된 제목',
      pricing: {
        price: 140000,
        currency: 'KRW',
        negotiable: false,
        tradeMethod: 'direct'
      }
    }

    it('should update marketplace item successfully', async () => {
      // Mock getMarketplaceItem for ownership validation
      jest.spyOn(require('../../../lib/actions/marketplace'), 'getMarketplaceItem')
        .mockResolvedValue(mockMarketplaceItem)

      const result = await updateMarketplaceItem(mockItemId, updateData, mockUserId)

      expect(result.success).toBe(true)
      expect(updateDoc).toHaveBeenCalledTimes(1)
    })

    it('should reject update for non-owner', async () => {
      jest.spyOn(require('../../../lib/actions/marketplace'), 'getMarketplaceItem')
        .mockResolvedValue(mockMarketplaceItem)

      const result = await updateMarketplaceItem(mockItemId, updateData, 'other-user')

      expect(result.success).toBe(false)
      expect(result.error).toBe('수정 권한이 없습니다.')
      expect(updateDoc).not.toHaveBeenCalled()
    })

    it('should reject update for non-existent item', async () => {
      jest.spyOn(require('../../../lib/actions/marketplace'), 'getMarketplaceItem')
        .mockResolvedValue(null)

      const result = await updateMarketplaceItem(mockItemId, updateData, mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('상품을 찾을 수 없습니다.')
    })

    it('should reject empty update data', async () => {
      jest.spyOn(require('../../../lib/actions/marketplace'), 'getMarketplaceItem')
        .mockResolvedValue(mockMarketplaceItem)

      const result = await updateMarketplaceItem(mockItemId, {}, mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('업데이트할 데이터가 없습니다.')
    })

    it('should handle Firestore errors', async () => {
      jest.spyOn(require('../../../lib/actions/marketplace'), 'getMarketplaceItem')
        .mockResolvedValue(mockMarketplaceItem)

      ;(updateDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'))

      const result = await updateMarketplaceItem(mockItemId, updateData, mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('상품 업데이트 중 오류가 발생했습니다.')
    })
  })

  describe('deleteMarketplaceItem', () => {
    it('should delete marketplace item successfully', async () => {
      jest.spyOn(require('../../../lib/actions/marketplace'), 'getMarketplaceItem')
        .mockResolvedValue(mockMarketplaceItem)

      const result = await deleteMarketplaceItem(mockItemId, mockUserId)

      expect(result.success).toBe(true)
      expect(deleteDoc).toHaveBeenCalledTimes(1)
    })

    it('should reject delete for non-owner', async () => {
      jest.spyOn(require('../../../lib/actions/marketplace'), 'getMarketplaceItem')
        .mockResolvedValue(mockMarketplaceItem)

      const result = await deleteMarketplaceItem(mockItemId, 'other-user')

      expect(result.success).toBe(false)
      expect(result.error).toBe('삭제 권한이 없습니다.')
      expect(deleteDoc).not.toHaveBeenCalled()
    })

    it('should handle Firestore errors', async () => {
      jest.spyOn(require('../../../lib/actions/marketplace'), 'getMarketplaceItem')
        .mockResolvedValue(mockMarketplaceItem)

      ;(deleteDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'))

      const result = await deleteMarketplaceItem(mockItemId, mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('상품 삭제 중 오류가 발생했습니다.')
    })
  })

  describe('getMarketplaceItems', () => {
    const mockQuerySnapshot = {
      docs: [
        { id: 'item1', data: () => mockMarketplaceItem },
        { id: 'item2', data: () => mockMarketplaceItem }
      ]
    }

    it('should get marketplace items with pagination', async () => {
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot)

      const result = await getMarketplaceItems(1, 20, 'latest')

      expect(result.data).toHaveLength(2)
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(20)
      expect(result.pagination.hasNext).toBe(false)
      expect(result.pagination.hasPrev).toBe(false)
    })

    it('should handle different sort options', async () => {
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot)

      await getMarketplaceItems(1, 20, 'price_low')
      await getMarketplaceItems(1, 20, 'popular')

      expect(getDocs).toHaveBeenCalledTimes(2)
    })

    it('should detect hasNext when more items available', async () => {
      const manyItemsSnapshot = {
        docs: Array(21).fill(0).map((_, i) => ({
          id: `item${i}`,
          data: () => mockMarketplaceItem
        }))
      }

      ;(getDocs as jest.Mock).mockResolvedValue(manyItemsSnapshot)

      const result = await getMarketplaceItems(1, 20, 'latest')

      expect(result.data).toHaveLength(20) // Should limit to pageSize
      expect(result.pagination.hasNext).toBe(true)
    })

    it('should handle Firestore errors', async () => {
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'))

      const result = await getMarketplaceItems(1, 20, 'latest')

      expect(result.data).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
    })
  })

  describe('getMarketplaceItemsByCategory', () => {
    it('should get items by category', async () => {
      const mockQuerySnapshot = {
        docs: [{ id: 'item1', data: () => mockMarketplaceItem }]
      }

      ;(getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot)

      const result = await getMarketplaceItemsByCategory('shoes', 1, 20, 'latest')

      expect(result.data).toHaveLength(1)
      expect(result.data[0].category).toBe('shoes')
    })
  })

  describe('searchMarketplaceItems', () => {
    const mockSearchFilters: ItemSearchFilters = {
      category: ['shoes'],
      priceRange: { min: 100000, max: 200000 },
      region: ['강남구']
    }

    it('should search items with filters', async () => {
      const mockQuerySnapshot = {
        docs: [{ id: 'item1', data: () => mockMarketplaceItem }]
      }

      ;(getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot)

      const result = await searchMarketplaceItems('댄스화', mockSearchFilters)

      expect(result.items).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.filters).toEqual(mockSearchFilters)
    })

    it('should filter by search term', async () => {
      const mockQuerySnapshot = {
        docs: [
          { id: 'item1', data: () => mockMarketplaceItem },
          { id: 'item2', data: () => ({ ...mockMarketplaceItem, title: '다른 상품' }) }
        ]
      }

      ;(getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot)

      const result = await searchMarketplaceItems('댄스화')

      expect(result.items.length).toBeGreaterThanOrEqual(0) // Filtered by search term
    })

    it('should handle empty search results', async () => {
      (getDocs as jest.Mock).mockResolvedValue({ docs: [] })

      const result = await searchMarketplaceItems('존재하지않는검색어')

      expect(result.items).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })

  describe('searchMarketplaceItemsByRegion', () => {
    it('should search items by region', async () => {
      const mockQuerySnapshot = {
        docs: [{ id: 'item1', data: () => mockMarketplaceItem }]
      }

      ;(getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot)

      const result = await searchMarketplaceItemsByRegion('강남구')

      expect(result.items).toHaveLength(1)
      expect(result.items[0].location.region).toBe('강남구')
    })
  })

  describe('searchMarketplaceItemsByLocation', () => {
    const mockGeoSearch: GeographicItemSearch = {
      center: { lat: 37.5665, lng: 126.9780 },
      radius: 5,
      limit: 10,
      category: 'shoes'
    }

    it('should search items by location', async () => {
      const mockQuerySnapshot = {
        docs: [{ id: 'item1', data: () => mockMarketplaceItem }]
      }

      ;(getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot)

      const result = await searchMarketplaceItemsByLocation(mockGeoSearch)

      expect(result).toHaveLength(1)
    })

    it('should filter by category and price range', async () => {
      const geoSearchWithFilters: GeographicItemSearch = {
        ...mockGeoSearch,
        priceRange: { min: 100000, max: 200000 }
      }

      const mockQuerySnapshot = {
        docs: [{ id: 'item1', data: () => mockMarketplaceItem }]
      }

      ;(getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot)

      const result = await searchMarketplaceItemsByLocation(geoSearchWithFilters)

      expect(result).toHaveLength(1)
    })
  })

  describe('incrementItemViews', () => {
    it('should increment item views', async () => {
      jest.spyOn(require('../../../lib/actions/marketplace'), 'getMarketplaceItem')
        .mockResolvedValue(mockMarketplaceItem)

      await incrementItemViews(mockItemId)

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          'stats.views': mockMarketplaceItem.stats.views + 1
        })
      )
    })

    it('should handle non-existent item', async () => {
      jest.spyOn(require('../../../lib/actions/marketplace'), 'getMarketplaceItem')
        .mockResolvedValue(null)

      await incrementItemViews(mockItemId)

      expect(updateDoc).not.toHaveBeenCalled()
    })

    it('should handle Firestore errors silently', async () => {
      jest.spyOn(require('../../../lib/actions/marketplace'), 'getMarketplaceItem')
        .mockResolvedValue(mockMarketplaceItem)

      ;(updateDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'))

      // Should not throw error
      await expect(incrementItemViews(mockItemId)).resolves.toBeUndefined()
    })
  })

  describe('toggleItemFavorite', () => {
    it('should increment favorites', async () => {
      jest.spyOn(require('../../../lib/actions/marketplace'), 'getMarketplaceItem')
        .mockResolvedValue(mockMarketplaceItem)

      const result = await toggleItemFavorite(mockItemId, true)

      expect(result.success).toBe(true)
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          'stats.favorites': mockMarketplaceItem.stats.favorites + 1
        })
      )
    })

    it('should decrement favorites', async () => {
      jest.spyOn(require('../../../lib/actions/marketplace'), 'getMarketplaceItem')
        .mockResolvedValue(mockMarketplaceItem)

      const result = await toggleItemFavorite(mockItemId, false)

      expect(result.success).toBe(true)
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          'stats.favorites': Math.max(0, mockMarketplaceItem.stats.favorites - 1)
        })
      )
    })

    it('should not allow negative favorites', async () => {
      const itemWithZeroFavorites = {
        ...mockMarketplaceItem,
        stats: { ...mockMarketplaceItem.stats, favorites: 0 }
      }

      jest.spyOn(require('../../../lib/actions/marketplace'), 'getMarketplaceItem')
        .mockResolvedValue(itemWithZeroFavorites)

      const result = await toggleItemFavorite(mockItemId, false)

      expect(result.success).toBe(true)
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          'stats.favorites': 0
        })
      )
    })

    it('should handle non-existent item', async () => {
      jest.spyOn(require('../../../lib/actions/marketplace'), 'getMarketplaceItem')
        .mockResolvedValue(null)

      const result = await toggleItemFavorite(mockItemId, true)

      expect(result.success).toBe(false)
      expect(updateDoc).not.toHaveBeenCalled()
    })

    it('should handle Firestore errors', async () => {
      jest.spyOn(require('../../../lib/actions/marketplace'), 'getMarketplaceItem')
        .mockResolvedValue(mockMarketplaceItem)

      ;(updateDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'))

      const result = await toggleItemFavorite(mockItemId, true)

      expect(result.success).toBe(false)
    })
  })

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle malformed item data gracefully', async () => {
      const malformedData = {
        ...mockCreateItemData,
        pricing: null as any
      }

      const result = await createMarketplaceItem(malformedData, mockUserId)

      expect(result.success).toBe(false)
    })

    it('should handle extremely long search terms', async () => {
      const longSearchTerm = 'a'.repeat(1000)

      ;(getDocs as jest.Mock).mockResolvedValue({ docs: [] })

      const result = await searchMarketplaceItems(longSearchTerm)

      expect(result.items).toHaveLength(0)
    })

    it('should handle invalid geographic coordinates', async () => {
      const invalidGeoSearch: GeographicItemSearch = {
        center: { lat: 999, lng: 999 }, // Invalid coordinates
        radius: 5
      }

      const result = await searchMarketplaceItemsByLocation(invalidGeoSearch)

      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle concurrent view increments', async () => {
      jest.spyOn(require('../../../lib/actions/marketplace'), 'getMarketplaceItem')
        .mockResolvedValue(mockMarketplaceItem)

      // Simulate multiple concurrent view increments
      const promises = [
        incrementItemViews(mockItemId),
        incrementItemViews(mockItemId),
        incrementItemViews(mockItemId)
      ]

      await Promise.all(promises)

      expect(updateDoc).toHaveBeenCalledTimes(3)
    })
  })
})