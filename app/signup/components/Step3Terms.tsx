'use client';

import React, { useState, useEffect } from 'react';
import SignupButton from './SignupButton';
import type { SignupState } from '@/lib/types/signup';

export interface Step3TermsProps {
  termsData: SignupState['termsData'];
  loading: boolean;
  onBack: () => void;
  onSubmit: () => void;
  onUpdateTermsData: (data: Partial<SignupState['termsData']>) => void;
}

const Step3Terms: React.FC<Step3TermsProps> = ({
  termsData,
  loading,
  onBack,
  onSubmit,
  onUpdateTermsData,
}) => {
  const [localData, setLocalData] = useState(termsData);

  // Sync with parent when termsData changes
  useEffect(() => {
    setLocalData(termsData);
  }, [termsData]);

  // Check if all terms are agreed (for "agree all" checkbox)
  const allAgreed =
    localData.serviceTerms && localData.privacyPolicy && localData.marketingConsent;

  // Check if required terms are agreed (for submit button)
  const requiredAgreed = localData.serviceTerms && localData.privacyPolicy;

  const handleTermChange = (term: keyof SignupState['termsData'], value: boolean) => {
    const newData = { ...localData, [term]: value };
    setLocalData(newData);
    onUpdateTermsData({ [term]: value });
  };

  const handleAgreeAll = () => {
    const newValue = !allAgreed;
    const newData = {
      serviceTerms: newValue,
      privacyPolicy: newValue,
      marketingConsent: newValue,
    };
    setLocalData(newData);
    onUpdateTermsData(newData);
  };

  const handleSubmit = () => {
    if (requiredAgreed && !loading) {
      onSubmit();
    }
  };

  const handleViewTerms = (type: 'service' | 'privacy') => {
    const url = type === 'service' ? '/terms/service' : '/terms/privacy';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="step3-container">
        <div className="step3-card">
          <div className="step3-header">
            <h2 className="step3-title">약관 동의</h2>
            <p className="step3-description">
              서비스 이용을 위해<br />
              약관에 동의해주세요
            </p>
          </div>

          <div className="step3-content">
            {/* Agree All Checkbox */}
            <div className="checkbox-item all">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={allAgreed}
                  onChange={handleAgreeAll}
                  aria-label="전체 동의"
                />
                <span className="checkbox-custom" aria-hidden="true">
                  {allAgreed && <span className="checkmark">✓</span>}
                </span>
                <span className="checkbox-text">전체 동의</span>
              </label>
            </div>

            <div className="divider" />

            {/* Service Terms (Required) */}
            <div className="checkbox-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={localData.serviceTerms}
                  onChange={(e) => handleTermChange('serviceTerms', e.target.checked)}
                  aria-label="서비스 이용약관 동의 (필수)"
                  aria-required="true"
                />
                <span className="checkbox-custom" aria-hidden="true">
                  {localData.serviceTerms && <span className="checkmark">✓</span>}
                </span>
                <span className="checkbox-text">
                  <span className="term-title">
                    서비스 이용약관 <span className="required">(필수)</span>
                  </span>
                </span>
              </label>
              <button
                type="button"
                className="view-link"
                onClick={() => handleViewTerms('service')}
                aria-label="서비스 이용약관 보기"
              >
                보기
              </button>
            </div>

            {/* Privacy Policy (Required) */}
            <div className="checkbox-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={localData.privacyPolicy}
                  onChange={(e) => handleTermChange('privacyPolicy', e.target.checked)}
                  aria-label="개인정보 처리방침 동의 (필수)"
                  aria-required="true"
                />
                <span className="checkbox-custom" aria-hidden="true">
                  {localData.privacyPolicy && <span className="checkmark">✓</span>}
                </span>
                <span className="checkbox-text">
                  <span className="term-title">
                    개인정보 처리방침 <span className="required">(필수)</span>
                  </span>
                </span>
              </label>
              <button
                type="button"
                className="view-link"
                onClick={() => handleViewTerms('privacy')}
                aria-label="개인정보 처리방침 보기"
              >
                보기
              </button>
            </div>

            {/* Marketing Consent (Optional) */}
            <div className="checkbox-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={localData.marketingConsent}
                  onChange={(e) => handleTermChange('marketingConsent', e.target.checked)}
                  aria-label="마케팅 정보 수신 동의 (선택)"
                />
                <span className="checkbox-custom" aria-hidden="true">
                  {localData.marketingConsent && <span className="checkmark">✓</span>}
                </span>
                <span className="checkbox-text">
                  <span className="term-title">마케팅 정보 수신 동의 <span className="optional">(선택)</span></span>
                  <span className="term-description">
                    이벤트, 프로모션 등 마케팅 정보를 이메일로 받아보실 수 있습니다.
                  </span>
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="button-group">
              <SignupButton
                variant="primary"
                onClick={onBack}
                disabled={loading}
                type="button"
                style={{ flex: 1 }}
                aria-label="이전 단계로"
                data-testid="back-button"
              >
                이전
              </SignupButton>
              <SignupButton
                variant="primary"
                onClick={handleSubmit}
                disabled={!requiredAgreed || loading}
                loading={loading}
                type="button"
                style={{ flex: 2 }}
                aria-label="회원가입 완료"
                data-testid="submit-button"
              >
                {loading ? '처리 중...' : '회원가입 완료'}
              </SignupButton>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .step3-container {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 70vh;
          padding: 24px;
        }

        .step3-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px;
          max-width: 560px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .step3-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .step3-title {
          font-size: 28px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0 0 16px 0;
          letter-spacing: -0.5px;
        }

        .step3-description {
          font-size: 15px;
          color: #666;
          line-height: 1.6;
          margin: 0;
        }

        .step3-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .checkbox-item {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 16px;
          border-radius: 12px;
          transition: background-color 0.2s ease;
        }

        .checkbox-item:hover {
          background: rgba(105, 59, 242, 0.03);
        }

        .checkbox-item.all {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
          border: 2px solid rgba(105, 59, 242, 0.2);
          padding: 20px;
          font-weight: 600;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          flex: 1;
        }

        .checkbox-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .checkbox-custom {
          position: relative;
          width: 24px;
          height: 24px;
          border: 2px solid #d1d5db;
          border-radius: 6px;
          background: white;
          transition: all 0.2s ease;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .checkbox-input:checked + .checkbox-custom {
          background: #693BF2;
          border-color: #693BF2;
        }

        .checkbox-input:focus + .checkbox-custom {
          outline: 2px solid #693BF2;
          outline-offset: 2px;
        }

        .checkmark {
          color: white;
          font-size: 16px;
          font-weight: bold;
          line-height: 1;
        }

        .checkbox-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .term-title {
          font-size: 15px;
          color: #1a1a1a;
          font-weight: 500;
        }

        .term-description {
          font-size: 13px;
          color: #666;
          line-height: 1.5;
        }

        .required {
          color: #ef4444;
          font-weight: 600;
        }

        .optional {
          color: #999;
          font-weight: 400;
        }

        .view-link {
          font-size: 14px;
          color: #693BF2;
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: underline;
          padding: 0 8px;
          flex-shrink: 0;
          transition: color 0.2s ease;
        }

        .view-link:hover {
          color: #5729d1;
        }

        .view-link:focus {
          outline: 2px solid #693BF2;
          outline-offset: 2px;
          border-radius: 4px;
        }

        .divider {
          height: 1px;
          background: linear-gradient(
            to right,
            transparent,
            rgba(0, 0, 0, 0.1),
            transparent
          );
          margin: 8px 0;
        }

        .button-group {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        @media (max-width: 768px) {
          .step3-container {
            padding: 16px;
          }

          .step3-card {
            padding: 32px 24px;
            border-radius: 20px;
          }

          .step3-title {
            font-size: 24px;
          }

          .step3-description {
            font-size: 14px;
          }

          .step3-content {
            gap: 16px;
          }

          .checkbox-item {
            padding: 12px;
          }

          .checkbox-item.all {
            padding: 16px;
          }

          .button-group {
            flex-direction: column;
          }

          .button-group > * {
            flex: 1 !important;
          }
        }

        @media (max-width: 480px) {
          .step3-card {
            padding: 28px 20px;
          }

          .step3-title {
            font-size: 22px;
          }

          .step3-header {
            margin-bottom: 32px;
          }

          .term-title {
            font-size: 14px;
          }

          .term-description {
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
};

Step3Terms.displayName = 'Step3Terms';

export default Step3Terms;
