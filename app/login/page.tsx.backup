'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSignIn, useAuthError, useAuthLoading, useIsAuthenticated } from '@/lib/auth/hooks'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signInWithGoogle, signInWithKakao, signInWithNaver, clearError } = useSignIn()
  const error = useAuthError()
  const loading = useAuthLoading()
  const isAuthenticated = useIsAuthenticated()
  const [activeProvider, setActiveProvider] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = searchParams?.get('redirectTo')
      const targetPath = redirectTo || '/home'
      router.push(targetPath)
    }
  }, [isAuthenticated, router, searchParams])

  const handleProviderSignIn = async (provider: 'google' | 'kakao' | 'naver') => {
    setActiveProvider(provider)
    clearError()

    try {
      switch (provider) {
        case 'google':
          await signInWithGoogle()
          const redirectTo = searchParams?.get('redirectTo')
          const targetPath = redirectTo || '/home'
          router.push(targetPath)
          break
        case 'kakao':
          await signInWithKakao()
          setTimeout(() => clearError(), 3000)
          break
        case 'naver':
          await signInWithNaver()
          setTimeout(() => clearError(), 3000)
          break
      }
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setActiveProvider(null)
    }
  }

  const isProviderLoading = (provider: string) => loading && activeProvider === provider

  return (
    <div className="login-page">
      {/* 배경 글로우 효과 */}
      <div className="background-glow"></div>

      <div className="login-container">
        {/* 로그인 카드 */}
        <div className="login-card">
          {/* 카드 헤더 */}
          <div className="card-header">
            {/* 로고 아이콘 */}
            <div className="logo-container">
              <span className="logo-emoji">🎺</span>
            </div>

            {/* 타이틀 */}
            <h1 className="title">SWING CONNECT</h1>
            <p className="subtitle">모든 스윙댄스 정보를 한 곳에서</p>

            {/* 환영 메시지 */}
            <div className="welcome-section">
              <h2 className="welcome-title">환영합니다!</h2>
              <p className="welcome-text">스윙댄스 커뮤니티에 참여하세요</p>
            </div>
          </div>

          {/* 카드 콘텐츠 */}
          <div className="card-content">
            {/* 에러 메시지 */}
            {error && (
              <div className="error-message">
                <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* 소셜 로그인 버튼들 */}
            <div className="login-buttons">
              {/* 구글 로그인 */}
              <button
                className="login-button google"
                onClick={() => handleProviderSignIn('google')}
                disabled={loading}
              >
                {isProviderLoading('google') ? (
                  <>
                    <span className="spinner">⏳</span>
                    <span>로그인 중...</span>
                  </>
                ) : (
                  <>
                    <span className="button-icon">🔵</span>
                    <span>구글로 로그인</span>
                  </>
                )}
              </button>

              {/* 카카오 로그인 */}
              <button
                className="login-button kakao"
                onClick={() => handleProviderSignIn('kakao')}
                disabled={loading}
              >
                {isProviderLoading('kakao') ? (
                  <>
                    <span className="spinner">⏳</span>
                    <span>로그인 중...</span>
                  </>
                ) : (
                  <>
                    <span className="button-icon">🟡</span>
                    <span>카카오톡으로 로그인</span>
                  </>
                )}
              </button>

              {/* 네이버 로그인 */}
              <button
                className="login-button naver"
                onClick={() => handleProviderSignIn('naver')}
                disabled={loading}
              >
                {isProviderLoading('naver') ? (
                  <>
                    <span className="spinner">⏳</span>
                    <span>로그인 중...</span>
                  </>
                ) : (
                  <>
                    <span className="button-icon">🟢</span>
                    <span>네이버로 로그인</span>
                  </>
                )}
              </button>
            </div>

            {/* 푸터 */}
            <div className="card-footer">
              <a href="/terms" className="footer-link">서비스 이용약관</a>
              <span className="footer-divider">|</span>
              <a href="/privacy" className="footer-link">개인정보처리방침</a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--warm-gray);
          overflow: hidden;
        }

        .background-glow {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 30% 20%, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 70% 80%, rgba(118, 75, 162, 0.15) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        .login-container {
          position: relative;
          width: 100%;
          max-width: 480px;
          padding: var(--space-xl);
          z-index: 1;
          animation: fadeInUp 0.6s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(30px) saturate(180%);
          border: 2px solid rgba(255, 255, 255, 0.9);
          border-radius: 24px;
          padding: var(--space-2xl);
          box-shadow:
            0 10px 40px rgba(31, 38, 135, 0.12),
            inset 0 2px 4px rgba(255, 255, 255, 0.9);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .login-card:hover {
          transform: translateY(-8px);
          box-shadow:
            0 20px 60px rgba(102, 126, 234, 0.25),
            inset 0 2px 4px rgba(255, 255, 255, 1);
        }

        .card-header {
          text-align: center;
          margin-bottom: var(--space-2xl);
        }

        .logo-container {
          margin-bottom: var(--space-lg);
        }

        .logo-emoji {
          font-size: 80px;
          display: inline-block;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .title {
          font-size: 32px;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: var(--space-sm);
          letter-spacing: 1px;
        }

        .subtitle {
          font-size: 15px;
          color: var(--gray-600);
          font-weight: 500;
          margin-bottom: var(--space-xl);
        }

        .welcome-section {
          padding: var(--space-lg);
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
          border-radius: 16px;
          border: 1.5px solid rgba(102, 126, 234, 0.2);
        }

        .welcome-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-xs);
        }

        .welcome-text {
          font-size: 14px;
          color: var(--gray-600);
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: rgba(239, 68, 68, 0.1);
          border: 1.5px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #dc2626;
          font-size: 14px;
          font-weight: 600;
          animation: shake 0.5s;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .error-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .login-buttons {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .login-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          width: 100%;
          height: 56px;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .login-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }

        .login-button:hover::before {
          left: 100%;
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-button:not(:disabled):hover {
          transform: translateY(-3px);
        }

        .login-button:not(:disabled):active {
          transform: translateY(-1px);
        }

        .login-button.google {
          background: linear-gradient(135deg, #4285f4 0%, #357ae8 100%);
          color: white;
          box-shadow: 0 4px 16px rgba(66, 133, 244, 0.3);
        }

        .login-button.google:hover {
          box-shadow: 0 8px 24px rgba(66, 133, 244, 0.5);
        }

        .login-button.kakao {
          background: #fee500;
          color: #000000;
          box-shadow: 0 4px 16px rgba(254, 229, 0, 0.3);
        }

        .login-button.kakao:hover {
          background: #fdd835;
          box-shadow: 0 8px 24px rgba(254, 229, 0, 0.5);
        }

        .login-button.naver {
          background: #03c75a;
          color: white;
          box-shadow: 0 4px 16px rgba(3, 199, 90, 0.3);
        }

        .login-button.naver:hover {
          background: #02b351;
          box-shadow: 0 8px 24px rgba(3, 199, 90, 0.5);
        }

        .button-icon {
          font-size: 24px;
        }

        .spinner {
          display: inline-block;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          padding-top: var(--space-lg);
          border-top: 1.5px solid rgba(200, 200, 200, 0.2);
        }

        .footer-link {
          font-size: 12px;
          color: var(--gray-500);
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-link:hover {
          color: #667eea;
        }

        .footer-divider {
          font-size: 12px;
          color: var(--gray-400);
        }

        @media (max-width: 768px) {
          .login-container {
            padding: var(--space-lg);
          }

          .login-card {
            padding: var(--space-xl);
          }

          .logo-emoji {
            font-size: 60px;
          }

          .title {
            font-size: 28px;
          }

          .login-button {
            height: 52px;
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}