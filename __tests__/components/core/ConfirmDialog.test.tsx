/**
 * Comprehensive Unit Tests for ConfirmDialog Component
 * Issue #85 - 로그아웃 확인 다이얼로그 고도화
 *
 * Test Coverage:
 * 1. Component rendering (open/closed states)
 * 2. Backdrop click to close
 * 3. ESC key to close
 * 4. Close button functionality
 * 5. Confirm/Cancel button clicks
 * 6. Loading state behavior
 * 7. Focus trap functionality
 * 8. Accessibility (ARIA labels, roles)
 * 9. Danger vs Primary variants
 * 10. Body scroll lock
 * 11. Edge cases and error handling
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ConfirmDialog, ConfirmDialogProps } from '@/components/core/ConfirmDialog'

// Helper function to create default props
const createDefaultProps = (overrides?: Partial<ConfirmDialogProps>): ConfirmDialogProps => ({
  isOpen: false,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  title: 'Test Title',
  description: 'Test description',
  confirmText: '확인',
  cancelText: '취소',
  variant: 'primary',
  isLoading: false,
  ...overrides,
})

describe('ConfirmDialog Component', () => {
  // Reset mocks and DOM state before each test
  beforeEach(() => {
    jest.clearAllMocks()
    document.body.style.overflow = 'unset'
  })

  afterEach(() => {
    // Clean up any remaining dialogs
    document.body.style.overflow = 'unset'
  })

  describe('1. Component Rendering', () => {
    it('should not render when isOpen is false', () => {
      const props = createDefaultProps({ isOpen: false })
      const { container } = render(<ConfirmDialog {...props} />)

      expect(container.firstChild).toBeNull()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      const props = createDefaultProps({ isOpen: true })
      render(<ConfirmDialog {...props} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
    })

    it('should render without description when not provided', () => {
      const props = createDefaultProps({
        isOpen: true,
        description: undefined,
      })
      render(<ConfirmDialog {...props} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.queryByText('Test description')).not.toBeInTheDocument()
    })

    it('should render custom button text', () => {
      const props = createDefaultProps({
        isOpen: true,
        confirmText: 'Custom Confirm',
        cancelText: 'Custom Cancel',
      })
      render(<ConfirmDialog {...props} />)

      expect(screen.getByText('Custom Confirm')).toBeInTheDocument()
      expect(screen.getByText('Custom Cancel')).toBeInTheDocument()
    })

    it('should render default button text when not provided', () => {
      const props = createDefaultProps({
        isOpen: true,
        confirmText: undefined,
        cancelText: undefined,
      })
      render(<ConfirmDialog {...props} />)

      expect(screen.getByText('확인')).toBeInTheDocument()
      expect(screen.getByText('취소')).toBeInTheDocument()
    })
  })

  describe('2. Backdrop Click to Close', () => {
    it('should call onClose when backdrop is clicked', () => {
      const onClose = jest.fn()
      const props = createDefaultProps({ isOpen: true, onClose })
      render(<ConfirmDialog {...props} />)

      const backdrop = screen.getByRole('dialog').querySelector('.absolute.inset-0')
      expect(backdrop).toBeInTheDocument()

      fireEvent.click(backdrop!)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should not call onClose when backdrop is clicked during loading', () => {
      const onClose = jest.fn()
      const props = createDefaultProps({ isOpen: true, onClose, isLoading: true })
      render(<ConfirmDialog {...props} />)

      const backdrop = screen.getByRole('dialog').querySelector('.absolute.inset-0')
      fireEvent.click(backdrop!)

      expect(onClose).not.toHaveBeenCalled()
    })

    it('should not close when dialog content is clicked', () => {
      const onClose = jest.fn()
      const props = createDefaultProps({ isOpen: true, onClose })
      render(<ConfirmDialog {...props} />)

      const dialogContent = screen.getByText('Test Title')
      fireEvent.click(dialogContent)

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('3. ESC Key to Close', () => {
    it('should call onClose when ESC key is pressed', () => {
      const onClose = jest.fn()
      const props = createDefaultProps({ isOpen: true, onClose })
      render(<ConfirmDialog {...props} />)

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should not call onClose when ESC is pressed during loading', () => {
      const onClose = jest.fn()
      const props = createDefaultProps({ isOpen: true, onClose, isLoading: true })
      render(<ConfirmDialog {...props} />)

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
      expect(onClose).not.toHaveBeenCalled()
    })

    it('should not call onClose when other keys are pressed', () => {
      const onClose = jest.fn()
      const props = createDefaultProps({ isOpen: true, onClose })
      render(<ConfirmDialog {...props} />)

      fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' })
      fireEvent.keyDown(document, { key: 'a', code: 'KeyA' })
      fireEvent.keyDown(document, { key: 'Space', code: 'Space' })

      expect(onClose).not.toHaveBeenCalled()
    })

    it('should not register ESC listener when dialog is closed', () => {
      const onClose = jest.fn()
      const props = createDefaultProps({ isOpen: false, onClose })
      render(<ConfirmDialog {...props} />)

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
      expect(onClose).not.toHaveBeenCalled()
    })

    it('should clean up ESC listener when component unmounts', () => {
      const onClose = jest.fn()
      const props = createDefaultProps({ isOpen: true, onClose })
      const { unmount } = render(<ConfirmDialog {...props} />)

      unmount()

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('4. Close Button Functionality', () => {
    it('should render close button with X icon', () => {
      const props = createDefaultProps({ isOpen: true })
      render(<ConfirmDialog {...props} />)

      const closeButton = screen.getByLabelText('닫기')
      expect(closeButton).toBeInTheDocument()
      expect(closeButton.tagName).toBe('BUTTON')
    })

    it('should call onClose when close button is clicked', () => {
      const onClose = jest.fn()
      const props = createDefaultProps({ isOpen: true, onClose })
      render(<ConfirmDialog {...props} />)

      const closeButton = screen.getByLabelText('닫기')
      fireEvent.click(closeButton)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should disable close button during loading', () => {
      const props = createDefaultProps({ isOpen: true, isLoading: true })
      render(<ConfirmDialog {...props} />)

      const closeButton = screen.getByLabelText('닫기')
      expect(closeButton).toBeDisabled()
    })

    it('should have proper focus styles on close button', () => {
      const props = createDefaultProps({ isOpen: true })
      render(<ConfirmDialog {...props} />)

      const closeButton = screen.getByLabelText('닫기')
      expect(closeButton).toHaveClass('focus:outline-none')
      expect(closeButton).toHaveClass('focus:ring-2')
      expect(closeButton).toHaveClass('focus:ring-[#693BF2]')
    })
  })

  describe('5. Confirm/Cancel Button Clicks', () => {
    it('should call onConfirm when confirm button is clicked', () => {
      const onConfirm = jest.fn()
      const props = createDefaultProps({ isOpen: true, onConfirm })
      render(<ConfirmDialog {...props} />)

      const confirmButton = screen.getByText('확인')
      fireEvent.click(confirmButton)

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when cancel button is clicked', () => {
      const onClose = jest.fn()
      const props = createDefaultProps({ isOpen: true, onClose })
      render(<ConfirmDialog {...props} />)

      const cancelButton = screen.getByText('취소')
      fireEvent.click(cancelButton)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should handle async onConfirm function', async () => {
      const onConfirm = jest.fn().mockResolvedValue(undefined)
      const props = createDefaultProps({ isOpen: true, onConfirm })
      render(<ConfirmDialog {...props} />)

      const confirmButton = screen.getByText('확인')
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledTimes(1)
      })
    })

    it('should disable confirm button during loading', () => {
      const props = createDefaultProps({ isOpen: true, isLoading: true })
      render(<ConfirmDialog {...props} />)

      const confirmButton = screen.getByText('처리 중...')
      expect(confirmButton).toBeDisabled()
    })

    it('should disable cancel button during loading', () => {
      const props = createDefaultProps({ isOpen: true, isLoading: true })
      render(<ConfirmDialog {...props} />)

      // Cancel button is inside Button component, get by role
      const cancelButton = screen.getByRole('button', { name: '취소' })
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('6. Loading State', () => {
    it('should show loading spinner and text when isLoading is true', () => {
      const props = createDefaultProps({ isOpen: true, isLoading: true })
      render(<ConfirmDialog {...props} />)

      expect(screen.getByText('처리 중...')).toBeInTheDocument()

      // Check for loading spinner (Loader2 icon)
      const confirmButton = screen.getByText('처리 중...')
      const spinner = confirmButton.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should hide loading state when isLoading is false', () => {
      const props = createDefaultProps({ isOpen: true, isLoading: false })
      render(<ConfirmDialog {...props} />)

      expect(screen.queryByText('처리 중...')).not.toBeInTheDocument()
      expect(screen.getByText('확인')).toBeInTheDocument()
    })

    it('should set aria-busy attribute on confirm button during loading', () => {
      const props = createDefaultProps({ isOpen: true, isLoading: true })
      render(<ConfirmDialog {...props} />)

      const confirmButton = screen.getByText('처리 중...')
      expect(confirmButton).toHaveAttribute('aria-busy', 'true')
    })

    it('should disable all interactive elements during loading', () => {
      const props = createDefaultProps({ isOpen: true, isLoading: true })
      render(<ConfirmDialog {...props} />)

      const closeButton = screen.getByLabelText('닫기')
      const cancelButton = screen.getByRole('button', { name: '취소' })
      const confirmButton = screen.getByText('처리 중...')

      expect(closeButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
      expect(confirmButton).toBeDisabled()
    })

    it('should change from loading to non-loading state', () => {
      const props = createDefaultProps({ isOpen: true, isLoading: true })
      const { rerender } = render(<ConfirmDialog {...props} />)

      expect(screen.getByText('처리 중...')).toBeInTheDocument()

      rerender(<ConfirmDialog {...props} isLoading={false} />)

      expect(screen.queryByText('처리 중...')).not.toBeInTheDocument()
      expect(screen.getByText('확인')).toBeInTheDocument()
    })
  })

  describe('7. Focus Trap', () => {
    it('should focus confirm button when dialog opens', async () => {
      const props = createDefaultProps({ isOpen: true })
      render(<ConfirmDialog {...props} />)

      await waitFor(
        () => {
          const confirmButton = screen.getByText('확인')
          expect(document.activeElement).toBe(confirmButton)
        },
        { timeout: 200 }
      )
    })

    it('should trap focus within dialog using Tab key', () => {
      const props = createDefaultProps({ isOpen: true })
      render(<ConfirmDialog {...props} />)

      const dialog = screen.getByRole('dialog')
      const focusableElements = dialog.querySelectorAll('button')

      // Should have 3 buttons: confirm, close, cancel
      expect(focusableElements.length).toBeGreaterThanOrEqual(3)

      // Focus first button
      const firstButton = focusableElements[0]
      firstButton.focus()
      expect(document.activeElement).toBe(firstButton)
    })

    it('should handle Tab key press in focus trap', () => {
      const props = createDefaultProps({ isOpen: true })
      render(<ConfirmDialog {...props} />)

      const dialog = screen.getByRole('dialog')
      const confirmButton = screen.getByText('확인')

      confirmButton.focus()

      // Simulate Tab key on the dialog
      fireEvent.keyDown(dialog, { key: 'Tab', code: 'Tab' })

      // Focus should still be within the dialog
      expect(dialog.contains(document.activeElement)).toBe(true)
    })

    it('should handle Shift+Tab key press in focus trap', () => {
      const props = createDefaultProps({ isOpen: true })
      render(<ConfirmDialog {...props} />)

      const dialog = screen.getByRole('dialog')
      const confirmButton = screen.getByText('확인')

      confirmButton.focus()

      // Simulate Shift+Tab key on the dialog
      fireEvent.keyDown(dialog, { key: 'Tab', code: 'Tab', shiftKey: true })

      // Focus should still be within the dialog
      expect(dialog.contains(document.activeElement)).toBe(true)
    })

    it('should not affect focus trap when non-Tab key is pressed', () => {
      const props = createDefaultProps({ isOpen: true })
      render(<ConfirmDialog {...props} />)

      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { key: 'Enter' })
      // Non-Tab keys should not trigger any focus trap behavior
      expect(dialog).toBeInTheDocument()

      fireEvent.keyDown(dialog, { key: 'Space' })
      // Non-Tab keys should not trigger any focus trap behavior
      expect(dialog).toBeInTheDocument()
    })
  })

  describe('8. Accessibility (ARIA labels, roles)', () => {
    it('should have proper dialog role and attributes', () => {
      const props = createDefaultProps({ isOpen: true })
      render(<ConfirmDialog {...props} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title')
      expect(dialog).toHaveAttribute('aria-describedby', 'dialog-description')
    })

    it('should not have aria-describedby when description is not provided', () => {
      const props = createDefaultProps({
        isOpen: true,
        description: undefined,
      })
      render(<ConfirmDialog {...props} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).not.toHaveAttribute('aria-describedby')
    })

    it('should have proper title id', () => {
      const props = createDefaultProps({ isOpen: true })
      render(<ConfirmDialog {...props} />)

      const title = screen.getByText('Test Title')
      expect(title).toHaveAttribute('id', 'dialog-title')
    })

    it('should have proper description id when provided', () => {
      const props = createDefaultProps({ isOpen: true })
      render(<ConfirmDialog {...props} />)

      const description = screen.getByText('Test description')
      expect(description).toHaveAttribute('id', 'dialog-description')
    })

    it('should have aria-hidden on backdrop', () => {
      const props = createDefaultProps({ isOpen: true })
      render(<ConfirmDialog {...props} />)

      const backdrop = screen.getByRole('dialog').querySelector('.absolute.inset-0')
      expect(backdrop).toHaveAttribute('aria-hidden', 'true')
    })

    it('should have aria-label on close button', () => {
      const props = createDefaultProps({ isOpen: true })
      render(<ConfirmDialog {...props} />)

      const closeButton = screen.getByLabelText('닫기')
      expect(closeButton).toHaveAttribute('aria-label', '닫기')
    })

    it('should have proper focus indicators on all interactive elements', () => {
      const props = createDefaultProps({ isOpen: true })
      render(<ConfirmDialog {...props} />)

      const closeButton = screen.getByLabelText('닫기')
      const confirmButton = screen.getByText('확인')

      // All buttons should have focus styles
      expect(closeButton).toHaveClass('focus:ring-2')
      expect(confirmButton).toHaveClass('focus:ring-2')
    })
  })

  describe('9. Danger vs Primary Variants', () => {
    it('should render primary variant with correct styles', () => {
      const props = createDefaultProps({ isOpen: true, variant: 'primary' })
      render(<ConfirmDialog {...props} />)

      const confirmButton = screen.getByText('확인')
      expect(confirmButton).toHaveClass('bg-[#693BF2]')
      expect(confirmButton).toHaveClass('hover:bg-[#5A2FD9]')
      expect(confirmButton).toHaveClass('focus:ring-[#693BF2]')
    })

    it('should render danger variant with correct styles', () => {
      const props = createDefaultProps({ isOpen: true, variant: 'danger' })
      render(<ConfirmDialog {...props} />)

      const confirmButton = screen.getByText('확인')
      expect(confirmButton).toHaveClass('bg-[#EA1623]')
      expect(confirmButton).toHaveClass('hover:bg-[#D01119]')
      expect(confirmButton).toHaveClass('focus:ring-[#EA1623]')
    })

    it('should default to primary variant when not specified', () => {
      const props = createDefaultProps({
        isOpen: true,
        variant: undefined,
      })
      render(<ConfirmDialog {...props} />)

      const confirmButton = screen.getByText('확인')
      expect(confirmButton).toHaveClass('bg-[#693BF2]')
    })

    it('should maintain variant style during loading state', () => {
      const props = createDefaultProps({
        isOpen: true,
        variant: 'danger',
        isLoading: true,
      })
      render(<ConfirmDialog {...props} />)

      const confirmButton = screen.getByText('처리 중...')
      expect(confirmButton).toHaveClass('bg-[#EA1623]')
    })

    it('should apply consistent button styling for both variants', () => {
      const primaryProps = createDefaultProps({ isOpen: true, variant: 'primary' })
      const { rerender } = render(<ConfirmDialog {...primaryProps} />)

      const primaryButton = screen.getByText('확인')
      expect(primaryButton).toHaveClass('min-w-[100px]')
      expect(primaryButton).toHaveClass('rounded-lg')
      expect(primaryButton).toHaveClass('font-medium')
      expect(primaryButton).toHaveClass('text-white')

      const dangerProps = createDefaultProps({ isOpen: true, variant: 'danger' })
      rerender(<ConfirmDialog {...dangerProps} />)

      const dangerButton = screen.getByText('확인')
      expect(dangerButton).toHaveClass('min-w-[100px]')
      expect(dangerButton).toHaveClass('rounded-lg')
      expect(dangerButton).toHaveClass('font-medium')
      expect(dangerButton).toHaveClass('text-white')
    })
  })

  describe('10. Body Scroll Lock', () => {
    it('should lock body scroll when dialog is open', () => {
      const props = createDefaultProps({ isOpen: true })
      render(<ConfirmDialog {...props} />)

      expect(document.body.style.overflow).toBe('hidden')
    })

    it('should unlock body scroll when dialog is closed', () => {
      const props = createDefaultProps({ isOpen: true })
      const { rerender } = render(<ConfirmDialog {...props} />)

      expect(document.body.style.overflow).toBe('hidden')

      rerender(<ConfirmDialog {...props} isOpen={false} />)

      expect(document.body.style.overflow).toBe('unset')
    })

    it('should restore body scroll on unmount', () => {
      const props = createDefaultProps({ isOpen: true })
      const { unmount } = render(<ConfirmDialog {...props} />)

      expect(document.body.style.overflow).toBe('hidden')

      unmount()

      expect(document.body.style.overflow).toBe('unset')
    })

    it('should handle body scroll correctly when opening multiple times', () => {
      const props = createDefaultProps({ isOpen: false })
      const { rerender } = render(<ConfirmDialog {...props} />)

      expect(document.body.style.overflow).toBe('unset')

      // Open dialog
      rerender(<ConfirmDialog {...props} isOpen={true} />)
      expect(document.body.style.overflow).toBe('hidden')

      // Close dialog
      rerender(<ConfirmDialog {...props} isOpen={false} />)
      expect(document.body.style.overflow).toBe('unset')

      // Open again
      rerender(<ConfirmDialog {...props} isOpen={true} />)
      expect(document.body.style.overflow).toBe('hidden')
    })
  })

  describe('11. Edge Cases and Error Handling', () => {
    it('should handle missing optional props gracefully', () => {
      const minimalProps: ConfirmDialogProps = {
        isOpen: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
        title: 'Minimal Dialog',
      }

      expect(() => render(<ConfirmDialog {...minimalProps} />)).not.toThrow()

      expect(screen.getByText('Minimal Dialog')).toBeInTheDocument()
      expect(screen.getByText('확인')).toBeInTheDocument()
      expect(screen.getByText('취소')).toBeInTheDocument()
    })

    it('should handle empty string props', () => {
      const props = createDefaultProps({
        isOpen: true,
        title: '',
        description: '',
        confirmText: '',
        cancelText: '',
      })

      render(<ConfirmDialog {...props} />)

      // Empty strings should still render
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('should handle very long text content', () => {
      const longTitle = 'A'.repeat(200)
      const longDescription = 'B'.repeat(500)
      const props = createDefaultProps({
        isOpen: true,
        title: longTitle,
        description: longDescription,
      })

      render(<ConfirmDialog {...props} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })

    it('should handle special characters in text', () => {
      const props = createDefaultProps({
        isOpen: true,
        title: 'Special <>&"\' Characters',
        description: 'Test with émojis 🎉 and symbols @#$%',
      })

      render(<ConfirmDialog {...props} />)

      expect(screen.getByText('Special <>&"\' Characters')).toBeInTheDocument()
      expect(screen.getByText('Test with émojis 🎉 and symbols @#$%')).toBeInTheDocument()
    })

    it('should handle rapid open/close state changes', () => {
      const props = createDefaultProps({ isOpen: false })
      const { rerender } = render(<ConfirmDialog {...props} />)

      // Rapidly toggle state
      for (let i = 0; i < 10; i++) {
        rerender(<ConfirmDialog {...props} isOpen={true} />)
        rerender(<ConfirmDialog {...props} isOpen={false} />)
      }

      // Should end in closed state
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(document.body.style.overflow).toBe('unset')
    })

    it('should handle onConfirm returning void or Promise', async () => {
      // Test void return
      const onConfirmVoid = jest.fn()
      const voidProps = createDefaultProps({ isOpen: true, onConfirm: onConfirmVoid })
      const { rerender } = render(<ConfirmDialog {...voidProps} />)

      fireEvent.click(screen.getByText('확인'))
      expect(onConfirmVoid).toHaveBeenCalled()

      // Test Promise return
      const onConfirmPromise = jest.fn().mockResolvedValue(undefined)
      const promiseProps = createDefaultProps({ isOpen: true, onConfirm: onConfirmPromise })
      rerender(<ConfirmDialog {...promiseProps} />)

      fireEvent.click(screen.getByText('확인'))
      await waitFor(() => {
        expect(onConfirmPromise).toHaveBeenCalled()
      })
    })

    it('should handle clicking confirm button multiple times', () => {
      const onConfirm = jest.fn()
      const props = createDefaultProps({ isOpen: true, onConfirm })
      render(<ConfirmDialog {...props} />)

      const confirmButton = screen.getByText('확인')

      // Click multiple times rapidly
      fireEvent.click(confirmButton)
      fireEvent.click(confirmButton)
      fireEvent.click(confirmButton)

      // Should be called three times (no debouncing in component)
      expect(onConfirm).toHaveBeenCalledTimes(3)
    })

    it('should clean up all event listeners on unmount', () => {
      const props = createDefaultProps({ isOpen: true })
      const { unmount } = render(<ConfirmDialog {...props} />)

      const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')

      unmount()

      // Should have cleaned up keyboard listeners
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })

    it('should handle null ref values gracefully', () => {
      const props = createDefaultProps({ isOpen: true })

      // This should not throw even if refs are null
      expect(() => render(<ConfirmDialog {...props} />)).not.toThrow()
    })

    it('should handle transition from closed to open to closed', () => {
      const onClose = jest.fn()
      const props = createDefaultProps({ isOpen: false, onClose })
      const { rerender } = render(<ConfirmDialog {...props} />)

      // Initially closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      // Open
      rerender(<ConfirmDialog {...props} isOpen={true} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(document.body.style.overflow).toBe('hidden')

      // Close via ESC
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalled()

      // Actually close
      rerender(<ConfirmDialog {...props} isOpen={false} />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(document.body.style.overflow).toBe('unset')
    })
  })

  describe('12. Animation and Styling', () => {
    it('should have glassmorphism backdrop filter', () => {
      const props = createDefaultProps({ isOpen: true })
      render(<ConfirmDialog {...props} />)

      const dialog = screen.getByRole('dialog')
      // The dialog content div has backdrop-filter inline style (React converts to kebab-case)
      const dialogContent = dialog.querySelector('.relative.bg-white') as HTMLElement
      expect(dialogContent).toBeTruthy()
      expect(dialogContent.style.backdropFilter).toBe('blur(12px)')
    })

    it('should have animation classes on container', () => {
      const props = createDefaultProps({ isOpen: true })
      render(<ConfirmDialog {...props} />)

      const dialogContainer = screen.getByRole('dialog')
      expect(dialogContainer).toHaveClass('animate-in')
      expect(dialogContainer).toHaveClass('fade-in')
      expect(dialogContainer).toHaveClass('duration-200')
    })

    it('should have animation classes on dialog content', () => {
      const props = createDefaultProps({ isOpen: true })
      render(<ConfirmDialog {...props} />)

      const dialogContent = screen.getByRole('dialog').querySelector('.relative.bg-white')
      expect(dialogContent).toHaveClass('animate-in')
      expect(dialogContent).toHaveClass('zoom-in-95')
      expect(dialogContent).toHaveClass('slide-in-from-bottom-4')
    })

    it('should have proper z-index for layering', () => {
      const props = createDefaultProps({ isOpen: true })
      render(<ConfirmDialog {...props} />)

      const dialogContainer = screen.getByRole('dialog')
      expect(dialogContainer).toHaveClass('z-50')
    })
  })

  describe('13. Integration Tests', () => {
    it('should complete a full confirm workflow', async () => {
      const onConfirm = jest.fn().mockResolvedValue(undefined)
      const onClose = jest.fn()
      const props = createDefaultProps({
        isOpen: true,
        onConfirm,
        onClose,
        variant: 'danger',
        title: 'Confirm Logout',
        description: 'Are you sure you want to logout?',
        confirmText: 'Logout Now',
        cancelText: 'Cancel',
      })

      render(<ConfirmDialog {...props} />)

      // Verify dialog is open
      expect(screen.getByText('Confirm Logout')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to logout?')).toBeInTheDocument()

      // Click confirm
      fireEvent.click(screen.getByText('Logout Now'))

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled()
      })
    })

    it('should complete a full cancel workflow', () => {
      const onConfirm = jest.fn()
      const onClose = jest.fn()
      const props = createDefaultProps({
        isOpen: true,
        onConfirm,
        onClose,
        title: 'Delete Item',
        description: 'Are you sure?',
      })

      render(<ConfirmDialog {...props} />)

      // Click cancel
      fireEvent.click(screen.getByText('취소'))

      expect(onClose).toHaveBeenCalled()
      expect(onConfirm).not.toHaveBeenCalled()
    })

    it('should handle loading state workflow', () => {
      const props = createDefaultProps({ isOpen: true, isLoading: false })
      const { rerender } = render(<ConfirmDialog {...props} />)

      // Initially not loading
      expect(screen.getByText('확인')).toBeInTheDocument()
      expect(screen.getByText('확인')).not.toBeDisabled()

      // Start loading
      rerender(<ConfirmDialog {...props} isLoading={true} />)
      expect(screen.getByText('처리 중...')).toBeInTheDocument()
      expect(screen.getByText('처리 중...')).toBeDisabled()

      // Complete loading
      rerender(<ConfirmDialog {...props} isLoading={false} />)
      expect(screen.getByText('확인')).toBeInTheDocument()
      expect(screen.getByText('확인')).not.toBeDisabled()
    })
  })
})
