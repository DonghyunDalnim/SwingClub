/**
 * Authentication utility functions for Swing Connect
 */

import type { AuthProvider, DanceLevel } from '../types/auth'

// Check if a route requires authentication
export const isProtectedRoute = (pathname: string): boolean => {
  const protectedRoutes = [
    '/home',
    '/community',
    '/marketplace',
    '/profile',
    '/location'
  ]

  return protectedRoutes.some(route => pathname.startsWith(route))
}

// Check if a route is public (doesn't require authentication)
export const isPublicRoute = (pathname: string): boolean => {
  const publicRoutes = [
    '/login',
    '/signup',
    '/'
  ]

  return publicRoutes.includes(pathname)
}

// Get redirect URL after authentication
export const getRedirectUrl = (intended?: string): string => {
  if (intended && isProtectedRoute(intended)) {
    return intended
  }
  return '/home' // Default redirect to home page
}

// Format provider name for display
export const formatProviderName = (provider: AuthProvider): string => {
  const providerNames = {
    google: '구글',
    kakao: '카카오톡',
    naver: '네이버',
    email: '이메일'
  }

  return providerNames[provider] || provider
}

// Format dance level for display
export const formatDanceLevel = (level: DanceLevel): string => {
  const levelNames = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급',
    professional: '전문가'
  }

  return levelNames[level] || level
}

// Get dance level options for forms
export const getDanceLevelOptions = () => [
  { value: 'beginner', label: '초급' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' },
  { value: 'professional', label: '전문가' }
]

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (password.length < 6) {
    errors.push('비밀번호는 6자리 이상이어야 합니다')
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push('비밀번호에 영문자를 포함해야 합니다')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('비밀번호에 숫자를 포함해야 합니다')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Generate user display name
export const generateDisplayName = (email: string, provider: AuthProvider): string => {
  if (provider === 'email') {
    return email.split('@')[0]
  }
  return `${formatProviderName(provider)} 사용자`
}

// Get provider icon emoji
export const getProviderIcon = (provider: AuthProvider): string => {
  const icons = {
    google: '🔵',
    kakao: '🟡',
    naver: '🟢',
    email: '📧'
  }

  return icons[provider] || '👤'
}

// Check if user profile is complete
export const isProfileComplete = (profile: any): boolean => {
  if (!profile) return false

  return !!(
    profile.nickname &&
    profile.danceLevel &&
    profile.location
  )
}

// Generate profile completion percentage
export const getProfileCompletionPercentage = (profile: any): number => {
  if (!profile) return 0

  const fields = [
    'nickname',
    'danceLevel',
    'location',
    'bio',
    'interests'
  ]

  const completedFields = fields.filter(field => {
    const value = profile[field]
    if (Array.isArray(value)) {
      return value.length > 0
    }
    return !!value
  }).length

  return Math.round((completedFields / fields.length) * 100)
}