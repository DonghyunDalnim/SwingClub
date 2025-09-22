'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Typography } from '@/components/core'
import { Container, Section } from '@/components/layout'
import { theme } from '@/lib/theme'
import { useSignIn, useAuthError, useAuthLoading, useIsAuthenticated } from '@/lib/auth/hooks'

export default function LoginPage() {
  const router = useRouter()
  const { signInWithGoogle, signInWithKakao, signInWithNaver, clearError } = useSignIn()
  const error = useAuthError()
  const loading = useAuthLoading()
  const isAuthenticated = useIsAuthenticated()
  const [activeProvider, setActiveProvider] = useState<string | null>(null)

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/home')
    return null
  }

  const handleProviderSignIn = async (provider: 'google' | 'kakao' | 'naver') => {
    setActiveProvider(provider)
    clearError()

    try {
      switch (provider) {
        case 'google':
          await signInWithGoogle()
          break
        case 'kakao':
          await signInWithKakao()
          break
        case 'naver':
          await signInWithNaver()
          break
      }

      // Redirect to home on success
      router.push('/home')
    } catch (error) {
      console.error('Login error:', error)
      // Error is handled by the auth context
    } finally {
      setActiveProvider(null)
    }
  }

  const isProviderLoading = (provider: string) => loading && activeProvider === provider

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-6">
            <div className="mx-auto text-6xl space-x-4">
              <span>🕺</span>
              <span className="text-2xl">💫</span>
              <span>💃</span>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                SWING CONNECT
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                스윙댄스 커뮤니티
              </CardDescription>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">환영합니다!</h2>
              <p className="text-sm text-gray-600">
                스윙댄스 동호회에 참여하세요
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 text-sm bg-red-50 border border-red-200 rounded-md text-red-600 text-center">
                {error}
              </div>
            )}

            {/* Kakao Login */}
            <Button
              className="w-full h-12 text-black bg-yellow-300 hover:bg-yellow-400 border-0 disabled:opacity-50"
              size="lg"
              onClick={() => handleProviderSignIn('kakao')}
              disabled={loading}
            >
              {isProviderLoading('kakao') ? (
                <>
                  <span className="mr-2 animate-spin">⏳</span>
                  로그인 중...
                </>
              ) : (
                <>
                  <span className="mr-2">🟡</span>
                  카카오톡으로 로그인
                </>
              )}
            </Button>

            {/* Naver Login */}
            <Button
              className="w-full h-12 text-white bg-green-500 hover:bg-green-600 border-0 disabled:opacity-50"
              size="lg"
              onClick={() => handleProviderSignIn('naver')}
              disabled={loading}
            >
              {isProviderLoading('naver') ? (
                <>
                  <span className="mr-2 animate-spin">⏳</span>
                  로그인 중...
                </>
              ) : (
                <>
                  <span className="mr-2">🟢</span>
                  네이버로 로그인
                </>
              )}
            </Button>

            {/* Google Login */}
            <Button
              className="w-full h-12 text-white bg-blue-500 hover:bg-blue-600 border-0 disabled:opacity-50"
              size="lg"
              onClick={() => handleProviderSignIn('google')}
              disabled={loading}
            >
              {isProviderLoading('google') ? (
                <>
                  <span className="mr-2 animate-spin">⏳</span>
                  로그인 중...
                </>
              ) : (
                <>
                  <span className="mr-2">🔵</span>
                  구글로 로그인
                </>
              )}
            </Button>

            <div className="text-center text-xs text-gray-500 mt-6 space-x-2">
              <span>서비스 이용약관</span>
              <span>|</span>
              <span>개인정보처리방침</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}