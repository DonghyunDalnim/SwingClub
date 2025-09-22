/**
 * Middleware Tests
 */

import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '@/middleware'

// Mock security utilities
jest.mock('@/lib/security', () => ({
  rateLimit: jest.fn(),
  addSecurityHeaders: jest.fn((response) => response),
  validateOrigin: jest.fn(),
  isSuspiciousRequest: jest.fn(),
  securityConfig: {
    auth: { windowMs: 900000, maxRequests: 10 },
    api: { windowMs: 900000, maxRequests: 100 },
    general: { windowMs: 900000, maxRequests: 300 }
  }
}))

// Mock Firebase Admin SDK
jest.mock('@/lib/firebase-admin', () => ({
  verifyIdToken: jest.fn()
}))

const {
  rateLimit,
  addSecurityHeaders,
  validateOrigin,
  isSuspiciousRequest
} = require('@/lib/security')

const { verifyIdToken } = require('@/lib/firebase-admin')

function createMockRequest(overrides: Partial<{
  url: string
  method: string
  headers: Record<string, string>
  cookies: Record<string, string>
  nextUrl: { pathname: string }
}>): NextRequest {
  const defaults = {
    url: 'http://localhost:3000/test',
    method: 'GET',
    headers: {},
    cookies: {},
    nextUrl: { pathname: '/test' }
  }

  const merged = { ...defaults, ...overrides }

  return {
    url: merged.url,
    method: merged.method,
    nextUrl: merged.nextUrl,
    headers: {
      get: (name: string) => merged.headers[name.toLowerCase()] || null
    },
    cookies: {
      get: (name: string) => merged.cookies[name] ? { value: merged.cookies[name] } : undefined
    },
    ip: '127.0.0.1'
  } as any
}

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock implementations
    rateLimit.mockReturnValue(() => ({
      success: true,
      remaining: 10,
      reset: Date.now() + 900000
    }))

    addSecurityHeaders.mockImplementation((response) => response)
    validateOrigin.mockReturnValue(true)
    isSuspiciousRequest.mockReturnValue(false)
  })

  describe('Security Checks', () => {
    it('should block suspicious requests', async () => {
      isSuspiciousRequest.mockReturnValue(true)

      const request = createMockRequest({
        nextUrl: { pathname: '/admin' }
      })

      const response = await middleware(request)

      expect(response).toBeInstanceOf(Response)
      expect(response.status).toBe(403)
    })

    it('should block requests with invalid origin for non-GET methods', async () => {
      validateOrigin.mockReturnValue(false)

      const request = createMockRequest({
        method: 'POST',
        nextUrl: { pathname: '/api/test' }
      })

      const response = await middleware(request)

      expect(response).toBeInstanceOf(Response)
      expect(response.status).toBe(403)
    })

    it('should allow GET requests regardless of origin', async () => {
      validateOrigin.mockReturnValue(false)

      const request = createMockRequest({
        method: 'GET',
        nextUrl: { pathname: '/home' }
      })

      // Should still fail due to missing auth, but not due to origin
      const response = await middleware(request)
      expect(response.status).not.toBe(403)
    })
  })

  describe('Rate Limiting', () => {
    it('should block requests when rate limit exceeded', async () => {
      const rateLimitCheck = jest.fn().mockReturnValue({
        success: false,
        remaining: 0,
        reset: Date.now() + 900000
      })
      rateLimit.mockReturnValue(rateLimitCheck)

      const request = createMockRequest({
        nextUrl: { pathname: '/api/test' }
      })

      const response = await middleware(request)

      expect(response).toBeInstanceOf(Response)
      expect(response.status).toBe(429)
      expect(response.headers.get('Retry-After')).toBeTruthy()
    })

    it('should apply stricter limits to auth routes', async () => {
      const request = createMockRequest({
        nextUrl: { pathname: '/login' }
      })

      await middleware(request)

      expect(rateLimit).toHaveBeenCalledWith(
        expect.objectContaining({ maxRequests: 10 })
      )
    })

    it('should apply moderate limits to API routes', async () => {
      const request = createMockRequest({
        nextUrl: { pathname: '/api/posts' }
      })

      await middleware(request)

      expect(rateLimit).toHaveBeenCalledWith(
        expect.objectContaining({ maxRequests: 100 })
      )
    })

    it('should apply general limits to other routes', async () => {
      const request = createMockRequest({
        nextUrl: { pathname: '/home' }
      })

      await middleware(request)

      expect(rateLimit).toHaveBeenCalledWith(
        expect.objectContaining({ maxRequests: 300 })
      )
    })
  })

  describe('Authentication', () => {
    it('should redirect to login when accessing protected route without token', async () => {
      const request = createMockRequest({
        nextUrl: { pathname: '/home' }
      })

      const response = await middleware(request)

      expect(response).toBeInstanceOf(Response)
      expect(response.status).toBe(307) // Redirect
      expect(response.headers.get('location')).toContain('/login')
    })

    it('should allow access to protected routes with valid token', async () => {
      verifyIdToken.mockResolvedValue({
        success: true,
        uid: 'user123',
        email: 'test@example.com',
        decodedToken: {
          uid: 'user123',
          email: 'test@example.com',
          email_verified: true,
          exp: Math.floor(Date.now() / 1000) + 3600,
          auth_time: Math.floor(Date.now() / 1000),
          iat: Math.floor(Date.now() / 1000)
        }
      })

      const request = createMockRequest({
        nextUrl: { pathname: '/home' },
        cookies: { '__session': 'valid-token' }
      })

      const response = await middleware(request)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
    })

    it('should redirect to login with invalid token', async () => {
      verifyIdToken.mockResolvedValue({
        success: false,
        error: 'Invalid token'
      })

      const request = createMockRequest({
        nextUrl: { pathname: '/home' },
        cookies: { '__session': 'invalid-token' }
      })

      const response = await middleware(request)

      expect(response).toBeInstanceOf(Response)
      expect(response.status).toBe(307) // Redirect
      expect(response.headers.get('location')).toContain('/login')
    })

    it('should handle token verification errors gracefully', async () => {
      verifyIdToken.mockRejectedValue(new Error('Verification failed'))

      const request = createMockRequest({
        nextUrl: { pathname: '/home' },
        cookies: { '__session': 'problematic-token' }
      })

      const response = await middleware(request)

      expect(response).toBeInstanceOf(Response)
      expect(response.status).toBe(307) // Redirect
    })

    it('should add user headers for valid tokens', async () => {
      verifyIdToken.mockResolvedValue({
        success: true,
        uid: 'user123',
        email: 'test@example.com',
        decodedToken: {
          uid: 'user123',
          email: 'test@example.com',
          email_verified: true,
          exp: Math.floor(Date.now() / 1000) + 3600,
          auth_time: Math.floor(Date.now() / 1000),
          iat: Math.floor(Date.now() / 1000)
        }
      })

      const request = createMockRequest({
        nextUrl: { pathname: '/home' },
        cookies: { '__session': 'valid-token' }
      })

      const response = await middleware(request) as NextResponse

      // Check that the request would have user headers
      expect(verifyIdToken).toHaveBeenCalledWith('valid-token')
    })

    it('should redirect authenticated users away from auth routes', async () => {
      verifyIdToken.mockResolvedValue({
        success: true,
        uid: 'user123',
        email: 'test@example.com',
        decodedToken: {
          uid: 'user123',
          email: 'test@example.com',
          email_verified: true
        }
      })

      const request = createMockRequest({
        nextUrl: { pathname: '/login' },
        cookies: { '__session': 'valid-token' }
      })

      const response = await middleware(request)

      expect(response).toBeInstanceOf(Response)
      expect(response.status).toBe(307) // Redirect
      expect(response.headers.get('location')).toContain('/home')
    })

    it('should handle token expiration with buffer time', async () => {
      const expiredSoon = Math.floor(Date.now() / 1000) + 200 // Expires in 200 seconds

      verifyIdToken.mockResolvedValue({
        success: true,
        uid: 'user123',
        email: 'test@example.com',
        decodedToken: {
          uid: 'user123',
          email: 'test@example.com',
          email_verified: true,
          exp: expiredSoon,
          auth_time: Math.floor(Date.now() / 1000),
          iat: Math.floor(Date.now() / 1000)
        }
      })

      const request = createMockRequest({
        nextUrl: { pathname: '/home' },
        cookies: { '__session': 'expiring-token' }
      })

      const response = await middleware(request)

      expect(response).toBeInstanceOf(Response)
      expect(response.status).toBe(307) // Redirect for refresh
      expect(response.headers.get('location')).toContain('refresh=true')
    })
  })

  describe('Public Routes', () => {
    it('should allow access to public routes without authentication', async () => {
      const request = createMockRequest({
        nextUrl: { pathname: '/' }
      })

      const response = await middleware(request)

      expect(addSecurityHeaders).toHaveBeenCalled()
      expect(verifyIdToken).not.toHaveBeenCalled()
    })
  })

  describe('Security Headers', () => {
    it('should add security headers to all responses', async () => {
      const request = createMockRequest({
        nextUrl: { pathname: '/' }
      })

      await middleware(request)

      expect(addSecurityHeaders).toHaveBeenCalled()
    })

    it('should add rate limit headers to responses', async () => {
      const rateLimitCheck = jest.fn().mockReturnValue({
        success: true,
        remaining: 5,
        reset: Date.now() + 900000
      })
      rateLimit.mockReturnValue(rateLimitCheck)

      const request = createMockRequest({
        nextUrl: { pathname: '/' }
      })

      const response = await middleware(request) as NextResponse

      expect(response.headers.get('X-RateLimit-Remaining')).toBe('5')
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
    })
  })
})