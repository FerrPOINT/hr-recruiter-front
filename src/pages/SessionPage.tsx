import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { CandidateAuthRequest } from '../client/models/candidate-auth-request';

const SessionPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [positionId, setPositionId] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const loginCandidate = useAuthStore((s) => s.loginCandidate);
  const navigate = useNavigate();

  // Загружаем сохраненные данные при монтировании компонента
  useEffect(() => {
    const savedData = localStorage.getItem('candidate_form_data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setRememberMe(true);
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  // Сохраняем данные формы при изменении rememberMe
  useEffect(() => {
    if (rememberMe && (firstName || lastName || email || phone)) {
      const formData = { firstName, lastName, email, phone };
      localStorage.setItem('candidate_form_data', JSON.stringify(formData));
    } else if (!rememberMe) {
      localStorage.removeItem('candidate_form_data');
    }
  }, [rememberMe, firstName, lastName, email, phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data: CandidateAuthRequest = { firstName, lastName, email, phone, positionId: Number(positionId) };
      await loginCandidate(data, rememberMe);
      toast.success('Вход кандидата выполнен!');
      navigate('/interview');
    } catch (error: any) {
      toast.error('Ошибка входа кандидата. Проверьте данные.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-700 to-gray-900 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md mx-auto animate-fade-in">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col items-center gap-4 glassmorphism-card">
          <h2 className="text-3xl font-extrabold text-white text-center drop-shadow-lg animate-fade-in">Вход для кандидата</h2>
          <form className="w-full space-y-6 animate-fade-in delay-200" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-blue-100">Имя</label>
                <input id="firstName" name="firstName" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="input-field bg-white/20 border-white/30 text-white placeholder-blue-200" placeholder="Введите имя" required />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-blue-100">Фамилия</label>
                <input id="lastName" name="lastName" type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="input-field bg-white/20 border-white/30 text-white placeholder-blue-200" placeholder="Введите фамилию" required />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-blue-100">Email</label>
                <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field bg-white/20 border-white/30 text-white placeholder-blue-200" placeholder="Введите email" required />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-blue-100">Телефон</label>
                <input id="phone" name="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field bg-white/20 border-white/30 text-white placeholder-blue-200" placeholder="Введите телефон" required />
              </div>
              <div>
                <label htmlFor="positionId" className="block text-sm font-medium text-blue-100">ID вакансии</label>
                <input id="positionId" name="positionId" type="number" value={positionId} onChange={e => setPositionId(e.target.value)} className="input-field bg-white/20 border-white/30 text-white placeholder-blue-200" placeholder="Введите ID вакансии" required />
              </div>
            </div>
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-400 focus:ring-indigo-400 border-white/30 rounded bg-white/10"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-blue-100">Запомнить данные для следующего входа</label>
            </div>
            <div>
              <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-500 hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Войти'}
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

export default SessionPage; 