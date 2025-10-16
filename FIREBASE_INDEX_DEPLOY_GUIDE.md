# Firebase 인덱스 배포 가이드

## 📋 개요

Firestore 복합 쿼리를 위한 인덱스 12개를 Firebase에 배포하는 단계별 가이드입니다.

---

## ✅ 사전 준비 확인

다음 항목들이 이미 준비되어 있습니다:

- ✅ `firestore.indexes.json` 파일 생성 완료 (12개 인덱스 설정)
- ✅ `firebase.json` 설정 완료
- ✅ Firebase CLI 설치 완료 (버전 14.15.2)
- ✅ Firebase 프로젝트: `swingclub-9f333`
- ✅ 개발 서버 실행 중: http://localhost:3000

---

## 📍 Step 1: 터미널 열기

**Mac 사용자:**
1. `command(⌘) + 스페이스` 눌러서 Spotlight 열기
2. "터미널" 입력 후 Enter
3. 또는 `Applications` → `유틸리티` → `터미널` 실행

**프로젝트 디렉토리로 이동:**
```bash
cd /Users/shindonghyun/Desktop/SwingClub
```

**현재 위치 확인:**
```bash
pwd
```
출력: `/Users/shindonghyun/Desktop/SwingClub` 확인

---

## 📍 Step 2: Firebase 로그인

**명령어 입력:**
```bash
firebase login
```

### 예상되는 화면 흐름:

#### 1) 이미 로그인된 경우:
```
Already logged in as shindonghyun0516@gmail.com
```
→ **Step 3으로 바로 이동** ✅

#### 2) 로그인이 필요한 경우:
```
? Allow Firebase to collect CLI and Emulator Suite usage and error reporting information? (Y/n)
```
**입력:** `Y` (또는 그냥 Enter)

```
Visit this URL on this device to log in:
https://accounts.google.com/o/oauth2/auth?...

Waiting for authentication...
```

**브라우저가 자동으로 열림:**
1. Google 계정 선택: `shindonghyun0516@gmail.com`
2. "Firebase CLI가 Google 계정에 액세스하려고 합니다" 화면
3. **"허용" 버튼 클릭**

**터미널로 돌아오면:**
```
✔  Success! Logged in as shindonghyun0516@gmail.com
```

---

## 📍 Step 3: Firebase 프로젝트 확인

**명령어 입력:**
```bash
firebase projects:list
```

**예상 출력:**
```
┌──────────────────────┬────────────────┬────────────────┬──────────────────────┐
│ Project Display Name │ Project ID     │ Project Number │ Resource Location ID │
├──────────────────────┼────────────────┼────────────────┼──────────────────────┤
│ SwingClub            │ swingclub-9f333│ 455481511614   │ asia-northeast3      │
└──────────────────────┴────────────────┴────────────────┴──────────────────────┘
```

**확인사항:**
- ✅ `swingclub-9f333` 프로젝트가 목록에 있는지 확인

**만약 프로젝트가 안 보인다면:**
```bash
firebase use swingclub-9f333
```

---

## 📍 Step 4: 인덱스 파일 확인

**명령어 입력:**
```bash
cat firestore.indexes.json | head -20
```

**예상 출력 (처음 20줄):**
```json
{
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "metadata.createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "posts",
```

**확인사항:**
- ✅ JSON 형식이 올바른지 확인
- ✅ `"indexes": [` 로 시작하는지 확인

---

## 📍 Step 5: 인덱스 배포 (가장 중요!)

**명령어 입력:**
```bash
firebase deploy --only firestore:indexes
```

### 예상되는 화면 흐름:

#### 배포 시작:
```
=== Deploying to 'swingclub-9f333'...

i  deploying firestore
i  firestore: reading indexes from firestore.indexes.json...
i  cloud.firestore: checking firestore.rules for compilation errors...
✔  cloud.firestore: rules file firestore.rules compiled successfully
i  firestore: uploading rules firestore.rules...
```

#### 인덱스 생성 중:
```
i  firestore: creating indexes...
✔  firestore: created indexes:
    (posts) status ASC metadata.createdAt DESC
    (posts) category ASC status ASC metadata.createdAt DESC
    (posts) status ASC stats.likes DESC
    (posts) category ASC status ASC stats.likes DESC
    (posts) status ASC stats.views DESC
    (posts) category ASC status ASC stats.views DESC
    (posts) metadata.authorId ASC status ASC metadata.createdAt DESC
    (posts) region ASC status ASC metadata.createdAt DESC
    (comments) postId ASC metadata.createdAt ASC
    (comments) postId ASC parentId ASC metadata.createdAt ASC
    (notifications) recipientId ASC createdAt DESC
    (notifications) recipientId ASC isRead ASC createdAt DESC

✔  Deploy complete!
```

**소요 시간:** 30초 ~ 2분 정도

---

## ⚠️ 문제 해결

### 문제 1: 인증 오류
```
Error: Authentication failed
```

**해결 방법:**
```bash
firebase logout
firebase login
firebase deploy --only firestore:indexes
```

### 문제 2: 프로젝트 선택 오류
```
Error: No project active
```

**해결 방법:**
```bash
firebase use swingclub-9f333
firebase deploy --only firestore:indexes
```

### 문제 3: 권한 오류
```
Error: Permission denied
```

**해결 방법:**
1. Firebase Console 확인: https://console.firebase.google.com/project/swingclub-9f333
2. `shindonghyun0516@gmail.com` 계정이 **소유자** 또는 **편집자** 권한이 있는지 확인
3. 권한이 있으면 다시 시도:
   ```bash
   firebase deploy --only firestore:indexes
   ```

### 문제 4: 인덱스 빌드 시간이 너무 길 때
```
Index build is taking longer than expected...
```

**이것은 정상입니다!**
- 소규모 데이터: 1-5분
- 중규모 데이터: 5-15분
- 대규모 데이터: 15-60분

**진행 상황 확인:**
1. Firebase Console 열기: https://console.firebase.google.com/project/swingclub-9f333/firestore/indexes
2. 각 인덱스 상태 확인:
   - 🟡 **Building**: 빌드 중 (기다려야 함)
   - 🟢 **Enabled**: 완료 (사용 가능)
   - 🔴 **Error**: 오류 (재시도 필요)

---

## 📍 Step 6: 인덱스 배포 확인

### 6-1. Firebase Console에서 확인

1. **브라우저에서 Firebase Console 열기:**
   https://console.firebase.google.com/project/swingclub-9f333/firestore/indexes

2. **인덱스 목록 확인:**
   - 총 **12개 인덱스**가 있어야 함
   - 각 인덱스 상태 확인:
     - ✅ **Enabled** (초록색): 사용 가능
     - ⏳ **Building** (노란색): 빌드 중 (기다리기)
     - ❌ **Error** (빨간색): 오류 발생

### 6-2. 터미널에서 확인

**명령어 입력:**
```bash
firebase firestore:indexes
```

**예상 출력:**
```
Compound Indexes for swingclub-9f333:

┌────────┬───────────┬────────────────────────────────────────┬────────┐
│ ID     │ State     │ Fields                                 │ Query  │
│        │           │                                        │ Scope  │
├────────┼───────────┼────────────────────────────────────────┼────────┤
│ abc123 │ ENABLED   │ status (ASCENDING),                    │ posts  │
│        │           │ metadata.createdAt (DESCENDING)        │        │
├────────┼───────────┼────────────────────────────────────────┼────────┤
│ def456 │ ENABLED   │ category (ASCENDING),                  │ posts  │
│        │           │ status (ASCENDING),                    │        │
│        │           │ metadata.createdAt (DESCENDING)        │        │
├────────┼───────────┼────────────────────────────────────────┼────────┤
... (10 more indexes)
```

**확인사항:**
- ✅ State가 모두 **ENABLED**인지 확인
- ⏳ **CREATING**이면 기다리기 (1-60분)

---

## 📍 Step 7: 애플리케이션에서 테스트

### 7-1. 브라우저에서 테스트

**개발 서버가 실행 중인지 확인:**
```bash
# 이미 실행 중입니다!
# http://localhost:3000
```

**테스트 순서:**

1. **브라우저 열기:**
   http://localhost:3000

2. **로그인 확인:**
   - 이미 로그인되어 있어야 함 (`shindonghyun0516@gmail.com`)

3. **커뮤니티 페이지 테스트:**
   - http://localhost:3000/community 방문
   - 게시글 목록이 정상적으로 로드되는지 확인
   - 카테고리 필터 사용해보기
   - 정렬 옵션 변경해보기 (최신순/인기순/조회순)

4. **브라우저 콘솔 확인 (중요!):**
   - `F12` 또는 `Option + Command + I` (Mac)
   - **Console** 탭 열기
   - 다음과 같은 오류가 **없어야** 합니다:
     ```
     ❌ The query requires an index
     ❌ Firestore: Missing or insufficient permissions
     ```

5. **정상 동작 확인:**
   - ✅ 게시글 목록 로드 성공
   - ✅ 카테고리 필터 작동
   - ✅ 정렬 기능 작동
   - ✅ 콘솔에 인덱스 오류 없음

### 7-2. 터미널에서 서버 로그 확인

**현재 터미널 창에서 서버 로그 확인:**
- 다음과 같은 오류가 **없어야** 합니다:
  ```
  ❌ FirebaseError: The query requires an index
  ```

- 정상 로그 예시:
  ```
  ✅ GET /community 200 in 156ms
  ✅ [Server] getCurrentUser - User data parsed successfully
  ```

---

## 📍 Step 8: 최종 검증 체크리스트

배포가 완료되면 다음 항목들을 확인하세요:

### Firebase Console 검증
- [ ] Firebase Console에 12개 인덱스가 모두 있음
- [ ] 모든 인덱스 상태가 **Enabled** (초록색)
- [ ] 빌드 중인 인덱스 없음 (노란색 없음)
- [ ] 오류 상태 인덱스 없음 (빨간색 없음)

### 애플리케이션 검증
- [ ] http://localhost:3000/community 정상 로드
- [ ] 게시글 목록이 보임
- [ ] 카테고리 필터 작동
- [ ] 정렬 옵션 작동 (최신순/인기순/조회순)
- [ ] 브라우저 콘솔에 인덱스 오류 없음
- [ ] 서버 로그에 Firestore 오류 없음

### 기능 테스트
- [ ] 새 게시글 작성 가능
- [ ] 게시글 상세 페이지 로드
- [ ] 댓글 작성 가능
- [ ] 좋아요 기능 작동
- [ ] 알림 기능 작동

---

## 🎉 배포 완료!

모든 단계를 완료하면 Firestore 인덱스 배포가 완료됩니다!

### 추가 정보

**인덱스 목록 확인:**
- Firebase Console: https://console.firebase.google.com/project/swingclub-9f333/firestore/indexes
- 터미널: `firebase firestore:indexes`

**문제 발생 시:**
1. 이 가이드의 **문제 해결** 섹션 참고
2. Firebase Console에서 오류 메시지 확인
3. 터미널 오류 로그 확인
4. 필요시 재배포: `firebase deploy --only firestore:indexes`

**참고 문서:**
- 상세 기술 문서: `claudedocs/firestore-composite-index-setup.md`
- Firestore 공식 문서: https://firebase.google.com/docs/firestore/query-data/indexing
- Firebase CLI 문서: https://firebase.google.com/docs/cli

---

## 📞 도움말

**명령어 치트시트:**
```bash
# Firebase 로그인
firebase login

# 프로젝트 목록 확인
firebase projects:list

# 프로젝트 선택
firebase use swingclub-9f333

# 인덱스 배포
firebase deploy --only firestore:indexes

# 인덱스 목록 확인
firebase firestore:indexes

# 로그아웃 (문제 발생 시)
firebase logout
```

**중요한 URL들:**
- Firebase Console: https://console.firebase.google.com/project/swingclub-9f333
- Firestore Indexes: https://console.firebase.google.com/project/swingclub-9f333/firestore/indexes
- 개발 서버: http://localhost:3000

---

**작성일:** 2025-10-16
**작성자:** Claude Code
**프로젝트:** SwingClub (swingclub-9f333)
