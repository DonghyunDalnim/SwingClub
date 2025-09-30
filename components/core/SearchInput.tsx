import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  showIcon?: boolean;
  containerClassName?: string;
  label?: string;
  hideLabel?: boolean;
  searchButtonLabel?: string;
  clearButtonLabel?: string;
  showClearButton?: boolean;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({
    className,
    containerClassName,
    placeholder = "검색어를 입력하세요",
    onSearch,
    showIcon = true,
    label = "검색",
    hideLabel = false,
    searchButtonLabel = "검색 실행",
    clearButtonLabel = "검색어 지우기",
    showClearButton = true,
    ...props
  }, ref) => {
    const [value, setValue] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSearch?.(value);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      props.onChange?.(e);
    };

    const handleClear = () => {
      setValue('');
      // Trigger a synthetic change event for consistency
      if (ref && 'current' in ref && ref.current) {
        const syntheticEvent = {
          target: { ...ref.current, value: '' },
          currentTarget: ref.current,
        } as React.ChangeEvent<HTMLInputElement>;
        props.onChange?.(syntheticEvent);
      }
    };

    const inputId = React.useId();
    const labelId = `${inputId}-label`;

    return (
      <div className={cn('w-full', containerClassName)}>
        {!hideLabel && (
          <label
            id={labelId}
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-darkest mb-2"
          >
            {label}
          </label>
        )}
        <form
          onSubmit={handleSubmit}
          className="relative w-full"
          role="search"
          aria-label="검색 폼"
        >
          <div className="relative">
            {showIcon && (
              <Search
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6A7685] pointer-events-none"
                aria-hidden="true"
                role="presentation"
              />
            )}
            <input
              ref={ref}
              id={inputId}
              type="search"
              role="searchbox"
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              aria-labelledby={hideLabel ? undefined : labelId}
              aria-label={hideLabel ? label : undefined}
              className={cn(
                // 기본 스타일 (테마 기반)
                'w-full h-11 bg-[#EFF1F5] border-0 rounded-lg text-sm placeholder:text-[#6A7685]',
                'focus:outline-none focus:ring-2 focus:ring-[#693BF2] focus:ring-offset-0',
                'transition-all duration-200',
                // 패딩 조정 (아이콘 유무에 따라)
                showIcon && showClearButton && value ? 'pl-10 pr-20' :
                showIcon ? 'pl-10 pr-4' :
                showClearButton && value ? 'pl-4 pr-16' : 'px-4',
                className
              )}
              {...props}
            />
            {showClearButton && value && (
              <button
                type="button"
                onClick={handleClear}
                aria-label={clearButtonLabel}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-neutral-medium hover:text-neutral-darkest transition-colors focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 rounded"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            <button
              type="submit"
              aria-label={searchButtonLabel}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-medium hover:text-primary-main transition-colors focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 rounded"
            >
              <Search
                className="h-4 w-4"
                aria-hidden="true"
                role="presentation"
              />
            </button>
          </div>
        </form>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;