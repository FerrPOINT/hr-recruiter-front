import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { mockApi } from '../mocks/mockApi';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const useMock = process.env.REACT_APP_USE_MOCK_API === 'true';

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '–';
  try {
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: ru });
  } catch (e) {
    return '–';
  }
};

const InterviewList: React.FC = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      let data;
      if (useMock) {
        data = await mockApi.getInterviews?.() || [];
      } else {
        // TODO: подключить реальный API-клиент
        data = await mockApi.getInterviews?.() || [];
      }
      setInterviews(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Собеседования</h1>
          <p className="text-gray-600">Список всех собеседований</p>
        </div>
        <Link to="/interviews/create" className="btn-primary flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Новое собеседование
        </Link>
      </div>
      <div className="mb-4 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="input-field pl-10" placeholder="Поиск по кандидату или вакансии..." />
        </div>
        <select className="input-field w-48">
          <option>Все статусы</option>
          <option>Завершено</option>
          <option>В процессе</option>
        </select>
      </div>
      <table className="min-w-full w-full table-fixed text-sm">
        <thead>
          <tr className="text-gray-500">
            <th className="text-left font-normal w-1/4 min-w-[120px] px-4 py-2">Кандидат</th>
            <th className="text-left font-normal w-1/4 min-w-[120px] px-4 py-2">Вакансия</th>
            <th className="text-left font-normal w-1/6 min-w-[90px] px-4 py-2">Статус</th>
            <th className="text-left font-normal w-1/6 min-w-[90px] px-4 py-2">Дата создания</th>
            <th className="text-left font-normal w-1/6 min-w-[90px] px-4 py-2">Дата прохождения</th>
            <th className="text-left font-normal w-1/6 min-w-[70px] px-4 py-2">Балл</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} className="text-center text-gray-400 py-8">Загрузка...</td></tr>
          ) : interviews.length === 0 ? (
            <tr><td colSpan={6} className="text-center text-gray-400 py-8">Нет собеседований</td></tr>
          ) : (
            interviews.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="truncate px-4 py-2" title={i.candidate}>{i.candidate}</td>
                <td className="truncate px-4 py-2" title={i.position}>{i.position}</td>
                <td className="truncate px-4 py-2" title={i.status}>{i.status}</td>
                <td className="truncate px-4 py-2" title={i.date}>{formatDate(i.date)}</td>
                <td className="truncate px-4 py-2" title={i.completionDate}>{formatDate(i.completionDate)}</td>
                <td className="truncate px-4 py-2" title={String(i.score ?? '-')}>{i.score ?? '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InterviewList;