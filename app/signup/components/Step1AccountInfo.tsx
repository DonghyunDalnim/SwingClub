'use client';

import React, { useState } from 'react';
import SignupButton from './SignupButton';
import { signInWithGoogle } from '@/lib/auth/providers';
import type { SignupState } from '@/lib/types/signup';

export interface Step1AccountInfoProps {
  onNext: () => void;
  onUpdateAccountData: (data: Partial<SignupState['accountData']>) => void;
}

const Step1AccountInfo: React.FC<Step1AccountInfoProps> = ({ onNext, onUpdateAccountData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      // Call Firebase Google authentication
      const user = await signInWithGoogle();

      // Update account data in SignupWizard state
      onUpdateAccountData({
        provider: 'google',
        uid: user.id,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
      });

      // Auto-advance to next step
      onNext();
    } catch (err: any) {
      console.error('Google login failed:', err);

      // Handle specific error codes first, then custom messages
      if (err.code === 'auth/popup-blocked') {
        setError('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('로그인이 취소되었습니다.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
      } else if (err.message && typeof err.message === 'string') {
        setError(err.message);
      } else {
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="step1-container" data-testid="step-1">
        <div className="step1-card">
          <div className="step1-header">
            <h2 className="step1-title">소셜 계정으로 시작하기</h2>
            <p className="step1-description">
              Google 계정으로 간편하게 가입하고<br />
              스윙댄스 커뮤니티에 참여하세요
            </p>
          </div>

          <div className="step1-content">
            {error && (
              <div className="error-message" role="alert" data-testid="error-message">
                <span className="error-icon" data-testid="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
              </div>
            )}

            <SignupButton
              variant="social-google"
              loading={loading}
              onClick={handleGoogleLogin}
              aria-label="Google로 계속하기"
              data-testid="google-signup-button"
            >
              Google로 계속하기
            </SignupButton>

            <div className="divider">
              <span className="divider-text">안전하고 빠른 가입</span>
            </div>

            <div className="info-section">
              <div className="info-item">
                <span className="info-icon">🔒</span>
                <span className="info-text">안전한 소셜 로그인</span>
              </div>
              <div className="info-item">
                <span className="info-icon">⚡</span>
                <span className="info-text">빠른 회원가입</span>
              </div>
              <div className="info-item">
                <span className="info-icon">✨</span>
                <span className="info-text">간편한 정보 입력</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .step1-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
          padding: 24px;
        }

        .step1-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px;
          max-width: 480px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .step1-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .step1-title {
          font-size: 28px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0 0 16px 0;
          letter-spacing: -0.5px;
        }

        .step1-description {
          font-size: 15px;
          color: #666;
          line-height: 1.6;
          margin: 0;
        }

        .step1-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .error-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .error-text {
          font-size: 14px;
          color: #dc2626;
          font-weight: 500;
          line-height: 1.5;
        }

        .divider {
          position: relative;
          text-align: center;
          margin: 12px 0;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            to right,
            transparent,
            rgba(0, 0, 0, 0.1),
            transparent
          );
        }

        .divider-text {
          position: relative;
          display: inline-block;
          padding: 0 16px;
          background: rgba(255, 255, 255, 0.95);
          font-size: 13px;
          color: #999;
          font-weight: 500;
        }

        .info-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 20px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-radius: 16px;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .info-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .info-text {
          font-size: 14px;
          color: #4a5568;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .step1-container {
            padding: 16px;
            min-height: 50vh;
          }

          .step1-card {
            padding: 32px 24px;
            border-radius: 20px;
          }

          .step1-title {
            font-size: 24px;
          }

          .step1-description {
            font-size: 14px;
          }

          .info-section {
            padding: 16px;
          }
        }

        @media (max-width: 480px) {
          .step1-card {
            padding: 28px 20px;
          }

          .step1-title {
            font-size: 22px;
          }

          .step1-header {
            margin-bottom: 32px;
          }
        }
      `}</style>
    </>
  );
};

Step1AccountInfo.displayName = 'Step1AccountInfo';

export default Step1AccountInfo;
