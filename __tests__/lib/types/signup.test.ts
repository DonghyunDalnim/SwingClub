/**
 * Tests for signup type definitions
 */

import {
  INITIAL_SIGNUP_STATE,
  SIGNUP_STORAGE_KEY,
  SIGNUP_STEPS,
  type SignupState,
  type Step,
} from '@/lib/types/signup';

describe('Signup Types', () => {
  describe('INITIAL_SIGNUP_STATE', () => {
    it('should have currentStep as 1', () => {
      expect(INITIAL_SIGNUP_STATE.currentStep).toBe(1);
    });

    it('should have empty accountData', () => {
      expect(INITIAL_SIGNUP_STATE.accountData).toEqual({
        provider: null,
        uid: '',
        email: '',
        displayName: '',
        photoURL: '',
      });
    });

    it('should have default profileData with beginner level', () => {
      expect(INITIAL_SIGNUP_STATE.profileData).toEqual({
        nickname: '',
        danceLevel: 'beginner',
        location: '',
        bio: '',
        interests: [],
      });
    });

    it('should have all terms as false', () => {
      expect(INITIAL_SIGNUP_STATE.termsData).toEqual({
        serviceTerms: false,
        privacyPolicy: false,
        marketingConsent: false,
      });
    });

    it('should have empty errors object', () => {
      expect(INITIAL_SIGNUP_STATE.errors).toEqual({});
    });

    it('should have loading as false', () => {
      expect(INITIAL_SIGNUP_STATE.loading).toBe(false);
    });
  });

  describe('SIGNUP_STORAGE_KEY', () => {
    it('should be a string', () => {
      expect(typeof SIGNUP_STORAGE_KEY).toBe('string');
    });

    it('should have correct value', () => {
      expect(SIGNUP_STORAGE_KEY).toBe('swing-connect-signup-progress');
    });
  });

  describe('SIGNUP_STEPS', () => {
    it('should have 3 steps', () => {
      expect(SIGNUP_STEPS).toHaveLength(3);
    });

    it('should have correct step numbers', () => {
      expect(SIGNUP_STEPS[0].number).toBe(1);
      expect(SIGNUP_STEPS[1].number).toBe(2);
      expect(SIGNUP_STEPS[2].number).toBe(3);
    });

    it('should have Korean labels', () => {
      expect(SIGNUP_STEPS[0].label).toBe('소셜 로그인');
      expect(SIGNUP_STEPS[1].label).toBe('프로필 정보');
      expect(SIGNUP_STEPS[2].label).toBe('약관 동의');
    });

    it('should match Step type structure', () => {
      SIGNUP_STEPS.forEach(step => {
        expect(step).toHaveProperty('number');
        expect(step).toHaveProperty('label');
        expect(typeof step.number).toBe('number');
        expect(typeof step.label).toBe('string');
      });
    });
  });

  describe('SignupState Type', () => {
    it('should allow valid currentStep values', () => {
      const validSteps: Array<SignupState['currentStep']> = [1, 2, 3];
      validSteps.forEach(step => {
        const state: SignupState = {
          ...INITIAL_SIGNUP_STATE,
          currentStep: step,
        };
        expect(state.currentStep).toBe(step);
      });
    });

    it('should allow all DanceLevel values', () => {
      const levels: Array<SignupState['profileData']['danceLevel']> = [
        'beginner',
        'intermediate',
        'advanced',
        'professional',
      ];

      levels.forEach(level => {
        const state: SignupState = {
          ...INITIAL_SIGNUP_STATE,
          profileData: {
            ...INITIAL_SIGNUP_STATE.profileData,
            danceLevel: level,
          },
        };
        expect(state.profileData.danceLevel).toBe(level);
      });
    });

    it('should allow updating accountData', () => {
      const state: SignupState = {
        ...INITIAL_SIGNUP_STATE,
        accountData: {
          provider: 'google',
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: 'https://example.com/photo.jpg',
        },
      };

      expect(state.accountData.provider).toBe('google');
      expect(state.accountData.uid).toBe('test-uid');
      expect(state.accountData.email).toBe('test@example.com');
    });

    it('should allow updating profileData', () => {
      const state: SignupState = {
        ...INITIAL_SIGNUP_STATE,
        profileData: {
          nickname: 'SwingDancer',
          danceLevel: 'intermediate',
          location: '서울',
          bio: '스윙댄스를 사랑합니다',
          interests: ['Lindy Hop', 'Charleston'],
        },
      };

      expect(state.profileData.nickname).toBe('SwingDancer');
      expect(state.profileData.danceLevel).toBe('intermediate');
      expect(state.profileData.interests).toHaveLength(2);
    });

    it('should allow updating termsData', () => {
      const state: SignupState = {
        ...INITIAL_SIGNUP_STATE,
        termsData: {
          serviceTerms: true,
          privacyPolicy: true,
          marketingConsent: false,
        },
      };

      expect(state.termsData.serviceTerms).toBe(true);
      expect(state.termsData.privacyPolicy).toBe(true);
      expect(state.termsData.marketingConsent).toBe(false);
    });

    it('should allow setting errors', () => {
      const state: SignupState = {
        ...INITIAL_SIGNUP_STATE,
        errors: {
          nickname: '닉네임은 2-20자여야 합니다',
          terms: '필수 약관에 동의해주세요',
        },
      };

      expect(state.errors.nickname).toBe('닉네임은 2-20자여야 합니다');
      expect(state.errors.terms).toBe('필수 약관에 동의해주세요');
    });

    it('should allow setting loading state', () => {
      const state: SignupState = {
        ...INITIAL_SIGNUP_STATE,
        loading: true,
      };

      expect(state.loading).toBe(true);
    });
  });

  describe('Step Type', () => {
    it('should have number and label properties', () => {
      const step: Step = {
        number: 1,
        label: '테스트',
      };

      expect(step.number).toBe(1);
      expect(step.label).toBe('테스트');
    });

    it('should allow all valid step numbers', () => {
      const numbers: Array<Step['number']> = [1, 2, 3];

      numbers.forEach(num => {
        const step: Step = {
          number: num,
          label: `Step ${num}`,
        };
        expect(step.number).toBe(num);
      });
    });
  });
});
