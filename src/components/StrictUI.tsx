import React from 'react';
import { clsx } from 'clsx';

// Строгие кнопки с фиксированными размерами
interface StrictButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const StrictButton: React.FC<StrictButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled,
  loading,
  fullWidth = false,
  type = 'button',
  className,
  icon,
  iconPosition = 'left'
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 active:bg-orange-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 active:bg-gray-400',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 active:bg-gray-100',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 active:bg-red-700'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-sm h-10',
    lg: 'px-6 py-3 text-base h-12',
    xl: 'px-8 py-4 text-lg h-14'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  return (
    <button
      type={type}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <div className={clsx('animate-spin rounded-full border-b-2 border-current', iconSizeClasses[size])} />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className={clsx('mr-2', iconSizeClasses[size])}>
          {icon}
        </span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className={clsx('ml-2', iconSizeClasses[size])}>
          {icon}
        </span>
      )}
    </button>
  );
};

// Строгие поля ввода
interface StrictInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

export const StrictInput: React.FC<StrictInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  required,
  type = 'text',
  size = 'md',
  disabled,
  loading,
  icon,
  className,
  maxLength,
  minLength,
  pattern
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-sm h-10',
    lg: 'px-6 py-3 text-base h-12'
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <label className={clsx('block font-medium text-gray-700', labelSizeClasses[size])}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={clsx('text-gray-400', iconSizeClasses[size])}>
              {icon}
            </span>
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || loading}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          className={clsx(
            'w-full border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
            sizeClasses[size],
            icon && 'pl-10',
            error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 hover:border-gray-400 focus:ring-orange-500 focus:border-orange-500',
            disabled && 'bg-gray-50 cursor-not-allowed',
            loading && 'bg-gray-50'
          )}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Строгие селекты
interface StrictSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  error?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  className?: string;
}

export const StrictSelect: React.FC<StrictSelectProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  required,
  size = 'md',
  disabled,
  loading,
  placeholder,
  className
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-sm h-10',
    lg: 'px-6 py-3 text-base h-12'
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <label className={clsx('block font-medium text-gray-700', labelSizeClasses[size])}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          className={clsx(
            'w-full border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none bg-white',
            sizeClasses[size],
            'pr-10', // Space for custom arrow
            error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 hover:border-gray-400 focus:ring-orange-500 focus:border-orange-500',
            disabled && 'bg-gray-50 cursor-not-allowed',
            loading && 'bg-gray-50'
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-10 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Строгие текстовые области
interface StrictTextareaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
}

export const StrictTextarea: React.FC<StrictTextareaProps> = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  required,
  size = 'md',
  disabled,
  loading,
  rows = 4,
  maxLength,
  className
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base'
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <label className={clsx('block font-medium text-gray-700', labelSizeClasses[size])}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || loading}
          rows={rows}
          maxLength={maxLength}
          className={clsx(
            'w-full border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 resize-none',
            sizeClasses[size],
            error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 hover:border-gray-400 focus:ring-orange-500 focus:border-orange-500',
            disabled && 'bg-gray-50 cursor-not-allowed',
            loading && 'bg-gray-50'
          )}
        />
        {loading && (
          <div className="absolute top-3 right-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {maxLength && (
        <p className="text-xs text-gray-500 text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
};

// Строгие чекбоксы
interface StrictCheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StrictCheckbox: React.FC<StrictCheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled,
  loading,
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const labelSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={clsx('flex items-center space-x-3', className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled || loading}
        className={clsx(
          'rounded border-gray-300 text-orange-500 focus:ring-orange-500 transition-colors',
          sizeClasses[size],
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
      {label && (
        <label className={clsx('font-medium text-gray-700', labelSizeClasses[size])}>
          {label}
        </label>
      )}
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
      )}
    </div>
  );
};

// Строгие радио кнопки
interface StrictRadioProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StrictRadio: React.FC<StrictRadioProps> = ({
  label,
  checked,
  onChange,
  disabled,
  loading,
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const labelSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={clsx('flex items-center space-x-3', className)}>
      <input
        type="radio"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled || loading}
        className={clsx(
          'border-gray-300 text-orange-500 focus:ring-orange-500 transition-colors',
          sizeClasses[size],
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
      {label && (
        <label className={clsx('font-medium text-gray-700', labelSizeClasses[size])}>
          {label}
        </label>
      )}
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
      )}
    </div>
  );
};

// Строгие бейджи
interface StrictBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StrictBadge: React.FC<StrictBadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span className={clsx(
      'inline-flex items-center font-medium rounded-full',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {children}
    </span>
  );
};

export default StrictButton; 