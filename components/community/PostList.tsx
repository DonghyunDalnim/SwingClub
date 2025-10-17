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
    <div className="posts-container">

      {/* 로딩 상태 */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p className="loading-text">게시글을 불러오는 중...</p>
        </div>
      )}

      {/* 고정 게시글 */}
      {pinnedPosts.length > 0 && !loading && (
        <div className="posts-section">
          <h3 className="section-label">📌 고정 게시글</h3>
          <div className="posts-grid">
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
        </div>
      )}

      {/* 일반 게시글 */}
      {!loading && (
        <div className="posts-section">
          {pinnedPosts.length > 0 && regularPosts.length > 0 && (
            <h3 className="section-label">📝 게시글</h3>
          )}

          {regularPosts.length > 0 ? (
            <div className="posts-grid">
              {regularPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                  showActions={showActions}
                />
              ))}
            </div>
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
        <div className="load-more">
          <Button variant="outline" onClick={() => loadPosts()}>
            더보기
          </Button>
        </div>
      )}

      <style jsx>{`
        .posts-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-2xl);
        }

        .loading-state {
          text-align: center;
          padding: var(--space-2xl);
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 2px solid rgba(102, 126, 234, 0.2);
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto var(--space-sm);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-text {
          color: var(--gray-600);
          font-size: 14px;
          font-weight: 500;
        }

        .posts-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .section-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--gray-700);
          padding-left: var(--space-xs);
        }

        .posts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-lg);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .empty-icon {
          font-size: 64px;
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

        .load-more {
          text-align: center;
          padding: var(--space-lg) 0;
        }

        @media (max-width: 768px) {
          .posts-container {
            gap: var(--space-xl);
          }

          .posts-grid {
            gap: var(--space-md);
          }

          .empty-state {
            padding: var(--space-2xl) var(--space-lg);
          }

          .empty-icon {
            font-size: 48px;
          }
        }
      `}</style>
    </div>
  )
}