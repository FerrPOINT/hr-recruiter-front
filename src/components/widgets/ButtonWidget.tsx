import React from 'react';

interface ButtonWidgetProps {
  text: string;
  variant: 'primary' | 'secondary' | 'outline';
  disabled: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const ButtonWidget: React.FC<ButtonWidgetProps> = ({
  text,
  variant,
  disabled,
  isSelected = false,
  onClick,
}) => {
  const baseClass = `px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer border ${isSelected ? 'ring-2 ring-blue-500' : ''}`;
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 border-gray-600',
    outline: 'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50'
  };

  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={`${baseClass} ${variantClasses[variant]} ${disabledClass} w-full h-full`}
      disabled={disabled}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default ButtonWidget; 