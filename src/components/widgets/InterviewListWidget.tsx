import React, { useState, useMemo } from 'react';
import { useInterviewListData } from '../../hooks/useWidgetData';
import BaseWidget from './BaseWidget';

interface InterviewListWidgetProps {
  id: string;
  isSelected?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const InterviewListWidget: React.FC<InterviewListWidgetProps> = ({
  id,
  isSelected,
  onClick,
  onClose,
  onRefresh,
  onMouseDown
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'stats'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'candidate' | 'status'>('date');
  const [showCompleted, setShowCompleted] = useState(true);
  
  const { data: interviews, loading, error, refresh } = useInterviewListData();

  // Фильтрация и сортировка интервью
  const filteredInterviews = useMemo(() => {
    let filtered = interviews.filter((interview: any) => {
      if (statusFilter !== 'all' && interview.status !== statusFilter) return false;
      if (!showCompleted && interview.status === 'completed') return false;
      return true;
    });

    // Сортировка
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.scheduledAt || b.createdAt || 0).getTime() - 
                 new Date(a.scheduledAt || a.createdAt || 0).getTime();
        case 'candidate':
          return (a.candidate?.name || '').localeCompare(b.candidate?.name || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

    return filtered.slice(0, 8); // Показываем максимум 8 интервью
  }, [interviews, statusFilter, showCompleted, sortBy]);

  // Статистика по статусам
  const statusStats = useMemo(() => {
    const stats = {
      total: interviews.length,
      completed: interviews.filter((i: any) => i.status === 'completed').length,
      in_progress: interviews.filter((i: any) => i.status === 'in_progress').length,
      scheduled: interviews.filter((i: any) => i.status === 'scheduled').length,
      cancelled: interviews.filter((i: any) => i.status === 'cancelled').length
    };
    
    return {
      ...stats,
      completedPercent: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      inProgressPercent: stats.total > 0 ? Math.round((stats.in_progress / stats.total) * 100) : 0,
      scheduledPercent: stats.total > 0 ? Math.round((stats.scheduled / stats.total) * 100) : 0
    };
  }, [interviews]);

  // Мини-календарь с отметками интервью
  const calendarDays = useMemo(() => {
    const today = new Date();
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayInterviews = interviews.filter((interview: any) => {
        const interviewDate = new Date(interview.scheduledAt || interview.createdAt);
        return interviewDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date,
        interviews: dayInterviews,
        count: dayInterviews.length
      });
    }
    
    return days;
  }, [interviews]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершено';
      case 'in_progress': return 'В процессе';
      case 'scheduled': return 'Запланировано';
      case 'cancelled': return 'Отменено';
      default: return 'Неизвестно';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <BaseWidget
      id={id}
      isSelected={isSelected}
      onClick={onClick}
      onClose={onClose}
      onRefresh={onRefresh}
      onMouseDown={onMouseDown}
      showClose={true}
      title="Интервью"
      loading={loading}
      error={error}
      className="w-[600px] h-[600px] max-h-[700px]"
    >
      <div className="h-full flex flex-col">
        {/* Заголовок с фильтрами */}
        <div className="flex items-center justify-between mb-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 py-1 text-xs rounded ${
                viewMode === 'list' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Список
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-2 py-1 text-xs rounded ${
                viewMode === 'calendar' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Календарь
            </button>
            <button
              onClick={() => setViewMode('stats')}
              className={`px-2 py-1 text-xs rounded ${
                viewMode === 'stats' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Статистика
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1 bg-white w-28 min-w-0"
            >
              <option value="all">Все статусы</option>
              <option value="scheduled">Запланировано</option>
              <option value="in_progress">В процессе</option>
              <option value="completed">Завершено</option>
              <option value="cancelled">Отменено</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs border border-gray-300 rounded px-2 py-1 bg-white w-20 min-w-0"
            >
              <option value="date">По дате</option>
              <option value="candidate">По кандидату</option>
              <option value="status">По статусу</option>
            </select>
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'list' && (
            <>
              {/* Панель управления над списком */}
              <div className="mb-2 pt-2 bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between text-xs text-gray-600 px-4 h-12">
                <div className="flex items-center space-x-4">
                  <span>Показано: {filteredInterviews.length} из {interviews.length}</span>
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={showCompleted}
                      onChange={(e) => setShowCompleted(e.target.checked)}
                      className="w-3 h-3"
                    />
                    <span>Показывать завершенные</span>
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={refresh}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                  >
                    Обновить
                  </button>
                  <button
                    onClick={() => {/* TODO: Добавить новое интервью */}}
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                  >
                    + Добавить
                  </button>
                </div>
              </div>
              {/* Список */}
              <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-2 w-full max-w-full overflow-x-hidden pb-4">
                {filteredInterviews.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="text-sm">Нет интервью для отображения</p>
                  </div>
                ) : (
                  filteredInterviews.map((interview: any) => (
                    <div key={interview.id} className="bg-white border border-gray-200 rounded-lg px-2 py-0.5 hover:shadow-md transition-shadow flex flex-row items-center w-full max-w-full overflow-hidden gap-2 flex-shrink-0">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-[11px] font-medium shrink-0">
                        {(interview.candidate?.name || 'К').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-gray-900 truncate min-w-0" title={interview.candidate?.name || 'Кандидат'}>
                        {interview.candidate?.name || 'Кандидат'}
                      </span>
                      <span className="text-[11px] text-gray-500 truncate max-w-[90px] min-w-0" title={interview.position?.title || ''}>
                        {interview.position?.title || ''}
                      </span>
                      {interview.scheduledAt && (
                        <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0 max-w-[80px] truncate min-w-0" title={formatDate(interview.scheduledAt)}>
                          {formatDate(interview.scheduledAt)}
                        </span>
                      )}
                      <span className={`px-1.5 py-0.5 text-[11px] rounded-full border ${getStatusColor(interview.status)} max-w-[70px] truncate text-center min-w-0 ml-auto`} title={getStatusText(interview.status)}>
                        {getStatusText(interview.status)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {viewMode === 'calendar' && (
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-1 mb-3">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                  <div key={day} className="text-xs text-center text-gray-500 py-1">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`relative p-2 text-xs border rounded-lg ${
                      day.count > 0 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="text-center font-medium">
                      {day.date.getDate()}
                    </div>
                    {day.count > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]">
                        {day.count}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Ближайшие интервью:</h4>
                {calendarDays
                  .filter(day => day.count > 0)
                  .slice(0, 3)
                  .map((day, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded p-2">
                      <div className="text-xs font-medium text-gray-700 mb-1">
                        {day.date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </div>
                      {day.interviews.slice(0, 2).map((interview: any) => (
                        <div key={interview.id} className="flex items-center justify-between text-xs">
                          <span className="truncate">{interview.candidate?.name || 'Кандидат'}</span>
                          <span className={`px-1 py-0.5 rounded text-[10px] ${getStatusColor(interview.status)}`}>
                            {getStatusText(interview.status)}
                          </span>
                        </div>
                      ))}
                      {day.interviews.length > 2 && (
                        <div className="text-xs text-gray-500 mt-1">
                          ... и еще {day.interviews.length - 2}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {viewMode === 'stats' && (
            <div className="space-y-4">
              {/* Общая статистика */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{statusStats.total}</div>
                  <div className="text-xs text-blue-700">Всего интервью</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{statusStats.completed}</div>
                  <div className="text-xs text-green-700">Завершено</div>
                </div>
              </div>

              {/* Прогресс-бары по статусам */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Распределение по статусам:</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Завершено</span>
                    <span className="font-medium">{statusStats.completedPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${statusStats.completedPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>В процессе</span>
                    <span className="font-medium">{statusStats.inProgressPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${statusStats.inProgressPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Запланировано</span>
                    <span className="font-medium">{statusStats.scheduledPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${statusStats.scheduledPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Детальная статистика */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Детальная статистика:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>Отменено:</span>
                    <span className="font-medium">{statusStats.cancelled}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>В процессе:</span>
                    <span className="font-medium">{statusStats.in_progress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Запланировано:</span>
                    <span className="font-medium">{statusStats.scheduled}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Завершено:</span>
                    <span className="font-medium">{statusStats.completed}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseWidget>
  );
};

export default InterviewListWidget; 