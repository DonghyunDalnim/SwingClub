'use client'

import { useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { logError, AppError, ErrorContext, handleFirebaseError, handleNetworkError } from '@/lib/error'

export interface UseErrorHandlerOptions {
  component?: string
  showToast?: boolean
  defaultMessage?: string
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    component = 'UnknownComponent',
    showToast = true,
    defaultMessage = '문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
  } = options

  const handleError = useCallback((
    error: Error | AppError | any,
    context: ErrorContext = {},
    customMessage?: string
  ) => {
    const finalContext = {
      component,
      ...context
    }

    let appError: AppError
    let userMessage = customMessage || defaultMessage

    if (error instanceof AppError) {
      appError = error
      logError(appError, finalContext, userMessage)
    } else if (error?.code && typeof error.code === 'string') {
      // Likely a Firebase error
      appError = handleFirebaseError(error, context.action || 'unknown', finalContext)
      userMessage = getUserMessageFromAppError(appError)
    } else if (error?.status || error?.response?.status) {
      // Likely a network error
      appError = handleNetworkError(error, context.data?.endpoint || 'unknown', finalContext)
      userMessage = getUserMessageFromAppError(appError)
    } else {
      // Generic error
      appError = new AppError(
        error?.message || 'Unknown error occurred',
        'GENERIC_ERROR',
        finalContext,
        'medium'
      )
      logError(appError, finalContext, userMessage)
    }

    // Show toast notification if enabled
    if (showToast) {
      toast.error(userMessage)
    }

    return appError
  }, [component, showToast, defaultMessage])

  const handleAsyncError = useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    context: ErrorContext = {},
    customMessage?: string
  ): Promise<{ data: T | null; error: AppError | null }> => {
    try {
      const data = await asyncOperation()
      return { data, error: null }
    } catch (error) {
      const appError = handleError(error, context, customMessage)
      return { data: null, error: appError }
    }
  }, [handleError])

  const handleFirebaseOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string,
    context: ErrorContext = {}
  ): Promise<{ data: T | null; error: AppError | null }> => {
    try {
      const data = await operation()
      return { data, error: null }
    } catch (error) {
      const appError = handleFirebaseError(error, operationName, {
        component,
        ...context
      })

      if (showToast) {
        toast.error(getUserMessageFromAppError(appError))
      }

      return { data: null, error: appError }
    }
  }, [component, showToast, handleError])

  return {
    handleError,
    handleAsyncError,
    handleFirebaseOperation
  }
}

// Helper function to extract user message from AppError
function getUserMessageFromAppError(error: AppError): string {
  // Map error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    'FIREBASE_AUTH_ERROR': '로그인 중 오류가 발생했습니다.',
    'FIREBASE_FIRESTORE_ERROR': '데이터를 처리하는 중 오류가 발생했습니다.',
    'FIREBASE_STORAGE_ERROR': '파일 업로드 중 오류가 발생했습니다.',
    'NETWORK_ERROR': '네트워크 연결을 확인해주세요.',
    'VALIDATION_ERROR': '입력 정보를 확인해주세요.',
    'PERMISSION_ERROR': '접근 권한이 없습니다.',
    'REACT_ERROR': '화면을 표시하는 중 오류가 발생했습니다.'
  }

  return errorMessages[error.code] || '문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
}