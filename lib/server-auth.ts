/**
 * Server-side authentication utilities for Next.js Server Actions and API Routes
 */

import { headers } from 'next/headers'
import { verifyIdToken, type DecodedIdToken } from './firebase-admin'

export interface AuthenticatedUser {
  uid: string
  email: string | undefined
  emailVerified: boolean
  decodedToken: DecodedIdToken
}

/**
 * Get authenticated user from Next.js headers in Server Actions or API Routes
 * This works with the middleware that adds user info to headers after token verification
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userEmail = headersList.get('x-user-email')
    const emailVerified = headersList.get('x-user-verified') === 'true'
    const authTime = headersList.get('x-auth-time')
    const tokenIssued = headersList.get('x-token-issued')

    if (userId && userEmail) {
      // Additional security validation
      const now = Math.floor(Date.now() / 1000)

      // Check if token is too old (24 hours)
      if (tokenIssued) {
        const issuedTime = parseInt(tokenIssued, 10)
        const maxAge = 24 * 60 * 60 // 24 hours in seconds

        if (now - issuedTime > maxAge) {
          console.warn('Token too old, rejecting authentication')
          return null
        }
      }

      // User info is already in headers from middleware verification
      return {
        uid: userId,
        email: userEmail,
        emailVerified,
        decodedToken: {
          uid: userId,
          email: userEmail,
          email_verified: emailVerified,
          auth_time: authTime ? parseInt(authTime, 10) : undefined,
          iat: tokenIssued ? parseInt(tokenIssued, 10) : undefined
        } as DecodedIdToken
      }
    }

    // Fallback: Try to get token from headers and verify it
    const authorization = headersList.get('authorization')
    const middlewareToken = headersList.get('x-auth-token')

    let token: string | null = null
    if (authorization?.startsWith('Bearer ')) {
      token = authorization.replace('Bearer ', '')
    } else if (middlewareToken) {
      token = middlewareToken
    }

    if (token) {
      const verificationResult = await verifyIdToken(token)

      if (verificationResult.success && verificationResult.decodedToken) {
        return {
          uid: verificationResult.decodedToken.uid,
          email: verificationResult.decodedToken.email,
          emailVerified: verificationResult.decodedToken.email_verified || false,
          decodedToken: verificationResult.decodedToken
        }
      }
    }

    return null
  } catch (error) {
    console.error('Failed to get authenticated user:', error)
    return null
  }
}

/**
 * Require authentication for Server Actions or API Routes
 * Throws an error if user is not authenticated
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error('Authentication required. User must be logged in to access this resource.')
  }

  return user
}

/**
 * Check if user has specific permissions
 * This is a placeholder for future role-based access control
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const user = await getAuthenticatedUser()

  if (!user) {
    return false
  }

  // TODO: Implement role-based permission checking
  // For now, all authenticated users have basic permissions
  const basicPermissions = ['read:posts', 'write:posts', 'read:studios', 'write:profile']

  return basicPermissions.includes(permission)
}

/**
 * Require specific permission for Server Actions or API Routes
 */
export async function requirePermission(permission: string): Promise<AuthenticatedUser> {
  const user = await requireAuth()
  const hasAccess = await hasPermission(permission)

  if (!hasAccess) {
    throw new Error(`Permission '${permission}' required. User does not have sufficient access.`)
  }

  return user
}

/**
 * Get user ID from authentication context
 * Useful for server actions that need user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getAuthenticatedUser()
  return user?.uid || null
}

/**
 * Check if current user is admin
 * This should be used in admin-only server actions
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getAuthenticatedUser()

  if (!user) {
    return false
  }

  // TODO: Implement proper admin role checking
  // This could check against a Firestore collection or custom claims
  // For now, return false as admin features aren't implemented
  return false
}

/**
 * Require admin access for Server Actions or API Routes
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireAuth()
  const adminAccess = await isAdmin()

  if (!adminAccess) {
    throw new Error('Admin access required. User does not have administrator privileges.')
  }

  return user
}

/**
 * Validate that the authenticated user can access a specific resource
 * This is useful for checking if a user can edit their own content
 */
export async function validateResourceAccess(resourceUserId: string): Promise<boolean> {
  const user = await getAuthenticatedUser()

  if (!user) {
    return false
  }

  // User can access their own resources
  if (user.uid === resourceUserId) {
    return true
  }

  // Admin can access any resource
  if (await isAdmin()) {
    return true
  }

  return false
}

/**
 * Require resource access for Server Actions or API Routes
 */
export async function requireResourceAccess(resourceUserId: string): Promise<AuthenticatedUser> {
  const user = await requireAuth()
  const hasAccess = await validateResourceAccess(resourceUserId)

  if (!hasAccess) {
    throw new Error('Access denied. User cannot access this resource.')
  }

  return user
}