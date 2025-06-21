import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { mockApi } from '../mocks/mockApi';

const useMock = process.env.REACT_APP_USE_MOCK_API === 'true';

const Reports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      let data;
      if (useMock) {
        data = await mockApi.getReports?.() || [];
      } else {
        // TODO: подключить реальный API-клиент
        data = await mockApi.getReports?.() || [];
      }
      setReports(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="h-6 w-6 text-primary-500" /> Отчеты
      </h1>
      <p className="text-gray-600 mb-6">Здесь будут отображаться отчеты по собеседованиям и кандидатам.</p>
      <table className="min-w-full w-full table-fixed text-sm">
        <thead>
          <tr className="text-gray-500">
            <th className="text-left font-normal w-1/4 min-w-[120px] px-4 py-2">Кандидат</th>
            <th className="text-left font-normal w-1/4 min-w-[120px] px-4 py-2">Вакансия</th>
            <th className="text-left font-normal w-1/6 min-w-[90px] px-4 py-2">Балл</th>
            <th className="text-left font-normal w-1/6 min-w-[90px] px-4 py-2">Дата</th>
            <th className="text-left font-normal w-1/6 min-w-[90px] px-4 py-2">Статус</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} className="text-center text-gray-400 py-8">Загрузка...</td></tr>
          ) : reports.length === 0 ? (
            <tr><td colSpan={5} className="text-center text-gray-400 py-8">Нет отчетов</td></tr>
          ) : (
            reports.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="truncate px-4 py-2" title={r.candidate}>{r.candidate}</td>
                <td className="truncate px-4 py-2" title={r.position}>{r.position}</td>
                <td className="truncate px-4 py-2" title={String(r.score ?? '-')}>{r.score ?? '-'}</td>
                <td className="truncate px-4 py-2" title={r.date}>{r.date}</td>
                <td className="truncate px-4 py-2" title={r.status}>{r.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;
