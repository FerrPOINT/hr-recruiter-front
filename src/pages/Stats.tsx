import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import VacancyCreateModal from '../components/VacancyCreateModal';
import { 
  Briefcase, 
  Users, 
  TrendingUp,
  Plus,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import toast from 'react-hot-toast';

const iconMap: { [key: string]: React.ElementType } = {
  briefcase: Briefcase,
  users: Users,
  check: CheckCircle,
  'trending-up': TrendingUp,
};

const interviewStatusMap: { [key: string]: { text: string; icon: React.ReactNode; color: string } } = {
  successful: { text: 'Успешно', icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600' },
  unsuccessful: { text: 'Неуспешно', icon: <XCircle className="h-4 w-4" />, color: 'text-red-600' },
  in_progress: { text: 'В процессе', icon: <Clock className="h-4 w-4" />, color: 'text-yellow-600' },
};

const StatCard: React.FC<{ stat: any }> = ({ stat }) => {
  const Icon = iconMap[stat.icon] || Briefcase;
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{stat.label}</p>
          <div className="flex items-baseline mt-2">
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="ml-2 text-sm font-medium text-green-500">{stat.delta}</p>
          </div>
        </div>
        <div className="p-2 bg-orange-100 rounded-lg">
          <Icon className="h-6 w-6 text-orange-500" />
        </div>
      </div>
    </div>
  );
};

const Stats: React.FC = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [recentInterviews, setRecentInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rawStats, interviewsResponse] = await Promise.all([
          apiService.getStats(),
          apiService.getInterviews({ page: 1, size: 10 })
        ]);
        
        // Convert stats to the expected format
        const statsData = [
          { name: 'Активные вакансии', label: 'Активные вакансии', value: rawStats.totalCandidates || 0, delta: `+${Math.floor(Math.random() * 3)}`, icon: 'briefcase' },
          { name: 'Всего кандидатов', label: 'Всего кандидатов', value: rawStats.totalCandidates || 0, delta: `+${Math.floor(Math.random() * 10)}`, icon: 'users' },
          { name: 'Успешных интервью', label: 'Успешных интервью', value: rawStats.successfulInterviews || 0, delta: `+${Math.floor(Math.random() * 5)}`, icon: 'check' },
          { name: 'Средний балл', label: 'Средний балл', value: rawStats.successRate ? `${rawStats.successRate}%` : '7.8', delta: '+0.1', icon: 'trending-up' },
        ];
        
        setStats(statsData);
        setRecentInterviews(interviewsResponse.items || []);
      } catch (err) {
        console.error('Error loading stats data:', err);
        toast.error('Ошибка загрузки статистики');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Дашборд</h1>
          <p className="text-gray-500 mt-1">Обзор активности и статистики</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Создать вакансию
          </button>
          <Link to="#" className="btn-secondary flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800">
            <Plus className="mr-2 h-4 w-4" />
            Новое собеседование
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm animate-pulse">
               <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
               <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))
        ) : (
          stats.map((stat) => <StatCard key={stat.name} stat={stat} />)
        )}
      </div>

      {/* Recent Interviews Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Последние собеседования</h2>
          <Link 
            to="/admin/interviews" 
            className="text-sm text-orange-500 hover:text-orange-600 font-medium"
          >
            Полный список собеседований →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Кандидат</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Вакансия</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Балл</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата прохождения</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                  </tr>
                ))
              ) : (
                recentInterviews.map((interview) => {
                  const statusInfo = interviewStatusMap[interview.status];
                  return (
                    <tr 
                      key={interview.id} 
                      className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/vacancies/${interview.positionId}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{interview.candidateName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{interview.positionTitle}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {statusInfo && (
                          <div className={`inline-flex items-center font-medium ${statusInfo.color}`}>
                            {statusInfo.icon}
                            <span className="ml-1.5">{statusInfo.text}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                        {interview.score || '–'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(interview.createdAt), 'dd.MM.yyyy', { locale: ru })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {interview.completedAt ? format(new Date(interview.completedAt), 'dd.MM.yyyy', { locale: ru }) : '–'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Модальное окно создания вакансии */}
      <VacancyCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vacancy={null}
        onSuccess={() => {
          // Перезагружаем данные
          window.location.reload();
        }}
      />
    </div>
  );
};

export default Stats;
