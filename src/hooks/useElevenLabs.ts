import { useState, useEffect, useCallback, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';

interface VoiceSessionState {
  sessionId: string | null;
  status: 'idle' | 'connecting' | 'connected' | 'error' | 'ended';
  isListening: boolean;
  isSpeaking: boolean;
  isAgentSpeaking: boolean;
  isUserListening: boolean;
  currentQuestion: number;
  questions: string[];
  answers: Array<{
    questionId: number;
    text: string;
    durationMs: number;
    confidence: number;
    timestamp: string;
  }>;
}

interface UseElevenLabsOptions {
  agentId: string;
  voiceId?: string;
  onMessage?: (message: string) => void;
  onError?: (error: string) => void;
  onSessionEnd?: () => void;
  onAgentStart?: () => void;
  onAgentEnd?: () => void;
  onUserStart?: () => void;
  onUserEnd?: () => void;
}

export const useElevenLabs = (options: UseElevenLabsOptions) => {
  const { agentId, voiceId, onMessage, onError, onSessionEnd, onAgentStart, onAgentEnd, onUserStart, onUserEnd } = options;
  
  const [state, setState] = useState<VoiceSessionState>({
    sessionId: null,
    status: 'idle',
    isListening: false,
    isSpeaking: false,
    isAgentSpeaking: false,
    isUserListening: false,
    currentQuestion: 0,
    questions: [],
    answers: []
  });

  const conversation = useConversation({
    apiKey: process.env.REACT_APP_ELEVENLABS_API_KEY || 'dummy-key',
    voiceId: voiceId || 'pNInz6obpgDQGcFmaJgB',
    agentId: agentId
  });
  const sessionRef = useRef<string | null>(null);
  const isInitialized = useRef(false);

  // Проверяем инициализацию conversation
  useEffect(() => {
    if (conversation) {
      console.log('✅ ElevenLabs conversation initialized');
    } else {
      console.warn('⚠️ ElevenLabs conversation not initialized');
    }
  }, [conversation]);

  // Безопасные методы для работы с conversation
  const safeStartSession = useCallback(async () => {
    if (!conversation) {
      throw new Error('Conversation not initialized');
    }

    try {
      // Проверяем наличие метода startSession
      if (typeof (conversation as any).startSession === 'function') {
        const session = await (conversation as any).startSession({
          agentId,
          voiceId: voiceId || 'pNInz6obpgDQGcFmaJgB', // Adam по умолчанию
          onMessage: (message: any) => {
            console.log('📨 Получено сообщение от агента:', message);
            if (onMessage) {
              onMessage(message.text || message);
            }
          },
          onError: (error: any) => {
            console.error('❌ Ошибка в сессии:', error);
            if (onError) {
              onError(error.message || 'Ошибка в голосовой сессии');
            }
          },
          onAgentStart: () => {
            console.log('🤖 Агент начал говорить');
            setState(prev => ({ 
              ...prev, 
              isAgentSpeaking: true,
              isSpeaking: true 
            }));
            if (onAgentStart) onAgentStart();
          },
          onAgentEnd: () => {
            console.log('🤖 Агент закончил говорить');
            setState(prev => ({ 
              ...prev, 
              isAgentSpeaking: false,
              isSpeaking: false 
            }));
            if (onAgentEnd) onAgentEnd();
          },
          onUserStart: () => {
            console.log('👤 Пользователь начал говорить');
            setState(prev => ({ 
              ...prev, 
              isUserListening: true,
              isListening: true 
            }));
            if (onUserStart) onUserStart();
          },
          onUserEnd: () => {
            console.log('👤 Пользователь закончил говорить');
            setState(prev => ({ 
              ...prev, 
              isUserListening: false,
              isListening: false 
            }));
            if (onUserEnd) onUserEnd();
          }
        });
        
        sessionRef.current = session?.sessionId || null;
        return session;
      } else {
        throw new Error('startSession method not available');
      }
    } catch (error) {
      console.error('❌ Ошибка запуска сессии:', error);
      throw error;
    }
  }, [conversation, agentId, voiceId, onMessage, onError, onAgentStart, onAgentEnd, onUserStart, onUserEnd]);

  const safeStopSession = useCallback(async () => {
    if (!conversation) {
      return;
    }

    try {
      // Проверяем наличие метода stopSession
      if (typeof (conversation as any).stopSession === 'function') {
        await (conversation as any).stopSession();
        console.log('🛑 Сессия остановлена');
      } else {
        console.warn('⚠️ stopSession method not available');
      }
    } catch (error) {
      console.error('❌ Ошибка остановки сессии:', error);
    }
  }, [conversation]);

  const safeSendMessage = useCallback(async (text: string) => {
    if (!conversation) {
      throw new Error('Conversation not initialized');
    }

    try {
      // Проверяем наличие метода sendMessage
      if (typeof (conversation as any).sendMessage === 'function') {
        await (conversation as any).sendMessage(text);
        console.log('📤 Сообщение отправлено:', text);
      } else {
        throw new Error('sendMessage method not available');
      }
    } catch (error) {
      console.error('❌ Ошибка отправки сообщения:', error);
      throw error;
    }
  }, [conversation]);

  // Инициализация сессии
  const startSession = useCallback(async () => {
    if (isInitialized.current) {
      console.log('⚠️ Сессия уже инициализирована');
      return;
    }

    try {
      setState(prev => ({ ...prev, status: 'connecting' }));
      
      const session = await safeStartSession();
      
      setState(prev => ({
        ...prev,
        sessionId: session?.sessionId || null,
        status: 'connected'
      }));
      
      isInitialized.current = true;
      console.log('✅ Голосовая сессия запущена');
      
    } catch (error) {
      console.error('❌ Ошибка запуска сессии:', error);
      setState(prev => ({ ...prev, status: 'error' }));
      if (onError) {
        onError(error instanceof Error ? error.message : 'Неизвестная ошибка');
      }
    }
  }, [safeStartSession, onError]);

  // Остановка сессии
  const stopSession = useCallback(async () => {
    try {
      await safeStopSession();
      
      setState(prev => ({
        ...prev,
        status: 'ended',
        isListening: false,
        isSpeaking: false,
        isAgentSpeaking: false,
        isUserListening: false
      }));
      
      isInitialized.current = false;
      sessionRef.current = null;
      
      if (onSessionEnd) {
        onSessionEnd();
      }
      
      console.log('✅ Сессия завершена');
      
    } catch (error) {
      console.error('❌ Ошибка остановки сессии:', error);
    }
  }, [safeStopSession, onSessionEnd]);

  // Отправка сообщения
  const sendMessage = useCallback(async (text: string) => {
    if (state.status !== 'connected') {
      throw new Error('Сессия не активна');
    }

    try {
      await safeSendMessage(text);
      
      // Добавляем сообщение в историю
      setState(prev => ({
        ...prev,
        answers: [...prev.answers, {
          questionId: prev.currentQuestion,
          text,
          durationMs: 0, // TODO: измерить реальную длительность
          confidence: 1.0, // TODO: получить реальную уверенность
          timestamp: new Date().toISOString()
        }]
      }));
      
    } catch (error) {
      console.error('❌ Ошибка отправки сообщения:', error);
      throw error;
    }
  }, [safeSendMessage, state.status]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (isInitialized.current) {
        safeStopSession();
      }
    };
  }, [safeStopSession]);

  return {
    // Состояние
    sessionId: state.sessionId,
    status: state.status,
    isListening: state.isListening,
    isSpeaking: state.isSpeaking,
    isAgentSpeaking: state.isAgentSpeaking,
    isUserListening: state.isUserListening,
    currentQuestion: state.currentQuestion,
    questions: state.questions,
    answers: state.answers,
    
    // Методы
    startSession,
    stopSession,
    sendMessage,
    
    // Утилиты
    isConnected: state.status === 'connected',
    hasError: state.status === 'error',
    isEnded: state.status === 'ended'
  };
}; 