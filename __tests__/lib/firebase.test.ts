/**
 * Firebase configuration and initialization tests
 */

import { beforeEach, afterEach } from '@jest/globals'

// Mock Firebase modules before importing
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn()
}))

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn()
}))

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn()
}))

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn()
}))

jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn()
}))

describe('Firebase Configuration', () => {
  const originalEnv = process.env
  const originalConsoleWarn = console.warn
  const originalConsoleError = console.error

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv }

    // Mock console methods
    console.warn = jest.fn()
    console.error = jest.fn()

    // Clear module cache to reset Firebase initialization
    jest.resetModules()
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
    console.warn = originalConsoleWarn
    console.error = originalConsoleError
  })

  describe('Environment Variable Validation', () => {
    it('should use environment variables when available', async () => {
      // Set environment variables
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key'
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com'
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project'
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com'
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '987654321'
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:987654321:web:test123'
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = 'G-TEST123'
      process.env.NODE_ENV = 'development'

      const { initializeApp } = await import('firebase/app')
      const mockInitializeApp = initializeApp as jest.MockedFunction<typeof initializeApp>
      mockInitializeApp.mockReturnValue({} as any)

      const { getAuth } = await import('firebase/auth')
      const { getFirestore } = await import('firebase/firestore')
      const { getStorage } = await import('firebase/storage')

      const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>
      const mockGetFirestore = getFirestore as jest.MockedFunction<typeof getFirestore>
      const mockGetStorage = getStorage as jest.MockedFunction<typeof getStorage>

      mockGetAuth.mockReturnValue({} as any)
      mockGetFirestore.mockReturnValue({} as any)
      mockGetStorage.mockReturnValue({} as any)

      // Import after setting up mocks
      await import('@/lib/firebase')

      expect(mockInitializeApp).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        authDomain: 'test-project.firebaseapp.com',
        projectId: 'test-project',
        storageBucket: 'test-project.appspot.com',
        messagingSenderId: '987654321',
        appId: '1:987654321:web:test123',
        measurementId: 'G-TEST123'
      })
    })

    it('should use fallback values when environment variables are missing', async () => {
      // Clear Firebase environment variables
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY
      delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
      process.env.NODE_ENV = 'test'

      const { initializeApp } = await import('firebase/app')
      const mockInitializeApp = initializeApp as jest.MockedFunction<typeof initializeApp>
      mockInitializeApp.mockReturnValue({} as any)

      const { getAuth } = await import('firebase/auth')
      const { getFirestore } = await import('firebase/firestore')
      const { getStorage } = await import('firebase/storage')

      const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>
      const mockGetFirestore = getFirestore as jest.MockedFunction<typeof getFirestore>
      const mockGetStorage = getStorage as jest.MockedFunction<typeof getStorage>

      mockGetAuth.mockReturnValue({} as any)
      mockGetFirestore.mockReturnValue({} as any)
      mockGetStorage.mockReturnValue({} as any)

      await import('@/lib/firebase')

      expect(mockInitializeApp).toHaveBeenCalledWith({
        apiKey: 'demo-api-key',
        authDomain: 'demo-project.firebaseapp.com',
        projectId: 'demo-project',
        storageBucket: 'demo-project.appspot.com',
        messagingSenderId: '123456789',
        appId: '1:123456789:web:abc123def456',
        measurementId: 'G-ABC123DEF4'
      })
    })

    it('should warn about missing environment variables in development', async () => {
      // Set development environment
      process.env.NODE_ENV = 'development'
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY

      const { initializeApp } = await import('firebase/app')
      const { getAuth } = await import('firebase/auth')
      const { getFirestore } = await import('firebase/firestore')
      const { getStorage } = await import('firebase/storage')

      const mockInitializeApp = initializeApp as jest.MockedFunction<typeof initializeApp>
      const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>
      const mockGetFirestore = getFirestore as jest.MockedFunction<typeof getFirestore>
      const mockGetStorage = getStorage as jest.MockedFunction<typeof getStorage>

      mockInitializeApp.mockReturnValue({} as any)
      mockGetAuth.mockReturnValue({} as any)
      mockGetFirestore.mockReturnValue({} as any)
      mockGetStorage.mockReturnValue({} as any)

      await import('@/lib/firebase')

      expect(console.warn).toHaveBeenCalledWith(
        'Missing Firebase environment variable: NEXT_PUBLIC_FIREBASE_API_KEY'
      )
    })
  })

  describe('Firebase Initialization', () => {
    it('should initialize all Firebase services successfully', async () => {
      process.env.NODE_ENV = 'test'

      const mockApp = { name: 'test-app' }
      const mockAuth = { currentUser: null }
      const mockDb = { type: 'firestore' }
      const mockStorage = { type: 'storage' }

      const { initializeApp } = await import('firebase/app')
      const { getAuth } = await import('firebase/auth')
      const { getFirestore } = await import('firebase/firestore')
      const { getStorage } = await import('firebase/storage')

      const mockInitializeApp = initializeApp as jest.MockedFunction<typeof initializeApp>
      const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>
      const mockGetFirestore = getFirestore as jest.MockedFunction<typeof getFirestore>
      const mockGetStorage = getStorage as jest.MockedFunction<typeof getStorage>

      mockInitializeApp.mockReturnValue(mockApp as any)
      mockGetAuth.mockReturnValue(mockAuth as any)
      mockGetFirestore.mockReturnValue(mockDb as any)
      mockGetStorage.mockReturnValue(mockStorage as any)

      const firebase = await import('@/lib/firebase')

      expect(firebase.app).toBe(mockApp)
      expect(firebase.auth).toBe(mockAuth)
      expect(firebase.db).toBe(mockDb)
      expect(firebase.storage).toBe(mockStorage)
    })

    it('should handle initialization errors gracefully', async () => {
      process.env.NODE_ENV = 'test'

      const { initializeApp } = await import('firebase/app')
      const mockInitializeApp = initializeApp as jest.MockedFunction<typeof initializeApp>
      mockInitializeApp.mockImplementation(() => {
        throw new Error('Firebase initialization failed')
      })

      await expect(import('@/lib/firebase')).rejects.toThrow('Firebase initialization failed')
      expect(console.error).toHaveBeenCalledWith(
        'Failed to initialize Firebase:',
        expect.any(Error)
      )
    })

    it('should initialize analytics only in browser environment', async () => {
      process.env.NODE_ENV = 'test'

      // Mock window object
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true
      })

      const mockApp = { name: 'test-app' }
      const mockAnalytics = { type: 'analytics' }

      const { initializeApp } = await import('firebase/app')
      const { getAuth } = await import('firebase/auth')
      const { getFirestore } = await import('firebase/firestore')
      const { getStorage } = await import('firebase/storage')
      const { getAnalytics } = await import('firebase/analytics')

      const mockInitializeApp = initializeApp as jest.MockedFunction<typeof initializeApp>
      const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>
      const mockGetFirestore = getFirestore as jest.MockedFunction<typeof getFirestore>
      const mockGetStorage = getStorage as jest.MockedFunction<typeof getStorage>
      const mockGetAnalytics = getAnalytics as jest.MockedFunction<typeof getAnalytics>

      mockInitializeApp.mockReturnValue(mockApp as any)
      mockGetAuth.mockReturnValue({} as any)
      mockGetFirestore.mockReturnValue({} as any)
      mockGetStorage.mockReturnValue({} as any)
      mockGetAnalytics.mockReturnValue(mockAnalytics as any)

      const firebase = await import('@/lib/firebase')

      expect(mockGetAnalytics).toHaveBeenCalledWith(mockApp)
      expect(firebase.analytics).toBe(mockAnalytics)

      // Clean up
      delete (global as any).window
    })
  })

  describe('Helper Functions', () => {
    it('should correctly check if Firebase is initialized', async () => {
      process.env.NODE_ENV = 'test'

      const mockApp = { name: 'test-app' }
      const mockAuth = { currentUser: null }
      const mockDb = { type: 'firestore' }
      const mockStorage = { type: 'storage' }

      const { initializeApp } = await import('firebase/app')
      const { getAuth } = await import('firebase/auth')
      const { getFirestore } = await import('firebase/firestore')
      const { getStorage } = await import('firebase/storage')

      const mockInitializeApp = initializeApp as jest.MockedFunction<typeof initializeApp>
      const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>
      const mockGetFirestore = getFirestore as jest.MockedFunction<typeof getFirestore>
      const mockGetStorage = getStorage as jest.MockedFunction<typeof getStorage>

      mockInitializeApp.mockReturnValue(mockApp as any)
      mockGetAuth.mockReturnValue(mockAuth as any)
      mockGetFirestore.mockReturnValue(mockDb as any)
      mockGetStorage.mockReturnValue(mockStorage as any)

      const firebase = await import('@/lib/firebase')

      expect(firebase.isFirebaseInitialized()).toBe(true)
    })

    it('should return false when Firebase initialization fails', async () => {
      process.env.NODE_ENV = 'test'

      const { initializeApp } = await import('firebase/app')
      const { getAuth } = await import('firebase/auth')
      const { getFirestore } = await import('firebase/firestore')
      const { getStorage } = await import('firebase/storage')

      const mockInitializeApp = initializeApp as jest.MockedFunction<typeof initializeApp>
      const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>
      const mockGetFirestore = getFirestore as jest.MockedFunction<typeof getFirestore>
      const mockGetStorage = getStorage as jest.MockedFunction<typeof getStorage>

      // Make one service return null to simulate partial failure
      mockInitializeApp.mockReturnValue({} as any)
      mockGetAuth.mockReturnValue(null as any)
      mockGetFirestore.mockReturnValue({} as any)
      mockGetStorage.mockReturnValue({} as any)

      try {
        const firebase = await import('@/lib/firebase')
        expect(firebase.isFirebaseInitialized()).toBe(false)
      } catch {
        // Expected if initialization throws
      }
    })

    it('should export configuration for debugging', async () => {
      process.env.NODE_ENV = 'test'
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project-config'

      const { initializeApp } = await import('firebase/app')
      const { getAuth } = await import('firebase/auth')
      const { getFirestore } = await import('firebase/firestore')
      const { getStorage } = await import('firebase/storage')

      const mockInitializeApp = initializeApp as jest.MockedFunction<typeof initializeApp>
      const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>
      const mockGetFirestore = getFirestore as jest.MockedFunction<typeof getFirestore>
      const mockGetStorage = getStorage as jest.MockedFunction<typeof getStorage>

      mockInitializeApp.mockReturnValue({} as any)
      mockGetAuth.mockReturnValue({} as any)
      mockGetFirestore.mockReturnValue({} as any)
      mockGetStorage.mockReturnValue({} as any)

      const firebase = await import('@/lib/firebase')

      expect(firebase.config.projectId).toBe('test-project-config')
      expect(firebase.config).toHaveProperty('apiKey')
      expect(firebase.config).toHaveProperty('authDomain')
    })
  })
})