/**
 * Next.js Middleware for Authentication and Route Protection
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(pathname)

  // For development, we'll skip actual auth check since Firebase needs to be properly configured
  // In production, you would check for auth token here

  // If accessing a protected route without being authenticated, redirect to login
  if (isProtectedRoute) {
    // TODO: Check actual authentication state when Firebase is configured
    // For now, we'll allow access but this should check for valid auth token

    // Example of what the auth check would look like:
    // const authToken = request.cookies.get('auth-token')?.value
    // if (!authToken || !isValidToken(authToken)) {
    //   const loginUrl = new URL('/login', request.url)
    //   loginUrl.searchParams.set('redirect', pathname)
    //   return NextResponse.redirect(loginUrl)
    // }
  }

  // If accessing auth routes while authenticated, redirect to home
  if (isAuthRoute) {
    // TODO: Check actual authentication state when Firebase is configured
    // For now, we'll allow access

    // Example of what the auth check would look like:
    // const authToken = request.cookies.get('auth-token')?.value
    // if (authToken && isValidToken(authToken)) {
    //   return NextResponse.redirect(new URL('/home', request.url))
    // }
  }

  // Allow the request to continue
  return NextResponse.next()
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