/**
 * Speech to Speech Test Component
 * Простой компонент для тестирования ElevenLabs Conversation AI
 */

import React, { useState } from 'react';
import { useElevenLabs } from '../hooks/useElevenLabs';

const SpeechToSpeechTest: React.FC = () => {
  const [agentId, setAgentId] = useState('your-agent-id-here');
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const {
    status,
    isListening,
    isSpeaking,
    startSession,
    stopSession,
    sendMessage,
    isConnected: voiceConnected,
    hasError,
    isEnded
  } = useElevenLabs({
    agentId,
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam
    onMessage: (msg) => {
      console.log('📨 Получено сообщение:', msg);
    },
    onError: (error) => {
      console.error('❌ Ошибка:', error);
    },
    onSessionEnd: () => {
      console.log('🔚 Сессия завершена');
      setIsConnected(false);
    }
  });

  const handleConnect = async () => {
    try {
      await startSession();
      setIsConnected(true);
    } catch (error) {
      console.error('❌ Ошибка подключения:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await stopSession();
      setIsConnected(false);
    } catch (error) {
      console.error('❌ Ошибка отключения:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      await sendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('❌ Ошибка отправки:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Speech-to-Speech Test</h2>
      
      {/* Конфигурация */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Agent ID:
        </label>
        <input
          type="text"
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Введите ID агента"
        />
      </div>

      {/* Статус */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <div className="text-sm">
          <div className="flex items-center justify-between mb-2">
            <span>Статус:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              status === 'connected' ? 'bg-green-100 text-green-800' :
              status === 'error' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status}
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span>Подключение:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              voiceConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {voiceConnected ? 'Подключено' : 'Отключено'}
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span>Агент говорит:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              isSpeaking ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {isSpeaking ? 'Да' : 'Нет'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Слушаем вас:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              isListening ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {isListening ? 'Да' : 'Нет'}
            </span>
          </div>
        </div>
      </div>

      {/* Управление */}
      <div className="mb-4 space-y-2">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={status === 'connecting'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {status === 'connecting' ? 'Подключение...' : 'Подключиться'}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            Отключиться
          </button>
        )}
      </div>

      {/* Отправка сообщения */}
      {isConnected && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Сообщение:
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите сообщение..."
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Отправить
            </button>
          </div>
        </div>
      )}

      {/* Инструкции */}
      <div className="text-xs text-gray-500">
        <p className="mb-2">Инструкции:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Введите ID вашего агента в ElevenLabs</li>
          <li>Нажмите "Подключиться" для запуска сессии</li>
          <li>Говорите в микрофон или отправляйте текстовые сообщения</li>
          <li>Агент будет отвечать голосом</li>
        </ul>
      </div>
    </div>
  );
};

export default SpeechToSpeechTest; 