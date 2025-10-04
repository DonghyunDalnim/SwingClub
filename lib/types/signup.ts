/**
 * Signup wizard type definitions for Swing Connect
 */

import type { DanceLevel, AuthProvider } from './auth';

export interface SignupState {
  // Current step in the wizard (1, 2, or 3)
  currentStep: 1 | 2 | 3;

  // Step 1: Account information (from social login)
  accountData: {
    provider: AuthProvider | null;
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
  };

  // Step 2: Profile information
  profileData: {
    nickname: string;
    danceLevel: DanceLevel;
    location: string;
    bio: string;
    interests: string[];
  };

  // Step 3: Terms agreement
  termsData: {
    serviceTerms: boolean;
    privacyPolicy: boolean;
    marketingConsent: boolean;
  };

  // Error handling
  errors: Record<string, string>;

  // Loading state
  loading: boolean;
}

export const INITIAL_SIGNUP_STATE: SignupState = {
  currentStep: 1,
  accountData: {
    provider: null,
    uid: '',
    email: '',
    displayName: '',
    photoURL: '',
  },
  profileData: {
    nickname: '',
    danceLevel: 'beginner',
    location: '',
    bio: '',
    interests: [],
  },
  termsData: {
    serviceTerms: false,
    privacyPolicy: false,
    marketingConsent: false,
  },
  errors: {},
  loading: false,
};

export const SIGNUP_STORAGE_KEY = 'swing-connect-signup-progress';

export interface Step {
  number: 1 | 2 | 3;
  label: string;
}

export const SIGNUP_STEPS: Step[] = [
  { number: 1, label: '소셜 로그인' },
  { number: 2, label: '프로필 정보' },
  { number: 3, label: '약관 동의' },
];
