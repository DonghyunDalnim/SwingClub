/**
 * useErrorHandler Hook Tests
 */

import { renderHook, act } from '@testing-library/react'
import { toast } from 'react-hot-toast'

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn()
  }
}))

// Mock error handling utilities
const mockLogError = jest.fn()
const mockHandleFirebaseError = jest.fn()
const mockHandleNetworkError = jest.fn()

jest.mock('@/lib/error', () => ({
  logError: mockLogError,
  handleFirebaseError: mockHandleFirebaseError,
  handleNetworkError: mockHandleNetworkError,
  AppError: class MockAppError extends Error {
    constructor(
      message: string,
      public code: string,
      public context?: Record<string, any>,
      public severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
    ) {
      super(message)
      this.name = 'AppError'
    }
  }
}))

import { useErrorHandler, type UseErrorHandlerOptions } from '@/lib/hooks/useErrorHandler'
import { AppError } from '@/lib/error'

const mockToast = toast as jest.Mocked<typeof toast>

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should return handler functions', () => {
      const { result } = renderHook(() => useErrorHandler())

      expect(result.current).toHaveProperty('handleError')
      expect(result.current).toHaveProperty('handleAsyncError')
      expect(result.current).toHaveProperty('handleFirebaseOperation')
      expect(typeof result.current.handleError).toBe('function')
      expect(typeof result.current.handleAsyncError).toBe('function')
      expect(typeof result.current.handleFirebaseOperation).toBe('function')
    })

    it('should use default options when none provided', () => {
      const { result } = renderHook(() => useErrorHandler())
      const testError = new Error('Test error')

      act(() => {
        result.current.handleError(testError)
      })

      expect(mockToast.error).toHaveBeenCalledWith('문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
    })

    it('should use custom options when provided', () => {
      const options: UseErrorHandlerOptions = {
        component: 'TestComponent',
        showToast: false,
        defaultMessage: 'Custom error message'
      }

      const { result } = renderHook(() => useErrorHandler(options))
      const testError = new Error('Test error')

      act(() => {
        result.current.handleError(testError)
      })

      expect(mockToast.error).not.toHaveBeenCalled()
    })
  })

  describe('handleError', () => {
    it('should handle AppError instances correctly', () => {
      const { result } = renderHook(() => useErrorHandler())
      const appError = new AppError('Test error', 'TEST_ERROR', {}, 'high')

      act(() => {
        const returnedError = result.current.handleError(appError)
        expect(returnedError).toBe(appError)
      })

      expect(mockLogError).toHaveBeenCalledWith(
        appError,
        { component: 'UnknownComponent' },
        '문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
      )
      expect(mockToast.error).toHaveBeenCalledWith('문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
    })

    it('should handle Firebase errors', () => {
      const mockFirebaseAppError = new AppError('Firebase error', 'FIREBASE_AUTH_ERROR')
      mockHandleFirebaseError.mockReturnValue(mockFirebaseAppError)

      const { result } = renderHook(() => useErrorHandler())
      const firebaseError = { code: 'auth/popup-blocked', message: 'Popup blocked' }

      act(() => {
        result.current.handleError(firebaseError, { action: 'signIn' })
      })

      expect(mockHandleFirebaseError).toHaveBeenCalledWith(
        firebaseError,
        'signIn',
        { component: 'UnknownComponent', action: 'signIn' }
      )
      expect(mockToast.error).toHaveBeenCalledWith('로그인 중 오류가 발생했습니다.')
    })

    it('should handle network errors', () => {
      const mockNetworkAppError = new AppError('Network error', 'NETWORK_ERROR')
      mockHandleNetworkError.mockReturnValue(mockNetworkAppError)

      const { result } = renderHook(() => useErrorHandler())
      const networkError = { status: 500, message: 'Internal server error' }

      act(() => {
        result.current.handleError(networkError, { data: { endpoint: '/api/test' } })
      })

      expect(mockHandleNetworkError).toHaveBeenCalledWith(
        networkError,
        '/api/test',
        { component: 'UnknownComponent', data: { endpoint: '/api/test' } }
      )
      expect(mockToast.error).toHaveBeenCalledWith('네트워크 연결을 확인해주세요.')
    })

    it('should handle generic errors', () => {
      const { result } = renderHook(() => useErrorHandler())
      const genericError = new Error('Generic error')

      act(() => {
        const returnedError = result.current.handleError(genericError)
        expect(returnedError).toBeInstanceOf(AppError)
        expect(returnedError.code).toBe('GENERIC_ERROR')
        expect(returnedError.message).toBe('Generic error')
      })

      expect(mockLogError).toHaveBeenCalled()
      expect(mockToast.error).toHaveBeenCalledWith('문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
    })

    it('should handle errors with custom message', () => {
      const { result } = renderHook(() => useErrorHandler())
      const testError = new Error('Test error')
      const customMessage = 'Custom error message'

      act(() => {
        result.current.handleError(testError, {}, customMessage)
      })

      expect(mockToast.error).toHaveBeenCalledWith(customMessage)
    })

    it('should include component context', () => {
      const { result } = renderHook(() => useErrorHandler({ component: 'TestComponent' }))
      const testError = new Error('Test error')

      act(() => {
        result.current.handleError(testError)
      })

      expect(mockLogError).toHaveBeenCalledWith(
        expect.any(AppError),
        { component: 'TestComponent' },
        expect.any(String)
      )
    })
  })

  describe('handleAsyncError', () => {
    it('should handle successful async operations', async () => {
      const { result } = renderHook(() => useErrorHandler())
      const mockOperation = jest.fn().mockResolvedValue('success')

      let operationResult: any
      await act(async () => {
        operationResult = await result.current.handleAsyncError(mockOperation)
      })

      expect(operationResult).toEqual({
        data: 'success',
        error: null
      })
      expect(mockToast.error).not.toHaveBeenCalled()
    })

    it('should handle failed async operations', async () => {
      const { result } = renderHook(() => useErrorHandler())
      const testError = new Error('Async error')
      const mockOperation = jest.fn().mockRejectedValue(testError)

      let operationResult: any
      await act(async () => {
        operationResult = await result.current.handleAsyncError(mockOperation)
      })

      expect(operationResult.data).toBeNull()
      expect(operationResult.error).toBeInstanceOf(AppError)
      expect(mockToast.error).toHaveBeenCalled()
    })

    it('should handle async operation with custom message', async () => {
      const { result } = renderHook(() => useErrorHandler())
      const testError = new Error('Async error')
      const mockOperation = jest.fn().mockRejectedValue(testError)
      const customMessage = 'Custom async error message'

      await act(async () => {
        await result.current.handleAsyncError(mockOperation, {}, customMessage)
      })

      expect(mockToast.error).toHaveBeenCalledWith(customMessage)
    })
  })

  describe('handleFirebaseOperation', () => {
    it('should handle successful Firebase operations', async () => {
      const { result } = renderHook(() => useErrorHandler())
      const mockOperation = jest.fn().mockResolvedValue('firebase success')

      let operationResult: any
      await act(async () => {
        operationResult = await result.current.handleFirebaseOperation(
          mockOperation,
          'testOperation'
        )
      })

      expect(operationResult).toEqual({
        data: 'firebase success',
        error: null
      })
      expect(mockHandleFirebaseError).not.toHaveBeenCalled()
      expect(mockToast.error).not.toHaveBeenCalled()
    })

    it('should handle failed Firebase operations', async () => {
      const mockFirebaseAppError = new AppError('Firebase operation failed', 'FIREBASE_FIRESTORE_ERROR')
      mockHandleFirebaseError.mockReturnValue(mockFirebaseAppError)

      const { result } = renderHook(() => useErrorHandler({ component: 'FirebaseComponent' }))
      const firebaseError = { code: 'firestore/permission-denied' }
      const mockOperation = jest.fn().mockRejectedValue(firebaseError)

      let operationResult: any
      await act(async () => {
        operationResult = await result.current.handleFirebaseOperation(
          mockOperation,
          'testOperation',
          { data: { collection: 'users' } }
        )
      })

      expect(operationResult.data).toBeNull()
      expect(operationResult.error).toBe(mockFirebaseAppError)
      expect(mockHandleFirebaseError).toHaveBeenCalledWith(
        firebaseError,
        'testOperation',
        { component: 'FirebaseComponent', data: { collection: 'users' } }
      )
      expect(mockToast.error).toHaveBeenCalledWith('데이터를 처리하는 중 오류가 발생했습니다.')
    })

    it('should respect showToast option', async () => {
      const mockFirebaseAppError = new AppError('Firebase operation failed', 'FIREBASE_STORAGE_ERROR')
      mockHandleFirebaseError.mockReturnValue(mockFirebaseAppError)

      const { result } = renderHook(() => useErrorHandler({ showToast: false }))
      const firebaseError = { code: 'storage/unauthorized' }
      const mockOperation = jest.fn().mockRejectedValue(firebaseError)

      await act(async () => {
        await result.current.handleFirebaseOperation(mockOperation, 'testOperation')
      })

      expect(mockToast.error).not.toHaveBeenCalled()
    })
  })

  describe('Error Message Mapping', () => {
    it('should map known error codes to user-friendly messages', () => {
      const errorCodes = [
        { code: 'FIREBASE_AUTH_ERROR', message: '로그인 중 오류가 발생했습니다.' },
        { code: 'FIREBASE_FIRESTORE_ERROR', message: '데이터를 처리하는 중 오류가 발생했습니다.' },
        { code: 'FIREBASE_STORAGE_ERROR', message: '파일 업로드 중 오류가 발생했습니다.' },
        { code: 'NETWORK_ERROR', message: '네트워크 연결을 확인해주세요.' },
        { code: 'VALIDATION_ERROR', message: '입력 정보를 확인해주세요.' },
        { code: 'PERMISSION_ERROR', message: '접근 권한이 없습니다.' },
        { code: 'REACT_ERROR', message: '화면을 표시하는 중 오류가 발생했습니다.' }
      ]

      errorCodes.forEach(({ code, message }) => {
        const mockAppError = new AppError('Test error', code)
        mockHandleFirebaseError.mockReturnValue(mockAppError)

        const { result } = renderHook(() => useErrorHandler())
        const testError = { code: 'test-firebase-code' }

        act(() => {
          result.current.handleError(testError, { action: 'test' })
        })

        expect(mockToast.error).toHaveBeenCalledWith(message)
        jest.clearAllMocks()
      })
    })

    it('should use fallback message for unknown error codes', () => {
      const mockAppError = new AppError('Unknown error', 'UNKNOWN_ERROR_CODE')
      mockHandleFirebaseError.mockReturnValue(mockAppError)

      const { result } = renderHook(() => useErrorHandler())
      const testError = { code: 'unknown-code' }

      act(() => {
        result.current.handleError(testError, { action: 'test' })
      })

      expect(mockToast.error).toHaveBeenCalledWith('문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
    })
  })

  describe('Integration', () => {
    it('should work correctly with all options combined', async () => {
      const options: UseErrorHandlerOptions = {
        component: 'IntegrationTestComponent',
        showToast: true,
        defaultMessage: 'Integration test error'
      }

      const { result } = renderHook(() => useErrorHandler(options))

      // Test handleError
      const testError = new Error('Integration error')
      act(() => {
        result.current.handleError(testError, { userId: 'test-user' }, 'Custom integration message')
      })

      expect(mockLogError).toHaveBeenCalledWith(
        expect.any(AppError),
        { component: 'IntegrationTestComponent', userId: 'test-user' },
        'Custom integration message'
      )
      expect(mockToast.error).toHaveBeenCalledWith('Custom integration message')

      jest.clearAllMocks()

      // Test handleAsyncError
      const mockAsyncOperation = jest.fn().mockResolvedValue('async success')
      let asyncResult: any

      await act(async () => {
        asyncResult = await result.current.handleAsyncError(mockAsyncOperation)
      })

      expect(asyncResult).toEqual({ data: 'async success', error: null })

      jest.clearAllMocks()

      // Test handleFirebaseOperation
      const mockFirebaseOperation = jest.fn().mockResolvedValue('firebase success')
      let firebaseResult: any

      await act(async () => {
        firebaseResult = await result.current.handleFirebaseOperation(
          mockFirebaseOperation,
          'integrationTest'
        )
      })

      expect(firebaseResult).toEqual({ data: 'firebase success', error: null })
    })
  })
})