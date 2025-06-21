import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { mockApi } from '../mocks/mockApi';

const useMock = process.env.REACT_APP_USE_MOCK_API === 'true';

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
    questionType: 'В основном хард-скиллы',
    questionsCount: 5,
    checkType: '',
  });
  // Вопросы (моки)
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenLoading, setIsGenLoading] = useState(false);

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
        questionType: vacancy.questionType || 'В основном хард-скиллы',
        questionsCount: vacancy.questionsCount || 5,
        checkType: vacancy.checkType || '',
      });
      if (vacancy.id && !questions?.length) {
        // Если нет вопросов — загрузить их через mockApi
        (async () => {
          const qs = await mockApi.getQuestions(String(vacancy.id));
          setQuestions(qs.map((q: any) => q.text));
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
  const addQuestion = () => setQuestions(qs => [...qs, '']);
  const updateQuestion = (idx: number, value: string) => setQuestions(qs => qs.map((q, i) => i === idx ? value : q));
  const removeQuestion = (idx: number) => setQuestions(qs => qs.filter((_, i) => i !== idx));

  // Генерация вопросов через mockApi
  const generateQuestions = async () => {
    setIsGenLoading(true);
    let result;
    if (useMock) {
      result = await mockApi.generateQuestions({ description: form.description, questionsCount: Number(form.questionsCount) });
    } else {
      // TODO: подключить реальный API-клиент
      result = await mockApi.generateQuestions({ description: form.description, questionsCount: Number(form.questionsCount) });
    }
    setQuestions(result.map((q: any) => q.text));
    setIsGenLoading(false);
  };

  // Сабмит формы (мок)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: отправка данных через API
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
                  {['Только хард-скиллы','В основном хард-скиллы','Хард и софт-скиллы поровну','В основном софт-скиллы и опыт','Только софт скиллы и опыт'].map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" className="btn-primary h-10 px-6 text-base" onClick={generateQuestions} disabled={isGenLoading}>{isGenLoading ? 'Генерируем...' : 'Сгенерировать'}</button>
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
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-gray-900">Вопросы для интервью</span>
              <button type="button" className="btn-secondary px-3 py-1 text-xs" onClick={addQuestion}>Добавить вопрос</button>
            </div>
            {questions.length === 0 ? (
              <div className="text-gray-400 text-sm">Вопросы не добавлены</div>
            ) : (
              <ul className="flex flex-col gap-2">
                {questions.map((q, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={q}
                      onChange={e => updateQuestion(idx, e.target.value)}
                      className="input-field flex-1"
                      placeholder={`Вопрос #${idx+1}`}
                    />
                    <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={() => removeQuestion(idx)}><Trash2 className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Кнопки */}
          <div className="flex justify-end">
            <button type="submit" className="btn-primary h-12 px-10 text-lg" disabled={isLoading}>{isLoading ? 'Сохраняем...' : (location.state?.vacancy ? 'Сохранить' : 'Создать')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VacancyCreate; 