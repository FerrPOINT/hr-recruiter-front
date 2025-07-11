import React, { useState, useEffect, createContext, useContext } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    setNotifications(prev => [...prev, newNotification]);

    // Автоматически удаляем уведомление через указанное время
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, notification.duration || 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification, clearAll } = useNotifications();

  if (notifications.length === 0) return null;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getNotificationClasses = (type: Notification['type']) => {
    const baseClasses = 'flex items-start space-x-3 p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300';
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-400 text-green-800 dark:bg-green-900/20 dark:border-green-500 dark:text-green-200`;
      case 'error':
        return `${baseClasses} bg-red-50 border-red-400 text-red-800 dark:bg-red-900/20 dark:border-red-500 dark:text-red-200`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-400 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-500 dark:text-yellow-200`;
      case 'info':
        return `${baseClasses} bg-blue-50 border-blue-400 text-blue-800 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-200`;
      default:
        return `${baseClasses} bg-gray-50 border-gray-400 text-gray-800 dark:bg-gray-900/20 dark:border-gray-500 dark:text-gray-200`;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.length > 1 && (
        <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-600">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {notifications.length} уведомлений
          </span>
          <button
            onClick={clearAll}
            className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
          >
            Очистить все
          </button>
        </div>
      )}
      
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={getNotificationClasses(notification.type)}
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div className="flex-shrink-0 text-lg">
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">
              {notification.title}
            </h4>
            {notification.message && (
              <p className="text-xs mt-1 opacity-90">
                {notification.message}
              </p>
            )}
            <p className="text-xs mt-1 opacity-60">
              {notification.timestamp.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
          
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

// Хук для быстрого добавления уведомлений
export const useNotificationHelpers = () => {
  const { addNotification } = useNotifications();

  return {
    success: (title: string, message: string = '') => 
      addNotification({ type: 'success', title, message }),
    error: (title: string, message: string = '') => 
      addNotification({ type: 'error', title, message }),
    warning: (title: string, message: string = '') => 
      addNotification({ type: 'warning', title, message }),
    info: (title: string, message: string = '') => 
      addNotification({ type: 'info', title, message }),
  };
}; 