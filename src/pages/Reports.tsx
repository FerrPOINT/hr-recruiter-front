import React from 'react';
import { FileText } from 'lucide-react';

// Моки отчетов
const MOCK_REPORTS = [
  { id: 1, candidate: 'Олег Валерьев', position: 'Go разработчик', score: 8.2, date: '2024-06-18', status: 'Успешно' },
  { id: 2, candidate: 'Мария Сидорова', position: 'Бухгалтер', score: 6.5, date: '2024-06-19', status: 'В процессе' },
];

const Reports: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="h-6 w-6 text-primary-500" /> Отчеты
      </h1>
      <p className="text-gray-600 mb-6">Здесь будут отображаться отчеты по собеседованиям и кандидатам (мок).</p>
      <div className="bg-white rounded-lg border border-gray-100 shadow-soft">
        <table className="min-w-full w-full table-fixed text-sm">
          <thead>
            <tr className="text-gray-500">
              <th className="text-left font-normal w-1/4 min-w-[120px] px-4 py-2">Кандидат</th>
              <th className="text-left font-normal w-1/4 min-w-[120px] px-4 py-2">Вакансия</th>
              <th className="text-left font-normal w-1/6 min-w-[70px] px-4 py-2">Балл</th>
              <th className="text-left font-normal w-1/6 min-w-[90px] px-4 py-2">Дата</th>
              <th className="text-left font-normal w-1/6 min-w-[90px] px-4 py-2">Статус</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_REPORTS.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="truncate px-4 py-2" title={r.candidate}>{r.candidate}</td>
                <td className="truncate px-4 py-2" title={r.position}>{r.position}</td>
                <td className="truncate px-4 py-2" title={String(r.score)}>{r.score}</td>
                <td className="truncate px-4 py-2" title={r.date}>{r.date}</td>
                <td className="truncate px-4 py-2" title={r.status}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {MOCK_REPORTS.length === 0 && (
          <div className="text-center text-gray-400 py-8">Нет отчетов</div>
        )}
      </div>
    </div>
  );
};

export default Reports; 