# Firestore Composite Index Setup Guide

## Problem Summary

Firestore에서 복합 쿼리(composite query)를 수행할 때 해당 조합에 맞는 인덱스가 생성되어 있지 않으면 다음과 같은 오류가 발생합니다:

```
The query requires an index. You can create it here: https://console.firebase.google.com/...
```

## Root Cause

### Composite Query란?

Firestore에서 여러 필터 조건과 정렬을 동시에 사용하는 쿼리:

```typescript
// 예시: category 필터 + status 필터 + 정렬
query(
  collection(db, 'posts'),
  where('category', '==', 'general'),
  where('status', '==', 'active'),
  orderBy('metadata.createdAt', 'desc')
)
```

### 왜 인덱스가 필요한가?

1. **단일 필터만 사용**: Firestore가 자동으로 인덱스 생성 ✅
2. **복합 필터 + 정렬**: 수동으로 인덱스 생성 필요 ⚠️

## Identified Queries Requiring Indexes

### 1. Posts Collection Queries

#### Basic Queries
- **Status + CreatedAt** (최신순 정렬)
  ```typescript
  where('status', '==', 'active') + orderBy('metadata.createdAt', 'desc')
  ```

- **Category + Status + CreatedAt** (카테고리별 최신순)
  ```typescript
  where('category', '==', 'general') + where('status', '==', 'active') + orderBy('metadata.createdAt', 'desc')
  ```

#### Popularity Queries
- **Status + Likes** (인기순 정렬)
  ```typescript
  where('status', '==', 'active') + orderBy('stats.likes', 'desc')
  ```

- **Category + Status + Likes** (카테고리별 인기순)
  ```typescript
  where('category', '==', 'general') + where('status', '==', 'active') + orderBy('stats.likes', 'desc')
  ```

#### View Count Queries
- **Status + Views** (조회순 정렬)
  ```typescript
  where('status', '==', 'active') + orderBy('stats.views', 'desc')
  ```

- **Category + Status + Views** (카테고리별 조회순)
  ```typescript
  where('category', '==', 'general') + where('status', '==', 'active') + orderBy('stats.views', 'desc')
  ```

#### Author Queries
- **AuthorId + Status + CreatedAt** (작성자별 게시글)
  ```typescript
  where('metadata.authorId', '==', userId) + where('status', '==', 'active') + orderBy('metadata.createdAt', 'desc')
  ```

#### Region Queries
- **Region + Status + CreatedAt** (지역별 게시글)
  ```typescript
  where('region', '==', 'seoul') + where('status', '==', 'active') + orderBy('metadata.createdAt', 'desc')
  ```

### 2. Comments Collection Queries

- **PostId + CreatedAt** (게시글별 댓글)
  ```typescript
  where('postId', '==', postId) + orderBy('metadata.createdAt', 'asc')
  ```

- **PostId + ParentId + CreatedAt** (대댓글)
  ```typescript
  where('postId', '==', postId) + where('parentId', '==', parentId) + orderBy('metadata.createdAt', 'asc')
  ```

### 3. Notifications Collection Queries

- **RecipientId + CreatedAt** (사용자별 알림)
  ```typescript
  where('recipientId', '==', userId) + orderBy('createdAt', 'desc')
  ```

- **RecipientId + IsRead + CreatedAt** (읽지 않은 알림)
  ```typescript
  where('recipientId', '==', userId) + where('isRead', '==', false) + orderBy('createdAt', 'desc')
  ```

## Solution Implementation

### Step 1: Index Configuration Created

Created comprehensive `firestore.indexes.json` with 12 composite indexes:

```json
{
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "metadata.createdAt", "order": "DESCENDING" }
      ]
    },
    // ... (11 more indexes)
  ],
  "fieldOverrides": [
    {
      "collectionGroup": "posts",
      "fieldPath": "images",
      "indexes": [
        { "order": "ASCENDING", "queryScope": "COLLECTION" }
      ]
    }
  ]
}
```

### Step 2: Deploy Indexes to Firebase

**Authentication Required**: Firebase CLI requires valid authentication to deploy indexes.

#### Option 1: Firebase Console (Manual)

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select project: `swingclub-9f333`
3. Navigate to **Firestore Database** → **Indexes**
4. Click **Add Index** for each query that fails
5. Firestore will provide direct links in error messages

#### Option 2: Firebase CLI (Recommended)

```bash
# 1. Login to Firebase
firebase login

# 2. Verify authentication
firebase projects:list

# 3. Deploy indexes
firebase deploy --only firestore:indexes
```

**Expected Output**:
```
✔ Deploy complete!

Creating indexes...
  ✔ firestore: created indexes
    - (posts) status ASC metadata.createdAt DESC
    - (posts) category ASC status ASC metadata.createdAt DESC
    - (posts) status ASC stats.likes DESC
    - ... (9 more)
```

#### Option 3: Automatic Index Creation

Firebase provides direct links in error messages when a query requires an index:

```
The query requires an index. You can create it here:
https://console.firebase.google.com/v1/r/project/swingclub-9f333/firestore/indexes?create_composite=...
```

Click the link to automatically create the required index.

## Deployment Commands

```bash
# Full deployment (includes indexes)
firebase deploy

# Only deploy Firestore indexes
firebase deploy --only firestore:indexes

# Only deploy Firestore rules
firebase deploy --only firestore:rules

# Dry run (validate configuration without deploying)
firebase deploy --only firestore:indexes --dry-run
```

## Index Build Time

- **Small datasets** (<1000 documents): ~1-5 minutes
- **Medium datasets** (1000-10000 documents): ~5-15 minutes
- **Large datasets** (>10000 documents): ~15-60 minutes

Monitor index build status in Firebase Console → Firestore Database → Indexes.

## Testing After Deployment

### 1. Test Basic Queries

```typescript
// Test status + createdAt index
const posts = await getPosts({ status: ['active'] })
console.log('✅ Basic query successful:', posts.length)
```

### 2. Test Composite Queries

```typescript
// Test category + status + createdAt index
const categoryPosts = await getPosts({
  category: 'general',
  status: ['active'],
  sortBy: 'latest'
})
console.log('✅ Category query successful:', categoryPosts.length)
```

### 3. Test Popularity Queries

```typescript
// Test status + likes index
const popularPosts = await getPosts({
  status: ['active'],
  sortBy: 'popular'
})
console.log('✅ Popular query successful:', popularPosts.length)
```

### 4. Monitor Console

Check browser console and server logs for any remaining index errors:
```bash
npm run dev
```

Look for:
- ❌ "The query requires an index" errors
- ✅ Successful query responses

## Common Issues

### Issue 1: Authentication Expired

**Error**:
```
Error: Request had invalid authentication credentials
```

**Solution**:
```bash
firebase logout
firebase login
firebase deploy --only firestore:indexes
```

### Issue 2: Index Already Exists

**Error**:
```
Error: Index already exists
```

**Solution**:
This is not an error. Firestore skips duplicate indexes automatically.

### Issue 3: Index Build Failed

**Error**:
```
Error: Index build failed
```

**Solution**:
1. Check Firebase Console for detailed error message
2. Verify field paths match exactly
3. Delete failed index and recreate

### Issue 4: Query Still Fails After Deployment

**Possible Causes**:
1. Index still building (check Firebase Console)
2. Query parameters don't match index configuration
3. Missing index for specific combination

**Solution**:
Wait for index build completion or click the link in the error message to create the exact index needed.

## Verification Checklist

After deploying indexes:

- [ ] Firebase CLI authentication successful
- [ ] `firebase deploy --only firestore:indexes` completed without errors
- [ ] Firebase Console shows all 12 indexes
- [ ] All indexes show "Enabled" status (not "Building")
- [ ] Community page loads without index errors
- [ ] Category filtering works
- [ ] Sort by popularity works
- [ ] Sort by views works
- [ ] Author filter works
- [ ] No index errors in browser console
- [ ] No index errors in server logs

## Files Modified

1. ✅ **firestore.indexes.json**: Created 12 composite indexes
2. ✅ **lib/firebase/collections.ts**: Existing queries documented
3. ✅ **claudedocs/firestore-composite-index-setup.md**: This documentation

## Related Documentation

- [Firebase Composite Index Documentation](https://firebase.google.com/docs/firestore/query-data/index-overview)
- [Firestore Query Limitations](https://firebase.google.com/docs/firestore/query-data/queries#query_limitations)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

## Status

⚠️ **REQUIRES USER ACTION**: Firebase authentication needed to deploy indexes

**Action Required**:
```bash
firebase login
firebase deploy --only firestore:indexes
```

**Last Updated**: 2025-10-16
**Developer**: Claude Code (continuation session)
