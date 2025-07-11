import React from 'react';

interface DividerWidgetProps {
  type: 'horizontal' | 'vertical';
  thickness: number;
  color: string;
  isSelected?: boolean;
  onClick?: () => void;
}

const DividerWidget: React.FC<DividerWidgetProps> = ({
  type,
  thickness,
  color,
  isSelected = false,
  onClick,
}) => {
  const baseClass = `bg-white border ${isSelected ? 'border-blue-500' : 'border-gray-300'} rounded p-1 w-full h-full select-none flex items-center justify-center`;

  return (
    <div className={baseClass} onClick={onClick}>
      <div
        className={`${type === 'horizontal' ? 'w-full' : 'h-full'}`}
        style={{
          backgroundColor: color,
          height: type === 'horizontal' ? `${thickness}px` : '100%',
          width: type === 'vertical' ? `${thickness}px` : '100%',
        }}
      />
    </div>
  );
};

export default DividerWidget; 