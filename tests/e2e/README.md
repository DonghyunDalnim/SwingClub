# E2E Tests for Swing Connect

이 디렉토리에는 Playwright를 사용한 End-to-End 테스트가 포함되어 있습니다.

## 📋 현재 상태

⚠️ **중요**: 현재 E2E 테스트는 `test.skip`으로 비활성화되어 있습니다.

### 의존성

다음 PR들이 먼저 머지되어야 테스트를 활성화할 수 있습니다:

- [ ] PR #108 - Issue #100: 프로필 편집 페이지에 댄스 스타일 섹션 통합
- [ ] PR #109 - Issue #102: 프로필 조회 페이지에 댄스 스타일 섹션 추가
- [ ] PR #110 - Issue #103: 댄스 스타일 데이터 검증 및 Firestore 업데이트 로직

### 테스트 활성화 방법

위 PR들이 모두 머지되면:

1. `tests/e2e/profile/dance-styles.spec.ts` 파일 열기
2. 모든 `test.describe.skip`을 `test.describe`로 변경
3. 인증 픽스처 구현 완료 (`tests/e2e/fixtures/auth.ts`)
4. 테스트 실행

## 🚀 설치 및 설정

### Playwright 브라우저 설치

```bash
npx playwright install
```

### 환경 변수 설정

`.env.test` 파일을 생성하고 테스트용 Firebase 설정 추가:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_test_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_test_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_test_project_id
# ... 기타 Firebase 설정
```

## 📝 테스트 실행

### 모든 E2E 테스트 실행

```bash
npm run test:e2e
```

### UI 모드로 실행 (추천)

```bash
npm run test:e2e:ui
```

Playwright Test Runner UI가 열려서 테스트를 시각적으로 확인하고 디버깅할 수 있습니다.

### 디버그 모드로 실행

```bash
npm run test:e2e:debug
```

### 헤드풀 모드로 실행 (브라우저 보이기)

```bash
npm run test:e2e:headed
```

### 특정 테스트 파일만 실행

```bash
npx playwright test tests/e2e/profile/dance-styles.spec.ts
```

### 특정 브라우저에서만 실행

```bash
# Chromium만
npx playwright test --project=chromium

# Firefox만
npx playwright test --project=firefox

# Mobile Chrome만
npx playwright test --project="Mobile Chrome"
```

## 📊 테스트 리포트 확인

테스트 실행 후 HTML 리포트 보기:

```bash
npm run test:e2e:report
```

## 📁 디렉토리 구조

```
tests/e2e/
├── README.md                    # 이 파일
├── profile/                     # 프로필 관련 E2E 테스트
│   └── dance-styles.spec.ts    # 댄스 스타일 E2E 테스트
├── fixtures/                    # 테스트 픽스처
│   ├── auth.ts                 # 인증 픽스처
│   └── users.ts                # 사용자 데이터 픽스처
└── utils/                       # 유틸리티 함수
    └── dance-style-helpers.ts  # 댄스 스타일 헬퍼 함수
```

## 🧪 테스트 시나리오

### 1. Dance Styles - Complete User Flow
- 로그인 → 프로필 편집 → 댄스 스타일 추가 → 저장 → 프로필 조회 전체 플로우
- 댄스 스타일 표시 및 별점 시각화 검증

### 2. Dance Styles - Modification Flow
- 기존 댄스 스타일 레벨 수정
- 새로운 댄스 스타일 추가
- 댄스 스타일 제거
- 모든 댄스 스타일 제거

### 3. Dance Styles - Maximum Limit
- 최대 10개 댄스 스타일 제한 검증
- 최대 개수 도달 시 UI 변경 확인
- 제한 상태에서 추가/제거 동작

### 4. Dance Styles - Backward Compatibility
- `danceStyles` 필드가 없는 레거시 사용자 처리
- 빈 배열 vs undefined 처리
- 레거시 사용자의 첫 댄스 스타일 추가

### 5. Dance Styles - Error Scenarios
- 네트워크 오류 처리
- 유효하지 않은 데이터 입력
- 서버 검증 오류 처리

### 6. Dance Styles - UI Responsiveness
- 모바일 뷰포트 (375x667)
- 데스크톱 뷰포트 (1920x1080)
- 그리드 레이아웃 반응형 동작

### 7. Dance Styles - Accessibility
- 키보드 네비게이션
- ARIA 속성 검증
- 스크린 리더 호환성

## 🔧 헬퍼 함수

`tests/e2e/utils/dance-style-helpers.ts`에서 제공하는 주요 함수들:

### 네비게이션
- `navigateToProfileEdit(page)` - 프로필 편집 페이지로 이동
- `navigateToProfile(page, userId?)` - 프로필 조회 페이지로 이동

### 댄스 스타일 조작
- `addDanceStyle(page, name, level)` - 댄스 스타일 추가
- `removeDanceStyle(page, name)` - 댄스 스타일 제거
- `changeDanceStyleLevel(page, name, level)` - 레벨 변경
- `saveDanceStyles(page)` - 변경사항 저장

### 검증
- `verifyDanceStylesInProfile(page, styles)` - 프로필에서 댄스 스타일 검증
- `verifyEmptyState(page, isOwnProfile)` - 빈 상태 검증
- `verifyDanceStyleCounter(page, count)` - 카운터 검증
- `verifyStarRating(page, name, level)` - 별점 시각화 검증

## 🎭 픽스처

### 인증 픽스처 (`fixtures/auth.ts`)
- `authenticatedPage` - 인증된 사용자 컨텍스트

### 사용자 데이터 픽스처 (`fixtures/users.ts`)
- `userWithDanceStyles` - 댄스 스타일이 있는 사용자
- `userWithoutDanceStyles` - 댄스 스타일이 없는 사용자
- `legacyUser` - danceStyles 필드가 undefined인 레거시 사용자
- `userWithMaxDanceStyles` - 최대 10개 댄스 스타일을 가진 사용자
- `userWithMixedLevels` - 다양한 레벨의 댄스 스타일을 가진 사용자

## 🐛 디버깅

### Trace Viewer 사용

테스트 실패 시 자동으로 trace가 생성됩니다:

```bash
npx playwright show-trace test-results/*/trace.zip
```

### 스크린샷 확인

실패한 테스트의 스크린샷은 `test-results/` 디렉토리에 저장됩니다.

### 비디오 확인

실패한 테스트의 비디오는 `test-results/` 디렉토리에 저장됩니다.

## 📌 주의사항

1. **테스트 격리**: 각 테스트는 독립적으로 실행되어야 합니다
2. **데이터 정리**: 테스트 후 생성된 데이터는 자동으로 정리되어야 합니다
3. **타임아웃**: 네트워크 지연을 고려한 적절한 타임아웃 설정
4. **병렬 실행**: CI 환경에서는 순차 실행 (workers: 1)
5. **재시도**: CI 환경에서는 2회 재시도 설정

## 🔗 관련 문서

- [Playwright 공식 문서](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)

## 📞 문의

E2E 테스트 관련 문의사항은 Issue를 생성해주세요.
