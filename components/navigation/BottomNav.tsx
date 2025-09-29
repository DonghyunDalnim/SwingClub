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
      id="main-navigation"
      className="fixed bottom-0 left-0 right-0 z-50"
      role="navigation"
      aria-label="메인 네비게이션"
      style={{
        height: theme.components.navigation.height,
        backgroundColor: theme.components.navigation.backgroundColor,
        borderTop: theme.components.navigation.borderBottom,
        padding: theme.components.navigation.padding,
      }}
    >
      <ul className="flex items-center justify-around h-full" role="list">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <li key={item.href} role="listitem">
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200',
                  isActive
                    ? 'text-[#693BF2]'
                    : 'text-[#6A7685] hover:text-[#293341] hover:bg-[#F6F7F9]'
                )}
                style={{
                  backgroundColor: isActive ? theme.colors.secondary.light : 'transparent'
                }}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${item.label} 페이지로 이동`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span
                  className="text-xs font-medium"
                  style={{
                    fontSize: theme.typography.small.fontSize
                  }}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}