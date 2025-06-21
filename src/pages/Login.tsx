import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Имитируем задержку для реалистичности
      await new Promise(resolve => setTimeout(resolve, 500));

      // В демо-режиме всегда успешно логинимся с любыми данными
      const userName = email ? email.split('@')[0] : 'Пользователь';
      const userRole = email?.includes('admin') ? 'admin' : email?.includes('viewer') ? 'viewer' : 'recruiter';

      const user = {
        id: 'user-' + Date.now(),
        name: userName.charAt(0).toUpperCase() + userName.slice(1) + ' Пользователь',
        email: email || 'test@example.com',
        role: userRole,
        avatarUrl: `https://randomuser.me/api/portraits/${userRole === 'admin' ? 'men' : 'women'}/${Math.floor(Math.random() * 50)}.jpg`,
        language: 'Русский'
      };

      // Сохраняем данные пользователя
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      sessionStorage.setItem('isAuthenticated', 'true');

      toast.success('Вход выполнен успешно');
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Произошла ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto space-y-8">
          <div>
            <div className="mx-auto h-12 w-auto flex items-center justify-center select-none">
            <span className="text-2xl font-extrabold tracking-tight select-none" style={{color: 'var(--wmt-orange)'}}>
              WMT Рекрутер
            </span>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Вход в систему
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Платформа для автоматизированных HR-собеседований
            </p>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Демо-режим:</strong> Введите любые данные для входа
              </p>
            </div>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Введите ваш email"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Пароль
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-10 pr-10"
                      placeholder="Введите ваш пароль"
                  />
                  <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Запомнить меня
                </label>
              </div>

              <div className="text-sm">
                <button
                    type="button"
                    className="font-medium text-primary-600 hover:text-primary-500"
                    onClick={() => toast('Функция восстановления пароля временно недоступна')}
                >
                  Забыли пароль?
                </button>
              </div>
            </div>

            <div>
              <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                    'Войти'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default Login;