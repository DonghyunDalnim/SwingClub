'use client'

import React, { Component, ReactNode } from 'react'
import { Button, Card, CardContent, Typography } from '@/components/core'
import { Container, Section } from '@/components/layout'
import { theme } from '@/lib/theme'
import { logError, AppError } from '@/lib/error'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error with context
    const appError = new AppError(
      `React component error: ${error.message}`,
      'REACT_ERROR',
      {
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorBoundary: this.constructor.name
      },
      'high'
    )

    logError(
      appError,
      {
        component: 'ErrorBoundary',
        action: 'componentDidCatch'
      },
      '화면을 표시하는 중 오류가 발생했습니다.'
    )

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Container>
          <Section spacing="lg">
            <Card>
              <CardContent className="text-center p-8">
                <div className="mb-6">
                  <AlertTriangle
                    size={48}
                    style={{ color: theme.colors.accent.red }}
                    className="mx-auto mb-4"
                  />
                  <Typography variant="h3" className="mb-2">
                    문제가 발생했습니다
                  </Typography>
                  <Typography variant="body" className="text-gray-600 mb-6">
                    화면을 표시하는 중 오류가 발생했습니다.<br />
                    잠시 후 다시 시도해주세요.
                  </Typography>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="primary"
                    onClick={this.handleRetry}
                    className="w-full sm:w-auto"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    다시 시도
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={this.handleReload}
                    className="w-full sm:w-auto ml-0 sm:ml-3"
                  >
                    페이지 새로고침
                  </Button>
                </div>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-6 text-left">
                    <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                      개발자 정보 (개발 모드)
                    </summary>
                    <div className="bg-gray-100 p-4 rounded text-xs font-mono overflow-auto">
                      <div className="mb-2">
                        <strong>Error ID:</strong> {this.state.errorId}
                      </div>
                      <div className="mb-2">
                        <strong>Message:</strong> {this.state.error.message}
                      </div>
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    </div>
                  </details>
                )}
              </CardContent>
            </Card>
          </Section>
        </Container>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary