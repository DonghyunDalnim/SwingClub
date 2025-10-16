# 누락된 Firestore 인덱스 수정

## 🚨 발견된 문제

Comments 컬렉션 쿼리에서 인덱스 오류 발생:

```
The query requires an index for:
- Collection: comments
- Fields: postId (ASCENDING), status (ASCENDING), createdAt (ASCENDING)
```

## ✅ 해결 방법 (2가지 선택)

---

### 방법 1: Firebase Console에서 즉시 생성 (추천! - 30초)

**이 링크를 클릭하면 인덱스가 자동으로 설정됩니다:**

https://console.firebase.google.com/v1/r/project/swingclub-9f333/firestore/indexes?create_composite=ClBwcm9qZWN0cy9zd2luZ2NsdWItOWYzMzMvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2NvbW1lbnRzL2luZGV4ZXMvXxABGgoKBnBvc3RJZBABGgoKBnN0YXR1cxABGg0KCWNyZWF0ZWRBdBABGgwKCF9fbmFtZV9fEAE

**단계:**
1. 위 링크 클릭
2. Google 계정 로그인 (`shindonghyun0516@gmail.com`)
3. **"인덱스 만들기"** 또는 **"Create Index"** 버튼 클릭
4. 완료! (빌드 시간: 1-5분)

---

### 방법 2: Firebase CLI로 전체 배포 (권장 - 2분)

**이미 firestore.indexes.json 파일이 업데이트되었습니다!**

터미널에서 실행:

```bash
# 1. 프로젝트 폴더로 이동
cd /Users/shindonghyun/Desktop/SwingClub

# 2. Firebase 로그인 (처음만)
firebase login

# 3. 모든 인덱스 배포 (14개)
firebase deploy --only firestore:indexes
```

**장점:**
- ✅ 총 14개 인덱스 모두 배포
- ✅ 향후 인덱스 추가 시 간편
- ✅ 버전 관리 가능

---

## 📋 업데이트된 인덱스 목록

### 추가된 인덱스:
```json
{
  "collectionGroup": "comments",
  "fields": [
    { "fieldPath": "postId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "ASCENDING" }
  ]
}
```

### 총 인덱스 개수:
- **이전:** 12개
- **현재:** 14개 (comments 인덱스 2개 추가)

---

## 🧪 인덱스 생성 확인

### Firebase Console에서 확인:
https://console.firebase.google.com/project/swingclub-9f333/firestore/indexes

**확인 사항:**
- ✅ Comments 컬렉션에 `postId + status + createdAt` 인덱스 존재
- ✅ 상태: **Enabled** (초록색)

### 터미널에서 확인:
```bash
firebase firestore:indexes
```

**예상 출력에서 확인:**
```
comments: postId ASC, status ASC, createdAt ASC [ENABLED]
```

---

## 🔍 인덱스가 필요한 이유

### 실제 쿼리 코드:
[lib/firebase/collections.ts](lib/firebase/collections.ts:417-421)
```typescript
const constraints: QueryConstraint[] = [
  where('postId', '==', postId),       // ① postId 필터
  where('status', '==', 'active'),     // ② status 필터
  orderBy('createdAt', 'asc')          // ③ createdAt 정렬
]
```

### Firestore 인덱스 규칙:
- 단일 필터: 자동 인덱스 ✅
- **복합 필터 + 정렬: 수동 인덱스 필요** ⚠️

위 쿼리는 **2개 필터 + 1개 정렬** = 복합 쿼리이므로 인덱스 필요!

---

## ⏱️ 인덱스 빌드 시간

- **소규모 데이터** (<100 comments): ~1분
- **중규모 데이터** (100-1000 comments): ~2-5분
- **대규모 데이터** (>1000 comments): ~5-15분

**빌드 중에도 애플리케이션 사용 가능합니다!**

---

## 🎯 완료 후 테스트

### 1. 브라우저에서 테스트:
1. http://localhost:3000/community 방문
2. 아무 게시글 클릭
3. 댓글이 정상적으로 로드되는지 확인
4. `F12` → Console 탭에서 오류 없는지 확인

### 2. 예상 결과:
- ✅ 댓글 목록 정상 로드
- ✅ 댓글 작성 가능
- ❌ "The query requires an index" 오류 없음

---

## 📝 변경 사항 요약

### 수정된 파일:
- `firestore.indexes.json`: Comments 인덱스 1개 추가

### 커밋 정보:
```bash
git log --oneline -1
# fix: Add missing comments composite index (postId + status + createdAt)
```

### 다음 단계:
1. **방법 1 선택:** 위의 Firebase Console 링크 클릭
   - 또는
2. **방법 2 선택:** `firebase deploy --only firestore:indexes` 실행

---

## 🆘 문제 해결

### "Authentication required" 오류:
```bash
firebase logout
firebase login
firebase deploy --only firestore:indexes
```

### 인덱스 빌드가 실패할 경우:
1. Firebase Console에서 오류 메시지 확인
2. 실패한 인덱스 삭제
3. 위의 직접 링크로 다시 생성

### 여전히 오류가 발생할 경우:
1. 브라우저 콘솔에서 정확한 오류 메시지 복사
2. Firebase Console → Firestore → Indexes에서 인덱스 상태 확인
3. 필요시 `FIREBASE_INDEX_DEPLOY_GUIDE.md` 참고

---

**작성일:** 2025-10-16
**이슈:** Comments 쿼리 인덱스 누락
**우선순위:** 🔴 HIGH (댓글 기능 동작하지 않음)
