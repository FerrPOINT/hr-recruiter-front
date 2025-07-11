import React from 'react';
import { Link } from 'react-router-dom';

const TestNavigation: React.FC = () => {
  return (
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
            
            <Link
              to="/"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestNavigation; 