/**
 * 거래 문의 관련 Server Actions
 * Next.js 15 App Router Server Actions 패턴 사용
 */

'use server'

import { revalidatePath } from 'next/cache'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  increment,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  collections,
  createNotification,
  getMarketplaceItemDoc
} from '@/lib/firebase/collections'
import type {
  ItemInquiry,
  InquiryMessage,
  CreateInquiryData,
  CreateInquiryMessageData,
  UpdateInquiryData,
  UpdateInquiryMessageData,
  InquiriesResponse,
  InquiryMessagesResponse,
  InquirySearchFilters,
  InquiryStatus,
  InquiryMessageType
} from '@/lib/types/marketplace'
import { getCurrentUser } from '@/lib/auth/server'

// 문의 메시지 컬렉션 참조
const inquiryMessagesCollection = collection(db, 'inquiry_messages')

/**
 * 새 거래 문의 생성
 */
export async function createInquiry(data: CreateInquiryData): Promise<{ success: boolean; inquiryId?: string; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 상품 정보 확인
    const itemRef = getMarketplaceItemDoc(data.itemId)
    const itemDoc = await getDoc(itemRef)

    if (!itemDoc.exists()) {
      return { success: false, error: '상품을 찾을 수 없습니다.' }
    }

    const itemData = itemDoc.data()

    // 자신의 상품에는 문의할 수 없음
    if (itemData.metadata.sellerId === user.uid) {
      return { success: false, error: '본인의 상품에는 문의할 수 없습니다.' }
    }

    // 입력 검증
    if (!data.message?.trim()) {
      return { success: false, error: '문의 내용을 입력해주세요.' }
    }

    if (data.message.length > 1000) {
      return { success: false, error: '문의 내용은 1000자를 초과할 수 없습니다.' }
    }

    // 중복 문의 확인 (동일한 구매자-상품 조합)
    const existingInquiry = await getDocs(
      query(
        collections.itemInquiries,
        where('itemId', '==', data.itemId),
        where('buyerId', '==', user.uid),
        where('status', 'in', ['active'])
      )
    )

    if (!existingInquiry.empty) {
      return { success: false, error: '이미 진행중인 문의가 있습니다.' }
    }

    const now = Timestamp.now()

    // 문의 스레드 생성
    const inquiryData: Omit<ItemInquiry, 'id'> = {
      itemId: data.itemId,
      itemTitle: itemData.title,
      itemImage: itemData.images?.[0],
      buyerId: user.uid,
      buyerName: user.displayName || '구매자',
      sellerId: itemData.metadata.sellerId,
      sellerName: '판매자', // TODO: 판매자 정보 조회
      status: 'active',
      lastMessage: data.message,
      lastMessageAt: now,
      lastSenderId: user.uid,
      buyerLastReadAt: now,
      sellerLastReadAt: undefined,
      unreadCount: {
        buyer: 0,
        seller: 1
      },
      messageCount: 1,
      createdAt: now,
      updatedAt: now
    }

    const inquiryRef = await addDoc(collections.itemInquiries, inquiryData)

    // 첫 번째 메시지 생성
    const messageData: Omit<InquiryMessage, 'id'> = {
      inquiryId: inquiryRef.id,
      senderId: user.uid,
      senderName: user.displayName || '구매자',
      senderType: 'buyer',
      type: data.messageType || 'text',
      content: data.message.trim(),
      priceProposal: data.priceProposal ? {
        proposedPrice: data.priceProposal.proposedPrice,
        originalPrice: itemData.pricing.price || 0,
        message: data.priceProposal.message
      } : undefined,
      isRead: false,
      createdAt: now,
      updatedAt: now
    }

    await addDoc(inquiryMessagesCollection, messageData)

    // 상품의 문의 수 증가
    await updateDoc(itemRef, {
      'stats.inquiries': increment(1)
    })

    // 판매자에게 알림 생성
    await createNotification(
      itemData.metadata.sellerId,
      'inquiry_new',
      '새 문의',
      `${itemData.title}에 새 문의가 있습니다.`,
      {
        postId: data.itemId,
        commentId: inquiryRef.id,
        userId: user.uid,
        actionUrl: `/marketplace/${data.itemId}/inquiry/${inquiryRef.id}`
      }
    )

    revalidatePath(`/marketplace/${data.itemId}`)
    return { success: true, inquiryId: inquiryRef.id }

  } catch (error) {
    console.error('Failed to create inquiry:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '문의 생성에 실패했습니다.'
    }
  }
}

/**
 * 문의 메시지 전송
 */
export async function sendInquiryMessage(data: CreateInquiryMessageData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 문의 정보 확인 및 권한 검증
    const inquiryRef = doc(collections.itemInquiries, data.inquiryId)
    const inquiryDoc = await getDoc(inquiryRef)

    if (!inquiryDoc.exists()) {
      return { success: false, error: '문의를 찾을 수 없습니다.' }
    }

    const inquiryData = inquiryDoc.data() as ItemInquiry

    // 권한 확인 (구매자 또는 판매자만)
    if (inquiryData.buyerId !== user.uid && inquiryData.sellerId !== user.uid) {
      return { success: false, error: '메시지를 보낼 권한이 없습니다.' }
    }

    // 문의 상태 확인
    if (inquiryData.status !== 'active') {
      return { success: false, error: '진행중인 문의가 아닙니다.' }
    }

    // 입력 검증
    if (!data.content?.trim()) {
      return { success: false, error: '메시지 내용을 입력해주세요.' }
    }

    if (data.content.length > 1000) {
      return { success: false, error: '메시지는 1000자를 초과할 수 없습니다.' }
    }

    // 스팸 방지 - 최근 1분간 메시지 수 확인
    const oneMinuteAgo = new Timestamp(Date.now() / 1000 - 60, 0)
    const recentMessages = await getDocs(
      query(
        inquiryMessagesCollection,
        where('inquiryId', '==', data.inquiryId),
        where('senderId', '==', user.uid),
        where('createdAt', '>=', oneMinuteAgo)
      )
    )

    if (recentMessages.size >= 5) {
      return { success: false, error: '메시지를 너무 빠르게 전송하고 있습니다. 잠시 후 다시 시도해주세요.' }
    }

    const now = Timestamp.now()
    const senderType = inquiryData.buyerId === user.uid ? 'buyer' : 'seller'
    const otherUserId = senderType === 'buyer' ? inquiryData.sellerId : inquiryData.buyerId

    // 메시지 생성
    const messageData: Omit<InquiryMessage, 'id'> = {
      inquiryId: data.inquiryId,
      senderId: user.uid,
      senderName: user.displayName || (senderType === 'buyer' ? '구매자' : '판매자'),
      senderType,
      type: data.type,
      content: data.content.trim(),
      imageUrl: data.imageUrl,
      priceProposal: data.priceProposal,
      isRead: false,
      createdAt: now,
      updatedAt: now
    }

    const messageRef = await addDoc(inquiryMessagesCollection, messageData)

    // 문의 스레드 업데이트
    const updateData: Partial<ItemInquiry> = {
      lastMessage: data.content.trim(),
      lastMessageAt: now,
      lastSenderId: user.uid,
      messageCount: inquiryData.messageCount + 1,
      updatedAt: now
    }

    // 읽음 상태 및 미읽음 수 업데이트
    if (senderType === 'buyer') {
      updateData.buyerLastReadAt = now
      updateData.unreadCount = {
        buyer: 0,
        seller: inquiryData.unreadCount.seller + 1
      }
    } else {
      updateData.sellerLastReadAt = now
      updateData.unreadCount = {
        buyer: inquiryData.unreadCount.buyer + 1,
        seller: 0
      }
    }

    await updateDoc(inquiryRef, updateData)

    // 상대방에게 알림 생성
    const notificationType = data.type === 'price_proposal' ? 'inquiry_price_proposal' : 'inquiry_message'
    const notificationTitle = data.type === 'price_proposal' ? '가격 제안' : '새 메시지'
    const notificationMessage = data.type === 'price_proposal'
      ? `${inquiryData.itemTitle}에 가격 제안이 있습니다.`
      : `${inquiryData.itemTitle} 문의에 새 메시지가 있습니다.`

    await createNotification(
      otherUserId,
      notificationType,
      notificationTitle,
      notificationMessage,
      {
        postId: inquiryData.itemId,
        commentId: data.inquiryId,
        userId: user.uid,
        actionUrl: `/marketplace/${inquiryData.itemId}/inquiry/${data.inquiryId}`
      }
    )

    revalidatePath(`/marketplace/${inquiryData.itemId}/inquiry/${data.inquiryId}`)
    return { success: true, messageId: messageRef.id }

  } catch (error) {
    console.error('Failed to send inquiry message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '메시지 전송에 실패했습니다.'
    }
  }
}

/**
 * 문의 조회 (권한 확인 포함)
 */
export async function getInquiry(inquiryId: string): Promise<{ success: boolean; inquiry?: ItemInquiry; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const inquiryRef = doc(collections.itemInquiries, inquiryId)
    const inquiryDoc = await getDoc(inquiryRef)

    if (!inquiryDoc.exists()) {
      return { success: false, error: '문의를 찾을 수 없습니다.' }
    }

    const inquiry = {
      ...inquiryDoc.data(),
      id: inquiryDoc.id
    } as ItemInquiry

    // 권한 확인
    if (inquiry.buyerId !== user.uid && inquiry.sellerId !== user.uid) {
      return { success: false, error: '문의를 볼 권한이 없습니다.' }
    }

    return { success: true, inquiry }

  } catch (error) {
    console.error('Failed to get inquiry:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '문의 조회에 실패했습니다.'
    }
  }
}

/**
 * 문의 메시지 목록 조회
 */
export async function getInquiryMessages(
  inquiryId: string,
  page: number = 1,
  pageSize: number = 50
): Promise<{ success: boolean; data?: InquiryMessagesResponse; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 문의 권한 확인
    const inquiryResult = await getInquiry(inquiryId)
    if (!inquiryResult.success) {
      return { success: false, error: inquiryResult.error }
    }

    let messagesQuery = query(
      inquiryMessagesCollection,
      where('inquiryId', '==', inquiryId),
      orderBy('createdAt', 'asc')
    )

    // 페이지네이션
    messagesQuery = query(messagesQuery, limit(pageSize + 1))

    const querySnapshot = await getDocs(messagesQuery)
    const docs = querySnapshot.docs

    const hasNext = docs.length > pageSize
    const messages = docs
      .slice(0, pageSize)
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InquiryMessage[]

    return {
      success: true,
      data: {
        data: messages,
        pagination: {
          page,
          limit: pageSize,
          total: messages.length,
          hasNext,
          hasPrev: page > 1
        }
      }
    }

  } catch (error) {
    console.error('Failed to get inquiry messages:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '메시지 조회에 실패했습니다.'
    }
  }
}

/**
 * 사용자의 문의 목록 조회
 */
export async function getUserInquiries(
  page: number = 1,
  pageSize: number = 20,
  filters?: InquirySearchFilters
): Promise<{ success: boolean; data?: InquiriesResponse; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    let inquiriesQuery = query(
      collections.itemInquiries,
      where('buyerId', '==', user.uid)
    )

    // 상태 필터
    if (filters?.status && filters.status.length > 0) {
      inquiriesQuery = query(inquiriesQuery, where('status', 'in', filters.status))
    }

    // 정렬
    const sortBy = filters?.sortBy || 'latest'
    if (sortBy === 'unread_first') {
      inquiriesQuery = query(inquiriesQuery, orderBy('unreadCount.buyer', 'desc'), orderBy('lastMessageAt', 'desc'))
    } else if (sortBy === 'oldest') {
      inquiriesQuery = query(inquiriesQuery, orderBy('lastMessageAt', 'asc'))
    } else {
      inquiriesQuery = query(inquiriesQuery, orderBy('lastMessageAt', 'desc'))
    }

    inquiriesQuery = query(inquiriesQuery, limit(pageSize + 1))

    const querySnapshot = await getDocs(inquiriesQuery)
    const docs = querySnapshot.docs

    const hasNext = docs.length > pageSize
    const inquiries = docs
      .slice(0, pageSize)
      .map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as ItemInquiry[]

    return {
      success: true,
      data: {
        data: inquiries,
        pagination: {
          page,
          limit: pageSize,
          total: inquiries.length,
          hasNext,
          hasPrev: page > 1
        }
      }
    }

  } catch (error) {
    console.error('Failed to get user inquiries:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '문의 목록 조회에 실패했습니다.'
    }
  }
}

/**
 * 상품의 문의 목록 조회 (판매자용)
 */
export async function getItemInquiries(
  itemId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ success: boolean; data?: InquiriesResponse; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 상품 소유권 확인
    const itemRef = getMarketplaceItemDoc(itemId)
    const itemDoc = await getDoc(itemRef)

    if (!itemDoc.exists()) {
      return { success: false, error: '상품을 찾을 수 없습니다.' }
    }

    const itemData = itemDoc.data()
    if (itemData.metadata.sellerId !== user.uid) {
      return { success: false, error: '상품의 문의를 볼 권한이 없습니다.' }
    }

    let inquiriesQuery = query(
      collections.itemInquiries,
      where('itemId', '==', itemId),
      orderBy('lastMessageAt', 'desc'),
      limit(pageSize + 1)
    )

    const querySnapshot = await getDocs(inquiriesQuery)
    const docs = querySnapshot.docs

    const hasNext = docs.length > pageSize
    const inquiries = docs
      .slice(0, pageSize)
      .map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as ItemInquiry[]

    return {
      success: true,
      data: {
        data: inquiries,
        pagination: {
          page,
          limit: pageSize,
          total: inquiries.length,
          hasNext,
          hasPrev: page > 1
        }
      }
    }

  } catch (error) {
    console.error('Failed to get item inquiries:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '상품 문의 조회에 실패했습니다.'
    }
  }
}

/**
 * 문의 상태 업데이트
 */
export async function updateInquiryStatus(
  inquiryId: string,
  status: InquiryStatus,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const inquiryRef = doc(collections.itemInquiries, inquiryId)
    const inquiryDoc = await getDoc(inquiryRef)

    if (!inquiryDoc.exists()) {
      return { success: false, error: '문의를 찾을 수 없습니다.' }
    }

    const inquiry = inquiryDoc.data() as ItemInquiry

    // 권한 확인 (판매자만 상태 변경 가능, 신고는 양쪽 모두 가능)
    if (status === 'reported') {
      if (inquiry.buyerId !== user.uid && inquiry.sellerId !== user.uid) {
        return { success: false, error: '문의를 신고할 권한이 없습니다.' }
      }
    } else {
      if (inquiry.sellerId !== user.uid) {
        return { success: false, error: '문의 상태를 변경할 권한이 없습니다.' }
      }
    }

    const updateData: Partial<ItemInquiry> = {
      status,
      updatedAt: Timestamp.now()
    }

    if (status === 'reported' && reason) {
      updateData.reportedBy = user.uid
      updateData.reportReason = reason
      updateData.reportedAt = Timestamp.now()
    }

    await updateDoc(inquiryRef, updateData)

    // 상대방에게 알림 생성
    const otherUserId = inquiry.buyerId === user.uid ? inquiry.sellerId : inquiry.buyerId
    const statusLabels = {
      active: '진행',
      completed: '완료',
      cancelled: '취소',
      reported: '신고'
    }

    if (status !== 'reported') {
      await createNotification(
        otherUserId,
        'inquiry_status_changed',
        '문의 상태 변경',
        `${inquiry.itemTitle} 문의가 ${statusLabels[status]}되었습니다.`,
        {
          postId: inquiry.itemId,
          commentId: inquiryId,
          userId: user.uid,
          actionUrl: `/marketplace/${inquiry.itemId}/inquiry/${inquiryId}`
        }
      )
    }

    revalidatePath(`/marketplace/${inquiry.itemId}/inquiry/${inquiryId}`)
    return { success: true }

  } catch (error) {
    console.error('Failed to update inquiry status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '문의 상태 업데이트에 실패했습니다.'
    }
  }
}

/**
 * 문의 읽음 처리
 */
export async function markInquiryAsRead(inquiryId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const inquiryRef = doc(collections.itemInquiries, inquiryId)
    const inquiryDoc = await getDoc(inquiryRef)

    if (!inquiryDoc.exists()) {
      return { success: false, error: '문의를 찾을 수 없습니다.' }
    }

    const inquiry = inquiryDoc.data() as ItemInquiry

    // 권한 확인
    if (inquiry.buyerId !== user.uid && inquiry.sellerId !== user.uid) {
      return { success: false, error: '문의 읽음 처리 권한이 없습니다.' }
    }

    const now = Timestamp.now()
    const isBuyer = inquiry.buyerId === user.uid

    const updateData: Partial<ItemInquiry> = {
      updatedAt: now
    }

    if (isBuyer) {
      updateData.buyerLastReadAt = now
      updateData.unreadCount = {
        buyer: 0,
        seller: inquiry.unreadCount.seller
      }
    } else {
      updateData.sellerLastReadAt = now
      updateData.unreadCount = {
        buyer: inquiry.unreadCount.buyer,
        seller: 0
      }
    }

    await updateDoc(inquiryRef, updateData)

    // 해당 문의의 모든 메시지를 읽음 처리
    const messagesQuery = query(
      inquiryMessagesCollection,
      where('inquiryId', '==', inquiryId),
      where('senderId', '!=', user.uid),
      where('isRead', '==', false)
    )

    const messageDocs = await getDocs(messagesQuery)
    const batch = writeBatch(db)

    messageDocs.docs.forEach(messageDoc => {
      batch.update(messageDoc.ref, { isRead: true })
    })

    if (!messageDocs.empty) {
      await batch.commit()
    }

    return { success: true }

  } catch (error) {
    console.error('Failed to mark inquiry as read:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '읽음 처리에 실패했습니다.'
    }
  }
}