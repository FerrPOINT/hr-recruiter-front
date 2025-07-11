import React from 'react';

interface ContainerWidgetProps {
  backgroundColor: string;
  border: string;
  padding: number;
  isSelected?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

const ContainerWidget: React.FC<ContainerWidgetProps> = ({
  backgroundColor,
  border,
  padding,
  isSelected = false,
  onClick,
  children,
}) => {
  return (
    <div
      className={`relative w-full h-full ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        backgroundColor,
        border,
        padding: `${padding}px`,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default ContainerWidget; 