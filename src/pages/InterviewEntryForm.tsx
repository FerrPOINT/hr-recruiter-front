import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, User, Phone, Briefcase, Mic, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { CandidateAuthRequest } from '../client/models/candidate-auth-request';
import { formatPhoneNumber, validatePhoneNumber } from '../utils/phoneFormatter';
import { candidateApiService } from '../services/candidateApiService';

interface InterviewEntryFormProps {
  onSuccess?: (token: string) => void;
  redirectTo?: string;
}

const InterviewEntryForm: React.FC<InterviewEntryFormProps> = ({ 
  onSuccess, 
  redirectTo = '/elabs-session' 
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [positionId, setPositionId] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [positionLoading, setPositionLoading] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [searchParams] = useSearchParams();
  

  
  const loginCandidate = useAuthStore((s) => s.loginCandidate);
  const navigate = useNavigate();



  // Загружаем параметры из URL и сохраненные данные
  useEffect(() => {
    // Получаем параметры из URL
    const urlPositionId = searchParams.get('positionId');
    const urlEmail = searchParams.get('email');
    const urlFirstName = searchParams.get('firstName');
    const urlLastName = searchParams.get('lastName');
    
    console.log('URL params:', { urlPositionId, urlEmail, urlFirstName, urlLastName });
    
    if (urlPositionId) setPositionId(urlPositionId);
    if (urlEmail) setEmail(urlEmail);
    if (urlFirstName) setFirstName(urlFirstName);
    if (urlLastName) setLastName(urlLastName);

    // Загружаем сохраненное состояние чекбокса
    const savedRememberMe = localStorage.getItem('candidate_remember_me') === 'true';
    console.log('🔍 Загружаем состояние чекбокса rememberMe:', savedRememberMe);
    setRememberMe(savedRememberMe);
    
    // Загружаем сохраненные данные формы если чекбокс был включен
    if (savedRememberMe) {
      const savedData = localStorage.getItem('candidate_form_data');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          if (data.firstName && !urlFirstName) setFirstName(data.firstName);
          if (data.lastName && !urlLastName) setLastName(data.lastName);
          if (data.email && !urlEmail) setEmail(data.email);
          if (data.phone) setPhone(data.phone);
        } catch (error) {
          console.error('Error loading saved form data:', error);
        }
      }
    }
  }, [searchParams]);

  // Убираем загрузку данных о вакансии - они будут получены в startInterview
  // useEffect(() => {
  //   if (positionId) {
  //     setPositionLoading(true);
  //     candidateApiService.getPosition(Number(positionId))
  //       .then(position => {
  //         setPositionTitle(position.title || 'Неизвестная вакансия');
  //       })
  //       .catch(() => {
  //         setPositionTitle('Неизвестная вакансия');
  //       })
  //       .finally(() => {
  //         setPositionLoading(false);
  //       });
  //   }
  // }, [positionId]);

  // Сохраняем состояние чекбокса и данные формы при изменении
  useEffect(() => {
    console.log('💾 Сохраняем состояние чекбокса rememberMe:', rememberMe);
    localStorage.setItem('candidate_remember_me', rememberMe.toString());
    
    if (rememberMe && (firstName || lastName || email || phone)) {
      const formData = { firstName, lastName, email, phone };
      localStorage.setItem('candidate_form_data', JSON.stringify(formData));
      console.log('💾 Сохраняем данные формы:', formData);
    } else if (!rememberMe) {
      localStorage.removeItem('candidate_form_data');
      console.log('🗑️ Удаляем данные формы');
    }
  }, [rememberMe, firstName, lastName, email, phone]);

  // Валидация формы
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!firstName.trim()) {
      errors.firstName = 'Имя обязательно для заполнения';
    } else if (firstName.trim().length < 2) {
      errors.firstName = 'Имя должно содержать минимум 2 символа';
    }

    if (!lastName.trim()) {
      errors.lastName = 'Фамилия обязательна для заполнения';
    } else if (lastName.trim().length < 2) {
      errors.lastName = 'Фамилия должна содержать минимум 2 символа';
    }

    if (!email.trim()) {
      errors.email = 'Email обязателен для заполнения';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Введите корректный email адрес';
    }

    if (!phone.trim()) {
      errors.phone = 'Телефон обязателен для заполнения';
    } else if (!validatePhoneNumber(phone)) {
      errors.phone = 'Введите корректный номер телефона (10-15 цифр)';
    }



    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    setIsLoading(true);
    try {
      const data: CandidateAuthRequest = { 
        firstName: firstName.trim(), 
        lastName: lastName.trim(), 
        email: email.trim(), 
        phone: phone.trim(), 
        positionId: Number(positionId) 
      };
      
      console.log('🚀 Отправляем форму с rememberMe:', rememberMe);
      await loginCandidate(data, rememberMe);
      toast.success('Добро пожаловать! Начинаем интервью...');
      
      // Вызываем callback если передан
      if (onSuccess) {
        // Получаем токен из store
        const token = useAuthStore.getState().token;
        if (token) {
          onSuccess(token);
        }
      } else {
        // Получаем interviewId из URL параметров
        const interviewId = searchParams.get('interviewId');
        if (interviewId) {
          // Перенаправляем на ElabsSession с ID интервью
          navigate(`/elabs/${interviewId}`);
        } else {
          // Иначе перенаправляем на дефолтную страницу
          navigate(redirectTo);
        }
      }
    } catch (error: any) {
      console.error('Interview entry error:', error);
      
      // Улучшенная обработка ошибок
      let errorMessage = 'Ошибка входа. Проверьте данные и попробуйте снова.';
      
      if (error?.response?.status === 400) {
        errorMessage = error?.response?.data?.message || 'Неверные данные. Проверьте введенную информацию.';
      } else if (error?.response?.status === 401) {
        errorMessage = 'Ошибка авторизации. Проверьте правильность данных.';
      } else if (error?.response?.status === 404) {
        errorMessage = 'Вакансия не найдена. Проверьте ID вакансии.';
      } else if (error?.response?.status >= 500) {
        errorMessage = 'Ошибка сервера. Попробуйте позже.';
      } else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
      }
      
      toast.error(errorMessage);
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
              <Mic className="w-10 h-10 text-white drop-shadow-lg animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-3xl font-extrabold text-white text-center drop-shadow-lg animate-fade-in">
            Добро пожаловать на интервью
          </h2>
          {positionId && (
            <div className="text-center mb-2 animate-fade-in delay-100">
              <p className="text-lg text-blue-100">
                Вакансия: <span className="font-semibold text-white">Интервью #{positionId}</span>
              </p>
            </div>
          )}
          <p className="text-lg text-blue-100 text-center mb-2 animate-fade-in delay-100">
            Пожалуйста, подтвердите ваши данные для начала собеседования
          </p>
          {isLoading && (
            <div className="text-center animate-fade-in delay-200">
              <div className="inline-flex items-center text-blue-200 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-200 mr-2"></div>
                Подготовка к интервью...
              </div>
            </div>
          )}
          
          <form className="w-full space-y-6 animate-fade-in delay-200" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-blue-100">Имя <span className="text-red-300">*</span></label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-blue-300" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input-field pl-10 bg-white/20 border-white/30 text-white placeholder-blue-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                    placeholder="Введите ваше имя"
                    required
                  />
                </div>
                {formErrors.firstName && (
                  <p className="mt-1 text-sm text-red-300 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.firstName}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-blue-100">Фамилия <span className="text-red-300">*</span></label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-blue-300" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input-field pl-10 bg-white/20 border-white/30 text-white placeholder-blue-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                    placeholder="Введите вашу фамилию"
                    required
                  />
                </div>
                {formErrors.lastName && (
                  <p className="mt-1 text-sm text-red-300 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.lastName}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-blue-100">Email <span className="text-red-300">*</span></label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-blue-300" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10 bg-white/20 border-white/30 text-white placeholder-blue-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                    placeholder="Введите ваш email"
                    required
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-300 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.email}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-blue-100">Телефон <span className="text-red-300">*</span></label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-blue-300" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                    className="input-field pl-10 bg-white/20 border-white/30 text-white placeholder-blue-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                    placeholder="+7 (999) 123-45-67"
                    maxLength={18}
                    required
                  />
                </div>
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-300 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.phone}
                  </p>
                )}
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
              <label htmlFor="remember-me" className="ml-2 block text-sm text-blue-100">
                Запомнить данные для следующих интервью
              </label>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-500 hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Начать интервью
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">
                      →
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-blue-200 mb-2">
              Нажимая "Начать интервью", вы соглашаетесь с обработкой персональных данных
            </p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-xs text-blue-300 hover:text-blue-100 underline transition-colors"
            >
              ← Вернуться назад
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-center text-blue-200 text-xs animate-fade-in delay-300">
          © {new Date().getFullYear()} WMT AI Recruiter. Все права защищены.
        </div>
      </div>
    </div>
  );
};

export default InterviewEntryForm; 