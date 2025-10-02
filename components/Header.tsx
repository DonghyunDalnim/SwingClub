'use client';

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-left">
            <a href="/" className="logo">
              <span className="logo-icon">🎺</span>
              <span className="logo-text">Swing Connect</span>
            </a>
          </div>

          <nav className="header-nav">
            <a href="/community" className="nav-link">커뮤니티</a>
            <a href="/location" className="nav-link">장소</a>
            <a href="/marketplace" className="nav-link">장터</a>
          </nav>

          <div className="header-right">
            <button className="button button-outline">로그인</button>
            <button className="button button-primary">시작하기</button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(200, 200, 200, 0.2);
          padding: var(--space-md) 0;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--space-xl);
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-xl);
        }

        .header-left {
          flex-shrink: 0;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          text-decoration: none;
          transition: transform 0.2s;
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .logo-icon {
          font-size: 32px;
        }

        .logo-text {
          font-size: 20px;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: var(--space-xl);
          flex: 1;
          justify-content: center;
        }

        .nav-link {
          text-decoration: none;
          color: var(--gray-700);
          font-weight: 600;
          font-size: 15px;
          transition: color 0.2s;
          position: relative;
        }

        .nav-link:hover {
          color: #667eea;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transform: scaleX(0);
          transition: transform 0.2s;
        }

        .nav-link:hover::after {
          transform: scaleX(1);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: var(--space-md);
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

        .button-outline {
          background: transparent;
          border: 1.5px solid var(--gray-300);
          color: var(--gray-700);
        }

        .button-outline:hover {
          background: var(--gray-100);
          border-color: var(--gray-400);
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

        @media (max-width: 768px) {
          .header-nav {
            display: none;
          }

          .button-outline {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
