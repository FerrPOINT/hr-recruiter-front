import React from 'react';

interface ImageWidgetProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  isSelected?: boolean;
  onClick?: () => void;
}

const ImageWidget: React.FC<ImageWidgetProps> = ({
  src,
  alt,
  width,
  height,
  isSelected = false,
  onClick,
}) => {
  const baseClass = `bg-white border ${isSelected ? 'border-blue-500' : 'border-gray-300'} rounded p-1 w-full h-full select-none flex items-center justify-center`;

  return (
    <div className={baseClass} onClick={onClick}>
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
        {src ? (
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain"
            style={{ width: `${width}px`, height: `${height}px` }}
          />
        ) : (
          <div className="text-center">
            <div className="text-2xl mb-1">🖼️</div>
            <div className="text-xs text-gray-500">Изображение</div>
            <div className="text-xs text-gray-400">{width}x{height}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageWidget; 