import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

// Моки для генерации вопросов и топиков
const MOCK_TOPICS = ['Go', 'Конкурентность', 'Обработка ошибок'];
const MOCK_QUESTION_TYPES = [
  'Только хард-скиллы',
  'В основном хард-скиллы',
  'Хард и софт-скиллы поровну',
  'В основном софт-скиллы и опыт',
  'Только софт скиллы и опыт',
];

const VacancyCreate: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Табы формы
  const [tab, setTab] = useState<'details' | 'company'>('details');
  // Основные поля формы
  const [form, setForm] = useState({
    title: '',
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
    questionType: MOCK_QUESTION_TYPES[1],
    questionsCount: 5,
    checkType: '',
  });
  // Вопросы (моки)
  const [questions, setQuestions] = useState([
    'Как вы используете горутины для достижения конкурентности в Go?',
    'Что такое каналы в Go и как они работают?',
    'Как вы обрабатываете ошибки в Go?',
    'Расскажите о проекте, где вы использовали Go. Какие были основные задачи?',
    'Как вы справляетесь с дедлайнами и приоритизацией задач?'
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Если пришли данные для редактирования
  useEffect(() => {
    // @ts-ignore
    const vacancy = location.state?.vacancy;
    if (vacancy) {
      setForm({
        title: vacancy.title || '',
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
        questionType: vacancy.questionType || MOCK_QUESTION_TYPES[1],
        questionsCount: vacancy.questionsCount || 5,
        checkType: vacancy.checkType || '',
      });
      setQuestions(
        Array.isArray(vacancy.questions) && vacancy.questions.length > 0
          ? vacancy.questions
          : [
              'Как вы используете горутины для достижения конкурентности в Go?',
              'Что такое каналы в Go и как они работают?',
              'Как вы обрабатываете ошибки в Go?',
              'Расскажите о проекте, где вы использовали Go. Какие были основные задачи?',
              'Как вы справляетесь с дедлайнами и приоритизацией задач?'
            ]
      );
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
  const addQuestion = () => setQuestions(qs => [...qs, '']);
  const updateQuestion = (idx: number, value: string) => setQuestions(qs => qs.map((q, i) => i === idx ? value : q));
  const removeQuestion = (idx: number) => setQuestions(qs => qs.filter((_, i) => i !== idx));

  // Моки генерации вопросов (заглушка)
  const generateQuestions = () => {
    setQuestions([
      'Как вы используете горутины для достижения конкурентности в Go?',
      'Что такое каналы в Go и как они работают?',
      'Как вы обрабатываете ошибки в Go?',
      'Расскажите о проекте, где вы использовали Go. Какие были основные задачи?',
      'Как вы справляетесь с дедлайнами и приоритизацией задач?'
    ]);
  };

  // Сабмит формы (мок)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/vacancies');
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg w-full max-w-5xl flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => navigate('/vacancies')} className="p-2 text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{location.state?.vacancy ? 'Редактировать вакансию' : 'Добавить вакансию'}</h1>
            <div className="text-gray-500 text-base mt-1">Заполните все поля для {location.state?.vacancy ? 'редактирования' : 'создания'} вакансии</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* AI-генерация */}
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="AI" className="w-12 h-12 rounded-full border" />
              <div className="text-base text-gray-700">Я помогу! Введите описание вакансии и нажмите <b>Сгенерировать</b>.</div>
            </div>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              className="input-field mb-0 text-base"
              placeholder="Опишите вакансию для генерации вопросов..."
            />
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
                  {MOCK_QUESTION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" className="btn-primary h-10 px-6 text-base" onClick={generateQuestions}>Сгенерировать</button>
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
          {/* Вопросы */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-900">Вопросы для собеседования</h2>
              <button type="button" className="btn-secondary flex items-center h-9 px-4 text-sm" onClick={addQuestion}>
                <Plus className="mr-1 h-4 w-4" /> Добавить
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex gap-3 items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">Вопрос {idx+1}/{questions.length}</div>
                    <textarea value={q} onChange={e=>updateQuestion(idx, e.target.value)} className="input-field mb-1 text-base" rows={2} />
                    <input className="input-field text-xs mb-1" placeholder="Ключевые точки для оценки (опционально)" />
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Вопрос нельзя пропустить</span>
                    </div>
                  </div>
                  <button type="button" className="p-2 text-red-500 hover:text-red-700" onClick={()=>removeQuestion(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          {/* Кнопки */}
          <div className="flex flex-col md:flex-row justify-end gap-4 mt-2">
            <button type="button" onClick={()=>navigate('/vacancies')} className="btn-secondary h-12 px-8 text-base font-semibold">Отмена</button>
            <button type="submit" disabled={isLoading} className="btn-primary h-12 px-10 text-base font-semibold">{isLoading ? 'Создание...' : 'Сохранить изменения'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VacancyCreate; 