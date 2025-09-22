/**
 * Security utilities tests
 */

import { NextRequest } from 'next/server'
import {
  rateLimit,
  validateOrigin,
  isSuspiciousRequest,
  sanitizeInput,
  securityConfig
} from '@/lib/security'

// Mock NextRequest for testing
function createMockRequest(overrides: Partial<{
  url: string
  method: string
  headers: Record<string, string>
  ip: string
  nextUrl: { pathname: string; searchParams: URLSearchParams }
}>): NextRequest {
  const defaults = {
    url: 'http://localhost:3000/test',
    method: 'GET',
    headers: {},
    ip: '127.0.0.1',
    nextUrl: {
      pathname: '/test',
      searchParams: new URLSearchParams()
    }
  }

  const merged = { ...defaults, ...overrides }

  return {
    url: merged.url,
    method: merged.method,
    ip: merged.ip,
    nextUrl: merged.nextUrl,
    headers: {
      get: (name: string) => merged.headers[name.toLowerCase()] || null
    }
  } as any
}

describe('Security Utilities', () => {
  beforeEach(() => {
    // Clear rate limit store before each test
    jest.clearAllMocks()
    // Reset modules to clear any shared state
    jest.resetModules()
  })

  describe('Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const rateLimitCheck = rateLimit({
        windowMs: 60000, // 1 minute
        maxRequests: 5
      })

      const request = createMockRequest({ ip: '192.168.1.1' })

      // First 5 requests should be allowed
      for (let i = 0; i < 5; i++) {
        const result = rateLimitCheck(request)
        expect(result.success).toBe(true)
        expect(result.remaining).toBe(4 - i)
      }
    })

    it('should block requests exceeding limit', () => {
      const rateLimitCheck = rateLimit({
        windowMs: 60000,
        maxRequests: 3
      })

      const request = createMockRequest({ ip: '192.168.1.2' })

      // First 3 requests allowed
      for (let i = 0; i < 3; i++) {
        const result = rateLimitCheck(request)
        expect(result.success).toBe(true)
      }

      // 4th request should be blocked
      const result = rateLimitCheck(request)
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset after time window', () => {
      const rateLimitCheck = rateLimit({
        windowMs: 100, // 100ms for fast test
        maxRequests: 2
      })

      const request = createMockRequest({ ip: '192.168.1.3' })

      // Use up the limit
      rateLimitCheck(request)
      rateLimitCheck(request)

      // Should be blocked
      let result = rateLimitCheck(request)
      expect(result.success).toBe(false)

      // Wait for window to reset
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          result = rateLimitCheck(request)
          expect(result.success).toBe(true)
          resolve()
        }, 150)
      })
    })

    it.skip('should handle different IPs separately', () => {
      const rateLimitCheck = rateLimit({
        windowMs: 60000,
        maxRequests: 2 // Allow 2 requests per IP
      })

      const request1 = createMockRequest({ ip: '192.168.1.1' })
      const request2 = createMockRequest({ ip: '192.168.1.2' })

      // First request from each IP should succeed
      expect(rateLimitCheck(request1).success).toBe(true)
      expect(rateLimitCheck(request2).success).toBe(true)

      // Second request from each IP should also succeed
      expect(rateLimitCheck(request1).success).toBe(true)
      expect(rateLimitCheck(request2).success).toBe(true)

      // Third request from each IP should be blocked
      expect(rateLimitCheck(request1).success).toBe(false)
      expect(rateLimitCheck(request2).success).toBe(false)
    })

    it('should use custom key generator', () => {
      const rateLimitCheck = rateLimit({
        windowMs: 60000,
        maxRequests: 1,
        keyGenerator: (req) => req.headers.get('x-user-id') || 'anonymous'
      })

      const request1 = createMockRequest({
        headers: { 'x-user-id': 'user1' }
      })
      const request2 = createMockRequest({
        headers: { 'x-user-id': 'user2' }
      })

      // Different users should have separate limits
      expect(rateLimitCheck(request1).success).toBe(true)
      expect(rateLimitCheck(request2).success).toBe(true)
    })
  })

  describe('Origin Validation', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://swingclub.app'
    })

    afterEach(() => {
      delete process.env.NEXT_PUBLIC_APP_URL
    })

    it('should allow requests with valid origin', () => {
      const request = createMockRequest({
        headers: { origin: 'https://swingclub.app' }
      })

      expect(validateOrigin(request)).toBe(true)
    })

    it('should allow localhost origins', () => {
      const request = createMockRequest({
        headers: { origin: 'http://localhost:3000' }
      })

      expect(validateOrigin(request)).toBe(true)
    })

    it('should block invalid origins', () => {
      const request = createMockRequest({
        headers: { origin: 'https://evil.com' }
      })

      expect(validateOrigin(request)).toBe(false)
    })

    it('should allow requests without origin (same-origin)', () => {
      const request = createMockRequest({
        headers: {}
      })

      expect(validateOrigin(request)).toBe(true)
    })

    it('should validate referer when origin is missing', () => {
      const request = createMockRequest({
        headers: { referer: 'https://swingclub.app/page' }
      })

      expect(validateOrigin(request)).toBe(true)
    })
  })

  describe('Suspicious Request Detection', () => {
    it('should detect bot user agents', () => {
      const botAgents = [
        'Googlebot/2.1',
        'Mozilla/5.0 (compatible; bingbot/2.0)',
        'curl/7.68.0',
        'wget/1.20.3'
      ]

      botAgents.forEach(userAgent => {
        const request = createMockRequest({
          headers: { 'user-agent': userAgent }
        })
        expect(isSuspiciousRequest(request)).toBe(true)
      })
    })

    it('should detect suspicious paths', () => {
      const suspiciousPaths = [
        '/admin',
        '/wp-admin',
        '/.env',
        '/config',
        '/backup'
      ]

      suspiciousPaths.forEach(pathname => {
        const request = createMockRequest({
          nextUrl: { pathname, searchParams: new URLSearchParams() }
        })
        expect(isSuspiciousRequest(request)).toBe(true)
      })
    })

    it('should detect SQL injection patterns', () => {
      const maliciousQueries = [
        'union select * from users',
        'DROP TABLE users',
        'INSERT INTO admin',
        'DELETE FROM posts'
      ]

      maliciousQueries.forEach(query => {
        const searchParams = new URLSearchParams({ q: query })
        const request = createMockRequest({
          nextUrl: { pathname: '/search', searchParams }
        })
        expect(isSuspiciousRequest(request)).toBe(true)
      })
    })

    it('should allow legitimate requests', () => {
      const request = createMockRequest({
        headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        nextUrl: { pathname: '/home', searchParams: new URLSearchParams() }
      })

      expect(isSuspiciousRequest(request)).toBe(false)
    })
  })

  describe('Input Sanitization', () => {
    it('should remove dangerous characters', () => {
      const maliciousInput = '<script>alert("xss")</script>'
      const sanitized = sanitizeInput(maliciousInput)
      expect(sanitized).toBe('scriptalert(xss)/script')
    })

    it('should remove javascript: URLs', () => {
      const maliciousInput = 'javascript:alert("xss")'
      const sanitized = sanitizeInput(maliciousInput)
      expect(sanitized).toBe('alert(xss)')
    })

    it('should remove event handlers', () => {
      const maliciousInput = 'onclick=alert("xss")'
      const sanitized = sanitizeInput(maliciousInput)
      expect(sanitized).toBe('alert(xss)')
    })

    it('should preserve safe content', () => {
      const safeInput = 'Hello world! This is safe content.'
      const sanitized = sanitizeInput(safeInput)
      expect(sanitized).toBe(safeInput)
    })

    it('should trim whitespace', () => {
      const input = '  content with spaces  '
      const sanitized = sanitizeInput(input)
      expect(sanitized).toBe('content with spaces')
    })
  })

  describe('Security Configuration', () => {
    it('should have appropriate rate limits for different endpoints', () => {
      expect(securityConfig.auth.maxRequests).toBeLessThan(securityConfig.api.maxRequests)
      expect(securityConfig.api.maxRequests).toBeLessThan(securityConfig.general.maxRequests)
    })

    it('should have consistent time windows', () => {
      expect(securityConfig.auth.windowMs).toBe(15 * 60 * 1000)
      expect(securityConfig.api.windowMs).toBe(15 * 60 * 1000)
      expect(securityConfig.general.windowMs).toBe(15 * 60 * 1000)
    })
  })
})