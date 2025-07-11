import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Loader2, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import { useInterviewsData } from '../hooks/usePageData';
import { TableSkeleton } from '../components/SkeletonLoader';
import InterviewModal from '../components/InterviewModal';
import toast from 'react-hot-toast';
import type { Interview } from '../client/models/interview';
import type { Position } from '../client/models/position';
import type { Candidate } from '../client/models/candidate';

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '–';
  try {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch (e) {
    return '–';
  }
};

const InterviewList: React.FC = () => {
  // Пагинация
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Фильтры
  const [selectedPosition, setSelectedPosition] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Модальное окно
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  // Используем новый упрощенный хук
  const { interviews, positions, candidates, loading, error, refresh } = useInterviewsData({
    positionId: selectedPosition,
    page: currentPage,
    size: pageSize
  });

  // Вычисляем общее количество и страницы
  const totalElements = interviews.length;
  const totalPages = Math.ceil(totalElements / pageSize);

  const getCandidateName = (id: number) => {
    const c = candidates.find(c => c.id === id);
    if (!c) return `Кандидат #${id}`;
    return [c.firstName, c.lastName].filter(Boolean).join(' ') || `Кандидат #${id}`;
  };

  const getPositionTitle = (id: number) => {
    const p = positions.find(p => p.id === id);
    return p ? (p.title || `Вакансия #${id}`) : `Вакансия #${id}`;
  };

  const getInterviewStatusText = (status: string, finishedAt?: string, result?: string) => {
    // Если есть дата окончания, но нет результата - значит на оценке
    if (finishedAt && !result) {
      return 'На оценке';
    }
    
    switch (status) {
      case 'not_started': return 'Не начато';
      case 'in_progress': return 'В процессе';
      case 'finished': return 'Завершено';
      case 'successful': return 'Успешно';
      case 'unsuccessful': return 'Неуспешно';
      default: return status;
    }
  };

  // Цвета для статусов
  const getInterviewStatusColor = (status: string, finishedAt?: string, result?: string) => {
    // Если есть дата окончания, но нет результата - значит на оценке
    if (finishedAt && !result) {
      return 'bg-yellow-100 text-yellow-800';
    }
    
    switch (status) {
      case 'not_started': return 'bg-gray-200 text-gray-700';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'finished': return 'bg-green-100 text-green-800';
      case 'successful': return 'bg-green-100 text-green-800';
      case 'unsuccessful': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = (score: number, minScore: number = 0) => {
    if (score >= minScore) return 'bg-green-100 text-green-800';
    if (score >= minScore * 0.8) return 'bg-yellow-100 text-yellow-800';
    if (score >= minScore * 0.6) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  // Фильтрация интервью
  const filteredInterviews = interviews.filter(interview => {
    if (selectedStatus && interview.status !== selectedStatus) return false;
    
    if (searchQuery) {
      const candidateName = getCandidateName(interview.candidateId).toLowerCase();
      const positionTitle = getPositionTitle(interview.positionId).toLowerCase();
      const query = searchQuery.toLowerCase();
      return candidateName.includes(query) || positionTitle.includes(query);
    }
    
    return true;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0); // Сбрасываем на первую страницу
  };

  const clearFilters = () => {
    setSelectedPosition(undefined);
    setSelectedStatus('');
    setSearchQuery('');
    setCurrentPage(0);
  };

  const handleCreateInterview = () => {
    setSelectedInterview(null);
    setIsModalOpen(true);
  };

  const handleEditInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    refresh();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedInterview(null);
  };

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
    <div className="w-full max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Собеседования</h1>
        <button onClick={handleCreateInterview} className="btn-primary flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Новое собеседование
        </button>
      </div>
      
      {/* Фильтры */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Фильтры
          </h2>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Очистить фильтры
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по кандидату или вакансии..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Фильтр по позиции */}
          <select
            value={selectedPosition || ''}
            onChange={(e) => setSelectedPosition(e.target.value ? Number(e.target.value) : undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Все статусы</option>
            <option value="not_started">Не начато</option>
            <option value="in_progress">В процессе</option>
            <option value="finished">Завершено</option>
            <option value="successful">Успешно</option>
            <option value="unsuccessful">Неуспешно</option>
          </select>
          
          {/* Размер страницы */}
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={10}>10 на странице</option>
            <option value={20}>20 на странице</option>
            <option value={50}>50 на странице</option>
          </select>
        </div>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Кандидат
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Вакансия
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Оценка
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInterviews.map((interview) => (
                    <tr key={interview.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getCandidateName(interview.candidateId)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {interview.candidateId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getPositionTitle(interview.positionId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInterviewStatusColor(interview.status || '', interview.finishedAt, interview.result)}`}>
                          {getInterviewStatusText(interview.status || '', interview.finishedAt, interview.result)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(interview.startedAt || interview.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {interview.aiScore ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(interview.aiScore, 7)}`}>
                            {interview.aiScore}/10
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditInterview(interview)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Редактировать"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/interview/${interview.id}`}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Просмотреть"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Назад
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Вперед
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Показано <span className="font-medium">{currentPage * pageSize + 1}</span> до{' '}
                      <span className="font-medium">
                        {Math.min((currentPage + 1) * pageSize, totalElements)}
                      </span>{' '}
                      из <span className="font-medium">{totalElements}</span> результатов
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === i
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Модальное окно */}
      <InterviewModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        interview={selectedInterview}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default InterviewList;