import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Loader2, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import { apiService } from '../services/apiService';
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
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Фильтры
  const [selectedPosition, setSelectedPosition] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, selectedPosition, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загружаем интервью с пагинацией и фильтрами
      const interviewsData = await apiService.getInterviews({
        positionId: selectedPosition,
        page: currentPage,
        size: pageSize
      });
      
      setInterviews(interviewsData.items);
      setTotalElements(interviewsData.total || 0);
      setTotalPages(Math.ceil((interviewsData.total || 0) / pageSize));
      
      // Загружаем позиции для фильтра
      const positionsData = await apiService.getPositions();
      setPositions(positionsData.items);
      
      // Получаем кандидатов для отображения ФИО
      const candidateIds = Array.from(new Set(interviewsData.items.map(i => i.candidateId)));
      const candidatesData = await Promise.all(
        candidateIds.map(id => apiService.getCandidate(id).catch(() => null))
      );
      setCandidates(candidatesData.filter(Boolean) as Candidate[]);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="w-full max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Собеседования</h1>
        <Link to="/interviews/create" className="btn-primary flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Новое собеседование
        </Link>
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
            <option value={5}>5 на странице</option>
            <option value={10}>10 на странице</option>
            <option value={20}>20 на странице</option>
            <option value={50}>50 на странице</option>
          </select>
        </div>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Список собеседований</h2>
          <div className="text-sm text-gray-500">
            Показано {interviews.length} из {totalElements} записей
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 className="animate-spin h-8 w-8 mr-2" /> Загрузка...
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {searchQuery || selectedPosition || selectedStatus ? 
              'По заданным критериям собеседований не найдено' : 
              'Собеседований пока нет'
            }
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Кандидат</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Вакансия</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Создано</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Начато</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Завершено</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Время</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Балл</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredInterviews.map((interview) => (
                    <tr key={interview.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {getCandidateName(interview.candidateId)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {getPositionTitle(interview.positionId)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getInterviewStatusColor(interview.status, interview.finishedAt, interview.result)}`}>
                          {getInterviewStatusText(interview.status, interview.finishedAt, interview.result)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(interview.createdAt)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(interview.startedAt)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(interview.finishedAt)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {interview.startedAt && interview.finishedAt ? 
                          `${Math.round((new Date(interview.finishedAt).getTime() - new Date(interview.startedAt).getTime()) / 1000 / 60)} мин` : 
                          '-'
                        }
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                        {interview.aiScore !== null && interview.aiScore !== undefined ? 
                          Number(interview.aiScore).toFixed(2) : 
                          '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Страница {currentPage + 1} из {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          page === currentPage
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page + 1}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InterviewList;