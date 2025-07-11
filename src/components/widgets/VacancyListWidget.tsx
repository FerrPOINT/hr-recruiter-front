import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useVacancyListData, useInterviewListData, useCandidatesData } from '../../hooks/useWidgetData';
import BaseWidget from './BaseWidget';
import VacancyCreateModal from '../VacancyCreateModal';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../client/apiClient';
import { Position, Interview } from '../widgets/types';
import { 
  Briefcase, 
  Plus, 
  Filter, 
  Search,
  Calendar,
  Users,
  TrendingUp,
  MoreVertical,
  Eye,
  Edit,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  Play,
  Pause,
  Archive,
  UserCheck,
  UserX,
  User
} from 'lucide-react';

interface VacancyListWidgetProps {
  id: string;
  isSelected?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

interface InterviewStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  successful: number;
  unsuccessful: number;
}

const FILTERS_STORAGE_KEY = 'vacancyListFilters';

function loadFiltersFromStorage() {
  try {
    const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function saveFiltersToStorage(filters: any) {
  localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
}

const VacancyListWidget: React.FC<VacancyListWidgetProps> = ({
  id,
  isSelected,
  onClick,
  onClose,
  onRefresh,
  onMouseDown
}) => {
  const navigate = useNavigate();
  const { data: positions, loading, error, refresh } = useVacancyListData();
  const { data: interviews } = useInterviewListData();
  const { data: candidates } = useCandidatesData();
  
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [selectedPositionInterviews, setSelectedPositionInterviews] = useState<Interview[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>(loadFiltersFromStorage()?.statusFilter || 'all');
  const [searchQuery, setSearchQuery] = useState(loadFiltersFromStorage()?.searchQuery || '');
  const [sortBy, setSortBy] = useState<'title' | 'status' | 'date'>(loadFiltersFromStorage()?.sortBy || 'date');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Position | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Сохранять фильтры при каждом изменении
  useEffect(() => {
    saveFiltersToStorage({ statusFilter, searchQuery, sortBy });
  }, [statusFilter, searchQuery, sortBy]);

  // Вычисляем статистику вакансий
  const vacancyStats = useMemo(() => {
    const stats = {
      total: positions.length,
      active: positions.filter(p => p.status === 'active').length,
      archived: positions.filter(p => p.status === 'archived').length,
      draft: positions.filter(p => p.status === 'paused').length,
      byLevel: {} as Record<string, number>
    };

    positions.forEach(position => {
      if (position.level) {
        stats.byLevel[position.level] = (stats.byLevel[position.level] || 0) + 1;
      }
    });

    return stats;
  }, [positions]);

  // Вычисляем статистику собеседований для выбранной вакансии
  const selectedPositionInterviewStats = useMemo((): InterviewStats => {
    if (!selectedPosition) {
      return { total: 0, completed: 0, inProgress: 0, notStarted: 0, successful: 0, unsuccessful: 0 };
    }

    // Используем данные из position.stats если они есть
    if (selectedPosition.stats) {
      return {
        total: selectedPosition.stats.interviewsTotal || 0,
        completed: (selectedPosition.stats.interviewsSuccessful || 0) + (selectedPosition.stats.interviewsUnsuccessful || 0),
        inProgress: selectedPosition.stats.interviewsInProgress || 0,
        notStarted: (selectedPosition.stats.interviewsTotal || 0) - (selectedPosition.stats.interviewsSuccessful || 0) - (selectedPosition.stats.interviewsUnsuccessful || 0) - (selectedPosition.stats.interviewsInProgress || 0),
        successful: selectedPosition.stats.interviewsSuccessful || 0,
        unsuccessful: selectedPosition.stats.interviewsUnsuccessful || 0
      };
    }

    // Fallback на старую логику
    const positionInterviews = interviews.filter(interview => interview.positionId === selectedPosition.id);
    
    return {
      total: positionInterviews.length,
      completed: positionInterviews.filter(i => i.status === 'finished').length,
      inProgress: positionInterviews.filter(i => i.status === 'in_progress').length,
      notStarted: positionInterviews.filter(i => i.status === 'not_started').length,
      successful: positionInterviews.filter(i => i.result === 'successful').length,
      unsuccessful: positionInterviews.filter(i => i.result === 'unsuccessful').length
    };
  }, [selectedPosition, interviews]);



  // Фильтрация и сортировка вакансий
  const filteredPositions = useMemo(() => {
    return positions.filter((position: any) => {
      if (statusFilter !== 'all' && position.status !== statusFilter) return false;
      if (searchQuery && !position.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }).sort((a: any, b: any) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'date':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });
  }, [positions, statusFilter, searchQuery, sortBy]);

  const handleRefresh = () => {
    console.log('[VacancyListWidget] Refresh triggered');
    refresh();
    onRefresh?.();
  };

  const handlePositionClick = async (position: Position) => {
    setSelectedPosition(position);
    
    // Загружаем собеседования для выбранной позиции
    try {
      const response = await apiClient.interviews.listInterviews(position.id);
      const positionInterviews = (response.data.content as any[])
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5) as Interview[]; // Показываем только последние 5
      setSelectedPositionInterviews(positionInterviews);
    } catch (error) {
      console.error('Failed to load position interviews:', error);
      setSelectedPositionInterviews([]);
    }
  };

  const handleAddVacancy = () => {
    setEditingVacancy(null);
    setIsModalOpen(true);
  };

  const handleEditVacancy = (position: Position) => {
    setEditingVacancy(position);
    setIsModalOpen(true);
  };

  const handleViewInterviews = (positionId: number) => {
    navigate(`/admin/interviews?position=${positionId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'junior':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'middle':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'senior':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'lead':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInterviewStatusIcon = (status: string) => {
    switch (status) {
      case 'finished':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'not_started':
        return <Play className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getInterviewResultIcon = (result?: string) => {
    switch (result) {
      case 'successful':
        return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'unsuccessful':
        return <UserX className="w-4 h-4 text-red-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <BaseWidget
      id={id}
      isSelected={isSelected}
      onClick={onClick}
      onClose={onClose}
      onRefresh={handleRefresh}
      onMouseDown={onMouseDown}
      title="Вакансии и собеседования"
      loading={loading}
      error={error}
      className="min-h-[1000px]"
    >
      <div className="flex h-full space-x-4 min-h-[1000px] w-full">
        {/* Левая панель - Список вакансий */}
        <div className="flex-[3.5_3.5_0%] min-w-[250px] flex flex-col space-y-3">
          {/* Компактная статистика вакансий */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Статистика вакансий</h3>
              <button
                onClick={handleAddVacancy}
                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" />
                Добавить
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white rounded p-2">
                <div className="text-lg font-bold text-green-600">{vacancyStats.active}</div>
                <div className="text-xs text-gray-600">Активные</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-lg font-bold text-yellow-600">{vacancyStats.draft}</div>
                <div className="text-xs text-gray-600">На паузе</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-lg font-bold text-gray-600">{vacancyStats.archived}</div>
                <div className="text-xs text-gray-600">Архив</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-lg font-bold text-blue-600">{vacancyStats.total}</div>
                <div className="text-xs text-gray-600">Всего</div>
              </div>
            </div>
          </div>

          {/* Фильтры: 2 строки */}
          <div>
            {/* Первая строка — поиск */}
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск вакансий..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Вторая строка — статусы и сортировка */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="all">Все статусы</option>
                <option value="active">Активные</option>
                <option value="paused">На паузе</option>
                <option value="archived">Архив</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="date">По дате</option>
                <option value="title">По названию</option>
                <option value="status">По статусу</option>
              </select>
            </div>
          </div>

          {/* Список вакансий */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredPositions.map((position: any) => (
              <div
                key={position.id}
                onClick={() => handlePositionClick(position)}
                className={`border rounded-lg cursor-pointer transition-all hover:shadow-sm px-4 py-2 bg-white flex items-center min-h-[56px] ${
                  selectedPosition?.id === position.id 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Левая часть: две строки */}
                <div className="flex flex-col justify-center flex-1 min-w-0">
                  {/* Название */}
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {truncateText(position.title || '', 60)}
                  </div>
                  {/* Вторая строка: статус, уровень, дата, кандидаты */}
                  <div className="flex flex-row flex-wrap items-center gap-2 mt-1 text-xs text-gray-600">
                    <span className={`flex items-center justify-center px-2 py-0.5 rounded-full border ${getStatusColor(position.status || '')}`}
                          style={{height: '24px', minWidth: '32px'}}>
                      {position.status === 'active' && <span title="Активна"><UserCheck className="w-4 h-4 text-green-600" /></span>}
                      {position.status === 'paused' && <span title="На паузе"><Clock className="w-4 h-4 text-blue-600" /></span>}
                      {position.status === 'archived' && <span title="Архив"><UserX className="w-4 h-4 text-red-600" /></span>}
                    </span>
                    {position.level && (
                      <span className={`px-2 py-0.5 rounded-full ${getLevelColor(position.level)}`}
                            style={{height: '24px'}}>
                        {position.level}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(position.createdAt || '').toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{
                        typeof position.stats?.interviewsTotal === 'number'
                          ? position.stats.interviewsTotal
                          : interviews.filter(i => i.positionId === position.id).length
                      }</span>
                    </div>
                    {position.stats && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{position.stats.interviewsSuccessful || 0} успешных</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Правая часть: кнопки по центру по вертикали */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditVacancy(position);
                    }}
                    className="p-1.5 hover:bg-blue-100 rounded text-blue-600"
                    title="Редактировать"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewInterviews(position.id || 0);
                    }}
                    className="p-1.5 hover:bg-green-100 rounded text-green-600"
                    title="Интервью"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Правая панель - Детали выбранной вакансии */}
        <div className="flex-[2.5_2.5_0%] min-w-[250px] flex flex-col space-y-3">
          {selectedPosition ? (
            <>
              {/* Информация о вакансии */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">{selectedPosition.title}</h3>
                </div>
                <div className="space-y-2">
                  {selectedPosition.description && (
                    <div className="text-xs text-gray-600">
                      {truncateText(selectedPosition.description, 100)}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Создана: {new Date(selectedPosition.createdAt).toLocaleDateString()}
                  </div>
                  {selectedPosition.stats && (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">
                        Кандидатов: {selectedPosition.stats.interviewsTotal || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        Успешных: {selectedPosition.stats.interviewsSuccessful || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        В процессе: {selectedPosition.stats.interviewsInProgress || 0}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Статистика собеседований */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Статистика собеседований</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{selectedPositionInterviewStats.total}</div>
                      <div className="text-xs text-gray-600">Всего</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{selectedPositionInterviewStats.successful}</div>
                      <div className="text-xs text-gray-600">Успешные</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                        <span>В процессе</span>
                      </div>
                      <span className="font-medium">{selectedPositionInterviewStats.inProgress}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-gray-300 inline-block"></span>
                        <span>Не начато</span>
                      </div>
                      <span className="font-medium">{selectedPositionInterviewStats.notStarted}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                        <span>Успешные</span>
                      </div>
                      <span className="font-medium">{selectedPositionInterviewStats.successful}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                        <span>Неуспешные</span>
                      </div>
                      <span className="font-medium">{selectedPositionInterviewStats.unsuccessful}</span>
                    </div>
                  </div>
                </div>
              </div>



              {/* Последние собеседования */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Последние собеседования</h3>
                </div>
                <div className="space-y-2">
                  {selectedPositionInterviews.length > 0 ? (
                    selectedPositionInterviews.map((interview) => {
                      const candidate = candidates.find(c => String(c.id) === String(interview.candidateId));
                      const fullName = candidate ? `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() : 'Кандидат';
                      const email = candidate?.email || '';
                      const aiScore = interview.aiScore !== undefined && interview.aiScore !== null ? interview.aiScore : null;
                      const result = interview.result;
                      const status = interview.status;
                      return (
                        <div key={interview.id} className="px-2 py-1 border border-gray-100 rounded text-xs flex items-center min-h-[36px]">
                          <div className="flex flex-col flex-1 min-w-0 justify-center">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 text-sm truncate" title={fullName}>{fullName}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-600">
                              {/* Статус */}
                              <span className="flex items-center gap-1 min-w-[32px] justify-center">
                                {result === 'successful' && <span title="Успешно"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span></span>}
                                {result === 'unsuccessful' && <span title="Неуспешно"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span></span>}
                                {status === 'in_progress' && !result && <span title="В процессе"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span></span>}
                                {status === 'not_started' && !result && <span title="Не начато"><span className="w-3 h-3 rounded-full bg-gray-300 inline-block"></span></span>}
                                {!result && status !== 'in_progress' && status !== 'not_started' && <span className="text-gray-300">—</span>}
                              </span>
                              {/* AI-оценка */}
                              <span className="min-w-[48px] text-blue-700 text-[11px] font-semibold bg-blue-50 rounded px-1 py-0 text-center">
                                {aiScore !== null ? `AI: ${Number(aiScore).toFixed(1)}` : 'AI: -'}
                              </span>
                              {/* Дата */}
                              <span className="text-gray-400 min-w-[70px] flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(interview.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center ml-2">
                            <button
                              onClick={() => navigate(`/interview/${interview.id}`)}
                              className="p-1 hover:bg-blue-100 rounded text-blue-600"
                              title="Пройти собеседование"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-500 text-xs py-4">
                      Нет собеседований
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Briefcase className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm">Выберите вакансию для просмотра деталей</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Модальное окно создания/редактирования вакансии */}
      <VacancyCreateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVacancy(null);
        }}
        vacancy={editingVacancy}
        onSuccess={() => {
          handleRefresh();
          setIsModalOpen(false);
          setEditingVacancy(null);
        }}
      />
    </BaseWidget>
  );
};

export default VacancyListWidget; 