'use client';

import React, { useState, useEffect } from 'react';
import SignupButton from './SignupButton';
import type { SignupState } from '@/lib/types/signup';
import type { DanceLevel } from '@/lib/types/auth';
import { DANCE_LEVELS, REGIONS, DANCE_STYLES, VALIDATION } from '@/lib/constants/profile';

export interface Step2ProfileInfoProps {
  profileData: SignupState['profileData'];
  onNext: () => void;
  onBack: () => void;
  onUpdateProfileData: (data: Partial<SignupState['profileData']>) => void;
}

const Step2ProfileInfo: React.FC<Step2ProfileInfoProps> = ({
  profileData,
  onNext,
  onBack,
  onUpdateProfileData,
}) => {
  const [localData, setLocalData] = useState(profileData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Sync with parent when profileData changes
  useEffect(() => {
    setLocalData(profileData);
  }, [profileData]);

  const validateNickname = (nickname: string): string | null => {
    if (!nickname.trim()) {
      return VALIDATION.NICKNAME.ERROR_MESSAGES.REQUIRED;
    }
    if (nickname.length < VALIDATION.NICKNAME.MIN_LENGTH) {
      return VALIDATION.NICKNAME.ERROR_MESSAGES.MIN_LENGTH;
    }
    if (nickname.length > VALIDATION.NICKNAME.MAX_LENGTH) {
      return VALIDATION.NICKNAME.ERROR_MESSAGES.MAX_LENGTH;
    }
    if (!VALIDATION.NICKNAME.PATTERN.test(nickname)) {
      return VALIDATION.NICKNAME.ERROR_MESSAGES.PATTERN;
    }
    return null;
  };

  const validateLocation = (location: string): string | null => {
    if (!location) {
      return VALIDATION.LOCATION.ERROR_MESSAGES.REQUIRED;
    }
    return null;
  };

  const validateBio = (bio: string): string | null => {
    if (bio.length > VALIDATION.BIO.MAX_LENGTH) {
      return VALIDATION.BIO.ERROR_MESSAGES.MAX_LENGTH;
    }
    return null;
  };

  const handleFieldChange = (field: keyof SignupState['profileData'], value: any) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);

    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: '' }));

    // Update parent immediately
    onUpdateProfileData({ [field]: value });
  };

  const handleBlur = (field: keyof SignupState['profileData']) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    // Validate on blur
    let error: string | null = null;
    if (field === 'nickname') {
      error = validateNickname(localData.nickname);
    } else if (field === 'location') {
      error = validateLocation(localData.location);
    } else if (field === 'bio') {
      error = validateBio(localData.bio);
    }

    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleInterestToggle = (interestValue: string) => {
    const currentInterests = localData.interests || [];
    const newInterests = currentInterests.includes(interestValue)
      ? currentInterests.filter(i => i !== interestValue)
      : [...currentInterests, interestValue];

    handleFieldChange('interests', newInterests);
  };

  const handleNext = () => {
    // Validate all required fields
    const nicknameError = validateNickname(localData.nickname);
    const locationError = validateLocation(localData.location);
    const bioError = validateBio(localData.bio);

    const newErrors: Record<string, string> = {};
    if (nicknameError) newErrors.nickname = nicknameError;
    if (locationError) newErrors.location = locationError;
    if (bioError) newErrors.bio = bioError;

    setErrors(newErrors);

    // Mark all required fields as touched
    setTouched({
      nickname: true,
      danceLevel: true,
      location: true,
      bio: true,
      interests: true,
    });

    // If no errors, proceed to next step
    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  const isFormValid =
    !validateNickname(localData.nickname) &&
    !validateLocation(localData.location) &&
    !validateBio(localData.bio);

  const bioLength = localData.bio.length;
  const isBioOverLimit = bioLength > VALIDATION.BIO.MAX_LENGTH;

  return (
    <>
      <div className="step2-container">
        <div className="step2-card">
          <div className="step2-header">
            <h2 className="step2-title">프로필 정보 입력</h2>
            <p className="step2-description">
              스윙댄스 커뮤니티에서 사용할<br />
              프로필 정보를 입력해주세요
            </p>
          </div>

          <div className="step2-content">
            {/* Nickname Field */}
            <div className="field-group">
              <label htmlFor="nickname" className="field-label required">
                닉네임
              </label>
              <input
                id="nickname"
                type="text"
                className={`field-input ${errors.nickname && touched.nickname ? 'error' : ''}`}
                value={localData.nickname}
                onChange={(e) => handleFieldChange('nickname', e.target.value)}
                onBlur={() => handleBlur('nickname')}
                placeholder="닉네임을 입력하세요 (2-20자)"
                maxLength={VALIDATION.NICKNAME.MAX_LENGTH}
                aria-invalid={!!(errors.nickname && touched.nickname)}
                aria-describedby={errors.nickname && touched.nickname ? 'nickname-error' : undefined}
              />
              {errors.nickname && touched.nickname && (
                <span id="nickname-error" className="field-error" role="alert">
                  {errors.nickname}
                </span>
              )}
            </div>

            {/* Dance Level Field */}
            <div className="field-group">
              <label htmlFor="danceLevel" className="field-label required">
                댄스 레벨
              </label>
              <select
                id="danceLevel"
                className="field-select"
                value={localData.danceLevel}
                onChange={(e) => handleFieldChange('danceLevel', e.target.value as DanceLevel)}
                aria-label="댄스 레벨 선택"
              >
                {DANCE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label} - {level.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Field */}
            <div className="field-group">
              <label htmlFor="location" className="field-label required">
                활동 지역
              </label>
              <select
                id="location"
                className={`field-select ${errors.location && touched.location ? 'error' : ''}`}
                value={localData.location}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                onBlur={() => handleBlur('location')}
                aria-invalid={!!(errors.location && touched.location)}
                aria-describedby={errors.location && touched.location ? 'location-error' : undefined}
              >
                <option value="">지역을 선택하세요</option>
                {REGIONS.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
              {errors.location && touched.location && (
                <span id="location-error" className="field-error" role="alert">
                  {errors.location}
                </span>
              )}
            </div>

            {/* Bio Field (Optional) */}
            <div className="field-group">
              <label htmlFor="bio" className="field-label">
                자기소개 <span className="optional-label">(선택)</span>
              </label>
              <textarea
                id="bio"
                className={`field-textarea ${isBioOverLimit ? 'error' : ''}`}
                value={localData.bio}
                onChange={(e) => handleFieldChange('bio', e.target.value)}
                onBlur={() => handleBlur('bio')}
                placeholder="간단한 자기소개를 작성해주세요"
                rows={4}
                aria-invalid={isBioOverLimit}
                aria-describedby="bio-counter"
              />
              <div
                id="bio-counter"
                className={`char-counter ${isBioOverLimit ? 'over-limit' : ''}`}
                aria-live="polite"
              >
                {bioLength} / {VALIDATION.BIO.MAX_LENGTH}
              </div>
              {errors.bio && touched.bio && (
                <span className="field-error" role="alert">
                  {errors.bio}
                </span>
              )}
            </div>

            {/* Dance Styles (Optional) */}
            <div className="field-group">
              <label className="field-label">
                관심 댄스 스타일 <span className="optional-label">(선택)</span>
              </label>
              <div className="chip-container" role="group" aria-label="관심 댄스 스타일 선택">
                {DANCE_STYLES.map((style) => {
                  const isSelected = localData.interests.includes(style.value);
                  return (
                    <button
                      key={style.value}
                      type="button"
                      className={`chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleInterestToggle(style.value)}
                      aria-pressed={isSelected}
                      aria-label={`${style.label} ${isSelected ? '선택됨' : '선택 안됨'}`}
                    >
                      {style.icon && <span className="chip-icon">{style.icon}</span>}
                      <span className="chip-label">{style.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="button-group">
              <SignupButton
                variant="primary"
                onClick={onBack}
                type="button"
                style={{ flex: 1 }}
                aria-label="이전 단계로"
                data-testid="back-button"
              >
                이전
              </SignupButton>
              <SignupButton
                variant="primary"
                onClick={handleNext}
                disabled={!isFormValid}
                type="button"
                style={{ flex: 2 }}
                aria-label="다음 단계로"
                data-testid="next-button"
              >
                다음
              </SignupButton>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .step2-container {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 70vh;
          padding: 24px;
        }

        .step2-card {
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

        .step2-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .step2-title {
          font-size: 28px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0 0 16px 0;
          letter-spacing: -0.5px;
        }

        .step2-description {
          font-size: 15px;
          color: #666;
          line-height: 1.6;
          margin: 0;
        }

        .step2-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-label {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .field-label.required::after {
          content: ' *';
          color: #ef4444;
        }

        .optional-label {
          font-weight: 400;
          color: #999;
          font-size: 13px;
        }

        .field-input,
        .field-select,
        .field-textarea {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 15px;
          color: #1a1a1a;
          background: white;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .field-input:focus,
        .field-select:focus,
        .field-textarea:focus {
          outline: none;
          border-color: #693BF2;
          box-shadow: 0 0 0 3px rgba(105, 59, 242, 0.1);
        }

        .field-input.error,
        .field-select.error,
        .field-textarea.error {
          border-color: #ef4444;
        }

        .field-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .field-error {
          font-size: 13px;
          color: #ef4444;
          font-weight: 500;
        }

        .char-counter {
          font-size: 13px;
          color: #999;
          text-align: right;
          margin-top: -4px;
        }

        .char-counter.over-limit {
          color: #ef4444;
          font-weight: 600;
        }

        .chip-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 24px;
          background: white;
          font-size: 14px;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .chip:hover {
          border-color: #693BF2;
          background: rgba(105, 59, 242, 0.05);
        }

        .chip.selected {
          border-color: #693BF2;
          background: #693BF2;
          color: white;
        }

        .chip-icon {
          font-size: 16px;
          line-height: 1;
        }

        .chip-label {
          line-height: 1;
        }

        .button-group {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        @media (max-width: 768px) {
          .step2-container {
            padding: 16px;
          }

          .step2-card {
            padding: 32px 24px;
            border-radius: 20px;
          }

          .step2-title {
            font-size: 24px;
          }

          .step2-description {
            font-size: 14px;
          }

          .step2-content {
            gap: 20px;
          }

          .button-group {
            flex-direction: column;
          }

          .button-group > * {
            flex: 1 !important;
          }
        }

        @media (max-width: 480px) {
          .step2-card {
            padding: 28px 20px;
          }

          .step2-title {
            font-size: 22px;
          }

          .step2-header {
            margin-bottom: 32px;
          }

          .chip {
            padding: 8px 14px;
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
};

Step2ProfileInfo.displayName = 'Step2ProfileInfo';

export default Step2ProfileInfo;
