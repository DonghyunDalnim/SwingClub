'use client';

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { theme } from '@/lib/theme';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  searchable?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

const sizeMap = {
  sm: {
    input: 'h-8 px-3 text-sm',
    label: 'text-sm',
    text: 'text-xs'
  },
  md: {
    input: 'h-10 px-3 text-sm',
    label: 'text-sm',
    text: 'text-xs'
  },
  lg: {
    input: 'h-12 px-4 text-base',
    label: 'text-base',
    text: 'text-sm'
  }
} as const;

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  hint,
  size = 'md',
  variant = 'default',
  options,
  placeholder = '선택해주세요',
  required = false,
  className = '',
  searchable = false,
  value,
  onChange,
  id,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(
    options.find(option => option.value === value) || null
  );

  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const newSelectedOption = options.find(option => option.value === value) || null;
    setSelectedOption(newSelectedOption);
  }, [value, options]);

  const getVariantStyles = () => {
    const baseStyles = {
      borderRadius: '6px',
      transition: 'all 0.2s ease',
      fontFamily: theme.typography.fontFamily.primary,
      cursor: 'pointer'
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.white,
          border: `1px solid ${hasError ? theme.colors.accent.red : theme.colors.neutral.light}`,
        };
      case 'filled':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.neutral.lightest,
          border: '1px solid transparent',
        };
      case 'default':
      default:
        return {
          ...baseStyles,
          backgroundColor: theme.colors.neutral.lightest,
          border: 'none',
        };
    }
  };

  const handleOptionSelect = (option: SelectOption) => {
    if (option.disabled) return;

    setSelectedOption(option);
    onChange?.(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && searchable) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          className={`block font-medium ${sizeMap[size].label}`}
          style={{ color: theme.colors.neutral.darkest }}
        >
          {label}
          {required && (
            <span style={{ color: theme.colors.accent.red }}> *</span>
          )}
        </label>
      )}

      {/* Select Container */}
      <div className="relative" ref={selectRef}>
        <div
          className={`w-full ${sizeMap[size].input} flex items-center justify-between transition-all duration-200 ${
            isOpen ? 'ring-2' : ''
          }`}
          style={{
            ...getVariantStyles(),
            color: selectedOption ? theme.colors.neutral.darkest : theme.colors.neutral.medium
          }}
          onClick={handleToggle}
        >
          {searchable && isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent outline-none"
              style={{ color: theme.colors.neutral.darkest }}
            />
          ) : (
            <span className="flex-1 truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: theme.colors.neutral.medium }}
          />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
            style={{
              backgroundColor: theme.colors.white,
              borderColor: theme.colors.neutral.light,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}
          >
            {filteredOptions.length === 0 ? (
              <div
                className="px-3 py-2 text-sm"
                style={{ color: theme.colors.neutral.medium }}
              >
                검색 결과가 없습니다
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                    option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                  style={{
                    backgroundColor: selectedOption?.value === option.value ? theme.colors.secondary.light : 'transparent'
                  }}
                  onClick={() => handleOptionSelect(option)}
                >
                  <span
                    className="flex-1 text-sm"
                    style={{ color: theme.colors.neutral.darkest }}
                  >
                    {option.label}
                  </span>
                  {selectedOption?.value === option.value && (
                    <Check className="h-4 w-4" style={{ color: theme.colors.primary.main }} />
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Hidden native select for form compatibility */}
      <select
        ref={ref}
        id={selectId}
        value={selectedOption?.value || ''}
        onChange={() => {}} // Controlled by custom logic
        className="hidden"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Error Message */}
      {error && (
        <p
          className={`${sizeMap[size].text} mt-1`}
          style={{ color: theme.colors.accent.red }}
        >
          {error}
        </p>
      )}

      {/* Hint Message */}
      {hint && !error && (
        <p
          className={`${sizeMap[size].text} mt-1`}
          style={{ color: theme.colors.neutral.medium }}
        >
          {hint}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;