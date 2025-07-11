import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Sparkles, Save, Loader2, Trash2, RefreshCw, GripVertical, ChevronDown } from 'lucide-react';
import { apiService } from '../services/apiService';
import { Position, PositionStatusEnum, PositionLevelEnum, QuestionTypeEnum } from '../client/models';
import toast from 'react-hot-toast';
import { usePagesStore } from '../store/pagesStore';
import { useAuthStore } from '../store/authStore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Question {
  id: string;
  text: string;
  evaluationCriteria: string;
}

interface VacancyCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacancy?: Position | null;
  onSuccess: () => void;
}

interface VacancyForm {
  title: string;
  status: PositionStatusEnum;
  description: string;
  topics: string[];
  language: string;
  showOtherLang: boolean;
  tags: string[];
  minScore: number;
  answerTime: number;
  level: PositionLevelEnum;
  saveAudio: boolean;
  saveVideo: boolean;
  randomOrder: boolean;
  questionType: string;
  questionsCount: number;
  checkType: string;
}

// Словарь для статуса вакансии
const vacancyStatusMap: Record<PositionStatusEnum, { text: string; color: string }> = {
  active: { text: 'Активная', color: 'text-green-600' },
  paused: { text: 'Пауза', color: 'text-yellow-600' },
  archived: { text: 'Архив', color: 'text-gray-600' },
};

// Словарь для уровня позиции
const levelMap: Record<PositionLevelEnum, { text: string; color: string }> = {
  junior: { text: 'Junior', color: 'text-blue-600' },
  middle: { text: 'Middle', color: 'text-green-600' },
  senior: { text: 'Senior', color: 'text-purple-600' },
  lead: { text: 'Lead', color: 'text-orange-600' },
};

// Sortable Question Card Component
const SortableQuestionCard: React.FC<{
  question: Question;
  index: number;
  onUpdate: (id: string, field: 'text' | 'evaluationCriteria', value: string) => void;
  onRegenerate: (id: string) => void;
  onRemove: (id: string) => void;
  isRegenerating: boolean;
}> = ({ question, index, onUpdate, onRegenerate, onRemove, isRegenerating }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start gap-4">
        {/* Drag handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="pt-2 cursor-move text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        
        {/* Question content */}
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Вопрос #{index + 1}
            </label>
            <textarea
              value={question.text}
              onChange={e => onUpdate(question.id, 'text', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
              rows={4}
              placeholder="Введите вопрос..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Критерии оценки
            </label>
            <textarea
              value={question.evaluationCriteria}
              onChange={e => onUpdate(question.id, 'evaluationCriteria', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={2}
              placeholder="Укажите критерии оценки ответа..."
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-2 w-40 flex-shrink-0">
          <button
            type="button"
            onClick={() => onRegenerate(question.id)}
            disabled={isRegenerating}
            className="w-full justify-center text-sm px-3 py-2 flex items-center gap-2 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Генерация...' : 'Перегенерировать'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => onRemove(question.id)}
            className="w-full justify-center text-sm px-3 py-2 flex items-center gap-2 rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Удалить</span>
          </button>
        </div>
      </div>
    </div>
  );
};



const VacancyCreateModal: React.FC<VacancyCreateModalProps> = ({
  isOpen,
  onClose,
  vacancy,
  onSuccess
}) => {
  const { setModalOpen } = usePagesStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [regeneratingQuestion, setRegeneratingQuestion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'questions' | 'advanced'>('basic');
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [generationInput, setGenerationInput] = useState('');
  const [isGenerationExpanded, setIsGenerationExpanded] = useState(false);
  
  // Форма вакансии
  const [form, setForm] = useState<VacancyForm>({
    title: '',
    status: PositionStatusEnum.active,
    description: '',
    topics: [],
    language: 'Русский',
    showOtherLang: false,
    tags: [],
    minScore: 5,
    answerTime: 150,
    level: PositionLevelEnum.middle,
    saveAudio: false,
    saveVideo: false,
    randomOrder: false,
    questionType: 'В основном хард-скиллы',
    questionsCount: 5,
    checkType: '',
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  // FOOTER_HEIGHT используется только для spacer

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Управление состоянием модального окна в store
  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen, setModalOpen]);

  // Обработка клавиши Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showCloseConfirm) {
          handleCancelClose();
        } else {
          handleClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, showCloseConfirm]);

  // Инициализация формы
  useEffect(() => {
    if (isOpen && vacancy) {
      const formData: VacancyForm = {
        title: vacancy.title || '',
        status: vacancy.status || PositionStatusEnum.active,
        description: vacancy.description || '',
        topics: vacancy.topics || [],
        language: vacancy.language || 'Русский',
        showOtherLang: vacancy.showOtherLang || false,
        tags: vacancy.tags || [],
        minScore: vacancy.minScore || 5,
        answerTime: vacancy.answerTime || 150,
        level: vacancy.level || PositionLevelEnum.middle,
        saveAudio: vacancy.saveAudio || false,
        saveVideo: vacancy.saveVideo || false,
        randomOrder: vacancy.randomOrder || false,
        questionType: vacancy.questionType || 'В основном хард-скиллы',
        questionsCount: vacancy.questionsCount || 5,
        checkType: vacancy.checkType || '',
      };
      setForm(formData);
      
      // Загружаем вопросы
      loadQuestions();
    } else if (isOpen && !vacancy) {
      // Сброс формы для новой вакансии
      const defaultForm: VacancyForm = {
        title: '',
        status: PositionStatusEnum.active,
        description: '',
        topics: [],
        language: 'Русский',
        showOtherLang: false,
        tags: [],
        minScore: 5,
        answerTime: 150,
        level: PositionLevelEnum.middle,
        saveAudio: false,
        saveVideo: false,
        randomOrder: false,
        questionType: 'В основном хард-скиллы',
        questionsCount: 5,
        checkType: '',
      };
      setForm(defaultForm);
      setQuestions([]);
      setGenerationInput('');
    }
  }, [isOpen, vacancy]);

  const loadQuestions = async () => {
    if (!vacancy?.id) return;
    
    try {
      const questionsData = await apiService.getQuestions(vacancy.id);
      if (questionsData.questions) {
        setQuestions(questionsData.questions.map((q: any) => ({
          id: q.id?.toString() || Math.random().toString(36).substr(2, 9),
          text: q.text || '',
          evaluationCriteria: q.evaluationCriteria || ''
        })));
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setForm(prev => {
      const updatedForm = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Если изменилось название вакансии, добавляем его в теги для поиска
      if (name === 'title' && value.trim()) {
        const titleTag = value.trim();
        const existingTags = prev.tags || [];
        
        // Проверяем, есть ли уже такой тег
        if (!existingTags.includes(titleTag)) {
          // Добавляем название в начало списка тегов
          updatedForm.tags = [titleTag, ...existingTags.filter(tag => tag !== titleTag)];
        }
      }
      
      return updatedForm;
    });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      evaluationCriteria: ''
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestion = (id: string, field: 'text' | 'evaluationCriteria', value: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const regenerateQuestion = async (questionId: string) => {
    if (!generationInput.trim() && !form.description.trim()) {
      toast.error('Введите описание вакансии для генерации вопроса');
      return;
    }

    setRegeneratingQuestion(questionId);
    try {
      const result = await apiService.generatePosition(
        generationInput.trim() || form.description, 
        1, 
        form.questionType
      );
      
      if (result && result.questions && result.questions.length > 0) {
        const newText = result.questions[0].text;
        updateQuestion(questionId, 'text', newText);
        toast.success('Вопрос сгенерирован');
      }
    } catch (error: any) {
      console.error('Error regenerating question:', error);
      toast.error('Ошибка при генерации вопроса');
    } finally {
      setRegeneratingQuestion(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setQuestions(questions => {
        const oldIndex = questions.findIndex(q => q.id === active.id);
        const newIndex = questions.findIndex(q => q.id === over.id);
        
        return arrayMove(questions, oldIndex, newIndex);
      });
    }
  };

  const generatePositionWithRetry = async (description: string, questionsCount: number, questionType: string) => {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await apiService.generatePosition(description, questionsCount, questionType);
        return result;
      } catch (error: any) {
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  };

  const handleGenerateQuestions = async () => {
    if (!generationInput.trim()) {
      toast.error('Введите описание вакансии для генерации');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generatePositionWithRetry(
        generationInput,
        form.questionsCount,
        form.questionType
      );
      
      if (result) {
        // Заполняем все поля из ответа API
        if (result.title) {
          setForm(prev => {
            const titleTag = result.title.trim();
            const existingTags = prev.tags || [];
            
            // Добавляем название вакансии в теги для поиска, если его там нет
            const updatedTags = existingTags.includes(titleTag) 
              ? existingTags 
              : [titleTag, ...existingTags];
            
            return { 
              ...prev, 
              title: result.title,
              tags: updatedTags
            };
          });
        }
        if (result.description !== undefined) {
          setForm(prev => ({ ...prev, description: result.description || '' }));
        }
        if (result.topics && result.topics.length > 0) {
          setForm(prev => ({ ...prev, topics: result.topics }));
        }
        if (result.level) {
          setForm(prev => ({ ...prev, level: result.level }));
        }
        
        // Преобразуем вопросы AI в формат компонента
        if (result.questions && result.questions.length > 0) {
          const newQuestions = result.questions.map((q: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            text: q.text || '',
            evaluationCriteria: q.evaluationCriteria || ''
          }));
          
          setQuestions(newQuestions);
        }
        
        toast.success('Вакансия сгенерирована');
      }
    } catch (error: any) {
      console.error('Error generating position:', error);
      toast.error('Ошибка при генерации вакансии');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      toast.error('Введите название вакансии');
      return;
    }

    if (!form.description.trim()) {
      toast.error('Введите описание вакансии');
      return;
    }

    if (questions.length === 0) {
      toast.error('Добавьте хотя бы один вопрос');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔍 handleSubmit - Starting with token:', useAuthStore.getState().token ? 'present' : 'missing');
      
      const vacancyData = {
        ...form,
        topics: form.topics.filter(t => t.trim()),
        tags: form.tags.filter(t => t.trim()),
      };

      if (vacancy?.id) {
        // Обновление существующей вакансии
        console.log('🔍 handleSubmit - Updating existing vacancy');
        await apiService.updatePosition(vacancy.id, vacancyData);
        toast.success('Вакансия обновлена');
      } else {
        // Создание новой вакансии
        console.log('🔍 handleSubmit - Creating new vacancy');
        const newVacancy = await apiService.createPosition(vacancyData);
        console.log('🔍 handleSubmit - Vacancy created, ID:', newVacancy.id);
        
        // Сохраняем вопросы
        if (newVacancy.id) {
          console.log('🔍 handleSubmit - Creating questions, count:', questions.length);
          
          // Принудительно обновляем API клиент перед созданием вопросов
          apiService.refreshApiClient();
          console.log('🔍 handleSubmit - API client refreshed before creating questions');
          
          for (const question of questions) {
            console.log('🔍 handleSubmit - Creating question:', question.text.substring(0, 50) + '...');
            await apiService.createQuestion(newVacancy.id, {
              text: question.text,
              evaluationCriteria: question.evaluationCriteria,
              type: QuestionTypeEnum.text,
              order: questions.indexOf(question) + 1,
              isRequired: true
            });
          }
          console.log('🔍 handleSubmit - All questions created successfully');
        }
        
        toast.success('Вакансия создана');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('🔍 handleSubmit - Error saving vacancy:', error);
      console.error('🔍 handleSubmit - Error response:', error.response?.status, error.response?.data);
      toast.error('Ошибка при сохранении вакансии');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Проверяем, есть ли изменения в форме
    const hasChanges = form.title.trim() || 
                      form.description.trim() || 
                      generationInput.trim() ||
                      questions.length > 0 ||
                      form.topics.length > 0 ||
                      form.tags.length > 0 ||
                      form.language !== 'Русский' ||
                      form.answerTime !== 150 ||
                      form.minScore !== 5 ||
                      form.questionsCount !== 5 ||
                      form.questionType !== 'В основном хард-скиллы' ||
                      form.level !== PositionLevelEnum.middle ||
                      form.status !== PositionStatusEnum.active ||
                      form.showOtherLang ||
                      form.saveAudio ||
                      form.saveVideo ||
                      form.randomOrder;
    
    if (hasChanges) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowCloseConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {vacancy ? 'Редактировать вакансию' : 'Создать вакансию'}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex-shrink-0 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'basic', label: 'Основные настройки' },
              { id: 'questions', label: 'Вопросы' },
              { id: 'advanced', label: 'Дополнительные настройки' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <form className="h-full flex flex-col" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
            <div
              ref={scrollRef}
              className="flex-1 min-h-0 overflow-y-auto px-8 py-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Основные настройки Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
                  {/* Генерация вакансии */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsGenerationExpanded(!isGenerationExpanded)}>
                      <h4 className="text-lg font-medium text-gray-900">Генерация вакансии</h4>
                      <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isGenerationExpanded ? 'rotate-180' : ''}`} />
                    </div>
                    
                    {isGenerationExpanded && (
                      <div className="space-y-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Описание для генерации вакансии
                          </label>
                          <textarea
                            value={generationInput}
                            onChange={(e) => setGenerationInput(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                            placeholder="Вставьте описание вакансии из любого источника (HH.ru, LinkedIn, и т.д.) или напишите своими словами..."
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Количество вопросов
                            </label>
                            <input
                              type="number"
                              name="questionsCount"
                              value={form.questionsCount}
                              onChange={handleChange}
                              min="1"
                              max="20"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Тип вопросов
                            </label>
                            <select
                              name="questionType"
                              value={form.questionType}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                              <option value="В основном хард-скиллы">В основном хард-скиллы</option>
                              <option value="Хард и софт-скиллы поровну">Хард и софт-скиллы поровну</option>
                              <option value="В основном софт-скиллы">В основном софт-скиллы</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={handleGenerateQuestions}
                              disabled={isGenerating || !generationInput.trim()}
                              className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Sparkles className="h-4 w-4 mr-2" />
                              {isGenerating ? 'Генерация...' : 'Сгенерировать'}
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          Вставьте описание вакансии из любого источника и нажмите "Сгенерировать"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Сгенерированные поля */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Название вакансии *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Название будет сгенерировано автоматически"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Описание вакансии *
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={9}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                        placeholder="Описание будет сгенерировано автоматически"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ключевые темы/навыки
                      </label>
                      <input
                        type="text"
                        name="topics"
                        value={form.topics.join(', ')}
                        onChange={(e) => setForm(prev => ({
                          ...prev,
                          topics: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Темы будут сгенерированы автоматически"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Уровень позиции
                        </label>
                        <select
                          name="level"
                          value={form.level}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          {Object.entries(levelMap).map(([key, value]) => (
                            <option key={key} value={key}>
                              {value.text}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Время на ответ (сек)
                        </label>
                        <input
                          type="number"
                          name="answerTime"
                          value={form.answerTime}
                          onChange={handleChange}
                          min="30"
                          max="600"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Минимальный балл
                        </label>
                        <input
                          type="number"
                          name="minScore"
                          value={form.minScore}
                          onChange={handleChange}
                          min="1"
                          max="10"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Вопросы Tab */}
              {activeTab === 'questions' && (
                <div className="space-y-8" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">Вопросы для собеседования</h4>
                      <button
                        type="button"
                        onClick={addQuestion}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить вручную
                      </button>
                    </div>

                    {questions.length === 0 ? (
                      <div className="text-center py-12" onClick={(e) => e.stopPropagation()}>
                        <Sparkles className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Нет вопросов</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Сгенерируйте вакансию автоматически или добавьте вопросы вручную
                        </p>
                      </div>
                    ) : (
                      <div onClick={(e) => e.stopPropagation()}>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={questions.map(q => q.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {questions.map((question, index) => (
                              <SortableQuestionCard
                                key={question.id}
                                question={question}
                                index={index}
                                onUpdate={updateQuestion}
                                onRegenerate={regenerateQuestion}
                                onRemove={removeQuestion}
                                isRegenerating={regeneratingQuestion === question.id}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Дополнительные настройки Tab */}
              {activeTab === 'advanced' && (
                <div className="space-y-8" onClick={(e) => e.stopPropagation()}>
                  {/* Основные параметры */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Статус
                      </label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        {Object.entries(vacancyStatusMap).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value.text}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Язык собеседования
                      </label>
                      <select
                        name="language"
                        value={form.language}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="Русский">Русский</option>
                        <option value="English">English</option>
                      </select>
                    </div>
                  </div>

                  {/* Теги для поиска */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Теги для поиска
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={form.tags.join(', ')}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Название вакансии будет добавлено автоматически"
                    />
                  </div>

                  {/* Дополнительные опции */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">Дополнительные опции</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="showOtherLang"
                          checked={form.showOtherLang}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Показывать результаты на другом языке
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="saveAudio"
                          checked={form.saveAudio}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Сохранять аудио
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="saveVideo"
                          checked={form.saveVideo}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Сохранять видео
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="randomOrder"
                          checked={form.randomOrder}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Случайный порядок вопросов
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="flex-shrink-0 bg-gray-50 px-8 py-6 flex items-center justify-end border-t border-gray-200 h-20 rounded-b-lg space-x-3" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            aria-label="Отмена"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            aria-label="Сохранить"
            onClick={handleSubmit}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </>
            )}
          </button>
        </div>
        
        {/* Loading Overlay */}
        {(isGenerating || isLoading) && (
          <div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-70 cursor-wait"
            aria-busy="true"
            aria-disabled="true"
            tabIndex={-1}
          >
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
            <span className="text-lg text-gray-700 font-medium">
              {isGenerating ? 'Генерация вакансии...' : 'Сохранение...'}
            </span>
          </div>
        )}
      </div>

      {/* Модальное окно подтверждения закрытия */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-[60] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center min-h-screen px-4 py-4" onClick={(e) => e.stopPropagation()}>
            {/* Затемненная область для закрытия */}
            <div className="fixed inset-0 transition-opacity pointer-events-auto" aria-hidden="true" onClick={handleCancelClose}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-md pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Подтверждение закрытия
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Вы уверены, что хотите закрыть окно? Все несохраненные изменения будут потеряны.
                </p>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmClose}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacancyCreateModal; 