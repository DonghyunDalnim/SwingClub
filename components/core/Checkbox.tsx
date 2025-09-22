import React, { forwardRef } from 'react';
import { theme } from '@/lib/theme';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card';
  indeterminate?: boolean;
  required?: boolean;
  className?: string;
}

const sizeMap = {
  sm: {
    checkbox: 'w-4 h-4',
    icon: 'w-3 h-3',
    label: 'text-sm',
    description: 'text-xs'
  },
  md: {
    checkbox: 'w-5 h-5',
    icon: 'w-3.5 h-3.5',
    label: 'text-sm',
    description: 'text-xs'
  },
  lg: {
    checkbox: 'w-6 h-6',
    icon: 'w-4 h-4',
    label: 'text-base',
    description: 'text-sm'
  }
} as const;

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  error,
  size = 'md',
  variant = 'default',
  indeterminate = false,
  required = false,
  className = '',
  checked,
  disabled,
  id,
  ...props
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const getCheckboxStyles = () => {
    const isChecked = checked || indeterminate;

    return {
      backgroundColor: isChecked
        ? (hasError ? theme.colors.accent.red : theme.colors.primary.main)
        : theme.colors.white,
      borderColor: isChecked
        ? (hasError ? theme.colors.accent.red : theme.colors.primary.main)
        : (hasError ? theme.colors.accent.red : theme.colors.neutral.light),
      borderWidth: '2px',
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1
    };
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return `p-4 border rounded-lg ${checked ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`;
      case 'default':
      default:
        return 'flex items-start space-x-3';
    }
  };

  const renderCheckbox = () => (
    <div className="relative">
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        checked={checked}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <div
        className={`${sizeMap[size].checkbox} flex items-center justify-center`}
        style={getCheckboxStyles()}
      >
        {checked && !indeterminate && (
          <Check
            className={sizeMap[size].icon}
            style={{ color: theme.colors.white }}
          />
        )}
        {indeterminate && (
          <Minus
            className={sizeMap[size].icon}
            style={{ color: theme.colors.white }}
          />
        )}
      </div>
    </div>
  );

  if (variant === 'card') {
    return (
      <div className={`${className}`}>
        <label
          htmlFor={checkboxId}
          className={`block cursor-pointer ${getVariantClasses()}`}
          style={{
            borderColor: checked
              ? theme.colors.primary.main
              : theme.colors.neutral.light,
            backgroundColor: checked
              ? theme.colors.secondary.light
              : theme.colors.white
          }}
        >
          <div className="flex items-start space-x-3">
            {renderCheckbox()}
            <div className="flex-1">
              {label && (
                <div className={`font-medium ${sizeMap[size].label}`} style={{ color: theme.colors.neutral.darkest }}>
                  {label}
                  {required && <span style={{ color: theme.colors.accent.red }}> *</span>}
                </div>
              )}
              {description && (
                <div className={`mt-1 ${sizeMap[size].description}`} style={{ color: theme.colors.neutral.medium }}>
                  {description}
                </div>
              )}
            </div>
          </div>
        </label>
        {error && (
          <p className={`mt-2 ${sizeMap[size].description}`} style={{ color: theme.colors.accent.red }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <label htmlFor={checkboxId} className={`cursor-pointer ${getVariantClasses()}`}>
        {renderCheckbox()}
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <div className={`font-medium ${sizeMap[size].label}`} style={{ color: theme.colors.neutral.darkest }}>
                {label}
                {required && <span style={{ color: theme.colors.accent.red }}> *</span>}
              </div>
            )}
            {description && (
              <div className={`mt-1 ${sizeMap[size].description}`} style={{ color: theme.colors.neutral.medium }}>
                {description}
              </div>
            )}
          </div>
        )}
      </label>
      {error && (
        <p className={`mt-1 ${sizeMap[size].description}`} style={{ color: theme.colors.accent.red }}>
          {error}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

// CheckboxGroup 컴포넌트
export interface CheckboxGroupProps {
  label?: string;
  description?: string;
  error?: string;
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  value?: string[];
  onChange?: (value: string[]) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card';
  required?: boolean;
  className?: string;
}

export function CheckboxGroup({
  label,
  description,
  error,
  options,
  value = [],
  onChange,
  size = 'md',
  variant = 'default',
  required = false,
  className = ''
}: CheckboxGroupProps) {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange?.([...value, optionValue]);
    } else {
      onChange?.(value.filter(v => v !== optionValue));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Group Label */}
      {label && (
        <div className={`font-medium ${sizeMap[size].label}`} style={{ color: theme.colors.neutral.darkest }}>
          {label}
          {required && <span style={{ color: theme.colors.accent.red }}> *</span>}
        </div>
      )}

      {/* Group Description */}
      {description && (
        <div className={`${sizeMap[size].description}`} style={{ color: theme.colors.neutral.medium }}>
          {description}
        </div>
      )}

      {/* Options */}
      <div className={`space-y-${variant === 'card' ? '3' : '2'}`}>
        {options.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            description={option.description}
            size={size}
            variant={variant}
            checked={value.includes(option.value)}
            disabled={option.disabled}
            onChange={(e) => handleChange(option.value, e.target.checked)}
          />
        ))}
      </div>

      {/* Group Error */}
      {error && (
        <p className={`${sizeMap[size].description}`} style={{ color: theme.colors.accent.red }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default Checkbox;