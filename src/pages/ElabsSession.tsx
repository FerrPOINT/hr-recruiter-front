import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoiceInterviewService, { VoiceQuestion } from '../services/voiceInterviewService';
import { useAuthStore } from '../store/authStore';
import ElevenLabsConversation from '../components/ElevenLabsConversation';

interface ElabsSessionProps {
  useProxy?: boolean;
  backendUrl?: string;
  apiKey?: string;
}

const ElabsSession: React.FC<ElabsSessionProps> = ({ 
  useProxy = true, 
  backendUrl = 'http://localhost:8080',
  apiKey 
}) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const interviewId = parseInt(sessionId || '0');
  const navigate = useNavigate();
  
  // Локальное состояние
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interviewData, setInterviewData] = useState<any>(null);
  const [agentId, setAgentId] = useState<string>('');
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<VoiceQuestion | null>(null);
  
  // Рефы
  const sessionInitialized = useRef(false);

  // Инициализация сессии
  useEffect(() => {
    if (!interviewId || interviewId === 0) {
      setError('ID интервью не указан');
      setIsLoading(false);
      return;
    }

    const initializeSession = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Проверяем токен
        const token = useAuthStore.getState().token;
        if (!token) {
          setError('Токен авторизации отсутствует');
          setIsLoading(false);
          return;
        }

        console.log(`🎤 Инициализация сессии для интервью ${interviewId}...`);
        
        // Запускаем интервью на бэкенде (создает агента и возвращает все данные)
        const startResponse = await VoiceInterviewService.startInterview(interviewId, {
          voiceMode: true,
          autoCreateAgent: true
        });
        
        // Сохраняем данные из ответа
        setInterviewData(startResponse);
        console.log('✅ Данные интервью получены:', startResponse);
        
        const { agentId: newAgentId } = startResponse;
        setAgentId(newAgentId);
        console.log('✅ Агент создан на бэкенде:', newAgentId);
        
        // Помечаем как готовую к подключению
        setIsConnected(true);
        sessionInitialized.current = true;
        
      } catch (err: any) {
        console.error('❌ Ошибка инициализации сессии:', err);
        setError(err.response?.data?.message || 'Не удалось инициализировать сессию');
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, [interviewId]);

  // Завершение интервью
  const handleFinishInterview = async () => {
    try {
      await VoiceInterviewService.finishInterview(interviewId);
      console.log('✅ Интервью завершено');
      navigate('/admin/interviews');
    } catch (err) {
      console.error('❌ Ошибка завершения интервью:', err);
      setError('Не удалось завершить интервью');
    }
  };

  // Обработка ошибок
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ошибка</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Загрузка
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Инициализация интервью</h2>
            <p className="text-gray-600">Подготовка голосовой сессии...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Голосовое интервью
          </h1>
          {interviewData?.position?.title && (
            <p className="text-lg text-gray-600">
              Вакансия: {interviewData.position.title}
            </p>
          )}
        </div>

        {/* Основной компонент голосового взаимодействия */}
        <ElevenLabsConversation
          agentId={agentId}
          voiceId="pNInz6obpgDQGcFmaJgB"
          isConnected={isConnected}
          onMessage={async (message) => {
            console.log('📨 Сообщение от агента:', message);
            
            // Добавляем сообщение в историю
            setMessages(prev => [...prev, { text: message, isUser: false }]);
            
            // Проверяем, является ли это транскрипцией ответа пользователя
            // В реальной реализации это должно определяться по типу сообщения от ElevenLabs
            // Пока что будем сохранять все сообщения как потенциальные ответы
            if (message && typeof message === 'string' && message.trim()) {
              try {
                // Если у нас нет текущего вопроса, получаем его
                if (!currentQuestion) {
                  const question = await VoiceInterviewService.getNextQuestion(interviewId);
                  setCurrentQuestion(question);
                }
                
                // Сохраняем ответ с правильным questionId
                await VoiceInterviewService.saveVoiceAnswer(interviewId, currentQuestion?.questionId || 1, {
                  text: message,
                  durationMs: 0, // TODO: измерить реальную длительность
                  confidence: 0.95, // TODO: получить реальную уверенность
                  timestamp: new Date().toISOString(),
                  type: 'USER_ANSWER'
                });
                
                console.log('✅ Ответ сохранен на сервере');
                
                // Сбрасываем текущий вопрос после сохранения ответа
                setCurrentQuestion(null);
              } catch (error) {
                console.error('❌ Ошибка сохранения ответа:', error);
              }
            }
          }}
          onError={(error) => {
            console.error('❌ Ошибка в голосовой сессии:', error);
            setError(error);
          }}
          onSessionEnd={async () => {
            console.log('🔚 Голосовая сессия завершена');
            try {
              await VoiceInterviewService.endVoiceSession(interviewId);
              console.log('✅ Голосовая сессия завершена на сервере');
            } catch (error) {
              console.error('❌ Ошибка завершения голосовой сессии:', error);
            }
            handleFinishInterview();
          }}
          onAgentStart={() => {
            console.log('🤖 Агент начал говорить');
          }}
          onAgentEnd={() => {
            console.log('🤖 Агент закончил говорить');
          }}
          onUserStart={() => {
            console.log('👤 Пользователь начал говорить');
          }}
          onUserEnd={() => {
            console.log('👤 Пользователь закончил говорить');
          }}
          onStart={() => {
            console.log('🎤 Голосовая сессия началась');
          }}
          onEnd={() => {
            console.log('🔚 Голосовая сессия завершилась');
          }}
        />

        {/* История сообщений */}
        {messages.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">История разговора</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Кнопки управления */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={handleFinishInterview}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Завершить интервью
          </button>
        </div>
      </div>
    </div>
  );
};

export default ElabsSession; 