'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProductCard } from '@/components/marketplace/ProductCard'
import type { MarketplaceItem, ItemSearchFilters } from '@/lib/types/marketplace'
import { Timestamp } from 'firebase/firestore'
import Footer from '@/components/Footer'

// 더미 데이터 (실제로는 서버에서 가져올 데이터)
const mockProducts: MarketplaceItem[] = [
  {
    id: '1',
    title: '린디합 전용 댄스화 - 거의 새제품!',
    description: '한 번만 신고 보관만 했어요. 정가 15만원에서 8만원으로 판매합니다.',
    category: 'shoes',
    pricing: {
      price: 80000,
      currency: 'KRW',
      negotiable: true,
      tradeMethod: 'both'
    },
    specs: {
      condition: 'like_new',
      brand: '댄스프로',
      size: '250',
      color: '블랙'
    },
    location: {
      region: '강남구',
      district: '서울특별시 강남구',
      deliveryAvailable: true
    },
    stats: {
      views: 125,
      favorites: 8,
      inquiries: 3
    },
    metadata: {
      createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)), // 2시간 전
      updatedAt: Timestamp.fromDate(new Date()),
      sellerId: '댄스러버',
      status: 'available',
      featured: true,
      reported: false,
      tags: ['린디합', '댄스화', '새상품']
    },
    images: ['/images/placeholder-shoes.jpg']
  },
  {
    id: '2',
    title: '빈티지 스윙 드레스 판매합니다',
    description: '공연용으로 한번 착용했습니다. 사이즈 55, 상태 매우 좋아요.',
    category: 'clothing',
    pricing: {
      price: 45000,
      currency: 'KRW',
      negotiable: false,
      tradeMethod: 'direct'
    },
    specs: {
      condition: 'like_new',
      size: '55',
      color: '네이비',
      material: '폴리에스터'
    },
    location: {
      region: '홍대',
      district: '서울특별시 마포구',
      deliveryAvailable: false
    },
    stats: {
      views: 89,
      favorites: 12,
      inquiries: 5
    },
    metadata: {
      createdAt: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)), // 1일 전
      updatedAt: Timestamp.fromDate(new Date()),
      sellerId: '스윙걸23',
      status: 'available',
      featured: false,
      reported: false,
      tags: ['스윙', '드레스', '빈티지']
    },
    images: ['/images/placeholder-dress.jpg']
  },
  {
    id: '3',
    title: '스윙댄스 액세서리 세트',
    description: '모자, 넷타이, 헤어핀 세트로 판매합니다. 무대용으로 완벽합니다.',
    category: 'accessories',
    pricing: {
      price: 25000,
      currency: 'KRW',
      negotiable: true,
      tradeMethod: 'both'
    },
    specs: {
      condition: 'good',
      color: '브라운'
    },
    location: {
      region: '신촌',
      district: '서울특별시 서대문구',
      deliveryAvailable: true
    },
    stats: {
      views: 67,
      favorites: 6,
      inquiries: 2
    },
    metadata: {
      createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)), // 3일 전
      updatedAt: Timestamp.fromDate(new Date()),
      sellerId: '액세사랑',
      status: 'available',
      featured: false,
      reported: false,
      tags: ['액세서리', '세트', '무대용']
    },
    images: ['/images/placeholder-accessories.jpg']
  }
]

export default function MarketplacePage() {
  const router = useRouter()
  const [filteredProducts] = useState<MarketplaceItem[]>(mockProducts)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const handleCategoryClick = (category: string) => {
    switch (category) {
      case '전체':
        router.push('/');
        break;
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
        break;
    }
  };

  const productCategories = [
    { key: 'all', label: '전체', count: mockProducts.length },
    { key: 'shoes', label: '댄스화', count: mockProducts.filter(p => p.category === 'shoes').length },
    { key: 'clothing', label: '의류', count: mockProducts.filter(p => p.category === 'clothing').length },
    { key: 'accessories', label: '액세서리', count: mockProducts.filter(p => p.category === 'accessories').length },
  ];

  const filteredByCategory = activeCategory === 'all'
    ? filteredProducts
    : filteredProducts.filter(p => p.category === activeCategory);

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
                <button className="category-item active" onClick={() => handleCategoryClick('용품')}>
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

          {/* Main Content - 상품 목록 */}
          <main className="main-content">
            <section className="content-section">
              <div className="section-header">
                <h2 className="section-title">🛍️ 용품 장터</h2>
                <button
                  className="write-button"
                  onClick={() => router.push('/marketplace/write')}
                >
                  상품 등록
                </button>
              </div>

              {/* 카테고리 탭 */}
              <div className="category-tabs">
                {productCategories.map(cat => (
                  <button
                    key={cat.key}
                    className={`category-tab ${activeCategory === cat.key ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.key)}
                  >
                    {cat.label}
                    <span className="tab-count">{cat.count}</span>
                  </button>
                ))}
              </div>

              {/* 상품 그리드 */}
              {filteredByCategory.length > 0 ? (
                <div className="products-grid">
                  {filteredByCategory.map((product) => (
                    <ProductCard
                      key={product.id}
                      item={product}
                      showFavoriteButton={true}
                      onFavoriteClick={(itemId) => {
                        console.log('Favorite clicked:', itemId)
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🛍️</div>
                  <p className="empty-text">등록된 상품이 없습니다.</p>
                  <p className="empty-subtext">첫 번째 상품을 등록해보세요!</p>
                </div>
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

        .write-button {
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .write-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        /* Category Tabs */
        .category-tabs {
          display: flex;
          gap: var(--space-sm);
          margin-bottom: var(--space-xl);
          overflow-x: auto;
          padding-bottom: var(--space-xs);
        }

        .category-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
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

        .tab-count {
          font-size: 12px;
          opacity: 0.8;
        }

        /* Products Grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-lg);
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          border: 1.5px solid rgba(200, 200, 200, 0.2);
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: var(--space-lg);
        }

        .empty-text {
          font-size: 18px;
          font-weight: 600;
          color: var(--gray-900);
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

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-md);
          }

          .write-button {
            width: 100%;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}