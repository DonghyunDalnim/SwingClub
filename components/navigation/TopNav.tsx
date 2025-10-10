'use client'

/**
 * TopNav Component
 * 기존 Header 디자인과 동일한 스타일 유지
 * 로그인 상태에 따라 다른 메뉴 표시
 */

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

      toast.success('로그아웃되었습니다', {
        duration: 3000,
        position: 'top-center',
      })

      setIsLogoutDialogOpen(false)
      setIsDropdownOpen(false)

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

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            {/* Logo - 기존 디자인 유지 */}
            <div className="header-left">
              <Link href={isAuthenticated ? "/home" : "/"} className="logo">
                <span className="logo-icon">🎺</span>
                <span className="logo-text">Swing Connect</span>
              </Link>
            </div>

            {/* Right Actions */}
            <div className="header-right">
              {isAuthenticated && user ? (
                <>
                  {/* 알림 버튼 */}
                  <button
                    className="icon-button"
                    aria-label="알림"
                    onClick={() => router.push('/notifications')}
                  >
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="notification-badge">3</span>
                  </button>

                  {/* 메시지 버튼 */}
                  <button className="icon-button" aria-label="메시지">
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </button>

                  {/* 사용자 메뉴 */}
                  <div className="user-menu" ref={dropdownRef}>
                    <button
                      className="user-button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      aria-label="사용자 메뉴"
                      aria-expanded={isDropdownOpen}
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.profile?.nickname || user.displayName || '사용자'}
                          className="user-avatar"
                        />
                      ) : (
                        <div className="user-avatar-placeholder">
                          {(user.profile?.nickname || user.displayName || user.email || '사용자')[0].toUpperCase()}
                        </div>
                      )}
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="dropdown-menu">
                        <div className="dropdown-header">
                          <p className="dropdown-user-name">
                            {user.profile?.nickname || user.displayName || '사용자'}
                          </p>
                          <p className="dropdown-user-email">
                            {user.email}
                          </p>
                        </div>

                        <div className="dropdown-divider"></div>

                        <button
                          onClick={handleProfileClick}
                          className="dropdown-item"
                        >
                          <svg className="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          내 프로필
                        </button>

                        <button
                          onClick={handleSettingsClick}
                          className="dropdown-item"
                        >
                          <svg className="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          설정
                        </button>

                        <div className="dropdown-divider"></div>

                        <button
                          onClick={handleLogoutClick}
                          className="dropdown-item dropdown-item-danger"
                        >
                          <svg className="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          로그아웃
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button className="button button-outline" onClick={() => router.push('/login')}>
                  로그인
                </button>
              )}
            </div>
          </div>
        </div>

        <style jsx>{`
          :global(a.logo) {
            text-decoration: none !important;
          }

          :global(a.logo *) {
            text-decoration: none !important;
          }

          .header {
            position: sticky;
            top: 0;
            z-index: 100;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(200, 200, 200, 0.2);
            padding: var(--space-md) 0;
          }

          .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 var(--space-xl);
          }

          .header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--space-xl);
          }

          .header-left {
            flex-shrink: 0;
          }

          .logo {
            display: flex;
            align-items: center;
            gap: var(--space-sm);
            text-decoration: none;
            transition: transform 0.2s;
          }

          .logo:hover {
            transform: scale(1.05);
          }

          .logo-icon {
            font-size: 32px;
            text-decoration: none !important;
          }

          .logo-text {
            font-size: 20px;
            font-weight: 800;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .header-right {
            display: flex;
            align-items: center;
            gap: var(--space-md);
          }

          .icon-button {
            position: relative;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s;
            color: var(--gray-700);
          }

          .icon-button:hover {
            background: var(--gray-100);
            color: #667eea;
          }

          .icon {
            width: 22px;
            height: 22px;
          }

          .notification-badge {
            position: absolute;
            top: 6px;
            right: 6px;
            width: 18px;
            height: 18px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            border-radius: 50%;
            font-size: 11px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(245, 87, 108, 0.4);
          }

          .button {
            padding: 10px 20px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            white-space: nowrap;
          }

          .button-outline {
            background: transparent;
            border: 1.5px solid var(--gray-300);
            color: var(--gray-700);
          }

          .button-outline:hover {
            background: var(--gray-100);
            border-color: var(--gray-400);
          }

          /* User Menu Styles */
          .user-menu {
            position: relative;
          }

          .user-button {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            padding: 0;
            transition: all 0.2s;
            background: transparent;
          }

          .user-button:hover {
            transform: scale(1.05);
          }

          .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #667eea;
          }

          .user-avatar-placeholder {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: 700;
          }

          .dropdown-menu {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            width: 240px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            overflow: hidden;
            animation: slideDown 0.2s ease-out;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .dropdown-header {
            padding: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .dropdown-user-name {
            font-size: 16px;
            font-weight: 700;
            margin: 0 0 4px 0;
          }

          .dropdown-user-email {
            font-size: 12px;
            margin: 0;
            opacity: 0.9;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .dropdown-divider {
            height: 1px;
            background: var(--gray-200);
          }

          .dropdown-item {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: transparent;
            border: none;
            text-align: left;
            font-size: 14px;
            font-weight: 500;
            color: var(--gray-700);
            cursor: pointer;
            transition: all 0.2s;
          }

          .dropdown-item:hover {
            background: var(--gray-50);
            color: #667eea;
          }

          .dropdown-item-danger {
            color: #ef4444;
          }

          .dropdown-item-danger:hover {
            background: #fef2f2;
            color: #dc2626;
          }

          .dropdown-icon {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
          }

          @media (max-width: 768px) {
            .icon-button {
              display: none;
            }

            .button-outline {
              display: none;
            }
          }
        `}</style>
      </header>

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
