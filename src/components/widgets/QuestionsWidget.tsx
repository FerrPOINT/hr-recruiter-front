import React, { useState, useEffect, useMemo } from 'react';
import { useQuestionsData } from '../../hooks/useWidgetData';
import BaseWidget from './BaseWidget';
import { useNavigate } from 'react-router-dom';
import { createApiClient } from '../../client/apiClient';
import { QuestionsApi } from '../../client/apis/questions-api';
import { Question } from '../widgets/types';
import { 
  HelpCircle, 
  Plus, 
  Filter, 
  Search,
  Edit,
  Copy,
  Trash2,
  Eye,
  MessageSquare,
  FileText,
  CheckCircle,
  Clock
} from 'lucide-react';

interface QuestionsWidgetProps {
  id: string;
  isSelected?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const QuestionsWidget: React.FC<QuestionsWidgetProps> = ({
  id,
  isSelected,
  onClick,
  onClose,
  onRefresh,
  onMouseDown
}) => {
  const navigate = useNavigate();
  const { data: questions, loading, error, refresh } = useQuestionsData();
  
  // Обработчик обновления
  const handleRefresh = () => {
    console.log('[QuestionsWidget] Refresh triggered');
    refresh(); // Внутренний refresh из хука
    onRefresh?.(); // Внешний refresh из пропсов
  };
  
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'stats'>('list');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'text' | 'type' | 'date'>('date');
  const [questionStats, setQuestionStats] = useState<any>({});
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  // Вычисляем статистику вопросов
  useEffect(() => {
    const stats = {
      total: questions.length,
      text: questions.filter((q: any) => q.type === 'text').length,
      audio: questions.filter((q: any) => q.type === 'audio').length,
      video: questions.filter((q: any) => q.type === 'video').length,
      choice: questions.filter((q: any) => q.type === 'choice').length,
      byPosition: {} as Record<number, number>
    };

    // Группируем по позициям
    questions.forEach((question: any) => {
      if ('positionId' in question && question.positionId) {
        stats.byPosition[question.positionId] = (stats.byPosition[question.positionId] || 0) + 1;
      }
    });

    setQuestionStats(stats);
  }, [questions]);

  // Фильтрация и сортировка вопросов
  const filteredQuestions = useMemo(() => {
    let filtered = questions.filter((question: any) => {
      if (typeFilter !== 'all' && question.type !== typeFilter) return false;
      if (searchQuery && !question.text?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    // Сортировка
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'text':
          return (a.text || '').localeCompare(b.text || '');
        case 'type':
          return (a.type || '').localeCompare(b.type || '');
        case 'date':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    return filtered.slice(0, 8); // Показываем максимум 8 вопросов
  }, [questions, typeFilter, searchQuery, sortBy]);

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
  };

  const handleAddQuestion = () => {
    navigate('/admin/questions/add');
  };

  const handleEditQuestion = (questionId: number) => {
    navigate(`/admin/questions/edit/${questionId}`);
  };

  const handleDuplicateQuestion = (question: Question) => {
    // Логика дублирования вопроса
    console.log('Duplicate question:', question);
  };

  const handleDeleteQuestion = (questionId: number) => {
    // Логика удаления вопроса
    console.log('Delete question:', questionId);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'audio': return 'bg-green-100 text-green-800 border-green-200';
      case 'video': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'choice': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-3 h-3" />;
      case 'audio': return <MessageSquare className="w-3 h-3" />;
      case 'video': return <HelpCircle className="w-3 h-3" />;
      case 'choice': return <Edit className="w-3 h-3" />;
      default: return <HelpCircle className="w-3 h-3" />;
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
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
      title="Вопросы интервью"
      subtitle={`${questionStats.total || 0} вопросов`}
      loading={loading}
      error={error}

      className="min-w-[700px] min-h-[500px]"
    >
      <div className="flex flex-col h-full">
        {/* Статистика вопросов */}
        <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{questionStats.total || 0}</div>
            <div className="text-xs text-gray-600">Всего вопросов</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{questionStats.text || 0}</div>
            <div className="text-xs text-gray-600">Текстовых</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{questionStats.audio || 0}</div>
            <div className="text-xs text-gray-600">Аудио</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{questionStats.choice || 0}</div>
            <div className="text-xs text-gray-600">Выборочных</div>
          </div>
        </div>

        {/* Фильтры и поиск */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск вопросов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Все типы</option>
            <option value="text">Текстовые</option>
            <option value="audio">Аудио</option>
            <option value="video">Видео</option>
            <option value="choice">Выборочные</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="date">По дате</option>
            <option value="text">По тексту</option>
            <option value="type">По типу</option>
          </select>
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 py-1 text-sm ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'bg-white'}`}
            >
              Список
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 py-1 text-sm ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'bg-white'}`}
            >
              Сетка
            </button>
            <button
              onClick={() => setViewMode('stats')}
              className={`px-2 py-1 text-sm ${viewMode === 'stats' ? 'bg-purple-500 text-white' : 'bg-white'}`}
            >
              Статистика
            </button>
          </div>
        </div>

        {/* Содержимое */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'list' && (
            <div className="space-y-2 overflow-y-auto h-full">
              {filteredQuestions.map((question: any) => (
                <div
                  key={question.id}
                  onClick={() => handleQuestionClick(question)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedQuestion?.id === question.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getTypeColor(question.type || '')}`}>
                          <div className="flex items-center space-x-1">
                            {getTypeIcon(question.type || '')}
                            <span>{question.type}</span>
                          </div>
                        </span>
                        {'positionId' in question && question.positionId && (
                          <span className="text-xs text-gray-500">Позиция #{question.positionId}</span>
                        )}
                      </div>
                      <div className="text-sm font-medium mb-1">
                        {truncateText(question.text || '', 120)}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Создан {new Date(question.createdAt || '').toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditQuestion(question.id || 0);
                        }}
                        className="p-1 hover:bg-purple-100 rounded text-purple-600"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateQuestion(question);
                        }}
                        className="p-1 hover:bg-blue-100 rounded text-blue-600"
                        title="Дублировать"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQuestion(question.id || 0);
                        }}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 gap-3 overflow-y-auto h-full">
              {filteredQuestions.map((question: any) => (
                <div
                  key={question.id}
                  onClick={() => handleQuestionClick(question)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedQuestion?.id === question.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    {getTypeIcon(question.type || '')}
                    <span className={`px-2 py-1 text-xs rounded-full border ${getTypeColor(question.type || '')}`}>
                      {question.type}
                    </span>
                  </div>
                  <div className="text-sm font-medium mb-2">
                    {truncateText(question.text || '', 80)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(question.createdAt || '').toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'stats' && (
            <div className="space-y-4 overflow-y-auto h-full">
              {/* Распределение по типам */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-3">Распределение по типам</h3>
                <div className="space-y-2">
                  {Object.entries({
                    text: questionStats.text || 0,
                    audio: questionStats.audio || 0,
                    video: questionStats.video || 0,
                    choice: questionStats.choice || 0,
                  }).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(type)}
                        <span className="text-sm">{type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${(Number(count) / questionStats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{Number(count)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Вопросы по позициям */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-3">Вопросы по позициям</h3>
                <div className="space-y-2">
                  {Object.entries(questionStats.byPosition || {}).map(([positionId, count]) => (
                    <div key={positionId} className="flex items-center justify-between">
                      <span className="text-sm">Позиция #{positionId}</span>
                      <span className="text-sm font-medium">{Number(count)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Быстрые действия */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Показано {filteredQuestions.length} из {questions.length} вопросов</span>
            <div className="flex space-x-2">
              <button
                onClick={handleAddQuestion}
                className="flex items-center space-x-1 px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                <Plus className="w-3 h-3" />
                <span>Добавить</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

export default QuestionsWidget; 