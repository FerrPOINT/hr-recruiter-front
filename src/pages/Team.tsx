import React from 'react';

// Моки участников команды
const MOCK_TEAM = [
  { id: 1, name: 'Анна Иванова', role: 'HR-менеджер', email: 'anna@company.com' },
  { id: 2, name: 'Петр Петров', role: 'Рекрутер', email: 'petr@company.com' },
];

const Team: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Моя команда</h1>
      <p className="text-gray-600 mb-6">Управление участниками команды (мок).</p>
      <div className="bg-white border border-gray-100 rounded-lg shadow-soft">
        <table className="min-w-full w-full table-fixed text-sm">
          <thead>
            <tr className="text-gray-500">
              <th className="text-left font-normal w-1/4 min-w-[120px] px-4 py-2">Имя</th>
              <th className="text-left font-normal w-1/4 min-w-[120px] px-4 py-2">Роль</th>
              <th className="text-left font-normal w-2/4 min-w-[180px] px-4 py-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TEAM.map((member) => (
              <tr key={member.id} className="border-t">
                <td className="truncate px-4 py-2" title={member.name}>{member.name}</td>
                <td className="truncate px-4 py-2" title={member.role}>{member.role}</td>
                <td className="truncate px-4 py-2" title={member.email}>{member.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {MOCK_TEAM.length === 0 && (
          <div className="text-center text-gray-400 py-8">Команда пуста</div>
        )}
      </div>
    </div>
  );
};

export default Team; 