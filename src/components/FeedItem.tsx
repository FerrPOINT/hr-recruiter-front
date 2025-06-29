import React from 'react';
import clsx from 'clsx';

export interface FeedItemProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  tags?: string[];
  status?: string;
  actions?: React.ReactNode;
  details?: React.ReactNode;
  expanded?: boolean;
  onExpand?: () => void;
  className?: string;
  ariaLabel?: string;
  type?: string;
}

const FeedItem: React.FC<FeedItemProps> = ({
  icon,
  title,
  description,
  tags,
  status,
  actions,
  details,
  expanded,
  onExpand,
  className,
  ariaLabel,
}) => (
  <div
    className={clsx(
      'bg-white rounded-xl border border-gray-200 shadow-soft p-6 mb-4 flex flex-col gap-2 transition hover:shadow-md',
      expanded && 'ring-2 ring-primary-500',
      className
    )}
    aria-label={ariaLabel}
  >
    <div className="flex items-start gap-4">
      {icon && <div className="flex-shrink-0 mt-1">{icon}</div>}
      <div className="flex-1 min-w-0">
        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
        {description && <div className="text-gray-600 text-sm mt-1">{description}</div>}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, i) => (
              <span key={i} className="bg-gray-100 text-xs text-gray-700 px-2 py-0.5 rounded">{tag}</span>
            ))}
          </div>
        )}
        {status && (
          <div className="mt-2 text-xs font-medium text-primary-600">{status}</div>
        )}
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
    {details && (
      <div className="mt-3">{details}</div>
    )}
    {onExpand && (
      <button
        className="text-primary-500 text-xs mt-2 self-end"
        onClick={onExpand}
        aria-label="Подробнее"
      >
        {expanded ? 'Скрыть' : 'Подробнее'}
      </button>
    )}
  </div>
);

export default FeedItem; 