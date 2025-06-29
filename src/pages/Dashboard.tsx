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
import { apiService } from '../services/apiService';
import { authService } from '../services/authService';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const iconMap: { [key: string]: React.ElementType } = {
  briefcase: Briefcase,
  users: Users,
  check: Check,
  'trending-up': TrendingUp,
};

const interviewStatusMap = {
  SUCCESSFUL: { text: 'Успешно', icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
  UNSUCCESSFUL: { text: 'Неуспешно', icon: <XCircle className="h-5 w-5 text-red-500" /> },
  IN_PROGRESS: { text: 'В процессе', icon: <Clock className="h-5 w-5 text-yellow-500" /> },
  NOT_STARTED: { text: 'Не начато', icon: <Clock className="h-5 w-5 text-gray-400" /> },
  FINISHED: { text: 'Завершено', icon: <CheckCircle className="h-5 w-5 text-blue-500" /> },
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '–';
  try {
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: ru });
  } catch (e) {
    return '–';
  }
};

const getInterviewStatusText = (status: string, finishedAt?: string, result?: string) => {
  // Если есть дата окончания, но нет результата - значит на оценке
  if (finishedAt && !result) {
    return 'На оценке';
  }
  
  switch (status) {
    case 'not_started': return 'Не начато';
    case 'in_progress': return 'В процессе';
    case 'finished': return 'Завершено';
    case 'successful': return 'Успешно';
    case 'unsuccessful': return 'Неуспешно';
    default: return status;
  }
};

// Цвета для статусов
const getInterviewStatusColor = (status: string, finishedAt?: string, result?: string) => {
  // Если есть дата окончания, но нет результата - значит на оценке
  if (finishedAt && !result) {
    return 'bg-yellow-100 text-yellow-800';
  }
  
  switch (status) {
    case 'not_started': return 'bg-gray-200 text-gray-700';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'finished': return 'bg-green-100 text-green-800';
    case 'successful': return 'bg-green-100 text-green-800';
    case 'unsuccessful': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<{
    name: string;
    value: string | number;
    icon: string;
    href: string;
    change: string;
    changeType: string;
  }[]>([]);
  const [recentInterviews, setRecentInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  console.log('Dashboard render:', { loading, error, statsLength: stats.length, interviewsLength: recentInterviews.length });

  useEffect(() => {
    // Проверяем аутентификацию
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        // Получаем статистику и последние интервью через apiService
        const [positionsResponse, interviewsResponse] = await Promise.all([
          apiService.getPositions({ status: 'active' }),
          apiService.getInterviews({ page: 0, size: 20 })
        ]);

        // Получаем id кандидатов и позиций для последних интервью
        const candidateIds = Array.from(new Set(interviewsResponse.items.map((i) => i.candidateId)));
        const positionIds = Array.from(new Set(interviewsResponse.items.map((i) => i.positionId)));

        // Параллельно подгружаем кандидатов и позиции
        const [candidates, positions] = await Promise.all([
          Promise.all(candidateIds.map((id) => apiService.getCandidate(id).catch(() => null))),
          Promise.all(positionIds.map((id) => apiService.getPosition(id).catch(() => null)))
        ]);

        // Формируем справочники для быстрого доступа
        const candidateMap = new Map<number, any>();
        candidates.forEach((c) => { if (c) candidateMap.set(c.id, c); });
        const positionMap = new Map<number, any>();
        positions.forEach((p) => { if (p) positionMap.set(p.id, p); });

        // Формируем статистику
        const statsData = [
          {
            name: 'Активные вакансии',
            value: positionsResponse.total || 0,
            icon: 'briefcase',
            href: '/vacancies',
            change: '',
            changeType: 'positive',
          },
          {
            name: 'Всего интервью',
            value: interviewsResponse.total || 0,
            icon: 'users',
            href: '/interviews',
            change: '',
            changeType: 'positive',
          },
          {
            name: 'Успешных интервью',
            value: interviewsResponse.items.filter((i) => i.result === 'SUCCESSFUL' as any).length || 0,
            icon: 'check',
            href: '/reports',
            change: '',
            changeType: 'positive',
          },
          {
            name: 'Средний балл',
            value: (() => {
              const interviewsWithScores = interviewsResponse.items.filter(i => i.aiScore !== null && i.aiScore !== undefined);
              if (interviewsWithScores.length === 0) return '–';
              const totalScore = interviewsWithScores.reduce((sum, i) => sum + (i.aiScore || 0), 0);
              return (totalScore / interviewsWithScores.length).toFixed(2);
            })(),
            icon: 'trending-up',
            href: '/reports',
            change: '',
            changeType: 'positive',
          },
        ];
        setStats(statsData);

        // Формируем массив последних интервью с именами кандидатов и позиций
        const interviewsWithNames = interviewsResponse.items.map((interview) => ({
          ...interview,
          candidateName:
            candidateMap.get(interview.candidateId)?.name ||
            [candidateMap.get(interview.candidateId)?.firstName, candidateMap.get(interview.candidateId)?.lastName]
              .filter(Boolean)
              .join(' '),
          positionTitle: positionMap.get(interview.positionId)?.title || '',
        }));
        setRecentInterviews(interviewsWithNames);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(true);
        setStats([]);
        setRecentInterviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <div className="space-y-6">
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
                    </dd>
                  </dl>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Interviews */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Последние 20 собеседований</h2>
          <Link to="/interviews" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Посмотреть все
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center text-gray-400 py-8">Загрузка...</div>
        ) : recentInterviews.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2">Нет данных о собеседованиях</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Кандидат
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Вакансия
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Создано
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Длительность
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Балл
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {recentInterviews.map((interview) => (
                    <tr key={interview.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                        <div className="flex items-center">
                          <div>
                            <div className="font-medium text-gray-900">
                              {interview.candidateName || `Кандидат #${interview.candidateId}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {interview.positionTitle || `Вакансия #${interview.positionId}`}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getInterviewStatusColor(interview.status, interview.finishedAt, interview.result)}`}>
                          {getInterviewStatusText(interview.status, interview.finishedAt, interview.result)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        <div>
                          <div>{formatDate(interview.createdAt)}</div>
                          {interview.startedAt && (
                            <div className="text-xs text-gray-400">
                              Начато: {formatDate(interview.startedAt)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {interview.startedAt && interview.finishedAt ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {Math.round((new Date(interview.finishedAt).getTime() - new Date(interview.startedAt).getTime()) / 1000 / 60)} мин
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatDate(interview.finishedAt)}
                            </div>
                          </div>
                        ) : interview.startedAt ? (
                          <div className="text-yellow-600 font-medium">В процессе</div>
                        ) : (
                          <div className="text-gray-400">Не начато</div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {interview.aiScore !== null && interview.aiScore !== undefined ? (
                          <div className="flex items-center">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              interview.aiScore >= 8 ? 'bg-green-100 text-green-800' :
                              interview.aiScore >= 6 ? 'bg-yellow-100 text-yellow-800' :
                              interview.aiScore >= 4 ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {Number(interview.aiScore).toFixed(1)}
                            </div>
                            <div className="ml-2 text-xs text-gray-500">
                              из 10
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400">–</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 