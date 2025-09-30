import { Suspense } from 'react'
import { CommunityContainer } from '@/components/community/CommunityContainer'
import { getPostsAction } from '@/lib/actions/posts'
import { getCurrentUser } from '@/lib/auth/server'

export default async function CommunityPage() {
  // 초기 게시글 로드 (안전한 처리)
  const postsResult = await getPostsAction({ sortBy: 'latest', limit: 20 })
  const initialPosts = (postsResult.success && Array.isArray(postsResult.data)) ? postsResult.data : []

  // 현재 사용자 정보
  const currentUser = await getCurrentUser()

  return (
    <Suspense fallback={<CommunityPageSkeleton />}>
      <CommunityContainer
        initialPosts={initialPosts}
        currentUserId={currentUser?.uid}
      />
    </Suspense>
  )
}

// 전체 페이지 스켈레톤 컴포넌트
function CommunityPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="w-20 h-5 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </header>

      {/* Content skeleton */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6 flex justify-between items-center">
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-20 h-10 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Category tabs skeleton */}
        <div className="mb-6 flex space-x-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Posts skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}