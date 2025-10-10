'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated, useUser } from '@/lib/auth/hooks';
import Footer from '@/components/Footer';

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  // 로그인하지 않은 사용자는 랜딩 페이지로 리디렉션
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // 로딩 중일 때 표시
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

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
      {/* 2-Column Layout */}
      <div className="main-layout">
        <div className="layout-container">
          {/* Left Sidebar - 카테고리 */}
          <aside className="left-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">카테고리</h3>
              <nav className="category-list">
                <button className="category-item active" onClick={() => handleCategoryClick('전체')}>
                  <span className="category-name">전체</span>
                  <span className="category-count">0</span>
                </button>
                <button className="category-item" onClick={() => handleCategoryClick('레슨')}>
                  <span className="category-icon">📚</span>
                  <span className="category-name">레슨</span>
                  <span className="category-count">0</span>
                </button>
                <button className="category-item" onClick={() => handleCategoryClick('파티')}>
                  <span className="category-icon">🎉</span>
                  <span className="category-name">파티</span>
                  <span className="category-count">0</span>
                </button>
                <button className="category-item" onClick={() => handleCategoryClick('매칭')}>
                  <span className="category-icon">🤝</span>
                  <span className="category-name">매칭</span>
                  <span className="category-count">0</span>
                </button>
                <button className="category-item" onClick={() => handleCategoryClick('용품')}>
                  <span className="category-icon">🛍️</span>
                  <span className="category-name">용품</span>
                  <span className="category-count">0</span>
                </button>
                <button className="category-item" onClick={() => handleCategoryClick('커뮤니티')}>
                  <span className="category-icon">💬</span>
                  <span className="category-name">커뮤니티</span>
                  <span className="category-count">0</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content - 스윙댄스 홈 */}
          <main className="main-content">
            <section className="content-section">
              <div className="welcome-card">
                <h1 className="welcome-title">환영합니다, {user?.displayName || user?.email}님! 🎵</h1>
                <p className="welcome-text">Swing Connect에서 스윙댄스의 모든 것을 경험하세요</p>
              </div>
            </section>

            <section className="content-section">
              <div className="section-header">
                <h2 className="section-title">🔥 오늘의 스윙</h2>
              </div>
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p className="empty-text">아직 등록된 컨텐츠가 없습니다</p>
                <p className="empty-subtext">첫 번째 게시물을 작성해보세요!</p>
              </div>
            </section>

            <section className="content-section">
              <div className="section-header">
                <h2 className="section-title">📚 커뮤니티 소식</h2>
              </div>
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <p className="empty-text">아직 등록된 소식이 없습니다</p>
                <p className="empty-subtext">커뮤니티에 첫 소식을 전해보세요!</p>
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

        /* Left Sidebar */
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

        /* Welcome Card */
        .welcome-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 24px;
          padding: var(--space-2xl);
          color: white;
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.3);
        }

        .welcome-title {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: var(--space-sm);
        }

        .welcome-text {
          font-size: 16px;
          opacity: 0.9;
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

        /* Empty State */
        .empty-state {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          padding: var(--space-2xl);
          text-align: center;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: var(--space-md);
        }

        .empty-text {
          font-size: 18px;
          font-weight: 600;
          color: var(--gray-700);
          margin-bottom: var(--space-xs);
        }

        .empty-subtext {
          font-size: 14px;
          color: var(--gray-500);
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

          .welcome-card {
            padding: var(--space-xl);
          }

          .welcome-title {
            font-size: 22px;
          }

          .welcome-text {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
