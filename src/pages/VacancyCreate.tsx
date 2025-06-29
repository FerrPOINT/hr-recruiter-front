import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, RefreshCw, GripVertical } from 'lucide-react';
import { apiService } from '../services/apiService';
import { authService } from '../services/authService';
import { PositionStatusEnum } from '../client/models/position-status-enum';
import { QuestionTypeEnum } from '../client/models/question-type-enum';
import toast from 'react-hot-toast';
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

// Словарь для статуса вакансии (единственное число)
const vacancyStatusMap: Record<PositionStatusEnum, { text: string; color: string }> = {
  active: { text: 'Активная', color: 'text-green-600' },
  paused: { text: 'Пауза', color: 'text-yellow-600' },
  archived: { text: 'Архив', color: 'text-gray-600' },
};

interface Question {
  id: string;
  text: string;
  evaluationCriteria: string;
}

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
      className="border-b border-gray-200 last:border-b-0 py-6"
    >
      <div className="flex items-start gap-4">
        {/* Drag handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="pt-2.5 cursor-move text-gray-400"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        
        {/* Question content */}
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Вопрос #{index + 1}
            </label>
            <textarea
              value={question.text}
              onChange={e => onUpdate(question.id, 'text', e.target.value)}
              className="input-field w-full resize-none"
              rows={3}
              placeholder="Введите вопрос..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Основные моменты для оценки
            </label>
            <textarea
              value={question.evaluationCriteria}
              onChange={e => onUpdate(question.id, 'evaluationCriteria', e.target.value)}
              className="input-field w-full resize-none"
              rows={2}
              placeholder="Укажите критерии оценки ответа..."
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-2 w-48 flex-shrink-0">
          <button
            type="button"
            onClick={() => onRegenerate(question.id)}
            disabled={isRegenerating}
            className="w-full justify-center text-sm px-3 py-2 flex items-center gap-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-blue-600 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Генерация...' : 'Перегенерировать'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => onRemove(question.id)}
            className="w-full justify-center text-sm px-3 py-2 flex items-center gap-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Удалить</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const VacancyCreate: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Табы формы
  // const [tab, setTab] = useState<'details' | 'company'>('details');
  
  // Основные поля формы
  const [form, setForm] = useState({
    title: '',
    status: 'active' as PositionStatusEnum,
    topics: [] as string[],
    language: 'Русский',
    showOtherLang: false,
    tags: [] as string[],
    minScore: 5,
    inviteNext: false,
    answerTime: 150,
    level: 'middle',
    saveAudio: false,
    saveVideo: false,
    randomOrder: false,
    description: '',
    questionType: 'В основном хард-скиллы',
    questionsCount: 5,
    checkType: '',
  });
  
  // Вопросы с критериями оценки
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenLoading, setIsGenLoading] = useState(false);
  const [regeneratingQuestion, setRegeneratingQuestion] = useState<string | null>(null);

  // Логируем изменения в вопросах
  useEffect(() => {
    console.log('Questions state updated:', questions);
  }, [questions]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Если пришли данные для редактирования
  useEffect(() => {
    // @ts-ignore
    const vacancy = location.state?.vacancy;
    if (vacancy) {
      console.log('Editing vacancy:', vacancy);
      setForm({
        title: vacancy.title || '',
        status: vacancy.status || 'active',
        topics: vacancy.topics || [],
        language: vacancy.language || 'Русский',
        showOtherLang: vacancy.showOtherLang || false,
        tags: vacancy.tags || [],
        minScore: vacancy.minScore || 5,
        inviteNext: vacancy.inviteNext || false,
        answerTime: vacancy.answerTime || 150,
        level: vacancy.level || 'middle',
        saveAudio: vacancy.saveAudio || false,
        saveVideo: vacancy.saveVideo || false,
        randomOrder: vacancy.randomOrder || false,
        description: vacancy.description || '',
        questionType: vacancy.questionType || 'В основном хард-скиллы',
        questionsCount: vacancy.questionsCount || 5,
        checkType: vacancy.checkType || '',
      });
      
      // Всегда загружаем вопросы при редактировании, если есть ID вакансии
      if (vacancy.id) {
        console.log('Loading questions for vacancy ID:', vacancy.id);
        (async () => {
          try {
            const qs = await apiService.getQuestions(vacancy.id);
            console.log('Loaded questions:', qs);
            
            if (qs.questions && qs.questions.length > 0) {
              const mappedQuestions = qs.questions.map((q: any) => ({
                id: q.id?.toString() || Math.random().toString(36).substr(2, 9),
                text: q.text,
                evaluationCriteria: q.evaluationCriteria || 'Оценить глубину знаний, практический опыт, способность объяснять сложные концепции'
              }));
              console.log('Mapped questions:', mappedQuestions);
              setQuestions(mappedQuestions);
            } else {
              console.log('No questions found for this vacancy');
              setQuestions([]);
            }
          } catch (error) {
            console.error('Error loading questions:', error);
            toast.error('Ошибка загрузки вопросов');
            setQuestions([]);
          }
        })();
      }
    }
  }, [location.state]);

  // Обработчики формы
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : value
    }));
  };

  // Добавить/удалить/обновить вопрос
  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      evaluationCriteria: 'Оценить глубину знаний, практический опыт, способность объяснять сложные концепции'
    };
    setQuestions(qs => [...qs, newQuestion]);
  };

  const updateQuestion = (id: string, field: 'text' | 'evaluationCriteria', value: string) => {
    setQuestions(qs => qs.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(qs => qs.filter(q => q.id !== id));
  };

  // Перегенерировать отдельный вопрос
  const regenerateQuestion = async (questionId: string) => {
    setRegeneratingQuestion(questionId);
    try {
      const result = await apiService.generatePosition(form.description, 1, form.questionType);
      if (result && result.questions && result.questions.length > 0) {
        const newQuestion = result.questions[0];
        setQuestions(qs => qs.map(q => 
          q.id === questionId 
            ? { 
                ...q, 
                text: newQuestion.text,
                evaluationCriteria: 'Оценить глубину знаний, практический опыт, способность объяснять сложные концепции'
              }
            : q
        ));
      }
    } catch (error) {
      console.error('Error regenerating question:', error);
      toast.error('Ошибка перегенерации вопроса');
    } finally {
      setRegeneratingQuestion(null);
    }
  };

  // Drag and drop handlers
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Генерация вакансии через AI
  const generatePosition = async () => {
    setIsGenLoading(true);
    try {
      const result = await apiService.generatePosition(form.description, Number(form.questionsCount), form.questionType);
      
      // Обновляем форму с данными от AI
      if (result.title) {
        setForm(prev => ({ ...prev, title: result.title }));
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
      const newQuestions: Question[] = result.questions.map((q: any, index: number) => ({
        id: Math.random().toString(36).substr(2, 9),
        text: q.text,
        evaluationCriteria: 'Оценить глубину знаний, практический опыт, способность объяснять сложные концепции'
      }));
      
      setQuestions(newQuestions);
      toast.success('Вакансия сгенерирована');
    } catch (error) {
      console.error('Error generating position:', error);
      toast.error('Ошибка генерации вакансии');
    } finally {
      setIsGenLoading(false);
    }
  };

  // Сабмит формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем аутентификацию
    if (!authService.isAuthenticated()) {
      toast.error('Необходимо войти в систему');
      navigate('/login');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Если это новая вакансия и нет вопросов, сначала генерируем их
      if (!location.state?.vacancy && questions.length === 0 && form.description.trim()) {
        setIsGenLoading(true);
        try {
          const result = await apiService.generatePosition(form.description, Number(form.questionsCount), form.questionType);
          
          // Обновляем форму с данными от AI
          if (result.title) {
            setForm(prev => ({ ...prev, title: result.title }));
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
          const newQuestions: Question[] = result.questions.map((q: any, index: number) => ({
            id: Math.random().toString(36).substr(2, 9),
            text: q.text,
            evaluationCriteria: 'Оценить глубину знаний, практический опыт, способность объяснять сложные концепции'
          }));
          
          setQuestions(newQuestions);
        } catch (error) {
          console.error('Error generating position:', error);
          toast.error('Ошибка генерации вакансии');
        } finally {
          setIsGenLoading(false);
        }
      }

      if (location.state?.vacancy) {
        // Обновление существующей вакансии
        await apiService.updatePosition(location.state.vacancy.id, {
          title: form.title,
          status: form.status,
          description: form.description,
          topics: form.topics,
          minScore: form.minScore,
          language: form.language,
          showOtherLang: form.showOtherLang,
          tags: form.tags,
          answerTime: form.answerTime,
          level: form.level as any,
          saveAudio: form.saveAudio,
          saveVideo: form.saveVideo,
          randomOrder: form.randomOrder,
          questionType: form.questionType,
          questionsCount: form.questionsCount,
          checkType: form.checkType,
        });
        
        // Обновляем вопросы для существующей вакансии
        if (questions.length > 0) {
          console.log('Updating questions for existing vacancy');
          
          // Сначала получаем существующие вопросы
          try {
            const existingQuestions = await apiService.getQuestions(location.state.vacancy.id);
            console.log('Existing questions:', existingQuestions);
            
            // Удаляем старые вопросы
            if (existingQuestions.questions && existingQuestions.questions.length > 0) {
              for (const existingQuestion of existingQuestions.questions) {
                try {
                  await apiService.deleteQuestion(existingQuestion.id);
                  console.log('Deleted question:', existingQuestion.id);
                } catch (deleteError) {
                  console.error('Error deleting question:', deleteError);
                }
              }
            }
            
            // Добавляем новые вопросы
            for (const question of questions) {
              try {
                await apiService.createQuestion(location.state.vacancy.id, {
                  text: question.text,
                  type: QuestionTypeEnum.text,
                  order: questions.indexOf(question) + 1,
                  isRequired: true,
                  evaluationCriteria: question.evaluationCriteria
                });
                console.log('Created question:', question.text);
              } catch (createError) {
                console.error('Error creating question:', createError);
              }
            }
          } catch (questionsError) {
            console.error('Error updating questions:', questionsError);
            toast.error('Ошибка обновления вопросов');
          }
        }
        
        toast.success('Вакансия обновлена');
      } else {
        // Создание новой вакансии
        const newVacancy = await apiService.createPosition({
          title: form.title,
          status: form.status,
          description: form.description,
          topics: form.topics,
          minScore: form.minScore,
          language: form.language,
          showOtherLang: form.showOtherLang,
          tags: form.tags,
          answerTime: form.answerTime,
          level: form.level as any,
          saveAudio: form.saveAudio,
          saveVideo: form.saveVideo,
          randomOrder: form.randomOrder,
          questionType: form.questionType,
          questionsCount: form.questionsCount,
          checkType: form.checkType,
        });

        // Если есть вопросы, добавляем их к вакансии
        if (questions.length > 0 && newVacancy.id) {
          for (const question of questions) {
            await apiService.createQuestion(newVacancy.id, {
              text: question.text,
              type: QuestionTypeEnum.text,
              order: questions.indexOf(question) + 1,
              isRequired: true,
              evaluationCriteria: question.evaluationCriteria
            });
          }
        }
        toast.success('Вакансия создана');
      }
      
      navigate('/vacancies');
    } catch (error) {
      console.error('Error saving vacancy:', error);
      toast.error('Ошибка сохранения вакансии');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <button onClick={() => navigate('/')} className="mb-4 flex items-center text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-5 w-5 mr-2" /> Назад
      </button>
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg w-full flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            {location.state?.vacancy ? 'Редактировать вакансию' : 'Добавить вакансию'}
          </h1>
        </div>

        <div>
          <div className="text-gray-500 text-base mt-1">
            Заполните все поля для {location.state?.vacancy ? 'редактирования' : 'создания'} вакансии
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* AI-генерация */}
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="AI" className="w-12 h-12 rounded-full border" />
              <div className="text-base text-gray-700">
                Я помогу! Введите описание вакансии и нажмите <b>Сгенерировать</b>.
              </div>
            </div>
            
            {/* Увеличенное поле описания */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание вакансии
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={8}
                className="input-field mb-0 text-base w-full resize-none"
                placeholder="Подробно опишите вакансию: требования, обязанности, необходимые навыки, опыт работы, технологии, которые использует компания, особенности проекта или команды. Чем подробнее описание, тем лучше будут сгенерированы вопросы для интервью..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Сколько вопросов сгенерировать?</label>
                <select name="questionsCount" value={form.questionsCount} onChange={handleChange} className="input-field">
                  {[3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Что проверяем?</label>
                <select name="questionType" value={form.questionType} onChange={handleChange} className="input-field">
                  {['Только хард-скиллы','В основном хард-скиллы','Хард и софт-скиллы поровну','В основном софт-скиллы и опыт','Только софт скиллы и опыт'].map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                type="button" 
                className="btn-primary h-10 px-6 text-base" 
                onClick={generatePosition} 
                disabled={isGenLoading || !form.description.trim()}
              >
                {isGenLoading ? 'Генерируем...' : 'Сгенерировать'}
              </button>
            </div>
          </div>

          {/* Основные данные и условия */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 flex flex-col gap-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
                <input name="title" value={form.title} onChange={handleChange} className="input-field text-base" placeholder="Go разработчик" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                <select name="status" value={form.status} onChange={handleChange} className="input-field text-base">
                  {(['active', 'paused', 'archived'] as PositionStatusEnum[]).map((status) => (
                    <option key={status} value={status}>{vacancyStatusMap[status].text}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Топики</label>
                <input name="topics" value={form.topics.join(', ')} onChange={e => setForm(f => ({...f, topics: e.target.value.split(',').map(t=>t.trim())}))} className="input-field text-base" placeholder="Go, Конкурентность, ..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Язык собеседования</label>
                <select name="language" value={form.language} onChange={handleChange} className="input-field text-base">
                  <option value="Русский">Русский</option>
                  <option value="English">English</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" name="showOtherLang" checked={form.showOtherLang} onChange={handleChange} />
                <span className="text-xs text-gray-700">Показывать результаты на другом языке</span>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Теги для поиска (опционально)</label>
                <input name="tags" value={form.tags.join(', ')} onChange={e => setForm(f => ({...f, tags: e.target.value.split(',').map(t=>t.trim())}))} className="input-field bg-yellow-50 text-base" placeholder="Введите или создайте тег" />
              </div>
            </div>
            
            {/* Условия */}
            <div className="mt-2">
              <div className="font-semibold text-gray-900 mb-3 text-lg">Условия</div>
              <div className="flex flex-col gap-6">
                {/* Минимальная оценка */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500 mb-1 font-semibold">Минимальная оценка</label>
                  <div className="flex gap-2 flex-wrap">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button key={n} type="button" className={`w-9 h-9 rounded-lg text-base font-bold transition-colors duration-150 border ${form.minScore===n ? 'bg-primary-200 text-primary-900 border-primary-400 shadow' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-primary-50'} `} onClick={()=>setForm(f=>({...f, minScore:n}))}>{n}</button>
                    ))}
                  </div>
                </div>
                
                {/* Время на ответ */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500 mb-1 font-semibold">Время на ответ</label>
                  <div className="flex gap-2 flex-wrap">
                    {[60,90,120,150,180,210,240,300].map(sec => (
                      <button key={sec} type="button" className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 border ${form.answerTime===sec ? 'bg-primary-200 text-primary-900 border-primary-400 shadow' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-primary-50'} `} onClick={()=>setForm(f=>({...f, answerTime:sec}))}>{Math.floor(sec/60)} мин{sec%60 ? ' '+sec%60+'с' : ''}</button>
                    ))}
                  </div>
                </div>
                
                {/* Уровень */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500 mb-1 font-semibold">Уровень</label>
                  <div className="flex gap-2 flex-wrap">
                    {['junior','middle','senior','lead'].map(lvl => (
                      <button key={lvl} type="button" className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors duration-150 border ${form.level===lvl ? 'bg-primary-200 text-primary-900 border-primary-400 shadow' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-primary-50'} `} onClick={()=>setForm(f=>({...f, level:lvl}))}>{lvl}</button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input type="checkbox" name="saveAudio" checked={form.saveAudio} onChange={handleChange} />
                  Сохранять аудио
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input type="checkbox" name="saveVideo" checked={form.saveVideo} onChange={handleChange} />
                  Сохранять видео
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input type="checkbox" name="randomOrder" checked={form.randomOrder} onChange={handleChange} />
                  Случайный порядок
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input type="checkbox" name="inviteNext" checked={form.inviteNext} onChange={handleChange} />
                  Приглашать на этап
                </label>
              </div>
            </div>
          </div>

          {/* Вопросы в карточках с drag-and-drop */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-gray-900 text-lg">
                Вопросы для интервью {questions.length > 0 && `(${questions.length})`}
              </h2>
              <button 
                type="button" 
                className="btn-secondary px-4 py-2 text-sm flex items-center whitespace-nowrap" 
                onClick={addQuestion}
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить вопрос
              </button>
            </div>
            
            {questions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-lg mb-2">Вопросы не добавлены</div>
                <div className="text-sm">Сгенерируйте вопросы или добавьте их вручную</div>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={questions.map(q => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-0">
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
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="btn-primary h-12 px-10 text-lg" 
              disabled={isLoading}
            >
              {isLoading ? 'Сохраняем...' : (location.state?.vacancy ? 'Сохранить' : 'Создать')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VacancyCreate; 