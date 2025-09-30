import type { Metadata } from 'next'
import './globals.css'
import BottomNav from '../components/navigation/BottomNav'
import { AuthProvider } from '../lib/auth/context'

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
        {/* Skip to main content link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary-main text-white px-4 py-2 rounded-md"
        >
          메인 콘텐츠로 건너뛰기
        </a>

        <AuthProvider>
          {/* ARIA-live region for announcements */}
          <div
            id="aria-live-region"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          />

          {/* ARIA-live region for urgent announcements */}
          <div
            id="aria-live-assertive"
            aria-live="assertive"
            aria-atomic="true"
            className="sr-only"
          />

          {/* Main application content */}
          <main
            id="main-content"
            role="main"
            aria-label="스윙댄스 커뮤니티 메인 콘텐츠"
            className="pb-16"
          >
            {children}
          </main>

          {/* Bottom navigation as complementary landmark */}
          <aside role="complementary" aria-label="주요 탐색 메뉴">
            <BottomNav />
          </aside>
        </AuthProvider>
      </body>
    </html>
  )
}