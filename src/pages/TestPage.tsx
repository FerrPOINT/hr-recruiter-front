import React from 'react';
import { Link } from 'react-router-dom';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ElevenLabs Testing</h1>
              <p className="text-gray-600">Тестирование speech-to-speech функционала</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/elevenlabs-test"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                SDK Test
              </Link>
              
              <Link
                to="/speech-test"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Speech-to-Speech
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Добро пожаловать в тестирование ElevenLabs!</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">SDK Test</h3>
              <p className="text-blue-800 mb-4">
                Тестирование доступных методов и свойств ElevenLabs SDK
              </p>
              <Link
                to="/elevenlabs-test"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Открыть SDK Test
              </Link>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Speech-to-Speech Test</h3>
              <p className="text-green-800 mb-4">
                Тестирование голосового взаимодействия с агентом
              </p>
              <Link
                to="/speech-test"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Открыть Speech Test
              </Link>
            </div>
          </div>
          
          <div className="mt-6 bg-yellow-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Важные замечания</h3>
            <div className="text-yellow-800 space-y-2">
              <p>• Убедитесь, что у вас есть реальный Agent ID в ElevenLabs</p>
              <p>• Проверьте, что прокси настроен правильно</p>
              <p>• Разрешите доступ к микрофону в браузере</p>
              <p>• Используйте HTTPS для корректной работы микрофона</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 