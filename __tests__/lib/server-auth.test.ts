/**
 * Server Authentication Tests
 */

import { headers } from 'next/headers'
import {
  getAuthenticatedUser,
  requireAuth,
  hasPermission,
  requirePermission,
  getCurrentUserId,
  isAdmin,
  requireAdmin,
  validateResourceAccess,
  requireResourceAccess
} from '@/lib/server-auth'

// Mock next/headers
jest.mock('next/headers', () => ({
  headers: jest.fn()
}))

// Mock firebase-admin
jest.mock('@/lib/firebase-admin', () => ({
  verifyIdToken: jest.fn()
}))

const mockHeaders = headers as jest.MockedFunction<typeof headers>

describe('Server Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAuthenticatedUser', () => {
    it('should return user from headers when valid', async () => {
      const mockHeadersList = new Map([
        ['x-user-id', 'user123'],
        ['x-user-email', 'test@example.com'],
        ['x-user-verified', 'true'],
        ['x-auth-time', '1640995200'],
        ['x-token-issued', '1640995200']
      ])

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      const user = await getAuthenticatedUser()

      expect(user).toEqual({
        uid: 'user123',
        email: 'test@example.com',
        emailVerified: true,
        decodedToken: {
          uid: 'user123',
          email: 'test@example.com',
          email_verified: true,
          auth_time: 1640995200,
          iat: 1640995200
        }
      })
    })

    it('should reject tokens older than 24 hours', async () => {
      const oldTokenTime = Math.floor(Date.now() / 1000) - (25 * 60 * 60) // 25 hours ago

      const mockHeadersList = new Map([
        ['x-user-id', 'user123'],
        ['x-user-email', 'test@example.com'],
        ['x-user-verified', 'true'],
        ['x-token-issued', oldTokenTime.toString()]
      ])

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      const user = await getAuthenticatedUser()
      expect(user).toBeNull()
    })

    it('should accept tokens within 24 hours', async () => {
      const recentTokenTime = Math.floor(Date.now() / 1000) - (12 * 60 * 60) // 12 hours ago

      const mockHeadersList = new Map([
        ['x-user-id', 'user123'],
        ['x-user-email', 'test@example.com'],
        ['x-user-verified', 'true'],
        ['x-token-issued', recentTokenTime.toString()]
      ])

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      const user = await getAuthenticatedUser()
      expect(user).not.toBeNull()
      expect(user?.uid).toBe('user123')
    })

    it('should return null when no user headers present', async () => {
      const mockHeadersList = new Map()

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      const user = await getAuthenticatedUser()
      expect(user).toBeNull()
    })

    it('should handle missing verification status', async () => {
      const mockHeadersList = new Map([
        ['x-user-id', 'user123'],
        ['x-user-email', 'test@example.com']
        // No x-user-verified header
      ])

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      const user = await getAuthenticatedUser()
      expect(user).toEqual({
        uid: 'user123',
        email: 'test@example.com',
        emailVerified: false,
        decodedToken: {
          uid: 'user123',
          email: 'test@example.com',
          email_verified: false,
          auth_time: undefined,
          iat: undefined
        }
      })
    })

    it('should fallback to Authorization header verification', async () => {
      const mockHeadersList = new Map([
        ['authorization', 'Bearer test-token']
      ])

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      const { verifyIdToken } = require('@/lib/firebase-admin')
      verifyIdToken.mockResolvedValue({
        success: true,
        decodedToken: {
          uid: 'user456',
          email: 'fallback@example.com',
          email_verified: true
        }
      })

      const user = await getAuthenticatedUser()
      expect(user).toEqual({
        uid: 'user456',
        email: 'fallback@example.com',
        emailVerified: true,
        decodedToken: {
          uid: 'user456',
          email: 'fallback@example.com',
          email_verified: true
        }
      })
    })
  })

  describe('requireAuth', () => {
    it('should return user when authenticated', async () => {
      const mockHeadersList = new Map([
        ['x-user-id', 'user123'],
        ['x-user-email', 'test@example.com'],
        ['x-user-verified', 'true']
      ])

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      const user = await requireAuth()
      expect(user.uid).toBe('user123')
    })

    it('should throw error when not authenticated', async () => {
      const mockHeadersList = new Map()

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      await expect(requireAuth()).rejects.toThrow('Authentication required')
    })
  })

  describe('hasPermission', () => {
    it('should return true for basic permissions when authenticated', async () => {
      const mockHeadersList = new Map([
        ['x-user-id', 'user123'],
        ['x-user-email', 'test@example.com']
      ])

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      const hasReadPosts = await hasPermission('read:posts')
      const hasWritePosts = await hasPermission('write:posts')

      expect(hasReadPosts).toBe(true)
      expect(hasWritePosts).toBe(true)
    })

    it('should return false when not authenticated', async () => {
      const mockHeadersList = new Map()

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      const hasPermission1 = await hasPermission('read:posts')
      expect(hasPermission1).toBe(false)
    })

    it('should return false for unknown permissions', async () => {
      const mockHeadersList = new Map([
        ['x-user-id', 'user123'],
        ['x-user-email', 'test@example.com']
      ])

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      const hasAdminPermission = await hasPermission('admin:delete')
      expect(hasAdminPermission).toBe(false)
    })
  })

  describe('requirePermission', () => {
    it('should return user when permission granted', async () => {
      const mockHeadersList = new Map([
        ['x-user-id', 'user123'],
        ['x-user-email', 'test@example.com']
      ])

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      const user = await requirePermission('read:posts')
      expect(user.uid).toBe('user123')
    })

    it('should throw error when permission denied', async () => {
      const mockHeadersList = new Map([
        ['x-user-id', 'user123'],
        ['x-user-email', 'test@example.com']
      ])

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      await expect(requirePermission('admin:delete')).rejects.toThrow('Permission \'admin:delete\' required')
    })
  })

  describe('getCurrentUserId', () => {
    it('should return user ID when authenticated', async () => {
      const mockHeadersList = new Map([
        ['x-user-id', 'user123'],
        ['x-user-email', 'test@example.com']
      ])

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      const userId = await getCurrentUserId()
      expect(userId).toBe('user123')
    })

    it('should return null when not authenticated', async () => {
      const mockHeadersList = new Map()

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      const userId = await getCurrentUserId()
      expect(userId).toBeNull()
    })
  })

  describe('isAdmin', () => {
    it('should return false for non-admin users', async () => {
      const mockHeadersList = new Map([
        ['x-user-id', 'user123'],
        ['x-user-email', 'test@example.com']
      ])

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      const adminStatus = await isAdmin()
      expect(adminStatus).toBe(false)
    })

    it('should return false when not authenticated', async () => {
      const mockHeadersList = new Map()

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      const adminStatus = await isAdmin()
      expect(adminStatus).toBe(false)
    })
  })

  describe('requireAdmin', () => {
    it('should throw error for non-admin users', async () => {
      const mockHeadersList = new Map([
        ['x-user-id', 'user123'],
        ['x-user-email', 'test@example.com']
      ])

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      await expect(requireAdmin()).rejects.toThrow('Admin access required')
    })
  })

  describe('validateResourceAccess', () => {
    it('should return true when user owns resource', async () => {
      const mockHeadersList = new Map([
        ['x-user-id', 'user123'],
        ['x-user-email', 'test@example.com']
      ])

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      const hasAccess = await validateResourceAccess('user123')
      expect(hasAccess).toBe(true)
    })

    it('should return false when user does not own resource', async () => {
      const mockHeadersList = new Map([
        ['x-user-id', 'user123'],
        ['x-user-email', 'test@example.com']
      ])

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      const hasAccess = await validateResourceAccess('user456')
      expect(hasAccess).toBe(false)
    })

    it('should return false when not authenticated', async () => {
      const mockHeadersList = new Map()

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      const hasAccess = await validateResourceAccess('user123')
      expect(hasAccess).toBe(false)
    })
  })

  describe('requireResourceAccess', () => {
    it('should return user when access granted', async () => {
      const mockHeadersList = new Map([
        ['x-user-id', 'user123'],
        ['x-user-email', 'test@example.com']
      ])

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      const user = await requireResourceAccess('user123')
      expect(user.uid).toBe('user123')
    })

    it('should throw error when access denied', async () => {
      const mockHeadersList = new Map([
        ['x-user-id', 'user123'],
        ['x-user-email', 'test@example.com']
      ])

      mockHeaders.mockReturnValue({
        get: (name: string) => mockHeadersList.get(name) || null
      } as any)

      await expect(requireResourceAccess('user456')).rejects.toThrow('Access denied')
    })
  })
})