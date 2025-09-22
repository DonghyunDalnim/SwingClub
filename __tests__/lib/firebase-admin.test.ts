/**
 * Firebase Admin SDK Tests
 */

import { beforeEach, afterEach } from '@jest/globals'

// Mock Firebase Admin modules
jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(),
  cert: jest.fn()
}))

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn()
}))

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn()
}))

describe('Firebase Admin SDK', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv }

    // Clear module cache to reset Firebase Admin initialization
    jest.resetModules()
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe('Initialization', () => {
    it('should initialize with demo mode in development', async () => {
      process.env.NODE_ENV = 'development'
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'demo-project'

      const { getApps } = await import('firebase-admin/app')
      const mockGetApps = getApps as jest.MockedFunction<typeof getApps>
      mockGetApps.mockReturnValue([])

      const { adminApp, adminAuth, adminDb, isAdminInitialized } = await import('@/lib/firebase-admin')

      expect(adminApp).toBeNull()
      expect(adminAuth).toBeTruthy()
      expect(adminDb).toBeNull()
      expect(isAdminInitialized()).toBe(true)
    })

    it('should initialize with existing app if already initialized', async () => {
      process.env.NODE_ENV = 'test'

      const mockApp = { name: 'existing-app' }
      const mockAuth = { verifyIdToken: jest.fn() }
      const mockDb = { collection: jest.fn() }

      const { getApps } = await import('firebase-admin/app')
      const { getAuth } = await import('firebase-admin/auth')
      const { getFirestore } = await import('firebase-admin/firestore')

      const mockGetApps = getApps as jest.MockedFunction<typeof getApps>
      const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>
      const mockGetFirestore = getFirestore as jest.MockedFunction<typeof getFirestore>

      mockGetApps.mockReturnValue([mockApp as any])
      mockGetAuth.mockReturnValue(mockAuth as any)
      mockGetFirestore.mockReturnValue(mockDb as any)

      const { adminApp, adminAuth, adminDb } = await import('@/lib/firebase-admin')

      expect(adminApp).toBe(mockApp)
      expect(adminAuth).toBe(mockAuth)
      expect(adminDb).toBe(mockDb)
    })

    it('should throw error when service account key is missing in production', async () => {
      process.env.NODE_ENV = 'production'
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'production-project'
      delete process.env.FIREBASE_SERVICE_ACCOUNT_KEY

      const { getApps } = await import('firebase-admin/app')
      const mockGetApps = getApps as jest.MockedFunction<typeof getApps>
      mockGetApps.mockReturnValue([])

      await expect(import('@/lib/firebase-admin')).rejects.toThrow(
        'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required for production'
      )
    })

    it('should throw error when project ID is missing in production', async () => {
      process.env.NODE_ENV = 'production'
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY = '{"type": "service_account"}'
      delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

      const { getApps } = await import('firebase-admin/app')
      const mockGetApps = getApps as jest.MockedFunction<typeof getApps>
      mockGetApps.mockReturnValue([])

      await expect(import('@/lib/firebase-admin')).rejects.toThrow(
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is required'
      )
    })

    it('should throw error when service account key is invalid JSON', async () => {
      process.env.NODE_ENV = 'production'
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'production-project'
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY = 'invalid-json'

      const { getApps } = await import('firebase-admin/app')
      const mockGetApps = getApps as jest.MockedFunction<typeof getApps>
      mockGetApps.mockReturnValue([])

      await expect(import('@/lib/firebase-admin')).rejects.toThrow(
        'Invalid FIREBASE_SERVICE_ACCOUNT_KEY format. Must be valid JSON.'
      )
    })

    it('should initialize successfully in production with valid credentials', async () => {
      process.env.NODE_ENV = 'production'
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'production-project'
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY = JSON.stringify({
        type: 'service_account',
        project_id: 'production-project',
        private_key: 'fake-private-key',
        client_email: 'test@production-project.iam.gserviceaccount.com'
      })

      const mockApp = { name: 'production-app' }
      const mockAuth = { verifyIdToken: jest.fn() }
      const mockDb = { collection: jest.fn() }

      const { getApps, initializeApp, cert } = await import('firebase-admin/app')
      const { getAuth } = await import('firebase-admin/auth')
      const { getFirestore } = await import('firebase-admin/firestore')

      const mockGetApps = getApps as jest.MockedFunction<typeof getApps>
      const mockInitializeApp = initializeApp as jest.MockedFunction<typeof initializeApp>
      const mockCert = cert as jest.MockedFunction<typeof cert>
      const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>
      const mockGetFirestore = getFirestore as jest.MockedFunction<typeof getFirestore>

      mockGetApps.mockReturnValue([])
      mockInitializeApp.mockReturnValue(mockApp as any)
      mockCert.mockReturnValue({} as any)
      mockGetAuth.mockReturnValue(mockAuth as any)
      mockGetFirestore.mockReturnValue(mockDb as any)

      const { adminApp, adminAuth, adminDb, isAdminInitialized } = await import('@/lib/firebase-admin')

      expect(mockCert).toHaveBeenCalledWith({
        type: 'service_account',
        project_id: 'production-project',
        private_key: 'fake-private-key',
        client_email: 'test@production-project.iam.gserviceaccount.com'
      })
      expect(mockInitializeApp).toHaveBeenCalledWith({
        credential: {},
        projectId: 'production-project'
      })
      expect(adminApp).toBe(mockApp)
      expect(adminAuth).toBe(mockAuth)
      expect(adminDb).toBe(mockDb)
      expect(isAdminInitialized()).toBe(true)
    })
  })

  describe('Token Verification', () => {
    it('should verify valid token successfully in demo mode', async () => {
      process.env.NODE_ENV = 'development'
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'demo-project'

      const { getApps } = await import('firebase-admin/app')
      const mockGetApps = getApps as jest.MockedFunction<typeof getApps>
      mockGetApps.mockReturnValue([])

      const { verifyIdToken } = await import('@/lib/firebase-admin')

      const result = await verifyIdToken('demo-token')

      expect(result.success).toBe(true)
      expect(result.uid).toBe('demo-user')
      expect(result.email).toBe('demo@example.com')
      expect(result.decodedToken).toBeTruthy()
      expect(result.decodedToken?.uid).toBe('demo-user')
    })

    it('should verify valid token successfully in production', async () => {
      process.env.NODE_ENV = 'production'
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'production-project'
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY = JSON.stringify({
        type: 'service_account',
        project_id: 'production-project'
      })

      const mockDecodedToken = {
        uid: 'test-user-id',
        email: 'test@example.com',
        email_verified: true,
        aud: 'production-project',
        iss: 'https://securetoken.google.com/production-project',
        auth_time: Math.floor(Date.now() / 1000),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        sub: 'test-user-id'
      }

      const mockAuth = {
        verifyIdToken: jest.fn().mockResolvedValue(mockDecodedToken)
      }

      const { getApps, initializeApp, cert } = await import('firebase-admin/app')
      const { getAuth } = await import('firebase-admin/auth')
      const { getFirestore } = await import('firebase-admin/firestore')

      const mockGetApps = getApps as jest.MockedFunction<typeof getApps>
      const mockInitializeApp = initializeApp as jest.MockedFunction<typeof initializeApp>
      const mockCert = cert as jest.MockedFunction<typeof cert>
      const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>
      const mockGetFirestore = getFirestore as jest.MockedFunction<typeof getFirestore>

      mockGetApps.mockReturnValue([])
      mockInitializeApp.mockReturnValue({} as any)
      mockCert.mockReturnValue({} as any)
      mockGetAuth.mockReturnValue(mockAuth as any)
      mockGetFirestore.mockReturnValue({} as any)

      const { verifyIdToken } = await import('@/lib/firebase-admin')

      const result = await verifyIdToken('valid-token')

      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith('valid-token')
      expect(result.success).toBe(true)
      expect(result.uid).toBe('test-user-id')
      expect(result.email).toBe('test@example.com')
      expect(result.decodedToken).toBe(mockDecodedToken)
    })

    it('should handle token verification failure', async () => {
      process.env.NODE_ENV = 'production'
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'production-project'
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY = JSON.stringify({
        type: 'service_account',
        project_id: 'production-project'
      })

      const mockAuth = {
        verifyIdToken: jest.fn().mockRejectedValue(new Error('Token verification failed'))
      }

      const { getApps, initializeApp, cert } = await import('firebase-admin/app')
      const { getAuth } = await import('firebase-admin/auth')
      const { getFirestore } = await import('firebase-admin/firestore')

      const mockGetApps = getApps as jest.MockedFunction<typeof getApps>
      const mockInitializeApp = initializeApp as jest.MockedFunction<typeof initializeApp>
      const mockCert = cert as jest.MockedFunction<typeof cert>
      const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>
      const mockGetFirestore = getFirestore as jest.MockedFunction<typeof getFirestore>

      mockGetApps.mockReturnValue([])
      mockInitializeApp.mockReturnValue({} as any)
      mockCert.mockReturnValue({} as any)
      mockGetAuth.mockReturnValue(mockAuth as any)
      mockGetFirestore.mockReturnValue({} as any)

      const { verifyIdToken } = await import('@/lib/firebase-admin')

      const result = await verifyIdToken('invalid-token')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Token verification failed')
      expect(result.decodedToken).toBeNull()
      expect(result.uid).toBeNull()
      expect(result.email).toBeNull()
    })

    it('should handle missing admin auth', async () => {
      // Create a mock where adminAuth is null
      jest.doMock('@/lib/firebase-admin', () => ({
        adminAuth: null,
        verifyIdToken: async () => {
          throw new Error('Firebase Admin Auth not initialized')
        }
      }))

      const { verifyIdToken } = await import('@/lib/firebase-admin')

      const result = await verifyIdToken('test-token')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Firebase Admin Auth not initialized')
    })
  })

  describe('Admin Initialization Check', () => {
    it('should return true in demo mode', async () => {
      process.env.NODE_ENV = 'development'
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'demo-project'

      const { getApps } = await import('firebase-admin/app')
      const mockGetApps = getApps as jest.MockedFunction<typeof getApps>
      mockGetApps.mockReturnValue([])

      const { isAdminInitialized } = await import('@/lib/firebase-admin')

      expect(isAdminInitialized()).toBe(true)
    })

    it('should return true in production when properly initialized', async () => {
      process.env.NODE_ENV = 'production'
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'production-project'
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY = JSON.stringify({
        type: 'service_account',
        project_id: 'production-project'
      })

      const { getApps, initializeApp, cert } = await import('firebase-admin/app')
      const { getAuth } = await import('firebase-admin/auth')
      const { getFirestore } = await import('firebase-admin/firestore')

      const mockGetApps = getApps as jest.MockedFunction<typeof getApps>
      const mockInitializeApp = initializeApp as jest.MockedFunction<typeof initializeApp>
      const mockCert = cert as jest.MockedFunction<typeof cert>
      const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>
      const mockGetFirestore = getFirestore as jest.MockedFunction<typeof getFirestore>

      mockGetApps.mockReturnValue([])
      mockInitializeApp.mockReturnValue({} as any)
      mockCert.mockReturnValue({} as any)
      mockGetAuth.mockReturnValue({} as any)
      mockGetFirestore.mockReturnValue({} as any)

      const { isAdminInitialized } = await import('@/lib/firebase-admin')

      expect(isAdminInitialized()).toBe(true)
    })
  })
})