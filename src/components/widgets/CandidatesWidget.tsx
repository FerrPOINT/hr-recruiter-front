import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Star, Eye, Calendar, MapPin, Search, Filter, Plus } from 'lucide-react';
import BaseWidget from './BaseWidget';
import { Candidate, CandidateStatusEnum } from '../../client/models';
import { useCandidatesData } from '../../hooks/useWidgetData';

interface CandidatesWidgetProps {
  id: string;
  isSelected?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  className?: string;
}

interface CandidateStats {
  total: number;
  active: number;
  hired: number;
  rejected: number;
  inProgress: number;
  stats?: any;
}

const CandidatesWidget: React.FC<CandidatesWidgetProps> = ({
  id,
  isSelected,
  onClick,
  onClose,
  onRefresh,
  onMouseDown,
  className
}) => {
  const { data: candidates, loading, error, refresh } = useCandidatesData();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Обработчик обновления
  const handleRefresh = () => {
    console.log('[CandidatesWidget] Refresh triggered');
    refresh(); // Внутренний refresh из хука
    onRefresh?.(); // Внешний refresh из пропсов
  };

  // Вычисляем статистику кандидатов
  const candidateStats = {
    total: candidates.length,
    active: candidates.filter((c: any) => c.status === CandidateStatusEnum.new).length,
    hired: candidates.filter((c: any) => c.status === CandidateStatusEnum.hired).length,
    rejected: candidates.filter((c: any) => c.status === CandidateStatusEnum.rejected).length,
    inProgress: candidates.filter((c: any) => c.status === CandidateStatusEnum.in_progress).length
  };

  const filteredCandidates = candidates.filter((candidate: any) => {
    if (filterStatus !== 'all' && candidate.status !== filterStatus) return false;
    if (searchTerm && !candidate.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !candidate.lastName?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.firstName + ' ' + a.lastName).localeCompare(b.firstName + ' ' + b.lastName);
      case 'status':
        return (a.status || '').localeCompare(b.status || '');
      case 'createdAt':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case CandidateStatusEnum.new: return 'bg-green-100 text-green-800 border-green-200';
      case CandidateStatusEnum.hired: return 'bg-blue-100 text-blue-800 border-blue-200';
      case CandidateStatusEnum.rejected: return 'bg-red-100 text-red-800 border-red-200';
      case CandidateStatusEnum.in_progress: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case CandidateStatusEnum.new: return <TrendingUp className="w-3 h-3" />;
      case CandidateStatusEnum.hired: return <Star className="w-3 h-3" />;
      case CandidateStatusEnum.rejected: return <Eye className="w-3 h-3" />;
      case CandidateStatusEnum.in_progress: return <Calendar className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case CandidateStatusEnum.new: return 'Новый';
      case CandidateStatusEnum.hired: return 'Нанят';
      case CandidateStatusEnum.rejected: return 'Отклонен';
      case CandidateStatusEnum.in_progress: return 'В процессе';
      default: return 'Неизвестно';
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
      title="Кандидаты"
      loading={loading}
      error={error}
      showClose={true}
      className={className}
    >
      <div className="p-4">
        {/* Фильтры и поиск */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск кандидатов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Все статусы</option>
            <option value={CandidateStatusEnum.new}>Активные</option>
            <option value={CandidateStatusEnum.hired}>Нанятые</option>
            <option value={CandidateStatusEnum.rejected}>Отклоненные</option>
            <option value={CandidateStatusEnum.in_progress}>В процессе</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="createdAt">По дате</option>
            <option value="name">По имени</option>
            <option value="status">По статусу</option>
          </select>
        </div>

        {/* Список кандидатов */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sortedCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {candidate.firstName} {candidate.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {candidate.email}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(candidate.status || '')}`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(candidate.status || '')}
                      <span>{getStatusText(candidate.status || '')}</span>
                    </div>
                  </span>
                </div>
              </div>
              
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>Добавлен {new Date(candidate.createdAt || '').toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Статистика */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Статистика</h4>
          <div className="space-y-2">
            {Object.entries({
              [CandidateStatusEnum.new]: candidateStats.active || 0,
              [CandidateStatusEnum.hired]: candidateStats.hired || 0,
              [CandidateStatusEnum.rejected]: candidateStats.rejected || 0,
              [CandidateStatusEnum.in_progress]: candidateStats.inProgress || 0
            }).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <span className="text-sm">{getStatusText(status)}</span>
                </div>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

export default CandidatesWidget; 