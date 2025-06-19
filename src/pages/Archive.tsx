import React from 'react';

const Archive: React.FC = () => {
  // Моки архивных вакансий/собеседований
  const MOCK_ARCHIVE = [
    { id: 1, title: 'Java Developer', type: 'Вакансия', archivedAt: '2024-05-01' },
    { id: 2, title: 'Интервью с Иваном Петровым', type: 'Собеседование', archivedAt: '2024-05-10' },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Архив</h1>
      <p className="text-gray-600 mb-6">Здесь отображаются архивные вакансии и собеседования (мок).</p>
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
            {MOCK_ARCHIVE.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="truncate px-4 py-2" title={item.title}>{item.title}</td>
                <td className="truncate px-4 py-2" title={item.type}>{item.type}</td>
                <td className="truncate px-4 py-2" title={item.archivedAt}>{item.archivedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {MOCK_ARCHIVE.length === 0 && (
          <div className="text-center text-gray-400 py-8">Архив пуст</div>
        )}
      </div>
    </div>
  );
};

export default Archive; 