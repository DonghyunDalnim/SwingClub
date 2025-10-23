/**
 * Authentication related type definitions for Swing Connect
 *
 * @module lib/types/auth
 * @description User authentication and profile type definitions
 *
 * @changelog
 * - 2025-01-19: Added DanceStyle interface and UserProfile.danceStyles field (Issue #93, #94)
 *   - New DanceStyle interface for storing dance style proficiency
 *   - UserProfile extended with optional danceStyles field for backward compatibility
 */

import type { User as FirebaseUser } from 'firebase/auth'

export interface User {
  id: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  provider: AuthProvider
  createdAt: Date
  lastLoginAt: Date
  profile?: UserProfile
}

/**
 * 사용자 프로필 정보
 * User profile information
 *
 * @interface UserProfile
 * @description
 * Stores user profile data including nickname, dance level, location, interests, and dance styles.
 * The interface supports optional fields for backward compatibility with existing data.
 *
 * @example
 * ```typescript
 * // Basic profile (backward compatible)
 * const basicProfile: UserProfile = {
 *   nickname: '스윙댄서',
 *   danceLevel: 'intermediate',
 *   location: '서울',
 *   interests: ['Swing Dance']
 * }
 *
 * // Profile with dance styles (new feature)
 * const detailedProfile: UserProfile = {
 *   nickname: '스윙댄서',
 *   danceLevel: 'intermediate',
 *   location: '서울',
 *   bio: '스윙댄스를 사랑합니다',
 *   interests: ['Swing Dance', 'Social Dancing'],
 *   danceStyles: [
 *     { name: 'Lindy Hop', level: 3 },
 *     { name: 'Charleston', level: 2 }
 *   ],
 *   socialLinks: {
 *     kakao: 'swing_dancer',
 *     instagram: '@swing_dancer'
 *   }
 * }
 *
 * // Profile update (Partial support)
 * const profileUpdate: Partial<UserProfile> = {
 *   bio: '업데이트된 소개',
 *   danceStyles: [
 *     { name: 'Lindy Hop', level: 4 }  // Level increased
 *   ]
 * }
 * ```
 *
 * @since 2025-01-19 - Added danceStyles field (Issue #94)
 *
 * @see {@link DanceStyle} for dance style proficiency levels
 * @see {@link DanceLevel} for overall dance skill level
 */
export interface UserProfile {
  /** 사용자 닉네임 (User nickname) */
  nickname: string

  /** 전반적인 댄스 레벨 (Overall dance level) */
  danceLevel: DanceLevel

  /** 위치/지역 (Location/region) */
  location: string

  /** 자기소개 (Bio) - optional */
  bio?: string

  /** 관심사 목록 (List of interests) */
  interests: string[]

  /**
   * 사용자의 댄스 스타일 목록
   * List of user's dance styles with proficiency levels
   *
   * @optional 기존 사용자와의 하위 호환성을 위해 optional (Optional for backward compatibility)
   * @since 2025-01-19 (Issue #94)
   *
   * @example
   * ```typescript
   * danceStyles: [
   *   { name: 'Lindy Hop', level: 3 },
   *   { name: 'Charleston', level: 2 }
   * ]
   * ```
   *
   * @remarks
   * - Can be undefined for existing users who haven't set their dance styles
   * - Can be an empty array [] for users who cleared their styles
   * - Recommended maximum: 10 dance styles for UI performance
   * - Each style uses 1-5 level system (different from DanceLevel)
   */
  danceStyles?: DanceStyle[]

  /** 소셜 미디어 링크 (Social media links) - optional */
  socialLinks?: {
    kakao?: string
    instagram?: string
  }
}

export type DanceLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional'

/**
 * 댄스 스타일 및 레벨 정보
 * Dance style and proficiency level information
 *
 * @interface DanceStyle
 * @example
 * ```typescript
 * const userDanceStyles: DanceStyle[] = [
 *   { name: 'Lindy Hop', level: 3 },
 *   { name: 'Charleston', level: 2 },
 *   { name: 'Balboa', level: 4 }
 * ]
 * ```
 */
export interface DanceStyle {
  /**
   * 댄스 스타일 이름
   * Dance style name (e.g., Lindy Hop, Charleston, Balboa, Collegiate Shag)
   */
  name: string

  /**
   * 숙련도 레벨 (1-5)
   * Proficiency level (1-5)
   * - 1: 초급 (Beginner)
   * - 2: 초중급 (Elementary)
   * - 3: 중급 (Intermediate)
   * - 4: 중상급 (Upper-Intermediate)
   * - 5: 상급 (Advanced)
   */
  level: number
}

export type AuthProvider = 'google' | 'kakao' | 'naver' | 'email'

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>
  signInWithKakao: () => Promise<void>
  signInWithNaver: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, profile: Partial<UserProfile>) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
  clearError: () => void
}

export interface AuthError {
  code: string
  message: string
  provider?: AuthProvider
}

export const AUTH_ERRORS = {
  NETWORK_ERROR: 'network-error',
  USER_CANCELLED: 'user-cancelled',
  POPUP_BLOCKED: 'popup-blocked',
  INVALID_CREDENTIALS: 'invalid-credentials',
  USER_NOT_FOUND: 'user-not-found',
  EMAIL_ALREADY_IN_USE: 'email-already-in-use',
  WEAK_PASSWORD: 'weak-password',
  PROVIDER_ERROR: 'provider-error'
} as const

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  [AUTH_ERRORS.NETWORK_ERROR]: '네트워크 연결을 확인해주세요',
  [AUTH_ERRORS.USER_CANCELLED]: '로그인이 취소되었습니다',
  [AUTH_ERRORS.POPUP_BLOCKED]: '팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요',
  [AUTH_ERRORS.INVALID_CREDENTIALS]: '이메일 또는 비밀번호가 올바르지 않습니다',
  [AUTH_ERRORS.USER_NOT_FOUND]: '등록되지 않은 사용자입니다',
  [AUTH_ERRORS.EMAIL_ALREADY_IN_USE]: '이미 사용 중인 이메일입니다',
  [AUTH_ERRORS.WEAK_PASSWORD]: '비밀번호는 6자리 이상이어야 합니다',
  [AUTH_ERRORS.PROVIDER_ERROR]: '로그인에 실패했습니다. 다시 시도해주세요'
}

// Utility type to convert Firebase User to our User type
export type FirebaseUserToUser = (firebaseUser: FirebaseUser, provider: AuthProvider) => User