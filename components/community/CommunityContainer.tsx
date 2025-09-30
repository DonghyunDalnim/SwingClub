'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/core'
import { PostList } from '@/components/community/PostList'
import { CategoryTabs } from '@/components/community/CategoryTabs'
import { ArrowLeft, Search, Edit } from 'lucide-react'
import { getPostsAction } from '@/lib/actions/posts'
import { type PostCategory, type Post } from '@/lib/types/community'

interface CommunityContainerProps {
  initialPosts: Post[]
  currentUserId?: string
}

export function CommunityContainer({ initialPosts, currentUserId }: CommunityContainerProps) {
  const [activeCategory, setActiveCategory] = useState<PostCategory | 'all'>('all')
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [loading, setLoading] = useState(false)

  // 카테고리 변경 시 게시글 필터링
  const handleCategoryChange = async (category: PostCategory | 'all') => {
    setActiveCategory(category)
    setLoading(true)

    try {
      const filters = category === 'all' ? {} : { category: [category] }
      const result = await getPostsAction({
        sortBy: 'latest',
        limit: 20,
        ...filters
      })

      if (result.success && Array.isArray(result.data)) {
        setPosts(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="bg-white border-b border-gray-200 sticky top-0 z-40"
        role="banner"
        aria-label="커뮤니티 페이지 헤더"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Link
              href="/home"
              aria-label="홈으로 돌아가기"
              className="focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 rounded"
            >
              <ArrowLeft className="h-6 w-6" aria-hidden="true" />
            </Link>
            <span className="font-semibold text-lg">커뮤니티</span>
          </div>
          <nav
            className="flex items-center space-x-3"
            role="navigation"
            aria-label="커뮤니티 액션"
          >
            <button
              className="focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 rounded p-1"
              aria-label="게시글 검색"
            >
              <Search className="h-6 w-6" aria-hidden="true" />
            </button>
            <Link
              href="/community/write"
              aria-label="새 게시글 작성"
              className="focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 rounded"
            >
              <Edit className="h-6 w-6" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>

      <main
        className="container mx-auto px-4 py-6 max-w-4xl"
        role="main"
        aria-label="커뮤니티 메인 콘텐츠"
      >
        {/* 페이지 제목 섹션 */}
        <section
          className="mb-6 flex justify-between items-center"
          aria-labelledby="community-title"
        >
          <h1 id="community-title" className="text-xl font-bold">스윙댄스 커뮤니티</h1>
          <Link href="/community/write">
            <Button aria-label="새 게시글 작성하기" className="bg-[#693BF2] hover:bg-[#693BF2]/90">
              <Edit className="h-4 w-4 mr-2" aria-hidden="true" />
              글쓰기
            </Button>
          </Link>
        </section>

        {/* 카테고리 탭 섹션 */}
        <section className="mb-6" aria-labelledby="category-tabs-title">
          <h2 id="category-tabs-title" className="sr-only">카테고리 필터</h2>
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </section>

        {/* 게시글 목록 섹션 */}
        <section
          aria-labelledby="posts-section-title"
          aria-describedby="posts-section-desc"
        >
          <h2 id="posts-section-title" className="sr-only">게시글 목록</h2>
          <p id="posts-section-desc" className="sr-only">
            {activeCategory === 'all'
              ? '모든 카테고리의 게시글들을 확인하세요'
              : `${activeCategory === 'general' ? '자유게시판' :
                  activeCategory === 'qna' ? '질문답변' :
                  activeCategory === 'event' ? '이벤트/공지' :
                  activeCategory === 'marketplace' ? '중고거래' :
                  activeCategory === 'lesson' ? '레슨정보' :
                  activeCategory === 'review' ? '리뷰' : ''} 게시글들을 확인하세요`}
          </p>

          {loading ? (
            <PostListSkeleton />
          ) : (
            <PostList
              initialPosts={posts}
              currentUserId={currentUserId}
              showActions={!!currentUserId}
            />
          )}
        </section>
      </main>
    </div>
  )
}

// 스켈레톤 컴포넌트
function PostListSkeleton() {
  return (
    <div
      className="space-y-4"
      role="status"
      aria-label="게시글 목록 로딩 중"
      aria-live="polite"
    >
      <span className="sr-only">게시글을 불러오는 중입니다...</span>
      {[...Array(5)].map((_, i) => (
        <article
          key={i}
          className="bg-white p-4 rounded-lg shadow-sm animate-pulse"
          aria-hidden="true"
        >
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export default CommunityContainer