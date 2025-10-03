'use client'

import React from 'react'
import Link from 'next/link'
import type { MarketplaceItem } from '@/lib/types/marketplace'
import { PRODUCT_CATEGORIES } from '@/lib/types/marketplace'

interface ProductCardProps {
  item: MarketplaceItem
  showFavoriteButton?: boolean
  onFavoriteClick?: (itemId: string) => void
  isFavorited?: boolean
  className?: string
}

export function ProductCard({
  item,
  showFavoriteButton = false,
  onFavoriteClick,
  isFavorited = false,
  className = ''
}: ProductCardProps) {

  // 시간 포맷팅
  const formatTimeAgo = (timestamp: any) => {
    const now = new Date()
    const createdAt = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const diff = now.getTime() - createdAt.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}분전`
    if (hours < 24) return `${hours}시간전`
    if (days < 7) return `${days}일전`
    return createdAt.toLocaleDateString()
  }

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  // 카테고리 아이콘 매핑
  const categoryIcons: Record<string, string> = {
    shoes: '👟',
    clothing: '👗',
    accessories: '🎪',
    other: '📱'
  }

  // 배지 결정
  const getBadge = () => {
    if (item.metadata.featured) return { icon: '🔥', type: 'HOT' }
    const hoursSinceCreated = (Date.now() - (item.metadata.createdAt.toDate ? item.metadata.createdAt.toDate().getTime() : Date.now())) / (1000 * 60 * 60)
    if (hoursSinceCreated < 24) return { icon: '✨', type: 'NEW' }
    return null
  }

  const badge = getBadge()
  const category = PRODUCT_CATEGORIES[item.category] || '기타'

  return (
    <Link href={`/marketplace/${item.id}`} className={`product-card ${className}`}>
      {/* 카드 배경 글로우 */}
      <div className="card-glow"></div>

      <div className="card-inner">
        {/* 상단: 배지 & 카테고리 */}
        <div className="card-header">
          <div className="category-badge">
            <span className="category-icon">
              {categoryIcons[item.category] || '🎪'}
            </span>
            <span className="category-text">{category}</span>
          </div>

          {badge && (
            <div className="special-badge">
              <span className="badge-icon">{badge.icon}</span>
            </div>
          )}
        </div>

        {/* 제목 */}
        <h3 className="card-title">{item.title}</h3>

        {/* 판매자 정보 */}
        <div className="seller-info">
          <div className="seller-avatar">
            <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="seller-name">{item.metadata.sellerId}</span>
          <div className="rating">
            <svg className="star-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <strong>4.8</strong>
          </div>
        </div>

        {/* 설명 */}
        <p className="card-description">{item.description}</p>

        {/* 하단: 가격 & 마감일 */}
        <div className="card-footer">
          <div className="price-section">
            <span className="price-label">가격</span>
            <span className="price">{formatPrice(item.pricing.price)}원</span>
          </div>

          <div className="deadline">
            <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTimeAgo(item.metadata.createdAt)}</span>
          </div>
        </div>

        {/* 액션 버튼 */}
        <button className="action-button">
          <span>자세히 보기</span>
          <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      <style jsx>{`
        :global(a.product-card) {
          text-decoration: none !important;
        }

        .product-card {
          position: relative;
          display: block;
          text-decoration: none;
          animation: fadeInUp 0.6s ease-out backwards;
        }

        .product-card * {
          text-decoration: none !important;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card-glow {
          position: absolute;
          inset: -3px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 24px;
          opacity: 0;
          filter: blur(20px);
          transition: opacity 0.4s;
          z-index: -1;
        }

        .product-card:hover .card-glow {
          opacity: 0.4;
        }

        .card-inner {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(30px) saturate(180%);
          border: 2px solid rgba(255, 255, 255, 0.9);
          border-radius: 24px;
          padding: var(--space-xl);
          box-shadow:
            0 10px 40px rgba(31, 38, 135, 0.12),
            inset 0 2px 4px rgba(255, 255, 255, 0.9);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .card-inner::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.6s;
        }

        .product-card:hover .card-inner::before {
          left: 100%;
        }

        .product-card:hover .card-inner {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(102, 126, 234, 0.5);
          transform: translateY(-12px) scale(1.02);
          box-shadow:
            0 20px 60px rgba(102, 126, 234, 0.25),
            inset 0 2px 4px rgba(255, 255, 255, 1);
        }

        /* 헤더 */
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-lg);
        }

        .category-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
          border: 1.5px solid rgba(102, 126, 234, 0.3);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .category-icon {
          font-size: 18px;
        }

        .category-text {
          font-size: 13px;
          font-weight: 700;
          color: #667eea;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .special-badge {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border-radius: 50%;
          box-shadow: 0 4px 16px rgba(245, 87, 108, 0.4);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .badge-icon {
          font-size: 22px;
          animation: rotate 3s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* 제목 */
        .card-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--gray-900);
          line-height: 1.4;
          margin-bottom: var(--space-md);

          /* 2줄 ellipsis */
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;

          transition: all 0.3s;
        }

        .product-card:hover .card-title {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* 판매자 정보 */
        .seller-info {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-md);
          padding-bottom: var(--space-md);
          border-bottom: 1.5px solid rgba(102, 126, 234, 0.1);
        }

        .seller-avatar {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .seller-avatar .icon-sm {
          width: 18px;
          height: 18px;
          color: white;
        }

        .seller-name {
          flex: 1;
          font-size: 14px;
          font-weight: 600;
          color: var(--gray-900);
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: rgba(255, 215, 0, 0.15);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 8px;
        }

        .star-icon {
          width: 16px;
          height: 16px;
          color: #FFD700;
          filter: drop-shadow(0 2px 4px rgba(255, 215, 0, 0.5));
        }

        .rating strong {
          font-size: 13px;
          font-weight: 700;
          color: var(--gray-900);
        }

        /* 설명 */
        .card-description {
          font-size: 14px;
          color: var(--gray-700);
          line-height: 1.7;
          margin-bottom: var(--space-lg);

          /* 3줄 ellipsis */
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* 푸터 */
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-md);
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-radius: 12px;
          margin-bottom: var(--space-lg);
        }

        .price-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .price-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--gray-600);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .price {
          font-size: 22px;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .deadline {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--gray-700);
        }

        .deadline .icon-sm {
          width: 16px;
          height: 16px;
          color: #667eea;
        }

        /* 액션 버튼 */
        .action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          width: 100%;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
          position: relative;
          overflow: hidden;
        }

        .action-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }

        .action-button:hover::before {
          left: 100%;
        }

        .action-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
        }

        .action-button:active {
          transform: translateY(-1px);
        }

        .action-button .icon-sm {
          width: 18px;
          height: 18px;
          transition: transform 0.3s;
        }

        .action-button:hover .icon-sm {
          transform: translateX(4px);
        }

        @media (max-width: 768px) {
          .card-inner {
            padding: var(--space-lg);
          }

          .card-title {
            font-size: 18px;
          }

          .price {
            font-size: 20px;
          }
        }
      `}</style>
    </Link>
  )
}

export default ProductCard