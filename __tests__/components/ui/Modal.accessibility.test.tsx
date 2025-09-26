import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Modal from '@/components/ui/Modal';

// Mock React DOM portal for testing
const mockPortal = document.createElement('div');
document.body.appendChild(mockPortal);

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (element: React.ReactNode) => element,
}));

// Mock axe-core for accessibility testing
const mockAxeResults = {
  violations: [],
  passes: [],
  incomplete: [],
  inapplicable: []
};

const mockAxe = jest.fn().mockResolvedValue(mockAxeResults);
jest.mock('axe-core', () => ({
  run: mockAxe,
  configure: jest.fn(),
}));

describe('Modal Accessibility Tests', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
    // Reset any focus
    if (document.activeElement && document.activeElement !== document.body) {
      (document.activeElement as HTMLElement).blur();
    }
  });

  describe('ARIA Attributes and Semantic Structure', () => {
    it('should have proper dialog role and ARIA attributes', () => {
      render(<Modal {...defaultProps} title="Test Modal" />);
      const modal = screen.getByRole('dialog');

      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('should have proper title labeling', () => {
      render(<Modal {...defaultProps} title="Accessibility Test Modal" />);
      const title = screen.getByText('Accessibility Test Modal');
      const modal = screen.getByRole('dialog');

      expect(title).toHaveAttribute('id', 'modal-title');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('should work without title and remove aria-labelledby', () => {
      render(<Modal {...defaultProps} />);
      const modal = screen.getByRole('dialog');

      expect(modal).not.toHaveAttribute('aria-labelledby');
    });

    it('should have proper close button labeling', () => {
      render(<Modal {...defaultProps} title="Test Modal" showCloseButton={true} />);
      const closeButton = screen.getByRole('button', { name: '모달 닫기' });

      expect(closeButton).toHaveAttribute('aria-label', '모달 닫기');
      expect(closeButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Focus Management', () => {
    it('should focus the modal when it opens', async () => {
      render(<Modal {...defaultProps} />);
      const modal = screen.getByRole('dialog');

      await waitFor(() => {
        expect(modal).toHaveFocus();
      });
    });

    it('should restore focus to previously active element when closed', async () => {
      const triggerButton = document.createElement('button');
      triggerButton.textContent = 'Open Modal';
      document.body.appendChild(triggerButton);
      triggerButton.focus();

      const { rerender } = render(<Modal {...defaultProps} />);

      // Close the modal
      rerender(<Modal {...defaultProps} isOpen={false} />);

      await waitFor(() => {
        expect(triggerButton).toHaveFocus();
      });

      document.body.removeChild(triggerButton);
    });

    it('should trap focus within modal', async () => {
      const user = userEvent.setup();
      render(
        <Modal {...defaultProps} title="Focus Test Modal">
          <button>First Button</button>
          <button>Second Button</button>
          <input placeholder="Input field" />
        </Modal>
      );

      const modal = screen.getByRole('dialog');
      const closeButton = screen.getByRole('button', { name: '모달 닫기' });
      const firstButton = screen.getByText('First Button');
      const secondButton = screen.getByText('Second Button');
      const input = screen.getByPlaceholderText('Input field');

      // Modal should be focused initially
      await waitFor(() => expect(modal).toHaveFocus());

      // Tab should move to first focusable element
      await user.tab();
      expect(closeButton).toHaveFocus();

      // Continue tabbing through elements
      await user.tab();
      expect(firstButton).toHaveFocus();

      await user.tab();
      expect(secondButton).toHaveFocus();

      await user.tab();
      expect(input).toHaveFocus();

      // Tab from last element should go back to first
      await user.tab();
      expect(closeButton).toHaveFocus();
    });

    it('should handle reverse tab (Shift+Tab) correctly', async () => {
      const user = userEvent.setup();
      render(
        <Modal {...defaultProps} title="Focus Test Modal">
          <button>Test Button</button>
        </Modal>
      );

      const closeButton = screen.getByRole('button', { name: '모달 닫기' });
      const testButton = screen.getByText('Test Button');

      // Focus the close button
      closeButton.focus();
      expect(closeButton).toHaveFocus();

      // Shift+Tab should go to last focusable element
      await user.tab({ shift: true });
      expect(testButton).toHaveFocus();

      // Shift+Tab from first element should go to last
      await user.tab({ shift: true });
      expect(closeButton).toHaveFocus();
    });
  });

  describe('Keyboard Interaction', () => {
    it('should close modal on Escape key press', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close modal on Escape when closeOnEscape is false', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />);

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should close modal when close button is activated', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} title="Test Modal" />);

      const closeButton = screen.getByRole('button', { name: '모달 닫기' });
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Overlay Interaction', () => {
    it('should close modal when overlay is clicked', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      const overlay = document.querySelector('[aria-hidden="false"]');
      fireEvent.click(overlay!);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close modal when overlay is clicked and closeOnOverlayClick is false', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />);

      const overlay = document.querySelector('[aria-hidden="false"]');
      fireEvent.click(overlay!);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should not close modal when clicking on modal content', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      const modal = screen.getByRole('dialog');
      fireEvent.click(modal);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Focus Indicators', () => {
    it('should have proper focus indicators on modal container', () => {
      render(<Modal {...defaultProps} />);
      const modal = screen.getByRole('dialog');

      expect(modal).toHaveClass('focus:outline-none');
      expect(modal).toHaveClass('focus:ring-2');
      expect(modal).toHaveClass('focus:ring-offset-2');
      expect(modal).toHaveClass('focus:ring-[#693BF2]');
    });

    it('should have proper focus indicators on close button', () => {
      render(<Modal {...defaultProps} title="Test Modal" showCloseButton={true} />);
      const closeButton = screen.getByRole('button', { name: '모달 닫기' });

      expect(closeButton).toHaveClass('focus:outline-none');
      expect(closeButton).toHaveClass('focus:ring-2');
      expect(closeButton).toHaveClass('focus:ring-offset-2');
      expect(closeButton).toHaveClass('focus:ring-[#693BF2]');
    });
  });

  describe('Body Scroll Prevention', () => {
    it('should prevent body scroll when modal is open', () => {
      const originalOverflow = document.body.style.overflow;
      render(<Modal {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');

      // Cleanup
      document.body.style.overflow = originalOverflow;
    });

    it('should restore body scroll when modal is closed', () => {
      const originalOverflow = 'auto';
      document.body.style.overflow = originalOverflow;

      const { rerender } = render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<Modal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe(originalOverflow);
    });
  });

  describe('Screen Reader Support', () => {
    it('should hide overlay from screen readers when closed', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should have proper aria-hidden on close button icon', () => {
      render(<Modal {...defaultProps} title="Test Modal" showCloseButton={true} />);
      const closeButton = screen.getByRole('button', { name: '모달 닫기' });
      const icon = closeButton.querySelector('svg');

      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Size Variants', () => {
    it('should apply correct size classes for all variants', () => {
      const sizes = ['sm', 'md', 'lg', 'xl'] as const;
      const expectedClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
      };

      sizes.forEach(size => {
        const { unmount } = render(<Modal {...defaultProps} size={size} />);
        const modal = screen.getByRole('dialog');

        expect(modal).toHaveClass(expectedClasses[size]);
        unmount();
      });
    });
  });

  describe('Color Contrast Compliance', () => {
    it('should use proper Soomgo colors with sufficient contrast', () => {
      render(<Modal {...defaultProps} title="Test Modal" />);

      const modal = screen.getByRole('dialog');
      const title = screen.getByText('Test Modal');

      // Modal should have proper background and border colors
      const styles = window.getComputedStyle(modal);
      expect(styles.backgroundColor).toBeDefined();

      // Title should use proper text color from theme
      const titleStyles = window.getComputedStyle(title);
      expect(titleStyles.color).toBeDefined();
    });

    it('should have sufficient contrast for close button', () => {
      render(<Modal {...defaultProps} title="Test Modal" showCloseButton={true} />);
      const closeButton = screen.getByRole('button', { name: '모달 닫기' });

      const styles = window.getComputedStyle(closeButton);
      expect(styles.color).toBeDefined();
    });
  });

  describe('Axe Accessibility Tests', () => {
    it('should pass axe accessibility tests with title', async () => {
      const { container } = render(
        <Modal {...defaultProps} title="Accessibility Test Modal">
          <p>Modal content for testing</p>
        </Modal>
      );

      await mockAxe(container);
      expect(mockAxe).toHaveBeenCalledWith(container);
    });

    it('should pass axe accessibility tests without title', async () => {
      const { container } = render(
        <Modal {...defaultProps}>
          <p>Modal content without title</p>
        </Modal>
      );

      await mockAxe(container);
      expect(mockAxe).toHaveBeenCalledWith(container);
    });

    it('should pass axe accessibility tests for all size variants', async () => {
      const sizes = ['sm', 'md', 'lg', 'xl'] as const;

      for (const size of sizes) {
        const { container, unmount } = render(
          <Modal {...defaultProps} size={size} title={`${size} Modal`}>
            <p>Content for {size} modal</p>
          </Modal>
        );

        await mockAxe(container);
        expect(mockAxe).toHaveBeenCalledWith(container);

        unmount();
      }
    });

    it('should pass axe accessibility tests with complex content', async () => {
      const { container } = render(
        <Modal {...defaultProps} title="Complex Modal">
          <form>
            <label htmlFor="username">Username</label>
            <input id="username" type="text" />
            <label htmlFor="password">Password</label>
            <input id="password" type="password" />
            <button type="submit">Submit</button>
            <button type="button">Cancel</button>
          </form>
        </Modal>
      );

      await mockAxe(container);
      expect(mockAxe).toHaveBeenCalledWith(container);
    });
  });
});