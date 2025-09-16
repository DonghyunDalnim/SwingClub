# 🕺 Swing Connect 💃
> 스윙댄스 애호가들을 위한 통합 커뮤니티 플랫폼

## 📖 프로젝트 개요

Swing Connect는 스윙댄스 커뮤니티를 위한 원스톱 플랫폼으로, 지역 기반 모임 정보 공유, 파트너 매칭, 중고거래를 제공하는 NextJS 기반 웹 애플리케이션입니다.

### 🎯 주요 기능

- **🔐 소셜 로그인**: 카카오톡, 네이버, 구글 로그인 지원
- **🏠 메인 홈**: Today's Swing, 주변 댄스 정보, HOT TOPICS
- **🗺️ 지역 기반 서비스**: 지도 연동 스튜디오/모임 정보
- **👥 커뮤니티**: 게시판, 파트너 찾기, 질문답변
- **🛒 중고거래**: 댄스 용품 전문 거래 플랫폼
- **👤 사용자 프로필**: 댄스 레벨, 활동 통계, 뱃지 시스템

## 🛠 기술 스택

- **Framework**: Next.js 15.5.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1.13
- **UI Components**: Shadcn UI
- **Icons**: Lucide React
- **Development**: Turbopack (enhanced performance)

## 📱 화면 구성

### 1. 로그인 페이지 (`/login`)
- 소셜 로그인 (카카오톡, 네이버, 구글)
- 스윙댄스 테마 디자인
- 반응형 카드 레이아웃

### 2. 메인 홈 (`/home`)
- Today's Swing 섹션
- 내 주변 댄스 정보
- 커뮤니티 빠른 접근
- HOT TOPICS 피드

### 3. 지역 정보 (`/location`)
- 지도 연동 (카카오맵 예정)
- 스튜디오/연습실/클럽 필터링
- 평점 및 활동 회원 수 표시

### 4. 커뮤니티 (`/community`)
- 카테고리별 게시판
- 실시간 게시글 피드
- 좋아요, 댓글, 조회수 시스템

### 5. 중고거래 (`/marketplace`)
- 댄스 용품 전문 거래
- 카테고리 필터 (신발, 의상, 액세서리)
- 판매자 평점 시스템

### 6. 내 프로필 (`/profile`)
- 댄스 레벨 및 선호 스타일
- 활동 통계 및 뱃지
- 자기소개 및 설정

## 🚀 시작하기

### 설치 및 실행

```bash
# 프로젝트 클론
cd swing-connect

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

### 사용 가능한 스크립트

```bash
npm run dev        # 개발 서버 실행 (Turbopack)
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 서버 실행
npm run lint       # ESLint 검사
npm run type-check # TypeScript 타입 검사
```

## 📁 프로젝트 구조

```
swing-connect/
├── app/                    # Next.js App Router
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈 리다이렉트
│   ├── login/             # 로그인 페이지
│   ├── home/              # 메인 홈
│   ├── location/          # 지역 정보
│   ├── community/         # 커뮤니티
│   ├── marketplace/       # 중고거래
│   └── profile/           # 사용자 프로필
├── components/
│   ├── ui/                # Shadcn UI 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── badge.tsx
│   └── navigation/
│       └── BottomNav.tsx  # 하단 네비게이션
├── lib/
│   └── utils.ts           # 유틸리티 함수
└── styles/                # 추가 스타일 파일
```

## 🎨 UI/UX 특징

### 모바일 우선 설계
- 반응형 디자인으로 모든 디바이스 지원
- 하단 탭 네비게이션으로 모바일 친화적 UX

### 스윙댄스 테마
- 댄스와 음악을 연상시키는 이모지 활용
- 활동적이고 친근한 느낌의 컬러 팔레트
- 커뮤니티 중심의 따뜻한 디자인

### 접근성 고려
- Shadcn UI 기반의 접근성 최적화 컴포넌트
- 명확한 비주얼 계층구조
- 직관적인 아이콘과 라벨링

## 🔮 향후 개발 계획

### Phase 1: 백엔드 연동
- [ ] 사용자 인증 시스템 구현
- [ ] 데이터베이스 설계 및 API 개발
- [ ] 실시간 댓글 시스템

### Phase 2: 고도화 기능
- [ ] 카카오맵 API 연동
- [ ] 푸시 알림 시스템
- [ ] 파트너 매칭 알고리즘

### Phase 3: 확장 기능
- [ ] 온라인 강의 플랫폼
- [ ] AI 추천 시스템
- [ ] 결제 시스템 (프리미엄 기능)

## 📄 라이선스

이 프로젝트는 개인 학습 및 포트폴리오 목적으로 제작되었습니다.

---

## 👥 기여하기

프로젝트 개선을 위한 제안이나 버그 리포트는 언제든 환영합니다!

**개발자**: 신동현
**이메일**: [연락처]
**프로젝트 생성일**: 2025년 9월 16일

---

> 💃 "모든 스윙댄서들이 하나로 연결되는 그날까지!" 🕺