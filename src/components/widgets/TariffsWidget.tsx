import React from 'react';
import BaseWidget from './BaseWidget';
// import Tariffs from '../pages/Tariffs';
const Tariffs = () => <div>Tariffs widget placeholder</div>;

interface TariffsWidgetProps {
  id: string;
  tariffs?: any[];
  isSelected?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const TariffsWidget: React.FC<TariffsWidgetProps> = ({
  id,
  tariffs,
  isSelected = false,
  onClick,
  onClose,
  onRefresh,
  onMouseDown
}) => {
  const currentTariffs = tariffs || [];

  return (
    <BaseWidget
      id={id}
      isSelected={isSelected}
      onClick={onClick}
      onClose={onClose}
      onRefresh={onRefresh}
      onMouseDown={onMouseDown}
      title="Тарифы"
    >
      <div className="space-y-1">
        {currentTariffs.length > 0 ? (
          currentTariffs.slice(0, 3).map((tariff, index) => (
            <div key={index} className="flex items-center justify-between p-1 bg-gray-50 rounded">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{tariff.name || 'Тариф'}</p>
                <p className="text-[10px] text-gray-500 truncate">{tariff.description || 'Описание'}</p>
              </div>
              <span className="text-xs font-bold text-gray-800 ml-2">
                {tariff.price || 0} ₽
              </span>
            </div>
          ))
        ) : (
          <div className="text-xs text-gray-500 text-center py-2">
            Нет доступных тарифов
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

export default TariffsWidget; 