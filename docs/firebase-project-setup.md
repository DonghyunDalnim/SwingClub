# Firebase 프로젝트 생성 가이드

이 문서는 Swing Connect 프로젝트를 위한 Firebase 프로젝트 생성 과정을 단계별로 안내합니다.

## 📋 사전 준비사항

- Google 계정 (Firebase 콘솔 접근용)
- 관리자 권한 (프로젝트 생성 권한)

## 🚀 단계별 설정 가이드

### 1단계: Firebase 콘솔 접속

1. [Firebase 콘솔](https://console.firebase.google.com/) 접속
2. Google 계정으로 로그인

### 2단계: 프로젝트 생성

1. **"프로젝트 추가"** 버튼 클릭
2. **프로젝트 이름 설정**:
   ```
   프로젝트 이름: Swing Connect
   ```

3. **프로젝트 ID 설정**:
   ```
   프로젝트 ID: swing-connect-[고유번호]
   ```
   - 프로젝트 ID는 전 세계적으로 고유해야 함
   - 한번 생성하면 변경 불가능
   - 제안된 ID를 사용하거나 원하는 형태로 수정

4. **계속** 버튼 클릭

### 3단계: Google Analytics 설정

1. **"이 프로젝트에서 Google Analytics 사용 설정"** 체크
   - 사용자 행동 분석을 위해 권장

2. **Google Analytics 계정 선택**:
   - 기존 계정이 있다면 선택
   - 없다면 **"새 계정 만들기"** 선택

3. **Analytics 위치 설정**:
   ```
   국가/지역: 대한민국
   ```

4. **계속** 버튼 클릭

### 4단계: 지역 및 위치 설정

1. 프로젝트 생성 완료 후 **"프로젝트 설정"** 으로 이동
2. **"일반"** 탭에서 **"기본 GCP 리소스 위치"** 설정:
   ```
   지역: asia-northeast3 (Seoul)
   ```
   - 한국 사용자를 위한 최적화된 지역
   - 지연시간 최소화
   - 한번 설정하면 변경 불가능

### 5단계: 프로젝트 멤버 권한 설정

1. **"사용자 및 권한"** 탭 이동
2. 필요한 팀 멤버 추가:
   - **Editor**: 개발자 (모든 Firebase 서비스 관리 가능)
   - **Viewer**: 조회만 필요한 멤버

## ✅ 설정 완료 확인사항

다음 정보들을 안전한 곳에 기록해두세요:

### 프로젝트 기본 정보
```
프로젝트 이름: Swing Connect
프로젝트 ID: [생성된 고유 ID]
지역: asia-northeast3 (Seoul)
Google Analytics: 활성화됨
```

### Firebase 콘솔에서 확인 가능한 정보
1. **프로젝트 설정** → **일반** 탭에서:
   - 프로젝트 ID
   - 웹 API 키
   - 프로젝트 번호

2. **프로젝트 설정** → **서비스 계정** 탭에서:
   - 서비스 계정 키 (Admin SDK용)

## 🔄 다음 단계

이제 다음 이슈들을 순서대로 진행할 수 있습니다:

1. **Issue #2**: 환경변수 설정 - Firebase 설정 정보를 프로젝트에 연결
2. **Issue #3**: Firestore Database 설정
3. **Issue #4**: Firebase Authentication 설정
4. **Issue #5**: Firebase Storage 설정
5. **Issue #6**: Firebase Cloud Messaging 설정
6. **Issue #7**: Firebase SDK 초기화 및 통합

## ⚠️ 주의사항

1. **프로젝트 ID는 변경 불가능**하므로 신중하게 선택
2. **지역 설정도 변경 불가능**하므로 `asia-northeast3` 선택 필수
3. **API 키와 설정 정보는 보안 주의** - .env 파일로만 관리
4. **Google Analytics는 나중에 비활성화 가능**하지만 처음에 설정하는 것을 권장

## 🔗 관련 문서

- [Firebase 프로젝트 이해하기](https://firebase.google.com/docs/projects/learn-more)
- [Firebase 콘솔 사용법](https://firebase.google.com/docs/console)
- [Google Analytics 연동](https://firebase.google.com/docs/analytics)