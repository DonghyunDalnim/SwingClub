'use client';

import Header from '@/components/Header';
import SpaceCard from '@/components/SpaceCard';
import StoryCard from '@/components/StoryCard';
import Footer from '@/components/Footer';
import { spaces, stories } from '@/lib/data';

export default function Home() {
  return (
    <div className="page">
      <Header />

      {/* Hero with Search */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="headline-wrapper">
              <div className="sparkle-group">
                <span className="sparkle sparkle-1">✨</span>
                <span className="sparkle sparkle-2">✨</span>
                <span className="sparkle sparkle-3">✨</span>
              </div>

              <h1 className="headline">
                <span className="gradient-text">어떤 스윙댄스 서비스를</span>
                <span className="gradient-text-alt">찾으시나요?</span>
              </h1>
            </div>

            {/* Search Bar */}
            <div className="search-container">
              <div className="search-bar">
                <div className="search-icon-wrapper">
                  <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <input
                  type="text"
                  className="search-input"
                  placeholder="어떤 스윙댄스 서비스를 찾으시나요?"
                />

                <button className="button button-primary search-button">
                  <span>검색</span>
                  <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content with Left Sidebar */}
      <div className="main-layout">
        <div className="layout-container">
          {/* Left Sidebar - Quick Links */}
          <aside className="left-sidebar">
            <div className="widget">
              <h3 className="widget-title">🏆 빠른 링크</h3>
              <div className="quick-links">
                <a href="/community" className="quick-link">
                  <span className="link-icon">💬</span>
                  <span>커뮤니티</span>
                </a>
                <a href="/home" className="quick-link">
                  <span className="link-icon">⭐</span>
                  <span>인기 레슨</span>
                </a>
                <a href="/home" className="quick-link">
                  <span className="link-icon">🎉</span>
                  <span>이번 주 파티</span>
                </a>
                <a href="/marketplace" className="quick-link">
                  <span className="link-icon">🛍️</span>
                  <span>중고 거래</span>
                </a>
              </div>
            </div>

            <div className="widget">
              <h3 className="widget-title">🎯 이달의 인기</h3>
              <div className="trending-list">
                <div className="trending-item">
                  <span className="rank rank-1">1</span>
                  <span className="trending-name">린디팝 기초</span>
                </div>
                <div className="trending-item">
                  <span className="rank rank-2">2</span>
                  <span className="trending-name">강남 레슨</span>
                </div>
                <div className="trending-item">
                  <span className="rank rank-3">3</span>
                  <span className="trending-name">주말 파티</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            {/* Featured Spaces - 카드 형태 */}
            <section className="content-section">
              <div className="section-header-card">
                <div className="section-header-content">
                  <div className="section-badge">
                    <span className="badge-icon">🔥</span>
                    <span>HOT</span>
                  </div>
                  <h2 className="section-title-large">인기 공간</h2>
                  <p className="section-description">지금 가장 핫한 스윙댄스 공간을 만나보세요</p>
                </div>

                <button className="button button-secondary">
                  <span>전체 보기</span>
                  <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>

              <div className="space-grid">
                {spaces.map((space) => (
                  <SpaceCard key={space.id} {...space} />
                ))}
              </div>
            </section>

            {/* Stories */}
            <section className="content-section">
              <div className="section-header">
                <div className="section-title-group">
                  <span className="section-icon">📚</span>
                  <div>
                    <h2 className="section-title">스윙댄스 이야기</h2>
                    <p className="section-subtitle">실제 경험담과 유용한 팁</p>
                  </div>
                </div>

                <button className="button button-secondary">
                  <span>더 보기</span>
                  <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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

        /* Hero Section */
        .hero-section {
          background: linear-gradient(180deg, #FFF9F0 0%, #FFFFFF 100%);
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          padding: var(--space-2xl) 0;
          position: relative;
          overflow: hidden;
        }

        .hero-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--space-2xl);
        }

        .hero-content {
          max-width: 700px;
          margin: 0 auto;
          text-align: center;
        }

        .headline-wrapper {
          margin-bottom: var(--space-2xl);
          position: relative;
        }

        .sparkle-group {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 20px;
        }

        .sparkle {
          font-size: 24px;
          display: inline-block;
          animation: float 2s ease-in-out infinite;
        }

        .sparkle-1 { animation-delay: 0s; }
        .sparkle-2 { animation-delay: 0.3s; }
        .sparkle-3 { animation-delay: 0.6s; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .headline {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          font-size: 36px;
          font-weight: 800;
          line-height: 1.2;
        }

        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .gradient-text-alt {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .search-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: 10px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(30px) saturate(180%);
          border: 2px solid rgba(255, 255, 255, 0.9);
          border-radius: var(--radius-full);
          box-shadow:
            0 8px 32px 0 rgba(31, 38, 135, 0.15),
            inset 0 2px 4px rgba(255, 255, 255, 0.9);
          transition: all 0.4s;
        }

        .search-bar:focus-within {
          background: rgba(255, 255, 255, 0.95);
          box-shadow:
            0 12px 40px 0 rgba(102, 126, 234, 0.25),
            inset 0 2px 4px rgba(255, 255, 255, 1);
          transform: translateY(-2px);
        }

        .search-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .search-icon {
          width: 20px;
          height: 20px;
          color: white;
        }

        .search-input {
          flex: 1;
          height: 48px;
          border: none;
          outline: none;
          font-size: 16px;
          background: transparent;
          color: var(--gray-900);
        }

        .search-input::placeholder {
          color: var(--gray-600);
        }

        .search-button {
          height: 48px;
          padding: 0 var(--space-xl);
          flex-shrink: 0;
        }

        .button {
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          white-space: nowrap;
        }

        .button-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .button-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .button-secondary {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          border: 1.5px solid rgba(102, 126, 234, 0.2);
        }

        .button-secondary:hover {
          background: rgba(102, 126, 234, 0.2);
          transform: translateX(4px);
        }

        .icon-sm {
          width: 18px;
          height: 18px;
        }

        /* Main Layout */
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
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .widget {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          padding: var(--space-xl);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.08),
            inset 0 1px 2px rgba(255, 255, 255, 0.9);
        }

        .widget-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-md);
        }

        .quick-links {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .quick-link {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(200, 200, 200, 0.3);
          border-radius: 12px;
          text-decoration: none;
          color: var(--gray-700);
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
        }

        .quick-link:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
          transform: translateX(5px);
        }

        .link-icon {
          font-size: 18px;
        }

        .trending-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .trending-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-sm);
        }

        .rank {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .rank-1 {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .rank-2 {
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
          color: #8b4513;
        }

        .rank-3 {
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
          color: #667eea;
        }

        .trending-name {
          font-size: 14px;
          color: var(--gray-700);
          font-weight: 500;
        }

        .main-content {
          min-width: 0;
        }

        .content-section {
          margin-bottom: var(--space-2xl);
        }

        /* 인기 공간 카드 형태 헤더 */
        .section-header-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          border-radius: 24px;
          padding: var(--space-2xl);
          margin-bottom: var(--space-xl);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.08),
            inset 0 1px 2px rgba(255, 255, 255, 0.9);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .section-header-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
          animation: pulse-glow 3s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        .section-header-content {
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .section-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: var(--space-md);
          box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
          animation: badge-pulse 2s ease-in-out infinite;
        }

        @keyframes badge-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .badge-icon {
          font-size: 14px;
          animation: wiggle 1s ease-in-out infinite;
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }

        .section-title-large {
          font-size: 32px;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: var(--space-sm);
        }

        .section-description {
          font-size: 15px;
          color: var(--gray-600);
          font-weight: 500;
        }

        /* 2단 그리드 */
        .space-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-lg);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-xl);
        }

        .section-title-group {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .section-icon {
          font-size: 32px;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .section-title {
          font-size: 24px;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 4px;
        }

        .section-subtitle {
          font-size: 14px;
          color: var(--gray-600);
          font-weight: 500;
        }

        .story-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-xl);
        }

        @media (max-width: 1200px) {
          .layout-container {
            grid-template-columns: 1fr;
          }

          .left-sidebar {
            position: static;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-lg);
          }

          .space-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .layout-container {
            padding: var(--space-lg);
          }

          .headline {
            font-size: 28px;
          }

          .search-button span {
            display: none;
          }

          .left-sidebar {
            grid-template-columns: 1fr;
          }

          .section-header-card {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-lg);
            padding: var(--space-xl);
          }

          .section-title-large {
            font-size: 24px;
          }

          .story-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
