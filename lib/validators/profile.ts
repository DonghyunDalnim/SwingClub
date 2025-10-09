/**
 * 프로필 데이터 유효성 검증 함수
 */

import type { UserProfile, DanceLevel } from '@/lib/types/auth'
import { REGION_CENTERS } from '@/lib/utils/geo'

export interface ValidationResult {
  valid: boolean
  error?: string
  field?: string
}

/**
 * 닉네임 유효성 검증
 * 규칙: 2-20자, 한글/영문/숫자만, 특수문자 불가
 */
export function validateNickname(nickname: string): ValidationResult {
  if (!nickname || typeof nickname !== 'string') {
    return {
      valid: false,
      error: '닉네임을 입력해주세요.',
      field: 'nickname'
    }
  }

  const trimmed = nickname.trim()

  if (trimmed.length < 2) {
    return {
      valid: false,
      error: '닉네임은 최소 2자 이상이어야 합니다.',
      field: 'nickname'
    }
  }

  if (trimmed.length > 20) {
    return {
      valid: false,
      error: '닉네임은 최대 20자까지 입력 가능합니다.',
      field: 'nickname'
    }
  }

  // 한글, 영문, 숫자만 허용 (특수문자 및 공백 제외)
  const nicknameRegex = /^[가-힣a-zA-Z0-9]+$/
  if (!nicknameRegex.test(trimmed)) {
    return {
      valid: false,
      error: '닉네임은 한글, 영문, 숫자만 사용 가능합니다.',
      field: 'nickname'
    }
  }

  return { valid: true }
}

/**
 * 지역 유효성 검증
 * REGION_CENTERS 배열에 존재하는 지역만 허용
 */
export function validateRegion(region: string): ValidationResult {
  if (!region || typeof region !== 'string') {
    return {
      valid: false,
      error: '지역을 선택해주세요.',
      field: 'location'
    }
  }

  const trimmed = region.trim()

  if (!trimmed) {
    return {
      valid: false,
      error: '지역을 선택해주세요.',
      field: 'location'
    }
  }

  // REGION_CENTERS에 정의된 지역인지 확인
  if (!REGION_CENTERS[trimmed]) {
    return {
      valid: false,
      error: '유효하지 않은 지역입니다. 목록에서 선택해주세요.',
      field: 'location'
    }
  }

  return { valid: true }
}

/**
 * 댄스 레벨 유효성 검증
 */
export function validateDanceLevel(level: string): ValidationResult {
  const validLevels: DanceLevel[] = ['beginner', 'intermediate', 'advanced', 'professional']

  if (!level || typeof level !== 'string') {
    return {
      valid: false,
      error: '댄스 레벨을 선택해주세요.',
      field: 'danceLevel'
    }
  }

  if (!validLevels.includes(level as DanceLevel)) {
    return {
      valid: false,
      error: '유효하지 않은 댄스 레벨입니다.',
      field: 'danceLevel'
    }
  }

  return { valid: true }
}

/**
 * 선호 스타일 유효성 검증
 * 최소 1개, 최대 4개
 */
export function validatePreferredStyles(interests: string[]): ValidationResult {
  if (!Array.isArray(interests)) {
    return {
      valid: false,
      error: '선호 스타일을 배열 형식으로 입력해주세요.',
      field: 'interests'
    }
  }

  // 모든 요소가 문자열인지 확인
  const hasNonString = interests.some(item => typeof item !== 'string')
  if (hasNonString) {
    return {
      valid: false,
      error: '선호 스타일은 모두 문자열이어야 합니다.',
      field: 'interests'
    }
  }

  // 빈 문자열 제거 후 검증
  const validInterests = interests.filter(item => item.trim().length > 0)

  if (validInterests.length < 1) {
    return {
      valid: false,
      error: '최소 1개 이상의 선호 스타일을 선택해주세요.',
      field: 'interests'
    }
  }

  if (validInterests.length > 4) {
    return {
      valid: false,
      error: '선호 스타일은 최대 4개까지 선택 가능합니다.',
      field: 'interests'
    }
  }

  return { valid: true }
}

/**
 * 자기소개 유효성 검증
 * 최대 200자
 */
export function validateBio(bio?: string): ValidationResult {
  if (!bio) {
    // 자기소개는 선택사항
    return { valid: true }
  }

  if (typeof bio !== 'string') {
    return {
      valid: false,
      error: '자기소개는 문자열 형식이어야 합니다.',
      field: 'bio'
    }
  }

  const trimmed = bio.trim()

  if (trimmed.length > 200) {
    return {
      valid: false,
      error: '자기소개는 최대 200자까지 입력 가능합니다.',
      field: 'bio'
    }
  }

  return { valid: true }
}

/**
 * 프로필 이미지 URL 유효성 검증
 */
export function validateProfileImageUrl(photoURL?: string | null): ValidationResult {
  if (!photoURL) {
    // 프로필 이미지는 선택사항
    return { valid: true }
  }

  if (typeof photoURL !== 'string') {
    return {
      valid: false,
      error: '프로필 이미지 URL은 문자열 형식이어야 합니다.',
      field: 'photoURL'
    }
  }

  // URL 형식 검증 (http:// 또는 https://)
  try {
    const url = new URL(photoURL)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return {
        valid: false,
        error: '유효하지 않은 이미지 URL입니다.',
        field: 'photoURL'
      }
    }
  } catch {
    return {
      valid: false,
      error: '유효하지 않은 이미지 URL 형식입니다.',
      field: 'photoURL'
    }
  }

  return { valid: true }
}

/**
 * 전체 프로필 데이터 통합 검증
 */
export function validateProfileData(profile: Partial<UserProfile>): ValidationResult {
  // 닉네임 검증
  if (profile.nickname !== undefined) {
    const nicknameResult = validateNickname(profile.nickname)
    if (!nicknameResult.valid) {
      return nicknameResult
    }
  }

  // 지역 검증
  if (profile.location !== undefined) {
    const regionResult = validateRegion(profile.location)
    if (!regionResult.valid) {
      return regionResult
    }
  }

  // 댄스 레벨 검증
  if (profile.danceLevel !== undefined) {
    const levelResult = validateDanceLevel(profile.danceLevel)
    if (!levelResult.valid) {
      return levelResult
    }
  }

  // 선호 스타일 검증
  if (profile.interests !== undefined) {
    const interestsResult = validatePreferredStyles(profile.interests)
    if (!interestsResult.valid) {
      return interestsResult
    }
  }

  // 자기소개 검증
  if (profile.bio !== undefined) {
    const bioResult = validateBio(profile.bio)
    if (!bioResult.valid) {
      return bioResult
    }
  }

  return { valid: true }
}

/**
 * 소셜 링크 유효성 검증
 */
export function validateSocialLinks(socialLinks?: { kakao?: string; instagram?: string } | null): ValidationResult {
  if (!socialLinks || socialLinks === null) {
    return { valid: true }
  }

  if (typeof socialLinks !== 'object' || Array.isArray(socialLinks)) {
    return {
      valid: false,
      error: '소셜 링크는 객체 형식이어야 합니다.',
      field: 'socialLinks'
    }
  }

  // 카카오톡 ID 검증 (선택사항)
  if (socialLinks.kakao !== undefined) {
    if (typeof socialLinks.kakao !== 'string') {
      return {
        valid: false,
        error: '카카오톡 ID는 문자열 형식이어야 합니다.',
        field: 'socialLinks.kakao'
      }
    }
    if (socialLinks.kakao.trim().length > 50) {
      return {
        valid: false,
        error: '카카오톡 ID는 최대 50자까지 입력 가능합니다.',
        field: 'socialLinks.kakao'
      }
    }
  }

  // 인스타그램 ID 검증 (선택사항)
  if (socialLinks.instagram !== undefined) {
    if (typeof socialLinks.instagram !== 'string') {
      return {
        valid: false,
        error: '인스타그램 ID는 문자열 형식이어야 합니다.',
        field: 'socialLinks.instagram'
      }
    }
    if (socialLinks.instagram.trim().length > 50) {
      return {
        valid: false,
        error: '인스타그램 ID는 최대 50자까지 입력 가능합니다.',
        field: 'socialLinks.instagram'
      }
    }
  }

  return { valid: true }
}
