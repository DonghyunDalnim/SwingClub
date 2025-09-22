/**
 * Lightweight authentication utilities for middleware
 * Edge Runtime compatible - no Firebase Admin SDK
 */

import { NextRequest } from 'next/server'

/**
 * Basic token validation for middleware
 * Only checks format and expiration, actual verification happens in server actions
 */
export function validateTokenFormat(token: string): { valid: boolean; exp?: number } {
  try {
    // Basic JWT format check
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false }
    }

    // Decode payload (base64url)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))

    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    const exp = payload.exp

    if (exp && now > exp) {
      return { valid: false }
    }

    return { valid: true, exp }
  } catch (error) {
    return { valid: false }
  }
}

/**
 * Extract token from request
 */
export function extractToken(request: NextRequest): string | null {
  // Check cookie first
  const cookieToken = request.cookies.get('__session')?.value
  if (cookieToken) {
    return cookieToken
  }

  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '')
  }

  return null
}

/**
 * Check if token is approaching expiration (within 5 minutes)
 */
export function isTokenExpiringSoon(exp: number): boolean {
  const now = Math.floor(Date.now() / 1000)
  const bufferTime = 300 // 5 minutes
  return now > (exp - bufferTime)
}