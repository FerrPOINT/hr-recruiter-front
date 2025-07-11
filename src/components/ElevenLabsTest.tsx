import React, { useEffect, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import TestNavigation from './TestNavigation';

const ElevenLabsTest: React.FC = () => {
  const [testMessage, setTestMessage] = useState('Привет! Как дела?');
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([]);

  const conversation = useConversation({
    apiKey: 'dummy-key', // Будет перехвачено прокси
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel voice
    agentId: 'test-agent-id', // Нужно заменить на реальный
    
    // Обработчики событий
    onMessage: (message: any) => {
      console.log('📨 Message received:', message);
      
      if (message.type === 'user_transcript') {
        // Пользователь закончил говорить
        setIsListening(false);
        setMessages(prev => [...prev, { text: message.text, isUser: true }]);
      } else if (message.type === 'assistant_message') {
        // Агент отправил сообщение
        setMessages(prev => [...prev, { text: message.text, isUser: false }]);
      }
    },
    
    onError: (error: any) => {
      console.error('❌ Error:', error);
    },
    
    onStart: () => {
      console.log('🎤 Conversation started');
      setIsConnected(true);
    },
    
    onEnd: () => {
      console.log('🔚 Conversation ended');
      setIsConnected(false);
    },
    
    onAgentStart: () => {
      console.log('🤖 Agent started speaking');
      setIsSpeaking(true);
    },
    
    onAgentEnd: () => {
      console.log('🤖 Agent finished speaking');
      setIsSpeaking(false);
    },
    
    onUserStart: () => {
      console.log('👤 User started speaking');
      setIsListening(true);
    },
    
    onUserEnd: () => {
      console.log('👤 User finished speaking');
      setIsListening(false);
    }
  });

  useEffect(() => {
    // Выводим все доступные методы и свойства
    console.log('🔍 ElevenLabs Conversation object:', conversation);
    console.log('🔍 Available methods:', Object.getOwnPropertyNames(conversation));
    console.log('🔍 Method types:', Object.keys(conversation).map(key => ({
      key,
      type: typeof conversation[key as keyof typeof conversation]
    })));
  }, [conversation]);

  const testStartSession = async () => {
    console.log('🧪 Testing startSession...');
    try {
      if (typeof conversation.startSession === 'function') {
        console.log('✅ startSession method found, calling...');
        await conversation.startSession();
        console.log('✅ startSession called successfully');
      } else {
        console.log('❌ startSession method not found');
      }
    } catch (error) {
      console.error('❌ Error in startSession:', error);
    }
  };

  const testSendMessage = async () => {
    console.log('🧪 Testing sendMessage...');
    try {
      if ('sendMessage' in conversation && typeof (conversation as any).sendMessage === 'function') {
        console.log('✅ sendMessage method found, calling...');
        await (conversation as any).sendMessage(testMessage);
        console.log('✅ sendMessage called successfully');
      } else {
        console.log('❌ sendMessage method not found');
      }
    } catch (error) {
      console.error('❌ Error in sendMessage:', error);
    }
  };

  const testStopSession = async () => {
    console.log('🧪 Testing stopSession...');
    try {
      if ('stopSession' in conversation && typeof (conversation as any).stopSession === 'function') {
        console.log('✅ stopSession method found, calling...');
        await (conversation as any).stopSession();
        console.log('✅ stopSession called successfully');
      } else {
        console.log('❌ stopSession method not found');
      }
    } catch (error) {
      console.error('❌ Error in stopSession:', error);
    }
  };

  const testAllMethods = async () => {
    console.log('🧪 Testing all ElevenLabs methods...');
    
    // Проверяем все возможные методы
    const possibleMethods = ['start', 'stop', 'send', 'end', 'close', 'startSession', 'stopSession', 'sendMessage'];
    possibleMethods.forEach(method => {
      if (typeof conversation[method as keyof typeof conversation] === 'function') {
        console.log(`✅ ${method} method found`);
      } else if (method in conversation && typeof (conversation as any)[method] === 'function') {
        console.log(`✅ ${method} method found (in object)`);
      }
    });

    // Проверяем свойства состояния
    console.log('🔍 State properties:', {
      isConnected: (conversation as any).isConnected,
      isListening: (conversation as any).isListening,
      isSpeaking: conversation.isSpeaking,
      isProcessing: (conversation as any).isProcessing,
      isStarted: (conversation as any).isStarted,
      isEnded: (conversation as any).isEnded
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TestNavigation />
      
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">ElevenLabs AI Conversation Test</h2>
        
        {/* Статус подключения */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Connection Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                isConnected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {isConnected ? '✅' : '❌'}
              </div>
              <p className="text-sm font-medium">Connected</p>
            </div>
            
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                isSpeaking ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {isSpeaking ? '🎤' : '🤖'}
              </div>
              <p className="text-sm font-medium">Agent Speaking</p>
            </div>
            
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                isListening ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {isListening ? '🎧' : '👤'}
              </div>
              <p className="text-sm font-medium">Listening</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center bg-purple-100 text-purple-600">
                📊
              </div>
              <p className="text-sm font-medium">Messages: {messages.length}</p>
            </div>
          </div>
        </div>
        
        {/* Управление */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Controls</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={testStartSession}
              disabled={isConnected}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Start Session
            </button>
            
            <button
              onClick={testSendMessage}
              disabled={!isConnected}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Send Message
            </button>
            
            <button
              onClick={testStopSession}
              disabled={!isConnected}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Stop Session
            </button>
            
            <button
              onClick={testAllMethods}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Test All Methods
            </button>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Message:
            </label>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter test message..."
            />
          </div>
        </div>
        
        {/* История сообщений */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Message History</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center">No messages yet</p>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {message.isUser ? 'You' : 'Agent'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Отладочная информация */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Available Properties:</h4>
              <pre className="text-xs overflow-auto bg-white p-2 rounded">
                {JSON.stringify(Object.keys(conversation), null, 2)}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Conversation State:</h4>
              <pre className="text-xs overflow-auto bg-white p-2 rounded">
                {JSON.stringify({
                  isConnected: (conversation as any).isConnected,
                  isListening: (conversation as any).isListening,
                  isSpeaking: conversation.isSpeaking,
                  isProcessing: (conversation as any).isProcessing,
                  isStarted: (conversation as any).isStarted,
                  isEnded: (conversation as any).isEnded
                }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElevenLabsTest; 