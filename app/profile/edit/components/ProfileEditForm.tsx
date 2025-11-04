'use client'

/**
 * ProfileEditForm Component
 * 프로필 편집 메인 폼 컴포넌트
 */

import { useState, useEffect, FormEvent } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, Typography } from '@/components/core'
import ImageUpload from './ImageUpload'
import { theme } from '@/lib/theme'
import { UserProfile, DanceLevel } from '@/lib/types/auth'
import { MapPin, Award, Heart, FileText } from 'lucide-react'

interface ProfileEditFormProps {
  initialProfile?: Partial<UserProfile>
  onSubmit: (profile: Partial<UserProfile>, imageFile: File | null) => Promise<void>
  onCancel: () => void
}

// 지역 옵션
const REGIONS = [
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '세종특별자치시',
  '경기도',
  '강원도',
  '충청북도',
  '충청남도',
  '전라북도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주특별자치도'
]

// 댄스 레벨 옵션
const DANCE_LEVELS: { value: DanceLevel; label: string }[] = [
  { value: 'beginner', label: '초급' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' },
  { value: 'professional', label: '전문가' }
]

// 선호 스타일 옵션
const DANCE_STYLES = [
  '린디합 (Lindy Hop)',
  '찰스턴 (Charleston)',
  '발보아 (Balboa)',
  '이스트코스트 스윙 (East Coast Swing)',
  '웨스트코스트 스윙 (West Coast Swing)',
  '부기우기 (Boogie Woogie)',
  '솔로 재즈 (Solo Jazz)',
  '스윙 댄스 (Swing Dance)'
]

export default function ProfileEditForm({
  initialProfile,
  onSubmit,
  onCancel
}: ProfileEditFormProps) {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    nickname: initialProfile?.nickname || '',
    location: initialProfile?.location || '',
    danceLevel: initialProfile?.danceLevel || 'beginner',
    interests: initialProfile?.interests || [],
    bio: initialProfile?.bio || ''
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // 변경 감지
  useEffect(() => {
    const hasChanges =
      formData.nickname !== initialProfile?.nickname ||
      formData.location !== initialProfile?.location ||
      formData.danceLevel !== initialProfile?.danceLevel ||
      formData.bio !== initialProfile?.bio ||
      JSON.stringify(formData.interests) !== JSON.stringify(initialProfile?.interests) ||
      imageFile !== null

    setIsDirty(hasChanges)
  }, [formData, imageFile, initialProfile])

  // 유효성 검증
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // 닉네임 검증
    if (!formData.nickname) {
      newErrors.nickname = '닉네임은 필수 항목입니다'
    } else if (formData.nickname.length < 2 || formData.nickname.length > 20) {
      newErrors.nickname = '닉네임은 2-20자 사이여야 합니다'
    } else if (!/^[가-힣a-zA-Z0-9]+$/.test(formData.nickname)) {
      newErrors.nickname = '닉네임은 한글, 영문, 숫자만 사용 가능합니다'
    }

    // 지역 검증
    if (!formData.location) {
      newErrors.location = '활동 지역은 필수 항목입니다'
    }

    // 자기소개 검증 (선택 사항이지만 길이 제한)
    if (formData.bio && formData.bio.length > 200) {
      newErrors.bio = '자기소개는 200자 이하여야 합니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 폼 제출
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData, imageFile)
    } catch (error) {
      console.error('프로필 업데이트 실패:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 선호 스타일 토글
  const toggleInterest = (style: string) => {
    setFormData(prev => {
      const interests = prev.interests || []
      if (interests.includes(style)) {
        return { ...prev, interests: interests.filter(s => s !== style) }
      } else {
        return { ...prev, interests: [...interests, style] }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 프로필 이미지 */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Typography variant="h4">프로필 이미지</Typography>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            currentImage={initialProfile?.nickname ? `https://ui-avatars.com/api/?name=${encodeURIComponent(initialProfile.nickname)}` : null}
            onImageChange={(file, preview) => {
              setImageFile(file)
              setImagePreview(preview)
            }}
          />
        </CardContent>
      </Card>

      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Typography variant="h4">기본 정보</Typography>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 닉네임 */}
          <div>
            <label
              htmlFor="nickname"
              className="flex items-center gap-2 mb-2 text-sm font-medium"
              style={{ color: theme.colors.neutral.darkest }}
            >
              <FileText className="w-4 h-4" />
              닉네임 <span style={{ color: theme.colors.accent.red }}>*</span>
            </label>
            <input
              id="nickname"
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border transition-all"
              style={{
                borderColor: errors.nickname ? theme.colors.accent.red : theme.colors.neutral.light,
                backgroundColor: theme.colors.white
              }}
              placeholder="닉네임을 입력하세요 (2-20자)"
              aria-label="닉네임"
              aria-invalid={!!errors.nickname}
              aria-describedby={errors.nickname ? 'nickname-error' : undefined}
            />
            {errors.nickname && (
              <p
                id="nickname-error"
                className="mt-1 text-sm"
                style={{ color: theme.colors.accent.red }}
                role="alert"
              >
                {errors.nickname}
              </p>
            )}
          </div>

          {/* 활동 지역 */}
          <div>
            <label
              htmlFor="location"
              className="flex items-center gap-2 mb-2 text-sm font-medium"
              style={{ color: theme.colors.neutral.darkest }}
            >
              <MapPin className="w-4 h-4" />
              활동 지역 <span style={{ color: theme.colors.accent.red }}>*</span>
            </label>
            <select
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border transition-all"
              style={{
                borderColor: errors.location ? theme.colors.accent.red : theme.colors.neutral.light,
                backgroundColor: theme.colors.white
              }}
              aria-label="활동 지역"
              aria-invalid={!!errors.location}
              aria-describedby={errors.location ? 'location-error' : undefined}
            >
              <option value="">지역을 선택하세요</option>
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            {errors.location && (
              <p
                id="location-error"
                className="mt-1 text-sm"
                style={{ color: theme.colors.accent.red }}
                role="alert"
              >
                {errors.location}
              </p>
            )}
          </div>

          {/* 댄스 레벨 */}
          <div>
            <label
              htmlFor="danceLevel"
              className="flex items-center gap-2 mb-2 text-sm font-medium"
              style={{ color: theme.colors.neutral.darkest }}
            >
              <Award className="w-4 h-4" />
              댄스 레벨 <span style={{ color: theme.colors.accent.red }}>*</span>
            </label>
            <select
              id="danceLevel"
              value={formData.danceLevel}
              onChange={(e) => setFormData({ ...formData, danceLevel: e.target.value as DanceLevel })}
              className="w-full px-4 py-3 rounded-lg border transition-all"
              style={{
                borderColor: theme.colors.neutral.light,
                backgroundColor: theme.colors.white
              }}
              aria-label="댄스 레벨"
            >
              {DANCE_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 선호 스타일 */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              <Typography variant="h4">선호 스타일</Typography>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DANCE_STYLES.map((style) => {
              const isSelected = formData.interests?.includes(style)
              return (
                <label
                  key={style}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:border-primary-main"
                  style={{
                    borderColor: isSelected ? theme.colors.primary.main : theme.colors.neutral.light,
                    backgroundColor: isSelected ? theme.colors.secondary.light : theme.colors.white
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleInterest(style)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: theme.colors.primary.main }}
                  />
                  <span className="text-sm" style={{ color: theme.colors.neutral.darkest }}>
                    {style}
                  </span>
                </label>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 자기소개 */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Typography variant="h4">자기소개</Typography>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border transition-all resize-none"
            style={{
              borderColor: errors.bio ? theme.colors.accent.red : theme.colors.neutral.light,
              backgroundColor: theme.colors.white,
              minHeight: '120px'
            }}
            placeholder="스윙댄스에 대한 자기소개를 작성해주세요 (최대 200자)"
            maxLength={200}
            aria-label="자기소개"
            aria-invalid={!!errors.bio}
            aria-describedby={errors.bio ? 'bio-error' : undefined}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs" style={{ color: theme.colors.neutral.medium }}>
              {formData.bio?.length || 0}/200자
            </p>
            {errors.bio && (
              <p
                id="bio-error"
                className="text-sm"
                style={{ color: theme.colors.accent.red }}
                role="alert"
              >
                {errors.bio}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 버튼 */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          disabled={!isDirty || isSubmitting}
          className="flex-1"
          aria-label="프로필 저장"
        >
          {isSubmitting ? '저장 중...' : '저장하기'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
          aria-label="취소"
        >
          취소
        </Button>
      </div>
    </form>
  )
}
