import React from 'react';

interface InputWidgetProps {
  type: 'text' | 'email' | 'password' | 'number';
  placeholder: string;
  value: string;
  label: string;
  isSelected?: boolean;
  onClick?: () => void;
}

const InputWidget: React.FC<InputWidgetProps> = ({
  type,
  placeholder,
  value,
  label,
  isSelected = false,
  onClick,
}) => {
  const baseClass = `bg-white border ${isSelected ? 'border-blue-500' : 'border-gray-300'} rounded p-2 w-full h-full select-none`;

  return (
    <div className={baseClass} onClick={onClick}>
      <div className="space-y-1">
        {label && (
          <label className="block text-xs font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none"
          readOnly
        />
      </div>
    </div>
  );
};

export default InputWidget; 