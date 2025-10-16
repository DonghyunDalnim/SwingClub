# 🚀 빠른 시작 가이드

## 지금 바로 해야 할 일

Firebase 인덱스를 배포해야 애플리케이션이 정상 작동합니다!

---

## ⚡ 3분 안에 끝내기

### 1단계: 터미널 열기
```bash
cd /Users/shindonghyun/Desktop/SwingClub
```

### 2단계: Firebase 로그인
```bash
firebase login
```
브라우저에서 Google 계정(`shindonghyun0516@gmail.com`)으로 로그인하고 **허용** 클릭

### 3단계: 인덱스 배포
```bash
firebase deploy --only firestore:indexes
```
완료될 때까지 대기 (약 1-2분)

### 4단계: 확인
```bash
firebase firestore:indexes
```
모든 인덱스가 **ENABLED** 상태인지 확인

---

## ✅ 성공 확인

브라우저에서 http://localhost:3000/community 방문
- 게시글 목록이 보이면 ✅ 성공!
- 오류가 나면 ❌ `FIREBASE_INDEX_DEPLOY_GUIDE.md` 참고

---

## 📚 자세한 가이드

단계별 상세 설명이 필요하면:
**`FIREBASE_INDEX_DEPLOY_GUIDE.md`** 파일을 참고하세요!

---

**개발 서버:** http://localhost:3000 (이미 실행 중)
**Firebase Console:** https://console.firebase.google.com/project/swingclub-9f333/firestore/indexes
