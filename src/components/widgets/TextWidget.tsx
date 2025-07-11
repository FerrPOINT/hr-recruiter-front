import React from 'react';

interface TextWidgetProps {
  content: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  isSelected?: boolean;
  onClick?: () => void;
}

const TextWidget: React.FC<TextWidgetProps> = ({
  content,
  fontSize,
  fontWeight,
  color,
  isSelected = false,
  onClick,
}) => {
  return (
    <div
      className={`relative cursor-pointer p-1 border ${isSelected ? 'border-blue-500' : 'border-gray-300'} rounded w-full h-full select-none`}
      onClick={onClick}
      style={{
        fontSize: `${fontSize}px`,
        fontWeight,
        color,
        minWidth: '50px',
        minHeight: '20px',
      }}
    >
      {content}
    </div>
  );
};

export default TextWidget; 