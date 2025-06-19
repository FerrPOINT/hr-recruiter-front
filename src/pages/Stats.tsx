import React from 'react';
import { BarChart2 } from 'lucide-react';

// Моки статистики
const MOCK_STATS = [
  { label: 'Проведено собеседований', value: 48 },
  { label: 'Активные вакансии', value: 7 },
  { label: 'Средний балл', value: 7.8 },
  { label: 'Кандидатов в процессе', value: 3 },
];

const Stats: React.FC = () => {
  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart2 className="h-6 w-6 text-primary-500" /> Статистика
      </h1>
      <p className="text-gray-600 mb-6">Общая статистика по платформе (мок).</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {MOCK_STATS.map((stat, idx) => (
          <div key={idx} className="bg-white border border-gray-100 rounded-lg shadow-soft p-6 flex flex-col items-start">
            <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
            <div className="text-2xl font-bold text-primary-700">{stat.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-100 rounded-lg shadow-soft p-6 text-gray-500 text-sm">
        <div>Здесь в будущем появится график активности, динамика по вакансиям и собеседованиям, а также расширенная аналитика.</div>
      </div>
    </div>
  );
};

export default Stats; 