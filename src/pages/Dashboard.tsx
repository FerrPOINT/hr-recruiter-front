import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  FileText, 
  TrendingUp,
  Plus,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    {
      name: 'Активные вакансии',
      value: '12',
      change: '+2',
      changeType: 'positive',
      icon: Briefcase,
      href: '/vacancies'
    },
    {
      name: 'Проведено собеседований',
      value: '48',
      change: '+12',
      changeType: 'positive',
      icon: Users,
      href: '/interviews'
    },
    {
      name: 'Средний балл',
      value: '7.8',
      change: '+0.3',
      changeType: 'positive',
      icon: TrendingUp,
      href: '/reports'
    },
    {
      name: 'Отчеты',
      value: '24',
      change: '+5',
      changeType: 'positive',
      icon: FileText,
      href: '/reports'
    }
  ];

  const recentInterviews = [
    {
      id: 1,
      candidate: 'Иван Петров',
      position: 'Frontend Developer',
      status: 'completed',
      score: 8.2,
      date: '2024-01-15'
    },
    {
      id: 2,
      candidate: 'Мария Сидорова',
      position: 'UX Designer',
      status: 'in_progress',
      score: null,
      date: '2024-01-15'
    },
    {
      id: 3,
      candidate: 'Алексей Козлов',
      position: 'Backend Developer',
      status: 'completed',
      score: 7.5,
      date: '2024-01-14'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершено';
      case 'in_progress':
        return 'В процессе';
      default:
        return 'Отменено';
    }
  };

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
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.href}
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
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Последние собеседования</h2>
          <Link
            to="/interviews"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Посмотреть все
          </Link>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4 min-w-[120px]">Кандидат</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4 min-w-[120px]">Вакансия</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 min-w-[90px]">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 min-w-[70px]">Балл</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 min-w-[90px]">Дата</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentInterviews.map((interview) => (
                <tr key={interview.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap truncate" title={interview.candidate}>
                    <div className="text-sm font-medium text-gray-900">{interview.candidate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap truncate" title={interview.position}>
                    <div className="text-sm text-gray-900">{interview.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap truncate" title={getStatusText(interview.status)}>
                    <div className="flex items-center">
                      {getStatusIcon(interview.status)}
                      <span className="ml-2 text-sm text-gray-900">{getStatusText(interview.status)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap truncate" title={interview.score ? `${interview.score}/10` : '-'}>
                    <div className="text-sm text-gray-900">{interview.score ? `${interview.score}/10` : '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate" title={new Date(interview.date).toLocaleDateString('ru-RU')}>
                    {new Date(interview.date).toLocaleDateString('ru-RU')}
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