import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  showIcon?: boolean;
  containerClassName?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, containerClassName, placeholder = "검색어를 입력하세요", onSearch, showIcon = true, ...props }, ref) => {
    const [value, setValue] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSearch?.(value);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      props.onChange?.(e);
    };

    return (
      <form onSubmit={handleSubmit} className={cn('relative w-full', containerClassName)}>
        <div className="relative">
          {showIcon && (
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6A7685]" />
          )}
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={cn(
              // 기본 스타일 (테마 기반)
              'w-full h-11 bg-[#EFF1F5] border-0 rounded-lg text-sm placeholder:text-[#6A7685]',
              'focus:outline-none focus:ring-2 focus:ring-[#693BF2] focus:ring-offset-0',
              'transition-all duration-200',
              // 패딩 조정 (아이콘 유무에 따라)
              showIcon ? 'pl-10 pr-4' : 'px-4',
              className
            )}
            {...props}
          />
        </div>
      </form>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;