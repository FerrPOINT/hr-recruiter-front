import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, Users, FileText, BarChart2, Globe, Mail, Link2 } from 'lucide-react';
import vacanciesData from '../mocks/vacancies.json';

const VacancyList: React.FC = () => {
  // Состояния фильтрации и выбранной вакансии
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<'all' | 'my'>('all');
  const [selectedId, setSelectedId] = useState<number | null>(vacanciesData[0]?.id || null);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  // Вкладки для деталей вакансии
  const vacancyTabs = [
    { key: 'candidates', label: 'Кандидаты' },
    { key: 'description', label: 'Текст вакансии' },
    { key: 'comments', label: 'Комментарии' },
    { key: 'questions', label: 'Вопросы собеседования' },
  ];
  const [vacancyTab, setVacancyTab] = useState('candidates');

  // Фильтрация вакансий (моки)
  const filteredVacancies = vacanciesData.filter(vacancy =>
    vacancy.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Найти выбранную вакансию
  const selectedVacancy = filteredVacancies.find(v => v.id === selectedId) || filteredVacancies[0];

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

  // Добавлю функцию handleDelete для удаления вакансии из списка.
  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить вакансию?')) {
      // Здесь должен быть вызов API или обновление состояния, если бы был сервер
      setSelectedId(null);
      // В реальном проекте — обновить данные через setState или refetch
      window.location.reload(); // временно, чтобы обновить список после удаления
    }
  };

  return (
    <div className="w-full">
      <div className="flex h-[calc(100vh-64px)] gap-0">
        {/* Левая колонка: список вакансий */}
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col pr-0">
          {/* Хедер */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-bold text-lg text-gray-900">Вакансии</span>
            <Link to="/vacancies/create" className="bg-primary-500 hover:bg-primary-600 text-white rounded-full p-1.5 transition-colors flex items-center justify-center">
              <Plus className="h-5 w-5" />
            </Link>
          </div>
          {/* Tabs */}
          <div className="flex gap-2 px-4 py-2">
            <button
              className={`flex-1 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${tab === 'all' ? 'bg-primary-50 text-primary-700 border-primary-200 shadow' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setTab('all')}
            >
              Все <span className="ml-1">{vacanciesData.length}</span>
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
          {/* Список вакансий */}
          <div className="flex-1 overflow-y-auto">
            {filteredVacancies.length === 0 ? (
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
                        <div className="text-xs text-gray-400 truncate" title={vacancy.topics.join(', ')}>{vacancy.topics.join(', ')}</div>
                      </div>
                      {/* Правая часть: индикаторы и счетчик */}
                      <div className="flex flex-col items-end gap-1 min-w-[56px]">
                        <span className="flex w-16 h-5 rounded-lg overflow-hidden border border-gray-200">
                          <span className="flex-1 flex items-center justify-center text-[11px] font-bold text-white bg-green-500" title="Прошли успешно" style={{backgroundColor:'rgba(34,197,94,0.95)'}}>{(() => {
                            const success = vacancy.candidates.filter(c => c.status === 'успешно' || c.status === 'завершено').length;
                            return success;
                          })()}</span>
                          <span className="flex-1 flex items-center justify-center text-[11px] font-bold text-white bg-yellow-300" title="В процессе" style={{color:'#b45309'}}>{(() => {
                            const pending = vacancy.candidates.filter(c => c.status === 'ожидает' || c.status === 'в процессе').length;
                            return pending;
                          })()}</span>
                          <span className="flex-1 flex items-center justify-center text-[11px] font-bold text-white bg-red-400" title="Провалили" style={{backgroundColor:'rgba(239,68,68,0.90)'}}>{(() => {
                            const fail = vacancy.candidates.filter(c => c.status === 'провал' || c.status === 'неуспешно').length;
                            return fail;
                          })()}</span>
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs text-gray-400 font-medium">{vacancy.candidates.length}</span>
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
        <section className="flex-1 flex flex-col bg-gray-50 p-4 pl-0">
          {!selectedVacancy ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">Вакансия не выбрана</div>
          ) : (
            <div className="p-4 flex flex-col gap-6">
              {/* Верхний блок: заголовок и действия */}
              <div className="flex items-center justify-between gap-6 min-h-[44px]">
                <div className="flex-1 flex flex-col">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 truncate" title={selectedVacancy.title}>
                    {selectedVacancy.title}
                  </h2>
                  <div
                    className="text-xs text-gray-500 mt-1 truncate"
                    style={{ minHeight: '20px' }}
                    title={selectedVacancy.topics.join(', ')}
                  >
                    {selectedVacancy.topics.join(', ')}
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <button className="btn-primary min-w-[160px] h-11 text-base flex items-center justify-center" onClick={handleCreateInterview}>Создать интервью</button>
                  <button className="btn-secondary min-w-[160px] h-11 text-base flex items-center justify-center" onClick={handleEdit}>Редактировать</button>
                  <button className="btn-secondary min-w-[160px] h-11 text-base flex items-center justify-center" onClick={() => handleDelete(selectedVacancy.id)}>Удалить</button>
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
                    <div className="font-medium text-base text-left truncate max-w-[420px]" title={selectedVacancy.topics.join(', ')}>{selectedVacancy.topics.join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-normal text-left mb-1">min балл</div>
                    <div className="font-medium text-base text-left pl-2">{selectedVacancy.minScore}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-normal text-left mb-1">Создано</div>
                    <div className="font-medium text-base text-left">{selectedVacancy.createdAt}</div>
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
                    {/* Публичная ссылка и настройки */}
                    <div className="flex items-center gap-2 max-w-[480px] w-full mb-4">
                      <span className="text-xs text-gray-500 whitespace-nowrap">Публичная ссылка</span>
                      {(() => {
                        const interviewId = selectedVacancy.publicLink.split('/').pop();
                        const fullUrl = `${window.location.origin}/interview/${interviewId}`;
                        return (
                          <>
                            <Link
                              to={`/interview/${interviewId}`}
                              className="flex items-center gap-1 text-primary-700 hover:text-primary-900 underline text-xs font-medium px-2 py-1 rounded transition-colors truncate max-w-[400px] w-full"
                              title={fullUrl}
                              onClick={e => e.stopPropagation()}
                            >
                              <Link2 className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{`/interview/${interviewId}`}</span>
                            </Link>
                            <button
                              className="btn-secondary h-7 min-h-0 text-xs px-2 py-0.5 rounded"
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(fullUrl);
                              }}
                            >Скопировать</button>
                          </>
                        );
                      })()}
                    </div>
                    {/* Кандидаты (моки) */}
                    <div>
                      <div className="font-semibold text-gray-900 mb-2">Кандидаты</div>
                      <div className="flex flex-wrap gap-2 mb-2 text-xs text-gray-500">
                        <span>Все {selectedVacancy.candidates.length}</span>
                        <span>Успешные {selectedVacancy.candidates.filter(c=>c.status==='успешно').length}</span>
                        <span>Провал {selectedVacancy.candidates.filter(c=>c.status==='провал').length}</span>
                        <span>Ожидают {selectedVacancy.candidates.filter(c=>c.status==='ожидает').length}</span>
                        <span>Завершено {selectedVacancy.candidates.filter(c=>c.status==='завершено').length}</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {selectedVacancy.candidates.length === 0 ? (
                          <div className="text-gray-400 text-sm">Нет кандидатов</div>
                        ) : (
                          <table className="min-w-full w-full table-fixed text-sm">
                            <thead>
                              <tr className="text-gray-500">
                                <th className="text-left font-normal w-1/2 min-w-[120px] px-2">Имя</th>
                                <th className="text-left font-normal w-1/6 min-w-[70px] px-2">Оценка</th>
                                <th className="text-left font-normal w-1/3 min-w-[90px] px-2">Статус</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedVacancy.candidates.map((c, idx) => (
                                <tr key={idx} className="text-gray-900">
                                  <td className="truncate px-2" title={c.name}>{c.name}</td>
                                  <td className="px-2">{c.score ?? '-'}</td>
                                  <td className="truncate px-2" title={c.status}>{c.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
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