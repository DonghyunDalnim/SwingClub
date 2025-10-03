'use client';

interface SpaceCardProps {
  id: string;
  title: string;
  category: string;
  requests: number;
  rating: number;
  tags: string[];
  rank?: number;
}

const categoryGradients: Record<string, string> = {
  '레슨': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  '파티': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  '매칭': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  '용품': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
};

const categoryIcons: Record<string, string> = {
  '레슨': '📚',
  '파티': '🎉',
  '매칭': '🤝',
  '용품': '🛍️',
};

export default function SpaceCard({
  title,
  category,
  requests,
  rating,
  tags,
  rank,
}: SpaceCardProps) {
  return (
    <div className="space-card">
      <div className="card-header">
        <div
          className="category-badge"
          style={{ background: categoryGradients[category] || categoryGradients['레슨'] }}
        >
          <span className="category-icon">{categoryIcons[category] || '📚'}</span>
        </div>
        {rank === 1 && (
          <div className="rank-badge">
            <span className="rank-icon">👑</span>
            <span className="rank-text">1위</span>
          </div>
        )}
      </div>

      <div className="card-content">
        <div className="category-label">{category}</div>
        <h3 className="card-title">{title}</h3>

        <div className="card-meta">
          <div className="meta-item">
            <span className="meta-icon">👥</span>
            <span className="meta-text">{requests.toLocaleString()} 요청</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">⭐</span>
            <span className="meta-text">{rating}</span>
          </div>
        </div>

        <div className="card-tags">
          {tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .space-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          overflow: hidden;
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transition: all 0.3s;
          cursor: pointer;
        }

        .space-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 32px rgba(102, 126, 234, 0.2);
        }

        .card-header {
          padding: var(--space-lg);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .category-badge {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .category-icon {
          font-size: 24px;
        }

        .rank-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
        }

        .rank-icon {
          font-size: 16px;
        }

        .rank-text {
          font-size: 12px;
          font-weight: 700;
          color: white;
        }

        .card-content {
          padding: 0 var(--space-lg) var(--space-lg);
        }

        .category-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--gray-600);
          margin-bottom: var(--space-xs);
        }

        .card-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-md);
        }

        .card-meta {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          margin-bottom: var(--space-md);
          padding-bottom: var(--space-md);
          border-bottom: 1px solid var(--gray-200);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .meta-icon {
          font-size: 14px;
        }

        .meta-text {
          font-size: 13px;
          font-weight: 600;
          color: var(--gray-700);
        }

        .card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tag {
          padding: 4px 12px;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
