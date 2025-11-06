import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import ProfileEditPage from '@/app/profile/edit/page'
import { useAuth } from '@/lib/auth/hooks'
import { updateUserProfile } from '@/lib/actions/profile'
import type { DanceStyle } from '@/lib/types/auth'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/lib/auth/hooks', () => ({
  useAuth: jest.fn()
}))

jest.mock('@/lib/actions/profile', () => ({
  updateUserProfile: jest.fn()
}))

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn()
}

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  displayName: '테스트 사용자',
  photoURL: null,
  provider: 'email' as const,
  createdAt: new Date(),
  lastLoginAt: new Date(),
  profile: {
    nickname: '댄스러버',
    danceLevel: 'intermediate' as const,
    location: '서울 강남구',
    bio: '스윙댄스를 사랑합니다',
    interests: ['Lindy Hop', 'Charleston'],
    danceStyles: [
      { name: 'Lindy Hop', level: 3 },
      { name: 'Charleston', level: 2 }
    ] as DanceStyle[]
  }
}

describe('ProfileEditPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  describe('로딩 상태', () => {
    it('사용자 데이터 로딩 중일 때 로딩 스피너를 표시한다', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: null
      })

      render(<ProfileEditPage />)

      expect(screen.getByText('프로필 정보를 불러오는 중...')).toBeInTheDocument()
    })

    it('사용자 데이터가 로드되면 로딩 상태가 해제된다', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser
      })

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.queryByText('프로필 정보를 불러오는 중...')).not.toBeInTheDocument()
      })

      expect(screen.getByText('프로필 편집')).toBeInTheDocument()
    })
  })

  describe('폼 렌더링', () => {
    beforeEach(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser
      })
    })

    it('모든 폼 필드가 올바르게 렌더링된다', async () => {
      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/닉네임/)).toBeInTheDocument()
      })

      expect(screen.getByLabelText(/댄스 레벨/)).toBeInTheDocument()
      expect(screen.getByLabelText(/활동 지역/)).toBeInTheDocument()
      expect(screen.getByLabelText(/자기소개/)).toBeInTheDocument()
    })

    it('사용자 프로필 데이터로 폼이 초기화된다', async () => {
      render(<ProfileEditPage />)

      await waitFor(() => {
        const nicknameInput = screen.getByLabelText(/닉네임/) as HTMLInputElement
        expect(nicknameInput.value).toBe('댄스러버')
      })

      const danceLevel = screen.getByLabelText(/댄스 레벨/) as HTMLSelectElement
      expect(danceLevel.value).toBe('intermediate')

      const location = screen.getByLabelText(/활동 지역/) as HTMLInputElement
      expect(location.value).toBe('서울 강남구')

      const bio = screen.getByLabelText(/자기소개/) as HTMLTextAreaElement
      expect(bio.value).toBe('스윙댄스를 사랑합니다')
    })

    it('댄스 스타일이 DanceStyleSelector에 표시된다', async () => {
      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      })

      expect(screen.getByText('Charleston')).toBeInTheDocument()
      expect(screen.getByText('레벨: 3')).toBeInTheDocument()
      expect(screen.getByText('레벨: 2')).toBeInTheDocument()
    })

    it('프로필이 없는 사용자도 폼을 표시한다', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: { ...mockUser, profile: undefined }
      })

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByText('프로필 편집')).toBeInTheDocument()
      })

      const nicknameInput = screen.getByLabelText(/닉네임/) as HTMLInputElement
      expect(nicknameInput.value).toBe('')
    })
  })

  describe('폼 입력 및 변경', () => {
    beforeEach(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser
      })
    })

    it('닉네임을 변경할 수 있다', async () => {
      const user = userEvent.setup()
      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/닉네임/)).toBeInTheDocument()
      })

      const nicknameInput = screen.getByLabelText(/닉네임/) as HTMLInputElement
      await user.clear(nicknameInput)
      await user.type(nicknameInput, '새로운닉네임')

      expect(nicknameInput.value).toBe('새로운닉네임')
    })

    it('댄스 레벨을 변경할 수 있다', async () => {
      const user = userEvent.setup()
      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/댄스 레벨/)).toBeInTheDocument()
      })

      const danceLevel = screen.getByLabelText(/댄스 레벨/)
      await user.selectOptions(danceLevel, 'advanced')

      expect((danceLevel as HTMLSelectElement).value).toBe('advanced')
    })

    it('자기소개를 변경할 수 있다', async () => {
      const user = userEvent.setup()
      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/자기소개/)).toBeInTheDocument()
      })

      const bio = screen.getByLabelText(/자기소개/) as HTMLTextAreaElement
      await user.clear(bio)
      await user.type(bio, '새로운 자기소개입니다')

      expect(bio.value).toBe('새로운 자기소개입니다')
    })

    it('자기소개 글자 수가 표시된다', async () => {
      const user = userEvent.setup()
      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByText('/200')).toBeInTheDocument()
      })

      const bio = screen.getByLabelText(/자기소개/)
      await user.clear(bio)
      await user.type(bio, '테스트')

      expect(screen.getByText('3/200')).toBeInTheDocument()
    })
  })

  describe('클라이언트 측 유효성 검증', () => {
    beforeEach(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser
      })
    })

    it('닉네임이 비어있으면 에러를 표시한다', async () => {
      const user = userEvent.setup()
      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/닉네임/)).toBeInTheDocument()
      })

      const nicknameInput = screen.getByLabelText(/닉네임/)
      await user.clear(nicknameInput)

      const submitButton = screen.getByRole('button', { name: /저장하기/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('닉네임을 입력해주세요.')).toBeInTheDocument()
      })
    })

    it('닉네임이 20자를 초과하면 에러를 표시한다', async () => {
      const user = userEvent.setup()
      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/닉네임/)).toBeInTheDocument()
      })

      const nicknameInput = screen.getByLabelText(/닉네임/)
      await user.clear(nicknameInput)
      await user.type(nicknameInput, '이것은이십자를초과하는닉네임입니다너무길어요')

      const submitButton = screen.getByRole('button', { name: /저장하기/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('닉네임은 20자 이하여야 합니다.')).toBeInTheDocument()
      })
    })

    it('활동 지역이 비어있으면 에러를 표시한다', async () => {
      const user = userEvent.setup()
      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/활동 지역/)).toBeInTheDocument()
      })

      const locationInput = screen.getByLabelText(/활동 지역/)
      await user.clear(locationInput)

      const submitButton = screen.getByRole('button', { name: /저장하기/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('활동 지역을 입력해주세요.')).toBeInTheDocument()
      })
    })

    it('자기소개가 200자를 초과하면 에러를 표시한다', async () => {
      const user = userEvent.setup()
      const longBio = 'a'.repeat(201)

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/자기소개/)).toBeInTheDocument()
      })

      const bio = screen.getByLabelText(/자기소개/)
      await user.clear(bio)
      await user.type(bio, longBio)

      const submitButton = screen.getByRole('button', { name: /저장하기/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('자기소개는 200자 이하여야 합니다.')).toBeInTheDocument()
      })
    })
  })

  describe('폼 제출', () => {
    beforeEach(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser
      })
    })

    it('유효한 데이터로 폼을 제출하면 updateUserProfile이 호출된다', async () => {
      const user = userEvent.setup()
      ;(updateUserProfile as jest.Mock).mockResolvedValue({ success: true })

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/닉네임/)).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /저장하기/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(updateUserProfile).toHaveBeenCalledWith({
          nickname: '댄스러버',
          danceLevel: 'intermediate',
          location: '서울 강남구',
          bio: '스윙댄스를 사랑합니다',
          danceStyles: [
            { name: 'Lindy Hop', level: 3 },
            { name: 'Charleston', level: 2 }
          ],
          interests: ['Lindy Hop', 'Charleston']
        })
      })
    })

    it('제출 성공 시 성공 토스트를 표시하고 프로필 페이지로 이동한다', async () => {
      const user = userEvent.setup()
      ;(updateUserProfile as jest.Mock).mockResolvedValue({ success: true })

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/닉네임/)).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /저장하기/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('프로필이 성공적으로 업데이트되었습니다!')).toBeInTheDocument()
      })

      // 1.5초 후 리다이렉션
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/profile')
      }, { timeout: 2000 })
    })

    it('제출 실패 시 에러 토스트를 표시한다', async () => {
      const user = userEvent.setup()
      ;(updateUserProfile as jest.Mock).mockResolvedValue({
        success: false,
        error: '프로필 업데이트에 실패했습니다.'
      })

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/닉네임/)).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /저장하기/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('프로필 업데이트에 실패했습니다.')).toBeInTheDocument()
      })

      expect(mockRouter.push).not.toHaveBeenCalled()
    })

    it('제출 중에는 버튼이 비활성화된다', async () => {
      const user = userEvent.setup()
      let resolveUpdate: ((value: any) => void) | undefined

      ;(updateUserProfile as jest.Mock).mockImplementation(() => {
        return new Promise(resolve => {
          resolveUpdate = resolve
        })
      })

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/닉네임/)).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /저장하기/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })

      resolveUpdate?.({ success: true })
    })

    it('제출 중에는 모든 입력 필드가 비활성화된다', async () => {
      const user = userEvent.setup()
      let resolveUpdate: ((value: any) => void) | undefined

      ;(updateUserProfile as jest.Mock).mockImplementation(() => {
        return new Promise(resolve => {
          resolveUpdate = resolve
        })
      })

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/닉네임/)).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /저장하기/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByLabelText(/닉네임/)).toBeDisabled()
        expect(screen.getByLabelText(/댄스 레벨/)).toBeDisabled()
        expect(screen.getByLabelText(/활동 지역/)).toBeDisabled()
        expect(screen.getByLabelText(/자기소개/)).toBeDisabled()
      })

      resolveUpdate?.({ success: true })
    })
  })

  describe('취소 버튼', () => {
    beforeEach(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser
      })
      global.confirm = jest.fn(() => true)
    })

    it('취소 버튼을 클릭하면 확인 다이얼로그를 표시한다', async () => {
      const user = userEvent.setup()
      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByText('프로필 편집')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /취소/ })
      await user.click(cancelButton)

      expect(global.confirm).toHaveBeenCalledWith('변경사항을 저장하지 않고 나가시겠습니까?')
    })

    it('취소를 확인하면 프로필 페이지로 이동한다', async () => {
      const user = userEvent.setup()
      global.confirm = jest.fn(() => true)

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByText('프로필 편집')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /취소/ })
      await user.click(cancelButton)

      expect(mockRouter.push).toHaveBeenCalledWith('/profile')
    })

    it('취소를 거부하면 페이지에 남는다', async () => {
      const user = userEvent.setup()
      global.confirm = jest.fn(() => false)

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByText('프로필 편집')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /취소/ })
      await user.click(cancelButton)

      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })

  describe('DanceStyleSelector 통합', () => {
    beforeEach(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser
      })
    })

    it('DanceStyleSelector가 렌더링된다', async () => {
      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByText('댄스 스타일')).toBeInTheDocument()
      })
    })

    it('초기 댄스 스타일이 표시된다', async () => {
      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByText('Lindy Hop')).toBeInTheDocument()
      })

      expect(screen.getByText('Charleston')).toBeInTheDocument()
    })

    it('댄스 스타일을 변경하면 폼 상태가 업데이트된다', async () => {
      const user = userEvent.setup()
      ;(updateUserProfile as jest.Mock).mockResolvedValue({ success: true })

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByText('+ 스타일 추가')).toBeInTheDocument()
      })

      // 스타일 추가
      const addButton = screen.getByText('+ 스타일 추가')
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByLabelText('Balboa 추가')).toBeInTheDocument()
      })

      const balboaButton = screen.getByLabelText('Balboa 추가')
      await user.click(balboaButton)

      // 폼 제출
      const submitButton = screen.getByRole('button', { name: /저장하기/ })
      await user.click(submitButton)

      await waitFor(() => {
        const callArg = (updateUserProfile as jest.Mock).mock.calls[0][0]
        expect(callArg.danceStyles).toContainEqual({ name: 'Balboa', level: 1 })
      })
    })
  })

  describe('엣지 케이스', () => {
    it('사용자가 없으면 로딩 상태를 유지한다', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: null
      })

      render(<ProfileEditPage />)

      expect(screen.getByText('프로필 정보를 불러오는 중...')).toBeInTheDocument()
    })

    it('예외 발생 시 에러 토스트를 표시한다', async () => {
      const user = userEvent.setup()
      ;(useAuth as jest.Mock).mockReturnValue({
        user: mockUser
      })
      ;(updateUserProfile as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<ProfileEditPage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/닉네임/)).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /저장하기/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('프로필 업데이트 중 오류가 발생했습니다.')).toBeInTheDocument()
      })
    })
  })
})
