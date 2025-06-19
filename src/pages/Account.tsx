import React from 'react';
import { useNavigate } from 'react-router-dom';

const MOCK_USER = {
  email: 'ferruspoint@mail.ru',
  language: 'Русский',
};

const Account: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    // Здесь могла бы быть очистка токена/сессии
    navigate('/login');
  };
  return (
    <div className="bg-white rounded-lg shadow-soft border border-gray-100 max-w-5xl mx-auto p-8 flex flex-col gap-8">
      <h1 className="text-2xl font-bold" style={{color: 'var(--wmt-orange)'}}>Аккаунт</h1>
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-2 w-full">
          <div className="text-sm text-gray-500">Email</div>
          <div className="text-base font-medium text-gray-900">{MOCK_USER.email}</div>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="text-sm text-gray-500">Язык</div>
          <div className="text-base font-medium text-gray-900">{MOCK_USER.language}</div>
        </div>
        <button className="btn-secondary mt-4 w-fit" onClick={handleLogout}>Выйти</button>
      </div>
    </div>
  );
};

export default Account; 