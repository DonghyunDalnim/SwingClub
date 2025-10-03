'use client'

import { useState, useEffect } from 'react'
import { PostCard } from './PostCard'
import { Button, Badge } from '@/components/core'
import { Search, Filter } from 'lucide-react'
import { getPostsAction } from '@/lib/actions/posts'
import { POST_CATEGORIES } from '@/lib/types/community'
import type { Post, PostCategory, PostSearchFilters } from '@/lib/types/community'

interface PostListProps {
  initialPosts: Post[]
  currentUserId?: string
  showActions?: boolean
}

export function PostList({ initialPosts, currentUserId, showActions = false }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<PostSearchFilters>({
    category: undefined,
    sortBy: 'latest'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // 게시글 로드
  const loadPosts = async (newFilters?: PostSearchFilters) => {
    setLoading(true)
    try {
      const searchFilters = newFilters || filters
      const result = await getPostsAction({
        ...searchFilters,
        keyword: searchQuery.trim() || undefined
      })

      if (result.success) {
        setPosts(result.data)
      }
    } catch (error) {
      console.error('게시글 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // 카테고리 필터 변경
  const handleCategoryFilter = (category: PostCategory | undefined) => {
    const newFilters = { ...filters, category }
    setFilters(newFilters)
    loadPosts(newFilters)
  }

  // 정렬 변경
  const handleSortChange = (sortBy: 'latest' | 'popular' | 'views') => {
    const newFilters = { ...filters, sortBy }
    setFilters(newFilters)
    loadPosts(newFilters)
  }

  // 검색
  const handleSearch = () => {
    loadPosts()
  }

  // 검색어 엔터키 처리
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 고정 게시글과 일반 게시글 분리 (안전한 배열 처리)
  const safePostsArray = Array.isArray(posts) ? posts : []
  const pinnedPosts = safePostsArray.filter(post => post.metadata?.isPinned)
  const regularPosts = safePostsArray.filter(post => !post.metadata?.isPinned)

  return (
    <div className="space-y-6">

      {/* 로딩 상태 */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2" />
          <p className="text-gray-500">게시글을 불러오는 중...</p>
        </div>
      )}

      {/* 고정 게시글 */}
      {pinnedPosts.length > 0 && !loading && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">📌 고정 게시글</h3>
          {pinnedPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              showActions={showActions}
              isPinned={true}
            />
          ))}
        </div>
      )}

      {/* 일반 게시글 */}
      {!loading && (
        <div className="space-y-4">
          {pinnedPosts.length > 0 && regularPosts.length > 0 && (
            <h3 className="text-sm font-medium text-gray-700">📝 게시글</h3>
          )}

          {regularPosts.length > 0 ? (
            regularPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                showActions={showActions}
              />
            ))
          ) : (
            !loading && (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <p className="empty-text">아직 게시글이 없습니다.</p>
                <p className="empty-subtext">첫 번째 게시글을 작성해보세요!</p>
              </div>
            )
          )}
        </div>
      )}

      {/* 더보기 버튼 */}
      {!loading && regularPosts.length > 0 && regularPosts.length >= 10 && (
        <div className="text-center py-4">
          <Button variant="outline" onClick={() => loadPosts()}>
            더보기
          </Button>
        </div>
      )}

      <style jsx>{`
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          border: 1.5px solid rgba(200, 200, 200, 0.2);
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: var(--space-lg);
        }

        .empty-text {
          font-size: 18px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-sm);
        }

        .empty-subtext {
          font-size: 14px;
          color: var(--gray-600);
        }
      `}</style>
    </div>
  )
}