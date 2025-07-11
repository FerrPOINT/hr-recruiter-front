import React from 'react';
import { Link } from 'react-router-dom';
import InterviewEntryForm from './InterviewEntryForm';

const InterviewEntryDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Демо: Вступительная форма интервью</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Форма без префиллинга */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Форма без префиллинга</h2>
            <InterviewEntryForm />
          </div>
          
          {/* Форма с префиллингом */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Форма с префиллингом данных</h2>
            <InterviewEntryForm 
              onSuccess={(token) => {
                console.log('Получен токен:', token);
                alert('Авторизация успешна! Токен получен.');
              }}
            />
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Тестовые ссылки</h2>
          <div className="space-y-2">
            <Link 
              to="/interview-entry?positionId=123&interviewId=456" 
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              С префиллингом positionId=123, interviewId=456
            </Link>
            <Link 
              to="/interview-entry?positionId=789&firstName=Иван&lastName=Иванов&email=ivan@example.com" 
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              С префиллингом данных кандидата
            </Link>
            <Link 
              to="/interview-entry" 
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              Пустая форма
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewEntryDemo; 