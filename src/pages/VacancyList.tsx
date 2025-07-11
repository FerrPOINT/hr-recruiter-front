import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, Link2, Copy, CheckCircle, Clock, AlertCircle, ChevronDown, Filter, Eye, Edit, Trash2, Users, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../services/apiService';
import { useVacanciesData } from '../hooks/usePageData';
import VacancyModal from '../components/VacancyModal';
import type { Position } from '../client/models/position';
import type { Interview } from '../client/models/interview';
import type { Candidate } from '../client/models/candidate';
import type { Question } from '../client/models/question';
import { PositionStatusEnum } from '../client/models/position-status-enum';
import { VacancyListSkeleton } from '../components/SkeletonLoader';
import { StrictCard } from '../components/StrictCard';

// Функция для форматирования дат
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
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

// Мини-компонент бейджа
const Badge = ({ color, children }: { color: string; children: React.ReactNode }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>{children}</span>
);

const VacancyList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Модальное окно
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<Position | null>(null);

  // Используем новый упрощенный хук
  const { positions, interviews, stats, questions, loading, error, refresh } = useVacanciesData({
    search: searchTerm || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter
  });

  // Memoize filtered positions
  const filteredPositions = useMemo(() => {
    let filtered = positions;
    if (searchTerm) {
      filtered = filtered.filter((p: any) => (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p: any) => p.status === statusFilter);
    }
    return filtered;
  }, [positions, searchTerm, statusFilter]);

  const selectedPosition = useMemo(() =>
    positions.find((p: any) => p.id === selectedId) || null,
    [positions, selectedId]
  );

  const handleSelectVacancy = useCallback((id: number) => {
    setSelectedId(id);
  }, []);

  const handleCreateVacancy = () => {
    setSelectedVacancy(null);
    setIsModalOpen(true);
  };

  const handleEditVacancy = (vacancy: Position) => {
    setSelectedVacancy(vacancy);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    refresh();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedVacancy(null);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Ссылка скопирована!');
  };

  // Helper renderers
  const getStatus = (status: string) => {
    switch (status) {
      case 'active': return { text: 'Активна', color: 'bg-green-100 text-green-800' };
      case 'paused': return { text: 'Пауза', color: 'bg-yellow-100 text-yellow-800' };
      case 'archived': return { text: 'Архив', color: 'bg-gray-100 text-gray-800' };
      default: return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getLevel = (level: string) => {
    switch (level) {
      case 'junior': return { text: 'Junior', color: 'bg-gray-200 text-gray-700' };
      case 'middle': return { text: 'Middle', color: 'bg-gray-200 text-gray-700' };
      case 'senior': return { text: 'Senior', color: 'bg-gray-200 text-gray-700' };
      case 'lead': return { text: 'Lead', color: 'bg-gray-200 text-gray-700' };
      default: return { text: level, color: 'bg-gray-100 text-gray-800' };
    }
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
    <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-120px)]">
      {/* Левая панель: список */}
      <div className="md:w-1/3 w-full flex flex-col bg-white rounded-lg border h-full min-w-[260px] max-w-md">
        <div className="flex items-center gap-2 p-2 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Поиск..." className="w-full pl-8 pr-2 py-1.5 text-sm rounded border border-gray-200 focus:ring-1 focus:ring-primary-500" />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2 py-1.5 text-xs rounded border border-gray-200"
          >
            <option value="all">Все</option>
            <option value="active">Активные</option>
            <option value="paused">Пауза</option>
            <option value="archived">Архив</option>
          </select>
          <button onClick={handleCreateVacancy} className="ml-1 p-1.5 rounded hover:bg-primary-50" title="Создать вакансию">
            <Plus className="w-4 h-4 text-primary-600" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto divide-y">
          {loading ? <div className="flex flex-col gap-2 p-4 text-gray-400">Загрузка...</div> :
            filteredPositions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400"><Users className="w-8 h-8 mb-2" />Нет вакансий</div>
            ) : (
              filteredPositions.map((p: any) => {
                const status = getStatus(p.status);
                const level = p.level ? getLevel(p.level) : null;
                return (
                  <button key={p.id} onClick={() => handleSelectVacancy(p.id)} className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-primary-50 ${selectedId === p.id ? 'bg-primary-100 border-l-4 border-primary-500' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate text-sm">{p.title}</span>
                        <Badge color={status.color}>{status.text}</Badge>
                        {level && <Badge color={level.color}>{level.text}</Badge>}
                      </div>
                      {p.topics && p.topics.length > 0 && <div className="text-xs text-gray-500 truncate">{p.topics.join(', ')}</div>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                );
              })
            )
          }
        </div>
      </div>
      {/* Правая панель: детали */}
      <div className="md:w-2/3 w-full flex flex-col h-full">
        <div className="flex-1 overflow-y-auto bg-white rounded-lg border p-6">
          {!selectedPosition ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400"><ChevronLeft className="w-8 h-8 mb-2" />Выберите вакансию слева</div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Заголовок и действия */}
              <div className="flex items-center gap-3 justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">{selectedPosition.title}</span>
                  <Badge color={getStatus(selectedPosition.status).color}>{getStatus(selectedPosition.status).text}</Badge>
                  {selectedPosition.level && <Badge color={getLevel(selectedPosition.level).color}>{getLevel(selectedPosition.level).text}</Badge>}
                </div>
                <div className="flex gap-1">
                                  <button onClick={() => handleCopyLink(`${window.location.origin}/admin/vacancies/${selectedPosition.id}`)} className="p-1.5 rounded hover:bg-gray-100" title="Скопировать ссылку"><Link2 className="w-4 h-4" /></button>
                <Link to={`/admin/vacancies/${selectedPosition.id}`} className="p-1.5 rounded hover:bg-gray-100" title="Просмотр"><Eye className="w-4 h-4" /></Link>
                  <button onClick={() => handleEditVacancy(selectedPosition)} className="p-1.5 rounded hover:bg-gray-100" title="Редактировать"><Edit className="w-4 h-4" /></button>
                  <button className="p-1.5 rounded hover:bg-red-50" title="Удалить"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              </div>
              {/* Описание */}
              {selectedPosition.description && <div className="text-sm text-gray-600 border-l-2 border-primary-200 pl-3">{selectedPosition.description}</div>}
              {/* Мета-данные */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                <div>Создана: {formatDate(selectedPosition.createdAt)}</div>
                <div>Обновлена: {formatDate(selectedPosition.updatedAt)}</div>
                <div>Время ответа: {selectedPosition.answerTime ? `${Math.floor(selectedPosition.answerTime / 60)} мин` : '—'}</div>
                <div>Мин. оценка: {selectedPosition.minScore || '—'}</div>
                <div>Язык: {selectedPosition.language || '—'}</div>
                <div>Вопросов: {Array.isArray(questions) ? questions.filter((q: any) => q.positionId === selectedPosition.id).length : 0}</div>
              </div>
              {/* Топики */}
              {selectedPosition.topics && selectedPosition.topics.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedPosition.topics.map((topic: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">{topic}</span>
                  ))}
                </div>
              )}
              {/* Теги */}
              {selectedPosition.tags && selectedPosition.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedPosition.tags.map((tag: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">{tag}</span>
                  ))}
                </div>
              )}
              {/* Настройки */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <input type="checkbox" checked={selectedPosition.saveAudio} disabled className="w-3 h-3" />
                  <span>Сохранять аудио</span>
                </div>
                <div className="flex items-center gap-1">
                  <input type="checkbox" checked={selectedPosition.saveVideo} disabled className="w-3 h-3" />
                  <span>Сохранять видео</span>
                </div>
                <div className="flex items-center gap-1">
                  <input type="checkbox" checked={selectedPosition.randomOrder} disabled className="w-3 h-3" />
                  <span>Случайный порядок</span>
                </div>
                <div className="flex items-center gap-1">
                  <input type="checkbox" checked={selectedPosition.inviteNext} disabled className="w-3 h-3" />
                  <span>Приглашать на этап</span>
                </div>
              </div>
              {/* Статистика */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{interviews.filter((i: any) => i.positionId === selectedPosition.id).length}</div>
                  <div className="text-xs text-gray-500">Собеседований</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{interviews.filter((i: any) => i.positionId === selectedPosition.id && i.status === 'finished').length}</div>
                  <div className="text-xs text-gray-500">Завершено</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{interviews.filter((i: any) => i.positionId === selectedPosition.id && i.status === 'in_progress').length}</div>
                  <div className="text-xs text-gray-500">В процессе</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно */}
      <VacancyModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        vacancy={selectedVacancy}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default VacancyList; 
