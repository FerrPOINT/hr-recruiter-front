import React, { useState, useEffect, useMemo } from 'react';
import { useNotificationsData } from '../../hooks/useWidgetData';
import BaseWidget from './BaseWidget';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X,
  Filter,
  Search,
  Settings,
  Trash2
} from 'lucide-react';

interface NotificationsWidgetProps {
  id: string;
  isSelected?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const NotificationsWidget: React.FC<NotificationsWidgetProps> = ({
  id,
  isSelected,
  onClick,
  onClose,
  onRefresh,
  onMouseDown
}) => {
  const navigate = useNavigate();
  const { data: notifications, loading, error, refresh } = useNotificationsData();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRead, setShowRead] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  // Фильтрация уведомлений
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification: any) => {
      if (filterType !== 'all' && notification.type !== filterType) return false;
      if (!showRead && notification.read) return false;
      if (searchQuery && !notification.title?.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !notification.message?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [notifications, filterType, searchQuery, showRead]);

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification);
    // Помечаем как прочитанное
    if (!notification.read) {
      // Логика пометки как прочитанное
      console.log('Mark as read:', notification.id);
    }
  };

  const handleMarkAllRead = () => {
    // Логика пометки всех как прочитанные
    console.log('Mark all as read');
  };

  const handleDeleteNotification = (notificationId: string) => {
    // Логика удаления уведомления
    console.log('Delete notification:', notificationId);
  };

  const handleClearAll = () => {
    // Логика очистки всех уведомлений
    console.log('Clear all notifications');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-500 bg-green-50';
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'info': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Только что';
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ч назад`;
    return date.toLocaleDateString('ru-RU');
  };

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return (
    <BaseWidget
      id={id}
      isSelected={isSelected}
      onClick={onClick}
      onClose={onClose}
      onRefresh={onRefresh}
      onMouseDown={onMouseDown}
      title="Уведомления"
      subtitle={`${unreadCount} непрочитанных`}
      loading={loading}
      error={error}
      className="min-w-[500px] min-h-[400px]"
    >
      <div className="flex flex-col h-full">
        {/* Статистика уведомлений */}
        <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{notifications.length}</div>
            <div className="text-xs text-gray-600">Всего</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {notifications.filter((n: any) => n.type === 'error').length}
            </div>
            <div className="text-xs text-gray-600">Ошибки</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">
              {notifications.filter((n: any) => n.type === 'warning').length}
            </div>
            <div className="text-xs text-gray-600">Предупреждения</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {notifications.filter((n: any) => n.type === 'success').length}
            </div>
            <div className="text-xs text-gray-600">Успех</div>
          </div>
        </div>

        {/* Фильтры и поиск */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск уведомлений..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Все типы</option>
            <option value="success">Успех</option>
            <option value="error">Ошибки</option>
            <option value="warning">Предупреждения</option>
            <option value="info">Информация</option>
          </select>
          <label className="flex items-center space-x-1 text-sm">
            <input
              type="checkbox"
              checked={showRead}
              onChange={(e) => setShowRead(e.target.checked)}
              className="rounded"
            />
            <span>Показать прочитанные</span>
          </label>
        </div>

        {/* Действия */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex space-x-2">
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              Отметить все как прочитанные
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Очистить все
            </button>
          </div>
          <button
            onClick={() => navigate('/settings/notifications')}
            className="p-1 hover:bg-gray-100 rounded"
            title="Настройки уведомлений"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Список уведомлений */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Нет уведомлений</p>
            </div>
          ) : (
            filteredNotifications.map((notification: any) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  getTypeColor(notification.type)
                } ${!notification.read ? 'border-l-4' : 'border-l-2'} ${
                  selectedNotification?.id === notification.id ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getTypeIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-sm">
                          {notification.title || 'Уведомление'}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message || 'Сообщение не указано'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatTime(notification.createdAt || notification.timestamp || '')}</span>
                        {notification.category && (
                          <span className="px-2 py-1 bg-gray-200 rounded">
                            {notification.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notification.id);
                      }}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Быстрые действия */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Показано {filteredNotifications.length} из {notifications.length} уведомлений</span>
            <div className="flex space-x-2">
              <button
                onClick={refresh}
                className="px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Обновить
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

export default NotificationsWidget; 