import React from 'react';

const AIChatWidget: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
      {/* Заголовок */}
      <div className="px-4 py-2 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 text-sm font-semibold text-gray-700">
        Чат с нейросетью
      </div>
      {/* Область сообщений */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-2 text-sm text-gray-800">
        {/* Пока сообщений нет */}
        <div className="text-gray-400 text-center mt-8">Нет сообщений. Начните диалог с ИИ!</div>
      </div>
      {/* Ввод сообщения */}
      <form className="flex items-center gap-2 border-t border-gray-100 px-4 py-3 bg-white">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Введите сообщение..."
          disabled
        />
        <button
          type="button"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          disabled
        >
          Отправить
        </button>
      </form>
    </div>
  );
};

export default AIChatWidget; 