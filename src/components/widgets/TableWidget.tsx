import React from 'react';

interface TableWidgetProps {
  columns: string[];
  data: any[][];
  title: string;
  isSelected?: boolean;
  onClick?: () => void;
}

const TableWidget: React.FC<TableWidgetProps> = ({
  columns,
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
        <span className="text-xs text-gray-500">{data.length} строк</span>
      </div>
      <div className="overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              {columns.slice(0, 3).map((column, index) => (
                <th key={index} className="px-1 py-1 text-left font-medium text-gray-700">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 3).map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100">
                {row.slice(0, 3).map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-1 py-1 text-gray-600 truncate">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableWidget; 