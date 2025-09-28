import { theme } from './theme';

// CSS 클래스 생성을 위한 유틸리티 함수들
export const tokens = {
  // 색상 토큰을 CSS 변수로 변환
  colors: {
    primary: 'var(--color-primary, #693BF2)',
    primaryHover: 'var(--color-primary-hover, #5A2FD9)',
    secondary: 'var(--color-secondary, #F1EEFF)',
    neutral: {
      darkest: 'var(--color-neutral-darkest, #293341)',
      dark: 'var(--color-neutral-dark, #1C242F)',
      medium: 'var(--color-neutral-medium, #6A7685)',
      light: 'var(--color-neutral-light, #C7CED6)',
      lightest: 'var(--color-neutral-lightest, #EFF1F5)',
      background: 'var(--color-neutral-background, #F6F7F9)',
    },
    white: 'var(--color-white, #FFFFFF)',
    accent: {
      red: 'var(--color-accent-red, #EA1623)',
      blue: 'var(--color-accent-blue, #103580)',
    }
  },

  // 간격 토큰
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
  },

  // 반응형 토큰
  breakpoints: {
    mobile: '375px',
    tablet: '768px',
    desktop: '1200px',
  },

  // 그림자 토큰
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.06)',
    md: '0 4px 16px rgba(0, 0, 0, 0.12)',
    lg: '0 2px 12px rgba(0, 0, 0, 0.08)',
  },

  // 둥근 모서리 토큰
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // 폰트 크기 토큰
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '32px',
    '5xl': '40px',
  },

  // 폰트 두께 토큰
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // 줄 높이 토큰
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  }
};

// 공통 스타일 조합 함수들
export const createButtonStyle = (variant: 'primary' | 'secondary' | 'ghost' | 'outline' | 'default' = 'primary') => {
  // 강화된 포커스 스타일: #693BF2 색상 2px 아웃라인 보장
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:outline-2 focus:outline-[#693BF2] focus:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-[#693BF2] text-white hover:bg-[#5A2FD9] active:bg-[#4A1FCC]',
    secondary: 'bg-transparent text-[#293341] border border-[#E0E5EB] hover:bg-[#F6F7F9] active:bg-[#EFF1F5]',
    ghost: 'bg-transparent text-[#693BF2] hover:bg-[#F1EEFF] active:bg-[#E3DEFF]',
    outline: 'bg-transparent text-[#693BF2] border border-[#693BF2] hover:bg-[#F1EEFF] active:bg-[#E3DEFF]',
    default: 'bg-[#693BF2] text-white hover:bg-[#5A2FD9] active:bg-[#4A1FCC]'
  };

  return `${base} ${variants[variant]}`;
};

export const createCardStyle = (variant: 'default' | 'service' | 'portfolio' = 'default') => {
  const base = 'bg-white border border-[#EFF1F5] transition-all duration-200';

  const variants = {
    default: 'rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:-translate-y-0.5',
    service: 'rounded-lg p-3 text-center',
    portfolio: 'rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.08)]'
  };

  return `${base} ${variants[variant]}`;
};

export const createTextStyle = (variant: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small') => {
  const variants = {
    h1: 'text-5xl font-normal leading-[60px] text-[#293341]',
    h2: 'text-3xl font-bold leading-[48px] text-[#293341]',
    h3: 'text-sm font-medium leading-5 text-white',
    h4: 'text-base font-medium leading-[25.12px] text-[#293341]',
    body: 'text-base font-normal leading-6 text-[#293341]',
    small: 'text-sm text-[#6A7685]'
  };

  return variants[variant];
};

export const createBadgeStyle = (variant: 'rating' | 'category' = 'category') => {
  const base = 'inline-flex items-center justify-center font-medium';

  const variants = {
    rating: 'bg-[#693BF2] text-white px-2 py-1 rounded text-xs font-semibold',
    category: 'bg-[#F1EEFF] text-[#693BF2] px-3 py-1 rounded-full text-xs'
  };

  return `${base} ${variants[variant]}`;
};

// 컨테이너 스타일
export const containerStyle = 'max-w-[1200px] mx-auto px-4';

// 그리드 스타일
export const gridStyle = 'grid gap-4';

// 플렉스 스타일 유틸리티
export const flexStyles = {
  center: 'flex items-center justify-center',
  between: 'flex items-center justify-between',
  start: 'flex items-center justify-start',
  column: 'flex flex-col',
  columnCenter: 'flex flex-col items-center justify-center',
  wrap: 'flex flex-wrap',
};

// 반응형 그리드 클래스
export const responsiveGrid = {
  autoFit: 'grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-3',
  mobile2: 'grid grid-cols-2 gap-4',
  tablet3: 'grid grid-cols-2 md:grid-cols-3 gap-4',
  desktop6: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4',
};