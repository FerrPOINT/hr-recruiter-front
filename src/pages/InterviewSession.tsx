import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Send, Loader2, CheckCircle, Mail, Globe, Users, Info, Headphones, Video, Briefcase, Phone } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/apiService';
// TODO: Add branding import when implementing brand styling
// import type { Branding } from '../client/models/branding';
import type { Position } from '../client/models/position';
import type { Candidate } from '../client/models/candidate';
import type { Interview } from '../client/models/interview';
import type { Question } from '../client/models/question';
import toast from 'react-hot-toast';

// --- UI CONSTANTS ---
const MIC_TEST_DURATION = 10; // 10 секунд
const INTRO_MESSAGES = [
  { from: 'ai', text: 'Привет 👋' },
  { from: 'ai', text: 'Я твой виртуальный интервьюер.' },
  { from: 'ai', text: 'Я задам тебе несколько вопросов. Для ответа используй микрофон. Давай проверим, что он работает.' },
  { from: 'ai', text: 'Нажми кнопку «Тест микрофона», чтобы проверить микрофон.' },
];

// --- AUDIO ENHANCEMENT CONSTANTS ---
const AUDIO_ENHANCEMENT_CONFIG = {
  // Настройки усиления микрофона
  gain: {
    value: 2.0, // Усиление в 2 раза
    minValue: 1.0,
    maxValue: 5.0
  },
  // Настройки компрессии
  compression: {
    threshold: -24, // dB
    ratio: 4, // 4:1
    attack: 0.003, // 3ms
    release: 0.25 // 250ms
  },
  // Настройки фильтрации
  filtering: {
    lowPass: 8000, // Hz - убираем высокие частоты
    highPass: 80,  // Hz - убираем низкие частоты
    notch: 50      // Hz - убираем сетевые помехи
  },
  // Настройки шумоподавления
  noiseReduction: {
    enabled: true,
    sensitivity: 0.1, // Чувствительность к шуму
    smoothing: 0.8    // Сглаживание
  }
};

const icons = [<Globe className="h-6 w-6 text-orange-500" />, <Headphones className="h-6 w-6 text-orange-500" />, <Mic className="h-4 w-4 text-orange-500" />, <Info className="h-6 w-6 text-orange-500" />];

const InterviewSession: React.FC = () => {
  const params = useParams<{ sessionId: string }>();
  const [loading, setLoading] = useState(true);
  type InterviewStep = 'invite' | 'intro' | 'mic-test' | 'mic-test-done' | 'question' | 'final';
  const [step, setStep] = useState<InterviewStep>('invite');

  // Data states
  // TODO: Add branding state when implementing brand styling
  // const [branding, setBranding] = useState<Branding | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [checklist, setChecklist] = useState<{ icon: React.ReactNode, text: string }[]>([]);
  const [inviteInfo, setInviteInfo] = useState<{ language: string; questionsCount: number } | null>(null);
  const [interviewSettings, setInterviewSettings] = useState<{ answerTime: number; language: string; saveAudio: boolean; saveVideo: boolean; randomOrder: boolean; minScore: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Chat & Recording states
  const [messages, setMessages] = useState<{ from: string, text: string }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [consent, setConsent] = useState(false);
  const [readyForAnswer, setReadyForAnswer] = useState(false);
  const [interviewAnswerIds, setInterviewAnswerIds] = useState<string[]>([]);

  // Audio recording states
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isAudioSupported, setIsAudioSupported] = useState<boolean>(true);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [currentMimeType, setCurrentMimeType] = useState<string>('audio/mp3');
  const [micTestResult, setMicTestResult] = useState<'pending' | 'success' | 'failed'>('pending');
  const [micTestTries, setMicTestTries] = useState(0);

  // Audio enhancement states
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [compressorNode, setCompressorNode] = useState<DynamicsCompressorNode | null>(null);
  const [lowPassFilter, setLowPassFilter] = useState<BiquadFilterNode | null>(null);
  const [highPassFilter, setHighPassFilter] = useState<BiquadFilterNode | null>(null);
  const [notchFilter, setNotchFilter] = useState<BiquadFilterNode | null>(null);
  const [audioEnhancementEnabled, setAudioEnhancementEnabled] = useState<boolean>(true);
  const [currentGainValue, setCurrentGainValue] = useState<number>(AUDIO_ENHANCEMENT_CONFIG.gain.value);
  const [audioQuality, setAudioQuality] = useState<'poor' | 'good' | 'excellent'>('good');

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
        console.log('Loading interview session with ID:', sessionId);
        if (!sessionId) {
          setError('Некорректный идентификатор сессии.');
          setLoading(false);
          return;
        }
        console.log('Fetching interview data...');
        const interviewData = await apiService.getInterview(parseInt(sessionId));
        console.log('Interview data received:', interviewData);
        if (!interviewData) {
          setError('Собеседование не найдено.');
          setLoading(false);
          return;
        }
        // Исправленный парсинг
        const { interview, candidate: candidateData, position: positionData, questions } = interviewData as any;
        console.log('Extracted data:', { interview, candidate: candidateData, position: positionData, questions });
        if (!interview || !candidateData || !positionData) {
          setError('Неполные данные интервью');
          setLoading(false);
          return;
        }
        setInterview(interview);
        const checklistData = [
          { text: 'Вы используете последнюю версию браузера Chrome или Edge' },
          { text: 'Ваши колонки или наушники включены и работают' },
          { text: 'Ваш микрофон включен и работает' },
          { text: 'Вы в тихом помещении и готовы сконцентрироваться на собеседовании' },
        ];
        setChecklist(checklistData.map((item: any, index: number) => ({ ...item, icon: ICONS.checklist[index] })));
        setInviteInfo({ language: 'Русский', questionsCount: questions?.length || 3 });
        setCandidate(candidateData || null);
        setPosition(positionData || null);
        setQuestions(questions || []);
        setInterviewSettings({
          answerTime: positionData?.answerTime || 60, // берем из вакансии или 60 по умолчанию
          language: positionData?.language || 'Русский',
          saveAudio: positionData?.saveAudio ?? true,
          saveVideo: positionData?.saveVideo ?? false,
          randomOrder: positionData?.randomOrder ?? false,
          minScore: positionData?.minScore || 0
        });
        
        console.log('Interview settings loaded:', {
          answerTime: positionData?.answerTime || 60,
          language: positionData?.language || 'Русский',
          saveAudio: positionData?.saveAudio ?? true,
          saveVideo: positionData?.saveVideo ?? false,
          randomOrder: positionData?.randomOrder ?? false,
          minScore: positionData?.minScore || 0
        });
      } catch (e) {
        console.error('Error loading interview session data:', e);
        setError(`Ошибка загрузки данных: ${e instanceof Error ? e.message : 'Неизвестная ошибка'}`);
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

  const handleMicTestStart = async () => {
    console.log('=== HANDLE MIC TEST START ===');
    console.log('Setting mic test timer to:', MIC_TEST_DURATION, 'seconds');
    setStep('mic-test');
    setRecordTimer(MIC_TEST_DURATION);
    setMicTestResult('pending');
    await startAudioRecording(true); // true = mic test
  };

  const handleMicTestStop = async () => {
    console.log('=== HANDLE MIC TEST STOP START ===');
    const audioBlob = await stopAudioRecording(true); // true = mic test
    console.log('Received audioBlob from stopAudioRecording:', audioBlob);
    console.log('AudioBlob size:', audioBlob?.size, 'bytes');
    
    if (audioBlob && audioBlob.size > 0) {
      console.log('AudioBlob is valid, checking quality...');
      const quality = await checkAudioQuality(audioBlob);
      console.log('Audio quality check result:', quality);
      
      if (!quality.hasSound) {
        console.log('No sound detected, marking test as failed');
        setMicTestResult('failed');
        setMicTestTries(t => t + 1);
        setStep('mic-test-done');
        await pushMessagesWithDelay([
          { from: 'ai', text: 'Не удалось распознать речь. Попробуйте еще раз.' }
        ]);
        return;
      }
      
      console.log('Sound detected, proceeding with transcription...');
      const transcript = await transcribeAudio(audioBlob);
      console.log('Transcription result:', transcript);
      
      if (transcript && transcript.trim().length > 0 && !/^ошибка/i.test(transcript.trim())) {
        console.log('Transcription successful, marking test as success');
        setMicTestResult('success');
        setStep('mic-test-done');
        
        // Добавляем результат в чат
        await pushMessagesWithDelay([
          { from: 'user', text: transcript },
          { from: 'ai', text: 'Отлично! Микрофон работает корректно.' },
          { from: 'ai', text: 'Теперь можно переходить к интервью.' }
        ]);
      } else {
        console.log('Transcription failed or empty, marking test as failed');
        setMicTestResult('failed');
        setMicTestTries(t => t + 1);
        setStep('mic-test-done');
        await pushMessagesWithDelay([
          { from: 'ai', text: 'Не удалось распознать речь. Попробуйте еще раз.' }
        ]);
      }
    } else {
      console.log('AudioBlob is invalid or empty, marking test as failed');
      setMicTestResult('failed');
      setMicTestTries(t => t + 1);
      setStep('mic-test-done');
      await pushMessagesWithDelay([
        { from: 'ai', text: 'Не удалось распознать речь. Попробуйте еще раз.' }
      ]);
    }
    console.log('=== HANDLE MIC TEST STOP END ===');
  };

  const handleStartInterview = async () => {
    console.log('=== HANDLE START INTERVIEW ===');
    console.log('Questions state:', questions);
    console.log('Questions length:', questions?.length);
    console.log('Current step:', step);
    
    // Очищаем ресурсы от теста микрофона перед началом интервью
    cleanupAudioResources();
    
    setStep('question');
    setMessages([]); // Clear chat for questions
    if (questions && questions.length > 0) {
      console.log('Starting interview with questions');
      await pushMessagesWithDelay([
        { from: 'ai', text: `Отлично, начинаем. Вопрос 1 из ${questions.length}.` },
        { from: 'ai', text: questions[0].text || 'Вопрос не найден' }
      ]);
      setReadyForAnswer(true);
    } else {
      console.log('No questions available, ending interview');
      await pushMessagesWithDelay([
        { from: 'ai', text: 'Для этой вакансии пока нет вопросов. Интервью завершено.' }
      ]);
      setStep('final');
    }
  };
  
  const handleStartRecording = async () => {
    console.log('=== HANDLE START RECORDING ===');
    console.log('Starting regular answer recording');
    setReadyForAnswer(false);
    await startAudioRecording(false); // false = regular recording
  };

  const handleStopRecording = async () => {
    console.log('=== HANDLE STOP RECORDING START ===');
    const audioBlob = await stopAudioRecording(false); // false = regular recording
    
    if (audioBlob && audioBlob.size > 0) {
      console.log('Audio blob exists for answer, size:', audioBlob.size);
      console.log('Calling transcribeInterviewAnswer for answer...');
      const transcript = await transcribeInterviewAnswer(audioBlob, currentQuestion);
      await pushMessagesWithDelay([{ from: 'user', text: transcript }]);
    } else {
      console.log('No audio blob available for answer');
      await pushMessagesWithDelay([{ from: 'user', text: 'Ответ не записан' }]);
    }

    const nextQuestionIndex = currentQuestion + 1;
    if (nextQuestionIndex < questions.length) {
      setCurrentQuestion(nextQuestionIndex);
      await pushMessagesWithDelay([
        { from: 'ai', text: 'Отлично, спасибо за ответ.' },
        { from: 'ai', text: `Следующий вопрос ${nextQuestionIndex + 1} из ${questions.length}:` },
        { from: 'ai', text: questions[nextQuestionIndex]?.text || 'Вопрос не найден' }
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
    console.log('=== HANDLE STOP RECORDING END ===');
  };
  
  // Timer effect
  useEffect(() => {
    if (!isRecording || recordTimer <= 0) return;
    const timerId = setTimeout(() => setRecordTimer(t => t - 1), 1000);
    if (recordTimer === 1) {
      if (step === 'mic-test') setTimeout(() => handleMicTestStop(), 1000);
      else if (step === 'question') setTimeout(() => handleStopRecording(), 1000);
    }
    return () => clearTimeout(timerId);
  }, [isRecording, recordTimer, step]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Audio recording functions
  const initializeAudio = async (): Promise<MediaRecorder | null> => {
    try {
      console.log('Initializing enhanced audio with microphone amplification...');
      
      // Проверяем поддержку getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported');
      }
      
      // Улучшенные настройки микрофона для лучшей транскрибации
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Дополнительные настройки для лучшего качества
          sampleRate: 48000, // Высокая частота дискретизации
          channelCount: 1,   // Моно для лучшей транскрибации
          // Расширенные настройки (поддерживаются не всеми браузерами)
          ...(navigator.mediaDevices.getSupportedConstraints().sampleRate && {
            sampleRate: { ideal: 48000, min: 44100 }
          })
        } 
      });
      
      console.log('Enhanced audio stream obtained');
      setAudioStream(stream);
      
      // Создаем AudioContext с высокой частотой дискретизации
      const context = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 48000,
        latencyHint: 'interactive'
      });
      
      // Создаем источник из MediaStream
      const source = context.createMediaStreamSource(stream);
      
      // Создаем цепочку аудио обработки для усиления
      let currentNode: AudioNode = source;
      
      // 1. High-pass фильтр (убираем низкие частоты)
      if (AUDIO_ENHANCEMENT_CONFIG.filtering.highPass > 0) {
        const highPass = context.createBiquadFilter();
        highPass.type = 'highpass';
        highPass.frequency.value = AUDIO_ENHANCEMENT_CONFIG.filtering.highPass;
        highPass.Q.value = 1.0;
        currentNode.connect(highPass);
        setHighPassFilter(highPass);
        currentNode = highPass;
        console.log('High-pass filter added:', AUDIO_ENHANCEMENT_CONFIG.filtering.highPass, 'Hz');
      }
      
      // 2. Notch фильтр (убираем сетевые помехи 50Hz)
      if (AUDIO_ENHANCEMENT_CONFIG.filtering.notch > 0) {
        const notch = context.createBiquadFilter();
        notch.type = 'notch';
        notch.frequency.value = AUDIO_ENHANCEMENT_CONFIG.filtering.notch;
        notch.Q.value = 10.0;
        currentNode.connect(notch);
        setNotchFilter(notch);
        currentNode = notch;
        console.log('Notch filter added:', AUDIO_ENHANCEMENT_CONFIG.filtering.notch, 'Hz');
      }
      
      // 3. Компрессор (улучшает динамический диапазон)
      if (AUDIO_ENHANCEMENT_CONFIG.compression) {
        const compressor = context.createDynamicsCompressor();
        compressor.threshold.value = AUDIO_ENHANCEMENT_CONFIG.compression.threshold;
        compressor.ratio.value = AUDIO_ENHANCEMENT_CONFIG.compression.ratio;
        compressor.attack.value = AUDIO_ENHANCEMENT_CONFIG.compression.attack;
        compressor.release.value = AUDIO_ENHANCEMENT_CONFIG.compression.release;
        compressor.knee.value = 30;
        currentNode.connect(compressor);
        setCompressorNode(compressor);
        currentNode = compressor;
        console.log('Compressor added with ratio:', AUDIO_ENHANCEMENT_CONFIG.compression.ratio);
      }
      
      // 4. Gain node (усиление микрофона)
      const gain = context.createGain();
      gain.gain.value = currentGainValue;
      currentNode.connect(gain);
      setGainNode(gain);
      currentNode = gain;
      console.log('Gain node added with value:', currentGainValue);
      
      // 5. Low-pass фильтр (убираем высокие частоты)
      if (AUDIO_ENHANCEMENT_CONFIG.filtering.lowPass > 0) {
        const lowPass = context.createBiquadFilter();
        lowPass.type = 'lowpass';
        lowPass.frequency.value = AUDIO_ENHANCEMENT_CONFIG.filtering.lowPass;
        lowPass.Q.value = 1.0;
        currentNode.connect(lowPass);
        setLowPassFilter(lowPass);
        currentNode = lowPass;
        console.log('Low-pass filter added:', AUDIO_ENHANCEMENT_CONFIG.filtering.lowPass, 'Hz');
      }
      
      // 6. Анализатор для визуализации
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 512; // Увеличиваем для лучшего разрешения
      analyserNode.smoothingTimeConstant = 0.8;
      analyserNode.minDecibels = -90;
      analyserNode.maxDecibels = -10;
      currentNode.connect(analyserNode);
      
      setAudioContext(context);
      setAnalyser(analyserNode);
      
      // Создаем MediaStreamDestination для записи обработанного аудио
      const destination = context.createMediaStreamDestination();
      analyserNode.connect(destination);
      
      // Проверяем поддержку кодеков - приоритет высокому качеству
      const supportedMimeTypes = [
        'audio/webm;codecs=opus', // Лучший кодек для речи
        'audio/ogg;codecs=opus',  // Альтернатива
        'audio/webm',             // Fallback
        'audio/mp4',              // Универсальный
        'audio/wav'               // Без сжатия
      ];
      
      let mimeType = null;
      for (const type of supportedMimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          console.log('Using supported MIME type for enhanced recording:', type);
          break;
        }
      }
      
      let recorder: MediaRecorder;
      
      if (mimeType) {
        // Используем обработанный аудио поток
        recorder = new MediaRecorder(destination.stream, { mimeType });
        console.log('Using enhanced MediaRecorder with MIME type:', mimeType);
        setCurrentMimeType(mimeType);
      } else {
        console.warn('No supported MIME types found, using default');
        recorder = new MediaRecorder(destination.stream);
        console.log('Using default MediaRecorder settings');
        setCurrentMimeType('audio/webm');
      }
      
      // Настраиваем обработчики событий
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('Enhanced data available, size:', event.data.size);
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      recorder.onstop = () => {
        console.log('=== ENHANCED MEDIA RECORDER ONSTOP ===');
        console.log('Recorded chunks count:', recordedChunks.length);
        const blob = new Blob(recordedChunks, { type: currentMimeType });
        console.log('Created enhanced audio blob, size:', blob.size, 'bytes, type:', currentMimeType);
        setAudioBlob(blob);
        setRecordedChunks([]);
      };
      
      setMediaRecorder(recorder);
      console.log('Enhanced audio initialization completed successfully');
      return recorder;
    } catch (error) {
      console.error('Error initializing enhanced audio:', error);
      setIsAudioSupported(false);
      toast.error('Не удалось получить доступ к микрофону с усилением');
      return null;
    }
  };

  const startAudioRecording = async (isMicTest = false) => {
    console.log('=== START AUDIO RECORDING ===');
    console.log('isMicTest:', isMicTest);
    console.log('Current recordTimer:', recordTimer);
    
    // Проверяем поддержку MediaRecorder
    if (!window.MediaRecorder) {
      console.error('MediaRecorder not supported');
      toast.error('Ваш браузер не поддерживает запись аудио');
      return;
    }
    
    let currentRecorder = mediaRecorder;
    
    // Проверяем, нужно ли создать новый MediaRecorder
    if (!currentRecorder || currentRecorder.state === 'inactive') {
      console.log('Creating new MediaRecorder...');
      currentRecorder = await initializeAudio();
      if (!currentRecorder) {
        console.log('Failed to initialize audio');
        return;
      }
      // Ждем немного для инициализации
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (currentRecorder && currentRecorder.state === 'inactive') {
      console.log('Starting mediaRecorder...');
      setRecordedChunks([]);
      setAudioBlob(null);
      currentRecorder.start();
      setIsRecording(true);
      
      // Устанавливаем таймер только для обычной записи ответов, НЕ для теста микрофона
      if (!isMicTest && recordTimer === 0) {
        const answerTime = interviewSettings?.answerTime || 60;
        console.log('Setting record timer to:', answerTime, 'seconds (for regular answer recording)');
        setRecordTimer(answerTime);
      } else if (isMicTest) {
        console.log('Mic test mode - using existing timer value:', recordTimer, 'seconds');
      } else {
        console.log('Regular recording mode - using existing timer value:', recordTimer, 'seconds');
      }
      
      // Запускаем анализ уровня звука
      const audioLevelInterval = setInterval(() => {
        analyzeAudioLevel();
        // Автоматически настраиваем усиление каждые 2 секунды
        if (audioEnhancementEnabled) {
          adjustGainDynamically(50);
        }
      }, 100);
      
      // Сохраняем интервал для очистки
      (window as any).audioLevelInterval = audioLevelInterval;
    } else {
      console.log('MediaRecorder not ready or already recording, state:', currentRecorder?.state);
    }

    // Для микротеста используем локальный массив
    if (isMicTest) {
      const w = window as any;
      w._micTestChunks = [];
      console.log('Initialized mic test chunks array');
      
      if (currentRecorder) {
        currentRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            w._micTestChunks.push(event.data);
            console.log('Mic test chunk added, size:', event.data.size, 'total chunks:', w._micTestChunks.length);
          }
        };
        
        // Принудительно запрашиваем данные каждую секунду для теста микрофона
        const dataInterval = setInterval(() => {
          if (currentRecorder && currentRecorder.state === 'recording') {
            currentRecorder.requestData();
          } else {
            clearInterval(dataInterval);
          }
        }, 1000);
        
        // Сохраняем интервал для очистки
        (window as any).micTestDataInterval = dataInterval;
      }
    } else {
      // Для обычной записи также используем принудительный запрос данных
      const w = window as any;
      w._regularRecordingChunks = [];
      console.log('Initialized regular recording chunks array');
      
      if (currentRecorder) {
        currentRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            w._regularRecordingChunks.push(event.data);
            console.log('Regular recording chunk added, size:', event.data.size, 'total chunks:', w._regularRecordingChunks.length);
          }
        };
        
        // Принудительно запрашиваем данные каждую секунду для обычной записи
        const dataInterval = setInterval(() => {
          if (currentRecorder && currentRecorder.state === 'recording') {
            currentRecorder.requestData();
          } else {
            clearInterval(dataInterval);
          }
        }, 1000);
        
        // Сохраняем интервал для очистки
        (window as any).regularRecordingDataInterval = dataInterval;
      }
    }
  };

  const stopAudioRecording = async (isMicTest = false) => {
    console.log('=== STOP AUDIO RECORDING ===');
    console.log('isMicTest:', isMicTest);
    
    // Останавливаем анализ уровня звука
    if ((window as any).audioLevelInterval) {
      clearInterval((window as any).audioLevelInterval);
      (window as any).audioLevelInterval = null;
      console.log('Audio level analysis stopped');
    }
    
    // Останавливаем интервал запроса данных для теста микрофона
    if (isMicTest && (window as any).micTestDataInterval) {
      clearInterval((window as any).micTestDataInterval);
      (window as any).micTestDataInterval = null;
      console.log('Mic test data interval stopped');
    }
    
    // Останавливаем интервал запроса данных для обычной записи
    if (!isMicTest && (window as any).regularRecordingDataInterval) {
      clearInterval((window as any).regularRecordingDataInterval);
      (window as any).regularRecordingDataInterval = null;
      console.log('Regular recording data interval stopped');
    }
    
    // Получаем актуальный mediaRecorder из состояния
    const currentRecorder = mediaRecorder;
    console.log('Current recorder state:', currentRecorder?.state);
    
    if (!currentRecorder || currentRecorder.state !== 'recording') {
      console.log('MediaRecorder not recording, state:', currentRecorder?.state);
      return null;
    }
    
    if (isMicTest) {
      // Для теста микрофона используем Promise
      console.log('Stopping mic test recording...');
      return new Promise<Blob>((resolve) => {
        const w = window as any;
        const micTestChunks = w._micTestChunks || [];
        console.log('Mic test chunks count:', micTestChunks.length);
        
        currentRecorder.onstop = () => {
          console.log('Mic test onstop triggered');
          // Используем сохраненный MIME тип
          const blob = new Blob(micTestChunks, { type: currentMimeType });
          console.log('Created mic test blob, size:', blob.size, 'bytes, type:', currentMimeType);
          setIsRecording(false);
          setRecordTimer(0);
          resolve(blob);
        };
        
        currentRecorder.stop();
      });
    } else {
      // Для обычной записи
      console.log('Stopping regular recording...');
      return new Promise<Blob>((resolve) => {
        const w = window as any;
        const regularRecordingChunks = w._regularRecordingChunks || [];
        console.log('Regular recording chunks count:', regularRecordingChunks.length);
        
        currentRecorder.onstop = () => {
          console.log('Regular recording onstop triggered');
          // Используем сохраненный MIME тип
          const blob = new Blob(regularRecordingChunks, { type: currentMimeType });
          console.log('Created regular recording blob, size:', blob.size, 'bytes, type:', currentMimeType);
          setIsRecording(false);
          setRecordTimer(0);
          resolve(blob);
        };
        
        currentRecorder.stop();
      });
    }
  };

  // Улучшенный анализ уровня звука с динамическим усилением
  const analyzeAudioLevel = () => {
    if (!analyser) return;
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    // Улучшенный алгоритм анализа уровня звука
    let sum = 0;
    let count = 0;
    
    // Фокусируемся на речевых частотах (80Hz - 8000Hz)
    const speechFrequencies = dataArray.slice(2, Math.floor(dataArray.length * 0.8));
    
    for (let i = 0; i < speechFrequencies.length; i++) {
      if (speechFrequencies[i] > 0) {
        sum += speechFrequencies[i];
        count++;
      }
    }
    
    const average = count > 0 ? sum / count : 0;
    
    // Применяем логарифмическую шкалу для более естественного отображения
    const normalizedLevel = Math.min(100, Math.pow(average / 255, 0.5) * 100 * 3);
    
    // Динамическое усиление на основе текущего уровня
    let enhancedLevel = normalizedLevel;
    if (normalizedLevel < 20) {
      // Усиливаем тихие звуки
      enhancedLevel = normalizedLevel * 2;
    } else if (normalizedLevel > 80) {
      // Сглаживаем громкие звуки
      enhancedLevel = 80 + (normalizedLevel - 80) * 0.5;
    }
    
    setAudioLevel(enhancedLevel);
    
    // Автоматически настраиваем качество аудио
    if (enhancedLevel < 10) {
      setAudioQuality('poor');
    } else if (enhancedLevel < 30) {
      setAudioQuality('good');
    } else {
      setAudioQuality('excellent');
    }
  };

  // Функция для динамического усиления микрофона
  const adjustGainDynamically = (targetLevel: number = 50) => {
    if (!gainNode) return;
    
    const currentLevel = audioLevel;
    let newGain = currentGainValue;
    
    if (currentLevel < targetLevel * 0.5) {
      // Слишком тихо - увеличиваем усиление
      newGain = Math.min(AUDIO_ENHANCEMENT_CONFIG.gain.maxValue, currentGainValue * 1.2);
    } else if (currentLevel > targetLevel * 1.5) {
      // Слишком громко - уменьшаем усиление
      newGain = Math.max(AUDIO_ENHANCEMENT_CONFIG.gain.minValue, currentGainValue * 0.8);
    }
    
    if (newGain !== currentGainValue) {
      gainNode.gain.setValueAtTime(newGain, audioContext?.currentTime || 0);
      setCurrentGainValue(newGain);
      console.log('Dynamic gain adjustment:', currentGainValue, '->', newGain);
    }
  };

  // Простая транскрибация для тестирования микрофона
  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    console.log('=== TRANSCRIBE AUDIO START ===');
    console.log('Audio blob size:', audioBlob.size, 'bytes');
    console.log('Audio blob type:', audioBlob.type);
    
    // Дополнительная проверка качества
    if (audioBlob.size === 0) {
      console.error('Audio blob is empty');
      return 'Аудио файл пуст';
    }
    
    if (audioBlob.size < 1024) { // Меньше 1KB
      console.warn('Audio blob is very small, might be silent');
    }
    
    try {
      setIsTranscribing(true);
      
      // Определяем расширение файла на основе MIME типа
      const getFileExtension = (mimeType: string) => {
        if (mimeType.includes('mp3') || mimeType.includes('mpeg')) return 'mp3';
        if (mimeType.includes('wav')) return 'wav';
        if (mimeType.includes('ogg')) return 'ogg';
        if (mimeType.includes('webm')) return 'webm';
        return 'mp3'; // fallback
      };
      
      const fileExtension = getFileExtension(audioBlob.type);
      const fileName = `recording.${fileExtension}`;
      
      // Конвертируем Blob в File для API
      const audioFile = new File([audioBlob], fileName, { type: audioBlob.type });
      console.log('Created audio file:', audioFile.name, audioFile.size, 'bytes, type:', audioFile.type);
      
      // Проверяем, что файл создался корректно
      if (audioFile.size !== audioBlob.size) {
        console.error('File size mismatch:', audioFile.size, 'vs', audioBlob.size);
      }
      
      console.log('Calling apiService.transcribeAudio...');
      const response = await apiService.transcribeAudio(audioFile);
      console.log('Transcription response:', response);
      
      // Используем тот же формат ответа, что и для интервью
      const transcript = response.transcript || 'Текст не распознан';
      console.log('Final transcript:', transcript);
      console.log('=== TRANSCRIBE AUDIO END ===');
      
      return transcript;
    } catch (error: any) {
      console.error('=== TRANSCRIBE AUDIO ERROR ===');
      console.error('Error transcribing audio:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      toast.error('Ошибка транскрибации аудио');
      return 'Ошибка распознавания речи';
    } finally {
      setIsTranscribing(false);
    }
  };

  // Продвинутая транскрибация для ответов на вопросы интервью с сохранением в БД
  const transcribeInterviewAnswer = async (audioBlob: Blob, questionIndex: number): Promise<string> => {
    console.log('=== TRANSCRIBE INTERVIEW ANSWER START ===');
    console.log('Audio blob size:', audioBlob.size, 'bytes');
    console.log('Question index:', questionIndex);
    
    // Дополнительная проверка качества
    if (audioBlob.size === 0) {
      console.error('Audio blob is empty');
      return 'Аудио файл пуст';
    }
    
    if (audioBlob.size < 1024) { // Меньше 1KB
      console.warn('Audio blob is very small, might be silent');
    }
    
    try {
      setIsTranscribing(true);
      
      // Определяем расширение файла на основе MIME типа
      const getFileExtension = (mimeType: string) => {
        if (mimeType.includes('mp3') || mimeType.includes('mpeg')) return 'mp3';
        if (mimeType.includes('wav')) return 'wav';
        if (mimeType.includes('ogg')) return 'ogg';
        if (mimeType.includes('webm')) return 'webm';
        return 'mp3'; // fallback
      };
      
      const fileExtension = getFileExtension(audioBlob.type);
      const fileName = `recording.${fileExtension}`;
      
      // Конвертируем Blob в File для API
      const audioFile = new File([audioBlob], fileName, { type: audioBlob.type });
      console.log('Created audio file:', audioFile.name, audioFile.size, 'bytes, type:', audioFile.type);
      
      // Проверяем, что файл создался корректно
      if (audioFile.size !== audioBlob.size) {
        console.error('File size mismatch:', audioFile.size, 'vs', audioBlob.size);
      }
      
      // Получаем ID интервью и вопроса
      const interviewId = parseInt(params.sessionId || '0');
      const questionId = questions[questionIndex]?.id || 0;
      
      console.log('Interview ID:', interviewId, 'Question ID:', questionId);
      
      if (!interviewId || !questionId) {
        throw new Error('Missing interview ID or question ID');
      }
      
      console.log('Calling apiService.transcribeInterviewAnswer...');
      const response = await apiService.transcribeInterviewAnswer(audioFile, interviewId, questionId);
      console.log('Interview answer transcription response:', response);
      
      // Сохраняем ID ответа
      setInterviewAnswerIds(prev => {
        const newIds = [...prev];
        newIds[questionIndex] = response.interviewAnswerId;
        return newIds;
      });
      
      const transcript = response.formattedText || 'Текст не распознан';
      console.log('Final formatted transcript:', transcript);
      console.log('=== TRANSCRIBE INTERVIEW ANSWER END ===');
      
      return transcript;
    } catch (error: any) {
      console.error('=== TRANSCRIBE INTERVIEW ANSWER ERROR ===');
      console.error('Error transcribing interview answer:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      toast.error('Ошибка обработки ответа');
      return 'Ошибка распознавания речи';
    } finally {
      setIsTranscribing(false);
    }
  };

  // Улучшенная функция для проверки качества записи
  const checkAudioQuality = (audioBlob: Blob): Promise<{ hasSound: boolean; quality: 'good' | 'poor' | 'silent' }> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(audioBlob);
      
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        
        // Улучшенная проверка качества с учетом усиления
        const sizeInKB = audioBlob.size / 1024;
        const durationInSeconds = audio.duration;
        
        // Более точные критерии качества
        if (sizeInKB < 3 || durationInSeconds < 0.5) {
          resolve({ hasSound: false, quality: 'silent' });
        } else if (sizeInKB < 10 || durationInSeconds < 2) {
          resolve({ hasSound: true, quality: 'poor' });
        } else if (sizeInKB < 30) {
          resolve({ hasSound: true, quality: 'good' });
        } else {
          resolve({ hasSound: true, quality: 'good' });
        }
        
        console.log(`Audio quality check: ${sizeInKB.toFixed(1)}KB, ${durationInSeconds.toFixed(1)}s, gain: ${currentGainValue}x`);
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ hasSound: false, quality: 'silent' });
      };
      
      audio.src = url;
    });
  };

  // Функция для очистки аудио ресурсов
  const cleanupAudioResources = () => {
    console.log('=== CLEANUP ENHANCED AUDIO RESOURCES ===');
    
    // Останавливаем интервалы
    if ((window as any).audioLevelInterval) {
      clearInterval((window as any).audioLevelInterval);
      (window as any).audioLevelInterval = null;
      console.log('Audio level interval cleared');
    }
    
    if ((window as any).micTestDataInterval) {
      clearInterval((window as any).micTestDataInterval);
      (window as any).micTestDataInterval = null;
      console.log('Mic test data interval cleared');
    }
    
    if ((window as any).regularRecordingDataInterval) {
      clearInterval((window as any).regularRecordingDataInterval);
      (window as any).regularRecordingDataInterval = null;
      console.log('Regular recording data interval cleared');
    }
    
    // Останавливаем MediaRecorder если он записывает
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      console.log('Stopping active MediaRecorder');
      mediaRecorder.stop();
    }
    
    // Отключаем все аудио узлы
    if (gainNode) {
      gainNode.disconnect();
      console.log('Gain node disconnected');
    }
    
    if (compressorNode) {
      compressorNode.disconnect();
      console.log('Compressor node disconnected');
    }
    
    if (lowPassFilter) {
      lowPassFilter.disconnect();
      console.log('Low-pass filter disconnected');
    }
    
    if (highPassFilter) {
      highPassFilter.disconnect();
      console.log('High-pass filter disconnected');
    }
    
    if (notchFilter) {
      notchFilter.disconnect();
      console.log('Notch filter disconnected');
    }
    
    // Закрываем AudioContext
    if (audioContext && audioContext.state !== 'closed') {
      console.log('Closing AudioContext');
      audioContext.close();
    }
    
    // Останавливаем все треки в MediaStream
    if (audioStream) {
      console.log('Stopping all audio tracks');
      audioStream.getTracks().forEach(track => {
        track.stop();
        console.log('Audio track stopped:', track.kind);
      });
    }
    
    // Очищаем состояния
    setMediaRecorder(null);
    setAudioContext(null);
    setAnalyser(null);
    setAudioStream(null);
    setGainNode(null);
    setCompressorNode(null);
    setLowPassFilter(null);
    setHighPassFilter(null);
    setNotchFilter(null);
    setRecordedChunks([]);
    setAudioBlob(null);
    setIsRecording(false);
    setRecordTimer(0);
    setAudioLevel(0);
    setCurrentGainValue(AUDIO_ENHANCEMENT_CONFIG.gain.value);
    setAudioQuality('good');
    
    console.log('Enhanced audio resources cleanup completed');
  };

  // Очистка ресурсов при размонтировании компонента
  useEffect(() => {
    return () => {
      cleanupAudioResources();
    };
  }, []);

  // Очистка ресурсов при изменении шага интервью
  useEffect(() => {
    if (step === 'final') {
      // Очищаем ресурсы при завершении интервью
      setTimeout(() => {
        cleanupAudioResources();
      }, 1000); // Небольшая задержка для завершения текущих операций
    }
  }, [step]);

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
          {/* TODO: Apply branding - use company name and logo from branding */}
          <span className="text-5xl font-extrabold tracking-tight text-wmt-orange mb-6 block">
            {'WMT Рекрутер'}
          </span>
          {/* TODO: Apply branding - use primary/secondary colors from branding */}
          <h1 className="text-2xl font-semibold text-white leading-tight">
            Собеседование на позицию<br />
            <span className="text-3xl font-bold text-wmt-orange">"{position.title}"</span>
          </h1>
        </div>
        {/* TODO: Apply branding - use company styling for details section */}
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
              <div className="text-lg font-medium text-white">{questions?.length ?? 0}</div>
            </div>
          </div>
        </div>
        {/* TODO: Apply branding - use company colors for checklist items */}
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
        {/* TODO: Apply branding - use company colors for consent checkbox */}
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
        {/* TODO: Apply branding - use company colors and styling for start button */}
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
    if (!questions?.length || step !== 'question') return null;
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
                  className="w-full btn-primary py-3 flex items-center justify-center"
                >
                  <Mic className="h-5 w-5 mr-2" />
                  Тест микрофона
                </button>
              )}
              {(step as InterviewStep) === 'mic-test' && isRecording && (
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
              {(step as InterviewStep) === 'mic-test' && isTranscribing && (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Обработка записи...</span>
                </div>
              )}
              {(step as InterviewStep) === 'mic-test-done' && micTestResult === 'failed' && (
                <div className="space-y-4">
                  <button
                    onClick={handleMicTestStart}
                    className="w-full btn-primary py-3 flex items-center justify-center"
                  >
                    <Mic className="h-5 w-5 mr-2" />
                    Повторить тест микрофона
                  </button>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Советы для лучшей записи:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Говорите четко и громко</li>
                      <li>• Держитесь ближе к микрофону</li>
                      <li>• Убедитесь, что в помещении тихо</li>
                      <li>• Проверьте настройки микрофона в системе</li>
                    </ul>
                  </div>
                </div>
              )}
              {(step as InterviewStep) === 'mic-test-done' && micTestResult === 'success' && (
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
                <div className="space-y-4">
                  <button
                    onClick={handleStartRecording}
                    className="w-full btn-primary py-3"
                  >
                    Записать ответ
                  </button>
                </div>
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
                  Интервью завершено, можете закрыть вкладку
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