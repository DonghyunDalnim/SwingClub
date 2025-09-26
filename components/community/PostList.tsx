'use client'

import { useState, useEffect } from 'react'
import { PostCard } from './PostCard'
import { Button, Badge } from '@/components/core'
import { Search, Filter } from 'lucide-react'
import { getPostsAction } from '@/lib/actions/posts'
import { POST_CATEGORIES } from '@/lib/types/community'
import type { Post, PostCategory, PostSearchFilters } from '@/lib/types/community'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { EmptyState, EmptyPostsIllustration } from '@/components/ui/EmptyState'

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
      {/* 검색 및 필터 */}
      <div className="space-y-4">
        {/* 검색바 */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="게시글 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            검색
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* 필터 옵션 */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            {/* 카테고리 필터 */}
            <div>
              <label className="block text-sm font-medium mb-2">카테고리</label>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={filters.category === undefined ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleCategoryFilter(undefined)}
                >
                  전체
                </Badge>
                {Object.entries(POST_CATEGORIES).map(([key, label]) => (
                  <Badge
                    key={key}
                    variant={filters.category === key ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleCategoryFilter(key as PostCategory)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 정렬 옵션 */}
            <div>
              <label className="block text-sm font-medium mb-2">정렬</label>
              <div className="flex gap-2">
                <Badge
                  variant={filters.sortBy === 'latest' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleSortChange('latest')}
                >
                  최신순
                </Badge>
                <Badge
                  variant={filters.sortBy === 'popular' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleSortChange('popular')}
                >
                  인기순
                </Badge>
                <Badge
                  variant={filters.sortBy === 'views' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleSortChange('views')}
                >
                  조회순
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-center py-6">
            <LoadingSpinner size="lg" />
            <p className="text-[#6A7685] ml-3">게시글을 불러오는 중...</p>
          </div>

          {/* 스켈레톤 카드들 */}
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonCard key={i} type="post" />
          ))}
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
              <EmptyState
                icon={<EmptyPostsIllustration />}
                title={searchQuery || filters.category ? '검색 결과가 없습니다' : '아직 게시글이 없습니다'}
                description={
                  searchQuery || filters.category
                    ? '다른 검색어나 카테고리를 시도해보세요.'
                    : '첫 번째 게시글을 작성해서 커뮤니티를 시작해보세요.'
                }
                actionLabel={(!searchQuery && !filters.category) ? '첫 번째 게시글 작성하기' : undefined}
                onAction={(!searchQuery && !filters.category) ? () => window.location.href = '/community/write' : undefined}
                className="bg-[#F6F7F9] rounded-xl"
              />
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
    </div>
  )
}