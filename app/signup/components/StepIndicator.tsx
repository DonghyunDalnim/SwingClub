'use client';

import React from 'react';

export interface Step {
  number: number;
  label: string;
}

export interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
  steps: Step[];
}

const StepIndicator = React.memo<StepIndicatorProps>(({ currentStep, steps }) => {
  const getStepStatus = (stepNumber: number): 'completed' | 'in_progress' | 'pending' => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'in_progress';
    return 'pending';
  };

  const getStepColor = (status: string) => {
    const colorMap = {
      completed: '#10b981', // 초록색
      in_progress: '#667eea', // 보라색
      pending: '#d1d5db', // 회색
    };
    return colorMap[status as keyof typeof colorMap];
  };

  return (
    <>
      <div className="step-indicator" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={3}>
        {steps.map((step, index) => {
          const status = getStepStatus(step.number);
          const isLastStep = index === steps.length - 1;

          return (
            <div key={step.number} className="step-item">
              {/* Step Circle */}
              <div className={`step-circle ${status}`}>
                {status === 'completed' ? (
                  <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="step-number">{step.number}</span>
                )}
              </div>

              {/* Step Label */}
              <div className={`step-label ${status}`}>
                {step.label}
              </div>

              {/* Connector Line */}
              {!isLastStep && (
                <div className="connector-container">
                  <div className={`connector-line ${status}`}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .step-indicator {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 8px;
          padding: 24px 0;
          margin: 0 auto;
          max-width: 600px;
        }

        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }

        .step-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 2;
        }

        .step-circle.completed {
          background: #10b981;
          color: white;
          animation: pulse 0.5s ease-out;
        }

        .step-circle.in_progress {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          animation: glow 2s ease-in-out infinite;
        }

        .step-circle.pending {
          background: #f3f4f6;
          color: #9ca3af;
          border: 2px solid #e5e7eb;
        }

        .check-icon {
          width: 24px;
          height: 24px;
        }

        .step-number {
          font-size: 18px;
        }

        .step-label {
          margin-top: 12px;
          font-size: 14px;
          font-weight: 600;
          text-align: center;
          transition: color 0.3s ease;
          white-space: nowrap;
        }

        .step-label.completed {
          color: #10b981;
        }

        .step-label.in_progress {
          color: #667eea;
        }

        .step-label.pending {
          color: #9ca3af;
        }

        .connector-container {
          position: absolute;
          top: 24px;
          left: calc(50% + 24px);
          right: calc(-50% + 24px);
          height: 4px;
          z-index: 1;
        }

        .connector-line {
          height: 100%;
          border-radius: 2px;
          transition: all 0.5s ease-in-out;
        }

        .connector-line.completed {
          background: linear-gradient(90deg, #10b981 0%, #10b981 100%);
          animation: fillLine 0.5s ease-out;
        }

        .connector-line.in_progress {
          background: linear-gradient(90deg, #667eea 0%, #d1d5db 100%);
        }

        .connector-line.pending {
          background: #e5e7eb;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }
          50% {
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
          }
        }

        @keyframes fillLine {
          from {
            transform: scaleX(0);
            transform-origin: left;
          }
          to {
            transform: scaleX(1);
            transform-origin: left;
          }
        }

        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .step-indicator {
            gap: 4px;
            padding: 16px 0;
          }

          .step-circle {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }

          .check-icon {
            width: 20px;
            height: 20px;
          }

          .step-number {
            font-size: 16px;
          }

          .step-label {
            font-size: 12px;
            margin-top: 8px;
          }

          .connector-container {
            top: 20px;
            left: calc(50% + 20px);
            right: calc(-50% + 20px);
            height: 3px;
          }
        }

        @media (max-width: 480px) {
          .step-circle {
            width: 36px;
            height: 36px;
            font-size: 14px;
          }

          .step-label {
            font-size: 11px;
          }
        }
      `}</style>
    </>
  );
});

StepIndicator.displayName = 'StepIndicator';

export default StepIndicator;
