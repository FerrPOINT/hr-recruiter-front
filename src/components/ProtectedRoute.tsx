import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuth, isLoading } = useAuthStore();
  const location = useLocation();

  // Показываем загрузку во время восстановления сессии
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Если не авторизован, перенаправляем на логин
  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если авторизован, показываем защищенный контент
  return <>{children}</>;
};

export default ProtectedRoute; 