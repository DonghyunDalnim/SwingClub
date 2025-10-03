'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import SpaceCard from '@/components/SpaceCard';
import StoryCard from '@/components/StoryCard';
import Footer from '@/components/Footer';
import { spaces, stories } from '@/lib/data';

export default function Home() {
  const router = useRouter();

  const handleCategoryClick = (category: string) => {
    switch (category) {
      case '커뮤니티':
        router.push('/community');
        break;
      case '용품':
        router.push('/marketplace');
        break;
      case '장소':
        router.push('/location');
        break;
      default:
        // 전체, 레슨, 파티, 매칭은 현재 페이지에서 필터링
        break;
    }
  };

  return (
    <div className="page">
      <Header />

      {/* 2-Column Layout */}
      <div className="main-layout">
        <div className="layout-container">
          {/* Left Sidebar - 카테고리만 */}
          <aside className="left-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">카테고리</h3>
              <nav className="category-list">
                <button className="category-item active" onClick={() => handleCategoryClick('전체')}>
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
                <button className="category-item" onClick={() => handleCategoryClick('커뮤니티')}>
                  <span className="category-icon">💬</span>
                  <span className="category-name">커뮤니티</span>
                  <span className="category-count">567</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content - 인기 공간 */}
          <main className="main-content">
            <section className="content-section">
              <div className="section-header">
                <h2 className="section-title">🔥 인기 공간</h2>
                <button className="view-all-button">
                  전체보기
                  <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* 2x2 Grid */}
              <div className="space-grid">
                {spaces.map((space) => (
                  <SpaceCard key={space.id} {...space} />
                ))}
              </div>
            </section>

            {/* Stories */}
            <section className="content-section">
              <div className="section-header">
                <h2 className="section-title">📚 스윙댄스 이야기</h2>
                <button className="view-all-button">
                  더 보기
                  <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="story-grid">
                {stories.map((story) => (
                  <StoryCard key={story.id} {...story} />
                ))}
              </div>
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
          gap: 4px;
          padding: 8px 16px;
          background: rgba(102, 126, 234, 0.1);
          border: none;
          border-radius: 10px;
          color: #667eea;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-all-button:hover {
          background: rgba(102, 126, 234, 0.2);
          transform: translateX(4px);
        }

        .icon-sm {
          width: 16px;
          height: 16px;
        }

        /* 2x2 Grid for Spaces */
        .space-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-lg);
        }

        .story-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-xl);
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .layout-container {
            grid-template-columns: 1fr;
          }

          .left-sidebar {
            position: static;
          }

          .space-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .layout-container {
            padding: var(--space-lg);
          }

          .story-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
