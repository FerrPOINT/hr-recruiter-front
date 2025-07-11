import React from 'react';

interface MiniButtonProps {
  icon: React.ReactNode;
  title?: string;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
}

const MiniButton: React.FC<MiniButtonProps> = ({ icon, title, onClick, className, disabled }) => {
  return (
    <button
      type="button"
      className={`w-5 h-5 flex items-center justify-center rounded-full bg-white/70 hover:bg-gray-200 border border-gray-300 shadow-sm text-gray-600 hover:text-black transition-all duration-150 p-0 m-0 focus:outline-none ${className || ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ fontSize: '13px', lineHeight: 1 }}
      title={title}
      tabIndex={-1}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {icon}
    </button>
  );
};

export default MiniButton; 