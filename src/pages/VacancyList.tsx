import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, MoreVertical, Users, FileText, BarChart2, Globe, Mail, Link2, Copy, CheckCircle, Clock, AlertCircle, Archive } from 'lucide-react';
import toast from 'react-hot-toast';
// import vacanciesData from '../mocks/vacancies.json';
import { mockApi } from '../mocks/mockApi';
import type { Position } from '../client/models/position';
import type { Interview } from '../client/models/interview';
import type { Candidate } from '../client/models/candidate';

const useMock = process.env.REACT_APP_USE_MOCK_API === 'true';

// Функция для форматирования дат
const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Словарь для статусов
const interviewStatusMap = {
  not_started: { text: 'Не начато', icon: <AlertCircle className="h-4 w-4 text-gray-400" />, color: 'bg-gray-400' },
  in_progress: { text: 'В процессе', icon: <Clock className="h-4 w-4 text-yellow-500" />, color: 'bg-yellow-400' },
  successful: { text: 'Успешно', icon: <CheckCircle className="h-4 w-4 text-green-500" />, color: 'bg-green-500' },
  unsuccessful: { text: 'Неуспешно', icon: <AlertCircle className="h-4 w-4 text-red-500" />, color: 'bg-red-500' },
};

const VacancyList: React.FC = () => {
  // Состояния фильтрации и выбранной вакансии
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [tab, setTab] = useState<'all' | 'my'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [vacancies, setVacancies] = useState<Position[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [interviewsLoading, setInterviewsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Вкладки для деталей вакансии
  const vacancyTabs = [
    { key: 'candidates', label: 'Кандидаты' },
    { key: 'description', label: 'Текст вакансии' },
    { key: 'comments', label: 'Комментарии' },
    { key: 'questions', label: 'Вопросы собеседования' },
  ];
  const [vacancyTab, setVacancyTab] = useState('candidates');

  useEffect(() => {
    setLoading(true);
    (async () => {
      let data;
      const status = showArchived ? 'archived' : 'active';
      if (useMock) {
        data = await mockApi.getPositions({ status, search: searchTerm });
      } else {
        // TODO: подключить реальный API-клиент
        data = await mockApi.getPositions({ status, search: searchTerm });
      }
      setVacancies(data.items);
      // Если перешли по ссылке с dashboard, выбираем нужную вакансию
      const locationState = location.state as { positionId?: string };
      if (locationState?.positionId) {
        setSelectedId(locationState.positionId);
      } else if (!selectedId && data.items.length > 0) {
        setSelectedId(data.items[0].id);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, [searchTerm, showArchived]);

  useEffect(() => {
    if (selectedId) {
      setInterviewsLoading(true);
      (async () => {
        const [interviewsData, candidatesData] = await Promise.all([
          mockApi.getPositionInterviews(selectedId),
          mockApi.getPositions({ status: 'active' }).then(res =>
             res.items.find(p => p.id === selectedId)?.candidates || []
          )
        ]);
        setInterviews(interviewsData);
        setCandidates(candidatesData as Candidate[]);
        setInterviewsLoading(false);
      })();
    }
  }, [selectedId]);

  const filteredVacancies = vacancies;
  const selectedVacancy = filteredVacancies.find(v => v.id === selectedId) || filteredVacancies[0];

  // Статистика по собеседованиям
  const interviewStats = interviews.reduce(
    (acc, interview) => {
      if (interview.status === 'finished') acc.finished++;
      else if (interview.status === 'in_progress') acc.inProgress++;
      else if (interview.status === 'not_started') acc.notStarted++;
      return acc;
    },
    { finished: 0, inProgress: 0, notStarted: 0 }
  );

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

  const handleArchive = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите архивировать эту вакансию?')) {
      try {
        await mockApi.updatePosition(id, { status: 'archived' });
        toast.success('Вакансия архивирована');
        // Refetch vacancies
        const status = showArchived ? 'archived' : 'active';
        const data = await mockApi.getPositions({ status, search: searchTerm });
        setVacancies(data.items);
        if (selectedId === id) {
          setSelectedId(data.items.length > 0 ? data.items[0].id : null);
        }
      } catch (error) {
        console.error('Error archiving vacancy:', error);
        toast.error('Не удалось архивировать вакансию');
      }
    }
  };

  const handleCopyLink = (interviewId: string) => {
    const link = `${window.location.origin}/interview/${interviewId}`;
    navigator.clipboard.writeText(link);
    toast.success('Ссылка на собеседование скопирована!');
  };

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
          {/* Архивный переключатель */}
          <div className="px-4 py-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={e => setShowArchived(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Показать архив
            </label>
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
                  const isActive = selectedId === vacancy.id;
                  return (
                    <li
                      key={vacancy.id}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 cursor-pointer transition-all min-h-[56px] ${isActive ? 'bg-primary-50 border-l-4 border-primary-500 shadow-sm' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
                      onClick={() => setSelectedId(vacancy.id)}
                      title={vacancy.title}
                    >
                      {/* Левая часть: текст */}
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <div className="font-semibold text-base text-gray-900 truncate group-hover:underline" title={vacancy.title}>{vacancy.title}</div>
                        <div className="text-xs text-gray-400 truncate" title={vacancy.topics?.join(', ')}>{vacancy.topics?.join(', ')}</div>
                      </div>
                      {/* Правая часть: индикаторы и счетчик */}
                      <div className="flex flex-col items-end gap-1 min-w-[56px]">
                        <span className="flex w-16 h-5 rounded-lg overflow-hidden border border-gray-200">
                          <span className="flex-1 flex items-center justify-center text-[11px] font-bold text-white bg-green-500" title="Успешно">{vacancy.stats?.interviewsSuccessful || 0}</span>
                          <span className="flex-1 flex items-center justify-center text-[11px] font-bold text-white bg-yellow-400" title="В процессе">{vacancy.stats?.interviewsInProgress || 0}</span>
                          <span className="flex-1 flex items-center justify-center text-[11px] font-bold text-white bg-red-500" title="Неуспешно">{vacancy.stats?.interviewsUnsuccessful || 0}</span>
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs text-gray-400 font-medium">{vacancy.stats?.interviewsTotal || 0}</span>
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
                    {selectedVacancy.title}
                  </h2>
                  <div
                    className="text-xs text-gray-500 mt-1 truncate"
                    style={{ minHeight: '20px' }}
                    title={selectedVacancy.topics?.join(', ')}
                  >
                    {selectedVacancy.topics?.join(', ')}
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <button className="btn-primary min-w-[160px] h-11 text-base flex items-center justify-center" onClick={handleCreateInterview}>Создать интервью</button>
                  <button className="btn-secondary min-w-[160px] h-11 text-base flex items-center justify-center" onClick={handleEdit}>Редактировать</button>
                  <button 
                    className="btn-secondary min-w-[160px] h-11 text-base flex items-center justify-center gap-2" 
                    onClick={() => selectedVacancy && handleArchive(selectedVacancy.id)}>
                    <Archive className="h-4 w-4" />
                    Архивировать
                  </button>
                </div>
              </div>
              {/* Обзор */}
              <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-soft">
                <div
                  className="grid items-center mb-4 gap-4"
                  style={{ gridTemplateColumns: 'minmax(120px,1fr) minmax(220px,3fr) minmax(60px,0.7fr) minmax(110px,1fr) minmax(60px,0.7fr)' }}
                >
                  <div>
                    <div className="text-xs text-gray-500 font-normal text-left mb-1">Название</div>
                    <div className="font-medium text-base text-left truncate" title={selectedVacancy.title}>{selectedVacancy.title}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-normal text-left mb-1">Топики</div>
                    <div className="font-medium text-base text-left truncate max-w-[420px]" title={selectedVacancy.topics?.join(', ')}>{selectedVacancy.topics?.join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-normal text-left mb-1">min балл</div>
                    <div className="font-medium text-base text-left pl-2">{selectedVacancy.minScore}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-normal text-center mb-1">Создано</div>
                    <div className="font-medium text-base text-center truncate" title={selectedVacancy.createdAt}>{formatDate(selectedVacancy.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-normal text-left mb-1">avg балл</div>
                    <div className="font-medium text-base text-left pl-2">{selectedVacancy.avgScore}</div>
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
                      <div className="text-sm">Всего: <span className="font-bold">{interviews.length}</span></div>
                      <div className="text-sm">Завершено: <span className="font-bold text-green-600">{interviewStats.finished}</span></div>
                      <div className="text-sm">В процессе: <span className="font-bold text-yellow-600">{interviewStats.inProgress}</span></div>
                    </div>
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
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата окончания</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Оценка</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действие</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {interviews.map(interview => {
                              const candidate = candidates.find(c => c.id === interview.candidateId);
                              const statusKey = (interview.result || interview.status) as keyof typeof interviewStatusMap;
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
                                    {formatDate(interview.startedAt)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(interview.finishedAt)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {interview.aiScore || '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center gap-3">
                                      <Link to={`/interview/${interview.id}`} title="Перейти к интервью">
                                        <Link2 className="h-5 w-5 text-primary-500 hover:text-primary-700" />
                                      </Link>
                                      <button onClick={() => handleCopyLink(interview.id)} title="Скопировать ссылку">
                                        <Copy className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
                {vacancyTab === 'description' && (
                  <div className="flex flex-col gap-4 items-start py-4">
                    <div className="text-gray-700 text-base whitespace-pre-line max-w-2xl">
                      {selectedVacancy.description || 'Описание вакансии отсутствует.'}
                    </div>
                  </div>
                )}
                {vacancyTab === 'comments' && (
                  <div className="flex flex-col gap-4 items-start py-4">
                    <div className="text-gray-500 text-base italic">Нет комментариев. Оставьте первый комментарий к вакансии!</div>
                  </div>
                )}
                {vacancyTab === 'questions' && (
                  <div className="flex flex-col gap-4 items-start py-4">
                    <div className="text-gray-500 text-base italic">Вопросы для собеседования будут отображаться здесь.</div>
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