import React from 'react';
import { GripVertical } from 'lucide-react';

interface BaseWidgetProps {
  id: string;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  isSelected?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  loading?: boolean;
  error?: string | null;
  showClose?: boolean;
  className?: string;
}

const BaseWidget: React.FC<BaseWidgetProps> = ({
  id,
  children,
  title,
  subtitle,
  isSelected,
  onClick,
  onClose,
  onRefresh,
  onMouseDown,
  loading = false,
  error = null,
  showClose = true,
  className = ''
}) => {
  /**
   * Обработчик клика по заголовку для перетаскивания
   * ВАЖНО: Перетаскивание работает ТОЛЬКО за заголовок виджета
   * Кнопки управления (обновить, закрыть) остаются кликабельными поверх области перетаскивания
   */
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    // Проверяем, не кликнули ли мы по кнопке управления
    const target = e.target as HTMLElement;
    const isControlButton = target.closest('button');
    
    if (isControlButton) {
      // Если кликнули по кнопке, не начинаем перетаскивание
      // Это позволяет кнопкам работать поверх области перетаскивания
      return;
    }
    
    // Если кликнули по заголовку (но не по кнопке), начинаем перетаскивание
    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  /**
   * Обработчик клика по содержимому виджета
   * ВАЖНО: Содержимое виджета НЕ участвует в перетаскивании
   * Клики по содержимому только выделяют виджет, но не начинают перетаскивание
   */
  const handleContentClick = (e: React.MouseEvent) => {
    // Предотвращаем перетаскивание при клике по содержимому
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      id={id}
      className={`
        relative bg-white border border-gray-300 rounded-lg shadow-sm
        transition-all duration-300 ease-in-out
        hover:shadow-md hover:border-blue-200
        ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' : ''}
        ${className}
        animate-in fade-in-0 slide-in-from-bottom-2 duration-500
      `}
    >
      {/* 
        ЗАГОЛОВОК ВИДЖЕТА - ОБЛАСТЬ ПЕРЕТАСКИВАНИЯ
        ВАЖНО: Перетаскивание работает ТОЛЬКО за эту область
        Кнопки управления (обновить, закрыть) имеют z-index: 10 и остаются кликабельными
        Атрибут data-widget-header используется в EditorCanvas для определения области перетаскивания
      */}
      {(title || subtitle || showClose || onRefresh) && (
        <div 
          className="flex items-center justify-between p-2 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white cursor-move hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 rounded-t-lg"
          onMouseDown={handleHeaderMouseDown}
          title="Перетащите за заголовок для перемещения виджета"
          data-widget-header="true"
        >
          <div className="flex items-center space-x-2 flex-1">
            <div className="flex items-center space-x-2 text-gray-400 opacity-60 hover:opacity-100 transition-opacity">
              <GripVertical className="w-3 h-3" />
            </div>
            <div className="flex-1">
                          {title && (
              <h3 className="text-sm font-medium text-gray-900 truncate select-none">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 truncate select-none">
                {subtitle}
              </p>
            )}
            </div>
            {loading && (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-gray-500">Загрузка...</span>
              </div>
            )}
          </div>
          
          {/* 
            КНОПКИ УПРАВЛЕНИЯ - ПОВЕРХ ОБЛАСТИ ПЕРЕТАСКИВАНИЯ
            ВАЖНО: z-index: 10 обеспечивает, что кнопки остаются кликабельными
            даже когда заголовок является областью перетаскивания
          */}
          <div className="flex items-center space-x-1 relative z-10">
            {onRefresh && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh();
                }}
                className="
                  p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 
                  rounded transition-all duration-200 ease-in-out
                  transform hover:scale-110 active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                  cursor-pointer
                "
                title="Обновить"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
            
            {showClose && onClose && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="
                  p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 
                  rounded transition-all duration-200 ease-in-out
                  transform hover:scale-110 active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
                  cursor-pointer
                "
                title="Закрыть"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 
        СОДЕРЖИМОЕ ВИДЖЕТА - НЕ ПЕРЕТАСКИВАЕТСЯ
        ВАЖНО: Эта область НЕ участвует в перетаскивании
        Клики по содержимому только выделяют виджет, но не начинают перетаскивание
      */}
      <div 
        className="p-2 relative"
        onClick={handleContentClick}
      >
        {error ? (
          <div className="
            flex items-center justify-center p-4 text-center
            animate-in fade-in-0 duration-300
          ">
            <div className="space-y-2">
              <div className="text-red-500 text-4xl">⚠️</div>
              <p className="text-sm text-red-600 font-medium">Ошибка загрузки</p>
              <p className="text-xs text-gray-500">{error}</p>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="
                    mt-2 px-3 py-1.5 bg-red-500 text-white text-xs rounded-md
                    hover:bg-red-600 transition-colors duration-200
                    transform hover:scale-105 active:scale-95
                  "
                >
                  Попробовать снова
                </button>
              )}
            </div>
          </div>
        ) : loading ? (
          <div className="
            flex items-center justify-center p-8
            animate-in fade-in-0 duration-300
          ">
            <div className="space-y-3 text-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-gray-500">Загрузка данных...</p>
            </div>
          </div>
        ) : (
          <div className="
            animate-in fade-in-0 slide-in-from-bottom-1 duration-300
          ">
            {children}
          </div>
        )}
      </div>

      {/* Индикатор выбора */}
      {isSelected && (
        <div className="
          absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none
          animate-in fade-in-0 duration-200
        "></div>
      )}
    </div>
  );
};

export default BaseWidget; 