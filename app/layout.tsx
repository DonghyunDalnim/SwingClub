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
        <AuthProvider>
          <main className="pb-16">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  )
}