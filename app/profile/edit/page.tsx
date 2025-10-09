'use client'

/**
 * 프로필 편집 페이지
 * Issue #82 - 프로필 편집 메인 구현 및 통합
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/core'
import { useAuth } from '@/lib/auth/hooks'
import { getUserProfile, updateUserProfile } from '@/lib/auth/providers'
import { uploadProfileImage, deleteProfileImage } from '@/lib/firebase/storage'
import { REGION_CENTERS } from '@/lib/utils/geo'
import type { UserProfile, DanceLevel } from '@/lib/types/auth'

export default function ProfileEditPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  // States
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [nickname, setNickname] = useState('')
  const [location, setLocation] = useState('')
  const [danceLevel, setDanceLevel] = useState<DanceLevel>('beginner')
  const [interests, setInterests] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [photoURL, setPhotoURL] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Available dance styles
  const availableStyles = ['Lindy Hop', 'Charleston', 'Balboa', 'Blues', 'Collegiate Shag', 'St. Louis Shag']

  // Available regions
  const regions = Object.keys(REGION_CENTERS)

  // Load current profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const profile = await getUserProfile(user.id)
        if (profile) {
          setNickname(profile.nickname || '')
          setLocation(profile.location || '')
          setDanceLevel(profile.danceLevel || 'beginner')
          setInterests(profile.interests || [])
          setBio(profile.bio || '')
          setPhotoURL(user.photoURL || null)
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
        setError('프로필을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error('로그인이 필요합니다.')
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('이미지 크기는 5MB 이하여야 합니다.')
        return
      }

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('JPEG, PNG, WebP 형식만 지원됩니다.')
        return
      }

      setImageFile(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoURL(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Toggle interest selection
  const toggleInterest = (style: string) => {
    if (interests.includes(style)) {
      setInterests(interests.filter(i => i !== style))
    } else {
      if (interests.length < 4) {
        setInterests([...interests, style])
      } else {
        toast.error('최대 4개까지 선택 가능합니다.')
      }
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('로그인이 필요합니다.')
      return
    }

    // Validation
    if (!nickname.trim()) {
      toast.error('닉네임을 입력해주세요.')
      return
    }

    if (nickname.length < 2 || nickname.length > 20) {
      toast.error('닉네임은 2-20자여야 합니다.')
      return
    }

    if (!location) {
      toast.error('지역을 선택해주세요.')
      return
    }

    if (interests.length === 0) {
      toast.error('최소 1개 이상의 선호 스타일을 선택해주세요.')
      return
    }

    if (bio && bio.length > 200) {
      toast.error('자기소개는 200자 이하여야 합니다.')
      return
    }

    setSaving(true)

    try {
      let newPhotoURL = user.photoURL

      // 1. Upload image if new image selected
      if (imageFile) {
        setUploadingImage(true)

        // Delete old image if exists
        if (user.photoURL) {
          try {
            await deleteProfileImage(user.photoURL)
          } catch (err) {
            console.warn('Failed to delete old image:', err)
          }
        }

        // Upload new image
        const uploadResult = await uploadProfileImage(
          imageFile,
          user.id,
          (progress) => setUploadProgress(progress)
        )

        if (uploadResult.success && uploadResult.url) {
          newPhotoURL = uploadResult.url
        } else {
          throw new Error(uploadResult.error || '이미지 업로드에 실패했습니다.')
        }

        setUploadingImage(false)
      }

      // 2. Update profile (without photoURL - will be handled when Issue #81 is merged)
      await updateUserProfile(user.id, {
        nickname: nickname.trim(),
        location,
        danceLevel,
        interests,
        bio: bio.trim()
      })

      // 3. Show success toast and redirect
      toast.success('프로필이 저장되었습니다.')

      setTimeout(() => {
        router.push('/profile')
      }, 500)
    } catch (err: any) {
      console.error('Failed to save profile:', err)

      // Handle specific errors
      if (err.message?.includes('닉네임')) {
        toast.error('이미 사용 중인 닉네임입니다.')
      } else if (err.message?.includes('권한')) {
        toast.error('프로필을 수정할 권한이 없습니다.')
      } else {
        toast.error(err.message || '프로필 저장에 실패했습니다.')
      }
    } finally {
      setSaving(false)
      setUploadingImage(false)
      setUploadProgress(0)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-center" />

        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <ArrowLeft className="h-6 w-6" />
              <span className="font-semibold text-lg">프로필 편집</span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>프로필 로딩 중...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-center" />

        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <button onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
              </button>
              <span className="font-semibold text-lg">프로필 편집</span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => router.push('/profile')}>
                프로필로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main form
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button onClick={() => router.back()}>
              <ArrowLeft className="h-6 w-6" />
            </button>
            <span className="font-semibold text-lg">프로필 편집</span>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Image */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">프로필 이미지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                  {photoURL ? (
                    <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">👤</span>
                  )}
                </div>
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">{uploadProgress}%</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                id="profile-image"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
              <label htmlFor="profile-image" className="cursor-pointer">
                <span className="inline-block px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  이미지 선택
                </span>
              </label>
              <p className="text-sm text-gray-500">
                JPEG, PNG, WebP (최대 5MB)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                닉네임 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="2-20자"
                maxLength={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                {nickname.length}/20자
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                지역 <span className="text-red-500">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택해주세요</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                댄스 레벨 <span className="text-red-500">*</span>
              </label>
              <select
                value={danceLevel}
                onChange={(e) => setDanceLevel(e.target.value as DanceLevel)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">초급</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
                <option value="professional">전문가</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Dance Styles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              선호 스타일 <span className="text-red-500">*</span>
            </CardTitle>
            <p className="text-sm text-gray-500">최소 1개, 최대 4개</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {availableStyles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleInterest(style)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    interests.includes(style)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              선택: {interests.length}/4
            </p>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">자기소개</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="자신을 소개해주세요 (최대 200자)"
              maxLength={200}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              {bio.length}/200자
            </p>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={saving}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={saving || uploadingImage}
            className="flex-1"
          >
            {saving ? (
              <span className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>저장 중...</span>
              </span>
            ) : (
              '저장'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
