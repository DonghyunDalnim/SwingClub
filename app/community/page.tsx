import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/core'
import { PostList } from '@/components/community/PostList'
import { ArrowLeft, Search, Edit } from 'lucide-react'
import { getPostsAction } from '@/lib/actions/posts'
import { getCurrentUser } from '@/lib/auth/server'

export default async function CommunityPage() {
  // 초기 게시글 로드 (안전한 처리)
  const postsResult = await getPostsAction({ sortBy: 'latest', limit: 20 })
  const initialPosts = (postsResult.success && Array.isArray(postsResult.data)) ? postsResult.data : []

  // 현재 사용자 정보
  const currentUser = await getCurrentUser()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <span className="font-semibold text-lg">커뮤니티</span>
          </div>
          <div className="flex items-center space-x-3">
            <Search className="h-6 w-6" />
            <Link href="/community/write">
              <Edit className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 작성 버튼 (모바일용) */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-xl font-bold">스윙댄스 커뮤니티</h1>
          <Link href="/community/write">
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              글쓰기
            </Button>
          </Link>
        </div>

        {/* 게시글 목록 */}
        <Suspense fallback={<PostListSkeleton />}>
          <PostList
            initialPosts={initialPosts}
            currentUserId={currentUser?.uid}
            showActions={!!currentUser}
          />
        </Suspense>
      </div>
    </div>
  )
}

// 스켈레톤 컴포넌트
function PostListSkeleton() {
  return (
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
  )
}