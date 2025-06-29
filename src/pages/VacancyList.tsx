import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, Link2, Copy, CheckCircle, Clock, AlertCircle, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../services/apiService';
import { authService } from '../services/authService';
import type { Position } from '../client/models/position';
import type { Interview } from '../client/models/interview';
import type { Candidate } from '../client/models/candidate';
import type { Question } from '../client/models/question';
import { PositionStatusEnum } from '../client/models/position-status-enum';

// Функция для форматирования дат
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Функция для обрезки названия вакансии до 20 символов (более строгое ограничение)
const truncateTitle = (title: string | undefined, maxLength: number = 20) => {
  if (!title) return '';
  const trimmedTitle = title.trim();
  const result = trimmedTitle.length > maxLength ? trimmedTitle.substring(0, maxLength) + '...' : trimmedTitle;
  console.log(`truncateTitle: "${title}" -> "${result}" (${trimmedTitle.length}/${maxLength})`);
  return result;
};

// Функция для обрезки топиков до 35 символов (более строгое ограничение)
const truncateTopics = (topics: string[] | undefined, maxLength: number = 35) => {
  if (!topics || topics.length === 0) return '';
  const topicsString = topics.join(', ').trim();
  const result = topicsString.length > maxLength ? topicsString.substring(0, maxLength) + '...' : topicsString;
  console.log(`truncateTopics: "${topicsString}" -> "${result}" (${topicsString.length}/${maxLength})`);
  return result;
};

// Функции для обрезки в правой панели (детали вакансии) - более длинные ограничения
const truncateTitleDetails = (title: string | undefined, maxLength: number = 25) => {
  if (!title) return '';
  const trimmedTitle = title.trim();
  return trimmedTitle.length > maxLength ? trimmedTitle.substring(0, maxLength) + '...' : trimmedTitle;
};

const truncateTopicsDetails = (topics: string[] | undefined, maxLength: number = 60) => {
  if (!topics || topics.length === 0) return '';
  const topicsString = topics.join(', ').trim();
  return topicsString.length > maxLength ? topicsString.substring(0, maxLength) + '...' : topicsString;
};

// Словарь для статусов
const interviewStatusMap = {
  not_started: { text: 'Не начато', icon: <AlertCircle className="h-4 w-4 text-gray-400" />, color: 'bg-gray-400' },
  in_progress: { text: 'В процессе', icon: <Clock className="h-4 w-4 text-yellow-500" />, color: 'bg-yellow-400' },
  finished: { text: 'Завершено', icon: <CheckCircle className="h-4 w-4 text-green-500" />, color: 'bg-green-500' },
  successful: { text: 'Успешно', icon: <CheckCircle className="h-4 w-4 text-green-500" />, color: 'bg-green-500' },
  unsuccessful: { text: 'Неуспешно', icon: <AlertCircle className="h-4 w-4 text-red-500" />, color: 'bg-red-500' },
  evaluating: { text: 'На оценке', icon: <Clock className="h-4 w-4 text-yellow-500" />, color: 'bg-yellow-400' },
};

// Словарь для статусов вакансий
const positionStatusMap: Record<PositionStatusEnum, { text: string; color: string }> = {
  active: { text: 'Активные', color: 'text-green-600' },
  paused: { text: 'На паузе', color: 'text-yellow-600' },
  archived: { text: 'Архив', color: 'text-gray-600' },
};

// Словарь для статуса одной вакансии (единственное число)
const vacancyStatusMap: Record<PositionStatusEnum, { text: string; color: string }> = {
  active: { text: 'Активная', color: 'text-green-600' },
  paused: { text: 'Пауза', color: 'text-yellow-600' },
  archived: { text: 'Архив', color: 'text-gray-600' },
};

type StatusFilterType = PositionStatusEnum | '';

const VacancyList: React.FC = () => {
  // Проверяем аутентификацию
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Состояния фильтрации и выбранной вакансии
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>(''); // '' = все
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showVacancyStatusDropdown, setShowVacancyStatusDropdown] = useState(false);
  const [tab, setTab] = useState<'all' | 'my'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [vacancies, setVacancies] = useState<Position[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [interviewsLoading, setInterviewsLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // Вкладки для деталей вакансии
  const vacancyTabs = [
    { key: 'candidates', label: 'Кандидаты' },
    { key: 'description', label: 'Текст вакансии' },
    { key: 'questions', label: 'Вопросы собеседования' },
  ];
  const [vacancyTab, setVacancyTab] = useState('candidates');

  // Логируем изменения selectedId
  useEffect(() => {
    console.log('selectedId changed to:', selectedId);
  }, [selectedId]);

  // Загрузка данных при изменении фильтров
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params: any = { search: searchTerm };
        if (statusFilter) params.status = statusFilter;
        
        console.log('Fetching positions with params:', params);
        const data = await apiService.getPositions(params);
        console.log('Positions data received:', data);
        
        // Проверяем структуру данных
        if (!data || !Array.isArray(data.items)) {
          console.error('Invalid positions data structure:', data);
          setVacancies([]);
          toast.error('Неверный формат данных вакансий');
          return;
        }
        
        // Загружаем статистику для каждой позиции
        const positionsWithStats = await Promise.all(
          data.items.map(async (position) => {
            try {
              const stats = await apiService.getPositionStats(position.id);
              return { ...position, stats };
            } catch (error) {
              console.warn(`Failed to load stats for position ${position.id}:`, error);
              return position;
            }
          })
        );
        
        console.log('Positions with stats:', positionsWithStats);
        setVacancies(positionsWithStats);
        
        // Если нет выбранной вакансии, выбираем первую
        if (!selectedId && positionsWithStats.length > 0) {
          setSelectedId(positionsWithStats[0].id.toString());
        }
      } catch (error) {
        console.error('Error fetching positions:', error);
        toast.error('Не удалось загрузить вакансии');
        setVacancies([]);
      } finally {
        setLoading(false);
      }
    };

    // Добавляем debounce для предотвращения частых вызовов
    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, selectedId]); // Добавляем selectedId в зависимости

  // Загрузка детальных данных для выбранной вакансии
  useEffect(() => {
    if (!selectedId) return;

    const fetchDetailedData = async () => {
      setInterviewsLoading(true);
      setQuestionsLoading(true);
      
      try {
        // Получаем кандидатов из существующих собеседований
        const selectedVacancyInterviews = interviews.filter(interview => interview.positionId === parseInt(selectedId));
        const candidateIds = Array.from(new Set(selectedVacancyInterviews.map(interview => interview.candidateId)));
        
        if (candidateIds.length > 0) {
          const candidatesData = await Promise.all(
            candidateIds.map(id => apiService.getCandidate(id).catch(() => null))
          );
          const validCandidates = candidatesData.filter(Boolean) as Candidate[];
          setCandidates(validCandidates);
        } else {
          setCandidates([]);
        }
      } catch (error) {
        console.error('Error fetching candidates:', error);
        toast.error('Не удалось загрузить кандидатов');
        setCandidates([]);
      } finally {
        setInterviewsLoading(false);
      }

      try {
        // Загружаем вопросы для выбранной вакансии
        const questionsData = await apiService.getQuestions(parseInt(selectedId));
        setQuestions(questionsData.questions);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setQuestions([]);
      } finally {
        setQuestionsLoading(false);
      }
    };

    fetchDetailedData();
  }, [selectedId, interviews]); // Добавляем interviews в зависимости

  // Загрузка всех интервью для всех вакансий (для статистики в левой панели)
  useEffect(() => {
    const fetchAllInterviews = async () => {
      try {
        // Загружаем все интервью для всех вакансий
        const allInterviews: Interview[] = [];
        
        for (const vacancy of vacancies) {
          try {
            const vacancyInterviews = await apiService.getPositionInterviews(vacancy.id);
            allInterviews.push(...vacancyInterviews);
          } catch (error) {
            console.warn(`Failed to load interviews for vacancy ${vacancy.id}:`, error);
          }
        }
        
        console.log('Loaded all interviews for statistics:', allInterviews);
        setInterviews(allInterviews);
      } catch (error) {
        console.error('Error fetching all interviews:', error);
      }
    };

    if (vacancies.length > 0) {
      fetchAllInterviews();
    }
  }, [vacancies]);

  const filteredVacancies = useMemo(() => {
    return vacancies || [];
  }, [vacancies]);
  
  const selectedVacancy = filteredVacancies.find(v => v.id.toString() === selectedId) || filteredVacancies[0];

  // Функция для расчета статистики по РЕЗУЛЬТАТАМ (для списка вакансий слева)
  const calculateResultStats = useCallback((positionId: number, allInterviews: Interview[]) => {
    const positionInterviews = allInterviews.filter(interview => interview.positionId === positionId);
    
    return {
      interviewsTotal: positionInterviews.length,
      // Успешные: результат SUCCESSFUL
      interviewsSuccessful: positionInterviews.filter(i => i.result === 'SUCCESSFUL' as any).length,
      // Неуспешные: результат UNSUCCESSFUL
      interviewsUnsuccessful: positionInterviews.filter(i => i.result === 'UNSUCCESSFUL' as any).length,
      // Не завершено: результат null (включая в процессе и не начатые)
      interviewsNotFinished: positionInterviews.filter(i => !i.result).length,
    };
  }, []);

  // Мемоизированная статистика для всех вакансий
  const vacancyStats = useMemo(() => {
    console.log('Recalculating vacancy stats for', filteredVacancies.length, 'vacancies');
    const stats = new Map<number, {
      interviewsTotal: number;
      interviewsSuccessful: number;
      interviewsUnsuccessful: number;
      interviewsNotFinished: number;
    }>();
    
    filteredVacancies.forEach(vacancy => {
      const stat = calculateResultStats(vacancy.id, interviews);
      stats.set(vacancy.id, stat);
      console.log(`Vacancy ${vacancy.id} stats:`, stat);
    });
    
    return stats;
  }, [filteredVacancies, interviews, calculateResultStats]);

  // Открыть форму редактирования (переход с передачей данных)
  const handleEdit = () => {
    if (selectedVacancy) {
      navigate('/vacancies/create', { state: { vacancy: selectedVacancy } });
    }
  };

  // Открыть форму создания интервью с выбранной вакансией
  const handleCreateInterview = () => {
    if (selectedVacancy) {
      navigate(`/interviews/create?vacancy=${selectedVacancy.id}`);
    }
  };

  const handleCopyLink = (interviewId: string) => {
    const link = `${window.location.origin}/interview/${interviewId}`;
    navigator.clipboard.writeText(link);
    toast.success('Ссылка на собеседование скопирована!');
  };

  // Если не аутентифицирован, не рендерим компонент
  if (!authService.isAuthenticated()) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex h-[calc(100vh-64px)] gap-0">
        {/* Левая колонка: список вакансий */}
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col pr-0">
          {/* Хедер */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 truncate"
                title="Вакансии">Вакансии</h1>
            <Link to="/vacancies/create"
                  className="bg-primary-500 hover:bg-primary-600 text-white rounded-full p-1.5 transition-colors flex items-center justify-center">
              <Plus className="h-5 w-5"/>
            </Link>
          </div>
          {/* Tabs */}
          <div className="flex gap-2 px-4 py-2">
            <button
                className={`flex-1 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${tab === 'all' ? 'bg-primary-50 text-primary-700 border-primary-200 shadow' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setTab('all')}
            >
              Все <span className="ml-1">{vacancies.length}</span>
            </button>
            <button
              className={`flex-1 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${tab === 'my' ? 'bg-primary-50 text-primary-700 border-primary-200 shadow' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setTab('my')}
            >
              Мои <span className="ml-1">0</span>
            </button>
          </div>
          {/* Фильтр по статусу */}
          <div className="px-4 py-2">
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className={statusFilter ? positionStatusMap[statusFilter as PositionStatusEnum]?.color : 'text-gray-600'}>
                  {statusFilter ? positionStatusMap[statusFilter as PositionStatusEnum]?.text : 'Все статусы'}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    key="all"
                    onClick={() => {
                      setStatusFilter('');
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                      statusFilter === '' ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                    } rounded-t-lg`}
                  >
                    Все статусы
                  </button>
                  {(['active', 'paused', 'archived'] as PositionStatusEnum[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                        statusFilter === status ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                      } ${status === 'archived' ? 'rounded-b-lg' : ''}`}
                    >
                      {positionStatusMap[status]?.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Поиск */}
          <div className="px-4 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 placeholder-gray-400 transition"
              />
            </div>
          </div>
          {/* Список вакансий */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center text-gray-400 py-12">Загрузка...</div>
            ) : filteredVacancies.length === 0 ? (
              <div className="text-center text-gray-400 py-12">Вакансии не найдены</div>
            ) : (
              <ul className="flex flex-col gap-2 px-2 py-1">
                {filteredVacancies.map(vacancy => {
                  const isActive = selectedId === vacancy.id.toString();
                  
                  // Используем статистику из API (которая уже загружена в vacancy.stats)
                  const resultStats = (vacancy as any).stats ? {
                    interviewsTotal: (vacancy as any).stats.interviewsTotal || 0,
                    interviewsSuccessful: (vacancy as any).stats.interviewsSuccessful || 0,
                    interviewsUnsuccessful: (vacancy as any).stats.interviewsUnsuccessful || 0,
                    interviewsNotFinished: ((vacancy as any).stats.interviewsTotal || 0) - ((vacancy as any).stats.interviewsSuccessful || 0) - ((vacancy as any).stats.interviewsUnsuccessful || 0)
                  } : {
                    interviewsTotal: 0,
                    interviewsSuccessful: 0,
                    interviewsUnsuccessful: 0,
                    interviewsNotFinished: 0
                  };
                  
                  return (
                    <li
                      key={vacancy.id}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 cursor-pointer transition-all min-h-[56px] ${isActive ? 'bg-primary-50 border-l-4 border-primary-500 shadow-sm' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
                      onClick={() => {
                        console.log('Selecting vacancy:', vacancy.id, 'with stats:', resultStats);
                        setSelectedId(vacancy.id.toString());
                      }}
                      title={vacancy.title}
                    >
                      {/* Левая часть: текст */}
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <div className="font-semibold text-base text-gray-900 truncate group-hover:underline" title={vacancy.title}>{truncateTitle(vacancy.title)}</div>
                        <div className="text-xs text-gray-400 truncate" title={truncateTopics(vacancy.topics)}>{truncateTopics(vacancy.topics)}</div>
                      </div>
                      {/* Правая часть: индикаторы и счетчик */}
                      <div className="flex flex-col items-end gap-1 min-w-[56px]">
                        <span className="flex w-16 h-5 rounded-lg overflow-hidden border border-gray-200">
                          <span 
                            key={`success-${vacancy.id}`}
                            className="flex-1 flex items-center justify-center text-[11px] font-bold text-white bg-green-500" 
                            title="Успешно"
                          >
                            {resultStats.interviewsSuccessful}
                          </span>
                          <span 
                            key={`not-finished-${vacancy.id}`}
                            className="flex-1 flex items-center justify-center text-[11px] font-bold text-white bg-gray-400" 
                            title="Не завершено"
                          >
                            {resultStats.interviewsNotFinished}
                          </span>
                          <span 
                            key={`unsuccessful-${vacancy.id}`}
                            className="flex-1 flex items-center justify-center text-[11px] font-bold text-white bg-red-500" 
                            title="Неуспешно"
                          >
                            {resultStats.interviewsUnsuccessful}
                          </span>
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span 
                            key={`total-${vacancy.id}`}
                            className="text-xs text-gray-400 font-medium"
                          >
                            {resultStats.interviewsTotal}
                          </span>
                          <MoreVertical className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
        {/* Правая колонка: детали выбранной вакансии */}
        <section className="flex-1 flex flex-col bg-gray-50 px-4 pb-4 pl-0">
          {!selectedVacancy ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">Вакансия не выбрана</div>
          ) : (
            <div className="px-4 pb-4 flex flex-col gap-6">
              {/* Верхний блок: заголовок и действия */}
              <div className="flex items-center justify-between gap-6 min-h-[44px]">
                <div className="flex-1 flex flex-col">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 truncate" title={selectedVacancy.title}>
                    {truncateTitleDetails(selectedVacancy.title)}
                  </h2>
                  <div
                    className="text-xs text-gray-500 mt-1 truncate"
                    style={{ minHeight: '20px' }}
                    title={truncateTopicsDetails(selectedVacancy.topics)}
                  >
                    {truncateTopicsDetails(selectedVacancy.topics)}
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <button className="btn-primary min-w-[160px] h-11 text-base flex items-center justify-center" onClick={handleCreateInterview}>Создать интервью</button>
                  <button className="btn-secondary min-w-[160px] h-11 text-base flex items-center justify-center" onClick={handleEdit}>Редактировать</button>
                  {/* Смена статуса */}
                  <div className="relative">
                    <button
                      onClick={() => setShowVacancyStatusDropdown(!showVacancyStatusDropdown)}
                      className={`min-w-[160px] h-11 text-base flex items-center justify-between px-4 rounded-lg border transition-colors ${
                        selectedVacancy.status === 'active' 
                          ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                          : selectedVacancy.status === 'paused'
                          ? 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
                          : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      <span>{vacancyStatusMap[selectedVacancy.status as PositionStatusEnum]?.text || 'Неизвестный статус'}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${showVacancyStatusDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showVacancyStatusDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        {(['active', 'paused', 'archived'] as PositionStatusEnum[]).map((status) => (
                          <button
                            key={status}
                            onClick={async () => {
                              if (status !== selectedVacancy.status) {
                                try {
                                  await apiService.updatePosition(selectedVacancy.id, { status });
                                  toast.success('Статус обновлен');
                                  
                                  // Обновляем только локальное состояние выбранной вакансии
                                  setVacancies(prevVacancies => 
                                    prevVacancies.map(vacancy => 
                                      vacancy.id === selectedVacancy.id 
                                        ? { ...vacancy, status } 
                                        : vacancy
                                    )
                                  );
                                } catch (error) {
                                  console.error('Error updating position status:', error);
                                  toast.error('Не удалось обновить статус');
                                }
                              }
                              setShowVacancyStatusDropdown(false);
                            }}
                            className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                              status === 'active' ? 'text-green-700' : status === 'paused' ? 'text-yellow-700' : 'text-red-700'
                            } ${status === 'active' ? 'rounded-t-lg' : ''} ${status === 'archived' ? 'rounded-b-lg' : ''}`}
                          >
                            {vacancyStatusMap[status].text}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Обзор */}
              <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-soft">
                <div
                  className="grid items-center mb-4 gap-4"
                  style={{ gridTemplateColumns: 'minmax(120px,1fr) minmax(220px,3fr) minmax(110px,1fr) minmax(60px,0.7fr) minmax(60px,0.7fr)' }}
                >
                  <div>
                    <div className="text-xs text-gray-500 font-normal text-left mb-1">Название</div>
                    <div className="font-medium text-base text-left truncate" title={selectedVacancy.title}>{truncateTitleDetails(selectedVacancy.title)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-normal text-left mb-1">Топики</div>
                    <div className="font-medium text-base text-left truncate max-w-[420px]" title={truncateTopicsDetails(selectedVacancy.topics)}>{truncateTopicsDetails(selectedVacancy.topics)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-normal text-center mb-1">Создано</div>
                    <div className="font-medium text-base text-center truncate" title={selectedVacancy.createdAt}>{formatDate(selectedVacancy.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-normal text-center mb-1">min балл</div>
                    <div className="font-medium text-base text-center">{selectedVacancy.minScore}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-normal text-center mb-1">avg балл</div>
                    <div className="font-medium text-base text-center">{(selectedVacancy as any).avgScore ?? 0}</div>
                  </div>
                </div>
                {/* Профессиональные вкладки */}
                <div className="flex gap-2 border-b border-gray-100 mb-4">
                  {vacancyTabs.map(tabObj => (
                    <button
                      key={tabObj.key}
                      className={`relative pb-2 px-2 text-base font-medium transition-colors duration-150
                        ${vacancyTab === tabObj.key
                          ? 'text-primary-700 border-b-2 border-primary-500'
                          : 'text-gray-400 hover:text-primary-600 border-b-2 border-transparent'}`}
                      onClick={() => setVacancyTab(tabObj.key)}
                      type="button"
                    >
                      {tabObj.label}
                    </button>
                  ))}
                </div>
                {/* Контент вкладок */}
                {vacancyTab === 'candidates' && (
                  <>
                    <div className="flex items-center gap-6 mb-4">
                      {(() => {
                        if (!selectedId) return null;
                        const selectedVacancyInterviews = interviews.filter(interview => interview.positionId === parseInt(selectedId));
                        return (
                          <>
                            <div className="text-sm">Всего: <span className="font-bold">{selectedVacancyInterviews.length}</span></div>
                            <div className="text-sm">Завершено: <span className="font-bold text-green-600">{selectedVacancyInterviews.filter(i => i.status === 'finished').length}</span></div>
                            <div className="text-sm">В процессе: <span className="font-bold text-yellow-600">{selectedVacancyInterviews.filter(i => i.status === 'in_progress').length}</span></div>
                            <div className="text-sm">Не начато: <span className="font-bold text-gray-600">{selectedVacancyInterviews.filter(i => !i.status || i.status === 'not_started').length}</span></div>
                          </>
                        );
                      })()}
                    </div>
                    
                    {/* Список кандидатов вакансии */}
                    {(selectedVacancy as any).candidates && (selectedVacancy as any).candidates.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Кандидаты вакансии</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                          {(selectedVacancy as any).candidates.map((candidate: any) => (
                            <div key={candidate.id} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary-700">
                                    {candidate.firstName?.[0] || 'C'}{candidate.lastName?.[0] || ''}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {candidate.firstName || 'Кандидат'} {candidate.lastName || ''}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">{candidate.email || 'Email не указан'}</div>
                                  <div className="text-xs text-gray-400">{candidate.phone || 'Телефон не указан'}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Список собеседований */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Собеседования</h4>
                      {interviewsLoading ? (
                        <div>Загрузка собеседований...</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Кандидат</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата старта</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата окончания</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Оценка</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ссылка</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {(() => {
                                if (!selectedId) return null;
                                const selectedVacancyInterviews = interviews.filter(interview => interview.positionId === parseInt(selectedId));
                                return selectedVacancyInterviews.map(interview => {
                                  const candidate = candidates.find(c => c.id === interview.candidateId);
                                  
                                  // Определяем статус: если есть дата окончания, но нет результата - значит на оценке
                                  let statusKey: keyof typeof interviewStatusMap;
                                  if (interview.finishedAt && !interview.result) {
                                    statusKey = 'evaluating';
                                  } else {
                                    statusKey = (interview.result || interview.status) as keyof typeof interviewStatusMap;
                                  }
                                  
                                  const statusInfo = interviewStatusMap[statusKey];

                                  return (
                                    <tr key={interview.id}>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{candidate?.name || 'Неизвестный кандидат'}</div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        {statusInfo && (
                                          <span className="flex items-center gap-2 text-sm text-gray-700">
                                            {statusInfo.icon}
                                            {statusInfo.text}
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(interview.createdAt)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {interview.startedAt ? formatDate(interview.startedAt) : '-'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {interview.finishedAt ? formatDate(interview.finishedAt) : '-'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {interview.aiScore !== null && interview.aiScore !== undefined ? 
                                          Number(interview.aiScore).toFixed(2) : 
                                          '-'
                                        }
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-3">
                                          <Link to={`/interview/${interview.id}`} title="Перейти к интервью">
                                            <Link2 className="h-5 w-5 text-primary-500 hover:text-primary-700" />
                                          </Link>
                                          <button onClick={() => handleCopyLink(interview.id.toString())} title="Скопировать ссылку">
                                            <Copy className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                });
                              })()}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {vacancyTab === 'description' && (
                  <div className="flex flex-col gap-6 items-start py-4">
                    <div className="w-full">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Описание вакансии</h3>
                      <div className="text-gray-700 text-base whitespace-pre-line max-w-2xl">
                        {selectedVacancy.description || 'Описание вакансии отсутствует.'}
                      </div>
                    </div>
                    
                    {/* Дополнительная информация */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Настройки записи */}
                      <div className="space-y-4">
                        <h4 className="text-md font-semibold text-gray-900">Настройки записи</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Сохранять аудио:</span>
                            <span className={`font-medium ${selectedVacancy.saveAudio ? 'text-green-600' : 'text-gray-400'}`}>
                              {selectedVacancy.saveAudio ? 'Да' : 'Нет'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Сохранять видео:</span>
                            <span className={`font-medium ${selectedVacancy.saveVideo ? 'text-green-600' : 'text-gray-400'}`}>
                              {selectedVacancy.saveVideo ? 'Да' : 'Нет'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Случайный порядок:</span>
                            <span className={`font-medium ${selectedVacancy.randomOrder ? 'text-green-600' : 'text-gray-400'}`}>
                              {selectedVacancy.randomOrder ? 'Да' : 'Нет'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Показывать на другом языке:</span>
                            <span className={`font-medium ${selectedVacancy.showOtherLang ? 'text-green-600' : 'text-gray-400'}`}>
                              {selectedVacancy.showOtherLang ? 'Да' : 'Нет'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Команда */}
                    {(selectedVacancy as any).team && (selectedVacancy as any).team.length > 0 && (
                      <div className="w-full">
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Команда</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {(selectedVacancy as any).team.map((user: any) => (
                            <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-700">
                                  {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName || 'Пользователь'} {user.lastName || ''}
                                </div>
                                <div className="text-xs text-gray-500">{user.email || 'Email не указан'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Брендинг */}
                    {(selectedVacancy as any).branding && (
                      <div className="w-full">
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Брендинг</h4>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            {(selectedVacancy as any).branding.logoUrl && (
                              <img 
                                src={(selectedVacancy as any).branding.logoUrl} 
                                alt="Логотип" 
                                className="w-12 h-12 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {(selectedVacancy as any).branding.companyName || 'Название компании'}
                              </div>
                              {(selectedVacancy as any).branding.primaryColor && (
                                <div className="text-xs text-gray-500">
                                  Основной цвет: {(selectedVacancy as any).branding.primaryColor}
                                </div>
                              )}
                              {(selectedVacancy as any).branding.secondaryColor && (
                                <div className="text-xs text-gray-500">
                                  Дополнительный цвет: {(selectedVacancy as any).branding.secondaryColor}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {vacancyTab === 'questions' && (
                  <div className="flex flex-col gap-4 items-start py-4">
                    {questionsLoading ? (
                      <div className="text-gray-500 text-base">Загрузка вопросов...</div>
                    ) : questions.length === 0 ? (
                      <div className="text-gray-500 text-base italic">Вопросы для собеседования отсутствуют.</div>
                    ) : (
                      <div className="w-full">
                        <div className="text-sm text-gray-600 mb-4">Всего вопросов: <span className="font-bold">{questions.length}</span></div>
                        <div className="space-y-4">
                          {questions.map((question, index) => (
                            <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-500">Вопрос {index + 1}</span>
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {question.type}
                                  </span>
                                </div>
                                {question.isRequired && (
                                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                    Обязательный
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-900 mb-2">{question.text}</div>
                              {question.evaluationCriteria && (
                                <div className="text-sm text-gray-600">
                                  <strong>Критерии оценки:</strong> {question.evaluationCriteria}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default VacancyList; 
