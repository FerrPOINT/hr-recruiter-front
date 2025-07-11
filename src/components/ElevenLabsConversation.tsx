/**
 * ElevenLabs Conversation Component
 * Центральный компонент для голосового взаимодействия с ElevenLabs
 * НЕ управляет бизнес-логикой - только UI и голосовое взаимодействие
 */

import React, { useEffect, useRef } from 'react';
import { useElevenLabs } from '../hooks/useElevenLabs';

interface ElevenLabsConversationProps {
  agentId: string;
  voiceId?: string;
  isConnected: boolean;
  onMessage?: (message: string) => void;
  onError?: (error: string) => void;
  onSessionEnd?: () => void;
  onAgentStart?: () => void;
  onAgentEnd?: () => void;
  onUserStart?: () => void;
  onUserEnd?: () => void;
  onStart?: () => void;
  onEnd?: () => void;
}

const ElevenLabsConversation: React.FC<ElevenLabsConversationProps> = ({
  agentId,
  voiceId = 'pNInz6obpgDQGcFmaJgB',
  isConnected,
  onMessage,
  onError,
  onSessionEnd,
  onAgentStart,
  onAgentEnd,
  onUserStart,
  onUserEnd,
  onStart,
  onEnd
}) => {
  const conversationRef = useRef<any>(null);
  const isInitialized = useRef(false);

  const {
    sessionId,
    status,
    isListening,
    isSpeaking,
    startSession,
    stopSession,
    isConnected: voiceConnected,
    hasError,
    isEnded,
    isAgentSpeaking,
    isUserListening
  } = useElevenLabs({
    agentId,
    voiceId,
    onMessage,
    onError,
    onSessionEnd,
    onAgentStart,
    onAgentEnd,
    onUserStart,
    onUserEnd
  });

  useEffect(() => {
    conversationRef.current = {
      startSession,
      stopSession
    };
  }, [startSession, stopSession]);

  useEffect(() => {
    if (isConnected && !isInitialized.current) {
      console.log('🚀 Автоматический запуск ElevenLabs conversation...');
      
      startSession().then(() => {
        isInitialized.current = true;
        if (onStart) onStart();
      }).catch((error: any) => {
        console.error('❌ Error starting session:', error);
        if (onError) onError(error.message);
      });
    }
  }, [isConnected, startSession, onStart, onError]);

  useEffect(() => {
    return () => {
      if (conversationRef.current && isInitialized.current) {
        console.log('🧹 Cleaning up ElevenLabs conversation...');
        
        stopSession().catch((error: any) => {
          console.error('❌ Error stopping session:', error);
        });
      }
    };
  }, [stopSession]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Голосовое интервью
          </h2>
          <p className="text-gray-600">
            Говорите с AI-интервьюером естественным голосом
          </p>
        </div>

        {/* Статус подключения */}
        <div className="flex items-center justify-center mb-6">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
            voiceConnected 
              ? 'bg-green-100 text-green-800' 
              : hasError
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-600'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              voiceConnected ? 'bg-green-500 animate-pulse' : 
              hasError ? 'bg-red-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm font-medium">
              {voiceConnected ? 'Подключено к ElevenLabs' : 
               hasError ? 'Ошибка подключения' : 'Подключение...'}
            </span>
          </div>
        </div>

        {/* Индикаторы состояния */}
        <div className="flex items-center justify-center space-x-6 mb-8">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
              isUserListening ? 'bg-green-100 animate-pulse' : 'bg-gray-100'
            }`}>
              <svg className={`w-8 h-8 ${isUserListening ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Микрофон</p>
            {isUserListening && (
              <p className="text-xs text-green-600 mt-1">Слушаем вас</p>
            )}
          </div>
          
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
              isAgentSpeaking ? 'bg-blue-100 animate-pulse' : 'bg-gray-100'
            }`}>
              <svg className={`w-8 h-8 ${isAgentSpeaking ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Динамики</p>
            {isAgentSpeaking && (
              <p className="text-xs text-blue-600 mt-1">Агент говорит</p>
            )}
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 01-2.167 9.238" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">AI</p>
          </div>
        </div>

        {/* Статус сессии */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Статус сессии</h3>
            <span className="text-sm text-gray-600">
              {status === 'connected' ? 'Активна' : 
               status === 'connecting' ? 'Подключение...' :
               status === 'error' ? 'Ошибка' :
               status === 'ended' ? 'Завершена' : 'Неактивна'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                status === 'connected' ? 'bg-green-600' :
                status === 'connecting' ? 'bg-yellow-600' :
                status === 'error' ? 'bg-red-600' :
                status === 'ended' ? 'bg-gray-600' : 'bg-gray-400'
              }`}
              style={{ 
                width: status === 'connected' ? '100%' : 
                       status === 'connecting' ? '50%' :
                       status === 'error' ? '100%' :
                       status === 'ended' ? '100%' : '0%' 
              }}
            ></div>
          </div>
        </div>

        {/* Инструкции */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Как это работает:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• AI-интервьюер задает вопросы голосом</li>
            <li>• Вы отвечаете в микрофон</li>
            <li>• Ваша речь автоматически транскрибируется</li>
            <li>• Интервью проходит естественно и непринужденно</li>
          </ul>
        </div>

        {/* Отладочная информация */}
        <div className="text-center text-xs text-gray-500">
          <p>Agent ID: {agentId}</p>
          <p>Voice ID: {voiceId}</p>
          <p>Session ID: {sessionId || 'Не создана'}</p>
          <p>Status: {status}</p>
          <p>Powered by ElevenLabs Conversation AI</p>
        </div>
      </div>
    </div>
  );
};

export default ElevenLabsConversation; 