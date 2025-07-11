import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, TrendingUp, Clock, Plus, Eye } from 'lucide-react';
import { useDashboardData } from '../hooks/usePageData';
import { VacancyListSkeleton } from '../components/SkeletonLoader';
import VacancyCreateModal from '../components/VacancyCreateModal';

const Dashboard: React.FC = () => {
  // Используем новый упрощенный хук
  const { positions, interviews, candidates, stats, loading, error, refresh } = useDashboardData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">Ошибка загрузки данных: {error}</p>
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
          <p className="text-gray-600">Обзор активности и статистики</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Создать вакансию
          </button>
          <Link
                          to="/admin/interviews/create"
            className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Создать интервью
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Всего вакансий</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats?.positionsCount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Всего интервью</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats?.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Кандидаты</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats?.candidatesCount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Активные вакансии</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : positions.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Interviews */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Последние интервью</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Интервью пока не проводились</p>
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.slice(0, 5).map((interview) => {
                  const position = positions.find(p => p.id === interview.positionId);
                  const candidate = candidates.find(c => c.id === interview.candidateId);
                  
                  return (
                    <div key={interview.id} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {candidate?.firstName?.[0] || 'C'}{candidate?.lastName?.[0] || ''}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {candidate?.firstName || 'Кандидат'} {candidate?.lastName || ''}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {position?.title || 'Вакансия'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {new Date(interview.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {interviews.length > 5 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  to="/admin/interviews"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Посмотреть все интервью →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Active Positions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Активные вакансии</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : positions.filter(p => p.status === 'active').length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Нет активных вакансий</p>
              </div>
            ) : (
              <div className="space-y-4">
                {positions
                  .filter(p => p.status === 'active')
                  .slice(0, 5)
                  .map((position) => (
                    <div key={position.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {position.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {position.topics?.slice(0, 2).join(', ')}
                        </p>
                      </div>
                      <Link
                        to={`/admin/vacancies/${position.id}`}
                        className="ml-4 p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
              </div>
            )}
            {positions.filter(p => p.status === 'active').length > 5 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  to="/admin/vacancies"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Посмотреть все вакансии →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Модальное окно создания вакансии */}
      <VacancyCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vacancy={null}
        onSuccess={() => {
          refresh();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default Dashboard; 