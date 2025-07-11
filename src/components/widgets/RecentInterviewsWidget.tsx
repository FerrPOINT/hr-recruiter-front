import React, { useState, useEffect } from 'react';
import { useInterviewListData } from '../../hooks/useWidgetData';
import BaseWidget from './BaseWidget';
import { useNavigate } from 'react-router-dom';
import { AnalyticsReportsApi } from '../../client/apis/analytics-reports-api';
import { Configuration } from '../../client/configuration';
import { useAuthStore } from '../../store/authStore';

// Создаем конфигурацию для API клиента с JWT токеном
const createApiConfig = (): Configuration => {
  return new Configuration({
    basePath: process.env.REACT_APP_API_BASE_URL || '/api/v1',
    accessToken: () => useAuthStore.getState().token || '',
  });
};

// Утилиты для форматирования
function formatDate(date?: string) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}

function formatTime(date?: string) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function interviewStatusColor(status?: string) {
  switch (status) {
    case 'finished': return 'bg-green-100 text-green-800';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'not_started': return 'bg-gray-100 text-gray-600';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-600';
  }
}

function interviewStatusLabel(status?: string) {
  switch (status) {
    case 'finished': return 'Завершено';
    case 'in_progress': return 'В процессе';
    case 'not_started': return 'Не начато';
    case 'cancelled': return 'Отменено';
    default: return 'Неизвестно';
  }
}

function getScoreColor(score?: number) {
  if (!score) return 'text-gray-500';
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

// Компонент для отображения интервью с расширенной информацией
function InterviewCard({ interview, onOpenInterview }: { interview: any, onOpenInterview: (id: number) => void }) {
  const candidateName = interview.candidate?.firstName && interview.candidate?.lastName 
    ? `${interview.candidate.firstName} ${interview.candidate.lastName}`
    : interview.candidate?.name || `Кандидат ${interview.id}`;

  const positionTitle = interview.position?.title || 'Неизвестная вакансия';
  const interviewDate = interview.scheduledAt || interview.createdAt;
  const duration = interview.duration || 30; // минуты

  return (
    <div 
      className="group p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => onOpenInterview(interview.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm text-gray-800 truncate">
              {candidateName}
            </h4>
            {interview.aiScore !== undefined && (
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${getScoreColor(interview.aiScore)} bg-opacity-10`}>
                ⭐ {interview.aiScore}%
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 truncate mb-1">
            {positionTitle}
          </p>
          <div className="flex items-center gap-3 text-[10px] text-gray-500">
            {interviewDate && (
              <span>📅 {formatDate(interviewDate)} {formatTime(interviewDate)}</span>
            )}
            <span>⏱️ {duration} мин</span>
            {interview.type && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                interview.type === 'voice' ? 'bg-purple-100 text-purple-700' :
                interview.type === 'video' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {interview.type === 'voice' ? '🎤 Голос' : 
                 interview.type === 'video' ? '📹 Видео' : '💬 Текст'}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${interviewStatusColor(interview.status)}`}>
            {interviewStatusLabel(interview.status)}
          </span>
          {interview.interviewer && (
            <div className="text-[10px] text-gray-500 text-right">
              👤 {interview.interviewer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Компонент для отображения статистики
function StatCard({ title, value, icon, color, subtitle }: {
  title: string;
  value: number;
  icon: string;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-3 text-center`}>
      <div className={`text-${color}-600 text-lg mb-1`}>{icon}</div>
      <div className="text-lg font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-600">{title}</div>
      {subtitle && (
        <div className="text-[10px] text-gray-500 mt-1">{subtitle}</div>
      )}
    </div>
  );
}

// Компонент для отображения календаря
function MiniCalendar({ interviews }: { interviews: any[] }) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Группируем интервью по дням
  const interviewsByDay: { [key: number]: number } = {};
  interviews.forEach(interview => {
    const date = new Date(interview.scheduledAt || interview.createdAt);
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      const day = date.getDate();
      interviewsByDay[day] = (interviewsByDay[day] || 0) + 1;
    }
  });

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="w-6 h-6"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const hasInterviews = interviewsByDay[day] > 0;
    const isToday = day === today.getDate();
    
    days.push(
      <div
        key={day}
        className={`w-6 h-6 flex items-center justify-center text-xs rounded ${
          isToday ? 'bg-blue-500 text-white' :
          hasInterviews ? 'bg-green-100 text-green-800' :
          'text-gray-600'
        }`}
        title={hasInterviews ? `${interviewsByDay[day]} интервью` : ''}
      >
        {day}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">
        {today.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
      </h4>
      <div className="grid grid-cols-7 gap-1">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="w-6 h-6 flex items-center justify-center text-xs text-gray-500 font-medium">
            {day}
          </div>
        ))}
        {days}
      </div>
    </div>
  );
}

interface RecentInterviewsWidgetProps {
  id: string;
  isSelected?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const RecentInterviewsWidget: React.FC<RecentInterviewsWidgetProps> = ({
  id,
  isSelected,
  onClick,
  onClose,
  onRefresh,
  onMouseDown
}) => {
  const navigate = useNavigate();
  const { data: interviews, loading, error } = useInterviewListData();
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'finished' | 'not_started'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'score'>('date');
  const [analyticsData, setAnalyticsData] = useState<any>({});
  const [selectedView, setSelectedView] = useState<'list' | 'calendar' | 'stats'>('list');

  // Загружаем расширенную аналитику
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const config = createApiConfig();
        const analyticsApi = new AnalyticsReportsApi(config);
        
        const interviewsStats = await analyticsApi.getInterviewsStats();
        setAnalyticsData({
          interviews: interviewsStats.data
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    };

    loadAnalytics();
  }, []);

  const handleOpenInterview = (interviewId: number) => {
    navigate(`/interview/${interviewId}`);
  };

  const handleCreateInterview = () => {
    navigate('/interview/create');
  };

  const filteredInterviews = interviews.filter((interview: any) => {
    if (filter === 'all') return true;
    return interview.status === filter;
  });

  // Сортируем интервью
  const sortedInterviews = [...filteredInterviews].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.scheduledAt || b.createdAt).getTime() - new Date(a.scheduledAt || a.createdAt).getTime();
      case 'status':
        const statusOrder = { 'in_progress': 0, 'not_started': 1, 'finished': 2, 'cancelled': 3 };
        return (statusOrder[a.status as keyof typeof statusOrder] || 4) - (statusOrder[b.status as keyof typeof statusOrder] || 4);
      case 'score':
        return (b.aiScore || 0) - (a.aiScore || 0);
      default:
        return 0;
    }
  });

  const stats = {
    total: interviews.length,
    inProgress: interviews.filter((i: any) => i.status === 'in_progress').length,
    finished: interviews.filter((i: any) => i.status === 'finished').length,
    notStarted: interviews.filter((i: any) => i.status === 'not_started').length,
    cancelled: interviews.filter((i: any) => i.status === 'cancelled').length,
    today: interviews.filter((i: any) => {
      const date = new Date(i.scheduledAt || i.createdAt);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }).length
  };

  const viewTypes = [
    { key: 'list', title: 'Список', icon: '📋' },
    { key: 'calendar', title: 'Календарь', icon: '📅' },
    { key: 'stats', title: 'Статистика', icon: '📊' }
  ];

  return (
    <BaseWidget
      id={id}
      isSelected={isSelected}
      onClick={onClick}
      onClose={onClose}
      onRefresh={onRefresh}
      onMouseDown={onMouseDown}
      title="Последние интервью"
      loading={loading}
      error={error}
      className="min-w-[700px] min-h-[550px]"
    >
      <div className="space-y-4">
        {/* Компактные настройки и фильтры */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'in_progress' | 'finished' | 'not_started')}
              className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="all">Все статусы</option>
              <option value="in_progress">В процессе</option>
              <option value="finished">Завершенные</option>
              <option value="not_started">Не начатые</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'status' | 'score')}
              className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="date">По дате</option>
              <option value="status">По статусу</option>
              <option value="score">По баллу</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {viewTypes.map(type => (
                <button
                  key={type.key}
                  onClick={() => setSelectedView(type.key as 'list' | 'calendar' | 'stats')}
                  className={`p-2 rounded-lg text-sm transition-all duration-200 ${
                    selectedView === type.key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                  }`}
                  title={type.title}
                >
                  <span>{type.icon}</span>
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-500">
              Обновлено: {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Компактная статистика */}
        <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-gray-600">Всего</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{stats.inProgress}</div>
              <div className="text-xs text-gray-600">В процессе</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{stats.finished}</div>
              <div className="text-xs text-gray-600">Завершено</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{stats.today}</div>
              <div className="text-xs text-gray-600">Сегодня</div>
            </div>
          </div>
        </div>

        {/* Содержимое */}
        <div className="flex-1 overflow-hidden">
          {selectedView === 'list' && (
            <div className="space-y-2 overflow-y-auto h-full">
              {sortedInterviews.slice(0, 8).map((interview: any) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  onOpenInterview={handleOpenInterview}
                />
              ))}
            </div>
          )}

          {selectedView === 'calendar' && (
            <div className="grid grid-cols-2 gap-4">
              <MiniCalendar interviews={interviews} />
              <div className="space-y-2 overflow-y-auto h-full">
                {sortedInterviews.slice(0, 6).map((interview: any) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    onOpenInterview={handleOpenInterview}
                  />
                ))}
              </div>
            </div>
          )}

          {selectedView === 'stats' && (
            <div className="space-y-4 overflow-y-auto h-full">
              {/* Распределение по статусам */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">По статусам</h3>
                <div className="space-y-2">
                  {Object.entries({
                    'В процессе': stats.inProgress,
                    'Завершено': stats.finished,
                    'Не начато': stats.notStarted,
                    'Отменено': stats.cancelled
                  }).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm">{status}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(count as number / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Статистика по дням */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">По дням недели</h3>
                <div className="space-y-2">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => {
                    const dayInterviews = interviews.filter((i: any) => {
                      const date = new Date(i.scheduledAt || i.createdAt);
                      return date.getDay() === (index + 1) % 7;
                    }).length;
                    return (
                      <div key={day} className="flex items-center justify-between">
                        <span className="text-sm">{day}</span>
                        <span className="text-sm font-medium">{dayInterviews}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseWidget>
  );
};

export default RecentInterviewsWidget; 