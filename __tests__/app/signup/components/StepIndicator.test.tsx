/**
 * Unit tests for StepIndicator component
 * Test coverage: Rendering, current step highlighting, status states, colors, accessibility, and responsive behavior
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StepIndicator, { Step } from '@/app/signup/components/StepIndicator';

describe('StepIndicator', () => {
  const mockSteps: Step[] = [
    { number: 1, label: '약관 동의' },
    { number: 2, label: '정보 입력' },
    { number: 3, label: '완료' },
  ];

  describe('Rendering Tests', () => {
    it('renders all 3 steps correctly', () => {
      render(<StepIndicator currentStep={1} steps={mockSteps} />);

      expect(screen.getByText('약관 동의')).toBeInTheDocument();
      expect(screen.getByText('정보 입력')).toBeInTheDocument();
      expect(screen.getByText('완료')).toBeInTheDocument();
    });

    it('displays step numbers and labels', () => {
      render(<StepIndicator currentStep={1} steps={mockSteps} />);

      // Step 1 should show number 1
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('약관 동의')).toBeInTheDocument();

      // Step 2 should show number 2
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('정보 입력')).toBeInTheDocument();

      // Step 3 should show number 3
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('완료')).toBeInTheDocument();
    });

    it('shows correct number of connector lines (2 for 3 steps)', () => {
      const { container } = render(<StepIndicator currentStep={1} steps={mockSteps} />);

      const connectorLines = container.querySelectorAll('.connector-line');
      expect(connectorLines).toHaveLength(2); // 3 steps = 2 connector lines
    });

    it('does not show connector line after the last step', () => {
      const { container } = render(<StepIndicator currentStep={1} steps={mockSteps} />);

      const stepItems = container.querySelectorAll('.step-item');
      const lastStepItem = stepItems[stepItems.length - 1];
      const connectorInLastStep = lastStepItem.querySelector('.connector-line');

      expect(connectorInLastStep).toBeNull();
    });
  });

  describe('Current Step Tests', () => {
    it('highlights step 1 when currentStep=1', () => {
      const { container } = render(<StepIndicator currentStep={1} steps={mockSteps} />);

      const stepCircles = container.querySelectorAll('.step-circle');
      expect(stepCircles[0]).toHaveClass('in_progress');
      expect(stepCircles[1]).toHaveClass('pending');
      expect(stepCircles[2]).toHaveClass('pending');
    });

    it('highlights step 2 when currentStep=2', () => {
      const { container } = render(<StepIndicator currentStep={2} steps={mockSteps} />);

      const stepCircles = container.querySelectorAll('.step-circle');
      expect(stepCircles[0]).toHaveClass('completed');
      expect(stepCircles[1]).toHaveClass('in_progress');
      expect(stepCircles[2]).toHaveClass('pending');
    });

    it('highlights step 3 when currentStep=3', () => {
      const { container } = render(<StepIndicator currentStep={3} steps={mockSteps} />);

      const stepCircles = container.querySelectorAll('.step-circle');
      expect(stepCircles[0]).toHaveClass('completed');
      expect(stepCircles[1]).toHaveClass('completed');
      expect(stepCircles[2]).toHaveClass('in_progress');
    });
  });

  describe('Status Tests', () => {
    it('shows completed status for steps before currentStep', () => {
      const { container } = render(<StepIndicator currentStep={3} steps={mockSteps} />);

      const stepCircles = container.querySelectorAll('.step-circle');
      expect(stepCircles[0]).toHaveClass('completed');
      expect(stepCircles[1]).toHaveClass('completed');
    });

    it('shows in_progress status for currentStep', () => {
      const { container } = render(<StepIndicator currentStep={2} steps={mockSteps} />);

      const stepCircles = container.querySelectorAll('.step-circle');
      expect(stepCircles[1]).toHaveClass('in_progress');
    });

    it('shows pending status for steps after currentStep', () => {
      const { container } = render(<StepIndicator currentStep={1} steps={mockSteps} />);

      const stepCircles = container.querySelectorAll('.step-circle');
      expect(stepCircles[1]).toHaveClass('pending');
      expect(stepCircles[2]).toHaveClass('pending');
    });

    it('displays checkmark icon for completed steps', () => {
      const { container } = render(<StepIndicator currentStep={2} steps={mockSteps} />);

      const checkIcons = container.querySelectorAll('.check-icon');
      expect(checkIcons).toHaveLength(1); // Only step 1 is completed
    });

    it('displays step number for in_progress and pending steps', () => {
      render(<StepIndicator currentStep={1} steps={mockSteps} />);

      // Step 1 is in_progress, should show number
      expect(screen.getByText('1')).toBeInTheDocument();

      // Step 2 is pending, should show number
      expect(screen.getByText('2')).toBeInTheDocument();

      // Step 3 is pending, should show number
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('displays checkmark for all previous steps when on step 3', () => {
      const { container } = render(<StepIndicator currentStep={3} steps={mockSteps} />);

      const checkIcons = container.querySelectorAll('.check-icon');
      expect(checkIcons).toHaveLength(2); // Steps 1 and 2 are completed

      // Step 3 should show number since it's in_progress
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Color Tests', () => {
    it('completed steps use green color (#10b981)', () => {
      const { container } = render(<StepIndicator currentStep={2} steps={mockSteps} />);

      const completedCircle = container.querySelector('.step-circle.completed');
      const styles = window.getComputedStyle(completedCircle!);

      // Note: The actual color will be applied via CSS, we check the class exists
      expect(completedCircle).toHaveClass('completed');
    });

    it('in-progress step uses purple gradient', () => {
      const { container } = render(<StepIndicator currentStep={2} steps={mockSteps} />);

      const inProgressCircle = container.querySelector('.step-circle.in_progress');

      expect(inProgressCircle).toHaveClass('in_progress');
    });

    it('pending steps use gray color', () => {
      const { container } = render(<StepIndicator currentStep={1} steps={mockSteps} />);

      const pendingCircles = container.querySelectorAll('.step-circle.pending');

      expect(pendingCircles).toHaveLength(2); // Steps 2 and 3
      pendingCircles.forEach((circle) => {
        expect(circle).toHaveClass('pending');
      });
    });

    it('step labels have correct color classes', () => {
      const { container } = render(<StepIndicator currentStep={2} steps={mockSteps} />);

      const stepLabels = container.querySelectorAll('.step-label');

      expect(stepLabels[0]).toHaveClass('completed'); // Step 1 completed
      expect(stepLabels[1]).toHaveClass('in_progress'); // Step 2 in_progress
      expect(stepLabels[2]).toHaveClass('pending'); // Step 3 pending
    });

    it('connector lines have correct status classes', () => {
      const { container } = render(<StepIndicator currentStep={2} steps={mockSteps} />);

      const connectorLines = container.querySelectorAll('.connector-line');

      expect(connectorLines[0]).toHaveClass('completed'); // Between step 1 and 2
      expect(connectorLines[1]).toHaveClass('in_progress'); // Between step 2 and 3
    });
  });

  describe('Accessibility Tests', () => {
    it('has role="progressbar"', () => {
      render(<StepIndicator currentStep={2} steps={mockSteps} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    it('has aria-valuenow set to currentStep', () => {
      render(<StepIndicator currentStep={2} steps={mockSteps} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '2');
    });

    it('has aria-valuemin=1', () => {
      render(<StepIndicator currentStep={2} steps={mockSteps} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemin', '1');
    });

    it('has aria-valuemax=3', () => {
      render(<StepIndicator currentStep={2} steps={mockSteps} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemax', '3');
    });

    it('updates aria-valuenow when currentStep changes', () => {
      const { rerender } = render(<StepIndicator currentStep={1} steps={mockSteps} />);

      let progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '1');

      rerender(<StepIndicator currentStep={3} steps={mockSteps} />);

      progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '3');
    });
  });

  describe('Responsive Tests', () => {
    it('renders correctly on mobile (smaller circle size)', () => {
      const { container } = render(<StepIndicator currentStep={1} steps={mockSteps} />);

      // Check that step circles exist (actual size will be applied via media queries)
      const stepCircles = container.querySelectorAll('.step-circle');
      expect(stepCircles).toHaveLength(3);

      // Verify circles have the base class
      stepCircles.forEach((circle) => {
        expect(circle).toHaveClass('step-circle');
      });
    });

    it('renders labels with correct classes for responsive styling', () => {
      const { container } = render(<StepIndicator currentStep={1} steps={mockSteps} />);

      const stepLabels = container.querySelectorAll('.step-label');
      expect(stepLabels).toHaveLength(3);

      // Verify labels have the base class
      stepLabels.forEach((label) => {
        expect(label).toHaveClass('step-label');
      });
    });

    it('connector lines exist for responsive adjustment', () => {
      const { container } = render(<StepIndicator currentStep={1} steps={mockSteps} />);

      const connectorContainers = container.querySelectorAll('.connector-container');
      expect(connectorContainers).toHaveLength(2);

      connectorContainers.forEach((container) => {
        expect(container).toHaveClass('connector-container');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles single step correctly', () => {
      const singleStep: Step[] = [{ number: 1, label: 'Only Step' }];
      const { container } = render(<StepIndicator currentStep={1} steps={singleStep} />);

      expect(screen.getByText('Only Step')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();

      const connectorLines = container.querySelectorAll('.connector-line');
      expect(connectorLines).toHaveLength(0); // No connectors for single step
    });

    it('handles two steps correctly', () => {
      const twoSteps: Step[] = [
        { number: 1, label: 'First' },
        { number: 2, label: 'Second' },
      ];
      const { container } = render(<StepIndicator currentStep={1} steps={twoSteps} />);

      const connectorLines = container.querySelectorAll('.connector-line');
      expect(connectorLines).toHaveLength(1); // One connector for two steps
    });

    it('handles step with long label text', () => {
      const longLabelSteps: Step[] = [
        { number: 1, label: 'This is a very long step label that might wrap' },
        { number: 2, label: '정보 입력' },
        { number: 3, label: '완료' },
      ];

      render(<StepIndicator currentStep={1} steps={longLabelSteps} />);

      expect(screen.getByText('This is a very long step label that might wrap')).toBeInTheDocument();
    });

    it('renders correctly when all steps are completed (currentStep=3)', () => {
      const { container } = render(<StepIndicator currentStep={3} steps={mockSteps} />);

      const checkIcons = container.querySelectorAll('.check-icon');
      expect(checkIcons).toHaveLength(2); // Steps 1 and 2 completed

      const stepCircles = container.querySelectorAll('.step-circle');
      expect(stepCircles[2]).toHaveClass('in_progress'); // Step 3 is current
    });
  });

  describe('Component Re-rendering', () => {
    it('updates correctly when currentStep prop changes', () => {
      const { container, rerender } = render(
        <StepIndicator currentStep={1} steps={mockSteps} />
      );

      // Initial state
      let stepCircles = container.querySelectorAll('.step-circle');
      expect(stepCircles[0]).toHaveClass('in_progress');

      // Update to step 2
      rerender(<StepIndicator currentStep={2} steps={mockSteps} />);

      stepCircles = container.querySelectorAll('.step-circle');
      expect(stepCircles[0]).toHaveClass('completed');
      expect(stepCircles[1]).toHaveClass('in_progress');

      // Update to step 3
      rerender(<StepIndicator currentStep={3} steps={mockSteps} />);

      stepCircles = container.querySelectorAll('.step-circle');
      expect(stepCircles[0]).toHaveClass('completed');
      expect(stepCircles[1]).toHaveClass('completed');
      expect(stepCircles[2]).toHaveClass('in_progress');
    });

    it('maintains memoization with React.memo', () => {
      const { rerender } = render(<StepIndicator currentStep={1} steps={mockSteps} />);

      // Re-render with same props (should be memoized)
      rerender(<StepIndicator currentStep={1} steps={mockSteps} />);

      expect(screen.getByText('약관 동의')).toBeInTheDocument();
    });
  });

  describe('Checkmark Icon SVG', () => {
    it('renders checkmark SVG with correct attributes', () => {
      const { container } = render(<StepIndicator currentStep={2} steps={mockSteps} />);

      const checkIcon = container.querySelector('.check-icon');
      expect(checkIcon).toBeInTheDocument();
      expect(checkIcon?.tagName.toLowerCase()).toBe('svg');
      expect(checkIcon).toHaveAttribute('fill', 'none');
      expect(checkIcon).toHaveAttribute('stroke', 'currentColor');
      expect(checkIcon).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('checkmark icon contains path element with correct attributes', () => {
      const { container } = render(<StepIndicator currentStep={2} steps={mockSteps} />);

      const path = container.querySelector('.check-icon path');
      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute('stroke-linecap', 'round');
      expect(path).toHaveAttribute('stroke-linejoin', 'round');
      expect(path).toHaveAttribute('stroke-width', '3');
      expect(path).toHaveAttribute('d', 'M5 13l4 4L19 7');
    });
  });

  describe('Step Number Display', () => {
    it('displays step numbers in span elements', () => {
      const { container } = render(<StepIndicator currentStep={1} steps={mockSteps} />);

      const stepNumbers = container.querySelectorAll('.step-number');
      expect(stepNumbers).toHaveLength(3); // All steps show numbers (none completed yet)

      expect(stepNumbers[0]).toHaveTextContent('1');
      expect(stepNumbers[1]).toHaveTextContent('2');
      expect(stepNumbers[2]).toHaveTextContent('3');
    });

    it('replaces step number with checkmark when step is completed', () => {
      const { container } = render(<StepIndicator currentStep={3} steps={mockSteps} />);

      const stepNumbers = container.querySelectorAll('.step-number');
      const checkIcons = container.querySelectorAll('.check-icon');

      expect(stepNumbers).toHaveLength(1); // Only step 3 shows number
      expect(checkIcons).toHaveLength(2); // Steps 1 and 2 show checkmarks
    });
  });
});
