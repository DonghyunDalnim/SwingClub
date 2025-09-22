/**
 * Security utilities for rate limiting and security headers
 */

import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiting store
// In production, use Redis or similar distributed cache
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  windowMs: number  // Time window in milliseconds
  maxRequests: number  // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string
}

/**
 * Rate limiting middleware
 */
export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest): { success: boolean; reset: number; remaining: number } => {
    const key = config.keyGenerator ? config.keyGenerator(request) : getClientIdentifier(request)
    const now = Date.now()
    const window = config.windowMs

    // Clean up expired entries periodically
    if (Math.random() < 0.1) { // 10% chance to clean up
      cleanupExpiredEntries(now)
    }

    let entry = rateLimitStore.get(key)

    if (!entry || now > entry.resetTime) {
      // Create new window
      entry = {
        count: 1,
        resetTime: now + window
      }
      rateLimitStore.set(key, entry)

      return {
        success: true,
        reset: entry.resetTime,
        remaining: config.maxRequests - 1
      }
    }

    if (entry.count >= config.maxRequests) {
      return {
        success: false,
        reset: entry.resetTime,
        remaining: 0
      }
    }

    entry.count++
    rateLimitStore.set(key, entry)

    return {
      success: true,
      reset: entry.resetTime,
      remaining: config.maxRequests - entry.count
    }
  }
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'

  // Include user agent for better identification
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const userAgentHash = simpleHash(userAgent)

  return `${ip}-${userAgentHash}`
}

/**
 * Simple hash function for user agent
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(now: number): void {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.github.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com",
      "frame-src 'self' https://accounts.google.com",
      "form-action 'self'"
    ].join('; ')
  )

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // HSTS (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  return response
}

/**
 * Validate request origin for CSRF protection
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  if (!origin && !referer) {
    // Allow requests without origin/referer (e.g., same-origin requests)
    return true
  }

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'https://localhost:3000'
  ].filter(Boolean) as string[]

  if (origin) {
    return allowedOrigins.some(allowed => origin.startsWith(allowed))
  }

  if (referer) {
    return allowedOrigins.some(allowed => referer.startsWith(allowed))
  }

  return false
}

/**
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>\"']/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

/**
 * Check if request looks suspicious
 */
export function isSuspiciousRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || ''
  const pathname = request.nextUrl.pathname

  // Check for common bot patterns
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scanner/i,
    /curl/i,
    /wget/i
  ]

  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    return true
  }

  // Check for suspicious paths
  const suspiciousPaths = [
    '/admin',
    '/wp-admin',
    '/.env',
    '/config',
    '/backup',
    '/database'
  ]

  if (suspiciousPaths.some(path => pathname.includes(path))) {
    return true
  }

  // Check for SQL injection patterns in query params
  const searchParams = request.nextUrl.searchParams.toString()
  const sqlPatterns = [
    /union.*select/i,
    /drop.*table/i,
    /insert.*into/i,
    /delete.*from/i,
    /update.*set/i
  ]

  if (sqlPatterns.some(pattern => pattern.test(searchParams))) {
    return true
  }

  return false
}

/**
 * Security configuration for different endpoints
 */
export const securityConfig = {
  // API routes - stricter limits
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100 // 100 requests per 15 minutes
  },
  // Authentication routes - very strict
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10 // 10 requests per 15 minutes
  },
  // General routes - moderate limits
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 300 // 300 requests per 15 minutes
  }
} as const