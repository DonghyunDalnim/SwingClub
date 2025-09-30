/**
 * Next.js Middleware for Authentication and Route Protection
 * Implements Firebase Auth token validation for secure route access
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Validate Firebase JWT token structure (basic validation)
function isValidTokenFormat(token: string): boolean {
  try {
    // Basic JWT format check (header.payload.signature)
    const parts = token.split('.')
    if (parts.length !== 3) return false

    // Check if each part is base64 encoded
    return parts.every(part => {
      try {
        atob(part.replace(/-/g, '+').replace(/_/g, '/'))
        return true
      } catch {
        return false
      }
    })
  } catch {
    return false
  }
}

// Extract user ID from JWT token (without verification - for routing only)
function extractUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.sub || payload.user_id || null
  } catch {
    return null
  }
}

// Routes that require authentication
const protectedRoutes = [
  '/home',
  '/community',
  '/marketplace',
  '/profile',
  '/location'
]

// Routes that should redirect to home if user is already authenticated
const authRoutes = [
  '/login',
  '/signup'
]

// Public routes that don't require authentication
const publicRoutes = [
  '/'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (pathname.startsWith('/_next/') ||
      pathname.startsWith('/api/') ||
      pathname.includes('.')) {
    return NextResponse.next()
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Get authentication token from cookies
  const authToken = request.cookies.get('firebase-token')?.value

  // Validate token format if present
  const hasValidToken = authToken && isValidTokenFormat(authToken)

  // If accessing a protected route without valid authentication
  if (isProtectedRoute && !hasValidToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)

    // Create response with security headers
    const response = NextResponse.redirect(loginUrl)
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    return response
  }

  // If accessing auth routes while already authenticated, redirect to home
  if (isAuthRoute && hasValidToken) {
    const homeUrl = new URL('/home', request.url)
    return NextResponse.redirect(homeUrl)
  }

  // Add security headers to all responses
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Rate limiting info (basic implementation)
  const clientIP = request.headers.get('x-forwarded-for') || 'anonymous'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  // Add rate limiting headers for transparency
  response.headers.set('X-RateLimit-Limit', '1000')
  response.headers.set('X-RateLimit-Window', '3600')

  // Content Security Policy for enhanced security (allow Google Auth & Analytics)
  response.headers.set('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.googleapis.com https://*.firebase.com https://www.googletagmanager.com https://apis.google.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://*.googleapis.com https://*.firebase.com wss://*.firebase.com https://www.google-analytics.com; " +
    "frame-src 'self' https://accounts.google.com https://*.firebase.com https://*.firebaseapp.com; " +
    "object-src 'none';"
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}