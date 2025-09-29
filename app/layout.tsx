import type { Metadata } from 'next'
import './globals.css'
import BottomNav from '../components/navigation/BottomNav'
import { AuthProvider } from '../lib/auth/context'
import { SkipLink } from '../components/core/SkipLink'

export const metadata: Metadata = {
  title: 'Swing Connect - 스윙댄스 커뮤니티',
  description: '스윙댄스 애호가들을 위한 통합 커뮤니티 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/variable/pretendardvariable.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/variable/pretendardvariable.css"
        />
      </head>
      <body className="font-sans">
        <AuthProvider>
          <SkipLink targetId="main-content">
            메인 콘텐츠로 바로가기
          </SkipLink>
          <SkipLink targetId="main-navigation">
            메인 네비게이션으로 바로가기
          </SkipLink>
          <main
            id="main-content"
            className="pb-16"
            role="main"
            aria-label="메인 콘텐츠"
          >
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  )
}