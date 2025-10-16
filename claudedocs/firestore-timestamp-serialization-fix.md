# Firestore Timestamp Serialization Fix - Issue #85

## Problem Summary

Next.js App Router encountered serialization errors when passing data from Server Components to Client Components due to Firestore Timestamp objects containing a `toJSON()` method, which is incompatible with React Server Components (RSC) protocol.

### Error Message
```
Only plain objects can be passed to Client Components from Server Components.
Objects with toJSON methods are not supported. Convert it manually to a simple value before passing it to props.
{createdAt: {seconds: ..., nanoseconds: 165000000}, ...}
```

## Root Cause

1. **Next.js RSC Protocol**: Server Components serialize data when passing to Client Components
2. **Firestore Timestamp Structure**: `{seconds: number, nanoseconds: number, toJSON: Function}`
3. **Incompatibility**: RSC protocol rejects objects with `toJSON()` methods
4. **Nested Objects**: Shallow copy approaches failed because Timestamps can be deeply nested

## Solution Architecture

### 1. Serialization Utilities ([lib/utils/serialization.ts](../lib/utils/serialization.ts))

Created comprehensive deep-copy serialization system:

- **`isFirestoreTimestamp()`**: Detects Firestore Timestamp objects by structure
- **`serializeTimestamp()`**: Converts single Timestamp to ISO 8601 string
- **`serializeTimestamps()`**: Recursively converts all Timestamps in object (deep copy)
- **`serializePost()`** / **`serializePosts()`**: Convenience wrappers for Post data

**Key Implementation Detail**: Uses deep copy with recursive traversal instead of shallow spread operator to handle nested Timestamps.

### 2. Date Handling Utilities ([lib/utils/date.ts](../lib/utils/date.ts))

Created unified date handling to support both Timestamp objects and serialized strings:

- **`toDate()`**: Handles Timestamp/string/Date conversion
- **`formatDateTime()`**: Korean date/time formatting
- **`formatRelativeTime()`**: Relative time display (e.g., "3분 전")
- **`formatDate()`** / **`formatTime()`**: Various date formatting utilities

### 3. Server Action Updates ([lib/actions/posts.ts](../lib/actions/posts.ts))

Modified all Server Actions to serialize data before returning:

```typescript
import { serializePost, serializePosts } from '@/lib/utils/serialization'

export async function getPostsAction(filters?: PostSearchFilters) {
  try {
    const posts = await getPosts(filters)
    const serializedPosts = serializePosts(posts)  // Serialize before return
    return { success: true, data: serializedPosts }
  } catch (error) {
    return { success: false, error: '게시글을 불러오는데 실패했습니다.', data: [] }
  }
}
```

### 4. Client Component Updates ([components/community/PostDetail.tsx](../components/community/PostDetail.tsx))

Updated to use unified date utilities:

```typescript
import { formatDateTime } from '@/lib/utils/date'

// Removed local formatDateTime function
// Now uses imported utility that handles both Timestamp and string formats
```

## Technical Details

### Deep Copy vs Shallow Copy

**Problem with Shallow Copy**:
```typescript
// ❌ WRONG: Doesn't handle nested Timestamps
const result: any = { ...obj }
```

**Solution with Deep Copy**:
```typescript
// ✅ CORRECT: Recursively processes all nested properties
const result: any = {}
for (const key in obj) {
  if (obj.hasOwnProperty(key)) {
    const value = obj[key]
    if (typeof value === 'object') {
      result[key] = serializeTimestamps(value)  // Recursive
    } else {
      result[key] = value
    }
  }
}
```

### Timestamp Detection

```typescript
function isFirestoreTimestamp(value: any): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    'seconds' in value &&
    'nanoseconds' in value &&
    typeof value.seconds === 'number' &&
    typeof value.nanoseconds === 'number'
  )
}
```

### ISO 8601 String Conversion

```typescript
export function serializeTimestamp(timestamp: Timestamp | Date | any): string {
  if (!timestamp) return new Date().toISOString()

  // Firestore Timestamp 객체
  if (timestamp.seconds !== undefined) {
    return new Date(timestamp.seconds * 1000).toISOString()
  }

  // Date 객체
  if (timestamp instanceof Date) {
    return timestamp.toISOString()
  }

  // 이미 문자열인 경우
  if (typeof timestamp === 'string') {
    return timestamp
  }

  return new Date().toISOString()
}
```

## Verification Steps

### 1. Create New Post
1. Navigate to http://localhost:3000/community/write
2. Create a test post with title and content
3. Submit the form
4. Verify successful redirect to post detail page

### 2. Check Console for Errors
- Open browser DevTools console
- Should see NO serialization errors
- Should see NO "toJSON method" errors
- Should see NO "timestamp.toDate is not a function" errors

### 3. Verify Date Display
- Post detail page should show formatted dates (e.g., "2025년 10월 16일 오후 8:49")
- Community list should show relative times (e.g., "3분 전")
- All timestamps should render correctly

### 4. Check Server Logs
```bash
# Monitor server output for errors
npm run dev
```

Look for:
- ✅ No RSC serialization errors
- ✅ No Firebase Timestamp-related errors
- ✅ Successful page renders

## Files Modified

1. **Created**: `lib/utils/serialization.ts` - Core serialization utilities
2. **Created**: `lib/utils/date.ts` - Date handling utilities
3. **Modified**: `lib/actions/posts.ts` - Added serialization to Server Actions
4. **Modified**: `components/community/PostDetail.tsx` - Updated to use date utilities

## Key Learnings

1. **RSC Protocol Restrictions**: Objects with `toJSON()` methods cannot be serialized in Next.js App Router
2. **Deep Copy Necessity**: Nested Timestamps require recursive traversal, not shallow copy
3. **Unified Date Handling**: Client components must handle both Timestamp objects (in dev) and strings (after serialization)
4. **Server-Side Serialization**: Always serialize in Server Actions before returning to client
5. **Type Safety**: TypeScript generics help maintain type safety during serialization

## Future Considerations

### Other Firestore Types to Handle
- **GeoPoint**: May need similar serialization
- **DocumentReference**: Should be converted to document IDs
- **Binary Data**: Consider base64 encoding if needed

### Performance Optimization
- Consider memoization for large datasets
- Implement caching for frequently accessed serialized data
- Monitor serialization overhead in production

### Testing Strategy
- Unit tests for serialization utilities
- Integration tests for Server Actions
- E2E tests for complete data flow

## Related Issues

- Issue #85: Timestamp serialization error in community post detail page
- Firebase documentation: [Working with Timestamps](https://firebase.google.com/docs/firestore/manage-data/data-types)
- Next.js documentation: [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

## Status

✅ **RESOLVED** - All Firestore Timestamp serialization errors have been addressed with comprehensive deep-copy serialization system.

**Last Updated**: 2025-10-16
**Developer**: Claude Code (continuation session)
