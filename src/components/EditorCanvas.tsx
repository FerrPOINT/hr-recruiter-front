import React, { useRef, useEffect, useState } from 'react';
import { usePagesStore, Component } from '../store/pagesStore';
import widgetTypes from './widgets';
import MiniButton from './widgets/MiniButton';
import ConfirmModal from './widgets/ConfirmModal';
import { useDashboardData } from '../hooks/useWidgetData';
import { BaseWidgetProps } from './widgets/types';

// Тип для компонентов виджетов
type WidgetComponentType = React.ComponentType<BaseWidgetProps & Record<string, unknown>>;

// Создаем объект с компонентами виджетов
const WIDGET_COMPONENTS: Record<string, WidgetComponentType> = Object.entries(widgetTypes).reduce((acc, [key, widget]) => {
  acc[key] = widget.component as WidgetComponentType;
  return acc;
}, {} as Record<string, WidgetComponentType>);

interface EditorCanvasProps {
  leftPanelWidth: number;
  rightPanelWidth: number;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  leftPanelWidth,
  rightPanelWidth,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    getActivePage,
    selectedComponentId,
    setSelectedComponent,
    addComponent,
    moveComponent,
    isModalOpen,
  } = usePagesStore();

  console.log('EditorCanvas render:', { leftPanelWidth, rightPanelWidth, selectedComponentId });

  const [draggedComponent, setDraggedComponent] = useState<Component | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; componentId: string | null }>({ open: false, componentId: null });
  const [wasDragging, setWasDragging] = useState(false);
  const [dragRect, setDragRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [widgetRect, setWidgetRect] = useState<{ width: number; height: number } | null>(null);

  const activePage = getActivePage();

      // Находим dashboard компонент для получения данных
    const dashboardComponent = activePage?.components.find(c => c.type === 'dashboard');
    const dashboardData = useDashboardData();
    const { data: dashboardStats } = dashboardData;

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Не обрабатываем клики, если модальное окно открыто
    if (isModalOpen) {
      return;
    }
    
    const target = e.target as HTMLElement;
    if (
      (target === canvasRef.current ||
        target.classList.contains('canvas-background') ||
        target.closest('.canvas-background') === target)
      && !isDragging
    ) {
      if (!wasDragging) {
        setSelectedComponent(null);
      }
      setWasDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedComponent(null);
    setDragOffset(null);
    if (!activePage) {
      return;
    }
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) {
      return;
    }
    try {
      const data = e.dataTransfer.getData('application/json');
      const componentData = JSON.parse(data);
      // Если это перемещение существующего компонента, не добавляем новый
      if (componentData.type === 'move') {
        return;
      }
      let x = e.clientX - canvasRect.left;
      let y = e.clientY - canvasRect.top;
      if (activePage.gridEnabled && activePage.gridSize) {
        const grid = activePage.gridSize;
        x = Math.round(x / grid) * grid;
        y = Math.round(y / grid) * grid;
      }
      console.log('Creating widget with data:', {
        type: componentData.type,
        defaultProps: componentData.defaultProps,
        width: componentData.defaultProps?.width,
        height: componentData.defaultProps?.height
      });
      addComponent(activePage.id, {
        type: componentData.type,
        x,
        y,
        width: componentData.defaultProps?.width,
        height: componentData.defaultProps?.height,
        props: componentData.defaultProps,
      });
    } catch (error) {
      console.error('Error parsing dropped component data:', error);
    }
  };

  const handleComponentClick = (componentId: string, e: React.MouseEvent) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    setSelectedComponent(componentId);
  };

  /**
   * ОБРАБОТЧИК ПЕРЕТАСКИВАНИЯ КОМПОНЕНТОВ НА КАНВАСЕ
   * ВАЖНО: Перетаскивание работает ТОЛЬКО за заголовок виджета (data-widget-header)
   * Кнопки управления остаются кликабельными поверх области перетаскивания
   */
  const handleComponentMouseDown = (e: React.MouseEvent, component: Component) => {
    // Не обрабатываем перетаскивание, если модальное окно открыто
    if (isModalOpen) {
      return;
    }
    
    if (e.button !== 0) return; // Только ЛКМ
    
    // ВАЖНО: Проверяем, что клик произошел именно в заголовке виджета
    // Атрибут data-widget-header устанавливается в BaseWidget
    const target = e.target as HTMLElement;
    const isHeader = target.closest('[data-widget-header]');
    
    if (!isHeader) {
      // Если кликнули не по заголовку, не начинаем перетаскивание
      // Это обеспечивает, что содержимое виджета не участвует в перетаскивании
      return;
    }
    
    // ВАЖНО: Проверяем, не кликнули ли мы по кнопке управления
    // Кнопки имеют z-index: 10 и должны оставаться кликабельными
    const isControlButton = target.closest('button');
    if (isControlButton) {
      // Если кликнули по кнопке, не начинаем перетаскивание
      // Это позволяет кнопкам работать поверх области перетаскивания
      return;
    }
    
    e.stopPropagation();
    usePagesStore.getState().setSelectedComponent(component.id);
    setWasDragging(false);
    const widgetElement = document.getElementById(`cmp-${component.id}`);
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (widgetElement && canvasRect) {
      const rect = widgetElement.getBoundingClientRect();
      console.log('Widget real size:', { width: rect.width, height: rect.height });
      // Сохраняем реальные размеры ДО скрытия виджета
      setWidgetRect({ width: rect.width, height: rect.height });
      setDragRect({
        left: rect.left - canvasRect.left,
        top: rect.top - canvasRect.top,
        width: rect.width,
        height: rect.height
      });
    } else {
      setDragRect(null);
      setWidgetRect(null);
    }
    if (!canvasRect) return;
    
    // Получаем текущие размеры виджета ДО начала перетаскивания
    let currentWidth: number;
    let currentHeight: number;
    
    if (widgetElement) {
      const rect = widgetElement.getBoundingClientRect();
      currentWidth = rect.width;
      currentHeight = rect.height;
    } else {
      currentWidth = component.width || 0;
      currentHeight = component.height || 0;
    }
    
    const offsetX = e.clientX - (canvasRect.left + component.x);
    const offsetY = e.clientY - (canvasRect.top + component.y);
    setDraggedComponent(component);
    setDragOffset({ x: offsetX, y: offsetY });
    setDragPosition({ x: component.x, y: component.y });
    setIsDragging(true);
    document.body.style.userSelect = 'none';
  };



  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      // Проверяем, что событие происходит внутри канваса
      if (!canvasRef.current || !canvasRef.current.contains(e.target as Node)) {
        return;
      }
      
      // Проверяем, не находится ли фокус в инпуте
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT')) {
        return;
      }
      
      if (!dragOffset || !draggedComponent) return;
      setWasDragging(true);
      const canvasRect = canvasRef.current.getBoundingClientRect();
      let x = e.clientX - canvasRect.left - dragOffset.x;
      let y = e.clientY - canvasRect.top - dragOffset.y;
      if (activePage && activePage.gridEnabled && activePage.gridSize) {
        const grid = activePage.gridSize;
        x = Math.round(x / grid) * grid;
        y = Math.round(y / grid) * grid;
      }
      setDragPosition({ x, y });

      // Обновляем dragRect используя сохранённые размеры виджета
      if (widgetRect) {
        console.log('Outline size:', { width: widgetRect.width, height: widgetRect.height, x, y });
        setDragRect({
          left: x,
          top: y,
          width: widgetRect.width,
          height: widgetRect.height
        });
      }
    };
    const handleMouseUp = (e: MouseEvent) => {
      // Проверяем, что событие происходит внутри канваса
      if (!canvasRef.current || !canvasRef.current.contains(e.target as Node)) {
        return;
      }
      
      // Проверяем, не находится ли фокус в инпуте
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT')) {
        return;
      }
      
      if (draggedComponent && dragPosition && activePage) {
        moveComponent(activePage.id, draggedComponent.id, dragPosition.x, dragPosition.y);
      }
      setDraggedComponent(null);
      setDragOffset(null);
      setDragPosition(null);
      setIsDragging(false);
      document.body.style.userSelect = '';
      setDragRect(null);
      setWidgetRect(null);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, draggedComponent, dragPosition, activePage, moveComponent]);

  // --- END Новый drag&drop ---

  // Вспомогательная функция: проверить, не является ли target потомком source
  function isDescendant(sourceId: string, target: Component): boolean {
    if (!target.children) return false;
    for (const child of target.children) {
      if (child.id === sourceId || isDescendant(sourceId, child)) return true;
    }
    return false;
  }

  // Вспомогательная функция: добавить компонент как child к контейнеру
  function addComponentToContainer(pageId: string, containerId: string, component: Omit<Component, 'id'>) {
    // Получаем страницу
    const page = activePage;
    if (!page) return;
    // Рекурсивно ищем контейнер и добавляем child
    function addChild(components: Component[]): Component[] {
      return components.map((c) => {
        if (c.id === containerId) {
          const children = c.children ? [...c.children] : [];
          children.push({ ...component, id: `cmp_${Date.now()}` });
          return { ...c, children };
        }
        if (c.children) {
          return { ...c, children: addChild(c.children) };
        }
        return c;
      });
    }
    const newPages = usePagesStore.getState().pages.map((p) =>
      p.id === pageId ? { ...p, components: addChild(p.components) } : p
    );
    usePagesStore.getState().setPages(newPages);
  }

  // Рекурсивный рендер компонентов (для вложенности)
  const renderComponent = (component: Component, parentId: string | null = null) => {
    const WidgetComponent = WIDGET_COMPONENTS[component.type as keyof typeof WIDGET_COMPONENTS];
    if (!WidgetComponent) {
      return (
        <div
          key={component.id}
          className="absolute bg-red-100 border border-red-300 p-2 text-red-600 group"
          style={{
            left: component.x,
            top: component.y,
            width: component.width,
            height: component.height,
          }}
        >
          <div className="flex justify-between items-start">
            <span>Неизвестный компонент: {component.type}</span>
            <button
              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-200 rounded transition-colors duration-200 opacity-0 group-hover:opacity-100"
              title="Удалить"
              onClick={(e) => {
                e.stopPropagation();
                if (activePage) {
                  usePagesStore.getState().deleteComponent(activePage.id, component.id);
                }
              }}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M6 6l8 8M6 14L14 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      );
    }
    const isSelected = selectedComponentId === component.id;
    const isContainer = ['container', 'card'].includes(component.type);
    const isBeingDragged = draggedComponent && draggedComponent.id === component.id && isDragging;
    
    // Функции для виджета
    const handleClose = () => {
      if (activePage) {
        usePagesStore.getState().deleteComponent(activePage.id, component.id);
      }
    };

    const handleRefresh = () => {
      // Для каждого типа виджета вызываем соответствующий refresh
      switch (component.type) {
        case 'dashboard':
          if (dashboardData.refresh) {
            dashboardData.refresh();
          }
          break;
        case 'vacancyList':
        case 'interviewList':
        case 'stats':
        case 'team':
        case 'reports':
          // Для остальных виджетов refresh будет обработан внутри самого виджета
          // через хук useWidgetData, который уже имеет функцию refresh
          console.log(`Refresh triggered for ${component.type} widget`);
          break;
        default:
          console.log(`Refresh not implemented for widget type: ${component.type}`);
      }
    };

    /**
     * Обработчик mouseDown для drag & drop
     * Передает событие в handleComponentMouseDown, который проверяет область перетаскивания
     */
    const handleWidgetMouseDown = (e: React.MouseEvent) => {
      handleComponentMouseDown(e, component);
    };
    
    // Для DashboardWidget используем данные из хука, вызванного на верхнем уровне
    if (component.type === 'dashboard') {
      // Не рендерим виджет во время перетаскивания - только outline
      if (isBeingDragged) {
        return null;
      }

      const {
        data,
        loading,
        error,
        refresh
      } = dashboardData;
      const { totalCandidates, totalPositions, totalInterviews, recentInterviews } = data;
      const positions = recentInterviews;
      const interviews = recentInterviews;
      const candidates: any[] = [];
      const stats = { totalCandidates, totalPositions, totalInterviews };
      return (
        <div
          key={component.id}
          id={`cmp-${component.id}`}
          className={`absolute group outline-none transition-all duration-200 ${isSelected ? 'z-20' : 'z-10'}`}
          style={{
            left: component.x,
            top: component.y,
            width: component.width,
            height: component.height,
          }}
          tabIndex={0}
          role="button"
          aria-label={`Виджет ${component.type}`}

          onClick={(e) => handleComponentClick(component.id, e)}
        >
          <WidgetComponent
            id={component.id}
            isSelected={isSelected}
            onClick={() => handleComponentClick(component.id, {} as React.MouseEvent)}
            onClose={handleClose}
            onRefresh={handleRefresh}
            onMouseDown={handleWidgetMouseDown}
            positions={positions}
            interviews={interviews}
            candidates={candidates}
            stats={stats}
            loading={loading}
            error={error}
            refresh={refresh}
          />
          {/* Удаляю все точки по углам, чтобы не было лишних элементов */}
        </div>
      );
    }
    // Не рендерим виджет во время перетаскивания - только outline
    if (isBeingDragged) {
      return null;
    }

    return (
      <div
        key={component.id}
        id={`cmp-${component.id}`}
        className={`absolute group outline-none transition-all duration-200 ${isSelected ? 'z-20' : 'z-10'}`}
        style={{
          left: component.x,
          top: component.y,
          width: component.width,
          height: component.height,
        }}
        tabIndex={0}
        role="button"
        aria-label={`Виджет ${component.type}`}

        onClick={(e) => handleComponentClick(component.id, e)}
      >
        <WidgetComponent
          {...component.props}
          id={component.id}
          isSelected={isSelected}
          onClick={() => handleComponentClick(component.id, {} as React.MouseEvent)}
          onClose={handleClose}
          onRefresh={handleRefresh}
          onMouseDown={handleWidgetMouseDown}
        >
          {component.children && component.children.map((child) => renderComponent(child, component.id))}
        </WidgetComponent>
      </div>
    );
  };

  // Drag overlay (призрак) — только для перемещения по канвасу
  const renderDragOverlay = () => {
    if (!dragRect || !isDragging) return null;
    
    return (
      <div
        style={{
          position: 'absolute',
          left: dragRect.left,
          top: dragRect.top,
          width: dragRect.width,
          height: dragRect.height,
          border: '2px dashed #2563eb',
          pointerEvents: 'none',
          zIndex: 9999,
          borderRadius: 8,
          background: 'transparent',
          boxSizing: 'border-box',
        }}
        aria-hidden="true"
      />
    );
  };

  return (
    <div
      ref={canvasRef}
      className="flex-1 bg-white relative overflow-auto min-w-0 h-full min-h-0 flex"
      onClick={handleCanvasClick}
    >
      {activePage ? (
        <div
          className="relative w-full h-full min-h-0 flex-1 canvas-background"
          style={{
            backgroundColor: activePage.background || '#ffffff',
            backgroundImage: activePage.gridEnabled
              ? `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`
              : 'none',
            backgroundSize: `${activePage.gridSize || 10}px ${activePage.gridSize || 10}px`,
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {activePage.components.map((c) => renderComponent(c, null))}
          {renderDragOverlay()}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-4">📄</div>
            <div className="text-lg font-medium mb-2">Нет активной страницы</div>
            <div className="text-sm">Создайте новую страницу в левой панели</div>
          </div>
        </div>
      )}
      <ConfirmModal
        open={confirmDelete.open}
        title="Удалить виджет?"
        description="Вы уверены, что хотите удалить этот виджет? Это действие нельзя отменить."
        onConfirm={() => {
          if (activePage && confirmDelete.componentId) {
            usePagesStore.getState().deleteComponent(activePage.id, confirmDelete.componentId);
          }
          setConfirmDelete({ open: false, componentId: null });
        }}
        onCancel={() => setConfirmDelete({ open: false, componentId: null })}
      />
    </div>
  );
};