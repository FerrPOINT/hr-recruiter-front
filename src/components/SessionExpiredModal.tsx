import React from 'react';
import { AlertTriangle, LogIn } from 'lucide-react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onLogin: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ isOpen, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-4">
        {/* Затемненная область */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        
        {/* Модальное окно */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
          <div className="p-6">
            {/* Иконка */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            
            {/* Заголовок */}
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Сессия истекла
            </h3>
            
            {/* Описание */}
            <p className="text-sm text-gray-600 text-center mb-6">
              Ваши авторизационные данные истекли. Пожалуйста, войдите в систему заново для продолжения работы.
            </p>
            
            {/* Кнопка */}
            <div className="flex justify-center">
              <button
                onClick={onLogin}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Войти заново
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal; 