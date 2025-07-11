import React, { useState } from 'react';
import { usePagesStore } from '../store/pagesStore';

interface RightPanelProps {
  width: number;
  onWidthChange: (width: number) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ width, onWidthChange }) => {
  const [isResizing, setIsResizing] = useState(false);
  
  const {
    getActivePage,
    getSelectedComponent,
    updateComponent,
    deleteComponent,
    duplicateComponent,
    updatePage,
  } = usePagesStore();

  const activePage = getActivePage();
  const selectedComponent = getSelectedComponent();

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    // Проверяем, что событие происходит внутри правой панели
    const rightPanel = document.querySelector('.right-panel');
    if (!rightPanel || !rightPanel.contains(e.target as Node)) {
      return;
    }
    
    // Проверяем, не находится ли фокус в инпуте
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT')) {
      return;
    }
    
    if (isResizing) {
      const newWidth = window.innerWidth - e.clientX;
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

  const handlePropertyChange = (property: string, value: any) => {
    if (!activePage || !selectedComponent) return;
    
    updateComponent(activePage.id, selectedComponent.id, {
      props: {
        ...selectedComponent.props,
        [property]: value,
      },
    });
  };

  const handleDeleteComponent = () => {
    if (!activePage || !selectedComponent) return;
    
    if (window.confirm('Вы уверены, что хотите удалить этот компонент?')) {
      deleteComponent(activePage.id, selectedComponent.id);
    }
  };

  const handleDuplicateComponent = () => {
    if (!activePage || !selectedComponent) return;
    duplicateComponent(activePage.id, selectedComponent.id);
  };

  const renderTextProperties = () => {
    if (!selectedComponent) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Текст
          </label>
          <textarea
            value={selectedComponent.props.content || ''}
            onChange={(e) => handlePropertyChange('content', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Размер шрифта
          </label>
          <input
            type="number"
            value={selectedComponent.props.fontSize || 16}
            onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="8"
            max="72"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Цвет
          </label>
          <input
            type="color"
            value={selectedComponent.props.color || '#000000'}
            onChange={(e) => handlePropertyChange('color', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    );
  };

  const renderButtonProperties = () => {
    if (!selectedComponent) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Текст кнопки
          </label>
          <input
            type="text"
            value={selectedComponent.props.text || ''}
            onChange={(e) => handlePropertyChange('text', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Вариант
          </label>
          <select
            value={selectedComponent.props.variant || 'primary'}
            onChange={(e) => handlePropertyChange('variant', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="outline">Outline</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="disabled"
            checked={selectedComponent.props.disabled || false}
            onChange={(e) => handlePropertyChange('disabled', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="disabled" className="text-sm font-medium text-gray-700">
            Отключена
          </label>
        </div>
      </div>
    );
  };

  const renderContainerProperties = () => {
    if (!selectedComponent) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Цвет фона
          </label>
          <input
            type="color"
            value={selectedComponent.props.backgroundColor || '#f0f0f0'}
            onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Отступы
          </label>
          <input
            type="number"
            value={selectedComponent.props.padding || 16}
            onChange={(e) => handlePropertyChange('padding', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="100"
          />
        </div>
      </div>
    );
  };

  const renderImageProperties = () => {
    if (!selectedComponent) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL изображения
          </label>
          <input
            type="text"
            value={selectedComponent.props.src || ''}
            onChange={(e) => handlePropertyChange('src', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alt текст
          </label>
          <input
            type="text"
            value={selectedComponent.props.alt || ''}
            onChange={(e) => handlePropertyChange('alt', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    );
  };

  const renderDividerProperties = () => {
    if (!selectedComponent) return null;
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Цвет</label>
          <input
            type="color"
            value={selectedComponent.props.color || '#e5e7eb'}
            onChange={(e) => handlePropertyChange('color', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Толщина (px)</label>
          <input
            type="number"
            value={selectedComponent.props.thickness || 2}
            onChange={(e) => handlePropertyChange('thickness', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="20"
          />
        </div>
      </div>
    );
  };

  const renderCardProperties = () => {
    if (!selectedComponent) return null;
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Цвет фона</label>
          <input
            type="color"
            value={selectedComponent.props.backgroundColor || '#fff'}
            onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Цвет рамки</label>
          <input
            type="color"
            value={selectedComponent.props.borderColor || '#e5e7eb'}
            onChange={(e) => handlePropertyChange('borderColor', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Радиус скругления</label>
          <input
            type="number"
            value={selectedComponent.props.borderRadius || 12}
            onChange={(e) => handlePropertyChange('borderRadius', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Внутренний отступ (px)</label>
          <input
            type="number"
            value={selectedComponent.props.padding || 16}
            onChange={(e) => handlePropertyChange('padding', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="100"
          />
        </div>
      </div>
    );
  };

  const renderListProperties = () => {
    if (!selectedComponent) return null;
    const items: string[] = selectedComponent.props.items || [];
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Пункты списка</label>
          <textarea
            value={items.join('\n')}
            onChange={(e) => handlePropertyChange('items', e.target.value.split('\n'))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="ordered"
            checked={selectedComponent.props.ordered || false}
            onChange={(e) => handlePropertyChange('ordered', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="ordered" className="text-sm font-medium text-gray-700">Нумерованный</label>
        </div>
      </div>
    );
  };

  const renderInputProperties = () => {
    if (!selectedComponent) return null;
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Значение</label>
          <input
            type="text"
            value={selectedComponent.props.value || ''}
            onChange={(e) => handlePropertyChange('value', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
          <input
            type="text"
            value={selectedComponent.props.placeholder || ''}
            onChange={(e) => handlePropertyChange('placeholder', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ширина (px)</label>
          <input
            type="number"
            value={selectedComponent.props.width || 180}
            onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="40"
            max="600"
          />
        </div>
      </div>
    );
  };

  const renderLabelProperties = () => {
    if (!selectedComponent) return null;
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Текст</label>
          <input
            type="text"
            value={selectedComponent.props.text || ''}
            onChange={(e) => handlePropertyChange('text', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Размер шрифта</label>
          <input
            type="number"
            value={selectedComponent.props.fontSize || 16}
            onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="8"
            max="72"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Цвет</label>
          <input
            type="color"
            value={selectedComponent.props.color || '#374151'}
            onChange={(e) => handlePropertyChange('color', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    );
  };

  const renderChartProperties = () => {
    if (!selectedComponent) return null;
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
          <input
            type="text"
            value={selectedComponent.props.title || ''}
            onChange={(e) => handlePropertyChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ширина (px)</label>
          <input
            type="number"
            value={selectedComponent.props.width || 220}
            onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="60"
            max="1000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Высота (px)</label>
          <input
            type="number"
            value={selectedComponent.props.height || 120}
            onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="40"
            max="600"
          />
        </div>
      </div>
    );
  };

  const renderComponentProperties = () => {
    if (!selectedComponent) return null;
    switch (selectedComponent.type) {
      case 'text':
        return renderTextProperties();
      case 'button':
        return renderButtonProperties();
      case 'container':
        return renderContainerProperties();
      case 'image':
        return renderImageProperties();
      case 'divider':
        return renderDividerProperties();
      case 'card':
        return renderCardProperties();
      case 'list':
        return renderListProperties();
      case 'input':
        return renderInputProperties();
      case 'label':
        return renderLabelProperties();
      case 'chart':
        return renderChartProperties();
      default:
        return (
          <div className="text-gray-500 text-sm">
            Свойства для этого типа компонента не поддерживаются
          </div>
        );
    }
  };

  return (
    <div 
      className="right-panel bg-gray-50 border-l border-gray-200 flex flex-col h-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] animate-fade-in overflow-auto"
      style={{ width: `${width}px` }}
    >
      <div className="p-4 border-b border-gray-200 transition-opacity duration-300 animate-fade-in">
        <h2 className="text-lg font-medium text-gray-900">Свойства</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedComponent ? (
          <div className="space-y-6">
            {/* Component Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Компонент: {selectedComponent.type}
              </h3>
              <div className="text-xs text-gray-500">
                ID: {selectedComponent.id}
              </div>
            </div>

            {/* Position */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Позиция</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">X</label>
                  <input
                    type="number"
                    value={selectedComponent.x}
                    onChange={(e) => {
                      if (!activePage) return;
                      updateComponent(activePage.id, selectedComponent.id, {
                        x: parseInt(e.target.value) || 0,
                      });
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Y</label>
                  <input
                    type="number"
                    value={selectedComponent.y}
                    onChange={(e) => {
                      if (!activePage) return;
                      updateComponent(activePage.id, selectedComponent.id, {
                        y: parseInt(e.target.value) || 0,
                      });
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Component Properties */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Свойства</h4>
              {renderComponentProperties()}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleDuplicateComponent}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                tabIndex={0}
                aria-label="Дублировать компонент"
                title="Дублировать компонент (Ctrl+D)"
              >
                Дублировать
              </button>
              <button
                onClick={handleDeleteComponent}
                className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                tabIndex={0}
                aria-label="Удалить компонент"
                title="Удалить компонент (Del)"
              >
                Удалить
              </button>
            </div>
          </div>
        ) : activePage ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Настройки страницы</h3>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="gridEnabled"
                  checked={activePage.gridEnabled ?? true}
                  onChange={e => updatePage(activePage.id, { gridEnabled: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="gridEnabled" className="text-sm text-gray-700">Привязка к сетке</label>
              </div>
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">Шаг сетки (px)</label>
                <input
                  type="number"
                  min={2}
                  max={100}
                  value={activePage.gridSize ?? 10}
                  onChange={e => updatePage(activePage.id, { gridSize: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">🎨</div>
              <div className="text-sm">Выберите компонент для редактирования</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">📄</div>
            <div className="text-sm">Нет активной страницы</div>
          </div>
        )}
      </div>

      {/* Resize Handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}; 