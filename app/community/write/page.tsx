'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '@/lib/auth/hooks'

// Dynamically import heavy form component
const PostForm = dynamic(
  () => import('@/components/community/PostForm').then(mod => ({ default: mod.PostForm })),
  {
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600">게시글 작성 폼을 불러오는 중...</p>
        </div>
      </div>
    )
  }
)

export default function WritePostPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()

  // 로그인 확인
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      alert('로그인이 필요한 서비스입니다.')
      router.push('/login?redirect=/community/write')
    }
  }, [isAuthenticated, loading, router])

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600">로그인 상태를 확인하는 중...</p>
        </div>
      </div>
    )
  }

  // 인증되지 않은 경우
  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PostForm
        userId={user.id}
        userName={user.displayName || user.email || '사용자'}
        mode="create"
      />
    </div>
  )
}
