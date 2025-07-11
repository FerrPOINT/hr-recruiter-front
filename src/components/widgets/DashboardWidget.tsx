import React, { useState, useEffect } from 'react';
import BaseWidget from './BaseWidget';
import { useDashboardData } from '../../hooks/useWidgetData';
import { AnalyticsReportsApi } from '../../client/apis/analytics-reports-api';
import { Configuration } from '../../client/configuration';
import { useAuthStore } from '../../store/authStore';
import { DashboardWidgetProps, ActivityItem, AnalyticsData, CandidateStats, InterviewStats, PositionStats } from './types';

// Создаем конфигурацию для API клиента с JWT токеном
const createApiConfig = (): Configuration => {
  return new Configuration({
    basePath: process.env.REACT_APP_API_BASE_URL || '/api/v1',
    accessToken: () => useAuthStore.getState().token || '',
  });
};

// Компактная метрика
function CompactMetric({ 
  title, 
  value, 
  icon, 
  color, 
  trend,
  trendValue
}: { 
  title: string, 
  value: number, 
  icon: string, 
  color: string, 
  trend?: 'up' | 'down' | 'neutral',
  trendValue?: number
}) {
  const getTrendIcon = () => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className={`bg-${color}-50 border border-${color}-200 rounded p-2 flex items-center justify-between`}>
      <div className="flex items-center space-x-2">
        <span className="text-lg">{icon}</span>
        <div>
          <div className="text-lg font-bold text-gray-800">{value.toLocaleString()}</div>
          <div className="text-xs text-gray-600">{title}</div>
        </div>
      </div>
      {trend && (
        <div className={`text-xs font-medium ${getTrendColor()}`}>
          {getTrendIcon()} {trendValue}%
        </div>
      )}
    </div>
  );
}

// Компактный график
function CompactChart({ data, color }: { data: number[], color: string }) {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  
  return (
    <div className="flex items-end justify-between h-8 space-x-0.5">
      {data.map((value, index) => {
        const height = ((value - minValue) / range) * 100;
        return (
          <div
            key={index}
            className={`bg-${color}-400 rounded-t flex-1`}
            style={{ height: `${Math.max(height, 15)}%` }}
          />
        );
      })}
    </div>
  );
}

// Компактная активность
function CompactActivity({ activity }: { activity: ActivityItem }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'interview': return '🎤';
      case 'position': return '📋';
      case 'candidate': return '👤';
      case 'hired': return '✅';
      default: return '📝';
    }
  };

  return (
    <div className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded text-xs">
      <span className="text-sm">{getActivityIcon(activity.type)}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{activity.title}</p>
        <p className="text-gray-500">{activity.time}</p>
      </div>
    </div>
  );
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  id,
  isSelected,
  onClick,
  onClose,
  onRefresh,
  onMouseDown
}) => {
  const { data, loading, error, refresh } = useDashboardData();
  const { totalCandidates, totalPositions, totalInterviews, recentInterviews } = data;
  const positions = recentInterviews; // Временно используем recentInterviews как positions
  const interviews = recentInterviews;
  const candidates: any[] = [];
  const stats = { totalCandidates, totalPositions, totalInterviews };
  
  // Обработчик обновления
  const handleRefresh = () => {
    console.log('[DashboardWidget] Refresh triggered');
    refresh(); // Внутренний refresh из хука
    onRefresh?.(); // Внешний refresh из пропсов
  };
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  // Загружаем расширенную аналитику
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const config = createApiConfig();
        const analyticsApi = new AnalyticsReportsApi(config);
        
        const [candidatesStats, interviewsStats, positionsStats] = await Promise.all([
          analyticsApi.getCandidatesStats(),
          analyticsApi.getInterviewsStats(),
          analyticsApi.getPositionsStats()
        ]);

        setAnalyticsData({
          candidates: {
            total: candidatesStats.data?.total ?? 0,
            inProgress: candidatesStats.data?.inProgress ?? 0,
            finished: candidatesStats.data?.finished ?? 0,
            hired: candidatesStats.data?.hired ?? 0,
            rejected: candidatesStats.data?.rejected ?? 0,
          },
          interviews: {
            total: interviewsStats.data?.total ?? 0,
            successful: interviewsStats.data?.successful ?? 0,
            unsuccessful: interviewsStats.data?.unsuccessful ?? 0,
            inProgress: interviewsStats.data?.inProgress ?? 0,
            notStarted: interviewsStats.data?.notStarted ?? 0,
            cancelled: interviewsStats.data?.cancelled ?? 0,
          },
          positions: Array.isArray(positionsStats.data) ? positionsStats.data : [],
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    };

    loadAnalytics();
  }, []);

  // Генерируем тестовые данные активности
  useEffect(() => {
    const activities: ActivityItem[] = [
      { type: 'interview', title: 'Завершено интервью с И.Петровым', time: '2 мин', user: 'Анна' },
      { type: 'position', title: 'Создана вакансия "Frontend Dev"', time: '15 мин', user: 'Максим' },
      { type: 'candidate', title: 'Добавлен кандидат М.Сидорова', time: '1 ч', user: 'Елена' },
      { type: 'hired', title: 'Нанят П.Козлов на QA', time: '2 ч', user: 'HR' },
      { type: 'interview', title: 'Начато интервью с А.Ивановым', time: '3 ч', user: 'Сергей' },
      { type: 'position', title: 'Обновлена вакансия "Backend Dev"', time: '4 ч', user: 'Максим' }
    ];
    setRecentActivity(activities);
  }, []);

  // Вычисляем метрики
  const activeInterviews = Array.isArray(interviews) ? (interviews as { status: string }[]).filter(i => i.status === 'in_progress').length : 0;
  const completedInterviews = Array.isArray(interviews) ? (interviews as { status: string }[]).filter(i => i.status === 'finished').length : 0;
  const activePositions = Array.isArray(positions) ? (positions as { status: string }[]).filter(p => p.status === 'active').length : 0;
  const candidatesCount = Array.isArray(candidates) ? candidates.length : 0;

  // Данные для графиков
  const chartData = {
    interviews: [12, 19, 15, 25, 22, 30, 28],
    candidates: [8, 12, 15, 18, 22, 25, 30],
    positions: [5, 7, 6, 8, 10, 9, 12]
  };

  return (
    <BaseWidget
      id={id}
      isSelected={isSelected}
      onClick={onClick}
      onClose={onClose}
      onRefresh={handleRefresh}
      onMouseDown={onMouseDown}
      title="Дашборд"
      loading={loading}
      error={error}
      className="min-w-[700px] min-h-[500px]"
    >
      <div className="space-y-4">
        {/* Расширенные метрики */}
        <div className="grid grid-cols-4 gap-3">
          <CompactMetric
            title="Активные вакансии"
            value={activePositions}
            icon="💼"
            color="blue"
            trend="up"
            trendValue={12}
          />
          <CompactMetric
            title="Интервью сегодня"
            value={activeInterviews}
            icon="🎤"
            color="green"
            trend="up"
            trendValue={8}
          />
          <CompactMetric
            title="Кандидаты"
            value={candidatesCount}
            icon="👤"
            color="purple"
            trend="up"
            trendValue={15}
          />
          <CompactMetric
            title="Завершено"
            value={completedInterviews}
            icon="✅"
            color="orange"
            trend="neutral"
          />
        </div>

        {/* Улучшенные графики */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Интервью</div>
            <CompactChart data={chartData.interviews} color="blue" />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Кандидаты</div>
            <CompactChart data={chartData.candidates} color="green" />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Вакансии</div>
            <CompactChart data={chartData.positions} color="purple" />
          </div>
        </div>

        {/* Расширенная активность */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-700 mb-3">Последняя активность</div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {recentActivity.map((activity, index) => (
              <CompactActivity key={index} activity={activity} />
            ))}
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

export default DashboardWidget; 