import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Archive,
  BarChart2,
  Brush,
  Users,
  User,
  GraduationCap,
  LogOut,
  Globe,
  Mail,
  Plus,
  Settings,
  Palette,
  CreditCard,
} from 'lucide-react';
import { mockApi } from '../mocks/mockApi';

interface UserInfo {
  email: string;
  language: string;
}

interface TariffInfo {
  interviewsLeft: number;
  until: string;
}

const sidebarMenu = [
  { name: 'Вакансии', href: '/vacancies', icon: Home },
  { name: 'Статистика', href: '/', icon: BarChart2 },
  { name: 'Аккаунт', href: '/account', icon: User },
];

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [tariffInfo, setTariffInfo] = useState<TariffInfo | null>(null);
  const location = useLocation();
  const isVacancyPage = location.pathname.startsWith('/vacancies');
  const isInterviewSession = location.pathname.startsWith('/interview');
  const isInterviewCreatePage = location.pathname === '/interviews/create';
  const isVacancyCreatePage = location.pathname === '/vacancies/create';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = await mockApi.getUserInfo();
      const tariff = await mockApi.getTariffInfo();
      setUserInfo(user);
      setTariffInfo(tariff);
    };
    fetchData();
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path;
  };

  console.log('Layout render:', { location: location.pathname, isInterviewSession, isInterviewCreatePage });

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-gray-200 justify-between fixed z-40">
        <div>
          {/* Логотип и фирменный стиль */}
          <div className="flex items-center h-16 px-6 border-b border-gray-100">
            <Link to="/" className="flex items-center gap-2 select-none" style={{color: 'var(--wmt-orange)'}}>
              <span className="font-extrabold text-xl tracking-tight">WMT Рекрутер</span>
            </Link>
          </div>
          {/* Меню */}
          <nav className="flex-1 py-4 px-2 space-y-1">
            {sidebarMenu.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-primary-700'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            {/* Команда */}
            <Link
              to="/team"
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                location.pathname === '/team'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-primary-700'
              }`}
            >
              <Users className="mr-3 h-5 w-5" />
              Команда
            </Link>

            {/* Брендинг */}
            <Link
              to="/branding"
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                location.pathname === '/branding'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-primary-700'
              }`}
            >
              <Palette className="mr-3 h-5 w-5" />
              Брендинг
            </Link>

            {/* Тарифы */}
            <Link
              to="/tariffs"
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                location.pathname === '/tariffs'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-primary-700'
              }`}
            >
              <CreditCard className="mr-3 h-5 w-5" />
              Тарифы
            </Link>

            {/* Выйти */}
            <button 
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary-700 w-full mt-2"
              onClick={async () => {
                try {
                  await mockApi.logout();
                  navigate('/login');
                } catch (error) {
                  console.error('Error logging out:', error);
                }
              }}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Выйти
            </button>
          </nav>
        </div>
        {/* Нижние блоки */}
        <div className="p-4 space-y-3 border-t border-gray-100">
          {/* Тариф/статистика */}
          {tariffInfo ? (
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 mb-2">
              <div className="mb-1">Лимит собеседований: осталось {tariffInfo.interviewsLeft} до {tariffInfo.until}</div>
              <Link to="/tariff" className="text-primary-600 hover:underline">Настройки тарифа →</Link>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-400">Загрузка тарифа...</div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          {/* Кнопка открытия сайдбара на мобилке */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {userInfo ? (
                <span className="text-sm text-gray-700 font-medium">{userInfo.email}</span>
              ) : (
                <span className="text-sm text-gray-400">Загрузка...</span>
              )}
            </div>
          </div>
        </div>
        {/* Page content */}
        <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 ">
          {isInterviewSession ? (
            <div className="flex justify-center items-center flex-grow bg-gray-50">
              <Outlet />
            </div>
          ) : (
            <div className={`mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 ${isInterviewCreatePage || isVacancyCreatePage ? 'pt-0' : ''}`}>
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout; 