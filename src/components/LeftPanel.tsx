import React, { useState } from 'react';
import { usePagesStore } from '../store/pagesStore';

interface LeftPanelProps {
  width: number;
  onWidthChange: (width: number) => void;
}

const COMPONENT_TYPES = [
  // Основные виджеты
  {
    type: 'dashboard',
    name: 'Дашборд',
    icon: '📊',
    category: 'Основные',
    description: 'Обзор активности и статистики',
    defaultProps: {
      showStats: true,
      showRecentInterviews: true,
      showActivePositions: true,
    },
  },
  {
    type: 'vacancyList',
    name: 'Список вакансий',
    icon: '💼',
    category: 'Основные',
    description: 'Управление вакансиями и кандидатами',
    defaultProps: {
      showSearch: true,
      showFilters: true,
      maxItems: 10,
      width: 800,
      height: 1000,
    },
  },
  {
    type: 'interviewList',
    name: 'Список интервью',
    icon: '🎤',
    category: 'Основные',
    description: 'Управление интервью и сессиями',
    defaultProps: {
      showSearch: true,
      showFilters: true,
      maxItems: 10,
    },
  },
  {
    type: 'candidates',
    name: 'Кандидаты',
    icon: '👤',
    category: 'Основные',
    description: 'Управление кандидатами и их статусами',
    defaultProps: {
      showSearch: true,
      showFilters: true,
      maxCandidates: 10,
    },
  },
  
  // Аналитика и отчеты
  {
    type: 'stats',
    name: 'Статистика',
    icon: '📈',
    category: 'Аналитика',
    description: 'Анализ данных и метрики',
    defaultProps: {
      showCards: true,
      showCharts: true,
      showTrends: true,
    },
  },
  {
    type: 'reports',
    name: 'Отчеты',
    icon: '📋',
    category: 'Аналитика',
    description: 'Генерация и управление отчетами',
    defaultProps: {
      showFilters: true,
      showActions: true,
      maxReports: 10,
    },
  },
  {
    type: 'interview-report',
    name: 'Отчет по собеседованиям',
    icon: '📊',
    category: 'Аналитика',
    description: 'Глобальный отчет по всем собеседованиям с аналитикой',
    defaultProps: {
      showFilters: true,
      showAnalytics: true,
      showDetailedTable: true,
      width: 1200,
      height: 800,
    },
  },
  
  // Управление контентом
  {
    type: 'questions',
    name: 'Вопросы интервью',
    icon: '❓',
    category: 'Контент',
    description: 'Управление вопросами для интервью',
    defaultProps: {
      showSearch: true,
      showFilters: true,
      maxQuestions: 10,
    },
  },
  {
    type: 'calendar',
    name: 'Календарь интервью',
    icon: '📅',
    category: 'Контент',
    description: 'Календарь интервью и событий',
    defaultProps: {
      showMonth: true,
      showWeek: true,
      showList: true,
    },
  },
  {
    type: 'learn',
    name: 'Обучение',
    icon: '📚',
    category: 'Контент',
    description: 'Материалы для обучения',
    defaultProps: {},
  },
  
  // Команда и уведомления
  {
    type: 'team',
    name: 'Команда',
    icon: '👥',
    category: 'Команда',
    description: 'Управление участниками команды',
    defaultProps: {
      showRoles: true,
      showStats: true,
      maxMembers: 10,
    },
  },
  {
    type: 'notifications',
    name: 'Уведомления',
    icon: '🔔',
    category: 'Команда',
    description: 'Системные уведомления и события',
    defaultProps: {
      showFilters: true,
      showActions: true,
      maxNotifications: 20,
    },
  },
  
  // Настройки и управление
  {
    type: 'account',
    name: 'Аккаунт',
    icon: '👤',
    category: 'Настройки',
    description: 'Настройки профиля',
    defaultProps: {},
  },
  {
    type: 'branding',
    name: 'Брендинг',
    icon: '🎨',
    category: 'Настройки',
    description: 'Настройки брендинга',
    defaultProps: {},
  },
  {
    type: 'tariffs',
    name: 'Тарифы',
    icon: '💰',
    category: 'Настройки',
    description: 'Управление тарифами',
    defaultProps: {},
  },
  {
    type: 'archive',
    name: 'Архив',
    icon: '📁',
    category: 'Настройки',
    description: 'Архивные данные',
    defaultProps: {},
  },
];

// Группировка компонентов по категориям
const groupComponentsByCategory = (components: typeof COMPONENT_TYPES) => {
  const grouped = components.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {} as Record<string, typeof COMPONENT_TYPES>);
  
  return grouped;
};

export const LeftPanel: React.FC<LeftPanelProps> = ({ width, onWidthChange }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Основные']);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    // Проверяем, что событие происходит внутри левой панели
    const leftPanel = document.querySelector('.left-panel');
    if (!leftPanel || !leftPanel.contains(e.target as Node)) {
      return;
    }
    
    // Проверяем, не находится ли фокус в инпуте
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT')) {
      return;
    }
    
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth > 200 && newWidth < 400) {
        onWidthChange(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  const handleComponentDragStart = (e: React.DragEvent, componentType: typeof COMPONENT_TYPES[0]) => {
    console.log('Starting drag for component:', componentType);
    const dragData = {
      type: componentType.type,
      defaultProps: componentType.defaultProps,
    };
    console.log('Setting drag data:', dragData);
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Фильтрация компонентов по поиску
  const filteredComponents = COMPONENT_TYPES.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedComponents = groupComponentsByCategory(filteredComponents);

  return (
    <div 
      className="left-panel bg-gray-50 border-r border-gray-200 flex flex-col h-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] animate-fade-in overflow-auto"
      style={{ width: `${width}px` }}
    >
      {/* Components Section */}
      <div className="p-2">
        <h3 className="text-xs font-medium text-gray-700 mb-2">Доступные компоненты</h3>
        
        {/* Search */}
        <div className="mb-2">
          <input
            type="text"
            placeholder="Поиск компонентов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Accordion */}
        <div className="space-y-1">
          {Object.entries(groupedComponents).map(([category, components]) => (
            <div key={category} className="border border-gray-200 rounded overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-2 py-1 bg-white hover:bg-gray-50 flex items-center justify-between text-xs font-medium text-gray-700 border-b border-gray-200 transition-colors"
              >
                <span>{category}</span>
                <span className={`transform transition-transform ${expandedCategories.includes(category) ? 'rotate-180' : ''} text-[10px]`}>
                  ▼
                </span>
              </button>
              
              {/* Category Content */}
              {expandedCategories.includes(category) && (
                <div className="bg-gray-50">
                  {components.map((component) => (
                    <div
                      key={component.type}
                      draggable
                      onDragStart={(e) => handleComponentDragStart(e, component)}
                      className="flex items-center space-x-2 p-2 bg-white border-b border-gray-100 cursor-move hover:bg-blue-50 hover:border-blue-200 transition-all text-xs last:border-b-0"
                    >
                      <span className="text-sm" style={{ fontSize: '16px' }}>{component.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-700 truncate text-xs" style={{ fontSize: '12px' }}>{component.name}</div>
                        <div className="text-[10px] text-gray-500 truncate" style={{ fontSize: '10px' }}>{component.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}; 