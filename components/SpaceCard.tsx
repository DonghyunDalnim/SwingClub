'use client';

interface SpaceCardProps {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  image: string;
  price: string;
  location: string;
  tags: string[];
}

export default function SpaceCard({
  name,
  category,
  rating,
  reviews,
  image,
  price,
  location,
  tags,
}: SpaceCardProps) {
  return (
    <div className="space-card">
      <div className="card-image">
        <img src={image} alt={name} />
        <div className="card-badge">{category}</div>
      </div>

      <div className="card-content">
        <h3 className="card-title">{name}</h3>

        <div className="card-meta">
          <div className="rating">
            <span className="star">⭐</span>
            <span className="rating-value">{rating}</span>
            <span className="reviews">({reviews})</span>
          </div>
          <div className="location">
            <span className="location-icon">📍</span>
            <span>{location}</span>
          </div>
        </div>

        <div className="card-tags">
          {tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="card-footer">
          <div className="price">
            <span className="price-label">시작가</span>
            <span className="price-value">{price}</span>
          </div>
          <button className="card-button">자세히 보기</button>
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

        .card-image {
          position: relative;
          width: 100%;
          height: 240px;
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .space-card:hover .card-image img {
          transform: scale(1.1);
        }

        .card-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .card-content {
          padding: var(--space-xl);
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
          justify-content: space-between;
          margin-bottom: var(--space-md);
          padding-bottom: var(--space-md);
          border-bottom: 1px solid var(--gray-200);
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
        }

        .star {
          font-size: 16px;
        }

        .rating-value {
          font-weight: 700;
          color: var(--gray-900);
        }

        .reviews {
          color: var(--gray-600);
        }

        .location {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: var(--gray-600);
        }

        .location-icon {
          font-size: 14px;
        }

        .card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: var(--space-lg);
        }

        .tag {
          padding: 4px 12px;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-md);
        }

        .price {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .price-label {
          font-size: 12px;
          color: var(--gray-600);
        }

        .price-value {
          font-size: 18px;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .card-button {
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .card-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }
      `}</style>
    </div>
  );
}
