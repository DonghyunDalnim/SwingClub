/**
 * ProfileEditForm 컴포넌트 테스트
 * 프로필 편집 메인 폼 컴포넌트 테스트
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfileEditForm from '@/app/profile/edit/components/ProfileEditForm'
import { UserProfile } from '@/lib/types/auth'

// 컴포넌트 모킹
jest.mock('@/components/core', () => ({
  Button: jest.fn(({ children, onClick, disabled, type, variant, className, ...props }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      data-variant={variant}
      className={className}
      {...props}
    >
      {children}
    </button>
  )),
  Card: jest.fn(({ children }) => <div data-testid="card">{children}</div>),
  CardContent: jest.fn(({ children, className }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  )),
  CardHeader: jest.fn(({ children }) => <div data-testid="card-header">{children}</div>),
  CardTitle: jest.fn(({ children }) => <div data-testid="card-title">{children}</div>),
  Typography: jest.fn(({ children, variant }) => (
    <span data-variant={variant}>{children}</span>
  ))
}))

jest.mock('@/app/profile/edit/components/ImageUpload', () => ({
  __esModule: true,
  default: jest.fn(({ currentImage, onImageChange }) => (
    <div data-testid="image-upload">
      <div data-testid="current-image">{currentImage}</div>
      <button
        data-testid="mock-image-change"
        onClick={() => onImageChange(new File(['test'], 'test.jpg'), 'preview-url')}
      >
        Change Image
      </button>
    </div>
  ))
}))

describe('ProfileEditForm', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()

  const defaultProps = {
    initialProfile: undefined,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel
  }

  const mockProfile: Partial<UserProfile> = {
    nickname: '테스트유저',
    location: '서울특별시',
    danceLevel: 'intermediate',
    interests: ['린디합 (Lindy Hop)', '찰스턴 (Charleston)'],
    bio: '스윙댄스를 사랑합니다'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('렌더링', () => {
    it('기본 폼이 렌더링되어야 한다', () => {
      render(<ProfileEditForm {...defaultProps} />)

      expect(screen.getByLabelText(/닉네임/)).toBeInTheDocument()
      expect(screen.getByLabelText(/활동 지역/)).toBeInTheDocument()
      expect(screen.getByLabelText(/댄스 레벨/)).toBeInTheDocument()
      expect(screen.getByLabelText(/자기소개/)).toBeInTheDocument()
    })

    it('초기 프로필 데이터가 폼에 표시되어야 한다', () => {
      render(<ProfileEditForm {...defaultProps} initialProfile={mockProfile} />)

      expect(screen.getByDisplayValue('테스트유저')).toBeInTheDocument()
      expect(screen.getByDisplayValue('서울특별시')).toBeInTheDocument()
      expect(screen.getByDisplayValue('스윙댄스를 사랑합니다')).toBeInTheDocument()
    })

    it('모든 지역 옵션이 렌더링되어야 한다', () => {
      render(<ProfileEditForm {...defaultProps} />)

      const locationSelect = screen.getByLabelText(/활동 지역/) as HTMLSelectElement

      expect(locationSelect.options.length).toBeGreaterThan(1)
      expect(screen.getByText('서울특별시')).toBeInTheDocument()
      expect(screen.getByText('경기도')).toBeInTheDocument()
      expect(screen.getByText('제주특별자치도')).toBeInTheDocument()
    })

    it('모든 댄스 레벨 옵션이 렌더링되어야 한다', () => {
      render(<ProfileEditForm {...defaultProps} />)

      expect(screen.getByText('초급')).toBeInTheDocument()
      expect(screen.getByText('중급')).toBeInTheDocument()
      expect(screen.getByText('고급')).toBeInTheDocument()
      expect(screen.getByText('전문가')).toBeInTheDocument()
    })

    it('모든 댄스 스타일 체크박스가 렌더링되어야 한다', () => {
      render(<ProfileEditForm {...defaultProps} />)

      expect(screen.getByText('린디합 (Lindy Hop)')).toBeInTheDocument()
      expect(screen.getByText('찰스턴 (Charleston)')).toBeInTheDocument()
      expect(screen.getByText('발보아 (Balboa)')).toBeInTheDocument()
      expect(screen.getByText('솔로 재즈 (Solo Jazz)')).toBeInTheDocument()
    })
  })

  describe('입력 처리', () => {
    it('닉네임 입력이 작동해야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} />)

      const nicknameInput = screen.getByLabelText(/닉네임/) as HTMLInputElement
      await userEvent.type(nicknameInput, '새로운닉네임')

      expect(nicknameInput.value).toBe('새로운닉네임')
    })

    it('지역 선택이 작동해야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} />)

      const locationSelect = screen.getByLabelText(/활동 지역/) as HTMLSelectElement
      await userEvent.selectOptions(locationSelect, '경기도')

      expect(locationSelect.value).toBe('경기도')
    })

    it('댄스 레벨 선택이 작동해야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} />)

      const levelSelect = screen.getByLabelText(/댄스 레벨/) as HTMLSelectElement
      await userEvent.selectOptions(levelSelect, 'advanced')

      expect(levelSelect.value).toBe('advanced')
    })

    it('자기소개 입력이 작동해야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} />)

      const bioTextarea = screen.getByLabelText(/자기소개/) as HTMLTextAreaElement
      await userEvent.type(bioTextarea, '새로운 자기소개')

      expect(bioTextarea.value).toBe('새로운 자기소개')
    })

    it('선호 스타일 선택이 작동해야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} />)

      const lindyHopCheckbox = screen.getByRole('checkbox', { name: /린디합/ })
      await userEvent.click(lindyHopCheckbox)

      expect(lindyHopCheckbox).toBeChecked()
    })

    it('선호 스타일 선택 해제가 작동해야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} initialProfile={mockProfile} />)

      const lindyHopCheckbox = screen.getByRole('checkbox', { name: /린디합/ })
      expect(lindyHopCheckbox).toBeChecked()

      await userEvent.click(lindyHopCheckbox)
      expect(lindyHopCheckbox).not.toBeChecked()
    })
  })

  describe('유효성 검증', () => {
    it('닉네임이 비어있으면 에러 메시지가 표시되어야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} />)

      const submitButton = screen.getByText('저장하기')
      await userEvent.click(submitButton)

      expect(screen.getByText('닉네임은 필수 항목입니다')).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('닉네임이 2자 미만이면 에러 메시지가 표시되어야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} />)

      const nicknameInput = screen.getByLabelText(/닉네임/)
      await userEvent.type(nicknameInput, 'A')

      const submitButton = screen.getByText('저장하기')
      await userEvent.click(submitButton)

      expect(screen.getByText('닉네임은 2-20자 사이여야 합니다')).toBeInTheDocument()
    })

    it('닉네임이 20자 초과이면 에러 메시지가 표시되어야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} />)

      const nicknameInput = screen.getByLabelText(/닉네임/)
      await userEvent.type(nicknameInput, 'A'.repeat(21))

      const submitButton = screen.getByText('저장하기')
      await userEvent.click(submitButton)

      expect(screen.getByText('닉네임은 2-20자 사이여야 합니다')).toBeInTheDocument()
    })

    it('닉네임에 특수문자가 포함되면 에러 메시지가 표시되어야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} />)

      const nicknameInput = screen.getByLabelText(/닉네임/)
      await userEvent.type(nicknameInput, '테스트@#$')

      const submitButton = screen.getByText('저장하기')
      await userEvent.click(submitButton)

      expect(screen.getByText('닉네임은 한글, 영문, 숫자만 사용 가능합니다')).toBeInTheDocument()
    })

    it('지역이 선택되지 않으면 에러 메시지가 표시되어야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} />)

      const nicknameInput = screen.getByLabelText(/닉네임/)
      await userEvent.type(nicknameInput, '테스트유저')

      const submitButton = screen.getByText('저장하기')
      await userEvent.click(submitButton)

      expect(screen.getByText('활동 지역은 필수 항목입니다')).toBeInTheDocument()
    })

    it('자기소개는 maxLength로 인해 200자까지만 입력 가능해야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} initialProfile={mockProfile} />)

      const bioTextarea = screen.getByLabelText(/자기소개/) as HTMLTextAreaElement

      // textarea에 maxLength 속성이 설정되어 있는지 확인
      expect(bioTextarea).toHaveAttribute('maxLength', '200')
    })

    it('유효한 데이터 입력 시 에러가 없어야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} />)

      const nicknameInput = screen.getByLabelText(/닉네임/)
      await userEvent.type(nicknameInput, '테스트유저')

      const locationSelect = screen.getByLabelText(/활동 지역/)
      await userEvent.selectOptions(locationSelect, '서울특별시')

      const submitButton = screen.getByText('저장하기')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })
  })

  describe('변경 감지', () => {
    it('초기 상태에서 저장 버튼이 비활성화되어야 한다', () => {
      render(<ProfileEditForm {...defaultProps} initialProfile={mockProfile} />)

      const submitButton = screen.getByText('저장하기')
      expect(submitButton).toBeDisabled()
    })

    it('닉네임 변경 시 저장 버튼이 활성화되어야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} initialProfile={mockProfile} />)

      const nicknameInput = screen.getByLabelText(/닉네임/)
      await userEvent.clear(nicknameInput)
      await userEvent.type(nicknameInput, '새닉네임')

      const submitButton = screen.getByText('저장하기')
      expect(submitButton).not.toBeDisabled()
    })

    it('지역 변경 시 저장 버튼이 활성화되어야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} initialProfile={mockProfile} />)

      const locationSelect = screen.getByLabelText(/활동 지역/)
      await userEvent.selectOptions(locationSelect, '경기도')

      const submitButton = screen.getByText('저장하기')
      expect(submitButton).not.toBeDisabled()
    })

    it('댄스 레벨 변경 시 저장 버튼이 활성화되어야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} initialProfile={mockProfile} />)

      const levelSelect = screen.getByLabelText(/댄스 레벨/)
      await userEvent.selectOptions(levelSelect, 'advanced')

      const submitButton = screen.getByText('저장하기')
      expect(submitButton).not.toBeDisabled()
    })

    it('자기소개 변경 시 저장 버튼이 활성화되어야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} initialProfile={mockProfile} />)

      const bioTextarea = screen.getByLabelText(/자기소개/)
      await userEvent.type(bioTextarea, ' 추가 내용')

      const submitButton = screen.getByText('저장하기')
      expect(submitButton).not.toBeDisabled()
    })

    it('선호 스타일 변경 시 저장 버튼이 활성화되어야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} initialProfile={mockProfile} />)

      const balboaCheckbox = screen.getByRole('checkbox', { name: /발보아/ })
      await userEvent.click(balboaCheckbox)

      const submitButton = screen.getByText('저장하기')
      expect(submitButton).not.toBeDisabled()
    })

    it('이미지 변경 시 저장 버튼이 활성화되어야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} initialProfile={mockProfile} />)

      const imageChangeButton = screen.getByTestId('mock-image-change')
      await userEvent.click(imageChangeButton)

      const submitButton = screen.getByText('저장하기')
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('폼 제출', () => {
    it('유효한 데이터로 제출 시 onSubmit이 호출되어야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} />)

      const nicknameInput = screen.getByLabelText(/닉네임/)
      await userEvent.type(nicknameInput, '테스트유저')

      const locationSelect = screen.getByLabelText(/활동 지역/)
      await userEvent.selectOptions(locationSelect, '서울특별시')

      const submitButton = screen.getByText('저장하기')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            nickname: '테스트유저',
            location: '서울특별시',
            danceLevel: 'beginner',
            interests: [],
            bio: ''
          }),
          null
        )
      })
    })

    it('제출 중에는 버튼이 비활성화되어야 한다', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<ProfileEditForm {...defaultProps} initialProfile={mockProfile} />)

      const nicknameInput = screen.getByLabelText(/닉네임/)
      await userEvent.type(nicknameInput, '변경')

      const submitButton = screen.getByText('저장하기')
      await userEvent.click(submitButton)

      expect(screen.getByText('저장 중...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('제출 실패 시 버튼이 다시 활성화되어야 한다', async () => {
      mockOnSubmit.mockRejectedValueOnce(new Error('제출 실패'))

      render(<ProfileEditForm {...defaultProps} initialProfile={mockProfile} />)

      const nicknameInput = screen.getByLabelText(/닉네임/)
      await userEvent.type(nicknameInput, '변경')

      const submitButton = screen.getByText('저장하기')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('저장하기')).toBeInTheDocument()
      })
    })
  })

  describe('취소 기능', () => {
    it('취소 버튼 클릭 시 onCancel이 호출되어야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} />)

      const cancelButton = screen.getByText('취소')
      await userEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('제출 중에는 취소 버튼이 비활성화되어야 한다', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<ProfileEditForm {...defaultProps} initialProfile={mockProfile} />)

      const nicknameInput = screen.getByLabelText(/닉네임/)
      await userEvent.type(nicknameInput, '변경')

      const submitButton = screen.getByText('저장하기')
      await userEvent.click(submitButton)

      const cancelButton = screen.getByText('취소')
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('자기소개 글자 수', () => {
    it('자기소개 글자 수가 표시되어야 한다', () => {
      render(<ProfileEditForm {...defaultProps} />)

      expect(screen.getByText('0/200자')).toBeInTheDocument()
    })

    it('자기소개 입력 시 글자 수가 업데이트되어야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} />)

      const bioTextarea = screen.getByLabelText(/자기소개/)
      await userEvent.type(bioTextarea, '테스트')

      expect(screen.getByText('3/200자')).toBeInTheDocument()
    })

    it('초기 자기소개가 있으면 글자 수가 표시되어야 한다', () => {
      render(<ProfileEditForm {...defaultProps} initialProfile={mockProfile} />)

      // '스윙댄스를 사랑합니다' is 11 characters
      expect(screen.getByText('11/200자')).toBeInTheDocument()
    })
  })

  describe('접근성', () => {
    it('모든 입력 필드에 적절한 label이 있어야 한다', () => {
      render(<ProfileEditForm {...defaultProps} />)

      expect(screen.getByLabelText(/닉네임/)).toBeInTheDocument()
      expect(screen.getByLabelText(/활동 지역/)).toBeInTheDocument()
      expect(screen.getByLabelText(/댄스 레벨/)).toBeInTheDocument()
      expect(screen.getByLabelText(/자기소개/)).toBeInTheDocument()
    })

    it('에러 메시지에 role="alert"가 있어야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} />)

      const submitButton = screen.getByText('저장하기')
      await userEvent.click(submitButton)

      const errorMessage = screen.getByText('닉네임은 필수 항목입니다')
      expect(errorMessage).toHaveAttribute('role', 'alert')
    })

    it('에러가 있는 입력에 aria-invalid가 설정되어야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} />)

      const submitButton = screen.getByText('저장하기')
      await userEvent.click(submitButton)

      const nicknameInput = screen.getByLabelText(/닉네임/)
      expect(nicknameInput).toHaveAttribute('aria-invalid', 'true')
    })

    it('에러가 있는 입력에 aria-describedby가 설정되어야 한다', async () => {
      render(<ProfileEditForm {...defaultProps} />)

      const submitButton = screen.getByText('저장하기')
      await userEvent.click(submitButton)

      const nicknameInput = screen.getByLabelText(/닉네임/)
      expect(nicknameInput).toHaveAttribute('aria-describedby', 'nickname-error')
    })
  })

  describe('엣지 케이스', () => {
    it('initialProfile이 undefined여도 렌더링되어야 한다', () => {
      render(<ProfileEditForm {...defaultProps} initialProfile={undefined} />)

      expect(screen.getByLabelText(/닉네임/)).toBeInTheDocument()
    })

    it('빈 initialProfile이어도 렌더링되어야 한다', () => {
      render(<ProfileEditForm {...defaultProps} initialProfile={{}} />)

      expect(screen.getByLabelText(/닉네임/)).toHaveValue('')
    })

    it('부분적인 initialProfile이어도 작동해야 한다', () => {
      render(<ProfileEditForm {...defaultProps} initialProfile={{ nickname: '테스트' }} />)

      expect(screen.getByDisplayValue('테스트')).toBeInTheDocument()
      expect(screen.getByLabelText(/활동 지역/)).toHaveValue('')
    })
  })
})
