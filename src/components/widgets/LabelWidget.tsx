import React from 'react';

interface LabelWidgetProps {
  text: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  isSelected?: boolean;
  onClick?: () => void;
}

const LabelWidget: React.FC<LabelWidgetProps> = ({
  text,
  fontSize,
  fontWeight,
  color,
  isSelected = false,
  onClick,
}) => {
  const baseClass = `bg-white border ${isSelected ? 'border-blue-500' : 'border-gray-300'} rounded p-1 w-full h-full select-none flex items-center`;

  return (
    <div
      className={baseClass}
      onClick={onClick}
      style={{
        fontSize: `${fontSize}px`,
        fontWeight,
        color,
        minWidth: '50px',
        minHeight: '20px',
      }}
    >
      <span className="font-medium">{text}</span>
    </div>
  );
};

export default LabelWidget; 