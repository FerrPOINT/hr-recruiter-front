import React from 'react';
import FeedItem, { FeedItemProps } from './FeedItem';
import { clsx } from 'clsx';

interface FeedListProps {
  items: FeedItemProps[];
  groupBy?: (item: FeedItemProps) => string;
  className?: string;
}

const FeedList: React.FC<FeedListProps> = ({ items, groupBy, className }) => {
  // Группировка по дате/типу, если нужно
  const grouped = groupBy
    ? items.reduce((acc, item) => {
        const key = groupBy(item);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {} as Record<string, FeedItemProps[]>)
    : { '': items };

  return (
    <div className={clsx('flex flex-col', className)} role="list">
      {Object.entries(grouped).map(([group, groupItems]) => (
        <React.Fragment key={group}>
          {group && group !== '' && (
            <div className="text-xs text-gray-400 font-semibold px-2 py-1 uppercase tracking-wide bg-gray-50 sticky top-0 z-10">{group}</div>
          )}
          {groupItems.map((item, idx) => (
            <FeedItem key={(item.title || `item-${idx}`) + idx} {...item} />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default FeedList; 