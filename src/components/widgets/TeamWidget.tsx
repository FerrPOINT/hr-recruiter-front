import React, { useState, useEffect, useMemo } from 'react';
import { useTeamData } from '../../hooks/useWidgetData';
import BaseWidget from './BaseWidget';
import { useNavigate } from 'react-router-dom';
import { createApiClient } from '../../client/apiClient';
import { TeamUsersApi } from '../../client/apis/team-users-api';
import { AnalyticsReportsApi } from '../../client/apis/analytics-reports-api';
import { User, Position } from '../../client/models';
import { RoleEnum } from '../../client/models';
import { 
  Users, 
  UserPlus, 
  Shield, 
  TrendingUp, 
  Calendar,
  Mail,
  Phone,
  MoreVertical,
  Filter,
  Search
} from 'lucide-react';

interface TeamWidgetProps {
  id: string;
  isSelected?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const TeamWidget: React.FC<TeamWidgetProps> = ({
  id,
  isSelected,
  onClick,
  onClose,
  onRefresh,
  onMouseDown
}) => {
  const navigate = useNavigate();
  const { data: users, loading, error, refresh } = useTeamData();
  
  // Обработчик обновления
  const handleRefresh = () => {
    console.log('[TeamWidget] Refresh triggered');
    refresh(); // Внутренний refresh из хука
    onRefresh?.(); // Внешний refresh из пропсов
  };
  
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'stats'>('list');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'activity'>('name');
  const [teamStats, setTeamStats] = useState<any>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Загружаем расширенную статистику команды
  useEffect(() => {
    const loadTeamStats = async () => {
      try {
        const client = createApiClient();
        const analyticsApi = client.analyticsReports;
        
        const [candidatesStats, interviewsStats] = await Promise.all([
          analyticsApi.getCandidatesStats(),
          analyticsApi.getInterviewsStats()
        ]);

        setTeamStats({
          totalMembers: users.length,
                      activeMembers: users.filter((u: any) => u.status === 'active').length,
          totalInterviews: interviewsStats.data?.total || 0,
          totalCandidates: candidatesStats.data?.total || 0,
                      roles: {
              admin: users.filter((u: any) => u.role === 'admin').length,
              viewer: users.filter((u: any) => u.role === 'viewer').length,
              recruiter: users.filter((u: any) => u.role === 'recruiter').length
            }
        });
      } catch (error) {
        console.error('Error loading team stats:', error);
      }
    };

    if (users.length > 0) {
      loadTeamStats();
    }
  }, [users]);

  // Фильтрация и сортировка пользователей
  const filteredUsers = useMemo(() => {
    let filtered = users.filter((user: User) => {
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;
      if (searchQuery && !user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !user.email?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    // Сортировка
    filtered.sort((a: User, b: User) => {
      switch (sortBy) {
        case 'name':
          return (a.firstName || '').localeCompare(b.firstName || '');
        case 'role':
          return (a.role || '').localeCompare(b.role || '');
        default:
          return 0;
      }
    });

    return filtered.slice(0, 8); // Показываем максимум 8 пользователей
  }, [users, roleFilter, searchQuery, sortBy]);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleAddMember = () => {
    navigate('/admin/team/add');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'viewer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'recruiter': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-3 h-3" />;
      case 'viewer': return <TrendingUp className="w-3 h-3" />;
      case 'recruiter': return <Users className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  return (
    <BaseWidget
      id={id}
      isSelected={isSelected}
      onClick={onClick}
      onClose={onClose}
      onRefresh={handleRefresh}
      onMouseDown={onMouseDown}
      title="Команда"
      subtitle={`${teamStats.totalMembers || 0} участников`}
      loading={loading}
      error={error}
      className="min-w-[700px] min-h-[500px]"
    >
      <div className="flex flex-col h-full">
        {/* Статистика команды */}
        <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{teamStats.totalMembers || 0}</div>
            <div className="text-xs text-gray-600">Всего участников</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{teamStats.activeMembers || 0}</div>
            <div className="text-xs text-gray-600">Активных</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{teamStats.totalInterviews || 0}</div>
            <div className="text-xs text-gray-600">Интервью</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{teamStats.totalCandidates || 0}</div>
            <div className="text-xs text-gray-600">Кандидатов</div>
          </div>
        </div>

        {/* Фильтры и поиск */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск участников..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Все роли</option>
            <option value="admin">Администраторы</option>
            <option value="viewer">Просмотрщики</option>
            <option value="recruiter">Рекрутеры</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">По имени</option>
            <option value="role">По роли</option>
            <option value="activity">По активности</option>
          </select>
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 py-1 text-sm ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              Список
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 py-1 text-sm ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              Сетка
            </button>
            <button
              onClick={() => setViewMode('stats')}
              className={`px-2 py-1 text-sm ${viewMode === 'stats' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              Статистика
            </button>
          </div>
        </div>

        {/* Содержимое */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'list' && (
            <div className="space-y-2 overflow-y-auto h-full">
              {filteredUsers.map((user: User) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedUser?.id === user.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getRoleColor(user.role || '')}`}>
                        <div className="flex items-center space-x-1">
                          {getRoleIcon(user.role || '')}
                          <span>{user.role}</span>
                        </div>
                      </span>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Присоединился {new Date(user.createdAt || '').toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Активен</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 gap-3 overflow-y-auto h-full">
              {filteredUsers.map((user: User) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md text-center ${
                    selectedUser?.id === user.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mx-auto mb-3">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <div className="font-medium text-sm mb-1">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{user.email}</div>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getRoleColor(user.role || '')}`}>
                    <div className="flex items-center justify-center space-x-1">
                      {getRoleIcon(user.role || '')}
                      <span>{user.role}</span>
                    </div>
                  </span>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'stats' && (
            <div className="space-y-4 overflow-y-auto h-full">
              {/* Распределение по ролям */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-3">Распределение по ролям</h3>
                <div className="space-y-2">
                  {Object.entries(teamStats.roles || {}).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(role)}
                        <span className="text-sm capitalize">{role}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(count as number / teamStats.totalMembers) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{Number(count)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Активность команды */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-3">Активность команды</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{teamStats.activeMembers || 0}</div>
                    <div className="text-xs text-gray-600">Активных участников</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{teamStats.totalInterviews || 0}</div>
                    <div className="text-xs text-gray-600">Проведено интервью</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Быстрые действия */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Показано {filteredUsers.length} из {users.length} участников</span>
            <div className="flex space-x-2">
              <button
                onClick={handleAddMember}
                className="flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <UserPlus className="w-3 h-3" />
                <span>Добавить</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

export default TeamWidget; 