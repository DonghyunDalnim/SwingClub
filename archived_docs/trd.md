# 스윙댄스 커뮤니티 서비스 TRD

## 1. 기술 개요

### 1.1 아키텍처 개요
- **프론트엔드/백엔드**: Next.js 14 (App Router)
- **데이터베이스**: Firebase Firestore
- **인증**: Firebase Authentication
- **호스팅**: Vercel
- **파일 저장소**: Firebase Storage
- **알림**: Firebase Cloud Messaging (FCM)

### 1.2 기술 스택

#### 1.2.1 Core Framework
```
Next.js 14.0+
- App Router
- Server Components
- Server Actions
- TypeScript 5.0+
- React 18+
```

#### 1.2.2 Styling & UI
```
TailwindCSS 3.4+
Headless UI
Heroicons
Framer Motion (애니메이션)
React Hook Form (폼 관리)
```

#### 1.2.3 Backend & Database
```
Firebase 9+
- Firestore (NoSQL Database)
- Firebase Auth
- Firebase Storage
- Firebase Functions (필요시)
- Firebase Analytics
```

#### 1.2.4 External APIs
```
카카오맵 API (지도 서비스)
카카오톡 로그인 API
네이버 로그인 API
구글 로그인 API
Firebase Cloud Messaging
```

---

## 2. 시스템 아키텍처

### 2.1 전체 시스템 구조

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Pages     │  │ Components  │  │   API Routes    │  │
│  │ (App Router)│  │   (React)   │  │ (Server Actions)│  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                    Firebase Backend                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Firestore  │  │   Auth      │  │     Storage     │  │
│  │ (Database)  │  │(Authentication)│  │ (File Upload) │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   FCM       │  │  Analytics  │  │   Functions     │  │
│  │(Push Notification)│(Tracking)│  │  (Serverless)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                   External APIs                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ 카카오맵 API │  │소셜로그인APIs│  │    기타 APIs    │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 디렉토리 구조

```
swing-dance-community/
├── src/
│   ├── app/                    # App Router 페이지
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (main)/
│   │   │   ├── home/
│   │   │   ├── community/
│   │   │   ├── region/
│   │   │   ├── marketplace/
│   │   │   └── profile/
│   │   ├── api/               # API Routes
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # 재사용 가능한 컴포넌트
│   │   ├── ui/               # 기본 UI 컴포넌트
│   │   ├── forms/            # 폼 컴포넌트
│   │   ├── layout/           # 레이아웃 컴포넌트
│   │   └── features/         # 기능별 컴포넌트
│   ├── lib/                  # 유틸리티 및 설정
│   │   ├── firebase.ts
│   │   ├── auth.ts
│   │   ├── utils.ts
│   │   └── validations.ts
│   ├── hooks/                # Custom Hooks
│   ├── types/                # TypeScript 타입 정의
│   └── constants/            # 상수 정의
├── public/                   # 정적 파일
├── tailwind.config.js
├── next.config.js
├── package.json
└── README.md
```

---

## 3. 데이터베이스 설계

### 3.1 Firestore 컬렉션 구조

#### 3.1.1 Users Collection
```typescript
interface User {
  uid: string;                    // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  profile: {
    nickname: string;
    danceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    preferredStyles: string[];    // ['lindy-hop', 'charleston', 'balboa']
    bio?: string;
    location: {
      city: string;
      district: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    isPartnerSearching: boolean;
  };
  settings: {
    notifications: {
      push: boolean;
      email: boolean;
      community: boolean;
      marketplace: boolean;
    };
    privacy: {
      showLocation: boolean;
      showProfile: boolean;
    };
  };
  stats: {
    postsCount: number;
    commentsCount: number;
    marketplaceRating: number;
    marketplaceTransactions: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 3.1.2 Posts Collection
```typescript
interface Post {
  id: string;
  authorId: string;
  category: 'general' | 'partner-search' | 'qna' | 'event' | 'marketplace';
  title: string;
  content: string;
  images?: string[];             // Firebase Storage URLs
  tags: string[];
  location?: {
    city: string;
    district: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  // Marketplace specific fields
  marketplace?: {
    price: number;
    condition: 'new' | 'like-new' | 'good' | 'fair';
    itemCategory: 'shoes' | 'clothing' | 'accessories' | 'other';
    isNegotiable: boolean;
    status: 'available' | 'reserved' | 'sold';
  };
  
  // Event specific fields
  event?: {
    datetime: Timestamp;
    venue: string;
    maxParticipants?: number;
    currentParticipants: string[]; // user IDs
  };
  
  stats: {
    views: number;
    likes: number;
    commentsCount: number;
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}
```

#### 3.1.3 Comments Collection
```typescript
interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentCommentId?: string;      // 대댓글용
  likes: number;
  likedBy: string[];             // user IDs
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}
```

#### 3.1.4 Regions Collection
```typescript
interface Region {
  id: string;
  name: string;
  type: 'city' | 'district';
  parentRegionId?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  stats: {
    usersCount: number;
    postsCount: number;
    studiosCount: number;
  };
  isActive: boolean;
}
```

#### 3.1.5 Studios Collection
```typescript
interface Studio {
  id: string;
  name: string;
  description: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    instagram?: string;
  };
  images: string[];
  amenities: string[];           // ['parking', 'aircon', 'mirror', 'sound']
  priceRange: {
    min: number;
    max: number;
  };
  rating: number;
  reviewsCount: number;
  ownerId?: string;              // 등록한 사용자 ID
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 3.1.6 Notifications Collection
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'comment' | 'like' | 'marketplace' | 'system' | 'partner-match';
  title: string;
  content: string;
  data?: {                       // 추가 데이터
    postId?: string;
    commentId?: string;
    fromUserId?: string;
  };
  isRead: boolean;
  createdAt: Timestamp;
}
```

### 3.2 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // 다른 사용자 프로필 조회 허용
    }
    
    // Posts collection
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                   request.auth.uid == resource.data.authorId;
      allow update, delete: if request.auth != null && 
                           request.auth.uid == resource.data.authorId;
    }
    
    // Comments collection
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                   request.auth.uid == resource.data.authorId;
      allow update, delete: if request.auth != null && 
                           request.auth.uid == resource.data.authorId;
    }
    
    // Regions collection (read-only for users)
    match /regions/{regionId} {
      allow read: if request.auth != null;
    }
    
    // Studios collection
    match /studios/{studioId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                           request.auth.uid == resource.data.ownerId;
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 4. API 설계

### 4.1 Server Actions (Next.js 14)

#### 4.1.1 Authentication Actions
```typescript
// src/lib/actions/auth.ts
'use server'

export async function signInWithProvider(provider: 'google' | 'kakao' | 'naver') {
  // Firebase Auth 소셜 로그인 처리
}

export async function signOut() {
  // 로그아웃 처리
}

export async function updateUserProfile(data: Partial<User>) {
  // 사용자 프로필 업데이트
}
```

#### 4.1.2 Post Actions
```typescript
// src/lib/actions/posts.ts
'use server'

export async function createPost(data: CreatePostData) {
  // 게시글 생성
}

export async function updatePost(postId: string, data: Partial<Post>) {
  // 게시글 수정
}

export async function deletePost(postId: string) {
  // 게시글 삭제
}

export async function likePost(postId: string) {
  // 게시글 좋아요/취소
}

export async function getPostsByCategory(category: string, page: number = 1) {
  // 카테고리별 게시글 조회
}

export async function getPostsByRegion(regionId: string, page: number = 1) {
  // 지역별 게시글 조회
}
```

#### 4.1.3 Marketplace Actions
```typescript
// src/lib/actions/marketplace.ts
'use server'

export async function createMarketplaceItem(data: MarketplaceItemData) {
  // 중고거래 상품 등록
}

export async function updateItemStatus(itemId: string, status: string) {
  // 거래 상태 업데이트
}

export async function getMarketplaceItems(filters: MarketplaceFilters) {
  // 필터링된 중고거래 상품 조회
}

export async function createTransaction(buyerId: string, sellerId: string, itemId: string) {
  // 거래 생성
}
```

### 4.2 API Routes (필요시)

#### 4.2.1 파일 업로드
```typescript
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Firebase Storage 파일 업로드 처리
}
```

#### 4.2.2 알림 전송
```typescript
// src/app/api/notifications/route.ts
export async function POST(request: NextRequest) {
  // FCM 푸시 알림 전송
}
```

---

## 5. 주요 컴포넌트 설계

### 5.1 Layout Components

#### 5.1.1 Main Layout
```typescript
// src/components/layout/MainLayout.tsx
interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
```

#### 5.1.2 Header Component
```typescript
// src/components/layout/Header.tsx
export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <SearchBar />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
```

#### 5.1.3 Bottom Navigation
```typescript
// src/components/layout/BottomNavigation.tsx
export function BottomNavigation() {
  const navItems = [
    { href: '/home', icon: HomeIcon, label: '홈' },
    { href: '/region', icon: MapIcon, label: '지역' },
    { href: '/community', icon: UsersIcon, label: '커뮤니티' },
    { href: '/marketplace', icon: ShoppingBagIcon, label: '거래' },
    { href: '/profile', icon: UserIcon, label: '내정보' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
      {/* Navigation items */}
    </nav>
  );
}
```

### 5.2 Feature Components

#### 5.2.1 Post Card
```typescript
// src/components/features/PostCard.tsx
interface PostCardProps {
  post: Post;
  showActions?: boolean;
}

export function PostCard({ post, showActions = true }: PostCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <PostHeader post={post} />
      <PostContent post={post} />
      {post.images && <PostImages images={post.images} />}
      {showActions && <PostActions post={post} />}
    </div>
  );
}
```

#### 5.2.2 Marketplace Item Card
```typescript
// src/components/features/MarketplaceItemCard.tsx
interface MarketplaceItemCardProps {
  item: Post & { marketplace: MarketplaceData };
}

export function MarketplaceItemCard({ item }: MarketplaceItemCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <ItemImages images={item.images} />
      <div className="p-4">
        <ItemTitle title={item.title} />
        <ItemPrice price={item.marketplace.price} />
        <ItemLocation location={item.location} />
        <SellerInfo authorId={item.authorId} />
      </div>
    </div>
  );
}
```

### 5.3 Form Components

#### 5.3.1 Post Create Form
```typescript
// src/components/forms/PostCreateForm.tsx
interface PostCreateFormProps {
  category: PostCategory;
  onSubmit: (data: CreatePostData) => void;
}

export function PostCreateForm({ category, onSubmit }: PostCreateFormProps) {
  const form = useForm<CreatePostData>();
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <TitleInput {...form.register('title')} />
      <ContentEditor {...form.register('content')} />
      <ImageUpload {...form.register('images')} />
      {category === 'marketplace' && <MarketplaceFields form={form} />}
      {category === 'event' && <EventFields form={form} />}
      <SubmitButton loading={form.formState.isSubmitting} />
    </form>
  );
}
```

---

## 6. 인증 및 보안

### 6.1 Firebase Authentication 설정

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Firebase 설정
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### 6.2 소셜 로그인 구현

```typescript
// src/lib/auth.ts
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut 
} from 'firebase/auth';

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    throw new Error('Google 로그인 실패');
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw new Error('로그아웃 실패');
  }
}
```

### 6.3 Route Protection

```typescript
// src/components/auth/ProtectedRoute.tsx
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const [user, loading] = useAuthState(auth);
  
  if (loading) return <LoadingSpinner />;
  if (!user) return fallback || <LoginPrompt />;
  
  return <>{children}</>;
}
```

---

## 7. 성능 최적화

### 7.1 Next.js 최적화

#### 7.1.1 이미지 최적화
```typescript
// Next.js Image 컴포넌트 사용
import Image from 'next/image';

export function OptimizedImage({ src, alt, ...props }) {
  return (
    <Image
      src={src}
      alt={alt}
      loading="lazy"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      {...props}
    />
  );
}
```

#### 7.1.2 동적 임포트
```typescript
// 지도 컴포넌트 lazy loading
const MapComponent = dynamic(() => import('@/components/Map'), {
  loading: () => <MapSkeleton />,
  ssr: false,
});
```

### 7.2 Firestore 최적화

#### 7.2.1 쿼리 최적화
```typescript
// 복합 인덱스 활용
const postsQuery = query(
  collection(db, 'posts'),
  where('category', '==', category),
  where('location.city', '==', city),
  orderBy('createdAt', 'desc'),
  limit(20)
);
```

#### 7.2.2 페이지네이션
```typescript
// 커서 기반 페이지네이션
export function usePaginatedPosts(category: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  
  const loadMore = async () => {
    let q = query(
      collection(db, 'posts'),
      where('category', '==', category),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    const snapshot = await getDocs(q);
    // 결과 처리...
  };
  
  return { posts, loadMore, hasMore: true };
}
```

### 7.3 캐싱 전략

```typescript
// React Query를 이용한 서버 상태 관리
import { useQuery } from '@tanstack/react-query';

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserById(userId),
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
  });
}
```

---

## 8. 모니터링 및 분석

### 8.1 Firebase Analytics 설정

```typescript
// src/lib/analytics.ts
import { getAnalytics, logEvent } from 'firebase/analytics';

export const analytics = getAnalytics();

export function trackEvent(eventName: string, parameters?: object) {
  logEvent(analytics, eventName, parameters);
}

export function trackPageView(pageName: string) {
  trackEvent('page_view', { page_title: pageName });
}
```

### 8.2 에러 추적

```typescript
// src/lib/error-tracking.ts
export function logError(error: Error, context?: object) {
  console.error('Application Error:', error, context);
  
  // Firebase Analytics로 에러 로깅
  trackEvent('error', {
    error_message: error.message,
    error_stack: error.stack,
    ...context,
  });
}
```

### 8.3 성능 모니터링

```typescript
// src/lib/performance.ts
import { getPerformance } from 'firebase/performance';

export const performance = getPerformance();

export function measureApiCall(name: string) {
  const trace = performance.trace(name);
  trace.start();
  
  return {
    stop: () => trace.stop(),
  };
}
```

---

## 9. 배포 및 DevOps

### 9.1 Vercel 배포 설정

```javascript
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_FIREBASE_API_KEY": "@firebase-api-key",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "@firebase-auth-domain",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID": "@firebase-project-id"
  }
}
```

### 9.2 환경 변수 관리

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_key
NEXT_PUBLIC_KAKAO_LOGIN_API_KEY=your_kakao_login_key
```

### 9.3 CI/CD 파이프라인

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 10. 테스트 전략

### 10.1 단위 테스트

```typescript
// src/lib/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatPrice, validateEmail } from '../utils';

describe('Utils', () => {
  it('should format price correctly', () => {
    expect(formatPrice(10000)).toBe('10,000원');
    expect(formatPrice(0)).toBe('무료');
  });
  
  it('should validate email correctly', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
  });
});
```

### 10.2 컴포넌트 테스트

```typescript
// src/components/__tests__/PostCard.test.tsx
import { render, screen } from '@testing-library/react';
import { PostCard } from '../PostCard';

const mockPost = {
  id: '1',
  title: 'Test Post',
  content: 'Test Content',
  authorId: 'user1',
  category: 'general',
  // ... other properties
};

describe('PostCard', () => {
  it('renders post title and content', () => {
    render(<PostCard post={mockPost} />);
    
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
```

### 10.3 E2E 테스트

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign in with Google', async ({ page }) => {
  await page.goto('/login');
  await page.click('[data-testid="google-login-button"]');
  
  // Mock Google OAuth flow
  await page.waitForURL('/home');
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
});
```

---

## 11. 보안 고려사항

### 11.1 데이터 검증

```typescript
// src/lib/validations.ts
import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(5000),
  category: z.enum(['general', 'partner-search', 'qna', 'event', 'marketplace']),
  images: z.array(z.string().url()).max(5).optional(),
});

export const marketplaceItemSchema = z.object({
  price: z.number().min(0).max(10000000),
  condition: z.enum(['new', 'like-new', 'good', 'fair']),
  itemCategory: z.enum(['shoes', 'clothing', 'accessories', 'other']),
});
```

### 11.2 XSS 방지

```typescript
// HTML 콘텐츠 sanitization
import DOMPurify from 'dompurify';

export function sanitizeHtml(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}

// 사용자 입력 필터링
export function sanitizeUserInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // HTML 태그 제거
    .trim()
    .substring(0, 1000); // 길이 제한
}
```

### 11.3 Rate Limiting

```typescript
// src/lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

interface RateLimitConfig {
  interval: number; // 시간 간격 (ms)
  limit: number;    // 허용 요청 수
}

class RateLimit {
  private cache: LRUCache<string, number[]>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.cache = new LRUCache({
      max: 1000,
      ttl: config.interval,
    });
  }

  check(identifier: string): boolean {
    const now = Date.now();
    const requests = this.cache.get(identifier) || [];
    
    // 시간 간격 내의 요청만 필터링
    const validRequests = requests.filter(
      time => now - time < this.config.interval
    );
    
    if (validRequests.length >= this.config.limit) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    this.cache.set(identifier, validRequests);
    return true;
  }
}

// 사용 예시
export const apiRateLimit = new RateLimit({
  interval: 60 * 1000, // 1분
  limit: 30,           // 30 requests per minute
});
```

### 11.4 데이터 암호화

```typescript
// src/lib/encryption.ts
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

export function encryptSensitiveData(data: string): string {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

export function decryptSensitiveData(encryptedData: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// 개인정보 마스킹
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  const maskedUsername = username.substring(0, 2) + '*'.repeat(username.length - 2);
  return `${maskedUsername}@${domain}`;
}

export function maskPhoneNumber(phone: string): string {
  return phone.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3');
}
```

---

## 12. 외부 API 통합

### 12.1 카카오맵 API 연동

```typescript
// src/lib/kakao-map.ts
declare global {
  interface Window {
    kakao: any;
  }
}

interface Location {
  lat: number;
  lng: number;
}

export class KakaoMapService {
  private map: any;
  private markers: any[] = [];

  async initialize(container: HTMLElement, options: any) {
    // 카카오맵 SDK 로드
    if (!window.kakao || !window.kakao.maps) {
      await this.loadKakaoMapSDK();
    }

    this.map = new window.kakao.maps.Map(container, {
      center: new window.kakao.maps.LatLng(options.lat, options.lng),
      level: options.level || 3,
    });
  }

  private async loadKakaoMapSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
      script.onload = () => {
        window.kakao.maps.load(resolve);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  addMarker(location: Location, info?: string) {
    const position = new window.kakao.maps.LatLng(location.lat, location.lng);
    const marker = new window.kakao.maps.Marker({ position });
    
    marker.setMap(this.map);
    this.markers.push(marker);

    if (info) {
      const infoWindow = new window.kakao.maps.InfoWindow({
        content: info,
      });

      window.kakao.maps.event.addListener(marker, 'click', () => {
        infoWindow.open(this.map, marker);
      });
    }

    return marker;
  }

  clearMarkers() {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
  }
}
```

### 12.2 소셜 로그인 API 연동

```typescript
// src/lib/social-auth.ts
interface SocialAuthProvider {
  name: string;
  login(): Promise<any>;
}

export class KakaoAuthProvider implements SocialAuthProvider {
  name = 'kakao';

  async login() {
    return new Promise((resolve, reject) => {
      if (!window.Kakao) {
        reject(new Error('Kakao SDK not loaded'));
        return;
      }

      window.Kakao.Auth.login({
        success: (authObj: any) => {
          window.Kakao.API.request({
            url: '/v2/user/me',
            success: (res: any) => resolve(res),
            fail: reject,
          });
        },
        fail: reject,
      });
    });
  }
}

export class NaverAuthProvider implements SocialAuthProvider {
  name = 'naver';

  async login() {
    return new Promise((resolve, reject) => {
      if (!window.naver) {
        reject(new Error('Naver SDK not loaded'));
        return;
      }

      window.naver.LoginWithNaverId({
        clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID,
        callbackUrl: `${window.location.origin}/auth/callback/naver`,
        isPopup: true,
        onSuccess: resolve,
        onFailure: reject,
      });
    });
  }
}
```

### 12.3 FCM 푸시 알림

```typescript
// src/lib/fcm.ts
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

class FCMService {
  private messaging: any;

  async initialize() {
    if (typeof window !== 'undefined') {
      this.messaging = getMessaging();
      await this.requestPermission();
      this.onMessageListener();
    }
  }

  async requestPermission(): Promise<string | null> {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(this.messaging, {
          vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
        });
        return token;
      }
      return null;
    } catch (error) {
      console.error('FCM 토큰 획득 실패:', error);
      return null;
    }
  }

  onMessageListener() {
    onMessage(this.messaging, (payload) => {
      console.log('Message received. ', payload);
      
      // 브라우저 알림 표시
      if (Notification.permission === 'granted') {
        new Notification(payload.notification?.title || '', {
          body: payload.notification?.body,
          icon: '/icon-192x192.png',
        });
      }
    });
  }
}

export const fcmService = new FCMService();
```

---

## 13. 개발 환경 설정

### 13.1 개발 도구 설정

```javascript
// package.json
{
  "name": "swing-dance-community",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:e2e": "playwright test",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "analyze": "cross-env ANALYZE=true next build"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "firebase": "^10.0.0",
    "tailwindcss": "^3.4.0",
    "@headlessui/react": "^1.7.0",
    "@heroicons/react": "^2.0.0",
    "framer-motion": "^10.0.0",
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0",
    "react-firebase-hooks": "^5.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.0.0",
    "vitest": "^0.34.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.0",
    "playwright": "^1.40.0",
    "cross-env": "^7.0.3"
  }
}
```

### 13.2 TypeScript 설정

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/hooks/*": ["./src/hooks/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 13.3 ESLint 및 Prettier 설정

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'no-console': 'warn',
  },
};
```

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### 13.4 Git 설정

```bash
# .gitignore
# Dependencies
node_modules/

# Production builds
.next/
dist/

# Environment variables
.env
.env.local
.env.production
.env.staging

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Firebase
.firebase/
firebase-debug.log
```

---

## 14. 성능 및 SEO 최적화

### 14.1 메타데이터 관리

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Swing Connect - 스윙댄스 커뮤니티',
    template: '%s | Swing Connect',
  },
  description: '스윙댄스 애호가들을 위한 통합 커뮤니티 플랫폼',
  keywords: ['스윙댄스', '린디합', '커뮤니티', '파트너', '중고거래'],
  authors: [{ name: 'Swing Connect Team' }],
  creator: 'Swing Connect',
  publisher: 'Swing Connect',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://swingconnect.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://swingconnect.vercel.app',
    title: 'Swing Connect - 스윙댄스 커뮤니티',
    description: '스윙댄스 애호가들을 위한 통합 커뮤니티 플랫폼',
    siteName: 'Swing Connect',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Swing Connect',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Swing Connect - 스윙댄스 커뮤니티',
    description: '스윙댄스 애호가들을 위한 통합 커뮤니티 플랫폼',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
```

### 14.2 사이트맵 생성

```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://swingconnect.vercel.app';
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/region`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];
}
```

### 14.3 로봇 텍스트

```typescript
// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/profile/'],
    },
    sitemap: 'https://swingconnect.vercel.app/sitemap.xml',
  };
}
```

### 14.4 웹 접근성

```typescript
// src/components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  return (
    <button
      className={clsx(baseClasses, variantClasses[variant], sizeClasses[size])}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
```

---

## 15. 결론

### 15.1 기술적 강점

- **모던 스택**: Next.js 14의 최신 기능 활용으로 성능과 개발 경험 최적화
- **확장성**: Firebase의 관리형 서비스로 인프라 관리 부담 최소화
- **타입 안정성**: TypeScript 도입으로 런타임 에러 방지
- **모바일 우선**: 반응형 디자인과 PWA 기능으로 모바일 사용자 경험 최적화

### 15.2 개발 우선순위

#### Phase 1 (1-3개월): MVP 구현
1. 기본 인증 시스템 (소셜 로그인)
2. 핵심 UI 컴포넌트 개발
3. 기본 커뮤니티 기능 (게시판, 댓글)
4. Firebase 연동 및 데이터 모델 구현
5. 반응형 웹 디자인 적용

#### Phase 2 (4-6개월): 기능 확장
1. 중고거래 플랫폼 고도화
2. 지역 기반 서비스 (지도 연동)
3. 파트너 매칭 기능
4. 푸시 알림 시스템
5. 이미지 업로드 및 최적화

#### Phase 3 (7-12개월): 최적화 및 수익화
1. 성능 최적화 (캐싱, 로딩 속도)
2. SEO 최적화
3. 프리미엄 기능 개발
4. 고급 분석 및 모니터링
5. 보안 강화

### 15.3 위험 요소 및 대응책

**기술적 위험**:
- Firebase 비용 증가 → 사용량 모니터링 및 최적화
- API 제한 → 캐싱 전략 및 요청 최적화

**확장성 위험**:
- 사용자 증가에 따른 성능 저하 → CDN 활용 및 코드 스플리팅
- 데이터 구조 변경 필요성 → 마이그레이션 스크립트 준비

### 15.4 성공 지표

**개발 품질**:
- 코드 커버리지 80% 이상
- 페이지 로딩 속도 3초 이내
- 모바일 성능 점수 90점 이상

**사용자 경험**:
- 앱 크래시율 1% 미만
- 사용자 만족도 4.5/5.0 이상
- 접근성 점수 90점 이상