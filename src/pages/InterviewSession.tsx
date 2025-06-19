import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Loader2, CheckCircle, Mail, Globe, Users, Info, Headphones } from 'lucide-react';

// Моки вопросов интервью
const MOCK_QUESTIONS = [
  'Как вы используете горутины для достижения конкурентности в Go?',
  'Что такое каналы в Go и как они работают?',
  'Как вы обрабатываете ошибки в Go?',
  'Расскажите о проекте, где вы использовали Go. Какие были основные задачи?',
  'Как вы справляетесь с дедлайнами и приоритизацией задач?'
];

// Моковые сообщения для приветствия и инструкций
const INTRO_MESSAGES = [
  { from: 'ai', text: 'Привет 👋' },
  { from: 'ai', text: 'Я твой виртуальный интервьюер.' },
  { from: 'ai', text: 'Я задам тебе несколько вопросов. Для ответа используй микрофон. Давай проверим, что он работает.' },
  { from: 'ai', text: 'Нажми кнопку «Тест микрофона», чтобы проверить микрофон.' },
];

const MIC_TEST_DURATION = 5; // секунд для теста микрофона

// Моки данных приглашения
const INVITE = {
  candidate: 'Александр Жуков',
  company: 'azhukov',
  position: 'Go разработчик',
  language: 'Русский',
  questions: 5,
};

const CHECKLIST = [
  { icon: <Globe className="h-6 w-6 text-orange-500" />, text: 'Вы используете последнюю версию браузера Chrome или Edge' },
  { icon: <Headphones className="h-6 w-6 text-orange-500" />, text: 'Ваши колонки или наушники включены и работают' },
  { icon: <Mic className="h-4 w-4 text-orange-500" />, text: 'Ваш микрофон включен и работает' },
  { icon: <Info className="h-6 w-6 text-orange-500" />, text: 'Вы в тихом помещении и готовы сконцентрироваться на собеседовании' },
];

const InterviewSession: React.FC = () => {
  // Состояния чата
  const [messages, setMessages] = useState<{from: string, text: string}[]>([]);
  const [step, setStep] = useState<'intro' | 'mic-test' | 'mic-test-done' | 'question' | 'final'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [userAudio, setUserAudio] = useState<string | null>(null); // base64 или blob, мок
  const [userText, setUserText] = useState('');
  const [introDone, setIntroDone] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const recordDuration = 30; // секунд
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [showInvite, setShowInvite] = useState(true);
  const [consent, setConsent] = useState(false);
  const [showFinalBlock, setShowFinalBlock] = useState(false);

  // Sleep-функция
  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Добавляет сообщения по одному с задержкой 2 секунды между каждым
  async function pushMessagesWithDelay(msgsArr: {from: string, text: string}[]) {
    for (const msg of msgsArr) {
      setMessages(msgs => [...msgs, msg]);
      await sleep(2000);
    }
  }

  // Запуск intro-сообщений только после нажатия "Начать"
  const startIntro = () => {
    setStep('intro');
    setMessages([]);
    setIntroDone(false);
    let cancelled = false;
    (async () => {
      for (let i = 0; i < INTRO_MESSAGES.length; i++) {
        if (cancelled) break;
        setMessages(msgs => [...msgs, INTRO_MESSAGES[i]]);
        await sleep(2000);
      }
      if (!cancelled) setIntroDone(true);
    })();
    return () => { cancelled = true; };
  };

  // Автоскролл вниз
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Скролл вниз при появлении финального блока
  useEffect(() => {
    if (showFinalBlock && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showFinalBlock]);

  // Таймер записи (универсальный для mic-test и question)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording && recordTimer > 0) {
      timer = setTimeout(() => setRecordTimer(t => t - 1), 1000);
    } else if (isRecording && recordTimer === 0) {
      if (step === 'mic-test') {
        handleStopMicTest();
      } else {
        handleStopRecording();
      }
    }
    return () => clearTimeout(timer);
  }, [isRecording, recordTimer, step]);

  // Мок: тест микрофона (теперь запускает запись)
  const handleMicTest = () => {
    setStep('mic-test');
    setIsRecording(true);
    setRecordTimer(MIC_TEST_DURATION);
    setUserAudio(null);
    setUserText('');
  };
  // Завершение теста микрофона
  const handleStopMicTest = () => {
    setIsRecording(false);
    (async () => {
      await sleep(500);
      await pushMessagesWithDelay([
        { from: 'user', text: 'Раз-раз. Тест микрофона.' },
        { from: 'ai', text: 'Всё в порядке! Я слышу тебя хорошо. Когда будешь готов — нажми кнопку ниже, чтобы начать интервью.' },
        { from: 'ai', text: 'Как отвечать на вопросы: внимательно слушай, нажимай «Записать ответ», говори, затем отправляй.' }
      ]);
      setStep('mic-test-done');
    })();
  };

  // Начать интервью
  const handleStartInterview = () => {
    setStep('question');
    (async () => {
      await pushMessagesWithDelay([
        { from: 'ai', text: `Вопрос 1 из ${MOCK_QUESTIONS.length}: ${MOCK_QUESTIONS[0]}` }
      ]);
    })();
  };

  // Мок: начать запись
  const handleStartRecording = () => {
    setIsRecording(true);
    setUserAudio(null);
    setUserText('');
    setRecordTimer(recordDuration);
  };
  // Мок: остановить запись и "отправить" на транскрибацию
  const handleStopRecording = () => {
    setIsRecording(false);
    setIsTranscribing(true);
    setRecordTimer(0);
    // Мок: транскрибация
    setTimeout(() => {
      setIsTranscribing(false);
      setUserText('Мой ответ на вопрос...');
      (async () => {
        await pushMessagesWithDelay([
          { from: 'user', text: 'Мой ответ на вопрос...' },
          { from: 'ai', text: 'Ответ получен. Переходим к следующему вопросу.' }
        ]);
        // Следующий вопрос или финал
        if (currentQuestion + 1 < MOCK_QUESTIONS.length) {
          setCurrentQuestion(q => q + 1);
          await pushMessagesWithDelay([
            { from: 'ai', text: `Вопрос ${currentQuestion + 2} из ${MOCK_QUESTIONS.length}: ${MOCK_QUESTIONS[currentQuestion + 1]}` }
          ]);
        } else {
          setStep('final');
          await pushMessagesWithDelay([
            { from: 'ai', text: 'Спасибо! Интервью завершено. Результаты будут отправлены рекрутеру.' }
          ]);
          setShowFinalBlock(true);
        }
      })();
    }, 1500);
  };

  // Кнопка 'Записать ответ' доступна только после появления вопроса в чате
  const currentQuestionText = `Вопрос ${currentQuestion + 1} из ${MOCK_QUESTIONS.length}: ${MOCK_QUESTIONS[currentQuestion]}`;
  const lastMessage = messages[messages.length - 1];
  const canRecordAnswer = step === 'question'
    && lastMessage && lastMessage.from === 'ai' && lastMessage.text === currentQuestionText
    && !isRecording && !isTranscribing;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f0f3ff] to-[#e6eaff] py-4">
      {/* Фирменный логотип и помощь */}
      <div className="w-full max-w-2xl flex items-center justify-between px-2 sm:px-4 pt-2 pb-1 mb-2">
        <div className="text-2xl font-extrabold tracking-tight" style={{color: 'var(--wmt-orange)'}}>
          WMT Рекрутер
        </div>
        <a href="#" className="text-[color:var(--wmt-orange)] hover:underline text-sm font-medium">Помощь</a>
      </div>
      {/* Стартовый экран-инвайт */}
      {showInvite ? (
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-soft flex flex-col md:flex-row overflow-hidden">
          {/* Левая часть — приглашение */}
          <div className="flex-1 p-8 flex flex-col justify-center gap-4 min-w-[320px]">
            <div className="text-gray-700 text-base mb-1">Привет, <b>{INVITE.candidate}</b></div>
            <div className="text-gray-900 text-lg font-semibold">azhukov приглашает пройти короткое интервью на вакансию:</div>
            <div className="text-2xl font-extrabold" style={{color: 'var(--wmt-orange-dark)'}}>{INVITE.position}</div>
            <div className="flex flex-col gap-1 text-gray-600 text-sm mb-2">
              <div className="flex items-center gap-2"><Users className="h-4 w-4" /> Компания: <b>{INVITE.company}</b></div>
              <div className="flex items-center gap-2"><Globe className="h-4 w-4" /> Язык: <b>{INVITE.language}</b></div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Всего вопросов: <b>{INVITE.questions}</b></div>
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-500 mt-2">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="accent-[color:var(--wmt-orange)]" />
              Я даю согласие на обработку персональных данных и принимаю <a href="#" className="text-[color:var(--wmt-orange)] hover:underline">Политику конфиденциальности</a>
            </label>
            <button
              className="btn-primary w-full h-12 min-h-[48px] mt-4"
              disabled={!consent}
              style={{ opacity: consent ? 1 : 0.6 }}
              onClick={() => {
                setShowInvite(false);
                startIntro();
              }}
            >
              Начать
            </button>
          </div>
          {/* Правая часть — чек-лист */}
          <div className="flex-1 bg-[#f7f8fa] p-8 flex flex-col justify-center gap-4 min-w-[320px] border-t md:border-t-0 md:border-l border-gray-200">
            <div className="text-lg font-bold text-gray-900 mb-2 text-center md:text-left">Перед стартом</div>
            <div className="text-gray-600 text-sm mb-4 text-center md:text-left">Перед началом интервью убедитесь, что:</div>
            <div className="grid grid-cols-1 gap-3">
              {CHECKLIST.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white rounded-lg shadow-sm px-4 py-3">
                  {item.icon}
                  <span className="text-gray-700 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-soft p-0 flex flex-col h-[90vh] max-h-[900px]">
          {/* Чат */}
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto px-8 pt-8 pb-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.from === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`rounded-2xl px-4 py-2 max-w-[70%] ${msg.from === 'ai' ? 'bg-gray-100 text-gray-900' : 'bg-primary-100 text-primary-900'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          {/* Нижняя панель управления */}
          <div className="px-8 pb-8 pt-4 border-t bg-white flex flex-col gap-2 min-h-[110px] justify-center">
            {/* Надпись над кнопкой для всех состояний */}
            {step === 'intro' && introDone && (
              <div className="text-center text-gray-500 text-base mb-2">Готовы начать тест микрофона?</div>
            )}
            {step === 'mic-test' && isRecording && (
              <div className="text-center text-gray-500 text-base mb-2">Идёт тест микрофона...</div>
            )}
            {step === 'mic-test-done' && (
              <div className="text-center text-gray-500 text-base mb-2">Тест микрофона завершён</div>
            )}
            {step === 'question' && !isRecording && !isTranscribing && (
              <div className="text-center text-gray-500 text-base mb-2">
                {canRecordAnswer ? 'Готовы записать ответ?' : 'Ожидаем вопрос'}
              </div>
            )}
            {isRecording && step === 'question' && (
              <div className="text-center text-gray-500 text-base mb-2">Идёт запись... Говорите!</div>
            )}
            {isTranscribing && (
              <div className="text-center text-gray-500 text-base mb-2">Транскрибация ответа...</div>
            )}
            {step === 'final' && showFinalBlock && (
              <div className="flex flex-col items-center gap-2 w-full">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="text-lg font-bold text-gray-900">Спасибо за интервью!</div>
                <div className="text-gray-500 text-sm text-center max-w-xs">
                  Ваши ответы успешно отправлены рекрутеру. После проверки результатов с вами свяжутся по указанным контактам.<br />
                  Спасибо за участие и удачи в дальнейшем отборе!
                </div>
                <div className="text-gray-400 text-xs mt-2">Вы можете закрыть страницу.</div>
              </div>
            )}
            {step === 'intro' && introDone && (
              <button className="btn-primary w-full h-12 min-h-[48px]" onClick={handleMicTest}>Тест микрофона</button>
            )}
            {step === 'mic-test' && isRecording && (
              <button className="w-full h-12 min-h-[48px] flex items-center justify-center gap-2 rounded-lg text-base font-medium transition-colors duration-200 bg-red-500 hover:bg-red-600 text-white px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" style={{maxWidth:'100%'}} onClick={handleStopMicTest}>
                <Send className="h-5 w-5 mr-2" /> Остановить тест
                <span className="ml-2 text-sm font-mono bg-gray-200 text-gray-700 rounded px-2 py-0.5 min-w-[36px] text-center">{recordTimer}s</span>
              </button>
            )}
            {step === 'mic-test-done' && (
              <button className="btn-primary w-full h-12 min-h-[48px]" onClick={handleStartInterview}>Продолжить</button>
            )}
            {canRecordAnswer && (
              <button
                className="w-full h-12 min-h-[48px] flex items-center justify-center gap-2 rounded-lg text-base font-medium transition-colors duration-200 bg-green-500 hover:bg-green-600 text-white px-4"
                style={{maxWidth:'100%'}} onClick={handleStartRecording}
              >
                <Mic className="h-5 w-5 mr-2" /> Записать ответ
              </button>
            )}
            {isRecording && step === 'question' && (
              <button className="w-full h-12 min-h-[48px] flex items-center justify-center gap-2 rounded-lg text-base font-medium transition-colors duration-200 bg-red-500 hover:bg-red-600 text-white px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" style={{maxWidth:'100%'}} onClick={handleStopRecording}>
                <Send className="h-5 w-5 mr-2" /> Остановить запись и отправить
                <span className="ml-2 text-sm font-mono bg-gray-200 text-gray-700 rounded px-2 py-0.5 min-w-[36px] text-center">{recordTimer}s</span>
              </button>
            )}
            {isTranscribing && (
              <button className="w-full h-12 min-h-[48px] flex items-center justify-center gap-2 rounded-lg text-base font-medium transition-colors duration-200 bg-primary-200 text-primary-900 px-4 cursor-not-allowed" style={{maxWidth:'100%'}} disabled>
                <Loader2 className="animate-spin h-6 w-6" style={{color: 'var(--wmt-orange)'}} /> Транскрибация...
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSession; 