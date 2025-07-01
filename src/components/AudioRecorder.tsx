import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, Volume2, AlertCircle, CheckCircle } from 'lucide-react';
import { audioService, AudioRecordingOptions, AudioTranscriptionResult } from '../services/audioService';
import toast from 'react-hot-toast';

interface AudioRecorderProps {
  onRecordingComplete?: (blob: Blob) => void;
  onTranscriptionComplete?: (result: AudioTranscriptionResult) => void;
  autoTranscribe?: boolean;
  duration?: number;
  quality?: 'low' | 'medium' | 'high';
  format?: 'wav' | 'webm' | 'mp3';
  showLevel?: boolean;
  showTimer?: boolean;
  disabled?: boolean;
  className?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onTranscriptionComplete,
  autoTranscribe = false,
  duration,
  quality = 'high',
  format = 'webm',
  showLevel = true,
  showTimer = true,
  disabled = false,
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [timer, setTimer] = useState(0);
  const [support, setSupport] = useState<{
    isBrowser: boolean;
    getUserMedia: boolean;
    mediaRecorder: boolean;
    audioContext: boolean;
    supportedFormats: string[];
  } | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const levelRef = useRef<HTMLDivElement>(null);

  // Проверяем поддержку при монтировании
  useEffect(() => {
    checkSupport();
  }, []);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      audioService.cleanup();
    };
  }, []);

  const checkSupport = async () => {
    try {
      const supportInfo = await audioService.checkSupport();
      setSupport(supportInfo);
      
      if (!supportInfo.isBrowser) {
        setError('Запись аудио доступна только в браузере');
      } else if (!supportInfo.getUserMedia || !supportInfo.mediaRecorder) {
        setError('Ваш браузер не поддерживает запись аудио');
      }
    } catch (error) {
      setError('Ошибка проверки поддержки аудио');
    }
  };

  const requestPermission = async () => {
    try {
      setError(null);
      await audioService.requestPermission();
      setHasPermission(true);
      toast.success('Доступ к микрофону получен');
    } catch (error) {
      setError('Не удалось получить доступ к микрофону');
      toast.error('Ошибка доступа к микрофону');
    }
  };

  const startRecording = async () => {
    if (disabled || !hasPermission) {
      if (!hasPermission) {
        await requestPermission();
      }
      return;
    }

    try {
      setError(null);
      setIsRecording(true);
      setTimer(0);

      // Настраиваем обработчики
      audioService.setLevelChangeHandler(setAudioLevel);

      // Начинаем запись
      const options: AudioRecordingOptions = {
        duration,
        quality,
        format
      };

      await audioService.startRecording(options);

      // Запускаем таймер
      if (showTimer) {
        timerRef.current = setInterval(() => {
          setTimer(prev => prev + 1);
        }, 1000);
      }

      toast.success('Запись начата');
    } catch (error) {
      setIsRecording(false);
      setError(`Ошибка начала записи: ${error}`);
      toast.error('Ошибка начала записи');
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    try {
      // Останавливаем таймер
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Останавливаем запись
      const audioBlob = await audioService.stopRecording();
      setIsRecording(false);
      setAudioLevel(0);

      // Вызываем callback
      if (onRecordingComplete) {
        onRecordingComplete(audioBlob);
      }

      // Автоматическая транскрибация
      if (autoTranscribe) {
        await transcribeAudio(audioBlob);
      }

      toast.success('Запись завершена');
    } catch (error) {
      setIsRecording(false);
      setError(`Ошибка остановки записи: ${error}`);
      toast.error('Ошибка остановки записи');
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      const result = await audioService.transcribeAudio(audioBlob);
      
      if (onTranscriptionComplete) {
        onTranscriptionComplete(result);
      }

      if (result.success) {
        toast.success('Транскрибация завершена');
      } else {
        toast.error('Ошибка транскрибации');
      }
    } catch (error) {
      toast.error('Ошибка транскрибации');
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getLevelColor = (level: number): string => {
    if (level < 10) return 'bg-red-500';
    if (level < 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!support) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error && !hasPermission) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 space-y-2 ${className}`}>
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-gray-600 text-center">{error}</p>
        <button
          onClick={requestPermission}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Разрешить доступ к микрофону
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-4 p-4 border rounded-lg ${className}`}>
      {/* Индикатор уровня звука */}
      {showLevel && (
        <div className="flex items-center space-x-2">
          <Volume2 className="h-4 w-4 text-gray-500" />
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              ref={levelRef}
              className={`h-full transition-all duration-100 ${getLevelColor(audioLevel)}`}
              style={{ width: `${audioLevel}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 w-8">{Math.round(audioLevel)}%</span>
        </div>
      )}

      {/* Таймер */}
      {showTimer && (
        <div className="text-lg font-mono">
          {formatTime(timer)}
        </div>
      )}

      {/* Кнопки управления */}
      <div className="flex items-center space-x-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={disabled || !hasPermission}
            className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Mic className="h-5 w-5" />
            <span>Начать запись</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
          >
            <Square className="h-5 w-5" />
            <span>Остановить запись</span>
          </button>
        )}
      </div>

      {/* Статус транскрибации */}
      {isTranscribing && (
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Транскрибируем аудио...</span>
        </div>
      )}

      {/* Информация о поддержке */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>Формат: {format.toUpperCase()}</div>
        <div>Качество: {quality}</div>
        {duration && <div>Длительность: {duration}с</div>}
      </div>

      {/* Ошибки */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}; 