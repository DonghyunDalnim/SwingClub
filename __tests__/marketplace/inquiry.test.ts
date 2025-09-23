/**
 * 거래 문의 시스템 테스트
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {}
}))

jest.mock('@/lib/auth/server', () => ({
  getCurrentUser: jest.fn()
}))

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() }))
  },
  writeBatch: jest.fn(),
  increment: jest.fn()
}))

jest.mock('@/lib/firebase/collections', () => ({
  collections: {
    itemInquiries: {},
    marketplaceItems: {}
  },
  createNotification: jest.fn(),
  getMarketplaceItemDoc: jest.fn()
}))

import {
  createInquiry,
  sendInquiryMessage,
  getInquiry,
  getInquiryMessages,
  getUserInquiries,
  updateInquiryStatus,
  markInquiryAsRead
} from '@/lib/actions/inquiry'
import type {
  CreateInquiryData,
  CreateInquiryMessageData,
  ItemInquiry,
  InquiryMessage
} from '@/lib/types/marketplace'

// Mock 데이터
const mockUser = {
  uid: 'user123',
  displayName: '테스트유저',
  email: 'test@example.com'
}

const mockItem = {
  id: 'item123',
  title: '테스트 상품',
  images: ['test-image.jpg'],
  metadata: {
    sellerId: 'seller123'
  }
}

const mockInquiry: ItemInquiry = {
  id: 'inquiry123',
  itemId: 'item123',
  itemTitle: '테스트 상품',
  itemImage: 'test-image.jpg',
  buyerId: 'user123',
  buyerName: '테스트유저',
  sellerId: 'seller123',
  sellerName: '판매자',
  status: 'active',
  lastMessage: '안녕하세요',
  lastMessageAt: { toDate: () => new Date() } as any,
  lastSenderId: 'user123',
  buyerLastReadAt: { toDate: () => new Date() } as any,
  unreadCount: {
    buyer: 0,
    seller: 1
  },
  messageCount: 1,
  createdAt: { toDate: () => new Date() } as any,
  updatedAt: { toDate: () => new Date() } as any
}

const mockMessage: InquiryMessage = {
  id: 'message123',
  inquiryId: 'inquiry123',
  senderId: 'user123',
  senderName: '테스트유저',
  senderType: 'buyer',
  type: 'text',
  content: '안녕하세요',
  isRead: false,
  createdAt: { toDate: () => new Date() } as any,
  updatedAt: { toDate: () => new Date() } as any
}

describe('Inquiry System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createInquiry', () => {
    it('새 문의를 성공적으로 생성해야 함', async () => {
      // Mock 설정
      const { getCurrentUser } = require('@/lib/auth/server')
      const { getDoc, addDoc, updateDoc } = require('firebase/firestore')
      const { getMarketplaceItemDoc } = require('@/lib/firebase/collections')

      getCurrentUser.mockResolvedValue(mockUser)
      getMarketplaceItemDoc.mockReturnValue({ id: 'item123' })
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockItem
      })
      addDoc.mockResolvedValue({ id: 'inquiry123' })
      updateDoc.mockResolvedValue({})

      const inquiryData: CreateInquiryData = {
        itemId: 'item123',
        message: '이 상품의 상태가 어떤가요?'
      }

      const result = await createInquiry(inquiryData)

      expect(result.success).toBe(true)
      expect(result.inquiryId).toBe('inquiry123')
      expect(addDoc).toHaveBeenCalledTimes(2) // 문의 + 메시지
    })

    it('로그인하지 않은 경우 실패해야 함', async () => {
      const { getCurrentUser } = require('@/lib/auth/server')
      getCurrentUser.mockResolvedValue(null)

      const inquiryData: CreateInquiryData = {
        itemId: 'item123',
        message: '문의입니다'
      }

      const result = await createInquiry(inquiryData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('로그인이 필요합니다.')
    })

    it('본인 상품에 문의할 경우 실패해야 함', async () => {
      const { getCurrentUser } = require('@/lib/auth/server')
      const { getDoc } = require('firebase/firestore')
      const { getMarketplaceItemDoc } = require('@/lib/firebase/collections')

      getCurrentUser.mockResolvedValue(mockUser)
      getMarketplaceItemDoc.mockReturnValue({ id: 'item123' })
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          ...mockItem,
          metadata: { sellerId: 'user123' } // 본인 상품
        })
      })

      const inquiryData: CreateInquiryData = {
        itemId: 'item123',
        message: '문의입니다'
      }

      const result = await createInquiry(inquiryData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('본인의 상품에는 문의할 수 없습니다.')
    })

    it('빈 메시지로 문의할 경우 실패해야 함', async () => {
      const { getCurrentUser } = require('@/lib/auth/server')
      getCurrentUser.mockResolvedValue(mockUser)

      const inquiryData: CreateInquiryData = {
        itemId: 'item123',
        message: '   ' // 빈 메시지
      }

      const result = await createInquiry(inquiryData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('문의 내용을 입력해주세요.')
    })

    it('너무 긴 메시지로 문의할 경우 실패해야 함', async () => {
      const { getCurrentUser } = require('@/lib/auth/server')
      getCurrentUser.mockResolvedValue(mockUser)

      const inquiryData: CreateInquiryData = {
        itemId: 'item123',
        message: 'a'.repeat(1001) // 1000자 초과
      }

      const result = await createInquiry(inquiryData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('문의 내용은 1000자를 초과할 수 없습니다.')
    })
  })

  describe('sendInquiryMessage', () => {
    it('메시지를 성공적으로 전송해야 함', async () => {
      const { getCurrentUser } = require('@/lib/auth/server')
      const { getDoc, addDoc, updateDoc } = require('firebase/firestore')

      getCurrentUser.mockResolvedValue(mockUser)
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockInquiry
      })
      addDoc.mockResolvedValue({ id: 'message456' })
      updateDoc.mockResolvedValue({})

      const messageData: CreateInquiryMessageData = {
        inquiryId: 'inquiry123',
        type: 'text',
        content: '추가 질문이 있습니다'
      }

      const result = await sendInquiryMessage(messageData)

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('message456')
    })

    it('권한이 없는 사용자는 메시지를 보낼 수 없어야 함', async () => {
      const { getCurrentUser } = require('@/lib/auth/server')
      const { getDoc } = require('firebase/firestore')

      getCurrentUser.mockResolvedValue({ uid: 'other123' }) // 다른 사용자
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockInquiry
      })

      const messageData: CreateInquiryMessageData = {
        inquiryId: 'inquiry123',
        type: 'text',
        content: '메시지'
      }

      const result = await sendInquiryMessage(messageData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('메시지를 보낼 권한이 없습니다.')
    })

    it('완료된 문의에는 메시지를 보낼 수 없어야 함', async () => {
      const { getCurrentUser } = require('@/lib/auth/server')
      const { getDoc } = require('firebase/firestore')

      getCurrentUser.mockResolvedValue(mockUser)
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          ...mockInquiry,
          status: 'completed'
        })
      })

      const messageData: CreateInquiryMessageData = {
        inquiryId: 'inquiry123',
        type: 'text',
        content: '메시지'
      }

      const result = await sendInquiryMessage(messageData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('진행중인 문의가 아닙니다.')
    })
  })

  describe('getInquiry', () => {
    it('문의를 성공적으로 조회해야 함', async () => {
      const { getCurrentUser } = require('@/lib/auth/server')
      const { getDoc } = require('firebase/firestore')

      getCurrentUser.mockResolvedValue(mockUser)
      getDoc.mockResolvedValue({
        exists: () => true,
        id: 'inquiry123',
        data: () => mockInquiry
      })

      const result = await getInquiry('inquiry123')

      expect(result.success).toBe(true)
      expect(result.inquiry).toBeDefined()
      expect(result.inquiry?.id).toBe('inquiry123')
    })

    it('권한이 없는 사용자는 문의를 조회할 수 없어야 함', async () => {
      const { getCurrentUser } = require('@/lib/auth/server')
      const { getDoc } = require('firebase/firestore')

      getCurrentUser.mockResolvedValue({ uid: 'other123' })
      getDoc.mockResolvedValue({
        exists: () => true,
        id: 'inquiry123',
        data: () => mockInquiry
      })

      const result = await getInquiry('inquiry123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('문의를 볼 권한이 없습니다.')
    })
  })

  describe('updateInquiryStatus', () => {
    it('판매자는 문의 상태를 변경할 수 있어야 함', async () => {
      const { getCurrentUser } = require('@/lib/auth/server')
      const { getDoc, updateDoc } = require('firebase/firestore')

      getCurrentUser.mockResolvedValue({ uid: 'seller123' })
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockInquiry
      })
      updateDoc.mockResolvedValue({})

      const result = await updateInquiryStatus('inquiry123', 'completed')

      expect(result.success).toBe(true)
    })

    it('구매자는 문의 상태를 변경할 수 없어야 함', async () => {
      const { getCurrentUser } = require('@/lib/auth/server')
      const { getDoc } = require('firebase/firestore')

      getCurrentUser.mockResolvedValue(mockUser) // 구매자
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockInquiry
      })

      const result = await updateInquiryStatus('inquiry123', 'completed')

      expect(result.success).toBe(false)
      expect(result.error).toBe('문의 상태를 변경할 권한이 없습니다.')
    })

    it('양쪽 모두 신고할 수 있어야 함', async () => {
      const { getCurrentUser } = require('@/lib/auth/server')
      const { getDoc, updateDoc } = require('firebase/firestore')

      getCurrentUser.mockResolvedValue(mockUser) // 구매자
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockInquiry
      })
      updateDoc.mockResolvedValue({})

      const result = await updateInquiryStatus('inquiry123', 'reported', '부적절한 내용')

      expect(result.success).toBe(true)
    })
  })

  describe('markInquiryAsRead', () => {
    it('문의를 읽음 처리할 수 있어야 함', async () => {
      const { getCurrentUser } = require('@/lib/auth/server')
      const { getDoc, updateDoc, getDocs, writeBatch } = require('firebase/firestore')

      getCurrentUser.mockResolvedValue(mockUser)
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockInquiry
      })
      updateDoc.mockResolvedValue({})
      getDocs.mockResolvedValue({ docs: [], empty: true })
      writeBatch.mockReturnValue({
        update: jest.fn(),
        commit: jest.fn()
      })

      const result = await markInquiryAsRead('inquiry123')

      expect(result.success).toBe(true)
    })
  })

  describe('getInquiryMessages', () => {
    it('문의 메시지 목록을 조회할 수 있어야 함', async () => {
      const { getCurrentUser } = require('@/lib/auth/server')
      const { getDoc, getDocs } = require('firebase/firestore')

      getCurrentUser.mockResolvedValue(mockUser)

      // 문의 조회 Mock
      getDoc.mockResolvedValue({
        exists: () => true,
        id: 'inquiry123',
        data: () => mockInquiry
      })

      // 메시지 목록 Mock
      getDocs.mockResolvedValue({
        docs: [
          {
            id: 'message123',
            data: () => mockMessage
          }
        ]
      })

      const result = await getInquiryMessages('inquiry123')

      expect(result.success).toBe(true)
      expect(result.data?.data).toHaveLength(1)
      expect(result.data?.data[0].id).toBe('message123')
    })
  })

  describe('getUserInquiries', () => {
    it('사용자의 문의 목록을 조회할 수 있어야 함', async () => {
      const { getCurrentUser } = require('@/lib/auth/server')
      const { getDocs } = require('firebase/firestore')

      getCurrentUser.mockResolvedValue(mockUser)
      getDocs.mockResolvedValue({
        docs: [
          {
            id: 'inquiry123',
            data: () => mockInquiry
          }
        ]
      })

      const result = await getUserInquiries()

      expect(result.success).toBe(true)
      expect(result.data?.data).toHaveLength(1)
      expect(result.data?.data[0].id).toBe('inquiry123')
    })
  })
})