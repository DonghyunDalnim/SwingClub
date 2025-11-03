'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks'
import { useState } from 'react'
import { DanceStyleDisplay } from './components/DanceStyleDisplay'

export default function ProfilePage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'info' | 'activity' | 'settings'>('info')

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await signOut()
      router.push('/login')
    }
  }

  return (
    <div className="page">
      {/* 2-Column Layout */}
      <div className="main-layout">
        <div className="layout-container">
          {/* Left Sidebar - 프로필 카드 */}
          <aside className="left-sidebar">
            <div className="sidebar-card profile-card">
              {/* Profile Header */}
              <div className="profile-header">
                <div className="avatar-container">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="avatar-image" />
                  ) : (
                    <div className="avatar-placeholder">
                      {(user?.displayName || user?.email || '사용자')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <h2 className="profile-name">{user?.profile?.nickname || user?.displayName || '댄스러버'}</h2>
                <p className="profile-email">{user?.email}</p>
              </div>

              {/* Quick Stats */}
              <div className="quick-stats">
                <div className="stat-item">
                  <div className="stat-icon">📊</div>
                  <div className="stat-value">{user?.profile?.danceLevel || '초급'}</div>
                  <div className="stat-label">댄스 레벨</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">📍</div>
                  <div className="stat-value">{user?.profile?.location || '미설정'}</div>
                  <div className="stat-label">활동 지역</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button className="btn-primary" onClick={() => router.push('/profile/edit')}>
                  <span className="btn-icon">✏️</span>
                  <span>프로필 수정</span>
                </button>
                <button className="btn-secondary" onClick={handleLogout}>
                  <span className="btn-icon">🚪</span>
                  <span>로그아웃</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button
                className={`tab-item ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                <span className="tab-icon">👤</span>
                <span>내 정보</span>
              </button>
              <button
                className={`tab-item ${activeTab === 'activity' ? 'active' : ''}`}
                onClick={() => setActiveTab('activity')}
              >
                <span className="tab-icon">📊</span>
                <span>활동 내역</span>
              </button>
              <button
                className={`tab-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <span className="tab-icon">⚙️</span>
                <span>설정</span>
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'info' && (
              <div className="tab-content">
                {/* Dance Styles */}
                <section className="content-section">
                  <div className="section-header">
                    <h2 className="section-title">🎵 댄스 스타일</h2>
                  </div>
                  <DanceStyleDisplay
                    danceStyles={user?.profile?.danceStyles || []}
                    isOwnProfile={true}
                    onEdit={() => router.push('/profile/edit')}
                  />
                </section>

                {/* Badges */}
                <section className="content-section">
                  <div className="section-header">
                    <h2 className="section-title">🏆 내 배지</h2>
                  </div>
                  <div className="badges-grid">
                    {[
                      { emoji: '🌟', name: '신입댄서' },
                      { emoji: '👥', name: '모임러버' },
                      { emoji: '💬', name: '댓글킹' },
                      { emoji: '📝', name: '글작성' },
                      { emoji: '🎯', name: '출석왕' }
                    ].map((badge, i) => (
                      <div key={i} className="badge-card">
                        <div className="badge-emoji">{badge.emoji}</div>
                        <div className="badge-name">{badge.name}</div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Bio */}
                <section className="content-section">
                  <div className="section-header">
                    <h2 className="section-title">💭 자기소개</h2>
                  </div>
                  <div className="bio-card">
                    <p className="bio-text">
                      안녕하세요! 스윙댄스를 사랑하는 댄스러버입니다 🎵<br/>
                      린디합을 가장 좋아하고, 주로 강남 쪽에서 활동해요.<br/>
                      초보자분들 환영하고 함께 성장했으면 좋겠어요!<br/>
                      언제든 연락주세요~ 😊
                    </p>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="tab-content">
                {/* Activity Stats */}
                <section className="content-section">
                  <div className="section-header">
                    <h2 className="section-title">📊 활동 통계</h2>
                  </div>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-number blue">15</div>
                      <div className="stat-label">작성한 글</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number green">47</div>
                      <div className="stat-label">댓글</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number red">89</div>
                      <div className="stat-label">받은 좋아요</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number purple">8</div>
                      <div className="stat-label">참여한 모임</div>
                    </div>
                  </div>
                </section>

                {/* Recent Activity */}
                <section className="content-section">
                  <div className="section-header">
                    <h2 className="section-title">📝 최근 활동</h2>
                  </div>
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <p className="empty-text">아직 활동 내역이 없습니다</p>
                    <p className="empty-subtext">커뮤니티에 참여해보세요!</p>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="tab-content">
                {/* Settings Menu */}
                <section className="content-section">
                  <div className="section-header">
                    <h2 className="section-title">⚙️ 설정</h2>
                  </div>
                  <div className="settings-list">
                    <button className="settings-item">
                      <div className="settings-left">
                        <span className="settings-icon">🔔</span>
                        <span className="settings-label">알림 설정</span>
                      </div>
                      <span className="settings-arrow">›</span>
                    </button>
                    <button className="settings-item">
                      <div className="settings-left">
                        <span className="settings-icon">🔒</span>
                        <span className="settings-label">개인정보 설정</span>
                      </div>
                      <span className="settings-arrow">›</span>
                    </button>
                    <button className="settings-item">
                      <div className="settings-left">
                        <span className="settings-icon">📱</span>
                        <span className="settings-label">계정 연결 관리</span>
                      </div>
                      <span className="settings-arrow">›</span>
                    </button>
                    <button className="settings-item">
                      <div className="settings-left">
                        <span className="settings-icon">❓</span>
                        <span className="settings-label">도움말</span>
                      </div>
                      <span className="settings-arrow">›</span>
                    </button>
                    <button className="settings-item">
                      <div className="settings-left">
                        <span className="settings-icon">✉️</span>
                        <span className="settings-label">문의하기</span>
                      </div>
                      <span className="settings-arrow">›</span>
                    </button>
                  </div>
                </section>
              </div>
            )}
          </main>
        </div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: var(--warm-gray);
          padding-bottom: 80px;
        }

        .main-layout {
          flex: 1;
        }

        .layout-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--space-2xl);
          display: grid;
          grid-template-columns: 320px 1fr;
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
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: var(--space-2xl);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
        }

        .profile-card {
          text-align: center;
        }

        .profile-header {
          margin-bottom: var(--space-xl);
        }

        .avatar-container {
          width: 100px;
          height: 100px;
          margin: 0 auto var(--space-md);
          border-radius: 50%;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 4px;
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          background: white;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          font-weight: 700;
          color: #667eea;
        }

        .profile-name {
          font-size: 22px;
          font-weight: 800;
          color: var(--gray-900);
          margin-bottom: var(--space-xs);
        }

        .profile-email {
          font-size: 14px;
          color: var(--gray-600);
        }

        .quick-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
          padding: var(--space-lg);
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-radius: 16px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-icon {
          font-size: 24px;
          margin-bottom: var(--space-xs);
        }

        .stat-value {
          font-size: 16px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-xs);
        }

        .stat-label {
          font-size: 12px;
          color: var(--gray-600);
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .btn-primary, .btn-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: var(--gray-100);
          color: var(--gray-700);
        }

        .btn-secondary:hover {
          background: var(--gray-200);
        }

        .btn-icon {
          font-size: 16px;
        }

        /* Main Content */
        .main-content {
          min-width: 0;
        }

        .tab-navigation {
          display: flex;
          gap: var(--space-sm);
          margin-bottom: var(--space-2xl);
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          padding: var(--space-sm);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .tab-item {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-xs);
          padding: var(--space-md);
          background: transparent;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: var(--gray-600);
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-item:hover {
          background: rgba(102, 126, 234, 0.1);
          color: var(--gray-900);
        }

        .tab-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .tab-icon {
          font-size: 18px;
        }

        .tab-content {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .content-section {
          margin-bottom: var(--space-2xl);
        }

        .section-header {
          margin-bottom: var(--space-xl);
        }

        .section-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--gray-900);
        }

        /* Badges */
        .badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: var(--space-md);
        }

        .badge-card {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%);
          border: 2px solid rgba(255, 215, 0, 0.3);
          border-radius: 16px;
          padding: var(--space-lg);
          text-align: center;
          transition: all 0.2s;
        }

        .badge-card:hover {
          transform: translateY(-2px) rotate(2deg);
          box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
        }

        .badge-emoji {
          font-size: 36px;
          margin-bottom: var(--space-xs);
        }

        .badge-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--gray-700);
        }

        /* Bio */
        .bio-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          padding: var(--space-xl);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .bio-text {
          font-size: 15px;
          line-height: 1.8;
          color: var(--gray-700);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-md);
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          padding: var(--space-xl);
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          transition: all 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        }

        .stat-number {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: var(--space-xs);
        }

        .stat-number.blue { color: #3b82f6; }
        .stat-number.green { color: #10b981; }
        .stat-number.red { color: #ef4444; }
        .stat-number.purple { color: #8b5cf6; }

        .stat-label {
          font-size: 14px;
          color: var(--gray-600);
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

        /* Settings List */
        .settings-list {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .settings-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: var(--space-lg);
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          cursor: pointer;
          transition: all 0.2s;
        }

        .settings-item:last-child {
          border-bottom: none;
        }

        .settings-item:hover {
          background: rgba(102, 126, 234, 0.05);
        }

        .settings-left {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .settings-icon {
          font-size: 20px;
        }

        .settings-label {
          font-size: 15px;
          font-weight: 600;
          color: var(--gray-900);
        }

        .settings-arrow {
          font-size: 24px;
          color: var(--gray-400);
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

          .tab-navigation {
            overflow-x: auto;
            scrollbar-width: none;
          }

          .tab-navigation::-webkit-scrollbar {
            display: none;
          }

          .tab-item {
            white-space: nowrap;
          }

          .badges-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  )
}
