import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { mockApi } from '../mocks/mockApi';

const useMock = process.env.REACT_APP_USE_MOCK_API === 'true';

const Account: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      let data;
      if (useMock) {
        data = await mockApi.getAccount?.();
      } else {
        // TODO: подключить реальный API-клиент
        data = await mockApi.getAccount?.();
      }
      setUser(data);
      setLoading(false);
    })();
  }, []);

  const handleLogout = () => {
    // Здесь могла бы быть очистка токена/сессии
    navigate('/login');
  };
  return (
    <div className="w-full max-w-4xl mx-auto">
      <button onClick={() => navigate('/')} className="mb-4 flex items-center text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-5 w-5 mr-2" /> Назад
      </button>
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg w-full flex flex-col gap-8">
        <h1 className="text-2xl font-bold text-gray-900">Аккаунт</h1>
        <div className="flex flex-col gap-6 w-full">
          {loading ? (
            <div className="text-gray-400">Загрузка...</div>
          ) : user && (
            <>
              <div className="flex flex-col gap-2 w-full">
                <div className="text-sm text-gray-500">Email</div>
                <div className="text-base font-medium text-gray-900">{user.email}</div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <div className="text-sm text-gray-500">Язык</div>
                <div className="text-base font-medium text-gray-900">{user.language}</div>
              </div>
              <button className="btn-secondary mt-4 w-fit" onClick={handleLogout}>Выйти</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
