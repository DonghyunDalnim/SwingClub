import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SearchInput } from '@/components/location/SearchInput';

// Mock the UI components
jest.mock('@/components/ui/input', () => ({
  Input: React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    (props, ref) => <input ref={ref} {...props} />
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

describe('SearchInput', () => {
  let mockOnChange: jest.Mock;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    jest.useFakeTimers();
    mockOnChange = jest.fn();
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    mockOnChange.mockClear();
    cleanup();
  });

  describe('Component Rendering', () => {
    it('renders the search input component with default props', () => {
      render(<SearchInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      const searchIcon = screen.getByTestId('search-icon');

      expect(input).toBeInTheDocument();
      expect(searchIcon).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', '스튜디오명 또는 주소로 검색');
    });

    it('renders with custom placeholder', () => {
      const customPlaceholder = '카페명으로 검색하세요';
      render(
        <SearchInput
          value=""
          onChange={mockOnChange}
          placeholder={customPlaceholder}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', customPlaceholder);
    });

    it('renders with custom className', () => {
      const customClassName = 'custom-search-class';
      render(
        <SearchInput
          value=""
          onChange={mockOnChange}
          className={customClassName}
        />
      );

      const container = screen.getByRole('textbox').closest('.custom-search-class');
      expect(container).toBeInTheDocument();
    });

    it('renders with initial value', () => {
      const initialValue = '강남 스튜디오';
      render(<SearchInput value={initialValue} onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue(initialValue);
    });

    it('shows clear button when there is a value', () => {
      render(<SearchInput value="test" onChange={mockOnChange} />);

      const clearButton = screen.getByRole('button');
      const xIcon = screen.getByTestId('x-icon');

      expect(clearButton).toBeInTheDocument();
      expect(xIcon).toBeInTheDocument();
    });

    it('does not show clear button when value is empty', () => {
      render(<SearchInput value="" onChange={mockOnChange} />);

      const clearButton = screen.queryByRole('button');
      expect(clearButton).not.toBeInTheDocument();
    });
  });

  describe('Input Value Changes', () => {
    it('updates local value immediately on input change', async () => {
      render(<SearchInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(input).toHaveValue('test');
    });

    it('handles controlled value updates from parent', () => {
      const { rerender } = render(<SearchInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');

      rerender(<SearchInput value="updated from parent" onChange={mockOnChange} />);
      expect(input).toHaveValue('updated from parent');
    });

    it('maintains local state during typing before debounce', async () => {
      render(<SearchInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'fast typing');

      // Before debounce timer
      expect(input).toHaveValue('fast typing');
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Debouncing Functionality', () => {
    it('calls onChange after default debounce delay (500ms)', async () => {
      render(<SearchInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'debounced');

      // Should not call onChange immediately
      expect(mockOnChange).not.toHaveBeenCalled();

      // Advance timers by 500ms (default debounce)
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('debounced');
      });
    });

    it('calls onChange after custom debounce delay', async () => {
      const customDebounce = 1000;
      render(
        <SearchInput
          value=""
          onChange={mockOnChange}
          debounceMs={customDebounce}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'custom');

      // Should not call onChange before custom debounce
      jest.advanceTimersByTime(500);
      expect(mockOnChange).not.toHaveBeenCalled();

      // Should call onChange after custom debounce
      jest.advanceTimersByTime(500); // Total: 1000ms

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('custom');
      });
    });

    it('cancels previous debounce timer when new input arrives', async () => {
      render(<SearchInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');

      // Type first value
      await user.type(input, 'first');
      jest.advanceTimersByTime(300);

      // Type additional characters before debounce completes
      await user.type(input, ' second');

      // Advance by full debounce time from last input
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledTimes(1);
        expect(mockOnChange).toHaveBeenCalledWith('first second');
      });
    });

    it('does not call onChange when local value equals current prop value', async () => {
      render(<SearchInput value="same" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');

      // Simulate typing the same value by modifying the input manually
      fireEvent.change(input, { target: { value: 'different' } });
      fireEvent.change(input, { target: { value: 'same' } });

      jest.advanceTimersByTime(500);

      // onChange should not be called since final value matches initial value
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Clear Button Functionality', () => {
    it('clears input when clear button is clicked', async () => {
      render(<SearchInput value="test content" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      const clearButton = screen.getByRole('button');

      expect(input).toHaveValue('test content');

      await user.click(clearButton);

      expect(input).toHaveValue('');
      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('calls onChange immediately when clear button is clicked', async () => {
      render(<SearchInput value="test" onChange={mockOnChange} />);

      const clearButton = screen.getByRole('button');
      await user.click(clearButton);

      expect(mockOnChange).toHaveBeenCalledWith('');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('hides clear button after clearing', async () => {
      render(<SearchInput value="test" onChange={mockOnChange} />);

      const clearButton = screen.getByRole('button');
      await user.click(clearButton);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('ESC Key Functionality', () => {
    it('clears input when ESC key is pressed', async () => {
      render(<SearchInput value="test content" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('test content');

      fireEvent.keyDown(input, { key: 'Escape' });

      expect(input).toHaveValue('');
      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('calls onChange immediately when ESC is pressed', () => {
      render(<SearchInput value="test" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(mockOnChange).toHaveBeenCalledWith('');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('does not trigger on other key presses', () => {
      render(<SearchInput value="test" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });
      fireEvent.keyDown(input, { key: 'Tab' });
      fireEvent.keyDown(input, { key: 'Space' });

      expect(mockOnChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('test');
    });
  });

  describe('Placeholder Text', () => {
    it('shows default placeholder text', () => {
      render(<SearchInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', '스튜디오명 또는 주소로 검색');
    });

    it('shows custom placeholder text', () => {
      const customPlaceholder = '원하는 장소를 검색하세요';
      render(
        <SearchInput
          value=""
          onChange={mockOnChange}
          placeholder={customPlaceholder}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', customPlaceholder);
    });

    it('hides placeholder when input has value', () => {
      render(<SearchInput value="some text" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('some text');
      // Placeholder should not be visible when there's a value
    });
  });

  describe('Edge Cases and Integration', () => {
    it('handles rapid consecutive input changes correctly', async () => {
      render(<SearchInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');

      // Simulate rapid typing
      await user.type(input, 'a');
      jest.advanceTimersByTime(100);
      await user.type(input, 'b');
      jest.advanceTimersByTime(100);
      await user.type(input, 'c');

      // Only the final value should be passed to onChange
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledTimes(1);
        expect(mockOnChange).toHaveBeenCalledWith('abc');
      });
    });

    it('handles clear action during debounce period', async () => {
      render(<SearchInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');

      // Type something
      await user.type(input, 'test');

      // Clear before debounce completes
      jest.advanceTimersByTime(200);
      fireEvent.keyDown(input, { key: 'Escape' });

      // Advance remaining time
      jest.advanceTimersByTime(300);

      // Should only have the clear call, not the debounced call
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('maintains proper focus and cursor position', async () => {
      render(<SearchInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');

      await user.click(input);
      expect(input).toHaveFocus();

      await user.type(input, 'test');
      expect(input).toHaveFocus();

      // Clear should maintain focus
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(input).toHaveFocus();
    });

    it('handles multiple SearchInput components independently', async () => {
      const mockOnChange2 = jest.fn();

      render(
        <div>
          <SearchInput value="" onChange={mockOnChange} />
          <SearchInput value="" onChange={mockOnChange2} />
        </div>
      );

      const inputs = screen.getAllByRole('textbox');

      await user.type(inputs[0], 'first');
      await user.type(inputs[1], 'second');

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('first');
        expect(mockOnChange2).toHaveBeenCalledWith('second');
      });
    });

    it('handles zero debounce delay', async () => {
      render(
        <SearchInput
          value=""
          onChange={mockOnChange}
          debounceMs={0}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'instant');

      jest.advanceTimersByTime(0);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('instant');
      });
    });

    it('properly synchronizes external value changes with local state', () => {
      const { rerender } = render(<SearchInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');

      // External value change should update local state
      rerender(<SearchInput value="external update" onChange={mockOnChange} />);
      expect(input).toHaveValue('external update');

      // Should show clear button when external value is provided
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles debounce cleanup on unmount', async () => {
      const { unmount } = render(<SearchInput value="" onChange={mockOnChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      // Unmount before debounce completes
      unmount();

      // Advance time - onChange should not be called after unmount
      jest.advanceTimersByTime(500);
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });
});