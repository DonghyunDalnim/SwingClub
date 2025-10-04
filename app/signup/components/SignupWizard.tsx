'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StepIndicator from './StepIndicator';
import type { SignupState } from '@/lib/types/signup';
import { INITIAL_SIGNUP_STATE, SIGNUP_STORAGE_KEY, SIGNUP_STEPS } from '@/lib/types/signup';

export default function SignupWizard() {
  const router = useRouter();
  const [state, setState] = useState<SignupState>(INITIAL_SIGNUP_STATE);

  // Load saved state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(SIGNUP_STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setState(parsed);
      }
    } catch (error) {
      console.error('Failed to load signup progress:', error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save signup progress:', error);
    }
  }, [state]);

  const handleNextStep = () => {
    if (state.currentStep < 3) {
      setState(prev => ({
        ...prev,
        currentStep: (prev.currentStep + 1) as 1 | 2 | 3,
        errors: {},
      }));
    }
  };

  const handleBackStep = () => {
    if (state.currentStep > 1) {
      setState(prev => ({
        ...prev,
        currentStep: (prev.currentStep - 1) as 1 | 2 | 3,
        errors: {},
      }));
    }
  };

  const handleSignupSubmit = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, errors: {} }));

      // Validate required terms
      if (!state.termsData.serviceTerms || !state.termsData.privacyPolicy) {
        setState(prev => ({
          ...prev,
          loading: false,
          errors: { terms: '필수 약관에 동의해주세요' },
        }));
        return;
      }

      // Here we'll integrate with Firebase/Auth in future issues
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Clear localStorage after successful signup
      localStorage.removeItem(SIGNUP_STORAGE_KEY);

      // Redirect to home
      router.push('/home');
    } catch (error) {
      console.error('Signup failed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        errors: { submit: '회원가입에 실패했습니다. 다시 시도해주세요.' },
      }));
    }
  };

  const updateAccountData = (data: Partial<SignupState['accountData']>) => {
    setState(prev => ({
      ...prev,
      accountData: { ...prev.accountData, ...data },
    }));
  };

  const updateProfileData = (data: Partial<SignupState['profileData']>) => {
    setState(prev => ({
      ...prev,
      profileData: { ...prev.profileData, ...data },
    }));
  };

  const updateTermsData = (data: Partial<SignupState['termsData']>) => {
    setState(prev => ({
      ...prev,
      termsData: { ...prev.termsData, ...data },
    }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        padding: '48px 32px',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.15)',
      }}>
        {/* Progress Indicator */}
        <div style={{ marginBottom: '48px' }}>
          <StepIndicator currentStep={state.currentStep} steps={SIGNUP_STEPS} />
        </div>

        {/* Step Content - Placeholder for now */}
        <div style={{ marginBottom: '32px' }}>
          {state.currentStep === 1 && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: '#1a1a1a' }}>
                소셜 계정으로 시작하기
              </h2>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
                Google 계정으로 간편하게 가입하세요
              </p>
              {/* Step1AccountInfo will be implemented in issue #67 */}
              <div style={{
                padding: '24px',
                background: '#f9fafb',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#666'
              }}>
                Step 1: 소셜 로그인 UI (Issue #67에서 구현 예정)
              </div>
            </div>
          )}

          {state.currentStep === 2 && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: '#1a1a1a' }}>
                프로필 정보 입력
              </h2>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
                스윙댄스 커뮤니티에서 사용할 프로필을 설정하세요
              </p>
              {/* Step2ProfileInfo will be implemented in issue #68 */}
              <div style={{
                padding: '24px',
                background: '#f9fafb',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#666'
              }}>
                Step 2: 프로필 정보 UI (Issue #68에서 구현 예정)
              </div>
            </div>
          )}

          {state.currentStep === 3 && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: '#1a1a1a' }}>
                약관 동의
              </h2>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
                서비스 이용을 위한 약관에 동의해주세요
              </p>
              {/* Step3Terms will be implemented in issue #69 */}
              <div style={{
                padding: '24px',
                background: '#f9fafb',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#666'
              }}>
                Step 3: 약관 동의 UI (Issue #69에서 구현 예정)
              </div>
            </div>
          )}
        </div>

        {/* Error Messages */}
        {Object.keys(state.errors).length > 0 && (
          <div style={{
            padding: '16px',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            {Object.values(state.errors).map((error, index) => (
              <p key={index} style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>
                {error}
              </p>
            ))}
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: state.currentStep === 1 ? 'flex-end' : 'space-between'
        }}>
          {state.currentStep > 1 && (
            <button
              onClick={handleBackStep}
              disabled={state.loading}
              style={{
                padding: '16px 32px',
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: state.loading ? 'not-allowed' : 'pointer',
                opacity: state.loading ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              이전
            </button>
          )}

          {state.currentStep < 3 ? (
            <button
              onClick={handleNextStep}
              disabled={state.loading}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: state.loading ? 'not-allowed' : 'pointer',
                opacity: state.loading ? 0.5 : 1,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleSignupSubmit}
              disabled={state.loading}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: state.loading ? 'not-allowed' : 'pointer',
                opacity: state.loading ? 0.5 : 1,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              {state.loading ? '가입 중...' : '회원가입 완료'}
            </button>
          )}
        </div>

        {/* Helper Text */}
        <p style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#9ca3af'
        }}>
          이미 계정이 있으신가요?{' '}
          <a
            href="/login"
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            로그인
          </a>
        </p>
      </div>
    </div>
  );
}
