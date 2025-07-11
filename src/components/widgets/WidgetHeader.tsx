import React from 'react';

interface WidgetHeaderProps {
  title: string;
  onRefresh?: (e: React.MouseEvent) => void;
  onClose?: (e: React.MouseEvent) => void;
  onAdd?: (e: React.MouseEvent) => void;
  onSettings?: (e: React.MouseEvent) => void;
  showRefresh?: boolean;
  showClose?: boolean;
  showAdd?: boolean;
  showSettings?: boolean;
  subtitle?: string;
  loading?: boolean;
}

const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  title,
  onRefresh,
  onClose,
  onAdd,
  onSettings,
  showRefresh = true,
  showClose = true,
  showAdd = false,
  showSettings = false,
  subtitle,
  loading = false
}) => {
  return (
    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 relative z-30">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800 truncate">{title}</span>
          {loading && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-1">
        {showSettings && onSettings && (
          <button
            onClick={onSettings}
            className="p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors duration-200"
            title="Настройки виджета"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
        {showAdd && onAdd && (
          <button
            onClick={onAdd}
            className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors duration-200"
            title="Добавить элемент"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        )}
        {showRefresh && onRefresh && (
          <button
            onClick={onRefresh}
            className={`p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors duration-200 ${loading ? 'animate-spin' : ''}`}
            title="Обновить данные"
            disabled={loading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
        {showClose && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
            title="Закрыть виджет"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default WidgetHeader; 