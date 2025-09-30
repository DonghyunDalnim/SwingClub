'use client'

import { Button, Typography } from '@/components/core'
import { Container } from '@/components/layout'
import { NotificationBellCompact } from '@/components/navigation/NotificationBell'
import { useAuth } from '@/lib/auth/context'

export function Header() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-lg shadow-gray-900/5">
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
            <Button variant="ghost" className="text-gray-700">
              로그인 / 회원가입
            </Button>
            <Button variant="primary" size="sm">
              고수가입
            </Button>
          </div>
        </div>
      </Container>
    </header>
  )
}