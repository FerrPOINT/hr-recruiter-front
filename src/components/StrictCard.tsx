import React from 'react';
import { clsx } from 'clsx';

// Строгие типы для карточки
interface StrictCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'stat';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  height?: 'auto' | 'fixed' | 'min';
  onClick?: () => void;
  loading?: boolean;
}

// Компонент строгой карточки с фиксированными размерами
export const StrictCard: React.FC<StrictCardProps> = ({ 
  title, 
  subtitle, 
  children, 
  actions, 
  variant = 'default',
  size = 'md',
  className,
  height = 'auto',
  onClick,
  loading = false
}) => {
  const cardClasses = clsx(
    'bg-white rounded-lg border transition-all duration-200',
    {
      // Варианты карточек
      'shadow-sm border-gray-200 hover:shadow-md': variant === 'default',
      'shadow-md border-gray-300': variant === 'elevated',
      'shadow-none border-gray-300': variant === 'outlined',
      'shadow-sm border-gray-200 bg-gradient-to-br from-gray-50 to-white': variant === 'stat',
      
      // Размеры отступов
      'p-4': size === 'sm',
      'p-6': size === 'md',
      'p-8': size === 'lg',
      'p-10': size === 'xl',
      
      // Высота
      'h-auto': height === 'auto',
      'h-32': height === 'fixed' && size === 'sm',
      'h-40': height === 'fixed' && size === 'md',
      'h-48': height === 'fixed' && size === 'lg',
      'h-56': height === 'fixed' && size === 'xl',
      'min-h-32': height === 'min' && size === 'sm',
      'min-h-40': height === 'min' && size === 'md',
      'min-h-48': height === 'min' && size === 'lg',
      'min-h-56': height === 'min' && size === 'xl',
      
      // Интерактивность
      'cursor-pointer hover:border-gray-300': onClick && !loading,
      'opacity-50 cursor-not-allowed': loading,
    },
    className
  );

  const headerClasses = clsx(
    'border-b border-gray-100',
    {
      'mb-4 pb-4': size === 'sm',
      'mb-6 pb-4': size === 'md',
      'mb-8 pb-6': size === 'lg',
      'mb-10 pb-8': size === 'xl',
    }
  );

  const contentClasses = clsx(
    'space-y-4',
    {
      'space-y-2': size === 'sm',
      'space-y-4': size === 'md',
      'space-y-6': size === 'lg',
      'space-y-8': size === 'xl',
    }
  );

  const actionsClasses = clsx(
    'border-t border-gray-100 flex justify-end space-x-3',
    {
      'mt-4 pt-4': size === 'sm',
      'mt-6 pt-4': size === 'md',
      'mt-8 pt-6': size === 'lg',
      'mt-10 pt-8': size === 'xl',
    }
  );

  return (
    <div 
      className={cardClasses}
      onClick={onClick && !loading ? onClick : undefined}
    >
      {(title || subtitle) && (
        <div className={headerClasses}>
          {title && (
            <h3 className={clsx(
              'font-semibold text-gray-900',
              {
                'text-base': size === 'sm',
                'text-lg': size === 'md',
                'text-xl': size === 'lg',
                'text-2xl': size === 'xl',
              }
            )}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={clsx(
              'text-gray-500 mt-1',
              {
                'text-xs': size === 'sm',
                'text-sm': size === 'md',
                'text-base': size === 'lg',
                'text-lg': size === 'xl',
              }
            )}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className={contentClasses}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          children
        )}
      </div>
      
      {actions && (
        <div className={actionsClasses}>
          {actions}
        </div>
      )}
    </div>
  );
};

// Специализированная карточка для статистики
interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'orange' | 'blue' | 'green' | 'purple' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  trend,
  color = 'orange',
  size = 'md'
}) => {
  const colorClasses = {
    orange: 'text-orange-500 bg-orange-50',
    blue: 'text-blue-500 bg-blue-50',
    green: 'text-green-500 bg-green-50',
    purple: 'text-purple-500 bg-purple-50',
    red: 'text-red-500 bg-red-50',
  };

  const valueSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const titleSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <StrictCard 
      variant="stat" 
      size={size} 
      height="fixed"
      className="flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className={clsx('font-medium text-gray-600 truncate', titleSizeClasses[size])}>
            {title}
          </p>
          <p className={clsx('font-bold text-gray-900 mt-1', valueSizeClasses[size])}>
            {value}
          </p>
          {change && (
            <div className="flex items-center mt-2">
              <span className={clsx(
                'font-medium',
                titleSizeClasses[size],
                change.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {change.isPositive ? '+' : ''}{change.value}%
              </span>
              <span className={clsx('text-gray-500 ml-1', titleSizeClasses[size])}>
                vs {change.period || 'last month'}
              </span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 ml-4">
          <div className={clsx('p-3 rounded-lg', colorClasses[color])}>
            {icon}
          </div>
        </div>
      </div>
    </StrictCard>
  );
};

// Карточка для списков с фиксированной высотой
interface ListCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxHeight?: string;
  className?: string;
}

export const ListCard: React.FC<ListCardProps> = ({
  title,
  subtitle,
  children,
  actions,
  maxHeight = 'max-h-96',
  className
}) => {
  return (
    <StrictCard
      title={title}
      subtitle={subtitle}
      actions={actions}
      size="md"
      className={className}
    >
      <div className={clsx('overflow-y-auto', maxHeight)}>
        {children}
      </div>
    </StrictCard>
  );
};

// Карточка для форм
interface FormCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export const FormCard: React.FC<FormCardProps> = ({
  title,
  subtitle,
  children,
  actions,
  loading,
  className
}) => {
  return (
    <StrictCard
      title={title}
      subtitle={subtitle}
      actions={actions}
      size="lg"
      loading={loading}
      className={className}
    >
      <div className="space-y-6">
        {children}
      </div>
    </StrictCard>
  );
};

export default StrictCard; 