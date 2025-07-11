import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Bot } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin, error } = useAuthStore();

  // Загружаем сохраненное состояние чекбокса при монтировании
  useEffect(() => {
    const savedRememberMe = localStorage.getItem('admin_remember_me') === 'true';
    setRememberMe(savedRememberMe);
  }, []);

  // Сохраняем состояние чекбокса при изменении
  useEffect(() => {
    localStorage.setItem('admin_remember_me', rememberMe.toString());
  }, [rememberMe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginAdmin(email, password, rememberMe);
      toast.success('Вход выполнен успешно');
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Ошибка входа. Проверьте email и пароль.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-700 to-gray-900 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-400 opacity-30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500 opacity-20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] bg-indigo-400 opacity-10 rounded-full blur-2xl animate-pulse" style={{ transform: 'translate(-50%, -50%)' }} />
      </div>
      <div className="relative z-10 w-full max-w-md mx-auto animate-fade-in">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col items-center gap-4 glassmorphism-card">
          <div className="relative flex items-center justify-center mb-4">
            <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-blue-500 blur-2xl opacity-60 animate-pulse-slow"></div>
            <div className="absolute w-16 h-16 rounded-full bg-white/10 blur-xl"></div>
            <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 shadow-2xl border-2 border-white/20">
              <Bot className="w-10 h-10 text-white drop-shadow-lg animate-bounce" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white text-center drop-shadow-lg animate-fade-in">Вас приветствует AI-ассистент WMT</h2>
          <p className="text-lg text-blue-100 text-center mb-2 animate-fade-in delay-100">Войдите, чтобы начать автоматизированный подбор персонала</p>
          <form className="w-full space-y-6 animate-fade-in delay-200" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-blue-100">Email</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-blue-300" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10 bg-white/20 border-white/30 text-white placeholder-blue-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                    placeholder="Введите ваш email"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-blue-100">Пароль</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-300" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10 bg-white/20 border-white/30 text-white placeholder-blue-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                    placeholder="Введите ваш пароль"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-200 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
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
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-indigo-400 focus:ring-indigo-400 border-white/30 rounded bg-white/10"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-blue-100">Запомнить меня</label>
              </div>
              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-indigo-200 hover:text-white transition-colors"
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
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-500 hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Войти
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        <div className="mt-8 text-center text-blue-200 text-xs animate-fade-in delay-300">
          © {new Date().getFullYear()} WMT AI Recruiter. Все права защищены.
        </div>
      </div>
    </div>
  );
};

export default Login;