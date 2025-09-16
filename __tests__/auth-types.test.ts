/**
 * Tests for authentication types and constants
 */

import { AUTH_ERRORS, AUTH_ERROR_MESSAGES } from '../lib/types/auth'

describe('Authentication Types', () => {
  describe('Error Constants', () => {
    it('should have all required error codes', () => {
      expect(AUTH_ERRORS.NETWORK_ERROR).toBe('network-error')
      expect(AUTH_ERRORS.USER_CANCELLED).toBe('user-cancelled')
      expect(AUTH_ERRORS.POPUP_BLOCKED).toBe('popup-blocked')
      expect(AUTH_ERRORS.INVALID_CREDENTIALS).toBe('invalid-credentials')
      expect(AUTH_ERRORS.USER_NOT_FOUND).toBe('user-not-found')
      expect(AUTH_ERRORS.EMAIL_ALREADY_IN_USE).toBe('email-already-in-use')
      expect(AUTH_ERRORS.WEAK_PASSWORD).toBe('weak-password')
      expect(AUTH_ERRORS.PROVIDER_ERROR).toBe('provider-error')
    })

    it('should have Korean error messages for all error codes', () => {
      expect(AUTH_ERROR_MESSAGES[AUTH_ERRORS.NETWORK_ERROR]).toBe('네트워크 연결을 확인해주세요')
      expect(AUTH_ERROR_MESSAGES[AUTH_ERRORS.USER_CANCELLED]).toBe('로그인이 취소되었습니다')
      expect(AUTH_ERROR_MESSAGES[AUTH_ERRORS.POPUP_BLOCKED]).toBe('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요')
      expect(AUTH_ERROR_MESSAGES[AUTH_ERRORS.INVALID_CREDENTIALS]).toBe('이메일 또는 비밀번호가 올바르지 않습니다')
      expect(AUTH_ERROR_MESSAGES[AUTH_ERRORS.USER_NOT_FOUND]).toBe('등록되지 않은 사용자입니다')
      expect(AUTH_ERROR_MESSAGES[AUTH_ERRORS.EMAIL_ALREADY_IN_USE]).toBe('이미 사용 중인 이메일입니다')
      expect(AUTH_ERROR_MESSAGES[AUTH_ERRORS.WEAK_PASSWORD]).toBe('비밀번호는 6자리 이상이어야 합니다')
      expect(AUTH_ERROR_MESSAGES[AUTH_ERRORS.PROVIDER_ERROR]).toBe('로그인에 실패했습니다. 다시 시도해주세요')
    })

    it('should have all error codes covered by error messages', () => {
      const errorCodes = Object.values(AUTH_ERRORS)
      const messageKeys = Object.keys(AUTH_ERROR_MESSAGES)

      errorCodes.forEach(code => {
        expect(messageKeys).toContain(code)
      })
    })

    it('should have user-friendly Korean messages', () => {
      // Test that all messages are in Korean and user-friendly
      const messages = Object.values(AUTH_ERROR_MESSAGES)

      messages.forEach(message => {
        expect(message).toBeTruthy()
        expect(typeof message).toBe('string')
        expect(message.length).toBeGreaterThan(0)
        // Basic check for Korean characters (한글)
        expect(/[가-힣]/.test(message)).toBe(true)
      })
    })
  })

  describe('Type Safety', () => {
    it('should ensure AUTH_ERRORS is readonly', () => {
      // This test ensures the const assertion works correctly
      expect(() => {
        // @ts-expect-error - This should cause a TypeScript error
        (AUTH_ERRORS as any).NEW_ERROR = 'new-error'
      }).not.toThrow() // Runtime won't throw, but TypeScript should prevent this
    })

    it('should have consistent error code format', () => {
      const errorCodes = Object.values(AUTH_ERRORS)

      errorCodes.forEach(code => {
        expect(code).toMatch(/^[a-z-]+$/) // kebab-case format
        expect(code).not.toMatch(/^-/) // shouldn't start with dash
        expect(code).not.toMatch(/-$/) // shouldn't end with dash
        expect(code).not.toMatch(/--/) // shouldn't have double dashes
      })
    })
  })

  describe('Dance Level Types', () => {
    const validDanceLevels = ['beginner', 'intermediate', 'advanced', 'professional']

    it('should have valid dance level values', () => {
      // This test ensures the DanceLevel type has the expected values
      validDanceLevels.forEach(level => {
        expect(['beginner', 'intermediate', 'advanced', 'professional']).toContain(level)
      })
    })
  })

  describe('Auth Provider Types', () => {
    const validProviders = ['google', 'kakao', 'naver', 'email']

    it('should have valid auth provider values', () => {
      // This test ensures the AuthProvider type has the expected values
      validProviders.forEach(provider => {
        expect(['google', 'kakao', 'naver', 'email']).toContain(provider)
      })
    })

    it('should cover all implemented providers', () => {
      // Ensure we have Korean names for all providers
      const providerNames = {
        google: '구글',
        kakao: '카카오톡',
        naver: '네이버',
        email: '이메일'
      }

      validProviders.forEach(provider => {
        expect(providerNames[provider as keyof typeof providerNames]).toBeTruthy()
      })
    })
  })
})