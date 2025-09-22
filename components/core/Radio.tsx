import React, { forwardRef } from 'react';
import { theme } from '@/lib/theme';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card';
  required?: boolean;
  className?: string;
}

const sizeMap = {
  sm: {
    radio: 'w-4 h-4',
    dot: 'w-2 h-2',
    label: 'text-sm',
    description: 'text-xs'
  },
  md: {
    radio: 'w-5 h-5',
    dot: 'w-2.5 h-2.5',
    label: 'text-sm',
    description: 'text-xs'
  },
  lg: {
    radio: 'w-6 h-6',
    dot: 'w-3 h-3',
    label: 'text-base',
    description: 'text-sm'
  }
} as const;

const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  label,
  description,
  error,
  size = 'md',
  variant = 'default',
  required = false,
  className = '',
  checked,
  disabled,
  id,
  ...props
}, ref) => {
  const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const getRadioStyles = () => {
    return {
      backgroundColor: theme.colors.white,
      borderColor: checked
        ? (hasError ? theme.colors.accent.red : theme.colors.primary.main)
        : (hasError ? theme.colors.accent.red : theme.colors.neutral.light),
      borderWidth: '2px',
      borderRadius: '50%',
      transition: 'all 0.2s ease',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1
    };
  };

  const getDotStyles = () => {
    return {
      backgroundColor: hasError ? theme.colors.accent.red : theme.colors.primary.main,
      borderRadius: '50%',
      transform: checked ? 'scale(1)' : 'scale(0)',
      transition: 'transform 0.2s ease'
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

  const renderRadio = () => (
    <div className="relative">
      <input
        ref={ref}
        type="radio"
        id={radioId}
        checked={checked}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <div
        className={`${sizeMap[size].radio} flex items-center justify-center`}
        style={getRadioStyles()}
      >
        <div
          className={sizeMap[size].dot}
          style={getDotStyles()}
        />
      </div>
    </div>
  );

  if (variant === 'card') {
    return (
      <div className={`${className}`}>
        <label
          htmlFor={radioId}
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
            {renderRadio()}
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
      <label htmlFor={radioId} className={`cursor-pointer ${getVariantClasses()}`}>
        {renderRadio()}
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

Radio.displayName = 'Radio';

// RadioGroup 컴포넌트
export interface RadioGroupProps {
  label?: string;
  description?: string;
  error?: string;
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  value?: string;
  onChange?: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card';
  required?: boolean;
  className?: string;
  name?: string;
}

export function RadioGroup({
  label,
  description,
  error,
  options,
  value,
  onChange,
  size = 'md',
  variant = 'default',
  required = false,
  className = '',
  name
}: RadioGroupProps) {
  const groupName = name || `radio-group-${Math.random().toString(36).substr(2, 9)}`;

  const handleChange = (optionValue: string) => {
    onChange?.(optionValue);
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
          <Radio
            key={option.value}
            name={groupName}
            value={option.value}
            label={option.label}
            description={option.description}
            size={size}
            variant={variant}
            checked={value === option.value}
            disabled={option.disabled}
            onChange={() => handleChange(option.value)}
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

export default Radio;