/**
 * Profile Validator Unit Tests
 * Comprehensive test suite for profile validation functions
 */

import {
  validateNickname,
  validateRegion,
  validateDanceLevel,
  validatePreferredStyles,
  validateBio,
  validateProfileImageUrl,
  validateProfileData,
  validateSocialLinks,
  type ValidationResult
} from '@/lib/validators/profile'
import { REGION_CENTERS } from '@/lib/utils/geo'
import type { UserProfile } from '@/lib/types/auth'

describe('validateNickname', () => {
  describe('valid inputs', () => {
    it('should accept valid Korean nickname', () => {
      const result = validateNickname('스윙댄서')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept valid English nickname', () => {
      const result = validateNickname('SwingDancer')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept valid alphanumeric nickname', () => {
      const result = validateNickname('User123')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept mixed Korean and English', () => {
      const result = validateNickname('스윙Dancer')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept 2-character nickname (minimum)', () => {
      const result = validateNickname('AB')
      expect(result.valid).toBe(true)
    })

    it('should accept 20-character nickname (maximum)', () => {
      const result = validateNickname('12345678901234567890')
      expect(result.valid).toBe(true)
    })

    it('should trim whitespace and validate', () => {
      const result = validateNickname('  스윙댄서  ')
      expect(result.valid).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject empty string', () => {
      const result = validateNickname('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('닉네임을 입력해주세요.')
      expect(result.field).toBe('nickname')
    })

    it('should reject null input', () => {
      const result = validateNickname(null as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('닉네임을 입력해주세요.')
    })

    it('should reject undefined input', () => {
      const result = validateNickname(undefined as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('닉네임을 입력해주세요.')
    })

    it('should reject non-string input', () => {
      const result = validateNickname(123 as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('닉네임을 입력해주세요.')
    })

    it('should reject too short nickname (< 2 chars)', () => {
      const result = validateNickname('A')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('닉네임은 최소 2자 이상이어야 합니다.')
    })

    it('should reject too long nickname (> 20 chars)', () => {
      const result = validateNickname('123456789012345678901')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('닉네임은 최대 20자까지 입력 가능합니다.')
    })

    it('should reject nickname with special characters', () => {
      const result = validateNickname('User@123')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('닉네임은 한글, 영문, 숫자만 사용 가능합니다.')
    })

    it('should reject nickname with spaces', () => {
      const result = validateNickname('User Name')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('닉네임은 한글, 영문, 숫자만 사용 가능합니다.')
    })

    it('should reject nickname with underscores', () => {
      const result = validateNickname('User_Name')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('닉네임은 한글, 영문, 숫자만 사용 가능합니다.')
    })

    it('should reject whitespace-only string after trim', () => {
      const result = validateNickname('   ')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('닉네임은 최소 2자 이상이어야 합니다.')
    })
  })
})

describe('validateRegion', () => {
  describe('valid inputs', () => {
    it('should accept all valid regions from REGION_CENTERS', () => {
      const regions = Object.keys(REGION_CENTERS)
      regions.forEach(region => {
        const result = validateRegion(region)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })

    it('should accept 강남', () => {
      const result = validateRegion('강남')
      expect(result.valid).toBe(true)
    })

    it('should accept 홍대', () => {
      const result = validateRegion('홍대')
      expect(result.valid).toBe(true)
    })

    it('should trim whitespace', () => {
      const result = validateRegion('  강남  ')
      expect(result.valid).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject empty string', () => {
      const result = validateRegion('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('지역을 선택해주세요.')
      expect(result.field).toBe('location')
    })

    it('should reject null input', () => {
      const result = validateRegion(null as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('지역을 선택해주세요.')
    })

    it('should reject undefined input', () => {
      const result = validateRegion(undefined as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('지역을 선택해주세요.')
    })

    it('should reject non-string input', () => {
      const result = validateRegion(123 as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('지역을 선택해주세요.')
    })

    it('should reject whitespace-only string', () => {
      const result = validateRegion('   ')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('지역을 선택해주세요.')
    })

    it('should reject invalid region not in REGION_CENTERS', () => {
      const result = validateRegion('부산')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('유효하지 않은 지역입니다. 목록에서 선택해주세요.')
    })

    it('should reject misspelled region', () => {
      const result = validateRegion('강남구')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('유효하지 않은 지역입니다. 목록에서 선택해주세요.')
    })
  })
})

describe('validateDanceLevel', () => {
  describe('valid inputs', () => {
    it('should accept beginner level', () => {
      const result = validateDanceLevel('beginner')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept intermediate level', () => {
      const result = validateDanceLevel('intermediate')
      expect(result.valid).toBe(true)
    })

    it('should accept advanced level', () => {
      const result = validateDanceLevel('advanced')
      expect(result.valid).toBe(true)
    })

    it('should accept professional level', () => {
      const result = validateDanceLevel('professional')
      expect(result.valid).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject empty string', () => {
      const result = validateDanceLevel('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('댄스 레벨을 선택해주세요.')
      expect(result.field).toBe('danceLevel')
    })

    it('should reject null input', () => {
      const result = validateDanceLevel(null as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('댄스 레벨을 선택해주세요.')
    })

    it('should reject undefined input', () => {
      const result = validateDanceLevel(undefined as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('댄스 레벨을 선택해주세요.')
    })

    it('should reject non-string input', () => {
      const result = validateDanceLevel(123 as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('댄스 레벨을 선택해주세요.')
    })

    it('should reject invalid level string', () => {
      const result = validateDanceLevel('expert')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('유효하지 않은 댄스 레벨입니다.')
    })

    it('should reject uppercase level', () => {
      const result = validateDanceLevel('BEGINNER')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('유효하지 않은 댄스 레벨입니다.')
    })

    it('should reject mixed case level', () => {
      const result = validateDanceLevel('Beginner')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('유효하지 않은 댄스 레벨입니다.')
    })
  })
})

describe('validatePreferredStyles', () => {
  describe('valid inputs', () => {
    it('should accept single style', () => {
      const result = validatePreferredStyles(['Lindy Hop'])
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept multiple styles', () => {
      const result = validatePreferredStyles(['Lindy Hop', 'Charleston', 'Balboa'])
      expect(result.valid).toBe(true)
    })

    it('should accept 4 styles (maximum)', () => {
      const result = validatePreferredStyles(['Lindy Hop', 'Charleston', 'Balboa', 'Blues'])
      expect(result.valid).toBe(true)
    })

    it('should filter out empty strings and validate remaining', () => {
      const result = validatePreferredStyles(['Lindy Hop', '', '  ', 'Charleston'])
      expect(result.valid).toBe(true)
    })

    it('should trim whitespace from styles', () => {
      const result = validatePreferredStyles(['  Lindy Hop  ', 'Charleston'])
      expect(result.valid).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject non-array input', () => {
      const result = validatePreferredStyles('Lindy Hop' as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('선호 스타일을 배열 형식으로 입력해주세요.')
      expect(result.field).toBe('interests')
    })

    it('should reject null input', () => {
      const result = validatePreferredStyles(null as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('선호 스타일을 배열 형식으로 입력해주세요.')
    })

    it('should reject undefined input', () => {
      const result = validatePreferredStyles(undefined as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('선호 스타일을 배열 형식으로 입력해주세요.')
    })

    it('should reject empty array', () => {
      const result = validatePreferredStyles([])
      expect(result.valid).toBe(false)
      expect(result.error).toBe('최소 1개 이상의 선호 스타일을 선택해주세요.')
    })

    it('should reject array with only empty strings', () => {
      const result = validatePreferredStyles(['', '  ', '   '])
      expect(result.valid).toBe(false)
      expect(result.error).toBe('최소 1개 이상의 선호 스타일을 선택해주세요.')
    })

    it('should reject more than 4 styles', () => {
      const result = validatePreferredStyles(['Lindy Hop', 'Charleston', 'Balboa', 'Blues', 'Shag'])
      expect(result.valid).toBe(false)
      expect(result.error).toBe('선호 스타일은 최대 4개까지 선택 가능합니다.')
    })

    it('should reject array with non-string elements', () => {
      const result = validatePreferredStyles([123, 'Charleston'] as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('선호 스타일은 모두 문자열이어야 합니다.')
    })
  })
})

describe('validateBio', () => {
  describe('valid inputs', () => {
    it('should accept undefined (optional field)', () => {
      const result = validateBio(undefined)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept empty string (optional field)', () => {
      const result = validateBio('')
      expect(result.valid).toBe(true)
    })

    it('should accept valid bio text', () => {
      const result = validateBio('스윙댄스를 사랑하는 댄서입니다.')
      expect(result.valid).toBe(true)
    })

    it('should accept bio with 200 characters (maximum)', () => {
      const bio = 'A'.repeat(200)
      const result = validateBio(bio)
      expect(result.valid).toBe(true)
    })

    it('should accept bio with mixed content', () => {
      const result = validateBio('Lindy Hop dancer from Seoul 🎵 스윙댄스 초보입니다!')
      expect(result.valid).toBe(true)
    })

    it('should accept bio with whitespace that trims to valid length', () => {
      const result = validateBio('  Short bio  ')
      expect(result.valid).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject non-string input', () => {
      const result = validateBio(123 as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('자기소개는 문자열 형식이어야 합니다.')
      expect(result.field).toBe('bio')
    })

    it('should reject bio longer than 200 characters', () => {
      const bio = 'A'.repeat(201)
      const result = validateBio(bio)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('자기소개는 최대 200자까지 입력 가능합니다.')
    })

    it('should reject bio that exceeds 200 characters after trim', () => {
      const bio = '   ' + 'A'.repeat(201) + '   '
      const result = validateBio(bio)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('자기소개는 최대 200자까지 입력 가능합니다.')
    })
  })
})

describe('validateProfileImageUrl', () => {
  describe('valid inputs', () => {
    it('should accept undefined (optional field)', () => {
      const result = validateProfileImageUrl(undefined)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept null (optional field)', () => {
      const result = validateProfileImageUrl(null)
      expect(result.valid).toBe(true)
    })

    it('should accept empty string (optional field)', () => {
      const result = validateProfileImageUrl('')
      expect(result.valid).toBe(true)
    })

    it('should accept valid http URL', () => {
      const result = validateProfileImageUrl('http://example.com/image.jpg')
      expect(result.valid).toBe(true)
    })

    it('should accept valid https URL', () => {
      const result = validateProfileImageUrl('https://example.com/image.jpg')
      expect(result.valid).toBe(true)
    })

    it('should accept Firebase Storage URL', () => {
      const result = validateProfileImageUrl('https://firebasestorage.googleapis.com/v0/b/bucket/o/image.jpg')
      expect(result.valid).toBe(true)
    })

    it('should accept URL with query parameters', () => {
      const result = validateProfileImageUrl('https://example.com/image.jpg?size=large&format=png')
      expect(result.valid).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject non-string input', () => {
      const result = validateProfileImageUrl(123 as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('프로필 이미지 URL은 문자열 형식이어야 합니다.')
      expect(result.field).toBe('photoURL')
    })

    it('should reject invalid URL format', () => {
      const result = validateProfileImageUrl('not-a-url')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('유효하지 않은 이미지 URL 형식입니다.')
    })

    it('should reject URL without protocol', () => {
      const result = validateProfileImageUrl('example.com/image.jpg')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('유효하지 않은 이미지 URL 형식입니다.')
    })

    it('should reject ftp protocol', () => {
      const result = validateProfileImageUrl('ftp://example.com/image.jpg')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('유효하지 않은 이미지 URL입니다.')
    })

    it('should reject file protocol', () => {
      const result = validateProfileImageUrl('file:///path/to/image.jpg')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('유효하지 않은 이미지 URL입니다.')
    })

    it('should reject malformed URL', () => {
      const result = validateProfileImageUrl('http://')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('유효하지 않은 이미지 URL 형식입니다.')
    })
  })
})

describe('validateProfileData', () => {
  describe('valid inputs', () => {
    it('should accept valid complete profile', () => {
      const profile: Partial<UserProfile> = {
        nickname: '스윙댄서',
        location: '강남',
        danceLevel: 'intermediate',
        interests: ['Lindy Hop', 'Charleston'],
        bio: '스윙댄스를 사랑합니다.'
      }
      const result = validateProfileData(profile)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept partial profile with only nickname', () => {
      const profile: Partial<UserProfile> = {
        nickname: '댄서123'
      }
      const result = validateProfileData(profile)
      expect(result.valid).toBe(true)
    })

    it('should accept empty profile object', () => {
      const profile: Partial<UserProfile> = {}
      const result = validateProfileData(profile)
      expect(result.valid).toBe(true)
    })

    it('should accept profile with optional fields undefined', () => {
      const profile: Partial<UserProfile> = {
        nickname: '댄서',
        location: '홍대',
        danceLevel: 'beginner',
        interests: ['Lindy Hop'],
        bio: undefined
      }
      const result = validateProfileData(profile)
      expect(result.valid).toBe(true)
    })
  })

  describe('invalid inputs - nickname validation', () => {
    it('should fail on invalid nickname', () => {
      const profile: Partial<UserProfile> = {
        nickname: 'A'
      }
      const result = validateProfileData(profile)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('닉네임은 최소 2자 이상이어야 합니다.')
      expect(result.field).toBe('nickname')
    })

    it('should fail on nickname with special characters', () => {
      const profile: Partial<UserProfile> = {
        nickname: 'User@123'
      }
      const result = validateProfileData(profile)
      expect(result.valid).toBe(false)
      expect(result.field).toBe('nickname')
    })
  })

  describe('invalid inputs - region validation', () => {
    it('should fail on invalid region', () => {
      const profile: Partial<UserProfile> = {
        nickname: '댄서',
        location: '부산'
      }
      const result = validateProfileData(profile)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('유효하지 않은 지역입니다. 목록에서 선택해주세요.')
      expect(result.field).toBe('location')
    })
  })

  describe('invalid inputs - dance level validation', () => {
    it('should fail on invalid dance level', () => {
      const profile: Partial<UserProfile> = {
        nickname: '댄서',
        location: '강남',
        danceLevel: 'expert' as any
      }
      const result = validateProfileData(profile)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('유효하지 않은 댄스 레벨입니다.')
      expect(result.field).toBe('danceLevel')
    })
  })

  describe('invalid inputs - interests validation', () => {
    it('should fail on empty interests array', () => {
      const profile: Partial<UserProfile> = {
        nickname: '댄서',
        location: '강남',
        danceLevel: 'beginner',
        interests: []
      }
      const result = validateProfileData(profile)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('최소 1개 이상의 선호 스타일을 선택해주세요.')
      expect(result.field).toBe('interests')
    })

    it('should fail on too many interests', () => {
      const profile: Partial<UserProfile> = {
        nickname: '댄서',
        interests: ['Style1', 'Style2', 'Style3', 'Style4', 'Style5']
      }
      const result = validateProfileData(profile)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('선호 스타일은 최대 4개까지 선택 가능합니다.')
    })
  })

  describe('invalid inputs - bio validation', () => {
    it('should fail on too long bio', () => {
      const profile: Partial<UserProfile> = {
        nickname: '댄서',
        bio: 'A'.repeat(201)
      }
      const result = validateProfileData(profile)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('자기소개는 최대 200자까지 입력 가능합니다.')
      expect(result.field).toBe('bio')
    })
  })

  describe('validation order', () => {
    it('should return first validation error encountered', () => {
      const profile: Partial<UserProfile> = {
        nickname: 'A',
        location: '부산',
        danceLevel: 'expert' as any
      }
      const result = validateProfileData(profile)
      expect(result.valid).toBe(false)
      expect(result.field).toBe('nickname')
    })
  })
})

describe('validateSocialLinks', () => {
  describe('valid inputs', () => {
    it('should accept undefined (optional field)', () => {
      const result = validateSocialLinks(undefined)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept empty object', () => {
      const result = validateSocialLinks({})
      expect(result.valid).toBe(true)
    })

    it('should accept valid kakao ID', () => {
      const result = validateSocialLinks({ kakao: 'mykakaoid' })
      expect(result.valid).toBe(true)
    })

    it('should accept valid instagram ID', () => {
      const result = validateSocialLinks({ instagram: 'myinstagram' })
      expect(result.valid).toBe(true)
    })

    it('should accept both kakao and instagram', () => {
      const result = validateSocialLinks({
        kakao: 'mykakaoid',
        instagram: 'myinstagram'
      })
      expect(result.valid).toBe(true)
    })

    it('should accept kakao ID with 50 characters (maximum)', () => {
      const result = validateSocialLinks({ kakao: 'A'.repeat(50) })
      expect(result.valid).toBe(true)
    })

    it('should accept instagram ID with 50 characters (maximum)', () => {
      const result = validateSocialLinks({ instagram: 'A'.repeat(50) })
      expect(result.valid).toBe(true)
    })

    it('should accept empty string values', () => {
      const result = validateSocialLinks({
        kakao: '',
        instagram: ''
      })
      expect(result.valid).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject non-object input', () => {
      const result = validateSocialLinks('not-an-object' as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('소셜 링크는 객체 형식이어야 합니다.')
      expect(result.field).toBe('socialLinks')
    })

    it('should reject array input', () => {
      const result = validateSocialLinks(['kakao', 'instagram'] as any)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('소셜 링크는 객체 형식이어야 합니다.')
    })

    it('should accept null input as valid (optional field)', () => {
      const result = validateSocialLinks(null as any)
      expect(result.valid).toBe(true)
    })

    it('should reject non-string kakao ID', () => {
      const result = validateSocialLinks({ kakao: 123 as any })
      expect(result.valid).toBe(false)
      expect(result.error).toBe('카카오톡 ID는 문자열 형식이어야 합니다.')
      expect(result.field).toBe('socialLinks.kakao')
    })

    it('should reject kakao ID longer than 50 characters', () => {
      const result = validateSocialLinks({ kakao: 'A'.repeat(51) })
      expect(result.valid).toBe(false)
      expect(result.error).toBe('카카오톡 ID는 최대 50자까지 입력 가능합니다.')
    })

    it('should reject kakao ID longer than 50 characters after trim', () => {
      const result = validateSocialLinks({ kakao: '  ' + 'A'.repeat(51) + '  ' })
      expect(result.valid).toBe(false)
      expect(result.error).toBe('카카오톡 ID는 최대 50자까지 입력 가능합니다.')
    })

    it('should reject non-string instagram ID', () => {
      const result = validateSocialLinks({ instagram: 456 as any })
      expect(result.valid).toBe(false)
      expect(result.error).toBe('인스타그램 ID는 문자열 형식이어야 합니다.')
      expect(result.field).toBe('socialLinks.instagram')
    })

    it('should reject instagram ID longer than 50 characters', () => {
      const result = validateSocialLinks({ instagram: 'A'.repeat(51) })
      expect(result.valid).toBe(false)
      expect(result.error).toBe('인스타그램 ID는 최대 50자까지 입력 가능합니다.')
    })

    it('should reject instagram ID longer than 50 characters after trim', () => {
      const result = validateSocialLinks({ instagram: '  ' + 'A'.repeat(51) + '  ' })
      expect(result.valid).toBe(false)
      expect(result.error).toBe('인스타그램 ID는 최대 50자까지 입력 가능합니다.')
    })
  })

  describe('validation priority', () => {
    it('should validate kakao before instagram when both invalid', () => {
      const result = validateSocialLinks({
        kakao: 123 as any,
        instagram: 456 as any
      })
      expect(result.valid).toBe(false)
      expect(result.field).toBe('socialLinks.kakao')
    })
  })
})
