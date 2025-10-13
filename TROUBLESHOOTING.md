# Troubleshooting Guide

Next.js 개발 중 발생할 수 있는 일반적인 문제와 해결 방법을 정리합니다.

## Server Actions 관련 문제

### 문제: "Failed to find Server Action" 에러

**증상**:
```
Error: Failed to find Server Action "40c49e96d7895a977d55f0f00d1feb363876bf40af".
This request might be from an older or newer deployment.
```

**원인**:
1. **HMR(Hot Module Replacement) 중 해시 미스매치**
   - 클라이언트와 서버 간 Server Action 해시 불일치
   - 코드 수정 후 브라우저가 이전 버전의 해시를 사용

2. **빌드 캐시 오염**
   - `.next` 디렉토리 내부의 Server Action 매니페스트와 실제 번들 파일 간 동기화 실패
   - 개발 중 여러 번 파일 수정으로 인한 캐시 불일치

3. **브라우저 캐시 문제**
   - 이전 배포의 JavaScript 번들이 브라우저에 캐시됨

**해결 방법**:

#### 방법 1: 완전한 재시작 (권장)
```bash
# 1. 개발 서버 중지 (Ctrl+C)
# 2. .next 캐시 삭제 및 재시작
rm -rf .next && npm run dev
```

#### 방법 2: 브라우저 강력 새로고침
- **Chrome/Edge**: `Cmd/Ctrl + Shift + R` 또는 개발자 도구에서 "Disable cache" 체크
- **Firefox**: `Cmd/Ctrl + Shift + Delete`로 캐시 삭제

#### 방법 3: 완전 초기화
```bash
# 모든 캐시와 의존성 재설치
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### 문제: Server Action이 클라이언트에서 호출되지 않음

**증상**:
- Server Action 함수 호출 시 아무 응답이 없음
- 네트워크 탭에서 POST 요청이 보이지 않음

**원인**:
- Server Action 파일에 `'use server'` 지시어 누락
- 클라이언트 컴포넌트에서 직접 import 시 문제 발생

**해결 방법**:
```typescript
// ✅ 올바른 방법: lib/actions/posts.ts
'use server'  // 파일 최상단에 필수!

export async function createPostAction(data: CreatePostData) {
  // ...
}

// ✅ 클라이언트 컴포넌트에서 사용
'use client'
import { createPostAction } from '@/lib/actions/posts'

const result = await createPostAction(data)
```

## Firestore 보안 규칙 문제

### 문제: PERMISSION_DENIED 에러

**증상**:
```
7 PERMISSION_DENIED: Missing or insufficient permissions
```

**원인**:
- Server Actions에서 Firestore 클라이언트 SDK 사용 시 `request.auth`가 null
- 보안 규칙에서 `request.auth.uid` 검증 실패

**해결 방법**:

#### 임시 해결책 (개발 환경):
```firestore
// firestore.rules - 개발 환경용 완화된 규칙
match /posts/{postId} {
  allow read: if true;
  allow create: if request.resource.data.keys().hasAll(['title', 'content', 'category']);
}
```

#### 프로덕션 해결책:
Firebase Admin SDK 사용으로 서버 측 인증 구현 (TODO)

## 인증 관련 문제

### 문제: 쿠키 이름 미스매치

**증상**:
- 클라이언트에서 로그인 완료했지만 서버에서 인증 실패
- `getCurrentUser()` 반환값이 null

**원인**:
- 클라이언트와 서버에서 사용하는 쿠키 이름 불일치
- 예: 클라이언트 `firebase-token`, 서버 `auth-token`

**해결 방법**:
```typescript
// lib/auth/context.tsx (클라이언트)
document.cookie = `firebase-token=${token}; path=/; max-age=${maxAge}`

// lib/auth/server.ts (서버)
const authToken = cookieStore.get('firebase-token')  // 동일한 이름 사용!
```

## 스타일링 문제

### 문제: Tailwind CSS 클래스가 적용되지 않음

**증상**:
- 컴포넌트에 Tailwind 클래스를 추가했지만 스타일이 적용되지 않음

**원인**:
- Tailwind CSS 4.x는 PostCSS 플러그인 필요
- JIT 모드에서 동적 클래스명은 인식되지 않음

**해결 방법**:
```javascript
// postcss.config.js - 올바른 설정
export default {
  plugins: {
    '@tailwindcss/postcss': {}  // Tailwind CSS 4.x 전용
  }
}
```

동적 클래스 사용 시:
```typescript
// ❌ 동적 클래스 - JIT가 인식 못함
<div className={`text-${color}-500`}>

// ✅ 전체 클래스명 사용
<div className={color === 'red' ? 'text-red-500' : 'text-blue-500'}>
```

## 라우팅 문제

### 문제: `router.push()` 후 페이지 이동 안됨

**증상**:
- `router.push()` 호출했지만 페이지가 이동되지 않음
- useTransition 사용 시 pending 상태로 멈춤

**원인**:
- `startTransition()` 내부에서 `router.push()` 호출 시 블로킹
- React의 transition 우선순위와 네비게이션 충돌

**해결 방법**:
```typescript
// ❌ 문제 코드
startTransition(async () => {
  const result = await action()
  router.push('/success')  // 멈춤!
})

// ✅ 해결 방법
const [isSubmitting, setIsSubmitting] = useState(false)
setIsSubmitting(true)
const result = await action()
router.push('/success')  // 정상 작동!
```

## 성능 최적화

### Tip: 개발 서버 성능 개선

```bash
# 1. Node.js 메모리 증가
NODE_OPTIONS='--max-old-space-size=4096' npm run dev

# 2. 불필요한 파일 감시 제외
# next.config.js
export default {
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules', '**/.git', '**/.next']
    }
    return config
  }
}
```

## 디버깅 팁

### Server Actions 디버깅

```typescript
// lib/actions/posts.ts
export async function createPostAction(data: CreatePostData) {
  console.log('[createPostAction] Input data:', data)

  try {
    const result = await createPost(data)
    console.log('[createPostAction] Success:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('[createPostAction] Error:', error)
    return { success: false, error: error.message }
  }
}
```

### Firestore 보안 규칙 디버깅

Firebase Console → Firestore → Rules → Simulator에서 테스트:
```
Operation: get/create/update/delete
Location: /posts/{postId}
Auth: Authenticated user with uid
```

## 참고 자료

- [Next.js Server Actions 공식 문서](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Firestore 보안 규칙 가이드](https://firebase.google.com/docs/firestore/security/get-started)
- [Next.js 캐싱 전략](https://nextjs.org/docs/app/building-your-application/caching)
