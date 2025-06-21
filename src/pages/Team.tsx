import React, { useEffect, useState } from 'react';
import { mockApi } from '../mocks/mockApi';

const useMock = process.env.REACT_APP_USE_MOCK_API === 'true';

const Team: React.FC = () => {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      let data;
      if (useMock) {
        data = await mockApi.getTeam?.() || [];
      } else {
        // TODO: подключить реальный API-клиент
        data = await mockApi.getTeam?.() || [];
      }
      setTeam(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Команда</h1>
      <p className="text-gray-600 mb-6">Список участников вашей команды.</p>
      <div className="bg-white rounded-lg border border-gray-100 shadow-soft">
        <table className="min-w-full w-full table-fixed text-sm">
          <thead>
            <tr className="text-gray-500">
              <th className="text-left font-normal w-2/4 min-w-[180px] px-4 py-2">Имя</th>
              <th className="text-left font-normal w-1/4 min-w-[90px] px-4 py-2">Email</th>
              <th className="text-left font-normal w-1/4 min-w-[90px] px-4 py-2">Роль</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center text-gray-400 py-8">Загрузка...</td></tr>
            ) : team.length === 0 ? (
              <tr><td colSpan={3} className="text-center text-gray-400 py-8">Нет участников</td></tr>
            ) : (
              team.map((member) => (
                <tr key={member.id} className="border-t">
                  <td className="truncate px-4 py-2" title={member.name}>{member.name}</td>
                  <td className="truncate px-4 py-2" title={member.email}>{member.email}</td>
                  <td className="truncate px-4 py-2" title={member.role}>{member.role}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Team;