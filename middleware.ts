/**
 * Next.js Middleware for Authentication and Route Protection
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit, addSecurityHeaders, validateOrigin, isSuspiciousRequest, securityConfig } from './lib/security'
import { validateTokenFormat, extractToken, isTokenExpiringSoon } from './lib/middleware-auth'

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Security checks first
  if (isSuspiciousRequest(request)) {
    console.warn('Suspicious request detected:', {
      pathname,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    })
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Validate origin for non-GET requests
  if (request.method !== 'GET' && !validateOrigin(request)) {
    console.warn('Invalid origin detected:', {
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      pathname
    })
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Apply rate limiting based on route type
  let rateLimitConfig: { windowMs: number; maxRequests: number } = securityConfig.general
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    rateLimitConfig = securityConfig.auth
  } else if (pathname.startsWith('/api/')) {
    rateLimitConfig = securityConfig.api
  }

  const rateLimitCheck = rateLimit(rateLimitConfig)
  const rateLimitResult = rateLimitCheck(request)

  if (!rateLimitResult.success) {
    console.warn('Rate limit exceeded:', {
      pathname,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      reset: new Date(rateLimitResult.reset).toISOString()
    })

    const response = new NextResponse('Too Many Requests', { status: 429 })
    response.headers.set('Retry-After', Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())
    return addSecurityHeaders(response)
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(pathname)

  // Check authentication for protected routes
  if (isProtectedRoute) {
    const authToken = extractToken(request)

    if (!authToken) {
      console.warn(`Unauthorized access attempt to ${pathname}`)
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Basic token format validation (Edge Runtime compatible)
    const tokenValidation = validateTokenFormat(authToken)

    if (!tokenValidation.valid) {
      console.warn('Invalid token format detected:', {
        pathname,
        userIP: request.headers.get('x-forwarded-for') || 'unknown',
        timestamp: new Date().toISOString()
      })

      // Clear invalid token
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('__session')
      return response
    }

    // Check if token is expiring soon
    if (tokenValidation.exp && isTokenExpiringSoon(tokenValidation.exp)) {
      console.warn('Token approaching expiration, redirecting to refresh')
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      loginUrl.searchParams.set('refresh', 'true')
      return NextResponse.redirect(loginUrl)
    }

    // Token format is valid, pass it along for server-side verification
    // Server actions will do the actual Firebase verification
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-auth-token', authToken)

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute) {
    const authToken = extractToken(request)

    if (authToken) {
      const tokenValidation = validateTokenFormat(authToken)

      if (tokenValidation.valid) {
        // User has a valid token format, redirect to home
        // Full verification will happen on the server side
        return NextResponse.redirect(new URL('/home', request.url))
      }
      // If token format is invalid, let them access auth routes to re-authenticate
    }
  }

  // Allow the request to continue with security headers
  const response = NextResponse.next()

  // Add rate limit headers to all responses
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
  response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())

  return addSecurityHeaders(response)
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