import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  height = 'h-4', 
  width = 'w-full',
  rounded = 'md'
}) => {
  return (
    <div 
      className={clsx(
        'animate-pulse bg-gray-200',
        height,
        width,
        {
          'rounded-none': rounded === 'none',
          'rounded-sm': rounded === 'sm',
          'rounded-md': rounded === 'md',
          'rounded-lg': rounded === 'lg',
          'rounded-full': rounded === 'full',
        },
        className
      )}
    />
  );
};

// Скелетон для карточки статистики
export const StatCardSkeleton: React.FC = () => (
  <div className="card p-6 h-32">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  </div>
);

// Скелетон для строки таблицы
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 6 }) => (
  <tr>
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="px-4 py-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

// Скелетон для таблицы
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 6 
}) => (
  <div className="overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index} className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-20" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRowSkeleton key={rowIndex} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
);

// Скелетон для списка вакансий
export const VacancyListSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-48 mb-2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

// Скелетон для деталей вакансии
export const VacancyDetailsSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-6 w-32" />
    </div>
    <div>
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-full" />
        ))}
      </div>
    </div>
  </div>
); 