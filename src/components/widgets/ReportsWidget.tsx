import React, { useState, useEffect } from 'react';
import { useReportsData } from '../../hooks/useWidgetData';
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

// Компонент для отображения метрики с расширенной информацией
function MetricCard({ 
  title, 
  value, 
  icon, 
  color, 
  trend, 
  trendValue,
  subtitle,
  details
}: { 
  title: string, 
  value: number, 
  icon: string, 
  color: string, 
  trend?: 'up' | 'down' | 'neutral',
  trendValue?: number,
  subtitle?: string,
  details?: string
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
    <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4 flex flex-col justify-between h-full`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
            <span>{getTrendIcon()}</span>
            {trendValue && <span>{trendValue}%</span>}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-2">{value.toLocaleString()}</div>
      <div className="text-sm font-medium text-gray-700 mb-1">{title}</div>
      {subtitle && (
        <div className="text-xs text-gray-500 mb-2">{subtitle}</div>
      )}
      {details && (
        <div className="text-xs text-gray-600 bg-white bg-opacity-50 rounded p-2 mt-auto">
          {details}
        </div>
      )}
    </div>
  );
}

// Компонент для круговой диаграммы
function PieChart({ data, size = 80 }: { data: { label: string; value: number; color: string }[], size?: number }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, index) => {
          const percentage = total > 0 ? item.value / total : 0;
          const angle = percentage * 360;
          const radius = size / 2 - 2;
          const x1 = size / 2 + radius * Math.cos((currentAngle * Math.PI) / 180);
          const y1 = size / 2 + radius * Math.sin((currentAngle * Math.PI) / 180);
          const x2 = size / 2 + radius * Math.cos(((currentAngle + angle) * Math.PI) / 180);
          const y2 = size / 2 + radius * Math.sin(((currentAngle + angle) * Math.PI) / 180);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const pathData = [
            `M ${size / 2} ${size / 2}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');

          currentAngle += angle;

          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800">{total}</div>
          <div className="text-xs text-gray-500">Всего</div>
        </div>
      </div>
    </div>
  );
}

// Компонент для отображения тренда
function TrendChart({ data, color }: { data: number[], color: string }) {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  
  return (
    <div className="flex items-end justify-between h-16 space-x-1">
      {data.map((value, index) => {
        const height = ((value - minValue) / range) * 100;
        return (
          <div
            key={index}
            className={`bg-${color}-400 rounded-t flex-1 transition-all duration-300`}
            style={{ height: `${Math.max(height, 5)}%` }}
          />
        );
      })}
    </div>
  );
}

// Компонент для отображения детального отчета
function ReportDetail({ title, value, change, changeType, icon }: {
  title: string;
  value: number;
  change?: number;
  changeType?: 'up' | 'down' | 'neutral';
  icon: string;
}) {
  const getChangeColor = () => {
    if (changeType === 'up') return 'text-green-600';
    if (changeType === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  const getChangeIcon = () => {
    if (changeType === 'up') return '↗';
    if (changeType === 'down') return '↘';
    return '';
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-3">
        <span className="text-xl">{icon}</span>
        <div>
          <h4 className="text-sm font-medium text-gray-800">{title}</h4>
          <p className="text-xs text-gray-500">Детальная информация</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-gray-800">{value.toLocaleString()}</div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${getChangeColor()}`}>
            <span>{getChangeIcon()}</span>
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface ReportsWidgetProps {
  id: string;
  isSelected?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const ReportsWidget: React.FC<ReportsWidgetProps> = ({
  id,
  isSelected,
  onClick,
  onClose,
  onRefresh,
  onMouseDown
}) => {
  const { data: reports, loading, error } = useReportsData();
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [analyticsData, setAnalyticsData] = useState<any>({});
  const [selectedReport, setSelectedReport] = useState<string>('overview');

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

  // Агрегируем данные из отчетов
  const aggregateData = () => {
    if (!reports || reports.length === 0) {
      return {
        totalInterviews: 0,
        successful: 0,
        unsuccessful: 0,
        inProgress: 0,
        todayInterviews: 0,
        conversionRate: 0,
        avgScore: 0,
        avgTimeToHire: 0,
        costPerHire: 0,
        qualityScore: 0
      };
    }

    const totalInterviews = reports.reduce((sum: number, report: any) => sum + (report.totalInterviews || 0), 0);
    const successful = reports.reduce((sum: number, report: any) => sum + (report.successful || 0), 0);
    const unsuccessful = reports.reduce((sum: number, report: any) => sum + (report.unsuccessful || 0), 0);
    const inProgress = reports.reduce((sum: number, report: any) => sum + (report.inProgress || 0), 0);
    const todayInterviews = reports.reduce((sum: number, report: any) => sum + (report.todayInterviews || 0), 0);
    const avgScore = reports.reduce((sum: number, report: any) => sum + (report.avgScore || 0), 0) / reports.length;
    
    const conversionRate = totalInterviews > 0 ? Math.round((successful / totalInterviews) * 100) : 0;

    return {
      totalInterviews,
      successful,
      unsuccessful,
      inProgress,
      todayInterviews,
      conversionRate,
      avgScore: Math.round(avgScore),
      avgTimeToHire: 14, // дней
      costPerHire: 25000, // рублей
      qualityScore: Math.round((successful / Math.max(totalInterviews, 1)) * 100)
    };
  };

  const data = aggregateData();

  // Данные для графиков
  const pieChartData = [
    { label: 'Успешно', value: data.successful, color: '#10B981' },
    { label: 'В процессе', value: data.inProgress, color: '#3B82F6' },
    { label: 'Не прошли', value: data.unsuccessful, color: '#EF4444' }
  ];

  const trendData = {
    interviews: [12, 19, 15, 25, 22, 30, 28, 35],
    candidates: [8, 12, 10, 18, 15, 22, 20, 25],
    conversion: [65, 70, 68, 75, 72, 78, 76, 80]
  };

  const reportTypes = [
    { key: 'overview', title: 'Обзор', icon: '📊' },
    { key: 'interviews', title: 'Интервью', icon: '🎤' },
    { key: 'candidates', title: 'Кандидаты', icon: '👥' },
    { key: 'efficiency', title: 'Эффективность', icon: '⚡' }
  ];

  return (
    <BaseWidget
      id={id}
      isSelected={isSelected}
      onClick={onClick}
      onClose={onClose}
      showClose={true}
      onRefresh={onRefresh}
      onMouseDown={onMouseDown}
      title="Отчеты"
      subtitle={`${period === 'week' ? 'Неделя' : period === 'month' ? 'Месяц' : 'Квартал'} • Комплексная аналитика`}
      loading={loading}
      error={error}
      className="min-w-[700px] min-h-[500px]"
    >
      <div className="space-y-4">
        {/* Настройки и фильтры */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'quarter')}
              className="text-sm border border-gray-300 rounded px-3 py-1 bg-white"
            >
              <option value="week">Неделя</option>
              <option value="month">Месяц</option>
              <option value="quarter">Квартал</option>
            </select>
            <div className="flex items-center gap-2">
              {reportTypes.map(type => (
                <button
                  key={type.key}
                  onClick={() => setSelectedReport(type.key)}
                  className={`p-2 rounded-lg text-sm transition-all duration-200 ${
                    selectedReport === type.key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                  }`}
                  title={type.title}
                >
                  <span className="mr-1">{type.icon}</span>
                  {type.title}
                </button>
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Обновлено: {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Основные метрики */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Сегодня"
            value={data.todayInterviews}
            icon="🗓️"
            color="blue"
            subtitle="запланировано интервью"
          />
          <MetricCard
            title={`За ${period === 'week' ? 'неделю' : period === 'month' ? 'месяц' : 'квартал'}`}
            value={data.totalInterviews}
            icon="📊"
            color="purple"
            trend="up"
            trendValue={12}
            subtitle="всего интервью"
          />
          <MetricCard
            title="Успешно"
            value={data.successful}
            icon="✅"
            color="green"
            trend="up"
            trendValue={8}
            subtitle="завершено"
            details={`Конверсия: ${data.conversionRate}%`}
          />
          <MetricCard
            title="Конверсия"
            value={data.conversionRate}
            icon="📈"
            color="orange"
            trend="up"
            trendValue={5}
            subtitle="интервью → найм"
            details="Цель: 35%"
          />
        </div>

        {/* Графики и визуализация */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Распределение результатов</h4>
            <div className="flex items-center justify-center">
              <PieChart data={pieChartData} size={100} />
            </div>
            <div className="mt-3 space-y-1">
              {pieChartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-600">{item.label}</span>
                  </div>
                  <span className="font-medium text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Тренд интервью</h4>
            <TrendChart data={trendData.interviews} color="blue" />
            <div className="text-xs text-gray-500 mt-2 text-center">За последние 8 дней</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Конверсия</h4>
            <TrendChart data={trendData.conversion} color="green" />
            <div className="text-xs text-gray-500 mt-2 text-center">Процент успешных</div>
          </div>
        </div>

        {/* Дополнительная статистика */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-gray-800">{data.inProgress}</div>
            <div className="text-xs text-gray-600">В процессе</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-gray-800">{data.unsuccessful}</div>
            <div className="text-xs text-gray-600">Не прошли</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-gray-800">{data.avgScore}%</div>
            <div className="text-xs text-gray-600">Средний балл</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-gray-800">{data.avgTimeToHire}</div>
            <div className="text-xs text-gray-600">Дней до найма</div>
          </div>
        </div>

        {/* Детальные отчеты */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Детальная аналитика</h4>
          <div className="grid grid-cols-2 gap-3">
            <ReportDetail
              title="Среднее время найма"
              value={data.avgTimeToHire}
              change={-2}
              changeType="down"
              icon="⏱️"
            />
            <ReportDetail
              title="Стоимость найма"
              value={data.costPerHire}
              change={5}
              changeType="up"
              icon="💰"
            />
            <ReportDetail
              title="Качество найма"
              value={data.qualityScore}
              change={8}
              changeType="up"
              icon="⭐"
            />
            <ReportDetail
              title="Эффективность процесса"
              value={Math.round((data.successful / Math.max(data.totalInterviews, 1)) * 100)}
              change={3}
              changeType="up"
              icon="📊"
            />
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Подробный отчет
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2 font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Экспорт PDF
            </button>
            <button className="text-sm text-green-600 hover:text-green-800 flex items-center gap-2 font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Настройки отчетов
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Автообновление: 5 мин</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

export default ReportsWidget; 