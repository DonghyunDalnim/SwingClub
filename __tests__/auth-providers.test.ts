/**
 * Tests for Firebase authentication providers
 */

import {
  signInWithGoogle,
  signInWithKakao,
  signInWithNaver,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  updateUserProfile,
  getUserProfile
} from '../lib/auth/providers'

// Mock Firebase modules
jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: jest.fn(() => ({
    addScope: jest.fn()
  })),
  signInWithPopup: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn()
}))

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000 }))
}))

jest.mock('../lib/firebase', () => ({
  auth: {},
  db: {}
}))

// Import mocked functions
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'

const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<typeof signInWithPopup>
const mockSignInWithEmailAndPassword = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>
const mockCreateUserWithEmailAndPassword = createUserWithEmailAndPassword as jest.MockedFunction<typeof createUserWithEmailAndPassword>
const mockFirebaseSignOut = firebaseSignOut as jest.MockedFunction<typeof firebaseSignOut>
const mockDoc = doc as jest.MockedFunction<typeof doc>
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>

describe('Authentication Providers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockFirebaseUser = {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    metadata: {
      creationTime: '2023-01-01T00:00:00.000Z',
      lastSignInTime: '2023-01-01T00:00:00.000Z'
    }
  }

  const mockUserDocData = {
    profile: {
      nickname: 'Test User',
      danceLevel: 'beginner',
      location: 'Seoul',
      interests: ['swing']
    }
  }

  describe('Google Authentication', () => {
    it('should successfully sign in with Google', async () => {
      // Mock successful popup sign in
      mockSignInWithPopup.mockResolvedValue({
        user: mockFirebaseUser,
        credential: null,
        operationType: 'signIn',
        providerId: 'google.com'
      })

      // Mock Firestore operations
      mockDoc.mockReturnValue('mock-doc-ref' as any)
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false
      } as any)
      mockSetDoc.mockResolvedValue(undefined)
      mockGetDoc.mockResolvedValueOnce({
        data: () => mockUserDocData
      } as any)

      const result = await signInWithGoogle()

      expect(mockSignInWithPopup).toHaveBeenCalled()
      expect(mockSetDoc).toHaveBeenCalled()
      expect(result.id).toBe('test-user-id')
      expect(result.email).toBe('test@example.com')
      expect(result.provider).toBe('google')
    })

    it('should handle Google sign-in errors', async () => {
      mockSignInWithPopup.mockRejectedValue(new Error('popup-blocked'))

      await expect(signInWithGoogle()).rejects.toThrow('popup-blocked')
    })
  })

  describe('Kakao Authentication', () => {
    it('should throw not implemented error', async () => {
      await expect(signInWithKakao()).rejects.toThrow('kakao-not-implemented')
    })
  })

  describe('Naver Authentication', () => {
    it('should throw not implemented error', async () => {
      await expect(signInWithNaver()).rejects.toThrow('naver-not-implemented')
    })
  })

  describe('Email Authentication', () => {
    it('should successfully sign in with email and password', async () => {
      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockFirebaseUser,
        credential: null,
        operationType: 'signIn',
        providerId: 'password'
      })

      mockDoc.mockReturnValue('mock-doc-ref' as any)
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserDocData
      } as any)

      const result = await signInWithEmail('test@example.com', 'password123')

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith({}, 'test@example.com', 'password123')
      expect(result.provider).toBe('email')
    })

    it('should handle email sign-in errors', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue(new Error('wrong-password'))

      await expect(signInWithEmail('test@example.com', 'wrong')).rejects.toThrow('wrong-password')
    })

    it('should successfully sign up with email and password', async () => {
      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockFirebaseUser,
        credential: null,
        operationType: 'signIn',
        providerId: 'password'
      })

      mockDoc.mockReturnValue('mock-doc-ref' as any)
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false
      } as any)
      mockSetDoc.mockResolvedValue(undefined)
      mockGetDoc.mockResolvedValueOnce({
        data: () => mockUserDocData
      } as any)

      const profile = {
        nickname: 'New User',
        danceLevel: 'beginner' as const,
        location: 'Seoul'
      }

      const result = await signUpWithEmail('new@example.com', 'password123', profile)

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith({}, 'new@example.com', 'password123')
      expect(result.provider).toBe('email')
    })
  })

  describe('Sign Out', () => {
    it('should successfully sign out', async () => {
      mockFirebaseSignOut.mockResolvedValue(undefined)

      await signOut()

      expect(mockFirebaseSignOut).toHaveBeenCalled()
    })

    it('should handle sign out errors', async () => {
      mockFirebaseSignOut.mockRejectedValue(new Error('signout-failed'))

      await expect(signOut()).rejects.toThrow('signout-failed')
    })
  })

  describe('Profile Management', () => {
    it('should update user profile', async () => {
      mockDoc.mockReturnValue('mock-doc-ref' as any)
      mockUpdateDoc.mockResolvedValue(undefined)

      const profileUpdate = {
        nickname: 'Updated Name',
        bio: 'New bio'
      }

      await updateUserProfile('test-user-id', profileUpdate)

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        profile: profileUpdate,
        updatedAt: expect.any(Object)
      })
    })

    it('should get user profile', async () => {
      mockDoc.mockReturnValue('mock-doc-ref' as any)
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserDocData
      } as any)

      const profile = await getUserProfile('test-user-id')

      expect(profile).toEqual(mockUserDocData.profile)
    })

    it('should return null for non-existent profile', async () => {
      mockDoc.mockReturnValue('mock-doc-ref' as any)
      mockGetDoc.mockResolvedValue({
        exists: () => false
      } as any)

      const profile = await getUserProfile('non-existent-id')

      expect(profile).toBeNull()
    })
  })

  describe('User Document Creation', () => {
    it('should create new user document for new users', async () => {
      mockSignInWithPopup.mockResolvedValue({
        user: mockFirebaseUser,
        credential: null,
        operationType: 'signIn',
        providerId: 'google.com'
      })

      mockDoc.mockReturnValue('mock-doc-ref' as any)
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false // New user
      } as any)
      mockSetDoc.mockResolvedValue(undefined)
      mockGetDoc.mockResolvedValueOnce({
        data: () => ({
          ...mockFirebaseUser,
          profile: {
            nickname: 'Test User',
            danceLevel: 'beginner',
            location: '',
            interests: []
          }
        })
      } as any)

      await signInWithGoogle()

      expect(mockSetDoc).toHaveBeenCalledWith('mock-doc-ref', expect.objectContaining({
        id: 'test-user-id',
        email: 'test@example.com',
        provider: 'google',
        profile: expect.objectContaining({
          nickname: 'Test User',
          danceLevel: 'beginner'
        })
      }))
    })

    it('should update existing user document for returning users', async () => {
      mockSignInWithPopup.mockResolvedValue({
        user: mockFirebaseUser,
        credential: null,
        operationType: 'signIn',
        providerId: 'google.com'
      })

      mockDoc.mockReturnValue('mock-doc-ref' as any)
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true // Existing user
      } as any)
      mockUpdateDoc.mockResolvedValue(undefined)
      mockGetDoc.mockResolvedValueOnce({
        data: () => mockUserDocData
      } as any)

      await signInWithGoogle()

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        lastLoginAt: expect.any(Object)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockSignInWithPopup.mockRejectedValue({ code: 'auth/network-request-failed' })

      await expect(signInWithGoogle()).rejects.toThrow('auth/network-request-failed')
    })

    it('should handle popup blocked errors', async () => {
      mockSignInWithPopup.mockRejectedValue({ code: 'auth/popup-blocked' })

      await expect(signInWithGoogle()).rejects.toThrow('auth/popup-blocked')
    })

    it('should handle Firestore errors', async () => {
      mockSignInWithPopup.mockResolvedValue({
        user: mockFirebaseUser,
        credential: null,
        operationType: 'signIn',
        providerId: 'google.com'
      })

      mockDoc.mockReturnValue('mock-doc-ref' as any)
      mockGetDoc.mockRejectedValue(new Error('firestore-error'))

      await expect(signInWithGoogle()).rejects.toThrow('firestore-error')
    })
  })
})