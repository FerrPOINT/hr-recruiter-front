import React from 'react';

interface ListWidgetProps {
  items: string[];
  type: 'ordered' | 'unordered';
  isSelected?: boolean;
  onClick?: () => void;
}

const ListWidget: React.FC<ListWidgetProps> = ({
  items,
  type,
  isSelected = false,
  onClick,
}) => {
  const baseClass = `bg-white border ${isSelected ? 'border-blue-500' : 'border-gray-300'} rounded p-2 w-full h-full select-none`;

  return (
    <div className={baseClass} onClick={onClick}>
      <div className="space-y-1">
        {type === 'ordered' ? (
          <ol className="list-decimal list-inside space-y-1">
            {items.slice(0, 5).map((item, index) => (
              <li key={index} className="text-xs text-gray-700">
                {item}
              </li>
            ))}
          </ol>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {items.slice(0, 5).map((item, index) => (
              <li key={index} className="text-xs text-gray-700">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ListWidget; 