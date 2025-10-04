'use client';

import React from 'react';

export interface SignupButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  children: React.ReactNode;
}

const SignupButton: React.FC<SignupButtonProps> = ({
  variant = 'primary',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`signup-button ${variant} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {children}
      <style jsx>{`
        .signup-button {
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .signup-button.primary {
          background: #693BF2;
          color: white;
        }

        .signup-button.primary:hover:not(:disabled) {
          background: #5729d1;
        }

        .signup-button.secondary {
          background: #f3f4f6;
          color: #1a1a1a;
        }

        .signup-button.secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .signup-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </button>
  );
};

SignupButton.displayName = 'SignupButton';

export default SignupButton;
