/**
 * Profile validation schemas using Zod
 * Validates user profile data including dance styles
 */

import { z } from 'zod'
import {
  ALLOWED_DANCE_STYLES,
  DANCE_STYLE_CONSTRAINTS,
  type DanceStyleName
} from '@/lib/types/user'

/**
 * Dance style validation schema
 */
export const danceStyleSchema = z.object({
  style: z.enum(ALLOWED_DANCE_STYLES as readonly [DanceStyleName, ...DanceStyleName[]], {
    message: '허용되지 않은 댄스 스타일입니다.'
  }),
  level: z
    .number()
    .int('레벨은 정수여야 합니다.')
    .min(DANCE_STYLE_CONSTRAINTS.MIN_LEVEL, `레벨은 최소 ${DANCE_STYLE_CONSTRAINTS.MIN_LEVEL}이어야 합니다.`)
    .max(DANCE_STYLE_CONSTRAINTS.MAX_LEVEL, `레벨은 최대 ${DANCE_STYLE_CONSTRAINTS.MAX_LEVEL}이어야 합니다.`)
})

/**
 * Dance styles array validation schema
 */
export const danceStylesArraySchema = z
  .array(danceStyleSchema)
  .max(DANCE_STYLE_CONSTRAINTS.MAX_STYLES, `최대 ${DANCE_STYLE_CONSTRAINTS.MAX_STYLES}개의 댄스 스타일만 설정할 수 있습니다.`)
  .optional()
  .refine(
    (styles) => {
      if (!styles) return true
      const styleNames = styles.map((s) => s.style)
      const uniqueStyles = new Set(styleNames)
      return styleNames.length === uniqueStyles.size
    },
    {
      message: '중복된 댄스 스타일이 있습니다.'
    }
  )

/**
 * User profile update schema
 */
export const userProfileUpdateSchema = z.object({
  nickname: z.string().min(1, '닉네임을 입력해주세요.').max(50, '닉네임은 최대 50자까지 가능합니다.').optional(),
  danceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'professional']).optional(),
  location: z.string().min(1, '지역을 입력해주세요.').max(100, '지역은 최대 100자까지 가능합니다.').optional(),
  bio: z.string().max(500, '자기소개는 최대 500자까지 가능합니다.').optional(),
  interests: z.array(z.string()).max(20, '관심사는 최대 20개까지 설정할 수 있습니다.').optional(),
  socialLinks: z
    .object({
      kakao: z.string().url('올바른 URL 형식이 아닙니다.').optional(),
      instagram: z.string().url('올바른 URL 형식이 아닙니다.').optional()
    })
    .optional(),
  danceStyles: danceStylesArraySchema
})

/**
 * Validate dance styles data
 * @param danceStyles - Array of dance styles to validate
 * @returns Validation result with success flag and errors
 */
export function validateDanceStyles(danceStyles: unknown): {
  success: boolean
  data?: z.infer<typeof danceStylesArraySchema>
  errors?: string[]
} {
  try {
    const result = danceStylesArraySchema.safeParse(danceStyles)

    if (result.success) {
      return {
        success: true,
        data: result.data
      }
    } else {
      return {
        success: false,
        errors: result.error.issues.map((err) => err.message)
      }
    }
  } catch (error) {
    return {
      success: false,
      errors: ['댄스 스타일 데이터 검증 중 오류가 발생했습니다.']
    }
  }
}

/**
 * Validate user profile update data
 * @param profileData - Profile data to validate
 * @returns Validation result with success flag and errors
 */
export function validateUserProfile(profileData: unknown): {
  success: boolean
  data?: z.infer<typeof userProfileUpdateSchema>
  errors?: Record<string, string[]>
} {
  try {
    const result = userProfileUpdateSchema.safeParse(profileData)

    if (result.success) {
      return {
        success: true,
        data: result.data
      }
    } else {
      const errors: Record<string, string[]> = {}

      result.error.issues.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })

      return {
        success: false,
        errors
      }
    }
  } catch (error) {
    return {
      success: false,
      errors: {
        general: ['프로필 데이터 검증 중 오류가 발생했습니다.']
      }
    }
  }
}

/**
 * Sanitize dance styles data for backward compatibility
 * Converts undefined to empty array for consistency
 */
export function sanitizeDanceStyles(danceStyles: unknown): unknown {
  if (danceStyles === undefined || danceStyles === null) {
    return []
  }
  return danceStyles
}
