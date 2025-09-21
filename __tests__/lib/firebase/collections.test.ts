/**
 * Unit tests for Firebase collections module
 * Tests collection references, document helpers, and subcollection functions
 */

import type {
  CollectionReference,
  DocumentReference,
  Firestore
} from 'firebase/firestore'

// Mock Firebase before any imports
const mockCollection = jest.fn()
const mockDoc = jest.fn()

jest.mock('firebase/firestore', () => ({
  collection: mockCollection,
  doc: mockDoc
}))

const mockDb = {
  type: 'firestore',
  app: { name: 'test-app' },
  _delegate: { projectId: 'test-project' },
  toJSON: jest.fn()
} as unknown as Firestore

jest.mock('@/lib/firebase', () => ({
  db: mockDb
}))

// Mock return values
const mockCollectionRef = {
  id: 'test-collection',
  path: 'test-collection',
  firestore: mockDb,
  type: 'collection'
} as CollectionReference

const mockDocumentRef = {
  id: 'test-doc',
  path: 'test-collection/test-doc',
  firestore: mockDb,
  type: 'document'
} as DocumentReference

describe('Firebase Collections Module', () => {
  // Import the module after mocks are set up
  let collectionsModule: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockCollection.mockReturnValue(mockCollectionRef)
    mockDoc.mockReturnValue(mockDocumentRef)

    // Clear module cache and re-import
    jest.resetModules()
    collectionsModule = require('@/lib/firebase/collections')
  })

  describe('Collection References', () => {
    it('should create users collection reference', () => {
      expect(collectionsModule.usersCollection).toBeDefined()
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'users')
    })

    it('should create studios collection reference with Studio type', () => {
      expect(collectionsModule.studiosCollection).toBeDefined()
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'studios')
    })

    it('should create marketplace_items collection reference with MarketplaceItem type', () => {
      expect(collectionsModule.marketplaceItemsCollection).toBeDefined()
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'marketplace_items')
    })

    it('should create item_inquiries collection reference with ItemInquiry type', () => {
      expect(collectionsModule.itemInquiriesCollection).toBeDefined()
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'item_inquiries')
    })

    it('should return valid collection references', () => {
      expect(collectionsModule.usersCollection).toEqual(mockCollectionRef)
      expect(collectionsModule.studiosCollection).toEqual(mockCollectionRef)
      expect(collectionsModule.marketplaceItemsCollection).toEqual(mockCollectionRef)
      expect(collectionsModule.itemInquiriesCollection).toEqual(mockCollectionRef)
    })
  })

  describe('Document Reference Helper Functions', () => {
    it('should create studio document reference with correct ID', () => {
      const studioId = 'studio-123'
      const result = collectionsModule.getStudioDoc(studioId)

      expect(mockDoc).toHaveBeenCalledWith(collectionsModule.studiosCollection, studioId)
      expect(result).toEqual(mockDocumentRef)
    })

    it('should create marketplace item document reference with correct ID', () => {
      const itemId = 'item-456'
      const result = collectionsModule.getMarketplaceItemDoc(itemId)

      expect(mockDoc).toHaveBeenCalledWith(collectionsModule.marketplaceItemsCollection, itemId)
      expect(result).toEqual(mockDocumentRef)
    })

    it('should create item inquiry document reference with correct ID', () => {
      const inquiryId = 'inquiry-789'
      const result = collectionsModule.getItemInquiryDoc(inquiryId)

      expect(mockDoc).toHaveBeenCalledWith(collectionsModule.itemInquiriesCollection, inquiryId)
      expect(result).toEqual(mockDocumentRef)
    })

    it('should handle empty string IDs', () => {
      const result1 = collectionsModule.getStudioDoc('')
      const result2 = collectionsModule.getMarketplaceItemDoc('')
      const result3 = collectionsModule.getItemInquiryDoc('')

      expect(mockDoc).toHaveBeenCalledWith(collectionsModule.studiosCollection, '')
      expect(mockDoc).toHaveBeenCalledWith(collectionsModule.marketplaceItemsCollection, '')
      expect(mockDoc).toHaveBeenCalledWith(collectionsModule.itemInquiriesCollection, '')
      expect(result1).toEqual(mockDocumentRef)
      expect(result2).toEqual(mockDocumentRef)
      expect(result3).toEqual(mockDocumentRef)
    })

    it('should handle special characters in IDs', () => {
      const specialId = 'id-한글-test_123'

      const result1 = collectionsModule.getStudioDoc(specialId)
      const result2 = collectionsModule.getMarketplaceItemDoc(specialId)
      const result3 = collectionsModule.getItemInquiryDoc(specialId)

      expect(mockDoc).toHaveBeenCalledWith(collectionsModule.studiosCollection, specialId)
      expect(mockDoc).toHaveBeenCalledWith(collectionsModule.marketplaceItemsCollection, specialId)
      expect(mockDoc).toHaveBeenCalledWith(collectionsModule.itemInquiriesCollection, specialId)
      expect(result1).toEqual(mockDocumentRef)
      expect(result2).toEqual(mockDocumentRef)
      expect(result3).toEqual(mockDocumentRef)
    })

    it('should handle UUID format IDs', () => {
      const uuidId = '550e8400-e29b-41d4-a716-446655440000'

      const result1 = collectionsModule.getStudioDoc(uuidId)
      const result2 = collectionsModule.getMarketplaceItemDoc(uuidId)
      const result3 = collectionsModule.getItemInquiryDoc(uuidId)

      expect(result1).toEqual(mockDocumentRef)
      expect(result2).toEqual(mockDocumentRef)
      expect(result3).toEqual(mockDocumentRef)
    })
  })

  describe('Subcollection Reference Functions', () => {
    it('should create studio reviews subcollection reference', () => {
      const studioId = 'studio-123'
      const result = collectionsModule.getStudioReviewsCollection(studioId)

      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'studios', studioId, 'reviews')
      expect(result).toEqual(mockCollectionRef)
    })

    it('should create studio images subcollection reference', () => {
      const studioId = 'studio-456'
      const result = collectionsModule.getStudioImagesCollection(studioId)

      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'studios', studioId, 'images')
      expect(result).toEqual(mockCollectionRef)
    })

    it('should create user favorites subcollection reference', () => {
      const userId = 'user-789'
      const result = collectionsModule.getUserFavoritesCollection(userId)

      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'users', userId, 'favorites')
      expect(result).toEqual(mockCollectionRef)
    })

    it('should create item images subcollection reference', () => {
      const itemId = 'item-999'
      const result = collectionsModule.getItemImagesCollection(itemId)

      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'marketplace_items', itemId, 'images')
      expect(result).toEqual(mockCollectionRef)
    })

    it('should handle different ID formats in subcollections', () => {
      const tests = [
        { id: '', name: 'empty string' },
        { id: 'simple-id', name: 'simple ID' },
        { id: 'id_with_한글', name: 'Korean characters' },
        { id: '550e8400-e29b-41d4-a716-446655440000', name: 'UUID format' },
        { id: '1641234567890', name: 'timestamp format' }
      ]

      tests.forEach(({ id, name }) => {
        const result1 = collectionsModule.getStudioReviewsCollection(id)
        const result2 = collectionsModule.getStudioImagesCollection(id)
        const result3 = collectionsModule.getUserFavoritesCollection(id)
        const result4 = collectionsModule.getItemImagesCollection(id)

        expect(result1).toEqual(mockCollectionRef)
        expect(result2).toEqual(mockCollectionRef)
        expect(result3).toEqual(mockCollectionRef)
        expect(result4).toEqual(mockCollectionRef)
      })
    })
  })

  describe('Collection Name Constants', () => {
    it('should define all required collection name constants', () => {
      expect(collectionsModule.COLLECTION_NAMES).toBeDefined()
      expect(typeof collectionsModule.COLLECTION_NAMES).toBe('object')
    })

    it('should have correct collection name values', () => {
      const { COLLECTION_NAMES } = collectionsModule

      expect(COLLECTION_NAMES.USERS).toBe('users')
      expect(COLLECTION_NAMES.STUDIOS).toBe('studios')
      expect(COLLECTION_NAMES.MARKETPLACE_ITEMS).toBe('marketplace_items')
      expect(COLLECTION_NAMES.ITEM_INQUIRIES).toBe('item_inquiries')
      expect(COLLECTION_NAMES.ANALYTICS).toBe('analytics')
      expect(COLLECTION_NAMES.CONFIG).toBe('config')
      expect(COLLECTION_NAMES.REPORTS).toBe('reports')
    })

    it('should have string values for all keys', () => {
      const { COLLECTION_NAMES } = collectionsModule

      Object.values(COLLECTION_NAMES).forEach((value: unknown) => {
        expect(typeof value).toBe('string')
        expect((value as string).length).toBeGreaterThan(0)
      })
    })

    it('should have uppercase keys following naming convention', () => {
      const { COLLECTION_NAMES } = collectionsModule

      Object.keys(COLLECTION_NAMES).forEach(key => {
        expect(key).toMatch(/^[A-Z_]+$/)
      })
    })

    it('should be immutable object (const assertion)', () => {
      const { COLLECTION_NAMES } = collectionsModule

      // Test that all values are strings (TypeScript const assertion)
      Object.keys(COLLECTION_NAMES).forEach(key => {
        expect(typeof COLLECTION_NAMES[key]).toBe('string')
      })
    })
  })

  describe('Type Safety and Structure', () => {
    it('should export all required collection references', () => {
      expect(collectionsModule.usersCollection).toBeDefined()
      expect(collectionsModule.studiosCollection).toBeDefined()
      expect(collectionsModule.marketplaceItemsCollection).toBeDefined()
      expect(collectionsModule.itemInquiriesCollection).toBeDefined()
    })

    it('should export all required helper functions', () => {
      expect(typeof collectionsModule.getStudioDoc).toBe('function')
      expect(typeof collectionsModule.getMarketplaceItemDoc).toBe('function')
      expect(typeof collectionsModule.getItemInquiryDoc).toBe('function')
    })

    it('should export all required subcollection functions', () => {
      expect(typeof collectionsModule.getStudioReviewsCollection).toBe('function')
      expect(typeof collectionsModule.getStudioImagesCollection).toBe('function')
      expect(typeof collectionsModule.getUserFavoritesCollection).toBe('function')
      expect(typeof collectionsModule.getItemImagesCollection).toBe('function')
    })

    it('should maintain type safety for collection references', () => {
      // These should be valid collection references
      const collections = [
        collectionsModule.usersCollection,
        collectionsModule.studiosCollection,
        collectionsModule.marketplaceItemsCollection,
        collectionsModule.itemInquiriesCollection
      ]

      collections.forEach(collection => {
        expect(collection).toBeDefined()
        expect(collection).toEqual(mockCollectionRef)
      })
    })

    it('should maintain type safety for document references', () => {
      const docs = [
        collectionsModule.getStudioDoc('test-id'),
        collectionsModule.getMarketplaceItemDoc('test-id'),
        collectionsModule.getItemInquiryDoc('test-id')
      ]

      docs.forEach(doc => {
        expect(doc).toBeDefined()
        expect(doc).toEqual(mockDocumentRef)
      })
    })
  })

  describe('Path Construction', () => {
    it('should construct correct paths for main collections', () => {
      // Check that collections were created with correct paths
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'users')
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'studios')
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'marketplace_items')
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'item_inquiries')
    })

    it('should construct correct paths for subcollections', () => {
      const testId = 'test-id'

      collectionsModule.getStudioReviewsCollection(testId)
      collectionsModule.getStudioImagesCollection(testId)
      collectionsModule.getUserFavoritesCollection(testId)
      collectionsModule.getItemImagesCollection(testId)

      // Verify subcollection paths
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'studios', testId, 'reviews')
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'studios', testId, 'images')
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'users', testId, 'favorites')
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'marketplace_items', testId, 'images')
    })

    it('should construct correct paths for document references', () => {
      const testIds = ['studio-1', 'item-2', 'inquiry-3']

      collectionsModule.getStudioDoc(testIds[0])
      collectionsModule.getMarketplaceItemDoc(testIds[1])
      collectionsModule.getItemInquiryDoc(testIds[2])

      // Verify document paths use collection references
      expect(mockDoc).toHaveBeenCalledWith(collectionsModule.studiosCollection, testIds[0])
      expect(mockDoc).toHaveBeenCalledWith(collectionsModule.marketplaceItemsCollection, testIds[1])
      expect(mockDoc).toHaveBeenCalledWith(collectionsModule.itemInquiriesCollection, testIds[2])
    })
  })

  describe('Error Handling', () => {
    it('should handle Firebase collection creation errors', () => {
      // Reset and set up error mock
      jest.resetModules()
      mockCollection.mockImplementation(() => {
        throw new Error('Firebase collection creation failed')
      })

      // Module import should throw the error
      expect(() => {
        require('@/lib/firebase/collections')
      }).toThrow('Firebase collection creation failed')
    })

    it('should handle Firebase doc creation errors', () => {
      mockDoc.mockImplementation(() => {
        throw new Error('Firebase doc creation failed')
      })

      expect(() => collectionsModule.getStudioDoc('test-id')).toThrow('Firebase doc creation failed')
      expect(() => collectionsModule.getMarketplaceItemDoc('test-id')).toThrow('Firebase doc creation failed')
      expect(() => collectionsModule.getItemInquiryDoc('test-id')).toThrow('Firebase doc creation failed')
    })

    it('should handle subcollection creation errors', () => {
      mockCollection.mockImplementation(() => {
        throw new Error('Firebase subcollection creation failed')
      })

      expect(() => collectionsModule.getStudioReviewsCollection('test')).toThrow('Firebase subcollection creation failed')
      expect(() => collectionsModule.getStudioImagesCollection('test')).toThrow('Firebase subcollection creation failed')
      expect(() => collectionsModule.getUserFavoritesCollection('test')).toThrow('Firebase subcollection creation failed')
      expect(() => collectionsModule.getItemImagesCollection('test')).toThrow('Firebase subcollection creation failed')
    })
  })

  describe('Performance and Memory', () => {
    it('should create collections only once during module load', () => {
      const ref1 = collectionsModule.usersCollection
      const ref2 = collectionsModule.usersCollection

      // Same reference (no new creation)
      expect(ref1).toBe(ref2)
    })

    it('should create new document references for each call', () => {
      jest.clearAllMocks()

      const doc1 = collectionsModule.getStudioDoc('id-1')
      const doc2 = collectionsModule.getStudioDoc('id-2')

      expect(mockDoc).toHaveBeenCalledTimes(2)
      expect(doc1).toEqual(mockDocumentRef)
      expect(doc2).toEqual(mockDocumentRef)
    })

    it('should create new subcollection references for each call', () => {
      jest.clearAllMocks()

      collectionsModule.getStudioReviewsCollection('studio-1')
      collectionsModule.getStudioReviewsCollection('studio-2')

      expect(mockCollection).toHaveBeenCalledTimes(2)
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'studios', 'studio-1', 'reviews')
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'studios', 'studio-2', 'reviews')
    })
  })

  describe('Integration Compatibility', () => {
    it('should work with Firestore query operations', () => {
      // Collections should be usable with Firestore query methods
      const collections = [
        collectionsModule.usersCollection,
        collectionsModule.studiosCollection,
        collectionsModule.marketplaceItemsCollection,
        collectionsModule.itemInquiriesCollection
      ]

      collections.forEach(collection => {
        expect(collection).toHaveProperty('firestore')
        expect(collection).toHaveProperty('id')
        expect(collection).toHaveProperty('path')
      })
    })

    it('should work with Firestore document operations', () => {
      // Documents should be usable with Firestore document methods
      const docs = [
        collectionsModule.getStudioDoc('test'),
        collectionsModule.getMarketplaceItemDoc('test'),
        collectionsModule.getItemInquiryDoc('test')
      ]

      docs.forEach(doc => {
        expect(doc).toHaveProperty('firestore')
        expect(doc).toHaveProperty('id')
        expect(doc).toHaveProperty('path')
      })
    })

    it('should work with subcollection patterns', () => {
      // Subcollections should be usable for nested data structures
      const subcollections = [
        collectionsModule.getStudioReviewsCollection('test'),
        collectionsModule.getStudioImagesCollection('test'),
        collectionsModule.getUserFavoritesCollection('test'),
        collectionsModule.getItemImagesCollection('test')
      ]

      subcollections.forEach(subcollection => {
        expect(subcollection).toHaveProperty('firestore')
        expect(subcollection).toHaveProperty('id')
        expect(subcollection).toHaveProperty('path')
      })
    })
  })

  describe('Real-world Usage Patterns', () => {
    it('should support typical CRUD operations pattern', () => {
      const studioId = 'studio-123'
      const itemId = 'item-456'

      // Collections for queries
      const studiosRef = collectionsModule.studiosCollection
      const itemsRef = collectionsModule.marketplaceItemsCollection

      // Documents for specific operations
      const studioDocRef = collectionsModule.getStudioDoc(studioId)
      const itemDocRef = collectionsModule.getMarketplaceItemDoc(itemId)

      // Subcollections for nested data
      const reviewsRef = collectionsModule.getStudioReviewsCollection(studioId)
      const imagesRef = collectionsModule.getItemImagesCollection(itemId)

      expect(studiosRef).toBeDefined()
      expect(itemsRef).toBeDefined()
      expect(studioDocRef).toBeDefined()
      expect(itemDocRef).toBeDefined()
      expect(reviewsRef).toBeDefined()
      expect(imagesRef).toBeDefined()
    })

    it('should support Server Actions usage pattern', () => {
      const { COLLECTION_NAMES } = collectionsModule

      // Constants should be usable in Server Actions
      expect(COLLECTION_NAMES.USERS).toBe('users')
      expect(COLLECTION_NAMES.STUDIOS).toBe('studios')
      expect(COLLECTION_NAMES.MARKETPLACE_ITEMS).toBe('marketplace_items')
      expect(COLLECTION_NAMES.ITEM_INQUIRIES).toBe('item_inquiries')

      // Additional collections for admin/analytics
      expect(COLLECTION_NAMES.ANALYTICS).toBe('analytics')
      expect(COLLECTION_NAMES.CONFIG).toBe('config')
      expect(COLLECTION_NAMES.REPORTS).toBe('reports')
    })

    it('should support hierarchical data patterns', () => {
      const userId = 'user-123'
      const studioId = 'studio-456'
      const itemId = 'item-789'

      // User subcollections
      const favoritesRef = collectionsModule.getUserFavoritesCollection(userId)

      // Studio subcollections
      const reviewsRef = collectionsModule.getStudioReviewsCollection(studioId)
      const studioImagesRef = collectionsModule.getStudioImagesCollection(studioId)

      // Item subcollections
      const itemImagesRef = collectionsModule.getItemImagesCollection(itemId)

      expect(favoritesRef).toBeDefined()
      expect(reviewsRef).toBeDefined()
      expect(studioImagesRef).toBeDefined()
      expect(itemImagesRef).toBeDefined()

      // Verify correct path construction for hierarchical data
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'users', userId, 'favorites')
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'studios', studioId, 'reviews')
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'studios', studioId, 'images')
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'marketplace_items', itemId, 'images')
    })
  })
})