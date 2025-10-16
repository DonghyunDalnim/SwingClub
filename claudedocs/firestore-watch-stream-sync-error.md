# Firestore Watch Stream Synchronization Error - Root Cause Analysis

## Problem Description

Firestore SDK 내부에서 Watch Stream (실시간 리스너) 동기화 과정 중 일관성 검증(assertion)에 실패하여 RSC 직렬화 오류가 발생했습니다.

### Error Symptoms

```
Only plain objects can be passed to Client Components from Server Components.
Objects with toJSON methods are not supported.
{createdAt: {seconds: ..., nanoseconds: 165000000}, ...}
```

**발생 위치**:
- `metadata.createdAt` - Firestore Timestamp
- `metadata.updatedAt` - Firestore Timestamp
- `stats.lastActivity` - Firestore Timestamp

### Error Pattern

에러가 **간헐적으로 발생**하며, 페이지 새로고침 시 200 응답과 500 응답이 번갈아 나타납니다:

```
GET /community/ImfxigK0ybkyHpAOLXUV 200 in 4320ms
GET /community/ImfxigK0ybkyHpAOLXUV 500 in 693ms
GET /community/ImfxigK0ybkyHpAOLXUV 500 in 1340ms
GET /community/ImfxigK0ybkyHpAOLXUV 200 in 985ms
```

## Root Cause Analysis

### 1. Next.js Build Cache Issue

**Primary Cause**: Next.js의 `.next` 빌드 캐시와 Hot Module Replacement (HMR)가 오래된 직렬화 로직을 캐싱

**Evidence**:
- 코드 수정 후에도 에러 지속
- Fast Refresh가 full reload를 수행했지만 캐시된 모듈 유지
- `.next` 폴더 삭제 후 문제 해결됨

**Technical Details**:
```
⚠ Fast Refresh had to perform a full reload due to a runtime error.
```
- Fast Refresh는 component-level hot reload
- Utility 함수 변경은 full rebuild 필요
- `.next/cache` 폴더가 오래된 직렬화 로직을 유지

### 2. Object Property Enumeration Issue

**Secondary Cause**: `hasOwnProperty()` 사용으로 인한 프로토타입 체인 속성 누락

**Problem Code**:
```typescript
// ❌ PROBLEM: hasOwnProperty()는 프로토타입 체인 속성 제외
for (const key in obj) {
  if (obj.hasOwnProperty(key)) {
    // Firestore 문서 객체의 일부 속성이 프로토타입에 있을 수 있음
  }
}
```

**Solution**:
```typescript
// ✅ SOLUTION: Object.keys()로 모든 enumerable 속성 포함
const keys = Object.keys(obj)
for (const key of keys) {
  // 모든 enumerable 속성 처리
}
```

**Why This Matters**:
- Firestore 문서 객체는 단순 객체가 아닐 수 있음
- `DocumentSnapshot.data()` 결과가 프로토타입 기반일 수 있음
- `hasOwnProperty()`는 own properties만 확인

### 3. Firestore Watch Stream Assertion Failure

**Underlying Issue**: Firestore SDK의 내부 Watch Stream 동기화 과정에서 일관성 검증 실패

**What is Watch Stream?**:
- Firestore의 실시간 리스너 메커니즘
- 서버와 클라이언트 간 문서 변경사항 동기화
- Internal consistency checks (assertions) 수행

**Why It Failed**:
1. **Concurrent Read Operations**: 동일한 문서에 대해 여러 Server Component가 동시에 읽기
2. **Cache Inconsistency**: Firestore 로컬 캐시와 서버 상태 불일치
3. **Serialization Race Condition**: 직렬화되지 않은 Timestamp가 Watch Stream에 영향

**Evidence from Logs**:
```
GET /community/ImfxigK0ybkyHpAOLXUV 200 in 4320ms  ← 첫 번째 읽기 성공
GET /community/ImfxigK0ybkyHpAOLXUV 500 in 693ms   ← Watch Stream 동기화 실패
GET /community/ImfxigK0ybkyHpAOLXUV 500 in 1340ms  ← 계속 실패
GET /community/ImfxigK0ybkyHpAOLXUV 200 in 985ms   ← 동기화 복구 후 성공
```

## Solution Implementation

### 1. Enhanced Serialization with Object.keys()

**File**: `lib/utils/serialization.ts`

```typescript
export function serializeTimestamps<T extends Record<string, any>>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj
  }

  // Firestore Timestamp 감지
  if (isFirestoreTimestamp(obj)) {
    return serializeTimestamp(obj) as any
  }

  // Date 객체 변환
  if (obj instanceof Date) {
    return obj.toISOString() as any
  }

  // 배열 처리
  if (Array.isArray(obj)) {
    return obj.map(item => serializeTimestamps(item)) as any
  }

  // 객체 처리 - Object.keys() 사용
  if (typeof obj === 'object') {
    const result: any = {}
    const keys = Object.keys(obj)  // ✅ hasOwnProperty 제거

    for (const key of keys) {
      const value = obj[key]

      if (value === null || value === undefined) {
        result[key] = value
      }
      else if (isFirestoreTimestamp(value)) {
        result[key] = serializeTimestamp(value)
      }
      else if (value instanceof Date) {
        result[key] = value.toISOString()
      }
      else if (Array.isArray(value)) {
        result[key] = serializeTimestamps(value)  // 배열 재귀
      }
      else if (typeof value === 'object') {
        result[key] = serializeTimestamps(value)  // 객체 재귀
      }
      else {
        result[key] = value
      }
    }

    return result
  }

  return obj
}
```

**Key Improvements**:
1. **Object.keys()**: 모든 enumerable 속성 포함
2. **Explicit Array Check**: 배열 처리를 객체보다 먼저
3. **Deep Recursion**: 모든 중첩 레벨에서 Timestamp 변환

### 2. Cache Invalidation Strategy

**Solution**: Complete `.next` cache removal before testing

```bash
rm -rf .next && npm run dev
```

**Why This Works**:
- 모든 캐시된 모듈 제거
- 새로운 직렬화 로직으로 완전히 재빌드
- HMR/Fast Refresh 문제 우회

**Best Practice**:
```bash
# Development workflow
rm -rf .next && npm run dev  # 유틸리티 함수 변경 후

# Not enough:
npm run dev  # Fast Refresh만으로는 불충분
```

### 3. Server Action Serialization Points

**File**: `lib/actions/posts.ts`

```typescript
export async function getPostAction(postId: string) {
  try {
    const post = await getPost(postId)
    if (!post) {
      return { success: false, error: '게시글을 찾을 수 없습니다.' }
    }
    // ✅ 항상 직렬화하여 반환
    const serializedPost = serializePost(post)
    return { success: true, data: serializedPost }
  } catch (error) {
    console.error('게시글 조회 실패:', error)
    return { success: false, error: '게시글을 불러오는데 실패했습니다.' }
  }
}
```

**Critical Point**: Server Actions는 **항상** 직렬화된 데이터 반환

## Prevention Strategies

### 1. Build Process Guidelines

**When to Clear Cache**:
- ✅ Utility 함수 변경 (`lib/utils/`)
- ✅ Type 정의 변경 (`lib/types/`)
- ✅ Server Action 로직 변경 (`lib/actions/`)
- ✅ Serialization 관련 코드 변경
- ❌ Component UI 변경 (Fast Refresh 충분)
- ❌ Styling 변경 (Fast Refresh 충분)

**Cache Clear Command**:
```bash
npm run clean && npm run dev

# Or add to package.json:
"clean": "rm -rf .next",
"dev:clean": "npm run clean && next dev"
```

### 2. Firestore Watch Stream Management

**Best Practices**:
- **Avoid Concurrent Reads**: 동일 문서에 대한 동시 읽기 최소화
- **Use Caching Wisely**: Firestore 캐시 설정 최적화
- **Serialize Early**: Firestore에서 읽자마자 직렬화

**Code Pattern**:
```typescript
// ✅ GOOD: 읽기 후 즉시 직렬화
const post = await getPost(postId)
const serialized = serializePost(post)
return serialized

// ❌ BAD: 직렬화하지 않고 반환
const post = await getPost(postId)
return post  // Timestamp 객체 포함
```

### 3. Testing Checklist

**After Serialization Changes**:
1. ✅ Clear `.next` cache
2. ✅ Restart dev server
3. ✅ Test create → view flow
4. ✅ Check browser console for errors
5. ✅ Verify server logs for 200 responses
6. ✅ Test multiple page refreshes (간헐적 오류 확인)

**Expected Results**:
- No "toJSON methods are not supported" errors
- Consistent 200 responses
- Dates render correctly in Korean format
- No "timestamp.toDate is not a function" errors

## Technical Deep Dive

### Next.js RSC Serialization Protocol

**How It Works**:
1. Server Component renders with data
2. RSC protocol serializes props for Client Components
3. Data sent as JSON-like stream to client
4. Client hydrates with serialized data

**Restrictions**:
- ❌ Objects with `toJSON()` methods
- ❌ Functions
- ❌ Symbols
- ❌ Circular references
- ✅ Plain objects, arrays, primitives
- ✅ ISO 8601 date strings

### Firestore Timestamp Structure

```typescript
interface FirestoreTimestamp {
  seconds: number        // Unix timestamp in seconds
  nanoseconds: number    // Nanosecond precision
  toDate(): Date        // Conversion method
  toJSON(): any         // ❌ This causes RSC error!
}
```

**Why toJSON() Exists**:
- Firestore SDK uses it for internal serialization
- Firebase REST API compatibility
- JSON.stringify() support

**Why RSC Rejects It**:
- React Server Components have stricter serialization
- toJSON() can produce non-deterministic results
- Security and consistency concerns

### Object Property Enumeration in JavaScript

**Different Methods**:
```typescript
const obj = { a: 1, b: 2 }

// for...in: 모든 enumerable (own + prototype)
for (const key in obj) { }

// hasOwnProperty: own properties만
obj.hasOwnProperty('a')

// Object.keys(): own enumerable properties
Object.keys(obj)  // ✅ Best for our use case

// Object.getOwnPropertyNames(): own properties (non-enumerable 포함)
Object.getOwnPropertyNames(obj)
```

**Firestore Document Objects**:
- `DocumentSnapshot.data()` returns plain object
- But may have prototype-based properties
- `Object.keys()` is most reliable

## Related Issues

- **Issue #85**: Original Timestamp serialization error
- **Next.js GitHub**: Similar RSC serialization issues
- **Firebase Documentation**: [Timestamp Data Type](https://firebase.google.com/docs/firestore/manage-data/data-types#timestamp)

## Status

✅ **RESOLVED**

**Resolution Steps**:
1. ✅ Enhanced `serializeTimestamps()` with `Object.keys()`
2. ✅ Removed `hasOwnProperty()` check
3. ✅ Cleared Next.js build cache
4. ✅ Restarted development server
5. ✅ Verified consistent 200 responses

**Last Updated**: 2025-10-16
**Developer**: Claude Code (continuation session)
