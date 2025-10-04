# 회원가입 시스템 설계 문서 (Signup System Design)

## 📋 목표 (Objectives)

미구현된 회원가입 UI/UX를 완성하여 사용자가 Swing Connect에 가입할 수 있도록 3단계 마법사(wizard) 형태의 회원가입 플로우를 구현합니다.

**현재 상태**: 백엔드 로직(signUpWithEmail) 구현 완료, UI 0%
**목표 상태**: 완전한 회원가입 플로우 100% 구현

---

## 🏗️ 아키텍처 개요 (Architecture Overview)

### 컴포넌트 계층 구조

```
app/signup/
├── page.tsx                      # 메인 페이지 (Suspense wrapper)
└── components/
    ├── SignupWizard.tsx         # 마법사 컨테이너 (상태 관리 + 단계 전환)
    ├── Step1AccountInfo.tsx     # 1단계: 계정 정보
    ├── Step2ProfileInfo.tsx     # 2단계: 프로필 정보
    ├── Step3Terms.tsx           # 3단계: 약관 동의
    ├── StepIndicator.tsx        # 진행 상태 표시기
    └── SignupButton.tsx         # 재사용 버튼 컴포넌트
```

### 데이터 흐름

```
사용자 입력 → SignupWizard 상태 → 유효성 검증 → 다음 단계
                    ↓
              최종 제출 (Step 3)
                    ↓
         signUp() from useSignIn hook
                    ↓
         Firebase Auth + Firestore
                    ↓
           AuthContext 자동 업데이트
                    ↓
            /home으로 리디렉션
```

---

## 📊 상태 관리 (State Management)

### SignupWizard 상태 구조

```typescript
interface SignupState {
  // 현재 단계
  currentStep: 1 | 2 | 3

  // 1단계: 계정 정보
  accountData: {
    provider: 'email' | 'google' | 'kakao' | 'naver'
    email: string
    password?: string              // 이메일 가입 시에만
    displayName?: string           // 소셜 로그인 시 자동 입력
    photoURL?: string              // 소셜 로그인 시 자동 입력
  }

  // 2단계: 프로필 정보
  profileData: {
    nickname: string               // 필수: 2-20자
    danceLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional'  // 필수
    location: string               // 필수: 주요 도시 선택
    bio?: string                   // 선택: 최대 200자
    interests: string[]            // 선택: 댄스 스타일 (린디합, 찰스턴 등)
  }

  // 3단계: 약관 동의
  termsData: {
    serviceTerms: boolean          // 필수
    privacyPolicy: boolean         // 필수
    marketingConsent: boolean      // 선택
  }

  // UI 상태
  errors: Record<string, string>
  loading: boolean
}
```

### 로컬스토리지 활용

```typescript
// 단계별 진행 상황을 localStorage에 저장하여 새로고침 시 복구
const STORAGE_KEY = 'swing-connect-signup-progress'

// 저장
localStorage.setItem(STORAGE_KEY, JSON.stringify(signupState))

// 복구
const savedState = localStorage.getItem(STORAGE_KEY)
if (savedState) {
  setSignupState(JSON.parse(savedState))
}

// 완료 시 삭제
localStorage.removeItem(STORAGE_KEY)
```

---

## 🎨 디자인 시스템 (Design System)

### Glassmorphism 스타일 (login 페이지와 동일)

**핵심 CSS 속성:**
```css
.signup-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(30px) saturate(180%);
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  box-shadow:
    0 10px 40px rgba(31, 38, 135, 0.12),
    inset 0 2px 4px rgba(255, 255, 255, 0.9);
}
```

**색상 테마:**
- Primary Gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Background: `var(--warm-gray)` with radial gradient glow
- Text: `var(--gray-900)` for headings, `var(--gray-600)` for body

**애니메이션:**
- fadeInUp: 페이지 진입 시
- bounce: 로고 아이콘 (🎺)
- shake: 에러 메시지 표시 시
- spin: 로딩 스피너

### 반응형 디자인

```css
/* 모바일 (기본) */
.signup-container {
  padding: var(--space-lg);
  max-width: 480px;
}

/* 데스크톱 */
@media (min-width: 768px) {
  .signup-container {
    padding: var(--space-xl);
    max-width: 600px;
  }
}
```

---

## 🔄 Step 1: 계정 정보 (Account Info)

### UI 구성

**제목 섹션:**
- 타이틀: "회원가입" (h1, gradient 텍스트)
- 서브타이틀: "소셜 로그인 또는 이메일로 가입하세요"
- 진행 표시: "1 / 3"

**Path A: 소셜 로그인** (우선 선택지)
```tsx
<div className="social-login-section">
  <button className="login-button google" onClick={handleGoogleSignup}>
    <span className="button-icon">��</span>
    <span>구글로 시작하기</span>
  </button>

  <button className="login-button kakao" onClick={handleKakaoSignup}>
    <span className="button-icon">🟡</span>
    <span>카카오로 시작하기</span>
  </button>

  <button className="login-button naver" onClick={handleNaverSignup}>
    <span className="button-icon">🟢</span>
    <span>네이버로 시작하기</span>
  </button>
</div>
```

**구분선:**
```tsx
<div className="divider">
  <span className="divider-line"></span>
  <span className="divider-text">OR</span>
  <span className="divider-line"></span>
</div>
```

**Path B: 이메일/비밀번호 가입**
```tsx
<div className="email-signup-section">
  <div className="input-group">
    <label htmlFor="email">이메일</label>
    <input
      type="email"
      id="email"
      value={email}
      onChange={handleEmailChange}
      onBlur={validateEmail}
      placeholder="example@swing.com"
    />
    {errors.email && <span className="error-text">{errors.email}</span>}
  </div>

  <div className="input-group">
    <label htmlFor="password">비밀번호</label>
    <input
      type="password"
      id="password"
      value={password}
      onChange={handlePasswordChange}
    />
    <div className="password-strength">
      <div className="strength-bar" data-strength={passwordStrength}></div>
    </div>
    {errors.password && <span className="error-text">{errors.password}</span>}
  </div>

  <div className="input-group">
    <label htmlFor="passwordConfirm">비밀번호 확인</label>
    <input
      type="password"
      id="passwordConfirm"
      value={passwordConfirm}
      onChange={handlePasswordConfirmChange}
    />
    {errors.passwordConfirm && <span className="error-text">{errors.passwordConfirm}</span>}
  </div>

  <button
    className="next-button"
    onClick={handleNextStep}
    disabled={!isStep1Valid}
  >
    다음
  </button>
</div>
```

### 유효성 검증 규칙

```typescript
// 이메일 검증 (lib/auth/utils.ts 재사용)
import { isValidEmail } from '@/lib/auth/utils'

const validateEmail = (email: string) => {
  if (!email) return '이메일을 입력해주세요'
  if (!isValidEmail(email)) return '올바른 이메일 형식이 아닙니다'
  return ''
}

// 비밀번호 검증 (lib/auth/utils.ts 재사용)
import { validatePassword } from '@/lib/auth/utils'

const validatePasswordInput = (password: string) => {
  const result = validatePassword(password)
  if (!result.isValid) {
    return result.errors.join(', ')
  }
  return ''
}

// 비밀번호 확인
const validatePasswordConfirm = (password: string, confirm: string) => {
  if (password !== confirm) return '비밀번호가 일치하지 않습니다'
  return ''
}
```

### 비밀번호 강도 표시

```typescript
const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  const { isValid, errors } = validatePassword(password)

  if (errors.length === 0) return 'strong'
  if (errors.length === 1) return 'medium'
  return 'weak'
}

// CSS
.strength-bar[data-strength="weak"] {
  width: 33%;
  background: #ef4444;
}
.strength-bar[data-strength="medium"] {
  width: 66%;
  background: #f59e0b;
}
.strength-bar[data-strength="strong"] {
  width: 100%;
  background: #10b981;
}
```

### 소셜 로그인 처리

```typescript
const handleGoogleSignup = async () => {
  try {
    setLoading(true)
    await signInWithGoogle()  // useSignIn hook에서 가져옴

    // 소셜 로그인 성공 시 accountData 자동 설정
    setSignupState(prev => ({
      ...prev,
      accountData: {
        provider: 'google',
        email: auth.currentUser?.email || '',
        displayName: auth.currentUser?.displayName || '',
        photoURL: auth.currentUser?.photoURL || ''
      },
      currentStep: 2  // Step 2로 자동 이동
    }))
  } catch (error) {
    setErrors({ general: '구글 로그인에 실패했습니다' })
  } finally {
    setLoading(false)
  }
}

// Kakao, Naver는 현재 placeholder
const handleKakaoSignup = () => {
  setErrors({ general: '카카오 로그인은 곧 지원 예정입니다' })
}

const handleNaverSignup = () => {
  setErrors({ general: '네이버 로그인은 곧 지원 예정입니다' })
}
```

---

## 🎯 Step 2: 프로필 정보 (Profile Info)

### UI 구성

**제목 섹션:**
- 타이틀: "프로필 설정"
- 서브타이틀: "스윙댄스 커뮤니티에서 사용할 프로필을 만들어주세요"
- 진행 표시: "2 / 3"

**필수 필드:**

```tsx
<div className="profile-form">
  {/* 닉네임 */}
  <div className="input-group required">
    <label htmlFor="nickname">
      닉네임 <span className="required-mark">*</span>
    </label>
    <input
      type="text"
      id="nickname"
      value={nickname}
      onChange={handleNicknameChange}
      placeholder="2-20자 이내로 입력해주세요"
      maxLength={20}
    />
    <span className="char-counter">{nickname.length}/20</span>
    {errors.nickname && <span className="error-text">{errors.nickname}</span>}
  </div>

  {/* 댄스 레벨 */}
  <div className="input-group required">
    <label htmlFor="danceLevel">
      댄스 레벨 <span className="required-mark">*</span>
    </label>
    <select
      id="danceLevel"
      value={danceLevel}
      onChange={(e) => setDanceLevel(e.target.value)}
    >
      <option value="">선택해주세요</option>
      <option value="beginner">초급 - 이제 막 시작했어요</option>
      <option value="intermediate">중급 - 기본 동작을 할 수 있어요</option>
      <option value="advanced">고급 - 다양한 패턴을 구사해요</option>
      <option value="professional">전문가 - 강사 수준이에요</option>
    </select>
  </div>

  {/* 활동 지역 */}
  <div className="input-group required">
    <label htmlFor="location">
      활동 지역 <span className="required-mark">*</span>
    </label>
    <select
      id="location"
      value={location}
      onChange={(e) => setLocation(e.target.value)}
    >
      <option value="">선택해주세요</option>
      <option value="서울 강남구">서울 강남구</option>
      <option value="서울 홍대">서울 홍대</option>
      <option value="서울 건대">서울 건대</option>
      <option value="부산">부산</option>
      <option value="대구">대구</option>
      <option value="인천">인천</option>
      <option value="기타">기타</option>
    </select>
  </div>
</div>
```

**선택 필드:**

```tsx
{/* 자기소개 */}
<div className="input-group optional">
  <label htmlFor="bio">
    자기소개 <span className="optional-mark">(선택)</span>
  </label>
  <textarea
    id="bio"
    value={bio}
    onChange={handleBioChange}
    placeholder="스윙댄스에 대한 당신의 이야기를 들려주세요"
    maxLength={200}
    rows={4}
  />
  <span className="char-counter">{bio.length}/200</span>
</div>

{/* 관심 댄스 스타일 */}
<div className="input-group optional">
  <label>
    관심있는 댄스 스타일 <span className="optional-mark">(선택)</span>
  </label>
  <div className="interest-chips">
    {['린디합', '찰스턴', '발보아', '블루스', '이스트코스트'].map(style => (
      <button
        key={style}
        type="button"
        className={`chip ${interests.includes(style) ? 'selected' : ''}`}
        onClick={() => toggleInterest(style)}
      >
        {style}
      </button>
    ))}
  </div>
</div>
```

**네비게이션 버튼:**

```tsx
<div className="button-group">
  <button
    className="back-button"
    onClick={() => setCurrentStep(1)}
  >
    이전
  </button>

  <button
    className="next-button"
    onClick={handleNextStep}
    disabled={!isStep2Valid}
  >
    다음
  </button>
</div>
```

### 유효성 검증 규칙

```typescript
// 닉네임 검증
const validateNickname = (nickname: string) => {
  if (!nickname) return '닉네임을 입력해주세요'
  if (nickname.length < 2) return '닉네임은 2자 이상이어야 합니다'
  if (nickname.length > 20) return '닉네임은 20자 이하여야 합니다'

  // 특수문자 제외 (한글, 영문, 숫자만 허용)
  const regex = /^[가-힣a-zA-Z0-9]+$/
  if (!regex.test(nickname)) return '한글, 영문, 숫자만 사용 가능합니다'

  return ''
}

// Step 2 유효성 검증
const isStep2Valid = () => {
  return (
    nickname.length >= 2 &&
    danceLevel !== '' &&
    location !== ''
  )
}

// 관심사 토글
const toggleInterest = (style: string) => {
  setInterests(prev =>
    prev.includes(style)
      ? prev.filter(s => s !== style)
      : [...prev, style]
  )
}
```

### 입력 필드 스타일

```css
.input-group {
  margin-bottom: var(--space-lg);
}

.input-group label {
  display: block;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--space-sm);
}

.required-mark {
  color: #ef4444;
  margin-left: 4px;
}

.optional-mark {
  color: var(--gray-500);
  font-weight: 400;
  font-size: 14px;
}

input, select, textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(200, 200, 200, 0.3);
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.char-counter {
  display: block;
  text-align: right;
  font-size: 12px;
  color: var(--gray-500);
  margin-top: 4px;
}

/* Interest chips */
.interest-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.chip {
  padding: 8px 16px;
  border: 2px solid #667eea;
  border-radius: 20px;
  background: white;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.chip.selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.05);
}
```

---

## ✅ Step 3: 약관 동의 (Terms Agreement)

### UI 구성

**제목 섹션:**
- 타이틀: "약관 동의"
- 서브타이틀: "서비스 이용을 위해 약관에 동의해주세요"
- 진행 표시: "3 / 3"

**전체 동의 체크박스:**

```tsx
<div className="terms-container">
  <div className="terms-all">
    <label className="checkbox-label all">
      <input
        type="checkbox"
        checked={isAllAgreed}
        onChange={handleAllAgree}
      />
      <span className="checkmark"></span>
      <span className="label-text">전체 동의</span>
    </label>
  </div>

  <div className="terms-divider"></div>
</div>
```

**개별 약관 체크박스:**

```tsx
<div className="terms-list">
  {/* 서비스 이용약관 (필수) */}
  <div className="terms-item">
    <label className="checkbox-label">
      <input
        type="checkbox"
        checked={serviceTerms}
        onChange={(e) => setServiceTerms(e.target.checked)}
      />
      <span className="checkmark"></span>
      <span className="label-text">
        서비스 이용약관 동의
        <span className="required-mark">(필수)</span>
      </span>
    </label>
    <a
      href="/terms"
      target="_blank"
      rel="noopener noreferrer"
      className="terms-link"
    >
      보기
    </a>
  </div>

  {/* 개인정보 처리방침 (필수) */}
  <div className="terms-item">
    <label className="checkbox-label">
      <input
        type="checkbox"
        checked={privacyPolicy}
        onChange={(e) => setPrivacyPolicy(e.target.checked)}
      />
      <span className="checkmark"></span>
      <span className="label-text">
        개인정보 처리방침 동의
        <span className="required-mark">(필수)</span>
      </span>
    </label>
    <a
      href="/privacy"
      target="_blank"
      rel="noopener noreferrer"
      className="terms-link"
    >
      보기
    </a>
  </div>

  {/* 마케팅 수신 동의 (선택) */}
  <div className="terms-item">
    <label className="checkbox-label">
      <input
        type="checkbox"
        checked={marketingConsent}
        onChange={(e) => setMarketingConsent(e.target.checked)}
      />
      <span className="checkmark"></span>
      <span className="label-text">
        마케팅 정보 수신 동의
        <span className="optional-mark">(선택)</span>
      </span>
    </label>
    <div className="terms-description">
      이벤트 및 프로모션 정보를 받아보실 수 있습니다
    </div>
  </div>
</div>
```

**최종 제출 버튼:**

```tsx
<div className="button-group">
  <button
    className="back-button"
    onClick={() => setCurrentStep(2)}
  >
    이전
  </button>

  <button
    className="submit-button"
    onClick={handleSignupSubmit}
    disabled={!isStep3Valid || loading}
  >
    {loading ? (
      <>
        <span className="spinner">⏳</span>
        <span>가입 중...</span>
      </>
    ) : (
      '회원가입 완료'
    )}
  </button>
</div>
```

### 약관 동의 로직

```typescript
// 전체 동의 처리
const handleAllAgree = (e: React.ChangeEvent<HTMLInputElement>) => {
  const checked = e.target.checked
  setServiceTerms(checked)
  setPrivacyPolicy(checked)
  setMarketingConsent(checked)
}

// 전체 동의 상태 계산
const isAllAgreed = serviceTerms && privacyPolicy && marketingConsent

// Step 3 유효성 검증 (필수 약관만 확인)
const isStep3Valid = () => {
  return serviceTerms && privacyPolicy
}
```

### 최종 제출 처리

```typescript
const handleSignupSubmit = async () => {
  try {
    setLoading(true)

    // 모든 필수 약관 동의 확인
    if (!serviceTerms || !privacyPolicy) {
      setErrors({ general: '필수 약관에 동의해주세요' })
      return
    }

    // 회원가입 실행
    if (accountData.provider === 'email') {
      // 이메일 가입
      await signUp(
        accountData.email,
        accountData.password!,
        {
          nickname: profileData.nickname,
          danceLevel: profileData.danceLevel,
          location: profileData.location,
          bio: profileData.bio,
          interests: profileData.interests
        }
      )
    } else {
      // 소셜 로그인 (이미 Step 1에서 인증됨)
      // 프로필 정보만 업데이트
      const userId = auth.currentUser?.uid
      if (userId) {
        await updateUserProfile(userId, {
          nickname: profileData.nickname,
          danceLevel: profileData.danceLevel,
          location: profileData.location,
          bio: profileData.bio,
          interests: profileData.interests
        })
      }
    }

    // localStorage 정리
    localStorage.removeItem('swing-connect-signup-progress')

    // 환영 메시지와 함께 /home으로 리디렉션
    router.push('/home?welcome=true')

  } catch (error: any) {
    console.error('Signup error:', error)

    // Firebase 에러 처리
    if (error.code === 'auth/email-already-in-use') {
      setErrors({ general: '이미 사용 중인 이메일입니다' })
    } else if (error.code === 'auth/weak-password') {
      setErrors({ general: '비밀번호가 너무 약합니다' })
    } else {
      setErrors({ general: '회원가입에 실패했습니다. 다시 시도해주세요.' })
    }
  } finally {
    setLoading(false)
  }
}
```

### 체크박스 스타일

```css
.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  padding-left: 32px;
}

/* 기본 체크박스 숨김 */
.checkbox-label input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

/* 커스텀 체크박스 */
.checkmark {
  position: absolute;
  left: 0;
  height: 20px;
  width: 20px;
  border: 2px solid #667eea;
  border-radius: 6px;
  transition: all 0.3s;
}

/* 체크 시 스타일 */
.checkbox-label input:checked ~ .checkmark {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

/* 체크마크 아이콘 */
.checkbox-label input:checked ~ .checkmark::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 14px;
  font-weight: bold;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

/* 전체 동의 체크박스는 크게 */
.checkbox-label.all {
  font-weight: 700;
  font-size: 18px;
}

.checkbox-label.all .checkmark {
  height: 24px;
  width: 24px;
}

.terms-link {
  color: #667eea;
  text-decoration: underline;
  font-size: 14px;
}

.terms-description {
  margin-left: 32px;
  font-size: 13px;
  color: var(--gray-500);
  margin-top: 4px;
}
```

---

## 🎯 진행 상태 표시기 (Step Indicator)

### UI 구성

```tsx
// StepIndicator.tsx
interface StepIndicatorProps {
  currentStep: 1 | 2 | 3
  steps: string[]
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="step-indicator">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === currentStep
        const isCompleted = stepNumber < currentStep

        return (
          <div key={stepNumber} className="step-item">
            <div className={`step-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
              {isCompleted ? '✓' : stepNumber}
            </div>
            <div className="step-label">{step}</div>
            {stepNumber < steps.length && (
              <div className={`step-line ${isCompleted ? 'completed' : ''}`}></div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// 사용 예시
<StepIndicator
  currentStep={currentStep}
  steps={['계정 정보', '프로필 설정', '약관 동의']}
/>
```

### 스타일

```css
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-2xl);
  position: relative;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #9ca3af;
  transition: all 0.3s;
  z-index: 2;
}

.step-circle.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  transform: scale(1.1);
}

.step-circle.completed {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.step-label {
  margin-top: var(--space-sm);
  font-size: 14px;
  color: var(--gray-600);
  text-align: center;
}

.step-item .step-circle.active + .step-label {
  color: #667eea;
  font-weight: 600;
}

.step-line {
  position: absolute;
  top: 20px;
  left: 50%;
  width: 100px;
  height: 2px;
  background: #e5e7eb;
  z-index: 1;
}

.step-line.completed {
  background: #10b981;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .step-circle {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .step-label {
    font-size: 12px;
  }

  .step-line {
    width: 60px;
  }
}
```

---

## 🔌 기존 시스템 통합 (System Integration)

### Auth Hook 통합

```typescript
// SignupWizard.tsx에서 사용
import { useSignIn } from '@/lib/auth/hooks'

const SignupWizard = () => {
  const { signInWithGoogle, signInWithKakao, signInWithNaver, signUp, loading, error } = useSignIn()

  // ... wizard logic
}
```

### 유효성 검증 유틸 재사용

```typescript
// lib/auth/utils.ts에서 import
import {
  isValidEmail,
  validatePassword,
  getDanceLevelOptions,
  formatDanceLevel
} from '@/lib/auth/utils'

// Step 1에서 사용
const emailError = !isValidEmail(email) ? '올바른 이메일 형식이 아닙니다' : ''

// Step 1에서 사용
const passwordValidation = validatePassword(password)
const passwordError = !passwordValidation.isValid ? passwordValidation.errors.join(', ') : ''

// Step 2에서 사용
const danceLevelOptions = getDanceLevelOptions()
```

### Firestore 통합

```typescript
// providers.ts의 signUpWithEmail 함수 사용
import { signUpWithEmail } from '@/lib/auth/providers'

// Step 3에서 최종 제출 시
await signUpWithEmail(
  accountData.email,
  accountData.password!,
  {
    nickname: profileData.nickname,
    danceLevel: profileData.danceLevel,
    location: profileData.location,
    bio: profileData.bio,
    interests: profileData.interests
  }
)
```

### AuthContext 자동 업데이트

```typescript
// lib/auth/context.tsx의 onAuthStateChanged가 자동으로 감지
// 회원가입 성공 시:
// 1. Firebase Auth에 사용자 생성
// 2. Firestore에 사용자 문서 생성
// 3. AuthContext가 자동으로 user 상태 업데이트
// 4. isAuthenticated가 true로 변경
// 5. 보호된 라우트 접근 가능
```

---

## 🧪 테스트 시나리오 (Test Scenarios)

### 1. 이메일 회원가입 플로우

```
✅ Step 1: 계정 정보
  - 이메일 형식 검증 (실패: test@, 성공: test@example.com)
  - 비밀번호 강도 검증 (실패: 123, 성공: Test1234)
  - 비밀번호 일치 검증 (실패: 다른 비밀번호, 성공: 동일)
  - "다음" 버튼 활성화 (모든 필드 유효할 때만)

✅ Step 2: 프로필 정보
  - 닉네임 검증 (실패: a, 성공: 스윙러버)
  - 댄스 레벨 선택 (필수)
  - 활동 지역 선택 (필수)
  - 자기소개 입력 (선택, 200자 제한)
  - 관심 스타일 선택 (선택, 다중 선택)
  - "이전" 버튼으로 Step 1 복귀
  - "다음" 버튼 활성화 (필수 필드만 입력 시)

✅ Step 3: 약관 동의
  - 전체 동의 체크 시 모든 항목 선택
  - 개별 항목 체크/해제
  - 필수 약관 미동의 시 제출 불가
  - "회원가입 완료" 버튼 클릭
  - 로딩 상태 표시
  - 성공 시 /home으로 리디렉션
  - 실패 시 에러 메시지 표시
```

### 2. 소셜 로그인 플로우

```
✅ Google 로그인
  - Step 1에서 "구글로 시작하기" 클릭
  - Google OAuth 팝업 표시
  - 인증 성공 시 Step 2로 자동 이동
  - 이메일, displayName 자동 입력
  - Step 2, 3 진행
  - 최종 제출 시 프로필 정보만 업데이트

⚠️ Kakao/Naver 로그인
  - "곧 지원 예정" 메시지 표시
  - 구글 로그인 사용 안내
```

### 3. 에러 처리

```
✅ 네트워크 에러
  - 인터넷 연결 끊김 시뮬레이션
  - "네트워크 오류가 발생했습니다" 메시지
  - 재시도 버튼 제공

✅ Firebase 에러
  - auth/email-already-in-use: "이미 사용 중인 이메일입니다"
  - auth/weak-password: "비밀번호가 너무 약합니다"
  - 기타 에러: "회원가입에 실패했습니다"

✅ 유효성 검증 에러
  - 실시간 피드백 (onChange, onBlur)
  - 에러 메시지 빨간색 표시
  - shake 애니메이션 효과
```

### 4. 상태 복구

```
✅ 새로고침 시
  - localStorage에서 진행 상태 복구
  - 현재 단계 및 입력 데이터 유지
  - 완료 시 localStorage 정리

✅ 뒤로가기
  - Step 2 → Step 1 이동
  - Step 3 → Step 2 이동
  - 데이터 유지
```

### 5. 반응형 테스트

```
✅ 모바일 (320px - 768px)
  - 입력 필드 100% 너비
  - 버튼 풀 너비
  - 진행 표시기 축소
  - 폰트 크기 조정

✅ 태블릿 (768px - 1024px)
  - 카드 중앙 정렬
  - 적절한 여백

✅ 데스크톱 (1024px+)
  - 최대 너비 600px
  - 카드 호버 효과
```

---

## 📁 파일 구조 및 구현 순서 (Implementation Order)

### 1단계: 기본 컴포넌트 (Foundation)

```typescript
// ✅ 1. SignupButton.tsx
// 재사용 가능한 버튼 컴포넌트
interface SignupButtonProps {
  variant: 'primary' | 'secondary' | 'social-google' | 'social-kakao' | 'social-naver'
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
}

// ✅ 2. StepIndicator.tsx
// 진행 상태 표시 컴포넌트
interface StepIndicatorProps {
  currentStep: 1 | 2 | 3
  steps: string[]
}
```

### 2단계: 마법사 컨테이너 (Orchestrator)

```typescript
// ✅ 3. SignupWizard.tsx
// 전체 회원가입 플로우 관리
export default function SignupWizard() {
  const [signupState, setSignupState] = useState<SignupState>(initialState)

  // Step 렌더링
  const renderStep = () => {
    switch (signupState.currentStep) {
      case 1: return <Step1AccountInfo ... />
      case 2: return <Step2ProfileInfo ... />
      case 3: return <Step3Terms ... />
    }
  }

  return (
    <div className="signup-wizard">
      <StepIndicator currentStep={signupState.currentStep} ... />
      {renderStep()}
    </div>
  )
}
```

### 3단계: 각 단계 컴포넌트 (Steps)

```typescript
// ✅ 4. Step1AccountInfo.tsx
interface Step1Props {
  accountData: AccountData
  setAccountData: (data: AccountData) => void
  onNext: () => void
  errors: Record<string, string>
  setErrors: (errors: Record<string, string>) => void
}

// ✅ 5. Step2ProfileInfo.tsx
interface Step2Props {
  profileData: ProfileData
  setProfileData: (data: ProfileData) => void
  onNext: () => void
  onBack: () => void
  errors: Record<string, string>
  setErrors: (errors: Record<string, string>) => void
}

// ✅ 6. Step3Terms.tsx
interface Step3Props {
  termsData: TermsData
  setTermsData: (data: TermsData) => void
  onBack: () => void
  onSubmit: () => Promise<void>
  loading: boolean
  errors: Record<string, string>
}
```

### 4단계: 메인 페이지 (Page Wrapper)

```typescript
// ✅ 7. app/signup/page.tsx
export default function SignupPage() {
  return (
    <Suspense fallback={<SignupLoadingFallback />}>
      <SignupWizard />
    </Suspense>
  )
}

// 로딩 폴백 (login 페이지 스타일과 동일)
function SignupLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">로딩 중...</p>
      </div>
    </div>
  )
}
```

---

## 🚀 구현 체크리스트 (Implementation Checklist)

### Phase 1: 기본 설정 ✅
- [x] 디렉토리 구조 생성 (`app/signup/components/`)
- [ ] SignupButton 컴포넌트 구현
- [ ] StepIndicator 컴포넌트 구현

### Phase 2: 마법사 프레임워크 ✅
- [ ] SignupWizard 컨테이너 구현
  - [ ] 상태 관리 (SignupState)
  - [ ] localStorage 통합
  - [ ] Step 전환 로직
  - [ ] 에러 처리

### Phase 3: 단계별 컴포넌트 ✅
- [ ] Step1AccountInfo 구현
  - [ ] 소셜 로그인 버튼 (Google, Kakao, Naver)
  - [ ] 이메일/비밀번호 입력 폼
  - [ ] 실시간 유효성 검증
  - [ ] 비밀번호 강도 표시
- [ ] Step2ProfileInfo 구현
  - [ ] 필수 필드 (닉네임, 댄스 레벨, 활동 지역)
  - [ ] 선택 필드 (자기소개, 관심 스타일)
  - [ ] 입력 검증 및 에러 표시
- [ ] Step3Terms 구현
  - [ ] 약관 동의 체크박스
  - [ ] 전체 동의 기능
  - [ ] 최종 제출 로직

### Phase 4: 통합 및 테스트 ✅
- [ ] app/signup/page.tsx 메인 페이지 생성
- [ ] Suspense 및 로딩 폴백
- [ ] 기존 auth 시스템과 통합
- [ ] 에러 처리 및 복구
- [ ] 반응형 디자인 검증

### Phase 5: 품질 보증 ✅
- [ ] 전체 플로우 테스트
  - [ ] 이메일 회원가입
  - [ ] 소셜 로그인
  - [ ] 에러 시나리오
  - [ ] 상태 복구
- [ ] 접근성 검증 (키보드 네비게이션, ARIA 속성)
- [ ] 성능 최적화 (불필요한 리렌더링 방지)
- [ ] 모바일 테스트 (실제 디바이스)

---

## 🔄 추가 고려사항 (Additional Considerations)

### 1. 프로필 이미지 업로드 (향후 구현)

```typescript
// Step 2에 추가 가능
<div className="profile-image-upload">
  <label htmlFor="profileImage">프로필 사진 (선택)</label>
  <input
    type="file"
    id="profileImage"
    accept="image/*"
    onChange={handleImageUpload}
  />
  {imagePreview && <img src={imagePreview} alt="Preview" />}
</div>

// Firebase Storage 통합
const handleImageUpload = async (file: File) => {
  const storageRef = ref(storage, `profile-images/${userId}`)
  await uploadBytes(storageRef, file)
  const photoURL = await getDownloadURL(storageRef)
  setProfileData(prev => ({ ...prev, photoURL }))
}
```

### 2. 이메일 인증 (향후 구현)

```typescript
// 회원가입 완료 후
import { sendEmailVerification } from 'firebase/auth'

await sendEmailVerification(auth.currentUser!)
// "인증 이메일이 발송되었습니다" 알림 표시
```

### 3. 소셜 로그인 확장

```typescript
// Kakao, Naver 실제 구현 시
// 1. Firebase Console에서 각 Provider 활성화
// 2. 각 플랫폼에서 앱 등록 및 키 발급
// 3. lib/auth/providers.ts의 placeholder 함수 실제 구현
// 4. Step1AccountInfo의 버튼 핸들러 업데이트
```

### 4. 접근성 개선

```typescript
// ARIA 속성 추가
<div role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={3}>
  <StepIndicator ... />
</div>

// 키보드 네비게이션
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && isStepValid) {
      handleNextStep()
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [isStepValid])
```

### 5. 성능 최적화

```typescript
// React.memo로 불필요한 리렌더링 방지
export const Step1AccountInfo = React.memo<Step1Props>(({ ... }) => {
  // component logic
})

// useMemo로 계산 비용 최적화
const danceLevelOptions = useMemo(() => getDanceLevelOptions(), [])

// useCallback으로 함수 재생성 방지
const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  setEmail(e.target.value)
}, [])
```

---

## 📝 결론 (Conclusion)

이 설계 문서는 Swing Connect 회원가입 시스템의 완전한 구현 가이드를 제공합니다.

**핵심 구현 포인트:**
1. **3단계 마법사 플로우**: 계정 정보 → 프로필 설정 → 약관 동의
2. **기존 시스템 통합**: AuthContext, providers, validation utils 재사용
3. **Glassmorphism 디자인**: 로그인 페이지와 일관된 스타일
4. **완벽한 유효성 검증**: 실시간 피드백 및 에러 처리
5. **상태 복구**: localStorage 기반 진행 상황 저장

**다음 단계:**
1. SignupButton, StepIndicator 기본 컴포넌트 구현
2. SignupWizard 컨테이너 및 상태 관리
3. 각 단계 컴포넌트 구현 (Step1, 2, 3)
4. 메인 페이지 및 통합 테스트
5. 품질 보증 및 배포

이 문서를 따라 구현하면 **사용자 친화적이고 안정적인 회원가입 시스템**을 완성할 수 있습니다.
