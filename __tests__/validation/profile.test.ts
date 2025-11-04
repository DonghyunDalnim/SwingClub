/**
 * Unit tests for profile validation functions
 */

import { describe, it, expect } from '@jest/globals'
import {
  validateDanceStyles,
  validateUserProfile,
  sanitizeDanceStyles,
  danceStyleSchema,
  danceStylesArraySchema
} from '@/lib/validation/profile'
import { ALLOWED_DANCE_STYLES, DANCE_STYLE_CONSTRAINTS } from '@/lib/types/user'

describe('Profile Validation', () => {
  describe('danceStyleSchema', () => {
    it('should validate a valid dance style', () => {
      const validStyle = {
        style: 'Lindy Hop',
        level: 3
      }

      const result = danceStyleSchema.safeParse(validStyle)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validStyle)
      }
    })

    it('should reject invalid dance style name', () => {
      const invalidStyle = {
        style: 'Invalid Dance',
        level: 3
      }

      const result = danceStyleSchema.safeParse(invalidStyle)
      expect(result.success).toBe(false)
    })

    it('should reject level below minimum', () => {
      const invalidLevel = {
        style: 'Lindy Hop',
        level: 0
      }

      const result = danceStyleSchema.safeParse(invalidLevel)
      expect(result.success).toBe(false)
    })

    it('should reject level above maximum', () => {
      const invalidLevel = {
        style: 'Lindy Hop',
        level: 6
      }

      const result = danceStyleSchema.safeParse(invalidLevel)
      expect(result.success).toBe(false)
    })

    it('should reject non-integer level', () => {
      const invalidLevel = {
        style: 'Lindy Hop',
        level: 3.5
      }

      const result = danceStyleSchema.safeParse(invalidLevel)
      expect(result.success).toBe(false)
    })

    it('should validate all allowed dance styles', () => {
      ALLOWED_DANCE_STYLES.forEach((styleName) => {
        const style = {
          style: styleName,
          level: 3
        }

        const result = danceStyleSchema.safeParse(style)
        expect(result.success).toBe(true)
      })
    })

    it('should validate all level values from 1 to 5', () => {
      for (let level = DANCE_STYLE_CONSTRAINTS.MIN_LEVEL; level <= DANCE_STYLE_CONSTRAINTS.MAX_LEVEL; level++) {
        const style = {
          style: 'Lindy Hop',
          level
        }

        const result = danceStyleSchema.safeParse(style)
        expect(result.success).toBe(true)
      }
    })
  })

  describe('danceStylesArraySchema', () => {
    it('should validate an empty array', () => {
      const result = danceStylesArraySchema.safeParse([])
      expect(result.success).toBe(true)
    })

    it('should validate undefined', () => {
      const result = danceStylesArraySchema.safeParse(undefined)
      expect(result.success).toBe(true)
    })

    it('should validate a valid array of dance styles', () => {
      const validStyles = [
        { style: 'Lindy Hop', level: 3 },
        { style: 'Charleston', level: 2 },
        { style: 'Balboa', level: 4 }
      ]

      const result = danceStylesArraySchema.safeParse(validStyles)
      expect(result.success).toBe(true)
    })

    it('should reject array exceeding maximum count', () => {
      const tooManyStyles = Array.from({ length: DANCE_STYLE_CONSTRAINTS.MAX_STYLES + 1 }, (_, i) => ({
        style: ALLOWED_DANCE_STYLES[i % ALLOWED_DANCE_STYLES.length],
        level: 3
      }))

      const result = danceStylesArraySchema.safeParse(tooManyStyles)
      expect(result.success).toBe(false)
    })

    it('should reject duplicate dance styles', () => {
      const duplicateStyles = [
        { style: 'Lindy Hop', level: 3 },
        { style: 'Lindy Hop', level: 4 }
      ]

      const result = danceStylesArraySchema.safeParse(duplicateStyles)
      expect(result.success).toBe(false)
    })

    it('should validate maximum allowed styles without duplicates', () => {
      const maxStyles = ALLOWED_DANCE_STYLES.slice(0, DANCE_STYLE_CONSTRAINTS.MAX_STYLES).map((style) => ({
        style,
        level: 3
      }))

      const result = danceStylesArraySchema.safeParse(maxStyles)
      expect(result.success).toBe(true)
    })
  })

  describe('validateDanceStyles', () => {
    it('should return success for valid dance styles', () => {
      const validStyles = [
        { style: 'Lindy Hop', level: 3 },
        { style: 'Charleston', level: 2 }
      ]

      const result = validateDanceStyles(validStyles)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validStyles)
      expect(result.errors).toBeUndefined()
    })

    it('should return errors for invalid dance styles', () => {
      const invalidStyles = [
        { style: 'Invalid Dance', level: 3 }
      ]

      const result = validateDanceStyles(invalidStyles)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors!.length).toBeGreaterThan(0)
    })

    it('should return success for undefined', () => {
      const result = validateDanceStyles(undefined)
      expect(result.success).toBe(true)
    })

    it('should return success for empty array', () => {
      const result = validateDanceStyles([])
      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })

    it('should return errors for duplicate styles', () => {
      const duplicateStyles = [
        { style: 'Lindy Hop', level: 3 },
        { style: 'Lindy Hop', level: 4 }
      ]

      const result = validateDanceStyles(duplicateStyles)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should return errors for too many styles', () => {
      const tooManyStyles = Array.from({ length: DANCE_STYLE_CONSTRAINTS.MAX_STYLES + 1 }, (_, i) => ({
        style: ALLOWED_DANCE_STYLES[i % ALLOWED_DANCE_STYLES.length],
        level: 3
      }))

      const result = validateDanceStyles(tooManyStyles)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should handle malformed data gracefully', () => {
      const result = validateDanceStyles('not an array')
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })
  })

  describe('validateUserProfile', () => {
    it('should validate a complete valid profile', () => {
      const validProfile = {
        nickname: 'TestUser',
        danceLevel: 'intermediate' as const,
        location: 'Seoul',
        bio: 'I love swing dance!',
        interests: ['Lindy Hop', 'Charleston'],
        socialLinks: {
          kakao: 'https://kakao.com/test',
          instagram: 'https://instagram.com/test'
        },
        danceStyles: [
          { style: 'Lindy Hop', level: 3 },
          { style: 'Charleston', level: 2 }
        ]
      }

      const result = validateUserProfile(validProfile)
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.errors).toBeUndefined()
    })

    it('should validate partial profile updates', () => {
      const partialProfile = {
        nickname: 'NewNickname'
      }

      const result = validateUserProfile(partialProfile)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(partialProfile)
    })

    it('should validate only dance styles update', () => {
      const danceStylesOnly = {
        danceStyles: [{ style: 'Lindy Hop', level: 4 }]
      }

      const result = validateUserProfile(danceStylesOnly)
      expect(result.success).toBe(true)
    })

    it('should reject invalid nickname (too long)', () => {
      const invalidProfile = {
        nickname: 'a'.repeat(51)
      }

      const result = validateUserProfile(invalidProfile)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should reject invalid dance level', () => {
      const invalidProfile = {
        danceLevel: 'expert' as any
      }

      const result = validateUserProfile(invalidProfile)
      expect(result.success).toBe(false)
    })

    it('should reject invalid social links (not URLs)', () => {
      const invalidProfile = {
        socialLinks: {
          kakao: 'not-a-url'
        }
      }

      const result = validateUserProfile(invalidProfile)
      expect(result.success).toBe(false)
    })

    it('should reject too many interests', () => {
      const invalidProfile = {
        interests: Array.from({ length: 21 }, (_, i) => `interest${i}`)
      }

      const result = validateUserProfile(invalidProfile)
      expect(result.success).toBe(false)
    })

    it('should accept empty profile object', () => {
      const result = validateUserProfile({})
      expect(result.success).toBe(true)
    })
  })

  describe('sanitizeDanceStyles', () => {
    it('should convert undefined to empty array', () => {
      const result = sanitizeDanceStyles(undefined)
      expect(result).toEqual([])
    })

    it('should convert null to empty array', () => {
      const result = sanitizeDanceStyles(null)
      expect(result).toEqual([])
    })

    it('should return valid array unchanged', () => {
      const validStyles = [{ style: 'Lindy Hop', level: 3 }]
      const result = sanitizeDanceStyles(validStyles)
      expect(result).toEqual(validStyles)
    })

    it('should return empty array unchanged', () => {
      const result = sanitizeDanceStyles([])
      expect(result).toEqual([])
    })
  })

  describe('Edge Cases', () => {
    it('should handle all 9 allowed dance styles', () => {
      const allStyles = ALLOWED_DANCE_STYLES.map((style) => ({
        style,
        level: 3
      }))

      const result = validateDanceStyles(allStyles)
      expect(result.success).toBe(true)
    })

    it('should validate boundary level values', () => {
      const minLevel = { style: 'Lindy Hop', level: DANCE_STYLE_CONSTRAINTS.MIN_LEVEL }
      const maxLevel = { style: 'Charleston', level: DANCE_STYLE_CONSTRAINTS.MAX_LEVEL }

      const result = validateDanceStyles([minLevel, maxLevel])
      expect(result.success).toBe(true)
    })

    it('should reject level exactly at boundaries (0 and 6)', () => {
      const belowMin = { style: 'Lindy Hop', level: 0 }
      const aboveMax = { style: 'Charleston', level: 6 }

      const resultBelow = danceStyleSchema.safeParse(belowMin)
      const resultAbove = danceStyleSchema.safeParse(aboveMax)

      expect(resultBelow.success).toBe(false)
      expect(resultAbove.success).toBe(false)
    })

    it('should handle profile with maximum bio length', () => {
      const maxBio = 'a'.repeat(500)
      const result = validateUserProfile({ bio: maxBio })
      expect(result.success).toBe(true)
    })

    it('should reject profile with bio exceeding maximum', () => {
      const tooBio = 'a'.repeat(501)
      const result = validateUserProfile({ bio: tooBio })
      expect(result.success).toBe(false)
    })
  })
})
