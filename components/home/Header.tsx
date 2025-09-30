'use client'

import { Button, Typography } from '@/components/core'
import { Container } from '@/components/layout'
import { NotificationBellCompact } from '@/components/navigation/NotificationBell'
import { useAuth } from '@/lib/auth/context'

export function Header() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xl shadow-purple-900/10">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Left Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <Typography variant="h4" className="font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 bg-clip-text text-transparent">
                Swing Connect
              </Typography>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                견적요청
              </Button>
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                고수찾기
              </Button>
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                마켓
              </Button>
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                커뮤니티
              </Button>
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {user && <NotificationBellCompact />}
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-purple-700 font-medium rounded-xl hover:bg-purple-50 transition-all duration-300"
            >
              로그인 / 회원가입
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-300/50 hover:shadow-xl hover:shadow-purple-400/60 hover:scale-105 transition-all duration-300 active:scale-95"
            >
              고수가입
            </Button>
          </div>
        </div>
      </Container>
    </header>
  )
}