import React, { useEffect, useState } from 'react';
import { mockApi } from '../mocks/mockApi';

const useMock = process.env.REACT_APP_USE_MOCK_API === 'true';

const Archive: React.FC = () => {
  const [archive, setArchive] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      let data;
      if (useMock) {
        data = await mockApi.getArchive?.() || [];
      } else {
        // TODO: подключить реальный API-клиент
        data = await mockApi.getArchive?.() || [];
      }
      setArchive(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Архив</h1>
      <p className="text-gray-600 mb-6">Здесь отображаются архивные вакансии и собеседования.</p>
      <div className="bg-white rounded-lg border border-gray-100 shadow-soft">
        <table className="min-w-full w-full table-fixed text-sm">
          <thead>
            <tr className="text-gray-500">
              <th className="text-left font-normal w-2/4 min-w-[180px] px-4 py-2">Название</th>
              <th className="text-left font-normal w-1/4 min-w-[90px] px-4 py-2">Тип</th>
              <th className="text-left font-normal w-1/4 min-w-[90px] px-4 py-2">Дата архивации</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center text-gray-400 py-8">Загрузка...</td></tr>
            ) : archive.length === 0 ? (
              <tr><td colSpan={3} className="text-center text-gray-400 py-8">Архив пуст</td></tr>
            ) : (
              archive.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="truncate px-4 py-2" title={item.title}>{item.title}</td>
                  <td className="truncate px-4 py-2" title={item.type}>{item.type}</td>
                  <td className="truncate px-4 py-2" title={item.archivedAt}>{item.archivedAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Archive;