import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles, Save, Loader2 } from 'lucide-react';
import { apiService } from '../services/apiService';
import { Position, PositionStatusEnum, QuestionTypeEnum } from '../client/models';
import toast from 'react-hot-toast';

interface Question {
  id: string;
  text: string;
  type: QuestionTypeEnum;
  order: number;
  isRequired: boolean;
  evaluationCriteria?: string;
}

interface VacancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacancy?: Position | null;
  onSuccess: () => void;
}

// Тип формы
interface VacancyForm {
  title: string;
  status: PositionStatusEnum;
  description: string;
  topics: string[];
  minScore: number;
  language: string;
  showOtherLang: boolean;
  tags: string[];
  answerTime: number;
  level: 'junior' | 'middle' | 'senior' | 'lead';
  saveAudio: boolean;
  saveVideo: boolean;
  aiCheck: boolean;
  aiScore: boolean;
  checkType: string;
  questionType: string;
  questionsCount: number;
  randomOrder: boolean;
}

const VacancyModal: React.FC<VacancyModalProps> = ({
  isOpen,
  onClose,
  vacancy,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [regeneratingQuestion, setRegeneratingQuestion] = useState<string | null>(null);
  
  // Инициализация формы
  const [form, setForm] = useState<VacancyForm>({
    title: '',
    status: PositionStatusEnum.active,
    description: '',
    topics: [],
    minScore: 0,
    language: 'ru',
    showOtherLang: false,
    tags: [],
    answerTime: 60,
    level: 'junior',
    saveAudio: false,
    saveVideo: false,
    aiCheck: false,
    aiScore: false,
    checkType: 'default',
    questionType: 'Хард и софт-скиллы поровну',
    questionsCount: 5,
    randomOrder: false,
  });

  // Загружаем данные вакансии при открытии модального окна
  useEffect(() => {
    if (isOpen && vacancy) {
      setForm({
        title: vacancy.title || '',
        status: vacancy.status || PositionStatusEnum.active,
        description: vacancy.description || '',
        topics: vacancy.topics || [],
        minScore: vacancy.minScore || 0,
        language: vacancy.language || 'ru',
        showOtherLang: vacancy.showOtherLang || false,
        tags: vacancy.tags || [],
        answerTime: vacancy.answerTime || 60,
        level: vacancy.level || 'junior',
        saveAudio: vacancy.saveAudio ?? false,
        saveVideo: vacancy.saveVideo ?? false,
        aiCheck: false,
        aiScore: false,
        checkType: vacancy.checkType || 'default',
        questionType: 'Хард и софт-скиллы поровну',
        questionsCount: 5,
        randomOrder: false,
      });
      
      // Загружаем вопросы
      loadQuestions();
    } else if (isOpen && !vacancy) {
      // Сброс формы для новой вакансии
      setForm({
        title: '',
        status: PositionStatusEnum.active,
        description: '',
        topics: [],
        minScore: 0,
        language: 'ru',
        showOtherLang: false,
        tags: [],
        answerTime: 60,
        level: 'junior',
        saveAudio: false,
        saveVideo: false,
        aiCheck: false,
        aiScore: false,
        checkType: 'default',
        questionType: 'Хард и софт-скиллы поровну',
        questionsCount: 5,
        randomOrder: false,
      });
      setQuestions([]);
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
          type: q.type || QuestionTypeEnum.text,
          order: q.order || 1,
          isRequired: q.isRequired || true,
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
    
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      type: QuestionTypeEnum.text,
      order: questions.length + 1,
      isRequired: true,
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
    if (!form.description.trim()) {
      toast.error('Введите описание вакансии для генерации вопроса');
      return;
    }

    setRegeneratingQuestion(questionId);
    try {
      const result = await apiService.generatePosition(form.description, 1, form.questionType);
      
      if (result && result.questions && result.questions.length > 0) {
        const newText = result.questions[0].text;
        updateQuestion(questionId, 'text', newText);
        toast.success('Вопрос сгенерирован');
      }
    } catch (error: any) {
      console.error('Error regenerating question:', error);
      toast.error('Ошибка генерации вопроса');
    } finally {
      setRegeneratingQuestion(null);
    }
  };

  const generatePositionWithRetry = async (description: string, questionsCount: number, questionType: string) => {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt} to generate position`);
        const result = await apiService.generatePosition(description, questionsCount, questionType);
        console.log('Generation successful:', result);
        return result;
      } catch (error: any) {
        console.error(`Attempt ${attempt} failed:`, error);
        lastError = error;
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw lastError;
  };

  const handleGenerateQuestions = async () => {
    if (!form.description.trim()) {
      toast.error('Введите описание вакансии для генерации вопросов');
      return;
    }

    setIsGenerating(true);
    try {
      const count = Number(form.questionsCount);
      if (count < 1 || count > 20) {
        toast.error('Количество вопросов должно быть от 1 до 20');
        return;
      }
      
      const result = await generatePositionWithRetry(form.description, count, form.questionType);
      
      if (result && result.questions && result.questions.length > 0) {
        const newQuestions = result.questions.map((q: any, index: number) => ({
          id: `generated-${Date.now()}-${index}`,
          text: q.text,
          type: QuestionTypeEnum.text,
          order: questions.length + index + 1,
          isRequired: true,
          evaluationCriteria: 'Оценить глубину знаний, практический опыт, способность объяснять сложные концепции'
        }));

        setQuestions(prev => [...prev, ...newQuestions]);
        toast.success(`Сгенерировано ${newQuestions.length} вопросов`);
      } else {
        toast.error('Не удалось сгенерировать вопросы');
      }
    } catch (error: any) {
      console.error('Error generating questions:', error);
      toast.error(error.response?.data?.message || 'Ошибка при генерации вопросов');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (vacancy) {
        // Обновление существующей вакансии
        await apiService.updatePosition(vacancy.id, {
          title: form.title,
          status: form.status as PositionStatusEnum,
          description: form.description,
          topics: form.topics,
          minScore: form.minScore,
          language: form.language,
          showOtherLang: form.showOtherLang,
          tags: form.tags,
          answerTime: form.answerTime,
          level: form.level,
          saveAudio: form.saveAudio,
          saveVideo: form.saveVideo,
          randomOrder: form.randomOrder,
          questionType: form.questionType,
          questionsCount: form.questionsCount,
          checkType: form.checkType,
        });
        
        // Обновляем вопросы для существующей вакансии
        if (questions.length > 0) {
          try {
            const existingQuestions = await apiService.getQuestions(vacancy.id);
            
            // Удаляем старые вопросы
            if (existingQuestions.questions && existingQuestions.questions.length > 0) {
              for (const existingQuestion of existingQuestions.questions) {
                try {
                  await apiService.deleteQuestion(existingQuestion.id);
                } catch (deleteError) {
                  console.error('Error deleting question:', deleteError);
                }
              }
            }
            
            // Добавляем новые вопросы
            for (const question of questions) {
              try {
                await apiService.createQuestion(vacancy.id, {
                  text: question.text,
                  type: question.type,
                  order: question.order,
                  isRequired: question.isRequired,
                  evaluationCriteria: question.evaluationCriteria
                });
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
          status: form.status as PositionStatusEnum,
          description: form.description,
          topics: form.topics,
          minScore: form.minScore,
          language: form.language,
          showOtherLang: form.showOtherLang,
          tags: form.tags,
          answerTime: form.answerTime,
          level: form.level,
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
              type: question.type,
              order: question.order,
              isRequired: question.isRequired,
              evaluationCriteria: question.evaluationCriteria
            });
          }
        }
        
        toast.success('Вакансия создана');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving vacancy:', error);
      toast.error('Ошибка сохранения вакансии');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col relative">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">
            {vacancy ? 'Редактировать вакансию' : 'Создать вакансию'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Генерация по описанию */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                Генерация вакансии
              </h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание вакансии
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Подробно опишите вакансию: требования, обязанности, необходимые навыки, опыт работы, технологии..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Сколько вопросов сгенерировать?</label>
                <select name="questionsCount" value={form.questionsCount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {[3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Что проверяем?</label>
                <select name="questionType" value={form.questionType} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {['Только хард-скиллы','В основном хард-скиллы','Хард и софт-скиллы поровну','В основном софт-скиллы и опыт','Только софт скиллы и опыт'].map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button 
                type="button" 
                className="btn-primary flex items-center" 
                onClick={handleGenerateQuestions} 
                disabled={isGenerating || !form.description.trim()}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {isGenerating ? 'Генерируем...' : 'Сгенерировать'}
              </button>
            </div>
          </div>

          {/* Основные данные */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
              <input 
                name="title" 
                value={form.title} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Go разработчик" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
              <select name="status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PositionStatusEnum }))}>
                {Object.values(PositionStatusEnum).map((status) => (
                  <option key={status} value={status}>
                    {status === PositionStatusEnum.active ? 'Активная' : status === PositionStatusEnum.paused ? 'Приостановлена' : 'Архивная'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Топики</label>
              <input 
                name="topics" 
                value={form.topics.join(', ')} 
                onChange={e => setForm(f => ({...f, topics: e.target.value.split(',').map(t=>t.trim())}))} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Go, Конкурентность, ..." 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Язык собеседования</label>
              <select name="language" value={form.language} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="Русский">Русский</option>
                <option value="English">English</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                name="showOtherLang" 
                checked={form.showOtherLang} 
                onChange={handleChange} 
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Показывать результаты на другом языке</span>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Теги для поиска</label>
              <input 
                name="tags" 
                value={form.tags.join(', ')} 
                onChange={e => setForm(f => ({...f, tags: e.target.value.split(',').map(t=>t.trim())}))} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-yellow-50" 
                placeholder="Введите или создайте тег" 
              />
            </div>
          </div>
          
          {/* Условия */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">Условия</h3>
            <div className="space-y-4">
              {/* Минимальная оценка */}
              <div>
                <label className="text-xs text-gray-500 mb-2 font-semibold block">Минимальная оценка</label>
                <div className="flex gap-2 flex-wrap">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button 
                      key={n} 
                      type="button" 
                      className={`w-9 h-9 rounded-lg text-base font-bold transition-colors duration-150 border ${
                        form.minScore === n ? 'bg-blue-200 text-blue-900 border-blue-400 shadow' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-blue-50'
                      }`} 
                      onClick={() => setForm(f => ({...f, minScore: n}))}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Время на ответ */}
              <div>
                <label className="text-xs text-gray-500 mb-2 font-semibold block">Время на ответ</label>
                <div className="flex gap-2 flex-wrap">
                  {[60,90,120,150,180,210,240,300].map(sec => (
                    <button 
                      key={sec} 
                      type="button" 
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 border ${
                        form.answerTime === sec ? 'bg-blue-200 text-blue-900 border-blue-400 shadow' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-blue-50'
                      }`} 
                      onClick={() => setForm(f => ({...f, answerTime: sec}))}
                    >
                      {Math.floor(sec/60)} мин{sec%60 ? ' '+sec%60+'с' : ''}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Уровень */}
              <div>
                <label className="text-xs text-gray-500 mb-2 font-semibold block">Уровень</label>
                <div className="flex gap-2 flex-wrap">
                  {['junior','middle','senior','lead'].map(lvl => (
                    <button 
                      key={lvl} 
                      type="button" 
                      className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors duration-150 border ${
                        form.level === lvl ? 'bg-blue-200 text-blue-900 border-blue-400 shadow' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-blue-50'
                      }`} 
                      onClick={() => setForm(f => ({...f, level: lvl as "middle" | "junior" | "senior" | "lead"}))}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-6">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input 
                  type="checkbox" 
                  name="saveAudio" 
                  checked={form.saveAudio} 
                  onChange={handleChange} 
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Сохранять аудио
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input 
                  type="checkbox" 
                  name="saveVideo" 
                  checked={form.saveVideo} 
                  onChange={handleChange} 
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Сохранять видео
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input 
                  type="checkbox" 
                  name="randomOrder" 
                  checked={form.randomOrder} 
                  onChange={handleChange} 
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Случайный порядок
              </label>
            </div>
          </div>

          {/* Вопросы */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">
                Вопросы для интервью {questions.length > 0 && `(${questions.length})`}
              </h3>
              <button 
                type="button" 
                className="btn-secondary px-4 py-2 text-sm flex items-center" 
                onClick={addQuestion}
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить вопрос
              </button>
            </div>
            
            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-lg mb-2">Вопросы не добавлены</div>
                <div className="text-sm">Сгенерируйте вопросы или добавьте их вручную</div>
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Вопрос {index + 1}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => regenerateQuestion(question.id)}
                          disabled={regeneratingQuestion === question.id}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Сгенерировать заново"
                        >
                          {regeneratingQuestion === question.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeQuestion(question.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Удалить"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                      placeholder="Введите вопрос..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-3"
                      rows={2}
                    />
                    <textarea
                      value={question.evaluationCriteria}
                      onChange={(e) => updateQuestion(question.id, 'evaluationCriteria', e.target.value)}
                      placeholder="Критерии оценки (опционально)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>

          {/* Кнопки - Smart sticky */}
          <div className="sticky bottom-0 left-0 w-full bg-white flex justify-end gap-3 p-6 border-t border-gray-200 h-20 z-20" >
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary flex items-center"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Сохранение...' : (vacancy ? 'Сохранить' : 'Создать')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VacancyModal; 