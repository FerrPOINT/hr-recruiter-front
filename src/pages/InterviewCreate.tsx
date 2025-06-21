import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar } from 'lucide-react';
import { mockApi } from '../mocks/mockApi';

const useMock = process.env.REACT_APP_USE_MOCK_API === 'true';

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
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loadingVacancies, setLoadingVacancies] = useState(true);

  useEffect(() => {
    setLoadingVacancies(true);
    (async () => {
      let data;
      if (useMock) {
        const res = await mockApi.getPositions({ status: 'active' });
        data = res.items;
      } else {
        const res = await mockApi.getPositions({ status: 'active' });
        data = res.items;
      }
      setVacancies(data);
      setLoadingVacancies(false);
    })();
  }, []);

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
    
    try {
      // Создание кандидата
      const candidate = await mockApi.createCandidate(formData.vacancyId, {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
      });
      
      // Начало интервью
      await mockApi.startInterview(candidate.id);
      
      navigate('/interviews');
    } catch (error) {
      console.error('Error creating interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <button onClick={() => navigate('/')} className="mb-4 flex items-center text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-5 w-5 mr-2" /> Назад
      </button>
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg w-full flex flex-col gap-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Настройки собеседования</h2>
        <div className="text-gray-500 text-base mb-6">
          Заполните все поля для создания собеседования
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">Имя кандидата *</label>
            <input
              id="firstName"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Имя"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Фамилия кандидата *</label>
            <input
              id="lastName"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Фамилия"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Email"
            />
          </div>
          <div>
            <label htmlFor="vacancyId" className="block text-sm font-medium text-gray-700 mb-2">Вакансия *</label>
            {loadingVacancies ? (
              <div className="text-gray-400 text-sm">Загрузка вакансий...</div>
            ) : (
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
                    {vacancy.title} ({vacancy.level || ''})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">Запланированная дата и время</label>
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
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" className="btn-primary h-11 px-8 text-base" disabled={isLoading}>{isLoading ? 'Создание...' : 'Создать собеседование'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewCreate; 