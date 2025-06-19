import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar } from 'lucide-react';

const InterviewCreate: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vacancyId = searchParams.get('vacancy');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    vacancyId: vacancyId || '',
    scheduledDate: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const vacancies = [
    { id: 1, title: 'Frontend Developer', level: 'middle' },
    { id: 2, title: 'UX Designer', level: 'senior' },
    { id: 3, title: 'Backend Developer', level: 'lead' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Имитация создания собеседования
    setTimeout(() => {
      setIsLoading(false);
      navigate('/interviews');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/interviews')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Создать собеседование</h1>
            <p className="text-gray-600">Настройте новое собеседование для кандидата</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Информация о кандидате */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Информация о кандидате</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Имя *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="Введите имя"
                />
              </div>
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Фамилия *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="Введите фамилию"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="Введите email"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Настройки собеседования */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Настройки собеседования</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="vacancyId" className="block text-sm font-medium text-gray-700 mb-2">
                Вакансия *
              </label>
              <select
                id="vacancyId"
                name="vacancyId"
                required
                value={formData.vacancyId}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Выберите вакансию</option>
                {vacancies.map((vacancy) => (
                  <option key={vacancy.id} value={vacancy.id}>
                    {vacancy.title} ({vacancy.level})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                Запланированная дата
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="datetime-local"
                  id="scheduledDate"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Информация о процессе */}
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Как это работает</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-medium text-xs">
                1
              </div>
              <p>После создания собеседования кандидату будет отправлена уникальная ссылка на email</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-medium text-xs">
                2
              </div>
              <p>Кандидат пройдет автоматизированное собеседование с голосовыми ответами</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-medium text-xs">
                3
              </div>
              <p>Ответы будут проанализированы ИИ и результаты появятся в отчетах</p>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/interviews')}
            className="btn-secondary"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Создание...' : 'Создать собеседование'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InterviewCreate; 