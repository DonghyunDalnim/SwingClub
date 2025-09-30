'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { theme } from '@/lib/theme'
import { Home, MapPin, Users, MessageCircle, User } from 'lucide-react'

const navItems = [
  {
    href: '/home',
    label: '홈',
    icon: Home,
  },
  {
    href: '/location',
    label: '지역',
    icon: MapPin,
  },
  {
    href: '/community',
    label: '커뮤니티',
    icon: Users,
  },
  {
    href: '/marketplace',
    label: '거래',
    icon: MessageCircle,
  },
  {
    href: '/profile',
    label: '내정보',
    icon: User,
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      role="navigation"
      aria-label="메인 탐색"
      style={{
        height: theme.components.navigation.height,
        backgroundColor: theme.components.navigation.backgroundColor,
        borderTop: theme.components.navigation.borderBottom,
        padding: theme.components.navigation.padding,
      }}
    >
      <div className="flex items-center justify-around h-full" role="menubar">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${item.label} 페이지로 이동${isActive ? ' (현재 페이지)' : ''}`}
              className="flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#693BF2] focus-visible:ring-offset-2"
              style={{
                color: isActive ? theme.colors.primary.main : theme.colors.neutral.medium,
                backgroundColor: isActive ? theme.colors.secondary.light : 'transparent'
              }}
            >
              <Icon
                className="h-5 w-5"
                aria-hidden="true"
                role="presentation"
              />
              <span
                className="text-xs font-medium"
                style={{
                  fontSize: theme.typography.small.fontSize
                }}
                aria-hidden="true"
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}