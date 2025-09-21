/**
 * Firestore 컬렉션 참조 관리
 * 중앙화된 컬렉션 참조로 타입 안전성과 일관성 보장
 */

import { collection, CollectionReference, DocumentReference, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Studio } from '@/lib/types/studio'
import type { MarketplaceItem, ItemInquiry } from '@/lib/types/marketplace'

// 기존 컬렉션들
export const usersCollection = collection(db, 'users')
export const studiosCollection = collection(db, 'studios') as CollectionReference<Studio>

// 새로운 마켓플레이스 컬렉션들
export const marketplaceItemsCollection = collection(db, 'marketplace_items') as CollectionReference<MarketplaceItem>
export const itemInquiriesCollection = collection(db, 'item_inquiries') as CollectionReference<ItemInquiry>

// 헬퍼 함수들
export const getStudioDoc = (studioId: string): DocumentReference<Studio> =>
  doc(studiosCollection, studioId)

export const getMarketplaceItemDoc = (itemId: string): DocumentReference<MarketplaceItem> =>
  doc(marketplaceItemsCollection, itemId)

export const getItemInquiryDoc = (inquiryId: string): DocumentReference<ItemInquiry> =>
  doc(itemInquiriesCollection, inquiryId)

// 서브컬렉션 참조 함수들
export const getStudioReviewsCollection = (studioId: string) =>
  collection(db, 'studios', studioId, 'reviews')

export const getStudioImagesCollection = (studioId: string) =>
  collection(db, 'studios', studioId, 'images')

export const getUserFavoritesCollection = (userId: string) =>
  collection(db, 'users', userId, 'favorites')

export const getItemImagesCollection = (itemId: string) =>
  collection(db, 'marketplace_items', itemId, 'images')

// 컬렉션 이름 상수 (Server Actions에서 사용)
export const COLLECTION_NAMES = {
  USERS: 'users',
  STUDIOS: 'studios',
  MARKETPLACE_ITEMS: 'marketplace_items',
  ITEM_INQUIRIES: 'item_inquiries',
  ANALYTICS: 'analytics',
  CONFIG: 'config',
  REPORTS: 'reports'
} as const