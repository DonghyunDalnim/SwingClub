'use client';

import React from 'react';

export interface SignupButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'social-google';
  loading?: boolean;
  children: React.ReactNode;
  'data-testid'?: string;
}

const SignupButton = React.memo<SignupButtonProps>(
  ({ variant, loading = false, disabled, children, className = '', ...props }) => {
    const getVariantStyles = () => {
      const baseStyles = `
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        width: 100%;
        height: 56px;
        border: none;
        border-radius: 14px;
        font-size: 16px;
        font-weight: 700;
        cursor: ${disabled || loading ? 'not-allowed' : 'pointer'};
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        opacity: ${disabled || loading ? 0.6 : 1};
      `;

      const variantMap = {
        'primary': `
          ${baseStyles}
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
        `,
        'social-google': `
          ${baseStyles}
          background: linear-gradient(135deg, #4285f4 0%, #357ae8 100%);
          color: white;
          box-shadow: 0 4px 16px rgba(66, 133, 244, 0.3);
        `,
      };

      return variantMap[variant];
    };

    const getHoverStyles = () => {
      const hoverMap = {
        'primary': 'box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);',
        'social-google': 'box-shadow: 0 8px 24px rgba(66, 133, 244, 0.5);',
      };

      return hoverMap[variant];
    };

    const getIcon = () => {
      if (loading) {
        return <span className="spinner">⏳</span>;
      }

      const iconMap = {
        'primary': null,
        'social-google': '🔵',
      };

      const icon = iconMap[variant];
      return icon ? <span style={{ fontSize: '24px' }}>{icon}</span> : null;
    };

    return (
      <>
        <button
          className={`signup-button ${className}`}
          disabled={disabled || loading}
          aria-busy={loading}
          aria-label={loading ? '로딩 중...' : props['aria-label']}
          data-testid={props['data-testid']}
          {...props}
        >
          {getIcon()}
          <span>{loading ? '로딩 중...' : children}</span>
          {loading && <span data-testid="loading-spinner" style={{ display: 'none' }} />}
        </button>

        <style jsx>{`
          .signup-button {
            ${getVariantStyles()}
          }

          .signup-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s;
          }

          .signup-button:hover::before {
            left: 100%;
          }

          .signup-button:not(:disabled):hover {
            transform: translateY(-3px) scale(1.02);
            ${getHoverStyles()}
          }

          .signup-button:not(:disabled):active {
            transform: translateY(-1px) scale(0.98);
          }

          .signup-button:focus-visible {
            outline: none;
            ring: 2px solid #693BF2;
            ring-offset: 2px;
          }

          .spinner {
            display: inline-block;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @media (max-width: 768px) {
            .signup-button {
              height: 52px;
              font-size: 15px;
            }
          }
        `}</style>
      </>
    );
  }
);

SignupButton.displayName = 'SignupButton';

export default SignupButton;
