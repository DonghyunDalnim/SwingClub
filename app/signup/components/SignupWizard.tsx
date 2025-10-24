'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StepIndicator from './StepIndicator';
import Step1AccountInfo from './Step1AccountInfo';
import Step2ProfileInfo from './Step2ProfileInfo';
import Step3Terms from './Step3Terms';
import type { SignupState } from '@/lib/types/signup';
import { INITIAL_SIGNUP_STATE, SIGNUP_STORAGE_KEY, SIGNUP_STEPS } from '@/lib/types/signup';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

      // Save user profile to Firestore
      const userRef = doc(db, 'users', state.accountData.uid);
      await setDoc(userRef, {
        uid: state.accountData.uid,
        email: state.accountData.email,
        displayName: state.accountData.displayName,
        photoURL: state.accountData.photoURL,
        provider: state.accountData.provider,
        profile: {
          nickname: state.profileData.nickname,
          danceLevel: state.profileData.danceLevel,
          location: state.profileData.location,
          bio: state.profileData.bio,
          interests: state.profileData.interests,
        },
        termsAgreed: {
          serviceTerms: state.termsData.serviceTerms,
          privacyPolicy: state.termsData.privacyPolicy,
          marketingConsent: state.termsData.marketingConsent,
          agreedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });

      // Clear localStorage after successful signup
      localStorage.removeItem(SIGNUP_STORAGE_KEY);

      // Redirect to home
      router.push('/home');
    } catch (error: any) {
      console.error('Signup failed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        errors: { submit: error.message || '회원가입에 실패했습니다. 다시 시도해주세요.' },
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
      <div data-testid="signup-wizard" style={{
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

        {/* Step Content */}
        <div style={{ marginBottom: '32px' }}>
          {state.currentStep === 1 && (
            <Step1AccountInfo
              onNext={handleNextStep}
              onUpdateAccountData={updateAccountData}
            />
          )}

          {state.currentStep === 2 && (
            <Step2ProfileInfo
              profileData={state.profileData}
              onNext={handleNextStep}
              onBack={handleBackStep}
              onUpdateProfileData={updateProfileData}
            />
          )}

          {state.currentStep === 3 && (
            <Step3Terms
              termsData={state.termsData}
              loading={state.loading}
              onBack={handleBackStep}
              onSubmit={handleSignupSubmit}
              onUpdateTermsData={updateTermsData}
            />
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
