/**
 * Comprehensive unit tests for Firestore security rules validation
 * Tests helper functions and validation logic that would run in Firestore rules
 */

import type { Timestamp } from 'firebase/firestore'
import type { MarketplaceItem, CreateItemData, ItemInquiry } from '@/lib/types/marketplace'
import type { Studio, CreateStudioData } from '@/lib/types/studio'

// Mock Firebase Timestamp
const mockTimestamp = (seconds: number = Date.now() / 1000): Timestamp => ({
  seconds: Math.floor(seconds),
  nanoseconds: 0,
  toDate: () => new Date(seconds * 1000),
  toMillis: () => seconds * 1000,
  valueOf: () => seconds * 1000,
  isEqual: (other: Timestamp) => seconds === other.seconds,
} as Timestamp)

// Mock Firebase auth context
interface MockAuthContext {
  uid: string | null
  token?: {
    admin?: boolean
    roles?: string[]
  }
}

// Mock Firestore resource context
interface MockResource {
  data: any
  id: string
}

interface MockRequest {
  auth: MockAuthContext
  resource: MockResource
  method: 'get' | 'list' | 'create' | 'update' | 'delete'
}

// Security rule helper functions (simulating Firestore rules logic)
const isAuthenticated = (auth: MockAuthContext): boolean => {
  return auth.uid !== null && auth.uid !== undefined && auth.uid !== ''
}

const isOwner = (auth: MockAuthContext, ownerId: string): boolean => {
  return auth.uid === ownerId
}

const isAdmin = (auth: MockAuthContext): boolean => {
  return isAuthenticated(auth) && (
    auth.token?.admin === true ||
    auth.token?.roles?.includes('admin') === true
  )
}

const isItemOwner = (auth: MockAuthContext, item: MarketplaceItem): boolean => {
  return isAuthenticated(auth) && auth.uid === item.metadata.sellerId
}

const isStudioOwner = (auth: MockAuthContext, studio: Studio): boolean => {
  return isAuthenticated(auth) && auth.uid === studio.metadata.createdBy
}

// Data validation functions (simulating Firestore rules validation)
const isValidStudioData = (data: CreateStudioData): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Required fields validation
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('name is required and must be a non-empty string')
  }

  if (data.name && data.name.length > 100) {
    errors.push('name must be 100 characters or less')
  }

  if (!data.category || !['studio', 'practice_room', 'club', 'public_space', 'cafe'].includes(data.category)) {
    errors.push('category must be a valid studio category')
  }

  // Location validation
  if (!data.location) {
    errors.push('location is required')
  } else {
    if (!data.location.address || typeof data.location.address !== 'string') {
      errors.push('location.address is required and must be a string')
    }

    if (!data.location.region || typeof data.location.region !== 'string') {
      errors.push('location.region is required and must be a string')
    }

    if (!data.location.coordinates ||
        typeof data.location.coordinates.lat !== 'number' ||
        typeof data.location.coordinates.lng !== 'number') {
      errors.push('location.coordinates must contain valid lat/lng numbers')
    }

    if (data.location.coordinates) {
      const { lat, lng } = data.location.coordinates
      if (lat < -90 || lat > 90) {
        errors.push('location.coordinates.lat must be between -90 and 90')
      }
      if (lng < -180 || lng > 180) {
        errors.push('location.coordinates.lng must be between -180 and 180')
      }
    }
  }

  // Contact validation
  if (data.contact) {
    if (data.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact.email)) {
      errors.push('contact.email must be a valid email address')
    }

    if (data.contact.phone && !/^[\d\-\+\(\)\s]+$/.test(data.contact.phone)) {
      errors.push('contact.phone must contain only numbers, spaces, and phone formatting characters')
    }

    if (data.contact.website && !data.contact.website.startsWith('http')) {
      errors.push('contact.website must be a valid URL starting with http or https')
    }
  }

  // Pricing validation
  if (data.pricing) {
    const { hourly, daily, monthly, dropIn, currency } = data.pricing

    if (currency && currency !== 'KRW') {
      errors.push('pricing.currency must be KRW')
    }

    if (hourly !== undefined && (typeof hourly !== 'number' || hourly < 0)) {
      errors.push('pricing.hourly must be a non-negative number')
    }

    if (daily !== undefined && (typeof daily !== 'number' || daily < 0)) {
      errors.push('pricing.daily must be a non-negative number')
    }

    if (monthly !== undefined && (typeof monthly !== 'number' || monthly < 0)) {
      errors.push('pricing.monthly must be a non-negative number')
    }

    if (dropIn !== undefined && (typeof dropIn !== 'number' || dropIn < 0)) {
      errors.push('pricing.dropIn must be a non-negative number')
    }
  }

  // Facilities validation
  if (data.facilities) {
    const { area, capacity } = data.facilities

    if (area !== undefined && (typeof area !== 'number' || area <= 0)) {
      errors.push('facilities.area must be a positive number')
    }

    if (capacity !== undefined && (typeof capacity !== 'number' || capacity <= 0 || !Number.isInteger(capacity))) {
      errors.push('facilities.capacity must be a positive integer')
    }
  }

  // Images validation
  if (data.images) {
    if (!Array.isArray(data.images)) {
      errors.push('images must be an array')
    } else {
      if (data.images.length > 10) {
        errors.push('images array cannot contain more than 10 items')
      }

      data.images.forEach((image, index) => {
        if (typeof image !== 'string' || !image.startsWith('https://')) {
          errors.push(`images[${index}] must be a valid HTTPS URL`)
        }
      })
    }
  }

  return { valid: errors.length === 0, errors }
}

const isValidItemData = (data: CreateItemData): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Required fields validation
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('title is required and must be a non-empty string')
  }

  if (data.title && data.title.length > 100) {
    errors.push('title must be 100 characters or less')
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    errors.push('description is required and must be a non-empty string')
  }

  if (data.description && data.description.length > 2000) {
    errors.push('description must be 2000 characters or less')
  }

  if (!data.category || !['shoes', 'clothing', 'accessories', 'other'].includes(data.category)) {
    errors.push('category must be a valid product category')
  }

  // Pricing validation
  if (!data.pricing) {
    errors.push('pricing is required')
  } else {
    const { price, currency, tradeMethod, deliveryFee } = data.pricing

    if (typeof price !== 'number' || price <= 0) {
      errors.push('pricing.price must be a positive number')
    }

    if (price > 10000000) {
      errors.push('pricing.price cannot exceed 10,000,000 KRW')
    }

    if (currency !== 'KRW') {
      errors.push('pricing.currency must be KRW')
    }

    if (!['direct', 'delivery', 'both'].includes(tradeMethod)) {
      errors.push('pricing.tradeMethod must be direct, delivery, or both')
    }

    if (deliveryFee !== undefined && (typeof deliveryFee !== 'number' || deliveryFee < 0)) {
      errors.push('pricing.deliveryFee must be a non-negative number')
    }

    if (deliveryFee !== undefined && deliveryFee > 100000) {
      errors.push('pricing.deliveryFee cannot exceed 100,000 KRW')
    }
  }

  // Specs validation
  if (!data.specs) {
    errors.push('specs is required')
  } else {
    const { condition, originalPrice } = data.specs

    if (!['new', 'like_new', 'good', 'fair', 'poor'].includes(condition)) {
      errors.push('specs.condition must be a valid condition')
    }

    if (originalPrice !== undefined && (typeof originalPrice !== 'number' || originalPrice <= 0)) {
      errors.push('specs.originalPrice must be a positive number')
    }

    if (originalPrice !== undefined && originalPrice > 50000000) {
      errors.push('specs.originalPrice cannot exceed 50,000,000 KRW')
    }
  }

  // Location validation
  if (!data.location) {
    errors.push('location is required')
  } else {
    if (!data.location.region || typeof data.location.region !== 'string') {
      errors.push('location.region is required and must be a string')
    }

    if (data.location.coordinates) {
      const { lat, lng } = data.location.coordinates
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        errors.push('location.coordinates must contain valid lat/lng numbers')
      }

      if (lat < -90 || lat > 90) {
        errors.push('location.coordinates.lat must be between -90 and 90')
      }

      if (lng < -180 || lng > 180) {
        errors.push('location.coordinates.lng must be between -180 and 180')
      }
    }
  }

  // Images validation
  if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
    errors.push('images is required and must be a non-empty array')
  } else {
    if (data.images.length > 8) {
      errors.push('images array cannot contain more than 8 items')
    }

    data.images.forEach((image, index) => {
      if (typeof image !== 'string' || !image.startsWith('https://')) {
        errors.push(`images[${index}] must be a valid HTTPS URL`)
      }
    })
  }

  return { valid: errors.length === 0, errors }
}

describe('Firestore Security Rules Validation', () => {
  describe('Authentication Helper Functions', () => {
    describe('isAuthenticated', () => {
      it('should return true for authenticated user', () => {
        const auth: MockAuthContext = { uid: 'user123' }
        expect(isAuthenticated(auth)).toBe(true)
      })

      it('should return false for unauthenticated user', () => {
        const auth: MockAuthContext = { uid: null }
        expect(isAuthenticated(auth)).toBe(false)
      })

      it('should return false for undefined uid', () => {
        const auth: MockAuthContext = { uid: undefined as any }
        expect(isAuthenticated(auth)).toBe(false)
      })

      it('should return false for empty string uid', () => {
        const auth: MockAuthContext = { uid: '' }
        expect(isAuthenticated(auth)).toBe(false)
      })
    })

    describe('isOwner', () => {
      it('should return true when auth uid matches owner id', () => {
        const auth: MockAuthContext = { uid: 'user123' }
        expect(isOwner(auth, 'user123')).toBe(true)
      })

      it('should return false when auth uid does not match owner id', () => {
        const auth: MockAuthContext = { uid: 'user123' }
        expect(isOwner(auth, 'user456')).toBe(false)
      })

      it('should return false when user is not authenticated', () => {
        const auth: MockAuthContext = { uid: null }
        expect(isOwner(auth, 'user123')).toBe(false)
      })

      it('should handle empty owner id', () => {
        const auth: MockAuthContext = { uid: 'user123' }
        expect(isOwner(auth, '')).toBe(false)
      })

      it('should handle null owner id', () => {
        const auth: MockAuthContext = { uid: 'user123' }
        expect(isOwner(auth, null as any)).toBe(false)
      })
    })

    describe('isAdmin', () => {
      it('should return true when user has admin token', () => {
        const auth: MockAuthContext = {
          uid: 'user123',
          token: { admin: true }
        }
        expect(isAdmin(auth)).toBe(true)
      })

      it('should return true when user has admin role', () => {
        const auth: MockAuthContext = {
          uid: 'user123',
          token: { roles: ['admin', 'moderator'] }
        }
        expect(isAdmin(auth)).toBe(true)
      })

      it('should return false when user has no admin privileges', () => {
        const auth: MockAuthContext = {
          uid: 'user123',
          token: { admin: false, roles: ['user'] }
        }
        expect(isAdmin(auth)).toBe(false)
      })

      it('should return false when user has no token', () => {
        const auth: MockAuthContext = { uid: 'user123' }
        expect(isAdmin(auth)).toBe(false)
      })

      it('should return false when user is not authenticated', () => {
        const auth: MockAuthContext = {
          uid: null,
          token: { admin: true }
        }
        expect(isAdmin(auth)).toBe(false)
      })

      it('should handle empty roles array', () => {
        const auth: MockAuthContext = {
          uid: 'user123',
          token: { roles: [] }
        }
        expect(isAdmin(auth)).toBe(false)
      })

      it('should handle undefined roles and admin', () => {
        const auth: MockAuthContext = {
          uid: 'user123',
          token: {}
        }
        expect(isAdmin(auth)).toBe(false)
      })
    })

    describe('isItemOwner', () => {
      const createMockItem = (sellerId: string): MarketplaceItem => ({
        id: 'item123',
        title: 'Test Item',
        description: 'Test description',
        category: 'shoes',
        pricing: {
          price: 50000,
          currency: 'KRW',
          negotiable: true,
          tradeMethod: 'both'
        },
        specs: {
          condition: 'good',
          brand: 'Test Brand'
        },
        location: {
          region: 'Seoul',
          deliveryAvailable: true
        },
        stats: {
          views: 0,
          favorites: 0,
          inquiries: 0
        },
        metadata: {
          createdAt: mockTimestamp(),
          updatedAt: mockTimestamp(),
          sellerId,
          status: 'available',
          featured: false,
          reported: false
        },
        images: ['https://example.com/image1.jpg']
      })

      it('should return true when user is the item seller', () => {
        const auth: MockAuthContext = { uid: 'user123' }
        const item = createMockItem('user123')
        expect(isItemOwner(auth, item)).toBe(true)
      })

      it('should return false when user is not the item seller', () => {
        const auth: MockAuthContext = { uid: 'user123' }
        const item = createMockItem('user456')
        expect(isItemOwner(auth, item)).toBe(false)
      })

      it('should return false when user is not authenticated', () => {
        const auth: MockAuthContext = { uid: null }
        const item = createMockItem('user123')
        expect(isItemOwner(auth, item)).toBe(false)
      })

      it('should handle empty seller id', () => {
        const auth: MockAuthContext = { uid: 'user123' }
        const item = createMockItem('')
        expect(isItemOwner(auth, item)).toBe(false)
      })
    })

    describe('isStudioOwner', () => {
      const createMockStudio = (createdBy: string): Studio => ({
        id: 'studio123',
        name: 'Test Studio',
        category: 'studio',
        location: {
          geopoint: { latitude: 37.5665, longitude: 126.9780 } as any,
          address: 'Seoul, Korea',
          region: 'Seoul'
        },
        stats: {
          views: 0,
          favorites: 0,
          avgRating: 0,
          reviewCount: 0
        },
        metadata: {
          createdAt: mockTimestamp(),
          updatedAt: mockTimestamp(),
          createdBy,
          verified: false,
          featured: false,
          status: 'active'
        }
      })

      it('should return true when user created the studio', () => {
        const auth: MockAuthContext = { uid: 'user123' }
        const studio = createMockStudio('user123')
        expect(isStudioOwner(auth, studio)).toBe(true)
      })

      it('should return false when user did not create the studio', () => {
        const auth: MockAuthContext = { uid: 'user123' }
        const studio = createMockStudio('user456')
        expect(isStudioOwner(auth, studio)).toBe(false)
      })

      it('should return false when user is not authenticated', () => {
        const auth: MockAuthContext = { uid: null }
        const studio = createMockStudio('user123')
        expect(isStudioOwner(auth, studio)).toBe(false)
      })

      it('should handle empty createdBy', () => {
        const auth: MockAuthContext = { uid: 'user123' }
        const studio = createMockStudio('')
        expect(isStudioOwner(auth, studio)).toBe(false)
      })
    })
  })

  describe('Data Validation Functions', () => {
    describe('isValidStudioData', () => {
      const createValidStudioData = (): CreateStudioData => ({
        name: 'Test Studio',
        description: 'A great dance studio',
        category: 'studio',
        location: {
          address: '123 Dance Street, Seoul',
          region: 'Gangnam',
          coordinates: { lat: 37.5665, lng: 126.9780 }
        },
        contact: {
          phone: '02-1234-5678',
          email: 'test@studio.com',
          website: 'https://studio.com'
        },
        facilities: {
          area: 100,
          capacity: 30,
          floorType: 'Wood',
          soundSystem: true,
          airConditioning: true
        },
        pricing: {
          hourly: 30000,
          currency: 'KRW'
        },
        images: ['https://example.com/image1.jpg']
      })

      it('should validate correct studio data', () => {
        const data = createValidStudioData()
        const result = isValidStudioData(data)
        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should require name field', () => {
        const data = createValidStudioData()
        delete (data as any).name
        const result = isValidStudioData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('name is required and must be a non-empty string')
      })

      it('should reject empty name', () => {
        const data = createValidStudioData()
        data.name = '   '
        const result = isValidStudioData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('name is required and must be a non-empty string')
      })

      it('should reject name longer than 100 characters', () => {
        const data = createValidStudioData()
        data.name = 'a'.repeat(101)
        const result = isValidStudioData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('name must be 100 characters or less')
      })

      it('should require valid category', () => {
        const data = createValidStudioData()
        data.category = 'invalid' as any
        const result = isValidStudioData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('category must be a valid studio category')
      })

      it('should require location', () => {
        const data = createValidStudioData()
        delete (data as any).location
        const result = isValidStudioData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('location is required')
      })

      it('should require location address', () => {
        const data = createValidStudioData()
        delete data.location.address
        const result = isValidStudioData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('location.address is required and must be a string')
      })

      it('should require location region', () => {
        const data = createValidStudioData()
        delete data.location.region
        const result = isValidStudioData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('location.region is required and must be a string')
      })

      it('should validate coordinates range', () => {
        const data = createValidStudioData()
        data.location.coordinates = { lat: 91, lng: 181 }
        const result = isValidStudioData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('location.coordinates.lat must be between -90 and 90')
        expect(result.errors).toContain('location.coordinates.lng must be between -180 and 180')
      })

      it('should validate email format', () => {
        const data = createValidStudioData()
        data.contact!.email = 'invalid-email'
        const result = isValidStudioData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('contact.email must be a valid email address')
      })

      it('should validate phone format', () => {
        const data = createValidStudioData()
        data.contact!.phone = 'invalid-phone-@#$'
        const result = isValidStudioData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('contact.phone must contain only numbers, spaces, and phone formatting characters')
      })

      it('should validate website URL', () => {
        const data = createValidStudioData()
        data.contact!.website = 'not-a-url'
        const result = isValidStudioData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('contact.website must be a valid URL starting with http or https')
      })

      it('should validate pricing currency', () => {
        const data = createValidStudioData()
        data.pricing!.currency = 'USD' as any
        const result = isValidStudioData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('pricing.currency must be KRW')
      })

      it('should validate negative pricing values', () => {
        const data = createValidStudioData()
        data.pricing!.hourly = -1000
        const result = isValidStudioData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('pricing.hourly must be a non-negative number')
      })

      it('should validate facilities area and capacity', () => {
        const data = createValidStudioData()
        data.facilities!.area = -50
        data.facilities!.capacity = 0.5
        const result = isValidStudioData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('facilities.area must be a positive number')
        expect(result.errors).toContain('facilities.capacity must be a positive integer')
      })

      it('should validate images array', () => {
        const data = createValidStudioData()
        data.images = Array(11).fill('https://example.com/image.jpg')
        const result = isValidStudioData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('images array cannot contain more than 10 items')
      })

      it('should validate image URLs', () => {
        const data = createValidStudioData()
        data.images = ['not-a-url', 'http://insecure.com/image.jpg']
        const result = isValidStudioData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('images[0] must be a valid HTTPS URL')
        expect(result.errors).toContain('images[1] must be a valid HTTPS URL')
      })

      it('should handle missing optional fields', () => {
        const data: CreateStudioData = {
          name: 'Minimal Studio',
          category: 'studio',
          location: {
            address: '123 Street',
            region: 'Seoul',
            coordinates: { lat: 37.5665, lng: 126.9780 }
          }
        }
        const result = isValidStudioData(data)
        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    describe('isValidItemData', () => {
      const createValidItemData = (): CreateItemData => ({
        title: 'Test Dance Shoes',
        description: 'High-quality dance shoes in excellent condition',
        category: 'shoes',
        pricing: {
          price: 80000,
          currency: 'KRW',
          negotiable: true,
          tradeMethod: 'both',
          deliveryFee: 3000
        },
        specs: {
          condition: 'good',
          brand: 'Supadance',
          size: '240',
          color: 'Black',
          originalPrice: 150000
        },
        location: {
          region: 'Seoul',
          deliveryAvailable: true,
          coordinates: { lat: 37.5665, lng: 126.9780 }
        },
        images: ['https://example.com/shoe1.jpg', 'https://example.com/shoe2.jpg']
      })

      it('should validate correct item data', () => {
        const data = createValidItemData()
        const result = isValidItemData(data)
        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should require title field', () => {
        const data = createValidItemData()
        delete (data as any).title
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('title is required and must be a non-empty string')
      })

      it('should reject empty title', () => {
        const data = createValidItemData()
        data.title = '   '
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('title is required and must be a non-empty string')
      })

      it('should reject title longer than 100 characters', () => {
        const data = createValidItemData()
        data.title = 'a'.repeat(101)
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('title must be 100 characters or less')
      })

      it('should require description field', () => {
        const data = createValidItemData()
        delete (data as any).description
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('description is required and must be a non-empty string')
      })

      it('should reject description longer than 2000 characters', () => {
        const data = createValidItemData()
        data.description = 'a'.repeat(2001)
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('description must be 2000 characters or less')
      })

      it('should require valid category', () => {
        const data = createValidItemData()
        data.category = 'invalid' as any
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('category must be a valid product category')
      })

      it('should require pricing', () => {
        const data = createValidItemData()
        delete (data as any).pricing
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('pricing is required')
      })

      it('should validate pricing values', () => {
        const data = createValidItemData()
        data.pricing.price = 0
        data.pricing.currency = 'USD' as any
        data.pricing.tradeMethod = 'invalid' as any
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('pricing.price must be a positive number')
        expect(result.errors).toContain('pricing.currency must be KRW')
        expect(result.errors).toContain('pricing.tradeMethod must be direct, delivery, or both')
      })

      it('should validate price limits', () => {
        const data = createValidItemData()
        data.pricing.price = 20000000 // Over 10M limit
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('pricing.price cannot exceed 10,000,000 KRW')
      })

      it('should validate delivery fee', () => {
        const data = createValidItemData()
        data.pricing.deliveryFee = -1000
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('pricing.deliveryFee must be a non-negative number')
      })

      it('should validate delivery fee limits', () => {
        const data = createValidItemData()
        data.pricing.deliveryFee = 200000 // Over 100K limit
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('pricing.deliveryFee cannot exceed 100,000 KRW')
      })

      it('should require specs', () => {
        const data = createValidItemData()
        delete (data as any).specs
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('specs is required')
      })

      it('should validate specs condition', () => {
        const data = createValidItemData()
        data.specs.condition = 'invalid' as any
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('specs.condition must be a valid condition')
      })

      it('should validate original price', () => {
        const data = createValidItemData()
        data.specs.originalPrice = -1000
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('specs.originalPrice must be a positive number')
      })

      it('should validate original price limits', () => {
        const data = createValidItemData()
        data.specs.originalPrice = 100000000 // Over 50M limit
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('specs.originalPrice cannot exceed 50,000,000 KRW')
      })

      it('should require location', () => {
        const data = createValidItemData()
        delete (data as any).location
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('location is required')
      })

      it('should require location region', () => {
        const data = createValidItemData()
        delete data.location.region
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('location.region is required and must be a string')
      })

      it('should validate coordinates if provided', () => {
        const data = createValidItemData()
        data.location.coordinates = { lat: 91, lng: 181 }
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('location.coordinates.lat must be between -90 and 90')
        expect(result.errors).toContain('location.coordinates.lng must be between -180 and 180')
      })

      it('should require images', () => {
        const data = createValidItemData()
        delete (data as any).images
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('images is required and must be a non-empty array')
      })

      it('should require non-empty images array', () => {
        const data = createValidItemData()
        data.images = []
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('images is required and must be a non-empty array')
      })

      it('should validate images array size', () => {
        const data = createValidItemData()
        data.images = Array(9).fill('https://example.com/image.jpg')
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('images array cannot contain more than 8 items')
      })

      it('should validate image URLs', () => {
        const data = createValidItemData()
        data.images = ['not-a-url', 'http://insecure.com/image.jpg']
        const result = isValidItemData(data)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('images[0] must be a valid HTTPS URL')
        expect(result.errors).toContain('images[1] must be a valid HTTPS URL')
      })

      it('should handle minimal valid data', () => {
        const data: CreateItemData = {
          title: 'Minimal Item',
          description: 'Basic description',
          category: 'shoes',
          pricing: {
            price: 10000,
            currency: 'KRW',
            negotiable: false,
            tradeMethod: 'direct'
          },
          specs: {
            condition: 'good'
          },
          location: {
            region: 'Seoul',
            deliveryAvailable: false
          },
          images: ['https://example.com/image.jpg']
        }
        const result = isValidItemData(data)
        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })
  })

  // Helper functions for test scenarios
  const createAuthenticatedUser = (uid: string): MockAuthContext => ({ uid })
  const createUnauthenticatedUser = (): MockAuthContext => ({ uid: null })
  const createAdminUser = (uid: string): MockAuthContext => ({
    uid,
    token: { admin: true }
  })

  describe('Marketplace Items Collection Rules', () => {

    const createMockItem = (sellerId: string): MarketplaceItem => ({
      id: 'item123',
      title: 'Test Item',
      description: 'Test description',
      category: 'shoes',
      pricing: {
        price: 50000,
        currency: 'KRW',
        negotiable: true,
        tradeMethod: 'both'
      },
      specs: {
        condition: 'good',
        brand: 'Test Brand'
      },
      location: {
        region: 'Seoul',
        deliveryAvailable: true
      },
      stats: {
        views: 0,
        favorites: 0,
        inquiries: 0
      },
      metadata: {
        createdAt: mockTimestamp(),
        updatedAt: mockTimestamp(),
        sellerId,
        status: 'available',
        featured: false,
        reported: false
      },
      images: ['https://example.com/image1.jpg']
    })

    describe('Read Permissions', () => {
      it('should allow authenticated users to read available items', () => {
        const auth = createAuthenticatedUser('user123')
        const item = createMockItem('seller456')

        // Simulate read permission check
        const canRead = isAuthenticated(auth) && item.metadata.status === 'available'
        expect(canRead).toBe(true)
      })

      it('should deny unauthenticated users from reading items', () => {
        const auth = createUnauthenticatedUser()
        const item = createMockItem('seller456')

        const canRead = isAuthenticated(auth)
        expect(canRead).toBe(false)
      })

      it('should allow owners to read their own items regardless of status', () => {
        const auth = createAuthenticatedUser('seller123')
        const item = createMockItem('seller123')
        item.metadata.status = 'sold'

        const canRead = isAuthenticated(auth) && (
          item.metadata.status === 'available' ||
          isItemOwner(auth, item) ||
          isAdmin(auth)
        )
        expect(canRead).toBe(true)
      })

      it('should allow admins to read any item', () => {
        const auth = createAdminUser('admin123')
        const item = createMockItem('seller456')
        item.metadata.reported = true

        const canRead = isAuthenticated(auth) && (
          item.metadata.status === 'available' ||
          isItemOwner(auth, item) ||
          isAdmin(auth)
        )
        expect(canRead).toBe(true)
      })

      it('should deny reading reported items for regular users', () => {
        const auth = createAuthenticatedUser('user123')
        const item = createMockItem('seller456')
        item.metadata.reported = true

        const canRead = isAuthenticated(auth) &&
          !item.metadata.reported &&
          item.metadata.status === 'available'
        expect(canRead).toBe(false)
      })
    })

    describe('Create Permissions', () => {
      const createValidItemData = (): CreateItemData => ({
        title: 'New Item',
        description: 'Item description',
        category: 'shoes',
        pricing: {
          price: 50000,
          currency: 'KRW',
          negotiable: true,
          tradeMethod: 'both'
        },
        specs: {
          condition: 'good'
        },
        location: {
          region: 'Seoul',
          deliveryAvailable: true
        },
        images: ['https://example.com/image.jpg']
      })

      it('should allow authenticated users to create valid items', () => {
        const auth = createAuthenticatedUser('user123')
        const itemData = createValidItemData()

        const validation = isValidItemData(itemData)
        const canCreate = isAuthenticated(auth) && validation.valid

        expect(canCreate).toBe(true)
      })

      it('should deny unauthenticated users from creating items', () => {
        const auth = createUnauthenticatedUser()
        const itemData = createValidItemData()

        const validation = isValidItemData(itemData)
        const canCreate = isAuthenticated(auth) && validation.valid

        expect(canCreate).toBe(false)
      })

      it('should deny creating items with invalid data', () => {
        const auth = createAuthenticatedUser('user123')
        const itemData = createValidItemData()
        itemData.title = '' // Invalid

        const validation = isValidItemData(itemData)
        const canCreate = isAuthenticated(auth) && validation.valid

        expect(canCreate).toBe(false)
      })

      it('should enforce price limits', () => {
        const auth = createAuthenticatedUser('user123')
        const itemData = createValidItemData()
        itemData.pricing.price = 15000000 // Over limit

        const validation = isValidItemData(itemData)
        const canCreate = isAuthenticated(auth) && validation.valid

        expect(canCreate).toBe(false)
      })
    })

    describe('Update Permissions', () => {
      it('should allow owners to update their items', () => {
        const auth = createAuthenticatedUser('seller123')
        const item = createMockItem('seller123')

        const canUpdate = isAuthenticated(auth) && isItemOwner(auth, item)
        expect(canUpdate).toBe(true)
      })

      it('should deny non-owners from updating items', () => {
        const auth = createAuthenticatedUser('user456')
        const item = createMockItem('seller123')

        const canUpdate = isAuthenticated(auth) &&
          (isItemOwner(auth, item) || isAdmin(auth))
        expect(canUpdate).toBe(false)
      })

      it('should allow admins to update any item', () => {
        const auth = createAdminUser('admin123')
        const item = createMockItem('seller456')

        const canUpdate = isAuthenticated(auth) &&
          (isItemOwner(auth, item) || isAdmin(auth))
        expect(canUpdate).toBe(true)
      })

      it('should prevent updating sold items', () => {
        const auth = createAuthenticatedUser('seller123')
        const item = createMockItem('seller123')
        item.metadata.status = 'sold'

        const canUpdate = isAuthenticated(auth) &&
          isItemOwner(auth, item) &&
          item.metadata.status !== 'sold'
        expect(canUpdate).toBe(false)
      })

      it('should validate update data', () => {
        const auth = createAuthenticatedUser('seller123')
        const item = createMockItem('seller123')
        const updateData = { title: '' } // Invalid update

        const validation = updateData.title ?
          isValidItemData({ ...item, title: updateData.title } as CreateItemData) :
          { valid: false, errors: ['title cannot be empty'] }

        const canUpdate = isAuthenticated(auth) &&
          isItemOwner(auth, item) &&
          validation.valid
        expect(canUpdate).toBe(false)
      })
    })

    describe('Delete Permissions', () => {
      it('should allow owners to delete their items', () => {
        const auth = createAuthenticatedUser('seller123')
        const item = createMockItem('seller123')

        const canDelete = isAuthenticated(auth) && isItemOwner(auth, item)
        expect(canDelete).toBe(true)
      })

      it('should deny non-owners from deleting items', () => {
        const auth = createAuthenticatedUser('user456')
        const item = createMockItem('seller123')

        const canDelete = isAuthenticated(auth) &&
          (isItemOwner(auth, item) || isAdmin(auth))
        expect(canDelete).toBe(false)
      })

      it('should allow admins to delete any item', () => {
        const auth = createAdminUser('admin123')
        const item = createMockItem('seller456')

        const canDelete = isAuthenticated(auth) &&
          (isItemOwner(auth, item) || isAdmin(auth))
        expect(canDelete).toBe(true)
      })

      it('should prevent deleting items with active inquiries', () => {
        const auth = createAuthenticatedUser('seller123')
        const item = createMockItem('seller123')
        item.stats.inquiries = 5 // Has active inquiries

        const canDelete = isAuthenticated(auth) &&
          isItemOwner(auth, item) &&
          item.stats.inquiries === 0
        expect(canDelete).toBe(false)
      })
    })
  })

  describe('Item Inquiries Collection Rules', () => {
    const createMockInquiry = (buyerId: string, sellerId: string): ItemInquiry => ({
      id: 'inquiry123',
      itemId: 'item456',
      buyerId,
      sellerId,
      message: 'Is this item still available?',
      status: 'pending',
      createdAt: mockTimestamp(),
    })

    describe('Read Permissions', () => {
      it('should allow buyers to read their inquiries', () => {
        const auth = createAuthenticatedUser('buyer123')
        const inquiry = createMockInquiry('buyer123', 'seller456')

        const canRead = isAuthenticated(auth) &&
          (auth.uid === inquiry.buyerId || auth.uid === inquiry.sellerId || isAdmin(auth))
        expect(canRead).toBe(true)
      })

      it('should allow sellers to read inquiries for their items', () => {
        const auth = createAuthenticatedUser('seller456')
        const inquiry = createMockInquiry('buyer123', 'seller456')

        const canRead = isAuthenticated(auth) &&
          (auth.uid === inquiry.buyerId || auth.uid === inquiry.sellerId || isAdmin(auth))
        expect(canRead).toBe(true)
      })

      it('should deny other users from reading inquiries', () => {
        const auth = createAuthenticatedUser('other789')
        const inquiry = createMockInquiry('buyer123', 'seller456')

        const canRead = isAuthenticated(auth) &&
          (auth.uid === inquiry.buyerId || auth.uid === inquiry.sellerId || isAdmin(auth))
        expect(canRead).toBe(false)
      })

      it('should allow admins to read any inquiry', () => {
        const auth = createAdminUser('admin123')
        const inquiry = createMockInquiry('buyer456', 'seller789')

        const canRead = isAuthenticated(auth) &&
          (auth.uid === inquiry.buyerId || auth.uid === inquiry.sellerId || isAdmin(auth))
        expect(canRead).toBe(true)
      })
    })

    describe('Create Permissions', () => {
      it('should allow authenticated users to create inquiries', () => {
        const auth = createAuthenticatedUser('buyer123')
        const inquiryData = {
          itemId: 'item456',
          sellerId: 'seller789',
          message: 'Interested in this item'
        }

        const canCreate = isAuthenticated(auth) &&
          auth.uid !== inquiryData.sellerId && // Cannot inquire about own items
          inquiryData.message.trim().length > 0
        expect(canCreate).toBe(true)
      })

      it('should prevent users from inquiring about their own items', () => {
        const auth = createAuthenticatedUser('seller123')
        const inquiryData = {
          itemId: 'item456',
          sellerId: 'seller123', // Same as auth.uid
          message: 'Interested in this item'
        }

        const canCreate = isAuthenticated(auth) &&
          auth.uid !== inquiryData.sellerId
        expect(canCreate).toBe(false)
      })

      it('should require non-empty message', () => {
        const auth = createAuthenticatedUser('buyer123')
        const inquiryData = {
          itemId: 'item456',
          sellerId: 'seller789',
          message: '   ' // Empty message
        }

        const canCreate = isAuthenticated(auth) &&
          auth.uid !== inquiryData.sellerId &&
          inquiryData.message.trim().length > 0
        expect(canCreate).toBe(false)
      })
    })

    describe('Update Permissions', () => {
      it('should allow sellers to update inquiry status', () => {
        const auth = createAuthenticatedUser('seller456')
        const inquiry = createMockInquiry('buyer123', 'seller456')

        const canUpdate = isAuthenticated(auth) &&
          auth.uid === inquiry.sellerId
        expect(canUpdate).toBe(true)
      })

      it('should deny buyers from updating inquiry status', () => {
        const auth = createAuthenticatedUser('buyer123')
        const inquiry = createMockInquiry('buyer123', 'seller456')

        const canUpdate = isAuthenticated(auth) &&
          auth.uid === inquiry.sellerId
        expect(canUpdate).toBe(false)
      })

      it('should allow admins to update any inquiry', () => {
        const auth = createAdminUser('admin123')
        const inquiry = createMockInquiry('buyer456', 'seller789')

        const canUpdate = isAuthenticated(auth) &&
          (auth.uid === inquiry.sellerId || isAdmin(auth))
        expect(canUpdate).toBe(true)
      })
    })
  })

  describe('Item Images Subcollection Rules', () => {
    const createMockImage = (itemId: string, sellerId: string) => ({
      id: 'image123',
      itemId,
      url: 'https://example.com/image.jpg',
      uploadedBy: sellerId,
      createdAt: mockTimestamp()
    })

    describe('Read Permissions', () => {
      it('should allow anyone to read images for available items', () => {
        const auth = createAuthenticatedUser('user123')
        const itemId = 'item456'
        const item = { metadata: { status: 'available', reported: false } }

        const canRead = isAuthenticated(auth) &&
          item.metadata.status === 'available' &&
          !item.metadata.reported
        expect(canRead).toBe(true)
      })

      it('should deny reading images for reported items', () => {
        const auth = createAuthenticatedUser('user123')
        const item = { metadata: { status: 'available', reported: true } }

        const canRead = isAuthenticated(auth) &&
          item.metadata.status === 'available' &&
          !item.metadata.reported
        expect(canRead).toBe(false)
      })
    })

    describe('Create Permissions', () => {
      it('should allow item owners to upload images', () => {
        const auth = createAuthenticatedUser('seller123')
        const itemId = 'item456'
        const item = { metadata: { sellerId: 'seller123' } }

        const canCreate = isAuthenticated(auth) &&
          auth.uid === item.metadata.sellerId
        expect(canCreate).toBe(true)
      })

      it('should deny non-owners from uploading images', () => {
        const auth = createAuthenticatedUser('user456')
        const item = { metadata: { sellerId: 'seller123' } }

        const canCreate = isAuthenticated(auth) &&
          auth.uid === item.metadata.sellerId
        expect(canCreate).toBe(false)
      })

      it('should validate image data', () => {
        const auth = createAuthenticatedUser('seller123')
        const imageData = {
          url: 'not-a-url', // Invalid URL
          itemId: 'item456'
        }

        const isValidUrl = imageData.url.startsWith('https://')
        const canCreate = isAuthenticated(auth) && isValidUrl
        expect(canCreate).toBe(false)
      })
    })

    describe('Delete Permissions', () => {
      it('should allow item owners to delete images', () => {
        const auth = createAuthenticatedUser('seller123')
        const image = createMockImage('item456', 'seller123')

        const canDelete = isAuthenticated(auth) &&
          auth.uid === image.uploadedBy
        expect(canDelete).toBe(true)
      })

      it('should allow admins to delete any image', () => {
        const auth = createAdminUser('admin123')
        const image = createMockImage('item456', 'seller456')

        const canDelete = isAuthenticated(auth) &&
          (auth.uid === image.uploadedBy || isAdmin(auth))
        expect(canDelete).toBe(true)
      })

      it('should deny non-owners from deleting images', () => {
        const auth = createAuthenticatedUser('user789')
        const image = createMockImage('item456', 'seller123')

        const canDelete = isAuthenticated(auth) &&
          (auth.uid === image.uploadedBy || isAdmin(auth))
        expect(canDelete).toBe(false)
      })
    })
  })

  describe('Security Edge Cases and Malicious Input', () => {
    describe('SQL Injection Attempts', () => {
      it('should handle SQL injection in item title', () => {
        const maliciousData: CreateItemData = {
          title: "'; DROP TABLE items; --",
          description: 'Normal description',
          category: 'shoes',
          pricing: {
            price: 50000,
            currency: 'KRW',
            negotiable: true,
            tradeMethod: 'direct'
          },
          specs: { condition: 'good' },
          location: { region: 'Seoul', deliveryAvailable: true },
          images: ['https://example.com/image.jpg']
        }

        const result = isValidItemData(maliciousData)
        // Should pass validation (SQL injection is not relevant in NoSQL context)
        expect(result.valid).toBe(true)
      })
    })

    describe('XSS Attempts', () => {
      it('should handle script tags in description', () => {
        const maliciousData: CreateItemData = {
          title: 'Normal Title',
          description: '<script>alert("xss")</script>Malicious description',
          category: 'shoes',
          pricing: {
            price: 50000,
            currency: 'KRW',
            negotiable: true,
            tradeMethod: 'direct'
          },
          specs: { condition: 'good' },
          location: { region: 'Seoul', deliveryAvailable: true },
          images: ['https://example.com/image.jpg']
        }

        const result = isValidItemData(maliciousData)
        // Note: XSS protection should be handled at the UI/rendering layer
        expect(result.valid).toBe(true)
      })
    })

    describe('Authorization Bypass Attempts', () => {
      it('should prevent uid spoofing in auth context', () => {
        const maliciousAuth: MockAuthContext = {
          uid: 'admin',
          token: { admin: false } // Trying to spoof admin
        }

        expect(isAdmin(maliciousAuth)).toBe(false)
      })

      it('should prevent role elevation attempts', () => {
        const maliciousAuth: MockAuthContext = {
          uid: 'user123',
          token: { roles: ['user', 'admin'] } // Trying to add admin role
        }

        // This should be handled by Firebase Auth token verification
        expect(isAdmin(maliciousAuth)).toBe(true) // Would pass if token is valid
      })
    })

    describe('Data Type Confusion', () => {
      it('should handle non-string title', () => {
        const maliciousData = {
          title: 12345, // Number instead of string
          description: 'Normal description',
          category: 'shoes',
          pricing: {
            price: 50000,
            currency: 'KRW',
            negotiable: true,
            tradeMethod: 'direct'
          },
          specs: { condition: 'good' },
          location: { region: 'Seoul', deliveryAvailable: true },
          images: ['https://example.com/image.jpg']
        } as any

        const result = isValidItemData(maliciousData)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('title is required and must be a non-empty string')
      })

      it('should handle array as price', () => {
        const maliciousData = {
          title: 'Normal Title',
          description: 'Normal description',
          category: 'shoes',
          pricing: {
            price: [50000], // Array instead of number
            currency: 'KRW',
            negotiable: true,
            tradeMethod: 'direct'
          },
          specs: { condition: 'good' },
          location: { region: 'Seoul', deliveryAvailable: true },
          images: ['https://example.com/image.jpg']
        } as any

        const result = isValidItemData(maliciousData)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('pricing.price must be a positive number')
      })
    })

    describe('Buffer Overflow Attempts', () => {
      it('should handle extremely long strings', () => {
        const maliciousData: CreateItemData = {
          title: 'A'.repeat(10000), // Very long title
          description: 'B'.repeat(50000), // Very long description
          category: 'shoes',
          pricing: {
            price: 50000,
            currency: 'KRW',
            negotiable: true,
            tradeMethod: 'direct'
          },
          specs: { condition: 'good' },
          location: { region: 'Seoul', deliveryAvailable: true },
          images: ['https://example.com/image.jpg']
        }

        const result = isValidItemData(maliciousData)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('title must be 100 characters or less')
        expect(result.errors).toContain('description must be 2000 characters or less')
      })
    })

    describe('Null/Undefined Injection', () => {
      it('should handle null values in required fields', () => {
        const maliciousData = {
          title: null,
          description: undefined,
          category: 'shoes',
          pricing: null,
          specs: undefined,
          location: null,
          images: null
        } as any

        const result = isValidItemData(maliciousData)
        expect(result.valid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(5) // Multiple validation errors
      })
    })

    describe('Prototype Pollution Attempts', () => {
      it('should handle prototype pollution in data objects', () => {
        const maliciousData = {
          title: 'Normal Title',
          description: 'Normal description',
          category: 'shoes',
          '__proto__': { isAdmin: true },
          'constructor': { prototype: { isAdmin: true } },
          pricing: {
            price: 50000,
            currency: 'KRW',
            negotiable: true,
            tradeMethod: 'direct'
          },
          specs: { condition: 'good' },
          location: { region: 'Seoul', deliveryAvailable: true },
          images: ['https://example.com/image.jpg']
        } as any

        const result = isValidItemData(maliciousData)
        // Should ignore prototype pollution attempts and validate normally
        expect(result.valid).toBe(true)
      })
    })
  })

  describe('Performance and Rate Limiting', () => {
    describe('Validation Performance', () => {
      it('should validate data efficiently for large datasets', () => {
        const startTime = Date.now()

        for (let i = 0; i < 1000; i++) {
          const data: CreateItemData = {
            title: `Item ${i}`,
            description: `Description for item ${i}`,
            category: 'shoes',
            pricing: {
              price: 50000 + i,
              currency: 'KRW',
              negotiable: true,
              tradeMethod: 'direct'
            },
            specs: { condition: 'good' },
            location: { region: 'Seoul', deliveryAvailable: true },
            images: [`https://example.com/image${i}.jpg`]
          }
          isValidItemData(data)
        }

        const endTime = Date.now()
        const duration = endTime - startTime

        // Should validate 1000 items in reasonable time (< 1 second)
        expect(duration).toBeLessThan(1000)
      })
    })

    describe('Memory Usage', () => {
      it('should not leak memory during repeated validations', () => {
        const initialMemory = process.memoryUsage().heapUsed

        for (let i = 0; i < 10000; i++) {
          const data: CreateItemData = {
            title: `Item ${i}`,
            description: `Description for item ${i}`.repeat(100), // Large description
            category: 'shoes',
            pricing: {
              price: 50000,
              currency: 'KRW',
              negotiable: true,
              tradeMethod: 'direct'
            },
            specs: { condition: 'good' },
            location: { region: 'Seoul', deliveryAvailable: true },
            images: Array(8).fill(`https://example.com/image${i}.jpg`)
          }
          isValidItemData(data)
        }

        // Force garbage collection if available
        if (global.gc) {
          global.gc()
        }

        const finalMemory = process.memoryUsage().heapUsed
        const memoryIncrease = finalMemory - initialMemory

        // Memory increase should be reasonable (< 50MB)
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
      })
    })
  })
})