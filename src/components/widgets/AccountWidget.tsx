import React, { useState, useEffect } from 'react';
import BaseWidget from './BaseWidget';
import { useNavigate } from 'react-router-dom';
import { AccountApi } from '../../client/apis/account-api';
import { AuthApi } from '../../client/apis/auth-api';
import { Configuration } from '../../client/configuration';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';

// Создаем конфигурацию для API клиента с JWT токеном
const createApiConfig = (): Configuration => {
  return new Configuration({
    basePath: process.env.REACT_APP_API_BASE_URL || '/api/v1',
    accessToken: () => useAuthStore.getState().token || '',
  });
};

// Компонент для отображения статистики активности
function ActivityStat({ title, value, icon, color, subtitle }: {
  title: string;
  value: number;
  icon: string;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-3 flex items-center space-x-3`}>
      <div className={`text-${color}-600 text-lg`}>{icon}</div>
      <div className="flex-1">
        <div className="text-lg font-bold text-gray-800">{value}</div>
        <div className="text-xs text-gray-600">{title}</div>
        {subtitle && (
          <div className="text-[10px] text-gray-500">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

// Компонент для отображения недавней активности
function RecentActivity({ activity }: { activity: any }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return '🔐';
      case 'interview': return '🎤';
      case 'position': return '📋';
      case 'candidate': return '👤';
      case 'report': return '📊';
      default: return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login': return 'text-blue-600';
      case 'interview': return 'text-green-600';
      case 'position': return 'text-purple-600';
      case 'candidate': return 'text-orange-600';
      case 'report': return 'text-indigo-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded transition-colors">
      <div className={`text-sm ${getActivityColor(activity.type)}`}>
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-800 truncate">{activity.title}</p>
        <p className="text-[10px] text-gray-500">{activity.time}</p>
      </div>
    </div>
  );
}

// Компонент для отображения настроек
function SettingItem({ title, value, type = 'text', onChange }: {
  title: string;
  value: string | boolean;
  type?: 'text' | 'boolean' | 'select' | 'theme';
  onChange?: (value: any) => void;
}) {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <span className="text-xs text-gray-600">{title}</span>
      {type === 'boolean' ? (
        <button
          onClick={() => onChange?.(!value)}
          className={`w-8 h-4 rounded-full transition-colors ${
            value ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
            value ? 'transform translate-x-4' : 'transform translate-x-0.5'
          }`} />
        </button>
      ) : type === 'select' ? (
        <select
          value={value as string}
          onChange={(e) => onChange?.(e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
        >
          <option value="ru">Русский</option>
          <option value="en">English</option>
        </select>
      ) : type === 'theme' ? (
        <select
          value={value as string}
          onChange={(e) => onChange?.(e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
        >
          <option value="light">Светлая</option>
          <option value="dark">Темная</option>
          <option value="auto">Авто</option>
        </select>
      ) : (
        <span className="text-xs font-medium text-gray-800">{value as string}</span>
      )}
    </div>
  );
}

interface AccountWidgetProps {
  id: string;
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  isSelected?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const AccountWidget: React.FC<AccountWidgetProps> = ({
  id,
  user,
  isSelected = false,
  onClick,
  onClose,
  onRefresh,
  onMouseDown
}) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'profile' | 'activity' | 'settings'>('profile');
  const { theme, isDark, toggleTheme, setThemeMode } = useTheme();
  const [userSettings, setUserSettings] = useState({
    notifications: true,
    emailAlerts: false,
    language: 'ru',
    theme: theme
  });

  // Загружаем данные пользователя
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        const config = createApiConfig();
        const accountApi = new AccountApi(config);
        
        // Получаем данные аккаунта
        const accountResponse = await accountApi.getAccount();
        setCurrentUser(accountResponse.data);
      } catch (error) {
        console.error('Error loading user data:', error);
        // Используем данные по умолчанию
        setCurrentUser({
          firstName: 'Пользователь',
          lastName: 'Системы',
          email: 'user@example.com',
          role: 'admin',
          avatarUrl: undefined,
          phone: '+7 (999) 123-45-67',
          language: 'ru',
          lastLogin: new Date().toISOString(),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const config = createApiConfig();
      const authApi = new AuthApi(config);
      await authApi.logout();
      
      // Очищаем токен из store
      useAuthStore.getState().logout();
      
      // Перенаправляем на страницу входа
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Даже если запрос не прошел, очищаем локальное состояние
      useAuthStore.getState().logout();
      navigate('/login');
    }
  };

  const handleProfileClick = () => {
    navigate('/admin/account');
  };

  const displayUser = currentUser || user || {
    firstName: 'Пользователь',
    lastName: 'Системы',
    email: 'user@example.com',
    role: 'admin',
    avatarUrl: undefined
  };

  const fullName = `${displayUser.firstName || ''} ${displayUser.lastName || ''}`.trim() || 'Пользователь';
  const roleLabel = displayUser.role === 'admin' ? 'Администратор' : 
                   displayUser.role === 'recruiter' ? 'Рекрутер' : 
                   displayUser.role === 'viewer' ? 'Наблюдатель' : 
                   displayUser.role;

  // Тестовые данные активности
  const activityStats = {
    interviews: 12,
    positions: 8,
    candidates: 25,
    reports: 5
  };

  const recentActivities = [
    { type: 'login', title: 'Вход в систему', time: '2 мин назад' },
    { type: 'interview', title: 'Завершено интервью с Иваном Петровым', time: '1 час назад' },
    { type: 'position', title: 'Создана вакансия "Frontend Developer"', time: '3 часа назад' },
    { type: 'candidate', title: 'Добавлен кандидат Мария Сидорова', time: '1 день назад' },
    { type: 'report', title: 'Сгенерирован отчет за неделю', time: '2 дня назад' }
  ];

  const tabs = [
    { key: 'profile', title: 'Профиль', icon: '👤' },
    { key: 'activity', title: 'Активность', icon: '📊' },
    { key: 'settings', title: 'Настройки', icon: '⚙️' }
  ];

  return (
    <BaseWidget
      id={id}
      isSelected={isSelected}
      onClick={onClick}
      onClose={onClose}
      onRefresh={onRefresh}
      onMouseDown={onMouseDown}
      title="Профиль пользователя"
      loading={loading}
      error={null}
      className="min-w-[550px] min-h-[450px]"
    >
      <div className="space-y-4">
        {/* Компактная информация о пользователе */}
        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-base">
            {displayUser.avatarUrl ? (
              <img 
                src={displayUser.avatarUrl} 
                alt={fullName} 
                className="w-10 h-10 rounded-full object-cover" 
              />
            ) : (
              fullName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-base truncate">{fullName}</h3>
            <p className="text-sm text-gray-600 truncate">{displayUser.email}</p>
            <p className="text-xs text-gray-500 capitalize">{roleLabel}</p>
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={handleProfileClick}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Редактировать профиль"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Выйти из системы"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Компактные вкладки */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as 'profile' | 'activity' | 'settings')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                selectedTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.title}</span>
            </button>
          ))}
        </div>

        {/* Содержимое вкладок */}
        {selectedTab === 'profile' && (
          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Информация профиля</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Статус:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Активен
                  </span>
                </div>
                {displayUser.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Телефон:</span>
                    <span className="font-medium text-gray-800">{displayUser.phone}</span>
                  </div>
                )}
                {displayUser.language && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Язык:</span>
                    <span className="font-medium text-gray-800">{displayUser.language}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Последний вход:</span>
                  <span className="font-medium text-gray-800">
                    {displayUser.lastLogin ? new Date(displayUser.lastLogin).toLocaleDateString() : 'Неизвестно'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'activity' && (
          <div className="space-y-3">
            {/* Статистика активности */}
            <div className="grid grid-cols-4 gap-2">
              <ActivityStat
                title="Интервью"
                value={activityStats.interviews}
                icon="🎤"
                color="blue"
              />
              <ActivityStat
                title="Вакансии"
                value={activityStats.positions}
                icon="📋"
                color="green"
              />
              <ActivityStat
                title="Кандидаты"
                value={activityStats.candidates}
                icon="👤"
                color="purple"
              />
              <ActivityStat
                title="Отчеты"
                value={activityStats.reports}
                icon="📊"
                color="orange"
              />
            </div>

            {/* Последняя активность */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Последняя активность</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {recentActivities.map((activity, index) => (
                  <RecentActivity key={index} activity={activity} />
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'settings' && (
          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Настройки уведомлений</h4>
              <div className="space-y-3">
                <SettingItem
                  title="Уведомления"
                  value={userSettings.notifications}
                  type="boolean"
                  onChange={(value) => setUserSettings(prev => ({ ...prev, notifications: value }))}
                />
                <SettingItem
                  title="Email уведомления"
                  value={userSettings.emailAlerts}
                  type="boolean"
                  onChange={(value) => setUserSettings(prev => ({ ...prev, emailAlerts: value }))}
                />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Настройки интерфейса</h4>
              <div className="space-y-3">
                <SettingItem
                  title="Язык"
                  value={userSettings.language}
                  type="select"
                  onChange={(value) => setUserSettings(prev => ({ ...prev, language: value }))}
                />
                <SettingItem
                  title="Тема"
                  value={userSettings.theme}
                  type="theme"
                  onChange={(value) => {
                    setUserSettings(prev => ({ ...prev, theme: value }));
                    setThemeMode(value);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

export default AccountWidget; 