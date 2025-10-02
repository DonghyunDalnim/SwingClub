'use client';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h4 className="footer-title">Swing Connect</h4>
              <p className="footer-desc">
                국내 최고의 스윙댄스 플랫폼으로<br />
                더 나은 댄스 라이프를 제공합니다.
              </p>
            </div>

            <div className="footer-col">
              <h5 className="footer-heading">서비스</h5>
              <ul className="footer-links">
                <li><a href="#">레슨 찾기</a></li>
                <li><a href="#">파티 일정</a></li>
                <li><a href="#">공간 대여</a></li>
                <li><a href="#">용품 거래</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5 className="footer-heading">회사</h5>
              <ul className="footer-links">
                <li><a href="#">소개</a></li>
                <li><a href="#">채용</a></li>
                <li><a href="#">파트너십</a></li>
                <li><a href="#">블로그</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5 className="footer-heading">지원</h5>
              <ul className="footer-links">
                <li><a href="#">고객센터</a></li>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">이용약관</a></li>
                <li><a href="#">개인정보처리방침</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="copyright">© 2025 Swing Connect. All rights reserved.</p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Instagram">
                <svg className="icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              <a href="#" className="social-link" aria-label="Facebook">
                <svg className="icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              <a href="#" className="social-link" aria-label="YouTube">
                <svg className="icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: white;
          border-top: 1px solid var(--gray-200);
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--space-xl);
        }

        .footer-main {
          padding: var(--space-2xl) 0;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: var(--space-2xl);
          margin-bottom: var(--space-2xl);
        }

        .footer-title {
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: var(--space-md);
        }

        .footer-desc {
          font-size: 14px;
          color: var(--gray-600);
          line-height: 1.6;
        }

        .footer-heading {
          font-size: 14px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: var(--space-md);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .footer-links a {
          text-decoration: none;
          color: var(--gray-600);
          font-size: 14px;
          transition: color 0.2s;
        }

        .footer-links a:hover {
          color: #667eea;
        }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: var(--space-xl);
          border-top: 1px solid var(--gray-200);
        }

        .copyright {
          font-size: 13px;
          color: var(--gray-600);
        }

        .social-links {
          display: flex;
          gap: var(--space-md);
        }

        .social-link {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--gray-100);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray-600);
          transition: all 0.2s;
        }

        .social-link:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: translateY(-2px);
        }

        .icon {
          width: 18px;
          height: 18px;
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: var(--space-xl);
          }

          .footer-bottom {
            flex-direction: column;
            gap: var(--space-lg);
          }
        }
      `}</style>
    </footer>
  );
}
