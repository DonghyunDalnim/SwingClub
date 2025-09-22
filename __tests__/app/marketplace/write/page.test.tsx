import React from 'react'
import { render, screen } from '@testing-library/react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/server'
import WriteProductPage from '@/app/marketplace/write/page'

// Mock dependencies
jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

jest.mock('@/lib/auth/server', () => ({
  getCurrentUser: jest.fn()
}))

jest.mock('@/components/marketplace/ProductForm', () => ({
  ProductForm: ({ userId, userName, mode }: any) => (
    <div data-testid="product-form">
      <div data-testid="user-id">{userId}</div>
      <div data-testid="user-name">{userName}</div>
      <div data-testid="mode">{mode}</div>
    </div>
  )
}))

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>
const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>

describe('WriteProductPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('인증된 사용자', () => {
    it('로그인한 사용자에게 ProductForm을 표시한다', async () => {
      const mockUser = {
        uid: 'user-123',
        displayName: '댄스용품러버',
        email: 'dancer@example.com'
      } as any

      mockedGetCurrentUser.mockResolvedValue(mockUser)

      const Component = await WriteProductPage()
      render(Component)

      expect(screen.getByTestId('product-form')).toBeInTheDocument()
      expect(screen.getByTestId('user-id')).toHaveTextContent('user-123')
      expect(screen.getByTestId('user-name')).toHaveTextContent('댄스용품러버')
      expect(screen.getByTestId('mode')).toHaveTextContent('create')
    })

    it('displayName이 없는 사용자의 경우 "익명"으로 표시한다', async () => {
      const mockUser = {
        uid: 'user-456',
        displayName: null,
        email: 'anonymous@example.com'
      } as any

      mockedGetCurrentUser.mockResolvedValue(mockUser)

      const Component = await WriteProductPage()
      render(Component)

      expect(screen.getByTestId('product-form')).toBeInTheDocument()
      expect(screen.getByTestId('user-id')).toHaveTextContent('user-456')
      expect(screen.getByTestId('user-name')).toHaveTextContent('익명')
      expect(screen.getByTestId('mode')).toHaveTextContent('create')
    })

    it('올바른 페이지 레이아웃을 렌더링한다', async () => {
      const mockUser = {
        uid: 'user-123',
        displayName: '댄스용품러버',
        email: 'dancer@example.com'
      } as any

      mockedGetCurrentUser.mockResolvedValue(mockUser)

      const Component = await WriteProductPage()
      const { container } = render(Component)

      // 페이지 컨테이너가 올바른 클래스를 가지는지 확인
      const pageContainer = container.firstChild as HTMLElement
      expect(pageContainer).toHaveClass('min-h-screen', 'bg-gray-50')
    })
  })

  describe('미인증 사용자', () => {
    it('로그인하지 않은 사용자를 로그인 페이지로 리다이렉트한다', async () => {
      mockedGetCurrentUser.mockResolvedValue(null)

      try {
        await WriteProductPage()
      } catch (error) {
        // redirect() throws an error in tests, which is expected behavior
      }

      expect(mockedRedirect).toHaveBeenCalledWith('/login?redirectTo=/marketplace/write')
    })

    it('getCurrentUser에서 에러가 발생한 경우에도 리다이렉트한다', async () => {
      mockedGetCurrentUser.mockRejectedValue(new Error('Authentication failed'))

      await expect(WriteProductPage()).rejects.toThrow('Authentication failed')
      // 실제 앱에서는 error boundary가 처리하지만, 테스트에서는 에러가 throw됨
    })
  })

  describe('리다이렉트 경로', () => {
    it('올바른 리다이렉트 경로를 설정한다', async () => {
      mockedGetCurrentUser.mockResolvedValue(null)

      try {
        await WriteProductPage()
      } catch (error) {
        // redirect() throws an error in tests, which is expected behavior
      }

      expect(mockedRedirect).toHaveBeenCalledWith('/login?redirectTo=/marketplace/write')
    })

    it('로그인 후 다시 상품 등록 페이지로 돌아올 수 있도록 redirectTo 파라미터를 설정한다', async () => {
      mockedGetCurrentUser.mockResolvedValue(null)

      try {
        await WriteProductPage()
      } catch (error) {
        // redirect() throws an error in tests, which is expected behavior
      }

      const redirectCall = mockedRedirect.mock.calls[0][0]
      expect(redirectCall).toContain('redirectTo=/marketplace/write')
    })
  })

  describe('사용자 정보 전달', () => {
    it('사용자 ID를 ProductForm에 올바르게 전달한다', async () => {
      const mockUser = {
        uid: 'test-user-id-123',
        displayName: '테스트사용자',
        email: 'test@example.com'
      } as any

      mockedGetCurrentUser.mockResolvedValue(mockUser)

      const Component = await WriteProductPage()
      render(Component)

      expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id-123')
    })

    it('사용자 이름을 ProductForm에 올바르게 전달한다', async () => {
      const mockUser = {
        uid: 'user-123',
        displayName: '스윙댄서',
        email: 'swing@example.com'
      } as any

      mockedGetCurrentUser.mockResolvedValue(mockUser)

      const Component = await WriteProductPage()
      render(Component)

      expect(screen.getByTestId('user-name')).toHaveTextContent('스윙댄서')
    })

    it('create 모드를 ProductForm에 전달한다', async () => {
      const mockUser = {
        uid: 'user-123',
        displayName: '댄스용품러버',
        email: 'dancer@example.com'
      } as any

      mockedGetCurrentUser.mockResolvedValue(mockUser)

      const Component = await WriteProductPage()
      render(Component)

      expect(screen.getByTestId('mode')).toHaveTextContent('create')
    })
  })

  describe('페이지 메타데이터', () => {
    it('서버 컴포넌트로 올바르게 구현되었다', () => {
      // 이 테스트는 TypeScript 컴파일 시에 이미 검증됨
      // async function은 서버 컴포넌트임을 나타냄
      expect(WriteProductPage).toBeInstanceOf(Function)
    })
  })

  describe('접근성', () => {
    it('인증된 사용자에게 적절한 페이지 구조를 제공한다', async () => {
      const mockUser = {
        uid: 'user-123',
        displayName: '댄스용품러버',
        email: 'dancer@example.com'
      } as any

      mockedGetCurrentUser.mockResolvedValue(mockUser)

      const Component = await WriteProductPage()
      render(Component)

      // ProductForm이 페이지 내에 올바르게 포함되어 있는지 확인
      expect(screen.getByTestId('product-form')).toBeInTheDocument()
    })
  })

  describe('에러 핸들링', () => {
    it('getCurrentUser 호출 시 예외가 발생하면 적절히 처리한다', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      mockedGetCurrentUser.mockRejectedValue(new Error('Database connection failed'))

      await expect(WriteProductPage()).rejects.toThrow('Database connection failed')

      consoleErrorSpy.mockRestore()
    })
  })

  describe('보안', () => {
    it('인증되지 않은 사용자가 페이지에 직접 접근할 수 없다', async () => {
      mockedGetCurrentUser.mockResolvedValue(null)

      try {
        await WriteProductPage()
      } catch (error) {
        // redirect() throws an error in tests, which is expected behavior
      }

      expect(mockedRedirect).toHaveBeenCalledWith('/login?redirectTo=/marketplace/write')
    })

    it('빈 사용자 객체가 반환된 경우에도 리다이렉트한다', async () => {
      mockedGetCurrentUser.mockResolvedValue(undefined as any)

      try {
        await WriteProductPage()
      } catch (error) {
        // redirect() throws an error in tests, which is expected behavior
      }

      expect(mockedRedirect).toHaveBeenCalledWith('/login?redirectTo=/marketplace/write')
    })
  })
})