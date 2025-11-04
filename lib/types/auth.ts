/**
 * Authentication related type definitions for Swing Connect
 */

import type { User as FirebaseUser } from 'firebase/auth'
import type { DanceStyle } from './user'

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

export interface UserProfile {
  nickname: string
  danceLevel: DanceLevel
  location: string
  bio?: string
  interests: string[]
  socialLinks?: {
    kakao?: string
    instagram?: string
  }
  danceStyles?: DanceStyle[]
}

export type DanceLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional'

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