'use client';

interface StoryCardProps {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  image: string;
  readTime: string;
}

export default function StoryCard({
  title,
  excerpt,
  author,
  date,
  image,
  readTime,
}: StoryCardProps) {
  return (
    <article className="story-card">
      <div className="story-image">
        <img src={image} alt={title} />
      </div>

      <div className="story-content">
        <h3 className="story-title">{title}</h3>
        <p className="story-excerpt">{excerpt}</p>

        <div className="story-meta">
          <div className="author">
            <div className="author-avatar">
              {author.charAt(0)}
            </div>
            <span className="author-name">{author}</span>
          </div>

          <div className="story-info">
            <span className="date">{date}</span>
            <span className="divider">•</span>
            <span className="read-time">{readTime}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .story-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          overflow: hidden;
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          transition: all 0.3s;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }

        .story-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(102, 126, 234, 0.15);
        }

        .story-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
        }

        .story-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .story-card:hover .story-image img {
          transform: scale(1.05);
        }

        .story-content {
          padding: var(--space-lg);
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .story-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-sm);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .story-excerpt {
          font-size: 14px;
          color: var(--gray-600);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .story-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: var(--space-md);
          border-top: 1px solid var(--gray-200);
        }

        .author {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .author-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }

        .author-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--gray-700);
        }

        .story-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--gray-600);
        }

        .divider {
          color: var(--gray-400);
        }
      `}</style>
    </article>
  );
}
