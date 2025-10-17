# Server Action Not Found Error Fix

**Date**: 2025-10-17
**Error**: `UnrecognizedActionError: Server Action was not found on the server`

---

## 🐛 문제 발생

### 에러 메시지
```
Console UnrecognizedActionError

Server Action "40ba251d9667a9f937333020a2c49e0f5a5023a4fc" was not found on the server.
Read more: https://nextjs.org/docs/messages/failed-to-find-server-action

Call Stack
fetchServerAction
../src/client/components/router-reducer/reducers/server-action-reducer.ts (117:11)
```

### 증상
- 클라이언트에서 서버 액션 호출 시 오류 발생
- 특정 해시값(`40ba251d9667...`)의 서버 액션을 찾을 수 없음
- 폼 제출, 데이터 업데이트 등 서버 액션이 실행되지 않음

---

## 🔍 Root Cause Analysis

### 원인: 클라이언트-서버 빌드 불일치

**Next.js Server Actions 작동 방식:**
1. 빌드 타임에 서버 액션에 **고유 해시 ID** 할당
2. 클라이언트 번들에 해시 ID 포함
3. 런타임에 클라이언트가 해시 ID로 서버 액션 호출
4. 서버가 해시 ID로 해당 액션 실행

**문제 발생 시나리오:**

```
[빌드 시점]
1. Server Action 생성 → 해시 "ABC123" 할당
2. 클라이언트 번들에 "ABC123" 포함
3. .next/server에 "ABC123" → 액션 매핑 저장

[코드 수정 후]
4. Server Action 수정됨 → 새 해시 "XYZ789" 할당
5. 하지만 .next 캐시 남아있음 (HMR만 동작)

[런타임]
6. 클라이언트: "ABC123" 액션 호출 (옛날 번들)
7. 서버: "ABC123" 찾을 수 없음 ❌ (새 빌드는 "XYZ789"만 인식)
8. UnrecognizedActionError 발생!
```

### 발생 원인

1. **불완전한 HMR**: Hot Module Replacement가 서버 액션 해시를 업데이트하지 못함
2. **캐시 불일치**: `.next` 빌드 캐시와 실제 코드가 동기화되지 않음
3. **다중 프로세스**: 여러 개의 `npm run dev`가 동시 실행되어 빌드 충돌
4. **Node 모듈 캐시**: `node_modules/.cache`에 오래된 빌드 정보 남아있음

---

## ✅ 해결 방법

### 방법 1: 완전한 캐시 클리어 + 재시작 (권장)

```bash
# 1. 모든 Next.js 프로세스 종료
pkill -9 -f "node.*next"
pkill -9 -f "npm run dev"
lsof -ti:3000 | xargs kill -9

# 2. 빌드 캐시 삭제
rm -rf .next
rm -rf node_modules/.cache

# 3. 클린 서버 시작
npm run dev
```

**효과:**
- ✅ 모든 서버 액션이 새로운 해시로 재생성
- ✅ 클라이언트-서버 빌드 완전히 동기화
- ✅ UnrecognizedActionError 해결

---

### 방법 2: 브라우저 하드 리프레시

서버를 재시작한 후:

```bash
# Chrome/Edge/Brave
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)

# Firefox
Cmd+Shift+R (Mac) or Ctrl+F5 (Windows/Linux)

# Safari
Cmd+Option+R
```

**이유:**
- 브라우저 캐시에 오래된 클라이언트 번들 남아있음
- 하드 리프레시로 최신 번들 다시 다운로드

---

### 방법 3: 개발 환경 초기화 (심각한 경우)

```bash
# 1. 모든 프로세스 종료
pkill -9 -f node

# 2. 모든 캐시 삭제
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

# 3. (선택) node_modules 재설치
rm -rf node_modules
npm install

# 4. 클린 시작
npm run dev
```

---

## 🚨 문제 방지 방법

### 1. 단일 프로세스 실행

**❌ BAD: 여러 개의 dev 서버 동시 실행**
```bash
# 터미널 1
npm run dev

# 터미널 2
npm run dev  # ← 중복! 빌드 충돌 발생

# 터미널 3
npm run dev  # ← 또 중복!
```

**✅ GOOD: 하나의 dev 서버만 실행**
```bash
# 기존 프로세스 확인
ps aux | grep "next dev"

# 있으면 종료
pkill -f "next dev"

# 새로 시작
npm run dev
```

---

### 2. 코드 수정 후 완전 재시작

**Server Actions 수정 시:**
```bash
# 1. 서버 중지 (Ctrl+C)

# 2. 캐시 삭제
rm -rf .next

# 3. 재시작
npm run dev
```

**이유:**
- Server Actions는 HMR로 완전히 업데이트되지 않음
- 해시 재생성을 위해 전체 재빌드 필요

---

### 3. 정기적인 캐시 정리

**개발 중 주기적으로:**
```bash
# package.json scripts 추가
{
  "scripts": {
    "dev": "next dev",
    "dev:clean": "rm -rf .next && next dev",
    "clean": "rm -rf .next node_modules/.cache .turbo"
  }
}

# 사용
npm run dev:clean  # 캐시 삭제 후 시작
npm run clean      # 모든 캐시 삭제
```

---

### 4. 브라우저 캐시 비활성화 (개발 시)

**Chrome DevTools:**
1. F12 → Network 탭
2. "Disable cache" 체크박스 활성화
3. DevTools 열어둔 상태로 개발

**효과:**
- 브라우저가 항상 최신 번들 로드
- 클라이언트-서버 불일치 방지

---

## 📊 이 오류가 발생하는 경우

### 1. Server Action 파일 수정 후
```tsx
// Before
'use server'
export async function createPost(data) {
  // ... 기존 코드
}

// After (수정됨)
'use server'
export async function createPost(data) {
  // ... 수정된 코드
  console.log('New code')  // ← 수정
}
```
→ 해시가 변경되지만 .next 캐시는 옛날 해시 유지

---

### 2. 다중 프로세스 실행 중
```bash
Terminal 1: npm run dev (port 3000)
Terminal 2: npm run dev (port 3001)  # ← 빌드 충돌!
Terminal 3: npm run dev (port 3002)  # ← 더 많은 충돌!
```
→ 여러 빌드가 .next를 동시 수정해서 불일치 발생

---

### 3. Git 브랜치 변경 후
```bash
git checkout feature-branch
npm run dev  # ← .next는 main 브랜치 빌드 캐시
```
→ 브랜치마다 다른 코드인데 캐시는 공유됨

---

### 4. 의존성 업데이트 후
```bash
npm update next
npm run dev  # ← .next 캐시는 옛날 Next.js 버전
```
→ Next.js 버전 변경 시 빌드 형식 바뀔 수 있음

---

## 🔧 디버깅 방법

### 1. 현재 실행 중인 프로세스 확인
```bash
ps aux | grep -E "(next|node)" | grep dev
```

**예상 출력 (정상):**
```
user    12345  0.5  1.2  next dev
```

**문제 출력:**
```
user    12345  0.5  1.2  next dev
user    12346  0.5  1.2  next dev  # ← 중복!
user    12347  0.5  1.2  next dev  # ← 중복!
```

---

### 2. 포트 사용 확인
```bash
lsof -i :3000
```

**예상 출력:**
```
node    12345  user  ... TCP *:3000 (LISTEN)
```

**문제 출력 (여러 프로세스):**
```
node    12345  user  ... TCP *:3000 (LISTEN)
node    12346  user  ... TCP *:3001 (LISTEN)  # ← 포트 충돌로 3001 사용
```

---

### 3. .next 캐시 상태 확인
```bash
ls -la .next/server
```

**정상:**
```
server-actions-manifest.js  # 최신 서버 액션 매핑
```

**문제 (오래된 캐시):**
```
server-actions-manifest.js  # 수정 시간이 옛날
```

**해결:**
```bash
rm -rf .next
npm run dev
```

---

## 📚 Next.js Server Actions 이해

### Server Actions 해시 생성 방식

**빌드 타임:**
```tsx
// app/actions.ts
'use server'

export async function createPost(data: FormData) {
  // ... 구현
}
```

**Next.js가 생성:**
```javascript
// .next/server/server-actions-manifest.js
{
  "40ba251d9667a9f937333020a2c49e0f5a5023a4fc": {
    "workers": {},
    "layer": {},
    "id": "40ba251d9667...",
    "name": "createPost",
    "filepath": "app/actions.ts"
  }
}
```

**클라이언트 번들:**
```javascript
// .next/static/chunks/app/page.js
const actionId = "40ba251d9667a9f937333020a2c49e0f5a5023a4fc"
fetch('/__next/server-actions', { body: { actionId, args } })
```

---

### 해시 변경 조건

**해시가 변경되는 경우:**
1. ✅ 함수 내용 수정
2. ✅ 함수 이름 변경
3. ✅ 'use server' 위치 변경
4. ✅ 파일 경로 변경

**해시가 유지되는 경우:**
1. ❌ 주석 추가
2. ❌ 공백 변경
3. ❌ 타입 정의 수정 (런타임 영향 없음)

---

## 🎯 적용 결과

### 문제 해결 과정

**Issue #85 세션에서:**
1. ✅ 8개의 백그라운드 프로세스 발견 및 종료
2. ✅ `.next` 캐시 삭제
3. ✅ `node_modules/.cache` 정리
4. ✅ 클린 서버 재시작
5. ✅ Server Action 정상 작동 확인

**명령어:**
```bash
# 1. 모든 프로세스 종료
ps aux | grep -E "(node|next|npm)" | grep -v grep | awk '{print $2}' | xargs kill -9
lsof -ti:3000,3001 | xargs kill -9

# 2. 캐시 삭제
rm -rf .next
rm -rf node_modules/.cache

# 3. 재시작
npm run dev
```

**결과:**
- ✅ Server Action 오류 해결
- ✅ 단일 프로세스로 정상 실행 (port 3000)
- ✅ 클라이언트-서버 빌드 동기화

---

## 📝 Best Practices

### 1. 개발 시작 전 체크리스트

```bash
# ✅ 기존 프로세스 확인
ps aux | grep "next dev"

# ✅ 포트 확인
lsof -i :3000

# ✅ 있으면 종료
pkill -f "next dev"

# ✅ 클린 시작
npm run dev
```

---

### 2. 코드 수정 시 가이드라인

**일반 컴포넌트 수정:**
- HMR 동작 → 재시작 불필요

**Server Actions 수정:**
- 재시작 권장:
  ```bash
  Ctrl+C  # 서버 중지
  rm -rf .next
  npm run dev
  ```

**의존성 변경:**
- 완전 재시작 필수:
  ```bash
  pkill -f node
  rm -rf .next node_modules/.cache
  npm install
  npm run dev
  ```

---

### 3. 오류 발생 시 대응

**Step 1: 빠른 해결 (30초)**
```bash
Ctrl+C
rm -rf .next
npm run dev
```

**Step 2: 브라우저 새로고침**
```
Cmd+Shift+R (하드 리프레시)
```

**Step 3: 완전 초기화 (2분)**
```bash
pkill -9 -f node
rm -rf .next node_modules/.cache
npm run dev
```

---

## 🔗 관련 문서

- [Next.js Server Actions Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js Caching Guide](https://nextjs.org/docs/app/building-your-application/caching)
- [Failed to Find Server Action Error](https://nextjs.org/docs/messages/failed-to-find-server-action)

---

**해결 완료**: 2025-10-17
**Status**: ✅ RESOLVED
**Solution**: 다중 프로세스 종료 + 캐시 삭제 + 클린 재시작
