'use client'

/**
 * TopNav Component
 * Issue #85 - TopNav 사용자 메뉴 UX 개선
 *
 * Features:
 * - User avatar with dropdown menu
 * - Glassmorphism style dropdown
 * - Logout confirmation dialog
 * - Toast notifications
 * - Smooth animations
 * - Accessibility support (ESC key, focus trap)
 */

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/auth/hooks'
import { signOut } from '@/lib/auth/providers'
import { ConfirmDialog } from '@/components/core/ConfirmDialog'

export function TopNav() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Close dropdown on ESC key
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isDropdownOpen])

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await signOut()

      // Show success toast
      toast.success('로그아웃되었습니다', {
        duration: 3000,
        position: 'top-center',
      })

      // Close dialogs
      setIsLogoutDialogOpen(false)
      setIsDropdownOpen(false)

      // Redirect to home
      setTimeout(() => {
        router.push('/')
      }, 500)
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('로그아웃에 실패했습니다')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleProfileClick = () => {
    setIsDropdownOpen(false)
    router.push('/profile')
  }

  const handleSettingsClick = () => {
    setIsDropdownOpen(false)
    router.push('/profile#settings')
  }

  const handleLogoutClick = () => {
    setIsDropdownOpen(false)
    setIsLogoutDialogOpen(true)
  }

  // 비로그인 시 간단한 헤더 표시
  if (!isAuthenticated || !user) {
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1
                className="text-xl font-bold text-[#693BF2] cursor-pointer"
                onClick={() => router.push('/')}
                aria-label="Swing Connect 홈으로"
              >
                SWING CONNECT
              </h1>
            </div>

            {/* Login Button */}
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 text-sm font-medium text-white bg-[#693BF2] rounded-lg hover:bg-[#5A2FD9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#693BF2] focus:ring-offset-2"
            >
              로그인
            </button>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-[#693BF2] cursor-pointer" onClick={() => router.push('/home')}>
                SWING CONNECT
              </h1>
            </div>

            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#693BF2] focus:ring-offset-2"
                aria-label="사용자 메뉴"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                {/* Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-[#693BF2] to-[#5A2FD9] rounded-full flex items-center justify-center">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.profile?.nickname || user.displayName || '사용자'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Username (desktop only) */}
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user.profile?.nickname || user.displayName || user.email?.split('@')[0] || '사용자'}
                </span>

                {/* Chevron */}
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 origin-top-right"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <div
                    className="rounded-xl border border-gray-200 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{
                      backdropFilter: 'blur(12px)',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    }}
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.profile?.nickname || user.displayName || '사용자'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={handleProfileClick}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F1EEFF] hover:text-[#693BF2] transition-colors"
                        role="menuitem"
                      >
                        <User className="w-4 h-4 mr-3" />
                        내 프로필
                      </button>

                      <button
                        onClick={handleSettingsClick}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F1EEFF] hover:text-[#693BF2] transition-colors"
                        role="menuitem"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        설정
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        로그아웃
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogout}
        title="정말 로그아웃하시겠습니까?"
        description="다시 로그인하려면 인증이 필요합니다"
        confirmText="로그아웃"
        cancelText="취소"
        variant="danger"
        isLoading={isLoggingOut}
      />
    </>
  )
}
