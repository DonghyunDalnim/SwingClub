# Firebase Auth 설정 체크리스트

## ✅ 완료된 항목

### 1. Firebase 프로젝트 연결
- **프로젝트 ID**: swingclub-9f333
- **연결 상태**: 성공 ✅
- **환경변수**: 모두 올바르게 설정됨 ✅

### 2. 코드 레벨 개선
- **에러 핸들링**: 포괄적인 try-catch 블록 추가 ✅
- **토큰 재시도 로직**: 3회 재시도 메커니즘 구현 ✅
- **클라이언트 사이드 가드**: `typeof window !== 'undefined'` 체크 추가 ✅
- **진단 도구**: Firebase 연결 테스트 API 생성 ✅

## 🔍 확인 필요 항목

### Firebase Console 설정 확인

1. **Authentication 활성화**
   - Firebase Console → Authentication → 시작하기
   - "인증" 탭이 활성화되어 있는지 확인

2. **Google 로그인 설정**
   - Authentication → Sign-in method → Google
   - "사용 설정됨" 상태인지 확인
   - 프로젝트 지원 이메일 설정 확인

3. **승인된 도메인**
   - Authentication → Settings → Authorized domains
   - localhost 및 배포 도메인이 추가되어 있는지 확인
   - 기본값: localhost, *.firebaseapp.com

4. **API 키 권한**
   - Google Cloud Console → API 및 서비스 → 사용자 인증 정보
   - 웹 API 키의 애플리케이션 제한사항 확인

## 🚨 일반적인 "auth/internal-error" 원인

### 1. Firebase Console 미설정
- Authentication 서비스가 비활성화됨
- Google 로그인 제공업체 미설정
- 프로젝트 지원 이메일 누락

### 2. 도메인/CORS 문제
- localhost가 승인된 도메인에 없음
- CORS 정책으로 인한 요청 차단

### 3. API 키 문제
- API 키가 만료되거나 잘못됨
- API 키 권한 설정 문제

### 4. 네트워크/방화벽
- Firebase 서비스 접근 차단
- 회사 방화벽 정책

## 🔧 다음 단계

1. **Firebase Console 직접 확인**
   - https://console.firebase.google.com/project/swingclub-9f333
   - Authentication 섹션 설정 상태 점검

2. **로컬 테스트**
   - 브라우저에서 http://localhost:3001/login 접속
   - 개발자 도구 Console에서 에러 메시지 확인

3. **네트워크 진단**
   - Firebase API 엔드포인트 연결 테스트
   - CORS 설정 확인

## 📊 현재 상태 요약

- **연결**: Firebase 프로젝트 연결 성공 ✅
- **환경변수**: 모든 필수 환경변수 설정 완료 ✅
- **코드**: 에러 핸들링 및 재시도 로직 구현 ✅
- **API**: 진단 엔드포인트 정상 동작 ✅
- **남은 작업**: Firebase Console 설정 확인 및 실제 로그인 테스트