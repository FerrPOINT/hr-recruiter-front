import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  FileText, 
  TrendingUp,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Check
} from 'lucide-react';
import { mockApi } from '../mocks/mockApi';

const useMock = process.env.REACT_APP_USE_MOCK_API === 'true';

const iconMap: { [key: string]: React.ElementType } = {
  briefcase: Briefcase,
  users: Users,
  check: Check,
  'trending-up': TrendingUp,
};

const interviewStatusMap = {
  successful: { text: 'Успешно', icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
  unsuccessful: { text: 'Неуспешно', icon: <XCircle className="h-5 w-5 text-red-500" /> },
  in_progress: { text: 'В процессе', icon: <Clock className="h-5 w-5 text-yellow-500" /> },
  not_started: { text: 'Не начато', icon: <Clock className="h-5 w-5 text-gray-400" /> },
};

// Fallback данные для случаев, когда API недоступен
const fallbackStats = [
  { name: 'Активные вакансии', value: 3, icon: 'briefcase', href: '/vacancies', change: '+1', changeType: 'positive' },
  { name: 'Всего кандидатов', value: 15, icon: 'users', href: '/interviews', change: '+3', changeType: 'positive' },
  { name: 'Успешных интервью', value: 8, icon: 'check', href: '/reports', change: '+2', changeType: 'positive' },
  { name: 'Средний балл', value: '7.8', icon: 'trending-up', href: '/reports', change: '+0.1', changeType: 'positive' },
];

const fallbackInterviews = [
  {
    id: '1',
    candidate: 'Иван Тестовый',
    position: 'Go Developer',
    status: 'in_progress',
    date: new Date().toISOString(),
    score: null,
    positionId: 'p1',
  },
  {
    id: '2',
    candidate: 'Анна Иванова',
    position: 'React Developer',
    status: 'successful',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    score: 8.5,
    positionId: 'p2',
  },
  {
    id: '3',
    candidate: 'Петр Петров',
    position: 'Data Scientist',
    status: 'unsuccessful',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    score: 6.2,
    positionId: 'p3',
  },
];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<{name: string, value: string | number, icon: string, href: string, change: string, changeType: string}[]>([]);
  const [recentInterviews, setRecentInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  console.log('Dashboard render:', { loading, error, statsLength: stats.length, interviewsLength: recentInterviews.length });

  useEffect(() => {
    setLoading(true);
    setError(false);
    
    (async () => {
      try {
        let statsData, interviewsData;
        if (useMock) {
          console.log('Using mock API');
          statsData = await mockApi.getStats?.() || fallbackStats;
          interviewsData = await mockApi.getRecentInterviews?.() || fallbackInterviews;
        } else {
          console.log('Using real API (fallback to mock)');
          // TODO: подключить реальный API-клиент
          statsData = await mockApi.getStats?.() || fallbackStats;
          interviewsData = await mockApi.getRecentInterviews?.() || fallbackInterviews;
        }
        console.log('Data loaded:', { statsData, interviewsData });
        setStats(statsData);
        setRecentInterviews(interviewsData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(true);
        setStats(fallbackStats);
        setRecentInterviews(fallbackInterviews);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-blue-500 mb-4">DEBUG: Dashboard component rendered</div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
          <p className="text-gray-600">Обзор активности и статистики</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/vacancies/create"
            className="btn-primary flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Создать вакансию
          </Link>
          <Link
            to="/interviews/create"
            className="btn-secondary flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Новое собеседование
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <div className="col-span-4 text-center text-gray-400 py-8">Загрузка...</div>
        ) : stats.map((stat) => {
          const Icon = iconMap[stat.icon] || Briefcase;
          return (
            <Link
              key={stat.name}
              to={stat.href || '#'}
              className="card hover:shadow-medium transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className="h-8 w-8 text-primary-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Interviews */}
      <div className="bg-white shadow-soft rounded-lg mt-8">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Последние собеседования</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Кандидат</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Вакансия</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Балл</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="text-center text-gray-400 py-8">Загрузка...</td></tr>
              ) : recentInterviews.map((interview) => (
                <tr 
                  key={interview.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate('/vacancies', { state: { positionId: interview.positionId } })}
                >
                  <td className="px-6 py-4 whitespace-nowrap truncate" title={interview.candidate}>
                    <div className="text-sm font-medium text-gray-900">{interview.candidate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap truncate" title={interview.position}>
                    <div className="text-sm text-gray-900">{interview.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap truncate">
                    <div className="flex items-center">
                      {interviewStatusMap[interview.status as keyof typeof interviewStatusMap]?.icon}
                      <span className="ml-2 text-sm text-gray-900">{interviewStatusMap[interview.status as keyof typeof interviewStatusMap]?.text}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap truncate" title={interview.score ? `${interview.score}` : '-'}>
                    <div className="text-sm text-gray-900 font-medium">{interview.score || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate" title={new Date(interview.date).toLocaleString('ru-RU')}>
                    {new Date(interview.date).toLocaleString('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric'})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 