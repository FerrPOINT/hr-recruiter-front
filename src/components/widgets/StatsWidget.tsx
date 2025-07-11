import React, { useState, useEffect } from 'react';
import { useStatsData } from '../../hooks/useWidgetData';
import BaseWidget from './BaseWidget';
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

// Компактная метрика
function CompactStat({ 
  title, 
  value, 
  icon, 
  color, 
  change, 
  changeType,
  subtitle
}: { 
  title: string, 
  value: number, 
  icon: string, 
  color: string, 
  change?: number,
  changeType?: 'up' | 'down' | 'neutral',
  subtitle?: string
}) {
  const getChangeIcon = () => {
    if (changeType === 'up') return '↗';
    if (changeType === 'down') return '↘';
    return '';
  };

  const getChangeColor = () => {
    if (changeType === 'up') return 'text-green-600';
    if (changeType === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className={`bg-${color}-50 border border-${color}-200 rounded p-2 flex items-center justify-between`}>
      <div className="flex items-center space-x-2">
        <span className="text-lg">{icon}</span>
        <div>
          <div className="text-lg font-bold text-gray-800">{value.toLocaleString()}</div>
          <div className="text-xs text-gray-600">{title}</div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
      </div>
      {change !== undefined && (
        <div className={`text-xs font-medium ${getChangeColor()}`}>
          {getChangeIcon()} {Math.abs(change)}%
        </div>
      )}
    </div>
  );
}

// Компактный линейный график
function CompactLineChart({ data, color, height = 40 }: { data: number[], color: string, height?: number }) {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={`var(--tw-${color}-400)`}
          strokeWidth="1.5"
          points={points}
        />
        <circle
          cx={points.split(' ')[points.split(' ').length - 1].split(',')[0]}
          cy={points.split(' ')[points.split(' ').length - 1].split(',')[1]}
          r="1.5"
          fill={`var(--tw-${color}-500)`}
        />
      </svg>
    </div>
  );
}

// Компактный прогресс-бар
function CompactProgress({ value, max, color, label }: { value: number, max: number, color: string, label: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-800">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className={`bg-${color}-500 h-1.5 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Компактный KPI
function CompactKPI({ title, value, target, unit, trend }: {
  title: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
}) {
  const percentage = Math.min((value / target) * 100, 100);
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  return (
    <div className="bg-white border border-gray-200 rounded p-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium text-gray-700">{title}</h4>
        <div className={`text-xs ${getTrendColor()}`}>
          {getTrendIcon()}
        </div>
      </div>
      <div className="text-lg font-bold text-gray-800 mb-1">
        {value.toLocaleString()} {unit}
      </div>
      <div className="text-xs text-gray-500 mb-2">Цель: {target.toLocaleString()} {unit}</div>
      <CompactProgress value={value} max={target} color="blue" label="Прогресс" />
    </div>
  );
}

interface StatsWidgetProps {
  id: string;
  isSelected?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const StatsWidget: React.FC<StatsWidgetProps> = ({
  id,
  isSelected,
  onClick,
  onClose,
  onRefresh,
  onMouseDown
}) => {
  const { data: stats, loading, error } = useStatsData();
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [analyticsData, setAnalyticsData] = useState<any>({});
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'trends'>('overview');

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
          candidates: candidatesStats.data,
          interviews: interviewsStats.data,
          positions: positionsStats.data
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    };

    loadAnalytics();
  }, []);

  // Агрегируем статистику
  const aggregateStats = () => {
    const baseStats = stats || {};
    const analytics = analyticsData || {};
    
    return {
      totalInterviews: baseStats.totalInterviews || 0,
      completedInterviews: baseStats.completedInterviews || 0,
      successRate: baseStats.successRate || 0,
      avgScore: baseStats.avgScore || 0,
      totalCandidates: analytics.candidates?.total || 0,
      newCandidates: analytics.candidates?.newThisMonth || 0,
      activePositions: analytics.positions?.active || 0,
      totalPositions: analytics.positions?.total || 0
    };
  };

  const currentStats = aggregateStats();

  // Данные для графиков
  const chartData = {
    interviews: [12, 19, 15, 25, 22, 30, 28],
    candidates: [8, 12, 15, 18, 22, 25, 30],
    scores: [75, 82, 78, 85, 88, 90, 87]
  };

  return (
    <BaseWidget
      id={id}
      isSelected={isSelected}
      onClick={onClick}
      onClose={onClose}
      onRefresh={onRefresh}
      onMouseDown={onMouseDown}
      title="Статистика"
      loading={loading}
      error={error}
      className="min-w-[600px] min-h-[450px]"
    >
      <div className="space-y-4">
        {/* Переключатели режимов */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                selectedView === 'overview' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              Обзор
            </button>
            <button
              onClick={() => setSelectedView('detailed')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                selectedView === 'detailed' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              Детально
            </button>
            <button
              onClick={() => setSelectedView('trends')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                selectedView === 'trends' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              Тренды
            </button>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          >
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="quarter">Квартал</option>
          </select>
        </div>

        {/* Расширенные метрики */}
        <div className="grid grid-cols-4 gap-3">
          <CompactStat
            title="Интервью"
            value={currentStats.totalInterviews}
            icon="🎤"
            color="blue"
            change={12}
            changeType="up"
            subtitle={`${currentStats.completedInterviews} завершено`}
          />
          <CompactStat
            title="Успешность"
            value={currentStats.successRate}
            icon="📈"
            color="green"
            change={8}
            changeType="up"
            subtitle="% успешных"
          />
          <CompactStat
            title="Кандидаты"
            value={currentStats.totalCandidates}
            icon="👤"
            color="purple"
            change={15}
            changeType="up"
            subtitle={`${currentStats.newCandidates} новых`}
          />
          <CompactStat
            title="Средний балл"
            value={currentStats.avgScore}
            icon="⭐"
            color="orange"
            change={-3}
            changeType="down"
            subtitle="из 100"
          />
        </div>

        {/* Улучшенные графики */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Интервью</div>
            <CompactLineChart data={chartData.interviews} color="blue" />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Кандидаты</div>
            <CompactLineChart data={chartData.candidates} color="green" />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Баллы</div>
            <CompactLineChart data={chartData.scores} color="purple" />
          </div>
        </div>

        {/* Расширенные KPI */}
        <div className="grid grid-cols-2 gap-3">
          <CompactKPI
            title="Интервью в месяц"
            value={currentStats.totalInterviews}
            target={50}
            unit="шт"
            trend="up"
          />
          <CompactKPI
            title="Успешность найма"
            value={currentStats.successRate}
            target={80}
            unit="%"
            trend="up"
          />
        </div>
      </div>
    </BaseWidget>
  );
};

export default StatsWidget; 