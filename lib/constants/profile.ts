/**
 * Profile-related constants for Swing Connect
 */

import type { DanceLevel } from '../types/auth';

// Dance levels with display labels
export interface DanceLevelOption {
  value: DanceLevel;
  label: string;
  description: string;
}

export const DANCE_LEVELS: DanceLevelOption[] = [
  {
    value: 'beginner',
    label: '초급',
    description: '6개월 미만 또는 기본 스텝 학습 중'
  },
  {
    value: 'intermediate',
    label: '중급',
    description: '6개월~2년 또는 사교춤 가능'
  },
  {
    value: 'advanced',
    label: '고급',
    description: '2년 이상 또는 대회 참가 경험'
  },
  {
    value: 'professional',
    label: '전문가',
    description: '강사 또는 전문 댄서'
  },
];

// Korean regions/cities
export interface RegionOption {
  value: string;
  label: string;
}

export const REGIONS: RegionOption[] = [
  { value: 'seoul', label: '서울' },
  { value: 'gyeonggi', label: '경기' },
  { value: 'busan', label: '부산' },
  { value: 'daegu', label: '대구' },
  { value: 'incheon', label: '인천' },
  { value: 'gwangju', label: '광주' },
  { value: 'daejeon', label: '대전' },
  { value: 'ulsan', label: '울산' },
  { value: 'sejong', label: '세종' },
  { value: 'gangwon', label: '강원' },
  { value: 'chungbuk', label: '충북' },
  { value: 'chungnam', label: '충남' },
  { value: 'jeonbuk', label: '전북' },
  { value: 'jeonnam', label: '전남' },
  { value: 'gyeongbuk', label: '경북' },
  { value: 'gyeongnam', label: '경남' },
  { value: 'jeju', label: '제주' },
];

// Dance styles/interests
export interface DanceStyleOption {
  value: string;
  label: string;
  icon?: string;
}

export const DANCE_STYLES: DanceStyleOption[] = [
  { value: 'lindy-hop', label: '린디합', icon: '🎷' },
  { value: 'charleston', label: '찰스턴', icon: '🎹' },
  { value: 'balboa', label: '발보아', icon: '🎺' },
  { value: 'blues', label: '블루스', icon: '🎵' },
  { value: 'solo-jazz', label: '솔로 재즈', icon: '💃' },
  { value: 'authentic-jazz', label: '어썬틱 재즈', icon: '🕺' },
  { value: 'shag', label: '쉐그', icon: '🎶' },
  { value: 'boogie-woogie', label: '부기우기', icon: '🎼' },
];

// Validation constants
export const VALIDATION = {
  NICKNAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9가-힣]{2,20}$/,
    ERROR_MESSAGES: {
      REQUIRED: '닉네임을 입력해주세요',
      PATTERN: '닉네임은 2-20자의 한글, 영문, 숫자만 가능합니다',
      MIN_LENGTH: '닉네임은 최소 2자 이상이어야 합니다',
      MAX_LENGTH: '닉네임은 최대 20자까지 가능합니다',
    },
  },
  BIO: {
    MAX_LENGTH: 200,
    ERROR_MESSAGES: {
      MAX_LENGTH: '자기소개는 최대 200자까지 가능합니다',
    },
  },
  LOCATION: {
    ERROR_MESSAGES: {
      REQUIRED: '활동 지역을 선택해주세요',
    },
  },
};
