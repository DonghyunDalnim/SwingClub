/**
 * Step2ProfileInfo 컴포넌트 통합 테스트
 * 프로필 정보 입력 폼의 모든 기능과 검증 로직을 테스트합니다.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Step2ProfileInfo, { Step2ProfileInfoProps } from '@/app/signup/components/Step2ProfileInfo';
import { DANCE_LEVELS, REGIONS, DANCE_STYLES, VALIDATION } from '@/lib/constants/profile';
import type { DanceLevel } from '@/lib/types/auth';

// SignupButton 컴포넌트 모킹
jest.mock('@/app/signup/components/SignupButton', () => {
  return function MockSignupButton({ children, onClick, disabled, variant, ...props }: any) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        data-variant={variant}
        {...props}
      >
        {children}
      </button>
    );
  };
});

// 기본 프로필 데이터
const mockProfileData = {
  nickname: '',
  danceLevel: 'beginner' as DanceLevel,
  location: '',
  bio: '',
  interests: [] as string[],
};

// 기본 props
const defaultProps: Step2ProfileInfoProps = {
  profileData: mockProfileData,
  onNext: jest.fn(),
  onBack: jest.fn(),
  onUpdateProfileData: jest.fn(),
};

describe('Step2ProfileInfo 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. 초기 렌더링', () => {
    it('헤더와 제목이 렌더링되어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      expect(screen.getByText('프로필 정보 입력')).toBeInTheDocument();
      expect(screen.getByText(/스윙댄스 커뮤니티에서 사용할/)).toBeInTheDocument();
    });

    it('모든 필수 필드 라벨이 표시되어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      expect(screen.getByLabelText(/닉네임/)).toBeInTheDocument();
      expect(screen.getByLabelText(/댄스 레벨 선택/)).toBeInTheDocument();
      expect(screen.getByLabelText(/활동 지역/)).toBeInTheDocument();
    });

    it('선택 필드 라벨이 (선택) 표시와 함께 렌더링되어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      expect(screen.getByText('자기소개')).toBeInTheDocument();
      expect(screen.getAllByText('(선택)')).toHaveLength(2); // Bio and interests
      expect(screen.getByText('관심 댄스 스타일')).toBeInTheDocument();
    });

    it('닉네임 입력 필드가 올바른 placeholder를 가져야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const nicknameInput = screen.getByPlaceholderText('닉네임을 입력하세요 (2-20자)');
      expect(nicknameInput).toBeInTheDocument();
      expect(nicknameInput).toHaveAttribute('maxLength', '20');
    });

    it('자기소개 textarea가 올바른 placeholder를 가져야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const bioTextarea = screen.getByPlaceholderText('간단한 자기소개를 작성해주세요');
      expect(bioTextarea).toBeInTheDocument();
      expect(bioTextarea).toHaveAttribute('rows', '4');
    });

    it('이전/다음 버튼이 렌더링되어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      expect(screen.getByTestId('back-button')).toBeInTheDocument();
      expect(screen.getByTestId('next-button')).toBeInTheDocument();
    });
  });

  describe('2. 닉네임 검증', () => {
    it('닉네임이 비어있으면 필수 에러 메시지가 표시되어야 함', async () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const nicknameInput = screen.getByLabelText(/닉네임/);
      fireEvent.blur(nicknameInput);

      await waitFor(() => {
        expect(screen.getByText(VALIDATION.NICKNAME.ERROR_MESSAGES.REQUIRED)).toBeInTheDocument();
      });
    });

    it('닉네임이 2자 미만이면 최소 길이 에러가 표시되어야 함', async () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const nicknameInput = screen.getByLabelText(/닉네임/);
      fireEvent.change(nicknameInput, { target: { value: 'a' } });
      fireEvent.blur(nicknameInput);

      await waitFor(() => {
        expect(screen.getByText(VALIDATION.NICKNAME.ERROR_MESSAGES.MIN_LENGTH)).toBeInTheDocument();
      });
    });

    it('닉네임이 20자를 초과하면 최대 길이 에러가 표시되어야 함', async () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const nicknameInput = screen.getByLabelText(/닉네임/);
      fireEvent.change(nicknameInput, { target: { value: 'a'.repeat(21) } });
      fireEvent.blur(nicknameInput);

      await waitFor(() => {
        expect(screen.getByText(VALIDATION.NICKNAME.ERROR_MESSAGES.MAX_LENGTH)).toBeInTheDocument();
      });
    });

    it('닉네임에 특수문자가 포함되면 패턴 에러가 표시되어야 함', async () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const nicknameInput = screen.getByLabelText(/닉네임/);
      fireEvent.change(nicknameInput, { target: { value: 'test@123' } });
      fireEvent.blur(nicknameInput);

      await waitFor(() => {
        expect(screen.getByText(VALIDATION.NICKNAME.ERROR_MESSAGES.PATTERN)).toBeInTheDocument();
      });
    });

    it('유효한 한글 닉네임이 허용되어야 함', async () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const nicknameInput = screen.getByLabelText(/닉네임/);
      fireEvent.change(nicknameInput, { target: { value: '스윙댄서' } });
      fireEvent.blur(nicknameInput);

      await waitFor(() => {
        expect(screen.queryByText(VALIDATION.NICKNAME.ERROR_MESSAGES.PATTERN)).not.toBeInTheDocument();
      });
    });

    it('유효한 영문+숫자 닉네임이 허용되어야 함', async () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const nicknameInput = screen.getByLabelText(/닉네임/);
      fireEvent.change(nicknameInput, { target: { value: 'swing123' } });
      fireEvent.blur(nicknameInput);

      await waitFor(() => {
        expect(screen.queryByText(VALIDATION.NICKNAME.ERROR_MESSAGES.PATTERN)).not.toBeInTheDocument();
      });
    });

    it('닉네임 변경 시 에러가 클리어되어야 함', async () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const nicknameInput = screen.getByLabelText(/닉네임/);

      // 에러 발생
      fireEvent.blur(nicknameInput);
      await waitFor(() => {
        expect(screen.getByText(VALIDATION.NICKNAME.ERROR_MESSAGES.REQUIRED)).toBeInTheDocument();
      });

      // 유효한 값 입력
      fireEvent.change(nicknameInput, { target: { value: 'validname' } });

      expect(screen.queryByText(VALIDATION.NICKNAME.ERROR_MESSAGES.REQUIRED)).not.toBeInTheDocument();
    });

    it('닉네임 입력 시 부모 컴포넌트가 업데이트되어야 함', () => {
      const onUpdateProfileData = jest.fn();
      render(<Step2ProfileInfo {...defaultProps} onUpdateProfileData={onUpdateProfileData} />);

      const nicknameInput = screen.getByLabelText(/닉네임/);
      fireEvent.change(nicknameInput, { target: { value: 'testuser' } });

      expect(onUpdateProfileData).toHaveBeenCalledWith({ nickname: 'testuser' });
    });
  });

  describe('3. 댄스 레벨 선택', () => {
    it('모든 댄스 레벨 옵션이 표시되어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const select = screen.getByLabelText(/댄스 레벨 선택/);

      DANCE_LEVELS.forEach(level => {
        expect(screen.getByText(`${level.label} - ${level.description}`)).toBeInTheDocument();
      });
    });

    it('기본값이 beginner로 설정되어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const select = screen.getByLabelText(/댄스 레벨 선택/) as HTMLSelectElement;
      expect(select.value).toBe('beginner');
    });

    it('댄스 레벨 변경 시 부모 컴포넌트가 업데이트되어야 함', () => {
      const onUpdateProfileData = jest.fn();
      render(<Step2ProfileInfo {...defaultProps} onUpdateProfileData={onUpdateProfileData} />);

      const select = screen.getByLabelText(/댄스 레벨 선택/);
      fireEvent.change(select, { target: { value: 'advanced' } });

      expect(onUpdateProfileData).toHaveBeenCalledWith({ danceLevel: 'advanced' });
    });

    it('props로 전달된 danceLevel이 반영되어야 함', () => {
      const props = {
        ...defaultProps,
        profileData: { ...mockProfileData, danceLevel: 'professional' as DanceLevel },
      };
      render(<Step2ProfileInfo {...props} />);

      const select = screen.getByLabelText(/댄스 레벨 선택/) as HTMLSelectElement;
      expect(select.value).toBe('professional');
    });
  });

  describe('4. 활동 지역 선택', () => {
    it('기본 placeholder 옵션이 표시되어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      expect(screen.getByText('지역을 선택하세요')).toBeInTheDocument();
    });

    it('모든 지역 옵션이 표시되어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      REGIONS.forEach(region => {
        expect(screen.getByText(region.label)).toBeInTheDocument();
      });
    });

    it('지역 미선택 시 필수 에러가 표시되어야 함', async () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const locationSelect = screen.getByLabelText(/활동 지역/);
      fireEvent.blur(locationSelect);

      await waitFor(() => {
        expect(screen.getByText(VALIDATION.LOCATION.ERROR_MESSAGES.REQUIRED)).toBeInTheDocument();
      });
    });

    it('지역 선택 시 부모 컴포넌트가 업데이트되어야 함', () => {
      const onUpdateProfileData = jest.fn();
      render(<Step2ProfileInfo {...defaultProps} onUpdateProfileData={onUpdateProfileData} />);

      const locationSelect = screen.getByLabelText(/활동 지역/);
      fireEvent.change(locationSelect, { target: { value: 'seoul' } });

      expect(onUpdateProfileData).toHaveBeenCalledWith({ location: 'seoul' });
    });

    it('지역 선택 시 에러가 클리어되어야 함', async () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const locationSelect = screen.getByLabelText(/활동 지역/);

      // 에러 발생
      fireEvent.blur(locationSelect);
      await waitFor(() => {
        expect(screen.getByText(VALIDATION.LOCATION.ERROR_MESSAGES.REQUIRED)).toBeInTheDocument();
      });

      // 지역 선택
      fireEvent.change(locationSelect, { target: { value: 'seoul' } });

      expect(screen.queryByText(VALIDATION.LOCATION.ERROR_MESSAGES.REQUIRED)).not.toBeInTheDocument();
    });

    it('props로 전달된 location이 반영되어야 함', () => {
      const props = {
        ...defaultProps,
        profileData: { ...mockProfileData, location: 'busan' },
      };
      render(<Step2ProfileInfo {...props} />);

      const locationSelect = screen.getByLabelText(/활동 지역/) as HTMLSelectElement;
      expect(locationSelect.value).toBe('busan');
    });
  });

  describe('5. 자기소개 (선택 필드)', () => {
    it('자기소개 입력 시 부모 컴포넌트가 업데이트되어야 함', () => {
      const onUpdateProfileData = jest.fn();
      render(<Step2ProfileInfo {...defaultProps} onUpdateProfileData={onUpdateProfileData} />);

      const bioTextarea = screen.getByLabelText(/자기소개/);
      fireEvent.change(bioTextarea, { target: { value: '안녕하세요' } });

      expect(onUpdateProfileData).toHaveBeenCalledWith({ bio: '안녕하세요' });
    });

    it('글자 수 카운터가 표시되어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      expect(screen.getByText(`0 / ${VALIDATION.BIO.MAX_LENGTH}`)).toBeInTheDocument();
    });

    it('입력 시 글자 수 카운터가 업데이트되어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const bioTextarea = screen.getByLabelText(/자기소개/);
      const testText = '안녕하세요. 스윙댄스 초보입니다.';
      fireEvent.change(bioTextarea, { target: { value: testText } });

      expect(screen.getByText(`${testText.length} / ${VALIDATION.BIO.MAX_LENGTH}`)).toBeInTheDocument();
    });

    it('200자 초과 시 에러 메시지가 표시되어야 함', async () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const bioTextarea = screen.getByLabelText(/자기소개/);
      const longText = 'a'.repeat(201);
      fireEvent.change(bioTextarea, { target: { value: longText } });
      fireEvent.blur(bioTextarea);

      await waitFor(() => {
        expect(screen.getByText(VALIDATION.BIO.ERROR_MESSAGES.MAX_LENGTH)).toBeInTheDocument();
      });
    });

    it('200자 초과 시 글자 수가 over-limit 스타일을 가져야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const bioTextarea = screen.getByLabelText(/자기소개/);
      const longText = 'a'.repeat(201);
      fireEvent.change(bioTextarea, { target: { value: longText } });

      const counter = screen.getByText(`201 / ${VALIDATION.BIO.MAX_LENGTH}`);
      expect(counter).toHaveClass('over-limit');
    });

    it('200자 이하는 에러가 없어야 함', async () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const bioTextarea = screen.getByLabelText(/자기소개/);
      const validText = 'a'.repeat(200);
      fireEvent.change(bioTextarea, { target: { value: validText } });
      fireEvent.blur(bioTextarea);

      await waitFor(() => {
        expect(screen.queryByText(VALIDATION.BIO.ERROR_MESSAGES.MAX_LENGTH)).not.toBeInTheDocument();
      });
    });

    it('빈 값이어도 에러가 없어야 함 (선택 필드)', async () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const bioTextarea = screen.getByLabelText(/자기소개/);
      fireEvent.blur(bioTextarea);

      await waitFor(() => {
        expect(screen.queryByText(VALIDATION.BIO.ERROR_MESSAGES.MAX_LENGTH)).not.toBeInTheDocument();
      });
    });

    it('props로 전달된 bio가 반영되어야 함', () => {
      const props = {
        ...defaultProps,
        profileData: { ...mockProfileData, bio: '스윙댄스를 사랑합니다' },
      };
      render(<Step2ProfileInfo {...props} />);

      const bioTextarea = screen.getByLabelText(/자기소개/) as HTMLTextAreaElement;
      expect(bioTextarea.value).toBe('스윙댄스를 사랑합니다');
    });
  });

  describe('6. 관심 댄스 스타일 (선택 필드)', () => {
    it('모든 댄스 스타일 칩이 렌더링되어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      DANCE_STYLES.forEach(style => {
        expect(screen.getByText(style.label)).toBeInTheDocument();
      });
    });

    it('댄스 스타일 아이콘이 표시되어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      DANCE_STYLES.forEach(style => {
        if (style.icon) {
          expect(screen.getByText(style.icon)).toBeInTheDocument();
        }
      });
    });

    it('칩 클릭 시 선택 상태가 토글되어야 함', () => {
      const onUpdateProfileData = jest.fn();
      render(<Step2ProfileInfo {...defaultProps} onUpdateProfileData={onUpdateProfileData} />);

      const lindyHopChip = screen.getByLabelText(/린디합/);

      // 첫 번째 클릭 - 선택
      fireEvent.click(lindyHopChip);
      expect(onUpdateProfileData).toHaveBeenCalledWith({ interests: ['lindy-hop'] });

      // 두 번째 클릭 - 선택 해제
      fireEvent.click(lindyHopChip);
      expect(onUpdateProfileData).toHaveBeenCalledWith({ interests: [] });
    });

    it('여러 댄스 스타일을 동시에 선택할 수 있어야 함', () => {
      const onUpdateProfileData = jest.fn();
      render(<Step2ProfileInfo {...defaultProps} onUpdateProfileData={onUpdateProfileData} />);

      const lindyHopChip = screen.getByLabelText(/린디합/);
      const charlestonChip = screen.getByLabelText(/찰스턴/);

      fireEvent.click(lindyHopChip);
      fireEvent.click(charlestonChip);

      expect(onUpdateProfileData).toHaveBeenLastCalledWith({ interests: ['lindy-hop', 'charleston'] });
    });

    it('선택된 칩이 selected 클래스를 가져야 함', () => {
      const props = {
        ...defaultProps,
        profileData: { ...mockProfileData, interests: ['lindy-hop'] },
      };
      render(<Step2ProfileInfo {...props} />);

      const lindyHopChip = screen.getByLabelText(/린디합 선택됨/);
      expect(lindyHopChip).toHaveClass('selected');
    });

    it('선택된 칩의 aria-pressed가 true여야 함', () => {
      const props = {
        ...defaultProps,
        profileData: { ...mockProfileData, interests: ['blues'] },
      };
      render(<Step2ProfileInfo {...props} />);

      const bluesChip = screen.getByLabelText(/블루스 선택됨/);
      expect(bluesChip).toHaveAttribute('aria-pressed', 'true');
    });

    it('선택되지 않은 칩의 aria-pressed가 false여야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const lindyHopChip = screen.getByLabelText(/린디합 선택 안됨/);
      expect(lindyHopChip).toHaveAttribute('aria-pressed', 'false');
    });

    it('props로 전달된 interests가 반영되어야 함', () => {
      const props = {
        ...defaultProps,
        profileData: { ...mockProfileData, interests: ['lindy-hop', 'balboa'] },
      };
      render(<Step2ProfileInfo {...props} />);

      expect(screen.getByLabelText(/린디합 선택됨/)).toHaveClass('selected');
      expect(screen.getByLabelText(/발보아 선택됨/)).toHaveClass('selected');
    });
  });

  describe('7. 버튼 동작', () => {
    it('이전 버튼 클릭 시 onBack이 호출되어야 함', () => {
      const onBack = jest.fn();
      render(<Step2ProfileInfo {...defaultProps} onBack={onBack} />);

      const prevButton = screen.getByTestId('back-button');
      fireEvent.click(prevButton);

      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('다음 버튼이 필수 필드 미입력 시 비활성화되어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).toBeDisabled();
    });

    it('닉네임만 입력 시 다음 버튼이 비활성화되어야 함', () => {
      const props = {
        ...defaultProps,
        profileData: { ...mockProfileData, nickname: 'testuser' },
      };
      render(<Step2ProfileInfo {...props} />);

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).toBeDisabled();
    });

    it('닉네임과 지역 입력 시 다음 버튼이 활성화되어야 함', () => {
      const props = {
        ...defaultProps,
        profileData: {
          ...mockProfileData,
          nickname: 'testuser',
          location: 'seoul',
        },
      };
      render(<Step2ProfileInfo {...props} />);

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).not.toBeDisabled();
    });

    it('유효한 폼 상태에서 다음 버튼 클릭 시 onNext가 호출되어야 함', () => {
      const onNext = jest.fn();
      const props = {
        ...defaultProps,
        onNext,
        profileData: {
          ...mockProfileData,
          nickname: 'testuser',
          location: 'seoul',
        },
      };
      render(<Step2ProfileInfo {...props} />);

      const nextButton = screen.getByTestId('next-button');
      fireEvent.click(nextButton);

      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('잘못된 닉네임으로 다음 버튼이 비활성화되어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const nextButton = screen.getByTestId('next-button');
      // 필수 필드가 비어있으면 버튼 비활성화
      expect(nextButton).toBeDisabled();
    });

    it('자기소개 200자 초과 시 다음 버튼 클릭이 막혀야 함', () => {
      const onNext = jest.fn();
      const props = {
        ...defaultProps,
        onNext,
        profileData: {
          ...mockProfileData,
          nickname: 'testuser',
          location: 'seoul',
          bio: 'a'.repeat(201),
        },
      };
      render(<Step2ProfileInfo {...props} />);

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).toBeDisabled();
    });
  });

  describe('8. 폼 검증', () => {
    it('모든 필수 필드가 유효할 때 폼이 유효해야 함', () => {
      const props = {
        ...defaultProps,
        profileData: {
          ...mockProfileData,
          nickname: 'validuser',
          location: 'seoul',
        },
      };
      render(<Step2ProfileInfo {...props} />);

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).not.toBeDisabled();
    });

    it('닉네임이 유효하지 않으면 폼이 무효해야 함', () => {
      const props = {
        ...defaultProps,
        profileData: {
          ...mockProfileData,
          nickname: 'a', // too short
          location: 'seoul',
        },
      };
      render(<Step2ProfileInfo {...props} />);

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).toBeDisabled();
    });

    it('지역이 선택되지 않으면 폼이 무효해야 함', () => {
      const props = {
        ...defaultProps,
        profileData: {
          ...mockProfileData,
          nickname: 'validuser',
          location: '',
        },
      };
      render(<Step2ProfileInfo {...props} />);

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).toBeDisabled();
    });

    it('선택 필드(자기소개, 댄스 스타일)는 폼 유효성에 영향을 주지 않아야 함', () => {
      const props = {
        ...defaultProps,
        profileData: {
          ...mockProfileData,
          nickname: 'validuser',
          location: 'seoul',
          bio: '',
          interests: [],
        },
      };
      render(<Step2ProfileInfo {...props} />);

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).not.toBeDisabled();
    });

    it('필수 필드가 비어있으면 다음 버튼이 비활성화되어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const nextButton = screen.getByTestId('next-button');
      // 필수 필드(닉네임, 지역)가 비어있으므로 버튼 비활성화
      expect(nextButton).toBeDisabled();
    });

    it('실시간 검증이 blur 이벤트에서 동작해야 함', async () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const nicknameInput = screen.getByLabelText(/닉네임/);

      // focus 후 blur
      fireEvent.focus(nicknameInput);
      fireEvent.blur(nicknameInput);

      await waitFor(() => {
        expect(screen.getByText(VALIDATION.NICKNAME.ERROR_MESSAGES.REQUIRED)).toBeInTheDocument();
      });
    });
  });

  describe('9. 접근성', () => {
    it('필수 필드에 required 마커가 표시되어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const nicknameLabel = screen.getByText('닉네임').closest('.field-label');
      const danceLevelLabel = screen.getByText('댄스 레벨').closest('.field-label');
      const locationLabel = screen.getByText('활동 지역').closest('.field-label');

      expect(nicknameLabel).toHaveClass('required');
      expect(danceLevelLabel).toHaveClass('required');
      expect(locationLabel).toHaveClass('required');
    });

    it('에러 메시지에 role="alert"이 있어야 함', async () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const nicknameInput = screen.getByLabelText(/닉네임/);
      fireEvent.blur(nicknameInput);

      await waitFor(() => {
        const errorMessage = screen.getByText(VALIDATION.NICKNAME.ERROR_MESSAGES.REQUIRED);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });

    it('에러 상태의 입력 필드에 aria-invalid가 true여야 함', async () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const nicknameInput = screen.getByLabelText(/닉네임/);
      fireEvent.blur(nicknameInput);

      await waitFor(() => {
        expect(nicknameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('에러 메시지가 aria-describedby로 연결되어야 함', async () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const nicknameInput = screen.getByLabelText(/닉네임/);
      fireEvent.blur(nicknameInput);

      await waitFor(() => {
        expect(nicknameInput).toHaveAttribute('aria-describedby', 'nickname-error');
        expect(screen.getByText(VALIDATION.NICKNAME.ERROR_MESSAGES.REQUIRED)).toHaveAttribute('id', 'nickname-error');
      });
    });

    it('글자 수 카운터에 aria-live가 있어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const counter = screen.getByText(`0 / ${VALIDATION.BIO.MAX_LENGTH}`);
      expect(counter).toHaveAttribute('aria-live', 'polite');
    });

    it('댄스 스타일 칩 컨테이너에 role="group"이 있어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const chipContainer = screen.getByRole('group', { name: '관심 댄스 스타일 선택' });
      expect(chipContainer).toBeInTheDocument();
    });

    it('버튼에 적절한 aria-label이 있어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      expect(screen.getByTestId('back-button')).toHaveAttribute('aria-label', '이전 단계로');
      expect(screen.getByTestId('next-button')).toHaveAttribute('aria-label', '다음 단계로');
    });

    it('댄스 레벨 select에 aria-label이 있어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const select = screen.getByLabelText(/댄스 레벨 선택/);
      expect(select).toHaveAttribute('aria-label', '댄스 레벨 선택');
    });

    it('자기소개 textarea에 bio-counter가 aria-describedby로 연결되어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const bioTextarea = screen.getByLabelText(/자기소개/);
      expect(bioTextarea).toHaveAttribute('aria-describedby', 'bio-counter');
    });
  });

  describe('10. 반응형 및 스타일', () => {
    it('컴포넌트가 step2-container 클래스를 가져야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const container = screen.getByText('프로필 정보 입력').closest('.step2-container');
      expect(container).toBeInTheDocument();
    });

    it('카드 컨테이너가 glassmorphism 스타일을 가져야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const card = screen.getByText('프로필 정보 입력').closest('.step2-card');
      expect(card).toBeInTheDocument();
    });

    it('에러 상태의 입력 필드가 error 클래스를 가져야 함', async () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const nicknameInput = screen.getByLabelText(/닉네임/);
      fireEvent.blur(nicknameInput);

      await waitFor(() => {
        expect(nicknameInput).toHaveClass('error');
      });
    });

    it('버튼 그룹이 적절한 레이아웃을 가져야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const prevButton = screen.getByTestId('back-button');
      const nextButton = screen.getByTestId('next-button');

      expect(prevButton.style.flex).toContain('1');
      expect(nextButton.style.flex).toContain('2');
    });

    it('댄스 스타일 칩이 chip-container 안에 있어야 함', () => {
      render(<Step2ProfileInfo {...defaultProps} />);

      const chipContainer = document.querySelector('.chip-container');
      expect(chipContainer).toBeInTheDocument();

      const lindyHopChip = screen.getByLabelText(/린디합/);
      expect(chipContainer).toContainElement(lindyHopChip);
    });
  });

  describe('11. 데이터 동기화', () => {
    it('props 변경 시 로컬 상태가 업데이트되어야 함', () => {
      const { rerender } = render(<Step2ProfileInfo {...defaultProps} />);

      const updatedProps = {
        ...defaultProps,
        profileData: {
          ...mockProfileData,
          nickname: 'newname',
          location: 'busan',
        },
      };
      rerender(<Step2ProfileInfo {...updatedProps} />);

      const nicknameInput = screen.getByLabelText(/닉네임/) as HTMLInputElement;
      const locationSelect = screen.getByLabelText(/활동 지역/) as HTMLSelectElement;

      expect(nicknameInput.value).toBe('newname');
      expect(locationSelect.value).toBe('busan');
    });

    it('모든 필드 변경 시 onUpdateProfileData가 올바른 데이터로 호출되어야 함', () => {
      const onUpdateProfileData = jest.fn();
      render(<Step2ProfileInfo {...defaultProps} onUpdateProfileData={onUpdateProfileData} />);

      // 닉네임 변경
      const nicknameInput = screen.getByLabelText(/닉네임/);
      fireEvent.change(nicknameInput, { target: { value: 'dancer' } });
      expect(onUpdateProfileData).toHaveBeenCalledWith({ nickname: 'dancer' });

      // 댄스 레벨 변경
      const danceLevelSelect = screen.getByLabelText(/댄스 레벨 선택/);
      fireEvent.change(danceLevelSelect, { target: { value: 'intermediate' } });
      expect(onUpdateProfileData).toHaveBeenCalledWith({ danceLevel: 'intermediate' });

      // 지역 변경
      const locationSelect = screen.getByLabelText(/활동 지역/);
      fireEvent.change(locationSelect, { target: { value: 'seoul' } });
      expect(onUpdateProfileData).toHaveBeenCalledWith({ location: 'seoul' });

      // 자기소개 변경
      const bioTextarea = screen.getByLabelText(/자기소개/);
      fireEvent.change(bioTextarea, { target: { value: 'Hello' } });
      expect(onUpdateProfileData).toHaveBeenCalledWith({ bio: 'Hello' });

      // 댄스 스타일 변경
      const lindyHopChip = screen.getByLabelText(/린디합/);
      fireEvent.click(lindyHopChip);
      expect(onUpdateProfileData).toHaveBeenCalledWith({ interests: ['lindy-hop'] });
    });
  });
});
