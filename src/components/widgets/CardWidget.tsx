import React from 'react';

interface CardWidgetProps {
  backgroundColor: string;
  borderColor: string;
  borderRadius: number;
  padding: number;
  isSelected?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

const CardWidget: React.FC<CardWidgetProps> = ({
  backgroundColor,
  borderColor,
  borderRadius,
  padding,
  isSelected = false,
  onClick,
  children,
}) => {
  return (
    <div
      className={`relative transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ backgroundColor, border: `1px solid ${borderColor}`, borderRadius, padding }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default CardWidget; 