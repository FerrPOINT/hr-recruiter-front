import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';

// Моки собеседований
const MOCK_INTERVIEWS = [
  {
    id: 1,
    candidate: 'Олег Валерьев',
    position: 'Go разработчик',
    status: 'Завершено',
    date: '2024-06-18',
    score: 8.2,
  },
  {
    id: 2,
    candidate: 'Мария Сидорова',
    position: 'Бухгалтер',
    status: 'В процессе',
    date: '2024-06-19',
    score: null,
  },
];

const InterviewList: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Собеседования</h1>
          <p className="text-gray-600">Список всех собеседований (мок)</p>
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
      <div className="bg-white rounded-lg border border-gray-100 shadow-soft">
        <table className="min-w-full w-full table-fixed text-sm">
          <thead>
            <tr className="text-gray-500">
              <th className="text-left font-normal w-1/4 min-w-[120px] px-4 py-2">Кандидат</th>
              <th className="text-left font-normal w-1/4 min-w-[120px] px-4 py-2">Вакансия</th>
              <th className="text-left font-normal w-1/6 min-w-[90px] px-4 py-2">Статус</th>
              <th className="text-left font-normal w-1/6 min-w-[90px] px-4 py-2">Дата</th>
              <th className="text-left font-normal w-1/6 min-w-[70px] px-4 py-2">Балл</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_INTERVIEWS.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="truncate px-4 py-2" title={i.candidate}>{i.candidate}</td>
                <td className="truncate px-4 py-2" title={i.position}>{i.position}</td>
                <td className="truncate px-4 py-2" title={i.status}>{i.status}</td>
                <td className="truncate px-4 py-2" title={i.date}>{i.date}</td>
                <td className="truncate px-4 py-2" title={String(i.score ?? '-')}>{i.score ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {MOCK_INTERVIEWS.length === 0 && (
          <div className="text-center text-gray-400 py-8">Нет собеседований</div>
        )}
      </div>
    </div>
  );
};

export default InterviewList; 