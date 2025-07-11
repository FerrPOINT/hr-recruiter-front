import React from 'react';

interface ChartWidgetProps {
  type: 'line' | 'bar' | 'pie';
  data: any[];
  title: string;
  isSelected?: boolean;
  onClick?: () => void;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({
  type,
  data,
  title,
  isSelected = false,
  onClick,
}) => {
  const baseClass = `bg-white border ${isSelected ? 'border-blue-500' : 'border-gray-300'} rounded p-2 w-full h-full select-none`;

  return (
    <div className={baseClass} onClick={onClick}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-base font-semibold text-gray-800">{title}</span>
        <span className="text-xs text-gray-500 capitalize">{type}</span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full h-20 bg-gray-50 rounded flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-xs text-gray-500">График {type}</div>
            <div className="text-xs text-gray-400">{data.length} точек данных</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartWidget; 