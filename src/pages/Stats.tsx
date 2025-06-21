import React, { useEffect, useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { mockApi } from '../mocks/mockApi';

const useMock = process.env.REACT_APP_USE_MOCK_API === 'true';

const Stats: React.FC = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      let data;
      if (useMock) {
        data = await mockApi.getStats?.() || [];
      } else {
        // TODO: подключить реальный API-клиент
        data = await mockApi.getStats?.() || [];
      }
      setStats(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart2 className="h-6 w-6 text-primary-500" /> Статистика
      </h1>
      <p className="text-gray-600 mb-6">Общая статистика по платформе.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {loading ? (
          <div className="col-span-2 text-center text-gray-400 py-8">Загрузка...</div>
        ) : stats.map((stat, idx) => (
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
