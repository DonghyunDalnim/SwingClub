import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ProfileEditPage from '@/app/profile/edit/page'
import { useAuth } from '@/lib/auth/hooks'
import { getUserProfile, updateUserProfile } from '@/lib/auth/providers'
import { uploadProfileImage, deleteProfileImage } from '@/lib/firebase/storage'
import { REGION_CENTERS } from '@/lib/utils/geo'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn()
  },
  Toaster: () => <div data-testid="toaster" />
}))

jest.mock('@/lib/auth/hooks', () => ({
  useAuth: jest.fn()
}))

jest.mock('@/lib/auth/providers', () => ({
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn()
}))

jest.mock('@/lib/firebase/storage', () => ({
  uploadProfileImage: jest.fn(),
  deleteProfileImage: jest.fn()
}))

jest.mock('@/lib/utils/geo', () => ({
  REGION_CENTERS: {
    '강남': { lat: 37.5173, lng: 127.0473 },
    '홍대': { lat: 37.5563, lng: 126.9236 },
    '신촌': { lat: 37.5596, lng: 126.9426 }
  }
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
  Loader2: () => <div data-testid="loader-icon" />
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockedGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>
const mockedUpdateUserProfile = updateUserProfile as jest.MockedFunction<typeof updateUserProfile>
const mockedUploadProfileImage = uploadProfileImage as jest.MockedFunction<typeof uploadProfileImage>
const mockedDeleteProfileImage = deleteProfileImage as jest.MockedFunction<typeof deleteProfileImage>
const mockedToast = toast as jest.Mocked<typeof toast>

describe('ProfileEditPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn()
  }

  const mockUser = {
    id: 'user-123',
    email: 'dancer@example.com',
    nickname: '스윙댄서',
    photoURL: 'https://example.com/photo.jpg'
  }

  const mockProfile = {
    id: 'user-123',
    email: 'dancer@example.com',
    nickname: '스윙댄서',
    location: '강남',
    danceLevel: 'intermediate' as const,
    interests: ['Lindy Hop', 'Charleston'],
    bio: '안녕하세요! 스윙댄스를 사랑합니다.',
    photoURL: 'https://example.com/photo.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseRouter.mockReturnValue(mockRouter as any)
  })

  describe('인증 확인', () => {
    it('로딩 중일 때 로딩 화면을 표시한다', () => {
      mockedUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: true
      } as any)

      render(<ProfileEditPage />)

      expect(screen.getByText('프로필 로딩 중...')).toBeInTheDocument()
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
    })

    it('인증되지 않은 사용자는 로그인 페이지로 리다이렉트된다', async () => {
      mockedUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false
      } as any)

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith('로그인이 필요합니다.')
        expect(mockRouter.push).toHaveBeenCalledWith('/login')
      })
    })

    it('인증된 사용자는 프로필 편집 폼을 볼 수 있다', async () => {
      mockedUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        loading: false
      } as any)

      mockedGetUserProfile.mockResolvedValue(mockProfile)

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByText('프로필 편집')).toBeInTheDocument()
        expect(screen.getByDisplayValue('스윙댄서')).toBeInTheDocument()
      })
    })
  })

  describe('프로필 로딩', () => {
    beforeEach(() => {
      mockedUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        loading: false
      } as any)
    })

    it('프로필 데이터를 성공적으로 불러온다', async () => {
      mockedGetUserProfile.mockResolvedValue(mockProfile)

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(mockedGetUserProfile).toHaveBeenCalledWith('user-123')
        expect(screen.getByDisplayValue('스윙댄서')).toBeInTheDocument()
        expect(screen.getByDisplayValue('강남')).toBeInTheDocument()
        expect(screen.getByDisplayValue('intermediate')).toBeInTheDocument()
        expect(screen.getByText('안녕하세요! 스윙댄스를 사랑합니다.')).toBeInTheDocument()
      })
    })

    it('프로필 로딩 실패 시 에러 메시지를 표시한다', async () => {
      mockedGetUserProfile.mockRejectedValue(new Error('Network error'))

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByText('프로필을 불러오는데 실패했습니다.')).toBeInTheDocument()
        expect(screen.getByText('프로필로 돌아가기')).toBeInTheDocument()
      })
    })

    it('에러 상태에서 프로필로 돌아가기 버튼이 작동한다', async () => {
      mockedGetUserProfile.mockRejectedValue(new Error('Network error'))

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByText('프로필을 불러오는데 실패했습니다.')).toBeInTheDocument()
      })

      const backButton = screen.getByText('프로필로 돌아가기')
      fireEvent.click(backButton)

      expect(mockRouter.push).toHaveBeenCalledWith('/profile')
    })
  })

  describe('폼 렌더링', () => {
    beforeEach(async () => {
      mockedUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        loading: false
      } as any)

      mockedGetUserProfile.mockResolvedValue(mockProfile)

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('스윙댄서')).toBeInTheDocument()
      })
    })

    it('모든 폼 필드가 현재 데이터로 렌더링된다', () => {
      expect(screen.getByDisplayValue('스윙댄서')).toBeInTheDocument()
      expect(screen.getByDisplayValue('강남')).toBeInTheDocument()
      expect(screen.getByDisplayValue('intermediate')).toBeInTheDocument()
      expect(screen.getByText('안녕하세요! 스윙댄스를 사랑합니다.')).toBeInTheDocument()
    })

    it('선호 스타일이 올바르게 표시된다', () => {
      const lindyHopButton = screen.getByText('Lindy Hop')
      const charlestonButton = screen.getByText('Charleston')

      expect(lindyHopButton.className).toContain('border-blue-500')
      expect(charlestonButton.className).toContain('border-blue-500')
    })

    it('지역 선택 옵션이 렌더링된다', () => {
      const locationSelect = screen.getByDisplayValue('강남') as HTMLSelectElement
      const options = Array.from(locationSelect.options).map(opt => opt.value)

      expect(options).toContain('강남')
      expect(options).toContain('홍대')
      expect(options).toContain('신촌')
    })

    it('댄스 레벨 옵션이 렌더링된다', () => {
      const levelSelect = screen.getByDisplayValue('intermediate') as HTMLSelectElement
      const options = Array.from(levelSelect.options).map(opt => opt.value)

      expect(options).toEqual(['beginner', 'intermediate', 'advanced', 'professional'])
    })
  })

  describe('폼 필드 변경', () => {
    beforeEach(async () => {
      mockedUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        loading: false
      } as any)

      mockedGetUserProfile.mockResolvedValue(mockProfile)

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('스윙댄서')).toBeInTheDocument()
      })
    })

    it('닉네임을 변경할 수 있다', async () => {
      const nicknameInput = screen.getByDisplayValue('스윙댄서')

      await userEvent.clear(nicknameInput)
      await userEvent.type(nicknameInput, '새로운닉네임')

      expect(nicknameInput).toHaveValue('새로운닉네임')
      expect(screen.getByText('7/20자')).toBeInTheDocument()
    })

    it('지역을 변경할 수 있다', async () => {
      const locationSelect = screen.getByDisplayValue('강남')

      await userEvent.selectOptions(locationSelect, '홍대')

      expect(locationSelect).toHaveValue('홍대')
    })

    it('댄스 레벨을 변경할 수 있다', async () => {
      const levelSelect = screen.getByDisplayValue('intermediate')

      await userEvent.selectOptions(levelSelect, 'advanced')

      expect(levelSelect).toHaveValue('advanced')
    })

    it('자기소개를 변경할 수 있다', async () => {
      const bioTextarea = screen.getByText('안녕하세요! 스윙댄스를 사랑합니다.')

      await userEvent.clear(bioTextarea)
      await userEvent.type(bioTextarea, '새로운 자기소개입니다.')

      expect(bioTextarea).toHaveValue('새로운 자기소개입니다.')
      expect(screen.getByText('17/200자')).toBeInTheDocument()
    })
  })

  describe('관심사 선택', () => {
    beforeEach(async () => {
      mockedUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        loading: false
      } as any)

      mockedGetUserProfile.mockResolvedValue(mockProfile)

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('스윙댄서')).toBeInTheDocument()
      })
    })

    it('관심사를 추가할 수 있다', async () => {
      const baloaButton = screen.getByText('Balboa')

      fireEvent.click(baloaButton)

      await waitFor(() => {
        expect(baloaButton.className).toContain('border-blue-500')
        expect(screen.getByText('선택: 3/4')).toBeInTheDocument()
      })
    })

    it('관심사를 제거할 수 있다', async () => {
      const lindyHopButton = screen.getByText('Lindy Hop')

      fireEvent.click(lindyHopButton)

      await waitFor(() => {
        expect(lindyHopButton.className).not.toContain('border-blue-500')
        expect(screen.getByText('선택: 1/4')).toBeInTheDocument()
      })
    })

    it('최대 4개까지만 선택할 수 있다', async () => {
      // Add two more interests to reach 4
      const baloaButton = screen.getByText('Balboa')
      const bluesButton = screen.getByText('Blues')

      fireEvent.click(baloaButton)
      fireEvent.click(bluesButton)

      await waitFor(() => {
        expect(screen.getByText('선택: 4/4')).toBeInTheDocument()
      })

      // Try to add 5th interest
      const shagButton = screen.getByText('Collegiate Shag')
      fireEvent.click(shagButton)

      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith('최대 4개까지 선택 가능합니다.')
        expect(shagButton.className).not.toContain('border-blue-500')
      })
    })
  })

  describe('이미지 업로드', () => {
    beforeEach(async () => {
      mockedUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        loading: false
      } as any)

      mockedGetUserProfile.mockResolvedValue(mockProfile)

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('스윙댄서')).toBeInTheDocument()
      })
    })

    it('이미지 파일을 선택할 수 있다', async () => {
      const file = new File(['image'], 'profile.jpg', { type: 'image/jpeg' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      })

      fireEvent.change(input)

      await waitFor(() => {
        const img = screen.getByAltText('Profile') as HTMLImageElement
        expect(img).toBeInTheDocument()
      })
    })

    it('5MB 이상의 이미지는 거부된다', async () => {
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      Object.defineProperty(input, 'files', {
        value: [largeFile],
        writable: false
      })

      fireEvent.change(input)

      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith('이미지 크기는 5MB 이하여야 합니다.')
      })
    })

    it('지원하지 않는 파일 형식은 거부된다', async () => {
      const invalidFile = new File(['pdf'], 'document.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      Object.defineProperty(input, 'files', {
        value: [invalidFile],
        writable: false
      })

      fireEvent.change(input)

      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith('JPEG, PNG, WebP 형식만 지원됩니다.')
      })
    })
  })

  describe('폼 검증', () => {
    beforeEach(async () => {
      mockedUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        loading: false
      } as any)

      mockedGetUserProfile.mockResolvedValue(mockProfile)

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('스윙댄서')).toBeInTheDocument()
      })
    })

    it('빈 닉네임은 검증 실패한다', async () => {
      const nicknameInput = screen.getByDisplayValue('스윙댄서')
      await userEvent.clear(nicknameInput)

      const submitButton = screen.getByText('저장')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith('닉네임을 입력해주세요.')
        expect(mockedUpdateUserProfile).not.toHaveBeenCalled()
      })
    })

    it('2자 미만의 닉네임은 검증 실패한다', async () => {
      const nicknameInput = screen.getByDisplayValue('스윙댄서')
      await userEvent.clear(nicknameInput)
      await userEvent.type(nicknameInput, 'A')

      const submitButton = screen.getByText('저장')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith('닉네임은 2-20자여야 합니다.')
      })
    })

    it('20자 초과 닉네임은 검증 실패한다', async () => {
      const nicknameInput = screen.getByDisplayValue('스윙댄서')
      await userEvent.clear(nicknameInput)
      await userEvent.type(nicknameInput, 'A'.repeat(21))

      const submitButton = screen.getByText('저장')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith('닉네임은 2-20자여야 합니다.')
      })
    })

    it('지역을 선택하지 않으면 검증 실패한다', async () => {
      const locationSelect = screen.getByDisplayValue('강남')
      await userEvent.selectOptions(locationSelect, '')

      const submitButton = screen.getByText('저장')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith('지역을 선택해주세요.')
      })
    })

    it('관심사를 선택하지 않으면 검증 실패한다', async () => {
      // Remove all interests
      const lindyHopButton = screen.getByText('Lindy Hop')
      const charlestonButton = screen.getByText('Charleston')

      fireEvent.click(lindyHopButton)
      fireEvent.click(charlestonButton)

      const submitButton = screen.getByText('저장')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith('최소 1개 이상의 선호 스타일을 선택해주세요.')
      })
    })

    it('200자 초과 자기소개는 검증 실패한다', async () => {
      const bioTextarea = screen.getByText('안녕하세요! 스윙댄스를 사랑합니다.')
      await userEvent.clear(bioTextarea)
      await userEvent.type(bioTextarea, 'A'.repeat(201))

      const submitButton = screen.getByText('저장')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith('자기소개는 200자 이하여야 합니다.')
      })
    })
  })

  describe('프로필 저장', () => {
    beforeEach(async () => {
      mockedUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        loading: false
      } as any)

      mockedGetUserProfile.mockResolvedValue(mockProfile)

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('스윙댄서')).toBeInTheDocument()
      })
    })

    it('이미지 없이 프로필을 성공적으로 저장한다', async () => {
      mockedUpdateUserProfile.mockResolvedValue(undefined)

      const nicknameInput = screen.getByDisplayValue('스윙댄서')
      await userEvent.clear(nicknameInput)
      await userEvent.type(nicknameInput, '새닉네임')

      const submitButton = screen.getByText('저장')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedUpdateUserProfile).toHaveBeenCalledWith('user-123', {
          nickname: '새닉네임',
          location: '강남',
          danceLevel: 'intermediate',
          interests: ['Lindy Hop', 'Charleston'],
          bio: '안녕하세요! 스윙댄스를 사랑합니다.',
          photoURL: 'https://example.com/photo.jpg'
        })

        expect(mockedToast.success).toHaveBeenCalledWith('프로필이 저장되었습니다.')
      })
    })

    it('이미지와 함께 프로필을 성공적으로 저장한다', async () => {
      const file = new File(['image'], 'profile.jpg', { type: 'image/jpeg' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      })

      fireEvent.change(input)

      await waitFor(() => {
        expect(screen.getByAltText('Profile')).toBeInTheDocument()
      })

      mockedUploadProfileImage.mockResolvedValue({
        success: true,
        url: 'https://example.com/new-photo.jpg'
      })

      mockedDeleteProfileImage.mockResolvedValue({ success: true })
      mockedUpdateUserProfile.mockResolvedValue(undefined)

      const submitButton = screen.getByText('저장')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedDeleteProfileImage).toHaveBeenCalledWith('https://example.com/photo.jpg')
        expect(mockedUploadProfileImage).toHaveBeenCalledWith(
          file,
          'user-123',
          expect.any(Function)
        )
        expect(mockedUpdateUserProfile).toHaveBeenCalledWith('user-123', expect.objectContaining({
          photoURL: 'https://example.com/new-photo.jpg'
        }))
        expect(mockedToast.success).toHaveBeenCalledWith('프로필이 저장되었습니다.')
      })
    })

    it('이미지 업로드 실패 시 에러를 표시한다', async () => {
      const file = new File(['image'], 'profile.jpg', { type: 'image/jpeg' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      })

      fireEvent.change(input)

      await waitFor(() => {
        expect(screen.getByAltText('Profile')).toBeInTheDocument()
      })

      mockedUploadProfileImage.mockResolvedValue({
        success: false,
        error: '업로드 실패'
      })

      const submitButton = screen.getByText('저장')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith('업로드 실패')
        expect(mockedUpdateUserProfile).not.toHaveBeenCalled()
      })
    })

    it('닉네임 중복 에러를 처리한다', async () => {
      mockedUpdateUserProfile.mockRejectedValue(new Error('이미 사용 중인 닉네임입니다'))

      const submitButton = screen.getByText('저장')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith('이미 사용 중인 닉네임입니다.')
      })
    })

    it('권한 에러를 처리한다', async () => {
      mockedUpdateUserProfile.mockRejectedValue(new Error('프로필을 수정할 권한이 없습니다'))

      const submitButton = screen.getByText('저장')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith('프로필을 수정할 권한이 없습니다.')
      })
    })

    it('네트워크 에러를 처리한다', async () => {
      mockedUpdateUserProfile.mockRejectedValue(new Error('Network error'))

      const submitButton = screen.getByText('저장')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith('Network error')
      })
    })

    it('저장 성공 후 프로필 페이지로 리다이렉트한다', async () => {
      jest.useFakeTimers()
      mockedUpdateUserProfile.mockResolvedValue(undefined)

      const submitButton = screen.getByText('저장')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockedToast.success).toHaveBeenCalledWith('프로필이 저장되었습니다.')
      })

      jest.advanceTimersByTime(500)

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/profile')
      })

      jest.useRealTimers()
    })

    it('저장 중에는 버튼이 비활성화된다', async () => {
      mockedUpdateUserProfile.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      )

      const submitButton = screen.getByText('저장')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('저장 중...')).toBeInTheDocument()
        expect(submitButton).toBeDisabled()
      })
    })
  })

  describe('네비게이션', () => {
    beforeEach(async () => {
      mockedUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        loading: false
      } as any)

      mockedGetUserProfile.mockResolvedValue(mockProfile)

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('스윙댄서')).toBeInTheDocument()
      })
    })

    it('뒤로가기 버튼이 작동한다', async () => {
      const backButtons = screen.getAllByTestId('arrow-left-icon')
      const backButton = backButtons[0].closest('button') as HTMLButtonElement

      fireEvent.click(backButton)

      expect(mockRouter.back).toHaveBeenCalled()
    })

    it('취소 버튼이 작동한다', async () => {
      const cancelButton = screen.getByText('취소')
      fireEvent.click(cancelButton)

      expect(mockRouter.back).toHaveBeenCalled()
    })
  })

  describe('토스트 알림', () => {
    beforeEach(async () => {
      mockedUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        loading: false
      } as any)

      mockedGetUserProfile.mockResolvedValue(mockProfile)

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('스윙댄서')).toBeInTheDocument()
      })
    })

    it('Toaster 컴포넌트가 렌더링된다', () => {
      expect(screen.getByTestId('toaster')).toBeInTheDocument()
    })
  })
})
