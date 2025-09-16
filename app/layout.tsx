import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BottomNav from '../components/navigation/BottomNav'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <main className="pb-16">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}