import React from 'react';
import BaseWidget from './BaseWidget';
// import Learn from '../pages/Learn';
const Learn = () => <div>Learn widget placeholder</div>;

interface LearnWidgetProps {
  id: string;
  title?: string;
  description?: string;
  progress?: number;
  isSelected?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const LearnWidget: React.FC<LearnWidgetProps> = ({
  id,
  title,
  description,
  progress,
  isSelected = false,
  onClick,
  onClose,
  onRefresh,
  onMouseDown
}) => {
  const currentTitle = title || 'Курс обучения';
  const currentDescription = description || 'Описание курса';
  const currentProgress = progress || 0;

  return (
    <BaseWidget
      id={id}
      isSelected={isSelected}
      onClick={onClick}
      onClose={onClose}
      onRefresh={onRefresh}
      onMouseDown={onMouseDown}
      title="Обучение"
    >
      <div className="space-y-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 truncate">{currentTitle}</h3>
          <p className="text-xs text-gray-600 truncate">{currentDescription}</p>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Прогресс</span>
            <span className="text-gray-800 font-medium">{currentProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

export default LearnWidget; 