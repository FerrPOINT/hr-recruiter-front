import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
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
} from 'lucide-react';

// Моки для пользователя и тарифа
const MOCK_USER = {
  email: 'ferruspoint@mail.ru',
  language: 'Русский',
};
const MOCK_TARIFF = {
  interviewsLeft: 2,
  until: '23.06.25',
};

const sidebarMenu = [
  { name: 'Вакансии', href: '/vacancies', icon: Home },
  { name: 'Статистика', href: '/', icon: BarChart2 },
  { name: 'Аккаунт', href: '/account', icon: User },
];

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isVacancyPage = location.pathname.startsWith('/vacancies');
  const isInterviewSession = location.pathname.startsWith('/interview');
  const isInterviewCreatePage = location.pathname === '/interviews/create';

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
            {/* Выйти */}
            <button className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary-700 w-full mt-2">
              <LogOut className="mr-3 h-5 w-5" />
              Выйти
            </button>
          </nav>
        </div>
        {/* Нижние блоки */}
        <div className="p-4 space-y-3 border-t border-gray-100">
          {/* Тариф/статистика (мок) */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 mb-2">
            <div className="mb-1">Лимит собеседований истекает: осталось {MOCK_TARIFF.interviewsLeft} до {MOCK_TARIFF.until}</div>
            <Link to="/tariff" className="text-primary-600 hover:underline">Настройки тарифа →</Link>
          </div>
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
              <span className="text-sm text-gray-700 font-medium">{MOCK_USER.email}</span>
            </div>
          </div>
        </div>
        {/* Page content */}
        <main className="flex-1 bg-gray-50 flex flex-col">
          {isInterviewSession ? (
            <div className="flex justify-center items-center flex-grow bg-gray-50">
              <Outlet />
            </div>
          ) : (
            <div className={`mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 ${isInterviewCreatePage ? 'flex-grow flex flex-col' : ''}`}>
              <div className="text-red-500 mb-4">DEBUG: Layout content area - Path: {location.pathname}</div>
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout; 