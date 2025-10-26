'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks'
import { useState } from 'react'
import { Button } from '@/components/core/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/Card'
import Typography from '@/components/core/Typography'
import { DanceStyleSelector } from './components/DanceStyleSelector'
import { theme } from '@/lib/theme'
import type { DanceStyle, DanceLevel } from '@/lib/types/auth'

export default function ProfileEditPage() {
  const router = useRouter()
  const { user, updateProfile } = useAuth()

  // 폼 상태
  const [nickname, setNickname] = useState(user?.profile?.nickname || '')
  const [danceLevel, setDanceLevel] = useState<DanceLevel>(
    user?.profile?.danceLevel || 'beginner'
  )
  const [location, setLocation] = useState(user?.profile?.location || '')
  const [bio, setBio] = useState(user?.profile?.bio || '')
  const [danceStyles, setDanceStyles] = useState<DanceStyle[]>(
    user?.profile?.danceStyles || []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await updateProfile({
        nickname,
        danceLevel,
        location,
        bio,
        danceStyles,
        interests: user?.profile?.interests || []
      })

      // 성공 시 프로필 페이지로 이동
      router.push('/profile')
    } catch (err) {
      setError('프로필 업데이트에 실패했습니다. 다시 시도해주세요.')
      console.error('Profile update error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (confirm('변경사항을 저장하지 않고 나가시겠습니까?')) {
      router.push('/profile')
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="header">
          <div>
            <Typography variant="h2" as="h1">
              프로필 편집
            </Typography>
            <Typography
              variant="small"
              as="p"
              style={{ color: theme.colors.neutral.medium, marginTop: '8px' }}
            >
              나의 댄스 프로필을 설정해보세요
            </Typography>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-sections">
            {/* 기본 정보 */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>
                  <Typography variant="h4" as="h2">
                    기본 정보
                  </Typography>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="form-group">
                  <label htmlFor="nickname" className="label">
                    닉네임 <span className="required">*</span>
                  </label>
                  <input
                    id="nickname"
                    type="text"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    className="input"
                    required
                    maxLength={20}
                    placeholder="닉네임을 입력하세요"
                    aria-required="true"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="danceLevel" className="label">
                    댄스 레벨 <span className="required">*</span>
                  </label>
                  <select
                    id="danceLevel"
                    value={danceLevel}
                    onChange={e => setDanceLevel(e.target.value as DanceLevel)}
                    className="select"
                    required
                    aria-required="true"
                  >
                    <option value="beginner">초급</option>
                    <option value="intermediate">중급</option>
                    <option value="advanced">고급</option>
                    <option value="professional">전문가</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="location" className="label">
                    활동 지역 <span className="required">*</span>
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="input"
                    required
                    placeholder="예: 서울 강남구"
                    aria-required="true"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio" className="label">
                    자기소개
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className="textarea"
                    rows={4}
                    maxLength={200}
                    placeholder="자신을 소개해주세요 (선택)"
                  />
                  <div className="char-count">
                    {bio.length}/200
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 댄스 스타일 */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>
                  <Typography variant="h4" as="h2">
                    댄스 스타일
                  </Typography>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DanceStyleSelector
                  value={danceStyles}
                  onChange={setDanceStyles}
                  disabled={isSubmitting}
                  aria-label="댄스 스타일 선택 및 레벨 설정"
                />
              </CardContent>
            </Card>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="actions">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              loadingText="저장 중..."
            >
              저장하기
            </Button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: ${theme.colors.neutral.background};
          padding-bottom: 100px;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 32px 16px;
        }

        .header {
          margin-bottom: 32px;
        }

        .form-sections {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: ${theme.colors.neutral.darkest};
          margin-bottom: 8px;
        }

        .required {
          color: ${theme.colors.accent.red};
        }

        .input,
        .select,
        .textarea {
          width: 100%;
          padding: 12px 16px;
          font-size: 16px;
          font-family: ${theme.typography.fontFamily.primary};
          color: ${theme.colors.neutral.darkest};
          background: ${theme.colors.white};
          border: 1px solid ${theme.colors.neutral.light};
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .input:focus,
        .select:focus,
        .textarea:focus {
          outline: none;
          border-color: ${theme.colors.primary.main};
          box-shadow: 0 0 0 3px rgba(105, 59, 242, 0.1);
        }

        .input::placeholder,
        .textarea::placeholder {
          color: ${theme.colors.neutral.medium};
        }

        .textarea {
          resize: vertical;
          min-height: 100px;
        }

        .char-count {
          text-align: right;
          font-size: 12px;
          color: ${theme.colors.neutral.medium};
          margin-top: 4px;
        }

        .error-message {
          background: ${theme.colors.accent.red};
          color: ${theme.colors.white};
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 24px;
          text-align: center;
        }

        .actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        /* 반응형 */
        @media (max-width: 768px) {
          .container {
            padding: 24px 16px;
          }

          .actions {
            flex-direction: column-reverse;
          }

          .actions :global(button) {
            width: 100%;
          }
        }

        /* 모션 감소 사용자 지원 */
        @media (prefers-reduced-motion: reduce) {
          .input,
          .select,
          .textarea {
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}
