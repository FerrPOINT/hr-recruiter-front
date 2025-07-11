import React, { useState, useEffect, useMemo } from 'react';
import { useInterviewsData } from '../../hooks/usePageData';
import BaseWidget from './BaseWidget';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Calendar, 
  Filter, 
  Search, 
  Download, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Target,
  Award,
  AlertTriangle,
  FileText,
  BarChart,
  Activity
} from 'lucide-react';

interface InterviewReportWidgetProps {
  id: string;
  isSelected?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

interface InterviewStats {
  total: number;
  notStarted: number;
  inProgress: number;
  finished: number;
  successful: number;
  unsuccessful: number;
  onEvaluation: number;
  averageScore: number;
  completionRate: number;
  successRate: number;
}

interface PositionStats {
  positionId: number;
  positionTitle: string;
  totalInterviews: number;
  successfulInterviews: number;
  averageScore: number;
  successRate: number;
}

const InterviewReportWidget: React.FC<InterviewReportWidgetProps> = ({
  id,
  isSelected,
  onClick,
  onClose,
  onRefresh,
  onMouseDown
}) => {
  // Состояние фильтров
  const [selectedPosition, setSelectedPosition] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'quarter'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'analytics'>('overview');

  // Загрузка данных
  const { interviews, positions, candidates, loading, error, refresh } = useInterviewsData({
    positionId: selectedPosition,
    page: 0,
    size: 10 // Было 1000, теперь 10
  });

  // Вычисляем статистику
  const stats = useMemo((): InterviewStats => {
    const now = new Date();
    let filteredInterviews = interviews;

    // Фильтр по дате
    if (dateRange !== 'all') {
      const daysAgo = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      filteredInterviews = interviews.filter(interview => 
        new Date(interview.createdAt) >= cutoffDate
      );
    }

    // Фильтр по статусу
    if (selectedStatus) {
      filteredInterviews = filteredInterviews.filter(interview => 
        interview.status === selectedStatus
      );
    }

    // Фильтр по поиску
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredInterviews = filteredInterviews.filter(interview => {
        const candidate = candidates.find(c => c.id === interview.candidateId);
        const position = positions.find(p => p.id === interview.positionId);
        const candidateName = candidate ? `${candidate.firstName} ${candidate.lastName}`.toLowerCase() : '';
        const positionTitle = position?.title?.toLowerCase() || '';
        return candidateName.includes(query) || positionTitle.includes(query);
      });
    }

    const total = filteredInterviews.length;
    const notStarted = filteredInterviews.filter(i => i.status === 'not_started').length;
    const inProgress = filteredInterviews.filter(i => i.status === 'in_progress').length;
    const finished = filteredInterviews.filter(i => i.status === 'finished').length;
    const successful = filteredInterviews.filter(i => i.result === 'successful').length;
    const unsuccessful = filteredInterviews.filter(i => i.result === 'unsuccessful').length;
    const onEvaluation = filteredInterviews.filter(i => i.finishedAt && !i.result).length;

    const scores = filteredInterviews
      .filter(i => i.aiScore !== undefined && i.aiScore !== null)
      .map(i => i.aiScore);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    const completedInterviews = successful + unsuccessful;
    const completionRate = total > 0 ? (completedInterviews / total) * 100 : 0;
    const successRate = completedInterviews > 0 ? (successful / completedInterviews) * 100 : 0;

    return {
      total,
      notStarted,
      inProgress,
      finished,
      successful,
      unsuccessful,
      onEvaluation,
      averageScore: Math.round(averageScore * 10) / 10,
      completionRate: Math.round(completionRate * 10) / 10,
      successRate: Math.round(successRate * 10) / 10
    };
  }, [interviews, positions, candidates, selectedPosition, selectedStatus, dateRange, searchQuery]);

  // Статистика по позициям
  const positionStats = useMemo((): PositionStats[] => {
    const positionMap = new Map<number, PositionStats>();

    interviews.forEach(interview => {
      const position = positions.find(p => p.id === interview.positionId);
      if (!position) return;

      if (!positionMap.has(interview.positionId)) {
        positionMap.set(interview.positionId, {
          positionId: interview.positionId,
          positionTitle: position.title || `Вакансия #${interview.positionId}`,
          totalInterviews: 0,
          successfulInterviews: 0,
          averageScore: 0,
          successRate: 0
        });
      }

      const stats = positionMap.get(interview.positionId)!;
      stats.totalInterviews++;
      
      if (interview.result === 'successful') {
        stats.successfulInterviews++;
      }

      if (interview.aiScore !== undefined && interview.aiScore !== null) {
        const currentTotal = (stats.averageScore * (stats.totalInterviews - 1)) + interview.aiScore;
        stats.averageScore = currentTotal / stats.totalInterviews;
      }
    });

    // Вычисляем процент успешности для каждой позиции
    positionMap.forEach(stats => {
      stats.successRate = stats.totalInterviews > 0 
        ? (stats.successfulInterviews / stats.totalInterviews) * 100 
        : 0;
      stats.averageScore = Math.round(stats.averageScore * 10) / 10;
      stats.successRate = Math.round(stats.successRate * 10) / 10;
    });

    return Array.from(positionMap.values())
      .sort((a, b) => b.totalInterviews - a.totalInterviews)
      .slice(0, 10); // Топ-10 позиций
  }, [interviews, positions]);

  // Получение имени кандидата
  const getCandidateName = (id: number) => {
    const candidate = candidates.find(c => c.id === id);
    if (!candidate) return `Кандидат #${id}`;
    return [candidate.firstName, candidate.lastName].filter(Boolean).join(' ') || `Кандидат #${id}`;
  };

  // Получение названия позиции
  const getPositionTitle = (id: number) => {
    const position = positions.find(p => p.id === id);
    return position?.title || `Вакансия #${id}`;
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Цвета для статусов
  const getStatusColor = (status: string, finishedAt?: string, result?: string) => {
    if (finishedAt && !result) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'finished': return 'bg-green-100 text-green-800 border-green-200';
      case 'successful': return 'bg-green-100 text-green-800 border-green-200';
      case 'unsuccessful': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Цвета для оценок
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800';
    if (score >= 6) return 'bg-yellow-100 text-yellow-800';
    if (score >= 4) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  // Обработчик обновления
  const handleRefresh = () => {
    refresh();
    onRefresh?.();
  };

  // Очистка фильтров
  const clearFilters = () => {
    setSelectedPosition(undefined);
    setSelectedStatus('');
    setDateRange('all');
    setSearchQuery('');
  };

  // Экспорт отчета
  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      filters: {
        position: selectedPosition,
        status: selectedStatus,
        dateRange,
        searchQuery
      },
      stats,
      positionStats,
      interviews: interviews.slice(0, 100) // Первые 100 интервью
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <BaseWidget
      id={id}
      isSelected={isSelected}
      onClick={onClick}
      onClose={onClose}
      onRefresh={handleRefresh}
      onMouseDown={onMouseDown}
      title="Глобальный отчет по собеседованиям"
      loading={loading}
      error={error}
      className="min-w-[1200px] min-h-[800px]"
    >
      <div className="space-y-6">
        {/* Фильтры и управление */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Фильтры отчета
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Очистить
              </button>
              <button
                onClick={exportReport}
                className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-1" />
                Экспорт
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Поиск */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Фильтр по позиции */}
            <select
              value={selectedPosition || ''}
              onChange={(e) => setSelectedPosition(e.target.value ? Number(e.target.value) : undefined)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все вакансии</option>
              {positions.map(position => (
                <option key={position.id} value={position.id}>
                  {position.title || `Вакансия #${position.id}`}
                </option>
              ))}
            </select>
            
            {/* Фильтр по статусу */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все статусы</option>
              <option value="not_started">Не начато</option>
              <option value="in_progress">В процессе</option>
              <option value="finished">Завершено</option>
              <option value="successful">Успешно</option>
              <option value="unsuccessful">Неуспешно</option>
            </select>
            
            {/* Фильтр по дате */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все время</option>
              <option value="week">Последняя неделя</option>
              <option value="month">Последний месяц</option>
              <option value="quarter">Последний квартал</option>
            </select>
            
            {/* Переключатель режимов */}
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="overview">Обзор</option>
              <option value="detailed">Детально</option>
              <option value="analytics">Аналитика</option>
            </select>
          </div>
        </div>

        {/* Основная статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Всего интервью</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.successful}</div>
            <div className="text-sm text-gray-600">Успешных</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.averageScore}</div>
            <div className="text-sm text-gray-600">Средняя оценка</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.successRate}%</div>
            <div className="text-sm text-gray-600">Процент успеха</div>
          </div>
        </div>

        {/* Детальная статистика по статусам */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Распределение по статусам
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-sm">Не начато</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-400 h-2 rounded-full" 
                      style={{ width: `${(stats.notStarted / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{stats.notStarted}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-sm">В процессе</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full" 
                      style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{stats.inProgress}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm">На оценке</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${(stats.onEvaluation / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{stats.onEvaluation}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm">Успешные</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full" 
                      style={{ width: `${(stats.successful / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{stats.successful}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-sm">Неуспешные</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-400 h-2 rounded-full" 
                      style={{ width: `${(stats.unsuccessful / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{stats.unsuccessful}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Топ позиций */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Топ позиций по интервью
            </h4>
            <div className="space-y-3">
              {positionStats.slice(0, 5).map((pos) => (
                <div key={pos.positionId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {pos.positionTitle}
                    </div>
                    <div className="text-xs text-gray-500">
                      {pos.successfulInterviews}/{pos.totalInterviews} успешных
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {pos.successRate}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {pos.averageScore}/10
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Детальная таблица (если выбран режим detailed) */}
        {viewMode === 'detailed' && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-700 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Детальная таблица интервью
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Кандидат</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Вакансия</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Статус</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Дата</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Оценка</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {interviews.slice(0, 20).map((interview) => (
                    <tr key={interview.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {getCandidateName(interview.candidateId)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {getPositionTitle(interview.positionId)}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full border ${getStatusColor(interview.status || '', interview.finishedAt, interview.result)}`}>
                          {interview.status === 'not_started' && <Play className="w-3 h-3 mr-1" />}
                          {interview.status === 'in_progress' && <Clock className="w-3 h-3 mr-1" />}
                          {interview.status === 'finished' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {interview.result === 'successful' && <Award className="w-3 h-3 mr-1" />}
                          {interview.result === 'unsuccessful' && <XCircle className="w-3 h-3 mr-1" />}
                          {interview.status === 'not_started' && 'Не начато'}
                          {interview.status === 'in_progress' && 'В процессе'}
                          {interview.status === 'finished' && 'Завершено'}
                          {interview.result === 'successful' && 'Успешно'}
                          {interview.result === 'unsuccessful' && 'Неуспешно'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {formatDate(interview.createdAt)}
                      </td>
                      <td className="px-4 py-2">
                        {interview.aiScore ? (
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getScoreColor(interview.aiScore)}`}>
                            {interview.aiScore}/10
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Аналитика (если выбран режим analytics) */}
        {viewMode === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Ключевые метрики
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Процент завершения</span>
                  <span className="text-lg font-semibold text-blue-600">{stats.completionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Процент успеха</span>
                  <span className="text-lg font-semibold text-green-600">{stats.successRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Средняя оценка</span>
                  <span className="text-lg font-semibold text-purple-600">{stats.averageScore}/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">На оценке</span>
                  <span className="text-lg font-semibold text-yellow-600">{stats.onEvaluation}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <BarChart className="mr-2 h-5 w-5" />
                Распределение оценок
              </h4>
              <div className="space-y-3">
                {[9, 8, 7, 6, 5, 4, 3, 2, 1].map(score => {
                  const count = interviews.filter(i => i.aiScore === score).length;
                  const percentage = interviews.length > 0 ? (count / interviews.length) * 100 : 0;
                  return (
                    <div key={score} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{score}/10</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getScoreColor(score)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

export default InterviewReportWidget; 