import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import BaseWidget from './BaseWidget';
import { Interview, InterviewStatusEnum } from '../../client/models';
import { useCalendarData } from '../../hooks/useWidgetData';

interface CalendarWidgetProps {
  id: string;
  isSelected?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  className?: string;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  id,
  isSelected,
  onClick,
  onClose,
  onRefresh,
  onMouseDown,
  className
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { data: interviews, loading, error } = useCalendarData();

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    return { daysInMonth, startingDay };
  };

  const getInterviewsForDate = (date: Date) => {
    if (!interviews) return [];
    
    const dayInterviews = interviews.filter((interview: Interview) => {
      if (filterStatus !== 'all' && interview.status !== filterStatus) return false;
      const interviewDate = new Date(interview.startedAt || interview.createdAt || '');
      return interviewDate.toDateString() === date.toDateString();
    });
    
    return dayInterviews;
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case InterviewStatusEnum.finished: return 'bg-green-500';
      case InterviewStatusEnum.in_progress: return 'bg-blue-500';
      case InterviewStatusEnum.not_started: return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case InterviewStatusEnum.finished: return 'Завершено';
      case InterviewStatusEnum.in_progress: return 'В процессе';
      case InterviewStatusEnum.not_started: return 'Не начато';
      default: return 'Неизвестно';
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
    const days = [];

    // Пустые ячейки в начале месяца
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 text-gray-400"></div>);
    }

    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayInterviews = getInterviewsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          className={`p-2 min-h-[80px] border border-gray-200 cursor-pointer hover:bg-gray-50 ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          } ${isSelected ? 'bg-yellow-50 border-yellow-300' : ''}`}
          onClick={() => {
            setSelectedDate(date);
            setShowDetails(true);
          }}
        >
          <div className="text-sm font-medium mb-1">{day}</div>
          {dayInterviews.slice(0, 2).map((interview: Interview, index: number) => (
            <div
              key={index}
              className={`text-xs p-1 rounded mb-1 ${
                getStatusColor(interview.status || '')
              } text-white`}
              title={`Интервью #${interview.id} - ${formatTime(interview.startedAt || '')}`}
            >
              <div className="flex items-center space-x-1">
                <Clock className="w-2 h-2" />
                <span className="truncate">
                  Интервью #{interview.id}
                </span>
              </div>
            </div>
          ))}
          {dayInterviews.length > 2 && (
            <div className="text-xs text-gray-500">
              +{dayInterviews.length - 2} еще
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <BaseWidget
      id={id}
      isSelected={isSelected}
      onClick={onClick}
      onClose={onClose}
      onRefresh={onRefresh}
      onMouseDown={onMouseDown}
      title="Календарь интервью"
      subtitle={`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
      loading={loading}
      error={error}
      showClose={true}
      className={className}
    >
      <div className="p-4">
        {/* Фильтры */}
        <div className="flex items-center justify-between mb-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Все статусы</option>
            <option value={InterviewStatusEnum.not_started}>Запланированные</option>
            <option value={InterviewStatusEnum.in_progress}>В процессе</option>
            <option value={InterviewStatusEnum.finished}>Завершенные</option>
          </select>
          
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={prevMonth}
              className="px-3 py-1 hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="px-3 py-1 hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Календарь */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
          {renderCalendar()}
        </div>

        {/* Детали выбранного дня */}
        {showDetails && selectedDate && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">
              {selectedDate.toLocaleDateString('ru-RU', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <div className="space-y-2">
              {getInterviewsForDate(selectedDate)
                .sort((a: Interview, b: Interview) => {
                  return new Date(a.startedAt || a.createdAt || 0).getTime() - 
                         new Date(b.startedAt || b.createdAt || 0).getTime();
                })
                .map((interview: Interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between p-2 bg-white rounded border"
                  >
                    <div className="flex-1">
                      <div>
                        <div className="font-medium">
                          Интервью #{interview.id}
                        </div>
                        <div className="text-sm text-gray-600">
                          Кандидат #{interview.candidateId} • Позиция #{interview.positionId}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {new Date(interview.startedAt || interview.createdAt || '').toLocaleDateString('ru-RU')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(interview.startedAt || interview.createdAt || '')}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

export default CalendarWidget; 