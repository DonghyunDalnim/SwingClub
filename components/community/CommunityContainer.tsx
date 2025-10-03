'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PostList } from '@/components/community/PostList'
import { Search, Edit } from 'lucide-react'
import { getPostsAction } from '@/lib/actions/posts'
import { type PostCategory, type Post } from '@/lib/types/community'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface CommunityContainerProps {
  initialPosts: Post[]
  currentUserId?: string
}

export function CommunityContainer({ initialPosts, currentUserId }: CommunityContainerProps) {
  const router = useRouter()
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

  const handleCategoryClick = (category: string) => {
    switch (category) {
      case '전체':
        router.push('/');
        break;
      case '커뮤니티':
        // 현재 페이지이므로 아무것도 하지 않음
        break;
      case '용품':
        router.push('/marketplace');
        break;
      case '장소':
        router.push('/location');
        break;
      default:
        break;
    }
  };

  return (
    <div className="page">
      <Header />

      {/* 2-Column Layout */}
      <div className="main-layout">
        <div className="layout-container">
          {/* Left Sidebar - 카테고리 */}
          <aside className="left-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">카테고리</h3>
              <nav className="category-list">
                <button className="category-item" onClick={() => handleCategoryClick('전체')}>
                  <span className="category-name">전체</span>
                  <span className="category-count">1,234</span>
                </button>
                <button className="category-item" onClick={() => handleCategoryClick('레슨')}>
                  <span className="category-icon">📚</span>
                  <span className="category-name">레슨</span>
                  <span className="category-count">456</span>
                </button>
                <button className="category-item" onClick={() => handleCategoryClick('파티')}>
                  <span className="category-icon">🎉</span>
                  <span className="category-name">파티</span>
                  <span className="category-count">234</span>
                </button>
                <button className="category-item" onClick={() => handleCategoryClick('매칭')}>
                  <span className="category-icon">🤝</span>
                  <span className="category-name">매칭</span>
                  <span className="category-count">345</span>
                </button>
                <button className="category-item" onClick={() => handleCategoryClick('용품')}>
                  <span className="category-icon">🛍️</span>
                  <span className="category-name">용품</span>
                  <span className="category-count">199</span>
                </button>
                <button className="category-item active" onClick={() => handleCategoryClick('커뮤니티')}>
                  <span className="category-icon">💬</span>
                  <span className="category-name">커뮤니티</span>
                  <span className="category-count">567</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content - 커뮤니티 게시글 */}
          <main className="main-content">
            <section className="content-section">
              <div className="section-header">
                <h2 className="section-title">💬 스윙댄스 커뮤니티</h2>
                <Link href="/community/write">
                  <button className="view-all-button">
                    <Edit className="icon-sm" />
                    글쓰기
                  </button>
                </Link>
              </div>

              {/* 카테고리 탭 */}
              <div className="category-tabs">
                <button
                  className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
                  onClick={() => handleCategoryChange('all')}
                >
                  전체
                </button>
                <button
                  className={`category-tab ${activeCategory === 'general' ? 'active' : ''}`}
                  onClick={() => handleCategoryChange('general')}
                >
                  자유게시판
                </button>
                <button
                  className={`category-tab ${activeCategory === 'qna' ? 'active' : ''}`}
                  onClick={() => handleCategoryChange('qna')}
                >
                  질문답변
                </button>
                <button
                  className={`category-tab ${activeCategory === 'event' ? 'active' : ''}`}
                  onClick={() => handleCategoryChange('event')}
                >
                  이벤트
                </button>
                <button
                  className={`category-tab ${activeCategory === 'lesson' ? 'active' : ''}`}
                  onClick={() => handleCategoryChange('lesson')}
                >
                  레슨정보
                </button>
                <button
                  className={`category-tab ${activeCategory === 'review' ? 'active' : ''}`}
                  onClick={() => handleCategoryChange('review')}
                >
                  리뷰
                </button>
              </div>

              {/* 게시글 목록 */}
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
      </div>

      <Footer />

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* 2-Column Layout */
        .main-layout {
          flex: 1;
          background: var(--warm-gray);
        }

        .layout-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--space-2xl);
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: var(--space-2xl);
          align-items: start;
        }

        /* Left Sidebar - Categories Only */
        .left-sidebar {
          position: sticky;
          top: 80px;
        }

        .sidebar-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          padding: var(--space-xl);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .sidebar-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-lg);
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .category-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: transparent;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .category-item:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        .category-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .category-icon {
          font-size: 18px;
        }

        .category-name {
          flex: 1;
          font-size: 14px;
          font-weight: 600;
        }

        .category-count {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
        }

        .category-item:not(.active) .category-count {
          color: var(--gray-500);
        }

        /* Main Content */
        .main-content {
          min-width: 0;
        }

        .content-section {
          margin-bottom: var(--space-2xl);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-xl);
        }

        .section-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--gray-900);
        }

        .view-all-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .view-all-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .icon-sm {
          width: 16px;
          height: 16px;
        }

        /* Category Tabs */
        .category-tabs {
          display: flex;
          gap: var(--space-sm);
          margin-bottom: var(--space-xl);
          overflow-x: auto;
          scrollbar-width: none;
        }

        .category-tabs::-webkit-scrollbar {
          display: none;
        }

        .category-tab {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.9);
          border: 1.5px solid rgba(200, 200, 200, 0.3);
          border-radius: 12px;
          color: var(--gray-700);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .category-tab:hover {
          background: rgba(102, 126, 234, 0.1);
          border-color: rgba(102, 126, 234, 0.3);
        }

        .category-tab.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
          color: white;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .layout-container {
            grid-template-columns: 1fr;
          }

          .left-sidebar {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .layout-container {
            padding: var(--space-lg);
          }

          .category-tabs {
            gap: var(--space-xs);
          }
        }
      `}</style>
    </div>
  )
}

// 스켈레톤 컴포넌트
function PostListSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="게시글 목록 로딩 중" aria-live="polite">
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
