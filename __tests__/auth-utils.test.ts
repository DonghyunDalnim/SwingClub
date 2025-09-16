/**
 * Tests for authentication utility functions
 */

import {
  isProtectedRoute,
  isPublicRoute,
  getRedirectUrl,
  formatProviderName,
  formatDanceLevel,
  getDanceLevelOptions,
  isValidEmail,
  validatePassword,
  generateDisplayName,
  getProviderIcon,
  isProfileComplete,
  getProfileCompletionPercentage
} from '../lib/auth/utils'

describe('Authentication Utils', () => {
  describe('Route Protection', () => {
    it('should identify protected routes correctly', () => {
      expect(isProtectedRoute('/home')).toBe(true)
      expect(isProtectedRoute('/community')).toBe(true)
      expect(isProtectedRoute('/marketplace')).toBe(true)
      expect(isProtectedRoute('/profile')).toBe(true)
      expect(isProtectedRoute('/location')).toBe(true)
      expect(isProtectedRoute('/home/sub-page')).toBe(true)

      expect(isProtectedRoute('/login')).toBe(false)
      expect(isProtectedRoute('/')).toBe(false)
      expect(isProtectedRoute('/api/auth')).toBe(false)
    })

    it('should identify public routes correctly', () => {
      expect(isPublicRoute('/')).toBe(true)
      expect(isPublicRoute('/login')).toBe(true)
      expect(isPublicRoute('/signup')).toBe(true)

      expect(isPublicRoute('/home')).toBe(false)
      expect(isPublicRoute('/profile')).toBe(false)
    })

    it('should generate correct redirect URLs', () => {
      expect(getRedirectUrl('/home')).toBe('/home')
      expect(getRedirectUrl('/community')).toBe('/community')
      expect(getRedirectUrl('/login')).toBe('/home') // Public route defaults to home
      expect(getRedirectUrl()).toBe('/home') // No intended route defaults to home
      expect(getRedirectUrl('/api/test')).toBe('/home') // Non-protected route defaults to home
    })
  })

  describe('Provider Formatting', () => {
    it('should format provider names in Korean', () => {
      expect(formatProviderName('google')).toBe('구글')
      expect(formatProviderName('kakao')).toBe('카카오톡')
      expect(formatProviderName('naver')).toBe('네이버')
      expect(formatProviderName('email')).toBe('이메일')
      expect(formatProviderName('unknown' as any)).toBe('unknown')
    })

    it('should format dance levels in Korean', () => {
      expect(formatDanceLevel('beginner')).toBe('초급')
      expect(formatDanceLevel('intermediate')).toBe('중급')
      expect(formatDanceLevel('advanced')).toBe('고급')
      expect(formatDanceLevel('professional')).toBe('전문가')
      expect(formatDanceLevel('unknown' as any)).toBe('unknown')
    })

    it('should return dance level options', () => {
      const options = getDanceLevelOptions()
      expect(options).toEqual([
        { value: 'beginner', label: '초급' },
        { value: 'intermediate', label: '중급' },
        { value: 'advanced', label: '고급' },
        { value: 'professional', label: '전문가' }
      ])
    })

    it('should get provider icons', () => {
      expect(getProviderIcon('google')).toBe('🔵')
      expect(getProviderIcon('kakao')).toBe('🟡')
      expect(getProviderIcon('naver')).toBe('🟢')
      expect(getProviderIcon('email')).toBe('📧')
      expect(getProviderIcon('unknown' as any)).toBe('👤')
    })
  })

  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.kr')).toBe(true)
      expect(isValidEmail('test+tag@gmail.com')).toBe(true)
      expect(isValidEmail('123@test.org')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('user@domain')).toBe(false)
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail('user name@domain.com')).toBe(false)
    })
  })

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('password123')
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should validate password with uppercase', () => {
      const result = validatePassword('Password123')
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject passwords that are too short', () => {
      const result = validatePassword('12345')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('비밀번호는 6자리 이상이어야 합니다')
    })

    it('should reject passwords without letters', () => {
      const result = validatePassword('123456')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('비밀번호에 영문자를 포함해야 합니다')
    })

    it('should reject passwords without numbers', () => {
      const result = validatePassword('password')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('비밀번호에 숫자를 포함해야 합니다')
    })

    it('should return multiple errors for very weak passwords', () => {
      const result = validatePassword('abc')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('비밀번호는 6자리 이상이어야 합니다')
      expect(result.errors).toContain('비밀번호에 숫자를 포함해야 합니다')
    })
  })

  describe('Display Name Generation', () => {
    it('should generate display name from email for email provider', () => {
      expect(generateDisplayName('test@example.com', 'email')).toBe('test')
      expect(generateDisplayName('user.name@domain.co.kr', 'email')).toBe('user.name')
    })

    it('should generate display name for social providers', () => {
      expect(generateDisplayName('test@example.com', 'google')).toBe('구글 사용자')
      expect(generateDisplayName('test@example.com', 'kakao')).toBe('카카오톡 사용자')
      expect(generateDisplayName('test@example.com', 'naver')).toBe('네이버 사용자')
    })
  })

  describe('Profile Completion', () => {
    const completeProfile = {
      nickname: 'Test User',
      danceLevel: 'beginner',
      location: 'Seoul',
      bio: 'I love swing dance',
      interests: ['swing', 'lindy hop']
    }

    const incompleteProfile = {
      nickname: 'Test User',
      danceLevel: 'beginner'
      // Missing location
    }

    it('should identify complete profiles', () => {
      expect(isProfileComplete(completeProfile)).toBe(true)
    })

    it('should identify incomplete profiles', () => {
      expect(isProfileComplete(incompleteProfile)).toBe(false)
      expect(isProfileComplete(null)).toBe(false)
      expect(isProfileComplete(undefined)).toBe(false)
    })

    it('should calculate profile completion percentage', () => {
      expect(getProfileCompletionPercentage(completeProfile)).toBe(100)
      expect(getProfileCompletionPercentage(incompleteProfile)).toBe(40) // 2 out of 5 fields
      expect(getProfileCompletionPercentage(null)).toBe(0)
      expect(getProfileCompletionPercentage(undefined)).toBe(0)
    })

    it('should handle empty arrays in profile completion', () => {
      const profileWithEmptyInterests = {
        nickname: 'Test User',
        danceLevel: 'beginner',
        location: 'Seoul',
        bio: 'I love swing dance',
        interests: [] // Empty array
      }

      expect(getProfileCompletionPercentage(profileWithEmptyInterests)).toBe(80) // 4 out of 5 fields
    })

    it('should handle profiles with only required fields', () => {
      const minimalProfile = {
        nickname: 'Test User',
        danceLevel: 'beginner',
        location: 'Seoul'
      }

      expect(isProfileComplete(minimalProfile)).toBe(true)
      expect(getProfileCompletionPercentage(minimalProfile)).toBe(60) // 3 out of 5 fields
    })
  })

  describe('Edge Cases', () => {
    it('should handle null and undefined values gracefully', () => {
      expect(isProfileComplete(null)).toBe(false)
      expect(isProfileComplete(undefined)).toBe(false)
      expect(getProfileCompletionPercentage(null)).toBe(0)
      expect(getProfileCompletionPercentage(undefined)).toBe(0)
    })

    it('should handle empty strings in validation', () => {
      expect(isValidEmail('')).toBe(false)
      expect(validatePassword('').isValid).toBe(false)
    })

    it('should handle special characters in email validation', () => {
      expect(isValidEmail('test+tag@example.com')).toBe(true)
      expect(isValidEmail('test.name@example.com')).toBe(true)
      expect(isValidEmail('test_name@example.com')).toBe(true)
    })

    it('should handle Korean email domains', () => {
      expect(isValidEmail('test@naver.com')).toBe(true)
      expect(isValidEmail('test@daum.net')).toBe(true)
      expect(isValidEmail('test@gmail.com')).toBe(true)
    })
  })
})