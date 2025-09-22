/**
 * Centralized Error Handling System for SwingClub
 */

export class AppError extends Error {
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

export interface ErrorContext {
  userId?: string
  component?: string
  action?: string
  data?: Record<string, any>
  timestamp?: Date
}

export interface ErrorLogEntry {
  error: Error | AppError
  context: ErrorContext
  userMessage: string
  timestamp: Date
}

class ErrorManager {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private errorQueue: ErrorLogEntry[] = []

  /**
   * Log an error with context and user-friendly message
   */
  logError(
    error: Error | AppError,
    context: ErrorContext = {},
    userMessage: string = '문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
  ): void {
    const logEntry: ErrorLogEntry = {
      error,
      context: {
        ...context,
        timestamp: new Date()
      },
      userMessage,
      timestamp: new Date()
    }

    this.errorQueue.push(logEntry)

    // Log to console in development
    if (this.isDevelopment) {
      console.group(`🚨 AppError: ${error.message}`)
      console.error('Error:', error)
      console.log('Context:', context)
      console.log('User Message:', userMessage)
      if (error instanceof AppError) {
        console.log('Code:', error.code)
        console.log('Severity:', error.severity)
        console.log('Error Context:', error.context)
      }
      console.groupEnd()
    }

    // In production, you would send to error tracking service
    // this.sendToErrorService(logEntry)
  }

  /**
   * Create and log an AppError
   */
  createError(
    message: string,
    code: string,
    context?: Record<string, any>,
    severity?: 'low' | 'medium' | 'high' | 'critical',
    userMessage?: string
  ): AppError {
    const error = new AppError(message, code, context, severity)
    this.logError(error, { component: 'ErrorManager' }, userMessage)
    return error
  }

  /**
   * Handle Firebase errors with specific context
   */
  handleFirebaseError(
    error: any,
    operation: string,
    context: ErrorContext = {}
  ): AppError {
    const firebaseCode = error?.code || 'unknown'
    const firebaseMessage = error?.message || 'Firebase operation failed'

    let userMessage = '서버 오류가 발생했습니다.'
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'

    // Map Firebase error codes to user-friendly messages
    switch (firebaseCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        userMessage = '로그인 정보가 올바르지 않습니다.'
        severity = 'low'
        break
      case 'auth/too-many-requests':
        userMessage = '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.'
        severity = 'medium'
        break
      case 'permission-denied':
        userMessage = '접근 권한이 없습니다.'
        severity = 'high'
        break
      case 'unavailable':
        userMessage = '서비스가 일시적으로 사용할 수 없습니다.'
        severity = 'critical'
        break
    }

    const appError = new AppError(
      `Firebase ${operation} failed: ${firebaseMessage}`,
      `FIREBASE_${operation.toUpperCase()}_ERROR`,
      { firebaseCode, operation, ...context },
      severity
    )

    this.logError(appError, context, userMessage)
    return appError
  }

  /**
   * Handle network/API errors
   */
  handleNetworkError(
    error: any,
    endpoint: string,
    context: ErrorContext = {}
  ): AppError {
    const status = error?.status || error?.response?.status || 0
    const message = error?.message || 'Network request failed'

    let userMessage = '네트워크 오류가 발생했습니다.'
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'

    if (status >= 500) {
      userMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      severity = 'high'
    } else if (status >= 400) {
      userMessage = '요청을 처리할 수 없습니다.'
      severity = 'medium'
    } else if (status === 0) {
      userMessage = '인터넷 연결을 확인해주세요.'
      severity = 'medium'
    }

    const appError = new AppError(
      `Network request to ${endpoint} failed: ${message}`,
      'NETWORK_ERROR',
      { status, endpoint, ...context },
      severity
    )

    this.logError(appError, context, userMessage)
    return appError
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit: number = 10): ErrorLogEntry[] {
    return this.errorQueue.slice(-limit)
  }

  /**
   * Clear error queue
   */
  clearErrors(): void {
    this.errorQueue = []
  }
}

// Singleton instance
export const errorManager = new ErrorManager()

// Convenience functions
export const logError = errorManager.logError.bind(errorManager)
export const createError = errorManager.createError.bind(errorManager)
export const handleFirebaseError = errorManager.handleFirebaseError.bind(errorManager)
export const handleNetworkError = errorManager.handleNetworkError.bind(errorManager)