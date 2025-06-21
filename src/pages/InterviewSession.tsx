import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Loader2, CheckCircle, Mail, Globe, Users, Info, Headphones, Video, Briefcase, Phone } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { mockApi } from '../mocks/mockApi';
import type { Branding } from '../client/models/branding';
import type { Position } from '../client/models/position';
import type { Candidate } from '../client/models/candidate';
import type { Interview } from '../client/models/interview';
import type { Question } from '../client/models/question';
import { StatusEnum } from '../client/models/interview';

// --- UI CONSTANTS ---
const MIC_TEST_DURATION = 5; // секунд для теста микрофона
const INTRO_MESSAGES = [
  { from: 'ai', text: 'Привет 👋' },
  { from: 'ai', text: 'Я твой виртуальный интервьюер.' },
  { from: 'ai', text: 'Я задам тебе несколько вопросов. Для ответа используй микрофон. Давай проверим, что он работает.' },
  { from: 'ai', text: 'Нажми кнопку «Тест микрофона», чтобы проверить микрофон.' },
];

const icons = [<Globe className="h-6 w-6 text-orange-500" />, <Headphones className="h-6 w-6 text-orange-500" />, <Mic className="h-4 w-4 text-orange-500" />, <Info className="h-6 w-6 text-orange-500" />];

const InterviewSession: React.FC = () => {
  const params = useParams<{ sessionId: string }>();
  const [loading, setLoading] = useState(true);
  type InterviewStep = 'invite' | 'intro' | 'mic-test' | 'mic-test-done' | 'question' | 'final';
  const [step, setStep] = useState<InterviewStep>('invite');

  // Data states
  const [branding, setBranding] = useState<Branding | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [checklist, setChecklist] = useState<{ icon: React.ReactNode, text: string }[]>([]);
  const [inviteInfo, setInviteInfo] = useState<{ language: string; questionsCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Chat & Recording states
  const [messages, setMessages] = useState<{ from: string, text: string }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [consent, setConsent] = useState(false);
  const [readyForAnswer, setReadyForAnswer] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const ICONS = {
    checklist: [<Video className="h-6 w-6 text-primary-500" />, <Headphones className="h-6 w-6 text-primary-500" />, <Mic className="h-6 w-6 text-primary-500" />, <Info className="h-6 w-6 text-primary-500" />],
    invite: {
      candidate: <Users className="h-5 w-5 mr-3 text-primary-200" />,
      language: <Globe className="h-5 w-5 mr-3 text-primary-200" />,
      questions: <Info className="h-5 w-5 mr-3 text-primary-200" />,
    }
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { sessionId } = params;
        if (!sessionId) {
          setError('Некорректный идентификатор сессии.');
          setLoading(false);
          return;
        }
        const interviewData = await mockApi.getInterview(sessionId);
        if (!interviewData) {
          setError('Собеседование не найдено.');
          setLoading(false);
          return;
        }
        setInterview(interviewData);
        const [checklistData, inviteData, candidateData, positionData, questionsData, brandingData] = await Promise.all([
          mockApi.getChecklist(),
          mockApi.getInviteInfo(),
          mockApi.getCandidate(interviewData.candidateId),
          mockApi.getPosition(interviewData.positionId),
          mockApi.getQuestions(interviewData.positionId),
          mockApi.getBranding(),
        ]);
        setChecklist(checklistData.map((item, index) => ({ ...item, icon: ICONS.checklist[index] })));
        setInviteInfo(inviteData);
        setCandidate(candidateData || null);
        setPosition(positionData || null);
        setQuestions(questionsData);
        setBranding(brandingData);
      } catch (e) {
        setError('Ошибка загрузки данных.');
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  // Sleep-функция
  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Добавляет сообщения по одному с задержкой
  async function pushMessagesWithDelay(msgsArr: { from: string, text: string }[]) {
    for (const msg of msgsArr) {
      setMessages(msgs => [...msgs, msg]);
      await sleep(1500);
    }
  }

  // Main flow handler
  const handleStart = async () => {
    setStep('intro');
    await pushMessagesWithDelay([
      { from: 'ai', text: `Привет, ${candidate?.firstName || 'кандидат'}! 👋` },
      { from: 'ai', text: 'Я твой виртуальный помощник для интервью. Я задам тебе несколько вопросов.' },
      { from: 'ai', text: 'Сначала давай убедимся, что твой микрофон работает. Нажми кнопку ниже.' },
    ]);
  };

  const handleMicTestStart = () => {
    setStep('mic-test');
    setIsRecording(true);
    setRecordTimer(MIC_TEST_DURATION);
  };

  const handleMicTestStop = async () => {
    setIsRecording(false);
    setStep('mic-test-done');
    await pushMessagesWithDelay([
      { from: 'user', text: 'Раз-раз, проверка связи.' },
      { from: 'ai', text: 'Отлично, я тебя слышу! Можем начинать.' },
    ]);
  };

  const handleStartInterview = async () => {
    setStep('question');
    setMessages([]); // Clear chat for questions
    if (questions && questions.length > 0) {
      await pushMessagesWithDelay([
        { from: 'ai', text: `Отлично, начинаем. Вопрос 1 из ${questions.length}.` },
        { from: 'ai', text: questions[0].text }
      ]);
      setReadyForAnswer(true);
    } else {
      await pushMessagesWithDelay([
        { from: 'ai', text: 'Для этой вакансии пока нет вопросов. Интервью завершено.' }
      ]);
      setStep('final');
    }
  };
  
  const handleStartRecording = () => {
    setReadyForAnswer(false);
    setIsRecording(true);
    setRecordTimer((position as any)?.answerTime || 60); // Используем время из вакансии или 60с по умолчанию
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setRecordTimer(0);
    setIsTranscribing(true);

    // Имитация более реалистичного ответа
    const mockAnswer = `(Мок-ответ) Я считаю, что ${questions[currentQuestion].text.toLowerCase().replace('?', '...')}`;
    await sleep(1500); // Имитация обработки
    await pushMessagesWithDelay([{ from: 'user', text: mockAnswer }]);
    setIsTranscribing(false);

    const nextQuestionIndex = currentQuestion + 1;
    if (nextQuestionIndex < questions.length) {
      setCurrentQuestion(nextQuestionIndex);
      await pushMessagesWithDelay([
        { from: 'ai', text: 'Отлично, спасибо за ответ.' },
        { from: 'ai', text: `Следующий вопрос ${nextQuestionIndex + 1} из ${questions.length}:` },
        { from: 'ai', text: questions[nextQuestionIndex].text }
      ]);
      setReadyForAnswer(true);
    } else {
      setStep('final');
      await pushMessagesWithDelay([
        { from: 'ai', text: 'Спасибо за ваши ответы. Это был последний вопрос.' },
        { from: 'ai', text: 'Мы внимательно изучим информацию и вернемся с обратной связью в ближайшее время.' },
        { from: 'ai', text: 'Хорошего дня! 👋' }
      ]);
    }
  };
  
  // Timer effect
  useEffect(() => {
    if (!isRecording || recordTimer <= 0) return;
    const timerId = setTimeout(() => setRecordTimer(t => t - 1), 1000);
    if (recordTimer === 1) {
      if (step === 'mic-test') setTimeout(handleMicTestStop, 1000);
      else if (step === 'question') setTimeout(handleStopRecording, 1000);
    }
    return () => clearTimeout(timerId);
  }, [isRecording, recordTimer, step]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- RENDER ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4" />
          <div className="text-white">Загрузка интервью...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <div className="text-gray-400 text-sm">sessionId: {params.sessionId}</div>
        </div>
      </div>
    );
  }

  if (!candidate || !position) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Ошибка загрузки данных</div>
          <div className="text-gray-400 text-sm">candidate: {candidate ? 'loaded' : 'null'}</div>
          <div className="text-gray-400 text-sm">position: {position ? 'loaded' : 'null'}</div>
          <div className="text-gray-400 text-sm">sessionId: {params.sessionId}</div>
        </div>
      </div>
    );
  }

  // Render welcome screen
  const renderWelcomeScreen = () => {
    if (!candidate || !position || step !== 'invite') return null;
    return (
      <div className="w-full max-w-2xl bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-700">
        <div className="text-center mb-10">
          <span className="text-5xl font-extrabold tracking-tight text-wmt-orange mb-6 block">
            {branding?.companyName || 'WMT Рекрутер'}
          </span>
          <h1 className="text-2xl font-semibold text-white leading-tight">
            Собеседование на позицию<br />
            <span className="text-3xl font-bold text-wmt-orange">"{position.title}"</span>
          </h1>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-lg mb-6 text-center text-gray-300">Детали</h2>
          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-gray-600">
            <div className="px-2">
              <div className="text-sm text-gray-400 mb-1">Кандидат</div>
              <div className="text-lg font-medium text-white truncate">{candidate.name}</div>
            </div>
            <div className="px-2">
              <div className="text-sm text-gray-400 mb-1">Язык</div>
              <div className="text-lg font-medium text-white">{inviteInfo?.language || 'Русский'}</div>
            </div>
            <div className="px-2">
              <div className="text-sm text-gray-400 mb-1">Вопросов</div>
              <div className="text-lg font-medium text-white">{questions.length}</div>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="font-semibold text-lg mb-4 text-center text-gray-300">Чек-лист готовности</h2>
          <ul className="space-y-3">
            {checklist.map((item, index) => (
              <li key={index} className="flex items-center text-gray-300 bg-gray-900/50 rounded-lg p-4">
                <div className="mr-4 text-wmt-orange">{item.icon}</div>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-start p-1 mb-6">
          <input
            id="consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="h-5 w-5 mt-0.5 flex-shrink-0 bg-gray-700 border-gray-600 rounded text-wmt-orange focus:ring-2 focus:ring-wmt-orange-dark focus:ring-offset-2 focus:ring-offset-gray-800"
          />
          <label htmlFor="consent" className="ml-3 text-sm text-gray-400">
            Я даю согласие на аудио- и видеозапись собеседования, а также на обработку моих персональных данных.
          </label>
        </div>
        <button
          onClick={handleStart}
          disabled={!consent}
          className="w-full text-lg font-bold bg-wmt-orange hover:bg-wmt-orange-dark disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl transition-all duration-300 shadow-lg shadow-wmt-orange/20 hover:shadow-wmt-orange/40"
        >
          Начать собеседование
        </button>
      </div>
    );
  };

  // Render questions progress
  const renderQuestionsProgress = () => {
    if (!questions.length || step !== 'question') return null;
    return (
      <div className="bg-gray-50 border-b p-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-gray-700">Прогресс собеседования</h3>
          <span className="text-sm text-gray-500">
            Вопрос {currentQuestion + 1} из {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        {/* Show welcome screen */}
        {(step as InterviewStep) === 'invite' && renderWelcomeScreen()}
        {/* Main content */}
        {(step as InterviewStep) !== 'invite' && (
          <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-8rem)] flex flex-col">
            {/* Questions progress bar */}
            {renderQuestionsProgress()}
            {/* Chat messages */}
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.from === 'ai' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.from === 'ai'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-primary-500 text-white'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {/* Controls */}
            <div className="border-t p-4 flex-shrink-0">
              {(step as InterviewStep) === 'intro' && (
                <button
                  onClick={handleMicTestStart}
                  className="w-full btn-primary py-3"
                >
                  Тест микрофона
                </button>
              )}
              {(step as InterviewStep) === 'mic-test' && (
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Mic className="h-6 w-6 text-red-500 animate-pulse" />
                    <span>Запись... {recordTimer}с</span>
                  </div>
                  <button
                    onClick={handleMicTestStop}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
                  >
                    <div className="w-3 h-3 bg-white rounded-sm mr-2"></div>
                    Стоп
                  </button>
                </div>
              )}
              {(step as InterviewStep) === 'mic-test-done' && (
                <button
                  onClick={handleStartInterview}
                  className="w-full btn-primary py-3"
                >
                  Начать интервью
                </button>
              )}
              {(step as InterviewStep) === 'question' && !isRecording && !isTranscribing && !readyForAnswer && (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Ожидание вопроса...</span>
                </div>
              )}
              {(step as InterviewStep) === 'question' && !isRecording && !isTranscribing && readyForAnswer && (
                <button
                  onClick={handleStartRecording}
                  className="w-full btn-primary py-3 flex items-center justify-center"
                >
                  <Mic className="h-5 w-5 mr-2" />
                  Записать ответ
                </button>
              )}
              {(step as InterviewStep) === 'question' && isRecording && (
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Mic className="h-6 w-6 text-red-500 animate-pulse" />
                    <span>Запись... {recordTimer}с</span>
                  </div>
                  <button
                    onClick={handleStopRecording}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
                  >
                    <div className="w-3 h-3 bg-white rounded-sm mr-2"></div>
                    Стоп
                  </button>
                </div>
              )}
              {(step as InterviewStep) === 'question' && isTranscribing && (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Обработка записи...</span>
                </div>
              )}
              {(step as InterviewStep) === 'final' && (
                <div className="text-center text-gray-600">
                  Интервью завершено
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewSession; 