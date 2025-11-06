'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks'
import { useState, useEffect } from 'react'
import { Button } from '@/components/core/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/Card'
import Typography from '@/components/core/Typography'
import { DanceStyleSelector } from './components/DanceStyleSelector'
import { Toast, ToastContainer } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { updateUserProfile } from '@/lib/actions/profile'
import { theme } from '@/lib/theme'
import type { DanceStyle, DanceLevel } from '@/lib/types/auth'

export default function ProfileEditPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toasts, showSuccess, showError, removeToast } = useToast()

  // 폼 상태
  const [nickname, setNickname] = useState('')
  const [danceLevel, setDanceLevel] = useState<DanceLevel>('beginner')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [danceStyles, setDanceStyles] = useState<DanceStyle[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 사용자 데이터 로딩
  useEffect(() => {
    if (user?.profile) {
      setNickname(user.profile.nickname || '')
      setDanceLevel(user.profile.danceLevel || 'beginner')
      setLocation(user.profile.location || '')
      setBio(user.profile.bio || '')
      setDanceStyles(user.profile.danceStyles || [])
      setIsLoading(false)
    } else if (user) {
      // 프로필이 없는 경우에도 로딩 완료
      setIsLoading(false)
    }
  }, [user])

  // 클라이언트 측 유효성 검증
  const validateForm = (): { valid: boolean; error?: string } => {
    if (!nickname.trim()) {
      return { valid: false, error: '닉네임을 입력해주세요.' }
    }

    if (nickname.length > 20) {
      return { valid: false, error: '닉네임은 20자 이하여야 합니다.' }
    }

    if (!location.trim()) {
      return { valid: false, error: '활동 지역을 입력해주세요.' }
    }

    if (bio && bio.length > 200) {
      return { valid: false, error: '자기소개는 200자 이하여야 합니다.' }
    }

    if (danceStyles.length > 10) {
      return { valid: false, error: '댄스 스타일은 최대 10개까지 선택할 수 있습니다.' }
    }

    // 댄스 스타일 레벨 검증
    for (const style of danceStyles) {
      if (style.level < 1 || style.level > 5) {
        return { valid: false, error: `${style.name}의 레벨은 1-5 사이여야 합니다.` }
      }
    }

    return { valid: true }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 클라이언트 측 유효성 검증
    const validation = validateForm()
    if (!validation.valid) {
      showError(validation.error!)
      return
    }

    setIsSubmitting(true)

    try {
      // Server Action 호출
      const result = await updateUserProfile({
        nickname: nickname.trim(),
        danceLevel,
        location: location.trim(),
        bio: bio.trim(),
        danceStyles,
        interests: user?.profile?.interests || []
      })

      if (result.success) {
        showSuccess('프로필이 성공적으로 업데이트되었습니다!')

        // 1.5초 후 프로필 페이지로 이동
        setTimeout(() => {
          router.push('/profile')
        }, 1500)
      } else {
        showError(result.error || '프로필 업데이트에 실패했습니다.')
      }
    } catch (err) {
      console.error('Profile update error:', err)
      showError('프로필 업데이트 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (confirm('변경사항을 저장하지 않고 나가시겠습니까?')) {
      router.push('/profile')
    }
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner" />
            <Typography variant="body" as="p">
              프로필 정보를 불러오는 중...
            </Typography>
          </div>
        </div>

        <style jsx>{`
          .page {
            min-height: 100vh;
            background: ${theme.colors.neutral.background};
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .loading-state {
            text-align: center;
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            margin: 0 auto 16px;
            border: 4px solid ${theme.colors.neutral.lightest};
            border-top-color: ${theme.colors.primary.main};
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="page">
      {/* 토스트 알림 */}
      <ToastContainer>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastContainer>

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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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

        .input:disabled,
        .select:disabled,
        .textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
